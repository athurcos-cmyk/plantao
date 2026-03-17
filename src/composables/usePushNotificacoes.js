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
setInterval(() => {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  const agora = Date.now()
  const lista = _getAgendadas()
  const restantes = []
  for (const item of lista) {
    if (item.timestamp <= agora) {
      try {
        new Notification('⏰ Plantão', {
          body: item.body,
          icon: '/icons/icon-192.png',
          tag: item.tag,
        })
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

/**
 * Agenda uma notificação para um horário específico (HH:MM).
 */
export async function agendarNotificacaoTarefa(horario, texto, tag = '') {
  if (!notificacoesHabilitadas() || !horario) return

  const [h, m] = horario.split(':').map(Number)
  const alvo = new Date()
  alvo.setHours(h, m, 0, 0)
  if (alvo <= new Date()) return

  const lista = _getAgendadas().filter(n => n.tag !== (tag || `auto-${horario}`))
  lista.push({
    body: texto,
    timestamp: alvo.getTime(),
    tag: tag || `auto-${horario.replace(':', '')}`,
  })
  _salvar(lista)
}

/**
 * Agenda notificações para todas as tarefas pendentes com horário.
 */
export async function agendarTodasNotificacoes(tarefas) {
  if (!notificacoesHabilitadas() || !tarefas?.length) return
  for (const t of tarefas) {
    if (t.feito || !t.horario) continue
    const [h, m] = t.horario.split(':').map(Number)
    const alvo = new Date()
    alvo.setHours(h, m, 0, 0)
    if (alvo <= new Date()) continue

    const lista = _getAgendadas().filter(n => n.tag !== `tarefa-${t._key}`)
    lista.push({ body: t.texto, timestamp: alvo.getTime(), tag: `tarefa-${t._key}` })
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
