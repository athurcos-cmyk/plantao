<template>
  <div class="screen">
    <header class="app-header">
      <button class="btn-icon" @click="voltarOuSair">
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

    <!-- Barra de progresso -->
    <div v-if="!gerado" class="progress-wrap">
      <div class="progress-fill" :style="{ width: (passo / 3 * 100) + '%' }"></div>
      <span class="progress-label">Bloco {{ passo }} de 3</span>
    </div>

    <main class="container" style="padding-top:20px;padding-bottom:40px">

      <!-- Banner de rascunho -->
      <div v-if="temRascunho && !gerado" class="rascunho-banner">
        <div class="rascunho-info"><span>📝</span><span>Você tem um rascunho salvo</span></div>
        <div class="rascunho-acoes">
          <button class="btn btn-primary btn-sm" @click="restaurarRascunho">Continuar</button>
          <button class="btn btn-secondary btn-sm" @click="descartarRascunho">Descartar</button>
        </div>
      </div>

      <!-- ═══ BLOCO 1 — Identificação ═══ -->
      <div v-if="!gerado && passo === 1">
        <h2 class="bloco-titulo">Identificação</h2>

        <div class="campo">
          <label>Horário <span class="obrigatorio">*</span></label>
          <input type="time" v-model="form.horario">
        </div>

        <div v-if="pacientesStore.pacientes.length > 0" class="campo">
          <label>Paciente registrado</label>
          <div class="chips-wrap">
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

        <div class="campo">
          <label>Leito <span class="opc">(opcional)</span></label>
          <input type="text" v-model="form.leito" placeholder="Ex: 4B">
        </div>

        <p v-if="erro" class="erro-msg">{{ erro }}</p>
        <div class="bloco-nav">
          <button class="btn btn-secondary" style="width:auto;padding:12px 20px" @click="limparBloco">Limpar</button>
          <button class="btn btn-primary" @click="avancar">Próximo →</button>
        </div>
      </div>

      <!-- ═══ BLOCO 2 — Destino e Transporte ═══ -->
      <div v-if="!gerado && passo === 2">
        <h2 class="bloco-titulo">Destino e Transporte</h2>

        <!-- Destino -->
        <div class="campo">
          <label>Para onde? <span class="obrigatorio">*</span></label>
          <div class="chips-wrap" style="margin-bottom:8px">
            <button
              v-for="d in destinosPadrao" :key="d"
              class="chip" :class="{ 'chip-on': form.destino === d }"
              @click="toggleDestino(d)"
            >{{ d }}</button>
            <button
              v-for="d in destinosCustom" :key="d._key"
              class="chip chip-custom" :class="{ 'chip-on': form.destino === d.texto }"
              @click="toggleDestino(d.texto)"
            >
              {{ d.texto }}
              <span class="chip-del" @click.stop="removerDestinoCustom(d._key)">×</span>
            </button>
            <button v-if="!adicionandoDestino" class="chip chip-add" @click="abrirAddDestino">+ Adicionar</button>
          </div>
          <div v-if="adicionandoDestino" class="add-row">
            <input
              class="add-input"
              type="text"
              v-model="novoDestinoTxt"
              placeholder="Ex: INRAD, INCOR, IOT..."
              @keyup.enter="salvarDestinoCustom"
              @keyup.esc="fecharAddDestino"
              ref="refNovoDestino"
            >
            <button class="chip chip-on" @click="salvarDestinoCustom" :disabled="!novoDestinoTxt.trim()">Salvar</button>
            <button class="chip" @click="fecharAddDestino">✕</button>
          </div>
          <input
            type="text"
            v-model="form.destino"
            placeholder="Ou digite manualmente"
            style="margin-top:6px"
          >
        </div>

        <!-- Transporte -->
        <div class="campo">
          <label>Tipo de transporte <span class="obrigatorio">*</span></label>
          <div class="chips-wrap">
            <button
              v-for="t in transporteOpcoes" :key="t"
              class="chip" :class="{ 'chip-on': form.transporte === t }"
              @click="selecionarTransporte(t)"
            >{{ t }}</button>
            <button
              class="chip" :class="{ 'chip-on': form.transporte === '__outro__' }"
              @click="selecionarTransporte('__outro__')"
            >Outro</button>
          </div>
          <div v-if="form.transporte === '__outro__'" class="add-row" style="margin-top:8px">
            <input
              class="add-input"
              type="text"
              v-model="form.transporteOutro"
              placeholder="Descreva o tipo de transporte..."
              ref="refTransporteOutro"
            >
          </div>
        </div>

        <!-- Motivo (opcional) -->
        <div class="campo">
          <label>Motivo <span class="opc">(opcional)</span></label>
          <input type="text" v-model="form.motivo" placeholder="Ex: realização de tomografia, avaliação especializada">
        </div>

        <!-- Condição clínica (opcional) -->
        <div class="campo">
          <label>Condição clínica <span class="opc">(opcional)</span></label>
          <div class="chips-wrap">
            <button
              v-for="op in ['Estável', 'Grave', 'Instável']" :key="op"
              class="chip" :class="{ 'chip-on': form.condicao === op }"
              @click="form.condicao = form.condicao === op ? '' : op"
            >{{ op }}</button>
          </div>
        </div>

        <p v-if="erro" class="erro-msg">{{ erro }}</p>
        <div class="bloco-nav">
          <button class="btn btn-secondary" style="width:auto;padding:12px 16px" @click="passo = 1">← Voltar</button>
          <button class="btn btn-secondary" style="width:auto;padding:12px 16px" @click="limparBloco">Limpar</button>
          <button class="btn btn-primary" @click="avancar">Próximo →</button>
        </div>
      </div>

      <!-- ═══ BLOCO 3 — Acompanhante e Dispositivos ═══ -->
      <div v-if="!gerado && passo === 3">
        <h2 class="bloco-titulo">Acompanhante e Dispositivos</h2>

        <div class="campo">
          <label>Acompanhante <span class="obrigatorio">*</span></label>
          <div class="chips-wrap" style="margin-bottom:10px">
            <button
              v-for="c in cargoOpcoes" :key="c.label"
              class="chip" :class="{ 'chip-on': form.cargo === c.label }"
              @click="form.cargo = c.label"
            >{{ c.label }}</button>
          </div>
          <input
            v-if="form.cargo && form.cargo !== 'Sem acompanhante'"
            type="text"
            v-model="form.nomeAcomp"
            placeholder="Nome do profissional (opcional)"
          >
        </div>

        <div class="campo">
          <label>Dispositivos em uso</label>
          <div style="display:flex;flex-direction:column;gap:8px;margin-top:4px">
            <label v-for="disp in dispositivosOpcoes" :key="disp" class="checkbox-label">
              <input
                type="checkbox"
                :value="disp"
                :checked="form.dispositivos.includes(disp)"
                @change="toggleDispositivo(disp)"
              >
              <span>{{ disp }}</span>
            </label>
          </div>
        </div>

        <div class="campo">
          <label>Recebido por <span class="opc">(opcional)</span></label>
          <input type="text" v-model="form.recebidoPor" placeholder="Ex: Enf. Maria, Dr. Carlos">
        </div>

        <div class="campo">
          <label>Observações <span class="opc">(opcional)</span></label>
          <textarea v-model="form.observacoes" rows="3" placeholder="Ex: paciente agitado durante o transporte"></textarea>
        </div>

        <p v-if="erro" class="erro-msg">{{ erro }}</p>
        <div class="bloco-nav">
          <button class="btn btn-secondary" style="width:auto;padding:12px 16px" @click="passo = 2">← Voltar</button>
          <button class="btn btn-secondary" style="width:auto;padding:12px 16px" @click="limparBloco">Limpar</button>
          <button class="btn btn-primary" @click="gerar">Gerar anotação</button>
        </div>
      </div>

      <!-- ═══ RESULTADO ═══ -->
      <div v-if="gerado">
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

        <button class="btn btn-secondary" style="width:100%;margin-top:10px" @click="gerado = false; passo = 3">← Editar</button>
      </div>

    </main>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAnotacoesStore } from '../../stores/anotacoes.js'
import { usePacientesStore } from '../../stores/pacientes.js'
import { useRascunho } from '../../composables/useRascunho.js'
import { useToast } from '../../composables/useToast.js'
import { db } from '../../firebase.js'
import { ref as dbRef, push, onValue, off, remove } from 'firebase/database'
import { useAuthStore } from '../../stores/auth.js'

const router         = useRouter()
const anotacoesStore = useAnotacoesStore()
const pacientesStore = usePacientesStore()
const authStore      = useAuthStore()
const { showToast }  = useToast()

// ── Estado ──
const passo       = ref(1)
const gerado      = ref(false)
const textoGerado = ref('')
const erro        = ref('')
const salvando    = ref(false)
const copiado     = ref(false)

// ── Destinos personalizados (Firebase) ──
const destinosCustom     = ref([])
const adicionandoDestino = ref(false)
const novoDestinoTxt     = ref('')
const refNovoDestino     = ref(null)
const refTransporteOutro = ref(null)
let unsubDestinos = null

function _code() { return authStore.syncCode }

function iniciarDestinos() {
  const code = _code()
  if (!code) return
  const path = dbRef(db, `encaminhamento/${code}/destinos`)
  unsubDestinos = onValue(path, (snap) => {
    const lista = []
    snap.forEach(c => { lista.push({ ...c.val(), _key: c.key }) })
    lista.sort((a, b) => (a.criadoEm || 0) - (b.criadoEm || 0))
    destinosCustom.value = lista
  })
}

async function abrirAddDestino() {
  adicionandoDestino.value = true
  await nextTick()
  refNovoDestino.value?.focus()
}

function fecharAddDestino() {
  adicionandoDestino.value = false
  novoDestinoTxt.value = ''
}

async function salvarDestinoCustom() {
  const texto = novoDestinoTxt.value.trim()
  if (!texto) return
  await push(dbRef(db, `encaminhamento/${_code()}/destinos`), { texto, criadoEm: Date.now() })
  form.destino = texto
  fecharAddDestino()
}

async function removerDestinoCustom(key) {
  const destino = destinosCustom.value.find(d => d._key === key)
  if (destino && form.destino === destino.texto) form.destino = ''
  await remove(dbRef(db, `encaminhamento/${_code()}/destinos/${key}`))
}

// ── Formulário ──
const form = reactive({
  horario:         '',
  nome:            '',
  leito:           '',
  destino:         '',
  transporte:      '',
  transporteOutro: '',
  motivo:          '',
  condicao:        '',
  cargo:           '',
  nomeAcomp:       '',
  dispositivos:    [],
  recebidoPor:     '',
  observacoes:     '',
})

// ── Rascunho ──
const { temRascunho, restaurarRascunho, descartarRascunho, iniciarRascunho } =
  useRascunho('rascunho_encaminhamento', form, () => !!(form.horario || form.nome || form.destino))

// ── Opções ──
const destinosPadrao   = ['UTI', 'Centro Cirúrgico', 'Raio-X', 'Tomografia', 'Endoscopia', 'Hemodinâmica']
const transporteOpcoes = ['Cadeira de rodas', 'Maca', 'A pé', 'Ambulância']
const dispositivosOpcoes = ['SVD', 'AVP', 'CVC', 'SNG', 'TOT', 'Cateter nasal O2', 'Dreno torácico', 'Nenhum']

const cargoOpcoes = [
  { label: 'Téc. de enfermagem', texto: 'técnico de enfermagem',  artigo: 'do' },
  { label: 'Téc.ª de enfermagem', texto: 'técnica de enfermagem', artigo: 'da' },
  { label: 'Enf.',               texto: 'enfermeiro',             artigo: 'do' },
  { label: 'Enf.ª',              texto: 'enfermeira',             artigo: 'da' },
  { label: 'Médico',             texto: 'médico',                 artigo: 'do' },
  { label: 'Médica',             texto: 'médica',                 artigo: 'da' },
  { label: 'Sem acompanhante',   texto: 'sem acompanhante',       artigo: ''   },
]

// ── Lifecycle ──
onMounted(() => {
  pacientesStore.iniciar()
  iniciarDestinos()
  iniciarRascunho()
})

onUnmounted(() => {
  const code = _code()
  if (code && unsubDestinos) off(dbRef(db, `encaminhamento/${code}/destinos`))
  unsubDestinos = null
})

// ── Helpers ──
function selecionarPaciente(p) {
  form.nome  = p.nome
  form.leito = p.leito || ''
}

function toggleDestino(d) {
  form.destino = form.destino === d ? '' : d
}

async function selecionarTransporte(t) {
  form.transporte = t
  if (t === '__outro__') {
    await nextTick()
    refTransporteOutro.value?.focus()
  } else {
    form.transporteOutro = ''
  }
}

function toggleDispositivo(disp) {
  if (disp === 'Nenhum') {
    form.dispositivos = form.dispositivos.includes('Nenhum') ? [] : ['Nenhum']
    return
  }
  const idx = form.dispositivos.indexOf(disp)
  if (idx === -1) {
    form.dispositivos = form.dispositivos.filter(d => d !== 'Nenhum').concat(disp)
  } else {
    form.dispositivos = form.dispositivos.filter(d => d !== disp)
  }
}

// ── Navegação ──
function voltarOuSair() {
  if (passo.value > 1 && !gerado.value) { passo.value--; return }
  router.back()
}

function limparBloco() {
  erro.value = ''
  if (passo.value === 1) {
    form.horario = ''; form.nome = ''; form.leito = ''
  } else if (passo.value === 2) {
    form.destino = ''; form.transporte = ''; form.transporteOutro = ''
    form.motivo = ''; form.condicao = ''
  } else if (passo.value === 3) {
    form.cargo = ''; form.nomeAcomp = ''; form.dispositivos = []
    form.recebidoPor = ''; form.observacoes = ''
  }
}

function avancar() {
  erro.value = ''
  if (passo.value === 1) {
    if (!form.horario || !form.nome.trim()) {
      erro.value = 'Preencha o horário e o nome do paciente.'
      return
    }
  } else if (passo.value === 2) {
    if (!form.destino.trim()) {
      erro.value = 'Informe o destino.'
      return
    }
    if (!form.transporte) {
      erro.value = 'Selecione o tipo de transporte.'
      return
    }
    if (form.transporte === '__outro__' && !form.transporteOutro.trim()) {
      erro.value = 'Descreva o tipo de transporte.'
      return
    }
  }
  passo.value++
}

// ── Gerar texto ──
function gerar() {
  erro.value = ''
  if (!form.cargo) { erro.value = 'Selecione o acompanhante.'; return }

  // Resolve transporte real
  const transporteTxt = form.transporte === '__outro__'
    ? form.transporteOutro.trim()
    : form.transporte.toLowerCase()

  // Identificação
  let texto = `Às ${form.horario}h, paciente ${form.nome}`
  if (form.leito) texto += `, leito ${form.leito}`

  // Transporte
  texto += `, encaminhado em ${transporteTxt}`

  // Acompanhante
  const cargo = cargoOpcoes.find(c => c.label === form.cargo)
  if (cargo && cargo.texto === 'sem acompanhante') {
    texto += ', sem acompanhante'
  } else if (cargo) {
    texto += `, acompanhado ${cargo.artigo} ${cargo.texto}`
    if (form.nomeAcomp.trim()) texto += ` ${form.nomeAcomp.trim()}`
  }

  // Destino e motivo
  texto += `, para ${form.destino}`
  if (form.motivo.trim()) texto += `, para ${form.motivo.trim()}`
  texto += '.'

  // Condição (opcional)
  if (form.condicao) texto += ` Condição clínica: ${form.condicao}.`

  // Dispositivos
  const disps = form.dispositivos.filter(d => d !== 'Nenhum')
  if (disps.length > 0) {
    texto += ` Dispositivos em uso: ${disps.join(', ')}.`
  }

  // Recebido por
  if (form.recebidoPor.trim()) texto += ` Recebido por ${form.recebidoPor.trim()}.`

  // Observações
  if (form.observacoes.trim()) texto += ` Observações: ${form.observacoes.trim()}.`

  textoGerado.value = texto
  gerado.value = true
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// ── Copiar ──
async function copiar() {
  try {
    await navigator.clipboard.writeText(textoGerado.value)
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
      tipo:  'encaminhamento',
      texto: textoGerado.value,
      nome:  form.nome,
      leito: form.leito,
    })
    descartarRascunho()
    showToast('Salvo no histórico!')
  } catch { showToast('Erro ao salvar') }
  finally { salvando.value = false }
}

// ── Nova anotação ──
function novaAnotacao() {
  Object.assign(form, {
    horario: '', nome: '', leito: '', destino: '',
    transporte: '', transporteOutro: '', motivo: '', condicao: '',
    cargo: '', nomeAcomp: '', dispositivos: [], recebidoPor: '', observacoes: '',
  })
  textoGerado.value = ''; gerado.value = false; passo.value = 1
  erro.value = ''; copiado.value = false
  descartarRascunho()
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

.progress-wrap { height: 4px; background: var(--border); position: relative; }
.progress-fill { height: 100%; background: var(--blue); transition: width 0.3s; }
.progress-label { position: absolute; right: 16px; top: 6px; font-size: 0.7rem; color: var(--text-muted); }

.bloco-titulo {
  font-size: 1.1rem; font-weight: 700; color: var(--text);
  margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid var(--border);
}
.opc { font-size: 0.75rem; font-weight: 400; color: var(--text-muted); }

/* ── Chips ── */
.chips-wrap { display: flex; flex-wrap: wrap; gap: 8px; }

.chip {
  padding: 6px 12px; border-radius: 20px;
  border: 1px solid var(--border); background: var(--bg-card);
  color: var(--text-dim); font-size: 0.85rem;
  cursor: pointer; font-family: inherit; transition: all 0.15s;
  display: flex; align-items: center; gap: 4px;
}
.chip:active { opacity: 0.8; }
.chip-on { background: var(--blue); border-color: var(--blue); color: #fff; }

.chip-custom { padding-right: 6px; }
.chip-del {
  display: inline-flex; align-items: center; justify-content: center;
  width: 16px; height: 16px; border-radius: 50%; font-size: 0.75rem;
  background: rgba(255,255,255,0.25); cursor: pointer; flex-shrink: 0;
}
.chip-custom:not(.chip-on) .chip-del { background: rgba(0,0,0,0.12); }

.chip-add {
  border-style: dashed; color: var(--blue); border-color: var(--blue);
  background: rgba(30,136,229,0.06);
}

/* ── Add inline row ── */
.add-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 4px; }
.add-input {
  flex: 1; min-width: 140px;
  background: var(--bg-input); border: 1px solid var(--blue);
  border-radius: var(--radius); padding: 8px 12px;
  color: var(--text); font-family: inherit; font-size: 0.9rem; outline: none;
}

/* ── Nav ── */
.bloco-nav { display: flex; gap: 10px; margin-top: 12px; align-items: center; }
.bloco-nav .btn-primary { flex: 1; }

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
.erro-msg { color: var(--danger); font-size: 0.82rem; margin-top: 6px; }
</style>
