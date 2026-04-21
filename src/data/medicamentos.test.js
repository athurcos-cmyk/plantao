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

  it('prioriza historico do usuario quando houver correspondencia', () => {
    const sugestoes = sugerirMedicamentosDetalhados('ome', [
      { nome: 'omeprazol', dose: '40', unidade: 'mg', via: 'VO', updatedAt: 999 },
    ], 8)

    expect(sugestoes[0].tipo).toBe('hist')
    expect(sugestoes[0].med.dose).toBe('40')
    expect(sugestoes[0].med.via).toBe('VO')
  })
})
