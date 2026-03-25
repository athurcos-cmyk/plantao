/**
 * api/admin-data.js
 * Retorna dados completos para o painel admin:
 * usuários (com ultimo_acesso, total_anotacoes, FCM tokens),
 * feedbacks, métricas, status do cron e histórico de broadcasts.
 *
 * Auth: Bearer idToken do Firebase Auth (admin only)
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

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const authHeader = req.headers.authorization || ''
  const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  if (!idToken) return res.status(401).json({ error: 'Unauthorized' })

  try {
    initAdmin()
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }

  try {
    const decoded = await admin.auth().verifyIdToken(idToken)
    if (decoded.email !== ADMIN_EMAIL) {
      return res.status(403).json({ error: 'Forbidden' })
    }
  } catch {
    return res.status(401).json({ error: 'Token inválido' })
  }

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

  // Montar lista de usuários enriquecida
  const agora = Date.now()
  const DIA_MS = 86400000

  const usuarios = Object.entries(usuariosRaw).map(([syncCode, data]) => {
    const uids = ownersRaw[syncCode] ? Object.keys(ownersRaw[syncCode]) : []
    const fcmTokens = fcmRaw[syncCode] ? Object.keys(fcmRaw[syncCode]).length : 0
    const ultimoAcesso = data.ultimo_acesso || null
    const diasSemAcesso = ultimoAcesso ? Math.floor((agora - Number(ultimoAcesso)) / DIA_MS) : null

    return {
      syncCode,
      uid: uids[0] || null,
      nome: data.nome || '—',
      email: data.email || '—',
      criadoEm: data.criadoEm || null,
      ultimoAcesso,
      diasSemAcesso,
      totalAnotacoes: data.total_anotacoes || 0,
      fcmTokens,
      emailBoasVindasEnviado: data.email_boas_vindas_enviado || false,
      emailDia3Enviado: data.email_dia3_enviado || false,
    }
  }).sort((a, b) => (b.criadoEm || 0) - (a.criadoEm || 0))

  // Feedbacks
  const feedbacks = []
  for (const [syncCode, entries] of Object.entries(feedbackRaw)) {
    const nomeUsuario = usuariosRaw[syncCode]?.nome || syncCode
    const emailUsuario = usuariosRaw[syncCode]?.email || ''
    for (const [key, fb] of Object.entries(entries)) {
      feedbacks.push({
        id: `${syncCode}_${key}`,
        syncCode,
        nomeUsuario,
        emailUsuario,
        texto: fb.texto || fb.mensagem || '',
        timestamp: fb.timestamp || fb.criadoEm || null,
        versao: fb.versao || null,
      })
    }
  }
  feedbacks.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))

  // Métricas
  const total = totalSnap.exists() ? totalSnap.val() : 0
  const SEMANA_MS = 7 * DIA_MS

  const ativos7d = usuarios.filter(u =>
    u.ultimoAcesso && (agora - Number(u.ultimoAcesso)) < SEMANA_MS
  ).length

  const totalAnotacoesGlobal = usuarios.reduce((sum, u) => sum + (u.totalAnotacoes || 0), 0)

  // Cadastros por semana (últimas 4 semanas)
  const cadastrosPorSemana = [3, 2, 1, 0].map(i => {
    const inicio = agora - (i + 1) * SEMANA_MS
    const fim = agora - i * SEMANA_MS
    const count = usuarios.filter(u => {
      const ts = typeof u.criadoEm === 'string' ? new Date(u.criadoEm).getTime() : Number(u.criadoEm)
      return ts >= inicio && ts < fim
    }).length
    return { label: i === 0 ? 'Esta semana' : `${i}s atrás`, count }
  })

  // Crescimento acumulado (últimas 8 semanas)
  const crescimentoAcumulado = Array.from({ length: 8 }, (_, i) => {
    const corte = agora - (7 - i) * SEMANA_MS
    const count = usuarios.filter(u => {
      const ts = typeof u.criadoEm === 'string' ? new Date(u.criadoEm).getTime() : Number(u.criadoEm)
      return ts <= corte
    }).length
    const label = i === 7 ? 'Agora' : `${7 - i}s atrás`
    return { label, count }
  })

  const metricas = {
    total,
    ativos7d,
    totalAnotacoes: totalAnotacoesGlobal,
    totalFeedbacks: feedbacks.length,
    taxaEmailEnviado: `${usuarios.filter(u => u.emailBoasVindasEnviado).length}/${usuarios.length}`,
    cadastrosPorSemana,
    crescimentoAcumulado,
  }

  // Status do cron
  const cronStatus = cronSnap.exists() ? cronSnap.val() : null

  // Histórico de broadcasts (mais recente primeiro)
  const broadcasts = []
  if (broadcastsSnap.exists()) {
    broadcastsSnap.forEach(child => {
      broadcasts.unshift({ id: child.key, ...child.val() })
    })
  }

  return res.json({ usuarios, feedbacks, metricas, cronStatus, broadcasts })
}
