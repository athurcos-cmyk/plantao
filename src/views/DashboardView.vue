<template>
  <div class="screen">
    <header class="app-header">
      <div style="width:34px"/>
      <div class="header-logo">
        <img src="/icons/icon-512.png" width="28" height="28" alt="Plantão" style="border-radius:6px;display:block" />
        <span>Plantão</span>
      </div>
      <div style="display:flex;align-items:center;gap:6px">
        <button class="btn-feedback-topo" @click="abrirFeedback" title="Enviar feedback">💬</button>
        <button class="btn-ajuda btn-lateral" @click="abrirJanelaLateral" title="Abrir ao lado do prontuário">⊞ Ao lado</button>
        <button class="btn-ajuda" @click="tourRef?.abrirTour()" title="Ver tutorial">▶ Tutorial</button>
        <button class="btn-ajuda" @click="helpAberto = true">? Ajuda</button>
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

    <main class="container" style="padding-top:24px;padding-bottom:40px">
      <div class="saudacao">
        <p class="saudacao-hora">{{ saudacaoTexto }}</p>
        <h2 v-if="auth.userName">{{ auth.userName }}</h2>
      </div>

      <section class="sync-card">
        <div class="sync-top">
          <p class="sync-title">Sincronização</p>
          <span class="sync-last">{{ ultimoSyncLabel }}</span>
        </div>
        <div class="sync-chips">
          <span class="sync-chip" :class="{ 'sync-chip-on': pendAnotacoes > 0 }">Anotações {{ pendAnotacoes }}</span>
          <span class="sync-chip" :class="{ 'sync-chip-on': pendPacientes > 0 }">Pacientes {{ pendPacientes }}</span>
          <span class="sync-chip" :class="{ 'sync-chip-on': pendModelos > 0 }">Modelos {{ pendModelos }}</span>
          <span class="sync-chip" :class="{ 'sync-chip-on': pendOrganizador > 0 }">Organizador {{ pendOrganizador }}</span>
        </div>
        <div class="sync-row">
          <span class="sync-status">
            {{ totalPendencias > 0 ? `${totalPendencias} pendência${totalPendencias !== 1 ? 's' : ''}` : 'Tudo sincronizado' }}
          </span>
          <button class="sync-btn" :disabled="sincronizandoAgora || !isOnline" @click="sincronizarAgora">
            {{ sincronizandoAgora ? 'Sincronizando...' : (isOnline ? 'Tentar agora' : 'Sem internet') }}
          </button>
        </div>
      </section>

      <div v-if="!pcDismissed" class="card-pc">
        <div class="card-pc-content">
          <span>💻</span>
          <span>Acesse também no computador — abra o Chrome e digite <strong>plantao.net</strong></span>
        </div>
        <button class="card-pc-fechar" @click="dispensarPc" title="Fechar">✕</button>
      </div>

      <p class="secao-label">Nova anotação</p>

      <div class="tipos-grid">
        <button  data-testid="auto-btn-dashboardview-2" v-for="tipo in tipos" :key="tipo.id" class="tipo-card" @click="navegar(tipo)">
          <span class="tipo-icon">{{ tipo.icon }}</span>
          <span class="tipo-nome">{{ tipo.nome }}</span>
          <span v-if="!tipo.rota" class="tipo-badge">em breve</span>
        </button>
      </div>

      <div class="acoes-row">
        <button data-testid="auto-btn-dashboardview-3" class="btn-historico" @click="router.push({ name: 'historico' })">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          Histórico de anotações
        </button>

        <button class="btn-pacientes" @click="router.push({ name: 'pacientes' })">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 00-3-3.87"/>
            <path d="M16 3.13a4 4 0 010 7.75"/>
          </svg>
          Meus Pacientes do plantão
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

      <!-- Pulso do App — Banner de Feedback -->
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
          <button class="btn btn-ghost" @click="dispensarPulso">Agora não</button>
          <button
            class="btn btn-primary"
            :disabled="!textoFeedback.trim() || pulsoEnviando"
            @click="enviarPulso"
          >{{ pulsoEnviando ? 'Enviando...' : 'Enviar' }}</button>
        </div>
      </div>

      <button class="btn-atualizar" @click="() => location.reload()">
        🔄 Verificar atualizações
      </button>

      <div class="rodape-acoes">
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

const router   = useRouter()
const pcDismissed = ref(localStorage.getItem('pc_banner_dismissed') === '1')
function dispensarPc() { localStorage.setItem('pc_banner_dismissed', '1'); pcDismissed.value = true }
const pcModalAberto = ref(false)
const auth     = useAuthStore()
const anotacoesStore = useAnotacoesStore()
const pacientesStore = usePacientesStore()
const orgStore = useOrganizadorStore()
const { showToast } = useToast()
const { isOnline } = useOnlineStatus()

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

const helpAberto = ref(false)
const tourRef = ref(null)

const helpItens = [
  { icone: '🩺', titulo: 'Anotação Inicial', desc: 'Registre o estado do paciente: posição da cama, dispositivos, neurológico, respiratório e eliminações. Gere o texto formatado e copie para o sistema.' },
  { icone: '📊', titulo: 'Sinais Vitais', desc: 'Registre PA, FC, FR, Tax, SpO₂ e HGT com horário. Inclui escala de dor 0–10 com chips coloridos (verde/laranja/vermelho) e conduta tomada (comunicou enfermeira, medicou, reavaliou). Texto gerado automaticamente.' },
  { icone: '💊', titulo: 'Medicação', desc: 'Documente os medicamentos administrados com dose, via, diluição e dupla checagem. Inclui local anatômico para vias IM, SC e EV. Suporta múltiplos medicamentos no mesmo horário.' },
  { icone: '🚑', titulo: 'Encaminhamento', desc: 'Gere a anotação de encaminhamento do paciente: destino (com chips personalizados por conta), tipo de transporte, acompanhante e dispositivos em uso.' },
  { icone: '🧼', titulo: 'Higienização', desc: 'Registre banho de aspersão, banho de leito ou troca de fralda. Na troca de fralda, selecione o tipo de eliminação (diurese, evacuação ou ambos), a quantidade e o local — troca de roupa de cama é incluída automaticamente quando em leito.' },
  { icone: '🩹', titulo: 'Curativo', desc: 'Documente curativo simples, troca ou troca de placa. Inclui avaliação COREN colapsável: tipo de lesão, tamanho, leito da ferida, exsudato (quantidade + aspecto), pele perilesão e bordas. Locais e materiais salvos por conta ou de uso único.' },
  { icone: '🔄', titulo: 'Passagem de plantão', desc: 'Gere a anotação de passagem de plantão: registre refeição ofertada, queixas, posição da cama, rodas, grades e decúbito. Inclua opcionalmente dieta enteral, infusão venosa, SVD e observações livres.' },
  { icone: '📝', titulo: 'Notas Livres', desc: 'Crie seus próprios modelos de anotação e use com um toque. Adicione horário e texto livre, acumule várias notas e gere o texto formatado. Modelos salvos por conta no Firebase. Funciona offline.' },
  { icone: '🛏️', titulo: 'Meus Pacientes', desc: 'Cadastre os pacientes do seu plantão por leito. Adicione pendências para cada um e marque conforme resolve. Aparecem como atalho nas anotações.' },
  { icone: '📋', titulo: 'Organizador', desc: 'Checklist de tarefas do seu turno com horários e alertas. Anote o que precisa ser passado para o próximo plantão.' },
  { icone: '🕐', titulo: 'Histórico', desc: 'Acesse, busque, edite e compartilhe todas as anotações já geradas. Filtre por tipo ou por paciente.' },
  { icone: '🔑', titulo: 'Código de sincronização', desc: 'Seu código único sincroniza os dados em qualquer dispositivo. Use o mesmo código e PIN no celular, tablet ou computador.' },
  { icone: '🧮', titulo: 'Calculadora de Medicação', desc: 'FAB verde flutuante em todas as telas. Quatro abas: Dosagem (regra de três), Gotejamento (macro/microgotas, horas/minutos), Diluição (reconstituição de pó com campo de volume liofilizado — ex: Penicilina Cristalina) e Conversões (tabela de referência). Salva os últimos 5 cálculos.' },
  { icone: '✨', titulo: 'Clara — Assistente IA', desc: 'Clara é uma IA especialista em enfermagem disponível no botão ✨ do dashboard. Use para tirar dúvidas sobre procedimentos, organização do plantão, cálculos de medicação, ou para pedir que ela redija uma anotação para você. Diga "redige a anotação de..." e ela entrega o texto pronto para copiar. As respostas são sugestões — sempre revise antes de usar.' },
  { icone: '💬', titulo: 'Feedback', desc: 'O botão 💬 no topo do dashboard abre um campo para você enviar uma mensagem para a equipe do Plantão. Após alguns dias de uso, o app pode perguntar automaticamente o que você achou — responda para nos ajudar a melhorar.' },
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
    } catch (_) {
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
  } catch (_) {
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
  // Pulso: verificar cadência com delay para não sobrepor carregamento
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
  { id: 'inicial',   icon: '📋', nome: 'Anotação inicial',      rota: 'anotacao-inicial' },
  { id: 'sv',        icon: '📊', nome: 'Sinais vitais',          rota: 'sinais-vitais'   },
  { id: 'medicacao', icon: '💊', nome: 'Medicação',              rota: 'medicacao'   },
  { id: 'encamin',   icon: '🚑', nome: 'Encaminhamento',         rota: 'encaminhamento' },
  { id: 'banho',     icon: '🧼', nome: 'Higienização',            rota: 'banho' },
  { id: 'curativo',  icon: '🩹', nome: 'Curativo',               rota: 'curativo' },
  { id: 'passagem',  icon: '🔄', nome: 'Passagem de plantão',    rota: 'passagem' },
  { id: 'livre',     icon: '📝', nome: 'Notas Livres',             rota: 'livre' },
]

function navegar(tipo) {
  if (tipo.rota) router.push({ name: tipo.rota })
  else alert(tipo.nome + ' em breve!')
}

</script>

<style scoped>
.btn-lateral {
  display: none;
}
@media (min-width: 768px) {
  .btn-lateral {
    display: inline-flex;
  }
}
.header-logo {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--blue);
  font-size: 1.05rem;
  font-weight: 700;
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
.btn-icon:active { background: var(--bg-hover); }

.saudacao { margin-bottom: 28px; }
.saudacao-hora { color: var(--text-muted); font-size: 0.9rem; }
.saudacao h2 { font-size: 1.4rem; font-weight: 700; color: var(--text); margin-top: 2px; }

.rodape-acoes {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 10px;
}
.btn-pc-rodape { color: var(--text-muted); }

.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex; align-items: center; justify-content: center;
  z-index: 200; padding: 24px;
}
.modal-box {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 24px;
  width: 100%; max-width: 360px;
}
.modal-titulo { font-size: 1.1rem; font-weight: 700; margin-bottom: 14px; }
.modal-texto { font-size: 0.92rem; color: var(--text-muted); margin-bottom: 10px; }
.modal-url {
  font-size: 1.3rem; font-weight: 700; color: var(--blue);
  text-align: center; padding: 12px;
  background: var(--bg); border-radius: var(--radius);
  margin-bottom: 12px;
}

.card-pc {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 12px 14px;
  margin-bottom: 12px;
  font-size: 0.88rem;
  color: var(--text-muted);
}
.card-pc-content { display: flex; align-items: center; gap: 8px; }
.card-pc-content strong { color: var(--text); }
.card-pc-fechar {
  background: none; border: none; color: var(--text-muted);
  cursor: pointer; font-size: 0.85rem; padding: 2px 4px; flex-shrink: 0;
}
.card-pc-fechar:hover { color: var(--text); }

.sync-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 12px;
  margin-bottom: 18px;
}
.sync-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
}
.sync-title {
  margin: 0;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.sync-last {
  font-size: 0.74rem;
  color: var(--text-muted);
}
.sync-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
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
.sync-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.sync-status {
  font-size: 0.8rem;
  color: var(--text-dim);
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

.secao-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 12px;
}

.tipos-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

.tipo-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 18px 14px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;
}
.tipo-card:active { background: var(--bg-hover); transform: scale(0.97); }
.tipo-icon { font-size: 1.5rem; }
.tipo-nome { font-size: 0.9rem; font-weight: 600; color: var(--text); line-height: 1.3; }
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

.btn-historico {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  margin-top: 24px;
  padding: 14px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text-dim);
  font-family: inherit;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-historico:active { background: var(--bg-hover); }

.btn-pacientes {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  width: 100%; margin-top: 16px; padding: 14px;
  background: var(--bg-card); border: 1px solid var(--blue);
  border-radius: var(--radius); color: var(--blue);
  font-family: inherit; font-size: 0.95rem; font-weight: 600;
  cursor: pointer; transition: all 0.15s;
}
.btn-pacientes:active { background: var(--bg-hover); }

.btn-organizador {
  display: block; width: 100%; margin-top: 10px; padding: 14px;
  background: var(--bg-card); border: 1px solid var(--blue);
  border-radius: var(--radius);
  font-family: inherit; cursor: pointer; transition: all 0.15s;
  text-align: left;
}
.btn-organizador:active { background: var(--bg-hover); }
.btn-org-inner {
  display: flex; align-items: center; gap: 10px;
}
.btn-org-icon { font-size: 1.4rem; flex-shrink: 0; }
.btn-org-info {
  display: flex; flex-direction: column; gap: 2px;
}
.btn-org-titulo {
  font-size: 0.95rem; font-weight: 600; color: var(--blue);
}
.btn-org-sub {
  font-size: 0.78rem; color: var(--text-muted);
}

/* Verificar atualizações */
.btn-atualizar {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  width: 100%; margin-top: 12px; padding: 10px;
  background: none; border: 1px solid var(--border);
  border-radius: var(--radius); color: var(--text-muted);
  font-family: inherit; font-size: 0.82rem;
  cursor: pointer; transition: all 0.15s;
}
.btn-atualizar:active { background: var(--bg-hover); color: var(--text); }

/* Feedback button in header */
.btn-feedback-topo {
  background: none;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  opacity: 0.7;
  transition: opacity 0.15s;
}
.btn-feedback-topo:hover { opacity: 1; }

/* Primeiro Sucesso Banner */
.banner-primeiro-sucesso {
  background: var(--bg-card);
  border: 1px solid var(--blue);
  border-radius: var(--radius);
  padding: 14px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.bps-esquerda {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}
.bps-icon { font-size: 1.4rem; flex-shrink: 0; }
.bps-texto {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.bps-texto strong { font-size: 0.88rem; color: var(--text); }
.bps-texto span { font-size: 0.78rem; color: var(--text-dim); }
.bps-cta {
  background: var(--blue);
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 8px 14px;
  font-size: 0.85rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  flex-shrink: 0;
  white-space: nowrap;
}

/* Pulso do App Card */
.pulso-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px;
  margin-top: 16px;
}
.pulso-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}
.pulso-titulo { font-size: 0.95rem; font-weight: 700; color: var(--text); }
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
.pulso-fechar:hover { color: var(--text); }
.pulso-sub { font-size: 0.82rem; color: var(--text-dim); margin-bottom: 10px; }
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
.pulso-input:focus { outline: none; border-color: var(--blue); }
.pulso-acoes {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* acoes-row: empilhado no mobile, 3 colunas no desktop */
.acoes-row {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 16px;
}
.acoes-row .btn-historico,
.acoes-row .btn-pacientes,
.acoes-row .btn-organizador {
  margin-top: 0;
  width: 100%;
}

/* ── Desktop layout ──────────────────────────────────────────── */
@media (min-width: 768px) {
  /* Header mais largo */
  .app-header {
    max-width: 100%;
    padding: 0 32px;
  }

  /* Container central mais largo */
  .container {
    max-width: 960px !important;
    padding-left: 32px !important;
    padding-right: 32px !important;
  }

  /* Saudação */
  .saudacao {
    display: flex;
    align-items: baseline;
    gap: 12px;
    margin-bottom: 24px;
  }
  .saudacao-hora { font-size: 1rem; }
  .saudacao h2 { font-size: 1.6rem; margin-top: 0; }

  /* 4 colunas nos cards de anotação */
  .tipos-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }
  .tipo-card {
    padding: 20px 16px;
  }

  /* 3 colunas nas ações */
  .acoes-row {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 12px;
    margin-top: 20px;
  }

  /* Histórico em destaque no desktop */
  .acoes-row .btn-historico {
    background: rgba(30, 136, 229, 0.08);
    border-color: var(--blue);
    color: var(--blue);
    font-size: 1rem;
    padding: 18px 14px;
  }
  .acoes-row .btn-historico:hover {
    background: rgba(30, 136, 229, 0.15);
  }

  /* Pacientes e Organizador com altura mínima igual */
  .acoes-row .btn-pacientes,
  .acoes-row .btn-organizador {
    padding: 18px 14px;
  }

  /* Sync card mais compacto */
  .sync-card {
    padding: 14px 16px;
  }

  /* Botões de fundo menos proeminentes */
  .btn-atualizar {
    max-width: 280px;
  }
}
</style>
