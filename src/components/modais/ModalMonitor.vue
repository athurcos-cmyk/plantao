<template>
  <div>
    <div class="campo">
      <label>Tipo <span class="obrigatorio">*</span></label>
      <div class="radio-group vertical">
        <label class="radio-btn" v-for="op in ['monitor multiparamétrico','oxímetro de pulso','monitor cardíaco']" :key="op">
          <input type="radio" v-model="d.tipoMonitor" :value="op"><span>{{ cap(op) }}</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ d: Object })
const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : ''
</script>
