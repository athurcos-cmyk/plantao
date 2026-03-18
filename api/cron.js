/**
 * api/cron.js — Vercel Cron Job (chamado pelo cron-job.org a cada minuto)
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
  // Autenticação via CRON_SECRET
  const secret = process.env.CRON_SECRET
  if (secret && req.headers.authorization !== `Bearer ${secret}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    initAdmin()
  } catch (e) {
    console.error('[CRON] initAdmin falhou:', e.message)
    return res.status(500).json({ error: e.message })
  }

  const db = admin.database()
  const agora = Date.now()
  console.log('[CRON] iniciando, agora =', agora, new Date(agora).toISOString())

  // Lê todas as notificações agendadas
  const snap = await db.ref('notificacoes_agendadas').get()
  if (!snap.exists()) {
    console.log('[CRON] nenhuma notificação agendada no Firebase')
    return res.json({ sent: 0, agora })
  }

  const data = snap.val()
  console.log('[CRON] syncCodes encontrados:', Object.keys(data))

  const envios = []
  const erros = []

  for (const [syncCode, entry] of Object.entries(data)) {
    if (!entry?.agendadas) {
      console.log(`[CRON] ${syncCode}: sem campo agendadas`)
      continue
    }

    // Busca o token FCM deste usuário
    const tokenSnap = await db.ref(`fcm_tokens/${syncCode}`).get()
    if (!tokenSnap.exists()) {
      console.log(`[CRON] ${syncCode}: sem token FCM`)
      continue
    }
    const token = tokenSnap.val()
    console.log(`[CRON] ${syncCode}: token encontrado (${token.slice(0, 20)}...)`)

    for (const [key, notif] of Object.entries(entry.agendadas)) {
      console.log(`[CRON] ${syncCode}/${key}: timestamp=${notif.timestamp}, agora=${agora}, pendente=${notif.timestamp > agora}`)

      if (!notif?.timestamp || notif.timestamp > agora) continue

      console.log(`[CRON] ${syncCode}/${key}: enviando FCM — "${notif.body}"`)

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
          .then((msgId) => {
            console.log(`[CRON] ${syncCode}/${key}: FCM enviado OK, msgId=${msgId}`)
            return db.ref(`notificacoes_agendadas/${syncCode}/agendadas/${key}`).remove()
          })
          .catch((err) => {
            console.error(`[CRON] ${syncCode}/${key}: FCM ERRO — ${err.message}`)
            erros.push({ syncCode, key, error: err.message })
          })
      )
    }
  }

  await Promise.all(envios)
  console.log('[CRON] concluído, enviados:', envios.length, 'erros:', erros.length)
  return res.json({ sent: envios.length, erros, agora })
}
