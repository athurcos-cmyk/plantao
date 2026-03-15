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

    <main class="container" style="padding-top:20px;padding-bottom:100px">
      <div class="pag-titulo-row">
        <h2 class="pag-titulo">Meus Pacientes</h2>
        <span class="pag-subtitulo">{{ store.pacientes.length }} registrado{{ store.pacientes.length !== 1 ? 's' : '' }}</span>
      </div>

      <!-- Empty state -->
      <div v-if="store.pacientes.length === 0" class="empty-pac">
        <div class="empty-pac-icon">🛏️</div>
        <p class="empty-pac-titulo">Nenhum paciente registrado</p>
        <p class="empty-pac-sub">Adicione os pacientes do seu plantão para organizar suas tarefas</p>
        <button class="btn btn-primary" style="margin-top:16px" @click="abrirAdd">+ Adicionar paciente</button>
      </div>

      <!-- Patient cards -->
      <div v-for="pac in store.pacientes" :key="pac._key" class="pac-card">
        <div class="pac-header" @click="toggleExpandir(pac._key)" style="cursor:pointer">
          <div class="pac-info">
            <span v-if="pac.leito" class="pac-leito-badge">{{ pac.leito }}</span>
            <span class="pac-nome">{{ pac.nome }}</span>
            <span v-if="pac.pendencias.length > 0" class="pend-contador" :class="{ 'pend-contador-alerta': pac.pendencias.filter(function(p){ return !p.feito; }).length > 0 }">
              {{ pac.pendencias.filter(function(p){ return !p.feito; }).length }}/{{ pac.pendencias.length }}
            </span>
          </div>
          <div class="pac-acoes" @click.stop>
            <button class="btn-icon-sm toggle-btn" @click="toggleExpandir(pac._key)" :title="expandido[pac._key] ? 'Recolher' : 'Expandir'">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                :style="{ transform: expandido[pac._key] ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            <button class="btn-icon-sm" @click="abrirEdit(pac)" title="Editar">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button class="btn-icon-sm btn-icon-danger" @click="pedirExcluir(pac)" title="Excluir">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                <path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Pendências -->
        <div class="pend-lista" v-if="pac.pendencias.length > 0 && expandido[pac._key]">
          <div v-for="pend in pac.pendencias" :key="pend._key" class="pend-item" :class="{ feito: pend.feito }">
            <button class="pend-check" @click="store.togglePendencia(pac._key, pend._key, pend.feito)">
              <svg v-if="pend.feito" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </button>
            <span class="pend-texto">{{ pend.texto }}</span>
            <button class="pend-del" @click="store.excluirPendencia(pac._key, pend._key)">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Add pendência inline -->
        <div class="pend-add-row" v-if="expandido[pac._key]">
          <input
            class="pend-add-input"
            type="text"
            placeholder="+ Nova pendência..."
            v-model="novaPend[pac._key]"
            @keyup.enter="adicionarPend(pac._key)"
          >
          <button v-if="novaPend[pac._key]?.trim()" class="pend-add-btn" @click="adicionarPend(pac._key)">Ok</button>
        </div>
      </div>
    </main>

    <!-- FAB -->
    <button v-if="store.pacientes.length > 0" class="fab" @click="abrirAdd">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
    </button>

    <!-- Modal add/edit paciente -->
    <div v-if="modal.aberto" class="modal-overlay" @click.self="modal.aberto = false">
      <div class="modal-box">
        <h3 class="modal-titulo">{{ modal.editKey ? 'Editar paciente' : 'Novo paciente' }}</h3>
        <div class="campo" style="margin-top:12px">
          <label>Nome <span class="obrigatorio">*</span></label>
          <input type="text" v-model="modal.nome" class="campo-inline" placeholder="Ex: Maria da Silva" autofocus>
        </div>
        <div class="campo">
          <label>Leito</label>
          <input type="text" v-model="modal.leito" class="campo-inline" placeholder="Ex: 4B">
        </div>
        <p v-if="modal.erro" class="erro-msg">{{ modal.erro }}</p>
        <div style="display:flex;gap:8px;margin-top:16px">
          <button class="btn btn-secondary" style="flex:1" @click="modal.aberto = false">Cancelar</button>
          <button class="btn btn-primary" style="flex:1" @click="salvarModal" :disabled="modal.salvando">
            {{ modal.salvando ? 'Salvando...' : 'Salvar' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal confirmar exclusão -->
    <div v-if="excluindo" class="modal-overlay" @click.self="excluindo = null">
      <div class="modal-box">
        <h3 class="modal-titulo">Excluir paciente?</h3>
        <p style="color:var(--text-dim);margin-top:8px;font-size:0.9rem">
          <strong style="color:var(--text)">{{ excluindo.nome }}</strong> e todas as pendências serão removidos permanentemente.
        </p>
        <div style="display:flex;gap:8px;margin-top:16px">
          <button class="btn btn-secondary" style="flex:1" @click="excluindo = null">Cancelar</button>
          <button class="btn btn-danger" style="flex:1" @click="executarExcluir">Excluir</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePacientesStore } from '../stores/pacientes.js'

const router = useRouter()
const store  = usePacientesStore()

onMounted(() => store.iniciar())
onUnmounted(() => store.parar())

// nova pendência por paciente (key → texto)
const novaPend  = reactive({})
const expandido = reactive({})
const excluindo = ref(null)

function toggleExpandir(key) {
  expandido[key] = !expandido[key]
}

const modal = reactive({
  aberto:   false,
  editKey:  null,
  nome:     '',
  leito:    '',
  erro:     '',
  salvando: false
})

function abrirAdd() {
  modal.editKey  = null
  modal.nome     = ''
  modal.leito    = ''
  modal.erro     = ''
  modal.salvando = false
  modal.aberto   = true
}

function abrirEdit(pac) {
  modal.editKey  = pac._key
  modal.nome     = pac.nome
  modal.leito    = pac.leito || ''
  modal.erro     = ''
  modal.salvando = false
  modal.aberto   = true
}

async function salvarModal() {
  if (!modal.nome.trim()) { modal.erro = 'Informe o nome do paciente'; return }
  modal.salvando = true
  modal.erro = ''
  try {
    if (modal.editKey) {
      await store.atualizar(modal.editKey, { nome: modal.nome, leito: modal.leito })
    } else {
      await store.adicionar({ nome: modal.nome, leito: modal.leito })
    }
    modal.aberto = false
  } catch (e) {
    modal.erro = 'Erro ao salvar. Tente novamente.'
  } finally {
    modal.salvando = false
  }
}

function pedirExcluir(pac) {
  excluindo.value = pac
}

async function executarExcluir() {
  if (!excluindo.value) return
  try { await store.excluir(excluindo.value._key) }
  catch {}
  excluindo.value = null
}

async function adicionarPend(pacKey) {
  const texto = (novaPend[pacKey] || '').trim()
  if (!texto) return
  novaPend[pacKey] = ''
  await store.adicionarPendencia(pacKey, texto)
}
</script>

<style scoped>
.btn-home-logo {
  display: flex; align-items: center; gap: 6px;
  color: var(--blue); font-size: 1.05rem; font-weight: 700;
  background: none; border: none; cursor: pointer; font-family: inherit;
}

.pag-titulo-row {
  display: flex; align-items: baseline; gap: 10px; margin-bottom: 20px;
}
.pag-titulo { font-size: 1.3rem; font-weight: 700; color: var(--text); }
.pag-subtitulo { font-size: 0.8rem; color: var(--text-muted); }

/* Empty state */
.empty-pac {
  text-align: center; padding: 48px 16px;
  display: flex; flex-direction: column; align-items: center;
}
.empty-pac-icon { font-size: 3rem; margin-bottom: 12px; }
.empty-pac-titulo { font-size: 1.05rem; font-weight: 700; color: var(--text); }
.empty-pac-sub { font-size: 0.85rem; color: var(--text-muted); margin-top: 6px; line-height: 1.5; max-width: 280px; }

/* Patient card */
.pac-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  margin-bottom: 12px;
  overflow: hidden;
}

.pac-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 14px; border-bottom: 1px solid var(--border);
}
.pac-info { display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0; }
.pac-leito-badge {
  background: var(--blue); color: #fff;
  font-size: 0.72rem; font-weight: 700;
  padding: 2px 7px; border-radius: 6px;
  flex-shrink: 0;
}
.pac-nome { font-size: 0.95rem; font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pac-acoes { display: flex; gap: 4px; flex-shrink: 0; margin-left: 8px; }

.pend-contador {
  font-size: 0.7rem; font-weight: 700;
  background: var(--bg); color: var(--text-muted);
  border: 1px solid var(--border);
  border-radius: 10px; padding: 1px 6px;
  flex-shrink: 0;
}
.pend-contador-alerta {
  background: rgba(30,136,229,0.12);
  color: var(--blue);
  border-color: rgba(30,136,229,0.3);
}
.toggle-btn { color: var(--text-muted); }

.btn-icon-sm {
  width: 30px; height: 30px; border: none; background: none;
  color: var(--text-dim); cursor: pointer; border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
}
.btn-icon-sm:active { background: var(--bg-hover); }
.btn-icon-danger { color: var(--danger); }

/* Pendências */
.pend-lista { padding: 6px 0; }

.pend-item {
  display: flex; align-items: center; gap: 8px;
  padding: 7px 14px;
  transition: opacity 0.2s;
}
.pend-item.feito { opacity: 0.5; }

.pend-check {
  width: 22px; height: 22px; flex-shrink: 0;
  border: 2px solid var(--border);
  border-radius: 6px; background: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.pend-item.feito .pend-check {
  background: var(--success); border-color: var(--success); color: #fff;
}

.pend-texto {
  flex: 1; font-size: 0.88rem; color: var(--text);
  line-height: 1.4;
}
.pend-item.feito .pend-texto { text-decoration: line-through; color: var(--text-muted); }

.pend-del {
  width: 22px; height: 22px; border: none; background: none;
  color: var(--text-muted); cursor: pointer; border-radius: 4px;
  display: flex; align-items: center; justify-content: center;
  opacity: 0.5; flex-shrink: 0;
}
.pend-del:active { opacity: 1; color: var(--danger); }

/* Add pendência */
.pend-add-row {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 14px; border-top: 1px solid var(--border);
}
.pend-add-input {
  flex: 1; background: none; border: none; outline: none;
  font-family: inherit; font-size: 0.85rem; color: var(--text-dim);
  padding: 4px 0;
}
.pend-add-input::placeholder { color: var(--text-muted); }
.pend-add-btn {
  background: var(--blue); color: #fff;
  border: none; border-radius: 6px;
  font-size: 0.78rem; font-weight: 600;
  padding: 4px 10px; cursor: pointer; font-family: inherit;
}

/* FAB */
.fab {
  position: fixed; bottom: calc(24px + var(--safe-bottom)); right: 20px;
  width: 52px; height: 52px; border-radius: 50%;
  background: var(--blue); color: #fff; border: none;
  box-shadow: 0 4px 16px rgba(30,136,229,0.5);
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  z-index: 90; transition: transform 0.15s;
}
.fab:active { transform: scale(0.93); }

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
.erro-msg { color: var(--danger); font-size: 0.82rem; margin-top: 6px; }

.campo { margin-bottom: 12px; }
.campo label { display: block; font-size: 0.78rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; }
.obrigatorio { color: var(--danger); }
.campo-inline {
  width: 100%; background: var(--bg-input); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 10px 12px;
  color: var(--text); font-family: inherit; font-size: 0.95rem; outline: none;
}
.campo-inline:focus { border-color: var(--blue); }
</style>
