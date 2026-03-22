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

// Gera syncCode único verificando no Firebase
async function _gerarSyncCodeUnico() {
  for (let i = 0; i < 10; i++) {
    const code = _gerarSyncCode()
    const snap = await get(dbRef(db, `usuarios/${code}`))
    if (!snap.exists()) return code
  }
  throw new Error('Não foi possível gerar um código único')
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
  // Chamado uma vez no App.vue para restaurar sessão automaticamente
  function initAuthListener() {
    return new Promise((resolve) => {
      onAuthStateChanged(firebaseAuth, async (user) => {
        if (user) {
          uid.value = user.uid
          userEmail.value = user.email || ''
          userName.value = user.displayName || ''

          // Buscar syncCode vinculado a este uid
          const mapSnap = await get(dbRef(db, `uid_map/${user.uid}`))
          if (mapSnap.exists()) {
            const code = mapSnap.val()
            syncCode.value = code
            if (_lsOk) {
              localStorage.setItem('sync_code', code)
              localStorage.setItem('user_name', userName.value)
            }

            // Buscar nome do perfil do Firebase se não tiver no Auth
            if (!userName.value) {
              const userSnap = await get(dbRef(db, `usuarios/${code}/nome`))
              if (userSnap.exists()) {
                userName.value = userSnap.val()
                if (_lsOk) localStorage.setItem('user_name', userName.value)
              }
            }
          }
        } else {
          uid.value = ''
          userEmail.value = ''
          syncCode.value = ''
          userName.value = ''
          if (_lsOk) {
            localStorage.removeItem('sync_code')
            localStorage.removeItem('user_name')
            localStorage.removeItem('login_time')
          }
        }
        authReady.value = true
        resolve()
      })
    })
  }

  // ─── Registro com email/senha ───
  async function register(email, senha, nome) {
    authError.value = ''
    try {
      const cred = await createUserWithEmailAndPassword(firebaseAuth, email, senha)
      const user = cred.user

      // Atualizar displayName no Firebase Auth
      if (nome) await updateProfile(user, { displayName: nome })

      // Gerar syncCode único
      const code = await _gerarSyncCodeUnico()

      // Criar mapeamentos
      await set(dbRef(db, `owners/${code}/${user.uid}`), true)
      await set(dbRef(db, `uid_map/${user.uid}`), code)
      await set(dbRef(db, `usuarios/${code}`), {
        nome: nome || '',
        email: email,
        criadoEm: Date.now(),
      })

      // Estado local
      uid.value = user.uid
      userEmail.value = email
      userName.value = nome || ''
      syncCode.value = code
      if (_lsOk) {
        localStorage.setItem('sync_code', code)
        localStorage.setItem('user_name', nome || '')
      }
      return true
    } catch (e) {
      authError.value = _traduzirErro(e.code)
      return false
    }
  }

  // ─── Login com email/senha ───
  async function login(email, senha) {
    authError.value = ''
    try {
      await signInWithEmailAndPassword(firebaseAuth, email, senha)
      // onAuthStateChanged vai preencher o estado
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
    try {
      const result = await signInWithPopup(firebaseAuth, googleProvider)
      // Popup deu certo — vincular conta se for primeiro acesso
      if (result && result.user) {
        await _vincularGoogleSeNovo(result.user)
      }
      return true
    } catch (e) {
      // Popup bloqueado ou indisponível → tenta redirect
      if (e.code === 'auth/popup-blocked' || e.code === 'auth/popup-closed-by-user'
          || e.code === 'auth/cancelled-popup-request') {
        try {
          await signInWithRedirect(firebaseAuth, googleProvider)
          return true
        } catch (e2) {
          authError.value = _traduzirErro(e2.code)
          return false
        }
      }
      console.error('[Auth] Google login error:', e.code, e.message)
      authError.value = _traduzirErro(e.code)
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

  // Cria syncCode e mapeamentos se for primeiro login Google
  async function _vincularGoogleSeNovo(user) {
    const mapSnap = await get(dbRef(db, `uid_map/${user.uid}`))
    if (!mapSnap.exists()) {
      const code = await _gerarSyncCodeUnico()
      await set(dbRef(db, `owners/${code}/${user.uid}`), true)
      await set(dbRef(db, `uid_map/${user.uid}`), code)
      await set(dbRef(db, `usuarios/${code}`), {
        nome: user.displayName || '',
        email: user.email || '',
        criadoEm: Date.now(),
      })
    }
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
    await signOut(firebaseAuth)
    syncCode.value = ''
    userName.value = ''
    userEmail.value = ''
    uid.value = ''
    if (_lsOk) {
      localStorage.removeItem('sync_code')
      localStorage.removeItem('user_name')
      localStorage.removeItem('login_time')
    }
  }

  // ─── Traduzir erros do Firebase Auth ───
  function _traduzirErro(code) {
    const erros = {
      'auth/email-already-in-use': 'Este email já está cadastrado.',
      'auth/invalid-email': 'Email inválido.',
      'auth/weak-password': 'Senha muito fraca — mínimo 6 caracteres.',
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
