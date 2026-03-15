/**
 * Global Setup — roda UMA VEZ antes de todos os testes.
 * Garante que o usuário de teste TESTE1 exista no Firebase.
 *
 * Usuário de teste:
 *   Código : TESTE1
 *   PIN    : 1234
 *   Hash   : wcoy  (hashPin('1234') do auth.js)
 *   Nome   : QA Automação
 */

const FIREBASE_URL = 'https://anotacao-hc-default-rtdb.firebaseio.com'
const CODIGO       = 'TESTE1'
const PIN_HASH     = 'wcoy'

async function globalSetup() {
  try {
    // Verifica se o usuário já existe
    const res  = await fetch(`${FIREBASE_URL}/usuarios/${CODIGO}.json`)
    const data = await res.json()

    if (data && data.pin === PIN_HASH) {
      console.log(`\n✅  Usuário de teste ${CODIGO} já existe no Firebase.\n`)
      return
    }

    // Cria o usuário
    const put = await fetch(`${FIREBASE_URL}/usuarios/${CODIGO}.json`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pin:      PIN_HASH,
        nome:     'QA Automação',
        criadoEm: 1000000000000,   // timestamp fixo — fácil de identificar no banco
      }),
    })

    if (put.ok) {
      console.log(`\n✅  Usuário ${CODIGO} criado no Firebase (PIN: 1234).\n`)
    } else {
      const txt = await put.text()
      console.warn(`\n⚠️  Não foi possível criar ${CODIGO}: ${put.status} ${txt}`)
      console.warn('    Crie manualmente pelo app (código TESTE1, PIN 1234) antes de rodar os testes.\n')
    }
  } catch (err) {
    console.warn(`\n⚠️  Erro no global-setup: ${err.message}`)
    console.warn('    Verifique sua conexão com o Firebase.\n')
  }
}

export default globalSetup
