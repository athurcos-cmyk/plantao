/**
 * api/delete-account.js
 * Deleta todos os dados do usuário E a conta do Firebase Auth via firebase-admin.
 * firebase-admin bypassa regras de segurança do RTDB e não exige reautenticação recente.
 *
 * Auth: Bearer idToken do Firebase Auth (obrigatório)
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
    console.error('[DELETE-ACCOUNT] initAdmin failed:', e.message)
    return res.status(500).json({ error: e.message })
  }

  // Verificar token
  let uid
  try {
    const decoded = await admin.auth().verifyIdToken(idToken)
    uid = decoded.uid
  } catch (e) {
    return res.status(401).json({ error: 'Token inválido' })
  }

  const db = admin.database()

  // Buscar syncCode do uid_map (pode já ter sido deletado parcialmente)
  const mapSnap = await db.ref(`uid_map/${uid}`).get()
  if (!mapSnap.exists()) {
    console.log(`[DELETE-ACCOUNT] uid=${uid}: uid_map não encontrado — já deletado`)
    return res.json({ deleted: false, reason: 'already_deleted' })
  }

  const syncCode = mapSnap.val()
  console.log(`[DELETE-ACCOUNT] uid=${uid} syncCode=${syncCode}: iniciando exclusão`)

  // Deletar todos os caminhos — admin SDK bypassa regras de segurança
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
    `owners/${syncCode}`,   // admin bypassa a regra de escrita restrita
    `uid_map/${uid}`,
  ]

  const erros = []
  await Promise.all(
    paths.map(p =>
      db.ref(p).remove().catch(e => {
        console.error(`[DELETE-ACCOUNT] erro ao deletar ${p}:`, e.message)
        erros.push(p)
      })
    )
  )

  // Deletar conta do Firebase Auth — admin SDK não exige reautenticação recente
  try {
    await admin.auth().deleteUser(uid)
    console.log(`[DELETE-ACCOUNT] uid=${uid}: conta Auth deletada`)
  } catch (e) {
    // Se conta Auth já foi deletada por outro meio, não é erro crítico
    if (e.code !== 'auth/user-not-found') {
      console.error(`[DELETE-ACCOUNT] erro ao deletar Auth uid=${uid}:`, e.message)
      erros.push(`auth/${uid}`)
    }
  }

  console.log(`[DELETE-ACCOUNT] uid=${uid} syncCode=${syncCode}: concluído. Erros: ${erros.length}`)
  return res.json({ deleted: true, syncCode, erros })
}
