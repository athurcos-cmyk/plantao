/**
 * usePushNotificacoes.js
 * Notificações agendadas via localStorage + setInterval no app.
 * Funciona com o app aberto ou em segundo plano (minimizado).
 * Não funciona com o app completamente fechado — mantenha nos recentes.
 */

const STORAGE_KEY = 'plantao_notifs_v2'

function _getAgendadas() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}

function _salvar(lista) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lista))
}

// Verifica a cada 20 segundos se há notificações para disparar
// Usa registration.showNotification() via SW — funciona em background no Android
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
        if (reg) {
          await reg.showNotification('⏰ Plantão', opts)
        } else {
          new Notification('⏰ Plantão', opts)
        }
      } catch (_) {}
    } else {
      restantes.push(item)
    }
  }
  _salvar(restantes)
}, 20 * 1000)

/**
 * Solicita permissão de notificação.
 */
export async function solicitarPermissaoNotificacao() {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const perm = await Notification.requestPermission()
  return perm === 'granted'
}

/**
 * Verifica se notificações estão habilitadas.
 */
export function notificacoesHabilitadas() {
  return 'Notification' in window && Notification.permission === 'granted'
}

// Calcula o próximo timestamp para HH:MM
// Se já passou hoje, agenda para amanhã (útil para plantão noturno)
function _proximoTimestamp(horario) {
  const [h, m] = horario.split(':').map(Number)
  const alvo = new Date()
  alvo.setHours(h, m, 0, 0)
  if (alvo <= new Date()) alvo.setDate(alvo.getDate() + 1)
  return alvo.getTime()
}

/**
 * Agenda uma notificação para um horário específico (HH:MM).
 * Se o horário já passou hoje, agenda para amanhã.
 */
export async function agendarNotificacaoTarefa(horario, texto, tag = '') {
  if (!notificacoesHabilitadas() || !horario) return

  const timestamp = _proximoTimestamp(horario)
  const tagFinal = tag || `auto-${horario.replace(':', '')}`
  const lista = _getAgendadas().filter(n => n.tag !== tagFinal)
  lista.push({ body: texto, timestamp, tag: tagFinal })
  _salvar(lista)
}

/**
 * Agenda notificações para todas as tarefas pendentes com horário.
 * Se o horário já passou hoje, agenda para amanhã.
 */
export async function agendarTodasNotificacoes(tarefas) {
  if (!notificacoesHabilitadas() || !tarefas?.length) return
  for (const t of tarefas) {
    if (t.feito || !t.horario) continue
    const timestamp = _proximoTimestamp(t.horario)
    const lista = _getAgendadas().filter(n => n.tag !== `tarefa-${t._key}`)
    lista.push({ body: t.texto, timestamp, tag: `tarefa-${t._key}` })
    _salvar(lista)
  }
}

/**
 * Cancela notificação agendada por tag. Se omitido, cancela todas.
 */
export async function cancelarNotificacao(tag = '') {
  if (!tag) { _salvar([]); return }
  _salvar(_getAgendadas().filter(n => n.tag !== tag))
}
