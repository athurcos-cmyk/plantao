import { ref, reactive, computed, watch, nextTick, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAnotacoesStore } from '../stores/anotacoes.js'
import { useAuthStore } from '../stores/auth.js'
import { gerarTexto } from '../utils/gerarTextoInicial.js'
import { CAMPOS, defaultCamposAtivos } from '../config/camposAnotacaoInicial.js'
import { useToast } from './useToast.js'
import { useCopia } from './useCopia.js'
import { useDispositivos } from './useDispositivos.js'
import { db } from '../firebase.js'
import { ref as dbRef, set, get, push, remove, onValue, update } from 'firebase/database'

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
  const carregandoFechamentos = ref(false)
  const salvandoFechamentoModelo = ref(false)
  const modalFechamentos = ref(false)
  const modalNovoFechamento = ref(false)
  const fechamentosModelos = ref([])
  const fechamentoSelecionadoKey = ref('')
  const fechamentoBusca = ref('')
  const fechamentoBuscaModal = ref('')
  const novoFechamentoTitulo = ref('')
  const novoFechamentoTexto = ref('')
  const novoFechamentoTituloInput = ref(null)
  let fechamentosOff = null

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

  onUnmounted(() => {
    if (fechamentosOff) {
      fechamentosOff()
      fechamentosOff = null
    }
  })

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
      if (passo.value === 5 && form.fechamentoModo !== 'personalizado') atualizarFechamento()
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
    fechamentoModo: 'identificacao', fechamento: '',
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

  const podeSalvarFechamentoModelo = computed(() =>
    novoFechamentoTitulo.value.trim().length > 0 && novoFechamentoTexto.value.trim().length > 0
  )
  const fechamentosOrdenados = computed(() => _ordenarFechamentos(fechamentosModelos.value))
  const fechamentosFavoritos = computed(() => fechamentosOrdenados.value.filter(m => m.favorito).slice(0, 5))
  const fechamentosFiltrados = computed(() => {
    const termo = fechamentoBusca.value.trim().toLowerCase()
    if (!termo) return fechamentosOrdenados.value
    return fechamentosOrdenados.value.filter(m =>
      [m.titulo, m.texto].some(v => String(v || '').toLowerCase().includes(termo))
    )
  })
  const fechamentosGerenciamentoFiltrados = computed(() => {
    const termo = fechamentoBuscaModal.value.trim().toLowerCase()
    if (!termo) return fechamentosOrdenados.value
    return fechamentosOrdenados.value.filter(m =>
      [m.titulo, m.texto].some(v => String(v || '').toLowerCase().includes(termo))
    )
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
      if (!form.horario) {
        erro.value = 'Informe o horÃ¡rio.'
        return
      }
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
    const valorSeguro = (v) => {
      const valor = String(v || '').trim()
      if (!valor || /^[_\-\s]+$/.test(valor)) return ''
      return valor
    }
    const joinPt = (items) => {
      const valid = items.filter(Boolean)
      if (valid.length <= 1) return valid[0] || ''
      return `${valid.slice(0, -1).join(', ')} e ${valid[valid.length - 1]}`
    }

    if (!form.fechamentoModo) form.fechamentoModo = 'identificacao'
    if (form.fechamentoModo === 'sem') {
      form.fechamento = ''
      return
    }
    if (form.fechamentoModo === 'personalizado') return
    if (form.fechamentoModo === 'poltrona' || form.localizacao === 'poltrona') {
      form.fechamento = 'Mantenho campainha próxima e oriento a chamar sempre que necessário.'
    } else {
      const itens = [
        valorSeguro(form.posicaoCama) && `cama ${valorSeguro(form.posicaoCama)}`,
        valorSeguro(form.rodas) && `rodas ${valorSeguro(form.rodas)}`,
        valorSeguro(form.grades) && `grades ${valorSeguro(form.grades)}`,
      ].filter(Boolean)
      const prefixo = itens.length > 0 ? `Mantenho ${joinPt(itens)}, ` : 'Mantenho '
      form.fechamento = `${prefixo}campainha próxima e oriento a chamar sempre que necessário.`
    }
  }

  function selecionarFechamentoModo(modo) {
    form.fechamentoModo = modo
    fechamentoSelecionadoKey.value = ''
    atualizarFechamento()
  }

  function _code() {
    return (auth.syncCode || '').trim()
  }

  function _fechamentosPath(code = _code()) {
    return `anotacao_inicial/${code}/fechamentos`
  }

  function _fechamentosCacheKey(code = _code()) {
    return `fechamentos_anotacao_inicial_${code}`
  }

  function _tituloFechamentoPadrao(texto = '') {
    const base = String(texto || '').replace(/\s+/g, ' ').trim()
    if (!base) return 'Fechamento'
    return base.length > 34 ? `${base.slice(0, 34)}...` : base
  }

  function _normalizarFechamentos(lista = []) {
    return _ordenarFechamentos((lista || []).map((m, idx) => {
      const texto = String(m?.texto || m?.conteudo || '').trim()
      const titulo = String(m?.titulo || '').trim() || _tituloFechamentoPadrao(texto)
      const criadoEm = Number(m?.criadoEm || 0)
      const keyBase = String(m?._key || m?.key || `${criadoEm || Date.now()}-${idx}`)
      return {
        ...m,
        _key: keyBase,
        titulo,
        texto,
        criadoEm,
        favorito: !!m?.favorito,
      }
    }).filter(m => m.texto))
  }

  function _ordenarFechamentos(lista = []) {
    return [...(lista || [])].sort((a, b) => {
      if (!!a.favorito !== !!b.favorito) return a.favorito ? -1 : 1
      return (b.criadoEm || 0) - (a.criadoEm || 0)
    })
  }

  function _salvarCacheFechamentos(code, lista) {
    try { localStorage.setItem(_fechamentosCacheKey(code), JSON.stringify(lista || [])) } catch {}
  }

  function _carregarCacheFechamentos(code) {
    try {
      const cached = JSON.parse(localStorage.getItem(_fechamentosCacheKey(code)) || '[]')
      return Array.isArray(cached) ? _normalizarFechamentos(cached) : []
    } catch {
      return []
    }
  }

  async function iniciarFechamentosModelos() {
    const code = _code()
    if (fechamentosOff) {
      fechamentosOff()
      fechamentosOff = null
    }
    if (!code) {
      fechamentosModelos.value = []
      carregandoFechamentos.value = false
      return
    }

    carregandoFechamentos.value = true
    const cached = _carregarCacheFechamentos(code)
    if (cached.length) {
      fechamentosModelos.value = cached
      carregandoFechamentos.value = false
    }

    const path = dbRef(db, _fechamentosPath(code))
    try {
      const snap = await get(path)
      const lista = []
      snap.forEach(child => { lista.push({ ...child.val(), _key: child.key }) })
      const normalizada = _normalizarFechamentos(lista)
      fechamentosModelos.value = normalizada
      _salvarCacheFechamentos(code, normalizada)
      carregandoFechamentos.value = false
    } catch {
      carregandoFechamentos.value = false
    }

    fechamentosOff = onValue(path, (snap) => {
      const lista = []
      snap.forEach(child => { lista.push({ ...child.val(), _key: child.key }) })
      const normalizada = _normalizarFechamentos(lista)
      fechamentosModelos.value = normalizada
      _salvarCacheFechamentos(code, normalizada)
      carregandoFechamentos.value = false
    }, () => { carregandoFechamentos.value = false })
  }

  async function abrirModalFechamentos() {
    modalFechamentos.value = true
    fechamentoBuscaModal.value = ''
    await iniciarFechamentosModelos()
  }

  function fecharModalFechamentos() {
    modalFechamentos.value = false
    fechamentoBuscaModal.value = ''
  }

  async function abrirModalNovoFechamento() {
    modalNovoFechamento.value = true
    novoFechamentoTitulo.value = ''
    novoFechamentoTexto.value = form.fechamento || ''
    await nextTick()
    novoFechamentoTituloInput.value?.focus()
  }

  function fecharModalNovoFechamento() {
    modalNovoFechamento.value = false
    novoFechamentoTitulo.value = ''
    novoFechamentoTexto.value = ''
  }

  async function salvarFechamentoModelo() {
    const code = _code()
    const titulo = novoFechamentoTitulo.value.trim()
    const texto = novoFechamentoTexto.value.trim()
    if (!titulo || !texto) return
    if (!code) { showToast('Sessão inválida'); return }

    salvandoFechamentoModelo.value = true
    const data = { titulo, texto, criadoEm: Date.now(), favorito: false }
    try {
      const novoRef = await push(dbRef(db, _fechamentosPath(code)), data)
      fechamentosModelos.value = _normalizarFechamentos([
        ...fechamentosModelos.value,
        { ...data, _key: novoRef.key },
      ])
      _salvarCacheFechamentos(code, fechamentosModelos.value)
      fecharModalNovoFechamento()
      showToast('Modelo de fechamento salvo!')
    } catch {
      showToast('Erro ao salvar modelo')
    } finally {
      salvandoFechamentoModelo.value = false
    }
  }

  async function deletarFechamentoModelo(key) {
    const code = _code()
    if (!code || !key) { showToast('Sessão inválida'); return }
    const anterior = fechamentosModelos.value
    fechamentosModelos.value = fechamentosModelos.value.filter(m => m._key !== key)
    if (fechamentoSelecionadoKey.value === key) fechamentoSelecionadoKey.value = ''
    _salvarCacheFechamentos(code, fechamentosModelos.value)
    try {
      await remove(dbRef(db, `${_fechamentosPath(code)}/${key}`))
      showToast('Modelo removido')
    } catch {
      fechamentosModelos.value = anterior
      _salvarCacheFechamentos(code, anterior)
      showToast('Erro ao remover modelo')
    }
  }

  async function alternarFechamentoFavorito(modelo) {
    const code = _code()
    if (!code || !modelo?._key) { showToast('Sessão inválida'); return }
    const favorito = !modelo.favorito
    fechamentosModelos.value = _normalizarFechamentos(fechamentosModelos.value.map(m =>
      m._key === modelo._key ? { ...m, favorito } : m
    ))
    _salvarCacheFechamentos(code, fechamentosModelos.value)
    try {
      await update(dbRef(db, `${_fechamentosPath(code)}/${modelo._key}`), { favorito })
    } catch {
      showToast('Erro ao atualizar favorito')
    }
  }

  function selecionarFechamentoModelo(modelo) {
    if (!modelo?._key) return
    if (fechamentoSelecionadoKey.value === modelo._key) {
      fechamentoSelecionadoKey.value = ''
      return
    }
    fechamentoSelecionadoKey.value = modelo._key
    form.fechamentoModo = 'personalizado'
    form.fechamento = modelo.texto || ''
  }

  // ── Geração de texto ──────────────────────────────────────────────────────
  function gerar() {
    erro.value = ''
    if (!form.horario) {
      erro.value = 'Informe o horário.'
      return
    }
    if (form.fechamentoModo !== 'personalizado' || !form.fechamento.trim()) atualizarFechamento()
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
      queixas:'', obsApresenta:'', fechamentoModo:'identificacao', fechamento:'',
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
    carregandoFechamentos,
    salvandoFechamentoModelo,
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
    // modelos de fechamento
    modalFechamentos,
    modalNovoFechamento,
    fechamentosModelos,
    fechamentoSelecionadoKey,
    fechamentoBusca,
    fechamentoBuscaModal,
    novoFechamentoTitulo,
    novoFechamentoTexto,
    novoFechamentoTituloInput,
    podeSalvarFechamentoModelo,
    fechamentosFavoritos,
    fechamentosFiltrados,
    fechamentosGerenciamentoFiltrados,
    iniciarFechamentosModelos,
    abrirModalFechamentos,
    fecharModalFechamentos,
    abrirModalNovoFechamento,
    fecharModalNovoFechamento,
    salvarFechamentoModelo,
    deletarFechamentoModelo,
    alternarFechamentoFavorito,
    selecionarFechamentoModelo,
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
    selecionarFechamentoModo,
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
