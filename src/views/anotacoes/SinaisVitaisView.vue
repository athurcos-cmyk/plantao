<template>
  <div class="screen">
    <header class="app-header">
      <button  data-testid="auto-btn-sinaisvitaisview-1" class="btn-icon" @click="router.push({ name: 'dashboard' })">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>
      <button  data-testid="auto-btn-sinaisvitaisview-2" class="btn-home-logo" @click="router.push({ name: 'dashboard' })">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M12 2c0 0-1 3-1 6s1 4 1 4-1 1-1 4 1 6 1 6"/>
          <path d="M9 7c-2 1-3 2-3 3s2 2 6 2 6-1 6-2-1-2-3-3"/>
          <path d="M9 17c-2-1-3-2-3-3s2-2 6-2 6 1 6 2-1 2-3 3"/>
        </svg>
        <span>Plantão</span>
      </button>
      <div style="width:34px"/>
    </header>

    <main class="container" style="padding-top:24px">

      <!-- Banner de rascunho -->
      <div v-if="temRascunho && !gerado" class="rascunho-banner">
        <div class="rascunho-info">
          <span>📝</span>
          <span>Você tem uma aferição em rascunho</span>
        </div>
        <div class="rascunho-acoes">
          <button  data-testid="auto-btn-sinaisvitaisview-1" class="btn btn-primary btn-sm" @click="restaurarRascunho">Continuar</button>
          <button  data-testid="auto-btn-sinaisvitaisview-2" class="btn btn-secondary btn-sm" @click="descartarRascunho">Descartar</button>
        </div>
      </div>

      <!-- ── Formulário ── -->
      <div v-if="!gerado">

        <div v-if="pacientesStore.pacientes.length > 0" style="margin-bottom:16px">
          <label class="label-small">Paciente registrado</label>
          <div class="chips-scroll" style="margin-top:6px">
            <button
              v-for="p in pacientesStore.pacientes"
              :key="p._key"
              class="chip"
              :class="{ ativo: form.nomePaciente === p.nome && form.leitoPaciente === (p.leito || '') }"
              @click="selecionarPaciente(p)"
            >{{ p.leito ? p.leito + ' · ' : '' }}{{ p.nome }}</button>
          </div>
        </div>

        <div class="sv-grid">

          <!-- Horário -->
          <div class="campo campo-full">
            <label>Horário </label>
            <input  data-testid="auto-input-sinaisvitaisview-1" type="time" v-model="form.horario">
          </div>

          <!-- PA -->
          <div class="campo campo-full">
            <label>PA <span class="sv-unit">mmHg</span></label>
            <div class="pa-row">
              <input  data-testid="auto-input-sinaisvitaisview-2" type="number" v-model="form.paSis" placeholder="120" min="0" max="300">
              <span class="pa-sep">/</span>
              <input  data-testid="auto-input-sinaisvitaisview-3" type="number" v-model="form.paDia" placeholder="80" min="0" max="200">
            </div>
          </div>

          <!-- PAM -->
          <div class="campo">
            <label>PAM <span class="sv-unit">mmHg</span></label>
            <input  data-testid="auto-input-sinaisvitaisview-4" type="number" v-model="form.pam" placeholder="87" min="0" max="200">
          </div>

          <!-- FC -->
          <div class="campo">
            <label>FC <span class="sv-unit">bpm</span></label>
            <input  data-testid="auto-input-sinaisvitaisview-5" type="number" v-model="form.fc" placeholder="98" min="0" max="300">
          </div>

          <!-- FR -->
          <div class="campo">
            <label>FR <span class="sv-unit">rpm</span></label>
            <input  data-testid="auto-input-sinaisvitaisview-6" type="number" v-model="form.fr" placeholder="17" min="0" max="60">
          </div>

          <!-- Temperatura -->
          <div class="campo">
            <label>T <span class="sv-unit">°C</span></label>
            <input  data-testid="auto-input-sinaisvitaisview-7" type="number" v-model="form.temp" step="0.1" placeholder="36.7" min="30" max="45">
          </div>

          <!-- SAT -->
          <div class="campo">
            <label>SAT O₂ <span class="sv-unit">%</span></label>
            <input  data-testid="auto-input-sinaisvitaisview-8" type="number" v-model="form.sat" placeholder="95" min="0" max="100">
          </div>

          <!-- Dextro -->
          <div class="campo campo-full">
            <label>Dextro <span class="sv-unit">mg/dL</span> <span class="sv-opcional">(opcional)</span></label>
            <input  data-testid="auto-input-sinaisvitaisview-9" type="number" v-model="form.dextro" placeholder="120" min="0" max="600">
          </div>

        </div>

        <!-- Algias -->
        <div class="campo">
          <label>Algias</label>
          <div class="radio-group">
            <label class="radio-btn">
              <input  data-testid="auto-input-sinaisvitaisview-10" type="radio" :checked="form.algias === 'nega'" @click="form.algias = form.algias === 'nega' ? '' : 'nega'">
              <span>Nega algias</span>
            </label>
            <label class="radio-btn">
              <input  data-testid="auto-input-sinaisvitaisview-11" type="radio" :checked="form.algias === 'refere'" @click="form.algias = form.algias === 'refere' ? '' : 'refere'">
              <span>Refere dor</span>
            </label>
          </div>
        </div>

        <div v-if="form.algias === 'refere'">
          <div class="campo">
            <label>Localização da dor</label>
            <input data-testid="auto-input-sinaisvitaisview-12" type="text" v-model="form.dorDesc" placeholder="Ex: cefaleia, dor em MMII, dor abdominal">
          </div>

          <div class="campo">
            <label>Intensidade <span class="sv-unit">(escala 0–10)</span></label>
            <div class="escala-dor">
              <button
                v-for="n in 11" :key="n-1"
                class="chip chip-escala"
                :class="{ 'chip-on': form.dorEscala === (n-1), 'chip-escala-alto': (n-1) >= 7, 'chip-escala-medio': (n-1) >= 4 && (n-1) < 7 }"
                @click="form.dorEscala = form.dorEscala === (n-1) ? null : (n-1)"
              >{{ n-1 }}</button>
            </div>
          </div>

          <div class="campo">
            <label>Conduta</label>
            <div class="chips-wrap" style="margin-bottom:8px">
              <button class="chip" :class="{ 'chip-on': form.dorConduta.includes('comunicado') }" @click="toggleConduta('comunicado')">Comunicado à enfermeira</button>
              <button class="chip" :class="{ 'chip-on': form.dorConduta.includes('medicado') }" @click="toggleConduta('medicado')">Medicação administrada</button>
              <button class="chip" :class="{ 'chip-on': form.dorConduta.includes('reavaliado') }" @click="toggleConduta('reavaliado')">Reavaliado</button>
            </div>
            <input v-if="form.dorConduta.includes('comunicado')" type="text" v-model="form.dorCondutaEnf" placeholder="Nome da enfermeira" style="margin-bottom:6px">
            <input v-if="form.dorConduta.includes('medicado')" type="text" v-model="form.dorCondutaMed" placeholder="Ex: item 3 da prescrição médica, EV">
            <input v-if="form.dorConduta.includes('reavaliado')" type="text" v-model="form.dorCondutaReav" placeholder="Ex: nível 2 após 20 min" style="margin-top:6px">
          </div>
        </div>

        <p v-if="erro" class="erro-msg">{{ erro }}</p>

        <button  data-testid="auto-btn-sinaisvitaisview-3" class="btn btn-primary" style="width:100%;margin-top:8px" @click="gerar">Gerar texto</button>
      </div>

      <!-- ── Preview ── -->
      <div v-else>
        <textarea v-model="textoGerado" class="preview-box" rows="7"></textarea>

        <div style="display:flex;gap:10px;margin-top:16px">
          <div style="flex:2">
            <label class="label-small">Nome do paciente</label>
            <input  data-testid="auto-input-sinaisvitaisview-13" class="campo-inline" type="text" v-model="form.nomePaciente" placeholder="Maria da Silva">
          </div>
          <div style="flex:1">
            <label class="label-small">Leito</label>
            <input  data-testid="auto-input-sinaisvitaisview-14" class="campo-inline" type="text" v-model="form.leitoPaciente" placeholder="4B">
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:10px;margin-top:14px">
          <button  data-testid="auto-btn-sinaisvitaisview-4" class="btn btn-primary" @click="copiar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2"/>
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
            </svg>
            Copiar texto
          </button>
          <button  data-testid="auto-btn-sinaisvitaisview-5" class="btn btn-secondary" @click="salvar" :disabled="salvando">
            {{ salvando ? 'Salvando...' : 'Salvar no histórico' }}
          </button>
          <button  data-testid="auto-btn-sinaisvitaisview-6" class="btn btn-secondary" @click="compartilhar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/>
              <polyline points="16 6 12 2 8 6"/>
              <line x1="12" y1="2" x2="12" y2="15"/>
            </svg>
            Compartilhar
          </button>
          <button  data-testid="auto-btn-sinaisvitaisview-7" class="btn btn-secondary" @click="novaAfericao">Nova aferição</button>
          <button  data-testid="auto-btn-sinaisvitaisview-8" class="btn btn-secondary" @click="gerado = false">← Editar</button>
        </div>

        <!-- Toast global renderizado em App.vue -->
      </div>

    </main>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAnotacoesStore } from '../../stores/anotacoes'
import { useToast } from '../../composables/useToast.js'
import { useRascunho } from '../../composables/useRascunho.js'
import { usePacientesStore } from '../../stores/pacientes.js'
import { useCopia } from '../../composables/useCopia.js'

const router  = useRouter()
const store   = useAnotacoesStore()
const { showToast } = useToast()
const pacientesStore = usePacientesStore()
const { copiar: _copiar } = useCopia()
onMounted(() => pacientesStore.iniciar())

function selecionarPaciente(p) {
  form.nomePaciente = p.nome
  form.leitoPaciente = p.leito || ''
}

const gerado      = ref(false)
const textoGerado = ref('')
const erro        = ref('')
const salvando    = ref(false)

const form = reactive({
  horario:        '',
  paSis:          '',
  paDia:          '',
  pam:            '',
  fc:             '',
  fr:             '',
  temp:           '',
  sat:            '',
  dextro:         '',
  algias:         '',
  dorDesc:        '',
  dorEscala:      null,
  dorConduta:     [],
  dorCondutaEnf:  '',
  dorCondutaMed:  '',
  dorCondutaReav: '',
  nomePaciente:   '',
  leitoPaciente:  ''
})

function toggleConduta(v) {
  const i = form.dorConduta.indexOf(v)
  if (i === -1) form.dorConduta.push(v)
  else form.dorConduta.splice(i, 1)
}

// ── Rascunho ──────────────────────────────────────────────────────────────
const { temRascunho, restaurarRascunho, descartarRascunho, iniciarRascunho } =
  useRascunho(
    'rascunho_sinais_vitais',
    form,
    () => !!(form.horario || form.paSis || form.fc || form.temp || form.sat)
  )
iniciarRascunho()

function mostrarFeedback(msg) {
  showToast(msg)
}

function gerar() {
  erro.value = ''


  const h = form.horario.replace(':', 'h')

  // Algias
  let algiasText = ''
  if (form.algias === 'nega') {
    algiasText = ', nega algias'
  } else if (form.algias === 'refere') {
    const partes = []
    if (form.dorDesc.trim()) partes.push(form.dorDesc.trim())
    if (form.dorEscala !== null) partes.push(`nível ${form.dorEscala}/10 na escala de dor`)
    let dorBase = partes.length ? `, refere dor: ${partes.join(', ')}` : ', refere dor'

    const condutas = []
    if (form.dorConduta.includes('comunicado') && form.dorCondutaEnf.trim())
      condutas.push(`Comunicado à enfermeira ${form.dorCondutaEnf.trim()}`)
    else if (form.dorConduta.includes('comunicado'))
      condutas.push('Comunicado à enfermeira')
    if (form.dorConduta.includes('medicado') && form.dorCondutaMed.trim())
      condutas.push(`Administrado ${form.dorCondutaMed.trim()}, conforme prescrição médica`)
    else if (form.dorConduta.includes('medicado'))
      condutas.push('Administrado medicamento conforme prescrição médica')
    if (form.dorConduta.includes('reavaliado') && form.dorCondutaReav.trim())
      condutas.push(`Reavaliado – ${form.dorCondutaReav.trim()}`)
    else if (form.dorConduta.includes('reavaliado'))
      condutas.push('Reavaliado')

    algiasText = dorBase + (condutas.length ? '. ' + condutas.join('. ') : '')
  }

  // Sinais
  const sv = []
  if (form.paSis && form.paDia) sv.push(`PA ${form.paSis}/${form.paDia}mmHg`)
  if (form.pam)                 sv.push(`PAM ${form.pam}mmHg`)
  if (form.fc)                  sv.push(`FC ${form.fc}bpm`)
  if (form.fr)                  sv.push(`FR ${form.fr}rpm`)
  if (form.temp)                sv.push(`T ${form.temp}°C`)
  if (form.sat)                 sv.push(`SAT ${form.sat}%`)
  if (form.dextro)              sv.push(`Dextro ${form.dextro}mg/dL`)

  // Abertura: completa (≥4 sinais principais) ou parcial
  const principais = [form.paSis && form.paDia, form.fc, form.fr, form.temp, form.sat].filter(Boolean).length
  const abertura = principais >= 4
    ? `${h} – Realizado aferição de sinais vitais${algiasText}.`
    : `${h} – Realizado aferição parcial de sinais vitais${algiasText}.`

  textoGerado.value = sv.length > 0
    ? abertura + '\n' + sv.join('\n')
    : abertura

  gerado.value = true
}

async function copiar() {
  const ok = await _copiar(textoGerado.value)
  if (ok) mostrarFeedback('Texto copiado!')
  else mostrarFeedback('Erro ao copiar')
}


async function salvar() {
  salvando.value = true
  try {
    const r = await store.salvar({ tipo: 'sv', texto: textoGerado.value, nome: form.nomePaciente.trim(), leito: form.leitoPaciente.trim() })
    if (r?.modo === 'offline') mostrarFeedback('Salvo offline - sincroniza automatico')
    else mostrarFeedback('Salvo no histórico!')
  } catch {
    mostrarFeedback('Erro ao salvar')
  } finally {
    salvando.value = false
  }
}

function compartilhar() {
  const texto = textoGerado.value
  if (navigator.share) {
    navigator.share({ text: texto }).catch(() => {})
  } else {
    const url = 'https://wa.me/?text=' + encodeURIComponent(texto)
    window.open(url, '_blank')
  }
}

function novaAfericao() {
  Object.assign(form, {
    horario: '', paSis: '', paDia: '', pam: '',
    fc: '', fr: '', temp: '', sat: '', dextro: '',
    algias: '', dorDesc: '', dorEscala: null,
    dorConduta: [], dorCondutaEnf: '', dorCondutaMed: '', dorCondutaReav: ''
  })
  erro.value    = ''
  gerado.value  = false
  descartarRascunho()
}
</script>

<style scoped>
.sv-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 12px;
}
.campo-full { grid-column: 1 / -1; }

.sv-unit {
  font-size: 0.78rem;
  font-weight: 400;
  color: var(--text-muted);
}
.sv-opcional {
  font-size: 0.75rem;
  font-weight: 400;
  color: var(--text-muted);
}

.pa-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.pa-row input { flex: 1; }
.pa-sep {
  font-size: 1.4rem;
  color: var(--text-dim);
  font-weight: 300;
  flex-shrink: 0;
}

.erro-msg {
  color: var(--red);
  font-size: 0.9rem;
  margin: 8px 0 0;
}

.btn-icon {
  background: none; border: none; color: var(--text-dim);
  cursor: pointer; padding: 6px; border-radius: 8px; display: flex; align-items: center;
}
.btn-icon:active { background: var(--bg-hover); }

.btn-home-logo {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: var(--text);
  cursor: pointer;
  font-family: inherit;
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  padding: 4px 8px;
  border-radius: 8px;
}
.btn-home-logo:active { background: var(--bg-hover); }

.preview-box {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 18px;
  width: 100%; box-sizing: border-box;
  font-size: 0.95rem; line-height: 1.7; color: var(--text);
  font-family: inherit; white-space: pre-wrap;
  resize: vertical; outline: none;
}

.label-small {
  display: block;
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-bottom: 4px;
}
.campo-inline {
  width: 100%;
  box-sizing: border-box;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text);
  font-family: inherit;
  font-size: 0.95rem;
  padding: 10px 12px;
  outline: none;
  transition: border-color 0.15s;
}
.campo-inline:focus { border-color: var(--blue); }

.chips-scroll {
  display: flex; gap: 6px;
  overflow-x: auto; padding-bottom: 2px; scrollbar-width: none;
  flex-wrap: wrap;
}
.chips-scroll::-webkit-scrollbar { display: none; }
.chip {
  background: var(--bg-input); border: 1px solid var(--border);
  border-radius: 20px; color: var(--text-muted);
  font-size: 0.85rem; font-family: inherit;
  padding: 7px 14px; cursor: pointer; white-space: nowrap;
  flex-shrink: 0; transition: all 0.15s;
}
.chip.ativo { background: var(--blue); border-color: var(--blue); color: #fff; font-weight: 600; }

.escala-dor {
  display: flex;
  gap: 5px;
  flex-wrap: nowrap;
}
.chip-escala {
  flex: 1;
  min-width: 0;
  padding: 8px 2px;
  font-size: 0.85rem;
  text-align: center;
  border-radius: 8px;
}
.chip-escala.chip-on { background: var(--blue); border-color: var(--blue); color: #fff; font-weight: 700; }
.chip-escala.chip-escala-medio:not(.chip-on) { border-color: #d97706; color: #d97706; }
.chip-escala.chip-escala-alto:not(.chip-on)  { border-color: var(--red); color: var(--red); }

/* Toast global — ver App.vue + style.css */
</style>
