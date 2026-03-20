/**
 * api/cron.js
 * Vercel Cron Job chamado a cada minuto.
 * Le notificacoes agendadas no Firebase e envia FCM para o dispositivo.
 */

import admin from 'firebase-admin'

let initialized = false

const MAX_ATRASO_ENVIO_MS = 12 * 60 * 60 * 1000
const LOCK_TIMEOUT_MS = 2 * 60 * 1000

function initAdmin() {
  if (initialized) return
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT
  if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT env var nao configurada')
  const serviceAccount = JSON.parse(raw)
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://anotacao-hc-default-rtdb.firebaseio.com',
  })
  initialized = true
}

export default async function handler(req, res) {
  const secret = process.env.CRON_SECRET
  if (secret && req.headers.authorization !== `Bearer ${secret}`) {
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
  const runId = `${agora}-${Math.random().toString(36).slice(2, 8)}`
  console.log('[CRON] start at', agora, new Date(agora).toISOString(), 'runId=', runId)

  const snap = await db.ref('notificacoes_agendadas').get()
  if (!snap.exists()) {
    console.log('[CRON] no scheduled notifications')
    return res.json({ sent: 0, erros: [], agora })
  }

  const data = snap.val() || {}
  console.log('[CRON] syncCodes found:', Object.keys(data))

  const envios = []
  const erros = []

  for (const [syncCode, entry] of Object.entries(data)) {
    if (!entry?.agendadas) {
      console.log(`[CRON] ${syncCode}: missing agendadas`)
      continue
    }

    const tokenSnap = await db.ref(`fcm_tokens/${syncCode}`).get()
    if (!tokenSnap.exists()) {
      console.log(`[CRON] ${syncCode}: no FCM token`)
      continue
    }
    const token = tokenSnap.val()
    console.log(`[CRON] ${syncCode}: token ok (${token.slice(0, 20)}...)`)

    for (const [key, notif] of Object.entries(entry.agendadas)) {
      const notifRef = db.ref(`notificacoes_agendadas/${syncCode}/agendadas/${key}`)
      console.log(`[CRON] ${syncCode}/${key}: ts=${notif?.timestamp}, now=${agora}`)

      if (!notif?.timestamp) {
        console.log(`[CRON] ${syncCode}/${key}: invalid timestamp, removing`)
        await notifRef.remove()
        continue
      }

      if (notif.sentAt) {
        console.log(`[CRON] ${syncCode}/${key}: already sent, removing residual`)
        await notifRef.remove()
        continue
      }

      if (notif.timestamp > agora) continue

      if ((agora - notif.timestamp) > MAX_ATRASO_ENVIO_MS) {
        console.log(`[CRON] ${syncCode}/${key}: too old, removing without send`)
        await notifRef.remove()
        continue
      }

      // Claim atomico: evita duas execucoes enviarem a mesma notificacao.
      const claimTx = await notifRef.transaction((current) => {
        if (!current) return

        const ts = Number(current.timestamp)
        if (!Number.isFinite(ts) || ts <= 0) return
        if (ts > Date.now()) return
        if (current.sentAt) return

        const processingAt = Number(current.processingAt || 0)
        const locked = processingAt > 0 && (Date.now() - processingAt) < LOCK_TIMEOUT_MS
        if (locked) return

        return {
          ...current,
          processingAt: Date.now(),
          processingBy: runId,
        }
      })

      if (!claimTx.committed) {
        console.log(`[CRON] ${syncCode}/${key}: skipped (already processing in another run)`)
        continue
      }

      const claimed = claimTx.snapshot.val() || notif
      console.log(`[CRON] ${syncCode}/${key}: sending "${claimed.body || ''}"`)

      envios.push(
        admin.messaging().send({
          token,
          notification: { title: '⏰ Plantão', body: claimed.body || '' },
          webpush: {
            notification: {
              title: '⏰ Plantão',
              body: claimed.body || '',
              icon: '/icons/icon-192.png',
              badge: '/icons/icon-192.png',
              tag: claimed.tag || 'plantao',
            },
            fcmOptions: { link: '/' },
          },
        })
          .then(async (msgId) => {
            console.log(`[CRON] ${syncCode}/${key}: sent ok, msgId=${msgId}`)
            try {
              await notifRef.remove()
            } catch (_) {
              await notifRef.update({
                sentAt: Date.now(),
                processingAt: null,
                processingBy: null,
              })
            }
          })
          .catch(async (err) => {
            console.error(`[CRON] ${syncCode}/${key}: send error - ${err.message}`)
            erros.push({ syncCode, key, error: err.message })
            await notifRef.update({
              processingAt: null,
              processingBy: null,
            }).catch(() => {})
          })
      )
    }
  }

  await Promise.all(envios)
  console.log('[CRON] done. sent=', envios.length, 'errors=', erros.length)
  return res.json({ sent: envios.length, erros, agora })
}
