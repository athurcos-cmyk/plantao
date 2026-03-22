import { describe, it, expect } from 'vitest'
import { gerarTexto } from './gerarTextoInicial.js'

const formBase = {
  horario: '07:00',
  sexo: 'F',
  posicaoCama: 'baixa',
  rodas: 'travadas',
  grades: 'totalmente elevadas',
  decubito: 'dorsal',
  mentalAlterado: true,
  mentalDesc: 'agitada',
  colaboracao: 'sendo colaborativa',
  deambulacao: 'não deambula',
  deambulaAuxilio: '',
  respPadrao: 'eupneica',
  respiracao: 'em ar ambiente',
  oxigenioLitros: '',
  acompanhante: 'sim',
  acompanhanteNome: 'Maria',
  acompanhanteParentesco: 'filha',
  dispositivos: ['AVP em MSE'],
  obsApresenta: 'edema em MMII',
  evacuacaoOpcao: 'hoje',
  evacuacaoData: '',
  diurese: ['banheiro'],
  svdDebito: '',
  svdAspecto: '',
  diureseObs: '',
  queixas: 'refere dor abdominal',
  fechamento: 'Mantenho cama baixa, rodas travadas, grades totalmente elevadas, campainha próxima e oriento a chamar sempre que necessário.',
}

describe('gerarTexto — comportamento padrão (sem camposAtivos)', () => {
  it('inclui todos os campos quando camposAtivos está vazio (defaults all on)', () => {
    const texto = gerarTexto(formBase)
    expect(texto).toContain('cama baixa')
    expect(texto).toContain('Aparentemente agitada')
    expect(texto).toContain('eupneica em ar ambiente')
    expect(texto).toContain('acompanhada de filha Maria')
    expect(texto).toContain('Mantém AVP em MSE')
    expect(texto).toContain('Apresenta edema em MMII')
    expect(texto).toContain('Refere última evacuação hoje')
    expect(texto).toContain('diurese espontânea ao banheiro')
    expect(texto).toContain('refere dor abdominal')
  })
})

describe('gerarTexto — campos individuais desligados', () => {
  it('omite posicaoCama quando false', () => {
    const texto = gerarTexto(formBase, { posicaoCama: false })
    expect(texto).not.toContain('Recebo plantão')
    expect(texto).not.toContain('decúbito')
  })

  it('omite estadoMental quando false', () => {
    const texto = gerarTexto(formBase, { estadoMental: false })
    expect(texto).not.toContain('Aparentemente agitada')
  })

  it('omite respiracao quando false', () => {
    const texto = gerarTexto(formBase, { respiracao: false })
    expect(texto).not.toContain('eupneica')
    expect(texto).not.toContain('ar ambiente')
  })

  it('omite acompanhante quando false', () => {
    const texto = gerarTexto(formBase, { acompanhante: false })
    expect(texto).not.toContain('acompanhada de filha Maria')
  })

  it('omite dispositivos quando false', () => {
    const texto = gerarTexto(formBase, { dispositivos: false })
    expect(texto).not.toContain('Mantém AVP')
  })

  it('omite obsApresenta quando false', () => {
    const texto = gerarTexto(formBase, { obsApresenta: false })
    expect(texto).not.toContain('Apresenta edema')
  })

  it('omite evacuacao quando false', () => {
    const texto = gerarTexto(formBase, { evacuacao: false })
    expect(texto).not.toContain('evacuação hoje')
  })

  it('omite diurese quando false', () => {
    const texto = gerarTexto(formBase, { diurese: false })
    expect(texto).not.toContain('diurese')
  })

  it('omite queixas quando false', () => {
    const texto = gerarTexto(formBase, { queixas: false })
    expect(texto).not.toContain('dor abdominal')
  })
})

describe('gerarTexto — guard para todos os campos off', () => {
  it('retorna texto mínimo quando todos os campos estão desligados', () => {
    const todosOff = {
      posicaoCama: false, estadoMental: false, respiracao: false,
      acompanhante: false, dispositivos: false, obsApresenta: false,
      evacuacao: false, diurese: false, queixas: false,
    }
    // form sem colaboracao preenchido e sem campos ativos
    const formMinimo = {
      ...formBase,
      colaboracao: '',
      deambulacao: '',
    }
    const texto = gerarTexto(formMinimo, todosOff)
    expect(texto).toContain('Avaliação realizada')
    expect(texto).toContain(formBase.fechamento)
  })
})

describe('gerarTexto — compatibilidade retroativa', () => {
  it('funciona igual ao original quando chamado sem camposAtivos', () => {
    const comParam  = gerarTexto(formBase, {})
    const semParam  = gerarTexto(formBase)
    expect(comParam).toBe(semParam)
  })
})
