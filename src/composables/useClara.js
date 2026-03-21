/**
 * useClara — Completar texto com IA inline
 *
 * Fluxo:
 *   rascunho (≥5 chars) ──▶ botão ativo
 *         │ clique
 *         ▼
 *   offline? ──▶ tooltip "Sem conexão"
 *         │ online
 *         ▼
 *   AbortController criado ──▶ fetch /api/chat (timeout 10s)
 *         │
 *         ├─ OK + texto ──▶ substituir campo (máx 500 chars)
 *         ├─ OK + vazio  ──▶ toast aviso, rascunho preservado
 *         ├─ Erro API    ──▶ toast "Clara não conseguiu completar agora."
 *         └─ Timeout     ──▶ toast "Clara não conseguiu completar agora."
 *
 * AbortController é cancelado no onUnmounted (navegar para outra tela).
 */
import { ref, onUnmounted } from 'vue'
import { useOnlineStatus } from './useOnlineStatus.js'
import { useAuthStore } from '../stores/auth.js'
import { useToast } from './useToast.js'

const TIMEOUT_MS = 10000
const MAX_CHARS = 500

export function useClara() {
  const { isOnline } = useOnlineStatus()
  const auth = useAuthStore()
  const { showToast } = useToast()

  const claraCarregando = ref(false)
  let abortController = null

  onUnmounted(() => {
    abortController?.abort()
  })

  /**
   * @param {import('vue').Ref<string>} campoRef - ref do campo de texto
   */
  async function completarComClara(campoRef) {
    if (claraCarregando.value) return
    if (!isOnline.value) {
      showToast('Clara não disponível sem conexão.')
      return
    }

    const rascunho = campoRef.value.trim()
    if (!rascunho) return

    claraCarregando.value = true
    abortController = new AbortController()
    const timeoutId = setTimeout(() => abortController.abort(), TIMEOUT_MS)

    try {
      const prompt = `Você é Clara. O usuário digitou este rascunho: '${rascunho}'. Expanda para uma anotação de enfermagem completa no formato '14h30 – texto.' Máximo uma anotação, máximo 300 caracteres. Responda apenas com o texto final, sem explicações.`

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortController.signal,
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          syncCode: auth.syncCode,
        }),
      })

      clearTimeout(timeoutId)

      const data = await res.json()

      if (!res.ok || data.error) {
        showToast('Clara não conseguiu completar agora. Tente novamente.')
        return
      }

      const texto = (data.reply || '').trim()

      if (!texto) {
        showToast('Clara não conseguiu completar agora. Tente novamente.')
        return
      }

      if (texto.length > MAX_CHARS) {
        campoRef.value = texto.slice(0, MAX_CHARS)
        showToast('Clara gerou um texto muito longo — revise antes de copiar.')
      } else {
        campoRef.value = texto
      }
    } catch (err) {
      clearTimeout(timeoutId)
      if (err.name === 'AbortError') {
        showToast('Clara não conseguiu completar agora. Tente novamente.')
      } else {
        showToast('Clara não conseguiu completar agora. Tente novamente.')
      }
      // rascunho original preservado (não foi sobrescrito)
    } finally {
      claraCarregando.value = false
      abortController = null
    }
  }

  return { claraCarregando, completarComClara }
}
