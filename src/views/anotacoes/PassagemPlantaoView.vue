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
          <label class="checkbox-label">
            <input type="checkbox" v-model="form.queixas">
            <span>Paciente com queixas</span>
          </label>
          <div v-if="form.queixas" style="margin-top:10px">
            <input type="text" v-model="form.queixasDesc" placeholder="Descreva as queixas...">
          </div>
        </div>

        <!-- Cama -->
        <div class="campo">
          <label>Cama</label>
          <div class="radio-group horizontal">
            <label v-for="op in camaOpcoes" :key="op" class="radio-btn">
              <input type="radio" :value="op" v-model="form.cama">
              <span>{{ op }}</span>
            </label>
          </div>
        </div>

        <!-- Rodas -->
        <div class="campo">
          <label>Rodas</label>
          <div class="radio-group horizontal">
            <label v-for="op in rodasOpcoes" :key="op" class="radio-btn">
              <input type="radio" :value="op" v-model="form.rodas">
              <span>{{ op }}</span>
            </label>
          </div>
        </div>

        <!-- Grades -->
        <div class="campo">
          <label>Grades</label>
          <div class="radio-group vertical">
            <label v-for="op in gradesOpcoes" :key="op" class="radio-btn">
              <input type="radio" :value="op" v-model="form.grades">
              <span>{{ op }}</span>
            </label>
          </div>
        </div>

        <!-- Decúbito -->
        <div class="campo">
          <label>Decúbito</label>
          <div class="radio-group vertical">
            <label v-for="op in decubitoOpcoes" :key="op" class="radio-btn">
              <input type="radio" :value="op" v-model="form.decubito">
              <span>{{ op }}</span>
            </label>
          </div>
        </div>

        <!-- Informações adicionais -->
        <div class="campo">
          <label>Informações adicionais</label>

          <!-- Dieta enteral -->
          <label class="checkbox-label" style="margin-bottom:8px">
            <input type="checkbox" v-model="form.dietaEnteral">
            <span>Dieta enteral</span>
          </label>
          <div v-if="form.dietaEnteral" style="margin-top:4px;margin-bottom:12px;display:flex;flex-direction:column;gap:8px;padding-left:8px">
            <input type="text" v-model="form.dietaDesc" placeholder="Descrição (ex: polimérica)">
            <input type="text" v-model="form.dietaMl" placeholder="ml/h">
          </div>

          <!-- Infusão venosa -->
          <label class="checkbox-label" style="margin-bottom:8px">
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
          <label class="checkbox-label" style="margin-bottom:8px">
            <input type="checkbox" v-model="form.svd">
            <span>Débito urinário</span>
          </label>
          <div v-if="form.svd" style="margin-top:4px;margin-bottom:12px;display:flex;flex-direction:column;gap:8px;padding-left:8px">
            <input type="text" v-model="form.svdDispositivo" placeholder="Dispositivo (ex: SVD, nefrostomia D)">
            <input type="text" v-model="form.svdDebito" placeholder="Débito (ml)">
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
import { useAuthStore } from '../../stores/auth.js'
import { useRascunho } from '../../composables/useRascunho.js'
import { useToast } from '../../composables/useToast.js'

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
  obs:            '',
})

// ── Rascunho ──
const { temRascunho, restaurarRascunho, descartarRascunho, iniciarRascunho } =
  useRascunho('rascunho_passagem', form, () => !!(form.horario || form.nome))

// ── Opções ──
const refeicaoOpcoes = ['café da manhã', 'almoço', 'lanche', 'janta', 'ceia']
const camaOpcoes     = ['baixa', 'média', 'alta']
const rodasOpcoes    = ['travadas', 'soltas']
const gradesOpcoes   = ['totalmente elevadas', 'parcialmente elevadas', 'abaixadas']
const decubitoOpcoes = ['parcialmente elevado', 'dorsal', 'lateral direito', 'lateral esquerdo', 'Fowler']

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
    form.dietaEnteral = false; form.dietaDesc = ''; form.dietaMl = ''
    form.infusao = false; form.infusaoSolucao = ''; form.infusaoVol = ''; form.infusaoMl = ''
    form.svd = false; form.svdDebito = ''
    form.obs = ''
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

  if (!form.horario || !form.nome.trim()) {
    erro.value = 'Preencha o horário e o nome do paciente.'
    return
  }

  if (form.queixas && !form.queixasDesc.trim()) {
    erro.value = 'Descreva as queixas do paciente.'
    return
  }

  if (form.dietaEnteral && !form.dietaMl.trim()) {
    erro.value = 'Informe o ml/h da dieta enteral.'
    return
  }

  if (form.svd && !form.svdDebito.trim()) {
    erro.value = 'Informe o débito.'
    return
  }

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
      tipo:  'passagem',
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
    obs:            '',
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
</style>
