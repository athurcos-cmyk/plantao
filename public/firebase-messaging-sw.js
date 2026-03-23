/**
 * firebase-messaging-sw.js
 * Importado pelo Workbox SW via importScripts.
 * Habilita FCM Web Push em background (app fechado/minimizado).
 *
 * Para mensagens com webpush.notification: o browser exibe automaticamente.
 * onBackgroundMessage é chamado apenas para mensagens data-only (não é o nosso caso).
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

firebase.messaging()
