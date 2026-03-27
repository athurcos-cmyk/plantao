<template>
  <div>
    <div class="campo">
      <label>Local </label>
      <div class="radio-group vertical">
        <label class="radio-btn" v-for="op in locaisAVP" :key="op">
          <input type="radio" v-model="d.local" :value="op" @change="outroLocal = false"><span>{{ op }}</span>
        </label>
        <label class="radio-btn">
          <input type="radio" :checked="outroLocal" @click.prevent="outroLocal = !outroLocal; if(outroLocal) d.local = ''"><span>Outro</span>
        </label>
      </div>
      <input v-if="outroLocal" type="text" v-model="d.local" placeholder="Descreva o local..." style="margin-top:8px">
    </div>
    <div class="campo">
      <label>Status</label>
      <div class="radio-group vertical">
        <label class="checkbox-label" :class="{ checked: d.salinizado }"><input  data-testid="auto-input-modalavp-2" type="checkbox" v-model="d.salinizado"><span>Salinizado</span></label>
        <label class="checkbox-label" :class="{ checked: d.ocluido }"><input  data-testid="auto-input-modalavp-3" type="checkbox" v-model="d.ocluido"><span>Ocluído</span></label>
        <label class="checkbox-label" :class="{ checked: d.datado }"><input  data-testid="auto-input-modalavp-4" type="checkbox" v-model="d.datado"><span>Datado</span></label>
        <label class="checkbox-label" :class="{ checked: d.emInfusao }"><input  data-testid="auto-input-modalavp-5" type="checkbox" v-model="d.emInfusao"><span>Em infusão</span></label>
      </div>
    </div>
    <div v-if="d.datado" class="campo">
      <label>Data do curativo</label>
      <input  data-testid="auto-input-modalavp-6" type="date" v-model="d.data">
    </div>
    <div v-if="d.emInfusao">
      <div class="campo">
        <label>Solução </label>
        <input  data-testid="auto-input-modalavp-7" type="text" v-model="d.solucao" placeholder="Ex: tiamina 100mg + SF0,9% 100ml EV">
      </div>
      <div class="campo">
        <label>Velocidade <span style="font-size:0.75rem;font-weight:400;color:var(--text-muted)">(opcional)</span></label>
        <div class="input-suffix-wrap">
          <input  data-testid="auto-input-modalavp-8" type="number" v-model="d.velocidade" placeholder="21" min="1">
          <span class="input-suffix">ml/h</span>
        </div>
      </div>
      <div class="campo">
        <label class="checkbox-label" :class="{ checked: d.bic }" style="margin-bottom:0">
          <input  data-testid="auto-input-modalavp-9" type="checkbox" v-model="d.bic">
          <span>Bomba de infusão (BIC)</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({ d: Object })

const outroLocal = ref(false)

const locaisAVP = [
  'Dorso da mão D', 'Dorso da mão E',
  'Antebraço D', 'Antebraço E',
  'Fossa cubital D', 'Fossa cubital E',
  'MSD', 'MSE', 'MID', 'MIE'
]
</script>
