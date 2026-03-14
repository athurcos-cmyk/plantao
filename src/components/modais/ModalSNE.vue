<template>
  <div>
    <div class="campo">
      <label>Narina <span class="obrigatorio">*</span></label>
      <div class="radio-group">
        <label class="radio-btn" v-for="op in [{ v:'D', l:'Direita' },{ v:'E', l:'Esquerda' }]" :key="op.v">
          <input type="radio" v-model="d.narina" :value="op.v"><span>{{ op.l }}</span>
        </label>
      </div>
    </div>
    <div class="campo">
      <label>Marcação (cm) <span class="obrigatorio">*</span></label>
      <input type="number" v-model="d.marcacao" placeholder="65" min="1">
    </div>
    <div class="campo">
      <label>Status <span class="obrigatorio">*</span></label>
      <div class="radio-group">
        <label class="radio-btn" v-for="op in ['aberta','fechada']" :key="op">
          <input type="radio" v-model="d.status" :value="op"><span>{{ cap(op) }}</span>
        </label>
      </div>
    </div>
    <div class="campo">
      <label>Dieta enteral <span class="obrigatorio">*</span></label>
      <div class="radio-group">
        <label class="radio-btn" v-for="op in ['sim','não']" :key="op">
          <input type="radio" v-model="d.dieta" :value="op"><span>{{ cap(op) }}</span>
        </label>
      </div>
    </div>
    <div v-if="d.dieta === 'sim'" class="campo">
      <label>Velocidade da dieta <span class="obrigatorio">*</span></label>
      <div class="input-suffix-wrap">
        <input type="number" v-model="d.velocidadeDieta" placeholder="60" min="1">
        <span class="input-suffix">ml/h</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ d: Object })
const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : ''
</script>
