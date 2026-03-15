import { ref } from 'vue'

// Singleton — um único listener para toda a aplicação
const isOnline = ref(navigator.onLine)

window.addEventListener('online',  () => { isOnline.value = true  })
window.addEventListener('offline', () => { isOnline.value = false })

export function useOnlineStatus() {
  return { isOnline }
}
