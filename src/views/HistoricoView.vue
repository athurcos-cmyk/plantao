<template>
  <div class="screen">
    <header class="app-header">
      <button class="btn-icon" @click="router.back()">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>
      <h1>Histórico</h1>
      <div style="width:34px"/>
    </header>

    <main class="container" style="padding-top: 20px; padding-bottom: 40px;">
      <p v-if="anotacoes.length === 0" class="vazio">Nenhuma anotação ainda.</p>

      <div v-for="anot in anotacoes" :key="anot.timestamp" class="anot-card">
        <div class="anot-header">
          <span class="anot-tipo">{{ labelTipo(anot.tipo) }}</span>
          <span class="anot-data">{{ formatData(anot.timestamp) }}</span>
        </div>
        <p v-if="anot.nome || anot.leito" class="anot-paciente">
          {{ anot.nome }}{{ anot.nome && anot.leito ? ' · ' : '' }}{{ anot.leito ? `Leito ${anot.leito}` : '' }}
        </p>
        <p class="anot-texto">{{ anot.texto }}</p>
        <div class="anot-acoes">
          <button class="btn btn-ghost" @click="copiar(anot.texto)">📋 Copiar</button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAnotacoesStore } from '../stores/anotacoes.js'

const router     = useRouter()
const store      = useAnotacoesStore()
const anotacoes  = computed(() => [...store.anotacoes].sort((a, b) => b.timestamp - a.timestamp))

const tipoLabels = {
  inicial:   '📋 Inicial',
  sv:        '📊 Sinais vitais',
  medicacao: '💊 Medicação',
  encamin:   '🚑 Encaminhamento',
  banho:     '🛁 Banho',
  curativo:  '🩹 Curativo',
  passagem:  '🔄 Passagem',
  livre:     '📝 Intercorrência',
}

function labelTipo(tipo) { return tipoLabels[tipo] || tipo }

function formatData(ts) {
  return new Date(ts).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit',
    hour: '2-digit', minute: '2-digit'
  })
}

function copiar(texto) {
  navigator.clipboard.writeText(texto).catch(() => {})
}
</script>

<style scoped>
.vazio { color: var(--text-muted); text-align: center; margin-top: 40px; }

.anot-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 12px;
}

.anot-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.anot-tipo { font-size: 0.8rem; font-weight: 700; color: var(--blue); }
.anot-data { font-size: 0.75rem; color: var(--text-muted); }
.anot-paciente { font-size: 0.85rem; color: var(--text-dim); margin-bottom: 8px; }
.anot-texto {
  font-size: 0.9rem;
  color: var(--text);
  line-height: 1.5;
  white-space: pre-wrap;
  margin-bottom: 12px;
}
.anot-acoes { display: flex; gap: 8px; }
</style>
