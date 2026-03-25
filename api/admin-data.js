/**
 * api/admin-data.js
 * Retorna lista de usuários, feedbacks e métricas para o painel admin.
 * Acesso restrito ao admin (a.thurcos@gmail.com).
 *
 * Auth: Bearer idToken do Firebase Auth (obrigatório)
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

  const [usuariosSnap, feedbackSnap, ownersSnap, totalSnap] = await Promise.all([
    db.ref('usuarios').get(),
    db.ref('feedback').get(),
    db.ref('owners').get(),
    db.ref('config/total_usuarios').get(),
  ])

  const usuariosRaw = usuariosSnap.exists() ? usuariosSnap.val() : {}
  const ownersRaw = ownersSnap.exists() ? ownersSnap.val() : {}
  const feedbackRaw = feedbackSnap.exists() ? feedbackSnap.val() : {}

  // Montar lista de usuários com uid (de owners/{syncCode})
  const usuarios = Object.entries(usuariosRaw).map(([syncCode, data]) => {
    const uids = ownersRaw[syncCode] ? Object.keys(ownersRaw[syncCode]) : []
    return {
      syncCode,
      uid: uids[0] || null,
      nome: data.nome || '—',
      email: data.email || '—',
      criadoEm: data.criadoEm || null,
      emailBoasVindasEnviado: data.email_boas_vindas_enviado || false,
      emailDia3Enviado: data.email_dia3_enviado || false,
    }
  }).sort((a, b) => (b.criadoEm || 0) - (a.criadoEm || 0))

  // Montar lista de feedbacks
  const feedbacks = []
  for (const [syncCode, entries] of Object.entries(feedbackRaw)) {
    const nomeUsuario = usuariosRaw[syncCode]?.nome || syncCode
    for (const fb of Object.values(entries)) {
      feedbacks.push({
        syncCode,
        nomeUsuario,
        texto: fb.texto || fb.mensagem || '',
        timestamp: fb.timestamp || fb.criadoEm || null,
        versao: fb.versao || null,
      })
    }
  }
  feedbacks.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))

  // Métricas calculadas a partir dos dados já lidos
  const total = totalSnap.exists() ? totalSnap.val() : 0
  const agora = Date.now()
  const SEMANA_MS = 7 * 24 * 60 * 60 * 1000
  const cadastrosPorSemana = [3, 2, 1, 0].map(i => {
    const inicio = agora - (i + 1) * SEMANA_MS
    const fim = agora - i * SEMANA_MS
    const count = usuarios.filter(u => {
      const ts = typeof u.criadoEm === 'string' ? new Date(u.criadoEm).getTime() : u.criadoEm
      return ts >= inicio && ts < fim
    }).length
    return { label: i === 0 ? 'Esta semana' : `${i}s atrás`, count }
  })

  const metricas = {
    total,
    totalFeedbacks: feedbacks.length,
    taxaEmailEnviado: `${usuarios.filter(u => u.emailBoasVindasEnviado).length}/${usuarios.length}`,
    cadastrosPorSemana,
  }

  return res.json({ usuarios, feedbacks, metricas })
}
