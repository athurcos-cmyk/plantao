<template>
  <div>
    <div class="campo">
      <label>Tipo do dreno </label>
      <input  data-testid="auto-input-modaldreno-1" type="text" v-model="d.drenoTipo" placeholder="Ex: tórax, abdominal, penrose, blake">
    </div>
    <div class="campo">
      <label>Localização </label>
      <input  data-testid="auto-input-modaldreno-2" type="text" v-model="d.drenoLocal" placeholder="Ex: flanco direito, hipocôndrio esquerdo">
    </div>
    <div class="campo">
      <label>Débito drenado</label>
      <div class="input-suffix-wrap">
        <input  data-testid="auto-input-modaldreno-3" type="number" v-model="d.drenoDebito" placeholder="350" min="0">
        <span class="input-suffix">ml</span>
      </div>
    </div>
    <div class="campo">
      <label>Aspecto / coloração</label>
      <input  data-testid="auto-input-modaldreno-4" type="text" v-model="d.drenoAspecto" placeholder="Ex: sanguinolento, seroso, bilioso">
    </div>
    <div class="campo">
      <label class="checkbox-label" :class="{ checked: d.seloAgua }" style="margin-bottom:0">
        <input  data-testid="auto-input-modaldreno-5" type="checkbox" v-model="d.seloAgua">
        <span>Possui selo d'água</span>
      </label>
      <div v-if="d.seloAgua" style="margin-top:8px">
        <label class="label-small">Débito no selo d'água</label>
        <div class="input-suffix-wrap">
          <input  data-testid="auto-input-modaldreno-6" type="number" v-model="d.seloDebito" placeholder="100" min="0">
          <span class="input-suffix">ml</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ d: Object })
</script>
