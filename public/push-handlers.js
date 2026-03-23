/**
 * push-handlers.js — importado pelo service worker gerado pelo Workbox
 * Gerencia notificações push e cliques.
 * v3 — Web Push direto (sem FCM)
 */

// ── Push recebido ────────────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  let payload = {}
  try {
    payload = event.data?.json?.() ?? {}
  } catch (_) {
    // fallback: tenta como texto
    try { payload = { body: event.data?.text?.() || '' } } catch (_) {}
  }

  const title = payload.title || '⏰ Plantão'
  const body  = payload.body  || ''
  const tag   = payload.tag   || 'plantao'
  const url   = payload.url   || '/'

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon:     '/icons/icon-192.png',
      badge:    '/icons/icon-192.png',
      tag,
      renotify: true,
      data:     { url },
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
