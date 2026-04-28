import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '../firebase.js'
import { ref as dbRef, push, onValue, remove, update } from 'firebase/database'
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

function _parsePaciente(snap) {
  const data = snap.val()
  const pendencias = data.pendencias
    ? Object.entries(data.pendencias)
        .map(([k, v]) => ({ ...v, _key: k }))
        .sort((a, b) => (a.criadoEm || 0) - (b.criadoEm || 0))
    : []
  return { ...data, pendencias, _key: snap.key }
}

export const usePacientesStore = defineStore('pacientes', () => {
  const pacientes      = ref([])
  const pendentesCount = ref(0)
  const _pacMap        = new Map()
  let _stopValue = null

  function _ordenar(lista) {
    return lista.sort((a, b) => (a.leito || '').localeCompare(b.leito || '', undefined, { numeric: true }))
  }

  function _reconstruir(code) {
    const lista = _ordenar(Array.from(_pacMap.values()))
    pacientes.value = lista
    _salvarCache(code, lista)
  }

  function _limparListeners() {
    if (_stopValue) { _stopValue(); _stopValue = null }
  }

  function iniciar() {
    if (_stopValue) return
    const auth = useAuthStore()
    if (!auth.syncCode) return
    const code = auth.syncCode

    // Mostra cache imediatamente enquanto carrega do Firebase
    const cached = _lerCache(code)
    if (cached.length) {
      cached.forEach(p => _pacMap.set(p._key, p))
      pacientes.value = cached
    }
    pendentesCount.value = _lerQueue(code).length

    const path = dbRef(db, `pacientes/${code}`)

    // onValue SEMPRE devolve o estado completo do Firebase
    // — sem condição de corrida, sem dedup, sem pacientes fantasmas
    _stopValue = onValue(path, (snapshot) => {
      const queue = _lerQueue(code)
      const pendingAddKeys = new Set(queue.filter(i => i.op === 'add').map(i => i.key))

      // Reconstrói o map a partir do Firebase
      const novoMap = new Map()
      snapshot.forEach((child) => {
        novoMap.set(child.key, _parsePaciente(child))
      })

      // Preserva pacientes offline (tempKeys) que ainda estão na fila
      // para não sumirem da UI até sincronizar
      _pacMap.forEach((v, k) => {
        if (pendingAddKeys.has(k)) {
          novoMap.set(k, v)
        }
      })

      _pacMap.clear()
      novoMap.forEach((v, k) => _pacMap.set(k, v))
      _reconstruir(code)
    })
  }

  function parar() {
    _limparListeners()
    _pacMap.clear()
    pacientes.value = []
    pendentesCount.value = 0
  }

  async function adicionar({ nome, leito }) {
    const auth = useAuthStore()
    const code = auth.syncCode
    const data = { nome: nome.trim(), leito: leito.trim(), criadoEm: Date.now() }

    if (!navigator.onLine) {
      const tempKey = push(dbRef(db, `pacientes/${code}`)).key
      const novo = { ...data, pendencias: [], _key: tempKey }
      _pacMap.set(tempKey, novo)
      _reconstruir(code)
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
      const pac = _pacMap.get(key)
      if (pac) _pacMap.set(key, { ...pac, ...data })
      _reconstruir(code)
      _enfileirar(code, { op: 'edit', key, data })
      pendentesCount.value++
      return
    }
    await update(dbRef(db, `pacientes/${code}/${key}`), data)
  }

  async function excluir(key) {
    const auth = useAuthStore()
    const code = auth.syncCode

    _pacMap.delete(key)
    _reconstruir(code)

    if (!navigator.onLine) {
      _enfileirar(code, { op: 'delete', key })
      pendentesCount.value++
      return
    }
    try { await remove(dbRef(db, `pacientes/${code}/${key}`)) } catch {}
  }

  async function excluirTodos() {
    const auth = useAuthStore()
    const code = auth.syncCode
    const keys = Array.from(_pacMap.keys())

    _pacMap.clear()
    pacientes.value = []
    _salvarCache(code, [])

    if (!navigator.onLine) {
      keys.forEach(key => _enfileirar(code, { op: 'delete', key }))
      pendentesCount.value += keys.length
      return
    }
    await Promise.all(keys.map(key =>
      remove(dbRef(db, `pacientes/${code}/${key}`)).catch(() => {})
    ))
  }

  async function adicionarPendencia(pacKey, texto) {
    const auth = useAuthStore()
    const code = auth.syncCode
    const data = { texto: texto.trim(), feito: false, criadoEm: Date.now() }

    if (!navigator.onLine) {
      const tempPendKey = push(dbRef(db, `pacientes/${code}/${pacKey}/pendencias`)).key
      const pac = _pacMap.get(pacKey)
      if (pac) _pacMap.set(pacKey, { ...pac, pendencias: [...(pac.pendencias || []), { ...data, _key: tempPendKey }] })
      _reconstruir(code)
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
      const pac = _pacMap.get(pacKey)
      if (pac) _pacMap.set(pacKey, { ...pac, pendencias: pac.pendencias.map(p => p._key === pendKey ? { ...p, feito: novoFeito } : p) })
      _reconstruir(code)
      _enfileirar(code, { op: 'togglePend', pacKey, pendKey, novoFeito })
      pendentesCount.value++
      return
    }
    await update(dbRef(db, `pacientes/${code}/${pacKey}/pendencias/${pendKey}`), { feito: novoFeito })
  }

  async function definirHorarioPendencia(pacKey, pendKey, horario) {
    const auth = useAuthStore()
    const code = auth.syncCode
    const valor = horario || null

    if (!navigator.onLine) {
      const pac = _pacMap.get(pacKey)
      if (pac) _pacMap.set(pacKey, { ...pac, pendencias: pac.pendencias.map(p => p._key === pendKey ? { ...p, horario: valor } : p) })
      _reconstruir(code)
      _enfileirar(code, { op: 'horarioPend', pacKey, pendKey, horario: valor })
      pendentesCount.value++
      return
    }
    await update(dbRef(db, `pacientes/${code}/${pacKey}/pendencias/${pendKey}`), { horario: valor })
  }

  async function excluirPendencia(pacKey, pendKey) {
    const auth = useAuthStore()
    const code = auth.syncCode

    const pac = _pacMap.get(pacKey)
    if (pac) _pacMap.set(pacKey, { ...pac, pendencias: pac.pendencias.filter(p => p._key !== pendKey) })
    _reconstruir(code)

    if (!navigator.onLine) {
      _enfileirar(code, { op: 'deletePend', pacKey, pendKey })
      pendentesCount.value++
      return
    }
    try { await remove(dbRef(db, `pacientes/${code}/${pacKey}/pendencias/${pendKey}`)) } catch {}
  }

  async function sincronizarPendentes() {
    const auth = useAuthStore()
    const code = auth.syncCode
    if (!code || !navigator.onLine) return 0

    const q = _lerQueue(code)
    if (!q.length) return 0

    const keyMap     = {}
    const pendKeyMap = {}

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

        } else if (item.op === 'horarioPend') {
          const realPend = pendKeyMap[`${item.pacKey}:${item.pendKey}`] || item.pendKey
          await update(dbRef(db, `pacientes/${code}/${realPacP}/pendencias/${realPend}`), { horario: item.horario })

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
    adicionar, atualizar, excluir, excluirTodos,
    adicionarPendencia, togglePendencia, excluirPendencia, definirHorarioPendencia,
    sincronizarPendentes,
  }
})
