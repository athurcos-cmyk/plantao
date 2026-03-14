import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '../firebase.js'
import { ref as dbRef, push, onValue, off, remove, update } from 'firebase/database'
import { useAuthStore } from './auth.js'

export const useAnotacoesStore = defineStore('anotacoes', () => {
  const anotacoes = ref([])
  let unsubscribe = null

  function iniciar() {
    const auth = useAuthStore()
    if (!auth.syncCode) return

    const path = dbRef(db, `anotacoes/${auth.syncCode}`)
    unsubscribe = onValue(path, (snap) => {
      const lista = []
      snap.forEach(child => {
        lista.push({ ...child.val(), _key: child.key })
      })
      anotacoes.value = lista
    })
  }

  function parar() {
    if (unsubscribe) { off(dbRef(db, `anotacoes/${useAuthStore().syncCode}`)); unsubscribe = null }
    anotacoes.value = []
  }

  async function salvar({ tipo, texto, nome = '', leito = '' }) {
    const auth = useAuthStore()
    const anot = { tipo, texto, nome, leito, timestamp: Date.now() }
    await push(dbRef(db, `anotacoes/${auth.syncCode}`), anot)
    return anot
  }

  async function deletar(key) {
    const auth = useAuthStore()
    await remove(dbRef(db, `anotacoes/${auth.syncCode}/${key}`))
  }

  async function atualizar(key, dados) {
    const auth = useAuthStore()
    await update(dbRef(db, `anotacoes/${auth.syncCode}/${key}`), dados)
  }

  return { anotacoes, iniciar, parar, salvar, deletar, atualizar }
})
