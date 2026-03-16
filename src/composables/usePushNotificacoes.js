/**
 * usePushNotificacoes.js
 * Composable para gerenciar notificações push via Service Worker.
 *
 * Como funciona:
 *  1. Solicita permissão de notificação ao usuário
 *  2. Aguarda o SW estar pronto
 *  3. Envia mensagens postMessage para o SW agendar notificações
 *  4. O SW usa Notification Trigger API (Chrome Android) quando disponível,
 *     o que permite notificar mesmo com app fechado/tela bloqueada.
 *     Fallback: setTimeout no SW (funciona com app em background).
 */

let _swReg = null

async function _getSW() {
  if (_swReg) return _swReg
  if (!('serviceWorker' in navigator)) return null
  try {
    _swReg = await navigator.serviceWorker.ready
    return _swReg
  } catch {
    return null
  }
}

/**
 * Solicita permissão de notificação.
 * @returns {Promise<boolean>} true se permissão concedida
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
 * Usa o Service Worker para persistência em background.
 *
 * @param {string} horario  - Formato "HH:MM"
 * @param {string} texto    - Corpo da notificação
 * @param {string} [tag]    - Tag única para identificar/cancelar
 */
export async function agendarNotificacaoTarefa(horario, texto, tag = '') {
  if (!notificacoesHabilitadas()) return
  if (!horario) return

  const [h, m] = horario.split(':').map(Number)
  const alvo = new Date()
  alvo.setHours(h, m, 0, 0)

  // Se horário já passou hoje, não agenda
  if (alvo <= new Date()) return

  const reg = await _getSW()
  const worker = reg?.active

  if (worker) {
    // Delega ao service worker para persistência em background
    worker.postMessage({
      type: 'SCHEDULE_NOTIFICATION',
      title: '⏰ Plantão',
      body: texto,
      timestamp: alvo.getTime(),
      tag: tag || `tarefa-${horario.replace(':', '')}`,
    })
  } else {
    // Fallback inline (app precisa estar aberto)
    const diff = alvo.getTime() - Date.now()
    if (diff > 0) {
      setTimeout(() => {
        if (Notification.permission === 'granted') {
          new Notification('⏰ Plantão', {
            body: texto,
            icon: '/icons/icon-192.png',
            tag: tag || `tarefa-${horario}`,
          })
        }
      }, diff)
    }
  }
}

/**
 * Agenda notificações para todas as tarefas pendentes com horário.
 * Chamado ao abrir o Organizador ou ao atualizar as tarefas.
 *
 * @param {Array<{horario: string, texto: string, feito: boolean, _key: string}>} tarefas
 */
export async function agendarTodasNotificacoes(tarefas) {
  if (!notificacoesHabilitadas() || !tarefas?.length) return

  const reg = await _getSW()
  const worker = reg?.active

  for (const tarefa of tarefas) {
    if (tarefa.feito || !tarefa.horario) continue

    const [h, m] = tarefa.horario.split(':').map(Number)
    const alvo = new Date()
    alvo.setHours(h, m, 0, 0)
    if (alvo <= new Date()) continue

    const payload = {
      type: 'SCHEDULE_NOTIFICATION',
      title: '⏰ Plantão',
      body: tarefa.texto,
      timestamp: alvo.getTime(),
      tag: `tarefa-${tarefa._key}`,
    }

    if (worker) {
      worker.postMessage(payload)
    } else {
      const diff = alvo.getTime() - Date.now()
      if (diff > 0) {
        setTimeout(() => {
          if (Notification.permission === 'granted') {
            new Notification(payload.title, {
              body: payload.body,
              icon: '/icons/icon-192.png',
              tag: payload.tag,
            })
          }
        }, diff)
      }
    }
  }
}

/**
 * Cancela uma notificação agendada por tag.
 * @param {string} [tag] - Se omitido, cancela todas
 */
export async function cancelarNotificacao(tag = '') {
  const reg = await _getSW()
  reg?.active?.postMessage({ type: 'CANCEL_NOTIFICATION', tag })
}
