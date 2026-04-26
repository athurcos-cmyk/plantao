<template>
  <div v-if="visible" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-box">
      <div class="modal-header">
        <h3>Personalizar campos</h3>
        <button class="btn-icon" @click="$emit('close')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <p class="modal-desc">Escolha quais campos aparecem na Anotação Inicial gerada.</p>

      <div class="campos-lista">
        <label v-for="campo in CAMPOS" :key="campo.key" class="campo-toggle">
          <input type="checkbox" v-model="local[campo.key]">
          <span>{{ campo.label }}</span>
        </label>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" style="width:auto;padding:11px 20px" @click="$emit('close')">Cancelar</button>
        <button class="btn btn-primary" @click="salvar">Salvar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'
import { CAMPOS } from '../config/camposAnotacaoInicial.js'

const props = defineProps({
  visible: Boolean,
  camposAtivos: Object,
})
const emit = defineEmits(['save', 'close'])

const local = reactive({})

// Sincroniza estado local ao abrir o modal
watch(() => props.visible, (aberto) => {
  if (aberto) {
    CAMPOS.forEach(c => { local[c.key] = props.camposAtivos[c.key] !== false })
  }
}, { immediate: true })

function salvar() {
  emit('save', { ...local })
}
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0; z-index: 200;
  background: rgba(0, 0, 0, 0.65);
  display: flex; align-items: flex-end; justify-content: center;
}
.modal-box {
  background: var(--bg-card);
  border-radius: 16px 16px 0 0;
  width: 100%; max-width: 480px;
  padding: 20px 20px 32px;
  max-height: 80vh; overflow-y: auto;
}
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 6px;
}
.modal-header h3 { font-size: 1.05rem; font-weight: 600; margin: 0; }
.modal-desc {
  font-size: 0.84rem; color: var(--text-muted);
  margin: 0 0 16px;
}
.campos-lista {
  display: flex; flex-direction: column; gap: 4px;
  margin-bottom: 20px;
}
.campo-toggle {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 14px;
  background: var(--bg-input);
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.92rem;
}
.campo-toggle input[type="checkbox"] {
  width: 18px; height: 18px;
  accent-color: var(--blue);
  flex-shrink: 0;
}
.modal-footer {
  display: flex; gap: 10px;
}
.modal-footer .btn { flex: 1; }
</style>
