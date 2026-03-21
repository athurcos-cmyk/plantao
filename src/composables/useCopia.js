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
 *   isPrimeiraCopia? ──▶ dispara confete + marcarPrimeiraCopia()
 *         │
 *         ▼
 *   callback onSucesso() (ex: hooks da view)
 *
 * Ao retornar ao Dashboard após a primeira cópia, usePulso.verificarPulso()
 * (chamado no onMounted do Dashboard) detecta que deve exibir o banner.
 */
import { ref } from 'vue'
import { usePulso } from './usePulso.js'

export function useCopia() {
  const copiado = ref(false)
  const { isPrimeiraCopia, marcarPrimeiraCopia } = usePulso()

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

      // Primeiro Sucesso — confete apenas na primeira cópia de toda a sessão de uso
      if (isPrimeiraCopia()) {
        marcarPrimeiraCopia()
        try {
          const confetti = (await import('canvas-confetti')).default
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } })
        } catch (_) { /* silencioso — confete não é crítico */ }
      }

      await onSucesso?.()

      return true
    } catch {
      return false
    }
  }

  return { copiado, copiar }
}
