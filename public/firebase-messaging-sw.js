/**
 * firebase-messaging-sw.js
 * Importado pelo Workbox SW via importScripts.
 *
 * Push handler direto — NÃO depende do Firebase SDK para exibir notificações.
 * Resolve o bug: Firebase SDK encaminhava push para aba congelada (minimizada)
 * ao invés de exibir no service worker, causando notificações perdidas.
 *
 * O cron envia payload data-only (sem webpush.notification) para evitar
 * que o Firebase SDK tente auto-exibir ou encaminhar.
 */

// ─── Push handler direto ──────────────────────────────────────
// Registrado ANTES do Firebase SDK. Sempre exibe a notificação
// via service worker, independente do estado da aba.
self.addEventListener('push', (event) => {
  let payload = {}
  try { payload = event.data?.json() || {} } catch (e) {}

  // Suporta data-only (novo) e notification (legado/fallback)
  const d = payload.data || payload.notification || payload
  const title = d.title || '⏰ Plantão'
  const body  = d.body  || ''
  const tag   = d.tag   || 'plantao'

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon:     '/icons/icon-192.png',
      badge:    '/icons/icon-192.png',
      tag,
      renotify: true,
    })
  )
})

// ─── Click na notificação ─────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(clients => {
      if (clients.length > 0) return clients[0].focus()
      return self.clients.openWindow('/')
    })
  )
})

// ─── Firebase Messaging SDK ──────────────────────────────────
// Mantido APENAS para compatibilidade com getToken() no cliente.
// O push handler acima cuida de toda exibição de notificações.
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey:            'AIzaSyCHW_CTip-v1oOsbYvMJ79Ql1JvbUY7NC4',
  authDomain:        'anotacao-hc.firebaseapp.com',
  projectId:         'anotacao-hc',
  messagingSenderId: '879065842847',
  appId:             '1:879065842847:web:ae2e8ac6c3fe44388a4eaa',
})

firebase.messaging()
