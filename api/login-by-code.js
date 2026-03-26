/**
 * api/login-by-code.js
 * Login seguro via syncCode + senha.
 * Resolve o email server-side (nunca expõe ao client) e retorna custom token.
 *
 * Rate limit: 10 req/min por IP (mesmo que resolve-code).
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

const _rateMap = new Map()
const RATE_WINDOW_MS = 60_000
const RATE_MAX = 10

function _checkRate(ip) {
  const now = Date.now()
  const entry = _rateMap.get(ip)
  if (!entry || now - entry.start > RATE_WINDOW_MS) {
    _rateMap.set(ip, { start: now, count: 1 })
    return true
  }
  entry.count++
  if (entry.count > RATE_MAX) return false
  return true
}

// Firebase Web API key (pública — mesma do client bundle)
const FIREBASE_API_KEY = 'AIzaSyCHW_CTip-v1oOsbYvMJ79Ql1JvbUY7NC4'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown'
  if (!_checkRate(ip)) {
    return res.status(429).json({ error: 'Muitas tentativas. Aguarde um momento.' })
  }

  const { syncCode, senha } = req.body || {}
  if (!syncCode || typeof syncCode !== 'string' || syncCode.length < 4 || syncCode.length > 10) {
    return res.status(400).json({ error: 'Código inválido.' })
  }
  if (!senha || typeof senha !== 'string') {
    return res.status(400).json({ error: 'Senha obrigatória.' })
  }

  try {
    _initAdmin()

    // 1. Buscar email via syncCode (server-side, nunca exposto ao client)
    const snap = await admin.database().ref(`usuarios/${syncCode.toUpperCase()}/email`).get()
    if (!snap.exists()) {
      return res.status(404).json({ error: 'Código não encontrado.' })
    }
    const email = snap.val()

    // 2. Verificar email+senha via Firebase REST API (identitytoolkit)
    const authRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: senha, returnSecureToken: true }),
      }
    )

    if (!authRes.ok) {
      const err = await authRes.json().catch(() => ({}))
      const code = err?.error?.message || ''
      if (code === 'INVALID_PASSWORD' || code === 'INVALID_LOGIN_CREDENTIALS') {
        return res.status(401).json({ error: 'Senha incorreta.' })
      }
      if (code === 'USER_DISABLED') {
        return res.status(403).json({ error: 'Conta desativada.' })
      }
      if (code === 'TOO_MANY_ATTEMPTS_TRY_LATER') {
        return res.status(429).json({ error: 'Muitas tentativas. Tente novamente mais tarde.' })
      }
      return res.status(401).json({ error: 'Credenciais inválidas.' })
    }

    const authData = await authRes.json()

    // 3. Criar custom token para o client usar com signInWithCustomToken()
    const customToken = await admin.auth().createCustomToken(authData.localId)

    return res.json({ customToken })
  } catch (e) {
    console.error('[LOGIN-BY-CODE] error:', e.message)
    return res.status(500).json({ error: 'Erro interno.' })
  }
}
