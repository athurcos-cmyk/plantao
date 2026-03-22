import { describe, it, expect, beforeEach } from 'vitest'
import { nextTick } from 'vue'
import { useCalculadora } from './useCalculadora.js'

// O composable é um singleton — resetar antes de cada teste
const calc = useCalculadora()
beforeEach(() => calc.resetar())

// ── parseNum ──────────────────────────────────────────────────────────────────
describe('parseNum', () => {
  const { parseNum } = useCalculadora()

  it('converte string com ponto decimal', () => expect(parseNum('2.4')).toBeCloseTo(2.4))
  it('converte string com vírgula (pt-BR)', () => expect(parseNum('2,4')).toBeCloseTo(2.4))
  it('retorna NaN para string vazia', () => expect(isNaN(parseNum(''))).toBe(true))
  it('retorna NaN para undefined', () => expect(isNaN(parseNum(undefined))).toBe(true))
  it('retorna NaN para texto', () => expect(isNaN(parseNum('abc'))).toBe(true))
  // BUG 4 — separador de milhar pt-BR com vírgula decimal
  it('trata separador de milhar: "5.000,00" → 5000', () => expect(parseNum('5.000,00')).toBeCloseTo(5000))
  it('trata separador de milhar: "1.234,56" → 1234.56', () => expect(parseNum('1.234,56')).toBeCloseTo(1234.56))
  it('trata "5.000.000" (sem vírgula) → parseFloat pára no 2º ponto, mas avisa: sem correção automática', () => {
    // Sem vírgula, não há como saber se ponto é milhar ou decimal
    // Valor esperado: 5 (parseFloat comportamento nativo) — o teste documenta a limitação
    expect(parseNum('5.000.000')).toBe(5)
  })
})

// ── fmt ───────────────────────────────────────────────────────────────────────
describe('fmt', () => {
  const { fmt } = useCalculadora()

  it('formata número com vírgula pt-BR', () => expect(fmt(2.4)).toBe('2,4'))
  it('remove zeros desnecessários: 2.00 → 2', () => expect(fmt(2.0)).toBe('2'))
  it('retorna -- para NaN', () => expect(fmt(NaN)).toBe('--'))
  it('retorna -- para null', () => expect(fmt(null)).toBe('--'))
  it('retorna -- para Infinity', () => expect(fmt(Infinity)).toBe('--'))
})

// ── Dosagem ───────────────────────────────────────────────────────────────────
describe('dosagem — regra de três', () => {
  it('60mg de 125mg/5ml → 2,4 ml', async () => {
    calc.dosagem.prescrita  = '60'
    calc.dosagem.disponivel = '125'
    calc.dosagem.volume     = '5'
    await nextTick()
    expect(calc.resultDosagem.value).toBeCloseTo(2.4)
    expect(calc.resultDosagemFmt.value).toBe('2,4 ml')
  })

  it('resultado null se prescrita vazio', async () => {
    calc.dosagem.prescrita  = ''
    calc.dosagem.disponivel = '125'
    calc.dosagem.volume     = '5'
    await nextTick()
    expect(calc.resultDosagem.value).toBeNull()
    expect(calc.resultDosagemFmt.value).toBe('--')
  })

  it('resultado null se disponivel = 0', async () => {
    calc.dosagem.prescrita  = '60'
    calc.dosagem.disponivel = '0'
    calc.dosagem.volume     = '5'
    await nextTick()
    expect(calc.resultDosagem.value).toBeNull()
  })

  // BUG 1 — entradas negativas
  it('resultado null se disponivel negativo (não exibe dose negativa)', async () => {
    calc.dosagem.prescrita  = '60'
    calc.dosagem.disponivel = '-125'
    calc.dosagem.volume     = '5'
    await nextTick()
    expect(calc.resultDosagem.value).toBeNull()
  })

  it('resultado null se volume negativo', async () => {
    calc.dosagem.prescrita  = '60'
    calc.dosagem.disponivel = '125'
    calc.dosagem.volume     = '-5'
    await nextTick()
    expect(calc.resultDosagem.value).toBeNull()
  })

  it('resultado null se prescrita negativa', async () => {
    calc.dosagem.prescrita  = '-60'
    calc.dosagem.disponivel = '125'
    calc.dosagem.volume     = '5'
    await nextTick()
    expect(calc.resultDosagem.value).toBeNull()
  })

  it('aceita vírgula como decimal: 2,5mg de 5mg/10ml → 5 ml', async () => {
    calc.dosagem.prescrita  = '2,5'
    calc.dosagem.disponivel = '5'
    calc.dosagem.volume     = '10'
    await nextTick()
    expect(calc.resultDosagem.value).toBeCloseTo(5)
  })
})

// ── Gotejamento ───────────────────────────────────────────────────────────────
describe('gotejamento', () => {
  it('macrogotas + horas: 500ml/4h → 41,67 gotas/min', async () => {
    calc.gotej.volume    = '500'
    calc.gotej.tempo     = '4'
    calc.gotej.equipo    = 'macro'
    calc.gotej.unidTempo = 'horas'
    await nextTick()
    expect(calc.resultGotejamento.value).toBeCloseTo(41.67, 1)
  })

  it('macrogotas + minutos: 100ml/30min → 66,67 gotas/min', async () => {
    calc.gotej.volume    = '100'
    calc.gotej.tempo     = '30'
    calc.gotej.equipo    = 'macro'
    calc.gotej.unidTempo = 'minutos'
    await nextTick()
    expect(calc.resultGotejamento.value).toBeCloseTo(66.67, 1)
  })

  it('microgotas + horas: 100ml/1h → 100 microgotas/min (= ml/h)', async () => {
    calc.gotej.volume    = '100'
    calc.gotej.tempo     = '1'
    calc.gotej.equipo    = 'micro'
    calc.gotej.unidTempo = 'horas'
    await nextTick()
    expect(calc.resultGotejamento.value).toBeCloseTo(100)
  })

  it('microgotas + minutos: 60ml/60min → 60 microgotas/min', async () => {
    calc.gotej.volume    = '60'
    calc.gotej.tempo     = '60'
    calc.gotej.equipo    = 'micro'
    calc.gotej.unidTempo = 'minutos'
    await nextTick()
    expect(calc.resultGotejamento.value).toBeCloseTo(60)
  })

  it('resultado null se tempo = 0', async () => {
    calc.gotej.volume    = '500'
    calc.gotej.tempo     = '0'
    calc.gotej.equipo    = 'macro'
    calc.gotej.unidTempo = 'horas'
    await nextTick()
    expect(calc.resultGotejamento.value).toBeNull()
  })

  // BUG 2 — tempo negativo
  it('resultado null se tempo negativo (não exibe gotas negativas)', async () => {
    calc.gotej.volume    = '500'
    calc.gotej.tempo     = '-4'
    calc.gotej.equipo    = 'macro'
    calc.gotej.unidTempo = 'horas'
    await nextTick()
    expect(calc.resultGotejamento.value).toBeNull()
  })

  it('resultado null se volume negativo', async () => {
    calc.gotej.volume    = '-500'
    calc.gotej.tempo     = '4'
    calc.gotej.equipo    = 'macro'
    calc.gotej.unidTempo = 'horas'
    await nextTick()
    expect(calc.resultGotejamento.value).toBeNull()
  })
})

// ── Diluição ──────────────────────────────────────────────────────────────────
describe('diluição', () => {
  it('1000mg em 10ml → 100 mg/ml', async () => {
    calc.diluicao.qtdMed   = '1000'
    calc.diluicao.diluente = '10'
    await nextTick()
    expect(calc.resultDiluicao.value?.conc).toBeCloseTo(100)
  })

  it('Pen. Cristalina 5M UI: diluente 8ml + vol. pó 2ml → 500.000 UI/ml', async () => {
    calc.diluicao.qtdMed   = '5000000'
    calc.diluicao.diluente = '8'
    calc.diluicao.volumePo = '2'
    await nextTick()
    expect(calc.resultDiluicao.value?.volTotal).toBeCloseTo(10)
    expect(calc.resultDiluicao.value?.conc).toBeCloseTo(500000)
  })

  it('calcula volume a aspirar com dose prescrita', async () => {
    calc.diluicao.qtdMed        = '1000'
    calc.diluicao.diluente      = '10'
    calc.diluicao.dosePrescrita = '150'
    await nextTick()
    // conc = 100mg/ml; 150mg / 100 = 1,5ml
    expect(calc.resultDiluicao.value?.volAspira).toBeCloseTo(1.5)
  })

  it('resultado null se qtdMed vazio', async () => {
    calc.diluicao.diluente = '10'
    await nextTick()
    expect(calc.resultDiluicao.value).toBeNull()
  })

  // BUG 3 — diluente negativo
  it('resultado null se diluente negativo (não exibe concentração negativa)', async () => {
    calc.diluicao.qtdMed   = '1000'
    calc.diluicao.diluente = '-8'
    await nextTick()
    expect(calc.resultDiluicao.value).toBeNull()
  })

  it('volumePo negativo é tratado como 0 (não subtrai do volume total)', async () => {
    calc.diluicao.qtdMed   = '1000'
    calc.diluicao.diluente = '10'
    calc.diluicao.volumePo = '-2'
    await nextTick()
    // volTotal deve ser 10+0=10, não 10+(-2)=8
    expect(calc.resultDiluicao.value?.volTotal).toBeCloseTo(10)
    expect(calc.resultDiluicao.value?.conc).toBeCloseTo(100)
  })
})

// ── Reset ─────────────────────────────────────────────────────────────────────
describe('resetar', () => {
  it('limpa todos os campos', async () => {
    calc.dosagem.prescrita  = '60'
    calc.gotej.volume       = '500'
    calc.diluicao.qtdMed    = '1000'
    calc.resetar()
    await nextTick()
    expect(calc.dosagem.prescrita).toBe('')
    expect(calc.gotej.volume).toBe('')
    expect(calc.diluicao.qtdMed).toBe('')
  })
})
