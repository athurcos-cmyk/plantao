/**
 * firebase-messaging-sw.js
 * Importado pelo Workbox SW via importScripts.
 * Habilita FCM Web Push em background (app fechado/minimizado).
 *
 * onBackgroundMessage: dispara quando o app está em background ou fechado.
 * Usar handler explícito é mais confiável que depender do auto-display do SDK.
 */

importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey:            'AIzaSyCHW_CTip-v1oOsbYvMJ79Ql1JvbUY7NC4',
  authDomain:        'anotacao-hc.firebaseapp.com',
  projectId:         'anotacao-hc',
  messagingSenderId: '879065842847',
  appId:             '1:879065842847:web:ae2e8ac6c3fe44388a4eaa',
})

const messaging = firebase.messaging()

// Handler explícito para background/minimizado — mais confiável que auto-display.
// Dispara quando não há aba visível: app fechado ou aba em background (hidden).
messaging.onBackgroundMessage((payload) => {
  const notification = payload?.notification || {}
  const title = notification.title || '⏰ Plantão'
  const body  = notification.body  || ''
  const tag   = payload?.data?.tag || notification.tag || 'plantao'

  return self.registration.showNotification(title, {
    body,
    icon:     '/icons/icon-192.png',
    badge:    '/icons/icon-192.png',
    tag,
    renotify: true,
  })
})
