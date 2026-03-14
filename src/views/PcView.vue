<template>
  <div class="pc-screen">
    <div class="pc-card">
      <div class="pc-icon">
        <svg width="56" height="56" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="23" stroke="#1E88E5" stroke-width="2"/>
          <path d="M24 14v20M14 24h20" stroke="#1E88E5" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
      </div>
      <h1>Plantão</h1>
      <p class="pc-sub">Sistema de anotações de enfermagem</p>

      <div class="pc-aviso">
        <p>Este app foi desenvolvido para uso no <strong>celular</strong>, durante o plantão.</p>
        <p style="margin-top:10px">Abra no seu smartphone para utilizar.</p>
      </div>

      <div class="pc-qr">
        <p class="pc-qr-label">Acesse pelo celular:</p>
        <code class="pc-url">{{ url }}</code>
      </div>

      <button  data-testid="auto-btn-pcview-1" class="btn-continuar" @click="continuar">
        Continuar no PC mesmo assim →
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
const url = window.location.origin + window.location.pathname

function continuar() {
  // Marca que o usuário escolheu continuar no PC nesta sessão
  sessionStorage.setItem('pc_allowed', '1')
  router.push({ name: 'login' })
}
</script>

<style scoped>
.pc-screen {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg);
  padding: 24px;
}
.pc-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 48px 40px;
  max-width: 420px;
  width: 100%;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.pc-icon { margin-bottom: 4px; }
h1 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--blue);
}
.pc-sub {
  color: var(--text-muted);
  font-size: 0.9rem;
  margin-bottom: 8px;
}
.pc-aviso {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 18px 20px;
  color: var(--text-dim);
  font-size: 0.95rem;
  line-height: 1.6;
  text-align: center;
}
.pc-aviso strong { color: var(--text); }
.pc-qr {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.pc-qr-label {
  font-size: 0.8rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 600;
}
.pc-url {
  font-family: monospace;
  font-size: 0.85rem;
  color: var(--blue);
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 8px 14px;
  word-break: break-all;
}
.btn-continuar {
  margin-top: 8px;
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 0.82rem;
  font-family: inherit;
  cursor: pointer;
  padding: 8px;
  text-decoration: underline;
  text-underline-offset: 3px;
  transition: color 0.2s;
}
.btn-continuar:hover { color: var(--text-dim); }
</style>
