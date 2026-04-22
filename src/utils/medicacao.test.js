import { describe, it, expect } from 'vitest'
import {
  inserirNaColecaoMedicacao,
  mesclarColecoesMedicacao,
  prepararProximaMedicacao,
  gerarTextoMedicacao,
  extrairTemplateMedicacao,
} from './medicacao.js'

describe('medicacao storage', () => {
  it('mescla local e remoto sem deixar remoto antigo apagar item mais novo', () => {
    const local = {
      updatedAt: 200,
      items: [
        { nome: 'dipirona', dose: '1', unidade: 'g', via: 'VO', updatedAt: 200 },
      ],
    }

    const remoto = {
      updatedAt: 100,
      items: [
        { nome: 'dipirona', dose: '500', unidade: 'mg', via: 'VO', updatedAt: 100 },
      ],
    }

    const mesclado = mesclarColecoesMedicacao(local, remoto, 10)

    expect(mesclado.items).toHaveLength(2)
    expect(mesclado.items[0]).toMatchObject({ nome: 'dipirona', dose: '1', unidade: 'g', via: 'VO' })
  })

  it('mantem dois esquemas EV diferentes como entradas distintas', () => {
    let colecao = { updatedAt: 0, items: [] }

    colecao = inserirNaColecaoMedicacao(colecao, {
      nome: 'ceftriaxona',
      dose: '1',
      unidade: 'g',
      via: 'EV',
      evDiluicao: true,
      evVolume: '100',
      evSolucao: 'SF',
    }, 10)

    colecao = inserirNaColecaoMedicacao(colecao, {
      nome: 'ceftriaxona',
      dose: '1',
      unidade: 'g',
      via: 'EV',
      evDiluicao: true,
      evVolume: '50',
      evSolucao: 'SF',
    }, 10)

    expect(colecao.items).toHaveLength(2)
  })

  it('preserva dados de lote no template reaproveitavel sem criar chave nova por lote', () => {
    const template = extrairTemplateMedicacao({
      nome: 'imunoglobulina',
      dose: '5',
      unidade: 'g',
      via: 'EV',
      evDiluicao: true,
      evVolume: '100',
      evSolucao: 'SF',
      loteAtivo: true,
      loteFrasco: '2',
      lote: 'ABC123',
      loteFabricacao: '10/2024',
      loteValidade: '10/2026',
      loteMarca: 'CSL Behring',
    })

    expect(template).toMatchObject({
      nome: 'imunoglobulina',
      loteAtivo: true,
      loteFrasco: '2',
      lote: 'ABC123',
      loteFabricacao: '10/2024',
      loteValidade: '10/2026',
      loteMarca: 'CSL Behring',
    })
  })
})

describe('medicacao quick flow', () => {
  it('prepara a proxima medicacao mantendo o contexto util e limpando dose', () => {
    const proxima = prepararProximaMedicacao({
      nome: 'dipirona',
      dose: '1',
      unidade: 'g',
      via: 'VO',
    })

    expect(proxima.via).toBe('VO')
    expect(proxima.unidade).toBe('g')
    expect(proxima.dose).toBe('')
    expect(proxima.nome).toBe('')
  })
})

describe('gerarTextoMedicacao', () => {
  it('mantem a via explicita em cada medicamento do texto final', () => {
    const texto = gerarTextoMedicacao({
      horario: '08:00',
      conferencia: '',
      orienta: false,
      conformeTipo: 'prescricao',
      conformeNome: '',
      medicamentos: [
        { nome: 'Dipirona', dose: '1', unidade: 'g', via: 'VO' },
        { nome: 'Omeprazol', dose: '40', unidade: 'mg', via: 'VO' },
        { nome: 'Furosemida', dose: '40', unidade: 'mg', via: 'VO' },
      ],
    })

    expect(texto).toContain('dipirona 1g VO')
    expect(texto).toContain('omeprazol 40mg VO')
    expect(texto).toContain('furosemida 40mg VO')
  })
})
