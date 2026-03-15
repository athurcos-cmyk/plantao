<template>
  <div class="screen">
    <header class="app-header">
      <div style="width:34px"/>
      <div class="header-logo">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M12 2c0 0-1 3-1 6s1 4 1 4-1 1-1 4 1 6 1 6"/>
          <path d="M9 7c-2 1-3 2-3 3s2 2 6 2 6-1 6-2-1-2-3-3"/>
          <path d="M9 17c-2-1-3-2-3-3s2-2 6-2 6 1 6 2-1 2-3 3"/>
        </svg>
        <span>Plantão</span>
      </div>
      <button  data-testid="auto-btn-dashboardview-1" class="btn-icon" @click="router.push({ name: 'historico' })" title="Histórico">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
      </button>
    </header>

    <main class="container" style="padding-top:24px;padding-bottom:40px">
      <div class="saudacao">
        <p class="saudacao-hora">{{ saudacaoTexto }}</p>
        <h2 v-if="auth.userName">{{ auth.userName }}</h2>
      </div>

      <p class="secao-label">Nova anotação</p>

      <div class="tipos-grid">
        <button  data-testid="auto-btn-dashboardview-2" v-for="tipo in tipos" :key="tipo.id" class="tipo-card" @click="navegar(tipo)">
          <span class="tipo-icon">{{ tipo.icon }}</span>
          <span class="tipo-nome">{{ tipo.nome }}</span>
          <span v-if="!tipo.rota" class="tipo-badge">em breve</span>
        </button>
      </div>

      <button class="btn-pacientes" @click="router.push({ name: 'pacientes' })">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 00-3-3.87"/>
          <path d="M16 3.13a4 4 0 010 7.75"/>
        </svg>
        Meus Pacientes do plantão
      </button>

      <button  data-testid="auto-btn-dashboardview-3" class="btn-historico" @click="router.push({ name: 'historico' })">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
        Ver histórico de anotações
      </button>

      <button  data-testid="auto-btn-dashboardview-4" class="btn btn-ghost" style="margin-top:10px" @click="sair">
        Sair da conta
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
  { id: 'inicial',   icon: '📋', nome: 'Anotação inicial',      rota: 'anotacao-inicial' },
  { id: 'sv',        icon: '📊', nome: 'Sinais vitais',          rota: 'sinais-vitais'   },
  { id: 'medicacao', icon: '💊', nome: 'Medicação',              rota: 'medicacao'   },
  { id: 'encamin',   icon: '🚑', nome: 'Encaminhamento',         rota: null },
  { id: 'banho',     icon: '🛁', nome: 'Banho',                  rota: null },
  { id: 'curativo',  icon: '🩹', nome: 'Curativo',               rota: null },
  { id: 'passagem',  icon: '🔄', nome: 'Passagem de plantão',    rota: null },
  { id: 'livre',     icon: '📝', nome: 'Intercorrência / Livre', rota: null },
]

function navegar(tipo) {
  if (tipo.rota) router.push({ name: tipo.rota })
  else alert(tipo.nome + ' em breve!')
}

function sair() {
  if (confirm('Deseja sair da sua conta?')) {
    auth.logout()
    router.push({ name: 'login' })
  }
}
</script>

<style scoped>
.header-logo {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--blue);
  font-size: 1.05rem;
  font-weight: 700;
}
.btn-icon {
  background: none;
  border: none;
  color: var(--text-dim);
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
  display: flex;
  align-items: center;
}
.btn-icon:active { background: var(--bg-hover); }

.saudacao { margin-bottom: 28px; }
.saudacao-hora { color: var(--text-muted); font-size: 0.9rem; }
.saudacao h2 { font-size: 1.4rem; font-weight: 700; color: var(--text); margin-top: 2px; }

.secao-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 12px;
}

.tipos-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

.tipo-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 18px 14px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;
}
.tipo-card:active { background: var(--bg-hover); transform: scale(0.97); }
.tipo-icon { font-size: 1.5rem; }
.tipo-nome { font-size: 0.9rem; font-weight: 600; color: var(--text); line-height: 1.3; }
.tipo-badge {
  font-size: 0.62rem;
  color: var(--text-muted);
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 2px 6px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.btn-historico {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  margin-top: 24px;
  padding: 14px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text-dim);
  font-family: inherit;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-historico:active { background: var(--bg-hover); }

.btn-pacientes {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  width: 100%; margin-top: 16px; padding: 14px;
  background: var(--bg-card); border: 1px solid var(--blue);
  border-radius: var(--radius); color: var(--blue);
  font-family: inherit; font-size: 0.95rem; font-weight: 600;
  cursor: pointer; transition: all 0.15s;
}
.btn-pacientes:active { background: var(--bg-hover); }
</style>
