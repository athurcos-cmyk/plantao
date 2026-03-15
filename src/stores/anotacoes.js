import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '../firebase.js'
import { ref as dbRef, push, onValue, off, remove, update } from 'firebase/database'
import { useAuthStore } from './auth.js'

const _cacheKey = code => `cache_anotacoes_${code}`
const _pendKey  = code => `pendentes_${code}`

function _lerCache(code) {
  try { return JSON.parse(localStorage.getItem(_cacheKey(code)) || '[]') } catch { return [] }
}
function _salvarCache(code, lista) {
  try { localStorage.setItem(_cacheKey(code), JSON.stringify(lista)) } catch {}
}
function _lerPendentes(code) {
  try { return JSON.parse(localStorage.getItem(_pendKey(code)) || '[]') } catch { return [] }
}
function _salvarPendentes(code, lista) {
  try { localStorage.setItem(_pendKey(code), JSON.stringify(lista)) } catch {}
}

export const useAnotacoesStore = defineStore('anotacoes', () => {
  const anotacoes = ref([])
  const pendentes = ref(0)
  let unsubscribe  = null

  function iniciar() {
    const auth = useAuthStore()
    if (!auth.syncCode) return
    const code = auth.syncCode

    // Pré-popula do cache antes da resposta do Firebase
    const cached = _lerCache(code)
    if (cached.length) anotacoes.value = cached
    pendentes.value = _lerPendentes(code).length

    const path = dbRef(db, `anotacoes/${code}`)
    unsubscribe = onValue(path, (snap) => {
      const lista = []
      snap.forEach(child => {
        lista.push({ ...child.val(), _key: child.key })
      })
      anotacoes.value = lista
      _salvarCache(code, lista)
    })
  }

  function parar() {
    if (unsubscribe) { off(dbRef(db, `anotacoes/${useAuthStore().syncCode}`)); unsubscribe = null }
    anotacoes.value = []
  }

  async function salvar({ tipo, texto, nome = '', leito = '' }) {
    const auth = useAuthStore()
    const anot = { tipo, texto, nome, leito, timestamp: Date.now() }

    if (!navigator.onLine) {
      const fila = _lerPendentes(auth.syncCode)
      fila.push(anot)
      _salvarPendentes(auth.syncCode, fila)
      pendentes.value = fila.length
      return anot
    }

    await push(dbRef(db, `anotacoes/${auth.syncCode}`), anot)
    return anot
  }

  // Chamado ao voltar online — envia fila pendente pro Firebase
  async function sincronizarPendentes() {
    const auth = useAuthStore()
    const code = auth.syncCode
    if (!code || !navigator.onLine) return 0

    const fila = _lerPendentes(code)
    if (!fila.length) return 0

    for (const anot of fila) {
      await push(dbRef(db, `anotacoes/${code}`), anot)
    }
    _salvarPendentes(code, [])
    pendentes.value = 0
    return fila.length
  }

  async function deletar(key) {
    const auth = useAuthStore()
    await remove(dbRef(db, `anotacoes/${auth.syncCode}/${key}`))
  }

  async function atualizar(key, dados) {
    const auth = useAuthStore()
    await update(dbRef(db, `anotacoes/${auth.syncCode}/${key}`), dados)
  }

  async function limparTudo() {
    const auth = useAuthStore()
    await remove(dbRef(db, `anotacoes/${auth.syncCode}`))
  }

  return { anotacoes, pendentes, iniciar, parar, salvar, sincronizarPendentes, deletar, atualizar, limparTudo }
})
