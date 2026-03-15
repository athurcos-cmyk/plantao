import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '../firebase.js'
import { ref as dbRef, push, onValue, off, set, update, remove } from 'firebase/database'
import { useAuthStore } from './auth.js'

const TAREFAS_PADRAO = [
  'Passar nos quartos',
  'Organizar setor',
  'Retirar hamper',
  'Repor materiais',
  'Limpar expurgo',
  'Trocar prescrição',
  'Organizar copa',
]

// ── Cache helpers ──
const _plantaoCacheKey  = code => `cache_org_plantao_${code}`
const _templateCacheKey = code => `cache_org_template_${code}`
const _dirtyKey         = (code, tipo) => `org_dirty_${code}_${tipo}`

function _lerCachePlantao(code) {
  try { return JSON.parse(localStorage.getItem(_plantaoCacheKey(code)) || 'null') } catch { return null }
}
function _salvarCachePlantao(code, p) {
  try { localStorage.setItem(_plantaoCacheKey(code), JSON.stringify(p)) } catch {}
}
function _lerCacheTemplate(code) {
  try { return JSON.parse(localStorage.getItem(_templateCacheKey(code)) || '[]') } catch { return [] }
}
function _salvarCacheTemplate(code, t) {
  try { localStorage.setItem(_templateCacheKey(code), JSON.stringify(t)) } catch {}
}
function _marcarDirty(code, tipo) {
  try { localStorage.setItem(_dirtyKey(code, tipo), '1') } catch {}
}
function _limparDirty(code, tipo) {
  try { localStorage.removeItem(_dirtyKey(code, tipo)) } catch {}
}
function _isDirty(code, tipo) {
  return localStorage.getItem(_dirtyKey(code, tipo)) === '1'
}

// ── Conversão local → Firebase ──
function _plantaoParaFirebase(p) {
  const tarefas = {}
  p.tarefas.forEach(({ _key, ...data }) => { tarefas[_key] = data })
  const proximo_plantao = {}
  p.proximoPlantao.forEach(({ _key, ...data }) => { proximo_plantao[_key] = data })
  return {
    iniciadoEm: p.iniciadoEm,
    tarefas,
    proximo_plantao: Object.keys(proximo_plantao).length ? proximo_plantao : null,
  }
}
function _templateParaFirebase(t) {
  const batch = {}
  t.forEach(({ _key, ...data }) => { batch[_key] = data })
  return batch
}

// ── Store ──
export const useOrganizadorStore = defineStore('organizador', () => {
  const template = ref([])
  const plantao  = ref(null)
  let unsubTemplate = null
  let unsubPlantao  = null

  function _code() { return useAuthStore().syncCode }

  function iniciar() {
    if (unsubTemplate) return
    const code = _code()
    if (!code) return

    // Restaura do cache antes de conectar
    const cachedPlantao = _lerCachePlantao(code)
    if (cachedPlantao) plantao.value = cachedPlantao
    const cachedTemplate = _lerCacheTemplate(code)
    if (cachedTemplate.length) template.value = cachedTemplate

    const tplRef = dbRef(db, `organizador/${code}/template`)
    unsubTemplate = onValue(tplRef, async (snap) => {
      if (!snap.exists()) {
        if (!navigator.onLine) {
          // Inicializa localmente com padrões se não tem nada
          if (!template.value.length) {
            const lista = TAREFAS_PADRAO.map((texto, i) => ({
              _key: push(tplRef).key, texto, ordem: i, criadoEm: Date.now(),
            }))
            template.value = lista
            _salvarCacheTemplate(code, lista)
            _marcarDirty(code, 'template')
          }
          return
        }
        const batch = {}
        TAREFAS_PADRAO.forEach((texto, i) => {
          const k = push(tplRef).key
          batch[k] = { texto, ordem: i, criadoEm: Date.now() }
        })
        await set(tplRef, batch)
        return
      }
      const lista = []
      snap.forEach(c => { lista.push({ ...c.val(), _key: c.key }) })
      lista.sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))
      template.value = lista
      _salvarCacheTemplate(code, lista)
    })

    const plantaoRef = dbRef(db, `organizador/${code}/plantao`)
    unsubPlantao = onValue(plantaoRef, (snap) => {
      if (!snap.exists()) { plantao.value = null; _salvarCachePlantao(code, null); return }
      const d = snap.val()
      const tarefas = d.tarefas
        ? Object.entries(d.tarefas)
            .map(([k, v]) => ({ ...v, _key: k }))
            .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))
        : []
      const proximoPlantao = d.proximo_plantao
        ? Object.entries(d.proximo_plantao)
            .map(([k, v]) => ({ ...v, _key: k }))
            .sort((a, b) => (a.criadoEm || 0) - (b.criadoEm || 0))
        : []
      const p = { iniciadoEm: d.iniciadoEm, tarefas, proximoPlantao }
      plantao.value = p
      _salvarCachePlantao(code, p)
    })
  }

  function parar() {
    const code = _code()
    if (code) {
      if (unsubTemplate) off(dbRef(db, `organizador/${code}/template`))
      if (unsubPlantao)  off(dbRef(db, `organizador/${code}/plantao`))
    }
    unsubTemplate = null
    unsubPlantao  = null
    template.value = []
    plantao.value  = null
  }

  async function iniciarPlantao() {
    const code = _code()
    const tarefas = {}
    const fonte = template.value.length > 0
      ? template.value
      : TAREFAS_PADRAO.map((texto, i) => ({ texto, ordem: i }))
    fonte.forEach((t, i) => {
      const k = push(dbRef(db, `organizador/${code}/plantao/tarefas`)).key
      tarefas[k] = { texto: t.texto, feito: false, horario: '', ordem: i, criadoEm: Date.now() }
    })
    const iniciadoEm = Date.now()

    if (!navigator.onLine) {
      const tarefasArr = Object.entries(tarefas)
        .map(([k, v]) => ({ ...v, _key: k }))
        .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))
      const p = { iniciadoEm, tarefas: tarefasArr, proximoPlantao: [] }
      plantao.value = p
      _salvarCachePlantao(code, p)
      _marcarDirty(code, 'plantao')
      return
    }
    await set(dbRef(db, `organizador/${code}/plantao`), { iniciadoEm, tarefas, proximo_plantao: null })
  }

  async function toggleTarefa(key, feitoAtual) {
    const code = _code()
    if (!navigator.onLine) {
      if (!plantao.value) return
      const p = { ...plantao.value, tarefas: plantao.value.tarefas.map(t =>
        t._key === key ? { ...t, feito: !feitoAtual } : t) }
      plantao.value = p
      _salvarCachePlantao(code, p)
      _marcarDirty(code, 'plantao')
      return
    }
    await update(dbRef(db, `organizador/${code}/plantao/tarefas/${key}`), { feito: !feitoAtual })
  }

  async function definirHorario(key, horario) {
    const code = _code()
    if (!navigator.onLine) {
      if (!plantao.value) return
      const p = { ...plantao.value, tarefas: plantao.value.tarefas.map(t =>
        t._key === key ? { ...t, horario: horario || '' } : t) }
      plantao.value = p
      _salvarCachePlantao(code, p)
      _marcarDirty(code, 'plantao')
      return
    }
    await update(dbRef(db, `organizador/${code}/plantao/tarefas/${key}`), { horario: horario || '' })
  }

  async function adicionarTarefaAvulsa(texto, horario = '') {
    const code = _code()
    const ordem = plantao.value ? plantao.value.tarefas.length : 0

    if (!navigator.onLine) {
      if (!plantao.value) return
      const k = push(dbRef(db, `organizador/${code}/plantao/tarefas`)).key
      const p = { ...plantao.value, tarefas: [
        ...plantao.value.tarefas,
        { _key: k, texto, feito: false, horario, ordem, criadoEm: Date.now(), avulsa: true }
      ]}
      plantao.value = p
      _salvarCachePlantao(code, p)
      _marcarDirty(code, 'plantao')
      return
    }
    await push(dbRef(db, `organizador/${code}/plantao/tarefas`), {
      texto, feito: false, horario, ordem, criadoEm: Date.now(), avulsa: true
    })
  }

  async function excluirTarefa(key) {
    const code = _code()
    if (!navigator.onLine) {
      if (!plantao.value) return
      const p = { ...plantao.value, tarefas: plantao.value.tarefas.filter(t => t._key !== key) }
      plantao.value = p
      _salvarCachePlantao(code, p)
      _marcarDirty(code, 'plantao')
      return
    }
    await remove(dbRef(db, `organizador/${code}/plantao/tarefas/${key}`))
  }

  async function adicionarProximoPlantao(texto) {
    const code = _code()
    if (!navigator.onLine) {
      if (!plantao.value) return
      const k = push(dbRef(db, `organizador/${code}/plantao/proximo_plantao`)).key
      const p = { ...plantao.value, proximoPlantao: [
        ...plantao.value.proximoPlantao,
        { _key: k, texto, criadoEm: Date.now() }
      ]}
      plantao.value = p
      _salvarCachePlantao(code, p)
      _marcarDirty(code, 'plantao')
      return
    }
    await push(dbRef(db, `organizador/${code}/plantao/proximo_plantao`), { texto, criadoEm: Date.now() })
  }

  async function excluirProximoPlantao(key) {
    const code = _code()
    if (!navigator.onLine) {
      if (!plantao.value) return
      const p = { ...plantao.value, proximoPlantao: plantao.value.proximoPlantao.filter(i => i._key !== key) }
      plantao.value = p
      _salvarCachePlantao(code, p)
      _marcarDirty(code, 'plantao')
      return
    }
    await remove(dbRef(db, `organizador/${code}/plantao/proximo_plantao/${key}`))
  }

  async function adicionarAoTemplate(texto) {
    const code = _code()
    const ordem = template.value.length
    if (!navigator.onLine) {
      const k = push(dbRef(db, `organizador/${code}/template`)).key
      const lista = [...template.value, { _key: k, texto, ordem, criadoEm: Date.now() }]
      template.value = lista
      _salvarCacheTemplate(code, lista)
      _marcarDirty(code, 'template')
      return
    }
    await push(dbRef(db, `organizador/${code}/template`), { texto, ordem, criadoEm: Date.now() })
  }

  async function removerDoTemplate(key) {
    const code = _code()
    if (!navigator.onLine) {
      const lista = template.value.filter(t => t._key !== key)
      template.value = lista
      _salvarCacheTemplate(code, lista)
      _marcarDirty(code, 'template')
      return
    }
    await remove(dbRef(db, `organizador/${code}/template/${key}`))
  }

  async function restaurarTemplate() {
    const code = _code()
    const tplRef = dbRef(db, `organizador/${code}/template`)
    const batch = {}
    TAREFAS_PADRAO.forEach((texto, i) => {
      const k = push(tplRef).key
      batch[k] = { texto, ordem: i, criadoEm: Date.now() }
    })
    if (!navigator.onLine) {
      const lista = Object.entries(batch).map(([k, v]) => ({ ...v, _key: k }))
      template.value = lista
      _salvarCacheTemplate(code, lista)
      _marcarDirty(code, 'template')
      return
    }
    await set(tplRef, batch)
  }

  // Chamado ao voltar online — sobe estado local dirty pro Firebase
  async function sincronizarOrganizador() {
    const code = _code()
    if (!code || !navigator.onLine) return

    if (_isDirty(code, 'plantao') && plantao.value) {
      _limparDirty(code, 'plantao')
      await set(dbRef(db, `organizador/${code}/plantao`), _plantaoParaFirebase(plantao.value))
    }
    if (_isDirty(code, 'template') && template.value.length > 0) {
      _limparDirty(code, 'template')
      await set(dbRef(db, `organizador/${code}/template`), _templateParaFirebase(template.value))
    }
  }

  return {
    template, plantao,
    iniciar, parar,
    iniciarPlantao,
    toggleTarefa, definirHorario, adicionarTarefaAvulsa, excluirTarefa,
    adicionarProximoPlantao, excluirProximoPlantao,
    adicionarAoTemplate, removerDoTemplate, restaurarTemplate,
    sincronizarOrganizador,
  }
})
