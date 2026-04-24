<template>
  <div class="screen sv-screen">
    <header class="app-header sv-header">
      <button data-testid="auto-btn-sinaisvitaisview-1" class="btn-icon sv-back-btn" @click="router.push({ name: 'dashboard' })">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      <button data-testid="auto-btn-sinaisvitaisview-2" class="btn-home-logo sv-brand-btn" @click="router.push({ name: 'dashboard' })">
        <img src="/icons/icon-512.png" width="22" height="22" alt="Plantão" class="sv-brand-mark" />
        <span>Plantão</span>
      </button>

      <div class="sv-header-spacer"></div>
    </header>

    <main class="container sv-page">
      <div v-if="temRascunho && !gerado" class="rascunho-banner sv-rascunho-banner">
        <div class="rascunho-info">
          <span>📝</span>
          <span>Você tem uma aferição em rascunho</span>
        </div>
        <div class="rascunho-acoes">
          <button data-testid="auto-btn-sinaisvitaisview-1" class="btn btn-primary btn-sm" @click="restaurarRascunho">Continuar</button>
          <button data-testid="auto-btn-sinaisvitaisview-2" class="btn btn-secondary btn-sm" @click="descartarRascunho">Descartar</button>
        </div>
      </div>

      <div v-if="!gerado">
        <section v-if="pacientesStore.pacientes.length > 0" class="sv-section">
          <label class="section-eyebrow">Paciente registrado</label>
          <div class="chips-scroll patient-chip-row">
            <button
              v-for="p in pacientesStore.pacientes"
              :key="p._key"
              class="patient-chip"
              :class="{ 'patient-chip-on': form.nomePaciente === p.nome && form.leitoPaciente === (p.leito || '') }"
              @click="selecionarPaciente(p)"
            >
              {{ p.leito ? p.leito + ' · ' : '' }}{{ p.nome }}
            </button>
          </div>
        </section>

        <section class="module-hero">
          <div class="module-hero-icon">
            <img :src="iconSv" alt="Sinais vitais" />
          </div>
          <div class="module-hero-copy">
            <h1>Sinais vitais</h1>
            <p>Registre os sinais e a avaliação do paciente.</p>
          </div>
          <svg class="module-hero-wave" viewBox="0 0 120 48" aria-hidden="true">
            <path d="M2 24h18l7-10 8 22 13-30 8 18h14l8-14 9 24 7-10h24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </section>

        <section class="sv-section">
          <label class="section-eyebrow">Horário <span class="obrigatorio">*</span></label>
          <div class="time-shell">
            <input data-testid="auto-input-sinaisvitaisview-1" type="time" v-model="form.horario">
          </div>
        </section>

        <section class="sv-section">
          <div class="vitals-grid">
            <div class="vital-card vital-card-pa">
              <div class="vital-head">
                <span class="vital-badge vital-badge-blue">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 22s-7-4.35-7-11a4 4 0 0 1 7-2.47A4 4 0 0 1 19 11c0 6.65-7 11-7 11Z" />
                    <path d="M5 12h3l2-3 2.5 6 2-3H19" />
                  </svg>
                </span>
                <div>
                  <p class="vital-title">PA <span class="vital-unit">mmHg</span></p>
                </div>
              </div>
              <div class="pressure-row">
                <input data-testid="auto-input-sinaisvitaisview-2" type="number" v-model="form.paSis" placeholder="120" min="0" max="300">
                <span class="pressure-sep">/</span>
                <input data-testid="auto-input-sinaisvitaisview-3" type="number" v-model="form.paDia" placeholder="80" min="0" max="200">
              </div>
            </div>

            <div class="vital-card">
              <div class="vital-head">
                <span class="vital-badge vital-badge-sky">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="4" y="5" width="16" height="14" rx="3" />
                    <path d="M6.5 12h3l1.8-2.8 2.1 5.1 1.8-2.3h2.3" />
                  </svg>
                </span>
                <p class="vital-title">PAM <span class="vital-unit">mmHg</span></p>
              </div>
              <input data-testid="auto-input-sinaisvitaisview-4" type="number" v-model="form.pam" placeholder="87" min="0" max="200">
            </div>

            <div class="vital-card">
              <div class="vital-head">
                <span class="vital-badge vital-badge-heart">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 21s-6.8-4.3-6.8-10.3A3.9 3.9 0 0 1 12 8a3.9 3.9 0 0 1 6.8 2.7C18.8 16.7 12 21 12 21Z" />
                    <path d="M4.8 12h3l1.6-2.4 2.2 5.1 2-2.7h4" />
                  </svg>
                </span>
                <p class="vital-title">FC <span class="vital-unit">bpm</span></p>
              </div>
              <input data-testid="auto-input-sinaisvitaisview-5" type="number" v-model="form.fc" placeholder="98" min="0" max="300">
            </div>

            <div class="vital-card">
              <div class="vital-head">
                <span class="vital-badge vital-badge-cyan">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 5v6" />
                    <path d="M12 11c-1.1-1.9-2.6-3.1-4.4-3.7C6 6.8 4.8 7.6 4.8 9.2c0 3.6 2.2 6.6 5.9 7.8 1 .3 1.3-.2 1.3-1.1V11Z" />
                    <path d="M12 11c1.1-1.9 2.6-3.1 4.4-3.7 1.6-.5 2.8.3 2.8 1.9 0 3.6-2.2 6.6-5.9 7.8-1 .3-1.3-.2-1.3-1.1V11Z" />
                    <path d="M9.2 9.3c-.7 1.1-.9 2.4-.8 3.9" />
                    <path d="M14.8 9.3c.7 1.1.9 2.4.8 3.9" />
                  </svg>
                </span>
                <p class="vital-title">FR <span class="vital-unit">rpm</span></p>
              </div>
              <input data-testid="auto-input-sinaisvitaisview-6" type="number" v-model="form.fr" placeholder="17" min="0" max="60">
            </div>

            <div class="vital-card">
              <div class="vital-head">
                <span class="vital-badge vital-badge-teal">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 4v10" />
                    <path d="M9 7a3 3 0 1 1 6 0v6.2a4.5 4.5 0 1 1-6 0Z" />
                  </svg>
                </span>
                <p class="vital-title">T <span class="vital-unit">°C</span></p>
              </div>
              <input data-testid="auto-input-sinaisvitaisview-7" type="number" v-model="form.temp" step="0.1" placeholder="36.7" min="30" max="45">
            </div>

            <div class="vital-card">
              <div class="vital-head">
                <span class="vital-badge vital-badge-o2">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 4s5 5.1 5 9.3A5 5 0 0 1 7 13.3C7 9.1 12 4 12 4Z" />
                    <path d="M9 16.5c.9.6 1.9 1 3 1 3 0 5-2.1 5-4.6" />
                  </svg>
                </span>
                <p class="vital-title">SAT O₂ <span class="vital-unit">%</span></p>
              </div>
              <input data-testid="auto-input-sinaisvitaisview-8" type="number" v-model="form.sat" placeholder="95" min="0" max="100">
            </div>

            <div class="vital-card vital-card-inline">
              <div class="vital-inline-label">
                <span class="vital-badge vital-badge-drop">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 3s6 6 6 10.2A6 6 0 0 1 6 13.2C6 9 12 3 12 3Z" />
                  </svg>
                </span>
                <div>
                  <p class="vital-title">DEXTRO <span class="vital-unit">mg/dL</span></p>
                  <p class="vital-hint">(opcional)</p>
                </div>
              </div>
              <input data-testid="auto-input-sinaisvitaisview-9" type="number" v-model="form.dextro" placeholder="120" min="0" max="600">
            </div>
          </div>
        </section>

        <section class="sv-section section-card">
          <label class="section-eyebrow">Algias</label>
          <div class="segmented-row">
            <button class="segmented-btn" :class="{ 'segmented-btn-on': form.algias === 'nega' }" @click="form.algias = form.algias === 'nega' ? '' : 'nega'">
              Nega algias
            </button>
            <button class="segmented-btn" :class="{ 'segmented-btn-on': form.algias === 'refere' }" @click="form.algias = form.algias === 'refere' ? '' : 'refere'">
              Refere dor
            </button>
          </div>

          <template v-if="form.algias === 'refere'">
            <div class="campo sv-subcampo">
              <label>Localização da dor</label>
              <input data-testid="auto-input-sinaisvitaisview-12" type="text" v-model="form.dorDesc" placeholder="Ex: cefaleia, dor em MMII, dor abdominal">
            </div>

            <div class="campo sv-subcampo">
              <label>Intensidade <span class="sv-unit">(escala 0-10)</span></label>
              <div class="escala-dor">
                <button
                  v-for="n in 11"
                  :key="n - 1"
                  class="chip chip-escala"
                  :class="{ 'chip-on': form.dorEscala === (n - 1), 'chip-escala-alto': (n - 1) >= 7, 'chip-escala-medio': (n - 1) >= 4 && (n - 1) < 7 }"
                  @click="form.dorEscala = form.dorEscala === (n - 1) ? null : (n - 1)"
                >{{ n - 1 }}</button>
              </div>
            </div>
          </template>
        </section>

        <section class="sv-section section-card">
          <label class="section-eyebrow">Comunicado</label>
          <div class="chips-wrap">
            <button class="chip" :class="{ 'chip-on': form.comunicado }" @click="form.comunicado = !form.comunicado">
              Comunicado ao Enf.
            </button>
          </div>
          <input
            v-if="form.comunicado"
            type="text"
            v-model="form.comunicadoNome"
            class="comunicado-input"
            placeholder="Nome do Enf. (opcional)"
          >
        </section>

        <p v-if="erro" class="erro-msg">{{ erro }}</p>

        <button data-testid="auto-btn-sinaisvitaisview-3" class="btn btn-primary sv-submit-btn" @click="gerar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="5" y="3" width="12" height="18" rx="2" />
            <path d="M9 7h4" />
            <path d="M9 11h4" />
            <path d="M9 15h3" />
            <circle cx="19" cy="17" r="3" />
            <path d="m19 15.5 1.2 1.2L22 15" />
          </svg>
          Gerar texto
        </button>
      </div>

      <div v-else class="preview-flow">
        <section class="module-hero module-hero-preview">
          <div class="module-hero-icon">
            <img :src="iconSv" alt="Sinais vitais" />
          </div>
          <div class="module-hero-copy">
            <h1>Texto pronto</h1>
            <p>Revise, copie ou salve no histórico.</p>
          </div>
        </section>

        <textarea v-model="textoGerado" class="preview-box" rows="8"></textarea>

        <section class="section-card identity-card">
          <div class="identity-grid">
            <div>
              <label class="label-small">Nome do paciente</label>
              <input data-testid="auto-input-sinaisvitaisview-13" class="campo-inline" type="text" v-model="form.nomePaciente" placeholder="Maria da Silva">
            </div>
            <div>
              <label class="label-small">Leito</label>
              <input data-testid="auto-input-sinaisvitaisview-14" class="campo-inline" type="text" v-model="form.leitoPaciente" placeholder="4B">
            </div>
          </div>
        </section>

        <div class="preview-actions">
          <button data-testid="auto-btn-sinaisvitaisview-4" class="btn btn-primary" @click="copiar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            Copiar texto
          </button>
          <button data-testid="auto-btn-sinaisvitaisview-5" class="btn btn-secondary" @click="salvar" :disabled="salvando">
            {{ salvando ? 'Salvando...' : 'Salvar no histórico' }}
          </button>
          <button data-testid="auto-btn-sinaisvitaisview-6" class="btn btn-secondary" @click="compartilhar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
            Compartilhar
          </button>
          <button data-testid="auto-btn-sinaisvitaisview-7" class="btn btn-secondary" @click="novaAfericao">Nova aferição</button>
          <button data-testid="auto-btn-sinaisvitaisview-8" class="btn btn-tertiary" @click="gerado = false">Editar dados</button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAnotacoesStore } from '../../stores/anotacoes.js'
import { useToast } from '../../composables/useToast.js'
import { useRascunho } from '../../composables/useRascunho.js'
import { usePacientesStore } from '../../stores/pacientes.js'
import { useCopia } from '../../composables/useCopia.js'
import iconSv from '../../assets/dashboard-icons-png/sinais-vitais.png'

const router = useRouter()
const store = useAnotacoesStore()
const { showToast } = useToast()
const pacientesStore = usePacientesStore()
const { copiar: _copiar } = useCopia()

onMounted(() => pacientesStore.iniciar())

function selecionarPaciente(p) {
  form.nomePaciente = p.nome
  form.leitoPaciente = p.leito || ''
}

const gerado = ref(false)
const textoGerado = ref('')
const erro = ref('')
const salvando = ref(false)

const form = reactive({
  horario: '',
  paSis: '',
  paDia: '',
  pam: '',
  fc: '',
  fr: '',
  temp: '',
  sat: '',
  dextro: '',
  algias: '',
  dorDesc: '',
  dorEscala: null,
  comunicado: false,
  comunicadoNome: '',
  nomePaciente: '',
  leitoPaciente: '',
})

const { temRascunho, restaurarRascunho, descartarRascunho, iniciarRascunho } =
  useRascunho(
    'rascunho_sinais_vitais',
    form,
    () => !!(form.horario || form.paSis || form.fc || form.temp || form.sat),
  )

iniciarRascunho()

function mostrarFeedback(msg) {
  showToast(msg)
}

function gerar() {
  erro.value = ''
  if (!form.horario) {
    erro.value = 'Informe o horário.'
    return
  }

  const h = form.horario.replace(':', 'h')

  let algiasText = ''
  if (form.algias === 'nega') {
    algiasText = ', nega algias'
  } else if (form.algias === 'refere') {
    const partes = []
    if (form.dorDesc.trim()) partes.push(form.dorDesc.trim())
    if (form.dorEscala !== null) partes.push(`nível ${form.dorEscala}/10 na escala de dor`)
    algiasText = partes.length ? `, refere dor: ${partes.join(', ')}` : ', refere dor'
  }

  const sv = []
  if (form.paSis && form.paDia) sv.push(`PA ${form.paSis}/${form.paDia}mmHg`)
  if (form.pam) sv.push(`PAM ${form.pam}mmHg`)
  if (form.fc) sv.push(`FC ${form.fc}bpm`)
  if (form.fr) sv.push(`FR ${form.fr}rpm`)
  if (form.temp) sv.push(`T ${form.temp}°C`)
  if (form.sat) sv.push(`SAT ${form.sat}%`)
  if (form.dextro) sv.push(`Dextro ${form.dextro}mg/dL`)

  const principais = [form.paSis && form.paDia, form.fc, form.fr, form.temp, form.sat].filter(Boolean).length
  const abertura = principais >= 4
    ? `${h} – Realizado aferição de sinais vitais${algiasText}.`
    : `${h} – Realizado aferição parcial de sinais vitais${algiasText}.`

  let comunicadoLine = ''
  if (form.comunicado) {
    comunicadoLine = form.comunicadoNome.trim()
      ? `\nComunicado ao Enf. ${form.comunicadoNome.trim()} sobre os sinais vitais.`
      : '\nComunicado ao Enf. sobre os sinais vitais.'
  }

  textoGerado.value = sv.length > 0
    ? `${abertura}\n${sv.join('\n')}${comunicadoLine}`
    : abertura + comunicadoLine

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
    const r = await store.salvar({
      tipo: 'sv',
      texto: textoGerado.value,
      nome: form.nomePaciente.trim(),
      leito: form.leitoPaciente.trim(),
    })
    if (r?.modo === 'offline') mostrarFeedback('Salvo offline - sincroniza automático')
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
    const url = `https://wa.me/?text=${encodeURIComponent(texto)}`
    window.open(url, '_blank')
  }
}

function novaAfericao() {
  Object.assign(form, {
    horario: '',
    paSis: '',
    paDia: '',
    pam: '',
    fc: '',
    fr: '',
    temp: '',
    sat: '',
    dextro: '',
    algias: '',
    dorDesc: '',
    dorEscala: null,
    comunicado: false,
    comunicadoNome: '',
  })
  erro.value = ''
  gerado.value = false
  descartarRascunho()
}
</script>

<style scoped>
.sv-screen {
  background:
    radial-gradient(circle at top right, rgba(39, 116, 231, 0.14), transparent 28%),
    linear-gradient(180deg, #091429 0%, #0a1628 100%);
}

.sv-header {
  padding: 14px 16px;
}

.sv-back-btn,
.sv-brand-btn {
  min-height: 42px;
}

.sv-brand-btn {
  gap: 8px;
}

.sv-brand-mark {
  border-radius: 6px;
  display: block;
  box-shadow: 0 10px 20px rgba(10, 18, 36, 0.2);
}

.sv-header-spacer {
  width: 34px;
}

.sv-page {
  padding-top: 20px;
  padding-bottom: 32px;
}

.sv-section {
  margin-bottom: 18px;
}

.section-eyebrow {
  display: block;
  margin-bottom: 10px;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #9aabd0;
}

.patient-chip-row {
  gap: 10px;
}

.patient-chip {
  min-height: 44px;
  padding: 0 18px;
  border: 1px solid rgba(101, 133, 198, 0.35);
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(25, 42, 77, 0.95), rgba(18, 31, 57, 0.96));
  color: #8ea3d4;
  font-size: 0.92rem;
  font-family: inherit;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.18s ease;
}

.patient-chip-on {
  background: linear-gradient(180deg, #2e94ff, #1d72ea);
  color: #fff;
  border-color: rgba(109, 184, 255, 0.85);
  box-shadow: 0 10px 22px rgba(26, 97, 194, 0.26);
}

.module-hero {
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 18px;
  margin-bottom: 22px;
  border-radius: 22px;
  border: 1px solid rgba(70, 132, 230, 0.42);
  background:
    radial-gradient(circle at top left, rgba(44, 117, 235, 0.18), transparent 40%),
    linear-gradient(180deg, rgba(17, 34, 66, 0.98), rgba(14, 28, 54, 0.98));
  box-shadow: 0 18px 34px rgba(2, 7, 16, 0.22);
}

.module-hero-preview {
  margin-bottom: 16px;
}

.module-hero-icon {
  width: 62px;
  height: 62px;
  border-radius: 20px;
  background: radial-gradient(circle at top, rgba(71, 140, 255, 0.38), rgba(39, 88, 170, 0.5));
  border: 1px solid rgba(104, 161, 255, 0.38);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.module-hero-icon img {
  width: 44px;
  height: 44px;
  object-fit: contain;
}

.module-hero-copy h1 {
  margin: 0;
  font-size: 1.9rem;
  line-height: 1;
  font-weight: 800;
  color: #f5f8ff;
}

.module-hero-copy p {
  margin: 8px 0 0;
  font-size: 1rem;
  color: #9aabd0;
}

.module-hero-wave {
  position: absolute;
  right: -6px;
  top: 16px;
  width: 140px;
  height: auto;
  color: rgba(92, 120, 182, 0.18);
}

.time-shell {
  position: relative;
}

.time-shell input {
  width: 100%;
  min-height: 64px;
  padding-right: 16px;
  background: linear-gradient(180deg, rgba(23, 37, 67, 0.96), rgba(18, 30, 56, 0.98));
  border: 1px solid rgba(67, 93, 141, 0.5);
  border-radius: 18px;
  color: #eef4ff;
  font-size: 1.16rem;
  font-family: inherit;
  outline: none;
}

.vitals-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.vital-card {
  padding: 16px 16px 18px;
  border-radius: 20px;
  border: 1px solid rgba(53, 82, 129, 0.5);
  background: linear-gradient(180deg, rgba(19, 35, 66, 0.96), rgba(15, 28, 54, 0.98));
  box-shadow: 0 14px 28px rgba(3, 10, 22, 0.16);
}

.vital-card input {
  width: 100%;
  min-height: 56px;
  background: rgba(18, 33, 60, 0.9);
  border: 1px solid rgba(60, 86, 131, 0.58);
  border-radius: 15px;
  color: #eff4ff;
  font-size: 1rem;
  font-family: inherit;
  padding: 0 16px;
  outline: none;
}

.vital-card input:focus {
  border-color: rgba(87, 157, 255, 0.8);
  box-shadow: 0 0 0 3px rgba(43, 118, 232, 0.14);
}

.vital-card-pa,
.vital-card-inline {
  grid-column: 1 / -1;
}

.vital-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.vital-badge {
  width: 34px;
  height: 34px;
  border-radius: 11px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.vital-badge-blue {
  color: #7ec7ff;
  background: rgba(42, 124, 235, 0.2);
}

.vital-badge-sky {
  color: #8ed8ff;
  background: rgba(44, 142, 255, 0.18);
}

.vital-badge-heart {
  color: #8cb7ff;
  background: rgba(77, 110, 255, 0.18);
}

.vital-badge-cyan {
  color: #6fd8ff;
  background: rgba(43, 171, 210, 0.17);
}

.vital-badge-teal {
  color: #48d2d0;
  background: rgba(28, 141, 159, 0.18);
}

.vital-badge-o2 {
  color: #70b8ff;
  background: rgba(48, 115, 255, 0.18);
}

.vital-badge-drop {
  color: #5ea1ff;
  background: rgba(39, 121, 255, 0.18);
}

.vital-title {
  margin: 0;
  font-size: 0.98rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  color: #eef4ff;
}

.vital-unit,
.sv-unit {
  color: #91a5cf;
  font-size: 0.72rem;
  font-weight: 500;
}

.vital-hint {
  margin: 2px 0 0;
  font-size: 0.78rem;
  color: #7386ad;
}

.pressure-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  gap: 10px;
  align-items: center;
}

.pressure-sep {
  color: #98a7ca;
  font-size: 1.8rem;
  line-height: 1;
  font-weight: 300;
}

.vital-inline-label {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.section-card {
  padding: 18px;
  border-radius: 22px;
  border: 1px solid rgba(50, 76, 122, 0.48);
  background: linear-gradient(180deg, rgba(16, 30, 58, 0.94), rgba(13, 25, 49, 0.96));
  box-shadow: 0 16px 30px rgba(3, 10, 22, 0.15);
}

.segmented-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.segmented-btn {
  min-height: 60px;
  border-radius: 16px;
  border: 1px solid rgba(54, 80, 125, 0.52);
  background: rgba(22, 37, 68, 0.88);
  color: #8ea3d4;
  font-family: inherit;
  font-size: 0.98rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition: all 0.18s ease;
}

.segmented-btn-on {
  background: linear-gradient(180deg, #2f93ff, #1e71ea);
  border-color: rgba(108, 182, 255, 0.84);
  color: #fff;
  box-shadow: 0 10px 22px rgba(28, 101, 214, 0.24);
}

.sv-subcampo {
  margin-top: 16px;
  margin-bottom: 0;
}

.campo label,
.label-small {
  display: block;
  color: #9aabd0;
  margin-bottom: 8px;
  font-size: 0.84rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.campo input[type='text'],
.campo input[type='number'],
.campo input[type='time'],
.campo-inline,
.details-stack input,
.comunicado-input {
  width: 100%;
  min-height: 56px;
  background: rgba(18, 33, 60, 0.9);
  border: 1px solid rgba(60, 86, 131, 0.58);
  border-radius: 16px;
  color: #eff4ff;
  font-family: inherit;
  font-size: 1rem;
  padding: 0 16px;
  outline: none;
}

.campo input:focus,
.campo-inline:focus,
.details-stack input:focus,
.comunicado-input:focus {
  border-color: rgba(87, 157, 255, 0.8);
  box-shadow: 0 0 0 3px rgba(43, 118, 232, 0.14);
}

.chips-wrap {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.chip {
  min-height: 44px;
  padding: 0 16px;
  background: rgba(20, 35, 63, 0.88);
  border: 1px solid rgba(58, 84, 128, 0.6);
  border-radius: 999px;
  color: #8ea3d4;
  font-size: 0.92rem;
  font-family: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.16s ease;
}

.chip-on {
  background: linear-gradient(180deg, #2f93ff, #1e71ea);
  border-color: rgba(108, 182, 255, 0.84);
  color: #fff;
}

.details-stack {
  display: grid;
  gap: 10px;
  margin-top: 12px;
}

.comunicado-input {
  margin-top: 12px;
}

.escala-dor {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip-escala {
  width: 44px;
  min-width: 44px;
  height: 44px;
  padding: 0;
  justify-content: center;
  border-radius: 12px;
}

.chip-escala.chip-on {
  font-weight: 800;
}

.chip-escala.chip-escala-medio:not(.chip-on) {
  border-color: #d78a10;
  color: #d78a10;
}

.chip-escala.chip-escala-alto:not(.chip-on) {
  border-color: #ef7373;
  color: #ef7373;
}

.sv-submit-btn {
  margin-top: 10px;
  min-height: 62px;
  border-radius: 18px;
  font-size: 1.06rem;
  box-shadow: 0 16px 30px rgba(25, 96, 201, 0.28);
}

.erro-msg {
  color: #ff8f8f;
  font-size: 0.94rem;
  margin: 10px 0 0;
}

.preview-flow {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.preview-box {
  background: linear-gradient(180deg, rgba(18, 33, 60, 0.96), rgba(14, 27, 51, 0.98));
  border: 1px solid rgba(60, 86, 131, 0.58);
  border-radius: 20px;
  padding: 18px;
  width: 100%;
  font-size: 0.98rem;
  line-height: 1.7;
  color: #eef4ff;
  font-family: inherit;
  white-space: pre-wrap;
  resize: vertical;
  outline: none;
}

.identity-card {
  padding: 16px;
}

.identity-grid {
  display: grid;
  grid-template-columns: 1.5fr 0.85fr;
  gap: 12px;
}

.preview-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sv-rascunho-banner {
  background: rgba(37, 101, 219, 0.12);
  border: 1px solid rgba(69, 132, 231, 0.3);
  border-radius: 18px;
  padding: 14px 16px;
}

.btn-icon {
  background: none;
  border: none;
  color: var(--text-dim);
  cursor: pointer;
  padding: 6px;
  border-radius: 10px;
  display: flex;
  align-items: center;
}

.btn-icon:active {
  background: var(--bg-hover);
}

.btn-home-logo {
  display: flex;
  align-items: center;
  background: none;
  border: none;
  color: var(--text);
  cursor: pointer;
  font-family: inherit;
  font-size: 0.98rem;
  font-weight: 800;
  letter-spacing: 0.03em;
  padding: 4px 8px;
  border-radius: 10px;
}

.btn-home-logo:active {
  background: var(--bg-hover);
}

.chips-scroll {
  display: flex;
  overflow-x: auto;
  padding-bottom: 2px;
  scrollbar-width: none;
}

.chips-scroll::-webkit-scrollbar {
  display: none;
}

@media (max-width: 390px) {
  .sv-page {
    padding-left: 14px;
    padding-right: 14px;
  }

  .module-hero {
    padding: 16px;
  }

  .module-hero-copy h1 {
    font-size: 1.65rem;
  }

  .module-hero-copy p {
    font-size: 0.94rem;
  }

  .vitals-grid {
    gap: 12px;
  }

  .vital-card {
    padding: 14px;
  }

  .pressure-row {
    gap: 8px;
  }

  .pressure-sep {
    font-size: 1.55rem;
  }

  .segmented-btn {
    min-height: 54px;
    font-size: 0.9rem;
  }

  .chip {
    font-size: 0.86rem;
    padding: 0 14px;
  }

  .escala-dor {
    gap: 7px;
  }

  .chip-escala {
    width: 42px;
    min-width: 42px;
    height: 42px;
    font-size: 0.82rem;
  }

  .identity-grid {
    grid-template-columns: 1fr;
  }
}
</style>
