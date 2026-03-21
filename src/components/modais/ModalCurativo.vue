<template>
  <div>
    <div class="campo">
      <label>Locais </label>
      <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:8px">
        <label class="checkbox-label" v-for="op in ['MSD','MSE','MID','MIE']" :key="op" style="flex:1;min-width:70px">
          <input  data-testid="auto-input-modalcurativo-1" type="checkbox" :value="op" v-model="d.locais">
          <span>{{ op }}</span>
        </label>
      </div>
      <input  data-testid="auto-input-modalcurativo-2" type="text" v-model="d.localTexto" placeholder="Outro local (ex: flanco abdominal direito...)">
    </div>
    <div class="campo">
      <label>Condição </label>
      <div class="radio-group vertical">
        <label class="radio-btn" v-for="op in ['limpo e seco externamente','sujo externamente']" :key="op">
          <input  data-testid="auto-input-modalcurativo-3" type="radio" :checked="d.condicao === op" @click="d.condicao = d.condicao === op ? '' : op">
          <span>{{ op }}</span>
        </label>
      </div>
    </div>
    <label class="checkbox-label" style="margin-bottom:0">
      <input  data-testid="auto-input-modalcurativo-4" type="checkbox" v-model="d.enfaixamento">
      <span>Com enfaixamento</span>
    </label>
  </div>
</template>

<script setup>
defineProps({ d: Object })
</script>
