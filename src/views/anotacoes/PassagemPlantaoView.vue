<template>
  <div class="screen">
    <header class="app-header">
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
          <button class="btn btn-secondary" style="width:auto;padding:12px 20px" @click="limparBloco">Limpar</button>
          <button class="btn btn-primary" @click="avancar">Próximo →</button>
        </div>
      </div>

      <!-- ═══ BLOCO 2 — Condições ═══ -->
      <div v-if="!gerado && passo === 2">
        <h2 class="bloco-titulo">Condições</h2>

        <!-- Queixas -->
        <div class="campo">
          <label class="checkbox-label" :class="{ checked: form.queixas }">
            <input type="checkbox" v-model="form.queixas">
            <span>Paciente com queixas</span>
          </label>
          <div v-if="form.queixas" style="margin-top:10px">
            <input type="text" v-model="form.queixasDesc" placeholder="Descreva as queixas...">
          </div>
        </div>

        <!-- Cama -->
        <div class="campo">
          <label>Posição da cama</label>
          <div class="radio-group horizontal">
            <label v-for="op in camaOpcoes" :key="op" class="radio-btn">
              <input type="radio" :value="op" v-model="form.cama" @change="desativarOutro('cama')">
              <span>{{ cap(op) }}</span>
            </label>
            <label class="radio-btn">
              <input type="radio" :checked="outroAtivo.cama" @click.prevent="outroAtivo.cama ? desativarOutro('cama') : selecionarOutro('cama')">
              <span>Outro</span>
            </label>
          </div>
          <input v-if="outroAtivo.cama" class="campo-inline" style="margin-top:8px" type="text" :value="outroTexto.cama || ''" @input="atualizarOutro('cama', $event.target.value)" placeholder="Descreva a posição...">
        </div>

        <!-- Rodas -->
        <div class="campo">
          <label>Rodas</label>
          <div class="radio-group horizontal">
            <label v-for="op in rodasOpcoes" :key="op" class="radio-btn">
              <input type="radio" :value="op" v-model="form.rodas" @change="desativarOutro('rodas')">
              <span>{{ cap(op) }}</span>
            </label>
            <label class="radio-btn">
              <input type="radio" :checked="outroAtivo.rodas" @click.prevent="outroAtivo.rodas ? desativarOutro('rodas') : selecionarOutro('rodas')">
              <span>Outro</span>
            </label>
          </div>
          <input v-if="outroAtivo.rodas" class="campo-inline" style="margin-top:8px" type="text" :value="outroTexto.rodas || ''" @input="atualizarOutro('rodas', $event.target.value)" placeholder="Descreva...">
        </div>

        <!-- Grades -->
        <div class="campo">
          <label>Grades</label>
          <div class="radio-group vertical">
            <label v-for="op in gradesOpcoes" :key="op" class="radio-btn">
              <input type="radio" :value="op" v-model="form.grades" @change="desativarOutro('grades')">
              <span>{{ cap(op) }}</span>
            </label>
            <label class="radio-btn">
              <input type="radio" :checked="outroAtivo.grades" @click.prevent="outroAtivo.grades ? desativarOutro('grades') : selecionarOutro('grades')">
              <span>Outro</span>
            </label>
          </div>
          <input v-if="outroAtivo.grades" class="campo-inline" style="margin-top:8px" type="text" :value="outroTexto.grades || ''" @input="atualizarOutro('grades', $event.target.value)" placeholder="Descreva a posição das grades...">
        </div>

        <!-- Decúbito -->
        <div class="campo">
          <label>Decúbito</label>
          <div class="radio-group vertical">
            <label v-for="op in decubitoOpcoes" :key="op" class="radio-btn">
              <input type="radio" :value="op" v-model="form.decubito" @change="desativarOutro('decubito')">
              <span>{{ cap(op) }}</span>
            </label>
            <label class="radio-btn">
              <input type="radio" :checked="outroAtivo.decubito" @click.prevent="outroAtivo.decubito ? desativarOutro('decubito') : selecionarOutro('decubito')">
              <span>Outro</span>
            </label>
          </div>
          <input v-if="outroAtivo.decubito" class="campo-inline" style="margin-top:8px" type="text" :value="outroTexto.decubito || ''" @input="atualizarOutro('decubito', $event.target.value)" placeholder="Descreva o decúbito...">
        </div>

        <!-- Informações adicionais -->
        <div class="campo">
          <label>Informações adicionais</label>

          <!-- Dieta enteral -->
          <label class="checkbox-label" :class="{ checked: form.dietaEnteral }" style="margin-bottom:8px">
            <input type="checkbox" v-model="form.dietaEnteral">
            <span>Dieta enteral</span>
          </label>
          <div v-if="form.dietaEnteral" style="margin-top:4px;margin-bottom:12px;display:flex;flex-direction:column;gap:8px;padding-left:8px">
            <input type="text" v-model="form.dietaDesc" placeholder="Descrição (ex: polimérica)">
            <input type="text" v-model="form.dietaMl" placeholder="ml/h">
          </div>

          <!-- Infusão venosa -->
          <label class="checkbox-label" :class="{ checked: form.infusao }" style="margin-bottom:8px">
            <input type="checkbox" v-model="form.infusao" @change="onToggleInfusao">
            <span>Infusão venosa</span>
          </label>
          <div v-if="form.infusao" style="margin-top:4px;margin-bottom:12px;padding-left:8px">
            <div v-for="(inf, i) in form.infusoes" :key="i" style="display:flex;flex-direction:column;gap:8px;margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid var(--border)">
              <div style="display:flex;align-items:center;justify-content:space-between">
                <span style="font-size:0.78rem;color:var(--text-muted);font-weight:600">INFUSÃO {{ i + 1 }}</span>
                <button v-if="form.infusoes.length > 1" class="btn-remove-inf" @click="removeInfusao(i)">× remover</button>
              </div>
              <input type="text" v-model="inf.solucao" placeholder="Solução (ex: SF 0,9% 500ml)">
              <input type="text" v-model="inf.ml" placeholder="ml/h">
            </div>
            <button class="btn-add-inf" @click="addInfusao">+ Adicionar infusão</button>
          </div>

          <!-- Débito urinário -->
          <label class="checkbox-label" :class="{ checked: form.svd }" style="margin-bottom:8px">
            <input type="checkbox" v-model="form.svd">
            <span>Débito urinário</span>
          </label>
          <div v-if="form.svd" style="margin-top:4px;margin-bottom:12px;display:flex;flex-direction:column;gap:8px;padding-left:8px">
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
          <button class="btn btn-secondary" style="width:auto;padding:12px 16px" @click="limparBloco">Limpar</button>
          <button class="btn btn-primary" @click="gerar">Gerar anotação</button>
        </div>
      </div>

      <!-- ═══ RESULTADO ═══ -->
      <div v-if="gerado">
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

        <button class="btn btn-secondary" style="width:100%;margin-top:10px" @click="gerado = false; passo = 2">← Editar</button>
      </div>

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
  queixas:        false,
  queixasDesc:    '',
  cama:           'baixa',
  rodas:          'travadas',
  grades:         'parcialmente elevadas',
  decubito:       'parcialmente elevado',
  dietaEnteral:   false,
  dietaDesc:      '',
  dietaMl:        '',
  infusao:        false,
  infusoes:       [],
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
const decubitoOpcoes = ['parcialmente elevado', 'dorsal', 'lateral direito', 'lateral esquerdo', 'Fowler', 'semi-Fowler', 'Trendelenburg', 'leito/cama']

// ── Campos "Outro" (mesmo padrão da AnotacaoInicial) ──
const outroAtivo = reactive({})
const outroTexto = reactive({})

function selecionarOutro(campo) {
  outroAtivo[campo] = true
  form[campo] = outroTexto[campo] || ''
}
function atualizarOutro(campo, texto) {
  outroTexto[campo] = texto
  form[campo] = texto
}
function desativarOutro(campo) {
  outroAtivo[campo] = false
}

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)

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

function toggleRefeicao(r) {
  form.refeicao = form.refeicao === r ? '' : r
}

function onToggleInfusao() {
  if (form.infusao && form.infusoes.length === 0)
    form.infusoes.push({ solucao: '', ml: '' })
  else if (!form.infusao)
    form.infusoes.splice(0)
}
function addInfusao() { form.infusoes.push({ solucao: '', ml: '' }) }
function removeInfusao(i) {
  form.infusoes.splice(i, 1)
  if (form.infusoes.length === 0) form.infusao = false
}

function formatHora(h) {
  return h ? h.replace(':', 'h') : ''
}

function gradesDecubito() {
  if (form.grades === 'parcialmente elevadas' && form.decubito === 'parcialmente elevado') {
    return 'grades e decúbito parcialmente elevados'
  }
  return 'grades ' + form.grades + ' e decúbito ' + form.decubito
}

// ── Navegação ──
function voltarOuSair() {
  if (passo.value > 1 && !gerado.value) { passo.value--; return }
  router.push({ name: 'dashboard' })
}

function limparBloco() {
  erro.value = ''
  if (passo.value === 1) {
    form.horario = ''; form.nome = ''; form.leito = ''; form.refeicao = ''
  } else {
    form.queixas = false; form.queixasDesc = ''
    form.cama = 'baixa'; form.rodas = 'travadas'
    form.grades = 'parcialmente elevadas'; form.decubito = 'parcialmente elevado'
    ;['cama','rodas','grades','decubito'].forEach(c => { outroAtivo[c] = false; outroTexto[c] = '' })
    form.dietaEnteral = false; form.dietaDesc = ''; form.dietaMl = ''
    form.infusao = false; form.infusaoSolucao = ''; form.infusaoVol = ''; form.infusaoMl = ''
    form.svd = false; form.svdDebito = ''
    form.dispositivos.splice(0)
    form.obs = ''
  }
}

function avancar() {
  erro.value = ''
  if (!form.nome.trim()) {
    erro.value = 'Informe o nome do paciente.'
    return
  }
  if (!form.horario) {
    erro.value = 'Informe o horário.'
    return
  }
  passo.value++
}

// ── Gerar texto ──
function gerar() {
  erro.value = ''

  const hora = formatHora(form.horario)

  const refeicaoPart = form.refeicao
    ? 'Ofertado ' + form.refeicao + '. '
    : ''

  const queixasPart = form.queixas
    ? 'referindo ' + form.queixasDesc.trim()
    : 'sem queixas'

  let texto = `${hora} – ${refeicaoPart}Paciente em seu leito ${queixasPart}, Mantenho cama ${form.cama}, rodas ${form.rodas}, ${gradesDecubito()}, campainha próxima e oriento a chamar sempre que necessário.`

  if (form.dietaEnteral) {
    const desc = form.dietaDesc.trim()
    texto += ` Recebendo dieta enteral${desc ? ' ' + desc : ''} a ${form.dietaMl.trim()}ml/h.`
  }

  if (form.infusao) {
    for (const inf of form.infusoes) {
      const sol = inf.solucao.trim()
      const ml  = inf.ml.trim()
      if (sol && ml) texto += ` Recebendo ${sol} a ${ml}ml/h.`
    }
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
    queixas:        false,
    queixasDesc:    '',
    cama:           'baixa',
    rodas:          'travadas',
    grades:         'parcialmente elevadas',
    decubito:       'parcialmente elevado',
    dietaEnteral:   false,
    dietaDesc:      '',
    dietaMl:        '',
    infusao:        false,
    infusoes:       [],
    svd:            false,
    svdDispositivo: 'SVD',
    svdDebito:      '',
    dispositivos:   [],
    obs:            '',
  })
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

.radio-btn {
  display: flex; align-items: center;
  padding: 8px 14px; border-radius: 20px;
  border: 1px solid var(--border); background: var(--bg-card);
  color: var(--text-dim); font-size: 0.9rem;
  cursor: pointer; font-family: inherit; transition: all 0.15s;
  gap: 6px;
}
.radio-btn input[type="radio"] { display: none; }
.radio-btn:has(input:checked) {
  background: var(--blue); border-color: var(--blue); color: #fff;
}

.checkbox-label {
  display: flex; align-items: center; gap: 8px;
  font-size: 0.9rem; color: var(--text-dim); cursor: pointer;
}
.checkbox-label input[type="checkbox"] { cursor: pointer; }

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
</style>
