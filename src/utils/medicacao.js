export const MEDICACAO_HISTORY_MAX = 60
export const MEDICACAO_PRESETS_MAX = 16
export const MEDICACAO_COLLECTION_VERSION = 2

export const VIAS_MEDICACAO = ['VO', 'EV', 'SC', 'IM', 'SNE', 'OFT', 'DERM', 'Sublingual', 'Recusa']
export const UNIDADES_MEDICACAO = ['mg', 'mcg', 'g', 'UI', 'mEq', 'mmol', 'ml', 'Gts', '%', 'mg/kg', 'mcg/kg']
export const LOCAIS_ANATOMICOS_MEDICACAO = {
  IM: ['Dorso-glúteo D', 'Dorso-glúteo E', 'Vasto lateral D', 'Vasto lateral E', 'Ventro-glúteo D', 'Ventro-glúteo E', 'Deltoide D', 'Deltoide E'],
  SC: ['Abdômen', 'Coxa D', 'Coxa E', 'Braço D', 'Braço E', 'Glúteo D', 'Glúteo E'],
}

export function medVazio(seed = {}) {
  return {
    nome: '',
    dose: '',
    unidade: 'mg',
    via: '',
    oftOlho: '',
    evDiluicao: false,
    evVolume: '',
    evSolucao: 'SF',
    evSolucaoCustom: '',
    evBic: false,
    evTempoH: '',
    evTempoMin: '',
    evVelocidade: '',
    dupla: false,
    duplaCargo: 'téc. de enfermagem',
    duplaNome: '',
    recusaNome: '',
    localAnatomico: '',
    loteAtivo: false,
    loteFrasco: '',
    lote: '',
    loteFabricacao: '',
    loteValidade: '',
    loteMarca: '',
    ...seed,
  }
}

export function formatarHoraMedicacao(horario) {
  return String(horario || '').replace(':', 'h')
}

export function getEvTipo(med) {
  if (med?.via !== 'EV') return ''
  if (med.evBic) return 'bic'
  if (med.evDiluicao) return 'diluido'
  return 'direto'
}

export function aplicarEvTipo(dados, tipo) {
  if (dados.via !== 'EV') return
  dados.evBic = tipo === 'bic'
  dados.evDiluicao = tipo === 'diluido' || tipo === 'bic'
  if (!dados.evDiluicao) {
    dados.evVolume = ''
    dados.evSolucao = 'SF'
    dados.evSolucaoCustom = ''
  }
  if (!dados.evBic) {
    dados.evTempoH = ''
    dados.evTempoMin = ''
    dados.evVelocidade = ''
  }
}

export function permiteSalvarTemplateMedicacao(med) {
  return Boolean(med?.nome?.trim() && med?.via && med.via !== 'Recusa')
}

export function criarColecaoMedicacaoVazia() {
  return {
    version: MEDICACAO_COLLECTION_VERSION,
    updatedAt: 0,
    items: [],
  }
}

export function extrairTemplateMedicacao(med) {
  if (!permiteSalvarTemplateMedicacao(med)) return null

  const via = String(med.via || '').trim()
  const dose = via === 'DERM'
    ? String(med.dose || '').trim()
    : String(med.dose ?? '').trim()

  if (via !== 'DERM' && !dose) return null
  if (via === 'OFT' && !String(med.oftOlho || '').trim()) return null

  return {
    nome: String(med.nome || '').trim().toLowerCase(),
    dose,
    unidade: via === 'OFT' ? 'Gts' : String(med.unidade || 'mg').trim(),
    via,
    oftOlho: via === 'OFT' ? String(med.oftOlho || '').trim() : '',
    evDiluicao: via === 'EV' ? Boolean(med.evDiluicao) : false,
    evVolume: via === 'EV' && med.evDiluicao ? String(med.evVolume || '').trim() : '',
    evSolucao: via === 'EV' && med.evDiluicao ? String(med.evSolucao || 'SF').trim() : 'SF',
    evSolucaoCustom: via === 'EV' && med.evDiluicao && med.evSolucao === 'outra'
      ? String(med.evSolucaoCustom || '').trim()
      : '',
    evBic: via === 'EV' ? Boolean(med.evBic) : false,
    evTempoH: via === 'EV' && med.evBic ? String(med.evTempoH || '').trim() : '',
    evTempoMin: via === 'EV' && med.evBic ? String(med.evTempoMin || '').trim() : '',
    evVelocidade: via === 'EV' && med.evBic ? String(med.evVelocidade || '').trim() : '',
    localAnatomico: ['IM', 'SC'].includes(via) ? String(med.localAnatomico || '').trim() : '',
    loteAtivo: Boolean(med.loteAtivo),
    loteFrasco: med.loteAtivo ? String(med.loteFrasco || '').trim() : '',
    lote: med.loteAtivo ? String(med.lote || '').trim() : '',
    loteFabricacao: med.loteAtivo ? String(med.loteFabricacao || '').trim() : '',
    loteValidade: med.loteAtivo ? String(med.loteValidade || '').trim() : '',
    loteMarca: med.loteAtivo ? String(med.loteMarca || '').trim() : '',
  }
}

export function criarChaveMedicacao(med) {
  const base = extrairTemplateMedicacao(med)
  if (!base) return ''

  return [
    base.nome,
    base.dose,
    base.unidade,
    base.via,
    base.oftOlho,
    base.evDiluicao ? 'dil' : '',
    base.evVolume,
    base.evSolucao,
    base.evSolucaoCustom,
    base.evBic ? 'bic' : '',
    base.evTempoH,
    base.evTempoMin,
    base.evVelocidade,
    base.localAnatomico,
  ].join('|')
}

function normalizarNumero(valor, fallback = 0) {
  const numero = Number(valor)
  return Number.isFinite(numero) ? numero : fallback
}

export function normalizarItemMedicacao(med, fallbackUpdatedAt = Date.now()) {
  const base = extrairTemplateMedicacao(med)
  if (!base) return null

  const updatedAt = normalizarNumero(med?.updatedAt, fallbackUpdatedAt)
  const savedAt = normalizarNumero(med?.savedAt, updatedAt)
  return {
    ...base,
    updatedAt,
    savedAt,
  }
}

export function normalizarColecaoMedicacao(payload, maxItens = MEDICACAO_HISTORY_MAX) {
  const itensBrutos = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.items)
      ? payload.items
      : []

  const agora = Date.now()
  const unicos = new Map()

  itensBrutos.forEach((item, index) => {
    const normalizado = normalizarItemMedicacao(item, agora - index)
    if (!normalizado) return

    const chave = criarChaveMedicacao(normalizado)
    const atual = unicos.get(chave)
    if (!atual || normalizado.updatedAt >= atual.updatedAt) {
      unicos.set(chave, normalizado)
    }
  })

  const items = Array.from(unicos.values())
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, maxItens)

  const updatedAt = Math.max(
    normalizarNumero(payload?.updatedAt, 0),
    items[0]?.updatedAt || 0,
  )

  return {
    version: MEDICACAO_COLLECTION_VERSION,
    updatedAt,
    items,
  }
}

export function mesclarColecoesMedicacao(localPayload, remotePayload, maxItens = MEDICACAO_HISTORY_MAX) {
  const local = normalizarColecaoMedicacao(localPayload, maxItens)
  const remote = normalizarColecaoMedicacao(remotePayload, maxItens)

  const mapa = new Map()
  ;[...local.items, ...remote.items].forEach((item) => {
    const chave = criarChaveMedicacao(item)
    const atual = mapa.get(chave)
    if (!atual || item.updatedAt >= atual.updatedAt) {
      mapa.set(chave, item)
    }
  })

  const items = Array.from(mapa.values())
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, maxItens)

  return {
    version: MEDICACAO_COLLECTION_VERSION,
    updatedAt: Math.max(local.updatedAt, remote.updatedAt, items[0]?.updatedAt || 0),
    items,
  }
}

export function inserirNaColecaoMedicacao(payload, med, maxItens = MEDICACAO_HISTORY_MAX) {
  const base = normalizarColecaoMedicacao(payload, maxItens)
  const item = normalizarItemMedicacao(
    { ...med, updatedAt: Date.now(), savedAt: med?.savedAt || Date.now() },
    Date.now(),
  )
  if (!item) return base

  const chave = criarChaveMedicacao(item)
  const semDuplicado = base.items.filter((atual) => criarChaveMedicacao(atual) !== chave)
  const items = [item, ...semDuplicado]
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, maxItens)

  return {
    version: MEDICACAO_COLLECTION_VERSION,
    updatedAt: item.updatedAt,
    items,
  }
}

export function removerDaColecaoMedicacao(payload, chave) {
  const base = normalizarColecaoMedicacao(payload, Number.MAX_SAFE_INTEGER)
  const items = base.items.filter((item) => criarChaveMedicacao(item) !== chave)
  return {
    version: MEDICACAO_COLLECTION_VERSION,
    updatedAt: Date.now(),
    items,
  }
}

export function formatarRotuloMedicacaoRapida(med) {
  if (!med?.nome) return ''
  if (med.via === 'DERM') return `${capitalizar(med.nome)} DERM`
  const dose = med.dose ? `${med.dose}${med.via === 'OFT' ? 'Gts' : med.unidade}` : ''
  const via = med.via === 'OFT'
    ? `OFT ${med.oftOlho || ''}`.trim()
    : med.via
  return [capitalizar(med.nome), dose, via].filter(Boolean).join(' · ')
}

export function prepararProximaMedicacao(med) {
  if (!med?.via) return medVazio()
  const proxima = medVazio({
    via: med.via,
    unidade: med.via === 'OFT' ? 'Gts' : (med.unidade || 'mg'),
  })

  if (med.via === 'EV') {
    aplicarEvTipo(proxima, getEvTipo(med))
    proxima.evSolucao = med.evSolucao || 'SF'
    proxima.evSolucaoCustom = med.evSolucao === 'outra' ? (med.evSolucaoCustom || '') : ''
  }

  return proxima
}

function formatarTempo(horas, minutos) {
  const hh = parseInt(horas, 10) || 0
  const mm = parseInt(minutos, 10) || 0
  if (!hh && !mm) return ''
  if (hh && mm) return `${hh}h${mm}min`
  if (hh) return `${hh}h`
  return `${mm}min`
}

function capitalizar(texto) {
  const valor = String(texto || '').trim()
  if (!valor) return ''
  return valor.charAt(0).toUpperCase() + valor.slice(1)
}

export function resumirMed(med) {
  if (med.via === 'Recusa') return `Recusa · Enf. ${med.recusaNome || '?'}`
  if (med.via === 'DERM') return med.dose ? `${med.dose}${med.unidade} · DERM` : 'DERM'

  const unidade = med.via === 'OFT' ? 'Gts' : med.unidade
  let viaLabel = med.via

  if (med.via === 'EV') {
    viaLabel = med.evBic ? 'EV BIC' : (med.evDiluicao ? 'EV diluído' : 'EV')
  } else if (med.via === 'OFT' && med.oftOlho) {
    viaLabel = `OFT ${med.oftOlho}`
  }

  if (med.localAnatomico && ['IM', 'SC'].includes(med.via)) {
    viaLabel += ` ${med.localAnatomico}`
  }

  return `${med.dose}${unidade} · ${viaLabel}`
}

export function gerarParteMed(med) {
  const unidade = med.via === 'OFT' ? 'Gts' : med.unidade
  const dose = med.dose ? `${med.dose}${unidade} ` : ''

  if (med.via === 'DERM') {
    const prefixoFrasco = med.loteAtivo && med.loteFrasco ? `o ${med.loteFrasco}° frasco de ` : ''
    return `${prefixoFrasco}${med.nome.toLowerCase()} ${dose}DERM`.trimEnd()
  }

  let viaTexto = ''
  if (med.via === 'VO') viaTexto = 'VO'
  else if (med.via === 'SC') viaTexto = 'SC'
  else if (med.via === 'IM') viaTexto = 'IM'
  else if (med.via === 'SNE') viaTexto = 'via SNE'
  else if (med.via === 'Sublingual') viaTexto = 'sublingual'
  else if (med.via === 'OFT') {
    const olhoTexto = med.oftOlho === 'ambos' ? 'em ambos os olhos' : `olho ${med.oftOlho}`
    viaTexto = `OFT ${olhoTexto}`
  } else if (med.via === 'EV') {
    if (!med.evDiluicao) {
      if (med.evBic) {
        const tempo = formatarTempo(med.evTempoH, med.evTempoMin)
        let infusao = ''
        if (tempo && med.evVelocidade) infusao = `em ${tempo} a ${med.evVelocidade}ml/h`
        else if (tempo) infusao = `em ${tempo}`
        else if (med.evVelocidade) infusao = `a ${med.evVelocidade}ml/h`
        viaTexto = `EV em BIC para infundir ${infusao}`.trim()
      } else {
        viaTexto = 'EV'
      }
    } else {
      const solucao = med.evSolucao === 'SF'
        ? 'SF 0,9%'
        : med.evSolucao === 'SG'
          ? 'SG 5%'
          : med.evSolucao === 'outra'
            ? (med.evSolucaoCustom || 'outra solução')
            : 'água destilada'

      if (med.evBic) {
        const tempo = formatarTempo(med.evTempoH, med.evTempoMin)
        let infusao = ''
        if (tempo && med.evVelocidade) infusao = `em ${tempo} a ${med.evVelocidade}ml/h`
        else if (tempo) infusao = `em ${tempo}`
        else if (med.evVelocidade) infusao = `a ${med.evVelocidade}ml/h`
        viaTexto = `+ ${med.evVolume}ml ${solucao} EV em BIC para infundir ${infusao}`.trim()
      } else {
        viaTexto = `EV + ${med.evVolume}ml ${solucao}`
      }
    }
  }

  const prefixoFrasco = med.loteAtivo && med.loteFrasco ? `o ${med.loteFrasco}° frasco de ` : ''
  const local = med.localAnatomico && ['IM', 'SC'].includes(med.via)
    ? ` no ${med.localAnatomico.charAt(0).toLowerCase() + med.localAnatomico.slice(1)}`
    : ''

  return `${prefixoFrasco}${med.nome.toLowerCase()} ${dose}${viaTexto}${local}`.trim()
}

export function gerarLinhaDupla(med) {
  const unidade = med.via === 'OFT' ? 'Gts' : med.unidade
  const dose = `${med.dose}${unidade}`

  let viaSimples = med.via
  if (med.via === 'EV') viaSimples = med.evDiluicao ? 'EV' : 'EV em bolus'
  if (med.via === 'OFT') viaSimples = `OFT olho ${med.oftOlho}`
  if (med.via === 'SNE') viaSimples = 'via SNE'
  if (med.via === 'Sublingual') viaSimples = 'sublingual'

  const cargo = med.duplaCargo?.trim() ? `${med.duplaCargo.trim()} ` : ''
  return `Realizado dupla checagem de ${med.nome.toLowerCase()} ${dose} ${viaSimples} com ${cargo}${med.duplaNome.trim()}.`
}

export function gerarTextoMedicacao(form) {
  if (!form?.horario) return ''

  const horario = formatarHoraMedicacao(form.horario)
  let conformeTexto = ''

  if (form.conformeTipo === 'prescricao') {
    conformeTexto = ' conforme prescrição médica'
  } else if (form.conformeTipo === 'orientacao') {
    conformeTexto = ` conforme orientação do ${String(form.conformeNome || '').trim()}`
  }

  const conteudo = []
  const confTextos = {
    com: 'Realizado conferência de identificação com paciente.',
    do: 'Realizado conferência de identificação do paciente.',
  }

  if (form.conferencia && confTextos[form.conferencia]) {
    conteudo.push(confTextos[form.conferencia])
  }

  if (form.orienta) {
    conteudo.push('Oriento paciente, que autoriza realização de medicação prescrita.')
  }

  const medsAdm = (form.medicamentos || []).filter((med) => med.via !== 'Recusa')
  if (medsAdm.length > 0) {
    const partes = medsAdm.map(gerarParteMed)
    const medStr = partes.length === 1
      ? partes[0]
      : partes.slice(0, -1).join(', ') + ' e ' + partes[partes.length - 1]
    conteudo.push(`administrado ${medStr}${conformeTexto}`)
  }

  const linhas = conteudo.map((linha, index) => (index === 0 ? `${horario} – ${linha}` : linha))

  const recusasPorProf = {}
  ;(form.medicamentos || [])
    .filter((med) => med.via === 'Recusa')
    .forEach((med) => {
      const profissional = String(med.recusaNome || '').trim()
      if (!profissional) return
      if (!recusasPorProf[profissional]) recusasPorProf[profissional] = []
      recusasPorProf[profissional].push(med.nome.toLowerCase())
    })

  Object.keys(recusasPorProf).forEach((profissional) => {
    const nomes = recusasPorProf[profissional]
    const nomesStr = nomes.length === 1
      ? nomes[0]
      : nomes.slice(0, -1).join(', ') + ' e ' + nomes[nomes.length - 1]
    linhas.push(`Paciente recusa ${nomesStr} prescrito, comunico Enf. ${profissional}`)
  })

  ;(form.medicamentos || []).forEach((med) => {
    if (med.dupla && med.duplaNome?.trim()) {
      linhas.push(gerarLinhaDupla(med))
    }
  })

  ;(form.medicamentos || []).forEach((med) => {
    if (med.loteAtivo && med.lote?.trim()) {
      linhas.push(`Número do Lote: ${med.lote.trim()}`)
      if (med.loteFabricacao?.trim()) linhas.push(`Fabricação: ${med.loteFabricacao.trim()}`)
      if (med.loteValidade?.trim()) linhas.push(`Validade: ${med.loteValidade.trim()}`)
      if (med.loteMarca?.trim()) linhas.push(`Marca: ${med.loteMarca.trim()}`)
    }
  })

  return linhas.join('\n')
}
