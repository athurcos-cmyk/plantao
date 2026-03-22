/**
 * api/resolve-code.js
 * Recebe syncCode → retorna o email vinculado.
 * Não expõe outros dados do usuário.
 */

import admin from 'firebase-admin'

let _adminInit = false
function _initAdmin() {
  if (_adminInit) return
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT
  if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT não configurada')
  admin.initializeApp({ credential: admin.credential.cert(JSON.parse(raw)), databaseURL: 'https://anotacao-hc-default-rtdb.firebaseio.com' })
  _adminInit = true
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { syncCode } = req.body || {}
  if (!syncCode || typeof syncCode !== 'string' || syncCode.length < 4 || syncCode.length > 10) {
    return res.status(400).json({ error: 'Código inválido.' })
  }

  try {
    _initAdmin()
    const snap = await admin.database().ref(`usuarios/${syncCode.toUpperCase()}/email`).get()
    if (!snap.exists()) {
      // Resposta genérica para não revelar se o código existe ou não
      return res.status(404).json({ error: 'Código não encontrado.' })
    }
    return res.json({ email: snap.val() })
  } catch (e) {
    console.error('[RESOLVE-CODE] error:', e.message)
    return res.status(500).json({ error: 'Erro interno.' })
  }
}
