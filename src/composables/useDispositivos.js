import { ref, reactive } from 'vue'
import {
  buildDispositivoTexto,
  locaisCentralPadrao,
  tiposDispositivosPadrao,
  pulseiraOpcoesPadrao,
} from '../utils/dispositivos.js'

export function useDispositivos(dispositivos) {
  const dragIdx     = ref(null)
  const dragOverIdx = ref(null)
  const modal       = reactive({ aberto: false, tipo: '', d: {}, erro: '' })

  const locaisCentral = locaisCentralPadrao
  const tiposDisp = tiposDispositivosPadrao
  const pulseiraOpcoes = pulseiraOpcoesPadrao

  function abrirModal(tipo) {
    modal.tipo   = tipo
    modal.d      = { tipos: [], locais: [] }
    modal.erro   = ''
    modal.aberto = true
  }
  function fecharModal() { modal.aberto = false }

  function moverDisp(i, dir) {
    const j = i + dir
    if (j < 0 || j >= dispositivos.length) return
    ;[dispositivos[i], dispositivos[j]] = [dispositivos[j], dispositivos[i]]
  }

  function removerDisp(i) { dispositivos.splice(i, 1) }

  function onDragStart(i) { dragIdx.value = i }
  function onDragOver(i)  { dragOverIdx.value = i }
  function onDrop(i) {
    if (dragIdx.value === null || dragIdx.value === i) { dragIdx.value = null; dragOverIdx.value = null; return }
    const item = dispositivos.splice(dragIdx.value, 1)[0]
    dispositivos.splice(i, 0, item)
    dragIdx.value = null
    dragOverIdx.value = null
  }

  function confirmarDisp() {
    modal.erro = ''
    const texto = buildDispositivoTexto(modal.tipo, modal.d, (msg) => { modal.erro = msg })
    if (texto === null) return
    dispositivos.push(texto)
    fecharModal()
  }

  return {
    dragIdx, dragOverIdx, modal,
    locaisCentral, tiposDisp, pulseiraOpcoes,
    abrirModal, fecharModal, confirmarDisp,
    moverDisp, removerDisp,
    onDragStart, onDragOver, onDrop
  }
}
