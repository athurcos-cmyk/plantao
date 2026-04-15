import { ref, reactive, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAnotacoesStore } from '../stores/anotacoes.js'
import { useAuthStore } from '../stores/auth.js'
import { gerarTexto } from '../utils/gerarTextoInicial.js'
import { CAMPOS, defaultCamposAtivos } from '../config/camposAnotacaoInicial.js'
import { useToast } from './useToast.js'
import { useCopia } from './useCopia.js'
import { useDispositivos } from './useDispositivos.js'
import { db } from '../firebase.js'
import { ref as dbRef, set, get } from 'firebase/database'

export function useAnotacaoInicial() {
  const router = useRouter()
  const store  = useAnotacoesStore()
  const auth   = useAuthStore()
  const { copiar: _copiar } = useCopia()

  const { showToast } = useToast()

  const passo       = ref(1)
  const gerado      = ref(false)
  const textoGerado = ref('')
  const erro        = ref('')
  const salvando    = ref(false)

  // ── Campos "Outro" ────────────────────────────────────────────────────────
  const outroAtivo = reactive({})
  const outroTexto = reactive({})

  function selecionarOutro(campo) {
    outroAtivo[campo] = true
    form[campo] = outroTexto[campo] || ''
  }
  function atualizarOutro(campo, texto) {
    outroTexto[campo] = texto
    form[campo] = texto
  }
  function desativarOutro(campo) {
    outroAtivo[campo] = false
  }
  function _resetOutros(...campos) {
    campos.forEach(c => { outroAtivo[c] = false; outroTexto[c] = '' })
  }

  // ── Configuração de campos visíveis ───────────────────────────────────────
  const mostrarConfigModal = ref(false)

  const _configCacheKey = () => `config_anotacao_inicial_${auth.syncCode}`
  const _firebaseConfigPath = () => `configuracoes/${auth.syncCode}/anotacao_inicial`

  function _lerConfigCache() {
    try { return JSON.parse(localStorage.getItem(_configCacheKey()) || 'null') } catch { return null }
  }

  const camposAtivos = reactive(_lerConfigCache() || defaultCamposAtivos())

  // Carrega do Firebase na primeira vez (sem listener contínuo — config não muda com frequência)
  get(dbRef(db, _firebaseConfigPath())).then(snap => {
    if (snap.exists()) {
      const remoto = snap.val()
      CAMPOS.forEach(c => {
        if (remoto[c.key] !== undefined) camposAtivos[c.key] = remoto[c.key]
      })
      try { localStorage.setItem(_configCacheKey(), JSON.stringify({ ...camposAtivos })) } catch {}
    }
  }).catch(() => {})

  async function salvarCamposAtivos(novosAtivos) {
    CAMPOS.forEach(c => { camposAtivos[c.key] = novosAtivos[c.key] })
    try { localStorage.setItem(_configCacheKey(), JSON.stringify({ ...camposAtivos })) } catch {}
    try {
      await set(dbRef(db, _firebaseConfigPath()), { ...camposAtivos })
    } catch {}
    mostrarConfigModal.value = false
  }

  // Scroll para o topo ao trocar de bloco
  watch(passo, () => { nextTick(() => window.scrollTo({ top: 0, behavior: 'smooth' })) })

  // ── Rascunho ──────────────────────────────────────────────────────────────
  const RASCUNHO_KEY = 'rascunho_anotacao_inicial'
  // Banner aparece apenas na montagem inicial (se havia rascunho salvo)
  // Não é afetado pelo auto-save — evita reaparecer enquanto o usuário edita
  const temRascunho  = ref(!!localStorage.getItem(RASCUNHO_KEY))

  let saveTimer   = null
  let restaurando = false   // pausa o auto-save durante o restore

  function agendarSalvarRascunho() {
    if (restaurando) return
    clearTimeout(saveTimer)
    saveTimer = setTimeout(() => {
      if (restaurando) return
      // Só persiste se houver conteúdo mínimo preenchido
      const temConteudo = form.horario || form.colaboracao ||
        form.dispositivos.length > 0 || form.diurese.length > 0 ||
        form.posicaoCama || form.respPadrao
      if (temConteudo) {
        localStorage.setItem(RASCUNHO_KEY, JSON.stringify({
          form: JSON.parse(JSON.stringify(form)),
          passo: passo.value
        }))
        // NÃO seta temRascunho aqui — banner só aparece na montagem inicial
      } else {
        // Form vazio: limpa o rascunho silenciosamente
        localStorage.removeItem(RASCUNHO_KEY)
      }
    }, 800)
  }

  function restaurarRascunho() {
    const raw = localStorage.getItem(RASCUNHO_KEY)
    if (!raw) return
    try {
      restaurando = true
      const { form: saved, passo: p } = JSON.parse(raw)
      Object.assign(form, saved)
      passo.value = p || 1
      temRascunho.value = false   // esconde o banner
      nextTick(() => { restaurando = false })
    } catch {
      restaurando = false
      temRascunho.value = false
    }
  }

  function descartarRascunho() {
    localStorage.removeItem(RASCUNHO_KEY)
    temRascunho.value = false
  }

  const form = reactive({
    // Bloco 1
    horario: '', sexo: 'F', localizacao: 'leito',
    posicaoCama: '', rodas: '', grades: '', decubito: '',
    // Bloco 2
    mentalAlterado: false, mentalDesc: '',
    colaboracao: '', deambulacao: '', deambulaAuxilio: '',
    respPadrao: '', respiracao: '', oxigenioLitros: '',
    acompanhante: '', acompanhanteNome: '', acompanhanteParentesco: '',
    // Bloco 3
    dispositivos: [],
    // Bloco 4
    evacuacaoOpcao: '', evacuacaoData: '',
    diurese: [], svdDebito: '', svdAspecto: '', diureseObs: '',
    queixas: '', obsApresenta: '',
    // Bloco 5
    fechamento: '',
    // Preview
    nomePaciente: '', leitoPaciente: ''
  })

  const {
    dragIdx,
    dragOverIdx,
    modal,
    locaisCentral,
    tiposDisp,
    pulseiraOpcoes,
    abrirModal,
    fecharModal,
    confirmarDisp,
    moverDisp,
    removerDisp,
    onDragStart,
    onDragOver,
    onDrop,
  } = useDispositivos(form.dispositivos)

  // Auto-salva rascunho ao editar
  watch(form, agendarSalvarRascunho, { deep: true })

  // ── Opções dependentes do sexo ────────────────────────────────────────────
  const colaboracaoOpcoes = computed(() => {
    const m = form.sexo === 'M'
    return [
      { value: m ? 'sendo colaborativo' : 'sendo colaborativa',
        label: m ? 'Colaborativo' : 'Colaborativa' },
      { value: m ? 'não sendo colaborativo com os cuidados' : 'não sendo colaborativa com os cuidados',
        label: m ? 'Não colaborativo' : 'Não colaborativa' },
      { value: 'inconsciente / sem resposta a estímulos', label: 'Inconsciente' }
    ]
  })

  const deambulacaoOpcoes = computed(() => {
    const m = form.sexo === 'M'
    return [
      { value: m ? 'deambula sozinho' : 'deambula sozinha',
        label: m ? 'Deambula sozinho' : 'Deambula sozinha' },
      { value: 'deambula com auxílio', label: 'Deambula com auxílio' },
      { value: 'não deambula', label: 'Não deambula' },
      { value: m ? 'acamado no momento' : 'acamada no momento',
        label: m ? 'Acamado no momento' : 'Acamada no momento' },
      { value: m ? 'restrito ao leito' : 'restrita ao leito',
        label: m ? 'Restrito ao leito (100% acamado)' : 'Restrita ao leito (100% acamada)' }
    ]
  })

  const respPadraoOpcoes = computed(() => {
    const m = form.sexo === 'M'
    return [
      { value: m ? 'eupneico' : 'eupneica', label: 'Eupneico(a)' },
      { value: m ? 'dispneico' : 'dispneica', label: 'Dispneico(a)' },
      { value: m ? 'taquipneico' : 'taquipneica', label: 'Taquipneico(a)' }
    ]
  })

  watch(() => form.sexo, () => {
    form.colaboracao = ''
    form.deambulacao = ''
    form.respPadrao  = ''
  })

  // ── Opções estáticas ──────────────────────────────────────────────────────
  const evacuacaoOpcoes = [
    { v: 'hoje',         l: 'Hoje' },
    { v: 'ontem',        l: 'Ontem' },
    { v: 'data',         l: 'Escolher data' },
    { v: 'nao-avaliado', l: 'Não avaliado' }
  ]

  const diureseOpcoes = [
    { v: 'fralda',       l: 'Fralda' },
    { v: 'comadre',      l: 'Comadre' },
    { v: 'papagaio',     l: 'Papagaio' },
    { v: 'banheiro',     l: 'Banheiro' },
    { v: 'SVD',          l: 'SVD' },
    { v: 'não avaliado', l: 'Não avaliado' }
  ]

  // ── Eventos ───────────────────────────────────────────────────────────────
  function onRespChange() {
    if (form.respiracao === 'ventilação mecânica') form.respPadrao = ''
    // Só zera litros quando sai dos modos que precisam de O₂
    const precisaO2 = form.respiracao === 'cateter nasal de O₂' || form.respiracao === 'máscara de O₂'
    if (!precisaO2) form.oxigenioLitros = ''
  }

  function onDiureseChange() {
    if (form.diurese.includes('não avaliado') && form.diurese.length > 1) {
      form.diurese = ['não avaliado']
    }
  }

  // ── Navegação ─────────────────────────────────────────────────────────────
  function voltarOuSair() {
    if (gerado.value)   { gerado.value = false; passo.value = 5; return }
    if (passo.value > 1) { passo.value--; return }
    router.back()
  }

  function avancar() {
    erro.value = ''
    if (passo.value === 1) {
      passo.value = 2
    } else if (passo.value === 2) {
      passo.value = 3
    } else if (passo.value === 4) {
      atualizarFechamento()
      passo.value = 5
    }
  }

  function limparBloco() {
    erro.value = ''
    if (passo.value === 1) {
      Object.assign(form, { horario:'', sexo:'F', localizacao:'leito', posicaoCama:'', rodas:'', grades:'', decubito:'' })
      _resetOutros('posicaoCama', 'rodas', 'grades', 'decubito')
    } else if (passo.value === 2) {
      Object.assign(form, { mentalAlterado:false, mentalDesc:'', colaboracao:'',
        deambulacao:'', deambulaAuxilio:'', respPadrao:'', respiracao:'',
        oxigenioLitros:'', acompanhante:'', acompanhanteNome:'', acompanhanteParentesco:'' })
      _resetOutros('colaboracao', 'deambulacao', 'respiracao')
    } else if (passo.value === 4) {
      Object.assign(form, { evacuacaoOpcao:'', evacuacaoData:'', diurese:[],
        svdDebito:'', svdAspecto:'', diureseObs:'', queixas:'', obsApresenta:'' })
    }
  }

  // ── Fechamento automático ─────────────────────────────────────────────────
  function atualizarFechamento() {
    if (form.localizacao === 'poltrona') {
      form.fechamento = 'Mantenho campainha próxima e oriento a chamar sempre que necessário.'
    } else {
      const p = form.posicaoCama || '___'
      const r = form.rodas       || '___'
      const g = form.grades      || '___'
      form.fechamento = `Mantenho cama ${p}, rodas ${r}, grades ${g}, campainha próxima e oriento a chamar sempre que necessário.`
    }
  }

  // ── Geração de texto ──────────────────────────────────────────────────────
  function gerar() {
    erro.value = ''
    if (!form.horario) {
      erro.value = 'Informe o horário.'
      return
    }
    if (!form.fechamento) atualizarFechamento()
    textoGerado.value = gerarTexto(form, camposAtivos)
    gerado.value = true
  }

  // ── Ações ─────────────────────────────────────────────────────────────────
  async function salvar() {
    salvando.value = true
    try {
      const r = await store.salvar({
        tipo: 'inicial',
        texto: textoGerado.value,
        nome: form.nomePaciente,
        leito: form.leitoPaciente,
      })
      if (r?.modo === 'offline') mostrarFeedback('Salvo offline - sincroniza automatico')
      else mostrarFeedback('✓ Salvo no histórico!')
    } catch {
      mostrarFeedback('Erro ao salvar. Tente novamente.')
    } finally {
      salvando.value = false
    }
  }

  async function copiar() {
    const ok = await _copiar(textoGerado.value)
    if (ok) mostrarFeedback('✓ Copiado!')
    else mostrarFeedback('Erro ao copiar')
  }

  function compartilhar() {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(textoGerado.value)}`
    window.open(url, '_blank')
  }

  function novaAnotacao() {
    Object.assign(form, {
      horario:'', sexo:'F', localizacao:'leito', posicaoCama:'', rodas:'', grades:'', decubito:'',
      mentalAlterado:false, mentalDesc:'', colaboracao:'', deambulacao:'',
      deambulaAuxilio:'', respPadrao:'', respiracao:'', oxigenioLitros:'',
      acompanhante:'', acompanhanteNome:'', acompanhanteParentesco:'',
      evacuacaoOpcao:'', evacuacaoData:'', diurese:[], svdDebito:'', svdAspecto:'', diureseObs:'',
      queixas:'', obsApresenta:'', fechamento:'',
      nomePaciente:'', leitoPaciente:''
    })
    form.dispositivos.splice(0)
    _resetOutros('posicaoCama', 'rodas', 'grades', 'decubito', 'colaboracao', 'deambulacao', 'respiracao')
    passo.value = 1
    gerado.value = false
    textoGerado.value = ''
    erro.value = ''
    descartarRascunho()
  }

  function mostrarFeedback(msg) {
    showToast(msg)
  }

  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)

  return {
    // refs
    passo,
    gerado,
    textoGerado,
    erro,
    salvando,
    dragIdx,
    dragOverIdx,
    temRascunho,
    restaurarRascunho,
    descartarRascunho,
    // config de campos
    camposAtivos,
    mostrarConfigModal,
    salvarCamposAtivos,
    // campos Outro
    outroAtivo,
    outroTexto,
    selecionarOutro,
    atualizarOutro,
    desativarOutro,
    // reactive
    form,
    modal,
    // constants
    locaisCentral,
    tiposDisp,
    pulseiraOpcoes,
    diureseOpcoes,
    evacuacaoOpcoes,
    // computeds
    colaboracaoOpcoes,
    deambulacaoOpcoes,
    respPadraoOpcoes,
    // functions
    cap,
    voltarOuSair,
    avancar,
    limparBloco,
    onRespChange,
    onDiureseChange,
    abrirModal,
    fecharModal,
    confirmarDisp,
    moverDisp,
    removerDisp,
    onDragStart,
    onDragOver,
    onDrop,
    gerar,
    salvar,
    copiar,
    compartilhar,
    novaAnotacao,
    router
  }
}
