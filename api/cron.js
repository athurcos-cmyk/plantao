/**
 * api/cron.js — Vercel Cron Job (roda a cada minuto)
 * Lê notificações agendadas no Firebase e envia FCM para o dispositivo.
 * Funciona mesmo com o app completamente fechado.
 */

import admin from 'firebase-admin'

let initialized = false

function initAdmin() {
  if (initialized) return
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT
  if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT env var não configurada')
  const serviceAccount = JSON.parse(raw)
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://anotacao-hc-default-rtdb.firebaseio.com',
  })
  initialized = true
}

export default async function handler(req, res) {
  // Vercel envia CRON_SECRET como Bearer token para autenticar o cron
  const secret = process.env.CRON_SECRET
  if (secret && req.headers.authorization !== `Bearer ${secret}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    initAdmin()
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }

  const db = admin.database()
  const agora = Date.now()

  // Lê todas as notificações agendadas
  const snap = await db.ref('notificacoes_agendadas').get()
  if (!snap.exists()) return res.json({ sent: 0 })

  const data = snap.val()
  const envios = []

  for (const [syncCode, entry] of Object.entries(data)) {
    if (!entry?.agendadas) continue

    // Busca o token FCM deste usuário
    const tokenSnap = await db.ref(`fcm_tokens/${syncCode}`).get()
    if (!tokenSnap.exists()) continue
    const token = tokenSnap.val()

    for (const [key, notif] of Object.entries(entry.agendadas)) {
      if (!notif?.timestamp || notif.timestamp > agora) continue

      // Envia FCM
      envios.push(
        admin.messaging().send({
          token,
          notification: { title: '⏰ Plantão', body: notif.body || '' },
          android: {
            notification: {
              tag: notif.tag || 'plantao',
              icon: 'ic_notification',
              sound: 'default',
            },
          },
          webpush: {
            notification: {
              title: '⏰ Plantão',
              body: notif.body || '',
              icon: '/icons/icon-192.png',
              tag: notif.tag || 'plantao',
            },
          },
        })
          .then(() => db.ref(`notificacoes_agendadas/${syncCode}/agendadas/${key}`).remove())
          .catch((err) => console.error(`FCM error [${syncCode}]:`, err.message))
      )
    }
  }

  await Promise.all(envios)
  return res.json({ sent: envios.length, ts: agora })
}
