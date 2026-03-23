/**
 * api/welcome.js
 * Envia email de boas-vindas após cadastro.
 * Chamado pelo client logo após registro bem-sucedido (fire-and-forget).
 * Requer RESEND_API_KEY e FIREBASE_SERVICE_ACCOUNT no Vercel.
 *
 * Deduplicação: checa usuarios/{syncCode}/email_boas_vindas_enviado antes de enviar.
 * Evita duplo envio quando o usuário registra via email e depois vincula Google (ou vice-versa).
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

  const { nome, email, syncCode } = req.body || {}
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'Email inválido.' })
  }

  // Deduplicação server-side
  if (syncCode) {
    try {
      _initAdmin()
      const db = admin.database()
      const flagSnap = await db.ref(`usuarios/${syncCode}/email_boas_vindas_enviado`).get()
      if (flagSnap.exists() && flagSnap.val() === true) {
        return res.status(200).json({ ok: false, reason: 'already_sent' })
      }
    } catch (e) {
      // Se não conseguir checar, envia mesmo assim (melhor duplicar do que não enviar)
      console.warn('[WELCOME] flag check failed:', e.message)
    }
  }

  const primeiroNome = (nome || 'enfermeiro(a)').split(' ')[0]

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bem-vindo ao Plantão</title>
</head>
<body style="margin:0;padding:0;background:#0A1628;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A1628;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#111d32;border-radius:16px;border:1px solid #1e3050;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="padding:32px 32px 24px;text-align:center;border-bottom:1px solid #1e3050;">
              <span style="font-size:1.4rem;font-weight:800;color:#EAEEF3;letter-spacing:-0.02em;">Plantão</span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 20px;font-size:1.05rem;font-weight:700;color:#EAEEF3;">
                Oi, ${primeiroNome}! 👋
              </p>

              <p style="margin:0 0 16px;font-size:0.95rem;color:#8899AA;line-height:1.7;">
                Aqui é o Arthur, fundador do Plantão.
              </p>

              <p style="margin:0 0 16px;font-size:0.95rem;color:#8899AA;line-height:1.7;">
                Criei esse app porque sentia falta de uma ferramenta que entendesse de verdade a rotina do plantão. Não uma planilha genérica — algo feito pra quem trabalha à beira do leito, com tempo curto e muito pra lembrar.
              </p>

              <p style="margin:0 0 24px;font-size:0.95rem;color:#8899AA;line-height:1.7;">
                Fico muito feliz que você esteja aqui. ❤️
              </p>

              <!-- Separador -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;border-top:1px solid #1e3050;padding-top:20px;">
                <tr>
                  <td>
                    <p style="margin:0 0 12px;font-size:0.85rem;font-weight:700;color:#EAEEF3;text-transform:uppercase;letter-spacing:0.05em;">
                      Uma dica pra começar
                    </p>
                    <p style="margin:0;font-size:0.92rem;color:#8899AA;line-height:1.6;">
                      Abra qualquer anotação, preencha os campos e toque em <strong style="color:#EAEEF3;">Copiar</strong>. O texto já sai formatado, pronto pra colar direto no sistema do hospital. Sem redigitar, sem erro de digitação. 📋
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td align="center">
                    <a href="https://plantao.net"
                       style="display:inline-block;background:#1E88E5;color:#ffffff;text-decoration:none;font-weight:700;font-size:0.95rem;padding:14px 32px;border-radius:9999px;">
                      Abrir o Plantão →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:0.88rem;color:#8899AA;line-height:1.6;">
                Se tiver qualquer dúvida ou ideia de melhoria, é só responder esse email — eu leio tudo pessoalmente. 🙏
              </p>

              <p style="margin:16px 0 0;font-size:0.88rem;color:#8899AA;">
                Arthur<br>
                <span style="color:#556677;font-size:0.82rem;">Fundador do Plantão</span>
              </p>
            </td>
          </tr>

          <!-- Footer -->
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
        subject: `Oi, ${primeiroNome}! Bem-vindo ao Plantão 👋`,
        html,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('[WELCOME] Resend error:', err)
      return res.status(200).json({ ok: false, reason: 'send_failed' })
    }

    // Marcar como enviado para deduplicação
    if (syncCode) {
      try {
        const db = admin.database()
        await db.ref(`usuarios/${syncCode}/email_boas_vindas_enviado`).set(true)
      } catch (e) {
        console.warn('[WELCOME] flag set failed:', e.message)
      }
    }

    return res.status(200).json({ ok: true })
  } catch (e) {
    console.error('[WELCOME] fetch error:', e.message)
    return res.status(200).json({ ok: false, reason: 'network_error' })
  }
}
