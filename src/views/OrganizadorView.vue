<template>
  <div class="screen organizer-screen">
    <header class="app-header organizer-header">
      <button class="btn-icon" @click="router.push({ name: 'dashboard' })">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      <button class="btn-home-logo" @click="router.push({ name: 'dashboard' })">
        <img src="/icons/icon-512.png" width="22" height="22" alt="Plantão" style="border-radius:5px;display:block" />
        <span>Plantão</span>
      </button>

      <div class="header-actions">
        <button class="btn-ajuda" @click="helpAberto = true">? Ajuda</button>
        <button class="btn-icon" @click="modalTemplate = true" title="Tarefas padrão">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
          </svg>
        </button>
      </div>
    </header>

    <main class="container organizer-page">
      <div v-if="!store.plantao" class="empty-state">
        <div class="empty-hero">
          <div class="empty-hero-icon-wrap">
            <img :src="iconOrganizador" alt="Organizador de Plantão" class="empty-hero-icon" />
          </div>
          <div class="empty-hero-copy">
            <span class="hero-kicker">Plantão</span>
            <h2 class="hero-title">Organizador do Plantão</h2>
            <p class="hero-subtitle">Inicie seu turno para acompanhar tarefas do dia e preparar recados para o próximo plantão.</p>
          </div>
          <button class="btn btn-primary empty-start-btn" @click="store.iniciarPlantao()">Iniciar plantão</button>
        </div>
      </div>

      <div v-else class="organizer-content">
        <section class="organizer-hero">
          <div class="organizer-hero-main">
            <div class="organizer-hero-icon-wrap">
              <img :src="iconOrganizador" alt="Organizador de Plantão" class="organizer-hero-icon" />
            </div>
            <div class="organizer-hero-copy">
              <span class="hero-kicker">Plantão ativo</span>
              <h2 class="hero-title">Organizador do Plantão</h2>
              <p class="hero-subtitle">{{ formatarInicio(store.plantao.iniciadoEm) }}</p>
            </div>
          </div>

          <div class="organizer-hero-actions">
            <button class="btn-outline-sm" @click="modalTemplate = true">Tarefas padrão</button>
            <button class="btn-outline-sm btn-outline-danger" @click="confirmarNovo = true">Novo plantão</button>
          </div>
        </section>

        <section class="overview-grid">
          <div class="overview-card">
            <span class="overview-label">Concluídas</span>
            <strong class="overview-value">{{ concluidas }}</strong>
            <span class="overview-meta">tarefas feitas</span>
          </div>
          <div class="overview-card">
            <span class="overview-label">Pendentes</span>
            <strong class="overview-value">{{ pendentes }}</strong>
            <span class="overview-meta">ainda no turno</span>
          </div>
          <div class="overview-card">
            <span class="overview-label">Próximo plantão</span>
            <strong class="overview-value">{{ proximasCount }}</strong>
            <span class="overview-meta">anotações salvas</span>
          </div>
        </section>

        <section class="progress-card">
          <div class="progress-head">
            <span class="progress-title">Andamento do plantão</span>
            <span class="progress-pill">{{ progressoPct }}%</span>
          </div>
          <div class="progress-wrap">
            <div class="progress-fill" :style="{ width: progressoPct + '%' }"></div>
          </div>
          <p class="progress-label">{{ concluidas }} de {{ total }} tarefas concluídas</p>
        </section>

        <section class="panel-card">
          <div class="secao-header">
            <div>
              <span class="secao-kicker">Checklist</span>
              <h3 class="secao-titulo">Tarefas do plantão</h3>
            </div>
            <span v-if="pendentes > 0" class="secao-badge">{{ pendentes }}</span>
          </div>

          <div class="tarefas-lista">
            <div
              v-for="tarefa in store.plantao.tarefas"
              :key="tarefa._key"
              class="tarefa-row"
              :class="{ feito: tarefa.feito }"
            >
              <button
                class="tarefa-check"
                :class="{ checked: tarefa.feito }"
                @click="store.toggleTarefa(tarefa._key, tarefa.feito)"
              >
                <svg v-if="tarefa.feito" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </button>

              <span class="tarefa-texto" :class="{ feito: tarefa.feito }">{{ tarefa.texto }}</span>

              <button
                v-if="tarefa.avulsa"
                class="btn-icon-xs btn-icon-danger"
                @click="store.excluirTarefa(tarefa._key)"
                title="Remover tarefa"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div class="add-tarefa-row">
              <input
                class="add-input"
                type="text"
                placeholder="+ Tarefa extra..."
                v-model="novaTarefa.texto"
                @keyup.enter="adicionarAvulsa"
              />
              <button v-if="novaTarefa.texto.trim()" class="add-btn-sm" @click="adicionarAvulsa">Adicionar</button>
            </div>
          </div>
        </section>

        <section class="panel-card panel-card-next">
          <div class="secao-header">
            <div>
              <span class="secao-kicker">Transição</span>
              <h3 class="secao-titulo">Passar pro próximo plantão</h3>
            </div>
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
              <span class="prox-bullet">•</span>
              <span class="prox-texto">{{ item.texto }}</span>
              <button class="btn-icon-xs" @click="store.excluirProximoPlantao(item._key)" title="Remover anotação">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          <div class="add-tarefa-row add-next-row">
            <input
              class="add-input"
              type="text"
              placeholder="+ Anotar para o próximo plantão..."
              v-model="novaProxima"
              @keyup.enter="adicionarProxima"
            />
            <button v-if="novaProxima.trim()" class="add-btn-sm" @click="adicionarProxima">Adicionar</button>
          </div>
        </section>
      </div>
    </main>

    <div v-if="confirmarNovo" class="modal-overlay" @click.self="confirmarNovo = false">
      <div class="modal-box">
        <h3 class="modal-titulo">Iniciar novo plantão?</h3>
        <p class="modal-subtitulo">
          Todas as tarefas atuais serão resetadas. As anotações para o próximo plantão também serão apagadas.
        </p>
        <div class="modal-actions">
          <button class="btn btn-secondary" style="flex:1" @click="confirmarNovo = false">Cancelar</button>
          <button class="btn btn-primary" style="flex:1" @click="() => { store.iniciarPlantao(); confirmarNovo = false }">Iniciar</button>
        </div>
      </div>
    </div>

    <div v-if="modalTemplate" class="modal-overlay" @click.self="modalTemplate = false">
      <div class="modal-box modal-box-template">
        <h3 class="modal-titulo">Tarefas padrão</h3>
        <p class="modal-subtitulo">
          Essas tarefas são carregadas em todo novo plantão.
        </p>

        <div class="modal-tpl-lista">
          <div v-for="t in store.template" :key="t._key" class="modal-tpl-item">
            <span class="modal-tpl-texto">{{ t.texto }}</span>
            <button class="btn-icon-xs" @click="store.removerDoTemplate(t._key)" title="Remover tarefa padrão">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        <div class="add-tarefa-row add-template-row">
          <input
            class="add-input"
            type="text"
            placeholder="Nova tarefa padrão..."
            v-model="novoTemplateTxt"
            @keyup.enter="adicionarTemplate"
          />
          <button v-if="novoTemplateTxt.trim()" class="add-btn-sm" @click="adicionarTemplate">Adicionar</button>
        </div>

        <button class="btn-restaurar" @click="store.restaurarTemplate()">Restaurar padrões</button>

        <div class="modal-actions single">
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
import iconOrganizador from '../assets/dashboard-icons-png/organizador-plantao.png'

const router = useRouter()
const store = useOrganizadorStore()

onMounted(() => {
  store.iniciar()
})

const novaTarefa = reactive({ texto: '' })
const novaProxima = ref('')
const confirmarNovo = ref(false)
const modalTemplate = ref(false)
const novoTemplateTxt = ref('')
const helpAberto = ref(false)

const helpItens = [
  { icone: '▶️', titulo: 'Iniciar plantão', desc: 'Carrega as tarefas padrão do seu perfil. Configure as tarefas padrão pelo ícone no canto superior direito.' },
  { icone: '✅', titulo: 'Marcar tarefa', desc: 'Toque no círculo ao lado da tarefa para marcá-la como concluída. A barra de progresso e o contador atualizam automaticamente.' },
  { icone: '➕', titulo: 'Tarefa extra', desc: 'Use o campo "+ Tarefa extra..." no final da lista para adicionar tarefas específicas do dia. Apenas essas tarefas extras podem ser excluídas.' },
  { icone: '📤', titulo: 'Próximo plantão', desc: 'Anote recados importantes para o próximo turno na seção "Passar pro próximo plantão". Ficam separados das tarefas.' },
  { icone: '⚙️', titulo: 'Tarefas padrão', desc: 'Toque no ícone de ajustes para adicionar, remover ou restaurar as tarefas que carregam em todo novo plantão. Cada conta tem seu próprio template.' },
  { icone: '🔄', titulo: 'Novo plantão', desc: 'O botão "Novo plantão" reseta todas as tarefas atuais e recomeça do template. As anotações para o próximo plantão também são apagadas.' },
]

const concluidas = computed(() => store.plantao?.tarefas.filter((t) => t.feito).length ?? 0)
const total = computed(() => store.plantao?.tarefas.length ?? 0)
const pendentes = computed(() => Math.max(total.value - concluidas.value, 0))
const progressoPct = computed(() => total.value ? Math.round((concluidas.value / total.value) * 100) : 0)
const proximasCount = computed(() => store.plantao?.proximoPlantao.length ?? 0)

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
.organizer-screen {
  background:
    radial-gradient(circle at top center, rgba(72, 143, 240, 0.24), transparent 34%),
    linear-gradient(180deg, rgba(10, 22, 40, 0.98) 0%, rgba(9, 20, 36, 1) 100%);
}

.organizer-page {
  width: 100%;
  max-width: 1040px;
  padding-top: 20px;
  padding-bottom: 128px;
}

.organizer-header {
  backdrop-filter: blur(10px);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 6px;
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
  color: var(--blue);
  font-size: 1.05rem;
  font-weight: 700;
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  border-radius: 10px;
  padding: 4px 8px;
}

.empty-state {
  padding-top: 8px;
}

.empty-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 28px 24px;
  border: 1px solid rgba(78, 118, 180, 0.28);
  border-radius: 24px;
  background:
    linear-gradient(145deg, rgba(20, 39, 71, 0.98), rgba(13, 27, 48, 0.98)),
    rgba(17, 29, 50, 0.96);
  text-align: center;
  box-shadow: 0 22px 40px rgba(0, 0, 0, 0.26);
}

.empty-hero-icon-wrap,
.organizer-hero-icon-wrap {
  width: 68px;
  height: 68px;
  border-radius: 20px;
  background: linear-gradient(145deg, rgba(53, 105, 188, 0.22), rgba(24, 55, 101, 0.38));
  border: 1px solid rgba(106, 167, 255, 0.26);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.empty-hero-icon,
.organizer-hero-icon {
  width: 42px;
  height: 42px;
  object-fit: contain;
}

.empty-hero-copy {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
}

.hero-kicker {
  display: inline-flex;
  align-items: center;
  min-height: 22px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(55, 100, 176, 0.18);
  color: #86bdf7;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.hero-title {
  font-size: 1.7rem;
  line-height: 1.05;
  font-weight: 800;
  color: #eef4ff;
}

.hero-subtitle {
  color: #b1c4e2;
  font-size: 0.94rem;
  line-height: 1.5;
}

.empty-start-btn {
  min-width: 180px;
}

.organizer-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.organizer-hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 20px;
  border: 1px solid rgba(78, 118, 180, 0.28);
  border-radius: 22px;
  background:
    linear-gradient(145deg, rgba(26, 47, 83, 0.99), rgba(16, 31, 56, 0.99)),
    rgba(21, 36, 61, 0.98);
  box-shadow: 0 22px 40px rgba(0, 0, 0, 0.22);
}

.organizer-hero-main {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
}

.organizer-hero-copy {
  min-width: 0;
}

.organizer-hero-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.overview-card,
.progress-card,
.panel-card {
  border: 1px solid rgba(68, 101, 152, 0.3);
  border-radius: 20px;
  background:
    linear-gradient(180deg, rgba(23, 39, 67, 0.99), rgba(17, 30, 52, 0.99));
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.18);
}

.overview-card {
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.overview-label {
  color: #94a9cb;
  font-size: 0.76rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 700;
}

.overview-value {
  color: #eef4ff;
  font-size: 1.55rem;
  line-height: 1.05;
}

.overview-meta {
  color: #a7b8d5;
  font-size: 0.82rem;
}

.progress-card {
  padding: 18px;
}

.progress-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.progress-title {
  color: #eef4ff;
  font-size: 0.94rem;
  font-weight: 700;
}

.progress-pill {
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(55, 100, 176, 0.16);
  border: 1px solid rgba(93, 150, 231, 0.26);
  color: #89c0ff;
  display: inline-flex;
  align-items: center;
  font-size: 0.76rem;
  font-weight: 800;
}

.progress-wrap {
  height: 10px;
  background: rgba(35, 58, 98, 0.86);
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #2b7ddf, #62a8ff);
  border-radius: inherit;
  transition: width 0.35s ease;
  box-shadow: 0 0 18px rgba(67, 137, 231, 0.3);
}

.progress-label {
  color: #a6b8d6;
  font-size: 0.82rem;
}

.panel-card {
  padding: 18px;
}

.secao-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.secao-kicker {
  color: #94a9cb;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.secao-titulo {
  margin-top: 4px;
  color: #eef4ff;
  font-size: 1.1rem;
  font-weight: 800;
}

.secao-badge {
  min-width: 30px;
  height: 30px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(30, 136, 229, 0.14);
  border: 1px solid rgba(77, 145, 225, 0.28);
  color: #7cbaff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.82rem;
  font-weight: 800;
}

.tarefas-lista,
.prox-lista {
  border: 1px solid rgba(61, 92, 142, 0.38);
  border-radius: 18px;
  background: rgba(15, 28, 49, 0.84);
  overflow: hidden;
}

.tarefa-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-bottom: 1px solid rgba(73, 108, 165, 0.34);
  transition: opacity 0.2s ease, background 0.2s ease;
}

.tarefa-row:last-child {
  border-bottom: none;
}

.tarefa-row.feito {
  opacity: 0.52;
}

.tarefa-check {
  width: 26px;
  height: 26px;
  flex-shrink: 0;
  border: 2px solid rgba(77, 110, 165, 0.55);
  border-radius: 999px;
  background: rgba(16, 29, 50, 0.92);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.18s ease;
  color: #fff;
}

.tarefa-check.checked {
  background: linear-gradient(135deg, #37a45f, #53c57f);
  border-color: rgba(116, 221, 154, 0.82);
  box-shadow: 0 8px 16px rgba(45, 136, 82, 0.24);
}

.tarefa-texto {
  flex: 1;
  color: #f1f5fb;
  font-size: 0.95rem;
  line-height: 1.45;
}

.tarefa-texto.feito {
  text-decoration: line-through;
  color: var(--text-muted);
}

.btn-icon-xs {
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  border: 1px solid rgba(61, 92, 142, 0.35);
  background: rgba(19, 34, 58, 0.95);
  color: #a5b8d6;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
}

.btn-icon-danger {
  color: #ff8e89;
  border-color: rgba(229, 57, 53, 0.24);
}

.add-tarefa-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px;
}

.add-next-row {
  margin-top: 12px;
  border: 1px solid rgba(61, 92, 142, 0.38);
  border-radius: 16px;
  background: rgba(15, 28, 49, 0.82);
}

.add-template-row {
  margin-top: 12px;
  border-top: 1px solid rgba(61, 92, 142, 0.28);
  padding: 14px 0 0;
}

.add-input {
  flex: 1;
  min-height: 46px;
  padding: 0 14px;
  background: rgba(18, 33, 57, 0.96);
  border: 1px solid rgba(82, 120, 182, 0.52);
  border-radius: 14px;
  outline: none;
  font-family: inherit;
  font-size: 0.92rem;
  color: var(--text);
}

.add-input::placeholder {
  color: var(--text-muted);
}

.add-input:focus {
  border-color: rgba(101, 168, 255, 0.82);
  box-shadow: 0 0 0 3px rgba(53, 122, 223, 0.14);
}

.add-btn-sm {
  min-height: 42px;
  padding: 0 14px;
  background: linear-gradient(135deg, #1f78d8, #2f93ff);
  color: #fff;
  border: 1px solid rgba(142, 202, 255, 0.6);
  border-radius: 12px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  flex-shrink: 0;
}

.prox-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  border-bottom: 1px solid rgba(61, 92, 142, 0.28);
}

.prox-item:last-child {
  border-bottom: none;
}

.prox-bullet {
  color: #79b8ff;
  font-size: 1.2rem;
  line-height: 1;
  margin-top: 2px;
  flex-shrink: 0;
}

.prox-texto {
  flex: 1;
  font-size: 0.92rem;
  line-height: 1.55;
  color: #eef4ff;
}

.empty-hint {
  padding: 18px;
  border: 1px dashed rgba(72, 109, 166, 0.38);
  border-radius: 18px;
  color: #a6b8d6;
  font-size: 0.88rem;
  font-style: italic;
  background: rgba(16, 29, 50, 0.72);
}

.btn-outline-sm {
  min-height: 40px;
  padding: 0 14px;
  border: 1px solid rgba(65, 98, 150, 0.46);
  background: rgba(18, 33, 57, 0.92);
  border-radius: 12px;
  font-size: 0.82rem;
  cursor: pointer;
  color: #d6e4f8;
  font-family: inherit;
  font-weight: 700;
  transition: border-color 0.18s ease, color 0.18s ease;
}

.btn-outline-danger {
  color: #ff9a94;
  border-color: rgba(229, 57, 53, 0.34);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(2, 8, 18, 0.72);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 20px;
}

.modal-box {
  width: 100%;
  max-width: 420px;
  padding: 22px;
  border-radius: 20px;
  border: 1px solid rgba(67, 103, 161, 0.3);
  background: linear-gradient(180deg, rgba(24, 40, 68, 0.99), rgba(16, 29, 50, 0.99));
  box-shadow: 0 24px 42px rgba(0, 0, 0, 0.34);
}

.modal-box-template {
  max-width: 460px;
}

.modal-titulo {
  font-size: 1.08rem;
  font-weight: 800;
  color: var(--text);
}

.modal-subtitulo {
  margin-top: 8px;
  color: #a7b9d6;
  font-size: 0.88rem;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  gap: 8px;
  margin-top: 18px;
}

.modal-actions.single {
  margin-top: 14px;
}

.modal-tpl-lista {
  max-height: 280px;
  overflow-y: auto;
  margin-top: 14px;
  border: 1px solid rgba(61, 92, 142, 0.38);
  border-radius: 16px;
  background: rgba(16, 29, 50, 0.76);
}

.modal-tpl-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 11px 14px;
  border-bottom: 1px solid rgba(61, 92, 142, 0.24);
}

.modal-tpl-item:last-child {
  border-bottom: none;
}

.modal-tpl-texto {
  flex: 1;
  font-size: 0.9rem;
  color: var(--text);
}

.btn-restaurar {
  margin-top: 12px;
  padding: 0;
  background: none;
  border: none;
  color: #7cbaff;
  font-size: 0.84rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
}

@media (max-width: 720px) {
  .organizer-hero {
    flex-direction: column;
  }

  .organizer-hero-main {
    align-items: flex-start;
  }

  .organizer-hero-actions {
    width: 100%;
    justify-content: stretch;
  }

  .organizer-hero-actions .btn-outline-sm {
    flex: 1;
    justify-content: center;
  }

  .overview-grid {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 900px) {
  .organizer-page {
    padding-left: 20px;
    padding-right: 20px;
  }

  .organizer-content {
    gap: 18px;
  }

  .panel-card {
    padding: 20px;
  }
}
</style>
