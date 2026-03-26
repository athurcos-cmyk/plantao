/**
 * api/admin.js — endpoint único para todas as operações admin.
 * Acesso restrito ao admin (a.thurcos@gmail.com).
 *
 * GET  /api/admin              → dados completos (usuários, feedbacks, métricas, cron, broadcasts)
 * DELETE /api/admin            → excluir usuário { uid }
 * POST /api/admin              → enviar email individual { uid, assunto, mensagem }
 */

import admin from 'firebase-admin'

let initialized = false

function initAdmin() {
  if (initialized) return
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT
  if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT env var nao configurada')
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(raw)),
    databaseURL: 'https://anotacao-hc-default-rtdb.firebaseio.com',
  })
  initialized = true
}

const ADMIN_EMAIL = 'a.thurcos@gmail.com'

async function verificarAdmin(req, res) {
  const authHeader = req.headers.authorization || ''
  const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  if (!idToken) { res.status(401).json({ error: 'Unauthorized' }); return null }
  try {
    const decoded = await admin.auth().verifyIdToken(idToken)
    if (decoded.email !== ADMIN_EMAIL) { res.status(403).json({ error: 'Forbidden' }); return null }
    return decoded
  } catch {
    res.status(401).json({ error: 'Token inválido' }); return null
  }
}

// ── GET: dados completos ───────────────────────────────────────────────────

async function handleGet(req, res) {
  const db = admin.database()

  const [usuariosSnap, feedbackSnap, ownersSnap, fcmSnap, totalSnap, cronSnap, broadcastsSnap] = await Promise.all([
    db.ref('usuarios').get(),
    db.ref('feedback').get(),
    db.ref('owners').get(),
    db.ref('fcm_tokens').get(),
    db.ref('config/total_usuarios').get(),
    db.ref('config/cron_last_run').get(),
    db.ref('admin/broadcasts').limitToLast(20).get(),
  ])

  const usuariosRaw = usuariosSnap.exists() ? usuariosSnap.val() : {}
  const ownersRaw = ownersSnap.exists() ? ownersSnap.val() : {}
  const feedbackRaw = feedbackSnap.exists() ? feedbackSnap.val() : {}
  const fcmRaw = fcmSnap.exists() ? fcmSnap.val() : {}
  const agora = Date.now()
  const DIA_MS = 86400000

  const usuarios = Object.entries(usuariosRaw).map(([syncCode, data]) => {
    const uids = ownersRaw[syncCode] ? Object.keys(ownersRaw[syncCode]) : []
    const fcmTokens = fcmRaw[syncCode] ? Object.keys(fcmRaw[syncCode]).length : 0
    const ultimoAcesso = data.ultimo_acesso || null
    const diasSemAcesso = ultimoAcesso ? Math.floor((agora - Number(ultimoAcesso)) / DIA_MS) : null
    return {
      syncCode, uid: uids[0] || null,
      nome: data.nome || '—', email: data.email || '—',
      criadoEm: data.criadoEm || null,
      ultimoAcesso, diasSemAcesso,
      totalAnotacoes: data.total_anotacoes || 0,
      fcmTokens,
      emailBoasVindasEnviado: data.email_boas_vindas_enviado || false,
      emailDia3Enviado: data.email_dia3_enviado || false,
    }
  }).sort((a, b) => (b.criadoEm || 0) - (a.criadoEm || 0))

  const feedbacks = []
  for (const [syncCode, entries] of Object.entries(feedbackRaw)) {
    const nomeUsuario = usuariosRaw[syncCode]?.nome || syncCode
    const emailUsuario = usuariosRaw[syncCode]?.email || ''
    for (const [key, fb] of Object.entries(entries)) {
      feedbacks.push({
        id: `${syncCode}_${key}`, syncCode, nomeUsuario, emailUsuario,
        texto: fb.texto || fb.mensagem || '',
        timestamp: fb.timestamp || fb.criadoEm || null,
        versao: fb.versao || null,
      })
    }
  }
  feedbacks.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))

  const total = totalSnap.exists() ? totalSnap.val() : 0
  const SEMANA_MS = 7 * DIA_MS
  const ativos7d = usuarios.filter(u => u.ultimoAcesso && (agora - Number(u.ultimoAcesso)) < SEMANA_MS).length
  const totalAnotacoesGlobal = usuarios.reduce((sum, u) => sum + (u.totalAnotacoes || 0), 0)

  const cadastrosPorSemana = [3, 2, 1, 0].map(i => {
    const inicio = agora - (i + 1) * SEMANA_MS
    const fim = agora - i * SEMANA_MS
    const count = usuarios.filter(u => {
      const ts = typeof u.criadoEm === 'string' ? new Date(u.criadoEm).getTime() : Number(u.criadoEm)
      return ts >= inicio && ts < fim
    }).length
    return { label: i === 0 ? 'Esta semana' : `${i}s atrás`, count }
  })

  const crescimentoAcumulado = Array.from({ length: 8 }, (_, i) => {
    const corte = agora - (7 - i) * SEMANA_MS
    const count = usuarios.filter(u => {
      const ts = typeof u.criadoEm === 'string' ? new Date(u.criadoEm).getTime() : Number(u.criadoEm)
      return ts <= corte
    }).length
    return { label: i === 7 ? 'Agora' : `${7 - i}s atrás`, count }
  })

  const metricas = {
    total, ativos7d, totalAnotacoes: totalAnotacoesGlobal,
    totalFeedbacks: feedbacks.length,
    taxaEmailEnviado: `${usuarios.filter(u => u.emailBoasVindasEnviado).length}/${usuarios.length}`,
    cadastrosPorSemana, crescimentoAcumulado,
  }

  const cronStatus = cronSnap.exists() ? cronSnap.val() : null
  const broadcasts = []
  if (broadcastsSnap.exists()) {
    broadcastsSnap.forEach(child => broadcasts.unshift({ id: child.key, ...child.val() }))
  }

  return res.json({ usuarios, feedbacks, metricas, cronStatus, broadcasts })
}

// ── DELETE: excluir usuário ────────────────────────────────────────────────

async function handleDelete(req, res) {
  const { uid: targetUid } = req.body || {}
  if (!targetUid) return res.status(400).json({ error: 'uid obrigatório' })

  const db = admin.database()
  const mapSnap = await db.ref(`uid_map/${targetUid}`).get()
  if (!mapSnap.exists()) return res.json({ deleted: false, reason: 'already_deleted' })

  const syncCode = mapSnap.val()
  console.log(`[ADMIN-DELETE] targetUid=${targetUid} syncCode=${syncCode}: iniciando exclusão`)

  const paths = [
    `usuarios/${syncCode}`, `anotacoes/${syncCode}`, `anotacoes_hc/${syncCode}`,
    `pacientes/${syncCode}`, `organizador/${syncCode}`, `encaminhamento/${syncCode}`,
    `livres/${syncCode}`, `curativo/${syncCode}`, `fcm_tokens/${syncCode}`,
    `push_subscriptions/${syncCode}`, `notificacoes_agendadas/${syncCode}`,
    `configuracoes/${syncCode}`, `feedback/${syncCode}`, `owners/${syncCode}`, `uid_map/${targetUid}`,
  ]

  const erros = []
  await Promise.all(paths.map(p => db.ref(p).remove().catch(e => { erros.push(p); console.error(`[ADMIN-DELETE] erro ${p}:`, e.message) })))

  try {
    await admin.auth().deleteUser(targetUid)
  } catch (e) {
    if (e.code !== 'auth/user-not-found') erros.push(`auth/${targetUid}`)
  }

  db.ref('config/total_usuarios').transaction(c => Math.max(0, (c || 0) - 1)).catch(() => {})

  return res.json({ deleted: true, syncCode, errosCount: erros.length })
}

// ── POST: email individual ─────────────────────────────────────────────────

async function handlePost(req, res) {
  const { uid, assunto, mensagem } = req.body || {}
  if (!uid || !assunto || !mensagem) return res.status(400).json({ error: 'uid, assunto e mensagem obrigatórios' })

  const RESEND_KEY = process.env.RESEND_API_KEY
  if (!RESEND_KEY) return res.status(500).json({ error: 'RESEND_API_KEY não configurado' })

  const db = admin.database()
  const mapSnap = await db.ref(`uid_map/${uid}`).get()
  if (!mapSnap.exists()) return res.status(404).json({ error: 'Usuário não encontrado' })

  const syncCode = mapSnap.val()
  const userSnap = await db.ref(`usuarios/${syncCode}`).get()
  if (!userSnap.exists()) return res.status(404).json({ error: 'Dados não encontrados' })

  const { nome = '', email = '' } = userSnap.val()
  if (!email) return res.status(400).json({ error: 'Usuário sem email' })

  function _esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  }
  const html = `
    <div style="font-family:'DM Sans',Arial,sans-serif;max-width:520px;margin:0 auto;background:#0A1628;color:#EAEEF3;padding:32px 24px;border-radius:12px">
      <p style="font-size:1rem;line-height:1.6">Olá, ${_esc(nome || 'enfermeiro(a)')}!</p>
      <div style="font-size:0.95rem;line-height:1.7;color:#C8D3E0;white-space:pre-wrap">${_esc(mensagem)}</div>
      <hr style="border-color:#1e3050;margin:24px 0"/>
      <p style="font-size:0.8rem;color:#556677;margin:0">Arthur Olímpio — Plantão<br/>
        <a href="mailto:contato@plantao.net" style="color:#1E88E5">contato@plantao.net</a></p>
    </div>`

  const emailRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'Arthur do Plantão <contato@plantao.net>', to: [email], subject: assunto, html }),
  })

  if (!emailRes.ok) {
    const err = await emailRes.text()
    console.error('[ADMIN] Resend error:', err)
    return res.status(502).json({ error: 'Falha ao enviar email' })
  }

  return res.json({ ok: true, email })
}

// ── Handler principal ──────────────────────────────────────────────────────

export default async function handler(req, res) {
  if (!['GET', 'POST', 'DELETE'].includes(req.method)) {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try { initAdmin() } catch (e) { console.error('[ADMIN] initAdmin failed:', e.message); return res.status(500).json({ error: 'Erro interno' }) }

  const decoded = await verificarAdmin(req, res)
  if (!decoded) return

  if (req.method === 'GET') return handleGet(req, res)
  if (req.method === 'DELETE') return handleDelete(req, res)
  if (req.method === 'POST') return handlePost(req, res)
}
