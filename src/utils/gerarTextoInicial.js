export function gerarTexto(form) {
  const parts = []
  const h = form.horario.replace(':', 'h')

  parts.push(`${h} – Recebo plantão com paciente em seu leito com cama ${form.posicaoCama}, rodas ${form.rodas}, grades ${form.grades} e decúbito ${form.decubito}.`)

  if (form.mentalAlterado && form.mentalDesc)
    parts.push(`Aparentemente ${form.mentalDesc}.`)

  const ap = []
  ap.push(form.colaboracao)

  if (form.deambulacao === 'deambula com auxílio')
    ap.push(`deambula com auxílio de ${form.deambulaAuxilio}`)
  else if (form.deambulacao !== 'não deambula' && form.deambulacao)
    ap.push(form.deambulacao)

  const rv = form.respPadrao
  if (form.respiracao === 'cateter nasal de O₂' || form.respiracao === 'máscara de O₂') {
    if (rv) ap.push(rv)
    ap.push(`em ${form.respiracao} a ${form.oxigenioLitros}L/min`)
  } else if (form.respiracao === 'em ar ambiente') {
    ap.push(rv ? `${rv} em ar ambiente` : 'em ar ambiente')
  } else {
    ap.push(form.respiracao)
  }

  if (form.acompanhante === 'sim') {
    const gen = form.sexo === 'M' ? 'acompanhado' : 'acompanhada'
    ap.push(`${gen} de ${form.acompanhanteParentesco} ${form.acompanhanteNome}`)
  }

  const apText = ap.join(', ')
  parts.push(apText.charAt(0).toUpperCase() + apText.slice(1) + '.')

  if (form.dispositivos.length > 0) {
    const dt = form.dispositivos.map((d, i) => i === 0 ? `Mantém ${d}` : d).join('; ')
    parts.push(dt + '.')
  }

  if (form.obsApresenta) {
    const o = form.obsApresenta
    parts.push(`Apresenta ${o.charAt(0).toLowerCase() + o.slice(1)}.`)
  }

  const ref = []
  if      (form.evacuacaoOpcao === 'hoje')  ref.push('Refere última evacuação hoje')
  else if (form.evacuacaoOpcao === 'ontem') ref.push('Refere última evacuação ontem')
  else if (form.evacuacaoOpcao === 'data' && form.evacuacaoData) {
    const [, m, d] = form.evacuacaoData.split('-')
    ref.push(`Refere última evacuação em ${d}/${m}`)
  } else if (form.evacuacaoOpcao === 'nao-avaliado') ref.push('Evacuação não avaliada')

  if (form.diurese.includes('não avaliado')) {
    ref.push('diurese não avaliada')
  } else {
    // SVD
    if (form.diurese.includes('SVD')) {
      ref.push(`SVD com débito presente de ${form.svdDebito}ml`)
    }
    // Espontâneas + fralda agrupadas
    const espMap = { banheiro: 'ao banheiro', papagaio: 'em uso de papagaio', comadre: 'em uso de comadre' }
    const espSel = ['banheiro', 'papagaio', 'comadre'].filter(d => form.diurese.includes(d))
    const temFralda = form.diurese.includes('fralda')
    if (espSel.length === 0 && temFralda) {
      // só fralda
      ref.push('diurese em fralda')
    } else if (espSel.length > 0) {
      // espontâneas, com ou sem fralda
      const partes = espSel.map(d => espMap[d])
      if (temFralda) partes.push('em fralda')
      const last = partes[partes.length - 1]
      const joined = partes.length === 1 ? partes[0] : `${partes.slice(0, -1).join(', ')} e ${last}`
      ref.push(`diurese espontânea ${joined}`)
    }
    if (form.diureseObs.trim()) {
      const o = form.diureseObs.trim()
      ref.push(o.charAt(0).toLowerCase() + o.slice(1))
    }
  }

  if (form.queixas) {
    const q = form.queixas
    ref.push(q.charAt(0).toLowerCase() + q.slice(1))
  }

  parts.push(ref.join(', ') + '.')
  parts.push(form.fechamento)

  return parts.join(' ')
}
