<template>
  <div class="screen">
    <header class="app-header">
      <button class="btn-icon" @click="router.push({ name: 'dashboard' })">
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

    <!-- ═══ FORMULÁRIO ═══ -->
    <main v-if="!gerado" class="container" style="padding-top:20px;padding-bottom:56px">

      <div class="page-header">
        <span class="page-icon">📝</span>
        <div>
          <h2 class="page-titulo">Notas Livres</h2>
          <p class="page-sub">Seus modelos de anotação, do jeito que você usa</p>
        </div>
      </div>

      <!-- ── Paciente ── -->
      <div class="card-secao">
        <div v-if="pacientesStore.pacientes.length > 0" class="campo">
          <label>Paciente registrado</label>
          <div class="chips-scroll">
            <button
              v-for="p in pacientesStore.pacientes"
              :key="p._key"
              class="chip"
              :class="{ 'chip-on': form.nome === p.nome && form.leito === (p.leito || '') }"
              @click="selecionarPaciente(p)"
            >{{ p.leito ? p.leito + ' · ' : '' }}{{ p.nome }}</button>
          </div>
        </div>

        <div class="campo">
          <label>Nome do paciente <span class="obrigatorio">*</span></label>
          <input type="text" v-model="form.nome" placeholder="Ex: João da Silva">
        </div>

        <div class="campo" style="margin-bottom:0">
          <label>Leito <span class="opc">(opcional)</span></label>
          <input type="text" v-model="form.leito" placeholder="Ex: 4B">
        </div>
      </div>

      <!-- ── Meus Modelos (chips horizontais) ── -->
      <div class="secao-header">
        <span class="secao-label-lg">Modelos</span>
        <span v-if="modelos.length > 0" class="badge-count">{{ modelos.length }}</span>
        <button class="btn-gerenciar" @click="abrirModalModelos">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
          </svg>
          Gerenciar
        </button>
      </div>

      <div v-if="modelos.length > 0" class="modelos-chips-row">
        <button
          v-for="m in modelos"
          :key="m._key"
          class="chip-modelo"
          :class="{ 'chip-modelo-on': notaTexto === m.texto }"
          @click="notaTexto = notaTexto === m.texto ? '' : m.texto"
        >{{ m.texto }}</button>
      </div>
      <div v-else class="modelos-vazio-row">
        <span>Nenhum modelo —</span>
        <button class="btn-link" @click="abrirModalModelos">criar agora</button>
      </div>

      <!-- ── Adicionar Nota ── -->
      <div class="secao-header" style="margin-top:20px">
        <span class="secao-label-lg">Notas</span>
        <span v-if="notas.length > 0" class="badge-count azul">{{ notas.length }}</span>
      </div>

      <div class="nota-builder">
        <input type="time" v-model="notaHora" class="input-hora">
        <input
          type="text"
          v-model="notaTexto"
          class="input-nota"
          placeholder="Selecione um modelo ou escreva..."
          @keydown.enter="adicionarNota"
        >
        <button
          class="btn-add-nota"
          @click="adicionarNota"
          :disabled="!notaTexto.trim()"
          title="Adicionar nota"
        >+</button>
      </div>

      <!-- Timeline -->
      <div v-if="notas.length > 0" class="timeline">
        <div v-for="(n, i) in notas" :key="i" class="timeline-item">
          <div class="timeline-line" v-if="i < notas.length - 1"></div>
          <div class="timeline-dot"></div>
          <div class="timeline-content">
            <span class="timeline-hora">{{ n.hora }}</span>
            <span class="timeline-sep">–</span>
            <span class="timeline-texto">{{ n.texto }}</span>
          </div>
          <button class="btn-del-nota" @click="removerNota(i)">×</button>
        </div>
      </div>

      <p v-if="erro" class="erro-msg">{{ erro }}</p>
      <button class="btn btn-primary" style="margin-top:20px" @click="gerar">Gerar anotação</button>

    </main>

    <!-- ═══ RESULTADO ═══ -->
    <main v-if="gerado" class="container" style="padding-top:20px;padding-bottom:40px">
      <textarea v-model="textoGerado" class="resultado-box" rows="6"></textarea>

      <button class="btn-copy" @click="copiar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2"/>
          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
        </svg>
        {{ copiado ? 'Copiado!' : 'Copiar texto' }}
      </button>

      <div class="nav-row">
        <button class="btn btn-secondary" style="flex:1" @click="salvar" :disabled="salvando">
          {{ salvando ? 'Salvando...' : 'Salvar no histórico' }}
        </button>
        <button class="btn btn-secondary" style="flex:1" @click="novaAnotacao">Nova anotação</button>
      </div>

      <button class="btn btn-secondary" style="width:100%;margin-top:10px" @click="gerado = false">← Editar</button>
    </main>

    <!-- ═══ MODAL: Gerenciar Modelos ═══ -->
    <div v-if="modalModelos" class="modal-overlay" @click.self="fecharModalModelos">
      <div class="modal-modelos">

        <div class="modal-modelos-header">
          <h3>Meus Modelos</h3>
          <button class="btn-fechar-modal" @click="fecharModalModelos">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="modal-modelos-body">

          <!-- Lista completa -->
          <div v-if="modelos.length > 0" class="modal-lista">
            <div v-for="m in modelos" :key="m._key" class="modal-modelo-item">
              <span class="modal-modelo-txt">{{ m.texto }}</span>
              <button class="btn-del-modal" @click="deletarModelo(m._key)" title="Remover">×</button>
            </div>
          </div>
          <p v-else-if="!carregandoModelos" class="modal-vazio">
            Nenhum modelo ainda. Adicione os textos que você usa com frequência.
          </p>
          <p v-else class="modal-vazio">Carregando...</p>

          <!-- Formulário para novo modelo -->
          <div v-if="!adicionandoModelo" class="modal-add-trigger">
            <button class="btn-novo-modelo" @click="iniciarAdicaoModelo">+ Novo modelo</button>
          </div>
          <div v-else class="modal-add-form">
            <input
              v-model="novoModelo"
              type="text"
              ref="novoModeloInput"
              placeholder="Ex: Ofertado almoço, aceito por completo"
              maxlength="200"
              @keydown.enter="salvarModelo"
              @keydown.escape="adicionandoModelo = false; novoModelo = ''"
            >
            <div class="modal-add-acoes">
              <button class="btn btn-secondary btn-sm" @click="adicionandoModelo = false; novoModelo = ''">Cancelar</button>
              <button class="btn btn-primary btn-sm" @click="salvarModelo" :disabled="!novoModelo.trim() || salvandoModelo">
                {{ salvandoModelo ? '...' : 'Salvar' }}
              </button>
            </div>
          </div>

        </div>

        <div class="modal-modelos-footer">
          <button class="btn btn-secondary" style="width:100%" @click="fecharModalModelos">Fechar</button>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { db } from '../../firebase.js'
import { ref as dbRef, push, remove, onValue, off } from 'firebase/database'
import { useAnotacoesStore } from '../../stores/anotacoes.js'
import { usePacientesStore } from '../../stores/pacientes.js'
import { useAuthStore } from '../../stores/auth.js'
import { useToast } from '../../composables/useToast.js'

const router          = useRouter()
const anotacoesStore  = useAnotacoesStore()
const pacientesStore  = usePacientesStore()
const authStore       = useAuthStore()
const { showToast }   = useToast()

// ── Estado ──
const gerado            = ref(false)
const textoGerado       = ref('')
const erro              = ref('')
const salvando          = ref(false)
const copiado           = ref(false)
const carregandoModelos = ref(true)
const salvandoModelo    = ref(false)
const adicionandoModelo = ref(false)
const novoModeloInput   = ref(null)
const modalModelos      = ref(false)

// ── Modelos ──
const modelos    = ref([])
const novoModelo = ref('')
let   modelosOff = null

// ── Notas ──
const notas     = ref([])
const notaHora  = ref('')
const notaTexto = ref('')

// ── Form ──
const form = reactive({ nome: '', leito: '' })

// ── Lifecycle ──
onMounted(() => {
  pacientesStore.iniciar()
  notaHora.value = horaAtual()
  iniciarModelos()
})

onUnmounted(() => {
  if (modelosOff) {
    modelosOff()   // unsubscribe corretamente (retorno do onValue)
    modelosOff = null
  }
})

// ── Helpers ──
function horaAtual() {
  const d = new Date()
  return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0')
}

function iniciarModelos() {
  const code = authStore.syncCode
  if (!code) { carregandoModelos.value = false; return }

  // Cache imediato
  try {
    const cached = JSON.parse(localStorage.getItem(`modelos_${code}`) || '[]')
    if (cached.length) { modelos.value = cached; carregandoModelos.value = false }
  } catch {}

  // Listener Firebase (retorna função de unsubscribe no SDK v9)
  const path = dbRef(db, `livres/${code}/modelos`)
  modelosOff = onValue(path, (snap) => {
    const lista = []
    snap.forEach(child => lista.push({ ...child.val(), _key: child.key }))
    modelos.value = lista
    carregandoModelos.value = false
    try { localStorage.setItem(`modelos_${code}`, JSON.stringify(lista)) } catch {}
  }, () => { carregandoModelos.value = false })
}

function selecionarPaciente(p) {
  form.nome  = p.nome
  form.leito = p.leito || ''
}

// ── Modal de modelos ──
async function abrirModalModelos() {
  modalModelos.value = true
  adicionandoModelo.value = false
  novoModelo.value = ''
}

function fecharModalModelos() {
  modalModelos.value = false
  adicionandoModelo.value = false
  novoModelo.value = ''
}

async function iniciarAdicaoModelo() {
  adicionandoModelo.value = true
  await nextTick()
  novoModeloInput.value?.focus()
}

async function salvarModelo() {
  const texto = novoModelo.value.trim()
  if (!texto) return
  if (!navigator.onLine) { showToast('Sem conexão — modelos requerem internet'); return }
  salvandoModelo.value = true
  try {
    const novoRef = await push(dbRef(db, `livres/${authStore.syncCode}/modelos`), { texto, criadoEm: Date.now() })
    // Garante que aparece imediatamente mesmo se o onValue demorar
    if (!modelos.value.find(m => m._key === novoRef.key)) {
      modelos.value = [...modelos.value, { texto, criadoEm: Date.now(), _key: novoRef.key }]
    }
    novoModelo.value = ''
    adicionandoModelo.value = false
    showToast('Modelo salvo!')
  } catch { showToast('Erro ao salvar modelo') }
  finally { salvandoModelo.value = false }
}

async function deletarModelo(key) {
  if (!navigator.onLine) { showToast('Sem conexão'); return }
  try {
    // Remove local imediatamente para feedback instantâneo
    const modelo = modelos.value.find(m => m._key === key)
    modelos.value = modelos.value.filter(m => m._key !== key)
    if (modelo && notaTexto.value === modelo.texto) notaTexto.value = ''
    await remove(dbRef(db, `livres/${authStore.syncCode}/modelos/${key}`))
    showToast('Modelo removido')
  } catch {
    showToast('Erro ao remover')
    iniciarModelos() // recarrega em caso de falha
  }
}

// ── Notas ──
function adicionarNota() {
  const texto = notaTexto.value.trim()
  if (!texto) return
  const hora = (notaHora.value || horaAtual()).replace(':', 'h')
  notas.value.push({ hora, texto })
  notaTexto.value = ''
}

function removerNota(i) {
  notas.value.splice(i, 1)
}

// ── Gerar ──
function gerar() {
  erro.value = ''
  if (!form.nome.trim()) { erro.value = 'Informe o nome do paciente.'; return }
  if (notas.value.length === 0) { erro.value = 'Adicione pelo menos uma nota.'; return }

  const linhas = notas.value.map(n => {
    let t = n.texto.charAt(0).toUpperCase() + n.texto.slice(1)
    if (!/[.!?]$/.test(t)) t += '.'
    return `${n.hora} – ${t}`
  })

  textoGerado.value = linhas.join('\n')
  gerado.value = true
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// ── Copiar ──
async function copiar() {
  try {
    try { await navigator.clipboard.writeText(textoGerado.value) }
    catch {
      const el = document.createElement('textarea')
      el.value = textoGerado.value
      el.style.position = 'fixed'; el.style.opacity = '0'
      document.body.appendChild(el); el.focus(); el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    copiado.value = true
    setTimeout(() => (copiado.value = false), 2000)
    showToast('Texto copiado!')
  } catch { showToast('Erro ao copiar') }
}

// ── Salvar ──
async function salvar() {
  salvando.value = true
  try {
    await anotacoesStore.salvar({ tipo: 'livre', texto: textoGerado.value, nome: form.nome, leito: form.leito })
    showToast('Salvo no histórico!')
  } catch { showToast('Erro ao salvar') }
  finally { salvando.value = false }
}

// ── Nova anotação ──
function novaAnotacao() {
  form.nome = ''; form.leito = ''
  notas.value = []
  notaTexto.value = ''
  notaHora.value = horaAtual()
  textoGerado.value = ''; gerado.value = false
  erro.value = ''; copiado.value = false
}
</script>

<style scoped>
.btn-icon {
  background: none; border: none; color: var(--text-dim);
  cursor: pointer; padding: 6px; border-radius: 8px; display: flex; align-items: center;
}
.btn-icon:active { background: var(--bg-hover); }
.btn-home-logo {
  display: flex; align-items: center; gap: 6px;
  color: var(--blue); font-size: 1.05rem; font-weight: 700;
  background: none; border: none; cursor: pointer; font-family: inherit;
}

.page-header { display: flex; align-items: center; gap: 14px; margin-bottom: 24px; }
.page-icon { font-size: 2rem; line-height: 1; }
.page-titulo { font-size: 1.25rem; font-weight: 700; color: var(--text); margin: 0; }
.page-sub { font-size: 0.8rem; color: var(--text-muted); margin: 2px 0 0; }

.card-secao {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 16px; margin-bottom: 16px;
}

.secao-header {
  display: flex; align-items: center; gap: 8px; margin-bottom: 10px;
}
.secao-label-lg {
  font-size: 0.75rem; font-weight: 700; color: var(--text-muted);
  text-transform: uppercase; letter-spacing: 0.08em;
  flex: 1;
}
.badge-count {
  background: var(--border); color: var(--text-muted);
  font-size: 0.7rem; font-weight: 700;
  border-radius: 10px; padding: 1px 7px;
}
.badge-count.azul { background: var(--blue); color: #fff; }

/* Botão gerenciar modelos */
.btn-gerenciar {
  display: flex; align-items: center; gap: 5px;
  background: none; border: 1px solid var(--border);
  border-radius: 20px; color: var(--text-muted);
  font-size: 0.75rem; font-family: inherit;
  padding: 4px 10px; cursor: pointer; transition: all 0.15s;
}
.btn-gerenciar:active { background: var(--bg-hover); color: var(--blue); border-color: var(--blue); }

/* Chips paciente */
.chips-scroll { display: flex; flex-wrap: wrap; gap: 8px; }
.chip {
  padding: 8px 14px; border-radius: 20px;
  border: 1px solid var(--border); background: var(--bg-card);
  color: var(--text-dim); font-size: 0.9rem;
  cursor: pointer; font-family: inherit; transition: all 0.15s;
}
.chip:active { opacity: 0.8; }
.chip-on { background: var(--blue); border-color: var(--blue); color: #fff; }

/* Modelos: chips com quebra de linha */
.modelos-chips-row {
  display: flex; flex-wrap: wrap; gap: 8px;
  margin-bottom: 4px;
}
.chip-modelo {
  max-width: 160px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  padding: 8px 14px; border-radius: 20px;
  border: 1px solid var(--border); background: var(--bg-card);
  color: var(--text-dim); font-size: 0.85rem;
  cursor: pointer; font-family: inherit; transition: all 0.15s;
}
.chip-modelo:active { opacity: 0.8; }
.chip-modelo-on {
  background: rgba(59,130,246,0.12); border-color: var(--blue); color: var(--blue); font-weight: 600;
}
.modelos-vazio-row {
  font-size: 0.82rem; color: var(--text-muted); display: flex; align-items: center; gap: 4px;
  margin-bottom: 8px;
}
.btn-link {
  background: none; border: none; color: var(--blue);
  font-size: inherit; font-family: inherit; cursor: pointer; padding: 0;
  text-decoration: underline;
}

/* Nota builder */
.nota-builder { display: flex; gap: 8px; align-items: stretch; margin-bottom: 14px; margin-top: 2px; }
.input-hora {
  width: 110px; flex-shrink: 0;
  background: var(--bg-input); border: 1px solid var(--border);
  border-radius: var(--radius); color: var(--text);
  font-family: inherit; font-size: 0.95rem; padding: 12px 10px;
}
.input-nota { flex: 1; }
.btn-add-nota {
  width: 46px; flex-shrink: 0;
  background: var(--blue); color: #fff; border: none;
  border-radius: var(--radius); font-size: 1.3rem; font-weight: 700;
  cursor: pointer; font-family: inherit; transition: all 0.15s;
  display: flex; align-items: center; justify-content: center;
}
.btn-add-nota:active { opacity: 0.8; transform: scale(0.95); }
.btn-add-nota:disabled { background: var(--border); cursor: default; }

/* Timeline */
.timeline { margin-bottom: 4px; }
.timeline-item {
  display: flex; align-items: flex-start; gap: 10px;
  position: relative; padding: 10px 0; padding-left: 20px;
}
.timeline-dot {
  position: absolute; left: 0; top: 16px;
  width: 10px; height: 10px; border-radius: 50%;
  background: var(--blue); flex-shrink: 0;
  box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
}
.timeline-line {
  position: absolute; left: 4px; top: 26px;
  width: 2px; height: calc(100% - 6px);
  background: var(--border);
}
.timeline-content {
  flex: 1; display: flex; flex-wrap: wrap; align-items: baseline; gap: 6px;
  padding: 8px 12px;
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: 10px; font-size: 0.9rem;
}
.timeline-hora { font-weight: 700; color: var(--blue); white-space: nowrap; font-size: 0.85rem; }
.timeline-sep { color: var(--text-muted); font-size: 0.85rem; }
.timeline-texto { color: var(--text-dim); flex: 1; word-break: break-word; }
.btn-del-nota {
  background: none; border: none; color: var(--text-muted);
  font-size: 1.1rem; cursor: pointer; padding: 4px 6px;
  border-radius: 6px; line-height: 1; flex-shrink: 0; margin-top: 4px;
}
.btn-del-nota:active { color: var(--danger); background: rgba(220,38,38,0.08); }

/* Utilitários */
.obrigatorio { color: var(--danger); font-weight: 700; }
.opc { font-size: 0.75rem; font-weight: 400; color: var(--text-muted); }
.erro-msg { color: var(--danger); font-size: 0.82rem; margin-top: 8px; }

/* Resultado */
.resultado-box {
  background: var(--bg-input); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 16px;
  font-size: 0.9rem; line-height: 1.7; color: var(--text);
  white-space: pre-wrap; font-family: inherit; margin-bottom: 16px;
  width: 100%; box-sizing: border-box; resize: vertical; outline: none;
}
.btn-copy {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  width: 100%; padding: 12px;
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius); color: var(--text-dim);
  font-family: inherit; font-size: 0.95rem; cursor: pointer; margin-bottom: 8px;
}
.btn-copy:active { background: var(--bg-hover); }
.nav-row { display: flex; gap: 10px; margin-top: 8px; }

/* ── Modal Modelos ── */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.6);
  display: flex; align-items: flex-end; z-index: 200;
}
.modal-modelos {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: 20px 20px 0 0;
  width: 100%; max-height: 80dvh;
  display: flex; flex-direction: column;
}
.modal-modelos-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px 12px;
  border-bottom: 1px solid var(--border); flex-shrink: 0;
}
.modal-modelos-header h3 {
  font-size: 1.05rem; font-weight: 700; color: var(--text);
}
.btn-fechar-modal {
  background: none; border: none; color: var(--text-muted);
  cursor: pointer; padding: 4px; border-radius: 8px; display: flex; align-items: center;
}
.btn-fechar-modal:active { background: var(--bg-hover); }
.modal-modelos-body {
  flex: 1; overflow-y: auto; padding: 14px 16px;
}
.modal-modelos-footer {
  padding: 12px 16px calc(12px + env(safe-area-inset-bottom, 0px));
  border-top: 1px solid var(--border); flex-shrink: 0;
}

/* Lista dentro do modal */
.modal-lista { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
.modal-modelo-item {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 12px;
  background: var(--bg); border: 1px solid var(--border);
  border-radius: 10px;
}
.modal-modelo-txt {
  flex: 1; font-size: 0.9rem; color: var(--text-dim);
  word-break: break-word;
}
.btn-del-modal {
  background: none; border: none; color: var(--text-muted);
  font-size: 1.2rem; cursor: pointer; padding: 4px 8px;
  border-radius: 6px; flex-shrink: 0; line-height: 1;
}
.btn-del-modal:active { color: var(--danger); background: rgba(220,38,38,0.08); }
.modal-vazio {
  font-size: 0.83rem; color: var(--text-muted); line-height: 1.5;
  margin-bottom: 14px; padding: 4px 0;
}

/* Adicionar modelo no modal */
.modal-add-trigger { }
.btn-novo-modelo {
  background: none; border: 1px dashed var(--border);
  border-radius: 10px; color: var(--blue);
  font-size: 0.85rem; font-family: inherit;
  padding: 10px 14px; cursor: pointer; width: 100%;
  transition: all 0.15s;
}
.btn-novo-modelo:active { background: var(--bg-hover); }
.modal-add-form { display: flex; flex-direction: column; gap: 8px; }
.modal-add-form input {
  width: 100%; box-sizing: border-box;
  background: var(--bg-input); border: 1px solid var(--border);
  border-radius: var(--radius); color: var(--text);
  font-family: inherit; font-size: 1rem; padding: 13px 14px;
  outline: none; transition: border-color 0.2s;
}
.modal-add-form input:focus { border-color: var(--blue); }
.modal-add-acoes { display: flex; gap: 8px; justify-content: flex-end; }
.btn-sm { padding: 8px 16px !important; font-size: 0.83rem !important; }
</style>
