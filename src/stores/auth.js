import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db, auth as firebaseAuth, googleProvider } from '../firebase.js'
import { ref as dbRef, get, set, increment, update } from 'firebase/database'

const _LIMITE_USUARIOS = 100

async function _verificarVagas() {
  try {
    const snap = await get(dbRef(db, 'config/total_usuarios'))
    const count = snap.exists() ? snap.val() : 0
    return count < _LIMITE_USUARIOS
  } catch {
    return true // se falhar a leitura, não bloqueia o cadastro
  }
}
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth'

// iOS Safari modo privado lança QuotaExceededError no localStorage
function _testLocalStorage() {
  try {
    localStorage.setItem('__test', '1')
    localStorage.removeItem('__test')
    return true
  } catch { return false }
}
const _lsOk = _testLocalStorage()

// Gera syncCode aleatório de 6 chars alfanuméricos
function _gerarSyncCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // sem I/O/0/1 para evitar confusão
  let code = ''
  const arr = crypto.getRandomValues(new Uint8Array(6))
  for (let i = 0; i < 6; i++) code += chars[arr[i] % chars.length]
  return code
}

// Gera syncCode único.
// Com 31^6 ≈ 887 milhões de combinações e crypto.getRandomValues,
// a chance de colisão é desprezível para a escala do app.
function _gerarSyncCodeUnico() {
  return _gerarSyncCode()
}

export const useAuthStore = defineStore('auth', () => {
  const syncCode = ref(_lsOk ? (localStorage.getItem('sync_code') || '') : '')
  const userName = ref(_lsOk ? (localStorage.getItem('user_name') || '') : '')
  const userEmail = ref('')
  const uid = ref('')
  const authReady = ref(false)
  const authError = ref('')

  const isLoggedIn = computed(() => !!uid.value && !!syncCode.value)

  // Expõe se localStorage está disponível
  const modoPrivado = !_lsOk

  // ─── Listener de estado do Firebase Auth ───
  // Chamado no router guard e no App.vue — guard garante registro único.
  // Otimização de velocidade:
  //   Usuário voltando ao app → usa sync_code do localStorage imediatamente
  //   (authReady=true na hora) e verifica no Firebase DB em background.
  //   Usuário novo (sem cache) → aguarda DB lookup normalmente.
  let _listenerRegistrado = false
  let _readyPromise = null
  function initAuthListener() {
    if (_readyPromise) return _readyPromise
    _readyPromise = new Promise((resolve) => {
      if (_listenerRegistrado) { resolve(); return }
      _listenerRegistrado = true
      onAuthStateChanged(firebaseAuth, async (user) => {
        if (user) {
          uid.value = user.uid
          userEmail.value = user.email || ''
          userName.value = user.displayName || (_lsOk ? localStorage.getItem('user_name') || '' : '')

          // Retorno rápido: se localStorage já tem o syncCode, marca pronto imediatamente.
          // A verificação no Firebase DB segue em background — sem bloquear a UI.
          const cachedCode = _lsOk ? localStorage.getItem('sync_code') : null
          if (cachedCode) {
            syncCode.value = cachedCode
            if (!authReady.value) { authReady.value = true; resolve() }
          }

          // Verificar/atualizar syncCode no Firebase DB (background para usuários com cache,
          // bloqueante para usuários sem cache — ex: primeiro login em dispositivo novo)
          try {
            const mapSnap = await get(dbRef(db, `uid_map/${user.uid}`))
            if (mapSnap.exists()) {
              const code = mapSnap.val()
              syncCode.value = code
              if (_lsOk) {
                localStorage.setItem('sync_code', code)
                localStorage.setItem('user_name', userName.value)
              }

              // Buscar nome do perfil do Firebase se não tiver no Auth nem no cache
              if (!userName.value) {
                const userSnap = await get(dbRef(db, `usuarios/${code}/nome`))
                if (userSnap.exists()) {
                  userName.value = userSnap.val()
                  if (_lsOk) localStorage.setItem('user_name', userName.value)
                }
              }
            }
          } catch (e) {
            // DB lookup falhou (offline ou rede lenta) — mantém cache do localStorage
            console.warn('[Auth] uid_map lookup failed:', e.message)
          }
        } else {
          // Evita flicker no carregamento inicial: onAuthStateChanged pode disparar
          // null temporário antes de disparar com o user válido.
          // MAS se uid.value já estava setado, é logout real (manual ou conta deletada
          // em outro dispositivo) — limpa tudo e recarrega.
          const hasCachedSession = _lsOk && localStorage.getItem('sync_code')
          const eraLogado = !!uid.value

          if (eraLogado) {
            // Sessão encerrada enquanto app estava aberto (logout remoto ou conta excluída)
            uid.value = ''
            userEmail.value = ''
            syncCode.value = ''
            userName.value = ''
            if (_lsOk) {
              localStorage.removeItem('sync_code')
              localStorage.removeItem('user_name')
              localStorage.removeItem('login_time')
            }
            // Recarrega a página para limpar todo estado Vue/Pinia/listeners/FCM
            window.location.replace('/')
          } else if (!hasCachedSession) {
            // Carregamento inicial sem cache — limpa estado normalmente
            uid.value = ''
            userEmail.value = ''
            syncCode.value = ''
            userName.value = ''
          }
        }
        // Resolve para usuários sem cache (com cache já resolveu acima)
        if (!authReady.value) { authReady.value = true; resolve() }
      })
    })
    return _readyPromise
  }

  // ─── Registro com email/senha ───
  async function register(email, senha, nome) {
    authError.value = ''
    try {
      const temVaga = await _verificarVagas()
      if (!temVaga) {
        authError.value = 'limite-atingido'
        return false
      }
      const cred = await createUserWithEmailAndPassword(firebaseAuth, email, senha)
      const user = cred.user

      // Gerar syncCode único
      const code = _gerarSyncCodeUnico()

      // Criar mapeamentos + atualizar displayName em paralelo (salva ~400-600ms)
      await Promise.all([
        nome ? updateProfile(user, { displayName: nome }) : Promise.resolve(),
        set(dbRef(db, `owners/${code}/${user.uid}`), true),
        set(dbRef(db, `uid_map/${user.uid}`), code),
        set(dbRef(db, `usuarios/${code}`), {
          nome: nome || '',
          email: email,
          criadoEm: Date.now(),
        }),
      ])

      // Estado local
      uid.value = user.uid
      userEmail.value = email
      userName.value = nome || ''
      syncCode.value = code
      if (_lsOk) {
        localStorage.setItem('sync_code', code)
        localStorage.setItem('user_name', nome || '')
      }

      // Email de boas-vindas (fire-and-forget — não bloqueia o cadastro)
      fetch('/api/welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: nome || '', email, syncCode: code }),
      }).catch(() => {})

      // Incrementar contador de usuários
      update(dbRef(db, 'config'), { total_usuarios: increment(1) }).catch(() => {})

      return true
    } catch (e) {
      authError.value = _traduzirErro(e.code)
      return false
    }
  }

  // ─── Login com email/senha ───
  // Seta uid + syncCode imediatamente ao retornar (sem depender de onAuthStateChanged).
  // Assim isLoggedIn = true quando login() retorna true → redirect sem setTimeout.
  async function login(email, senha) {
    authError.value = ''
    try {
      const cred = await signInWithEmailAndPassword(firebaseAuth, email, senha)
      const user = cred.user
      uid.value = user.uid
      userEmail.value = user.email || ''
      userName.value = user.displayName || (_lsOk ? localStorage.getItem('user_name') || '' : '')

      // Buscar syncCode (usa cache do localStorage para retornos rápidos)
      const cachedCode = _lsOk ? localStorage.getItem('sync_code') : null
      if (cachedCode) {
        syncCode.value = cachedCode
      } else {
        const mapSnap = await get(dbRef(db, `uid_map/${user.uid}`))
        if (mapSnap.exists()) {
          const code = mapSnap.val()
          syncCode.value = code
          if (_lsOk) {
            localStorage.setItem('sync_code', code)
            localStorage.setItem('user_name', userName.value)
          }
        }
      }
      return true
    } catch (e) {
      authError.value = _traduzirErro(e.code)
      return false
    }
  }

  // ─── Login com Google ───
  // Tenta popup primeiro (funciona na maioria dos casos).
  // Se popup for bloqueado, cai em redirect.
  async function loginGoogle() {
    authError.value = ''
    let result
    try {
      result = await signInWithPopup(firebaseAuth, googleProvider)
    } catch (e) {
      // Popup bloqueado ou indisponível → tenta redirect
      if (e.code === 'auth/popup-blocked' || e.code === 'auth/popup-closed-by-user'
          || e.code === 'auth/cancelled-popup-request') {
        try {
          await signInWithRedirect(firebaseAuth, googleProvider)
          return true
        } catch (e2) {
          console.error('[Auth] Google redirect error:', e2.code, e2.message)
          authError.value = _traduzirErro(e2.code)
          return false
        }
      }
      console.error('[Auth] Google popup error:', e.code, e.message)
      authError.value = _traduzirErro(e.code)
      return false
    }

    // Popup deu certo — vincular conta se for primeiro acesso e setar estado imediatamente
    try {
      if (result && result.user) {
        const code = await _vincularGoogleSeNovo(result.user)
        if (!code) return false
        // Seta estado sem esperar onAuthStateChanged → redirect imediato
        uid.value = result.user.uid
        userEmail.value = result.user.email || ''
        userName.value = result.user.displayName || ''
        syncCode.value = code
        if (_lsOk) {
          localStorage.setItem('sync_code', code)
          localStorage.setItem('user_name', userName.value)
        }
      }
      return true
    } catch (e) {
      if (e.code === 'limite-atingido') {
        authError.value = 'limite-atingido'
        return false
      }
      console.error('[Auth] Google vinculação error:', e.code || '', e.message)
      authError.value = 'Conta Google autenticada, mas houve erro ao criar perfil. Tente novamente.'
      return false
    }
  }

  // Processa resultado do redirect do Google (chamado no reload após redirect)
  async function handleRedirectResult() {
    try {
      const result = await getRedirectResult(firebaseAuth)
      if (result && result.user) {
        await _vincularGoogleSeNovo(result.user)
      }
    } catch (e) {
      console.warn('[Auth] Redirect result error:', e.code, e.message)
      authError.value = _traduzirErro(e.code)
    }
  }

  // Cria syncCode e mapeamentos se for primeiro login Google.
  // Retorna o syncCode (existente ou recém-criado).
  async function _vincularGoogleSeNovo(user) {
    const mapSnap = await get(dbRef(db, `uid_map/${user.uid}`))
    if (mapSnap.exists()) {
      const code = mapSnap.val()
      // Verificar se owners ainda existe (conta pode ter sido excluída mas uid_map sobrou)
      const ownerSnap = await get(dbRef(db, `owners/${code}/${user.uid}`))
      if (ownerSnap.exists()) {
        return code // conta existente e válida
      }
      // uid_map existe mas owners não — dados de conta excluída, tratar como novo usuário
      console.warn('[Auth] uid_map encontrado mas owners ausente — nova conta')
    }
    // Novo usuário — verificar limite antes de criar
    const temVaga = await _verificarVagas()
    if (!temVaga) {
      throw { code: 'limite-atingido' }
    }
    const code = _gerarSyncCodeUnico()
    await Promise.all([
      set(dbRef(db, `owners/${code}/${user.uid}`), true),
      set(dbRef(db, `uid_map/${user.uid}`), code),
      set(dbRef(db, `usuarios/${code}`), {
        nome: user.displayName || '',
        email: user.email || '',
        criadoEm: Date.now(),
      }),
    ])
    // Email de boas-vindas (fire-and-forget)
    fetch('/api/welcome', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: user.displayName || '', email: user.email || '', syncCode: code }),
    }).catch(() => {})
    // Incrementar contador de usuários
    update(dbRef(db, 'config'), { total_usuarios: increment(1) }).catch(() => {})
    return code
  }

  // ─── Recuperar senha ───
  async function recuperarSenha(email) {
    authError.value = ''
    try {
      await sendPasswordResetEmail(firebaseAuth, email)
      return true
    } catch (e) {
      authError.value = _traduzirErro(e.code)
      return false
    }
  }

  // ─── Logout ───
  async function logout() {
    // Limpar localStorage ANTES do signOut para que o guard no onAuthStateChanged
    // reconheça que é um logout real (sem cache) e limpe o estado corretamente.
    syncCode.value = ''
    userName.value = ''
    userEmail.value = ''
    uid.value = ''
    if (_lsOk) {
      localStorage.removeItem('sync_code')
      localStorage.removeItem('user_name')
      localStorage.removeItem('login_time')
    }
    await signOut(firebaseAuth)
  }

  // ─── Traduzir erros do Firebase Auth ───
  function _traduzirErro(code) {
    const erros = {
      'auth/email-already-in-use': 'Este email já está cadastrado.',
      'auth/invalid-email': 'Email inválido.',
      'auth/weak-password': 'Senha muito fraca — mínimo 8 caracteres.',
      'auth/user-not-found': 'Email não encontrado.',
      'auth/wrong-password': 'Senha incorreta.',
      'auth/invalid-credential': 'Email ou senha incorretos.',
      'auth/too-many-requests': 'Muitas tentativas. Aguarde um momento.',
      'auth/network-request-failed': 'Sem conexão com a internet.',
      'auth/popup-blocked': 'Popup bloqueado — tente novamente.',
      'auth/popup-closed-by-user': 'Login cancelado.',
    }
    return erros[code] || 'Erro ao autenticar. Tente novamente.'
  }

  return {
    syncCode,
    userName,
    userEmail,
    uid,
    authReady,
    authError,
    isLoggedIn,
    modoPrivado,
    initAuthListener,
    register,
    login,
    loginGoogle,
    handleRedirectResult,
    recuperarSenha,
    logout,
  }
})
