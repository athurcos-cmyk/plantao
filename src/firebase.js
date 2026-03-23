import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

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
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
