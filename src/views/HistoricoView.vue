<template>
  <div class="screen">
    <header class="app-header">
      <button class="btn-icon" @click="router.back()">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>
      <h1>Histórico</h1>
      <div style="width:34px"/>
    </header>

    <!-- Código de sincronização -->
    <div class="sync-bar">
      <span class="sync-label">Seu código:</span>
      <span class="sync-code">{{ syncCode }}</span>
    </div>

    <!-- Filtros -->
    <div class="filtros-wrap">
      <input
        v-model="filtro.busca"
        class="filtro-input"
        type="text"
        placeholder="Buscar por nome ou leito..."
      >
      <div style="display:flex;gap:8px;margin-top:8px;overflow-x:auto;padding-bottom:2px">
        <button
          v-for="op in tiposFiltro" :key="op.v"
          class="chip"
          :class="{ ativo: filtro.tipo === op.v }"
          @click="filtro.tipo = op.v"
        >{{ op.l }}</button>
      </div>
    </div>

    <main class="container" style="padding-top:12px;padding-bottom:40px">
      <p v-if="anotacoesFiltradas.length === 0" class="vazio">
        {{ store.anotacoes.length === 0 ? 'Nenhuma anotação salva ainda.' : 'Nenhuma anotação encontrada.' }}
      </p>

      <div v-for="anot in anotacoesFiltradas" :key="anot._key" class="anot-card">
        <div class="anot-header">
          <span class="anot-tipo">{{ labelTipo(anot.tipo) }}</span>
          <span class="anot-data">{{ formatData(anot.timestamp) }}</span>
        </div>

        <p v-if="anot.nome || anot.leito" class="anot-paciente">
          <span v-if="anot.nome">{{ anot.nome }}</span>
          <span v-if="anot.nome && anot.leito"> · </span>
          <span v-if="anot.leito">Leito {{ anot.leito }}</span>
        </p>

        <p class="anot-texto">{{ anot.texto }}</p>

        <div class="anot-acoes">
          <button class="btn-acao" @click="copiar(anot.texto)" title="Copiar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2"/>
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
            </svg>
            Copiar
          </button>
          <button class="btn-acao" @click="compartilhar(anot.texto)" title="WhatsApp">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
            </svg>
            Enviar
          </button>
          <button class="btn-acao btn-acao-danger" @click="confirmarDeletar(anot)" title="Excluir">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
            </svg>
            Excluir
          </button>
        </div>
      </div>
    </main>

    <!-- Toast de feedback -->
    <div class="toast-feedback" :class="{ visivel: feedback }">{{ feedback }}</div>

    <!-- Modal confirmar exclusão -->
    <div v-if="confirmando" class="modal-overlay" @click.self="confirmando = null">
      <div class="modal-confirm">
        <p>Excluir esta anotação?</p>
        <p class="confirm-sub">{{ confirmando.nome ? confirmando.nome + ' · ' : '' }}{{ formatData(confirmando.timestamp) }}</p>
        <div style="display:flex;gap:10px;margin-top:16px">
          <button class="btn btn-secondary" style="flex:1" @click="confirmando = null">Cancelar</button>
          <button class="btn btn-danger" style="flex:1" @click="deletar">Excluir</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAnotacoesStore } from '../stores/anotacoes.js'
import { useAuthStore } from '../stores/auth.js'

const router  = useRouter()
const store   = useAnotacoesStore()
const auth    = useAuthStore()

const syncCode = computed(() => auth.syncCode || '—')

const filtro = reactive({ busca: '', tipo: 'todos' })
const confirmando = ref(null)
const feedback = ref('')

const tiposFiltro = [
  { v: 'todos',    l: 'Todos' },
  { v: 'inicial',  l: 'Inicial' },
  { v: 'sv',       l: 'Sinais Vitais' },
  { v: 'medicacao',l: 'Medicação' },
  { v: 'curativo', l: 'Curativo' },
  { v: 'banho',    l: 'Banho' },
  { v: 'encamin',  l: 'Encaminhamento' },
  { v: 'passagem', l: 'Passagem' },
  { v: 'livre',    l: 'Intercorrência' },
]

const tipoLabels = {
  inicial:   '📋 Inicial',
  sv:        '📊 Sinais Vitais',
  medicacao: '💊 Medicação',
  encamin:   '🚑 Encaminhamento',
  banho:     '🛁 Banho',
  curativo:  '🩹 Curativo',
  passagem:  '🔄 Passagem de Plantão',
  livre:     '📝 Intercorrência',
}

const anotacoesFiltradas = computed(() => {
  let lista = [...store.anotacoes].sort((a, b) => b.timestamp - a.timestamp)

  if (filtro.tipo !== 'todos') {
    lista = lista.filter(a => a.tipo === filtro.tipo)
  }

  const busca = filtro.busca.trim().toLowerCase()
  if (busca) {
    lista = lista.filter(a =>
      (a.nome  || '').toLowerCase().includes(busca) ||
      (a.leito || '').toLowerCase().includes(busca)
    )
  }

  return lista
})

function labelTipo(tipo) { return tipoLabels[tipo] || tipo }

function formatData(ts) {
  return new Date(ts).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit',
    hour: '2-digit', minute: '2-digit'
  })
}

function copiar(texto) {
  navigator.clipboard.writeText(texto)
    .then(() => mostrarFeedback('✓ Copiado!'))
    .catch(() => mostrarFeedback('Erro ao copiar'))
}

function compartilhar(texto) {
  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(texto)}`
  window.open(url, '_blank')
}

function confirmarDeletar(anot) {
  confirmando.value = anot
}

async function deletar() {
  if (!confirmando.value) return
  try {
    await store.deletar(confirmando.value._key)
    mostrarFeedback('Anotação excluída')
  } catch {
    mostrarFeedback('Erro ao excluir')
  } finally {
    confirmando.value = null
  }
}

function mostrarFeedback(msg) {
  feedback.value = msg
  setTimeout(() => (feedback.value = ''), 2500)
}
</script>

<style scoped>
/* Barra do código */
.sync-bar {
  background: var(--bg-card);
  border-bottom: 1px solid var(--border);
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
}
.sync-label { color: var(--text-muted); }
.sync-code {
  font-family: monospace;
  font-size: 0.95rem;
  color: var(--blue);
  font-weight: 700;
  letter-spacing: 0.1em;
}

/* Filtros */
.filtros-wrap {
  background: var(--bg-card);
  border-bottom: 1px solid var(--border);
  padding: 10px 16px 10px;
}
.filtro-input {
  width: 100%;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text);
  font-family: inherit;
  font-size: 0.95rem;
  padding: 10px 14px;
  outline: none;
}
.filtro-input:focus { border-color: var(--blue); }

.chip {
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: 20px;
  color: var(--text-muted);
  font-size: 0.78rem;
  font-family: inherit;
  padding: 6px 12px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
  flex-shrink: 0;
}
.chip.ativo {
  background: var(--blue);
  border-color: var(--blue);
  color: #fff;
  font-weight: 600;
}

/* Cards */
.vazio { color: var(--text-muted); text-align: center; margin-top: 40px; }

.anot-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 14px 16px;
  margin-bottom: 12px;
}
.anot-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.anot-tipo { font-size: 0.8rem; font-weight: 700; color: var(--blue); }
.anot-data { font-size: 0.75rem; color: var(--text-muted); }
.anot-paciente {
  font-size: 0.82rem;
  color: var(--text-dim);
  margin-bottom: 8px;
  font-weight: 500;
}
.anot-texto {
  font-size: 0.88rem;
  color: var(--text);
  line-height: 1.6;
  white-space: pre-wrap;
  margin-bottom: 12px;
}

/* Ações */
.anot-acoes {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.btn-acao {
  display: flex;
  align-items: center;
  gap: 5px;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-dim);
  font-size: 0.78rem;
  font-family: inherit;
  padding: 7px 12px;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-acao:active { background: var(--bg-hover); }
.btn-acao-danger { color: var(--danger) }
.btn-acao-danger:active { border-color: var(--danger); }

/* Toast */
.toast-feedback {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%) translateY(20px);
  background: #1a3a6e;
  color: var(--text);
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 0.88rem;
  font-weight: 500;
  opacity: 0;
  transition: all 0.25s;
  pointer-events: none;
  z-index: 300;
  border: 1px solid #2a5298;
  white-space: nowrap;
}
.toast-feedback.visivel {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

/* Modal confirmar */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 24px;
}
.modal-confirm {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 24px;
  width: 100%;
  max-width: 320px;
  text-align: center;
}
.modal-confirm p { font-size: 1rem; font-weight: 600; color: var(--text); }
.confirm-sub { font-size: 0.82rem; color: var(--text-muted); font-weight: 400 !important; margin-top: 4px !important; }
</style>
