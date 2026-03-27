import { ref, reactive } from 'vue'

export function useDispositivos(dispositivos) {
  const dragIdx     = ref(null)
  const dragOverIdx = ref(null)
  const modal       = reactive({ aberto: false, tipo: '', d: {}, erro: '' })

  const locaisCentral = ['femoral D','femoral E','jugular D','jugular E','subclávia D','subclávia E']
  const tiposDisp = ['AVP','CVC','PICC','Permcath','Shilley','SNE','SNG','Pulseira','Monitor','Dreno','Curativo','Outros']
  const pulseiraOpcoes = [
    { v: 'identificação',         cor: '#bdbdbd' },
    { v: 'risco de queda',        cor: '#fdd835' },
    { v: 'alergia',               cor: '#e53935' },
    { v: 'precaução',             cor: '#43a047' },
    { v: 'preservação de membro', cor: '#e91e8c' }
  ]

  function abrirModal(tipo) {
    modal.tipo   = tipo
    modal.d      = { tipos: [], locais: [] }
    modal.erro   = ''
    modal.aberto = true
  }
  function fecharModal() { modal.aberto = false }

  function moverDisp(i, dir) {
    const j = i + dir
    if (j < 0 || j >= dispositivos.length) return
    ;[dispositivos[i], dispositivos[j]] = [dispositivos[j], dispositivos[i]]
  }

  function removerDisp(i) { dispositivos.splice(i, 1) }

  function onDragStart(i) { dragIdx.value = i }
  function onDragOver(i)  { dragOverIdx.value = i }
  function onDrop(i) {
    if (dragIdx.value === null || dragIdx.value === i) { dragIdx.value = null; dragOverIdx.value = null; return }
    const item = dispositivos.splice(dragIdx.value, 1)[0]
    dispositivos.splice(i, 0, item)
    dragIdx.value = null
    dragOverIdx.value = null
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

  function confirmarDisp() {
    modal.erro = ''
    const texto = buildDispTexto(modal.tipo, modal.d)
    if (texto === null) return
    dispositivos.push(texto)
    fecharModal()
  }

  return {
    dragIdx, dragOverIdx, modal,
    locaisCentral, tiposDisp, pulseiraOpcoes,
    abrirModal, fecharModal, confirmarDisp,
    moverDisp, removerDisp,
    onDragStart, onDragOver, onDrop
  }
}
