/**
 * useCopia — composable centralizado de cópia para clipboard
 *
 * Fluxo:
 *   navigator.clipboard.writeText() ──▶ sucesso
 *         │ falha (iOS/sem permissão)
 *         ▼
 *   execCommand('copy') via textarea invisível ──▶ sucesso
 *         │
 *         ▼
 *   callback onSucesso() (ex: hooks da view)
 */
import { ref } from 'vue'

export function useCopia() {
  const copiado = ref(false)

  /**
   * @param {string} texto - Texto a ser copiado
   * @param {Function} [onSucesso] - Callback chamado após cópia bem-sucedida
   */
  async function copiar(texto, onSucesso) {
    try {
      try {
        await navigator.clipboard.writeText(texto)
      } catch {
        // Fallback para iOS Safari e contextos sem permissão de clipboard
        const el = document.createElement('textarea')
        el.value = texto
        el.style.position = 'fixed'
        el.style.opacity = '0'
        document.body.appendChild(el)
        el.focus()
        el.select()
        document.execCommand('copy')
        document.body.removeChild(el)
      }

      copiado.value = true
      setTimeout(() => (copiado.value = false), 2000)

      await onSucesso?.()

      return true
    } catch {
      return false
    }
  }

  return { copiado, copiar }
}
