import { ref, reactive, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAnotacoesStore } from '../stores/anotacoes.js'
import { gerarTexto } from '../utils/gerarTextoInicial.js'
import { useToast } from './useToast.js'

export function useAnotacaoInicial() {
  const router = useRouter()
  const store  = useAnotacoesStore()

  const { showToast } = useToast()

  const passo       = ref(1)
  const gerado      = ref(false)
  const textoGerado = ref('')
  const erro        = ref('')
  const salvando    = ref(false)
  const dragIdx     = ref(null)
  const dragOverIdx = ref(null)

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
    horario: '', sexo: 'F',
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

  // Auto-salva rascunho ao editar
  watch(form, agendarSalvarRascunho, { deep: true })

  // ── Locais centrais (ordem alfabética, padrão para CVC/Permcath) ─────────
  const locaisCentral = ['femoral D','femoral E','jugular D','jugular E','subclávia D','subclávia E']

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

  const tiposDisp = ['AVP','CVC','PICC','Permcath','Shilley','SNE','SNG','Pulseira','Monitor','Dreno','Curativo','Outros']

  const pulseiraOpcoes = [
    { v: 'identificação',         cor: '#bdbdbd' },
    { v: 'risco de queda',        cor: '#fdd835' },
    { v: 'alergia',               cor: '#e53935' },
    { v: 'precaução',             cor: '#43a047' },
    { v: 'preservação de membro', cor: '#e91e8c' }
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
      if (!form.horario)     return (erro.value = 'Informe o horário')
      if (!form.posicaoCama) return (erro.value = 'Selecione a posição da cama')
      if (!form.rodas)       return (erro.value = 'Selecione o estado das rodas')
      if (!form.grades)      return (erro.value = 'Selecione o estado das grades')
      if (!form.decubito)    return (erro.value = 'Selecione o decúbito')
      passo.value = 2
    } else if (passo.value === 2) {
      if (!form.colaboracao)  return (erro.value = 'Selecione a colaboração')
      if (form.deambulacao === 'deambula com auxílio' && !form.deambulaAuxilio)
        return (erro.value = 'Informe com qual auxílio deambula')
      if (!form.respiracao)   return (erro.value = 'Selecione a respiração')
      if ((form.respiracao === 'cateter nasal de O₂' || form.respiracao === 'máscara de O₂') && !form.oxigenioLitros)
        return (erro.value = 'Informe os litros por minuto')
      if (!form.acompanhante) return (erro.value = 'Selecione se há acompanhante')
      if (form.acompanhante === 'sim') {
        if (!form.acompanhanteNome)       return (erro.value = 'Informe o nome do acompanhante')
        if (!form.acompanhanteParentesco) return (erro.value = 'Informe o parentesco')
      }
      passo.value = 3
    } else if (passo.value === 4) {
      if (!form.evacuacaoOpcao) return (erro.value = 'Informe a última evacuação')
      if (form.evacuacaoOpcao === 'data' && !form.evacuacaoData)
        return (erro.value = 'Selecione a data da evacuação')
      if (form.diurese.length === 0 && !form.diureseObs.trim()) return (erro.value = 'Selecione ao menos uma opção de diurese ou descreva no campo livre')
      if (form.diurese.includes('SVD') && !form.svdDebito)
        return (erro.value = 'Informe o débito da SVD')
      atualizarFechamento()
      passo.value = 5
    }
  }

  function limparBloco() {
    erro.value = ''
    if (passo.value === 1) {
      Object.assign(form, { horario:'', sexo:'F', posicaoCama:'', rodas:'', grades:'', decubito:'' })
    } else if (passo.value === 2) {
      Object.assign(form, { mentalAlterado:false, mentalDesc:'', colaboracao:'',
        deambulacao:'', deambulaAuxilio:'', respPadrao:'', respiracao:'',
        oxigenioLitros:'', acompanhante:'', acompanhanteNome:'', acompanhanteParentesco:'' })
    } else if (passo.value === 4) {
      Object.assign(form, { evacuacaoOpcao:'', evacuacaoData:'', diurese:[],
        svdDebito:'', svdAspecto:'', diureseObs:'', queixas:'', obsApresenta:'' })
    }
  }

  // ── Dispositivos ──────────────────────────────────────────────────────────
  const modal = reactive({ aberto: false, tipo: '', d: {}, erro: '' })

  function abrirModal(tipo) {
    modal.tipo  = tipo
    modal.d     = { tipos: [], locais: [] }
    modal.erro  = ''
    modal.aberto = true
  }

  function fecharModal() { modal.aberto = false }

  function moverDisp(i, dir) {
    const arr = form.dispositivos
    const j   = i + dir
    if (j < 0 || j >= arr.length) return
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }

  function onDragStart(i) { dragIdx.value = i }
  function onDragOver(i)  { dragOverIdx.value = i }
  function onDrop(i) {
    if (dragIdx.value === null || dragIdx.value === i) { dragIdx.value = null; dragOverIdx.value = null; return }
    const arr  = form.dispositivos
    const item = arr.splice(dragIdx.value, 1)[0]
    arr.splice(i, 0, item)
    dragIdx.value = null
    dragOverIdx.value = null
  }

  function confirmarDisp() {
    modal.erro = ''
    const texto = buildDispTexto(modal.tipo, modal.d)
    if (texto === null) return
    form.dispositivos.push(texto)
    fecharModal()
  }

  function removerDisp(i) {
    form.dispositivos.splice(i, 1)
  }

  function infusaoTexto(d) {
    if (!d.solucao) return ''
    let t = ` recebendo ${d.solucao}`
    if (d.bic) t += ' em BIC'
    if (d.velocidade) t += ` a ${d.velocidade}ml/h`
    return t
  }

  function buildDispTexto(tipo, d) {
    const err    = (msg) => { modal.erro = msg; return null }
    const fmt    = (s)   => { if (!s) return '?/?'; const [, m, dia] = s.split('-'); return `${dia}/${m}` }
    const status = (d)   => {
      const p = []
      if (d.salinizado)   p.push('salinizado')
      if (d.heparinizado) p.push('heparinizado')
      if (d.ocluido)      p.push('ocluído')
      return p.length ? ', ' + p.join(' e ') : ''
    }
    const datado = (d) => d.datado ? `, datado de ${fmt(d.data)}` : ''

    switch (tipo) {
      case 'AVP': {
        if (!d.local) return err('Selecione o local')
        if (d.emInfusao && !d.solucao) return err('Informe a solução')
        let t = `AVP em ${d.local}`
        if (d.emInfusao) t += ',' + infusaoTexto(d)
        t += status(d) + datado(d)
        return t
      }
      case 'CVC': {
        if (!d.local)   return err('Selecione o local')
        if (!d.lumens)  return err('Selecione o número de lúmens')
        if (d.emInfusao && !d.solucao) return err('Informe a solução')
        let t = `CVC ${d.lumens} lúmen em ${d.local}`
        if (d.emInfusao) t += ',' + infusaoTexto(d)
        t += status(d) + datado(d)
        return t
      }
      case 'PICC': {
        if (!d.membro)  return err('Selecione o membro')
        if (!d.lumens)  return err('Selecione o número de lúmens')
        if (d.emInfusao && !d.solucao) return err('Informe a solução')
        let t = `PICC ${d.lumens} lúmen em ${d.membro}`
        if (d.emInfusao) t += ',' + infusaoTexto(d)
        t += status(d) + datado(d)
        return t
      }
      case 'Permcath':
      case 'Shilley': {
        if (!d.local) return err('Selecione o local')
        if (d.emInfusao && !d.solucao) return err('Informe a solução')
        let t = `${tipo} em ${d.local}`
        if (d.emInfusao) t += ',' + infusaoTexto(d)
        t += status(d) + datado(d)
        return t
      }
      case 'SNE': {
        if (!d.narina)   return err('Selecione a narina')
        if (!d.marcacao) return err('Informe a marcação')
        if (!d.status)   return err('Selecione o status')
        if (!d.dieta)    return err('Selecione se há dieta enteral')
        if (d.dieta === 'sim' && !d.velocidadeDieta) return err('Informe a velocidade da dieta enteral')
        const nar = d.narina === 'D' ? 'direita' : 'esquerda'
        let t = `SNE em narina ${nar}, marcação ${d.marcacao}cm, ${d.status}`
        if (d.dieta === 'sim') t += `, recebendo dieta enteral a ${d.velocidadeDieta}ml/h`
        return t
      }
      case 'SNG': {
        if (!d.narina)   return err('Selecione a narina')
        if (!d.marcacao) return err('Informe a marcação')
        if (!d.modo)     return err('Selecione o modo')
        if (d.modo === 'dieta' && !d.velocidadeDieta) return err('Informe a velocidade da dieta enteral')
        if (d.modo === 'dren' && d.debito === 'com' && !d.debitoVal) return err('Informe o volume do débito')
        const nar = d.narina === 'D' ? 'direita' : 'esquerda'
        let t = `SNG em narina ${nar}, marcação ${d.marcacao}cm`
        if (d.modo === 'aberta')  t += ', aberta'
        else if (d.modo === 'fechada') t += ', fechada'
        else if (d.modo === 'dieta') t += `, recebendo dieta enteral a ${d.velocidadeDieta}ml/h`
        else if (d.modo === 'dren') {
          if (!d.debito) return err('Selecione o débito')
          t += ', em drenagem'
          t += d.debito === 'com' ? `, com débito de ${d.debitoVal}ml` : ', sem débito'
          if (d.debito === 'com' && d.aspecto) t += `, aspecto ${d.aspecto}`
        }
        return t
      }
      case 'Pulseira': {
        if (!d.membro) return err('Selecione o membro')
        if (!d.tipos || d.tipos.length === 0) return err('Selecione ao menos um tipo')
        return `pulseira(s) de ${d.tipos.join(', ')} em ${d.membro}`
      }
      case 'Monitor': {
        if (!d.tipoMonitor) return err('Selecione o tipo')
        return `em uso de ${d.tipoMonitor}`
      }
      case 'Dreno': {
        if (!d.drenoTipo)  return err('Informe o tipo do dreno')
        if (!d.drenoLocal) return err('Informe a localização')
        let t = `dreno de ${d.drenoTipo} em ${d.drenoLocal}`
        if (d.drenoAspecto) t += `, aspecto ${d.drenoAspecto}`
        if (d.drenoDebito)  t += `, débito de ${d.drenoDebito}ml`
        if (d.seloAgua)     t += `, com selo d'água${d.seloDebito ? ' (' + d.seloDebito + 'ml)' : ''}`
        return t
      }
      case 'Curativo': {
        const locais = d.locais || []
        if (locais.length === 0 && !d.localTexto) return err('Informe ao menos um local')
        if (!d.condicao) return err('Informe a condição do curativo')
        // plural automático
        const partes = []
        const temMSD = locais.includes('MSD'), temMSE = locais.includes('MSE')
        const temMID = locais.includes('MID'), temMIE = locais.includes('MIE')
        if (temMSD && temMSE) partes.push('MMSS')
        else { if (temMSD) partes.push('MSD'); if (temMSE) partes.push('MSE') }
        if (temMID && temMIE) partes.push('MMII')
        else { if (temMID) partes.push('MID'); if (temMIE) partes.push('MIE') }
        if (d.localTexto) partes.push(d.localTexto)
        const loc = partes.length === 1 ? partes[0] : `${partes.slice(0,-1).join(', ')} e ${partes[partes.length-1]}`
        let t = `curativo oclusivo em ${loc}`
        if (d.enfaixamento) t += ' com enfaixamento'
        t += `, ${d.condicao}`
        return t
      }
      default: {
        if (!d.descricao) return err('Descreva o dispositivo')
        return d.descricao
      }
    }
  }

  // ── Fechamento automático ─────────────────────────────────────────────────
  function atualizarFechamento() {
    const p = form.posicaoCama || '___'
    const r = form.rodas       || '___'
    const g = form.grades      || '___'
    form.fechamento = `Mantenho cama ${p}, rodas ${r}, grades ${g}, campainha próxima e oriento a chamar sempre que necessário.`
  }

  // ── Geração de texto ──────────────────────────────────────────────────────
  function gerar() {
    erro.value = ''
    if (!form.fechamento) atualizarFechamento()
    textoGerado.value = gerarTexto(form)
    gerado.value = true
  }

  // ── Ações ─────────────────────────────────────────────────────────────────
  async function salvar() {
    salvando.value = true
    try {
      await store.salvar({ tipo: 'inicial', texto: textoGerado.value,
        nome: form.nomePaciente, leito: form.leitoPaciente })
      mostrarFeedback('✓ Salvo no histórico!')
    } catch {
      mostrarFeedback('Erro ao salvar. Tente novamente.')
    } finally {
      salvando.value = false
    }
  }

  function copiar() {
    navigator.clipboard.writeText(textoGerado.value)
      .then(() => mostrarFeedback('✓ Copiado!'))
      .catch(() => mostrarFeedback('Erro ao copiar'))
  }

  function compartilhar() {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(textoGerado.value)}`
    window.open(url, '_blank')
  }

  function novaAnotacao() {
    Object.assign(form, {
      horario:'', sexo:'F', posicaoCama:'', rodas:'', grades:'', decubito:'',
      mentalAlterado:false, mentalDesc:'', colaboracao:'', deambulacao:'',
      deambulaAuxilio:'', respPadrao:'', respiracao:'', oxigenioLitros:'',
      acompanhante:'', acompanhanteNome:'', acompanhanteParentesco:'',
      dispositivos:[],
      evacuacaoOpcao:'', evacuacaoData:'', diurese:[], svdDebito:'', svdAspecto:'', diureseObs:'',
      queixas:'', obsApresenta:'', fechamento:'',
      nomePaciente:'', leitoPaciente:''
    })
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
