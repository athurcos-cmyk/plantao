<template>
  <transition name="tour-fade">
    <div v-if="aberto" class="tour-overlay" @click.self="pular">
      <div class="tour-card">

        <!-- Pular -->
        <button class="tour-pular" @click="pular">Pular</button>

        <!-- Passo atual -->
        <div class="tour-icone">{{ passoAtual.icone }}</div>
        <h2 class="tour-titulo">{{ passoAtual.titulo }}</h2>
        <p class="tour-desc">{{ passoAtual.desc }}</p>

        <!-- Dots de progresso -->
        <div class="tour-dots">
          <span
            v-for="(_, i) in passos"
            :key="i"
            class="tour-dot"
            :class="{ ativo: i === passo }"
          />
        </div>

        <!-- Botões -->
        <div class="tour-acoes">
          <button v-if="passo < passos.length - 1" class="btn-proximo" @click="avancar">
            Próximo →
          </button>
          <button v-else class="btn-proximo btn-comecar" @click="pular">
            Vamos começar! 🚀
          </button>
        </div>

      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const aberto = ref(false)
const passo = ref(0)

const passos = [
  {
    icone: '👋',
    titulo: 'Bem-vindo ao Plantão!',
    desc: 'Vamos te mostrar como funciona em 4 passos rápidos. É simples!'
  },
  {
    icone: '📋',
    titulo: 'Escolha o tipo de anotação',
    desc: 'Na tela principal, toque em qualquer card — Anotação Inicial, Sinais Vitais, Medicação e outros. Cada um gera um texto diferente, já pronto para copiar.'
  },
  {
    icone: '📋✅',
    titulo: 'Preencha e copie',
    desc: 'Depois de preencher os dados do paciente, role a tela e toque em Copiar. O texto vai direto para a área de transferência — é só colar no sistema do hospital.'
  },
  {
    icone: '🔔',
    titulo: 'Pacientes e lembretes',
    desc: 'Cadastre seus pacientes e crie lembretes para não esquecer nenhuma pendência durante o plantão. O app avisa no horário certo, mesmo com a tela fechada.'
  },
  {
    icone: '✅',
    titulo: 'Pronto, pode começar!',
    desc: 'Qualquer dúvida, o botão ❓ está disponível na tela de login. Seus dados ficam salvos automaticamente — mesmo sem internet.'
  }
]

const passoAtual = computed(() => passos[passo.value])

function avancar() {
  if (passo.value < passos.length - 1) passo.value++
}

function pular() {
  aberto.value = false
  try { localStorage.setItem('tour_dashboard_visto', '1') } catch {}
}

onMounted(() => {
  try {
    if (!localStorage.getItem('tour_dashboard_visto')) {
      aberto.value = true
    }
  } catch {}
})
</script>

<style scoped>
.tour-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 24px;
}

.tour-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 32px 24px 24px;
  max-width: 360px;
  width: 100%;
  text-align: center;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.tour-pular {
  position: absolute;
  top: 14px;
  right: 16px;
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 0.85rem;
  cursor: pointer;
  padding: 4px 8px;
}
.tour-pular:hover { color: var(--text); }

.tour-icone {
  font-size: 3rem;
  line-height: 1;
  margin-bottom: 4px;
}

.tour-titulo {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text);
  margin: 0;
}

.tour-desc {
  font-size: 0.95rem;
  color: var(--text-muted);
  line-height: 1.55;
  margin: 0;
}

.tour-dots {
  display: flex;
  gap: 7px;
  margin-top: 4px;
}

.tour-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--border);
  transition: background 0.2s, transform 0.2s;
}
.tour-dot.ativo {
  background: var(--blue);
  transform: scale(1.25);
}

.tour-acoes { width: 100%; margin-top: 4px; }

.btn-proximo {
  width: 100%;
  padding: 14px;
  background: var(--blue);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.15s;
}
.btn-proximo:active { transform: scale(0.97); opacity: 0.9; }
.btn-comecar { background: var(--success, #22c55e); }

/* Transição */
.tour-fade-enter-active, .tour-fade-leave-active { transition: opacity 0.25s; }
.tour-fade-enter-from, .tour-fade-leave-to { opacity: 0; }
</style>
