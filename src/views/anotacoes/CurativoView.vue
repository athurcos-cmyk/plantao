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

    <div v-if="!gerado" class="progress-wrap">
      <div class="progress-fill" :style="{ width: (passo / 2 * 100) + '%' }"></div>
      <span class="progress-label">Bloco {{ passo }} de 2</span>
    </div>

    <main class="container" style="padding-top:20px;padding-bottom:40px">

      <!-- Banner rascunho -->
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

      <!-- ═══ BLOCO 2 — Detalhes ═══ -->
      <div v-if="!gerado && passo === 2">
        <h2 class="bloco-titulo">Detalhes do curativo</h2>

        <!-- Tipo -->
        <div class="campo">
          <label>Tipo <span class="obrigatorio">*</span></label>
          <div class="chips-wrap">
            <button class="chip" :class="{ 'chip-on': form.tipo === 'curativo' }" @click="form.tipo = 'curativo'">🩹 Curativo</button>
            <button class="chip" :class="{ 'chip-on': form.tipo === 'troca' }" @click="form.tipo = 'troca'">🔄 Troca de curativo</button>
            <button class="chip" :class="{ 'chip-on': form.tipo === 'placa' }" @click="form.tipo = 'placa'">🟦 Troca de placa de hidrocoloide</button>
          </div>
        </div>

        <!-- Dreno (só para curativo/troca) -->
        <div v-if="form.tipo && form.tipo !== 'placa'" class="campo">
          <label class="checkbox-label">
            <input type="checkbox" v-model="form.ehDreno">
            <span>Curativo de dreno</span>
          </label>
          <div v-if="form.ehDreno" style="margin-top:10px">
            <input type="text" v-model="form.dreno" placeholder="Ex: da nefrostomia D e E, de tórax em flanco E">
          </div>
        </div>

        <!-- Local (quando não é dreno) -->
        <div v-if="form.tipo && !form.ehDreno" class="campo">
          <label>Local <span class="obrigatorio">*</span></label>
          <div class="chips-wrap" style="margin-bottom:8px">
            <button v-for="l in locaisChips" :key="l" class="chip chip-sm"
              :class="{ 'chip-on': form.local === l }"
              @click="setLocal(l)">{{ l }}</button>
          </div>
          <input type="text" v-model="form.local" placeholder="Ou descreva o local...">
        </div>

        <!-- Materiais (não para placa) -->
        <div v-if="form.tipo && form.tipo !== 'placa'" class="campo">
          <label>Em uso de <span class="opc">(opcional)</span></label>
          <div class="radio-group vertical">
            <label v-for="m in materiaisOpcoes" :key="m" class="checkbox-label">
              <input type="checkbox" :value="m" v-model="form.materiais">
              <span>{{ m }}</span>
            </label>
          </div>
          <input type="text" v-model="form.materiaisLivre" placeholder="Outro material..." style="margin-top:8px">
        </div>

        <!-- Condição (não para placa) -->
        <div v-if="form.tipo && form.tipo !== 'placa'" class="campo">
          <label>Condição</label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="form.condicao">
            <span>Ocluído, limpo e seco externamente</span>
          </label>
        </div>

        <!-- Aspecto da ferida (não para placa) -->
        <div v-if="form.tipo && form.tipo !== 'placa'" class="campo">
          <label>Aspecto da ferida <span class="opc">(opcional)</span></label>
          <div class="chips-wrap" style="margin-bottom:8px">
            <button v-for="a in aspectoChips" :key="a" class="chip chip-sm"
              :class="{ 'chip-on': form.aspecto === a }"
              @click="setAspecto(a)">{{ a }}</button>
          </div>
          <input type="text" v-model="form.aspecto" placeholder="Ex: tecido de granulação, necrose...">
        </div>

        <p v-if="erro" class="erro-msg">{{ erro }}</p>
        <div class="bloco-nav">
          <button class="btn btn-secondary" style="width:auto;padding:12px 16px" @click="passo = 1">← Voltar</button>
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

        <button class="btn btn-secondary" style="width:100%;margin-top:10px" @click="gerado = false; passo = 2">← Editar</button>
      </div>

    </main>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAnotacoesStore } from '../../stores/anotacoes.js'
import { usePacientesStore } from '../../stores/pacientes.js'
import { useRascunho } from '../../composables/useRascunho.js'
import { useToast } from '../../composables/useToast.js'

const router         = useRouter()
const anotacoesStore = useAnotacoesStore()
const pacientesStore = usePacientesStore()
const { showToast }  = useToast()

// ── Estado ──
const passo       = ref(1)
const gerado      = ref(false)
const textoGerado = ref('')
const erro        = ref('')
const salvando    = ref(false)
const copiado     = ref(false)

// ── Formulário ──
const form = reactive({
  horario:       '',
  nome:          '',
  leito:         '',
  tipo:          '',      // 'curativo' | 'troca' | 'placa'
  ehDreno:       false,
  dreno:         '',      // ex: "da nefrostomia D e E"
  local:         '',      // ex: "MSD", "região sacral"
  materiais:     [],
  materiaisLivre: '',
  condicao:      true,    // Ocluído, limpo e seco externamente
  aspecto:       '',      // Ferida apresentando ...
})

// ── Rascunho ──
const { temRascunho, restaurarRascunho, descartarRascunho, iniciarRascunho } =
  useRascunho('rascunho_curativo', form, () => !!(form.horario || form.nome))

// ── Opções ──
const locaisChips = ['MSD', 'MID', 'MSE', 'MIE', 'MMII', 'MMSS', 'região abdominal', 'região sacral', 'região lombar', 'região cervical']

const materiaisOpcoes = [
  'SF 0,9%', 'Gaze', 'Rayon', 'AGE', 'Atadura',
  'Hidrogel', 'Adaptic', 'Clorexidina aquosa',
  'Papaína gel 2%', 'Placa de alginato de cálcio',
  'Placa de alginato de cálcio com prata',
]

const aspectoChips = [
  'exsudato sanguinolento', 'exsudato purolento',
  'exsudato seroso', 'exsudato serossanguinolento',
]

// ── Lifecycle ──
onMounted(() => {
  pacientesStore.iniciar()
  iniciarRascunho()
})

// ── Helpers ──
function selecionarPaciente(p) {
  form.nome  = p.nome
  form.leito = p.leito || ''
}

function setLocal(value) {
  form.local = form.local === value ? '' : value
}

function setAspecto(value) {
  form.aspecto = form.aspecto === value ? '' : value
}

function formatHora(h) { return h ? h.replace(':', 'h') : '' }

// ── Navegação ──
function voltarOuSair() {
  if (passo.value > 1 && !gerado.value) { passo.value--; return }
  router.push({ name: 'dashboard' })
}

function limparBloco() {
  erro.value = ''
  if (passo.value === 1) {
    form.horario = ''; form.nome = ''; form.leito = ''
  } else {
    form.tipo = ''; form.ehDreno = false; form.dreno = ''
    form.local = ''; form.materiais = []; form.materiaisLivre = ''
    form.condicao = true; form.aspecto = ''
  }
}

function avancar() {
  erro.value = ''
  if (!form.horario || !form.nome.trim()) {
    erro.value = 'Preencha o horário e o nome do paciente.'
    return
  }
  passo.value++
}

// ── Gerar texto ──
function gerar() {
  erro.value = ''
  if (!form.tipo) { erro.value = 'Selecione o tipo de curativo.'; return }

  if (form.tipo !== 'placa') {
    if (form.ehDreno && !form.dreno.trim()) {
      erro.value = 'Descreva o dreno.'; return
    }
    if (!form.ehDreno && !form.local.trim()) {
      erro.value = 'Informe o local do curativo.'; return
    }
  } else {
    if (!form.local.trim()) { erro.value = 'Informe o local.'; return }
  }

  const hora = formatHora(form.horario)

  // Localização
  const localPart = form.ehDreno
    ? ` de dreno ${form.dreno.trim()}`
    : ` em ${form.local.trim()}`

  // Placa de hidrocoloide — texto simples
  if (form.tipo === 'placa') {
    textoGerado.value = `${hora} – Realizado troca de placa de hidrocoloide${localPart}.`
    gerado.value = true
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }

  // Materiais (na ordem da lista)
  const mats = materiaisOpcoes.filter(m => form.materiais.includes(m))
  if (form.materiaisLivre.trim()) mats.push(form.materiaisLivre.trim())

  const verbo = form.tipo === 'troca' ? 'troca de curativo' : 'curativo'
  let texto = `${hora} – Realizado ${verbo}${localPart}`

  if (mats.length > 0) {
    texto += `, em uso de ${mats.join(' + ')}`
  }
  texto += '.'

  if (form.condicao) {
    texto += ' Ocluído, limpo e seco externamente.'
  }

  if (form.aspecto.trim()) {
    texto += ` Ferida apresentando ${form.aspecto.trim()}.`
  }

  textoGerado.value = texto
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
      document.body.appendChild(el)
      el.focus(); el.select()
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
      tipo:  'curativo',
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
    horario: '', nome: '', leito: '',
    tipo: '', ehDreno: false, dreno: '',
    local: '', materiais: [], materiaisLivre: '',
    condicao: true, aspecto: '',
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

.chips-wrap { display: flex; flex-wrap: wrap; gap: 8px; }

.chip {
  padding: 8px 14px; border-radius: 20px;
  border: 1px solid var(--border); background: var(--bg-card);
  color: var(--text-dim); font-size: 0.9rem;
  cursor: pointer; font-family: inherit; transition: all 0.15s;
  display: flex; align-items: center; gap: 4px;
}
.chip:active { opacity: 0.8; }
.chip-on { background: var(--blue); border-color: var(--blue); color: #fff; }
.chip-sm { padding: 6px 12px; font-size: 0.85rem; }

.bloco-nav { display: flex; gap: 10px; margin-top: 12px; align-items: center; }
.bloco-nav .btn-primary { flex: 1; }

.rascunho-banner {
  background: var(--bg-card); border: 1px solid var(--blue);
  border-radius: var(--radius); padding: 12px 14px;
  display: flex; align-items: center; justify-content: space-between;
  gap: 10px; margin-bottom: 20px; flex-wrap: wrap;
}
.rascunho-info { display: flex; align-items: center; gap: 8px; font-size: 0.88rem; color: var(--text-dim); }
.rascunho-acoes { display: flex; gap: 8px; }
.btn-sm { padding: 7px 14px !important; font-size: 0.82rem !important; }

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

.checkbox-label:has(input:checked) {
  border-color: var(--border);
}
</style>
