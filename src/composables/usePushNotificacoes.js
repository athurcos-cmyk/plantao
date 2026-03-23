/**
 * usePushNotificacoes.js
 *
 * Notificações confiáveis com 3 camadas:
 *
 * 1. setTimeout preciso — dispara no horário exato quando app está aberto
 * 2. Web Push direto — funciona com app FECHADO (sem FCM, sem intermediário Google)
 *    - PushManager.subscribe() → subscription salva no Firebase
 *    - Cron envia via web-push direto pro browser
 * 3. setInterval 60s — safety net caso setTimeout seja cancelado pelo browser
 */

import { ref as dbRef, set, remove, get } from 'firebase/database'
import { db } from '../firebase.js'

// ── Config ──────────────────────────────────────────────────────────────────────
// VAPID public key gerada com: npx web-push generate-vapid-keys
const VAPID_PUBLIC_KEY = 'BF8WQFGzmFAjVJtHyuoUpCOiZcLk3rrSOoC78FCwddzw8r3YE6VG229BxRSJAX7k9fNpe-_ItR30Nag0D9WPZgk'

let _syncCode = null
let _pushAtivo = false
export function pushAtivo() { return _pushAtivo }
// Compatibilidade — views usam fcmAtivo()
export function fcmAtivo() { return _pushAtivo }

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

// ── Mostrar notificação ─────────────────────────────────────────────────────────
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

  // setTimeout max seguro é ~24.8 dias (2^31 ms)
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

// ── Inicializa timers do localStorage (na carga e ao voltar para aba) ────────
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

// Inicializar na carga do módulo
_inicializarTimers()

// Re-inicializar quando usuário volta à aba
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    _inicializarTimers()
    // Re-registrar push se necessário
    if (_syncCode && !_pushAtivo) {
      _registrarPushSubscription(_syncCode)
    }
  }
})

// Safety net: re-verifica a cada 60s (pega qualquer timer perdido)
setInterval(() => {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  const agora = Date.now()
  const lista = _getAgendadas()
  const restantes = []

  for (const item of lista) {
    if (item.timestamp <= agora) {
      _mostrarNotificacao(item.body, item.tag)
    } else {
      if (!_timers.has(item.tag)) {
        _agendarTimer(item.tag, item.timestamp, item.body)
      }
      restantes.push(item)
    }
  }
  _salvar(restantes)
}, 60_000)

// ── Web Push: registro de subscription ───────────────────────────────────────────
let _registrandoPromise = null

function _urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

async function _registrarPushSubscription(syncCode) {
  if (_registrandoPromise) return _registrandoPromise

  _registrandoPromise = (async () => {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.warn('[PUSH] PushManager não suportado neste navegador')
        return
      }

      const swReg = await navigator.serviceWorker.ready

      // Verifica se já tem subscription ativa
      let subscription = await swReg.pushManager.getSubscription()

      if (!subscription) {
        // Cria nova subscription com VAPID key
        subscription = await swReg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: _urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        })
        console.log('[PUSH] Nova subscription criada')
      }

      // Salva subscription no Firebase (multi-dispositivo)
      let deviceId = localStorage.getItem('plantao_device_id')
      if (!deviceId) {
        deviceId = 'dev_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
        localStorage.setItem('plantao_device_id', deviceId)
      }

      await set(dbRef(db, `push_subscriptions/${syncCode}/${deviceId}`), {
        subscription: JSON.stringify(subscription),
        updatedAt: Date.now(),
      })

      _pushAtivo = true
      console.log('[PUSH] Subscription registrada ✓')

    } catch (e) {
      _pushAtivo = false
      console.warn('[PUSH] Subscription não registrada:', e.message)
      // Retry em 30s se falhou
      setTimeout(() => {
        _registrandoPromise = null
        if (_syncCode) _registrarPushSubscription(syncCode)
      }, 30_000)
    } finally {
      _registrandoPromise = null
    }
  })()
  return _registrandoPromise
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

    // Compatibilidade: remove registros legados com mesma tag
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
export async function configurarFCM(syncCode) {
  _syncCode = syncCode
  if (syncCode && notificacoesHabilitadas()) {
    await _registrarPushSubscription(syncCode)
  }
}

/**
 * Solicita permissão de notificação e registra push subscription.
 */
export async function solicitarPermissaoNotificacao(syncCode) {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') {
    if (syncCode) await _registrarPushSubscription(syncCode)
    return true
  }
  if (Notification.permission === 'denied') return false
  const perm = await Notification.requestPermission()
  if (perm === 'granted' && syncCode) await _registrarPushSubscription(syncCode)
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

  if (alvo.getTime() <= agora.getTime()) {
    alvo.setDate(alvo.getDate() + 1)
  }

  return alvo.getTime()
}

/**
 * Agenda uma notificação para HH:MM.
 * Salva em localStorage + timer preciso + Firebase (cron envia push).
 */
export async function agendarNotificacaoTarefa(horario, texto, tag = '') {
  if (!notificacoesHabilitadas() || !horario) return

  const timestamp = _proximoTimestamp(horario)
  const tagFinal  = tag || `auto-${horario.replace(':', '')}`

  // localStorage (persistência entre reloads)
  const lista = _getAgendadas().filter(n => n.tag !== tagFinal)
  lista.push({ body: texto, timestamp, tag: tagFinal })
  _salvar(lista)

  // Timer preciso (app aberto — dispara no horário exato)
  _agendarTimer(tagFinal, timestamp, texto)

  // Firebase (quando app fechado — cron envia push)
  await _salvarNoFirebase(_syncCode, timestamp, texto, tagFinal)
}

/**
 * Agenda notificações para todas as tarefas com horário.
 */
export async function agendarTodasNotificacoes(tarefas) {
  if (!notificacoesHabilitadas() || !tarefas?.length) return

  const ativas = tarefas.filter(t => !t.feito && t.horario)
  if (!ativas.length) return

  // Cancela timers antigos dessas tags
  const tagsAtualizar = new Set(ativas.map(t => `tarefa-${t._key}`))
  for (const tag of tagsAtualizar) _cancelarTimer(tag)

  // Atualiza localStorage de uma vez
  let lista = _getAgendadas()
  lista = lista.filter(n => !tagsAtualizar.has(n.tag))
  for (const t of ativas) {
    const timestamp = _proximoTimestamp(t.horario)
    const tag = `tarefa-${t._key}`
    lista.push({ body: t.texto, timestamp, tag })
    _agendarTimer(tag, timestamp, t.texto)
  }
  _salvar(lista)

  // Salva no Firebase em paralelo
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

  // Cancela timers das tags sendo removidas
  for (const [tag] of _timers) {
    if (tag.startsWith(prefixo) && !manter.has(tag)) {
      _cancelarTimer(tag)
    }
  }

  // Limpeza local
  const lista = _getAgendadas().filter((item) => {
    const tag = item?.tag || ''
    if (!tag.startsWith(prefixo)) return true
    return manter.has(tag)
  })
  _salvar(lista)

  // Limpeza Firebase
  if (!_syncCode) return
  try {
    const base = dbRef(db, `notificacoes_agendadas/${_syncCode}/agendadas`)
    const snap = await get(base)
    if (!snap.exists()) return

    const ops = []
    snap.forEach((child) => {
      const tag = child.val()?.tag || ''
      if (tag.startsWith(prefixo) && !manter.has(tag)) {
        ops.push(remove(child.ref))
      }
    })

    if (ops.length) await Promise.all(ops)
  } catch (_) {}
}
