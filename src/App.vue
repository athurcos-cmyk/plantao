<template>
  <div :class="['app-shell', { 'app-shell-with-nav': mostrarBottomNav, 'app-shell-offline': !isOnline }]">
    <RouterView v-slot="{ Component }">
      <Transition name="page-fade" mode="out-in">
        <component :is="Component" :key="$route.name" />
      </Transition>
    </RouterView>
  </div>
  <nav v-if="mostrarBottomNav" class="bottom-nav">
    <button :class="['bottom-nav-item', { 'bottom-nav-item-on': route.name === 'dashboard' }]" @click="irParaInicio">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5 9.5V21h14V9.5" />
      </svg>
      <span>Início</span>
    </button>
    <button :class="['bottom-nav-item', { 'bottom-nav-item-on': route.name === 'pacientes' }]" @click="router.push({ name: 'pacientes' })">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
        <circle cx="9" cy="8" r="3" />
        <circle cx="17" cy="9" r="2.5" />
        <path d="M4 19c0-2.8 2.6-5 5.8-5s5.8 2.2 5.8 5" />
        <path d="M14.5 18c.3-1.8 1.9-3.2 4-3.2 1.2 0 2.3.4 3.1 1.1" />
      </svg>
      <span>Pacientes</span>
    </button>
    <button :class="['bottom-nav-item', 'bottom-nav-item-calc', { 'bottom-nav-item-on': calculadoraAberta }]" @click="toggleCalculadora">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="5" y="3" width="14" height="18" rx="3" />
        <path d="M8 7.5h8" />
        <path d="M8 12h2" />
        <path d="M12 12h2" />
        <path d="M16 12h0.01" />
        <path d="M8 16h2" />
        <path d="M12 16h2" />
        <path d="M16 16h0.01" />
      </svg>
      <span>Calc</span>
    </button>
    <button :class="['bottom-nav-item', { 'bottom-nav-item-on': chatAberto }]" @click="toggleChat">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
        <path d="M7 17.5H5a2 2 0 0 1-2-2V7.5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-7l-4 3v-3Z" />
        <path d="M8 10h8" />
        <path d="M8 13h5" />
      </svg>
      <span>Clara</span>
    </button>
    <button :class="['bottom-nav-item', { 'bottom-nav-item-on': route.name === 'organizador' }]" @click="router.push({ name: 'organizador' })">
      <span v-if="tarefasPendentes > 0" class="bottom-nav-badge">{{ tarefasPendentes }}</span>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
        <rect x="5" y="4" width="14" height="16" rx="2" />
        <path d="M9 9h6" />
        <path d="M9 13h6" />
        <path d="m9 17 1.5 1.5L15 14" />
      </svg>
      <span>Tarefas</span>
    </button>
    <button :class="['bottom-nav-item', { 'bottom-nav-item-on': route.name === 'configuracoes' }]" @click="router.push({ name: 'configuracoes' })">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
        <circle cx="12" cy="8" r="3" />
        <path d="M5 20c0-3.3 3.1-6 7-6s7 2.7 7 6" />
      </svg>
      <span>Perfil</span>
    </button>
  </nav>
  <ChatAssistente v-if="mostrarBottomNav" />
  <CalculadoraModal v-if="mostrarCalculadora" />
  <Transition name="toast">
    <div v-if="toastMsg" class="toast-central">{{ toastMsg }}</div>
  </Transition>
  <Transition name="offline-bar">
    <div v-if="!isOnline" class="offline-bar">
      <span>📵</span> Sem internet — dados salvos localmente
      <span v-if="totalPendentes > 0" class="offline-badge">{{ totalPendentes }}</span>
    </div>
  </Transition>
  <Transition name="install-bar">
    <div v-if="mostrarInstall" class="install-bar">
      <span class="install-icon">📱</span>
      <div class="install-texto">
        <span class="install-titulo">Instalar o app Plantão</span>
        <span class="install-sub">Sem loja de apps — fica na tela de início como qualquer app</span>
      </div>
      <button class="install-btn" @click="instalarApp">Instalar</button>
      <button class="install-fechar" @click="mostrarInstall = false">✕</button>
    </div>
  </Transition>
  <Transition name="safari-bar">
    <div v-if="mostrarTutorialSafari" class="safari-bar">
      <span class="safari-bar-icon">📲</span>
      <span class="safari-bar-texto">Instale o app no seu iPhone</span>
      <button class="safari-bar-btn" @click="tutorialAberto = true">Ver como</button>
      <button class="install-fechar" @click="mostrarTutorialSafari = false">✕</button>
    </div>
  </Transition>

  <!-- Modal tutorial Safari -->
  <Transition name="modal-fade">
    <div v-if="tutorialAberto" class="modal-overlay" @click.self="tutorialAberto = false" @keydown.esc="tutorialAberto = false">
      <div class="modal-tutorial" role="dialog" aria-modal="true" aria-labelledby="modal-instalar-titulo">
        <div class="modal-tutorial-header">
          <span id="modal-instalar-titulo" class="modal-tutorial-titulo">Instalar no iPhone</span>
          <button class="install-fechar" @click="tutorialAberto = false" aria-label="Fechar tutorial">✕</button>
        </div>
        <ol class="tutorial-passos">
          <li>
            <span class="tutorial-num">1</span>
            <div>
              <strong>Toque em Compartilhar</strong>
              <p>O botão fica na barra inferior do Safari — quadrado com seta para cima <span class="tutorial-icone-inline">⬆️</span></p>
            </div>
          </li>
          <li>
            <span class="tutorial-num">2</span>
            <div>
              <strong>Role a lista e toque em</strong>
              <p><strong class="tutorial-destaque">Adicionar à Tela de Início</strong></p>
            </div>
          </li>
          <li>
            <span class="tutorial-num">3</span>
            <div>
              <strong>Toque em Adicionar</strong>
              <p>O app aparecerá na sua tela de início como qualquer outro app</p>
            </div>
          </li>
        </ol>
        <button class="btn-tutorial-ok" @click="tutorialAberto = false">Entendido</button>
      </div>
    </div>
  </Transition>

  <Transition name="ios-bar">
    <div v-if="mostrarBannerIOS" class="ios-bar">
      <span class="ios-bar-icon">🍎</span>
      <span class="ios-bar-texto">Para instalar o app, abra no <strong>Safari</strong></span>
      <button class="ios-bar-btn" @click="copiarLinkIOS" :class="{ 'ios-bar-btn-erro': erroCopia }">
        {{ linkCopiado ? 'Copiado ✓' : erroCopia ? 'Erro — tente manualmente' : 'Copiar link' }}
      </button>
      <button class="install-fechar" @click="mostrarBannerIOS = false">✕</button>
    </div>
  </Transition>
  <Transition name="update-bar">
    <div v-if="temAtualizacao && auth.isLoggedIn" class="update-bar">
      <span>🆕 Nova versão disponível</span>
      <button class="update-btn" @click="recarregarApp">Atualizar</button>
    </div>
  </Transition>
</template>

<script setup>
import { watch, computed, onMounted, onUnmounted, ref, defineAsyncComponent } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth.js'
import { useAnotacoesStore } from './stores/anotacoes.js'
import { usePacientesStore } from './stores/pacientes.js'
import { useOrganizadorStore } from './stores/organizador.js'
import { useRouter } from 'vue-router'
import { useToast } from './composables/useToast.js'
import { useOnlineStatus } from './composables/useOnlineStatus.js'
import { useChat } from './composables/useChat.js'
import { useCalculadora } from './composables/useCalculadora.js'
import { emitSyncState } from './utils/syncEvents.js'

const ChatAssistente = defineAsyncComponent(() => import('./components/ChatAssistente.vue'))
const CalculadoraModal = defineAsyncComponent(() => import('./components/CalculadoraModal.vue'))

const { toastMsg, showToast } = useToast()
const { isOnline } = useOnlineStatus()

const auth        = useAuthStore()
const anotacoes   = useAnotacoesStore()
const pacientes   = usePacientesStore()
const organizador = useOrganizadorStore()
const { limparConversa, aberto: chatAberto, toggleChat } = useChat()
const { aberta: calculadoraAberta, toggleCalculadora } = useCalculadora()
const router     = useRouter()
const route      = useRoute()
const rotasSemCalculadora = ['landing', 'login', 'pc']
const rotasComBottomNav = ['dashboard', 'historico', 'pacientes', 'organizador', 'configuracoes']
const mostrarCalculadora = computed(() => auth.isLoggedIn && !rotasSemCalculadora.includes(route.name))
const mostrarBottomNav = computed(() => auth.isLoggedIn && rotasComBottomNav.includes(route.name))
const sincronizando = ref(false)
const SYNC_RETRY_MS = 10 * 1000
const LAST_SYNC_KEY_PREFIX = 'last_sync_'
let syncRetryTimer = null
let pushModulePromise = null

async function configurarPushSobDemanda(syncCode) {
  if (!syncCode) return
  if (!pushModulePromise) {
    pushModulePromise = import('./composables/usePushNotificacoes.js')
  }
  const { configurarPush } = await pushModulePromise
  await configurarPush(syncCode)
}

const totalPendentes = computed(() =>
  (anotacoes.pendentes || 0) + (pacientes.pendentesCount || 0)
)

const tarefasPendentes = computed(() => {
  if (!organizador.plantao) return 0
  return (organizador.plantao.tarefas || []).filter((t) => !t.feito).length
})

function irParaInicio() {
  if (route.name === 'dashboard') {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }
  router.push({ name: 'dashboard' })
}

function persistirSyncOk() {
  if (!auth.syncCode) return
  const ts = Date.now()
  try { localStorage.setItem(`${LAST_SYNC_KEY_PREFIX}${auth.syncCode}`, String(ts)) } catch {}
  emitSyncState({
    code: auth.syncCode,
    source: 'app',
    type: 'sync-ok',
    lastSyncAt: ts,
    totalPendencias: totalPendentes.value,
  })
}

async function sincronizarTudo(avisarSemPendencia = false) {
  if (sincronizando.value) return
  if (!auth.isLoggedIn || !isOnline.value) return

  sincronizando.value = true
  try {
    const [nAnot, nPac] = await Promise.all([
      anotacoes.sincronizarPendentes(),
      pacientes.sincronizarPendentes(),
    ])
    await organizador.sincronizarOrganizador()
    persistirSyncOk()

    const total = (nAnot || 0) + (nPac || 0)
    if (total > 0) showToast(`${total} item${total === 1 ? '' : 'ns'} sincronizado${total === 1 ? '' : 's'} ✓`)
    else if (avisarSemPendencia) showToast('Conexão restaurada ✓')
  } catch (_) {
    // Rede instável: mantém pendências e tenta novamente no próximo ciclo.
  } finally {
    sincronizando.value = false
  }
}

// Inicia o listener do Firebase quando logado,
// para quando deslogar ou sessão expirar
watch(
  () => auth.isLoggedIn,
  (logado) => {
    if (logado) {
      anotacoes.iniciar()
      if (isOnline.value) sincronizarTudo(false)
      configurarPushSobDemanda(auth.syncCode).catch(() => {})
    } else {
      anotacoes.parar()
      pacientes.parar()
      organizador.parar()
      limparConversa()
    }
  },
  { immediate: true }
)

// Ao voltar online: sincroniza tudo que ficou pendente
watch(isOnline, async (online) => {
  if (online && auth.isLoggedIn) {
    await sincronizarTudo(true)
  }
})

function limparRetrySync() {
  if (!syncRetryTimer) return
  clearTimeout(syncRetryTimer)
  syncRetryTimer = null
}

function agendarRetrySync() {
  limparRetrySync()
  if (!isOnline.value || !auth.isLoggedIn || totalPendentes.value <= 0) return
  const delay = document.hidden ? Math.max(SYNC_RETRY_MS * 3, 30_000) : SYNC_RETRY_MS
  syncRetryTimer = setTimeout(async () => {
    await sincronizarTudo(false)
    agendarRetrySync()
  }, delay)
}

watch([isOnline, () => auth.isLoggedIn, totalPendentes], () => {
  agendarRetrySync()
}, { immediate: true })

watch(mostrarBottomNav, (visivel) => {
  if (!visivel && chatAberto.value) toggleChat()
})

// ─── PWA auto-update ───
// registerSW retorna função updateSW() que força check + ativação do novo SW
import { registerSW } from 'virtual:pwa-register'
const temAtualizacao = ref(false)
function recarregarApp() { window.location.reload() }
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() { temAtualizacao.value = true },
  onRegisteredSW(swUrl, registration) {
    // Check de update ao voltar à aba (visibilitychange)
    if (registration) {
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) registration.update()
      })
    }
  },
})

// Banner de instalação PWA
const mostrarInstall = ref(false)
let _installPrompt = null

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  _installPrompt = e
  // Só mostra se não estiver em modo standalone (já instalado)
  const jaInstalado = window.matchMedia('(display-mode: standalone)').matches
  if (!jaInstalado) mostrarInstall.value = true
})

// Banner iOS Safari: detecta Safari no iPhone/iPad fora do standalone → mostra tutorial
const mostrarTutorialSafari = ref(false)
const tutorialAberto = ref(false)

;(function detectarIOSSafari() {
  const ua = navigator.userAgent
  const isIOS = /iphone|ipad|ipod/i.test(ua)
  const isSafari = /safari/i.test(ua) && !/chrome|crios|fxios|edgios/i.test(ua)
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    || navigator.standalone === true
  if (isIOS && isSafari && !isStandalone) {
    mostrarTutorialSafari.value = true
  }
})()

// Banner iOS + Chrome: detecta iPhone/iPad no Chrome (não-Safari) fora do standalone
// iOS não expõe beforeinstallprompt — usuário precisa instalar pelo Safari
const mostrarBannerIOS = ref(false)
const linkCopiado = ref(false)
const erroCopia = ref(false)

;(function detectarIOSChrome() {
  const ua = navigator.userAgent
  const isIOS = /iphone|ipad|ipod/i.test(ua)
  const isSafari = /safari/i.test(ua) && !/chrome|crios|fxios|edgios/i.test(ua)
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    || navigator.standalone === true
  if (isIOS && !isSafari && !isStandalone) {
    mostrarBannerIOS.value = true
  }
})()

async function copiarLinkIOS() {
  let ok = false
  try {
    await navigator.clipboard.writeText(window.location.href)
    ok = true
  } catch {
    try {
      const ta = document.createElement('textarea')
      ta.value = window.location.href
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      ok = true
    } catch { /* ambos falharam */ }
  }
  if (ok) {
    linkCopiado.value = true
    setTimeout(() => { linkCopiado.value = false }, 2500)
  } else {
    erroCopia.value = true
    setTimeout(() => { erroCopia.value = false }, 3000)
  }
}

async function instalarApp() {
  if (!_installPrompt) return
  _installPrompt.prompt()
  const { outcome } = await _installPrompt.userChoice
  if (outcome === 'accepted') mostrarInstall.value = false
  _installPrompt = null
}

// Inicializa listener de autenticação do Firebase
onMounted(async () => {
  await auth.initAuthListener()
  document.addEventListener('visibilitychange', agendarRetrySync)
  agendarRetrySync()
})

onUnmounted(() => {
  limparRetrySync()
  document.removeEventListener('visibilitychange', agendarRetrySync)
})
</script>

<style>
.app-shell-with-nav {
  padding-bottom: 108px;
}

.app-shell-offline {
  padding-bottom: 44px;
}

.app-shell-with-nav.app-shell-offline {
  padding-bottom: 152px;
}

.bottom-nav {
  position: fixed;
  left: 50%;
  bottom: max(12px, env(safe-area-inset-bottom));
  transform: translateX(-50%);
  width: min(94vw, 420px);
  padding: 8px 9px;
  border-radius: 18px;
  border: 1px solid var(--border);
  background: var(--bg-card);
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 3px;
  z-index: 220;
  box-shadow: var(--shadow-lg);
}

.bottom-nav-item {
  position: relative;
  min-height: 54px;
  border: none;
  border-radius: 14px;
  background: transparent;
  color: var(--text-dim);
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

.bottom-nav-item-calc svg {
  filter: drop-shadow(0 0 10px var(--blue-faint));
}

.bottom-nav-item-on {
  background: var(--blue-muted);
  color: var(--blue);
}

.bottom-nav-badge {
  position: absolute;
  top: 4px;
  right: 10px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 999px;
  background: var(--danger);
  color: var(--text-on-accent);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.62rem;
  font-weight: 800;
}

.offline-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--bg-card);
  border-top: 1px solid var(--danger);
  color: var(--text);
  font-size: 0.82rem;
  font-weight: 600;
  text-align: center;
  padding: 10px 16px;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.offline-badge {
  background: var(--danger);
  color: var(--text-on-accent);
  border-radius: 10px;
  padding: 1px 7px;
  font-size: 0.75rem;
  font-weight: 800;
}

.offline-bar-enter-active,
.offline-bar-leave-active { transition: transform 0.25s ease; }
.offline-bar-enter-from,
.offline-bar-leave-to     { transform: translateY(100%); }

.install-bar {
  position: fixed;
  left: 50%;
  bottom: calc(12px + env(safe-area-inset-bottom, 0px));
  transform: translateX(-50%);
  width: min(460px, calc(100% - 20px));
  background: var(--bg-card);
  border: 1px solid var(--blue);
  border-radius: 16px;
  color: var(--text);
  font-size: 0.85rem;
  font-weight: 500;
  padding: 12px 16px;
  z-index: 9998;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: var(--shadow-modal);
}
.install-icon { font-size: 1.2rem; flex-shrink: 0; }
.install-texto {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.install-titulo {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text);
}
.install-sub {
  font-size: 0.75rem;
  color: var(--text-dim);
  font-weight: 400;
}
.install-btn {
  background: var(--blue);
  color: var(--text-on-accent);
  border: none;
  border-radius: 8px;
  padding: 6px 16px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  flex-shrink: 0;
}
.install-fechar {
  background: transparent;
  border: none;
  color: var(--text-dim);
  font-size: 1rem;
  cursor: pointer;
  padding: 10px 12px;
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  line-height: 1;
}
.install-bar-enter-active,
.install-bar-leave-active { transition: transform 0.3s ease; }
.install-bar-enter-from,
.install-bar-leave-to     { transform: translate(-50%, 140%); }

.safari-bar {
  position: fixed;
  left: 50%;
  bottom: calc(12px + env(safe-area-inset-bottom, 0px));
  transform: translateX(-50%);
  width: min(460px, calc(100% - 20px));
  background: var(--bg-card);
  border: 1px solid var(--blue);
  border-radius: 16px;
  color: var(--text);
  font-size: 0.85rem;
  font-weight: 500;
  padding: 12px 16px;
  z-index: 9996;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: var(--shadow-modal);
}
.safari-bar-icon { font-size: 1.2rem; flex-shrink: 0; }
.safari-bar-texto { flex: 1; }
.safari-bar-btn {
  background: var(--blue);
  color: var(--text-on-accent);
  border: none;
  border-radius: 8px;
  padding: 6px 14px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  flex-shrink: 0;
}
.safari-bar-enter-active,
.safari-bar-leave-active { transition: transform 0.3s ease; }
.safari-bar-enter-from,
.safari-bar-leave-to     { transform: translate(-50%, 140%); }

/* ── Modal tutorial Safari ── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  z-index: 10001;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
.modal-tutorial {
  background: var(--bg-card);
  border: 1px solid var(--blue);
  border-bottom: none;
  border-radius: 20px 20px 0 0;
  padding: 24px 20px 32px;
  width: 100%;
  max-width: 480px;
}
.modal-tutorial-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.modal-tutorial-titulo {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text);
}
.tutorial-passos {
  list-style: none;
  padding: 0;
  margin: 0 0 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.tutorial-passos li {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}
.tutorial-num {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--blue);
  color: var(--text-on-accent);
  font-size: 0.8rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 1px;
}
.tutorial-passos li div strong {
  font-size: 0.9rem;
  color: var(--text);
  display: block;
  margin-bottom: 2px;
}
.tutorial-passos li div p {
  font-size: 0.82rem;
  color: var(--text-dim);
  margin: 0;
  line-height: 1.45;
}
.tutorial-destaque {
  color: var(--blue) !important;
}
.tutorial-icone-inline { font-size: 0.9rem; }
.btn-tutorial-ok {
  width: 100%;
  background: var(--blue);
  color: var(--text-on-accent);
  border: none;
  border-radius: 12px;
  padding: 13px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
}
.modal-fade-enter-active,
.modal-fade-leave-active { transition: opacity 0.2s ease; }
.modal-fade-enter-from,
.modal-fade-leave-to     { opacity: 0; }

.ios-bar {
  position: fixed;
  left: 50%;
  bottom: calc(12px + env(safe-area-inset-bottom, 0px));
  transform: translateX(-50%);
  width: min(460px, calc(100% - 20px));
  background: var(--bg-card);
  border: 1px solid var(--blue);
  border-radius: 16px;
  color: var(--text);
  font-size: 0.85rem;
  font-weight: 500;
  padding: 12px 16px;
  z-index: 9997;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: var(--shadow-modal);
}
.ios-bar-icon { font-size: 1.2rem; flex-shrink: 0; }
.ios-bar-texto { flex: 1; }
.ios-bar-btn {
  background: var(--blue);
  color: var(--text-on-accent);
  border: none;
  border-radius: 8px;
  padding: 6px 14px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  flex-shrink: 0;
  white-space: nowrap;
}
.ios-bar-btn-erro {
  background: var(--danger) !important;
  font-size: 0.75rem;
}
.ios-bar-enter-active,
.ios-bar-leave-active { transition: transform 0.3s ease; }
.ios-bar-enter-from,
.ios-bar-leave-to     { transform: translate(-50%, 140%); }

.update-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: var(--bg-card);
  border-bottom: 1px solid var(--blue);
  color: var(--text);
  font-size: 0.85rem;
  font-weight: 600;
  padding: 10px 16px;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.update-btn {
  background: var(--blue);
  color: var(--text-on-accent);
  border: none;
  border-radius: 8px;
  padding: 5px 14px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  flex-shrink: 0;
}
.update-bar-enter-active,
.update-bar-leave-active { transition: transform 0.3s ease; }
.update-bar-enter-from,
.update-bar-leave-to     { transform: translateY(-100%); }

/* ── Page transition ── */
.page-fade-enter-active { transition: opacity 0.15s ease; }
.page-fade-leave-active { transition: opacity 0.1s ease; }
.page-fade-enter-from,
.page-fade-leave-to     { opacity: 0; }

@media (min-width: 768px) {
  .app-shell-with-nav,
  .app-shell-offline,
  .app-shell-with-nav.app-shell-offline {
    padding-bottom: 0;
  }

  .bottom-nav {
    display: none;
  }
}
</style>
