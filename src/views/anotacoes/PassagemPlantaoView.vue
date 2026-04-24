<template>
  <div class="screen passagem-screen">
    <header class="app-header passagem-header">
      <button class="btn-icon" @click="voltarOuSair">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>
      <button class="btn-home-logo" @click="router.push({ name: 'dashboard' })">
        <img src="/icons/icon-512.png" width="22" height="22" alt="Plantão" style="border-radius:5px;display:block" />
        <span>Plantão</span>
      </button>
      <div style="width:34px"/>
    </header>

    <div v-if="!gerado" class="progress-wrap passagem-progress">
      <div class="progress-fill" :style="{ width: (passo / 2 * 100) + '%' }"></div>
      <span class="progress-label">Bloco {{ passo }} de 2</span>
    </div>

    <main class="container passagem-page">

      <!-- Banner rascunho -->
      <div v-if="temRascunho && !gerado" class="rascunho-banner">
        <div class="rascunho-info"><span>📝</span><span>Você tem um rascunho salvo</span></div>
        <div class="rascunho-acoes">
          <button class="btn btn-primary btn-sm" @click="restaurarRascunho">Continuar</button>
          <button class="btn btn-secondary btn-sm" @click="descartarRascunho">Descartar</button>
        </div>
      </div>

      <!-- ═══ BLOCO 1 — Identificação ═══ -->
      <section v-if="!gerado && pacientesStore.pacientes.length > 0" class="paciente-atalho">
        <label>Paciente registrado</label>
        <div class="chips-scroll">
          <button
            v-for="p in pacientesStore.pacientes"
            :key="p._key"
            class="chip"
            :class="{ 'chip-on': form.nome === p.nome && form.leito === (p.leito || '') }"
            @click="selecionarPaciente(p)"
          >{{ p.leito ? p.leito + ' Â· ' : '' }}{{ p.nome }}</button>
        </div>
      </section>

      <section v-if="!gerado" class="module-hero">
        <div class="module-hero-icon">
          <img :src="iconPassagem" alt="Passagem de plantão" />
        </div>
        <div class="module-hero-copy">
          <h1>Passagem de plantão</h1>
          <p>Organize o estado do paciente para entregar o cuidado.</p>
        </div>
      </section>

      <div v-if="!gerado && passo === 1" class="passagem-card">
        <h2 class="bloco-titulo">Identificação</h2>

        <div class="campo">
          <label>Horário <span class="obrigatorio">*</span></label>
          <input type="time" v-model="form.horario">
        </div>

        <div class="campo">
          <label>Refeição <span class="opc">(opcional)</span></label>
          <div class="chips-wrap">
            <button
              v-for="r in refeicaoOpcoes"
              :key="r"
              class="chip chip-sm"
              :class="{ 'chip-on': form.refeicao === r }"
              @click="toggleRefeicao(r)"
            >{{ r }}</button>
          </div>
        </div>

        <p v-if="erro" class="erro-msg">{{ erro }}</p>
        <div class="bloco-nav">
          <button class="btn btn-tertiary btn-limpar" @click="limparBloco">Limpar</button>
          <button class="btn btn-primary" @click="avancar">Próximo →</button>
        </div>
      </div>

      <!-- ═══ BLOCO 2 — Condições ═══ -->
      <div v-if="!gerado && passo === 2" class="passagem-card passagem-card-condicoes">
        <h2 class="bloco-titulo">Condições</h2>

        <!-- Cama -->
        <div class="campo">
          <label>Posição da cama</label>
          <div class="radio-group horizontal">
            <label v-for="op in camaOpcoes" :key="op" class="radio-btn" :class="{ 'radio-on': form.cama === op && !outroAtivo.cama }">
              <input type="radio" :value="op" :checked="form.cama === op && !outroAtivo.cama" @click.prevent="toggleOpcao('cama', op)">
              <span>{{ cap(op) }}</span>
            </label>
            <label class="radio-btn" :class="{ 'radio-on': outroAtivo.cama }">
              <input type="radio" :checked="outroAtivo.cama" @click.prevent="toggleOutro('cama')">
              <span>Outro</span>
            </label>
          </div>
          <input v-if="outroAtivo.cama" class="campo-inline" style="margin-top:8px" type="text" :value="outroTexto.cama || ''" @input="atualizarOutro('cama', $event.target.value)" placeholder="Descreva a posição...">
        </div>

        <!-- Rodas -->
        <div class="campo">
          <label>Rodas</label>
          <div class="radio-group horizontal">
            <label v-for="op in rodasOpcoes" :key="op" class="radio-btn" :class="{ 'radio-on': form.rodas === op && !outroAtivo.rodas }">
              <input type="radio" :value="op" :checked="form.rodas === op && !outroAtivo.rodas" @click.prevent="toggleOpcao('rodas', op)">
              <span>{{ cap(op) }}</span>
            </label>
            <label class="radio-btn" :class="{ 'radio-on': outroAtivo.rodas }">
              <input type="radio" :checked="outroAtivo.rodas" @click.prevent="toggleOutro('rodas')">
              <span>Outro</span>
            </label>
          </div>
          <input v-if="outroAtivo.rodas" class="campo-inline" style="margin-top:8px" type="text" :value="outroTexto.rodas || ''" @input="atualizarOutro('rodas', $event.target.value)" placeholder="Descreva...">
        </div>

        <!-- Grades -->
        <div class="campo">
          <label>Grades</label>
          <div class="radio-group vertical">
            <label v-for="op in gradesOpcoes" :key="op" class="radio-btn" :class="{ 'radio-on': form.grades === op && !outroAtivo.grades }">
              <input type="radio" :value="op" :checked="form.grades === op && !outroAtivo.grades" @click.prevent="toggleOpcao('grades', op)">
              <span>{{ cap(op) }}</span>
            </label>
            <label class="radio-btn" :class="{ 'radio-on': outroAtivo.grades }">
              <input type="radio" :checked="outroAtivo.grades" @click.prevent="toggleOutro('grades')">
              <span>Outro</span>
            </label>
          </div>
          <input v-if="outroAtivo.grades" class="campo-inline" style="margin-top:8px" type="text" :value="outroTexto.grades || ''" @input="atualizarOutro('grades', $event.target.value)" placeholder="Descreva a posição das grades...">
        </div>

        <!-- Decúbito -->
        <div class="campo">
          <label>Decúbito</label>
          <div class="radio-group vertical">
            <label v-for="op in decubitoOpcoes" :key="op" class="radio-btn" :class="{ 'radio-on': form.decubito === op && !outroAtivo.decubito }">
              <input type="radio" :value="op" :checked="form.decubito === op && !outroAtivo.decubito" @click.prevent="toggleOpcao('decubito', op)">
              <span>{{ cap(op) }}</span>
            </label>
            <label class="radio-btn" :class="{ 'radio-on': outroAtivo.decubito }">
              <input type="radio" :checked="outroAtivo.decubito" @click.prevent="toggleOutro('decubito')">
              <span>Outro</span>
            </label>
          </div>
          <input v-if="outroAtivo.decubito" class="campo-inline" style="margin-top:8px" type="text" :value="outroTexto.decubito || ''" @input="atualizarOutro('decubito', $event.target.value)" placeholder="Descreva o decúbito...">
        </div>

        <!-- Débito urinário -->
        <div class="campo">
          <label class="checkbox-label" :class="{ checked: form.svd }">
            <input type="checkbox" v-model="form.svd">
            <span>Débito urinário</span>
          </label>
          <div v-if="form.svd" style="margin-top:8px;display:flex;flex-direction:column;gap:8px;padding-left:8px">
            <input type="text" v-model="form.svdDispositivo" placeholder="Dispositivo (ex: SVD, nefrostomia D)">
            <input type="text" v-model="form.svdDebito" placeholder="Débito (ml)">
          </div>
        </div>

        <!-- Dispositivos -->
        <div class="campo">
          <label>Dispositivos <span class="opc">(opcional)</span></label>
          <div class="disp-lista" v-if="form.dispositivos.length > 0">
            <div class="disp-item"
              v-for="(d, i) in form.dispositivos" :key="i"
              draggable="true"
              @dragstart="onDragStart(i)"
              @dragover.prevent="onDragOver(i)"
              @drop.prevent="onDrop(i)"
              :class="{ 'drag-over': dragOverIdx === i && dragIdx !== i }">
              <span class="disp-texto">{{ d }}</span>
              <div class="disp-acoes">
                <button class="btn-icon-sm" @click="moverDisp(i, -1)" :disabled="i === 0">▲</button>
                <button class="btn-icon-sm" @click="moverDisp(i, 1)" :disabled="i === form.dispositivos.length - 1">▼</button>
                <button class="btn-icon-sm btn-danger-sm" @click="removerDisp(i)">✕</button>
              </div>
            </div>
          </div>
          <div class="disp-grid">
            <button class="btn-disp" v-for="tipo in tiposDisp" :key="tipo" @click="abrirModal(tipo)">+ {{ tipo }}</button>
          </div>
        </div>

        <!-- Observações -->
        <div class="campo">
          <label>Observações <span class="opc">(opcional)</span></label>
          <input type="text" v-model="form.obs" placeholder="Observações adicionais...">
        </div>

        <p v-if="erro" class="erro-msg">{{ erro }}</p>
        <div class="bloco-nav">
          <button class="btn btn-secondary" style="width:auto;padding:12px 16px" @click="passo = 1">← Voltar</button>
          <button class="btn btn-tertiary btn-limpar" @click="limparBloco">Limpar</button>
          <button class="btn btn-primary btn-generate" @click="gerar"><IconGenerateNote />Gerar anotação</button>
        </div>
      </div>

      <!-- ═══ RESULTADO ═══ -->
      <ResultadoAnotacao
        v-if="gerado"
        :icon="iconPassagem"
        v-model:texto="textoGerado"
        v-model:nomePaciente="form.nome"
        v-model:leitoPaciente="form.leito"
        :salvando="salvando"
        label-nova="Nova passagem"
        @copiar="copiar"
        @salvar="salvar"
        @compartilhar="compartilhar"
        @nova="novaAnotacao"
        @editar="gerado = false; passo = 2"
      />



    </main>

    <!-- ═══ MODAL — Dispositivos ═══ -->
    <div v-if="modal.aberto" class="modal-overlay" @click.self="fecharModal">
      <div class="modal-box">
        <div class="modal-header">
          <h3>{{ modal.tipo }}</h3>
          <button class="btn-icon" @click="fecharModal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <component :is="modalComponentMap[modal.tipo] || ModalOutros" :d="modal.d" :locaisCentral="locaisCentral" :pulseiraOpcoes="pulseiraOpcoes" />
        </div>
        <p v-if="modal.erro" class="erro-msg" style="padding:0 16px 8px">{{ modal.erro }}</p>
        <div class="modal-footer">
          <button class="btn btn-secondary" style="flex:1" @click="fecharModal">Cancelar</button>
          <button class="btn btn-primary" style="flex:2" @click="confirmarDisp">Adicionar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAnotacoesStore } from '../../stores/anotacoes.js'
import { usePacientesStore } from '../../stores/pacientes.js'
import { useAuthStore } from '../../stores/auth.js'
import { useRascunho } from '../../composables/useRascunho.js'
import { useToast } from '../../composables/useToast.js'
import { useCopia } from '../../composables/useCopia.js'
import { useDispositivos } from '../../composables/useDispositivos.js'
import IconGenerateNote from '../../components/icons/IconGenerateNote.vue'
import ResultadoAnotacao from '../../components/ResultadoAnotacao.vue'
import iconPassagem from '../../assets/dashboard-icons-png/passagem.png'
import ModalAVP from '../../components/modais/ModalAVP.vue'
import ModalCVC from '../../components/modais/ModalCVC.vue'
import ModalPICC from '../../components/modais/ModalPICC.vue'
import ModalPermcath from '../../components/modais/ModalPermcath.vue'
import ModalShilley from '../../components/modais/ModalShilley.vue'
import ModalSNE from '../../components/modais/ModalSNE.vue'
import ModalSNG from '../../components/modais/ModalSNG.vue'
import ModalPulseira from '../../components/modais/ModalPulseira.vue'
import ModalMonitor from '../../components/modais/ModalMonitor.vue'
import ModalDreno from '../../components/modais/ModalDreno.vue'
import ModalCurativo from '../../components/modais/ModalCurativo.vue'
import ModalOutros from '../../components/modais/ModalOutros.vue'

const modalComponentMap = {
  AVP: ModalAVP, CVC: ModalCVC, PICC: ModalPICC,
  Permcath: ModalPermcath, Shilley: ModalShilley,
  SNE: ModalSNE, SNG: ModalSNG,
  Pulseira: ModalPulseira, Monitor: ModalMonitor,
  Dreno: ModalDreno, Curativo: ModalCurativo,
}

const router         = useRouter()
const anotacoesStore = useAnotacoesStore()
const pacientesStore = usePacientesStore()
const authStore      = useAuthStore()
const { showToast }  = useToast()
const { copiado, copiar: _copiar } = useCopia()
// ── Estado ──
const passo       = ref(1)
const gerado      = ref(false)
const textoGerado = ref('')
const erro        = ref('')
const salvando    = ref(false)

// ── Formulário ──
const form = reactive({
  horario:        '',
  nome:           '',
  leito:          '',
  refeicao:       '',
  cama:           'baixa',
  rodas:          'travadas',
  grades:         'parcialmente elevadas',
  decubito:       'parcialmente elevado',
  svd:            false,
  svdDispositivo: 'SVD',
  svdDebito:      '',
  dispositivos:   [],
  obs:            '',
})

// ── Dispositivos (composable compartilhado) ──
const {
  dragIdx, dragOverIdx, modal,
  locaisCentral, tiposDisp, pulseiraOpcoes,
  abrirModal, fecharModal, confirmarDisp,
  moverDisp, removerDisp,
  onDragStart, onDragOver, onDrop
} = useDispositivos(form.dispositivos)

// ── Rascunho ──
const { temRascunho, restaurarRascunho, descartarRascunho, iniciarRascunho } =
  useRascunho('rascunho_passagem', form, () => !!(form.horario || form.nome))

// ── Opções ──
const refeicaoOpcoes = ['café da manhã', 'almoço', 'lanche', 'janta', 'ceia']
const camaOpcoes     = ['baixa', 'média', 'alta']
const rodasOpcoes    = ['travadas', 'soltas']
const gradesOpcoes   = ['totalmente elevadas', 'parcialmente elevadas', 'abaixadas']
const decubitoOpcoes = ['parcialmente elevado', 'dorsal', 'lateral direito', 'lateral esquerdo']

// ── Campos "Outro" (mesmo padrão da AnotacaoInicial) ──
const outroAtivo = reactive({})
const outroTexto = reactive({})

function selecionarOutro(campo) {
  outroAtivo[campo] = true
  form[campo] = outroTexto[campo] || ''
}

function toggleOpcao(campo, valor) {
  if (form[campo] === valor && !outroAtivo[campo]) {
    form[campo] = ''
    return
  }
  outroAtivo[campo] = false
  form[campo] = valor
}

function toggleOutro(campo) {
  if (outroAtivo[campo]) {
    outroAtivo[campo] = false
    form[campo] = ''
    return
  }
  selecionarOutro(campo)
}

function atualizarOutro(campo, texto) {
  outroTexto[campo] = texto
  form[campo] = texto
}

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)

// ── Lifecycle ──
onMounted(() => {
  window.scrollTo({ top: 0 })
  pacientesStore.iniciar()
  iniciarRascunho()
})

// ── Helpers ──
function selecionarPaciente(p) {
  if (form.nome === p.nome && form.leito === (p.leito || '')) {
    form.nome = ''
    form.leito = ''
    return
  }
  form.nome  = p.nome
  form.leito = p.leito || ''
}

function toggleRefeicao(r) {
  form.refeicao = form.refeicao === r ? '' : r
}


function formatHora(h) {
  return h ? h.replace(':', 'h') : ''
}

function gradesDecubito() {
  if (!form.grades && !form.decubito) return ''
  if (!form.grades) return 'decúbito ' + form.decubito
  if (!form.decubito) return 'grades ' + form.grades
  if (form.grades === 'parcialmente elevadas' && form.decubito === 'parcialmente elevado') {
    return 'grades e decúbito parcialmente elevados'
  }
  return 'grades ' + form.grades + ' e decúbito ' + form.decubito
}

function montarCondicoes() {
  return [
    form.cama ? 'cama ' + form.cama : '',
    form.rodas ? 'rodas ' + form.rodas : '',
    gradesDecubito(),
  ].filter(Boolean)
}

// ── Navegação ──
function voltarOuSair() {
  if (passo.value > 1 && !gerado.value) {
    passo.value--
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }
  router.push({ name: 'dashboard' })
}

function limparBloco() {
  erro.value = ''
  if (passo.value === 1) {
    form.horario = ''; form.refeicao = ''
  } else {
    form.cama = 'baixa'; form.rodas = 'travadas'
    form.grades = 'parcialmente elevadas'; form.decubito = 'parcialmente elevado'
    ;['cama','rodas','grades','decubito'].forEach(c => { outroAtivo[c] = false; outroTexto[c] = '' })
    form.svd = false; form.svdDispositivo = 'SVD'; form.svdDebito = ''
    form.dispositivos.splice(0)
    form.obs = ''
  }
}

function avancar() {
  erro.value = ''
  if (!form.horario) {
    erro.value = 'Informe o horário.'
    return
  }
  passo.value++
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// ── Gerar texto ──
function gerar() {
  erro.value = ''

  const hora = formatHora(form.horario)

  const refeicaoPart = form.refeicao
    ? 'Ofertado ' + form.refeicao + '. '
    : ''

  const condicoes = montarCondicoes()
  let texto = `${hora} – ${refeicaoPart}Paciente em seu leito.`
  if (condicoes.length > 0) {
    texto += ` Mantenho ${condicoes.join(', ')}, campainha próxima e oriento a chamar sempre que necessário.`
  } else {
    texto += ' Campainha próxima e oriento a chamar sempre que necessário.'
  }

  if (form.svd) {
    const disp = form.svdDispositivo.trim() || 'SVD'
    texto += ` Desprezado débito de ${disp} no total de ${form.svdDebito.trim()}ml no dia de hoje, atualizado em balanço hídrico.`
  }

  if (form.dispositivos.length > 0) {
    texto += ' Em uso de ' + form.dispositivos.join('; ') + '.'
  }

  const obs = form.obs.trim()
  if (obs) {
    const lastChar = obs.slice(-1)
    if (lastChar === '.' || lastChar === '!' || lastChar === '?') {
      texto += ` ${obs}`
    } else {
      texto += ` ${obs}.`
    }
  }

  textoGerado.value = texto
  gerado.value = true
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// ── Copiar ──
async function copiar() {
  const ok = await _copiar(textoGerado.value)
  if (ok) showToast('Texto copiado!')
  else showToast('Erro ao copiar')
}

function compartilhar() {
  const texto = textoGerado.value
  if (navigator.share) {
    navigator.share({ text: texto }).catch(() => {})
  } else {
    const url = `https://wa.me/?text=${encodeURIComponent(texto)}`
    window.open(url, '_blank')
  }
}


// ── Salvar ──
async function salvar() {
  salvando.value = true
  try {
    const r = await anotacoesStore.salvar({
      tipo:  'passagem',
      texto: textoGerado.value,
      nome:  form.nome,
      leito: form.leito,
    })
    descartarRascunho()
    if (r?.modo === 'offline') showToast('Salvo offline - sincroniza automatico')
    else showToast('Salvo no histórico!')
  } catch { showToast('Erro ao salvar') }
  finally { salvando.value = false }
}

// ── Nova anotação ──
function novaAnotacao() {
  Object.assign(form, {
    horario:        '',
    nome:           '',
    leito:          '',
    refeicao:       '',
    cama:           'baixa',
    rodas:          'travadas',
    grades:         'parcialmente elevadas',
    decubito:       'parcialmente elevado',
    svd:            false,
    svdDispositivo: 'SVD',
    svdDebito:      '',
    obs:            '',
  })
  form.dispositivos.splice(0)
  textoGerado.value = ''; gerado.value = false; passo.value = 1
  erro.value = ''; copiado.value = false
  ;['cama','rodas','grades','decubito'].forEach(c => { outroAtivo[c] = false; outroTexto[c] = '' })
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

.radio-group { display: flex; gap: 8px; }
.radio-group.horizontal { flex-direction: row; flex-wrap: wrap; }
.radio-group.vertical { flex-direction: column; }

.checkbox-label {
  display: flex; align-items: center; gap: 8px;
  font-size: 0.9rem; color: var(--text-dim); cursor: pointer;
}
.checkbox-label input[type="checkbox"] { cursor: pointer; }

.bloco-nav { display: flex; gap: 10px; margin-top: 12px; align-items: center; }
.bloco-nav .btn-primary { flex: 1; }
.btn-limpar {
  width: auto;
  min-width: 96px;
  padding: 12px 16px;
}

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
.erro-msg { color: var(--danger); font-size: 0.82rem; margin-top: 6px; }

.btn-add-inf {
  background: none; border: 1px dashed var(--border);
  border-radius: var(--radius); color: var(--blue);
  font-size: 0.85rem; font-family: inherit;
  padding: 8px 14px; cursor: pointer; width: 100%;
  transition: all 0.15s;
}
.btn-add-inf:active { background: var(--bg-hover); }
.btn-remove-inf {
  background: none; border: none; color: var(--danger);
  font-size: 0.78rem; font-family: inherit;
  cursor: pointer; padding: 2px 6px; border-radius: 4px;
}
.btn-remove-inf:active { background: rgba(220,38,38,0.1); }

.campo-inline {
  background: var(--bg-input); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 10px 12px;
  font-size: 0.9rem; color: var(--text); font-family: inherit;
  width: 100%; box-sizing: border-box; outline: none;
}

/* Dispositivos */
.disp-lista { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; }
.disp-item {
  display: flex; align-items: center; justify-content: space-between;
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 10px 12px; gap: 8px;
}
.disp-item.drag-over { border-color: var(--blue); }
.disp-texto { flex: 1; font-size: 0.88rem; color: var(--text-dim); }
.disp-acoes { display: flex; gap: 4px; }
.btn-icon-sm {
  background: none; border: none; color: var(--text-muted);
  font-size: 0.8rem; cursor: pointer; padding: 2px 6px; border-radius: 4px;
}
.btn-icon-sm:disabled { opacity: 0.3; cursor: not-allowed; }
.btn-danger-sm { color: var(--danger); }
.disp-grid { display: flex; flex-wrap: wrap; gap: 6px; }
.btn-disp {
  padding: 8px 12px; border-radius: var(--radius);
  border: 1px dashed var(--border); background: none;
  color: var(--blue); font-size: 0.82rem; font-family: inherit;
  cursor: pointer; transition: all 0.15s;
}
.btn-disp:active { background: var(--bg-hover); }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.6);
  display: flex; align-items: flex-end; justify-content: center;
  z-index: 1000; padding: 16px;
}
.modal-box {
  background: var(--bg); border-radius: 16px 16px 0 0;
  width: 100%; max-width: 480px; max-height: 85vh;
  overflow-y: auto; padding-bottom: 16px;
}
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px; border-bottom: 1px solid var(--border);
  position: sticky; top: 0; background: var(--bg); z-index: 1;
}
.modal-header h3 { font-size: 1rem; font-weight: 700; color: var(--text); margin: 0; }
.modal-body { padding: 16px; }
.modal-footer {
  display: flex; gap: 10px; padding: 0 16px;
  position: sticky; bottom: 0; background: var(--bg); padding-top: 12px;
}

.passagem-screen {
  min-height: 100vh;
  background:
    radial-gradient(circle at 14% 0%, rgba(42, 132, 255, 0.14), transparent 30%),
    linear-gradient(180deg, #071426 0%, #081425 42%, #07111f 100%);
}

.passagem-header {
  background: rgba(8, 20, 37, 0.92);
  border-bottom: 1px solid rgba(71, 119, 194, 0.18);
  backdrop-filter: blur(14px);
}

.passagem-page {
  padding-top: 18px;
  padding-bottom: 42px;
}

.passagem-progress {
  height: 6px;
  background: rgba(50, 76, 118, 0.5);
}

.passagem-progress .progress-fill {
  background: linear-gradient(90deg, #2f8cff, #51b5ff);
  box-shadow: 0 0 22px rgba(57, 143, 255, 0.44);
}

.passagem-progress .progress-label {
  top: 10px;
  color: #7f95bb;
  font-weight: 700;
}

.module-hero {
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 18px;
  padding: 20px;
  border: 1px solid rgba(80, 142, 232, 0.36);
  border-radius: 24px;
  background:
    radial-gradient(circle at top left, rgba(48, 134, 255, 0.2), transparent 42%),
    linear-gradient(180deg, rgba(17, 34, 65, 0.98), rgba(12, 26, 50, 0.98));
  box-shadow: 0 20px 38px rgba(3, 10, 22, 0.26);
  overflow: hidden;
}

.paciente-atalho {
  margin-bottom: 14px;
}

.paciente-atalho label {
  display: block;
  color: #9fb4d9;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.paciente-atalho .chips-scroll {
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
}

.module-hero-icon {
  width: 68px;
  height: 68px;
  border-radius: 22px;
  border: 1px solid rgba(117, 176, 255, 0.4);
  background: radial-gradient(circle at top, rgba(84, 157, 255, 0.36), rgba(31, 88, 174, 0.48));
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.module-hero-icon img {
  width: 48px;
  height: 48px;
  object-fit: contain;
}

.module-hero-copy h1 {
  margin: 0;
  font-size: 1.72rem;
  line-height: 1.05;
  color: #f5f8ff;
  font-weight: 850;
}

.module-hero-copy p {
  margin: 8px 0 0;
  color: #9fb0d2;
  font-size: 0.96rem;
  line-height: 1.35;
}

.passagem-card {
  padding: 18px;
  border-radius: 22px;
  border: 1px solid rgba(54, 86, 137, 0.55);
  background:
    radial-gradient(circle at top left, rgba(47, 120, 225, 0.11), transparent 34%),
    linear-gradient(180deg, rgba(16, 32, 60, 0.97), rgba(12, 25, 48, 0.99));
  box-shadow: 0 16px 34px rgba(2, 8, 18, 0.2);
}

.passagem-card + .passagem-card {
  margin-top: 16px;
}

.passagem-card .bloco-titulo {
  margin: 0 0 18px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(77, 110, 165, 0.35);
  color: #f3f7ff;
  font-size: 1.28rem;
  letter-spacing: 0;
}

.passagem-card .campo {
  margin-bottom: 16px;
}

.passagem-card label:not(.radio-btn):not(.checkbox-label) {
  color: #9fb4d9;
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.passagem-card input[type="text"],
.passagem-card input[type="time"],
.passagem-card .campo-inline {
  min-height: 52px;
  background: rgba(18, 33, 60, 0.96);
  border: 1px solid rgba(66, 98, 150, 0.62);
  border-radius: 15px;
  color: #eef4ff;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
}

.passagem-card input:focus,
.passagem-card .campo-inline:focus {
  border-color: rgba(89, 157, 255, 0.82);
  box-shadow: 0 0 0 3px rgba(47, 140, 255, 0.14);
  background: rgba(20, 38, 70, 0.98);
}

.passagem-card input::placeholder {
  color: rgba(169, 184, 213, 0.62);
}

.chips-wrap {
  gap: 9px;
}

.chip,
.btn-disp {
  min-height: 38px;
  border-color: rgba(75, 113, 174, 0.58);
  background: rgba(18, 35, 66, 0.92);
  color: #aabbe0;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
}

.chip-on {
  border-color: rgba(94, 166, 255, 0.9);
  background: linear-gradient(135deg, #236fe1, #2d9cff);
  color: #fff;
  box-shadow: 0 10px 24px rgba(32, 116, 225, 0.24);
}

.radio-btn {
  min-height: auto;
  border: 0;
  background: transparent;
  color: inherit;
  padding: 0;
}

.radio-btn span {
  min-height: 46px;
  border-radius: 15px;
  border: 1px solid rgba(62, 94, 148, 0.55);
  background: rgba(17, 33, 62, 0.82);
  color: #b9c8e6;
  padding: 10px 14px;
}

.radio-btn input:checked + span,
.radio-btn.radio-on span {
  border-color: rgba(86, 159, 255, 0.88);
  background: linear-gradient(135deg, #236fe1, #2d9cff);
  color: #fff;
  box-shadow: 0 12px 24px rgba(31, 111, 214, 0.22);
}

.checkbox-label {
  min-height: 46px;
  border-radius: 15px;
  border: 1px solid rgba(62, 94, 148, 0.55);
  background: rgba(17, 33, 62, 0.82);
  color: #b9c8e6;
  padding: 10px 12px;
}

.checkbox-label.checked {
  border-color: rgba(86, 159, 255, 0.88);
  background: linear-gradient(135deg, rgba(37, 105, 211, 0.92), rgba(36, 141, 229, 0.82));
  color: #fff;
  box-shadow: 0 12px 24px rgba(31, 111, 214, 0.22);
}

.radio-btn input,
.checkbox-label input {
  accent-color: #58a6ff;
}

.disp-lista {
  gap: 8px;
}

.disp-item {
  border-color: rgba(68, 101, 157, 0.58);
  background: rgba(15, 31, 58, 0.94);
  border-radius: 16px;
}

.disp-texto {
  color: #d6e2f8;
}

.btn-icon-sm {
  min-width: 28px;
  min-height: 28px;
  border-radius: 9px;
  background: rgba(26, 45, 80, 0.84);
}

.btn-disp {
  border-style: dashed;
  border-radius: 14px;
  color: #78b6ff;
  font-weight: 700;
}

.btn-disp:active {
  background: rgba(42, 118, 224, 0.18);
}

.bloco-nav {
  gap: 10px;
  margin-top: 18px;
}

.bloco-nav .btn {
  min-height: 52px;
  border-radius: 16px;
}

.bloco-nav .btn-primary,
.btn-generate {
  box-shadow: 0 16px 30px rgba(35, 111, 225, 0.28);
}

.rascunho-banner {
  border-color: rgba(78, 147, 255, 0.55);
  background: linear-gradient(180deg, rgba(20, 42, 78, 0.96), rgba(14, 28, 53, 0.98));
  border-radius: 18px;
}

.modal-overlay {
  background: rgba(1, 8, 18, 0.72);
  backdrop-filter: blur(8px);
}

.modal-box {
  background:
    radial-gradient(circle at top left, rgba(50, 128, 238, 0.12), transparent 36%),
    linear-gradient(180deg, #10203d, #0b172c);
  border: 1px solid rgba(76, 121, 190, 0.45);
  border-radius: 24px 24px 0 0;
  box-shadow: 0 -20px 42px rgba(0, 0, 0, 0.35);
}

.modal-header,
.modal-footer {
  background: rgba(12, 25, 48, 0.95);
  border-color: rgba(68, 101, 157, 0.46);
}

.modal-body {
  padding: 18px 16px 96px;
}

.modal-footer {
  border-top: 1px solid rgba(68, 101, 157, 0.46);
  padding-bottom: 16px;
}

.modal-header h3 {
  color: #f4f7ff;
  font-size: 1.08rem;
}

@media (max-width: 390px) {
  .passagem-page {
    padding-left: 14px;
    padding-right: 14px;
  }

  .module-hero {
    padding: 18px;
    gap: 13px;
  }

  .module-hero-copy h1 {
    font-size: 1.48rem;
  }

  .module-hero-copy p {
    font-size: 0.9rem;
  }

  .passagem-card {
    padding: 16px;
  }

  .bloco-nav {
    flex-wrap: wrap;
  }

  .bloco-nav .btn-primary,
  .bloco-nav .btn-generate {
    flex-basis: 100%;
  }
}
</style>
