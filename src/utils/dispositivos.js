export const locaisCentralPadrao = ['femoral D', 'femoral E', 'jugular D', 'jugular E', 'subclávia D', 'subclávia E']

export const tiposDispositivosPadrao = ['AVP', 'CVC', 'PICC', 'Permcath', 'Shilley', 'SNE', 'SNG', 'Pulseira', 'Monitor', 'Dreno', 'Curativo', 'Outros']

export const pulseiraOpcoesPadrao = [
  { v: 'identificação', cor: '#bdbdbd' },
  { v: 'risco de queda', cor: '#fdd835' },
  { v: 'alergia', cor: '#e53935' },
  { v: 'precaução', cor: '#43a047' },
  { v: 'preservação de membro', cor: '#e91e8c' },
]

function infusaoTexto(d) {
  if (!d.solucao) return ''
  let t = ` recebendo ${d.solucao}`
  if (d.bic) t += ' em BIC'
  if (d.velocidade) t += ` a ${d.velocidade}ml/h`
  return t
}

export function buildDispositivoTexto(tipo, d, setErro = () => {}) {
  const err = (msg) => { setErro(msg); return null }
  const fmt = (s) => {
    if (!s) return '?/?'
    const [, m, dia] = s.split('-')
    return `${dia}/${m}`
  }
  const status = (dados) => {
    const partes = []
    if (dados.salinizado) partes.push('salinizado')
    if (dados.heparinizado) partes.push('heparinizado')
    if (dados.ocluido) partes.push('ocluído')
    return partes.length ? `, ${partes.join(' e ')}` : ''
  }
  const datado = (dados) => dados.datado ? `, datado de ${fmt(dados.data)}` : ''

  switch (tipo) {
    case 'AVP': {
      if (!d.local) return err('Selecione o local')
      if (d.emInfusao && !d.solucao) return err('Informe a solução')
      let t = `AVP em ${d.local}`
      if (d.emInfusao) t += `,${infusaoTexto(d)}`
      t += status(d) + datado(d)
      return t
    }
    case 'CVC': {
      if (!d.local) return err('Selecione o local')
      if (!d.lumens) return err('Selecione o número de lúmens')
      if (d.emInfusao && !d.solucao) return err('Informe a solução')
      let t = `CVC ${d.lumens} lúmen em ${d.local}`
      if (d.emInfusao) t += `,${infusaoTexto(d)}`
      t += status(d) + datado(d)
      return t
    }
    case 'PICC': {
      if (!d.membro) return err('Selecione o membro')
      if (!d.lumens) return err('Selecione o número de lúmens')
      if (d.emInfusao && !d.solucao) return err('Informe a solução')
      let t = `PICC ${d.lumens} lúmen em ${d.membro}`
      if (d.emInfusao) t += `,${infusaoTexto(d)}`
      t += status(d) + datado(d)
      return t
    }
    case 'Permcath':
    case 'Shilley': {
      if (!d.local) return err('Selecione o local')
      if (d.emInfusao && !d.solucao) return err('Informe a solução')
      let t = `${tipo} em ${d.local}`
      if (d.emInfusao) t += `,${infusaoTexto(d)}`
      t += status(d) + datado(d)
      return t
    }
    case 'SNE': {
      if (!d.narina) return err('Selecione a narina')
      if (!d.marcacao) return err('Informe a marcação')
      if (!d.status) return err('Selecione o status')
      if (!d.dieta) return err('Selecione se há dieta enteral')
      if (d.dieta === 'sim' && !d.velocidadeDieta) return err('Informe a velocidade da dieta enteral')
      const nar = d.narina === 'D' ? 'direita' : 'esquerda'
      let t = `SNE em narina ${nar}, marcação ${d.marcacao}cm, ${d.status}`
      if (d.dieta === 'sim') t += `, recebendo dieta enteral a ${d.velocidadeDieta}ml/h`
      return t
    }
    case 'SNG': {
      if (!d.narina) return err('Selecione a narina')
      if (!d.marcacao) return err('Informe a marcação')
      if (!d.modo) return err('Selecione o modo')
      if (d.modo === 'dieta' && !d.velocidadeDieta) return err('Informe a velocidade da dieta enteral')
      if (d.modo === 'dren' && d.debito === 'com' && !d.debitoVal) return err('Informe o volume do débito')
      const nar = d.narina === 'D' ? 'direita' : 'esquerda'
      let t = `SNG em narina ${nar}, marcação ${d.marcacao}cm`
      if (d.modo === 'aberta') t += ', aberta'
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
      if (!d.drenoTipo) return err('Informe o tipo do dreno')
      if (!d.drenoLocal) return err('Informe a localização')
      let t = `dreno de ${d.drenoTipo} em ${d.drenoLocal}`
      if (d.drenoAspecto) t += `, aspecto ${d.drenoAspecto}`
      if (d.drenoDebito) t += `, débito de ${d.drenoDebito}ml`
      if (d.seloAgua) t += `, com selo d'água${d.seloDebito ? ` (${d.seloDebito}ml)` : ''}`
      return t
    }
    case 'Curativo': {
      const locais = d.locais || []
      if (locais.length === 0 && !d.localTexto) return err('Informe ao menos um local')
      if (!d.condicao) return err('Informe a condição do curativo')

      const partes = []
      const temMSD = locais.includes('MSD')
      const temMSE = locais.includes('MSE')
      const temMID = locais.includes('MID')
      const temMIE = locais.includes('MIE')

      if (temMSD && temMSE) partes.push('MMSS')
      else {
        if (temMSD) partes.push('MSD')
        if (temMSE) partes.push('MSE')
      }

      if (temMID && temMIE) partes.push('MMII')
      else {
        if (temMID) partes.push('MID')
        if (temMIE) partes.push('MIE')
      }

      if (d.localTexto) partes.push(d.localTexto)

      const loc = partes.length === 1
        ? partes[0]
        : `${partes.slice(0, -1).join(', ')} e ${partes[partes.length - 1]}`

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
