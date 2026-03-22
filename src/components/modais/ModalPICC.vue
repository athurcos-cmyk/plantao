<template>
  <div>
    <div class="campo">
      <label>Membro </label>
      <div class="radio-group">
        <label class="radio-btn" v-for="op in ['MSD','MSE']" :key="op">
          <input  data-testid="auto-input-modalpicc-1" type="radio" v-model="d.membro" :value="op"><span>{{ op }}</span>
        </label>
      </div>
    </div>
    <div class="campo">
      <label>Lúmens </label>
      <div class="radio-group">
        <label class="radio-btn" v-for="op in ['mono','duplo']" :key="op">
          <input  data-testid="auto-input-modalpicc-2" type="radio" v-model="d.lumens" :value="op"><span>{{ cap(op) }}</span>
        </label>
      </div>
    </div>
    <div class="campo">
      <label>Status</label>
      <div class="radio-group vertical">
        <label class="checkbox-label" :class="{ checked: d.salinizado }"><input  data-testid="auto-input-modalpicc-3" type="checkbox" v-model="d.salinizado"><span>Salinizado</span></label>
        <label class="checkbox-label" :class="{ checked: d.heparinizado }"><input  data-testid="auto-input-modalpicc-4" type="checkbox" v-model="d.heparinizado"><span>Heparinizado</span></label>
        <label class="checkbox-label" :class="{ checked: d.ocluido }"><input  data-testid="auto-input-modalpicc-5" type="checkbox" v-model="d.ocluido"><span>Ocluído</span></label>
        <label class="checkbox-label" :class="{ checked: d.datado }"><input  data-testid="auto-input-modalpicc-6" type="checkbox" v-model="d.datado"><span>Datado</span></label>
        <label class="checkbox-label" :class="{ checked: d.emInfusao }"><input  data-testid="auto-input-modalpicc-7" type="checkbox" v-model="d.emInfusao"><span>Em infusão</span></label>
      </div>
    </div>
    <div v-if="d.datado" class="campo">
      <label>Data do curativo</label>
      <input  data-testid="auto-input-modalpicc-8" type="date" v-model="d.data">
    </div>
    <div v-if="d.emInfusao">
      <div class="campo">
        <label>Solução </label>
        <input  data-testid="auto-input-modalpicc-9" type="text" v-model="d.solucao" placeholder="Ex: SF0,9% 500ml">
      </div>
      <div class="campo">
        <label>Velocidade <span style="font-size:0.75rem;font-weight:400;color:var(--text-muted)">(opcional)</span></label>
        <div class="input-suffix-wrap">
          <input  data-testid="auto-input-modalpicc-10" type="number" v-model="d.velocidade" placeholder="21" min="1">
          <span class="input-suffix">ml/h</span>
        </div>
      </div>
      <div class="campo">
        <label class="checkbox-label" :class="{ checked: d.bic }" style="margin-bottom:0">
          <input  data-testid="auto-input-modalpicc-11" type="checkbox" v-model="d.bic">
          <span>Bomba de infusão (BIC)</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ d: Object })
const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : ''
</script>
