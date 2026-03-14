<template>
  <RouterView />
</template>

<script setup>
import { watch, onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useAuthStore } from './stores/auth.js'
import { useAnotacoesStore } from './stores/anotacoes.js'
import { useRouter } from 'vue-router'

const auth      = useAuthStore()
const anotacoes = useAnotacoesStore()
const router    = useRouter()

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
  { immediate: true }  // roda também ao carregar a página (reload)
)

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
