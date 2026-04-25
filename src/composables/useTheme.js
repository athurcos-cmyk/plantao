import { ref } from 'vue'

export const TEMAS = {
  noturno: {
    nome: 'Noturno',
    preview: { bg: '#0A1628', card: '#111d32', accent: '#1E88E5' },
    vars: {
      '--bg':          '#0A1628',
      '--bg-card':     '#111d32',
      '--bg-input':    '#162033',
      '--bg-hover':    '#1a2844',
      '--blue':        '#1E88E5',
      '--blue-dark':   '#1565C0',
      '--blue-muted':  'rgba(30,136,229,0.12)',
      '--blue-faint':  'rgba(30,136,229,0.14)',
      '--border':      '#1e3050',
      '--text-dim':    '#8899AA',
      '--text-muted':  '#556677',
    },
  },
  rosa: {
    nome: 'Rosa',
    preview: { bg: '#1a0a14', card: '#251120', accent: '#ffcbdb' },
    vars: {
      '--bg':          '#fffafa',
      '--bg-card':     '#251120',
      '--bg-input':    '#2d1628',
      '--bg-hover':    '#361c30',
      '--blue':        '#ffcbdb',
      '--blue-dark':   '#f2a9bf',
      '--blue-muted':  'rgba(255,203,219,0.18)',
      '--blue-faint':  'rgba(255,203,219,0.24)',
      '--border':      '#593146',
      '--text-dim':    '#d8b0c1',
      '--text-muted':  '#a27a8c',
    },
  },
  floresta: {
    nome: 'Floresta',
    preview: { bg: '#071a10', card: '#0e2318', accent: '#2ecc71' },
    vars: {
      '--bg':          '#071a10',
      '--bg-card':     '#0e2318',
      '--bg-input':    '#122b1e',
      '--bg-hover':    '#163522',
      '--blue':        '#2ecc71',
      '--blue-dark':   '#27ae60',
      '--blue-muted':  'rgba(46,204,113,0.12)',
      '--blue-faint':  'rgba(46,204,113,0.14)',
      '--border':      '#1a3a24',
      '--text-dim':    '#7aaa88',
      '--text-muted':  '#4a7755',
    },
  },
  roxo: {
    nome: 'Roxo',
    preview: { bg: '#120a1e', card: '#1c1130', accent: '#9b59b6' },
    vars: {
      '--bg':          '#120a1e',
      '--bg-card':     '#1c1130',
      '--bg-input':    '#22153a',
      '--bg-hover':    '#291a44',
      '--blue':        '#9b59b6',
      '--blue-dark':   '#7d3c98',
      '--blue-muted':  'rgba(155,89,182,0.12)',
      '--blue-faint':  'rgba(155,89,182,0.14)',
      '--border':      '#2d1a4a',
      '--text-dim':    '#9988aa',
      '--text-muted':  '#665577',
    },
  },
  carbono: {
    nome: 'Carbono',
    preview: { bg: '#0f0f12', card: '#1a1a1f', accent: '#00bcd4' },
    vars: {
      '--bg':          '#0f0f12',
      '--bg-card':     '#1a1a1f',
      '--bg-input':    '#212126',
      '--bg-hover':    '#2a2a30',
      '--blue':        '#00bcd4',
      '--blue-dark':   '#0097a7',
      '--blue-muted':  'rgba(0,188,212,0.12)',
      '--blue-faint':  'rgba(0,188,212,0.14)',
      '--border':      '#2a2a35',
      '--text-dim':    '#888898',
      '--text-muted':  '#555565',
    },
  },
  cobalto: {
    nome: 'Cobalto',
    preview: { bg: '#070d1f', card: '#0d1530', accent: '#2979ff' },
    vars: {
      '--bg':          '#070d1f',
      '--bg-card':     '#0d1530',
      '--bg-input':    '#111d3a',
      '--bg-hover':    '#162244',
      '--blue':        '#2979ff',
      '--blue-dark':   '#1565c0',
      '--blue-muted':  'rgba(41,121,255,0.12)',
      '--blue-faint':  'rgba(41,121,255,0.14)',
      '--border':      '#182a50',
      '--text-dim':    '#8899bb',
      '--text-muted':  '#445577',
    },
  },
}

const STORAGE_KEY = 'plantao_tema'

function _aplicarVars(id) {
  const tema = TEMAS[id]
  if (!tema) return
  const root = document.documentElement
  for (const [prop, val] of Object.entries(tema.vars)) {
    root.style.setProperty(prop, val)
  }
}

export function initTheme() {
  const salvo = localStorage.getItem(STORAGE_KEY) || 'noturno'
  _aplicarVars(salvo)
}

const _temaAtivo = ref(localStorage.getItem(STORAGE_KEY) || 'noturno')

export function useTheme() {
  function aplicarTema(id) {
    if (!TEMAS[id]) return
    _aplicarVars(id)
    _temaAtivo.value = id
    localStorage.setItem(STORAGE_KEY, id)
  }

  return { temas: TEMAS, temaAtivo: _temaAtivo, aplicarTema }
}
