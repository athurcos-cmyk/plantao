<template>
  <div class="screen">
    <header class="app-header dashboard-header">
      <div class="header-logo">
        <img src="/icons/icon-512.png" width="28" height="28" alt="Plantão" style="border-radius:6px;display:block" />
        <span>Plantão</span>
      </div>
      <div class="header-actions">
        <button class="btn-icon" @click="router.push({ name: 'historico' })" title="Histórico">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
        </button>
        <button class="btn-icon" @click="router.push({ name: 'configuracoes' })" title="Configurações">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
          </svg>
        </button>
      </div>
    </header>

    <main class="container dashboard-main">
      <section class="hero-card">
        <div class="saudacao">
          <p class="saudacao-hora">{{ saudacaoTexto }}</p>
          <h2 v-if="auth.userName">{{ auth.userName }}</h2>
          <p class="saudacao-sub">Abra a anotação e registre isso sem perder tempo no corredor.</p>
        </div>

        <button class="hero-primary" @click="router.push({ name: 'anotacao-inicial' })">
          <span class="hero-primary-icon">📋</span>
          <span class="hero-primary-copy">
            <strong>Começar com Anotação inicial</strong>
            <span>Estado geral, dispositivos e fechamento do paciente.</span>
          </span>
          <span class="hero-primary-arrow">→</span>
        </button>
      </section>

      <div class="quick-tools">
        <button class="btn-ajuda quick-tool" @click="tourRef?.abrirTour()" title="Ver tutorial">▶ Tutorial</button>
        <button class="btn-ajuda quick-tool" @click="helpAberto = true">? Ajuda</button>
        <button class="btn-ajuda quick-tool" @click="abrirFeedback" title="Enviar feedback">💬 Feedback</button>
        <button class="btn-ajuda btn-lateral quick-tool" @click="abrirJanelaLateral" title="Abrir ao lado do prontuário">⊾ Ao lado</button>
      </div>

      <section class="sync-card">
        <div class="sync-top">
          <div class="sync-copy">
            <p class="sync-title">Sincronização</p>
            <span class="sync-status">
              {{ totalPendencias > 0 ? `${totalPendencias} pendência${totalPendencias !== 1 ? 's' : ''}` : 'Tudo sincronizado' }}
            </span>
          </div>
          <span class="sync-last">{{ ultimoSyncLabel }}</span>
        </div>

        <div class="sync-row">
          <button class="sync-link" @click="syncDetalhesAbertos = !syncDetalhesAbertos">
            {{ syncDetalhesAbertos ? 'Ocultar detalhes' : 'Ver detalhes' }}
          </button>
          <button class="sync-btn" :disabled="sincronizandoAgora || !isOnline" @click="sincronizarAgora">
            {{ sincronizandoAgora ? 'Sincronizando...' : (isOnline ? 'Tentar agora' : 'Sem internet') }}
          </button>
        </div>

        <div v-if="syncDetalhesAbertos || totalPendencias > 0" class="sync-chips">
          <span class="sync-chip" :class="{ 'sync-chip-on': pendAnotacoes > 0 }">Anotações {{ pendAnotacoes }}</span>
          <span class="sync-chip" :class="{ 'sync-chip-on': pendPacientes > 0 }">Pacientes {{ pendPacientes }}</span>
          <span class="sync-chip" :class="{ 'sync-chip-on': pendModelos > 0 }">Modelos {{ pendModelos }}</span>
          <span class="sync-chip" :class="{ 'sync-chip-on': pendOrganizador > 0 }">Organizador {{ pendOrganizador }}</span>
        </div>
      </section>

      <div v-if="!pcDismissed" class="card-pc">
        <div class="card-pc-content">
          <span>💻</span>
          <span>Acesse também no computador — abra o Chrome e digite <strong>plantao.net</strong></span>
        </div>
        <button class="card-pc-fechar" @click="dispensarPc" title="Fechar">✕</button>
      </div>

      <div class="secao-head">
        <p class="secao-label">Outras anotações</p>
        <span class="secao-hint">Entradas rápidas do plantão</span>
      </div>

      <div class="tipos-grid">
        <button data-testid="auto-btn-dashboardview-2" v-for="tipo in tiposSecundarios" :key="tipo.id" class="tipo-card" @click="navegar(tipo)">
          <span class="tipo-icon">{{ tipo.icon }}</span>
          <span class="tipo-texto">
            <span class="tipo-nome">{{ tipo.nome }}</span>
            <span class="tipo-desc">{{ tipo.desc }}</span>
          </span>
          <span v-if="!tipo.rota" class="tipo-badge">em breve</span>
        </button>
      </div>

      <div class="secao-head secao-head-spaced">
        <p class="secao-label">Atalhos do plantão</p>
        <span class="secao-hint">Fluxos de apoio</span>
      </div>

      <div class="acoes-row">
        <button data-testid="auto-btn-dashboardview-3" class="btn-historico" @click="router.push({ name: 'historico' })">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          <div class="atalho-copy">
            <span class="atalho-titulo">Histórico</span>
            <span class="atalho-sub">Buscar, copiar e reaproveitar anotações</span>
          </div>
        </button>

        <button class="btn-pacientes" @click="router.push({ name: 'pacientes' })">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 00-3-3.87"/>
            <path d="M16 3.13a4 4 0 010 7.75"/>
          </svg>
          <div class="atalho-copy">
            <span class="atalho-titulo">Meus Pacientes</span>
            <span class="atalho-sub">Pendências e atalhos por leito</span>
          </div>
        </button>

        <button class="btn-organizador" @click="router.push({ name: 'organizador' })">
          <div class="btn-org-inner">
            <span class="btn-org-icon">📋</span>
            <div class="btn-org-info">
              <span class="btn-org-titulo">Organizador do Plantão</span>
              <span class="btn-org-sub" v-if="!orgStore.plantao">Nenhum plantão ativo</span>
              <span class="btn-org-sub" v-else>
                {{ orgStore.plantao.tarefas.filter(t => t.feito).length }}/{{ orgStore.plantao.tarefas.length }} tarefas
                · {{ orgStore.plantao.tarefas.filter(t => !t.feito).length }} pendente{{ orgStore.plantao.tarefas.filter(t => !t.feito).length !== 1 ? 's' : '' }}
              </span>
            </div>
          </div>
        </button>
      </div>

      <div v-if="pulsoVisivel" class="pulso-card">
        <div class="pulso-header">
          <span class="pulso-titulo">💬 O que você acha do app?</span>
          <button class="pulso-fechar" @click="dispensarPulso">✕</button>
        </div>
        <p class="pulso-sub">Sua opinião ajuda a melhorar o Plantão.</p>
        <textarea
          v-model="textoFeedback"
          class="pulso-input"
          placeholder="Escreva o que quiser — erros, sugestões, elogios..."
          rows="3"
          maxlength="500"
        ></textarea>
        <div class="pulso-acoes">
          <button class="btn btn-tertiary pulso-adiar" @click="dispensarPulso">Agora não</button>
          <button
            class="btn btn-primary"
            :disabled="!textoFeedback.trim() || pulsoEnviando"
            @click="enviarPulso"
          >{{ pulsoEnviando ? 'Enviando...' : 'Enviar' }}</button>
        </div>
      </div>

      <div class="rodape-acoes">
        <button class="btn-atualizar" @click="() => location.reload()">
          🔄 Verificar atualizações
        </button>
        <button class="btn btn-ghost" @click="router.push({ name: 'configuracoes' })">
          ⚙️ Configurações
        </button>
        <button class="btn btn-ghost btn-pc-rodape" @click="pcModalAberto = true">
          💻 Acessar no computador
        </button>
      </div>

      <div v-if="pcModalAberto" class="modal-overlay" @click.self="pcModalAberto = false">
        <div class="modal-box">
          <p class="modal-titulo">💻 Como acessar no computador</p>
          <p class="modal-texto">Abra o <strong>Google Chrome</strong> ou qualquer navegador no seu computador e acesse:</p>
          <p class="modal-url">plantao.net</p>
          <p class="modal-texto">Faça login com a mesma conta — suas anotações já estarão lá.</p>
          <button class="btn btn-primary" style="width:100%;margin-top:8px" @click="pcModalAberto = false">Entendi</button>
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
import { useOnlineStatus } from '../composables/useOnlineStatus.js'
import { db } from '../firebase.js'
import { ref as dbRef, push, remove } from 'firebase/database'
import HelpModal from '../components/HelpModal.vue'
import TourDashboard from '../components/TourDashboard.vue'
import { subscribeSyncState } from '../utils/syncEvents.js'

const router = useRouter()
const auth = useAuthStore()
const anotacoesStore = useAnotacoesStore()
const pacientesStore = usePacientesStore()
const orgStore = useOrganizadorStore()
const { showToast } = useToast()
const { isOnline } = useOnlineStatus()

const pcDismissed = ref(localStorage.getItem('pc_banner_dismissed') === '1')
const pcModalAberto = ref(false)
const helpAberto = ref(false)
const tourRef = ref(null)
const syncDetalhesAbertos = ref(false)

const {
  visivel: pulsoVisivel,
  textoFeedback,
  enviando: pulsoEnviando,
  verificarPulso,
  dispensar: dispensarPulso,
  enviar: enviarPulso,
} = usePulso()

function dispensarPc() {
  localStorage.setItem('pc_banner_dismissed', '1')
  pcDismissed.value = true
}

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

const ultimoSyncLabel = computed(() => {
  if (!ultimoSyncAt.value) return 'Nunca sincronizado'
  return `Último: ${new Date(ultimoSyncAt.value).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
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
  { id: 'inicial', icon: '📋', nome: 'Anotação inicial', desc: 'Avaliação completa do paciente', rota: 'anotacao-inicial' },
  { id: 'sv', icon: '📊', nome: 'Sinais vitais', desc: 'PA, FC, FR, temperatura e dor', rota: 'sinais-vitais' },
  { id: 'medicacao', icon: '💊', nome: 'Medicação', desc: 'Administração e dupla checagem', rota: 'medicacao' },
  { id: 'encamin', icon: '🚑', nome: 'Encaminhamento', desc: 'Destino, transporte e dispositivos', rota: 'encaminhamento' },
  { id: 'banho', icon: '🧼', nome: 'Higienização', desc: 'Banho, troca e eliminações', rota: 'banho' },
  { id: 'curativo', icon: '🩹', nome: 'Curativo', desc: 'Lesão, cobertura e evolução', rota: 'curativo' },
  { id: 'passagem', icon: '🔄', nome: 'Passagem de plantão', desc: 'Resumo do turno e continuidade', rota: 'passagem' },
  { id: 'livre', icon: '📝', nome: 'Notas Livres', desc: 'Modelos próprios e notas rápidas', rota: 'livre' },
]

const tiposSecundarios = computed(() => tipos.filter(tipo => tipo.id !== 'inicial'))

function navegar(tipo) {
  if (tipo.rota) router.push({ name: tipo.rota })
  else alert(tipo.nome + ' em breve!')
}
</script>

<style scoped>
.dashboard-header {
  padding: 14px 16px;
}

.dashboard-main {
  padding-top: 24px;
  padding-bottom: 40px;
}

.header-logo {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--blue);
  font-size: 1.05rem;
  font-weight: 700;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-lateral {
  display: none;
}

@media (min-width: 768px) {
  .btn-lateral {
    display: inline-flex;
  }
}

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

.btn-icon:active {
  background: var(--bg-hover);
}

.hero-card {
  background: linear-gradient(180deg, rgba(30, 136, 229, 0.14), rgba(30, 136, 229, 0.05));
  border: 1px solid rgba(30, 136, 229, 0.2);
  border-radius: 18px;
  padding: 18px;
  margin-bottom: 14px;
}

.saudacao {
  margin-bottom: 16px;
}

.saudacao-hora {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.saudacao h2 {
  font-size: 1.55rem;
  font-weight: 700;
  color: var(--text);
  margin-top: 4px;
}

.saudacao-sub {
  margin-top: 10px;
  color: var(--text-dim);
  font-size: 0.92rem;
  line-height: 1.45;
  max-width: 32ch;
}

.hero-primary {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(10, 22, 40, 0.5);
  border: 1px solid rgba(30, 136, 229, 0.28);
  border-radius: 16px;
  padding: 14px;
  color: var(--text);
  font-family: inherit;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s;
}

.hero-primary:active {
  transform: scale(0.985);
  background: rgba(10, 22, 40, 0.7);
}

.hero-primary-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.hero-primary-copy {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.hero-primary-copy strong {
  font-size: 0.98rem;
  color: var(--text);
}

.hero-primary-copy span {
  font-size: 0.82rem;
  color: var(--text-dim);
  line-height: 1.35;
}

.hero-primary-arrow {
  margin-left: auto;
  color: var(--blue);
  font-size: 1.1rem;
  font-weight: 700;
}

.quick-tools {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.quick-tool {
  min-height: 40px;
}

.sync-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 12px;
  margin-bottom: 14px;
}

.sync-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
}

.sync-copy {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.sync-title {
  margin: 0;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.sync-status {
  font-size: 0.84rem;
  color: var(--text);
}

.sync-last {
  font-size: 0.74rem;
  color: var(--text-muted);
  white-space: nowrap;
}

.sync-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.sync-link {
  background: none;
  border: none;
  color: var(--text-dim);
  font-size: 0.82rem;
  font-family: inherit;
  padding: 0;
  cursor: pointer;
}

.sync-btn {
  border: 1px solid var(--blue);
  background: rgba(30, 136, 229, 0.1);
  color: var(--blue);
  font-size: 0.8rem;
  font-weight: 700;
  font-family: inherit;
  border-radius: 10px;
  padding: 8px 12px;
  cursor: pointer;
}

.sync-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.sync-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

.sync-chip {
  font-size: 0.78rem;
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 5px 10px;
  color: var(--text-muted);
  background: var(--bg-input);
}

.sync-chip-on {
  color: var(--blue);
  border-color: var(--blue);
  background: rgba(30, 136, 229, 0.08);
}

.card-pc {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  background: rgba(17, 29, 50, 0.72);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 12px 14px;
  margin-bottom: 18px;
  font-size: 0.88rem;
  color: var(--text-muted);
}

.card-pc-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-pc-content strong {
  color: var(--text);
}

.card-pc-fechar {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 0.85rem;
  padding: 2px 4px;
  flex-shrink: 0;
}

.secao-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
}

.secao-head-spaced {
  margin-top: 24px;
}

.secao-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.secao-hint {
  font-size: 0.76rem;
  color: var(--text-muted);
}

.tipos-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.tipo-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 16px 14px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;
}

.tipo-card:active {
  background: var(--bg-hover);
  transform: scale(0.98);
}

.tipo-icon {
  font-size: 1.45rem;
}

.tipo-texto {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tipo-nome {
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--text);
  line-height: 1.2;
}

.tipo-desc {
  font-size: 0.77rem;
  color: var(--text-muted);
  line-height: 1.35;
}

.tipo-badge {
  font-size: 0.62rem;
  color: var(--text-muted);
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 2px 6px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.acoes-row {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.btn-historico,
.btn-pacientes,
.btn-organizador {
  width: 100%;
  margin-top: 0;
}

.btn-historico,
.btn-pacientes {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px;
  border-radius: var(--radius);
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;
}

.btn-historico {
  background: var(--bg-card);
  border: 1px solid var(--border);
  color: var(--text-dim);
}

.btn-historico:active,
.btn-pacientes:active,
.btn-organizador:active {
  background: var(--bg-hover);
}

.btn-pacientes {
  background: rgba(30, 136, 229, 0.08);
  border: 1px solid rgba(30, 136, 229, 0.26);
  color: var(--blue);
}

.atalho-copy {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.atalho-titulo {
  font-size: 0.94rem;
  font-weight: 600;
  color: inherit;
}

.atalho-sub {
  font-size: 0.77rem;
  color: var(--text-muted);
  line-height: 1.35;
}

.btn-organizador {
  display: block;
  padding: 14px;
  background: rgba(30, 136, 229, 0.08);
  border: 1px solid rgba(30, 136, 229, 0.26);
  border-radius: var(--radius);
  font-family: inherit;
  cursor: pointer;
  text-align: left;
}

.btn-org-inner {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-org-icon {
  font-size: 1.4rem;
  flex-shrink: 0;
}

.btn-org-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.btn-org-titulo {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--blue);
}

.btn-org-sub {
  font-size: 0.78rem;
  color: var(--text-muted);
}

.pulso-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px;
  margin-top: 18px;
}

.pulso-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.pulso-titulo {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text);
}

.pulso-fechar {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 1rem;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 6px;
  font-family: inherit;
}

.pulso-sub {
  font-size: 0.82rem;
  color: var(--text-dim);
  margin-bottom: 10px;
}

.pulso-input {
  width: 100%;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: 10px;
  color: var(--text);
  font-family: inherit;
  font-size: 0.9rem;
  padding: 10px;
  resize: none;
  box-sizing: border-box;
  margin-bottom: 12px;
}

.pulso-input:focus {
  outline: none;
  border-color: var(--blue);
}

.pulso-acoes {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.pulso-adiar {
  width: auto;
  min-height: 44px;
}

.rodape-acoes {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 14px;
}

.btn-atualizar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 10px;
  background: none;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text-muted);
  font-family: inherit;
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-atualizar:active {
  background: var(--bg-hover);
  color: var(--text);
}

.btn-pc-rodape {
  color: var(--text-muted);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 24px;
}

.modal-box {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 24px;
  width: 100%;
  max-width: 360px;
}

.modal-titulo {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 14px;
}

.modal-texto {
  font-size: 0.92rem;
  color: var(--text-muted);
  margin-bottom: 10px;
}

.modal-url {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--blue);
  text-align: center;
  padding: 12px;
  background: var(--bg);
  border-radius: var(--radius);
  margin-bottom: 12px;
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

  .hero-card {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(280px, 360px);
    align-items: end;
    gap: 18px;
  }

  .tipos-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }

  .acoes-row {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 12px;
  }

  .rodape-acoes {
    flex-direction: row;
    align-items: center;
  }

  .rodape-acoes > * {
    flex: 1;
  }
}
</style>
