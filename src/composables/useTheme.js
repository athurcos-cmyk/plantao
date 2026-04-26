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
    nome: 'Rosa Bebê (Clean)',
    preview: { bg: '#F498B7', card: '#FFFFFF', accent: '#E05A87' },
    vars: {
      // Fundos
      '--bg':          '#f498b7', // O seu fundo rosa bebê original mantido!
      '--bg-card':     '#FFFFFF', // Cards totalmente brancos para dar "respiro" e um visual clean
      '--bg-input':    '#FFF0F5', // Caixas de texto com um fundinho rosa quase invisível (Lavender blush)
      '--bg-hover':    '#FCE8EE', // Fundo leve ao passar o mouse ou selecionar opções

      // Destaques (Como o fundo já é rosa, os botões precisam ser de um Rosa mais forte/Cereja para dar contraste no card branco)
      '--blue':        '#E05A87', // Cor principal (Botões, ícones, cabeçalho)
      '--blue-dark':   '#C7416E', // Botão pressionado (mais escuro)
      '--blue-muted':  'rgba(224, 90, 135, 0.12)', // Fundo translúcido 
      '--blue-faint':  'rgba(224, 90, 135, 0.05)', // Fundo translúcido fraco

      // Bordas e Textos
      '--border':      '#F2D1DC', // Borda dos cards rosada bem clarinha
      '--text':        '#361522', // CORRIGIDO: Texto principal (um vinho muito escuro, muito mais elegante que preto puro)
      '--text-dim':    '#633647', // Texto secundário (rótulos e descrições)
      '--text-muted':  '#916876', // Texto apagado (dicas e placeholders)
    },
  },
  floresta: {
    nome: 'Verde Água (Clean)',
    preview: { bg: '#F2F9F8', card: '#FFFFFF', accent: '#18B89E' },
    vars: {
      // Fundos
      '--bg':          '#F2F9F8', 
      '--bg-card':     '#FFFFFF', 
      '--bg-input':    '#E8F4F1', 
      '--bg-hover':    '#DDF0EB', 

      // Destaques 
      '--blue':        '#18B89E', 
      '--blue-dark':   '#0E947E', 
      '--blue-muted':  'rgba(24, 184, 158, 0.12)', 
      '--blue-faint':  'rgba(24, 184, 158, 0.05)', 

      // Bordas e Textos (Aqui estava o segredo!)
      '--border':      '#CBE3DE', 
      '--text':        '#1A2F2B', // <- CORRIGIDO: Texto principal escuro (quase preto/esverdeado)
      '--text-dim':    '#445F5A', // Texto secundário (cinza esverdeado)
      '--text-muted':  '#6D8B85', // Texto para legendas e dicas
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
