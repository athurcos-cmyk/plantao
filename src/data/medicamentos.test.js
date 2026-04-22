import { describe, it, expect } from 'vitest'
import { listarPresetsCatalogo, sugerirMedicamentosDetalhados } from './medicamentos.js'

describe('medicamentos catalogo enriquecido', () => {
  it('retorna presets comuns por medicamento', () => {
    const presets = listarPresetsCatalogo('omeprazol')

    expect(presets.length).toBeGreaterThan(0)
    expect(presets.some((item) => item.med.via === 'EV')).toBe(true)
    expect(presets.some((item) => item.med.dose === '40')).toBe(true)
  })

  it('oferece sugestao detalhada do catalogo com dose e via', () => {
    const sugestoes = sugerirMedicamentosDetalhados('dipi', [], 8)
    const catalogo = sugestoes.find((item) => item.tipo === 'catalogo')

    expect(catalogo).toBeTruthy()
    expect(catalogo.med.nome).toBe('dipirona')
    expect(catalogo.rotulo).toContain('VO')
  })

  it('oferece vias comuns mesmo sem dose pronta e limita atalhos por medicamento', () => {
    const presets = listarPresetsCatalogo('lactulose')

    expect(presets.length).toBeLessThanOrEqual(4)
    expect(presets.some((item) => item.med.via === 'VO')).toBe(true)
    expect(presets.some((item) => item.med.via === 'SNE')).toBe(true)
    expect(presets.every((item) => item.tipo === 'catalogo')).toBe(true)
  })

  it('mistura presets completos com vias comuns sem duplicar via desnecessariamente', () => {
    const presets = listarPresetsCatalogo('dipirona')

    expect(presets.length).toBeLessThanOrEqual(4)
    expect(presets.some((item) => item.med.dose === '1' && item.med.via === 'EV')).toBe(true)
    expect(presets.filter((item) => item.med.via === 'VO').length).toBeGreaterThan(0)
  })

  it('prioriza historico do usuario quando houver correspondencia', () => {
    const sugestoes = sugerirMedicamentosDetalhados('ome', [
      { nome: 'omeprazol', dose: '40', unidade: 'mg', via: 'VO', updatedAt: 999 },
    ], 8)

    expect(sugestoes[0].tipo).toBe('hist')
    expect(sugestoes[0].med.dose).toBe('40')
    expect(sugestoes[0].med.via).toBe('VO')
  })

  it('inclui sugestao detalhada de catalogo por via comum para medicamento sem dose pronta', () => {
    const sugestoes = sugerirMedicamentosDetalhados('lactu', [], 8)
    const catalogo = sugestoes.find((item) => item.tipo === 'catalogo')

    expect(catalogo).toBeTruthy()
    expect(catalogo.med.nome).toBe('lactulose')
    expect(['VO', 'SNE']).toContain(catalogo.med.via)
  })
})
