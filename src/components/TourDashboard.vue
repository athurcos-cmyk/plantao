<template>
  <transition name="tour-fade">
    <div v-if="aberto" class="tour-overlay" @click.self="pular">
      <div class="tour-card">

        <!-- Pular -->
        <button class="tour-pular" @click="pular">Pular</button>

        <!-- Passo atual -->
        <div class="tour-icone">{{ passoAtual.icone }}</div>
        <h2 class="tour-titulo">{{ passoAtual.titulo }}</h2>
        <p v-if="!passoAtual.html" class="tour-desc">{{ passoAtual.desc }}</p>
        <p v-else class="tour-desc" v-html="passoAtual.html"></p>

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
    desc: 'Vamos te mostrar como funciona em poucos passos rápidos. É simples!'
  },
  {
    icone: '📋',
    titulo: 'Escolha o tipo de anotação',
    desc: 'Na tela principal, toque em qualquer card — Anotação Inicial, Sinais Vitais, Medicação e outros. Cada um gera um texto diferente, já pronto para copiar.'
  },
  {
    icone: '📋✅',
    titulo: 'Preencha e copie',
    desc: 'Depois de preencher os dados, role e toque em Copiar. Cole no sistema oficial do hospital normalmente. O Plantão não é um sistema hospitalar — ele gera o texto pra você, o registro no prontuário continua sendo feito pelo sistema do hospital.'
  },
  {
    icone: '🔔',
    titulo: 'Pacientes e lembretes',
    desc: 'Cadastre seus pacientes e crie lembretes para não esquecer nenhuma pendência durante o plantão. O app avisa no horário certo, mesmo com a tela fechada.'
  },
  {
    icone: '✏️',
    titulo: 'Crie seu próprio modelo',
    desc: 'Não gostou de nenhuma anotação? Em Notas Livres você cria o seu modelo do zero — escreve o texto do jeito que usa no dia a dia e salva para reutilizar em todo plantão.'
  },
  {
    icone: '🏥',
    titulo: 'Vai usar no computador do hospital?',
    html: `O login com <span class="tour-google-badge"><svg width="13" height="13" viewBox="0 0 24 24" style="vertical-align:-2px"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg> Google</span> pode não funcionar nos computadores do hospital. Se foi assim que você entrou, vá em <strong>Configurações → Criar senha</strong> e cadastre uma senha. Aí é só entrar com seu e-mail e senha em qualquer lugar.`
  },
  {
    icone: '⚠️',
    titulo: 'Aviso importante',
    desc: 'O Plantão é uma ferramenta pessoal de apoio — não é um sistema hospitalar oficial. Ele gera textos prontos para você copiar e colar no sistema do hospital. O registro no prontuário continua sendo feito pelo sistema oficial normalmente.'
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

function abrirTour() {
  passo.value = 0
  aberto.value = true
}

onMounted(() => {
  try {
    if (!localStorage.getItem('tour_dashboard_visto')) {
      aberto.value = true
    }
  } catch {}
})

defineExpose({ abrirTour })
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

/* Badge Google inline */
:deep(.tour-google-badge) {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(255,255,255,0.08);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 1px 7px 1px 5px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text);
  vertical-align: middle;
}
:deep(.tour-desc strong) { color: var(--text); }

/* Transição */
.tour-fade-enter-active, .tour-fade-leave-active { transition: opacity 0.25s; }
.tour-fade-enter-from, .tour-fade-leave-to { opacity: 0; }
</style>
