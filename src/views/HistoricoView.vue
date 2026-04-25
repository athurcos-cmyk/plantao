<template>
  <div class="screen historico-screen">
    <header class="app-header">
      <button data-testid="auto-btn-historicoview-1" class="btn-icon" @click="router.push({ name: 'dashboard' })">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <button data-testid="auto-btn-historicoview-2" class="btn-home-logo" @click="router.push({ name: 'dashboard' })">
        <img src="/icons/icon-512.png" width="22" height="22" alt="Plantão" style="border-radius:5px;display:block" />
        <span>Plantão</span>
      </button>
      <button class="btn-ajuda" @click="helpAberto = true">? Ajuda</button>
    </header>

    <main class="container historico-page">
      <section class="hist-hero">
        <div class="hist-hero-copy">
          <span class="hist-kicker">Plantão</span>
          <h2 class="hist-titulo">Histórico</h2>
          <p class="hist-subtitulo">
            {{ anotacoesFiltradas.length }} de {{ store.anotacoes.length }} anotaç{{ store.anotacoes.length !== 1 ? 'ões' : 'ão' }}
            {{ anotacoesFiltradas.length !== 1 ? 'visíveis' : 'visível' }}
          </p>
        </div>

        <button class="sync-pill" @click="mostrarCodigo = !mostrarCodigo" title="Seu código para entrar em outro celular">
          <span class="sync-pill-label">{{ mostrarCodigo ? 'código de acesso' : 'ver meu código' }}</span>
          <span class="sync-pill-code">{{ mostrarCodigo ? auth.syncCode : syncCodeMasked }}</span>
          <svg v-if="!mostrarCodigo" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="opacity:0.6;flex-shrink:0">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="opacity:0.6;flex-shrink:0">
            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
            <line x1="1" y1="1" x2="23" y2="23" />
          </svg>
        </button>
      </section>

      <transition name="fade">
        <p v-if="mostrarCodigo" class="sync-pill-hint">Use este código para entrar em outro celular ou tablet</p>
      </transition>

      <section class="filtros-wrap">
        <div class="filtros-head">
          <div class="filtros-head-copy">
            <span class="filtros-label">Filtrar anotações</span>
            <span class="filtros-total">{{ anotacoesFiltradas.length }} resultado{{ anotacoesFiltradas.length !== 1 ? 's' : '' }}</span>
          </div>

          <button
            v-if="store.anotacoes.length > 0"
            data-testid="auto-btn-historicoview-12"
            class="btn-limpar-tudo"
            @click="confirmandoLimpar = true"
            :title="pacienteAtivo ? 'Apagar anotações de ' + pacienteAtivo.nome : 'Apagar todo o histórico'"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
              <path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
            </svg>
            {{ pacienteAtivo ? 'Limpar ' + pacienteAtivo.nome : 'Limpar tudo' }}
          </button>
        </div>

        <div class="busca-row">
          <input
            data-testid="auto-input-historicoview-1"
            v-model="filtro.busca"
            class="filtro-input"
            type="text"
            placeholder="Buscar por paciente ou leito..."
          />
        </div>

        <div class="chips-scroll">
          <button
            v-for="op in tiposFiltro"
            :key="op.v"
            data-testid="auto-btn-historicoview-3"
            class="chip"
            :class="{ ativo: filtro.tipo === op.v }"
            @click="filtro.tipo = op.v"
          >
            {{ op.l }}
          </button>
        </div>

        <div v-if="pacientesStore.pacientes.length > 0" class="chips-scroll chips-scroll-pacientes">
          <button
            v-for="p in pacientesStore.pacientes"
            :key="p._key"
            class="chip chip-pac"
            :class="{ ativo: filtro.busca === p.nome }"
            @click="filtro.busca = filtro.busca === p.nome ? '' : p.nome"
          >
            {{ p.leito ? p.leito + ' · ' : '' }}{{ p.nome }}
          </button>
        </div>
      </section>

      <p v-if="anotacoesFiltradas.length === 0" class="vazio">
        {{ store.anotacoes.length === 0 ? 'Nenhuma anotação salva ainda.' : 'Nenhuma anotação encontrada.' }}
      </p>

      <div v-for="anot in anotacoesVisiveis" :key="anot._key" class="anot-card">
        <div class="anot-header">
          <span class="anot-tipo">
            <img v-if="iconeTipo(anot.tipo)" :src="iconeTipo(anot.tipo)" :alt="labelTipo(anot.tipo)" class="anot-tipo-icon" />
            <span>{{ labelTipo(anot.tipo) }}</span>
          </span>
          <span class="anot-data">{{ formatData(anot.timestamp) }}</span>
        </div>

        <div v-if="editando === anot._key" class="edit-row">
          <div style="display:flex;gap:8px">
            <input data-testid="auto-input-historicoview-2" class="edit-input" type="text" v-model="editForm.nome" placeholder="Nome do paciente" style="flex:2" />
            <input data-testid="auto-input-historicoview-3" class="edit-input" type="text" v-model="editForm.leito" placeholder="Leito" style="flex:1" />
          </div>
          <div style="display:flex;gap:6px">
            <button data-testid="auto-btn-historicoview-4" class="btn-acao btn-acao-primary" @click="salvarEdicao(anot._key)">Salvar</button>
            <button data-testid="auto-btn-historicoview-5" class="btn-acao" @click="editando = null">Cancelar</button>
          </div>
        </div>

        <div v-else class="anot-paciente-row">
          <span v-if="anot.nome || anot.leito" class="anot-paciente">
            {{ anot.nome }}{{ anot.nome && anot.leito ? ' · ' : '' }}{{ anot.leito ? 'Leito ' + anot.leito : '' }}
          </span>
          <span v-else class="anot-paciente sem-paciente">sem paciente registrado</span>
          <button data-testid="auto-btn-historicoview-6" class="btn-editar" @click="iniciarEdicao(anot)" title="Editar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        </div>

        <p class="anot-texto">{{ anot.texto }}</p>

        <div class="anot-acoes">
          <button data-testid="auto-btn-historicoview-7" class="btn-acao" @click="copiar(anot.texto)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
            Copiar
          </button>
          <button data-testid="auto-btn-historicoview-8" class="btn-acao" @click="compartilhar(anot.texto)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
            Enviar
          </button>
          <button data-testid="auto-btn-historicoview-9" class="btn-acao btn-acao-danger" @click="confirmarDeletar(anot)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
              <path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
            </svg>
            Excluir
          </button>
        </div>
      </div>

      <button
        v-if="anotacoesVisiveis.length < anotacoesFiltradas.length"
        class="btn-acao btn-acao-mais"
        style="width:100%;justify-content:center;margin-top:4px"
        @click="visiveisCount += 40"
      >
        Mostrar mais
      </button>
    </main>

    <div class="toast-feedback" :class="{ visivel: feedback }">{{ feedback }}</div>

    <div v-if="confirmandoLimpar" class="modal-overlay" @click.self="confirmandoLimpar = false">
      <div class="modal-confirm">
        <p>{{ pacienteAtivo ? 'Apagar anotações de ' + pacienteAtivo.nome + '?' : 'Apagar todo o histórico?' }}</p>
        <p class="confirm-sub">{{ anotacoesFiltradas.length }} anotaç{{ anotacoesFiltradas.length !== 1 ? 'ões' : 'ão' }} serão excluídas permanentemente.</p>
        <div style="display:flex;gap:10px;margin-top:16px">
          <button data-testid="auto-btn-historicoview-13" class="btn btn-secondary" style="flex:1" @click="confirmandoLimpar = false">Cancelar</button>
          <button data-testid="auto-btn-historicoview-14" class="btn btn-danger" style="flex:1" @click="executarLimparTudo">{{ pacienteAtivo ? 'Apagar' : 'Apagar tudo' }}</button>
        </div>
      </div>
    </div>

    <HelpModal :aberto="helpAberto" @fechar="helpAberto = false" titulo="Como usar o Histórico" :itens="helpItens" />

    <div v-if="confirmando" class="modal-overlay" @click.self="confirmando = null">
      <div class="modal-confirm">
        <p>Excluir esta anotação?</p>
        <p class="confirm-sub">{{ confirmando.nome ? confirmando.nome + ' · ' : '' }}{{ formatData(confirmando.timestamp) }}</p>
        <div style="display:flex;gap:10px;margin-top:16px">
          <button data-testid="auto-btn-historicoview-10" class="btn btn-secondary" style="flex:1" @click="confirmando = null">Cancelar</button>
          <button data-testid="auto-btn-historicoview-11" class="btn btn-danger" style="flex:1" @click="deletar">Excluir</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAnotacoesStore } from '../stores/anotacoes.js'
import { useAuthStore } from '../stores/auth.js'
import { usePacientesStore } from '../stores/pacientes.js'
import HelpModal from '../components/HelpModal.vue'
import { useCopia } from '../composables/useCopia.js'
import iconSv from '../assets/dashboard-icons-png/sinais-vitais.png'
import iconMedicacao from '../assets/dashboard-icons-png/medicacao.png'
import iconLivre from '../assets/dashboard-icons-png/notas-lives.png'
import iconPassagem from '../assets/dashboard-icons-png/passagem.png'
import iconEncaminhamento from '../assets/dashboard-icons-png/encaminhamento.png'
import iconHigienizacao from '../assets/dashboard-icons-png/higienizacao.png'
import iconCurativo from '../assets/dashboard-icons-png/curativo.png'
import iconInicial from '../assets/dashboard-icons-png/anotacao-inicial.png'

const router = useRouter()
const store = useAnotacoesStore()
const { limparPorKeys } = store
const auth = useAuthStore()
const pacientesStore = usePacientesStore()

onMounted(() => pacientesStore.iniciar())

const mostrarCodigo = ref(false)
const helpAberto = ref(false)

const helpItens = [
  { icone: '🔍', titulo: 'Busca', desc: 'Digite o nome do paciente ou o leito para filtrar rapidamente.' },
  { icone: '🏷️', titulo: 'Filtro por tipo', desc: 'Use os chips para ver apenas um tipo específico de anotação.' },
  { icone: '🛏️', titulo: 'Filtro por paciente', desc: 'Os pacientes registrados aparecem como atalhos para filtro rápido.' },
  { icone: '📋', titulo: 'Copiar e compartilhar', desc: 'Use os botões para copiar o texto ou enviar a anotação para outro app.' },
  { icone: '✏️', titulo: 'Editar', desc: 'Você pode ajustar nome e leito de uma anotação já salva.' },
  { icone: '🗑️', titulo: 'Excluir', desc: 'Excluir remove a anotação permanentemente. Limpar tudo apaga o histórico filtrado ou inteiro.' },
]

const syncCodeMasked = computed(() => {
  const c = auth.syncCode || ''
  if (c.length <= 4) return c
  return c.slice(0, 4) + '••••'
})

const filtro = reactive({ busca: '', tipo: 'todos' })
const confirmando = ref(null)
const confirmandoLimpar = ref(false)
const feedback = ref('')
const editando = ref(null)
const editForm = reactive({ nome: '', leito: '' })
const visiveisCount = ref(40)
const { copiar: copiarTexto } = useCopia()

const tiposFiltro = [
  { v: 'todos', l: 'Todos' },
  { v: 'inicial', l: 'Inicial' },
  { v: 'sv', l: 'Sinais Vitais' },
  { v: 'medicacao', l: 'Medicação' },
  { v: 'curativo', l: 'Curativo' },
  { v: 'banho', l: 'Higienização' },
  { v: 'encaminhamento', l: 'Encaminhamento' },
  { v: 'passagem', l: 'Passagem' },
  { v: 'livre', l: 'Notas Livres' },
]

const tipoLabels = {
  inicial: 'Inicial',
  sv: 'Sinais Vitais',
  medicacao: 'Medicação',
  encamin: 'Encaminhamento',
  encaminhamento: 'Encaminhamento',
  banho: 'Higienização',
  curativo: 'Curativo',
  passagem: 'Passagem de Plantão',
  livre: 'Notas Livres',
}

const tipoIcons = {
  inicial: iconInicial,
  sv: iconSv,
  medicacao: iconMedicacao,
  encamin: iconEncaminhamento,
  encaminhamento: iconEncaminhamento,
  banho: iconHigienizacao,
  curativo: iconCurativo,
  passagem: iconPassagem,
  livre: iconLivre,
}

function extrairHora(texto) {
  const m = (texto || '').match(/^(\d{2})h(\d{2})/)
  if (!m) return -1
  return parseInt(m[1]) * 60 + parseInt(m[2])
}

const anotacoesOrdenadas = computed(() =>
  [...store.anotacoes].sort((a, b) => {
    const diaA = new Date(a.timestamp).setHours(0, 0, 0, 0)
    const diaB = new Date(b.timestamp).setHours(0, 0, 0, 0)
    if (diaB !== diaA) return diaB - diaA
    const horaA = extrairHora(a.texto)
    const horaB = extrairHora(b.texto)
    if (horaB !== horaA) return horaB - horaA
    return b.timestamp - a.timestamp
  })
)

const pacienteAtivo = computed(() =>
  pacientesStore.pacientes.find((p) => p.nome === filtro.busca) || null
)

const anotacoesFiltradas = computed(() => {
  let lista = anotacoesOrdenadas.value
  if (filtro.tipo !== 'todos') lista = lista.filter((a) => a.tipo === filtro.tipo)
  const busca = filtro.busca.trim().toLowerCase()
  if (busca) {
    lista = lista.filter((a) =>
      (a.nome || '').toLowerCase().includes(busca) ||
      (a.leito || '').toLowerCase().includes(busca)
    )
  }
  return lista
})

const anotacoesVisiveis = computed(() =>
  anotacoesFiltradas.value.slice(0, visiveisCount.value)
)

watch(
  [() => filtro.busca, () => filtro.tipo, () => store.anotacoes.length],
  () => { visiveisCount.value = 40 }
)

function labelTipo(tipo) { return tipoLabels[tipo] || tipo }
function iconeTipo(tipo) { return tipoIcons[tipo] || '' }

function formatData(ts) {
  return new Date(ts).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function copiar(texto) {
  const ok = await copiarTexto(texto)
  mostrarFeedback(ok ? 'Copiado!' : 'Erro ao copiar')
}

function compartilhar(texto) {
  window.open('https://api.whatsapp.com/send?text=' + encodeURIComponent(texto), '_blank')
}

function confirmarDeletar(anot) {
  confirmando.value = anot
}

async function deletar() {
  if (!confirmando.value) return
  try {
    await store.deletar(confirmando.value._key)
    mostrarFeedback('Excluído')
  } catch {
    mostrarFeedback('Erro ao excluir')
  } finally {
    confirmando.value = null
  }
}

function iniciarEdicao(anot) {
  editando.value = anot._key
  editForm.nome = anot.nome || ''
  editForm.leito = anot.leito || ''
}

async function salvarEdicao(key) {
  try {
    await store.atualizar(key, { nome: editForm.nome, leito: editForm.leito })
    editando.value = null
    mostrarFeedback('Atualizado!')
  } catch {
    mostrarFeedback('Erro ao salvar')
  }
}

async function executarLimparTudo() {
  try {
    if (pacienteAtivo.value) {
      const keys = anotacoesFiltradas.value.map((a) => a._key)
      await limparPorKeys(keys)
      mostrarFeedback('Anotações de ' + pacienteAtivo.value.nome + ' apagadas')
    } else {
      await store.limparTudo()
      mostrarFeedback('Histórico apagado')
    }
  } catch {
    mostrarFeedback('Erro ao apagar')
  } finally {
    confirmandoLimpar.value = false
  }
}

function mostrarFeedback(msg) {
  feedback.value = msg
  setTimeout(() => (feedback.value = ''), 2500)
}
</script>

<style scoped>
.historico-screen {
  --hist-surface-1: color-mix(in srgb, var(--bg-card) 86%, var(--bg) 14%);
  --hist-surface-2: color-mix(in srgb, var(--bg-input) 72%, var(--bg) 28%);
  --hist-border-soft: color-mix(in srgb, var(--border) 82%, var(--blue) 18%);
  --hist-border-strong: color-mix(in srgb, var(--border) 68%, var(--blue) 32%);
  --hist-shadow: color-mix(in srgb, #000 78%, var(--bg) 22%);
  background:
    radial-gradient(circle at top center, var(--blue-faint), transparent 34%),
    var(--bg);
}

.historico-page {
  width: 100%;
  max-width: 980px;
  padding-top: 18px;
  padding-bottom: 136px;
}

.btn-icon {
  background: none;
  border: none;
  color: var(--text-dim);
  cursor: pointer;
  padding: 6px;
  border-radius: 10px;
  display: flex;
  align-items: center;
}

.btn-icon:active {
  background: var(--bg-hover);
}

.btn-home-logo {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: var(--blue);
  font-size: 1rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 10px;
}

.btn-home-logo:active {
  background: var(--bg-hover);
}

.hist-hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  padding: 18px;
  margin-bottom: 10px;
  border: 1px solid var(--hist-border-soft);
  border-radius: 22px;
  background: linear-gradient(145deg, var(--hist-surface-1), var(--hist-surface-2));
  box-shadow: 0 22px 40px color-mix(in srgb, var(--hist-shadow) 26%, transparent);
}

.hist-hero-copy {
  min-width: 0;
}

.hist-kicker {
  display: inline-flex;
  align-items: center;
  min-height: 22px;
  padding: 0 10px;
  margin-bottom: 10px;
  border-radius: 999px;
  background: var(--blue-muted);
  color: var(--blue);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.hist-titulo {
  font-size: 1.65rem;
  font-weight: 800;
  color: var(--text);
  line-height: 1.05;
}

.hist-subtitulo {
  margin-top: 10px;
  color: var(--text-dim);
  font-size: 0.9rem;
  line-height: 1.45;
}

.sync-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 44px;
  padding: 0 14px;
  border: 1px solid var(--border);
  border-radius: 16px;
  background: var(--bg);
  color: var(--text);
  cursor: pointer;
  flex-shrink: 0;
}

.sync-pill-label {
  font-size: 0.68rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 700;
}

.sync-pill-code {
  font-family: monospace;
  font-size: 1rem;
  color: var(--blue);
  font-weight: 800;
  letter-spacing: 0.08em;
}

.sync-pill-hint {
  margin: 0 4px 14px;
  color: var(--text-muted);
  font-size: 0.8rem;
  line-height: 1.4;
}

.filtros-wrap {
  margin-bottom: 16px;
  padding: 16px;
  border: 1px solid var(--border);
  border-radius: 20px;
  background: var(--bg-card);
  box-shadow: 0 18px 36px rgba(0, 0, 0, 0.2);
}

.filtros-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.filtros-head-copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.filtros-label {
  color: var(--text);
  font-size: 0.95rem;
  font-weight: 700;
}

.filtros-total {
  color: var(--text-muted);
  font-size: 0.8rem;
}

.btn-limpar-tudo {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 38px;
  padding: 0 12px;
  background: var(--danger-muted);
  border: 1px solid var(--danger);
  border-radius: 12px;
  color: var(--danger);
  font-size: 0.78rem;
  font-family: inherit;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
}

.btn-limpar-tudo:active {
  transform: translateY(1px);
}

.busca-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filtro-input {
  width: 100%;
  min-height: 52px;
  padding: 0 16px;
  border-radius: 16px;
  border: 1px solid var(--border);
  background: var(--bg-input);
  color: var(--text);
  font-family: inherit;
  font-size: 0.96rem;
  outline: none;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}

.filtro-input:focus {
  border-color: var(--blue);
  box-shadow: 0 0 0 3px var(--blue-muted);
}

.chips-scroll {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  overflow-x: auto;
  padding-bottom: 2px;
  scrollbar-width: none;
}

.chips-scroll::-webkit-scrollbar {
  display: none;
}

.chips-scroll-pacientes {
  margin-top: 10px;
}

.chip {
  min-height: 40px;
  padding: 0 14px;
  border-radius: 14px;
  border: 1px solid var(--border);
  background: var(--bg-input);
  color: var(--text-dim);
  font-size: 0.84rem;
  font-family: inherit;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
  cursor: pointer;
  transition: border-color 0.18s ease, background 0.18s ease, color 0.18s ease, transform 0.18s ease;
}

.chip.ativo {
  background: linear-gradient(135deg, var(--blue-dark), var(--blue));
  border-color: var(--blue);
  color: #fff;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.28);
}

.chip-pac:not(.ativo) {
  color: var(--text-dim);
}

.vazio {
  padding: 28px 18px;
  margin-top: 10px;
  border: 1px dashed var(--hist-border-strong);
  border-radius: 20px;
  background: color-mix(in srgb, var(--bg-card) 70%, transparent);
  color: var(--text-muted);
  text-align: center;
  line-height: 1.5;
}

.anot-card {
  margin-bottom: 14px;
  padding: 16px;
  border: 1px solid var(--hist-border-soft);
  border-radius: 20px;
  background: linear-gradient(180deg, var(--hist-surface-1), var(--hist-surface-2));
  box-shadow: 0 16px 32px color-mix(in srgb, var(--hist-shadow) 20%, transparent);
  content-visibility: auto;
  contain-intrinsic-size: 280px;
}

.anot-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 10px;
}

.anot-tipo {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  background: var(--blue-muted);
  border: 1px solid var(--border);
  color: var(--blue);
  font-size: 0.78rem;
  font-weight: 800;
}

.anot-tipo-icon {
  width: 16px;
  height: 16px;
  object-fit: contain;
  flex-shrink: 0;
  filter: drop-shadow(0 2px 6px color-mix(in srgb, var(--blue) 28%, transparent));
}

.anot-data {
  color: var(--text-muted);
  font-size: 0.78rem;
  flex-shrink: 0;
}

.anot-paciente-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.anot-paciente {
  flex: 1;
  color: var(--text-dim);
  font-size: 0.84rem;
  font-weight: 600;
}

.sem-paciente {
  color: var(--text-muted);
  font-style: italic;
  font-weight: 500;
}

.btn-editar {
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--bg-input);
  color: var(--text-dim);
  cursor: pointer;
  flex-shrink: 0;
}

.btn-editar:active {
  transform: translateY(1px);
}

.edit-row {
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.edit-input {
  min-height: 46px;
  padding: 0 14px;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: 14px;
  color: var(--text);
  font-family: inherit;
  font-size: 0.92rem;
  outline: none;
}

.anot-texto {
  margin-bottom: 14px;
  color: var(--text);
  font-size: 0.95rem;
  line-height: 1.62;
  white-space: pre-wrap;
}

.anot-acoes {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.btn-acao {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 40px;
  padding: 0 14px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--bg-input);
  color: var(--text-dim);
  font-size: 0.82rem;
  font-family: inherit;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.18s ease, border-color 0.18s ease, color 0.18s ease;
}

.btn-acao:active {
  transform: translateY(1px);
}

.btn-acao-primary {
  color: var(--text);
  border-color: var(--blue);
  background: linear-gradient(135deg, var(--blue-dark), var(--blue));
}

.btn-acao-danger {
  color: var(--danger);
  border-color: var(--danger);
}

.btn-acao-mais {
  margin-top: 6px;
  min-height: 50px;
  justify-content: center;
  border-radius: 16px;
  color: var(--text);
  border-color: var(--blue);
  background: linear-gradient(180deg, var(--blue-dark), var(--blue));
}

.toast-feedback {
  position: fixed;
  bottom: calc(24px + env(safe-area-inset-bottom, 0px));
  left: 50%;
  transform: translateX(-50%) translateY(20px);
  padding: 12px 20px;
  border-radius: 18px;
  border: 1px solid var(--border);
  background: var(--bg-card);
  color: var(--text);
  font-size: 0.88rem;
  font-weight: 700;
  opacity: 0;
  transition: all 0.25s;
  pointer-events: none;
  z-index: 300;
  white-space: nowrap;
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.24);
}

.toast-feedback.visivel {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(2, 8, 18, 0.72);
  backdrop-filter: blur(4px);
  z-index: 200;
}

.modal-confirm {
  width: 100%;
  max-width: 332px;
  padding: 24px;
  border-radius: 20px;
  border: 1px solid var(--hist-border-soft);
  background: linear-gradient(180deg, var(--hist-surface-1), var(--hist-surface-2));
  text-align: center;
  box-shadow: 0 24px 42px color-mix(in srgb, var(--hist-shadow) 34%, transparent);
}

.modal-confirm p {
  color: var(--text);
  font-size: 1rem;
  font-weight: 700;
}

.confirm-sub {
  margin-top: 6px !important;
  color: var(--text-muted) !important;
  font-size: 0.84rem !important;
  font-weight: 500 !important;
  line-height: 1.45;
}

@media (max-width: 420px) {
  .hist-hero {
    flex-direction: column;
  }

  .sync-pill {
    width: 100%;
    justify-content: space-between;
  }

  .filtros-head {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-limpar-tudo {
    justify-content: center;
  }
}

@media (min-width: 768px) {
  .historico-page {
    max-width: 1080px;
    padding-left: 20px;
    padding-right: 20px;
  }

  .hist-hero {
    padding: 22px 24px;
  }

  .filtros-wrap {
    padding: 18px 20px;
  }

  .anot-card {
    padding: 18px 20px;
  }
}

@media (min-width: 1100px) {
  .historico-page {
    max-width: 1240px;
    padding-left: 24px;
    padding-right: 24px;
  }

  .hist-hero {
    display: grid;
    grid-template-columns: minmax(280px, 420px) minmax(320px, 1fr);
    align-items: start;
  }

  .sync-pill {
    justify-self: end;
    min-width: 280px;
  }

  .filtros-wrap {
    padding: 20px 22px;
  }

  .anot-card {
    padding: 20px 22px;
  }

  .anot-texto {
    font-size: 0.97rem;
  }
}
</style>
