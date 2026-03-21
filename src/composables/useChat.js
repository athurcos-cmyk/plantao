import { ref } from 'vue'
import { useOnlineStatus } from './useOnlineStatus.js'
import { useAuthStore } from '../stores/auth.js'

const aberto = ref(false)
const mensagens = ref([])
const carregando = ref(false)
const erro = ref('')
let novaResposta = ref(false)

export function useChat() {
  const { isOnline } = useOnlineStatus()
  const auth = useAuthStore()

  function toggleChat() {
    aberto.value = !aberto.value
    if (aberto.value) novaResposta.value = false
  }

  function limparConversa() {
    mensagens.value = []
    erro.value = ''
  }

  async function enviarMensagem(texto) {
    const textoLimpo = texto.trim()
    if (!textoLimpo || carregando.value) return

    if (!isOnline.value) {
      mensagens.value.push({
        role: 'system',
        content: 'Sem internet. Clara está disponível apenas com conexão ativa.',
        ts: new Date(),
      })
      return
    }

    mensagens.value.push({ role: 'user', content: textoLimpo, ts: new Date() })
    carregando.value = true
    erro.value = ''

    try {
      // Monta histórico apenas com mensagens user/assistant (sem system)
      const historico = mensagens.value
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .map(m => ({ role: m.role, content: m.content }))

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historico,
          syncCode: auth.syncCode,
        }),
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        erro.value = data.error || 'Não foi possível obter resposta. Tente novamente.'
        return
      }

      mensagens.value.push({ role: 'assistant', content: data.reply, ts: new Date() })

      if (!aberto.value) novaResposta.value = true
    } catch (_) {
      erro.value = 'Sem conexão com o servidor. Tente novamente.'
    } finally {
      carregando.value = false
    }
  }

  return {
    aberto,
    mensagens,
    carregando,
    erro,
    novaResposta,
    toggleChat,
    limparConversa,
    enviarMensagem,
  }
}
