/**
 * api/cleanup-notificacoes.js
 * Limpeza manual de notificacoes agendadas no Firebase.
 *
 * Remove:
 * - registros sem timestamp valido
 * - registros muito atrasados (stale)
 * - registros muito no futuro (inconsistentes)
 * - registros orfaos de pendencias/pacientes excluidos
 * - registros orfaos de tarefas do organizador
 * - duplicatas por tag (mantem o timestamp mais recente)
 */

import admin from 'firebase-admin'

let initialized = false

const MAX_ATRASO_ENVIO_MS = 12 * 60 * 60 * 1000
const MAX_FUTURO_ACEITO_MS = 48 * 60 * 60 * 1000

function initAdmin() {
  if (initialized) return
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT
  if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT env var nao configurada')
  const serviceAccount = JSON.parse(raw)
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://anotacao-hc-default-rtdb.firebaseio.com',
  })
  initialized = true
}

function asBool(v) {
  return v === true || v === 'true' || v === 1 || v === '1'
}

function parsePendKey(tag = '') {
  if (!tag.startsWith('pend-')) return ''
  const payload = tag.slice(5)
  if (payload.endsWith('-aviso')) return payload.slice(0, -6)
  return payload
}

function isNumberTimestamp(value) {
  return Number.isFinite(value) && value > 0
}

async function carregarPendenciasAtivas(db, syncCode) {
  const ativos = new Set()
  const snap = await db.ref(`pacientes/${syncCode}`).get()
  if (!snap.exists()) return ativos

  const pacientes = snap.val() || {}
  for (const paciente of Object.values(pacientes)) {
    const pendencias = paciente?.pendencias || {}
    for (const [pendKey, pend] of Object.entries(pendencias)) {
      if (!pend || pend.feito || !pend.horario) continue
      ativos.add(pendKey)
    }
  }
  return ativos
}

async function carregarTarefasAtivas(db, syncCode) {
  const ativos = new Set()
  const snap = await db.ref(`organizador/${syncCode}/plantao/tarefas`).get()
  if (!snap.exists()) return ativos

  const tarefas = snap.val() || {}
  for (const [key, tarefa] of Object.entries(tarefas)) {
    if (!tarefa || tarefa.feito || !tarefa.horario) continue
    ativos.add(key)
  }
  return ativos
}

function marcarRemocao(remocoes, stats, syncCode, key, reason) {
  remocoes.push({ syncCode, key, reason })
  stats.removidasPorMotivo[reason] = (stats.removidasPorMotivo[reason] || 0) + 1
}

export default async function handler(req, res) {
  const secret = process.env.CRON_SECRET
  if (secret && req.headers.authorization !== `Bearer ${secret}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    initAdmin()
  } catch (e) {
    console.error('[CLEANUP] initAdmin falhou:', e.message)
    return res.status(500).json({ error: e.message })
  }

  const db = admin.database()
  const agora = Date.now()

  const q = req.query || {}
  const b = req.body || {}
  const syncCodeFiltro = q.syncCode || b.syncCode || ''
  const dryRun = asBool(q.dry) || asBool(b.dry)

  const snap = await db.ref('notificacoes_agendadas').get()
  if (!snap.exists()) {
    return res.json({
      ok: true,
      dryRun,
      syncCodeFiltro: syncCodeFiltro || null,
      analisadas: 0,
      removidas: 0,
      removidasPorMotivo: {},
      detalhes: [],
      agora,
    })
  }

  const root = snap.val() || {}
  const syncCodes = Object.keys(root).filter(code => !syncCodeFiltro || code === syncCodeFiltro)

  const stats = {
    analisadas: 0,
    removidasPorMotivo: {},
  }
  const remocoes = []

  for (const syncCode of syncCodes) {
    const agendadas = root[syncCode]?.agendadas || {}
    const entries = Object.entries(agendadas)
    if (!entries.length) continue

    const [pendenciasAtivas, tarefasAtivas] = await Promise.all([
      carregarPendenciasAtivas(db, syncCode),
      carregarTarefasAtivas(db, syncCode),
    ])

    const candidatosDedup = new Map()

    for (const [key, notif] of entries) {
      stats.analisadas += 1
      const timestamp = Number(notif?.timestamp)
      const tag = String(notif?.tag || '')

      if (!isNumberTimestamp(timestamp)) {
        marcarRemocao(remocoes, stats, syncCode, key, 'timestamp_invalido')
        continue
      }

      if (timestamp < (agora - MAX_ATRASO_ENVIO_MS)) {
        marcarRemocao(remocoes, stats, syncCode, key, 'muito_antiga')
        continue
      }

      if (timestamp > (agora + MAX_FUTURO_ACEITO_MS)) {
        marcarRemocao(remocoes, stats, syncCode, key, 'muito_futura')
        continue
      }

      if (tag.startsWith('pend-')) {
        const pendKey = parsePendKey(tag)
        if (!pendKey || !pendenciasAtivas.has(pendKey)) {
          marcarRemocao(remocoes, stats, syncCode, key, 'orfaa_pendencia')
          continue
        }
      }

      if (tag.startsWith('tarefa-')) {
        const tarefaKey = tag.slice(7)
        if (!tarefaKey || !tarefasAtivas.has(tarefaKey)) {
          marcarRemocao(remocoes, stats, syncCode, key, 'orfaa_tarefa')
          continue
        }
      }

      if (!tag) continue
      if (!candidatosDedup.has(tag)) candidatosDedup.set(tag, [])
      candidatosDedup.get(tag).push({ key, timestamp })
    }

    for (const [, lista] of candidatosDedup.entries()) {
      if (lista.length <= 1) continue

      lista.sort((a, b) => {
        if (b.timestamp !== a.timestamp) return b.timestamp - a.timestamp
        return String(b.key).localeCompare(String(a.key))
      })

      const [, ...duplicatas] = lista
      for (const item of duplicatas) {
        marcarRemocao(remocoes, stats, syncCode, item.key, 'duplicada_tag')
      }
    }
  }

  const unique = new Map()
  for (const item of remocoes) {
    const id = `${item.syncCode}/${item.key}`
    if (!unique.has(id)) unique.set(id, item)
  }
  const remocoesUnicas = Array.from(unique.values())

  if (!dryRun) {
    await Promise.all(
      remocoesUnicas.map(item =>
        db.ref(`notificacoes_agendadas/${item.syncCode}/agendadas/${item.key}`).remove()
      )
    )
  }

  return res.json({
    ok: true,
    dryRun,
    syncCodeFiltro: syncCodeFiltro || null,
    analisadas: stats.analisadas,
    removidas: remocoesUnicas.length,
    removidasPorMotivo: stats.removidasPorMotivo,
    detalhes: remocoesUnicas.slice(0, 200),
    agora,
  })
}
