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

  let totalProcessados = 0
  let totalEnviados = 0
  const erros = []
  const envios = []

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

    for (const [key, _notif] of Object.entries(entry.agendadas)) {
      const notifRef = db.ref(`notificacoes_agendadas/${syncCode}/agendadas/${key}`)
      
      // ⚠️ RE-LER a notificação do Firebase (pode ter mudado enquanto iterava)
      const freshSnap = await notifRef.get()
      const notif = freshSnap.val()
      
      console.log(`[CRON] ${syncCode}/${key}: ts=${notif?.timestamp}, now=${agora}`)

      if (!notif?.timestamp) {
        console.log(`[CRON] ${syncCode}/${key}: invalid timestamp or deleted, skipping`)
        continue
      }

      if (notif.sentAt) {
        console.log(`[CRON] ${syncCode}/${key}: already sent, removing residual`)
        await notifRef.remove()
        continue
      }

      if (notif.timestamp > agora) {
        const msAte = notif.timestamp - agora
        console.log(`[CRON] ${syncCode}/${key}: future (${Math.round(msAte / 1000)}s away), skipping`)
        continue
      }

      if ((agora - notif.timestamp) > MAX_ATRASO_ENVIO_MS) {
        console.log(`[CRON] ${syncCode}/${key}: too old (${Math.round((agora - notif.timestamp) / 1000)}s), removing without send`)
        await notifRef.remove()
        continue
      }

      console.log(`[CRON] ${syncCode}/${key}: ready to send (${Math.round((agora - notif.timestamp) / 1000)}s ago), claiming...`)
      totalProcessados++

      // Log do estado ANTES
      const estadoAntes = {
        timestamp: notif.timestamp,
        body: notif.body,
        tag: notif.tag,
        sentAt: notif.sentAt,
        processingAt: notif.processingAt,
        processingBy: notif.processingBy,
      }
      console.log(`[CRON] ${syncCode}/${key}: estado antes=`, JSON.stringify(estadoAntes))

      // Lock atômico simples para evitar problemas com .transaction() em Serverless functions do Vercel
      // Verifica o current state que lemos no .get()
      const locked = notif.processingAt > 0 && (Date.now() - notif.processingAt) < LOCK_TIMEOUT_MS
      if (locked) {
        console.log(`[CRON] ${syncCode}/${key}: skipping, already processing by ${notif.processingBy}`)
        continue
      }
      
      // Assinala que ESTAMOS processando isso agora
      try {
        await notifRef.update({
          processingAt: Date.now(),
          processingBy: runId,
        })
      } catch (e) {
        console.log(`[CRON] ${syncCode}/${key}: falha ao fazer claim - ${e.message}`)
        continue
      }

      console.log(`[CRON] ${syncCode}/${key}: sending "${notif.body || ''}"`)
      totalEnviados++

      envios.push(
        admin.messaging().send({
          token,
          notification: { title: '⏰ Plantão', body: notif.body || '' },
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
  console.log(`[CRON] done. processados=${totalProcessados}, enviados=${totalEnviados}, errors=${erros.length}`)
  return res.json({ sent: totalEnviados, processados: totalProcessados, erros, agora })
}
