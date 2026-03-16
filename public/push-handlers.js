/**
 * push-handlers.js — importado pelo service worker gerado pelo Workbox
 * Gerencia notificações push e agendamento via Notification Trigger API
 */

// ── Push recebido do servidor (FCM ou Web Push) ──────────────────────────────
self.addEventListener('push', (event) => {
  const data = event.data?.json?.() ?? {}
  const title = data.title || '⏰ Plantão'
  const options = {
    body: data.body || '',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: data.tag || 'plantao',
    renotify: true,
    data: { url: data.url || '/' }
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

// ── Clique na notificação ────────────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if ('focus' in c) { c.focus(); return }
      }
      return clients.openWindow(url)
    })
  )
})

// ── Agendamento via postMessage do app ───────────────────────────────────────
// Mensagens enviadas pelo app para agendar/cancelar notificações
self.addEventListener('message', async (event) => {
  const { type } = event.data || {}

  // ── Agendar notificação (tarefa com horário) ──────────────────────────────
  if (type === 'SCHEDULE_NOTIFICATION') {
    const { title, body, timestamp, tag } = event.data
    if (!title || !timestamp) return

    const notifOptions = {
      body: body || '',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: tag || `plantao-${timestamp}`,
      renotify: false,
    }

    // Notification Trigger API — funciona mesmo com app fechado (Chrome Android 80+)
    if (typeof TimestampTrigger !== 'undefined') {
      try {
        await self.registration.showNotification(title, {
          ...notifOptions,
          showTrigger: new TimestampTrigger(timestamp),
        })
        return
      } catch (e) {
        // TimestampTrigger falhou, usa fallback
      }
    }

    // Fallback: setTimeout (funciona quando app está em background/foreground)
    // Não funciona se o SW for terminado antes do horário
    const delay = timestamp - Date.now()
    if (delay > 0) {
      setTimeout(() => {
        self.registration.showNotification(title, notifOptions)
      }, delay)
    }
  }

  // ── Cancelar notificações agendadas ───────────────────────────────────────
  if (type === 'CANCEL_NOTIFICATION') {
    const { tag } = event.data
    const list = await self.registration.getNotifications(tag ? { tag } : undefined)
    list.forEach(n => n.close())

    // Também cancela triggers agendados (se suportado)
    if (self.registration.getNotificationsByTag) {
      try {
        const scheduled = await self.registration.getNotificationsByTag(tag || '')
        scheduled.forEach(n => n.close())
      } catch (_) {}
    }
  }
})
