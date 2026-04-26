<template>
  <Teleport to="body">
    <Transition name="help-slide">
      <div v-if="aberto" class="help-overlay" @click.self="$emit('fechar')">
        <div class="help-sheet">
          <div class="help-topo">
            <div class="help-drag-bar"></div>
            <div class="help-titulo-row">
              <span class="help-titulo">{{ titulo }}</span>
              <button class="help-fechar" @click="$emit('fechar')">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>
          <div class="help-lista">
            <div v-for="item in itens" :key="item.titulo" class="help-item">
              <span class="help-icone">{{ item.icone }}</span>
              <div class="help-texto">
                <span class="help-item-titulo">{{ item.titulo }}</span>
                <span class="help-item-desc">{{ item.desc }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
defineProps({ aberto: Boolean, titulo: String, itens: Array })
defineEmits(['fechar'])
</script>

<style scoped>
.help-overlay {
  position: fixed; inset: 0;
  background: rgba(0, 0, 0, 0.65);
  z-index: 300;
  display: flex; align-items: flex-end;
}
.help-sheet {
  width: 100%;
  background: var(--bg-card);
  border-top: 1px solid var(--border);
  border-radius: 20px 20px 0 0;
  padding-bottom: calc(24px + var(--safe-bottom, 0px));
  max-height: 80vh;
  display: flex; flex-direction: column;
}
.help-topo {
  padding: 12px 20px 8px;
  flex-shrink: 0;
}
.help-drag-bar {
  width: 36px; height: 4px; border-radius: 2px;
  background: var(--border); margin: 0 auto 14px;
}
.help-titulo-row {
  display: flex; align-items: center; justify-content: space-between;
}
.help-titulo {
  font-size: 1rem; font-weight: 700; color: var(--text);
}
.help-fechar {
  background: none; border: none; color: var(--text-muted);
  cursor: pointer; padding: 4px; display: flex; align-items: center;
  border-radius: 6px;
}
.help-fechar:active { background: var(--bg-hover); }
.help-lista {
  overflow-y: auto; padding: 4px 20px 16px;
}
.help-item {
  display: flex; align-items: flex-start; gap: 14px;
  padding: 12px 0;
  border-bottom: 1px solid var(--border);
}
.help-item:last-child { border-bottom: none; }
.help-icone {
  font-size: 1.5rem; flex-shrink: 0; margin-top: 1px; width: 28px; text-align: center;
}
.help-texto {
  display: flex; flex-direction: column; gap: 3px;
}
.help-item-titulo {
  font-size: 0.9rem; font-weight: 700; color: var(--text);
}
.help-item-desc {
  font-size: 0.82rem; color: var(--text-muted); line-height: 1.5;
}

/* Transition */
.help-slide-enter-active,
.help-slide-leave-active {
  transition: opacity 0.25s;
}
.help-slide-enter-active .help-sheet,
.help-slide-leave-active .help-sheet {
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}
.help-slide-enter-from,
.help-slide-leave-to {
  opacity: 0;
}
.help-slide-enter-from .help-sheet,
.help-slide-leave-to .help-sheet {
  transform: translateY(100%);
}
</style>
