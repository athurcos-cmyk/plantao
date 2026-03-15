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
        <div class="rascunho-info">
          <span>📝</span>
          <span>Você tem um rascunho salvo</span>
        </div>
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

        <!-- Chips de pacientes -->
        <div v-if="pacientesStore.pacientes.length > 0" class="campo">
          <label>Paciente registrado</label>
          <div class="chips-pac">
            <button
              v-for="p in pacientesStore.pacientes"
              :key="p._key"
              class="chip-paciente"
              :class="{ 'chip-selected': form.nome === p.nome && form.leito === (p.leito || '') }"
              @click="selecionarPaciente(p)"
            >{{ p.leito ? p.leito + ' · ' : '' }}{{ p.nome }}</button>
          </div>
        </div>

        <div class="campo">
          <label>Nome do paciente <span class="obrigatorio">*</span></label>
          <input type="text" v-model="form.nome" placeholder="Ex: João da Silva">
        </div>

        <div class="campo">
          <label>Leito <span style="font-size:0.75rem;font-weight:400;color:var(--text-muted)">(opcional)</span></label>
          <input type="text" v-model="form.leito" placeholder="Ex: 4B">
        </div>

        <p v-if="erro" class="erro-msg">{{ erro }}</p>
        <div class="bloco-nav">
          <button class="btn btn-secondary" style="width:auto;padding:12px 20px" @click="limparBloco">Limpar</button>
          <button class="btn btn-primary" @click="avancar">Próximo →</button>
        </div>
      </div>

      <!-- ═══ BLOCO 2 — Destino e Condição ═══ -->
      <div v-if="!gerado && passo === 2">
        <h2 class="bloco-titulo">Destino e Condição</h2>

        <div class="campo">
          <label>Destino <span class="obrigatorio">*</span></label>
          <div class="chips-destino">
            <button
              v-for="d in destinosRapidos"
              :key="d"
              class="chip-destino"
              :class="{ 'chip-selected': form.destino === d }"
              @click="selecionarDestino(d)"
            >{{ d }}</button>
          </div>
          <input
            type="text"
            v-model="form.destino"
            placeholder="Ou digite o destino manualmente"
            style="margin-top:4px"
          >
        </div>

        <div class="campo">
          <label>Motivo do encaminhamento <span class="obrigatorio">*</span></label>
          <input type="text" v-model="form.motivo" placeholder="Ex: realização de exame, procedimento cirúrgico">
        </div>

        <div class="campo">
          <label>Condição clínica <span class="obrigatorio">*</span></label>
          <div class="radio-group vertical">
            <label class="radio-btn" v-for="op in ['Estável', 'Grave', 'Instável']" :key="op">
              <input type="radio" v-model="form.condicao" :value="op">
              <span>{{ op }}</span>
            </label>
          </div>
        </div>

        <p v-if="erro" class="erro-msg">{{ erro }}</p>
        <div class="bloco-nav">
          <button class="btn btn-secondary" style="width:auto;padding:12px 16px" @click="passo = 1">← Voltar</button>
          <button class="btn btn-secondary" style="width:auto;padding:12px 16px" @click="limparBloco">Limpar</button>
          <button class="btn btn-primary" @click="avancar">Próximo →</button>
        </div>
      </div>

      <!-- ═══ BLOCO 3 — Dispositivos e Transporte ═══ -->
      <div v-if="!gerado && passo === 3">
        <h2 class="bloco-titulo">Dispositivos e Transporte</h2>

        <div class="campo">
          <label>Dispositivos em uso</label>
          <div style="display:flex;flex-direction:column;gap:8px;margin-top:4px">
            <label
              v-for="disp in dispositivosOpcoes"
              :key="disp"
              class="checkbox-label"
            >
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
          <label>Acompanhante <span class="obrigatorio">*</span></label>
          <div class="radio-group vertical">
            <label class="radio-btn" v-for="op in acompOpcoes" :key="op">
              <input type="radio" v-model="form.acompanhante" :value="op">
              <span>{{ op }}</span>
            </label>
          </div>
        </div>

        <div class="campo">
          <label>Recebido por <span style="font-size:0.75rem;font-weight:400;color:var(--text-muted)">(opcional)</span></label>
          <input type="text" v-model="form.recebidoPor" placeholder="Ex: Enf. Maria, Dr. Carlos">
        </div>

        <div class="campo">
          <label>Observações <span style="font-size:0.75rem;font-weight:400;color:var(--text-muted)">(opcional)</span></label>
          <textarea v-model="form.observacoes" rows="3" placeholder="Ex: paciente agitado, necessitou de sedação para transporte"></textarea>
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
          <button
            class="btn btn-secondary"
            style="flex:1"
            @click="salvar"
            :disabled="salvando"
          >{{ salvando ? 'Salvando...' : 'Salvar no histórico' }}</button>
          <button class="btn btn-secondary" style="flex:1" @click="novaAnotacao">Nova anotação</button>
        </div>

        <button class="btn btn-secondary" style="width:100%;margin-top:10px" @click="gerado = false; passo = 3">← Editar</button>
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

const router = useRouter()
const anotacoesStore = useAnotacoesStore()
const pacientesStore = usePacientesStore()
const { showToast } = useToast()

// ── Estado ──
const passo = ref(1)
const gerado = ref(false)
const textoGerado = ref('')
const erro = ref('')
const salvando = ref(false)
const copiado = ref(false)

// ── Formulário ──
const form = reactive({
  horario: '',
  nome: '',
  leito: '',
  destino: '',
  motivo: '',
  condicao: '',
  dispositivos: [],
  acompanhante: '',
  recebidoPor: '',
  observacoes: '',
})

// ── Rascunho ──
const { temRascunho, restaurarRascunho, descartarRascunho, iniciarRascunho } =
  useRascunho('rascunho_encaminhamento', form, () => !!(form.horario || form.nome || form.destino))

// ── Opções ──
const destinosRapidos = ['UTI', 'Centro Cirúrgico', 'Raio-X', 'Tomografia', 'Endoscopia', 'Hemodinâmica']
const dispositivosOpcoes = ['SVD', 'AVP', 'CVC', 'SNG', 'TOT', 'Cateter nasal O2', 'Dreno torácico', 'Nenhum']
const acompOpcoes = ['Técnico de enfermagem', 'Enfermeiro', 'Médico', 'Sem acompanhante']

// ── Lifecycle ──
onMounted(() => {
  pacientesStore.iniciar()
  iniciarRascunho()
})

// ── Helpers ──
function selecionarPaciente(p) {
  form.nome = p.nome
  form.leito = p.leito || ''
}

function selecionarDestino(d) {
  form.destino = form.destino === d ? '' : d
}

function toggleDispositivo(disp) {
  if (disp === 'Nenhum') {
    if (form.dispositivos.includes('Nenhum')) {
      form.dispositivos = []
    } else {
      form.dispositivos = ['Nenhum']
    }
    return
  }
  // Se selecionar outro, remove "Nenhum"
  const idx = form.dispositivos.indexOf(disp)
  if (idx === -1) {
    form.dispositivos = form.dispositivos.filter(d => d !== 'Nenhum').concat(disp)
  } else {
    form.dispositivos = form.dispositivos.filter(d => d !== disp)
  }
}

// ── Navegação ──
function voltarOuSair() {
  if (passo.value > 1 && !gerado.value) {
    passo.value--
  } else {
    router.back()
  }
}

function limparBloco() {
  erro.value = ''
  if (passo.value === 1) {
    form.horario = ''
    form.nome = ''
    form.leito = ''
  } else if (passo.value === 2) {
    form.destino = ''
    form.motivo = ''
    form.condicao = ''
  } else if (passo.value === 3) {
    form.dispositivos = []
    form.acompanhante = ''
    form.recebidoPor = ''
    form.observacoes = ''
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
    if (!form.destino.trim() || !form.motivo.trim() || !form.condicao) {
      erro.value = 'Preencha destino, motivo e condição clínica.'
      return
    }
  }
  passo.value++
}

// ── Gerar texto ──
function gerar() {
  erro.value = ''
  if (!form.acompanhante) {
    erro.value = 'Selecione o acompanhante.'
    return
  }

  // Monta identificação
  let texto = `Às ${form.horario}h, realizado encaminhamento de paciente ${form.nome}`
  if (form.leito) texto += `, leito ${form.leito}`
  texto += `. Encaminhado para ${form.destino}.`
  texto += ` Motivo: ${form.motivo}.`
  texto += ` Condição clínica: ${form.condicao}.`

  // Dispositivos
  const disps = form.dispositivos.filter(d => d !== 'Nenhum')
  if (form.dispositivos.includes('Nenhum') || disps.length === 0) {
    texto += ' Sem dispositivos.'
  } else {
    texto += ` Dispositivos: ${disps.join(', ')}.`
  }

  // Acompanhante
  texto += ` Acompanhado por ${form.acompanhante}`
  if (form.recebidoPor.trim()) {
    texto += `; recebido por ${form.recebidoPor.trim()}`
  }
  texto += '.'

  // Observações
  if (form.observacoes.trim()) {
    texto += ` Observações: ${form.observacoes.trim()}.`
  }

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
  } catch {
    showToast('Erro ao copiar')
  }
}

// ── Salvar ──
async function salvar() {
  salvando.value = true
  try {
    await anotacoesStore.salvar({
      tipo: 'encaminhamento',
      texto: textoGerado.value,
      nome: form.nome,
      leito: form.leito,
    })
    descartarRascunho()
    showToast('Salvo no histórico!')
  } catch {
    showToast('Erro ao salvar')
  } finally {
    salvando.value = false
  }
}

// ── Nova anotação ──
function novaAnotacao() {
  Object.assign(form, {
    horario: '',
    nome: '',
    leito: '',
    destino: '',
    motivo: '',
    condicao: '',
    dispositivos: [],
    acompanhante: '',
    recebidoPor: '',
    observacoes: '',
  })
  textoGerado.value = ''
  gerado.value = false
  passo.value = 1
  erro.value = ''
  copiado.value = false
  descartarRascunho()
}
</script>

<style scoped>
.btn-icon {
  background: none;
  border: none;
  color: var(--text-dim);
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
  display: flex;
  align-items: center;
}
.btn-icon:active { background: var(--bg-hover); }

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
}
.btn-home-logo:active { background: var(--bg-hover); border-radius: 8px; }

.progress-wrap {
  height: 4px;
  background: var(--border);
  position: relative;
}
.progress-fill {
  height: 100%;
  background: var(--blue);
  transition: width 0.3s;
}
.progress-label {
  position: absolute;
  right: 16px;
  top: 6px;
  font-size: 0.7rem;
  color: var(--text-muted);
}

.bloco-titulo {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}

.chips-pac {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 4px;
}
.chip-paciente {
  padding: 6px 12px;
  border-radius: 20px;
  border: 1px solid var(--border);
  background: var(--bg-card);
  color: var(--text-dim);
  font-size: 0.85rem;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}
.chip-paciente.chip-selected {
  background: var(--blue);
  border-color: var(--blue);
  color: #fff;
}

.chips-destino {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}
.chip-destino {
  padding: 6px 12px;
  border-radius: 20px;
  border: 1px solid var(--border);
  background: var(--bg-card);
  color: var(--text-dim);
  font-size: 0.85rem;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}
.chip-destino.chip-selected {
  background: var(--blue);
  border-color: var(--blue);
  color: #fff;
}

.bloco-nav {
  display: flex;
  gap: 10px;
  margin-top: 12px;
  align-items: center;
}
.bloco-nav .btn-primary { flex: 1; }

.resultado-box {
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px;
  font-size: 0.9rem;
  line-height: 1.7;
  color: var(--text);
  white-space: pre-wrap;
  font-family: inherit;
  margin-bottom: 16px;
}

.btn-copy {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text-dim);
  font-family: inherit;
  font-size: 0.95rem;
  cursor: pointer;
  margin-bottom: 8px;
}
.btn-copy:active { background: var(--bg-hover); }

.nav-row {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}

.erro-msg {
  color: var(--danger);
  font-size: 0.82rem;
  margin-top: 6px;
}
</style>
