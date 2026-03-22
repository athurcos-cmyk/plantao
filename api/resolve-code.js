/**
 * api/resolve-code.js
 * Recebe syncCode → retorna o email vinculado (parcialmente mascarado).
 * Rate limiting em memória por IP (10 req/min).
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

// Rate limiting simples em memória (reseta a cada cold start, suficiente para serverless)
const _rateMap = new Map()
const RATE_WINDOW_MS = 60_000  // 1 minuto
const RATE_MAX = 10            // 10 tentativas por minuto por IP

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

// Mascara email: a****@gmail.com
function _maskEmail(email) {
  if (!email || typeof email !== 'string') return '***@***.com'
  const [local, domain] = email.split('@')
  if (!domain) return '***@***.com'
  const visible = local.slice(0, 1)
  return `${visible}****@${domain}`
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Rate limiting por IP
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown'
  if (!_checkRate(ip)) {
    return res.status(429).json({ error: 'Muitas tentativas. Aguarde um momento.' })
  }

  const { syncCode } = req.body || {}
  if (!syncCode || typeof syncCode !== 'string' || syncCode.length < 4 || syncCode.length > 10) {
    return res.status(400).json({ error: 'Código inválido.' })
  }

  try {
    _initAdmin()
    const snap = await admin.database().ref(`usuarios/${syncCode.toUpperCase()}/email`).get()
    if (!snap.exists()) {
      return res.status(404).json({ error: 'Código não encontrado ou sem email vinculado.' })
    }
    const email = snap.val()
    return res.json({
      email,                   // usado internamente pelo login
      emailMasked: _maskEmail(email),  // exibido na UI
    })
  } catch (e) {
    console.error('[RESOLVE-CODE] error:', e.message)
    return res.status(500).json({ error: 'Erro interno.' })
  }
}
