/**
 * api/feedback.js
 * Recebe feedback do usuário (via usePulso.js) e:
 *   1. Envia email de agradecimento para o usuário
 *   2. Envia notificação interna para contato@plantao.net
 *
 * Auth: requer Firebase idToken (Bearer) + syncCode do body.
 * Rate limit: 5 req/min por uid (in-memory — eficaz por instância Vercel).
 * Requer: RESEND_API_KEY e FIREBASE_SERVICE_ACCOUNT no Vercel.
 */

import admin from 'firebase-admin'

let _adminInit = false
function _initAdmin() {
  if (_adminInit) return
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT
  if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT não configurada')
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(raw)),
    databaseURL: 'https://anotacao-hc-default-rtdb.firebaseio.com',
  })
  _adminInit = true
}

// Rate limit: 5 req/min por uid (in-memory, aceitável na escala atual)
const _rateMap = new Map()
const RATE_WINDOW_MS = 60_000
const RATE_MAX = 5

function _checkRate(uid) {
  const now = Date.now()
  const entry = _rateMap.get(uid)
  if (!entry || now - entry.start > RATE_WINDOW_MS) {
    _rateMap.set(uid, { start: now, count: 1 })
    return true
  }
  entry.count++
  return entry.count <= RATE_MAX
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return res.status(200).json({ ok: false, reason: 'not_configured' })
  }

  const authHeader = req.headers.authorization || ''
  const { syncCode, email, texto, versaoApp } = req.body || {}

  if (!texto || typeof texto !== 'string' || !texto.trim()) {
    return res.status(400).json({ error: 'Feedback vazio.' })
  }
  if (!syncCode || !email || !email.includes('@')) {
    return res.status(400).json({ error: 'Dados inválidos.' })
  }

  // Verificar Firebase idToken
  try {
    _initAdmin()
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token de autenticação obrigatório.' })
    }
    const idToken = authHeader.replace('Bearer ', '')
    const decoded = await admin.auth().verifyIdToken(idToken)

    // Verificar que o uid é dono do syncCode
    const ownerSnap = await admin.database().ref(`owners/${syncCode}/${decoded.uid}`).get()
    if (!ownerSnap.exists() || ownerSnap.val() !== true) {
      return res.status(403).json({ error: 'Não autorizado.' })
    }

    // Rate limit por uid autenticado
    if (!_checkRate(decoded.uid)) {
      return res.status(429).json({ error: 'Muitas mensagens. Aguarde um momento.' })
    }
  } catch (e) {
    console.error('[FEEDBACK] auth check failed:', e.message)
    return res.status(401).json({ error: 'Autenticação inválida.' })
  }

  function _esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  }

  const primeiroNome = (email.split('@')[0] || 'enfermeiro(a)').split('.')[0]

  // Buscar nome do usuário no Firebase para a notificação ao Arthur
  let nomeUsuario = primeiroNome
  try {
    const db = admin.database()
    const nomeSnap = await db.ref(`usuarios/${syncCode}/nome`).get()
    if (nomeSnap.exists()) nomeUsuario = nomeSnap.val().split(' ')[0] || primeiroNome
  } catch (_) {}

  const htmlAck = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#0A1628;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A1628;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#111d32;border-radius:16px;border:1px solid #1e3050;overflow:hidden;">
          <tr>
            <td style="padding:32px 32px 24px;text-align:center;border-bottom:1px solid #1e3050;">
              <span style="font-size:1.4rem;font-weight:800;color:#EAEEF3;letter-spacing:-0.02em;">Plantão</span>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 16px;font-size:1.05rem;font-weight:700;color:#EAEEF3;">
                Li! Valeu demais, ${_esc(nomeUsuario)}. 🙏
              </p>
              <p style="margin:0 0 16px;font-size:0.95rem;color:#8899AA;line-height:1.7;">
                Esse tipo de feedback é exatamente o que me ajuda a decidir o que melhorar no app. Não fica perdido — vai direto para mim.
              </p>
              <p style="margin:0 0 24px;font-size:0.95rem;color:#8899AA;line-height:1.7;">
                Se quiser conversar mais sobre isso, pode responder esse email mesmo.
              </p>
              <p style="margin:0;font-size:0.88rem;color:#8899AA;">
                Arthur<br>
                <span style="color:#556677;font-size:0.82rem;">Fundador do Plantão</span>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #1e3050;text-align:center;">
              <p style="margin:0;font-size:0.78rem;color:#556677;">
                Plantão — app de enfermagem · <a href="https://plantao.net" style="color:#556677;">plantao.net</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

  const htmlAdmin = `<p><strong>Feedback recebido</strong></p>
<p><strong>Usuário:</strong> ${_esc(nomeUsuario)} (${_esc(email)})</p>
<p><strong>Versão:</strong> ${_esc(versaoApp || 'desconhecida')}</p>
<p><strong>Mensagem:</strong></p>
<blockquote style="border-left:3px solid #1E88E5;padding-left:12px;color:#333;">${_esc(texto)}</blockquote>`

  try {
    // Enviar em paralelo: ack para usuário + notificação para Arthur
    const [ackRes] = await Promise.allSettled([
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Arthur do Plantão <contato@plantao.net>',
          to: [email],
          subject: 'Recebi seu feedback! 🙏',
          html: htmlAck,
        }),
      }),
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Plantão Feedback <contato@plantao.net>',
          to: ['contato@plantao.net'],
          subject: `💬 Novo feedback — ${nomeUsuario}`,
          html: htmlAdmin,
        }),
      }),
    ])

    if (ackRes.status === 'rejected') {
      console.error('[FEEDBACK] ack send failed:', ackRes.reason)
    }

    return res.status(200).json({ ok: true })
  } catch (e) {
    console.error('[FEEDBACK] fetch error:', e.message)
    return res.status(200).json({ ok: false, reason: 'network_error' })
  }
}
