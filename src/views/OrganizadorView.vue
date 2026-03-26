<template>
  <div class="screen">
    <header class="app-header">
      <button class="btn-icon" @click="router.push({ name: 'dashboard' })">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>
      <button class="btn-home-logo" @click="router.push({ name: 'dashboard' })">
        <img src="/icons/icon-512.png" width="22" height="22" alt="Plantão" style="border-radius:5px;display:block" />
        <span>Plantão</span>
      </button>
      <div style="display:flex;align-items:center;gap:6px">
        <button class="btn-ajuda" @click="helpAberto = true">? Ajuda</button>
        <button class="btn-icon" @click="modalTemplate = true" title="Tarefas padrão">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
          </svg>
        </button>
      </div>
    </header>

    <main class="container" style="padding-top:20px;padding-bottom:100px">

      <!-- Empty state: no active shift -->
      <div v-if="!store.plantao" class="empty-state">
        <div class="empty-icon">📋</div>
        <p class="empty-titulo">Nenhum plantão ativo</p>
        <p class="empty-sub">Inicie seu plantão para organizar as tarefas do dia</p>
        <button class="btn btn-primary" style="margin-top:20px" @click="store.iniciarPlantao()">
          Iniciar plantão
        </button>
      </div>

      <!-- Active shift -->
      <div v-if="store.plantao">

        <!-- Shift info bar -->
        <div class="plantao-bar">
          <span class="plantao-info-txt">{{ formatarInicio(store.plantao.iniciadoEm) }}</span>
          <button class="btn-outline-sm" @click="confirmarNovo = true">Novo plantão</button>
        </div>

        <!-- Progress bar -->
        <div class="progress-wrap">
          <div class="progress-fill" :style="{ width: progressoPct + '%' }"></div>
        </div>
        <p class="progress-label">{{ concluidas }} de {{ total }} tarefas concluídas</p>

        <!-- Tarefas section -->
        <div class="secao-header">
          <span class="secao-titulo">Tarefas do plantão</span>
          <span v-if="total - concluidas > 0" class="secao-badge">{{ total - concluidas }}</span>
        </div>

        <div class="tarefas-lista">
          <div
            v-for="tarefa in store.plantao.tarefas"
            :key="tarefa._key"
            class="tarefa-row"
            :class="{ feito: tarefa.feito }"
          >
            <!-- Checkbox -->
            <button
              class="tarefa-check"
              :class="{ checked: tarefa.feito }"
              @click="store.toggleTarefa(tarefa._key, tarefa.feito)"
            >
              <svg v-if="tarefa.feito" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </button>

            <!-- Text -->
            <span class="tarefa-texto" :class="{ feito: tarefa.feito }">{{ tarefa.texto }}</span>

            <!-- Delete (only avulsa tasks) -->
            <button
              v-if="tarefa.avulsa"
              class="btn-icon-xs"
              style="color:var(--danger);opacity:0.6"
              @click="store.excluirTarefa(tarefa._key)"
              title="Remover tarefa"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <!-- Add extra task row -->
          <div class="add-tarefa-row">
            <input
              class="add-input"
              type="text"
              placeholder="＋ Tarefa extra..."
              v-model="novaTarefa.texto"
              @keyup.enter="adicionarAvulsa"
            >
            <button v-if="novaTarefa.texto.trim()" class="add-btn-sm" @click="adicionarAvulsa">Ok</button>
          </div>
        </div>

        <!-- Divider -->
        <div class="divider"></div>

        <!-- Próximo plantão section -->
        <div class="secao-header">
          <span class="secao-titulo">Passar pro próximo plantão</span>
        </div>

        <p v-if="store.plantao.proximoPlantao.length === 0" class="empty-hint">
          Nenhuma anotação para o próximo plantão
        </p>

        <div v-else class="prox-lista">
          <div
            v-for="item in store.plantao.proximoPlantao"
            :key="item._key"
            class="prox-item"
          >
            <span class="prox-bullet">›</span>
            <span class="prox-texto">{{ item.texto }}</span>
            <button class="btn-icon-xs" style="color:var(--text-muted);opacity:0.6" @click="store.excluirProximoPlantao(item._key)">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Add next shift note row -->
        <div class="add-tarefa-row">
          <input
            class="add-input"
            type="text"
            placeholder="＋ Anotar para o próximo plantão..."
            v-model="novaProxima"
            @keyup.enter="adicionarProxima"
          >
          <button v-if="novaProxima.trim()" class="add-btn-sm" @click="adicionarProxima">Ok</button>
        </div>

      </div>
    </main>

    <!-- Modal: confirm new shift -->
    <div v-if="confirmarNovo" class="modal-overlay" @click.self="confirmarNovo = false">
      <div class="modal-box">
        <h3 class="modal-titulo">Iniciar novo plantão?</h3>
        <p style="color:var(--text-muted);margin-top:8px;font-size:0.9rem;line-height:1.5">
          Todas as tarefas atuais serão resetadas. As anotações para o próximo plantão também serão apagadas.
        </p>
        <div style="display:flex;gap:8px;margin-top:16px">
          <button class="btn btn-secondary" style="flex:1" @click="confirmarNovo = false">Cancelar</button>
          <button class="btn btn-primary" style="flex:1" @click="() => { store.iniciarPlantao(); confirmarNovo = false }">Iniciar</button>
        </div>
      </div>
    </div>

    <!-- Modal: template management -->
    <div v-if="modalTemplate" class="modal-overlay" @click.self="modalTemplate = false">
      <div class="modal-box">
        <h3 class="modal-titulo">Tarefas padrão</h3>
        <p style="color:var(--text-muted);font-size:0.82rem;margin-top:4px;margin-bottom:14px">
          Essas tarefas são carregadas em todo novo plantão
        </p>

        <div class="modal-tpl-lista">
          <div v-for="t in store.template" :key="t._key" class="modal-tpl-item">
            <span class="modal-tpl-texto">{{ t.texto }}</span>
            <button class="btn-icon-xs" style="color:var(--text-muted);opacity:0.6" @click="store.removerDoTemplate(t._key)">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="add-tarefa-row" style="margin-top:10px;border-top:1px solid var(--border);padding-top:10px">
          <input
            class="add-input"
            type="text"
            placeholder="Nova tarefa padrão..."
            v-model="novoTemplateTxt"
            @keyup.enter="adicionarTemplate"
          >
          <button v-if="novoTemplateTxt.trim()" class="add-btn-sm" @click="adicionarTemplate">Adicionar</button>
        </div>

        <button class="btn-restaurar" @click="store.restaurarTemplate()">↺ Restaurar padrões</button>

        <div style="margin-top:12px">
          <button class="btn btn-secondary" style="width:100%" @click="modalTemplate = false">Fechar</button>
        </div>
      </div>
    </div>

    <HelpModal :aberto="helpAberto" @fechar="helpAberto = false" titulo="Como usar o Organizador" :itens="helpItens" />
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useOrganizadorStore } from '../stores/organizador.js'
import HelpModal from '../components/HelpModal.vue'

const router = useRouter()
const store  = useOrganizadorStore()

onMounted(() => {
  store.iniciar()
})

// Reactive state
const novaTarefa       = reactive({ texto: '' })
const novaProxima      = ref('')
const confirmarNovo    = ref(false)
const modalTemplate    = ref(false)
const novoTemplateTxt  = ref('')
const helpAberto       = ref(false)

const helpItens = [
  { icone: '▶️', titulo: 'Iniciar plantão', desc: 'Carrega as tarefas padrão do seu perfil. Configure as tarefas padrão pelo ícone ⚙️ no canto superior direito.' },
  { icone: '✅', titulo: 'Marcar tarefa', desc: 'Toque no círculo ao lado da tarefa para marcá-la como concluída. A barra de progresso e o contador atualizam automaticamente.' },
  { icone: '➕', titulo: 'Tarefa extra', desc: 'Use o campo "＋ Tarefa extra..." no final da lista para adicionar tarefas específicas do dia. Apenas essas tarefas extras podem ser excluídas.' },
  { icone: '📤', titulo: 'Próximo plantão', desc: 'Anote recados importantes para o próximo turno na seção "Passar pro próximo plantão". Ficam separados das tarefas.' },
  { icone: '⚙️', titulo: 'Tarefas padrão', desc: 'Toque no ícone ⚙️ para adicionar, remover ou restaurar as tarefas que carregam em todo novo plantão. Cada conta tem seu próprio template.' },
  { icone: '🔄', titulo: 'Novo plantão', desc: 'O botão "Novo plantão" reseta todas as tarefas atuais e recomeça do template. As anotações para o próximo plantão também são apagadas.' },
]

// Computed
const concluidas = computed(() => store.plantao?.tarefas.filter(t => t.feito).length ?? 0)
const total      = computed(() => store.plantao?.tarefas.length ?? 0)
const progressoPct = computed(() => total.value ? Math.round(concluidas.value / total.value * 100) : 0)

function formatarInicio(ts) {
  const d = new Date(ts)
  const hora = d.getHours().toString().padStart(2, '0') + 'h' + d.getMinutes().toString().padStart(2, '0')
  const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const dia = d.getDate().toString().padStart(2, '0')
  const mes = (d.getMonth() + 1).toString().padStart(2, '0')
  return `Iniciado às ${hora} · ${dias[d.getDay()]}, ${dia}/${mes}`
}

async function adicionarAvulsa() {
  const texto = novaTarefa.texto.trim()
  if (!texto) return
  novaTarefa.texto = ''
  await store.adicionarTarefaAvulsa(texto, '')
}

async function adicionarProxima() {
  const texto = novaProxima.value.trim()
  if (!texto) return
  novaProxima.value = ''
  await store.adicionarProximoPlantao(texto)
}

async function adicionarTemplate() {
  const texto = novoTemplateTxt.value.trim()
  if (!texto) return
  novoTemplateTxt.value = ''
  await store.adicionarAoTemplate(texto)
}
</script>

<style scoped>
/* Header icon buttons */
.btn-icon {
  background: none; border: none; color: var(--text-dim);
  cursor: pointer; padding: 6px; border-radius: 8px;
  display: flex; align-items: center;
}
.btn-icon:active { background: var(--bg-hover); }

/* Header logo button */
.btn-home-logo {
  display: flex; align-items: center; gap: 6px;
  color: var(--blue); font-size: 1.05rem; font-weight: 700;
  background: none; border: none; cursor: pointer; font-family: inherit;
}

/* Empty state */
.empty-state {
  text-align: center; padding: 60px 16px;
  display: flex; flex-direction: column; align-items: center;
}
.empty-icon { font-size: 3rem; margin-bottom: 14px; }
.empty-titulo { font-size: 1.05rem; font-weight: 700; color: var(--text); }
.empty-sub { font-size: 0.85rem; color: var(--text-muted); margin-top: 6px; line-height: 1.5; max-width: 280px; }

/* Shift bar */
.plantao-bar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 0; margin-bottom: 8px;
}
.plantao-info-txt {
  font-size: 0.82rem; color: var(--text-muted);
}

/* Progress */
.progress-wrap {
  height: 6px; background: var(--border); border-radius: 3px; margin-bottom: 6px;
}
.progress-fill {
  height: 100%; background: var(--blue); border-radius: 3px; transition: width 0.4s;
}
.progress-label {
  font-size: 0.75rem; color: var(--text-muted); margin-bottom: 16px;
}

/* Section header */
.secao-header {
  display: flex; align-items: center; gap: 8px; margin-bottom: 10px;
}
.secao-titulo {
  font-size: 0.72rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.08em; color: var(--text-muted);
}
.secao-badge {
  font-size: 0.68rem; font-weight: 700;
  background: rgba(30, 136, 229, 0.12); color: var(--blue);
  border: 1px solid rgba(30, 136, 229, 0.25);
  border-radius: 10px; padding: 1px 7px;
}

/* Tarefas */
.tarefas-lista {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 0 14px;
  margin-bottom: 4px;
}

.tarefa-row {
  display: flex; align-items: center; gap: 8px;
  padding: 9px 0; border-bottom: 1px solid var(--border);
  transition: opacity 0.2s;
}
.tarefa-row:last-child { border-bottom: none; }
.tarefa-row.feito { opacity: 0.45; }

.tarefa-check {
  width: 24px; height: 24px; flex-shrink: 0;
  border: 2px solid var(--border); border-radius: 50%;
  background: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
  color: #fff;
}
.tarefa-check.checked {
  background: var(--success); border-color: var(--success);
}

.tarefa-texto {
  flex: 1; font-size: 0.9rem; color: var(--text); line-height: 1.4;
}
.tarefa-texto.feito {
  text-decoration: line-through; color: var(--text-muted);
}

.btn-icon-xs {
  width: 26px; height: 26px; flex-shrink: 0;
  border: none; background: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  border-radius: 5px;
}
.btn-icon-xs:active { background: var(--bg-hover); }

/* Add task row */
.add-tarefa-row {
  display: flex; align-items: center; gap: 6px; padding: 10px 0;
}
.add-input {
  flex: 1; background: none; border: none; outline: none;
  font-family: inherit; font-size: 0.88rem; color: var(--text);
  padding: 2px 0;
}
.add-input::placeholder { color: var(--text-muted); }

.add-btn-sm {
  background: var(--blue); color: #fff;
  border: none; border-radius: 6px;
  font-size: 0.78rem; font-weight: 600;
  padding: 5px 12px; cursor: pointer; font-family: inherit;
  flex-shrink: 0;
}

/* Divider */
.divider {
  height: 1px; background: var(--border); margin: 20px 0;
}

/* Próximo plantão */
.prox-lista {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 0 14px;
  margin-bottom: 4px;
}
.prox-item {
  display: flex; align-items: flex-start; gap: 8px;
  padding: 8px 0; border-bottom: 1px solid var(--border);
}
.prox-item:last-child { border-bottom: none; }
.prox-bullet {
  color: var(--blue); font-size: 1.1rem; line-height: 1.3; flex-shrink: 0;
  margin-top: 2px;
}
.prox-texto {
  flex: 1; font-size: 0.88rem; line-height: 1.5; color: var(--text);
}

.empty-hint {
  font-size: 0.83rem; color: var(--text-muted); font-style: italic; padding: 8px 0;
}

/* Outline small button */
.btn-outline-sm {
  border: 1px solid var(--border); background: none;
  border-radius: 8px; padding: 5px 10px;
  font-size: 0.78rem; cursor: pointer; color: var(--text-muted);
  font-family: inherit; transition: all 0.15s;
}
.btn-outline-sm:active { background: var(--bg-hover); }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.6);
  display: flex; align-items: center; justify-content: center;
  z-index: 200; padding: 20px;
}
.modal-box {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: 16px; padding: 20px; width: 100%; max-width: 360px;
}
.modal-titulo { font-size: 1.05rem; font-weight: 700; color: var(--text); }

/* Template modal list */
.modal-tpl-lista {
  max-height: 240px; overflow-y: auto;
}
.modal-tpl-item {
  display: flex; align-items: center; gap: 8px;
  padding: 7px 0; border-bottom: 1px solid var(--border);
}
.modal-tpl-item:last-child { border-bottom: none; }
.modal-tpl-texto {
  flex: 1; font-size: 0.88rem; color: var(--text);
}

.btn-restaurar {
  background: none; border: none; color: var(--blue);
  font-size: 0.83rem; cursor: pointer; font-family: inherit;
  margin-top: 8px; padding: 4px 0; display: block;
}
.btn-restaurar:active { opacity: 0.7; }
</style>
