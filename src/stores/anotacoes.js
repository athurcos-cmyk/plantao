import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '../firebase.js'
import {
  ref as dbRef,
  push,
  set,
  remove,
  update,
  get,
  query,
  orderByChild,
  onChildAdded,
  onChildChanged,
  onChildRemoved,
  increment,
} from 'firebase/database'
import { useAuthStore } from './auth.js'

const _cacheKey = code => `cache_anotacoes_${code}`
const _pendKey = code => `pendentes_${code}`
const SAVE_TIMEOUT_MS = 5000
const CACHE_WRITE_DEBOUNCE_MS = 1200

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
function _gerarKey(path) {
  return push(path).key || `local-${Date.now()}`
}

export const useAnotacoesStore = defineStore('anotacoes', () => {
  const anotacoes = ref([])
  const pendentes = ref(0)

  let stopAdded = null
  let stopChanged = null
  let stopRemoved = null
  let ativoCode = ''
  let cacheTimer = null
  const remotoMap = new Map()

  function _upsertLocal(anot) {
    const lista = [...anotacoes.value]
    const i = lista.findIndex(a => a._key === anot._key)
    if (i >= 0) lista[i] = { ...lista[i], ...anot }
    else lista.unshift(anot)
    anotacoes.value = lista
  }

  function _removerLocal(key) {
    anotacoes.value = anotacoes.value.filter(a => a?._key !== key)
  }

  function _limparListeners() {
    if (stopAdded) stopAdded()
    if (stopChanged) stopChanged()
    if (stopRemoved) stopRemoved()
    stopAdded = null
    stopChanged = null
    stopRemoved = null
  }

  function _agendarSalvarCache(code) {
    if (!code) return
    clearTimeout(cacheTimer)
    cacheTimer = setTimeout(() => {
      _salvarCache(code, anotacoes.value)
    }, CACHE_WRITE_DEBOUNCE_MS)
  }

  function _hidratarPendentesLocais(code) {
    const fila = _lerPendentes(code)
    if (!fila.length) return

    for (const item of fila) {
      const key = item?.key
      const anot = item?.anot
      if (!key || !anot) continue
      if (anotacoes.value.some(a => a?._key === key)) continue
      _upsertLocal({ ...anot, _key: key, _pending: true })
    }
  }

  function _reconstruirComRemoto(code) {
    const pendLocais = anotacoes.value.filter(a =>
      a?._pending && a?._key && !remotoMap.has(a._key)
    )
    const remoto = Array.from(remotoMap.values()).map(item => ({ ...item, _pending: false }))
    anotacoes.value = [...pendLocais, ...remoto]
    _agendarSalvarCache(code)
  }

  async function _sincronizarRemotoCompleto(code) {
    const basePath = dbRef(db, `anotacoes/${code}`)
    const q = query(basePath, orderByChild('timestamp'))
    const snap = await get(q)
    remotoMap.clear()
    snap.forEach(child => {
      remotoMap.set(child.key, { ...child.val(), _key: child.key })
    })
    _reconstruirComRemoto(code)
  }

  async function iniciar() {
    const auth = useAuthStore()
    if (!auth.syncCode) return
    const code = auth.syncCode

    if (ativoCode && ativoCode !== code) {
      parar()
    }
    ativoCode = code

    const cached = _lerCache(code)
    if (cached.length) anotacoes.value = cached
    pendentes.value = _lerPendentes(code).length
    _hidratarPendentesLocais(code)

    const q = query(dbRef(db, `anotacoes/${code}`), orderByChild('timestamp'))

    try {
      await _sincronizarRemotoCompleto(code)
    } catch (_) {
      // Sem conexao no inicio: segue com cache local.
      _agendarSalvarCache(code)
    }

    _limparListeners()

    stopAdded = onChildAdded(q, (snap) => {
      const key = snap.key
      const remoto = { ...snap.val(), _key: key, _pending: false }
      remotoMap.set(key, remoto)
      _upsertLocal(remoto)
      _agendarSalvarCache(code)
    })

    stopChanged = onChildChanged(q, (snap) => {
      const key = snap.key
      const remoto = { ...snap.val(), _key: key, _pending: false }
      remotoMap.set(key, remoto)
      _upsertLocal(remoto)
      _agendarSalvarCache(code)
    })

    stopRemoved = onChildRemoved(q, (snap) => {
      const key = snap.key
      remotoMap.delete(key)
      _removerLocal(key)
      _agendarSalvarCache(code)
    })
  }

  function parar() {
    _limparListeners()
    clearTimeout(cacheTimer)
    cacheTimer = null
    remotoMap.clear()
    ativoCode = ''
    anotacoes.value = []
    pendentes.value = 0
  }

  async function salvar({ tipo, texto, nome = '', leito = '' }) {
    const auth = useAuthStore()
    const code = auth.syncCode
    const path = dbRef(db, `anotacoes/${code}`)
    const key = _gerarKey(path)
    const anot = { tipo, texto, nome, leito, timestamp: Date.now() }

    if (!navigator.onLine) {
      const fila = _lerPendentes(code)
      fila.push({ key, anot })
      _salvarPendentes(code, fila)
      pendentes.value = fila.length
      _upsertLocal({ ...anot, _key: key, _pending: true })
      _agendarSalvarCache(code)
      return { anot, modo: 'offline' }
    }

    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('save-timeout')), SAVE_TIMEOUT_MS)
    )

    try {
      await Promise.race([set(dbRef(db, `anotacoes/${code}/${key}`), anot), timeout])
      remotoMap.set(key, { ...anot, _key: key })
      _upsertLocal({ ...anot, _key: key, _pending: false })
      _agendarSalvarCache(code)
      // Incrementar contador de anotações do usuário (fire-and-forget)
      update(dbRef(db, `usuarios/${code}`), { total_anotacoes: increment(1) }).catch(() => {})
      return { anot, modo: 'online' }
    } catch (_) {
      // Conexao fraca/intermitente: cai para fila offline com a mesma key (idempotente).
      const fila = _lerPendentes(code)
      fila.push({ key, anot })
      _salvarPendentes(code, fila)
      pendentes.value = fila.length
      _upsertLocal({ ...anot, _key: key, _pending: true })
      _agendarSalvarCache(code)
      return { anot, modo: 'offline' }
    }
  }

  // Chamado ao voltar online - envia fila pendente para o Firebase
  async function sincronizarPendentes() {
    const auth = useAuthStore()
    const code = auth.syncCode
    if (!code || !navigator.onLine) return 0

    const fila = _lerPendentes(code)
    if (!fila.length) {
      try { await _sincronizarRemotoCompleto(code) } catch {}
      return 0
    }

    const restantes = []
    let enviados = 0

    for (const item of fila) {
      const key = item?.key || _gerarKey(dbRef(db, `anotacoes/${code}`))
      const anot = item?.anot || item

      try {
        await set(dbRef(db, `anotacoes/${code}/${key}`), anot)
        enviados++
        remotoMap.set(key, { ...anot, _key: key })
        _upsertLocal({ ...anot, _key: key, _pending: false })
      } catch (_) {
        restantes.push({ key, anot })
      }
    }

    _salvarPendentes(code, restantes)
    pendentes.value = restantes.length
    _agendarSalvarCache(code)
    try { await _sincronizarRemotoCompleto(code) } catch {}
    return enviados
  }

  async function deletar(key) {
    const auth = useAuthStore()
    const code = auth.syncCode
    // Otimista: atualiza local antes — funciona offline
    remotoMap.delete(key)
    _removerLocal(key)
    _agendarSalvarCache(code)
    try { await remove(dbRef(db, `anotacoes/${code}/${key}`)) } catch {}
  }

  async function atualizar(key, dados) {
    const auth = useAuthStore()
    const code = auth.syncCode
    await update(dbRef(db, `anotacoes/${code}/${key}`), dados)
    _upsertLocal({ _key: key, ...dados, _pending: false })
    _agendarSalvarCache(code)
  }

  async function limparTudo() {
    const auth = useAuthStore()
    const code = auth.syncCode
    // Otimista: limpa local antes — funciona offline
    remotoMap.clear()
    anotacoes.value = []
    _salvarPendentes(code, [])
    pendentes.value = 0
    _salvarCache(code, [])
    try { await remove(dbRef(db, `anotacoes/${code}`)) } catch {}
  }

  async function limparPorKeys(keys) {
    const auth = useAuthStore()
    const code = auth.syncCode
    // Otimista: remove local primeiro — funciona offline
    for (const key of keys) {
      remotoMap.delete(key)
      _removerLocal(key)
    }
    _agendarSalvarCache(code)
    try {
      await Promise.all(keys.map(key => remove(dbRef(db, `anotacoes/${code}/${key}`))))
    } catch {}
  }

  return { anotacoes, pendentes, iniciar, parar, salvar, sincronizarPendentes, deletar, atualizar, limparTudo, limparPorKeys }
})
