/**
 * usePulso — Pulso do App (feedback do usuário)
 *
 * Fluxo de exibição:
 *   Primeira cópia bem-sucedida
 *         │
 *         ▼
 *   Feature 2 (confete) dispara PRIMEIRO
 *         │ (delay 3s ou dismiss do confete)
 *         ▼
 *   verificarPulso() ──▶ feedback_solicitado ausente ou expirado?
 *         │ sim                      │ não
 *         ▼                          ▼
 *   exibir banner              não exibir
 *
 * Cadência: aparece 1x nas primeiras 24h → depois a cada 7 dias desde a última exibição.
 * Falha Firebase: silenciosa (console.warn). Feedback perdido não é crítico.
 */
import { ref } from 'vue'
import { getDatabase, ref as dbRef, push, set } from 'firebase/database'
import { auth as firebaseAuth } from '../firebase.js'
import { useAuthStore } from '../stores/auth.js'

const STORAGE_KEY = 'feedback_solicitado'
const PRIMEIRA_COPIA_KEY = 'primeira_copia_feita'
const SETE_DIAS_MS = 7 * 24 * 60 * 60 * 1000

// Ref reativa em nível de módulo — compartilhada entre todas as instâncias.
// Garante que o Dashboard reaja imediatamente quando useCopia marcar a 1ª cópia.
const _primeiraCopiaFeita = ref(!!localStorage.getItem(PRIMEIRA_COPIA_KEY))

// __APP_VERSION__ é injetado pelo vite.config.js (pkg.version)
// eslint-disable-next-line no-undef
const APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '1.0.0-alpha'

export function usePulso() {
  const auth = useAuthStore()
  const visivel = ref(false)
  const textoFeedback = ref('')
  const enviando = ref(false)

  function _deveExibir() {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return true // nunca exibido
    try {
      const { ts } = JSON.parse(raw)
      return Date.now() - ts >= SETE_DIAS_MS
    } catch {
      return true
    }
  }

  function _marcarExibido() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ts: Date.now() }))
  }

  /**
   * Chamado após Feature 2 (confete) ser dispensado.
   * Guard: só ativa se o usuário está logado (syncCode presente).
   */
  function verificarPulso() {
    if (!auth.syncCode) return
    if (!_deveExibir()) return
    _marcarExibido()
    visivel.value = true
  }

  function dispensar() {
    visivel.value = false
    // Já foi marcado como exibido em verificarPulso()
  }

  async function enviar() {
    if (!textoFeedback.value.trim() || !auth.syncCode) return
    const textoCapturado = textoFeedback.value.trim() // captura antes do finally limpar
    enviando.value = true
    try {
      const db = getDatabase()
      const feedbackRef = dbRef(db, `feedback/${auth.syncCode}`)
      const novoRef = push(feedbackRef)
      await set(novoRef, {
        texto: textoCapturado,
        timestamp: Date.now(),
        versaoApp: APP_VERSION,
      })

      // Enviar email de ack + notificação para Arthur (fire-and-forget)
      // Guard: só envia se tiver email e usuário logado
      if (auth.userEmail && firebaseAuth.currentUser) {
        firebaseAuth.currentUser.getIdToken()
          .then(idToken => fetch('/api/feedback', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}`,
            },
            body: JSON.stringify({
              syncCode: auth.syncCode,
              email: auth.userEmail,
              texto: textoCapturado, // usa valor capturado, não o ref já limpo
              versaoApp: typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev',
            }),
          }))
          .catch(() => {}) // falha silenciosa
      }
    } catch (err) {
      // Falha silenciosa — feedback perdido não é crítico
      console.warn('[Pulso] Falha ao salvar feedback:', err)
    } finally {
      enviando.value = false
      visivel.value = false
      textoFeedback.value = ''
    }
  }

  /**
   * Marca que a primeira cópia foi feita.
   * Usado por Feature 2 para serializar confete → pulso.
   */
  function marcarPrimeiraCopia() {
    if (!_primeiraCopiaFeita.value) {
      localStorage.setItem(PRIMEIRA_COPIA_KEY, '1')
      _primeiraCopiaFeita.value = true // atualiza ref reativa → Dashboard reage
    }
  }

  function isPrimeiraCopia() {
    return !_primeiraCopiaFeita.value
  }

  return {
    visivel,
    textoFeedback,
    enviando,
    verificarPulso,
    dispensar,
    enviar,
    marcarPrimeiraCopia,
    isPrimeiraCopia,
    primeiraCopiaFeita: _primeiraCopiaFeita, // ref reativa exposta
  }
}
