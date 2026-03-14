<template>
  <div class="screen">
    <!-- Header -->
    <header class="app-header">
      <h1>Plantão</h1>
      <button class="btn-icon" @click="router.push({ name: 'historico' })">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
      </button>
    </header>

    <main class="container" style="padding-top: 24px; padding-bottom: 40px;">
      <!-- Saudação -->
      <div class="saudacao">
        <p class="saudacao-hora">{{ saudacaoTexto }}</p>
        <h2 v-if="auth.userName">{{ auth.userName }}</h2>
      </div>

      <!-- Escolha o tipo de anotação -->
      <p class="secao-label">Nova anotação</p>

      <div class="tipos-grid">
        <button
          v-for="tipo in tipos"
          :key="tipo.id"
          class="tipo-card"
          @click="navegar(tipo)"
        >
          <span class="tipo-icon">{{ tipo.icon }}</span>
          <span class="tipo-nome">{{ tipo.nome }}</span>
        </button>
      </div>

      <!-- Rodapé -->
      <button class="btn btn-ghost" style="margin-top: 32px;" @click="sair">
        🚪 Sair da conta
      </button>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const router = useRouter()
const auth   = useAuthStore()

const saudacaoTexto = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia,'
  if (h < 18) return 'Boa tarde,'
  return 'Boa noite,'
})

const tipos = [
  { id: 'inicial',    icon: '📋', nome: 'Anotação inicial',     rota: 'anotacao-inicial' },
  { id: 'sv',         icon: '📊', nome: 'Sinais vitais',         rota: 'sinais-vitais' },
  { id: 'medicacao',  icon: '💊', nome: 'Medicação',             rota: null },
  { id: 'encamin',    icon: '🚑', nome: 'Encaminhamento',        rota: null },
  { id: 'banho',      icon: '🛁', nome: 'Banho',                 rota: null },
  { id: 'curativo',   icon: '🩹', nome: 'Curativo',              rota: null },
  { id: 'passagem',   icon: '🔄', nome: 'Passagem de plantão',   rota: null },
  { id: 'livre',      icon: '📝', nome: 'Intercorrência / Livre',rota: null },
]

function navegar(tipo) {
  if (tipo.rota) {
    router.push({ name: tipo.rota })
  } else {
    alert(`"${tipo.nome}" em breve!`)
  }
}

function sair() {
  if (confirm('Deseja sair da sua conta?')) {
    auth.logout()
    router.push({ name: 'login' })
  }
}
</script>

<style scoped>
.saudacao {
  margin-bottom: 28px;
}
.saudacao-hora {
  color: var(--text-muted);
  font-size: 0.9rem;
}
.saudacao h2 {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text);
  margin-top: 2px;
}

.secao-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 12px;
}

.tipos-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.tipo-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 18px 14px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;
}

.tipo-card:active {
  background: var(--bg-hover);
  transform: scale(0.97);
}

.tipo-icon { font-size: 1.5rem; }

.tipo-nome {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text);
  line-height: 1.3;
}

.btn-icon {
  background: none;
  border: none;
  color: var(--text-dim);
  cursor: pointer;
  padding: 6px;
}
</style>
