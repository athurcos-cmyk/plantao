/**
 * api/broadcast.js
 * Envia push e/ou email para todos os usuários cadastrados.
 * Acesso restrito ao admin (a.thurcos@gmail.com).
 *
 * Auth: Bearer idToken do Firebase Auth (obrigatório)
 * Body: { titulo, mensagem, tipo } — tipo: 'push' | 'email' | 'ambos'
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

  // ── Auth ──────────────────────────────────────────────────────────────────
  const authHeader = req.headers.authorization || ''
  const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  if (!idToken) return res.status(401).json({ error: 'Unauthorized' })

  try {
    initAdmin()
  } catch (e) {
    console.error('[BROADCAST] initAdmin failed:', e.message)
    return res.status(500).json({ error: e.message })
  }

  let decoded
  try {
    decoded = await admin.auth().verifyIdToken(idToken)
  } catch (e) {
    console.error('[BROADCAST] verifyIdToken failed:', e.message)
    return res.status(401).json({ error: 'Token inválido' })
  }

  if (decoded.email !== ADMIN_EMAIL) {
    console.warn('[BROADCAST] acesso negado para:', decoded.email)
    return res.status(403).json({ error: 'Acesso negado' })
  }

  // ── Payload ───────────────────────────────────────────────────────────────
  const { titulo, mensagem, tipo } = req.body || {}
  if (!mensagem || !tipo) {
    return res.status(400).json({ error: 'Campos obrigatórios: mensagem, tipo' })
  }

  const tituloPush = titulo || '📢 Plantão'
  const enviarPush  = tipo === 'push'  || tipo === 'ambos'
  const enviarEmail = tipo === 'email' || tipo === 'ambos'

  const db = admin.database()
  const RESEND_KEY = process.env.RESEND_API_KEY

  let pushEnviados = 0
  let emailsEnviados = 0
  const erros = []

  // ── Push FCM ──────────────────────────────────────────────────────────────
  if (enviarPush) {
    try {
      const tokensSnap = await db.ref('fcm_tokens').get()
      if (tokensSnap.exists()) {
        const envios = []
        tokensSnap.forEach((syncSnap) => {
          syncSnap.forEach((deviceSnap) => {
            const token = deviceSnap.val()?.token
            if (!token) return

            const msg = {
              token,
              webpush: {
                headers: { TTL: '86400', Urgency: 'normal' },
                data: {
                  title: tituloPush,
                  body: mensagem,
                  tag: `broadcast-${Date.now()}`,
                },
              },
            }

            envios.push(
              admin.messaging().send(msg)
                .then(() => { pushEnviados++ })
                .catch(e => {
                  console.error(`[BROADCAST] FCM error ${deviceSnap.key}: ${e.message}`)
                  erros.push({ tipo: 'push', key: deviceSnap.key, error: e.message })
                  // Token inválido — remover
                  if (e.code === 'messaging/registration-token-not-registered' ||
                      e.code === 'messaging/invalid-registration-token') {
                    db.ref(`fcm_tokens/${syncSnap.key}/${deviceSnap.key}`).remove().catch(() => {})
                  }
                })
            )
          })
        })
        await Promise.allSettled(envios)
      }
    } catch (e) {
      console.error('[BROADCAST] push error:', e.message)
      erros.push({ tipo: 'push', error: e.message })
    }
  }

  // ── Email via Resend ───────────────────────────────────────────────────────
  if (enviarEmail && RESEND_KEY) {
    try {
      const usuariosSnap = await db.ref('usuarios').get()
      if (usuariosSnap.exists()) {
        const destinatarios = []
        usuariosSnap.forEach((snap) => {
          const u = snap.val() || {}
          const email = u.email
          if (!email || !email.includes('@')) return
          destinatarios.push({ email, nome: (u.nome || '').split(' ')[0] || 'enfermeiro(a)' })
        })

        // Envio sequencial com 500ms entre cada — evita HTTP 429 do Resend
        for (const { email, nome } of destinatarios) {
          try {
            const r = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${RESEND_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                from: 'Arthur do Plantão <contato@plantao.net>',
                to: [email],
                subject: tituloPush,
                html: _htmlBroadcast(nome, tituloPush, mensagem),
              }),
            })
            if (r.ok) { emailsEnviados++ }
            else { erros.push({ tipo: 'email', email, error: `HTTP ${r.status}` }) }
          } catch (e) {
            erros.push({ tipo: 'email', email, error: e.message })
          }
          await new Promise(r => setTimeout(r, 500))
        }
      }
    } catch (e) {
      console.error('[BROADCAST] email error:', e.message)
      erros.push({ tipo: 'email', error: e.message })
    }
  } else if (enviarEmail && !RESEND_KEY) {
    erros.push({ tipo: 'email', error: 'RESEND_API_KEY não configurado' })
  }

  console.log(`[BROADCAST] push=${pushEnviados}, email=${emailsEnviados}, erros=${erros.length}`)

  // Salvar histórico de broadcasts para o painel admin (fire-and-forget)
  admin.database().ref('admin/broadcasts').push({
    ts: Date.now(), titulo, mensagem, tipo, push: pushEnviados, email: emailsEnviados,
  }).catch(() => {})

  return res.json({ push: pushEnviados, email: emailsEnviados, erros })
}

function _htmlBroadcast(nome, titulo, mensagem) {
  // Converte quebras de linha em <br> para exibição no email
  const mensagemHtml = mensagem.replace(/\n/g, '<br>')

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0A1628;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A1628;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#111d32;border-radius:16px;border:1px solid #1e3050;overflow:hidden;">
        <tr>
          <td style="padding:32px 32px 24px;text-align:center;border-bottom:1px solid #1e3050;">
            <span style="font-size:1.4rem;font-weight:800;color:#EAEEF3;letter-spacing:-0.02em;">Plantão</span>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 16px;font-size:1.05rem;font-weight:700;color:#EAEEF3;">
              Oi, ${nome}! 👋
            </p>
            <p style="margin:0 0 8px;font-size:1rem;font-weight:600;color:#EAEEF3;">
              ${titulo}
            </p>
            <p style="margin:0 0 24px;font-size:0.95rem;color:#8899AA;line-height:1.7;">
              ${mensagemHtml}
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr>
                <td align="center">
                  <a href="https://plantao.net" style="display:inline-block;background:#1E88E5;color:#ffffff;text-decoration:none;font-weight:700;font-size:0.95rem;padding:14px 32px;border-radius:9999px;">
                    Abrir o Plantão →
                  </a>
                </td>
              </tr>
            </table>
            <p style="margin:16px 0 0;font-size:0.88rem;color:#8899AA;">
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
    </td></tr>
  </table>
</body>
</html>`
}
