import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '../firebase.js'
import { ref as dbRef, push, onValue, off, remove, update } from 'firebase/database'
import { useAuthStore } from './auth.js'

const _cacheKey = code => `cache_pacientes_${code}`
const _queueKey = code => `pac_queue_${code}`

function _lerCache(code) {
  try { return JSON.parse(localStorage.getItem(_cacheKey(code)) || '[]') } catch { return [] }
}
function _salvarCache(code, lista) {
  try { localStorage.setItem(_cacheKey(code), JSON.stringify(lista)) } catch {}
}
function _lerQueue(code) {
  try { return JSON.parse(localStorage.getItem(_queueKey(code)) || '[]') } catch { return [] }
}
function _salvarQueue(code, q) {
  try { localStorage.setItem(_queueKey(code), JSON.stringify(q)) } catch {}
}
function _enfileirar(code, op) {
  const q = _lerQueue(code)
  q.push(op)
  _salvarQueue(code, q)
}

export const usePacientesStore = defineStore('pacientes', () => {
  const pacientes     = ref([])
  const pendentesCount = ref(0)
  let unsubscribe = null

  function _ordenar(lista) {
    return lista.sort((a, b) => (a.leito || '').localeCompare(b.leito || '', undefined, { numeric: true }))
  }

  function iniciar() {
    if (unsubscribe) return
    const auth = useAuthStore()
    if (!auth.syncCode) return
    const code = auth.syncCode

    const cached = _lerCache(code)
    if (cached.length) pacientes.value = cached
    pendentesCount.value = _lerQueue(code).length

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
      _ordenar(lista)
      pacientes.value = lista
      _salvarCache(code, lista)
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
    const code = auth.syncCode
    const data = { nome: nome.trim(), leito: leito.trim(), criadoEm: Date.now() }

    if (!navigator.onLine) {
      const tempKey = push(dbRef(db, `pacientes/${code}`)).key
      const lista = _ordenar([...pacientes.value, { ...data, pendencias: [], _key: tempKey }])
      pacientes.value = lista
      _salvarCache(code, lista)
      _enfileirar(code, { op: 'add', key: tempKey, data })
      pendentesCount.value++
      return
    }
    await push(dbRef(db, `pacientes/${code}`), data)
  }

  async function atualizar(key, { nome, leito }) {
    const auth = useAuthStore()
    const code = auth.syncCode
    const data = { nome: nome.trim(), leito: leito.trim() }

    if (!navigator.onLine) {
      const lista = _ordenar(pacientes.value.map(p => p._key === key ? { ...p, ...data } : p))
      pacientes.value = lista
      _salvarCache(code, lista)
      _enfileirar(code, { op: 'edit', key, data })
      pendentesCount.value++
      return
    }
    await update(dbRef(db, `pacientes/${code}/${key}`), data)
  }

  async function excluir(key) {
    const auth = useAuthStore()
    const code = auth.syncCode

    if (!navigator.onLine) {
      const lista = pacientes.value.filter(p => p._key !== key)
      pacientes.value = lista
      _salvarCache(code, lista)
      _enfileirar(code, { op: 'delete', key })
      pendentesCount.value++
      return
    }
    await remove(dbRef(db, `pacientes/${code}/${key}`))
  }

  async function adicionarPendencia(pacKey, texto) {
    const auth = useAuthStore()
    const code = auth.syncCode
    const data = { texto: texto.trim(), feito: false, criadoEm: Date.now() }

    if (!navigator.onLine) {
      const tempPendKey = push(dbRef(db, `pacientes/${code}/${pacKey}/pendencias`)).key
      const lista = pacientes.value.map(p =>
        p._key !== pacKey ? p
          : { ...p, pendencias: [...(p.pendencias || []), { ...data, _key: tempPendKey }] }
      )
      pacientes.value = lista
      _salvarCache(code, lista)
      _enfileirar(code, { op: 'addPend', pacKey, pendKey: tempPendKey, data })
      pendentesCount.value++
      return
    }
    await push(dbRef(db, `pacientes/${code}/${pacKey}/pendencias`), data)
  }

  async function togglePendencia(pacKey, pendKey, feitoAtual) {
    const auth = useAuthStore()
    const code = auth.syncCode
    const novoFeito = !feitoAtual

    if (!navigator.onLine) {
      const lista = pacientes.value.map(p =>
        p._key !== pacKey ? p
          : { ...p, pendencias: p.pendencias.map(pend =>
              pend._key === pendKey ? { ...pend, feito: novoFeito } : pend) }
      )
      pacientes.value = lista
      _salvarCache(code, lista)
      _enfileirar(code, { op: 'togglePend', pacKey, pendKey, novoFeito })
      pendentesCount.value++
      return
    }
    await update(dbRef(db, `pacientes/${code}/${pacKey}/pendencias/${pendKey}`), { feito: novoFeito })
  }

  async function excluirPendencia(pacKey, pendKey) {
    const auth = useAuthStore()
    const code = auth.syncCode

    if (!navigator.onLine) {
      const lista = pacientes.value.map(p =>
        p._key !== pacKey ? p
          : { ...p, pendencias: p.pendencias.filter(pend => pend._key !== pendKey) }
      )
      pacientes.value = lista
      _salvarCache(code, lista)
      _enfileirar(code, { op: 'deletePend', pacKey, pendKey })
      pendentesCount.value++
      return
    }
    await remove(dbRef(db, `pacientes/${code}/${pacKey}/pendencias/${pendKey}`))
  }

  async function sincronizarPendentes() {
    const auth = useAuthStore()
    const code = auth.syncCode
    if (!code || !navigator.onLine) return 0

    const q = _lerQueue(code)
    if (!q.length) return 0

    const keyMap     = {} // tempPacKey  → realPacKey
    const pendKeyMap = {} // `pacKey:tempPendKey` → realPendKey

    for (const item of q) {
      try {
        const realPac  = keyMap[item.key]  || item.key
        const realPacP = item.pacKey ? (keyMap[item.pacKey] || item.pacKey) : undefined

        if (item.op === 'add') {
          const r = await push(dbRef(db, `pacientes/${code}`), item.data)
          keyMap[item.key] = r.key

        } else if (item.op === 'edit') {
          await update(dbRef(db, `pacientes/${code}/${realPac}`), item.data)

        } else if (item.op === 'delete') {
          await remove(dbRef(db, `pacientes/${code}/${realPac}`))

        } else if (item.op === 'addPend') {
          const r = await push(dbRef(db, `pacientes/${code}/${realPacP}/pendencias`), item.data)
          pendKeyMap[`${item.pacKey}:${item.pendKey}`] = r.key

        } else if (item.op === 'togglePend') {
          const realPend = pendKeyMap[`${item.pacKey}:${item.pendKey}`] || item.pendKey
          await update(dbRef(db, `pacientes/${code}/${realPacP}/pendencias/${realPend}`), { feito: item.novoFeito })

        } else if (item.op === 'deletePend') {
          const realPend = pendKeyMap[`${item.pacKey}:${item.pendKey}`] || item.pendKey
          await remove(dbRef(db, `pacientes/${code}/${realPacP}/pendencias/${realPend}`))
        }
      } catch (e) {
        console.warn('[pacientes sync] erro na op', item.op, e)
      }
    }

    _salvarQueue(code, [])
    pendentesCount.value = 0
    return q.length
  }

  return {
    pacientes, pendentesCount, iniciar, parar,
    adicionar, atualizar, excluir,
    adicionarPendencia, togglePendencia, excluirPendencia,
    sincronizarPendentes,
  }
})
