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
        <section v-if="pacientesStore.pacientes.length > 0" class="paciente-atalho">
          <label>Paciente registrado</label>
          <div class="chips-scroll">
            <button
              v-for="p in pacientesStore.pacientes"
              :key="p._key"
              class="chip"
              :class="{ 'chip-on': form.nomePaciente === p.nome && form.leitoPaciente === (p.leito || '') }"
              @click="selecionarPaciente(p)"
            >{{ p.leito ? p.leito + ' · ' : '' }}{{ p.nome }}</button>
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
                <input data-testid="auto-input-sinaisvitaisview-2" type="tel" inputmode="numeric" pattern="[0-9]*" autocomplete="off" v-model="form.paSis" placeholder="120" @input="manterSomenteDigitos('paSis')">
                <span class="pressure-sep">/</span>
                <input data-testid="auto-input-sinaisvitaisview-3" type="tel" inputmode="numeric" pattern="[0-9]*" autocomplete="off" v-model="form.paDia" placeholder="80" @input="manterSomenteDigitos('paDia')">
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
              <input data-testid="auto-input-sinaisvitaisview-4" type="tel" inputmode="numeric" pattern="[0-9]*" autocomplete="off" v-model="form.pam" placeholder="87" @input="manterSomenteDigitos('pam')">
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
              <input data-testid="auto-input-sinaisvitaisview-5" type="tel" inputmode="numeric" pattern="[0-9]*" autocomplete="off" v-model="form.fc" placeholder="98" @input="manterSomenteDigitos('fc')">
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
              <input data-testid="auto-input-sinaisvitaisview-6" type="tel" inputmode="numeric" pattern="[0-9]*" autocomplete="off" v-model="form.fr" placeholder="17" @input="manterSomenteDigitos('fr')">
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
              <input data-testid="auto-input-sinaisvitaisview-7" type="number" inputmode="decimal" step="0.1" autocomplete="off" v-model="form.temp" placeholder="36,7" @input="manterDecimal('temp')">
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
              <input data-testid="auto-input-sinaisvitaisview-8" type="tel" inputmode="numeric" pattern="[0-9]*" autocomplete="off" v-model="form.sat" placeholder="95" @input="manterSomenteDigitos('sat')">
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
              <input data-testid="auto-input-sinaisvitaisview-9" type="tel" inputmode="numeric" pattern="[0-9]*" autocomplete="off" v-model="form.dextro" placeholder="120" @input="manterSomenteDigitos('dextro')">
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
              <input data-testid="auto-input-sinaisvitaisview-12" type="text" inputmode="text" v-model="form.dorDesc" placeholder="Ex: cefaleia, dor em MMII, dor abdominal">
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
            inputmode="text"
            v-model="form.comunicadoNome"
            class="comunicado-input"
            placeholder="Nome do Enf. (opcional)"
          >
        </section>

        <p v-if="erro" class="erro-msg">{{ erro }}</p>

        <button data-testid="auto-btn-sinaisvitaisview-3" class="btn btn-primary btn-generate sv-submit-btn" @click="gerar">
          <IconGenerateNote />
          Gerar texto
        </button>
      </div>

      <ResultadoAnotacao
        v-else
        :icon="iconSv"
        v-model:texto="textoGerado"
        v-model:nomePaciente="form.nomePaciente"
        v-model:leitoPaciente="form.leitoPaciente"
        :salvando="salvando"
        label-nova="Nova aferição"
        @copiar="copiar"
        @salvar="salvar"
        @compartilhar="compartilhar"
        @nova="novaAfericao"
        @editar="gerado = false"
      />
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
import IconGenerateNote from '../../components/icons/IconGenerateNote.vue'
import ResultadoAnotacao from '../../components/ResultadoAnotacao.vue'
import iconSv from '../../assets/dashboard-icons-png/sinais-vitais.png'

const router = useRouter()
const store = useAnotacoesStore()
const { showToast } = useToast()
const pacientesStore = usePacientesStore()
const { copiar: _copiar } = useCopia()

onMounted(() => pacientesStore.iniciar())

function selecionarPaciente(p) {
  if (form.nomePaciente === p.nome && form.leitoPaciente === (p.leito || '')) {
    form.nomePaciente = ''
    form.leitoPaciente = ''
    return
  }
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

function manterSomenteDigitos(campo) {
  form[campo] = String(form[campo] ?? '').replace(/\D+/g, '')
}

function manterDecimal(campo) {
  const raw = String(form[campo] ?? '').replace(/[^\d.,]/g, '')
  let normalizado = ''
  let temSeparador = false

  for (const char of raw) {
    if (/\d/.test(char)) {
      normalizado += char
      continue
    }

    if (!temSeparador) {
      normalizado += char
      temSeparador = true
    }
  }

  form[campo] = normalizado
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
    radial-gradient(circle at top right, var(--blue-faint), transparent 28%),
    var(--bg);
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
  box-shadow: var(--shadow-md);
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
  color: var(--text-dim);
}

.paciente-atalho {
  padding: 14px 16px;
  margin-bottom: 14px;
  border-radius: 18px;
  border: 1px solid var(--border);
  background: var(--bg-card);
  box-shadow: 0 14px 28px rgba(3, 10, 22, 0.16);
}

.paciente-atalho label {
  display: block;
  color: var(--text-dim);
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-bottom: 10px;
}

.paciente-atalho .chips-scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 2px;
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
  border: 1px solid var(--border);
  background: var(--bg-card);
  box-shadow: var(--shadow-lg);
}

.module-hero-preview {
  margin-bottom: 16px;
}

.module-hero-icon {
  width: 68px;
  height: 68px;
  border-radius: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid var(--border);
  background: radial-gradient(circle at top, color-mix(in srgb, var(--blue) 18%, transparent), color-mix(in srgb, var(--blue-dark) 36%, var(--bg-input) 64%));
  box-shadow: var(--shadow-sm);
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
  color: var(--text);
}

.module-hero-copy p {
  margin: 8px 0 0;
  font-size: 1rem;
  color: var(--text-dim);
}

.module-hero-wave {
  position: absolute;
  right: -6px;
  top: 16px;
  width: 140px;
  height: auto;
  color: color-mix(in srgb, var(--text-dim) 32%, transparent);
}

.time-shell {
  position: relative;
}

.time-shell input {
  width: 100%;
  min-height: 64px;
  padding-right: 16px;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: 18px;
  color: var(--text);
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
  border: 1px solid var(--border);
  background: var(--bg-card);
  box-shadow: var(--shadow-md);
}

.vital-card input {
  width: 100%;
  min-height: 56px;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: 15px;
  color: var(--text);
  font-size: 1rem;
  font-family: inherit;
  padding: 0 16px;
  outline: none;
}

.vital-card input:focus {
  border-color: var(--blue);
  box-shadow: var(--shadow-sm);
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
  color: var(--text-info);
  background: var(--blue-muted);
}

.vital-badge-sky {
  color: var(--text-info);
  background: var(--blue-muted);
}

.vital-badge-heart {
  color: var(--text-info);
  background: var(--blue-muted);
}

.vital-badge-cyan {
  color: var(--text-info);
  background: var(--blue-faint);
}

.vital-badge-teal {
  color: var(--text-info);
  background: var(--blue-faint);
}

.vital-badge-o2 {
  color: var(--text-info);
  background: var(--blue-muted);
}

.vital-badge-drop {
  color: var(--text-info);
  background: var(--blue-muted);
}

.vital-title {
  margin: 0;
  font-size: 0.98rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  color: var(--text);
}

.vital-unit,
.sv-unit {
  color: var(--text-dim);
  font-size: 0.72rem;
  font-weight: 500;
}

.vital-hint {
  margin: 2px 0 0;
  font-size: 0.78rem;
  color: var(--text-muted);
}

.pressure-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  gap: 10px;
  align-items: center;
}

.pressure-sep {
  color: var(--text-dim);
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
  border: 1px solid var(--border);
  background: var(--bg-card);
  box-shadow: var(--shadow-md);
}

.segmented-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.segmented-btn {
  min-height: 60px;
  border-radius: 16px;
  border: 1px solid var(--border);
  background: var(--bg-input);
  color: var(--text-dim);
  font-family: inherit;
  font-size: 0.98rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition: all 0.18s ease;
}

.segmented-btn-on {
  background: linear-gradient(180deg, var(--blue), var(--blue-dark));
  border-color: var(--blue);
  color: var(--text-on-accent);
  box-shadow: var(--shadow-md);
}

.sv-subcampo {
  margin-top: 16px;
  margin-bottom: 0;
}

.campo label,
.label-small {
  display: block;
  color: var(--text-dim);
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
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: 16px;
  color: var(--text);
  font-family: inherit;
  font-size: 1rem;
  padding: 0 16px;
  outline: none;
}

.campo input:focus,
.campo-inline:focus,
.details-stack input:focus,
.comunicado-input:focus {
  border-color: var(--blue);
  box-shadow: var(--shadow-sm);
}

.chips-wrap {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.chip {
  min-height: 44px;
  padding: 0 16px;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: 999px;
  color: var(--text-dim);
  font-size: 0.92rem;
  font-family: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.16s ease;
}

.chip-on {
  background: linear-gradient(180deg, var(--blue), var(--blue-dark));
  border-color: var(--blue);
  color: var(--text-on-accent);
  box-shadow: 0 7px 16px color-mix(in srgb, var(--blue) 16%, transparent);
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
  border-color: var(--warning);
  color: var(--warning);
}

.chip-escala.chip-escala-alto:not(.chip-on) {
  border-color: var(--danger);
  color: var(--danger);
}

.sv-submit-btn {
  margin-top: 10px;
  min-height: 62px;
  border-radius: 18px;
  font-size: 1.06rem;
  box-shadow: var(--shadow-md);
}

.erro-msg {
  color: var(--text-danger-soft);
  font-size: 0.94rem;
  margin: 10px 0 0;
}

.preview-flow {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.preview-box {
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 18px;
  width: 100%;
  font-size: 0.98rem;
  line-height: 1.7;
  color: var(--text);
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
  background: var(--blue-muted);
  border: 1px solid var(--border);
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
