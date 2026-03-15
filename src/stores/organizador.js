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

export const useOrganizadorStore = defineStore('organizador', () => {
  const template = ref([])
  const plantao  = ref(null)  // null | { iniciadoEm, tarefas: [], proximoPlantao: [] }
  let unsubTemplate = null
  let unsubPlantao  = null

  function _code() { return useAuthStore().syncCode }

  function iniciar() {
    if (unsubTemplate) return
    const code = _code()
    if (!code) return

    const tplRef = dbRef(db, `organizador/${code}/template`)
    unsubTemplate = onValue(tplRef, async (snap) => {
      if (!snap.exists()) {
        const batch = {}
        TAREFAS_PADRAO.forEach((texto, i) => {
          const k = push(tplRef).key
          batch[k] = { texto, ordem: i, criadoEm: Date.now() }
        })
        await set(tplRef, batch)
        return
      }
      const lista = []
      snap.forEach(c => lista.push({ ...c.val(), _key: c.key }))
      lista.sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))
      template.value = lista
    })

    const plantaoRef = dbRef(db, `organizador/${code}/plantao`)
    unsubPlantao = onValue(plantaoRef, (snap) => {
      if (!snap.exists()) { plantao.value = null; return }
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
      plantao.value = { iniciadoEm: d.iniciadoEm, tarefas, proximoPlantao }
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
    template.value.forEach((t, i) => {
      const k = push(dbRef(db, `organizador/${code}/plantao/tarefas`)).key
      tarefas[k] = { texto: t.texto, feito: false, horario: '', ordem: i, criadoEm: Date.now() }
    })
    await set(dbRef(db, `organizador/${code}/plantao`), {
      iniciadoEm: Date.now(),
      tarefas,
      proximo_plantao: null
    })
  }

  async function toggleTarefa(key, feitoAtual) {
    await update(dbRef(db, `organizador/${_code()}/plantao/tarefas/${key}`), { feito: !feitoAtual })
  }

  async function definirHorario(key, horario) {
    await update(dbRef(db, `organizador/${_code()}/plantao/tarefas/${key}`), { horario: horario || '' })
  }

  async function adicionarTarefaAvulsa(texto, horario = '') {
    const ordem = plantao.value ? plantao.value.tarefas.length : 0
    await push(dbRef(db, `organizador/${_code()}/plantao/tarefas`), {
      texto, feito: false, horario, ordem, criadoEm: Date.now(), avulsa: true
    })
  }

  async function excluirTarefa(key) {
    await remove(dbRef(db, `organizador/${_code()}/plantao/tarefas/${key}`))
  }

  async function adicionarProximoPlantao(texto) {
    await push(dbRef(db, `organizador/${_code()}/plantao/proximo_plantao`), {
      texto, criadoEm: Date.now()
    })
  }

  async function excluirProximoPlantao(key) {
    await remove(dbRef(db, `organizador/${_code()}/plantao/proximo_plantao/${key}`))
  }

  async function adicionarAoTemplate(texto) {
    const ordem = template.value.length
    await push(dbRef(db, `organizador/${_code()}/template`), {
      texto, ordem, criadoEm: Date.now()
    })
  }

  async function removerDoTemplate(key) {
    await remove(dbRef(db, `organizador/${_code()}/template/${key}`))
  }

  async function restaurarTemplate() {
    const code = _code()
    const tplRef = dbRef(db, `organizador/${code}/template`)
    const batch = {}
    TAREFAS_PADRAO.forEach((texto, i) => {
      const k = push(tplRef).key
      batch[k] = { texto, ordem: i, criadoEm: Date.now() }
    })
    await set(tplRef, batch)
  }

  return {
    template, plantao,
    iniciar, parar,
    iniciarPlantao,
    toggleTarefa, definirHorario, adicionarTarefaAvulsa, excluirTarefa,
    adicionarProximoPlantao, excluirProximoPlantao,
    adicionarAoTemplate, removerDoTemplate, restaurarTemplate
  }
})
