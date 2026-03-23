/**
 * push-handlers.js — importado pelo service worker gerado pelo Workbox
 * Gerencia notificações push do FCM e do agendador local.
 * v2 — FCM via Vercel Cron + firebase-admin
 */

// ── Push recebido do FCM (via Vercel Cron + Firebase Admin) ──────────────────
self.addEventListener('push', (event) => {
  const payload = event.data?.json?.() ?? {}

  // FCM envia notification sob .notification, agendador local envia flat
  const title  = payload.notification?.title  || payload.title  || '⏰ Plantão'
  const body   = payload.notification?.body   || payload.body   || ''
  const tag    = payload.data?.tag            || payload.notification?.tag || payload.tag || 'plantao'
  const url    = payload.data?.url            || payload.url    || '/'

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon:      '/icons/icon-192.png',
      badge:     '/icons/icon-192.png',
      tag,
      renotify:  true,
      data:      { url },
    })
  )
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
