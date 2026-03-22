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
import { ref as dbRef, set, remove, get } from 'firebase/database'
import { db, messagingReady } from '../firebase.js'

// ── VAPID Key (gerada no Firebase Console → Project Settings → Cloud Messaging)
const VAPID_KEY = import.meta.env.VITE_FCM_VAPID_KEY || ''

// ── syncCode do usuário logado (configurado ao fazer login)
let _syncCode = null

// true = FCM registrado com sucesso (push funciona com app fechado)
// false = só fallback localStorage (push só funciona com app aberto)
let _fcmAtivo = false
export function fcmAtivo() { return _fcmAtivo }

// ── localStorage fallback ────────────────────────────────────────────────────
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
let _registrandoPromise = null // promise do registro em andamento

async function _registrarTokenFCM(syncCode) {
  if (!VAPID_KEY) {
    console.error('[FCM] VITE_FCM_VAPID_KEY não configurada. Push desativado.')
    return
  }
  if (_registrandoPromise) {
    console.log('[FCM] Registro já em andamento, aguardando...')
    return _registrandoPromise
  }
  _registrandoPromise = (async () => {
    try {
      const msg = await messagingReady
      if (!msg) {
        console.warn('[FCM] Messaging não suportado neste navegador/contexto')
        return
      }
      const swReg = await navigator.serviceWorker.ready
      console.log('[FCM] SW pronto, chamando getToken...')
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
        console.log('[FCM] Token registrado no Firebase ✓', token.slice(0, 20) + '...')
      } else {
        console.warn('[FCM] getToken retornou null — push subscription pode ter falhado')
      }
    } catch (e) {
      _fcmAtivo = false
      console.warn('[FCM] Token não registrado:', e.message)
    } finally {
      _registrandoPromise = null
    }
  })()
  return _registrandoPromise
}

async function _salvarNoFirebase(syncCode, timestamp, body, tag) {
  if (!syncCode) {
    console.warn('[FCM] _salvarNoFirebase: syncCode é null! Não salvando no Firebase')
    return
  }
  try {
    const key = _tagKey(tag || `auto-${timestamp}`)
    console.log('[FCM] Salvando notificação:', { syncCode, key, timestamp, body, tag })
    await set(dbRef(db, `notificacoes_agendadas/${syncCode}/agendadas/${key}`), {
      timestamp,
      body,
      tag,
    })
    console.log('[FCM] ✓ Salvo com sucesso')
  } catch (e) {
    console.error('[FCM] Erro ao salvar:', e.message)
  }
}

async function _removerDoFirebase(syncCode, tag) {
  if (!syncCode) return
  try {
    // Remove formato novo (chave derivada da tag)
    await remove(dbRef(db, `notificacoes_agendadas/${syncCode}/agendadas/${_tagKey(tag)}`))

    // Compatibilidade: remove registros legados (push keys) com mesma tag
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

// ── Exports públicos ─────────────────────────────────────────────────────────

/**
 * Configura FCM para o usuário logado. Chamar após login.
 */
export async function configurarFCM(syncCode) {
  console.log('[FCM] configurarFCM chamado com syncCode:', syncCode)
  _syncCode = syncCode
  if (syncCode && notificacoesHabilitadas()) {
    console.log('[FCM] Registrando token FCM...')
    await _registrarTokenFCM(syncCode)
  } else {
    console.warn('[FCM] Não registrando: syncCode=', syncCode, 'notificacoes habilitadas=', notificacoesHabilitadas())
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
  const alvo = new Date(agora) // copia agora
  alvo.setHours(h, m, 0, 0)
  
  // Se o horário já passou (ou é "agora"), agenda para amanhã
  if (alvo.getTime() <= agora.getTime()) {
    alvo.setDate(alvo.getDate() + 1)
  }
  
  console.log('[TS] _proximoTimestamp:', { horario, agora: agora.toISOString(), alvo: alvo.toISOString(), diff: (alvo - agora) / 1000 + 's' })
  return alvo.getTime()
}

/**
 * Agenda uma notificação para HH:MM.
 * Salva em localStorage (fallback) E no Firebase (FCM via cron).
 */
export async function agendarNotificacaoTarefa(horario, texto, tag = '') {
  console.log('[NOTIF] agendarNotificacaoTarefa chamado:', { horario, texto, tag, _syncCode })
  
  if (!notificacoesHabilitadas() || !horario) {
    console.warn('[NOTIF] Notificações não habilitadas ou horário inválido')
    return
  }

  const timestamp = _proximoTimestamp(horario)
  const tagFinal  = tag || `auto-${horario.replace(':', '')}`

  console.log('[NOTIF] Timestamp calculado:', { horario, timestamp, tagFinal, dataHora: new Date(timestamp) })

  // localStorage (app aberto/Chrome)
  const lista = _getAgendadas().filter(n => n.tag !== tagFinal)
  lista.push({ body: texto, timestamp, tag: tagFinal })
  _salvar(lista)
  console.log('[NOTIF] ✓ Salvo em localStorage')

  // Firebase (FCM quando app fechado)
  await _salvarNoFirebase(_syncCode, timestamp, texto, tagFinal)
}

/**
 * Agenda notificações para todas as tarefas com horário.
 */
export async function agendarTodasNotificacoes(tarefas) {
  if (!notificacoesHabilitadas() || !tarefas?.length) return

  const ativas = tarefas.filter(t => !t.feito && t.horario)
  if (!ativas.length) return

  // Atualiza localStorage de uma vez (síncrono, sem round-trips)
  let lista = _getAgendadas()
  const tagsAtualizar = new Set(ativas.map(t => `tarefa-${t._key}`))
  lista = lista.filter(n => !tagsAtualizar.has(n.tag))
  for (const t of ativas) {
    const timestamp = _proximoTimestamp(t.horario)
    lista.push({ body: t.texto, timestamp, tag: `tarefa-${t._key}` })
  }
  _salvar(lista)

  // Salva no Firebase em paralelo (era sequencial, agora Promise.all)
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
    _salvar([])
    await _removerTodosFirebase(_syncCode)
  } else {
    _salvar(_getAgendadas().filter(n => n.tag !== tag))
    await _removerDoFirebase(_syncCode, tag)
  }
}

/**
 * Remove notificações por prefixo que não estão na lista de tags ativas.
 * Ex.: prefixo "pend-" mantém apenas pendências ainda existentes.
 */
export async function limparNotificacoesPorPrefixo(prefixo, tagsAtivas = []) {
  if (!prefixo) return
  const manter = new Set((tagsAtivas || []).filter(Boolean))

  // Limpeza local (fallback)
  const lista = _getAgendadas().filter((item) => {
    const tag = item?.tag || ''
    if (!tag.startsWith(prefixo)) return true
    return manter.has(tag)
  })
  _salvar(lista)

  // Limpeza Firebase (FCM/cron)
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
