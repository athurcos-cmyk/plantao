import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db } from '../firebase.js'
import { ref as dbRef, get, set, update } from 'firebase/database'

const SESSION_DURATION_MS = 6 * 60 * 60 * 1000 // 6 horas (duração de um plantão)
const PIN_SALT_PREFIX = 'plantao_hc_2025_'

async function hashPin(pin, code) {
  // hash novo: salt = prefixo fixo + syncCode
  const salted = PIN_SALT_PREFIX + code.toUpperCase() + ':' + pin
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(salted))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

async function hashPinLegacy(pin) {
  // hash antigo: SHA-256 sem salt — usado apenas para migração
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pin))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export const useAuthStore = defineStore('auth', () => {
  const syncCode = ref(localStorage.getItem('sync_code') || '')
  const userName = ref(localStorage.getItem('user_name') || '')
  const loginTime = ref(parseInt(localStorage.getItem('login_time') || '0'))

  const isLoggedIn = computed(() => {
    if (!syncCode.value || !loginTime.value) return false
    return (Date.now() - loginTime.value) < SESSION_DURATION_MS
  })

  async function checkCode(code) {
    const snap = await get(dbRef(db, `usuarios/${code}`))
    if (snap.exists()) {
      return { exists: true, data: snap.val() }
    }
    return { exists: false }
  }

  async function register(code, pin, name) {
    const pinHash = await hashPin(pin, code)
    await set(dbRef(db, `usuarios/${code}`), {
      pin: pinHash,
      nome: name || '',
      criadoEm: Date.now()
    })
    _saveSession(code, name)
    return true
  }

  async function login(code, pin) {
    const snap = await get(dbRef(db, `usuarios/${code}`))
    if (!snap.exists()) return false
    const user = snap.val()

    const hashNovo   = await hashPin(pin, code)
    const hashAntigo = await hashPinLegacy(pin)

    if (user.pin === hashNovo) {
      // hash atual — login normal
      _saveSession(code, user.nome || '')
      return true
    }

    if (user.pin === hashAntigo) {
      // hash legado — migra silenciosamente para o novo formato
      await update(dbRef(db, `usuarios/${code}`), { pin: hashNovo })
      _saveSession(code, user.nome || '')
      return true
    }

    return false
  }

  function _saveSession(code, name) {
    const now = Date.now()
    syncCode.value = code
    userName.value = name
    loginTime.value = now
    localStorage.setItem('sync_code', code)
    localStorage.setItem('user_name', name)
    localStorage.setItem('login_time', now.toString())
  }

  function logout() {
    syncCode.value = ''
    userName.value = ''
    loginTime.value = 0
    localStorage.removeItem('sync_code')
    localStorage.removeItem('user_name')
    localStorage.removeItem('login_time')
  }

  return { syncCode, userName, isLoggedIn, checkCode, register, login, logout }
})
