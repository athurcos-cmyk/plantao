/**
 * api/welcome.js
 * Envia email de boas-vindas após cadastro.
 * Chamado pelo client logo após registro bem-sucedido.
 * Requer RESEND_API_KEY no Vercel.
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    // Sem chave configurada — ignora silenciosamente (não bloqueia o cadastro)
    return res.status(200).json({ ok: false, reason: 'not_configured' })
  }

  const { nome, email } = req.body || {}
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'Email inválido.' })
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
              <div style="display:inline-flex;align-items:center;gap:8px;">
                <span style="font-size:1.4rem;font-weight:800;color:#EAEEF3;letter-spacing:-0.02em;">Plantão</span>
              </div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 16px;font-size:1.1rem;font-weight:700;color:#EAEEF3;">
                Olá, ${primeiroNome}! 👋
              </p>
              <p style="margin:0 0 16px;font-size:0.95rem;color:#8899AA;line-height:1.6;">
                Seja bem-vindo(a) ao <strong style="color:#EAEEF3;">Plantão</strong> — o app feito por técnico de enfermagem, para enfermagem.
              </p>
              <p style="margin:0 0 24px;font-size:0.95rem;color:#8899AA;line-height:1.6;">
                Com o app você vai poder:
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #1e3050;">
                    <span style="font-size:1rem;margin-right:10px;">🔔</span>
                    <span style="font-size:0.9rem;color:#EAEEF3;">Nunca mais esquecer medicação — notificação no horário certo</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #1e3050;">
                    <span style="font-size:1rem;margin-right:10px;">🧮</span>
                    <span style="font-size:0.9rem;color:#EAEEF3;">Calculadora de gotejamento, diluição e dosagem na palma da mão</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #1e3050;">
                    <span style="font-size:1rem;margin-right:10px;">📋</span>
                    <span style="font-size:0.9rem;color:#EAEEF3;">Anotações com texto pronto para copiar no prontuário</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;">
                    <span style="font-size:1rem;margin-right:10px;">🤖</span>
                    <span style="font-size:0.9rem;color:#EAEEF3;">Clara — IA especialista em enfermagem para dúvidas do plantão</span>
                  </td>
                </tr>
              </table>

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

              <p style="margin:0;font-size:0.82rem;color:#556677;line-height:1.5;text-align:center;">
                Qualquer dúvida, é só responder este email.<br>
                <a href="mailto:contato@plantao.net" style="color:#1E88E5;text-decoration:none;">contato@plantao.net</a>
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
        from: 'Plantão <contato@plantao.net>',
        to: [email],
        subject: `Bem-vindo ao Plantão, ${primeiroNome}! 👋`,
        html,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('[WELCOME] Resend error:', err)
      return res.status(200).json({ ok: false, reason: 'send_failed' })
    }

    return res.status(200).json({ ok: true })
  } catch (e) {
    console.error('[WELCOME] fetch error:', e.message)
    return res.status(200).json({ ok: false, reason: 'network_error' })
  }
}
