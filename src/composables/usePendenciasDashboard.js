import { computed } from 'vue'
import { usePacientesStore } from '../stores/pacientes.js'

export function usePendenciasDashboard() {
  const pacientesStore = usePacientesStore()

  /** Lista plana de pendências não feitas com dados do paciente, ordenadas por horário */
  const pendenciasPendentes = computed(() => {
    const items = []
    for (const pac of pacientesStore.pacientes) {
      if (!pac.pendencias?.length) continue
      for (const p of pac.pendencias) {
        if (p.feito) continue
        items.push({
          _key: p._key,
          texto: p.texto,
          horario: p.horario || '',
          pacienteKey: pac._key,
          pacienteNome: pac.nome,
          pacienteLeito: pac.leito || '',
          criadoEm: p.criadoEm || 0,
          feito: false,
        })
      }
    }

    items.sort((a, b) => {
      if (a.horario && b.horario) return a.horario.localeCompare(b.horario)
      if (a.horario && !b.horario) return -1
      if (!a.horario && b.horario) return 1
      return a.criadoEm - b.criadoEm
    })

    return items
  })

  const totalPendentes = computed(() => pendenciasPendentes.value.length)

  /** Próximas até 5 pendências */
  const proximasPendencias = computed(() => pendenciasPendentes.value.slice(0, 5))

  const temMaisPendencias = computed(() => totalPendentes.value > 5)

  return {
    pendenciasPendentes,
    totalPendentes,
    proximasPendencias,
    temMaisPendencias,
  }
}
