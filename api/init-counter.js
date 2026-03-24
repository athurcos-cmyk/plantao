/**
 * api/init-counter.js
 * Inicializa config/total_usuarios com a contagem real de usuarios/ no Firebase.
 * Uso único — chame uma vez após deploy para sincronizar o contador com usuários existentes.
 *
 * Auth: Bearer idToken do Firebase Auth (obrigatório, apenas admin)
 */

import admin from 'firebase-admin'

let initialized = false

function initAdmin() {
  if (initialized) return
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT
  if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT env var nao configurada')
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(raw)),
    databaseURL: 'https://anotacao-hc-default-rtdb.firebaseio.com',
  })
  initialized = true
}

const ADMIN_EMAIL = 'a.thurcos@gmail.com'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const token = (req.headers.authorization || '').replace('Bearer ', '').trim()
  if (!token) return res.status(401).json({ error: 'Token ausente' })

  try {
    initAdmin()

    // Verificar identidade do admin
    const decoded = await admin.auth().verifyIdToken(token)
    if (decoded.email !== ADMIN_EMAIL) {
      return res.status(403).json({ error: 'Acesso negado' })
    }

    // Contar todos os syncCodes em usuarios/
    const snap = await admin.database().ref('usuarios').once('value')
    const total = snap.exists() ? Object.keys(snap.val()).length : 0

    // Setar o contador
    await admin.database().ref('config/total_usuarios').set(total)

    return res.status(200).json({ total, mensagem: `Contador inicializado: ${total} usuários` })
  } catch (e) {
    console.error('[init-counter] erro:', e.message)
    return res.status(500).json({ error: e.message || 'Erro interno' })
  }
}
