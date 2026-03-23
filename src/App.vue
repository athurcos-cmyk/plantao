<template>
  <RouterView v-slot="{ Component }">
    <Transition name="page-fade" mode="out-in">
      <component :is="Component" :key="$route.name" />
    </Transition>
  </RouterView>
  <BotaoChat v-if="mostrarFab" />
  <ChatAssistente v-if="mostrarFab" />
  <CalculadoraModal v-if="mostrarFab" />
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
import { watch, computed, onMounted, ref } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth.js'
import { useAnotacoesStore } from './stores/anotacoes.js'
import { usePacientesStore } from './stores/pacientes.js'
import { useOrganizadorStore } from './stores/organizador.js'
import { useRouter } from 'vue-router'
import { useToast } from './composables/useToast.js'
import { useOnlineStatus } from './composables/useOnlineStatus.js'
import { configurarFCM, solicitarPermissaoNotificacao } from './composables/usePushNotificacoes.js'
import { useChat } from './composables/useChat.js'
import BotaoChat from './components/BotaoChat.vue'
import ChatAssistente from './components/ChatAssistente.vue'
import CalculadoraModal from './components/CalculadoraModal.vue'

const { toastMsg, showToast } = useToast()
const { isOnline } = useOnlineStatus()

const auth        = useAuthStore()
const anotacoes   = useAnotacoesStore()
const pacientes   = usePacientesStore()
const organizador = useOrganizadorStore()
const { limparConversa } = useChat()
const router     = useRouter()
const route      = useRoute()
const rotasSemFab = ['landing', 'onboarding', 'login', 'pc']
const mostrarFab  = computed(() => auth.isLoggedIn && !rotasSemFab.includes(route.name))
const sincronizando = ref(false)
const SYNC_RETRY_MS = 10 * 1000

const totalPendentes = computed(() =>
  (anotacoes.pendentes || 0) + (pacientes.pendentesCount || 0)
)

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
      configurarFCM(auth.syncCode)
      solicitarPermissaoNotificacao(auth.syncCode)
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

// Banner de atualização — aparece quando novo SW toma controle
const temAtualizacao = ref(false)
function recarregarApp() { window.location.reload() }
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    temAtualizacao.value = true
  })
}

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

  // Onboarding: redireciona para telas de boas-vindas na primeira abertura
  try {
    const jaViu = localStorage.getItem('onboarding_visto')
    if (!jaViu && !auth.isLoggedIn) {
      router.push({ name: 'onboarding' })
    }
  } catch {
    // localStorage bloqueado (modo privado extremo) — ignorar
  }

  // Retry contínuo de sync enquanto houver pendências e internet.
  setInterval(() => {
    if (isOnline.value && auth.isLoggedIn && totalPendentes.value > 0) {
      sincronizarTudo(false)
    }
  }, SYNC_RETRY_MS)
})
</script>

<style>
.offline-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #1a1a2e;
  border-top: 1px solid #e57373;
  color: #ef9a9a;
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
  background: #e57373;
  color: #1a1a2e;
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
  bottom: 0;
  left: 0;
  right: 0;
  background: #1e3a5f;
  border-top: 1px solid #4a90d9;
  color: #e8f4fd;
  font-size: 0.85rem;
  font-weight: 500;
  padding: 12px 16px;
  z-index: 9998;
  display: flex;
  align-items: center;
  gap: 10px;
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
  color: #e8f4fd;
}
.install-sub {
  font-size: 0.75rem;
  color: #8ab8d8;
  font-weight: 400;
}
.install-btn {
  background: #4a90d9;
  color: white;
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
.install-bar-leave-to     { transform: translateY(100%); }

.safari-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #0d2137;
  border-top: 1px solid #2196f3;
  color: #b3d9f7;
  font-size: 0.85rem;
  font-weight: 500;
  padding: 12px 16px;
  z-index: 9996;
  display: flex;
  align-items: center;
  gap: 10px;
}
.safari-bar-icon { font-size: 1.2rem; flex-shrink: 0; }
.safari-bar-texto { flex: 1; }
.safari-bar-btn {
  background: #2196f3;
  color: white;
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
.safari-bar-leave-to     { transform: translateY(100%); }

/* ── Modal tutorial Safari ── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
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
  color: white;
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
  color: white;
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
  bottom: 0;
  left: 0;
  right: 0;
  background: #0d2137;
  border-top: 1px solid var(--blue);
  color: #b3d9f7;
  font-size: 0.85rem;
  font-weight: 500;
  padding: 12px 16px;
  z-index: 9997;
  display: flex;
  align-items: center;
  gap: 10px;
}
.ios-bar-icon { font-size: 1.2rem; flex-shrink: 0; }
.ios-bar-texto { flex: 1; }
.ios-bar-btn {
  background: var(--blue);
  color: white;
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
.ios-bar-leave-to     { transform: translateY(100%); }

.update-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: #1a3a2e;
  border-bottom: 1px solid #4caf82;
  color: #a5d6b7;
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
  background: #4caf82;
  color: #0a1a14;
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
</style>
