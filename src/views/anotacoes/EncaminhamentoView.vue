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
          <label>Tipo de anotação</label>
          <div class="chips-wrap">
            <button class="chip" :class="{ 'chip-on': form.tipo === 'ida' }"
              @click="form.tipo = 'ida'">🚑 Encaminhamento</button>
            <button class="chip" :class="{ 'chip-on': form.tipo === 'retorno' }"
              @click="form.tipo = 'retorno'">🔙 Retorno</button>
          </div>
        </div>

        <div class="campo">
          <label>Horário <span class="obrigatorio">*</span></label>
          <input type="time" v-model="form.horario">
        </div>

        <div class="campo">
          <label>Gênero do paciente</label>
          <div class="chips-wrap">
            <button class="chip" :class="{ 'chip-on': form.genero === 'M' }" @click="form.genero = 'M'">M</button>
            <button class="chip" :class="{ 'chip-on': form.genero === 'F' }" @click="form.genero = 'F'">F</button>
          </div>
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

      <!-- ═══ BLOCO 2 — Destino/Origem e Transporte ═══ -->
      <div v-if="!gerado && passo === 2">
        <h2 class="bloco-titulo">{{ form.tipo === 'retorno' ? 'Origem e Transporte' : 'Destino e Transporte' }}</h2>

        <!-- Destino (apenas Encaminhamento) -->
        <div v-if="form.tipo === 'ida'" class="campo">
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

        <!-- Campos Retorno -->
        <div v-if="form.tipo === 'retorno'" class="campo">
          <label>Local de origem <span class="obrigatorio">*</span></label>
          <input type="text" v-model="form.localRetorno" placeholder="Ex: 3° andar do INRAD, Centro Cirúrgico...">
        </div>
        <div v-if="form.tipo === 'retorno'" class="campo">
          <label>Procedimento realizado <span class="opc">(opcional)</span></label>
          <input type="text" v-model="form.procedRetorno" placeholder="Ex: realização de tomografia, avaliação cirúrgica...">
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

        <!-- ── Dispositivos em uso ── -->
        <div class="campo">
          <label>Dispositivos em uso</label>

          <!-- Chips de seleção -->
          <div class="chips-wrap" style="margin-top:8px">
            <button
              v-for="d in dispositivosSimples" :key="d"
              class="chip" :class="{ 'chip-on': dispSimplesAtivos.includes(d) }"
              @click="toggleDispSimples(d)"
            >{{ d }}</button>

            <button class="chip" :class="{ 'chip-on': cvc.ativo }"      @click="toggleAcessoLocal(cvc)">CVC</button>
            <button class="chip" :class="{ 'chip-on': picc.ativo }"     @click="toggleAcessoLocal(picc)">PICC</button>
            <button class="chip" :class="{ 'chip-on': permcath.ativo }" @click="toggleAcessoLocal(permcath)">Permcath</button>
            <button class="chip" :class="{ 'chip-on': shilley.ativo }"  @click="toggleAcessoLocal(shilley)">Shilley</button>

            <button
              class="chip" :class="{ 'chip-on': catO2.ativo }"
              @click="toggleCatO2"
            >Cateter nasal O₂</button>

            <button
              class="chip" :class="{ 'chip-on': sne.ativo }"
              @click="toggleSne"
            >SNE</button>

            <button
              class="chip" :class="{ 'chip-on': pulseirasAtivas.length > 0 }"
              @click="togglePulseirasCard"
            >Pulseiras</button>

            <button class="chip chip-add" @click="addAVP">+ AVP</button>
            <button class="chip chip-add" @click="addDreno">+ Dreno</button>
            <button class="chip chip-add" @click="addOutro">+ Outro</button>

            <button
              class="chip" :class="{ 'chip-on': nenhumAtivo }"
              @click="toggleNenhum"
            >Nenhum</button>
          </div>

          <!-- Cards: acessos vasculares centrais -->
          <template v-for="[nome, acc, locs] in acessosCentrais" :key="nome">
            <div v-if="acc.ativo" class="disp-card">
              <div class="disp-card-header">
                <span class="disp-card-title">🩸 {{ nome }}</span>
              </div>
              <div class="chips-wrap" style="margin-top:4px">
                <button
                  v-for="loc in locs" :key="loc"
                  class="chip chip-sm" :class="{ 'chip-on': acc.local === loc }"
                  @click="acc.local = acc.local === loc ? '' : loc"
                >{{ loc }}</button>
              </div>
              <!-- Infusões (até 3) -->
              <div v-for="(_, idx) in acc.infusoes" :key="idx" style="display:flex;align-items:center;gap:6px;margin-top:8px">
                <input
                  type="text"
                  v-model="acc.infusoes[idx]"
                  placeholder="Ex: noradrenalina + SF 0,9% a 10ml/h"
                  style="flex:1"
                >
                <button class="disp-del-btn" @click="acc.infusoes.splice(idx, 1)" style="padding:2px 8px">✕</button>
              </div>
              <button
                v-if="acc.infusoes.length < 3"
                class="chip chip-add"
                style="margin-top:8px;font-size:0.78rem;padding:5px 12px"
                @click="acc.infusoes.push('')"
              >+ Infusão</button>
            </div>
          </template>

          <!-- Card: Cateter nasal O₂ -->
          <div v-if="catO2.ativo" class="disp-card">
            <div class="disp-card-header">
              <span class="disp-card-title">🫁 Cateter nasal O₂</span>
            </div>
            <div style="display:flex;align-items:center;gap:8px;margin-top:4px">
              <input
                type="number"
                v-model="catO2.lMin"
                placeholder="Ex: 3"
                style="width:90px"
                min="1" max="15" step="0.5"
              >
              <span class="disp-unit">L/min</span>
            </div>
          </div>

          <!-- Cards: AVP -->
          <div v-for="avp in avps" :key="avp.id" class="disp-card">
            <div class="disp-card-header">
              <span class="disp-card-title">💉 AVP</span>
              <button class="disp-del-btn" @click="removeAVP(avp.id)">✕</button>
            </div>
            <div class="chips-wrap" style="margin-bottom:10px">
              <button
                v-for="loc in locaisAVP" :key="loc"
                class="chip chip-sm" :class="{ 'chip-on': avp.local === loc }"
                @click="avp.local = avp.local === loc ? '' : loc"
              >{{ loc }}</button>
            </div>
            <label class="toggle-row">
              <input type="checkbox" v-model="avp.emInfusao">
              <span>Em infusão</span>
            </label>
            <input
              v-if="avp.emInfusao"
              type="text"
              v-model="avp.infundindo"
              placeholder="Ex: tiamina 100mg + 100ml SF0,9% a 35ml/h em BIC"
              style="margin-top:8px"
            >
          </div>

          <!-- Card: SNE -->
          <div v-if="sne.ativo" class="disp-card">
            <div class="disp-card-header">
              <span class="disp-card-title">🥤 SNE</span>
            </div>
            <div class="chip-row" style="margin-top:6px">
              <button
                class="chip"
                :class="{ 'chip-on': sne.dietaTipo === 'integral' }"
                @click="sne.dietaTipo = sne.dietaTipo === 'integral' ? '' : 'integral'"
              >Dieta integral</button>
              <button
                class="chip"
                :class="{ 'chip-on': sne.dietaTipo === 'outro' }"
                @click="sne.dietaTipo = sne.dietaTipo === 'outro' ? '' : 'outro'; sne.dietaDesc = ''"
              >Outro</button>
            </div>
            <input
              v-if="sne.dietaTipo === 'outro'"
              type="text"
              v-model="sne.dietaDesc"
              placeholder="Descreva a dieta..."
              style="margin-top:8px"
            >
            <div v-if="sne.dietaTipo" class="input-suffix-row" style="margin-top:8px">
              <input
                type="number"
                inputmode="decimal"
                v-model="sne.mlH"
                placeholder="0"
                min="0"
                step="0.1"
                style="width:80px"
              >
              <span class="input-suffix">ml/h</span>
            </div>
          </div>

          <!-- Cards: Dreno -->
          <div v-for="dreno in drenos" :key="dreno.id" class="disp-card">
            <div class="disp-card-header">
              <span class="disp-card-title">🩺 Dreno</span>
              <button class="disp-del-btn" @click="removeDreno(dreno.id)">✕</button>
            </div>
            <input
              type="text"
              v-model="dreno.local"
              placeholder="Ex: tórax direito, abdominal, lombar..."
              style="margin-top:4px"
            >
          </div>

          <!-- Cards: Outro dispositivo -->
          <div v-for="outro in outros" :key="outro.id" class="disp-card">
            <div class="disp-card-header">
              <span class="disp-card-title">📎 Outro dispositivo</span>
              <button class="disp-del-btn" @click="removeOutro(outro.id)">✕</button>
            </div>
            <input
              type="text"
              v-model="outro.descricao"
              placeholder="Descreva o dispositivo..."
              style="margin-top:4px"
            >
          </div>

          <!-- Card: Pulseiras -->
          <div v-if="pulseirasCardAberto" class="disp-card">
            <div class="disp-card-header">
              <span class="disp-card-title">🏷️ Pulseiras presentes</span>
            </div>
            <div class="chips-wrap" style="margin-top:4px">
              <button
                v-for="op in pulseirasOpcoes" :key="op"
                class="chip chip-sm" :class="{ 'chip-on': pulseirasAtivas.includes(op) }"
                @click="togglePulseiraOpcao(op)"
              >{{ op }}</button>
            </div>
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

const _destinosCacheKey = code => `cache_enc_destinos_${code}`

function iniciarDestinos() {
  const code = _code()
  if (!code) return

  // Restaura do cache antes do Firebase responder
  try {
    const cached = JSON.parse(localStorage.getItem(_destinosCacheKey(code)) || '[]')
    if (cached.length) destinosCustom.value = cached
  } catch {}

  const path = dbRef(db, `encaminhamento/${code}/destinos`)
  unsubDestinos = onValue(path, (snap) => {
    const lista = []
    snap.forEach(c => { lista.push({ ...c.val(), _key: c.key }) })
    lista.sort((a, b) => (a.criadoEm || 0) - (b.criadoEm || 0))
    destinosCustom.value = lista
    try { localStorage.setItem(_destinosCacheKey(code), JSON.stringify(lista)) } catch {}
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
  if (!navigator.onLine) {
    showToast('Sem internet — destino não foi salvo')
    return
  }
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
  tipo:            'ida',
  horario:         '',
  genero:          'M',
  nome:            '',
  leito:           '',
  destino:         '',
  transporte:      '',
  transporteOutro: '',
  motivo:          '',
  condicao:        '',
  localRetorno:    '',
  procedRetorno:   '',
  cargo:           '',
  nomeAcomp:       '',
  recebidoPor:     '',
  observacoes:     '',
})

// ── Rascunho ──
const { temRascunho, restaurarRascunho, descartarRascunho, iniciarRascunho } =
  useRascunho('rascunho_encaminhamento', form, () => !!(form.horario || form.nome || form.destino))

// ── Opções ──
const destinosPadrao   = ['UTI', 'Centro Cirúrgico', 'Raio-X', 'Tomografia', 'Endoscopia', 'Hemodinâmica']
const transporteOpcoes = ['Cadeira de rodas', 'Maca', 'A pé', 'Ambulância']

const cargoOpcoes = [
  { label: 'Téc. de enfermagem', texto: 'técnico de enfermagem',  artigo: 'do' },
  { label: 'Téc.ª de enfermagem', texto: 'técnica de enfermagem', artigo: 'da' },
  { label: 'Enf.',               texto: 'enfermeiro',             artigo: 'do' },
  { label: 'Enf.ª',              texto: 'enfermeira',             artigo: 'da' },
  { label: 'Médico',             texto: 'médico',                 artigo: 'do' },
  { label: 'Médica',             texto: 'médica',                 artigo: 'da' },
  { label: 'Sem acompanhante',   texto: 'sem acompanhante',       artigo: ''   },
]

// ── Dispositivos ──
const dispositivosSimples = ['SVD', 'SNG', 'TOT']
const locaisAVP     = ['MSE', 'MSD', 'MIE', 'MID']
const locaisCentral = ['femoral D', 'femoral E', 'jugular D', 'jugular E', 'subclávia D', 'subclávia E']

const dispSimplesAtivos = ref([])
const catO2    = reactive({ ativo: false, lMin: '' })
const sne      = reactive({ ativo: false, dietaTipo: '', dietaDesc: '', mlH: '' })
const cvc      = reactive({ ativo: false, local: '', infusoes: [] })
const picc     = reactive({ ativo: false, local: '', infusoes: [] })
const permcath = reactive({ ativo: false, local: '', infusoes: [] })
const shilley  = reactive({ ativo: false, local: '', infusoes: [] })

// Para o v-for dos cards de acesso central no template
const acessosCentrais = [
  ['CVC',      cvc,      locaisCentral],
  ['PICC',     picc,     locaisAVP],
  ['Permcath', permcath, locaisCentral],
  ['Shilley',  shilley,  locaisCentral],
]

const pulseirasAtivas = ref([])
const pulseirasCardAberto = ref(false)
const pulseirasOpcoes = ['Identificação', 'Alergia', 'Risco de queda', 'Precaução', 'Preservação de membro']
let avpIdCtr   = 0
let drenoIdCtr = 0
let outroIdCtr = 0
const avps   = ref([])
const drenos = ref([])
const outros = ref([])
const nenhumAtivo = ref(false)

function _limparNenhum() { nenhumAtivo.value = false }

function toggleDispSimples(key) {
  _limparNenhum()
  if (dispSimplesAtivos.value.includes(key)) {
    dispSimplesAtivos.value = dispSimplesAtivos.value.filter(d => d !== key)
  } else {
    dispSimplesAtivos.value = [...dispSimplesAtivos.value, key]
  }
}

function toggleAcessoLocal(acc) {
  _limparNenhum()
  acc.ativo = !acc.ativo
  if (!acc.ativo) { acc.local = ''; acc.infusoes = [] }
}

function toggleCatO2() {
  _limparNenhum()
  catO2.ativo = !catO2.ativo
  if (!catO2.ativo) catO2.lMin = ''
}

function toggleSne() {
  _limparNenhum()
  sne.ativo = !sne.ativo
  if (!sne.ativo) { sne.dietaTipo = ''; sne.dietaDesc = ''; sne.mlH = '' }
}

function togglePulseirasCard() {
  _limparNenhum()
  if (pulseirasCardAberto.value) {
    pulseirasCardAberto.value = false
    pulseirasAtivas.value = []
  } else {
    pulseirasCardAberto.value = true
  }
}

function togglePulseiraOpcao(op) {
  if (pulseirasAtivas.value.includes(op)) {
    pulseirasAtivas.value = pulseirasAtivas.value.filter(p => p !== op)
  } else {
    pulseirasAtivas.value = [...pulseirasAtivas.value, op]
  }
}

function addAVP() {
  _limparNenhum()
  avps.value.push({ id: ++avpIdCtr, local: '', emInfusao: false, infundindo: '' })
}
function removeAVP(id) { avps.value = avps.value.filter(a => a.id !== id) }

function addDreno() {
  _limparNenhum()
  drenos.value.push({ id: ++drenoIdCtr, local: '' })
}
function removeDreno(id) { drenos.value = drenos.value.filter(d => d.id !== id) }

function addOutro() {
  _limparNenhum()
  outros.value.push({ id: ++outroIdCtr, descricao: '' })
}
function removeOutro(id) { outros.value = outros.value.filter(o => o.id !== id) }

function toggleNenhum() {
  if (nenhumAtivo.value) {
    nenhumAtivo.value = false
  } else {
    dispSimplesAtivos.value = []
    catO2.ativo = false; catO2.lMin = ''
    sne.ativo = false; sne.dietaTipo = ''; sne.dietaDesc = ''; sne.mlH = ''
    cvc.ativo = false; cvc.local = ''; cvc.infusoes = []
    picc.ativo = false; picc.local = ''; picc.infusoes = []
    permcath.ativo = false; permcath.local = ''; permcath.infusoes = []
    shilley.ativo = false; shilley.local = ''; shilley.infusoes = []
    pulseirasAtivas.value = []; pulseirasCardAberto.value = false
    avps.value = []; drenos.value = []; outros.value = []
    nenhumAtivo.value = true
  }
}

function limparDispositivos() {
  dispSimplesAtivos.value = []
  catO2.ativo = false; catO2.lMin = ''
  sne.ativo = false; sne.dieta = false; sne.dietaDesc = ''
  cvc.ativo = false; cvc.local = ''; cvc.infusoes = []
  picc.ativo = false; picc.local = ''; picc.infusoes = []
  permcath.ativo = false; permcath.local = ''; permcath.infusoes = []
  shilley.ativo = false; shilley.local = ''; shilley.infusoes = []
  pulseirasAtivas.value = []; pulseirasCardAberto.value = false
  avps.value = []; drenos.value = []; outros.value = []
  nenhumAtivo.value = false
}

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

// ── Navegação ──
function voltarOuSair() {
  if (passo.value > 1 && !gerado.value) { passo.value--; return }
  router.push({ name: 'dashboard' })
}

function limparBloco() {
  erro.value = ''
  if (passo.value === 1) {
    form.horario = ''; form.nome = ''; form.leito = ''
  } else if (passo.value === 2) {
    form.destino = ''; form.transporte = ''; form.transporteOutro = ''
    form.motivo = ''; form.condicao = ''
    form.localRetorno = ''; form.procedRetorno = ''
  } else if (passo.value === 3) {
    form.cargo = ''; form.nomeAcomp = ''
    limparDispositivos()
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
    if (form.tipo === 'ida' && !form.destino.trim()) {
      erro.value = 'Informe o destino.'
      return
    }
    if (form.tipo === 'retorno' && !form.localRetorno.trim()) {
      erro.value = 'Informe o local de origem.'
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

// ── Texto dos dispositivos ──
function gerarTextoDispositivos() {
  if (nenhumAtivo.value) return []
  const partes = []

  // Simples (SVD, SNG, TOT)
  for (const d of dispositivosSimples) {
    if (dispSimplesAtivos.value.includes(d)) partes.push(d)
  }

  // Acessos vasculares centrais
  for (const [nome, acc] of [['CVC', cvc], ['PICC', picc], ['Permcath', permcath], ['Shilley', shilley]]) {
    if (acc.ativo) {
      let txt = nome
      if (acc.local) txt += ` em ${acc.local}`
      const infs = (acc.infusoes || []).map(i => i.trim()).filter(Boolean)
      if (infs.length === 1) txt += ` recebendo ${infs[0]}`
      else if (infs.length > 1) txt += ` recebendo ${infs.join(', ')}`
      partes.push(txt)
    }
  }

  // AVPs
  for (const avp of avps.value) {
    let txt = 'AVP'
    if (avp.local) txt += ` em ${avp.local}`
    if (avp.emInfusao && avp.infundindo.trim()) txt += ` recebendo ${avp.infundindo.trim()}`
    partes.push(txt)
  }

  // Cateter nasal O₂
  if (catO2.ativo) {
    let txt = 'cateter nasal de O₂'
    if (catO2.lMin) txt += ` a ${catO2.lMin}L/min`
    partes.push(txt)
  }

  // SNE
  if (sne.ativo) {
    let txt = 'SNE'
    if (sne.dietaTipo === 'integral') {
      txt += ' com dieta enteral integral'
      if (sne.mlH) txt += ` a ${sne.mlH}ml/h`
    } else if (sne.dietaTipo === 'outro') {
      const desc = sne.dietaDesc.trim()
      txt += desc ? ` com ${desc}` : ' com dieta enteral'
      if (sne.mlH) txt += ` a ${sne.mlH}ml/h`
    }
    partes.push(txt)
  }

  // Drenos
  for (const dreno of drenos.value) {
    let txt = 'dreno'
    if (dreno.local.trim()) txt += ` em ${dreno.local.trim()}`
    partes.push(txt)
  }

  // Outros
  for (const outro of outros.value) {
    if (outro.descricao.trim()) partes.push(outro.descricao.trim())
  }

  return partes
}

// ── Texto de pulseiras (frase separada) ──
function gerarTextoPulseiras() {
  if (!pulseirasAtivas.value.length) return ''
  const nomes = pulseirasAtivas.value.map(p => p.toLowerCase())
  const plural = nomes.length > 1 ? 'pulseiras' : 'pulseira'
  return `Paciente com ${plural} de ${nomes.join(' e ')}.`
}

// ── Helper hora ──
function formatHora(h) { return h ? h.replace(':', 'h') : '' }

// ── Gerar texto ──
function gerar() {
  erro.value = ''
  if (!form.cargo) { erro.value = 'Selecione o acompanhante.'; return }

  // Transporte
  const transporteTxt = form.transporte === '__outro__'
    ? form.transporteOutro.trim()
    : form.transporte.toLowerCase()

  // Acompanhante (compartilhado)
  const cargo = cargoOpcoes.find(c => c.label === form.cargo)
  const enc   = form.genero === 'F' ? 'encaminhada' : 'encaminhado'
  const acomp = form.genero === 'F' ? 'acompanhada' : 'acompanhado'

  let acompTxt = ''
  if (cargo && cargo.texto === 'sem acompanhante') {
    acompTxt = ', sem acompanhante'
  } else if (cargo) {
    acompTxt = `, ${acomp} ${cargo.artigo} ${cargo.texto}`
    if (form.nomeAcomp.trim()) acompTxt += ` ${form.nomeAcomp.trim()}`
  }

  let texto = ''

  if (form.tipo === 'retorno') {
    // ── RETORNO ──
    texto = `${formatHora(form.horario)} – paciente retorna para unidade de internação, em ${transporteTxt}`
    texto += acompTxt
    // Procedimento + local
    const proc  = form.procedRetorno.trim()
    const local = form.localRetorno.trim()
    if (proc && local) texto += `, após ${proc} no ${local}`
    else if (local)    texto += `, proveniente de ${local}`
    else if (proc)     texto += `, após ${proc}`
    texto += '.'
  } else {
    // ── IDA ──
    texto = `${formatHora(form.horario)} – paciente ${enc} em ${transporteTxt}`
    texto += acompTxt
    texto += `, para ${form.destino}`
    if (form.motivo.trim()) texto += `, para ${form.motivo.trim()}`
    texto += '.'
  }

  // Condição (opcional)
  if (form.condicao) texto += ` Condição clínica: ${form.condicao}.`

  // Dispositivos
  const disps = gerarTextoDispositivos()
  if (disps.length > 0) {
    texto += ` Dispositivos em uso: ${disps.join(', ')}.`
  }

  // Pulseiras (frase separada)
  const txtPulseiras = gerarTextoPulseiras()
  if (txtPulseiras) texto += ` ${txtPulseiras}`

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
    tipo: 'ida',
    horario: '', genero: 'M', nome: '', leito: '', destino: '',
    transporte: '', transporteOutro: '', motivo: '', condicao: '',
    localRetorno: '', procedRetorno: '',
    cargo: '', nomeAcomp: '', recebidoPor: '', observacoes: '',
  })
  limparDispositivos()
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
  padding: 8px 14px; border-radius: 20px;
  border: 1px solid var(--border); background: var(--bg-card);
  color: var(--text-dim); font-size: 0.9rem;
  cursor: pointer; font-family: inherit; transition: all 0.15s;
  display: flex; align-items: center; gap: 4px;
}
.chip:active { opacity: 0.8; }
.chip-on { background: var(--blue); border-color: var(--blue); color: #fff; }
.chip-sm { padding: 6px 12px; font-size: 0.85rem; }

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

/* ── Dispositivos cards ── */
.disp-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 12px 14px;
  margin-top: 10px;
}
.disp-card-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 8px;
}
.disp-card-title {
  font-size: 0.85rem; font-weight: 600; color: var(--text);
}
.disp-del-btn {
  background: none; border: none; color: var(--text-muted);
  cursor: pointer; font-size: 0.85rem; padding: 2px 6px; border-radius: 4px;
  font-family: inherit;
}
.disp-del-btn:active { background: var(--bg-hover); color: var(--danger); }
.disp-unit { font-size: 0.85rem; color: var(--text-dim); }
.input-suffix-row { display: flex; align-items: center; gap: 6px; }
.input-suffix { font-size: 0.85rem; color: var(--text-dim); white-space: nowrap; }

.toggle-row {
  display: flex; align-items: center; gap: 8px;
  cursor: pointer; font-size: 0.85rem; color: var(--text-dim);
  user-select: none;
}
.toggle-row input[type="checkbox"] { cursor: pointer; width: 15px; height: 15px; }

/* ── Nav ── */
.bloco-nav { display: flex; gap: 10px; margin-top: 12px; align-items: center; }
.bloco-nav .btn-primary { flex: 1; }

/* ── Resultado ── */
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
</style>
