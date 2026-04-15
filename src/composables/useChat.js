import { ref } from 'vue'
import { useOnlineStatus } from './useOnlineStatus.js'
import { useAuthStore } from '../stores/auth.js'
import { auth as firebaseAuth } from '../firebase.js'

const aberto = ref(false)
const mensagens = ref([])
const carregando = ref(false)
const erro = ref('')
let novaResposta = ref(false)
const MAX_RECENT_MESSAGES = 10
const MAX_SUMMARY_ITEMS = 6
const MAX_SUMMARY_CHARS = 140

function resumirHistorico(historico) {
  if (historico.length <= MAX_RECENT_MESSAGES) return ''

  return historico
    .slice(0, -MAX_RECENT_MESSAGES)
    .slice(-MAX_SUMMARY_ITEMS)
    .map((msg) => {
      const ator = msg.role === 'assistant' ? 'Clara' : 'Usuário'
      const texto = String(msg.content || '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, MAX_SUMMARY_CHARS)
      return `${ator}: ${texto}`
    })
    .join('\n')
}

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
    novaResposta.value = false
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
      const summary = resumirHistorico(historico)
      const recentes = historico.slice(-MAX_RECENT_MESSAGES)

      // Pega token Firebase Auth para autenticar no servidor
      let authToken = ''
      try {
        if (firebaseAuth.currentUser) {
          authToken = await firebaseAuth.currentUser.getIdToken()
        }
      } catch { /* fallback sem token */ }

      const headers = { 'Content-Type': 'application/json' }
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          messages: recentes,
          summary,
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
