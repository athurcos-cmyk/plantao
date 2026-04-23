<template>
  <div class="screen">
    <header class="app-header dashboard-header">
      <div class="header-brand">
        <img src="/icons/icon-512.png" width="28" height="28" alt="Plantão" class="header-logo-mark" />
        <div class="header-brand-copy">
          <span class="header-brand-title">Plantão</span>
          <div class="header-shortcuts">
            <button class="header-chip" @click="tourRef?.abrirTour()">Tutorial</button>
            <button class="header-chip" @click="helpAberto = true">Ajuda</button>
            <button class="header-chip" @click="abrirFeedback">Feedback</button>
          </div>
        </div>
      </div>

      <div class="header-actions">
        <button class="btn-icon" @click="router.push({ name: 'historico' })" title="Histórico">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
            <path d="M4 12a8 8 0 0 1 8-8" />
          </svg>
        </button>
        <button class="btn-icon" @click="router.push({ name: 'configuracoes' })" title="Configurações">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09A1.65 1.65 0 0 0 15 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </div>
    </header>

    <main class="container dashboard-main">
      <section class="hero-card">
        <div class="hero-copy">
          <p class="hero-greeting">{{ saudacaoTexto }}</p>
          <h1 class="hero-name">{{ auth.userName || 'Profissional' }}</h1>
          <p class="hero-subtitle">Seu painel do plantão de hoje.</p>
        </div>

        <img class="hero-illustration" :src="heroIllustration" alt="Profissional de enfermagem" />
      </section>

      <section class="sync-card">
        <div class="sync-status-badge" :class="syncBadgeClass">
          <svg v-if="totalPendencias === 0" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4">
            <circle cx="12" cy="12" r="9" />
            <path d="m8.5 12.5 2.2 2.2 4.8-5.2" />
          </svg>
          <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4">
            <path d="M12 3a9 9 0 1 0 8.48 12" />
            <path d="M12 7v5l3 2" />
            <path d="M17 3v4h4" />
          </svg>
        </div>

        <div class="sync-copy">
          <p class="sync-title">{{ syncTitle }}</p>
          <p class="sync-subtitle">{{ syncDescription }}</p>
          <div v-if="totalPendencias > 0" class="sync-chips">
            <span v-if="pendAnotacoes > 0" class="sync-chip">Anotações {{ pendAnotacoes }}</span>
            <span v-if="pendPacientes > 0" class="sync-chip">Pacientes {{ pendPacientes }}</span>
            <span v-if="pendModelos > 0" class="sync-chip">Modelos {{ pendModelos }}</span>
            <span v-if="pendOrganizador > 0" class="sync-chip">Organizador {{ pendOrganizador }}</span>
          </div>
        </div>

        <button class="sync-btn" :disabled="sincronizandoAgora || !isOnline" @click="sincronizarAgora">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M21 12a9 9 0 0 0-15.5-6.36" />
            <path d="M3 4v5h5" />
            <path d="M3 12a9 9 0 0 0 15.5 6.36" />
            <path d="M21 20v-5h-5" />
          </svg>
          <span>{{ syncButtonLabel }}</span>
        </button>
      </section>

      <div class="utility-row">
        <button class="utility-chip" @click="abrirJanelaLateral">Ao lado</button>
        <button class="utility-chip" @click="pcModalAberto = true">No computador</button>
      </div>

      <section ref="anotacoesSection" class="dashboard-section">
        <div class="section-head">
          <h2 class="section-title">Anotações</h2>
          <span class="section-link">Acesso rápido</span>
        </div>

        <div class="tipos-grid">
          <button
            v-for="tipo in tiposDashboard"
            :key="tipo.id"
            data-testid="auto-btn-dashboardview-2"
            :class="['tipo-card', `tipo-card-${tipo.id}`]"
            @click="navegar(tipo)"
          >
            <span class="tipo-icon">
              <img class="tipo-icon-img" :src="tipo.icon" :alt="tipo.nome" />
            </span>
            <span class="tipo-nome">{{ tipo.nome }}</span>
            <span v-if="tipo.meta" class="tipo-meta">{{ tipo.meta }}</span>
          </button>
        </div>
      </section>

      <section class="dashboard-section">
        <div class="section-head section-head-spaced">
          <h2 class="section-title">Atalhos do plantão</h2>
        </div>

        <div class="atalhos-list">
          <button data-testid="auto-btn-dashboardview-3" class="atalho-card" @click="router.push({ name: 'historico' })">
            <span class="atalho-icon">
              <img class="atalho-icon-img" :src="iconHistorico" alt="Histórico" />
            </span>
            <span class="atalho-copy">
              <span class="atalho-title">Histórico</span>
              <span class="atalho-sub">Buscar, copiar e reaproveitar anotações</span>
            </span>
            <span class="atalho-arrow">›</span>
          </button>

          <button class="atalho-card" @click="router.push({ name: 'pacientes' })">
            <span class="atalho-icon">
              <img class="atalho-icon-img" :src="iconPacientes" alt="Meus Pacientes" />
            </span>
            <span class="atalho-copy">
              <span class="atalho-title">Meus Pacientes</span>
              <span class="atalho-sub">Pendências e atalhos por leito</span>
            </span>
            <span class="atalho-arrow">›</span>
          </button>

          <button class="atalho-card" @click="router.push({ name: 'organizador' })">
            <span class="atalho-icon">
              <img class="atalho-icon-img" :src="iconOrganizador" alt="Organizador do Plantão" />
            </span>
            <span class="atalho-copy">
              <span class="atalho-title">Organizador do plantão</span>
              <span class="atalho-sub">{{ organizadorResumo }}</span>
            </span>
            <span class="atalho-arrow">›</span>
          </button>

          <button class="atalho-card" @click="router.push({ name: 'configuracoes' })">
            <span class="atalho-icon">
              <img class="atalho-icon-img" :src="iconConfiguracao" alt="Configurações" />
            </span>
            <span class="atalho-copy">
              <span class="atalho-title">Configurações</span>
              <span class="atalho-sub">Preferências, conta e integrações</span>
            </span>
            <span class="atalho-arrow">›</span>
          </button>
        </div>
      </section>

      <div v-if="pulsoVisivel" class="feedback-overlay" @click.self="dispensarPulso">
        <div class="feedback-modal">
          <div class="pulso-header">
            <span class="pulso-title">O que você acha do app?</span>
            <button class="pulso-close" @click="dispensarPulso">×</button>
          </div>
          <p class="pulso-sub">Sua opinião ajuda a melhorar o Plantão.</p>
          <textarea
            v-model="textoFeedback"
            class="pulso-input"
            placeholder="Escreva o que quiser — erros, sugestões, elogios..."
            rows="4"
            maxlength="500"
          ></textarea>
          <div class="pulso-actions">
            <button class="btn btn-tertiary pulso-later" @click="dispensarPulso">Agora não</button>
            <button class="btn btn-primary" :disabled="!textoFeedback.trim() || pulsoEnviando" @click="enviarPulso">
              {{ pulsoEnviando ? 'Enviando...' : 'Enviar' }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="pcModalAberto" class="modal-overlay" @click.self="pcModalAberto = false">
        <div class="modal-box">
          <p class="modal-title">Como acessar no computador</p>
          <p class="modal-text">Abra o Google Chrome ou qualquer navegador no seu computador e acesse:</p>
          <p class="modal-url">plantao.net</p>
          <p class="modal-text">Faça login com a mesma conta — suas anotações já estarão lá.</p>
          <button class="btn btn-primary modal-btn" @click="pcModalAberto = false">Entendi</button>
        </div>
      </div>
    </main>

    <nav class="bottom-nav">
      <button class="bottom-nav-item bottom-nav-item-on" @click="irParaInicio">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5 9.5V21h14V9.5" />
        </svg>
        <span>Início</span>
      </button>
      <button class="bottom-nav-item" @click="router.push({ name: 'pacientes' })">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <circle cx="9" cy="8" r="3" />
          <circle cx="17" cy="9" r="2.5" />
          <path d="M4 19c0-2.8 2.6-5 5.8-5s5.8 2.2 5.8 5" />
          <path d="M14.5 18c.3-1.8 1.9-3.2 4-3.2 1.2 0 2.3.4 3.1 1.1" />
        </svg>
        <span>Pacientes</span>
      </button>
      <button class="bottom-nav-item" @click="scrollParaAnotacoes">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <path d="M4 20h4l10-10-4-4L4 16v4Z" />
          <path d="m13 7 4 4" />
        </svg>
        <span>Anotações</span>
      </button>
      <button class="bottom-nav-item" @click="router.push({ name: 'organizador' })">
        <span v-if="tarefasPendentes > 0" class="bottom-nav-badge">{{ tarefasPendentes }}</span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <rect x="5" y="4" width="14" height="16" rx="2" />
          <path d="M9 9h6" />
          <path d="M9 13h6" />
          <path d="m9 17 1.5 1.5L15 14" />
        </svg>
        <span>Tarefas</span>
      </button>
      <button class="bottom-nav-item" @click="router.push({ name: 'configuracoes' })">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <circle cx="12" cy="8" r="3" />
          <path d="M5 20c0-3.3 3.1-6 7-6s7 2.7 7 6" />
        </svg>
        <span>Perfil</span>
      </button>
    </nav>

    <HelpModal :aberto="helpAberto" @fechar="helpAberto = false" titulo="Como usar o Plantão" :itens="helpItens" />
    <TourDashboard ref="tourRef" />
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { usePulso } from '../composables/usePulso.js'
import { useAnotacoesStore } from '../stores/anotacoes.js'
import { usePacientesStore } from '../stores/pacientes.js'
import { useOrganizadorStore } from '../stores/organizador.js'
import { useToast } from '../composables/useToast.js'
import { useOnlineStatus } from '../composables/useOnlineStatus.js'
import { db } from '../firebase.js'
import { ref as dbRef, push, remove } from 'firebase/database'
import HelpModal from '../components/HelpModal.vue'
import TourDashboard from '../components/TourDashboard.vue'
import { subscribeSyncState } from '../utils/syncEvents.js'
import iconSv from '../assets/dashboard-icons-png/sinais-vitais.png'
import iconMedicacao from '../assets/dashboard-icons-png/medicacao.png'
import iconLivre from '../assets/dashboard-icons-png/notas-lives.png'
import iconPassagem from '../assets/dashboard-icons-png/passagem.png'
import iconEncaminhamento from '../assets/dashboard-icons-png/encaminhamento.png'
import iconHigienizacao from '../assets/dashboard-icons-png/higienizacao.png'
import iconCurativo from '../assets/dashboard-icons-png/curativo.png'
import iconInicial from '../assets/dashboard-icons-png/anotacao-inicial.png'
import iconHistorico from '../assets/dashboard-icons-png/historico.png'
import iconPacientes from '../assets/dashboard-icons-png/meus-paciente.png'
import iconOrganizador from '../assets/dashboard-icons-png/organizador-plantao.png'
import iconConfiguracao from '../assets/dashboard-icons-png/configuracao.png'
import heroIllustration from '../assets/dashboard-icons-png/ilustracao.png'

const router = useRouter()
const auth = useAuthStore()
const anotacoesStore = useAnotacoesStore()
const pacientesStore = usePacientesStore()
const orgStore = useOrganizadorStore()
const { showToast } = useToast()
const { isOnline } = useOnlineStatus()

const pcModalAberto = ref(false)
const helpAberto = ref(false)
const tourRef = ref(null)
const anotacoesSection = ref(null)

const {
  visivel: pulsoVisivel,
  textoFeedback,
  enviando: pulsoEnviando,
  verificarPulso,
  dispensar: dispensarPulso,
  enviar: enviarPulso,
} = usePulso()

function abrirJanelaLateral() {
  const w = 420
  const h = screen.availHeight
  const left = screen.availWidth - w
  const janela = window.open('/', 'plantao-lateral', `width=${w},height=${h},left=${left},top=0,resizable=yes`)
  if (!janela) showToast('Permita popups para plantao.net no Chrome e tente novamente.')
}

function abrirFeedback() {
  if (!auth.syncCode) return
  pulsoVisivel.value = true
}

function scrollParaAnotacoes() {
  anotacoesSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function irParaInicio() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const helpItens = [
  { icone: '🩺', titulo: 'Anotação Inicial', desc: 'Registre o estado do paciente: posição da cama, dispositivos, neurológico, respiratório e eliminações. Gere o texto formatado e copie para o sistema.' },
  { icone: '📊', titulo: 'Sinais Vitais', desc: 'Registre PA, FC, FR, Tax, SpO₂ e HGT com horário. Inclui escala de dor 0–10 com chips coloridos e conduta tomada. Texto gerado automaticamente.' },
  { icone: '💊', titulo: 'Medicação', desc: 'Documente os medicamentos administrados com dose, via, diluição e dupla checagem. Suporta múltiplos medicamentos no mesmo horário.' },
  { icone: '🚑', titulo: 'Encaminhamento', desc: 'Gere a anotação de encaminhamento do paciente: destino, tipo de transporte, acompanhante e dispositivos em uso.' },
  { icone: '🧼', titulo: 'Higienização', desc: 'Registre banho de aspersão, banho de leito ou troca de fralda com a lógica certa para o plantão.' },
  { icone: '🩹', titulo: 'Curativo', desc: 'Documente curativo simples, troca ou troca de placa com avaliação estruturada quando precisar.' },
  { icone: '🔄', titulo: 'Passagem de plantão', desc: 'Gere a anotação de passagem de plantão com refeição, queixas, cama, grades, decúbito e observações.' },
  { icone: '📝', titulo: 'Notas Livres', desc: 'Crie seus próprios modelos de anotação e use com um toque. Funciona offline.' },
  { icone: '🛏️', titulo: 'Meus Pacientes', desc: 'Cadastre os pacientes do seu plantão por leito e acompanhe pendências.' },
  { icone: '📋', titulo: 'Organizador', desc: 'Checklist de tarefas do turno com horários e alertas.' },
  { icone: '🕐', titulo: 'Histórico', desc: 'Busque, edite, copie e compartilhe anotações já geradas.' },
  { icone: '🔑', titulo: 'Código de sincronização', desc: 'Seu código único sincroniza os dados em qualquer dispositivo.' },
  { icone: '🧮', titulo: 'Calculadora de Medicação', desc: 'Calculadora flutuante com dosagem, gotejamento, diluição e conversões.' },
  { icone: '✨', titulo: 'Clara — Assistente IA', desc: 'Use a Clara para dúvidas de enfermagem, organização do plantão e apoio na redação de anotações.' },
  { icone: '💬', titulo: 'Feedback', desc: 'Envie sua opinião para a equipe do Plantão para ajudar a melhorar o app.' },
]

const sincronizandoAgora = ref(false)
const ultimoSyncAt = ref(0)
const pendAnotacoes = ref(0)
const pendPacientes = ref(0)
const pendModelos = ref(0)
const pendOrganizador = ref(0)
let pararSyncEvents = null

const _queueAnotKey = code => `pendentes_${code}`
const _queuePacKey = code => `pac_queue_${code}`
const _queueModelosKey = code => `modelos_queue_${code}`
const _orgDirtyPlantaoKey = code => `org_dirty_${code}_plantao`
const _orgDirtyTemplateKey = code => `org_dirty_${code}_template`
const _lastSyncKey = code => `last_sync_${code}`

function _lenFila(key) {
  try {
    const arr = JSON.parse(localStorage.getItem(key) || '[]')
    return Array.isArray(arr) ? arr.length : 0
  } catch {
    return 0
  }
}

function atualizarPainelSync() {
  const code = auth.syncCode
  if (!code) {
    pendAnotacoes.value = 0
    pendPacientes.value = 0
    pendModelos.value = 0
    pendOrganizador.value = 0
    ultimoSyncAt.value = 0
    return
  }

  pendAnotacoes.value = _lenFila(_queueAnotKey(code))
  pendPacientes.value = _lenFila(_queuePacKey(code))
  pendModelos.value = _lenFila(_queueModelosKey(code))
  pendOrganizador.value =
    (localStorage.getItem(_orgDirtyPlantaoKey(code)) === '1' ? 1 : 0) +
    (localStorage.getItem(_orgDirtyTemplateKey(code)) === '1' ? 1 : 0)
  ultimoSyncAt.value = Number(localStorage.getItem(_lastSyncKey(code)) || 0)
}

async function sincronizarModelosPendentes(code) {
  if (!code || !navigator.onLine) return 0
  const fila = (() => {
    try { return JSON.parse(localStorage.getItem(_queueModelosKey(code)) || '[]') } catch { return [] }
  })()
  if (!fila.length) return 0

  const keyMap = {}
  const restantes = []
  let feitos = 0

  for (const item of fila) {
    try {
      if (item.op === 'add') {
        const r = await push(dbRef(db, `livres/${code}/modelos`), item.data)
        keyMap[item.key] = r.key
        feitos++
      } else if (item.op === 'delete') {
        const real = keyMap[item.key] || item.key
        if (String(real).startsWith('local-')) {
          feitos++
          continue
        }
        await remove(dbRef(db, `livres/${code}/modelos/${real}`))
        feitos++
      } else {
        restantes.push(item)
      }
    } catch {
      restantes.push(item)
    }
  }

  try { localStorage.setItem(_queueModelosKey(code), JSON.stringify(restantes)) } catch {}
  return feitos
}

const totalPendencias = computed(() =>
  pendAnotacoes.value + pendPacientes.value + pendModelos.value + pendOrganizador.value
)

const syncTitle = computed(() => {
  if (!isOnline.value && totalPendencias.value > 0) return 'Sincronização pendente'
  if (totalPendencias.value > 0) return 'Sincronização pendente'
  return 'Sincronização em dia'
})

const syncDescription = computed(() => {
  if (totalPendencias.value > 0) {
    return `${totalPendencias.value} item${totalPendencias.value !== 1 ? 's' : ''} aguardando envio`
  }
  if (!ultimoSyncAt.value) return 'Ainda sem registro de sincronização'
  return `Última atualização ${new Date(ultimoSyncAt.value).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
})

const syncButtonLabel = computed(() => {
  if (sincronizandoAgora.value) return 'Sincronizando...'
  if (!isOnline.value) return 'Sem internet'
  return 'Sincronizar agora'
})

const syncBadgeClass = computed(() => {
  if (totalPendencias.value > 0) return 'sync-status-pending'
  return 'sync-status-ok'
})

const organizadorResumo = computed(() => {
  if (!orgStore.plantao) return 'Nenhum plantão ativo'
  const tarefas = orgStore.plantao.tarefas || []
  const feitas = tarefas.filter(t => t.feito).length
  const pendentes = tarefas.filter(t => !t.feito).length
  return `${feitas}/${tarefas.length} tarefas • ${pendentes} pendente${pendentes !== 1 ? 's' : ''}`
})

const tarefasPendentes = computed(() => {
  if (!orgStore.plantao) return 0
  return (orgStore.plantao.tarefas || []).filter(t => !t.feito).length
})

async function sincronizarAgora() {
  if (sincronizandoAgora.value) return
  if (!isOnline.value) {
    showToast('Sem internet para sincronizar')
    return
  }
  const code = auth.syncCode
  if (!code) return

  sincronizandoAgora.value = true
  try {
    const orgAntes = pendOrganizador.value
    const [nAnot, nPac, nMod] = await Promise.all([
      anotacoesStore.sincronizarPendentes(),
      pacientesStore.sincronizarPendentes(),
      sincronizarModelosPendentes(code),
    ])
    await orgStore.sincronizarOrganizador()

    const total = (nAnot || 0) + (nPac || 0) + (nMod || 0)
    ultimoSyncAt.value = Date.now()
    try { localStorage.setItem(_lastSyncKey(code), String(ultimoSyncAt.value)) } catch {}
    atualizarPainelSync()

    if (total > 0 || orgAntes > 0) showToast('Sincronização concluída ✓')
    else showToast('Tudo já estava sincronizado')
  } catch {
    showToast('Erro ao sincronizar')
  } finally {
    sincronizandoAgora.value = false
  }
}

onMounted(() => {
  orgStore.iniciar()
  atualizarPainelSync()
  pararSyncEvents = subscribeSyncState((event) => {
    if (event?.code && event.code !== auth.syncCode) return
    atualizarPainelSync()
  })
  window.addEventListener('online', atualizarPainelSync)
  window.addEventListener('focus', atualizarPainelSync)
  setTimeout(verificarPulso, 2000)
})

onUnmounted(() => {
  pararSyncEvents?.()
  pararSyncEvents = null
  window.removeEventListener('online', atualizarPainelSync)
  window.removeEventListener('focus', atualizarPainelSync)
})

const saudacaoTexto = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia,'
  if (h < 18) return 'Boa tarde,'
  return 'Boa noite,'
})

const tipos = [
  { id: 'sv', icon: iconSv, nome: 'Sinais vitais', meta: 'Rápido', rota: 'sinais-vitais' },
  { id: 'medicacao', icon: iconMedicacao, nome: 'Medicação', meta: 'Rápido', rota: 'medicacao' },
  { id: 'livre', icon: iconLivre, nome: 'Notas livres', meta: 'Rápido', rota: 'livre' },
  { id: 'passagem', icon: iconPassagem, nome: 'Passagem de plantão', meta: 'Turno', rota: 'passagem' },
  { id: 'encamin', icon: iconEncaminhamento, nome: 'Encaminhamento', meta: 'Apoio', rota: 'encaminhamento' },
  { id: 'banho', icon: iconHigienizacao, nome: 'Higienização', meta: 'Apoio', rota: 'banho' },
  { id: 'curativo', icon: iconCurativo, nome: 'Curativo', meta: 'Apoio', rota: 'curativo' },
  { id: 'inicial', icon: iconInicial, nome: 'Anotação inicial', meta: '1x por plantão', rota: 'anotacao-inicial' },
]

const tiposDashboard = computed(() => tipos)

function navegar(tipo) {
  if (tipo.rota) router.push({ name: tipo.rota })
}
</script>

<style scoped>
.dashboard-header {
  padding: 14px 16px;
}

.dashboard-main {
  padding-top: 14px;
  padding-bottom: 104px;
}

.header-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.header-brand-copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.header-brand-title {
  color: #f6f8ff;
  font-size: 1.05rem;
  font-weight: 800;
}

.header-shortcuts {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.header-chip {
  min-height: 24px;
  padding: 0 8px;
  border-radius: 999px;
  border: 1px solid rgba(125, 148, 197, 0.14);
  background: rgba(15, 31, 58, 0.75);
  color: #a8b7de;
  font-family: inherit;
  font-size: 0.66rem;
  font-weight: 700;
  cursor: pointer;
}

.header-logo-mark {
  border-radius: 8px;
  display: block;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.btn-icon {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  border: 1px solid rgba(145, 166, 212, 0.16);
  background: rgba(14, 31, 60, 0.7);
  color: #a8b7de;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.15s ease, border-color 0.15s ease, background 0.15s ease;
}

.btn-icon:active {
  transform: scale(0.97);
}

.hero-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 10px 2px 6px;
}

.hero-copy {
  min-width: 0;
  flex: 1;
}

.hero-greeting {
  margin: 0 0 4px;
  color: #b8c5e6;
  font-size: 0.95rem;
  font-weight: 600;
}

.hero-name {
  margin: 0;
  color: #f7f9ff;
  font-size: 2.2rem;
  line-height: 0.94;
  font-weight: 800;
  letter-spacing: -0.04em;
}

.hero-subtitle {
  margin: 8px 0 0;
  color: #a5b4d6;
  font-size: 0.92rem;
  line-height: 1.4;
}

.hero-illustration {
  width: 96px;
  max-width: 34%;
  object-fit: contain;
  display: block;
  flex-shrink: 0;
  filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.18));
}

.sync-card {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 10px;
  align-items: center;
  background: linear-gradient(180deg, rgba(20, 41, 77, 0.92), rgba(17, 34, 66, 0.98));
  border: 1px solid rgba(125, 148, 197, 0.18);
  border-radius: 18px;
  padding: 12px 14px;
  margin-bottom: 10px;
  box-shadow: 0 12px 24px rgba(4, 10, 22, 0.18);
}

.sync-status-badge {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.sync-status-ok {
  background: rgba(45, 165, 103, 0.14);
  color: #59de8d;
}

.sync-status-pending {
  background: rgba(255, 189, 74, 0.14);
  color: #ffcb69;
}

.sync-copy {
  min-width: 0;
}

.sync-title {
  margin: 0;
  color: #f7f9ff;
  font-size: 0.98rem;
  font-weight: 800;
}

.sync-subtitle {
  margin: 4px 0 0;
  color: #a9b7d8;
  font-size: 0.84rem;
  line-height: 1.35;
}

.sync-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.sync-chip {
  display: inline-flex;
  align-items: center;
  min-height: 26px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #d5def5;
  font-size: 0.76rem;
  font-weight: 600;
}

.sync-btn {
  width: auto;
  min-width: 114px;
  min-height: 34px;
  padding: 0 12px;
  border: 1px solid rgba(91, 173, 255, 0.9);
  border-radius: 10px;
  background: linear-gradient(180deg, #2f90ff, #1e6fe9);
  color: #fff;
  font-family: inherit;
  font-size: 0.79rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  box-shadow: 0 14px 24px rgba(30, 111, 233, 0.22);
}

.sync-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: none;
}

.utility-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.utility-chip {
  min-height: 30px;
  padding: 0 11px;
  border-radius: 999px;
  border: 1px solid rgba(125, 148, 197, 0.14);
  background: rgba(15, 31, 58, 0.75);
  color: #a8b7de;
  font-family: inherit;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
}

.dashboard-section {
  position: relative;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.section-head-spaced {
  margin-top: 24px;
}

.section-title {
  margin: 0;
  color: #f5f8ff;
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.section-link {
  color: #3690ff;
  font-size: 0.98rem;
  font-weight: 600;
}

.tipos-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}

.tipo-card {
  min-width: 0;
  min-height: 146px;
  padding: 14px 10px 12px;
  border-radius: 18px;
  border: 1px solid rgba(124, 147, 194, 0.14);
  background: linear-gradient(180deg, rgba(24, 44, 79, 0.98), rgba(19, 36, 68, 0.98));
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.15s ease, border-color 0.15s ease, background 0.15s ease;
  box-shadow: 0 14px 28px rgba(5, 12, 25, 0.16);
}

.tipo-card:active {
  transform: scale(0.98);
}

.tipo-icon {
  width: 56px;
  height: 56px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.tipo-icon-img {
  width: 56px;
  height: 56px;
  object-fit: contain;
  display: block;
  filter: drop-shadow(0 10px 18px rgba(8, 16, 34, 0.24));
}

.tipo-nome {
  color: #f7f9ff;
  font-size: 0.84rem;
  line-height: 1.15;
  font-weight: 700;
  text-wrap: balance;
  overflow-wrap: anywhere;
}

.tipo-card-encamin .tipo-nome {
  font-size: 0.78rem;
}

.tipo-meta {
  color: #9aacd1;
  font-size: 0.72rem;
  line-height: 1.2;
}

.atalhos-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.atalho-card {
  width: 100%;
  padding: 14px 16px;
  border-radius: 18px;
  border: 1px solid rgba(124, 147, 194, 0.14);
  background: linear-gradient(180deg, rgba(23, 43, 78, 0.96), rgba(18, 35, 67, 0.98));
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 12px;
  text-align: left;
  cursor: pointer;
  box-shadow: 0 14px 28px rgba(5, 12, 25, 0.14);
}

.atalho-icon {
  width: 46px;
  height: 46px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.atalho-icon-img {
  width: 46px;
  height: 46px;
  object-fit: contain;
  display: block;
}

.atalho-copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.atalho-title {
  color: #f7f9ff;
  font-size: 0.98rem;
  font-weight: 700;
}

.atalho-sub {
  color: #9eadd0;
  font-size: 0.82rem;
  line-height: 1.35;
}

.atalho-arrow {
  color: #9aacd1;
  font-size: 1.8rem;
  line-height: 1;
}

.feedback-overlay {
  position: fixed;
  inset: 0;
  background: rgba(3, 8, 18, 0.5);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 240;
  padding: 20px;
}

.feedback-modal {
  width: 100%;
  max-width: 420px;
  background: linear-gradient(180deg, rgba(23, 43, 78, 0.98), rgba(18, 35, 67, 0.99));
  border: 1px solid rgba(124, 147, 194, 0.14);
  border-radius: 22px;
  padding: 18px;
  box-shadow: 0 24px 56px rgba(0, 0, 0, 0.34);
}

.pulso-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.pulso-title {
  color: #f7f9ff;
  font-size: 1rem;
  font-weight: 700;
}

.pulso-close {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
  color: #9aacd1;
  font-size: 1.1rem;
  cursor: pointer;
}

.pulso-sub {
  margin: 0 0 10px;
  color: #9eadd0;
  font-size: 0.86rem;
}

.pulso-input {
  width: 100%;
  min-height: 110px;
  padding: 12px;
  border-radius: 14px;
  border: 1px solid rgba(124, 147, 194, 0.14);
  background: rgba(7, 16, 32, 0.48);
  color: #f7f9ff;
  font-family: inherit;
  font-size: 0.92rem;
  resize: none;
  box-sizing: border-box;
}

.pulso-input:focus {
  outline: none;
  border-color: rgba(78, 149, 255, 0.72);
}

.pulso-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
}

.pulso-later {
  width: auto;
  min-height: 44px;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.58);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 24px;
}

.modal-box {
  width: 100%;
  max-width: 360px;
  padding: 24px;
  border-radius: 20px;
  border: 1px solid rgba(124, 147, 194, 0.18);
  background: #102142;
}

.modal-title {
  margin: 0 0 14px;
  color: #f7f9ff;
  font-size: 1.14rem;
  font-weight: 800;
}

.modal-text {
  margin: 0 0 10px;
  color: #aab7d8;
  font-size: 0.92rem;
  line-height: 1.45;
}

.modal-url {
  margin: 0 0 12px;
  padding: 12px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.04);
  color: #4f9cff;
  font-size: 1.35rem;
  font-weight: 800;
  text-align: center;
}

.modal-btn {
  width: 100%;
  margin-top: 8px;
}

.bottom-nav {
  position: fixed;
  left: 50%;
  bottom: max(12px, env(safe-area-inset-bottom));
  transform: translateX(-50%);
  width: min(92vw, 360px);
  padding: 8px 10px;
  border-radius: 18px;
  border: 1px solid rgba(124, 147, 194, 0.14);
  background: rgba(14, 31, 60, 0.94);
  backdrop-filter: blur(14px);
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 4px;
  z-index: 220;
  box-shadow: 0 18px 36px rgba(0, 0, 0, 0.28);
}

.bottom-nav-item {
  position: relative;
  min-height: 54px;
  border: none;
  border-radius: 14px;
  background: transparent;
  color: #8ea3d4;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-family: inherit;
  font-size: 0.7rem;
  font-weight: 600;
  cursor: pointer;
}

.bottom-nav-item-on {
  background: rgba(255, 255, 255, 0.05);
  color: #7fc0ff;
}

.bottom-nav-badge {
  position: absolute;
  top: 4px;
  right: 10px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 999px;
  background: #ff6a67;
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.62rem;
  font-weight: 800;
}

@media (max-width: 390px) {
  .dashboard-header {
    align-items: flex-start;
  }

  .header-brand-title {
    font-size: 0.98rem;
  }

  .header-chip {
    font-size: 0.62rem;
    padding: 0 7px;
  }

  .hero-name {
    font-size: 1.95rem;
  }

  .hero-illustration {
    width: 84px;
  }

  .sync-btn {
    min-width: 106px;
    min-height: 32px;
    font-size: 0.74rem;
    padding: 0 9px;
    border-radius: 9px;
  }

  .tipos-grid {
    gap: 6px;
  }

  .tipo-card {
    min-height: 138px;
    padding-left: 8px;
    padding-right: 8px;
  }

  .tipo-nome {
    font-size: 0.8rem;
  }

  .tipo-card-encamin .tipo-nome {
    font-size: 0.72rem;
  }
}

@media (min-width: 768px) {
  .app-header {
    max-width: 100%;
    padding: 14px 32px;
  }

  .container {
    max-width: 960px !important;
    padding-left: 32px !important;
    padding-right: 32px !important;
  }

  .dashboard-main {
    padding-bottom: 40px;
  }

  .hero-card {
    padding-top: 18px;
  }

  .hero-name {
    font-size: 2.8rem;
  }

  .hero-illustration {
    width: 140px;
  }

  .sync-card {
    gap: 16px;
  }

  .sync-btn {
    min-width: 190px;
    padding: 0 18px;
    font-size: 0.92rem;
    min-height: 40px;
    border-radius: 12px;
  }

  .tipos-grid {
    gap: 12px;
  }

  .tipo-card {
    min-height: 172px;
  }

  .bottom-nav {
    display: none;
  }
}
</style>
