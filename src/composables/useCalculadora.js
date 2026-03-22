import { reactive, ref, computed, watch, onUnmounted } from 'vue'

// ── Helpers ──────────────────────────────────────────────────────────────────

function parseNum(val) {
  if (val === '' || val === null || val === undefined) return NaN
  let s = String(val).trim()
  if (s.includes(',')) {
    // pt-BR: ponto é separador de milhar, vírgula é decimal
    // "5.000,00" → "5000.00" | "2,4" → "2.4"
    s = s.replace(/\./g, '').replace(',', '.')
  }
  return parseFloat(s)
}

function fmt(n, casas = 2) {
  if (n === null || isNaN(n) || !isFinite(n)) return '--'
  const s = n.toFixed(casas)
  // Remove zeros desnecessários: 2.40 → 2,4 | 2.00 → 2
  return s.replace(/\.?0+$/, '').replace('.', ',')
}

// ── Histórico (localStorage) ─────────────────────────────────────────────────

const HIST_KEY = 'calc_historico'
const MAX_HIST = 5

function carregarHistorico() {
  try {
    return JSON.parse(localStorage.getItem(HIST_KEY) || '[]')
  } catch {
    return []
  }
}

function salvarHistorico(lista) {
  try {
    localStorage.setItem(HIST_KEY, JSON.stringify(lista.slice(0, MAX_HIST)))
  } catch { /* localStorage indisponível */ }
}

// ── Estado global (singleton) ─────────────────────────────────────────────────

const aberta    = ref(false)
const abaAtiva  = ref('dosagem')

const dosagem = reactive({
  prescrita:  '',
  disponivel: '',
  volume:     '',
  unidade:    'mg',
})

const gotej = reactive({
  volume:    '',
  tempo:     '',
  equipo:    'macro',  // 'macro' | 'micro'
  unidTempo: 'horas',  // 'horas' | 'minutos'
})

const diluicao = reactive({
  qtdMed:       '',    // quantidade do medicamento no frasco (mg/g/UI/mEq)
  unidMed:      'mg',
  diluente:     '',    // volume de diluente adicionado (mL)
  volumePo:     '',    // volume do pó liofilizado (mL) — opcional, ver bula
  dosePrescrita:'',    // dose prescrita para calcular volume a aspirar
})

const historico = reactive(carregarHistorico())

// ── Computed: Dosagem ─────────────────────────────────────────────────────────

const resultDosagem = computed(() => {
  const p = parseNum(dosagem.prescrita)
  const d = parseNum(dosagem.disponivel)
  const v = parseNum(dosagem.volume)
  if (isNaN(p) || isNaN(d) || isNaN(v)) return null
  if (p < 0 || d <= 0 || v <= 0) return null
  return (p / d) * v
})

const resultDosagemFmt = computed(() =>
  resultDosagem.value === null ? '--' : fmt(resultDosagem.value) + ' ml'
)

// ── Computed: Gotejamento ─────────────────────────────────────────────────────

const resultGotejamento = computed(() => {
  const vt = parseNum(gotej.volume)
  const t  = parseNum(gotej.tempo)
  if (isNaN(vt) || isNaN(t) || t <= 0 || vt <= 0) return null

  if (gotej.equipo === 'macro') {
    // 1 mL = 20 gotas; gotas/min = (Vt × 20) / T_min
    return gotej.unidTempo === 'horas'
      ? (vt * 20) / (t * 60)   // T_min = T_h × 60
      : (vt * 20) / t
  } else {
    // 1 mL = 60 microgotas; microgotas/min = (Vt × 60) / T_min
    return gotej.unidTempo === 'horas'
      ? vt / t                  // = mL/h (numericamente igual a microgotas/min)
      : (vt * 60) / t
  }
})

const unidadeGotejamento = computed(() =>
  gotej.equipo === 'micro' ? 'microgotas/min' : 'gotas/min'
)

const resultGotejamentoFmt = computed(() => {
  if (resultGotejamento.value === null) return '--'
  const v = Math.round(resultGotejamento.value * 10) / 10
  const label = unidadeGotejamento.value
  if (gotej.equipo === 'micro') {
    // Microgotas/min é numericamente igual a mL/h — mostrar os dois
    return `${fmt(v, 0)} ${label}  =  ${fmt(v, 1)} ml/h`
  }
  return `${fmt(v, 0)} ${label}`
})

// ── Computed: Diluição ────────────────────────────────────────────────────────

const resultDiluicao = computed(() => {
  const qtd      = parseNum(diluicao.qtdMed)
  const dil      = parseNum(diluicao.diluente)
  const vPo      = parseNum(diluicao.volumePo) || 0   // default 0 se vazio
  const dose     = parseNum(diluicao.dosePrescrita)

  if (isNaN(qtd) || isNaN(dil) || qtd <= 0 || dil <= 0) return null

  const volTotal  = dil + Math.max(0, vPo)  // volumePo nunca negativo
  const conc      = qtd / volTotal     // mg/mL (ou unidade/mL)
  const volAspira = isNaN(dose) || dose === 0 ? null : dose / conc

  return { conc, volTotal, volAspira }
})

const resultDiluicaoFmt = computed(() => {
  const r = resultDiluicao.value
  if (!r) return null
  return {
    concentracao: fmt(r.conc) + ' ' + diluicao.unidMed + '/ml',
    volTotal:     fmt(r.volTotal) + ' ml',
    volAspira:    r.volAspira !== null ? fmt(r.volAspira) + ' ml' : null,
  }
})

// ── Ações ─────────────────────────────────────────────────────────────────────

function toggleCalculadora() {
  aberta.value = !aberta.value
}

function resetar() {
  Object.assign(dosagem, { prescrita: '', disponivel: '', volume: '', unidade: 'mg' })
  Object.assign(gotej, { volume: '', tempo: '', equipo: 'macro', unidTempo: 'horas' })
  Object.assign(diluicao, { qtdMed: '', unidMed: 'mg', diluente: '', volumePo: '', dosePrescrita: '' })
  abaAtiva.value = 'dosagem'
}

// Ao trocar unidade de dose → limpa campos de dosagem (sem conversão automática)
watch(() => dosagem.unidade, () => {
  dosagem.prescrita  = ''
  dosagem.disponivel = ''
  dosagem.volume     = ''
})

// Ao trocar unidade de diluição → limpa campos de diluição
watch(() => diluicao.unidMed, () => {
  diluicao.qtdMed        = ''
  diluicao.dosePrescrita = ''
})

// Ao fechar modal → reseta estado
watch(aberta, (val) => {
  if (!val) resetar()
})

function adicionarHistorico(entrada) {
  historico.unshift(entrada)
  if (historico.length > MAX_HIST) historico.splice(MAX_HIST)
  salvarHistorico([...historico])
}

function salvarNoHistorico() {
  const aba = abaAtiva.value
  if (aba === 'dosagem' && resultDosagem.value !== null) {
    adicionarHistorico({
      tipo: 'dosagem',
      resumo: `${dosagem.prescrita}${dosagem.unidade} de ${dosagem.disponivel}${dosagem.unidade}/${dosagem.volume}ml → ${resultDosagemFmt.value}`,
      timestamp: Date.now(),
    })
  } else if (aba === 'gotejamento' && resultGotejamento.value !== null) {
    adicionarHistorico({
      tipo: 'gotejamento',
      resumo: `${gotej.volume}ml / ${gotej.tempo}${gotej.unidTempo === 'horas' ? 'h' : 'min'} (${gotej.equipo}) → ${resultGotejamentoFmt.value}`,
      timestamp: Date.now(),
    })
  } else if (aba === 'diluicao' && resultDiluicao.value !== null) {
    const r = resultDiluicaoFmt.value
    adicionarHistorico({
      tipo: 'diluicao',
      resumo: `${diluicao.qtdMed}${diluicao.unidMed} / ${r.volTotal} → ${r.concentracao}${r.volAspira ? ' | ' + r.volAspira : ''}`,
      timestamp: Date.now(),
    })
  }
}

function limparHistorico() {
  historico.splice(0)
  salvarHistorico([])
}

// ── Scroll lock helper (usado pelo componente) ────────────────────────────────

function useScrollLock() {
  watch(aberta, (val) => {
    document.body.style.overflow = val ? 'hidden' : ''
  })
  onUnmounted(() => {
    document.body.style.overflow = ''
  })
}

// ── Export ────────────────────────────────────────────────────────────────────

export function useCalculadora() {
  return {
    // Estado
    aberta, abaAtiva,
    dosagem, gotej, diluicao,
    historico,
    // Computed
    resultDosagem, resultDosagemFmt,
    resultGotejamento, resultGotejamentoFmt, unidadeGotejamento,
    resultDiluicao, resultDiluicaoFmt,
    // Ações
    toggleCalculadora, resetar,
    salvarNoHistorico, limparHistorico,
    useScrollLock,
    // Helpers para testes
    parseNum, fmt,
  }
}
