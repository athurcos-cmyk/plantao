/**
 * Toast global — singleton compartilhado entre todas as views.
 * Uso: const { showToast } = useToast()
 *      showToast('Anotação salva!')
 *
 * O <AppToast> em App.vue exibe a mensagem automaticamente.
 */
import { ref } from 'vue'

const toastMsg = ref('')
let timer = null

export function useToast() {
  function showToast(msg, duracao = 3000) {
    toastMsg.value = msg
    clearTimeout(timer)
    timer = setTimeout(() => (toastMsg.value = ''), duracao)
  }

  return { toastMsg, showToast }
}
