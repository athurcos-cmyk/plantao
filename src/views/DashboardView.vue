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
        <button v-if="totalPendentes > 0" class="btn-pend-chip" @click="pendModalAberto = true" title="Pendencias">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
            <rect x="9" y="3" width="6" height="4" rx="1"/>
            <path d="M9 14l2 2 4-4"/>
          </svg>
          <span class="btn-pend-count">{{ totalPendentes }}</span>
        </button>
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

      <section v-if="totalPendencias > 0" class="sync-card">
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
          <button class="sync-link" @click="syncDetalhesAbertos = !syncDetalhesAbertos">
            {{ syncDetalhesAbertos ? 'Ocultar detalhes' : 'Ver detalhes' }}
          </button>
          <div v-if="totalPendencias > 0 || syncDetalhesAbertos" class="sync-chips">
            <span v-if="pendAnotacoes > 0" class="sync-chip">Anotações {{ pendAnotacoes }}</span>
            <span v-if="pendPacientes > 0" class="sync-chip">Pacientes {{ pendPacientes }}</span>
            <span v-if="pendModelos > 0" class="sync-chip">Modelos {{ pendModelos }}</span>
            <span v-if="pendOrganizador > 0" class="sync-chip">Organizador {{ pendOrganizador }}</span>
            <span v-if="totalPendencias === 0" class="sync-chip">Tudo sincronizado</span>
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
        <button class="utility-chip" @click="pcModalAberto = true">
          <svg class="utility-chip-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="12" rx="2" />
            <path d="M8 20h8" />
            <path d="M12 16v4" />
          </svg>
          <span>Como acessar no computador</span>
        </button>
      </div>

      <section class="dashboard-section">
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
            placeholder="Escreva o que quiser - erros, sugestões, elogios..."
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
          <p class="modal-text">Faça login com a mesma conta - suas anotações já estarão lá.</p>
          <button class="btn btn-primary modal-btn" @click="pcModalAberto = false">Entendi</button>
        </div>
      </div>

      <!-- Modal: todas as pendências -->
      <div v-if="pendModalAberto" class="modal-overlay" @click.self="pendModalAberto = false">
        <div class="modal-box pend-modal-box">
          <p class="modal-title">Todas as pendências</p>
          <div class="pend-modal-lista">
            <button
              v-for="item in pendenciasPendentes"
              :key="item.pacienteKey + item._key"
              class="pend-item"
              @click="pacientesStore.togglePendencia(item.pacienteKey, item._key, false)"
            >
              <span class="pend-check">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                  <circle cx="12" cy="12" r="9" />
                </svg>
              </span>
              <span class="pend-texto">{{ item.texto }}</span>
              <span class="pend-meta">{{ [item.horario ? item.horario.replace(':', 'h') : '', item.pacienteLeito, item.pacienteNome].filter(Boolean).join(' · ') }}</span>
            </button>
            <p v-if="totalPendentes === 0" class="pend-vazia">Nenhuma pendência pendente!</p>
          </div>
          <button class="btn btn-primary modal-btn" @click="pendModalAberto = false">Fechar</button>
        </div>
      </div>
    </main>

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
import { usePendenciasDashboard } from '../composables/usePendenciasDashboard.js'
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
const { pendenciasPendentes, totalPendentes, proximasPendencias, temMaisPendencias } = usePendenciasDashboard()
const orgStore = useOrganizadorStore()
const { showToast } = useToast()
const { isOnline } = useOnlineStatus()

const pcModalAberto = ref(false)
const helpAberto = ref(false)
const tourRef = ref(null)
const syncDetalhesAbertos = ref(false)
const pendModalAberto = ref(false)
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

const helpItens = [
  { icone: '🩺', titulo: 'Anotação Inicial', desc: 'Registre o estado do paciente: posição da cama, dispositivos, neurológico, respiratório e eliminações. Gere o texto formatado e copie para o sistema.' },
  { icone: '📊', titulo: 'Sinais Vitais', desc: 'Registre PA, FC, FR, Tax, SpO₂ e HGT com horário. Inclui escala de dor 0-10 com chips coloridos e conduta tomada. Texto gerado automaticamente.' },
  { icone: '💊', titulo: 'Medicação', desc: 'Documente os medicamentos administrados com dose, via, diluição e dupla checagem. Suporta múltiplos medicamentos no mesmo horário.' },
  { icone: '🚑', titulo: 'Encaminhamento', desc: 'Gere a anotação de encaminhamento do paciente: destino, tipo de transporte, acompanhante e dispositivos em uso.' },
  { icone: '🧼', titulo: 'Higienização', desc: 'Registre banho de aspersão, banho de leito ou troca de fralda com a lógica certa para o plantão.' },
  { icone: '🩹', titulo: 'Curativo', desc: 'Documente curativo simples, troca ou troca de placa com avaliação estruturada quando precisar.' },
  { icone: '🔄', titulo: 'Passagem de plantão', desc: 'Gere a anotação de passagem de plantão com refeição, queixas, cama, grades, decúbito e observações.' },
  { icone: '📝', titulo: 'Notas Livres', desc: 'Crie seus próprios modelos de anotação e use com um toque. Funciona offline.' },
  { icone: '🛏️', titulo: 'Meus Pacientes', desc: 'Cadastre os pacientes do seu plantão por leito e acompanhe pendências.' },
  { icone: '🔴', titulo: 'Pendências', desc: 'O botão vermelho no cabeçalho mostra o total de pendências abertas. Toque para abrir a lista completa e marcar como concluídas.' },
  { icone: '📋', titulo: 'Organizador', desc: 'Checklist de tarefas do turno com horários e alertas.' },
  { icone: '🕐', titulo: 'Histórico', desc: 'Busque, edite, copie e compartilhe anotações já geradas.' },
  { icone: '🔑', titulo: 'Código de sincronização', desc: 'Seu código único sincroniza os dados em qualquer dispositivo.' },
  { icone: '🧮', titulo: 'Calculadora de Medicação', desc: 'Calculadora flutuante com dosagem, gotejamento, diluição e conversões.' },
  { icone: '✨', titulo: 'Clara - Assistente IA', desc: 'Use a Clara para dúvidas de enfermagem, organização do plantão e apoio na redação de anotações.' },
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
  if (sincronizandoAgora.value) return 'Sincronizando'
  if (!isOnline.value) return 'Sem internet'
  return 'Sincronizar'
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
  pacientesStore.iniciar()
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
  { id: 'sv', icon: iconSv, nome: 'Sinais vitais', rota: 'sinais-vitais' },
  { id: 'medicacao', icon: iconMedicacao, nome: 'Medicação', rota: 'medicacao' },
  { id: 'livre', icon: iconLivre, nome: 'Notas livres', rota: 'livre' },
  { id: 'passagem', icon: iconPassagem, nome: 'Passagem de plantão', rota: 'passagem' },
  { id: 'encamin', icon: iconEncaminhamento, nome: 'Encaminhar', rota: 'encaminhamento' },
  { id: 'banho', icon: iconHigienizacao, nome: 'Higiene', rota: 'banho' },
  { id: 'curativo', icon: iconCurativo, nome: 'Curativo', rota: 'curativo' },
  { id: 'inicial', icon: iconInicial, nome: 'Anotação inicial', rota: 'anotacao-inicial' },
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
  padding-bottom: 28px;
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
  color: var(--text);
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
  border: 1px solid var(--border);
  background: var(--bg-input);
  color: var(--text-dim);
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
  border: 1px solid var(--border);
  background: var(--bg-input);
  color: var(--text-dim);
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
  color: var(--text-dim);
  font-size: 0.95rem;
  font-weight: 600;
}

.hero-name {
  margin: 0;
  color: var(--text);
  font-size: 2.2rem;
  line-height: 0.94;
  font-weight: 800;
  letter-spacing: -0.04em;
}

.hero-subtitle {
  margin: 8px 0 0;
  color: var(--text-dim);
  font-size: 0.92rem;
  line-height: 1.4;
}

.hero-illustration {
  width: 96px;
  max-width: 34%;
  object-fit: contain;
  display: block;
  flex-shrink: 0;
  filter: none;
}

.sync-card {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 10px;
  align-items: center;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 12px 14px;
  margin-bottom: 10px;
  box-shadow: var(--shadow-md);
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
  background: color-mix(in srgb, var(--success) 14%, transparent);
  color: var(--text-success-soft);
}

.sync-status-pending {
  background: color-mix(in srgb, var(--warning) 14%, transparent);
  color: var(--text-warning);
}

.sync-copy {
  min-width: 0;
}

.sync-title {
  margin: 0;
  color: var(--text);
  font-size: 0.98rem;
  font-weight: 800;
}

.sync-subtitle {
  margin: 4px 0 0;
  color: var(--text-dim);
  font-size: 0.84rem;
  line-height: 1.35;
}

.sync-link {
  margin-top: 6px;
  padding: 0;
  border: none;
  background: none;
  color: var(--blue);
  font-family: inherit;
  font-size: 0.76rem;
  font-weight: 700;
  cursor: pointer;
  text-align: left;
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
  background: color-mix(in srgb, var(--text) 6%, transparent);
  border: 1px solid color-mix(in srgb, var(--text) 8%, transparent);
  color: var(--text-dim);
  font-size: 0.76rem;
  font-weight: 600;
}

.sync-btn {
  width: auto;
  min-width: 0;
  min-height: 30px;
  padding: 0 10px;
  border: 1px solid color-mix(in srgb, var(--blue) 90%, transparent);
  border-radius: 8px;
  background: linear-gradient(180deg, color-mix(in srgb, var(--blue) 86%, var(--text-on-accent) 14%), var(--blue-dark));
  color: var(--text-on-accent);
  font-family: inherit;
  font-size: 0.72rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  cursor: pointer;
  box-shadow: var(--shadow-md);
  white-space: nowrap;
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
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 30px;
  padding: 0 11px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--bg-input);
  color: var(--text-dim);
  font-family: inherit;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
}

.utility-chip-icon {
  flex-shrink: 0;
  color: var(--text-info);
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
  color: var(--text);
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.section-link {
  color: var(--blue);
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
  padding: 14px 10px;
  border-radius: 18px;
  border: 1px solid var(--border);
  background: var(--bg-card);
  display: grid;
  grid-template-rows: 56px minmax(2.7em, auto);
  justify-items: center;
  align-content: center;
  gap: 10px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.15s ease, border-color 0.15s ease, background 0.15s ease;
  box-shadow: var(--shadow-md);
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
  filter: none;
}

.tipo-nome {
  color: var(--text);
  font-size: 0.84rem;
  line-height: 1.15;
  font-weight: 700;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  max-width: 100%;
  min-height: 2.3em;
  text-wrap: pretty;
  overflow-wrap: normal;
  word-break: keep-all;
  hyphens: none;
}

.tipo-card-encamin .tipo-nome,
.tipo-card-banho .tipo-nome {
  font-size: 0.78rem;
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
  border: 1px solid var(--border);
  background: var(--bg-card);
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 12px;
  text-align: left;
  cursor: pointer;
  box-shadow: var(--shadow-md);
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
  color: var(--text);
  font-size: 0.98rem;
  font-weight: 700;
}

.atalho-sub {
  color: var(--text-dim);
  font-size: 0.82rem;
  line-height: 1.35;
}

.atalho-arrow {
  color: var(--text-dim);
  font-size: 1.8rem;
  line-height: 1;
}

.feedback-overlay {
  position: fixed;
  inset: 0;
  background: color-mix(in srgb, var(--bg) 50%, transparent);
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
  background: linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 94%, var(--blue) 6%), color-mix(in srgb, var(--bg-input) 94%, var(--blue-dark) 6%));
  border: 1px solid color-mix(in srgb, var(--border) 86%, transparent);
  border-radius: 22px;
  padding: 18px;
  box-shadow: var(--shadow-modal);
}

.pulso-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.pulso-title {
  color: var(--text);
  font-size: 1rem;
  font-weight: 700;
}

.pulso-close {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 10px;
  background: color-mix(in srgb, var(--text) 4%, transparent);
  color: var(--text-dim);
  font-size: 1.1rem;
  cursor: pointer;
}

.pulso-sub {
  margin: 0 0 10px;
  color: var(--text-dim);
  font-size: 0.86rem;
}

.pulso-input {
  width: 100%;
  min-height: 110px;
  padding: 12px;
  border-radius: 14px;
  border: 1px solid color-mix(in srgb, var(--border) 86%, transparent);
  background: color-mix(in srgb, var(--bg-input) 72%, transparent);
  color: var(--text);
  font-family: inherit;
  font-size: 0.92rem;
  resize: none;
  box-sizing: border-box;
}

.pulso-input:focus {
  outline: none;
  border-color: color-mix(in srgb, var(--blue) 72%, transparent);
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
  background: color-mix(in srgb, var(--bg) 58%, transparent);
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
  border: 1px solid var(--border);
  background: var(--bg-card);
}

.modal-title {
  margin: 0 0 14px;
  color: var(--text);
  font-size: 1.14rem;
  font-weight: 800;
}

.modal-text {
  margin: 0 0 10px;
  color: var(--text-dim);
  font-size: 0.92rem;
  line-height: 1.45;
}

.modal-url {
  margin: 0 0 12px;
  padding: 12px;
  border-radius: 14px;
  background: color-mix(in srgb, var(--text) 4%, transparent);
  color: var(--blue);
  font-size: 1.35rem;
  font-weight: 800;
  text-align: center;
}

.modal-btn {
  width: 100%;
  margin-top: 8px;
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
    min-height: 28px;
    font-size: 0.68rem;
    padding: 0 8px;
    border-radius: 8px;
  }

  .tipos-grid {
    gap: 6px;
  }

  .tipo-card {
    min-height: 140px;
    padding-left: 8px;
    padding-right: 8px;
    grid-template-rows: 50px minmax(2.95em, auto);
    gap: 8px;
  }

  .tipo-nome {
    font-size: 0.72rem;
    line-height: 1.12;
    min-height: 2.24em;
  }

  .tipo-card-encamin .tipo-nome,
  .tipo-card-banho .tipo-nome {
    font-size: 0.68rem;
  }

  .atalho-title {
    font-size: 0.96rem;
  }

  .atalho-sub {
    font-size: 0.73rem;
    line-height: 1.2;
  }

  .atalho-arrow {
    font-size: 1.2rem;
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
    min-width: 154px;
    padding: 0 14px;
    font-size: 0.84rem;
    min-height: 36px;
    border-radius: 10px;
  }

  .tipos-grid {
    gap: 12px;
  }

  .tipo-card {
    min-height: 172px;
  }

  .tipo-nome,
  .tipo-card-encamin .tipo-nome,
  .tipo-card-banho .tipo-nome {
    font-size: 0.9rem;
  }
}

/* ── Pendências dashboard ── */
.btn-pend-chip {
  position: relative;
  background: var(--danger);
  border: none;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #fff;
  margin-right: 2px;
}
.btn-pend-chip:active { opacity: 0.8; }

.btn-pend-count {
  position: absolute;
  top: -5px;
  right: -5px;
  background: var(--danger);
  color: #fff;
  font-size: 0.65rem;
  font-weight: 800;
  min-width: 16px;
  height: 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  box-shadow: 0 0 0 2px var(--bg);
}

.pend-lista {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.pend-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  padding: 9px 6px;
  border-radius: 10px;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.12s;
}
.pend-item:active { background: var(--bg-hover); }

.pend-check {
  flex-shrink: 0;
  color: var(--text-muted);
}

.pend-texto {
  flex: 1;
  font-size: 0.88rem;
  color: var(--text);
  font-weight: 500;
  line-height: 1.3;
}

.pend-meta {
  flex-shrink: 0;
  font-size: 0.78rem;
  color: var(--text-muted);
  font-weight: 500;
}

/* Modal pendências */
.pend-modal-box {
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}
.pend-modal-lista {
  flex: 1;
  overflow-y: auto;
  margin: 12px 0;
  max-height: 55vh;
}
.pend-vazia {
  text-align: center;
  color: var(--text-dim);
  font-size: 0.88rem;
  padding: 20px 0;
}
</style>
