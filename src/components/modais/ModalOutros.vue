<template>
  <div>
    <div class="campo">
      <label>Descreva o dispositivo <span class="obrigatorio">*</span></label>
      <textarea v-model="d.descricao" rows="3" placeholder="Ex: cateter vesical, sonda vesical de demora..."></textarea>
    </div>
  </div>
</template>

<script setup>
defineProps({ d: Object })
</script>
