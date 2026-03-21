<template>
  <RouterView />
  <BotaoChat v-if="auth.isLoggedIn" />
  <ChatAssistente v-if="auth.isLoggedIn" />
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
      <span class="install-texto">Instalar o app Plantão</span>
      <button class="install-btn" @click="instalarApp">Instalar</button>
      <button class="install-fechar" @click="mostrarInstall = false">✕</button>
    </div>
  </Transition>
  <Transition name="ios-bar">
    <div v-if="mostrarBannerIOS" class="ios-bar">
      <span class="ios-bar-icon">🍎</span>
      <span class="ios-bar-texto">Para instalar o app, abra no <strong>Safari</strong></span>
      <button class="ios-bar-btn" @click="copiarLinkIOS">
        {{ linkCopiado ? 'Copiado ✓' : 'Copiar link' }}
      </button>
      <button class="install-fechar" @click="mostrarBannerIOS = false">✕</button>
    </div>
  </Transition>
  <Transition name="update-bar">
    <div v-if="temAtualizacao" class="update-bar">
      <span>🆕 Nova versão disponível</span>
      <button class="update-btn" @click="recarregarApp">Atualizar</button>
    </div>
  </Transition>
</template>

<script setup>
import { watch, computed, onMounted, ref } from 'vue'
import { RouterView } from 'vue-router'
import { useAuthStore } from './stores/auth.js'
import { useAnotacoesStore } from './stores/anotacoes.js'
import { usePacientesStore } from './stores/pacientes.js'
import { useOrganizadorStore } from './stores/organizador.js'
import { useRouter } from 'vue-router'
import { useToast } from './composables/useToast.js'
import { useOnlineStatus } from './composables/useOnlineStatus.js'
import BotaoChat from './components/BotaoChat.vue'
import ChatAssistente from './components/ChatAssistente.vue'

const { toastMsg, showToast } = useToast()
const { isOnline } = useOnlineStatus()

const auth       = useAuthStore()
const anotacoes  = useAnotacoesStore()
const pacientes  = usePacientesStore()
const organizador = useOrganizadorStore()
const router     = useRouter()
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
    } else {
      anotacoes.parar()
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

// Banner iOS + Chrome: detecta iPhone/iPad no Chrome (não-Safari) fora do standalone
// iOS não expõe beforeinstallprompt — usuário precisa instalar pelo Safari
const mostrarBannerIOS = ref(false)
const linkCopiado = ref(false)

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
  try {
    await navigator.clipboard.writeText(window.location.href)
  } catch {
    // fallback
    const ta = document.createElement('textarea')
    ta.value = window.location.href
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
  }
  linkCopiado.value = true
  setTimeout(() => { linkCopiado.value = false }, 2500)
}

async function instalarApp() {
  if (!_installPrompt) return
  _installPrompt.prompt()
  const { outcome } = await _installPrompt.userChoice
  if (outcome === 'accepted') mostrarInstall.value = false
  _installPrompt = null
}

// Verifica a sessão a cada minuto — se expirou, desloga e manda pro login
onMounted(() => {
  setInterval(() => {
    if (auth.syncCode && !auth.isLoggedIn) {
      auth.logout()
      router.push({ name: 'login' })
    }
  }, 60 * 1000)

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
.install-texto { flex: 1; }
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
  color: #8ab8e8;
  font-size: 1rem;
  cursor: pointer;
  padding: 4px 6px;
  flex-shrink: 0;
  line-height: 1;
}
.install-bar-enter-active,
.install-bar-leave-active { transition: transform 0.3s ease; }
.install-bar-enter-from,
.install-bar-leave-to     { transform: translateY(100%); }

.ios-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #2a1a3e;
  border-top: 1px solid #9b59b6;
  color: #e8d5f5;
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
  background: #9b59b6;
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
</style>
