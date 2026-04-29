import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db, auth as firebaseAuth, googleProvider } from '../firebase.js'
import { ref as dbRef, get, set } from 'firebase/database'
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

function _gerarSyncCodeUnico() {
  return _gerarSyncCode()
}

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
          uid.value = user.uid
          userEmail.value = user.email || ''
          userName.value = user.displayName || (_lsOk ? localStorage.getItem('user_name') || '' : '')

          const localSession = _lerSessaoCacheSegura()
          if (localSession.uid === user.uid && localSession.syncCode) {
            syncCode.value = localSession.syncCode
            _persistirSessaoSegura({
              syncCode: localSession.syncCode,
              userName: userName.value,
              userEmail: userEmail.value,
              uid: uid.value,
            })
            finalizar()
          }

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
            }
          } catch (e) {
            console.warn('[Auth] uid_map lookup failed:', e.message)
          }
        } else {
          // Sessão inexistente no Firebase Auth.
          // Pode ser: conta deletada, token revogado, ou offline (Firebase não
          // conseguiu restaurar do IndexedDB).
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
    try {
      const temVaga = await _verificarVagas()
      if (!temVaga) {
        authError.value = 'limite-atingido'
        return false
      }

      const cred = await createUserWithEmailAndPassword(firebaseAuth, email, senha)
      const user = cred.user
      const code = _gerarSyncCodeUnico()

      await Promise.all([
        nome ? updateProfile(user, { displayName: nome }) : Promise.resolve(),
        set(dbRef(db, `owners/${code}/${user.uid}`), true),
        set(dbRef(db, `uid_map/${user.uid}`), code),
        set(dbRef(db, `usuarios/${code}`), {
          nome: nome || '',
          email,
          criadoEm: Date.now(),
        }),
      ])

      uid.value = user.uid
      userEmail.value = email
      userName.value = nome || ''
      syncCode.value = code
      _persistirSessaoSegura({
        syncCode: code,
        userName: nome || '',
        userEmail: email,
        uid: user.uid,
      })

      user.getIdToken().then((token) =>
        fetch('/api/welcome', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ nome: nome || '', email, syncCode: code }),
        })
      ).catch(() => {})

      return true
    } catch (e) {
      authError.value = _traduzirErro(e.code)
      return false
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
        if (mapSnap.exists()) syncCode.value = mapSnap.val()
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
        if (mapSnap.exists()) syncCode.value = mapSnap.val()
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
      if (result?.user) {
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

  async function handleRedirectResult() {
    try {
      const result = await getRedirectResult(firebaseAuth)
      if (result?.user) {
        await _vincularGoogleSeNovo(result.user)
      }
    } catch (e) {
      console.warn('[Auth] Redirect result error:', e.code, e.message)
      authError.value = _traduzirErro(e.code)
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
    syncCode.value = ''
    userName.value = ''
    userEmail.value = ''
    uid.value = ''
    _limparSessaoSegura()
    await signOut(firebaseAuth)
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
