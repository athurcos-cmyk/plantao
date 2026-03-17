<template>
  <RouterView />
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

const { toastMsg, showToast } = useToast()
const { isOnline } = useOnlineStatus()

const auth       = useAuthStore()
const anotacoes  = useAnotacoesStore()
const pacientes  = usePacientesStore()
const organizador = useOrganizadorStore()
const router     = useRouter()

const totalPendentes = computed(() =>
  (anotacoes.pendentes || 0) + (pacientes.pendentesCount || 0)
)

// Inicia o listener do Firebase quando logado,
// para quando deslogar ou sessão expirar
watch(
  () => auth.isLoggedIn,
  (logado) => {
    if (logado) {
      anotacoes.iniciar()
    } else {
      anotacoes.parar()
    }
  },
  { immediate: true }
)

// Ao voltar online: sincroniza tudo que ficou pendente
watch(isOnline, async (online) => {
  if (online && auth.isLoggedIn) {
    const [nAnot, nPac] = await Promise.all([
      anotacoes.sincronizarPendentes(),
      pacientes.sincronizarPendentes(),
    ])
    await organizador.sincronizarOrganizador()
    const total = (nAnot || 0) + (nPac || 0)
    if (total > 0) showToast(`${total} item${total === 1 ? '' : 'ns'} sincronizado${total === 1 ? '' : 's'} ✓`)
    else showToast('Conexão restaurada ✓')
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
