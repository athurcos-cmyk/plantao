import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'
import { getMessaging, isSupported } from 'firebase/messaging'

const firebaseConfig = {
  apiKey:        'AIzaSyCHW_CTip-v1oOsbYvMJ79Ql1JvbUY7NC4',
  authDomain:    'anotacao-hc.firebaseapp.com',
  databaseURL:   'https://anotacao-hc-default-rtdb.firebaseio.com',
  projectId:     'anotacao-hc',
  storageBucket: 'anotacao-hc.firebasestorage.app',
  messagingSenderId: '879065842847',
  appId:         '1:879065842847:web:ae2e8ac6c3fe44388a4eaa'
}

const app = initializeApp(firebaseConfig)
export const db = getDatabase(app)

// FCM Messaging — só disponível em HTTPS com service worker
// Exporta a promise para permitir await antes de usar o objeto messaging
export let messaging = null
export const messagingReady = isSupported()
  .then(ok => { if (ok) messaging = getMessaging(app); return messaging })
  .catch(() => null)
