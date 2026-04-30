import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db, auth as firebaseAuth, googleProvider } from '../firebase.js'
import { ref as dbRef, get, set, update } from 'firebase/database'
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
  signInWithCustomToken,
  fetchSignInMethodsForEmail,
} from 'firebase/auth'
import { lerSessaoCache, persistirSessaoCache, limparSessaoCache } from '../utils/authSessionCache.js'

const _LIMITE_USUARIOS = 100
const AUTH_INIT_TIMEOUT_MS = 1800

async function _verificarVagas() {
  try {
    const snap = await get(dbRef(db, 'config/total_usuarios'))
    const count = snap.exists() ? snap.val() : 0
    return count < _LIMITE_USUARIOS
  } catch {
    return true
  }
}

function _testLocalStorage() {
  try {
    localStorage.setItem('__test', '1')
    localStorage.removeItem('__test')
    return true
  } catch {
    return false
  }
}

const _lsOk = _testLocalStorage()

function _lerSessaoCacheSegura() {
  return _lsOk
    ? lerSessaoCache()
    : { syncCode: '', userName: '', userEmail: '', uid: '', hasSession: false }
}

function _persistirSessaoSegura(session) {
  if (!_lsOk) return
  persistirSessaoCache(session)
}

function _limparSessaoSegura() {
  if (!_lsOk) return
  limparSessaoCache()
}

function _gerarSyncCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  const arr = crypto.getRandomValues(new Uint8Array(6))
  for (let i = 0; i < 6; i++) code += chars[arr[i] % chars.length]
  return code
}

async function _gerarSyncCodeUnico() {
  // NOTA: A regra de segurança do Firebase (owners/$code/.read) exige que o
  // uid do usuário já exista sob o código para permitir a leitura. Durante o
  // registro o uid ainda não foi associado a nenhum código, então não podemos
  // ler owners/$code para verificar disponibilidade.
  //
  // Como o espaço de códigos é grande (30^6 ≈ 729M combinações) e o número
  // de usuários é pequeno (< 100), a probabilidade de colisão é ~0.0007%.
  // Geramos o código aleatoriamente sem verificar — se por um milagre
  // colidir, o update() atômico abaixo falha e o registro é tratado como erro.
  return _gerarSyncCode()
}

// Flag para evitar que onAuthStateChanged trate registro em andamento como conta órfã
let _registrando = false

export const useAuthStore = defineStore('auth', () => {
  const cachedSession = _lerSessaoCacheSegura()

  const syncCode = ref(cachedSession.syncCode)
  const userName = ref(cachedSession.userName)
  const userEmail = ref(cachedSession.userEmail)
  const uid = ref(cachedSession.uid)
  const authReady = ref(false)
  const authError = ref('')

  const isLoggedIn = computed(() => !!uid.value && !!syncCode.value)
  const modoPrivado = !_lsOk

  let _listenerRegistrado = false
  let _readyPromise = null

  function initAuthListener() {
    if (_readyPromise) return _readyPromise

    _readyPromise = new Promise((resolve) => {
      if (_listenerRegistrado) {
        resolve()
        return
      }

      _listenerRegistrado = true
      let resolved = false

      const finalizar = () => {
        if (resolved) return
        resolved = true
        authReady.value = true
        resolve()
      }

      const startupCache = _lerSessaoCacheSegura()
      if (startupCache.hasSession) {
        uid.value = startupCache.uid
        syncCode.value = startupCache.syncCode
        userName.value = startupCache.userName
        userEmail.value = startupCache.userEmail
        finalizar()
      }

      const initTimeout = setTimeout(() => {
        console.warn('[Auth] init timeout fallback - liberando UI com cache local')
        finalizar()
      }, AUTH_INIT_TIMEOUT_MS)

      onAuthStateChanged(firebaseAuth, async (user) => {
        clearTimeout(initTimeout)

        if (user) {
          const localSession = _lerSessaoCacheSegura()

          // Cache de sessão local bate com o usuário do Firebase → restaura
          if (localSession.uid === user.uid && localSession.syncCode) {
            uid.value = localSession.uid
            userEmail.value = localSession.userEmail
            userName.value = localSession.userName
            syncCode.value = localSession.syncCode
            _persistirSessaoSegura({
              syncCode: localSession.syncCode,
              userName: localSession.userName,
              userEmail: localSession.userEmail,
              uid: localSession.uid,
            })
            finalizar()
            return
          }

          if (_registrando) {
            // Registro em andamento — uid_map ainda não foi escrito.
            // Não setar uid.value aqui: se o Firebase reverter o auth
            // (ex: erro de rede), onAuthStateChanged(null) veria uid
            // truthy e redirecionaria, matando o registro.
            finalizar()
            return
          }

          uid.value = user.uid
          userEmail.value = user.email || ''
          userName.value = user.displayName || (_lsOk ? localStorage.getItem('user_name') || '' : '')

          try {
            const mapSnap = await get(dbRef(db, `uid_map/${user.uid}`))
            if (mapSnap.exists()) {
              const code = mapSnap.val()
              syncCode.value = code

              if (!userName.value) {
                const userSnap = await get(dbRef(db, `usuarios/${code}/nome`))
                if (userSnap.exists()) userName.value = userSnap.val()
              }

              _persistirSessaoSegura({
                syncCode: code,
                userName: userName.value,
                userEmail: userEmail.value,
                uid: uid.value,
              })

              set(dbRef(db, `usuarios/${code}/ultimo_acesso`), Date.now()).catch(() => {})
            } else {
              // uid_map não existe → conta órfã (existe no Auth mas sem dados).
              // Desloga para evitar estado "meio-logado".
              console.warn('[Auth] uid_map ausente para user autenticado — limpando sessão')
              _limparSessaoSegura()
              // Fire-and-forget: signOut sem await para não causar recursão
              // no onAuthStateChanged. O handler com null cuida do redirect.
              signOut(firebaseAuth).catch(() => {})
            }
          } catch (e) {
            console.warn('[Auth] uid_map lookup failed:', e.message)
          }
        } else {
          // Sessão inexistente no Firebase Auth.
          // Pode ser: conta deletada, token revogado, ou offline (Firebase não
          // conseguiu restaurar do IndexedDB).

          if (_registrando) {
            // Registro em andamento — não deslogar nem redirecionar mesmo
            // que o Firebase tenha revertido o auth temporariamente.
            finalizar()
            return
          }

          const localSession = _lerSessaoCacheSegura()
          const temCache = localSession.hasSession

          if (temCache && !navigator.onLine) {
            // Offline: restaura do cache para funcionar sem internet.
            // Quando voltar online, onAuthStateChanged dispara de novo com o
            // user real ou null definitivo.
            uid.value = localSession.uid
            syncCode.value = localSession.syncCode
            userName.value = localSession.userName
            userEmail.value = localSession.userEmail
          } else if (!!uid.value) {
            // Só desloga se não tem cache E estava logado
            uid.value = ''
            userEmail.value = ''
            syncCode.value = ''
            userName.value = ''
            _limparSessaoSegura()
            window.location.replace('/')
          } else {
            uid.value = ''
            userEmail.value = ''
            syncCode.value = ''
            userName.value = ''
            _limparSessaoSegura()
          }
        }

        finalizar()
      })
    })

    return _readyPromise
  }

  async function register(email, senha, nome) {
    authError.value = ''
    _registrando = true
    try {
      const temVaga = await _verificarVagas()
      if (!temVaga) {
        authError.value = 'limite-atingido'
        return false
      }

      const cred = await createUserWithEmailAndPassword(firebaseAuth, email, senha)
      const usr = cred.user
      let code

      code = await _gerarSyncCodeUnico()

      // Escrita em 2 passos porque a regra de segurança do Firebase
      // avalia cada caminho contra o estado ATUAL (não o final simulado).
      // usuarios/$code/.write checa owners/$code/$uid — que não existe até
      // o passo 1 ser commitado.
      //
      // Passo 1: owners + uid_map (auth.uid === $uid → passa direto)
      await update(dbRef(db), {
        [`owners/${code}/${usr.uid}`]: true,
        [`uid_map/${usr.uid}`]: code,
      })

      // Passo 2: usuarios (owners/$code/$uid existe agora → regra passa)
      try {
        await set(dbRef(db, `usuarios/${code}`), {
          nome: nome || '', email, criadoEm: Date.now(),
        })
      } catch (e) {
        // Passo 2 falhou → rollback do passo 1 + deletar Auth user
        const rollback = {}
        rollback[`owners/${code}/${usr.uid}`] = null
        rollback[`uid_map/${usr.uid}`] = null
        await update(dbRef(db, rollback)).catch(() => {})
        try { await usr.delete() } catch {}
        throw e
      }

      // DisplayName no Firebase Auth (best-effort, independente do RTDB)
      if (nome) {
        try { await updateProfile(usr, { displayName: nome }) } catch {}
      }

      uid.value = usr.uid
      userEmail.value = email
      userName.value = nome || ''
      syncCode.value = code
      _persistirSessaoSegura({
        syncCode: code,
        userName: nome || '',
        userEmail: email,
        uid: usr.uid,
      })

      usr.getIdToken().then((token) =>
        fetch('/api/welcome', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ nome: nome || '', email, syncCode: code }),
        })
      ).catch(() => {})

      return true
    } catch (e) {
      console.error('[Auth] register error:', e.code || e.message, e.message)
      if (e.code === 'auth/email-already-in-use') {
        try {
          const methods = await fetchSignInMethodsForEmail(firebaseAuth, email)
          if (methods.includes('google.com')) {
            authError.value = 'Este email já está cadastrado com Google. Faça login com Google e vá em Configurações para criar uma senha.'
          } else {
            authError.value = 'Este email já está cadastrado. Faça login com sua senha.'
          }
        } catch {
          authError.value = 'Este email já está cadastrado.'
        }
      } else {
        authError.value = _traduzirErro(e.code)
      }
      return false
    } finally {
      _registrando = false
    }
  }

  async function login(email, senha) {
    authError.value = ''
    try {
      const cred = await signInWithEmailAndPassword(firebaseAuth, email, senha)
      const user = cred.user
      uid.value = user.uid
      userEmail.value = user.email || ''
      userName.value = user.displayName || (_lsOk ? localStorage.getItem('user_name') || '' : '')

      const localSession = _lerSessaoCacheSegura()
      if (localSession.uid === user.uid && localSession.syncCode) {
        syncCode.value = localSession.syncCode
      } else {
        const mapSnap = await get(dbRef(db, `uid_map/${user.uid}`))
        if (!mapSnap.exists()) {
          // Conta órfã: existe no Auth mas sem RTDB (ex: register() falhou na escrita).
          // Remove o Auth user e mostra erro em vez de deixar o usuário preso.
          try { await user.delete() } catch {}
          throw { code: 'auth/orphan-account' }
        }
        syncCode.value = mapSnap.val()
      }

      _persistirSessaoSegura({
        syncCode: syncCode.value,
        userName: userName.value,
        userEmail: userEmail.value,
        uid: user.uid,
      })

      return true
    } catch (e) {
      authError.value = _traduzirErro(e.code)
      return false
    }
  }

  async function loginComCustomToken(customToken) {
    authError.value = ''
    try {
      const cred = await signInWithCustomToken(firebaseAuth, customToken)
      const user = cred.user
      uid.value = user.uid
      userEmail.value = user.email || ''
      userName.value = user.displayName || (_lsOk ? localStorage.getItem('user_name') || '' : '')

      const localSession = _lerSessaoCacheSegura()
      if (localSession.uid === user.uid && localSession.syncCode) {
        syncCode.value = localSession.syncCode
      } else {
        const mapSnap = await get(dbRef(db, `uid_map/${user.uid}`))
        if (!mapSnap.exists()) {
          try { await user.delete() } catch {}
          throw { code: 'auth/orphan-account' }
        }
        syncCode.value = mapSnap.val()
      }

      _persistirSessaoSegura({
        syncCode: syncCode.value,
        userName: userName.value,
        userEmail: userEmail.value,
        uid: user.uid,
      })

      return true
    } catch (e) {
      authError.value = _traduzirErro(e.code)
      return false
    }
  }

  async function loginGoogle() {
    authError.value = ''
    _registrando = true
    let result

    try {
      result = await signInWithPopup(firebaseAuth, googleProvider)
    } catch (e) {
      if (
        e.code === 'auth/popup-blocked' ||
        e.code === 'auth/popup-closed-by-user' ||
        e.code === 'auth/cancelled-popup-request'
      ) {
        try {
          await signInWithRedirect(firebaseAuth, googleProvider)
          return true
        } catch (e2) {
          console.error('[Auth] Google redirect error:', e2.code, e2.message)
          authError.value = _traduzirErro(e2.code)
          return false
        }
      }

      if (e.code === 'auth/account-exists-with-different-credential') {
        const email = e.customData?.email || 'Este email'
        console.warn('[Auth] Google email já tem senha:', email)
        authError.value = `"${email}" já possui cadastro com senha. Faça login com email e senha, depois vincule o Google nas Configurações.`
        return false
      }

      console.error('[Auth] Google popup error:', e.code, e.message)
      authError.value = _traduzirErro(e.code)
      return false
    }

    try {
      if (!result?.user) {
        authError.value = 'Erro ao autenticar com Google. Tente novamente.'
        return false
      }

      const code = await _vincularGoogleSeNovo(result.user)
      if (!code) return false

      uid.value = result.user.uid
      userEmail.value = result.user.email || ''
      userName.value = result.user.displayName || ''
      syncCode.value = code
      _persistirSessaoSegura({
        syncCode: code,
        userName: userName.value,
        userEmail: userEmail.value,
        uid: result.user.uid,
      })

      return true
    } catch (e) {
      if (e.code === 'limite-atingido') {
        authError.value = _traduzirErro('auth/limite-usuarios')
        return false
      }

      console.error('[Auth] Google vinculação error:', e.code || '', e.message)
      authError.value = 'Conta Google autenticada, mas houve erro ao criar perfil. Tente novamente.'
      return false
    } finally {
      _registrando = false
    }
  }

  async function handleRedirectResult() {
    _registrando = true
    try {
      const result = await getRedirectResult(firebaseAuth)
      if (!result?.user) return

      const code = await _vincularGoogleSeNovo(result.user)
      if (!code) {
        // Limite de usuários ou erro no RTDB — desloga para não deixar órfão
        await signOut(firebaseAuth).catch(() => {})
        return
      }

      uid.value = result.user.uid
      userEmail.value = result.user.email || ''
      userName.value = result.user.displayName || ''
      syncCode.value = code
      _persistirSessaoSegura({
        syncCode: code,
        userName: userName.value,
        userEmail: userEmail.value,
        uid: result.user.uid,
      })
    } catch (e) {
      console.warn('[Auth] Redirect result error:', e.code, e.message)
      authError.value = _traduzirErro(e.code)
      signOut(firebaseAuth).catch(() => {})
    } finally {
      _registrando = false
    }
  }

  async function _vincularGoogleSeNovo(user) {
    const mapSnap = await get(dbRef(db, `uid_map/${user.uid}`))
    if (mapSnap.exists()) {
      const code = mapSnap.val()
      const ownerSnap = await get(dbRef(db, `owners/${code}/${user.uid}`))
      if (ownerSnap.exists()) return code
      console.warn('[Auth] uid_map encontrado mas owners ausente - nova conta')
    }

    const temVaga = await _verificarVagas()
    if (!temVaga) throw { code: 'limite-atingido' }

    const code = await _gerarSyncCodeUnico()

    // Passo 1: owners + uid_map (auth.uid === $uid → passa)
    await update(dbRef(db), {
      [`owners/${code}/${user.uid}`]: true,
      [`uid_map/${user.uid}`]: code,
    })

    // Passo 2: usuarios (owners/$code/$uid existe agora → regra passa)
    try {
      await set(dbRef(db, `usuarios/${code}`), {
        nome: user.displayName || '', email: user.email || '', criadoEm: Date.now(),
      })
    } catch (e) {
      // Rollback do passo 1
      const rollback = {}
      rollback[`owners/${code}/${user.uid}`] = null
      rollback[`uid_map/${user.uid}`] = null
      await update(dbRef(db, rollback)).catch(() => {})
      throw e
    }

    user.getIdToken().then((token) =>
      fetch('/api/welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ nome: user.displayName || '', email: user.email || '', syncCode: code }),
      })
    ).catch(() => {})

    return code
  }

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

  async function logout() {
    // signOut primeiro (pode falhar), só limpa store depois
    try { await signOut(firebaseAuth) } catch {}
    syncCode.value = ''
    userName.value = ''
    userEmail.value = ''
    uid.value = ''
    _limparSessaoSegura()
  }

  function _traduzirErro(code) {
    const erros = {
      'auth/email-already-in-use': 'Este email já está cadastrado.',
      'auth/invalid-email': 'Email inválido.',
      'auth/weak-password': 'Senha muito fraca - mínimo 8 caracteres.',
      'auth/user-not-found': 'Email não encontrado.',
      'auth/wrong-password': 'Senha incorreta.',
      'auth/invalid-credential': 'Email ou senha incorretos.',
      'auth/too-many-requests': 'Muitas tentativas. Aguarde um momento.',
      'auth/network-request-failed': 'Sem conexão com a internet.',
      'auth/popup-blocked': 'Popup bloqueado - tente novamente.',
      'auth/popup-closed-by-user': 'Login cancelado.',
      'auth/account-exists-with-different-credential': 'Este email já está cadastrado com outro método de login (senha ou Google). Faça login com o método que você usou ao criar a conta.',
      'auth/orphan-account': 'Houve um erro ao criar sua conta. Tente novamente.',
      'auth/limite-usuarios': 'Limite de cadastros atingido no momento. Tente novamente mais tarde.',
      'limite-atingido': 'Limite de cadastros atingido no momento. Tente novamente mais tarde.',
      'auth/operation-not-allowed': 'Cadastro por email/senha desabilitado. Contate o suporte.',
      'auth/unauthorized-domain': 'Domínio não autorizado para login. Contate o suporte.',
      'auth/quota-exceeded': 'Limite de criação de contas excedido. Tente novamente mais tarde.',
      'auth/user-disabled': 'Esta conta foi desabilitada. Contate o suporte.',
      'auth/credential-already-in-use': 'Esta credencial já está vinculada a outra conta.',
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
    loginComCustomToken,
    loginGoogle,
    handleRedirectResult,
    recuperarSenha,
    logout,
  }
})
