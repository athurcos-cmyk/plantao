<template>
  <div class="onboarding-screen">
    <!-- Tela atual -->
    <div class="onboarding-card">
      <!-- Botão pular -->
      <button class="btn-pular" @click="pular">Pular</button>

      <!-- Conteúdo da tela -->
      <div class="onboarding-content">
        <div class="onboarding-icone">{{ telaAtual.icone }}</div>
        <h2 class="onboarding-titulo">{{ telaAtual.titulo }}</h2>
        <p class="onboarding-descricao">{{ telaAtual.descricao }}</p>
      </div>

      <!-- Indicadores de progresso -->
      <div class="onboarding-dots">
        <span
          v-for="(_, i) in telas"
          :key="i"
          class="dot"
          :class="{ 'dot-ativo': i === telaIndex }"
        ></span>
      </div>

      <!-- CTA -->
      <button
        v-if="telaAtual.cta"
        class="btn btn-primary"
        @click="concluir"
      >
        Criar conta gratuita
      </button>
      <button
        v-else
        class="btn btn-primary"
        @click="proxima"
      >
        Próximo
      </button>
    </div>

    <div class="onboarding-legal">
      <a href="/privacidade" target="_blank">Privacidade</a>
      <span>·</span>
      <a href="/termos" target="_blank">Termos</a>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ONBOARDING_TELAS, STORAGE_KEYS } from '../config/onboarding.js'

const router = useRouter()
const telas = ONBOARDING_TELAS
const telaIndex = ref(0)

const telaAtual = computed(() => telas[telaIndex.value])

function _marcarVisto() {
  try {
    localStorage.setItem(STORAGE_KEYS.ONBOARDING_VISTO, '1')
  } catch {
    // localStorage pode estar bloqueado em modo privado — ignorar silenciosamente
  }
}

function proxima() {
  if (telaIndex.value < telas.length - 1) {
    telaIndex.value++
  } else {
    concluir()
  }
}

function pular() {
  _marcarVisto()
  router.push({ name: 'login' })
}

function concluir() {
  _marcarVisto()
  router.push({ name: 'login' })
}
</script>

<style scoped>
.onboarding-screen {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  background: var(--bg);
}

.onboarding-card {
  width: 100%;
  max-width: 380px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 32px 24px 28px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  position: relative;
}

.btn-pular {
  position: absolute;
  top: 16px;
  right: 16px;
  background: transparent;
  border: none;
  color: var(--text-dim);
  font-size: 0.85rem;
  font-family: inherit;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: var(--radius);
  transition: color 0.15s;
}
.btn-pular:hover { color: var(--text); }

.onboarding-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16px;
  padding-top: 16px;
}

.onboarding-icone {
  font-size: 3.5rem;
  line-height: 1;
}

.onboarding-titulo {
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--text);
  line-height: 1.3;
}

.onboarding-descricao {
  font-size: 0.95rem;
  color: var(--text-dim);
  line-height: 1.55;
  max-width: 300px;
}

.onboarding-dots {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--text-muted);
  transition: all 0.2s;
}
.dot-ativo {
  background: var(--blue);
  width: 24px;
  border-radius: 4px;
}

.onboarding-legal {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
  color: var(--text-dim);
  margin-top: 8px;
}
.onboarding-legal a {
  color: var(--text-dim);
  text-decoration: none;
}
.onboarding-legal a:hover { color: var(--text-muted); text-decoration: underline; }
.onboarding-legal span { opacity: 0.5; }
</style>
