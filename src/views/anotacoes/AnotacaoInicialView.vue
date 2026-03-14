<template>
  <div class="screen">
    <header class="app-header">
      <button class="btn-icon" @click="router.back()">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>
      <h1>Anotação Inicial</h1>
      <div style="width:34px"/>
    </header>
    <main class="container" style="padding-top:24px">
      <p style="color:var(--text-muted)">Em construção — migração em andamento...</p>
    </main>
  </div>
</template>
<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
</script>
