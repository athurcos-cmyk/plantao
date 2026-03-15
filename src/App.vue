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
</template>

<script setup>
import { watch, computed, onMounted } from 'vue'
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
</style>
