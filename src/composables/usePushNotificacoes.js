/**
 * usePushNotificacoes.js
 *
 * Estratégia dupla para notificações confiáveis:
 *
 * 1. FCM (Firebase Cloud Messaging) — funciona com app FECHADO
 *    - Registra token FCM no Firebase
 *    - Salva notificações agendadas no Firebase
 *    - Vercel Cron roda a cada minuto e envia push via FCM
 *
 * 2. localStorage + setInterval — fallback quando app está aberto/background no Chrome
 *    - Mantido para garantir que notificações disparem mesmo sem cron ativo
 *
 * Para ativar FCM: configure VITE_FCM_VAPID_KEY no Vercel (ver instruções no README)
 */

import { getToken } from 'firebase/messaging'
import { ref as dbRef, set, push, remove, get } from 'firebase/database'
import { db, messagingReady } from '../firebase.js'

// ── VAPID Key (gerada no Firebase Console → Project Settings → Cloud Messaging)
const VAPID_KEY = import.meta.env.VITE_FCM_VAPID_KEY || ''

// ── syncCode do usuário logado (configurado ao fazer login)
let _syncCode = null

// ── localStorage fallback ────────────────────────────────────────────────────
const STORAGE_KEY = 'plantao_notifs_v2'

function _getAgendadas() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}
function _salvar(lista) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lista))
}

// Verifica a cada 20 segundos (fallback para app aberto / Chrome browser)
setInterval(async () => {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  const agora = Date.now()
  const lista = _getAgendadas()
  const restantes = []

  let reg = null
  if ('serviceWorker' in navigator) {
    try { reg = await navigator.serviceWorker.ready } catch (_) {}
  }

  for (const item of lista) {
    if (item.timestamp <= agora) {
      const opts = { body: item.body, icon: '/icons/icon-192.png', tag: item.tag }
      try {
        if (reg) await reg.showNotification('⏰ Plantão', opts)
        else new Notification('⏰ Plantão', opts)
      } catch (_) {}
    } else {
      restantes.push(item)
    }
  }
  _salvar(restantes)
}, 20 * 1000)

// ── FCM helpers ──────────────────────────────────────────────────────────────
async function _registrarTokenFCM(syncCode) {
  if (!VAPID_KEY) return
  try {
    // Aguarda messaging inicializar (isSupported é assíncrono — pode estar null ao montar)
    const msg = await messagingReady
    if (!msg) return
    const swReg = await navigator.serviceWorker.ready
    const token = await getToken(msg, { vapidKey: VAPID_KEY, serviceWorkerRegistration: swReg })
    if (token) {
      await set(dbRef(db, `fcm_tokens/${syncCode}`), token)
      console.log('[FCM] Token registrado no Firebase ✓')
    }
  } catch (e) {
    // FCM não disponível (HTTP local, iOS, etc.) — fallback localStorage funciona
    console.warn('[FCM] Token não registrado:', e.message)
  }
}

async function _salvarNoFirebase(syncCode, timestamp, body, tag) {
  if (!syncCode) return
  try {
    await push(dbRef(db, `notificacoes_agendadas/${syncCode}/agendadas`), { timestamp, body, tag })
  } catch (_) {}
}

async function _removerDoFirebase(syncCode, tag) {
  if (!syncCode) return
  try {
    const snap = await get(dbRef(db, `notificacoes_agendadas/${syncCode}/agendadas`))
    if (!snap.exists()) return
    snap.forEach(child => {
      if (child.val().tag === tag) remove(child.ref)
    })
  } catch (_) {}
}

async function _removerTodosFirebase(syncCode) {
  if (!syncCode) return
  try { await remove(dbRef(db, `notificacoes_agendadas/${syncCode}`)) } catch (_) {}
}

// ── Exports públicos ─────────────────────────────────────────────────────────

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
  const alvo = new Date()
  alvo.setHours(h, m, 0, 0)
  if (alvo <= new Date()) alvo.setDate(alvo.getDate() + 1)
  return alvo.getTime()
}

/**
 * Agenda uma notificação para HH:MM.
 * Salva em localStorage (fallback) E no Firebase (FCM via cron).
 */
export async function agendarNotificacaoTarefa(horario, texto, tag = '') {
  if (!notificacoesHabilitadas() || !horario) return

  const timestamp = _proximoTimestamp(horario)
  const tagFinal  = tag || `auto-${horario.replace(':', '')}`

  // localStorage (app aberto/Chrome)
  const lista = _getAgendadas().filter(n => n.tag !== tagFinal)
  lista.push({ body: texto, timestamp, tag: tagFinal })
  _salvar(lista)

  // Firebase (FCM quando app fechado)
  await _salvarNoFirebase(_syncCode, timestamp, texto, tagFinal)
}

/**
 * Agenda notificações para todas as tarefas com horário.
 */
export async function agendarTodasNotificacoes(tarefas) {
  if (!notificacoesHabilitadas() || !tarefas?.length) return
  for (const t of tarefas) {
    if (t.feito || !t.horario) continue
    const timestamp = _proximoTimestamp(t.horario)
    const tag = `tarefa-${t._key}`
    const lista = _getAgendadas().filter(n => n.tag !== tag)
    lista.push({ body: t.texto, timestamp, tag })
    _salvar(lista)
    await _salvarNoFirebase(_syncCode, timestamp, t.texto, tag)
  }
}

/**
 * Cancela notificação por tag. Se omitido, cancela todas.
 */
export async function cancelarNotificacao(tag = '') {
  if (!tag) {
    _salvar([])
    await _removerTodosFirebase(_syncCode)
  } else {
    _salvar(_getAgendadas().filter(n => n.tag !== tag))
    await _removerDoFirebase(_syncCode, tag)
  }
}
