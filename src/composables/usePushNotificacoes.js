/**
 * usePushNotificacoes.js
 *
 * Notificações confiáveis com 3 camadas:
 *
 * 1. setTimeout preciso — dispara no horário exato quando app está aberto
 * 2. OneSignal Web Push — funciona com app FECHADO (sem VAPID manual, sem FCM)
 *    - OneSignal gerencia o service worker e as subscriptions
 *    - Cron envia via REST API do OneSignal usando syncCode como external_user_id
 * 3. setInterval 60s — safety net caso setTimeout seja cancelado pelo browser
 */

import { ref as dbRef, set, remove, get } from 'firebase/database'
import { db } from '../firebase.js'

// ── Config OneSignal ────────────────────────────────────────────────────────────
const ONESIGNAL_APP_ID = import.meta.env.VITE_ONESIGNAL_APP_ID || ''

let _syncCode = null
let _pushAtivo = false
let _osInitialized = false

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

// ── OneSignal: helpers ─────────────────────────────────────────────────────────

// Executa uma função no contexto do OneSignal SDK (após init)
function _runOneSignal(fn) {
  return new Promise((resolve, reject) => {
    if (!ONESIGNAL_APP_ID) {
      reject(new Error('VITE_ONESIGNAL_APP_ID não configurado'))
      return
    }
    window.OneSignalDeferred = window.OneSignalDeferred || []
    window.OneSignalDeferred.push(async (OneSignal) => {
      try { resolve(await fn(OneSignal)) }
      catch (e) { reject(e) }
    })
  })
}

// Inicializa OneSignal SDK (chamado uma vez)
function _initOneSignal() {
  if (_osInitialized || !ONESIGNAL_APP_ID) return
  _osInitialized = true

  window.OneSignalDeferred = window.OneSignalDeferred || []
  window.OneSignalDeferred.push(async (OneSignal) => {
    await OneSignal.init({
      appId: ONESIGNAL_APP_ID,
      serviceWorkerPath: '/OneSignalSDKWorker.js',
      serviceWorkerParam: { scope: '/' },
      notifyButton: { enable: false },
      allowLocalhostAsSecureOrigin: true,
    })
    console.log('[PUSH] OneSignal init OK')
  })
}

// Registra o syncCode como external_user_id no OneSignal
async function _registrarOneSignal(syncCode) {
  if (!ONESIGNAL_APP_ID) {
    console.warn('[PUSH] VITE_ONESIGNAL_APP_ID não configurado')
    return
  }
  try {
    await _runOneSignal(async (OneSignal) => {
      await OneSignal.login(syncCode)
    })
    _pushAtivo = true
    console.log('[PUSH] OneSignal login OK ✓ syncCode:', syncCode)
  } catch (e) {
    _pushAtivo = false
    console.warn('[PUSH] OneSignal login falhou:', e.message)
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

    // Remove registros legados com mesma tag
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
 * Configura push para o usuário logado. Chamar após login.
 */
export async function configurarPush(syncCode) {
  _syncCode = syncCode
  _initOneSignal()
  if (syncCode && notificacoesHabilitadas()) {
    await _registrarOneSignal(syncCode)
  }
}

/**
 * Solicita permissão de notificação e registra no OneSignal.
 */
export async function solicitarPermissaoNotificacao(syncCode) {
  if (!('Notification' in window)) return false

  if (Notification.permission === 'granted') {
    if (syncCode) await _registrarOneSignal(syncCode)
    return true
  }
  if (Notification.permission === 'denied') return false

  // Solicita via OneSignal (gerencia SW e subscription automaticamente)
  if (ONESIGNAL_APP_ID) {
    try {
      await _runOneSignal(async (OneSignal) => {
        await OneSignal.Notifications.requestPermission()
      })
      const granted = Notification.permission === 'granted'
      if (granted && syncCode) await _registrarOneSignal(syncCode)
      return granted
    } catch (_) {}
  }

  // Fallback nativo
  const perm = await Notification.requestPermission()
  if (perm === 'granted' && syncCode) await _registrarOneSignal(syncCode)
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
