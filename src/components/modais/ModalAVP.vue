<template>
  <div>
    <div class="campo">
      <label>Local <span class="obrigatorio">*</span></label>
      <div class="radio-group vertical">
        <label class="radio-btn" v-for="op in ['MSE','MSD','MIE','MID','jugular D','jugular E']" :key="op">
          <input type="radio" v-model="d.local" :value="op"><span>{{ op }}</span>
        </label>
      </div>
    </div>
    <div class="campo">
      <label>Status</label>
      <div class="radio-group vertical">
        <label class="checkbox-label"><input type="checkbox" v-model="d.salinizado"><span>Salinizado</span></label>
        <label class="checkbox-label"><input type="checkbox" v-model="d.ocluido"><span>Ocluído</span></label>
        <label class="checkbox-label"><input type="checkbox" v-model="d.datado"><span>Datado</span></label>
        <label class="checkbox-label"><input type="checkbox" v-model="d.emInfusao"><span>Em infusão</span></label>
      </div>
    </div>
    <div v-if="d.datado" class="campo">
      <label>Data do curativo</label>
      <input type="date" v-model="d.data">
    </div>
    <div v-if="d.emInfusao">
      <div class="campo">
        <label>Solução <span class="obrigatorio">*</span></label>
        <input type="text" v-model="d.solucao" placeholder="Ex: tiamina 100mg + SF0,9% 100ml EV">
      </div>
      <div class="campo">
        <label>Velocidade <span style="font-size:0.75rem;font-weight:400;color:var(--text-muted)">(opcional)</span></label>
        <div class="input-suffix-wrap">
          <input type="number" v-model="d.velocidade" placeholder="21" min="1">
          <span class="input-suffix">ml/h</span>
        </div>
      </div>
      <div class="campo">
        <label class="checkbox-label" style="margin-bottom:0">
          <input type="checkbox" v-model="d.bic">
          <span>Bomba de infusão (BIC)</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ d: Object })
</script>
