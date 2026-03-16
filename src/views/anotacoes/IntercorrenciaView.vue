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
          <h2 class="page-titulo">Intercorrências</h2>
          <p class="page-sub">Notas rápidas e registros livres</p>
        </div>
      </div>

      <!-- Paciente -->
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

      <!-- ─── Notas ─── -->
      <div class="secao-header">
        <span class="secao-label-lg">Notas</span>
        <span v-if="notas.length > 0" class="notas-badge">{{ notas.length }}</span>
      </div>

      <!-- Template chips -->
      <div v-if="modelos.length > 0" class="modelos-chips-wrap">
        <div class="modelos-chips-scroll">
          <button
            v-for="m in modelos"
            :key="m._key"
            class="chip-modelo"
            :class="{ ativo: notaTexto === m.texto }"
            @click="notaTexto = m.texto"
          >{{ m.texto }}</button>
        </div>
      </div>
      <p v-else-if="!carregandoModelos" class="hint-modelos">
        💡 Adicione modelos abaixo para agilizar suas notas
      </p>

      <!-- Builder -->
      <div class="nota-builder">
        <input type="time" v-model="notaHora" class="input-hora">
        <input
          type="text"
          v-model="notaTexto"
          class="input-nota"
          placeholder="Descreva a nota..."
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
          <button class="btn-del-nota" @click="removerNota(i)" title="Remover">×</button>
        </div>
      </div>

      <!-- Intercorrência -->
      <div class="card-secao" style="margin-top:20px">
        <label class="checkbox-label">
          <input type="checkbox" v-model="form.temIntercorrencia">
          <span>🚨 Registrar intercorrência</span>
        </label>
        <div v-if="form.temIntercorrencia" class="intercorrencia-box">
          <textarea
            v-model="form.intercorrencia"
            rows="4"
            placeholder="Descreva a intercorrência detalhadamente..."
          ></textarea>
        </div>
      </div>

      <!-- Modelos manager -->
      <details class="modelos-section">
        <summary class="modelos-summary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14"/>
          </svg>
          Gerenciar modelos de nota
          <span v-if="modelos.length > 0" class="modelos-qtd">{{ modelos.length }}</span>
        </summary>
        <div class="modelos-manager">
          <p v-if="modelos.length === 0" class="modelos-vazio">Nenhum modelo salvo ainda.</p>
          <div v-for="m in modelos" :key="m._key" class="modelo-item">
            <span class="modelo-texto">{{ m.texto }}</span>
            <button class="btn-del-modelo" @click="deletarModelo(m._key)">×</button>
          </div>
          <div class="add-modelo">
            <input
              v-model="novoModelo"
              type="text"
              placeholder="Ex: Paciente em leito sem queixas"
              maxlength="120"
              @keydown.enter="salvarModelo"
            >
            <button
              class="btn-save-modelo"
              @click="salvarModelo"
              :disabled="!novoModelo.trim() || salvandoModelo"
            >{{ salvandoModelo ? '...' : 'Salvar' }}</button>
          </div>
        </div>
      </details>

      <p v-if="erro" class="erro-msg">{{ erro }}</p>
      <button class="btn btn-primary" style="margin-top:20px" @click="gerar">Gerar anotação</button>

    </main>

    <!-- ═══ RESULTADO ═══ -->
    <main v-if="gerado" class="container" style="padding-top:20px;padding-bottom:40px">
      <pre class="resultado-box">{{ textoGerado }}</pre>

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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
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

// ── Modelos ──
const modelos   = ref([])
const novoModelo = ref('')
let modelosOff  = null

// ── Notas ──
const notas     = ref([])
const notaHora  = ref('')
const notaTexto = ref('')

// ── Form ──
const form = reactive({
  nome:              '',
  leito:             '',
  temIntercorrencia: false,
  intercorrencia:    '',
})

// ── Lifecycle ──
onMounted(() => {
  pacientesStore.iniciar()
  notaHora.value = horaAtual()
  iniciarModelos()
})

onUnmounted(() => {
  if (modelosOff) {
    off(dbRef(db, `livres/${authStore.syncCode}/modelos`))
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
  if (!code) return

  // Pré-popula do cache
  try {
    const cached = JSON.parse(localStorage.getItem(`modelos_${code}`) || '[]')
    if (cached.length) { modelos.value = cached; carregandoModelos.value = false }
  } catch {}

  const path = dbRef(db, `livres/${code}/modelos`)
  modelosOff = onValue(path, (snap) => {
    const lista = []
    snap.forEach(child => lista.push({ ...child.val(), _key: child.key }))
    modelos.value = lista
    carregandoModelos.value = false
    try { localStorage.setItem(`modelos_${code}`, JSON.stringify(lista)) } catch {}
  }, () => {
    carregandoModelos.value = false
  })
}

function selecionarPaciente(p) {
  form.nome  = p.nome
  form.leito = p.leito || ''
}

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

async function salvarModelo() {
  const texto = novoModelo.value.trim()
  if (!texto) return
  if (!navigator.onLine) {
    showToast('Sem conexão — modelos requerem internet')
    return
  }
  salvandoModelo.value = true
  try {
    await push(dbRef(db, `livres/${authStore.syncCode}/modelos`), { texto })
    novoModelo.value = ''
    showToast('Modelo salvo!')
  } catch { showToast('Erro ao salvar modelo') }
  finally { salvandoModelo.value = false }
}

async function deletarModelo(key) {
  if (!navigator.onLine) { showToast('Sem conexão'); return }
  try {
    await remove(dbRef(db, `livres/${authStore.syncCode}/modelos/${key}`))
    showToast('Modelo removido')
  } catch { showToast('Erro ao remover') }
}

// ── Gerar ──
function gerar() {
  erro.value = ''

  if (!form.nome.trim()) {
    erro.value = 'Informe o nome do paciente.'
    return
  }
  if (notas.value.length === 0 && !(form.temIntercorrencia && form.intercorrencia.trim())) {
    erro.value = 'Adicione pelo menos uma nota ou intercorrência.'
    return
  }
  if (form.temIntercorrencia && !form.intercorrencia.trim()) {
    erro.value = 'Descreva a intercorrência.'
    return
  }

  const linhas = notas.value.map(n => {
    let t = n.texto.charAt(0).toUpperCase() + n.texto.slice(1)
    if (!/[.!?]$/.test(t)) t += '.'
    return `${n.hora} – ${t}`
  })

  if (form.temIntercorrencia) {
    const int = form.intercorrencia.trim()
    const t = int.charAt(0).toUpperCase() + int.slice(1)
    linhas.push(`Intercorrência: ${t}${/[.!?]$/.test(t) ? '' : '.'}`)
  }

  textoGerado.value = linhas.join('\n')
  gerado.value = true
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// ── Copiar ──
async function copiar() {
  try {
    try {
      await navigator.clipboard.writeText(textoGerado.value)
    } catch {
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
    await anotacoesStore.salvar({
      tipo:  'intercorrencia',
      texto: textoGerado.value,
      nome:  form.nome,
      leito: form.leito,
    })
    showToast('Salvo no histórico!')
  } catch { showToast('Erro ao salvar') }
  finally { salvando.value = false }
}

// ── Nova anotação ──
function novaAnotacao() {
  form.nome = ''; form.leito = ''
  form.temIntercorrencia = false; form.intercorrencia = ''
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

/* ── Page header ── */
.page-header {
  display: flex; align-items: center; gap: 14px; margin-bottom: 24px;
}
.page-icon { font-size: 2rem; line-height: 1; }
.page-titulo { font-size: 1.25rem; font-weight: 700; color: var(--text); margin: 0; }
.page-sub { font-size: 0.8rem; color: var(--text-muted); margin: 2px 0 0; }

/* ── Card seção ── */
.card-secao {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 16px; margin-bottom: 16px;
}

/* ── Seção header ── */
.secao-header {
  display: flex; align-items: center; gap: 8px; margin-bottom: 12px;
}
.secao-label-lg {
  font-size: 0.75rem; font-weight: 700; color: var(--text-muted);
  text-transform: uppercase; letter-spacing: 0.08em;
}
.notas-badge {
  background: var(--blue); color: #fff;
  font-size: 0.7rem; font-weight: 700;
  border-radius: 10px; padding: 1px 7px; min-width: 20px; text-align: center;
}

/* ── Chips ── */
.chips-scroll { display: flex; flex-wrap: wrap; gap: 8px; }
.chip {
  padding: 8px 14px; border-radius: 20px;
  border: 1px solid var(--border); background: var(--bg-card);
  color: var(--text-dim); font-size: 0.9rem;
  cursor: pointer; font-family: inherit; transition: all 0.15s;
}
.chip:active { opacity: 0.8; }
.chip-on { background: var(--blue); border-color: var(--blue); color: #fff; }

/* ── Modelos chips ── */
.modelos-chips-wrap { margin-bottom: 10px; }
.modelos-chips-scroll {
  display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px;
  scrollbar-width: none;
}
.modelos-chips-scroll::-webkit-scrollbar { display: none; }
.chip-modelo {
  white-space: nowrap; flex-shrink: 0;
  padding: 7px 14px; border-radius: 20px;
  border: 1px solid var(--border); background: var(--bg-card);
  color: var(--text-dim); font-size: 0.85rem;
  cursor: pointer; font-family: inherit; transition: all 0.15s;
}
.chip-modelo:active { opacity: 0.8; }
.chip-modelo.ativo { background: rgba(59,130,246,0.15); border-color: var(--blue); color: var(--blue); }

.hint-modelos {
  font-size: 0.8rem; color: var(--text-muted); margin-bottom: 10px;
  padding: 10px 12px; background: var(--bg-card);
  border: 1px dashed var(--border); border-radius: 10px;
}

/* ── Nota builder ── */
.nota-builder {
  display: flex; gap: 8px; align-items: stretch; margin-bottom: 14px;
}
.input-hora {
  width: 110px; flex-shrink: 0;
  background: var(--bg-input); border: 1px solid var(--border);
  border-radius: var(--radius); color: var(--text);
  font-family: inherit; font-size: 0.95rem; padding: 12px 10px;
}
.input-nota {
  flex: 1;
}
.btn-add-nota {
  width: 46px; flex-shrink: 0;
  background: var(--blue); color: #fff; border: none;
  border-radius: var(--radius); font-size: 1.3rem; font-weight: 700;
  cursor: pointer; font-family: inherit; transition: all 0.15s;
  display: flex; align-items: center; justify-content: center;
}
.btn-add-nota:active { opacity: 0.8; transform: scale(0.95); }
.btn-add-nota:disabled { background: var(--border); cursor: default; }

/* ── Timeline ── */
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
  border-radius: 10px;
  font-size: 0.9rem;
}
.timeline-hora {
  font-weight: 700; color: var(--blue); white-space: nowrap; font-size: 0.85rem;
}
.timeline-sep { color: var(--text-muted); font-size: 0.85rem; }
.timeline-texto { color: var(--text-dim); flex: 1; word-break: break-word; }
.btn-del-nota {
  background: none; border: none; color: var(--text-muted);
  font-size: 1.1rem; cursor: pointer; padding: 4px 6px;
  border-radius: 6px; line-height: 1; flex-shrink: 0; margin-top: 4px;
}
.btn-del-nota:active { color: var(--danger); background: rgba(220,38,38,0.08); }

/* ── Intercorrência ── */
.checkbox-label {
  display: flex; align-items: center; gap: 8px;
  font-size: 0.9rem; color: var(--text-dim); cursor: pointer;
}
.checkbox-label input[type="checkbox"] { cursor: pointer; }
.intercorrencia-box { margin-top: 12px; }
.intercorrencia-box textarea {
  width: 100%; resize: vertical; min-height: 90px;
  background: var(--bg-input); border: 1px solid var(--border);
  border-radius: var(--radius); color: var(--text);
  font-family: inherit; font-size: 0.95rem; padding: 12px;
  box-sizing: border-box;
}

/* ── Modelos manager ── */
.modelos-section {
  margin-top: 16px;
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius); overflow: hidden;
}
.modelos-summary {
  display: flex; align-items: center; gap: 8px;
  padding: 12px 14px; cursor: pointer; list-style: none;
  font-size: 0.85rem; color: var(--text-muted); font-weight: 600;
  user-select: none;
}
.modelos-summary::-webkit-details-marker { display: none; }
.modelos-section[open] .modelos-summary { border-bottom: 1px solid var(--border); }
.modelos-qtd {
  margin-left: auto;
  background: var(--border); color: var(--text-muted);
  font-size: 0.7rem; font-weight: 700;
  border-radius: 10px; padding: 1px 7px;
}
.modelos-manager { padding: 12px 14px; display: flex; flex-direction: column; gap: 8px; }
.modelos-vazio { font-size: 0.82rem; color: var(--text-muted); text-align: center; padding: 8px 0; }
.modelo-item {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 10px; background: var(--bg);
  border: 1px solid var(--border); border-radius: 8px;
}
.modelo-texto { flex: 1; font-size: 0.88rem; color: var(--text-dim); }
.btn-del-modelo {
  background: none; border: none; color: var(--text-muted);
  font-size: 1rem; cursor: pointer; padding: 2px 6px;
  border-radius: 4px; flex-shrink: 0; line-height: 1;
}
.btn-del-modelo:active { color: var(--danger); background: rgba(220,38,38,0.08); }
.add-modelo { display: flex; gap: 8px; margin-top: 4px; }
.add-modelo input { flex: 1; }
.btn-save-modelo {
  background: var(--blue); color: #fff; border: none;
  border-radius: var(--radius); font-family: inherit;
  font-size: 0.85rem; font-weight: 600;
  padding: 10px 14px; cursor: pointer; white-space: nowrap;
  flex-shrink: 0; transition: opacity 0.15s;
}
.btn-save-modelo:disabled { opacity: 0.5; cursor: default; }
.btn-save-modelo:active:not(:disabled) { opacity: 0.8; }

/* ── Utilitários ── */
.obrigatorio { color: var(--danger); font-weight: 700; }
.opc { font-size: 0.75rem; font-weight: 400; color: var(--text-muted); }
.erro-msg { color: var(--danger); font-size: 0.82rem; margin-top: 8px; }

/* ── Resultado ── */
.resultado-box {
  background: var(--bg-input); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 16px;
  font-size: 0.9rem; line-height: 1.7; color: var(--text);
  white-space: pre-wrap; font-family: inherit; margin-bottom: 16px;
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
</style>
