<template>
  <button class="botao-chat" @click="toggleChat" :aria-label="aberto ? 'Fechar Clara' : 'Abrir Clara'">
    <span v-if="!aberto">💬</span>
    <span v-else>✕</span>
    <span v-if="novaResposta && !aberto" class="botao-chat-badge"></span>
  </button>
</template>

<script setup>
import { useChat } from '../composables/useChat.js'

const { aberto, novaResposta, toggleChat } = useChat()
</script>

<style scoped>
.botao-chat {
  position: fixed;
  bottom: 94px;
  right: 18px;
  z-index: 900;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--blue);
  border: none;
  color: var(--text-on-accent);
  font-size: 1.4rem;
  cursor: pointer;
  box-shadow: var(--shadow-md);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, transform 0.15s;
}
.botao-chat:active {
  transform: scale(0.92);
  background: var(--blue-dark);
}
.botao-chat-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 10px;
  height: 10px;
  background: var(--danger);
  border-radius: 50%;
  border: 2px solid var(--bg);
}

@media (min-width: 768px) {
  .botao-chat {
    bottom: 24px;
  }
}
</style>
