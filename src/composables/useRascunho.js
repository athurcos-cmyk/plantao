/**
 * Composable genérico de rascunho automático.
 *
 * Uso:
 *   const { temRascunho, restaurarRascunho, descartarRascunho, iniciarRascunho }
 *     = useRascunho('rascunho_sinais_vitais', form, () => !!(form.horario || form.fc))
 *
 *   // Na setup, depois de declarar form:
 *   iniciarRascunho()
 *
 * O banner fica em `temRascunho` (ref boolean).
 * Ao confirmar: restaurarRascunho() — restaura form + esconde banner
 * Ao descartar: descartarRascunho() — limpa localStorage + esconde banner
 * Ao finalizar (salvar/nova): descartarRascunho()
 */
import { ref, watch, nextTick } from 'vue'

export function useRascunho(chave, form, temConteudo) {
  // Banner só aparece na montagem inicial (se há dado salvo)
  const temRascunho = ref(!!localStorage.getItem(chave))
  let saveTimer   = null
  let restaurando = false

  function agendarSalvar() {
    if (restaurando) return
    clearTimeout(saveTimer)
    saveTimer = setTimeout(() => {
      if (restaurando) return
      if (temConteudo()) {
        localStorage.setItem(chave, JSON.stringify(JSON.parse(JSON.stringify(form))))
      } else {
        localStorage.removeItem(chave)
      }
    }, 800)
  }

  function restaurarRascunho() {
    const raw = localStorage.getItem(chave)
    if (!raw) return
    try {
      restaurando = true
      Object.assign(form, JSON.parse(raw))
      temRascunho.value = false
      nextTick(() => { restaurando = false })
    } catch {
      restaurando = false
      temRascunho.value = false
    }
  }

  function descartarRascunho() {
    localStorage.removeItem(chave)
    temRascunho.value = false
  }

  // Chama após declarar o form na setup para ativar o auto-save
  function iniciarRascunho() {
    watch(form, agendarSalvar, { deep: true })
  }

  return { temRascunho, restaurarRascunho, descartarRascunho, iniciarRascunho }
}
