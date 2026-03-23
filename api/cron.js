/**
 * api/cron.js
 * Vercel Cron Job chamado a cada minuto.
 * Lê notificações agendadas no Firebase e envia via OneSignal Web Push.
 * OneSignal gerencia subscriptions por external_user_id (= syncCode).
 */

import admin from 'firebase-admin'

let initialized = false

const MAX_ATRASO_ENVIO_MS = 12 * 60 * 60 * 1000

const ONESIGNAL_APP_ID      = process.env.ONESIGNAL_APP_ID      || ''
const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY || ''

function initAdmin() {
  if (initialized) return
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT
  if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT env var nao configurada')
  const serviceAccount = JSON.parse(raw)
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://anotacao-hc-default-rtdb.firebaseio.com',
  })

  if (!ONESIGNAL_APP_ID)       throw new Error('ONESIGNAL_APP_ID env var nao configurada')
  if (!ONESIGNAL_REST_API_KEY) throw new Error('ONESIGNAL_REST_API_KEY env var nao configurada')

  initialized = true
}

// Envia push via OneSignal REST API para todos os dispositivos do syncCode
async function _enviarOneSignal(syncCode, notif) {
  const res = await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Authorization': `Key ${ONESIGNAL_REST_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      app_id: ONESIGNAL_APP_ID,
      // Envia para todos os dispositivos do usuário identificado pelo syncCode
      include_external_user_ids: [syncCode],
      channel_for_external_user_ids: 'push',
      contents: { en: notif.body || '' },
      headings: { en: '⏰ Plantão' },
      web_push_topic: notif.tag || 'plantao',
      url: 'https://plantao.net',
      web_url: 'https://plantao.net',
      isAnyWeb: true,
      ttl: 3600,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OneSignal ${res.status}: ${err}`)
  }

  return await res.json()
}

export default async function handler(req, res) {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.authorization !== `Bearer ${secret}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    initAdmin()
  } catch (e) {
    console.error('[CRON] initAdmin failed:', e.message)
    return res.status(500).json({ error: e.message })
  }

  const db = admin.database()
  const agora = Date.now()
  console.log('[CRON] start at', agora, new Date(agora).toISOString())

  const snap = await db.ref('notificacoes_agendadas').get()
  if (!snap.exists()) {
    console.log('[CRON] no scheduled notifications')
    return res.json({ sent: 0, erros: [], agora })
  }

  const data = snap.val() || {}
  console.log('[CRON] syncCodes found:', Object.keys(data))

  let totalProcessados = 0
  let totalEnviados = 0
  const erros = []
  const envios = []

  for (const [syncCode, entry] of Object.entries(data)) {
    if (!entry?.agendadas) {
      console.log(`[CRON] ${syncCode}: missing agendadas`)
      continue
    }

    for (const [key, _notif] of Object.entries(entry.agendadas)) {
      const notifRef = db.ref(`notificacoes_agendadas/${syncCode}/agendadas/${key}`)

      // RE-LER a notificação do Firebase (pode ter mudado enquanto iterava)
      const freshSnap = await notifRef.get()
      const notif = freshSnap.val()

      console.log(`[CRON] ${syncCode}/${key}: ts=${notif?.timestamp}, now=${agora}`)

      if (!notif?.timestamp) {
        console.log(`[CRON] ${syncCode}/${key}: invalid or deleted, skipping`)
        continue
      }

      if (notif.sentAt) {
        console.log(`[CRON] ${syncCode}/${key}: already sent, removing`)
        await notifRef.remove()
        continue
      }

      if (notif.timestamp > agora) {
        const msAte = notif.timestamp - agora
        console.log(`[CRON] ${syncCode}/${key}: future (${Math.round(msAte / 1000)}s away), skipping`)
        continue
      }

      if ((agora - notif.timestamp) > MAX_ATRASO_ENVIO_MS) {
        console.log(`[CRON] ${syncCode}/${key}: too old, removing without send`)
        await notifRef.remove()
        continue
      }

      console.log(`[CRON] ${syncCode}/${key}: ready to send — "${notif.body || ''}"`)
      totalProcessados++
      totalEnviados++

      envios.push(
        _enviarOneSignal(syncCode, notif)
          .then(result => {
            console.log(`[CRON] ${syncCode}/${key}: OneSignal ok, id=${result.id}`)
          })
          .catch(err => {
            console.error(`[CRON] ${syncCode}/${key}: OneSignal error —`, err.message)
            erros.push({ syncCode, key, error: err.message })
          })
      )

      // Remove notificação após enviar
      envios.push(
        Promise.resolve().then(async () => {
          try {
            await notifRef.remove()
          } catch (_) {
            await notifRef.update({ sentAt: Date.now() }).catch(() => {})
          }
        })
      )
    }
  }

  await Promise.all(envios)
  console.log(`[CRON] done. processados=${totalProcessados}, enviados=${totalEnviados}, errors=${erros.length}`)

  // ─── Email Dia 3 ───────────────────────────────────────────────────────────
  const RESEND_KEY = process.env.RESEND_API_KEY
  if (RESEND_KEY) {
    try {
      const DIA3_MS = 3 * 24 * 60 * 60 * 1000
      const JANELA_MS = 60 * 60 * 1000
      const now = Date.now()
      const limiteSuperior = now - DIA3_MS
      const limiteInferior = now - DIA3_MS - JANELA_MS

      const usuariosSnap = await db.ref('usuarios').get()
      if (usuariosSnap.exists()) {
        const usuarios = usuariosSnap.val() || {}
        const enviosDia3 = []

        for (const [syncCode, usuario] of Object.entries(usuarios)) {
          const criadoEm = usuario?.criadoEm
          const emailUsr = usuario?.email
          const jaEnviado = usuario?.email_dia3_enviado

          if (!criadoEm || jaEnviado || !emailUsr || !emailUsr.includes('@')) continue
          if (criadoEm > limiteSuperior || criadoEm <= limiteInferior) continue

          const nomeUsuario = (usuario.nome || '').split(' ')[0] || 'enfermeiro(a)'
          console.log(`[CRON/DIA3] ${syncCode}: enviando email dia 3 para ${emailUsr}`)

          await db.ref(`usuarios/${syncCode}/email_dia3_enviado`).set(true)

          enviosDia3.push(
            fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${RESEND_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                from: 'Arthur do Plantão <contato@plantao.net>',
                to: [emailUsr],
                subject: `${nomeUsuario}, você descobriu tudo no Plantão? 👀`,
                html: _htmlDia3(nomeUsuario),
              }),
            }).catch(e => console.error(`[CRON/DIA3] ${syncCode}: resend error`, e.message))
          )
        }

        if (enviosDia3.length > 0) {
          await Promise.allSettled(enviosDia3)
          console.log(`[CRON/DIA3] ${enviosDia3.length} email(s) enviado(s)`)
        }
      }
    } catch (e) {
      console.error('[CRON/DIA3] error (non-fatal):', e.message)
    }
  }

  return res.json({ sent: totalEnviados, processados: totalProcessados, erros, agora })
}

function _htmlDia3(nomeUsuario) {
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
              Oi, ${nomeUsuario}! Já faz 3 dias. 👀
            </p>
            <p style="margin:0 0 16px;font-size:0.95rem;color:#8899AA;line-height:1.7;">
              Você já descobriu tudo que dá pra fazer no app? Vou te mostrar 3 coisas que fazem diferença no plantão:
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr>
                <td style="padding:12px 0;border-bottom:1px solid #1e3050;">
                  <span style="font-size:1rem;margin-right:10px;">🔔</span>
                  <span style="font-size:0.9rem;color:#EAEEF3;font-weight:600;">Notificações no horário certo</span><br>
                  <span style="font-size:0.85rem;color:#8899AA;margin-left:26px;display:block;">Funciona em dois lugares: no <strong style="color:#EAEEF3;">Organizador</strong> (tarefas do turno) e nas <strong style="color:#EAEEF3;">Pendências do Paciente</strong> (medicações, procedimentos). O app avisa mesmo com a tela fechada.</span>
                </td>
              </tr>
              <tr>
                <td style="padding:12px 0;border-bottom:1px solid #1e3050;">
                  <span style="font-size:1rem;margin-right:10px;">🧮</span>
                  <span style="font-size:0.9rem;color:#EAEEF3;font-weight:600;">Calculadora de medicação</span><br>
                  <span style="font-size:0.85rem;color:#8899AA;margin-left:26px;display:block;">Dosagem, gotejamento e diluição — sem papel, sem erro. Salva os últimos cálculos.</span>
                </td>
              </tr>
              <tr>
                <td style="padding:12px 0;">
                  <span style="font-size:1rem;margin-right:10px;">🛏️</span>
                  <span style="font-size:0.9rem;color:#EAEEF3;font-weight:600;">Meus Pacientes</span><br>
                  <span style="font-size:0.85rem;color:#8899AA;margin-left:26px;display:block;">Cadastre os pacientes do turno, adicione pendências e marque conforme resolve.</span>
                </td>
              </tr>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr>
                <td align="center">
                  <a href="https://plantao.net" style="display:inline-block;background:#1E88E5;color:#ffffff;text-decoration:none;font-weight:700;font-size:0.95rem;padding:14px 32px;border-radius:9999px;">
                    Abrir o Plantão →
                  </a>
                </td>
              </tr>
            </table>
            <p style="margin:0;font-size:0.88rem;color:#8899AA;line-height:1.6;">
              Qualquer dúvida, é só responder esse email. 🙏
            </p>
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
