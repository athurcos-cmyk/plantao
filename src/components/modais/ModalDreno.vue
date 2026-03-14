<template>
  <div>
    <div class="campo">
      <label>Tipo do dreno <span class="obrigatorio">*</span></label>
      <input type="text" v-model="d.drenoTipo" placeholder="Ex: tórax, abdominal, penrose, blake">
    </div>
    <div class="campo">
      <label>Localização <span class="obrigatorio">*</span></label>
      <input type="text" v-model="d.drenoLocal" placeholder="Ex: flanco direito, hipocôndrio esquerdo">
    </div>
    <div class="campo">
      <label>Débito drenado</label>
      <div class="input-suffix-wrap">
        <input type="number" v-model="d.drenoDebito" placeholder="350" min="0">
        <span class="input-suffix">ml</span>
      </div>
    </div>
    <div class="campo">
      <label>Aspecto / coloração</label>
      <input type="text" v-model="d.drenoAspecto" placeholder="Ex: sanguinolento, seroso, bilioso">
    </div>
    <div class="campo">
      <label class="checkbox-label" style="margin-bottom:0">
        <input type="checkbox" v-model="d.seloAgua">
        <span>Possui selo d'água</span>
      </label>
      <div v-if="d.seloAgua" style="margin-top:8px">
        <label class="label-small">Débito no selo d'água</label>
        <div class="input-suffix-wrap">
          <input type="number" v-model="d.seloDebito" placeholder="100" min="0">
          <span class="input-suffix">ml</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ d: Object })
</script>
