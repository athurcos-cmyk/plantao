/**
 * api/admin-delete-user.js
 * Deleta TODOS os dados de um usuário via firebase-admin (acionado pelo admin).
 * Mesma lógica do delete-account.js, mas o admin fornece o uid alvo.
 *
 * Auth: Bearer idToken do admin (a.thurcos@gmail.com)
 * Body: { uid: string }  — uid do usuário a ser excluído
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

  const authHeader = req.headers.authorization || ''
  const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  if (!idToken) return res.status(401).json({ error: 'Unauthorized' })

  try {
    initAdmin()
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }

  try {
    const decoded = await admin.auth().verifyIdToken(idToken)
    if (decoded.email !== ADMIN_EMAIL) {
      return res.status(403).json({ error: 'Forbidden' })
    }
  } catch {
    return res.status(401).json({ error: 'Token inválido' })
  }

  const { uid: targetUid } = req.body || {}
  if (!targetUid) return res.status(400).json({ error: 'uid obrigatório' })

  const db = admin.database()

  const mapSnap = await db.ref(`uid_map/${targetUid}`).get()
  if (!mapSnap.exists()) {
    return res.json({ deleted: false, reason: 'already_deleted' })
  }

  const syncCode = mapSnap.val()
  console.log(`[ADMIN-DELETE] targetUid=${targetUid} syncCode=${syncCode}: iniciando exclusão`)

  const paths = [
    `usuarios/${syncCode}`,
    `anotacoes/${syncCode}`,
    `anotacoes_hc/${syncCode}`,
    `pacientes/${syncCode}`,
    `organizador/${syncCode}`,
    `encaminhamento/${syncCode}`,
    `livres/${syncCode}`,
    `curativo/${syncCode}`,
    `fcm_tokens/${syncCode}`,
    `push_subscriptions/${syncCode}`,
    `notificacoes_agendadas/${syncCode}`,
    `configuracoes/${syncCode}`,
    `feedback/${syncCode}`,
    `owners/${syncCode}`,
    `uid_map/${targetUid}`,
  ]

  const erros = []
  await Promise.all(
    paths.map(p =>
      db.ref(p).remove().catch(e => {
        console.error(`[ADMIN-DELETE] erro ao deletar ${p}:`, e.message)
        erros.push(p)
      })
    )
  )

  try {
    await admin.auth().deleteUser(targetUid)
    console.log(`[ADMIN-DELETE] targetUid=${targetUid}: conta Auth deletada`)
  } catch (e) {
    if (e.code !== 'auth/user-not-found') {
      console.error(`[ADMIN-DELETE] erro ao deletar Auth uid=${targetUid}:`, e.message)
      erros.push(`auth/${targetUid}`)
    }
  }

  db.ref('config/total_usuarios').transaction(count => {
    if (count === null) return 0
    return Math.max(0, count - 1)
  }).catch(e => console.warn('[ADMIN-DELETE] erro ao decrementar contador:', e.message))

  console.log(`[ADMIN-DELETE] concluído. Erros: ${erros.length}`)
  return res.json({ deleted: true, syncCode, erros })
}
