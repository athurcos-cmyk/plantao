<template>
  <div>
    <div class="campo">
      <label>Membro <span class="obrigatorio">*</span></label>
      <div class="radio-group">
        <label class="radio-btn" v-for="op in ['MSE','MSD','MIE','MID']" :key="op">
          <input type="radio" v-model="d.membro" :value="op"><span>{{ op }}</span>
        </label>
      </div>
    </div>
    <div class="campo">
      <label>Tipos <span class="obrigatorio">*</span></label>
      <div class="radio-group vertical">
        <label
          class="checkbox-label pulseira-label"
          v-for="op in pulseiraOpcoes" :key="op.v"
          :style="d.tipos.includes(op.v) ? { borderColor: op.cor, backgroundColor: op.cor + '20' } : {}"
        >
          <input type="checkbox" :value="op.v" v-model="d.tipos">
          <span>{{ cap(op.v) }}</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ d: Object, pulseiraOpcoes: Array })
const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : ''
</script>
