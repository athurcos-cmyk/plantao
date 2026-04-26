import { ref } from 'vue'

export const TEMAS = {
  /* ───── DARK THEMES ───── */
  noturno: {
    nome: 'Noturno',
    preview: { bg: '#0A1628', card: '#111d32', accent: '#1E88E5' },
    vars: {
      '--bg':              '#0A1628',
      '--bg-card':         '#111d32',
      '--bg-input':        '#162033',
      '--bg-hover':        '#1a2844',
      '--blue':            '#1E88E5',
      '--blue-dark':       '#1565C0',
      '--blue-muted':      'rgba(30,136,229,0.12)',
      '--blue-faint':      'rgba(30,136,229,0.14)',
      '--border':          '#1e3050',
      '--text':            '#EAEEF3',
      '--text-dim':        '#8899AA',
      '--text-muted':      '#556677',
      '--text-on-accent':  '#FFFFFF',
      '--danger':          '#EF5350',
      '--success':         '#66BB6A',
      '--warning':         '#FFD54F',
      '--info':            '#42A5F5',
      '--shadow-sm':       '0 8px 18px rgba(0, 0, 0, 0.24)',
      '--shadow-md':       '0 12px 24px rgba(0, 0, 0, 0.34)',
      '--shadow-lg':       '0 18px 36px rgba(0, 0, 0, 0.46)',
      '--shadow-modal':    '0 24px 48px rgba(0, 0, 0, 0.58)',
    },
    grupo: 'dark',
  },
  carbono: {
    nome: 'Carbono',
    preview: { bg: '#0f0f12', card: '#1a1a1f', accent: '#00bcd4' },
    vars: {
      '--bg':              '#0f0f12',
      '--bg-card':         '#1a1a1f',
      '--bg-input':        '#212126',
      '--bg-hover':        '#2a2a30',
      '--blue':            '#00bcd4',
      '--blue-dark':       '#0097a7',
      '--blue-muted':      'rgba(0,188,212,0.12)',
      '--blue-faint':      'rgba(0,188,212,0.14)',
      '--border':          '#2a2a35',
      '--text':            '#EAEEF3',
      '--text-dim':        '#888898',
      '--text-muted':      '#555565',
      '--text-on-accent':  '#0f0f12',
      '--danger':          '#EF5350',
      '--success':         '#66BB6A',
      '--warning':         '#FFD54F',
      '--info':            '#42A5F5',
      '--shadow-sm':       '0 8px 18px rgba(0, 0, 0, 0.24)',
      '--shadow-md':       '0 12px 24px rgba(0, 0, 0, 0.34)',
      '--shadow-lg':       '0 18px 36px rgba(0, 0, 0, 0.46)',
      '--shadow-modal':    '0 24px 48px rgba(0, 0, 0, 0.58)',
    },
    grupo: 'dark',
  },
  cobalto: {
    nome: 'Cobalto',
    preview: { bg: '#070d1f', card: '#0d1530', accent: '#2979ff' },
    vars: {
      '--bg':              '#070d1f',
      '--bg-card':         '#0d1530',
      '--bg-input':        '#111d3a',
      '--bg-hover':        '#162244',
      '--blue':            '#2979ff',
      '--blue-dark':       '#1565c0',
      '--blue-muted':      'rgba(41,121,255,0.12)',
      '--blue-faint':      'rgba(41,121,255,0.14)',
      '--border':          '#182a50',
      '--text':            '#EAEEF3',
      '--text-dim':        '#8899bb',
      '--text-muted':      '#445577',
      '--text-on-accent':  '#FFFFFF',
      '--danger':          '#EF5350',
      '--success':         '#66BB6A',
      '--warning':         '#FFD54F',
      '--info':            '#42A5F5',
      '--shadow-sm':       '0 8px 18px rgba(0, 0, 0, 0.24)',
      '--shadow-md':       '0 12px 24px rgba(0, 0, 0, 0.34)',
      '--shadow-lg':       '0 18px 36px rgba(0, 0, 0, 0.46)',
      '--shadow-modal':    '0 24px 48px rgba(0, 0, 0, 0.58)',
    },
    grupo: 'dark',
  },
  ametista: {
    nome: 'Ametista',
    preview: { bg: '#1a1028', card: '#241638', accent: '#b388ff' },
    vars: {
      '--bg':              '#1a1028',
      '--bg-card':         '#241638',
      '--bg-input':        '#2e1c44',
      '--bg-hover':        '#382250',
      '--blue':            '#b388ff',
      '--blue-dark':       '#9c6ee6',
      '--blue-muted':      'rgba(179,136,255,0.12)',
      '--blue-faint':      'rgba(179,136,255,0.14)',
      '--border':          '#3a2852',
      '--text':            '#ede7f6',
      '--text-dim':        '#b09bcc',
      '--text-muted':      '#7a6a8f',
      '--text-on-accent':  '#1a1028',
      '--danger':          '#EF5350',
      '--success':         '#66BB6A',
      '--warning':         '#FFD54F',
      '--info':            '#42A5F5',
      '--shadow-sm':       '0 8px 18px rgba(0, 0, 0, 0.24)',
      '--shadow-md':       '0 12px 24px rgba(0, 0, 0, 0.34)',
      '--shadow-lg':       '0 18px 36px rgba(0, 0, 0, 0.46)',
      '--shadow-modal':    '0 24px 48px rgba(0, 0, 0, 0.58)',
    },
    grupo: 'dark',
  },
  grafite: {
    nome: 'Grafite',
    preview: { bg: '#16161a', card: '#222228', accent: '#7a8ba8' },
    vars: {
      '--bg':              '#16161a',
      '--bg-card':         '#222228',
      '--bg-input':        '#2a2a30',
      '--bg-hover':        '#32323a',
      '--blue':            '#7a8ba8',
      '--blue-dark':       '#5c6e8c',
      '--blue-muted':      'rgba(122,139,168,0.12)',
      '--blue-faint':      'rgba(122,139,168,0.14)',
      '--border':          '#33333c',
      '--text':            '#e6e8ed',
      '--text-dim':        '#969aa6',
      '--text-muted':      '#60646e',
      '--text-on-accent':  '#16161a',
      '--danger':          '#EF5350',
      '--success':         '#66BB6A',
      '--warning':         '#FFD54F',
      '--info':            '#42A5F5',
      '--shadow-sm':       '0 8px 18px rgba(0, 0, 0, 0.24)',
      '--shadow-md':       '0 12px 24px rgba(0, 0, 0, 0.34)',
      '--shadow-lg':       '0 18px 36px rgba(0, 0, 0, 0.46)',
      '--shadow-modal':    '0 24px 48px rgba(0, 0, 0, 0.58)',
    },
    grupo: 'dark',
  },
  vinho: {
    nome: 'Vinho',
    preview: { bg: '#1c0e12', card: '#28151b', accent: '#c25a6c' },
    vars: {
      '--bg':              '#1c0e12',
      '--bg-card':         '#28151b',
      '--bg-input':        '#331c22',
      '--bg-hover':        '#3d232a',
      '--blue':            '#c25a6c',
      '--blue-dark':       '#a04050',
      '--blue-muted':      'rgba(194,90,108,0.12)',
      '--blue-faint':      'rgba(194,90,108,0.14)',
      '--border':          '#442a32',
      '--text':            '#f0e2e6',
      '--text-dim':        '#b8929c',
      '--text-muted':      '#7a5a64',
      '--text-on-accent':  '#1c0e12',
      '--danger':          '#EF5350',
      '--success':         '#66BB6A',
      '--warning':         '#FFD54F',
      '--info':            '#42A5F5',
      '--shadow-sm':       '0 8px 18px rgba(0, 0, 0, 0.24)',
      '--shadow-md':       '0 12px 24px rgba(0, 0, 0, 0.34)',
      '--shadow-lg':       '0 18px 36px rgba(0, 0, 0, 0.46)',
      '--shadow-modal':    '0 24px 48px rgba(0, 0, 0, 0.58)',
    },
    grupo: 'dark',
  },

  /* ───── LIGHT THEMES ───── */
  rosa: {
    nome: 'Rosa',
    preview: { bg: '#fce4ec', card: '#fff5f7', accent: '#e84f7a' },
    vars: {
      '--bg':              '#fce4ec',
      '--bg-card':         '#fff5f7',
      '--bg-input':        '#fdf0f4',
      '--bg-hover':        '#f8d7e2',
      '--blue':            '#e84f7a',
      '--blue-dark':       '#d42d5e',
      '--blue-muted':      'rgba(232,79,122,0.10)',
      '--blue-faint':      'rgba(232,79,122,0.05)',
      '--border':          '#f0c4d4',
      '--text':            '#2e121e',
      '--text-dim':        '#7a3a52',
      '--text-muted':      '#a86a7a',
      '--text-on-accent':  '#FFFFFF',
      '--danger':          '#D32F2F',
      '--success':         '#388E3C',
      '--warning':         '#F9A825',
      '--info':            '#0288D1',
      '--shadow-sm':       '0 8px 18px rgba(0, 0, 0, 0.08)',
      '--shadow-md':       '0 12px 24px rgba(0, 0, 0, 0.12)',
      '--shadow-lg':       '0 18px 36px rgba(0, 0, 0, 0.16)',
      '--shadow-modal':    '0 24px 48px rgba(0, 0, 0, 0.24)',
    },
    grupo: 'light',
  },
  perola: {
    nome: 'Pérola',
    preview: { bg: '#edf2f7', card: '#FFFFFF', accent: '#5b7fa5' },
    vars: {
      '--bg':              '#edf2f7',
      '--bg-card':         '#FFFFFF',
      '--bg-input':        '#e9eef5',
      '--bg-hover':        '#dfe6ef',
      '--blue':            '#5b7fa5',
      '--blue-dark':       '#45688a',
      '--blue-muted':      'rgba(91,127,165,0.10)',
      '--blue-faint':      'rgba(91,127,165,0.05)',
      '--border':          '#d0dae6',
      '--text':            '#1a2a38',
      '--text-dim':        '#4a6078',
      '--text-muted':      '#78909c',
      '--text-on-accent':  '#FFFFFF',
      '--danger':          '#D32F2F',
      '--success':         '#388E3C',
      '--warning':         '#F9A825',
      '--info':            '#0288D1',
      '--shadow-sm':       '0 8px 18px rgba(0, 0, 0, 0.08)',
      '--shadow-md':       '0 12px 24px rgba(0, 0, 0, 0.12)',
      '--shadow-lg':       '0 18px 36px rgba(0, 0, 0, 0.16)',
      '--shadow-modal':    '0 24px 48px rgba(0, 0, 0, 0.24)',
    },
    grupo: 'light',
  },
  floresta: {
    nome: 'Floresta',
    preview: { bg: '#ECF8F4', card: '#FFFFFF', accent: '#229E87' },
    vars: {
      '--bg':              '#ECF8F4',
      '--bg-card':         '#FFFFFF',

      '--bg-input':        '#E7F4F0',
      '--bg-hover':        '#DCEFE9',
      '--blue':            '#229E87',
      '--blue-dark':       '#1A7E6B',
      '--blue-muted':      'rgba(34,158,135,0.10)',
      '--blue-faint':      'rgba(34,158,135,0.05)',
      '--border':          '#C8E3DB',
      '--text':            '#16322C',
      '--text-dim':        '#45675F',
      '--text-muted':      '#6F9088',
      '--text-on-accent':  '#FFFFFF',
      '--danger':          '#D32F2F',
      '--success':         '#388E3C',
      '--warning':         '#F9A825',
      '--info':            '#0288D1',
      '--shadow-sm':       '0 8px 18px rgba(0, 0, 0, 0.08)',
      '--shadow-md':       '0 12px 24px rgba(0, 0, 0, 0.12)',
      '--shadow-lg':       '0 18px 36px rgba(0, 0, 0, 0.16)',
      '--shadow-modal':    '0 24px 48px rgba(0, 0, 0, 0.24)',
    },
    grupo: 'light',
  },
  lavanda: {
    nome: 'Lavanda',
    preview: { bg: '#F2EEFA', card: '#FFFFFF', accent: '#7A5CCF' },
    vars: {
      '--bg':              '#F2EEFA',
      '--bg-card':         '#FFFFFF',
      '--bg-input':        '#ECE7F8',
      '--bg-hover':        '#E3DCF4',
      '--blue':            '#7A5CCF',
      '--blue-dark':       '#6246B0',
      '--blue-muted':      'rgba(122,92,207,0.10)',
      '--blue-faint':      'rgba(122,92,207,0.05)',
      '--border':          '#D3C9EE',
      '--text':            '#231D33',
      '--text-dim':        '#554A73',
      '--text-muted':      '#7C729A',
      '--text-on-accent':  '#FFFFFF',
      '--danger':          '#D32F2F',
      '--success':         '#388E3C',
      '--warning':         '#F9A825',
      '--info':            '#0288D1',
      '--shadow-sm':       '0 8px 18px rgba(0, 0, 0, 0.08)',
      '--shadow-md':       '0 12px 24px rgba(0, 0, 0, 0.12)',
      '--shadow-lg':       '0 18px 36px rgba(0, 0, 0, 0.16)',
      '--shadow-modal':    '0 24px 48px rgba(0, 0, 0, 0.24)',
    },
    grupo: 'light',
  },
  pessego: {
    nome: 'Pêssego',
    preview: { bg: '#fef2ed', card: '#FFFFFF', accent: '#e8825a' },
    vars: {
      '--bg':              '#fef2ed',
      '--bg-card':         '#FFFFFF',
      '--bg-input':        '#feede6',
      '--bg-hover':        '#fce2d8',
      '--blue':            '#e8825a',
      '--blue-dark':       '#d4653a',
      '--blue-muted':      'rgba(232,130,90,0.10)',
      '--blue-faint':      'rgba(232,130,90,0.05)',
      '--border':          '#f0d2c8',
      '--text':            '#2e1c16',
      '--text-dim':        '#7a5042',
      '--text-muted':      '#a87c6c',
      '--text-on-accent':  '#FFFFFF',
      '--danger':          '#D32F2F',
      '--success':         '#388E3C',
      '--warning':         '#F9A825',
      '--info':            '#0288D1',
      '--shadow-sm':       '0 8px 18px rgba(0, 0, 0, 0.08)',
      '--shadow-md':       '0 12px 24px rgba(0, 0, 0, 0.12)',
      '--shadow-lg':       '0 18px 36px rgba(0, 0, 0, 0.16)',
      '--shadow-modal':    '0 24px 48px rgba(0, 0, 0, 0.24)',
    },
    grupo: 'light',
  },
  areia: {

    nome: 'Areia',
    preview: { bg: '#faf6f0', card: '#FFFFFF', accent: '#C8A566' },
    vars: {
      '--bg':              '#FAF6F0',
      '--bg-card':         '#FFFFFF',
      '--bg-input':        '#F8F3EC',
      '--bg-hover':        '#F2ECE2',
      '--blue':            '#C8A566',
      '--blue-dark':       '#B08E50',
      '--blue-muted':      'rgba(200,165,102,0.10)',
      '--blue-faint':      'rgba(200,165,102,0.05)',
      '--border':          '#E6DDD0',
      '--text':            '#2A2218',
      '--text-dim':        '#7A6A58',
      '--text-muted':      '#A89880',
      '--text-on-accent':  '#FFFFFF',
      '--danger':          '#D32F2F',
      '--success':         '#388E3C',
      '--warning':         '#F9A825',
      '--info':            '#0288D1',
      '--shadow-sm':       '0 8px 18px rgba(0, 0, 0, 0.08)',
      '--shadow-md':       '0 12px 24px rgba(0, 0, 0, 0.12)',
      '--shadow-lg':       '0 18px 36px rgba(0, 0, 0, 0.16)',
      '--shadow-modal':    '0 24px 48px rgba(0, 0, 0, 0.24)',
    },
    grupo: 'light',
  },
}

const STORAGE_KEY = 'plantao_tema'
const TEMA_PADRAO = 'noturno'

function _aplicarVars(id) {
  const tema = TEMAS[id]
  if (!tema) return
  const root = document.documentElement
  for (const [prop, val] of Object.entries(tema.vars)) {
    root.style.setProperty(prop, val)
  }
  // Força repaint em todos os elementos do DOM (corrige delay visual em mobile)
  // Chrome/Safari iOS não repintam nós fora da viewport sem esse trigger
  void requestAnimationFrame(() => {
    root.style.transition = 'opacity 0.01s'
    void document.body.offsetHeight
    requestAnimationFrame(() => {
      root.style.transition = ''
    })
  })
}


export function initTheme() {
  const salvo = localStorage.getItem(STORAGE_KEY) || TEMA_PADRAO
  _aplicarVars(salvo)
}

const _temaAtivo = ref(localStorage.getItem(STORAGE_KEY) || TEMA_PADRAO)

export function useTheme() {
  function aplicarTema(id) {
    if (!TEMAS[id]) return
    _aplicarVars(id)
    _temaAtivo.value = id
    localStorage.setItem(STORAGE_KEY, id)
  }

  /** Retorna temas separados por grupo: { dark: [...], light: [...] } */
  function temasAgrupados() {
    const dark = []
    const light = []
    for (const [id, t] of Object.entries(TEMAS)) {
      ;(t.grupo === 'light' ? light : dark).push({ id, ...t })
    }
    return { dark, light }
  }

  return { temas: TEMAS, temaAtivo: _temaAtivo, aplicarTema, temasAgrupados }
}
