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
    const tokenData = tokenSnap.val()
    // Suporte multi-dispositivo: pode ser string (legado) ou objeto { id: { token, updatedAt } }
    const tokens = []
    if (typeof tokenData === 'string') {
      tokens.push({ id: 'legacy', token: tokenData })
    } else {
      for (const [id, val] of Object.entries(tokenData)) {
        if (typeof val === 'string') tokens.push({ id, token: val })
        else if (val?.token) tokens.push({ id, token: val.token })
      }
    }
    if (tokens.length === 0) {
      console.log(`[CRON] ${syncCode}: no valid tokens`)
      continue
    }
    console.log(`[CRON] ${syncCode}: ${tokens.length} token(s)`)

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

      // Lock atômico via Firebase transaction() — garante que apenas uma instância processa
      let claimed = false
      try {
        const result = await notifRef.transaction((current) => {
          if (!current) return // nó deletado entre o .get() e agora
          if (current.sentAt) return // já enviado
          if (current.processingAt > 0 && (Date.now() - current.processingAt) < LOCK_TIMEOUT_MS) {
            return // já está sendo processado por outra instância — abort
          }
          return { ...current, processingAt: Date.now(), processingBy: runId }
        })
        claimed = result.committed && result.snapshot.exists() && result.snapshot.val()?.processingBy === runId
      } catch (e) {
        console.log(`[CRON] ${syncCode}/${key}: transaction falhou - ${e.message}`)
        continue
      }

      if (!claimed) {
        console.log(`[CRON] ${syncCode}/${key}: não foi possível fazer claim (outra instância)`)
        continue
      }

      console.log(`[CRON] ${syncCode}/${key}: sending "${notif.body || ''}" to ${tokens.length} device(s)`)
      totalEnviados++

      for (const { id: tokenId, token } of tokens) {
        envios.push(
          admin.messaging().send({
            token,
            notification: { title: '⏰ Plantão', body: notif.body || '' },
            webpush: {
              notification: {
                title: '⏰ Plantão',
                body: notif.body || '',
                icon: '/icons/icon-192.png',
                badge: '/icons/icon-192.png',
                tag: notif.tag || 'plantao',
              },
              fcmOptions: { link: '/' },
            },
          })
            .then(async (msgId) => {
              console.log(`[CRON] ${syncCode}/${key}@${tokenId}: sent ok, msgId=${msgId}`)
            })
            .catch(async (err) => {
              console.error(`[CRON] ${syncCode}/${key}@${tokenId}: send error - ${err.message}`)
              erros.push({ syncCode, key, tokenId, error: err.message })
              const tokenInvalido = err.message?.includes('registration-token-not-registered')
                || err.message?.includes('invalid-registration-token')
                || err.message?.includes('Requested entity was not found')
              if (tokenInvalido) {
                console.log(`[CRON] ${syncCode}@${tokenId}: token inválido, removendo`)
                await db.ref(`fcm_tokens/${syncCode}/${tokenId}`).remove().catch(() => {})
              }
            })
        )
      }
      // Remove notificação após enviar para todos os dispositivos
      envios.push(
        Promise.resolve().then(async () => {
          try {
            await notifRef.remove()
          } catch (_) {
            await notifRef.update({ sentAt: Date.now(), processingAt: null, processingBy: null })
          }
        })
      )
    }
  }

  await Promise.all(envios)
  console.log(`[CRON] done. processados=${totalProcessados}, enviados=${totalEnviados}, errors=${erros.length}`)
  return res.json({ sent: totalEnviados, processados: totalProcessados, erros, agora })
}
