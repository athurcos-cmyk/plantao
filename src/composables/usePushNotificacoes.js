/**
 * usePushNotificacoes.js
 *
 * Notificações confiáveis com 3 camadas:
 *
 * 1. setTimeout preciso — dispara no horário exato quando app está aberto
 * 2. FCM (Firebase Cloud Messaging) — funciona com app FECHADO
 *    - Registra token FCM no Firebase (com refresh automático a cada 12h)
 *    - Salva notificações agendadas no Firebase
 *    - Vercel Cron roda a cada minuto e envia push via FCM
 *    - onMessage handler mostra notificação quando app está em foreground
 * 3. setInterval 60s — safety net caso setTimeout seja cancelado pelo browser
 */

import { getToken, onMessage } from 'firebase/messaging'
import { ref as dbRef, set, remove, get } from 'firebase/database'
import { db, messagingReady } from '../firebase.js'

// ── Config ──────────────────────────────────────────────────────────────────────
const VAPID_KEY = import.meta.env.VITE_FCM_VAPID_KEY || ''
const TOKEN_REFRESH_MS = 12 * 60 * 60 * 1000 // 12 horas

let _syncCode = null
let _fcmAtivo = false
export function fcmAtivo() { return _fcmAtivo }

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

// Re-inicializar quando usuário volta à aba (timers podem ter sido cancelados)
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    _inicializarTimers()
    // Re-registrar token FCM se necessário
    if (_syncCode && !_fcmAtivo && VAPID_KEY) {
      _registrarTokenFCM(_syncCode)
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

// ── FCM: onMessage para foreground ──────────────────────────────────────────────
// Sem isso, FCM recebido com app aberto é ENGOLIDO silenciosamente pelo SDK
messagingReady.then(msg => {
  if (!msg) return
  onMessage(msg, (payload) => {
    const body = payload.notification?.body || payload.data?.body || ''
    const tag = payload.data?.tag || payload.notification?.tag || 'plantao'
    _mostrarNotificacao(body, tag)
  })
})

// ── FCM: registro de token com refresh automático ───────────────────────────────
let _registrandoPromise = null
let _tokenRefreshTimer = null

async function _registrarTokenFCM(syncCode) {
  if (!VAPID_KEY) {
    console.error('[FCM] VITE_FCM_VAPID_KEY não configurada. Push desativado.')
    return
  }
  if (_registrandoPromise) return _registrandoPromise

  _registrandoPromise = (async () => {
    try {
      const msg = await messagingReady
      if (!msg) {
        console.warn('[FCM] Messaging não suportado neste navegador/contexto')
        return
      }
      const swReg = await navigator.serviceWorker.ready
      const token = await getToken(msg, { vapidKey: VAPID_KEY, serviceWorkerRegistration: swReg })

      if (token) {
        let deviceId = localStorage.getItem('plantao_device_id')
        if (!deviceId) {
          deviceId = 'dev_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
          localStorage.setItem('plantao_device_id', deviceId)
        }
        await set(dbRef(db, `fcm_tokens/${syncCode}/${deviceId}`), {
          token,
          updatedAt: Date.now(),
        })
        _fcmAtivo = true
        console.log('[FCM] Token registrado ✓')

        // Agendar refresh automático do token (FCM tokens expiram)
        if (_tokenRefreshTimer) clearTimeout(_tokenRefreshTimer)
        _tokenRefreshTimer = setTimeout(() => {
          _registrandoPromise = null
          _registrarTokenFCM(syncCode)
        }, TOKEN_REFRESH_MS)

      } else {
        console.warn('[FCM] getToken retornou null — push subscription pode ter falhado')
      }
    } catch (e) {
      _fcmAtivo = false
      console.warn('[FCM] Token não registrado:', e.message)
      // Retry em 30s se falhou
      setTimeout(() => {
        _registrandoPromise = null
        if (_syncCode) _registrarTokenFCM(syncCode)
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
    console.error('[FCM] Erro ao salvar:', e.message)
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
 * Configura FCM para o usuário logado. Chamar após login.
 */
export async function configurarFCM(syncCode) {
  _syncCode = syncCode
  if (syncCode && notificacoesHabilitadas()) {
    await _registrarTokenFCM(syncCode)
  }
}

/**
 * Solicita permissão de notificação e registra token FCM.
 */
export async function solicitarPermissaoNotificacao(syncCode) {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') {
    if (syncCode) await _registrarTokenFCM(syncCode)
    return true
  }
  if (Notification.permission === 'denied') return false
  const perm = await Notification.requestPermission()
  if (perm === 'granted' && syncCode) await _registrarTokenFCM(syncCode)
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
 * Salva em localStorage + timer preciso + Firebase (FCM via cron).
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

  // Firebase (FCM quando app fechado — cron envia push)
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
    // Cancela todos os timers
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
