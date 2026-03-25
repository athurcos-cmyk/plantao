/**
 * api/admin-email-user.js
 * Envia email personalizado para um usuário específico via Resend.
 * Acesso restrito ao admin (a.thurcos@gmail.com).
 *
 * Auth: Bearer idToken do admin
 * Body: { uid, assunto, mensagem }
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

  const authHeader = req.headers.authorization || ''
  const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  if (!idToken) return res.status(401).json({ error: 'Unauthorized' })

  try {
    initAdmin()
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }

  try {
    const decoded = await admin.auth().verifyIdToken(idToken)
    if (decoded.email !== ADMIN_EMAIL) {
      return res.status(403).json({ error: 'Forbidden' })
    }
  } catch {
    return res.status(401).json({ error: 'Token inválido' })
  }

  const { uid, assunto, mensagem } = req.body || {}
  if (!uid || !assunto || !mensagem) {
    return res.status(400).json({ error: 'uid, assunto e mensagem são obrigatórios' })
  }

  const RESEND_KEY = process.env.RESEND_API_KEY
  if (!RESEND_KEY) {
    return res.status(500).json({ error: 'RESEND_API_KEY não configurado' })
  }

  // Buscar dados do usuário via firebase-admin
  const db = admin.database()
  const mapSnap = await db.ref(`uid_map/${uid}`).get()
  if (!mapSnap.exists()) {
    return res.status(404).json({ error: 'Usuário não encontrado' })
  }

  const syncCode = mapSnap.val()
  const userSnap = await db.ref(`usuarios/${syncCode}`).get()
  if (!userSnap.exists()) {
    return res.status(404).json({ error: 'Dados do usuário não encontrados' })
  }

  const { nome = '', email = '' } = userSnap.val()
  if (!email) {
    return res.status(400).json({ error: 'Usuário não tem email cadastrado' })
  }

  const html = `
    <div style="font-family:'DM Sans',Arial,sans-serif;max-width:520px;margin:0 auto;background:#0A1628;color:#EAEEF3;padding:32px 24px;border-radius:12px">
      <p style="font-size:1rem;line-height:1.6;color:#EAEEF3">Olá, ${nome || 'enfermeiro(a)'}!</p>
      <div style="font-size:0.95rem;line-height:1.7;color:#C8D3E0;white-space:pre-wrap">${mensagem}</div>
      <hr style="border-color:#1e3050;margin:24px 0"/>
      <p style="font-size:0.8rem;color:#556677;margin:0">Arthur Olímpio — Plantão<br/>
        <a href="mailto:contato@plantao.net" style="color:#1E88E5">contato@plantao.net</a>
      </p>
    </div>
  `

  const emailRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Arthur do Plantão <contato@plantao.net>',
      to: [email],
      subject: assunto,
      html,
    }),
  })

  if (!emailRes.ok) {
    const err = await emailRes.text()
    console.error('[ADMIN-EMAIL] Resend error:', err)
    return res.status(502).json({ error: 'Falha ao enviar email', detalhe: err })
  }

  console.log(`[ADMIN-EMAIL] Email enviado para ${email} (uid=${uid})`)
  return res.json({ ok: true, email })
}
