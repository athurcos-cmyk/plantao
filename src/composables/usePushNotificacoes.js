/**
 * usePushNotificacoes.js
 *
 * Notificações com 3 camadas de confiabilidade:
 *
 * 1. setTimeout preciso — dispara no horário exato quando app está aberto
 * 2. FCM via cron (app fechado/minimizado) — firebase-admin → FCM → Service Worker
 * 3. setInterval 60s — safety net caso setTimeout seja cancelado pelo browser
 */

import { ref as dbRef, set, remove, get } from 'firebase/database'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'
import { app, db } from '../firebase.js'

// ── Config FCM ────────────────────────────────────────────────────────────────
const VAPID_KEY = import.meta.env.VITE_FCM_VAPID_KEY || ''
const TOKEN_REFRESH_MS = 12 * 60 * 60 * 1000 // 12h

let _syncCode = null
let _pushAtivo = false
let _messaging = null
let _lastTokenRefresh = 0

// Device ID persistente por dispositivo
function _getDeviceId() {
  let id = localStorage.getItem('plantao_device_id')
  if (!id) {
    id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)
    localStorage.setItem('plantao_device_id', id)
  }
  return id
}

export function pushAtivo() { return _pushAtivo }

// ── localStorage ────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'plantao_notifs_v2'

function _tagKey(tag = '') {
  const safe = encodeURIComponent(String(tag || '')).replace(/\./g, '%2E')
  return `tag_${safe}`
}
function _getAgendadas() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}
function _salvar(lista) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lista))
}

// ── Mostrar notificação (app aberto) ───────────────────────────────────────────
async function _mostrarNotificacao(body, tag) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  const opts = { body, icon: '/icons/icon-192.png', tag, renotify: true }
  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready
      await reg.showNotification('⏰ Plantão', opts)
    } else {
      new Notification('⏰ Plantão', opts)
    }
  } catch (_) {}
}

// ── setTimeout preciso por notificação ──────────────────────────────────────────
const _timers = new Map() // tag → timeoutId

function _agendarTimer(tag, timestamp, body) {
  if (_timers.has(tag)) clearTimeout(_timers.get(tag))

  const delay = timestamp - Date.now()
  if (delay <= 0) {
    _mostrarNotificacao(body, tag)
    _salvar(_getAgendadas().filter(n => n.tag !== tag))
    return
  }

  const id = setTimeout(() => {
    _timers.delete(tag)
    _mostrarNotificacao(body, tag)
    _salvar(_getAgendadas().filter(n => n.tag !== tag))
  }, Math.min(delay, 2147483647))

  _timers.set(tag, id)
}

function _cancelarTimer(tag) {
  if (_timers.has(tag)) {
    clearTimeout(_timers.get(tag))
    _timers.delete(tag)
  }
}

// ── Inicializa timers do localStorage ─────────────────────────────────────────
function _inicializarTimers() {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  const agora = Date.now()
  const lista = _getAgendadas()
  const restantes = []

  for (const item of lista) {
    if (item.timestamp <= agora) {
      _mostrarNotificacao(item.body, item.tag)
    } else {
      _agendarTimer(item.tag, item.timestamp, item.body)
      restantes.push(item)
    }
  }
  _salvar(restantes)
}

_inicializarTimers()

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    _inicializarTimers()
    // Re-registra token FCM a cada 12h
    if (_syncCode && (Date.now() - _lastTokenRefresh > TOKEN_REFRESH_MS)) {
      _registrarFCM(_syncCode).catch(() => {})
    }
  }
})

// Safety net: verifica a cada 60s
setInterval(() => {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  const agora = Date.now()
  const lista = _getAgendadas()
  const restantes = []

  for (const item of lista) {
    if (item.timestamp <= agora) {
      _mostrarNotificacao(item.body, item.tag)
    } else {
      if (!_timers.has(item.tag)) _agendarTimer(item.tag, item.timestamp, item.body)
      restantes.push(item)
    }
  }
  _salvar(restantes)
}, 60_000)

// ── FCM: registro de token ─────────────────────────────────────────────────────
function _getMessagingInstance() {
  if (!_messaging) {
    try { _messaging = getMessaging(app) } catch (_) { return null }
  }
  return _messaging
}

async function _registrarFCM(syncCode) {
  if (!VAPID_KEY) {
    console.warn('[PUSH] VITE_FCM_VAPID_KEY não configurado')
    return
  }
  if (!('serviceWorker' in navigator)) return

  const messaging = _getMessagingInstance()
  if (!messaging) return

  try {
    const reg = await navigator.serviceWorker.ready
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: reg,
    })

    if (!token) {
      console.warn('[PUSH] FCM: token vazio')
      _pushAtivo = false
      return
    }

    const deviceId = _getDeviceId()
    await set(dbRef(db, `fcm_tokens/${syncCode}/${deviceId}`), {
      token,
      updatedAt: Date.now(),
    })

    _lastTokenRefresh = Date.now()
    _pushAtivo = true
    console.log('[PUSH] FCM token registrado ✓')

    // Handler para mensagens quando app está em foreground (obrigatório)
    onMessage(messaging, (payload) => {
      const title = payload?.notification?.title || '⏰ Plantão'
      const body  = payload?.notification?.body  || ''
      const tag   = payload?.data?.tag || 'plantao'
      _mostrarNotificacao(body, tag)
    })

  } catch (e) {
    _pushAtivo = false
    console.warn('[PUSH] FCM error:', e.message)
    // Retry em 30s se falhar
    setTimeout(() => {
      if (_syncCode === syncCode) _registrarFCM(syncCode).catch(() => {})
    }, 30_000)
  }
}

// ── Firebase helpers ────────────────────────────────────────────────────────────
async function _salvarNoFirebase(syncCode, timestamp, body, tag) {
  if (!syncCode) return
  try {
    const key = _tagKey(tag || `auto-${timestamp}`)
    await set(dbRef(db, `notificacoes_agendadas/${syncCode}/agendadas/${key}`), {
      timestamp, body, tag,
    })
  } catch (e) {
    console.error('[PUSH] Erro ao salvar:', e.message)
  }
}

async function _removerDoFirebase(syncCode, tag) {
  if (!syncCode) return
  try {
    await remove(dbRef(db, `notificacoes_agendadas/${syncCode}/agendadas/${_tagKey(tag)}`))

    // Remove registros com mesma tag
    const snap = await get(dbRef(db, `notificacoes_agendadas/${syncCode}/agendadas`))
    if (!snap.exists()) return
    const ops = []
    snap.forEach(child => {
      if (child.val()?.tag === tag) ops.push(remove(child.ref))
    })
    if (ops.length) await Promise.all(ops)
  } catch (_) {}
}

async function _removerTodosFirebase(syncCode) {
  if (!syncCode) return
  try { await remove(dbRef(db, `notificacoes_agendadas/${syncCode}`)) } catch (_) {}
}

// ── Exports públicos ────────────────────────────────────────────────────────────

/**
 * Configura push FCM para o usuário logado. Chamar após login.
 */
export async function configurarPush(syncCode) {
  _syncCode = syncCode
  if (syncCode && notificacoesHabilitadas()) {
    await _registrarFCM(syncCode)
  }
}

/**
 * Solicita permissão de notificação e registra token FCM.
 */
export async function solicitarPermissaoNotificacao(syncCode) {
  if (!('Notification' in window)) return false

  if (Notification.permission === 'granted') {
    if (syncCode) await _registrarFCM(syncCode)
    return true
  }
  if (Notification.permission === 'denied') return false

  const perm = await Notification.requestPermission()
  if (perm === 'granted' && syncCode) await _registrarFCM(syncCode)
  return perm === 'granted'
}

/**
 * Verifica se notificações estão habilitadas.
 */
export function notificacoesHabilitadas() {
  return 'Notification' in window && Notification.permission === 'granted'
}

// Calcula próximo timestamp — se já passou hoje, agenda para amanhã
function _proximoTimestamp(horario) {
  const [h, m] = horario.split(':').map(Number)
  const agora = new Date()
  const alvo = new Date(agora)
  alvo.setHours(h, m, 0, 0)
  if (alvo.getTime() <= agora.getTime()) alvo.setDate(alvo.getDate() + 1)
  return alvo.getTime()
}

/**
 * Agenda uma notificação para HH:MM.
 */
export async function agendarNotificacaoTarefa(horario, texto, tag = '') {
  if (!notificacoesHabilitadas() || !horario) return

  const timestamp = _proximoTimestamp(horario)
  const tagFinal  = tag || `auto-${horario.replace(':', '')}`

  const lista = _getAgendadas().filter(n => n.tag !== tagFinal)
  lista.push({ body: texto, timestamp, tag: tagFinal })
  _salvar(lista)

  _agendarTimer(tagFinal, timestamp, texto)
  await _salvarNoFirebase(_syncCode, timestamp, texto, tagFinal)
}

/**
 * Agenda notificações para todas as tarefas com horário.
 */
export async function agendarTodasNotificacoes(tarefas) {
  if (!notificacoesHabilitadas() || !tarefas?.length) return

  const ativas = tarefas.filter(t => !t.feito && t.horario)
  if (!ativas.length) return

  const tagsAtualizar = new Set(ativas.map(t => `tarefa-${t._key}`))
  for (const tag of tagsAtualizar) _cancelarTimer(tag)

  let lista = _getAgendadas()
  lista = lista.filter(n => !tagsAtualizar.has(n.tag))
  for (const t of ativas) {
    const timestamp = _proximoTimestamp(t.horario)
    const tag = `tarefa-${t._key}`
    lista.push({ body: t.texto, timestamp, tag })
    _agendarTimer(tag, timestamp, t.texto)
  }
  _salvar(lista)

  await Promise.all(ativas.map(t => {
    const timestamp = _proximoTimestamp(t.horario)
    return _salvarNoFirebase(_syncCode, timestamp, t.texto, `tarefa-${t._key}`)
  }))
}

/**
 * Cancela notificação por tag. Se omitido, cancela todas.
 */
export async function cancelarNotificacao(tag = '') {
  if (!tag) {
    for (const [, id] of _timers) clearTimeout(id)
    _timers.clear()
    _salvar([])
    await _removerTodosFirebase(_syncCode)
  } else {
    _cancelarTimer(tag)
    _salvar(_getAgendadas().filter(n => n.tag !== tag))
    await _removerDoFirebase(_syncCode, tag)
  }
}

/**
 * Remove notificações por prefixo que não estão na lista de tags ativas.
 */
export async function limparNotificacoesPorPrefixo(prefixo, tagsAtivas = []) {
  if (!prefixo) return
  const manter = new Set((tagsAtivas || []).filter(Boolean))

  for (const [tag] of _timers) {
    if (tag.startsWith(prefixo) && !manter.has(tag)) _cancelarTimer(tag)
  }

  const lista = _getAgendadas().filter((item) => {
    const tag = item?.tag || ''
    if (!tag.startsWith(prefixo)) return true
    return manter.has(tag)
  })
  _salvar(lista)

  if (!_syncCode) return
  try {
    const base = dbRef(db, `notificacoes_agendadas/${_syncCode}/agendadas`)
    const snap = await get(base)
    if (!snap.exists()) return

    const ops = []
    snap.forEach((child) => {
      const tag = child.val()?.tag || ''
      if (tag.startsWith(prefixo) && !manter.has(tag)) ops.push(remove(child.ref))
    })
    if (ops.length) await Promise.all(ops)
  } catch (_) {}
}
