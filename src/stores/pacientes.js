import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '../firebase.js'
import { ref as dbRef, push, onValue, off, remove, update } from 'firebase/database'
import { useAuthStore } from './auth.js'

const _pacCacheKey = code => `cache_pacientes_${code}`

function _lerCachePac(code) {
  try { return JSON.parse(localStorage.getItem(_pacCacheKey(code)) || '[]') } catch { return [] }
}
function _salvarCachePac(code, lista) {
  try { localStorage.setItem(_pacCacheKey(code), JSON.stringify(lista)) } catch {}
}

export const usePacientesStore = defineStore('pacientes', () => {
  const pacientes = ref([])
  let unsubscribe = null

  function iniciar() {
    if (unsubscribe) return
    const auth = useAuthStore()
    if (!auth.syncCode) return
    const code = auth.syncCode

    // Pré-popula do cache
    const cached = _lerCachePac(code)
    if (cached.length) pacientes.value = cached

    const path = dbRef(db, `pacientes/${code}`)
    unsubscribe = onValue(path, (snap) => {
      const lista = []
      snap.forEach(child => {
        const data = child.val()
        const pendencias = data.pendencias
          ? Object.entries(data.pendencias)
              .map(([k, v]) => ({ ...v, _key: k }))
              .sort((a, b) => (a.criadoEm || 0) - (b.criadoEm || 0))
          : []
        lista.push({ ...data, pendencias, _key: child.key })
      })
      lista.sort((a, b) => (a.leito || '').localeCompare(b.leito || '', undefined, { numeric: true }))
      pacientes.value = lista
      _salvarCachePac(code, lista)
    })
  }

  function parar() {
    if (unsubscribe) {
      off(dbRef(db, `pacientes/${useAuthStore().syncCode}`))
      unsubscribe = null
    }
    pacientes.value = []
  }

  async function adicionar({ nome, leito }) {
    const auth = useAuthStore()
    await push(dbRef(db, `pacientes/${auth.syncCode}`), {
      nome: nome.trim(), leito: leito.trim(), criadoEm: Date.now()
    })
  }

  async function atualizar(key, { nome, leito }) {
    const auth = useAuthStore()
    await update(dbRef(db, `pacientes/${auth.syncCode}/${key}`), {
      nome: nome.trim(), leito: leito.trim()
    })
  }

  async function excluir(key) {
    const auth = useAuthStore()
    await remove(dbRef(db, `pacientes/${auth.syncCode}/${key}`))
  }

  async function adicionarPendencia(pacKey, texto) {
    const auth = useAuthStore()
    await push(dbRef(db, `pacientes/${auth.syncCode}/${pacKey}/pendencias`), {
      texto: texto.trim(), feito: false, criadoEm: Date.now()
    })
  }

  async function togglePendencia(pacKey, pendKey, feitoAtual) {
    const auth = useAuthStore()
    await update(dbRef(db, `pacientes/${auth.syncCode}/${pacKey}/pendencias/${pendKey}`), {
      feito: !feitoAtual
    })
  }

  async function excluirPendencia(pacKey, pendKey) {
    const auth = useAuthStore()
    await remove(dbRef(db, `pacientes/${auth.syncCode}/${pacKey}/pendencias/${pendKey}`))
  }

  return {
    pacientes, iniciar, parar,
    adicionar, atualizar, excluir,
    adicionarPendencia, togglePendencia, excluirPendencia
  }
})
