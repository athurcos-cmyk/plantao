<template>
  <div class="screen">
    <header class="app-header">
      <button class="btn-icon" @click="router.back()">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>
      <button class="btn-home-logo" @click="router.push({ name: 'dashboard' })">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M12 2c0 0-1 3-1 6s1 4 1 4-1 1-1 4 1 6 1 6"/>
          <path d="M9 7c-2 1-3 2-3 3s2 2 6 2 6-1 6-2-1-2-3-3"/>
          <path d="M9 17c-2-1-3-2-3-3s2-2 6-2 6 1 6 2-1 2-3 3"/>
        </svg>
        <span>Plantão</span>
      </button>
      <div style="width:34px"/>
    </header>

    <div class="hist-topo">
      <h2 class="hist-titulo">Histórico</h2>
      <div class="sync-pill">
        <span class="sync-pill-label">código</span>
        <span class="sync-pill-code">{{ syncCodeMasked }}</span>
      </div>
    </div>

    <div class="filtros-wrap">
      <input v-model="filtro.busca" class="filtro-input" type="text" placeholder="Buscar por nome ou leito...">
      <div class="chips-scroll">
        <button v-for="op in tiposFiltro" :key="op.v" class="chip" :class="{ ativo: filtro.tipo === op.v }" @click="filtro.tipo = op.v">
          {{ op.l }}
        </button>
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

        <div v-if="editando === anot._key" class="edit-row">
          <div style="display:flex;gap:8px">
            <input class="edit-input" type="text" v-model="editForm.nome" placeholder="Nome do paciente" style="flex:2">
            <input class="edit-input" type="text" v-model="editForm.leito" placeholder="Leito" style="flex:1">
          </div>
          <div style="display:flex;gap:6px">
            <button class="btn-acao" @click="salvarEdicao(anot._key)">✓ Salvar</button>
            <button class="btn-acao" @click="editando = null">Cancelar</button>
          </div>
        </div>
        <div v-else class="anot-paciente-row">
          <span v-if="anot.nome || anot.leito" class="anot-paciente">
            {{ anot.nome }}{{ anot.nome && anot.leito ? ' · ' : '' }}{{ anot.leito ? 'Leito ' + anot.leito : '' }}
          </span>
          <span v-else class="anot-paciente sem-paciente">sem paciente registrado</span>
          <button class="btn-editar" @click="iniciarEdicao(anot)" title="Editar">✏️</button>
        </div>

        <p class="anot-texto">{{ anot.texto }}</p>

        <div class="anot-acoes">
          <button class="btn-acao" @click="copiar(anot.texto)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2"/>
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
            </svg>
            Copiar
          </button>
          <button class="btn-acao" @click="compartilhar(anot.texto)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/>
              <polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
            </svg>
            Enviar
          </button>
          <button class="btn-acao btn-acao-danger" @click="confirmarDeletar(anot)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
              <path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
            </svg>
            Excluir
          </button>
        </div>
      </div>
    </main>

    <div class="toast-feedback" :class="{ visivel: feedback }">{{ feedback }}</div>

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

const router = useRouter()
const store  = useAnotacoesStore()
const auth   = useAuthStore()

const syncCodeMasked = computed(() => {
  const c = auth.syncCode || ''
  if (c.length <= 4) return c
  return c.slice(0, 4) + '••••'
})

const filtro      = reactive({ busca: '', tipo: 'todos' })
const confirmando = ref(null)
const feedback    = ref('')
const editando    = ref(null)
const editForm    = reactive({ nome: '', leito: '' })

const tiposFiltro = [
  { v: 'todos',    l: 'Todos'         },
  { v: 'inicial',  l: 'Inicial'       },
  { v: 'sv',       l: 'Sinais Vitais' },
  { v: 'medicacao',l: 'Medicação'     },
  { v: 'curativo', l: 'Curativo'      },
  { v: 'banho',    l: 'Banho'         },
  { v: 'encamin',  l: 'Encaminhamento'},
  { v: 'passagem', l: 'Passagem'      },
  { v: 'livre',    l: 'Intercorrência'},
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
  if (filtro.tipo !== 'todos') lista = lista.filter(a => a.tipo === filtro.tipo)
  const busca = filtro.busca.trim().toLowerCase()
  if (busca) lista = lista.filter(a =>
    (a.nome  || '').toLowerCase().includes(busca) ||
    (a.leito || '').toLowerCase().includes(busca)
  )
  return lista
})

function labelTipo(tipo)  { return tipoLabels[tipo] || tipo }
function formatData(ts)   {
  return new Date(ts).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
  })
}

function copiar(texto) {
  navigator.clipboard.writeText(texto)
    .then(() => mostrarFeedback('Copiado!'))
    .catch(() => mostrarFeedback('Erro ao copiar'))
}

function compartilhar(texto) {
  window.open('https://api.whatsapp.com/send?text=' + encodeURIComponent(texto), '_blank')
}

function confirmarDeletar(anot) { confirmando.value = anot }

async function deletar() {
  if (!confirmando.value) return
  try   { await store.deletar(confirmando.value._key); mostrarFeedback('Excluído') }
  catch { mostrarFeedback('Erro ao excluir') }
  finally { confirmando.value = null }
}

function iniciarEdicao(anot) {
  editando.value = anot._key
  editForm.nome  = anot.nome  || ''
  editForm.leito = anot.leito || ''
}

async function salvarEdicao(key) {
  try   { await store.atualizar(key, { nome: editForm.nome, leito: editForm.leito }); editando.value = null; mostrarFeedback('Atualizado!') }
  catch { mostrarFeedback('Erro ao salvar') }
}

function mostrarFeedback(msg) {
  feedback.value = msg
  setTimeout(() => (feedback.value = ''), 2500)
}
</script>

<style scoped>
.btn-icon {
  background: none; border: none; color: var(--text-dim);
  cursor: pointer; padding: 6px; border-radius: 8px;
  display: flex; align-items: center;
}
.btn-icon:active { background: var(--bg-hover); }
.btn-home-logo {
  display: flex; align-items: center; gap: 6px;
  background: none; border: none; color: var(--blue);
  font-size: 1rem; font-weight: 700; font-family: inherit;
  cursor: pointer; padding: 4px 8px; border-radius: 8px;
}
.btn-home-logo:active { background: var(--bg-hover); }

.hist-topo {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 16px 6px; max-width: 480px; margin: 0 auto;
}
.hist-titulo { font-size: 1.3rem; font-weight: 700; color: var(--text); }
.sync-pill {
  display: flex; align-items: center; gap: 6px;
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: 20px; padding: 5px 12px;
}
.sync-pill-label {
  font-size: 0.68rem; color: var(--text-muted);
  text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600;
}
.sync-pill-code {
  font-family: monospace; font-size: 0.95rem;
  color: var(--blue); font-weight: 700; letter-spacing: 0.1em;
}

.filtros-wrap {
  background: var(--bg-card); border-bottom: 1px solid var(--border);
  padding: 10px 16px;
}
.filtro-input {
  width: 100%; background: var(--bg-input); border: 1px solid var(--border);
  border-radius: var(--radius); color: var(--text);
  font-family: inherit; font-size: 0.95rem; padding: 10px 14px; outline: none;
}
.filtro-input:focus { border-color: var(--blue); }
.chips-scroll {
  display: flex; gap: 6px; margin-top: 8px;
  overflow-x: auto; padding-bottom: 2px; scrollbar-width: none;
}
.chips-scroll::-webkit-scrollbar { display: none; }
.chip {
  background: var(--bg-input); border: 1px solid var(--border);
  border-radius: 20px; color: var(--text-muted);
  font-size: 0.78rem; font-family: inherit;
  padding: 6px 12px; cursor: pointer; white-space: nowrap;
  flex-shrink: 0; transition: all 0.15s;
}
.chip.ativo { background: var(--blue); border-color: var(--blue); color: #fff; font-weight: 600; }

.vazio { color: var(--text-muted); text-align: center; margin-top: 40px; }
.anot-card {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: 14px; padding: 14px 16px; margin-bottom: 12px;
}
.anot-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.anot-tipo { font-size: 0.8rem; font-weight: 700; color: var(--blue); }
.anot-data { font-size: 0.75rem; color: var(--text-muted); }

.anot-paciente-row { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; }
.anot-paciente { font-size: 0.82rem; color: var(--text-dim); font-weight: 500; flex: 1; }
.sem-paciente { color: var(--text-muted) !important; font-style: italic; font-weight: 400 !important; }
.btn-editar {
  background: none; border: none; cursor: pointer;
  font-size: 0.8rem; padding: 2px 4px; border-radius: 4px; color: var(--text-muted);
}
.btn-editar:active { background: var(--bg-hover); }

.edit-row { margin-bottom: 10px; display: flex; flex-direction: column; gap: 6px; }
.edit-input {
  background: var(--bg-input); border: 1px solid var(--blue);
  border-radius: var(--radius); color: var(--text);
  font-family: inherit; font-size: 0.9rem; padding: 8px 12px; outline: none;
}

.anot-texto {
  font-size: 0.88rem; color: var(--text);
  line-height: 1.6; white-space: pre-wrap; margin-bottom: 12px;
}
.anot-acoes { display: flex; gap: 6px; flex-wrap: wrap; }
.btn-acao {
  display: flex; align-items: center; gap: 5px;
  background: var(--bg-input); border: 1px solid var(--border);
  border-radius: 8px; color: var(--text-dim);
  font-size: 0.78rem; font-family: inherit;
  padding: 7px 12px; cursor: pointer; transition: all 0.15s;
}
.btn-acao:active { background: var(--bg-hover); }
.btn-acao-danger { color: var(--danger); }
.btn-acao-danger:active { border-color: var(--danger); }

.toast-feedback {
  position: fixed; bottom: 24px; left: 50%;
  transform: translateX(-50%) translateY(20px);
  background: #1a3a6e; color: var(--text);
  padding: 10px 20px; border-radius: 20px;
  font-size: 0.88rem; font-weight: 500;
  opacity: 0; transition: all 0.25s;
  pointer-events: none; z-index: 300;
  border: 1px solid #2a5298; white-space: nowrap;
}
.toast-feedback.visivel { opacity: 1; transform: translateX(-50%) translateY(0); }

.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.65);
  display: flex; align-items: center; justify-content: center; z-index: 200; padding: 24px;
}
.modal-confirm {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: 16px; padding: 24px; width: 100%; max-width: 320px; text-align: center;
}
.modal-confirm p { font-size: 1rem; font-weight: 600; color: var(--text); }
.confirm-sub { font-size: 0.82rem !important; color: var(--text-muted) !important; font-weight: 400 !important; margin-top: 4px !important; }
</style>
