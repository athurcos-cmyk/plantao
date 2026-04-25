<template>
  <div class="resultado-flow">
    <section class="resultado-hero">
      <div class="resultado-hero-icon">
        <img :src="icon" alt="" />
      </div>
      <div class="resultado-hero-copy">
        <h1>Texto pronto</h1>
        <p>Revise, copie ou salve no histórico.</p>
      </div>
    </section>

    <textarea
      class="resultado-box"
      rows="8"
      :value="texto"
      @input="$emit('update:texto', $event.target.value)"
    ></textarea>

    <section class="resultado-identidade">
      <div class="resultado-identidade-grid">
        <div>
          <label class="resultado-label">Nome do paciente</label>
          <input
            class="resultado-input"
            type="text"
            :value="nomePaciente"
            @input="$emit('update:nomePaciente', $event.target.value)"
            placeholder="Maria da Silva"
          >
        </div>
        <div>
          <label class="resultado-label">Leito</label>
          <input
            class="resultado-input"
            type="text"
            :value="leitoPaciente"
            @input="$emit('update:leitoPaciente', $event.target.value)"
            placeholder="4B"
          >
        </div>
      </div>
    </section>

    <div class="resultado-acoes">
      <button class="btn btn-primary resultado-btn-copiar" @click="$emit('copiar')">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
        Copiar texto
      </button>
      <button class="btn btn-secondary" @click="$emit('salvar')" :disabled="salvando">
        {{ salvando ? 'Salvando...' : 'Salvar no histórico' }}
      </button>
      <button class="btn btn-secondary" @click="$emit('compartilhar')">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
        Compartilhar
      </button>
      <button class="btn btn-secondary" @click="$emit('nova')">{{ labelNova }}</button>
      <button class="btn btn-tertiary" @click="$emit('editar')">Editar dados</button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  icon:         { type: String,  required: true },
  texto:        { type: String,  default: '' },
  nomePaciente: { type: String,  default: '' },
  leitoPaciente:{ type: String,  default: '' },
  salvando:     { type: Boolean, default: false },
  labelNova:    { type: String,  default: 'Nova anotação' },
})

defineEmits([
  'update:texto',
  'update:nomePaciente',
  'update:leitoPaciente',
  'copiar',
  'salvar',
  'compartilhar',
  'nova',
  'editar',
])
</script>

<style scoped>
.resultado-flow {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.resultado-hero {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px;
  border-radius: 22px;
  border: 1px solid rgba(70, 132, 230, 0.42);
  background:
    radial-gradient(circle at top left, rgba(44, 117, 235, 0.18), transparent 40%),
    linear-gradient(180deg, rgba(17, 34, 66, 0.98), rgba(14, 28, 54, 0.98));
  box-shadow: 0 18px 34px rgba(2, 7, 16, 0.22);
}

.resultado-hero-icon {
  width: 62px;
  height: 62px;
  border-radius: 20px;
  background: radial-gradient(circle at top, rgba(71, 140, 255, 0.38), rgba(39, 88, 170, 0.5));
  border: 1px solid rgba(104, 161, 255, 0.38);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.resultado-hero-icon img {
  width: 44px;
  height: 44px;
  object-fit: contain;
}

.resultado-hero-copy h1 {
  margin: 0;
  font-size: 1.9rem;
  line-height: 1;
  font-weight: 800;
  color: #f5f8ff;
}

.resultado-hero-copy p {
  margin: 8px 0 0;
  font-size: 1rem;
  color: var(--text-dim);
}

.resultado-box {
  background: linear-gradient(180deg, var(--bg-input), var(--bg-card));
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 18px;
  width: 100%;
  box-sizing: border-box;
  font-size: 0.98rem;
  line-height: 1.7;
  color: var(--text);
  font-family: inherit;
  white-space: pre-wrap;
  resize: vertical;
  outline: none;
}

.resultado-box:focus {
  border-color: var(--blue);
  box-shadow: 0 0 0 3px var(--blue-faint);
}

.resultado-identidade {
  padding: 16px 18px;
  border-radius: 22px;
  border: 1px solid var(--border);
  background: linear-gradient(180deg, var(--bg-input), var(--bg-card));
  box-shadow: 0 14px 28px rgba(3, 10, 22, 0.18);
}

.resultado-identidade-grid {
  display: grid;
  grid-template-columns: 1.5fr 0.85fr;
  gap: 12px;
}

.resultado-label {
  display: block;
  color: var(--text-dim);
  margin-bottom: 8px;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.resultado-input {
  width: 100%;
  box-sizing: border-box;
  min-height: 52px;
  background: rgba(18, 33, 60, 0.9);
  border: 1px solid rgba(60, 86, 131, 0.58);
  border-radius: 14px;
  color: #eff4ff;
  font-family: inherit;
  font-size: 1rem;
  padding: 0 14px;
  outline: none;
  transition: border-color 0.2s;
}

.resultado-input:focus {
  border-color: var(--blue);
  box-shadow: 0 0 0 3px var(--blue-faint);
}

.resultado-acoes {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.resultado-btn-copiar {
  min-height: 62px;
  border-radius: 18px;
  font-size: 1.06rem;
  box-shadow: 0 16px 30px rgba(25, 96, 201, 0.28);
}
</style>
