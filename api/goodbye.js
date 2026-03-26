/**
 * api/goodbye.js
 * Envia email de despedida quando o usuário exclui a conta.
 * Chamado ANTES de deleteUser() na ConfiguracoesView com timeout de 5s.
 * Falha silenciosa — nunca bloqueia a exclusão da conta.
 *
 * Auth: requer Firebase idToken (Bearer).
 * Busca nome/email server-side via Firebase Admin — nunca confia no body.
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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return res.status(200).json({ ok: false, reason: 'not_configured' })
  }

  const authHeader = req.headers.authorization || ''

  // Verificar Firebase idToken e buscar dados server-side
  let email, nomeUsuario
  try {
    _initAdmin()
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token de autenticação obrigatório.' })
    }
    const idToken = authHeader.replace('Bearer ', '')
    const decoded = await admin.auth().verifyIdToken(idToken)
    const uid = decoded.uid

    // Buscar syncCode via uid_map
    const db = admin.database()
    const mapSnap = await db.ref(`uid_map/${uid}`).get()
    if (!mapSnap.exists()) {
      // Conta sem syncCode — enviar com dados do Firebase Auth
      email = decoded.email || null
      nomeUsuario = (decoded.name || '').split(' ')[0] || 'enfermeiro(a)'
    } else {
      const syncCode = mapSnap.val()
      const usuarioSnap = await db.ref(`usuarios/${syncCode}`).get()
      const usuario = usuarioSnap.val() || {}
      email = usuario.email || decoded.email || null
      nomeUsuario = (usuario.nome || decoded.name || '').split(' ')[0] || 'enfermeiro(a)'
    }
  } catch (e) {
    console.error('[GOODBYE] auth check failed:', e.message)
    return res.status(401).json({ error: 'Autenticação inválida.' })
  }

  function _esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  }
  nomeUsuario = _esc(nomeUsuario)

  if (!email || !email.includes('@')) {
    // Sem email disponível — não podemos enviar, mas não bloqueamos o delete
    return res.status(200).json({ ok: false, reason: 'no_email' })
  }

  const html = `
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
                Até logo, ${nomeUsuario}.
              </p>
              <p style="margin:0 0 16px;font-size:0.95rem;color:#8899AA;line-height:1.7;">
                Sua conta foi excluída e todos os seus dados foram apagados, como você pediu.
              </p>
              <p style="margin:0 0 16px;font-size:0.95rem;color:#8899AA;line-height:1.7;">
                Se um dia quiser voltar, o app continua lá em <a href="https://plantao.net" style="color:#1E88E5;text-decoration:none;">plantao.net</a> — sem complicação, basta criar uma conta nova.
              </p>
              <p style="margin:0 0 24px;font-size:0.95rem;color:#8899AA;line-height:1.7;">
                Obrigado por ter experimentado. Cuide-se. 🤍
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

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Arthur do Plantão <contato@plantao.net>',
        to: [email],
        subject: 'Conta excluída — até logo 🤍',
        html,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('[GOODBYE] Resend error:', err)
      return res.status(200).json({ ok: false, reason: 'send_failed' })
    }

    return res.status(200).json({ ok: true })
  } catch (e) {
    console.error('[GOODBYE] fetch error:', e.message)
    return res.status(200).json({ ok: false, reason: 'network_error' })
  }
}
