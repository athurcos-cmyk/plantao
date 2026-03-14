<template>
  <div>
    <div class="campo">
      <label>Narina <span class="obrigatorio">*</span></label>
      <div class="radio-group">
        <label class="radio-btn" v-for="op in [{ v:'D', l:'Direita' },{ v:'E', l:'Esquerda' }]" :key="op.v">
          <input  data-testid="auto-input-modalsng-1" type="radio" v-model="d.narina" :value="op.v"><span>{{ op.l }}</span>
        </label>
      </div>
    </div>
    <div class="campo">
      <label>Marcação (cm) <span class="obrigatorio">*</span></label>
      <input  data-testid="auto-input-modalsng-2" type="number" v-model="d.marcacao" placeholder="65" min="1">
    </div>
    <div class="campo">
      <label>Modo <span class="obrigatorio">*</span></label>
      <div class="radio-group vertical">
        <label class="radio-btn" v-for="op in [{ v:'aberta', l:'Aberta' },{ v:'fechada', l:'Fechada' },{ v:'dieta', l:'Recebendo dieta enteral' },{ v:'dren', l:'Em drenagem (frasco coletor)' }]" :key="op.v">
          <input  data-testid="auto-input-modalsng-3" type="radio" v-model="d.modo" :value="op.v"><span>{{ op.l }}</span>
        </label>
      </div>
    </div>
    <div v-if="d.modo === 'dieta'" class="campo">
      <label>Velocidade da dieta <span class="obrigatorio">*</span></label>
      <div class="input-suffix-wrap">
        <input  data-testid="auto-input-modalsng-4" type="number" v-model="d.velocidadeDieta" placeholder="60" min="1">
        <span class="input-suffix">ml/h</span>
      </div>
    </div>
    <div v-if="d.modo === 'dren'">
      <div class="campo">
        <label>Débito <span class="obrigatorio">*</span></label>
        <div class="radio-group">
          <label class="radio-btn" v-for="op in [{ v:'sem', l:'Sem débito' },{ v:'com', l:'Com débito' }]" :key="op.v">
            <input  data-testid="auto-input-modalsng-5" type="radio" v-model="d.debito" :value="op.v"><span>{{ op.l }}</span>
          </label>
        </div>
        <div v-if="d.debito === 'com'" style="margin-top:8px">
          <div class="input-suffix-wrap">
            <input  data-testid="auto-input-modalsng-6" type="number" v-model="d.debitoVal" placeholder="200" min="1">
            <span class="input-suffix">ml</span>
          </div>
        </div>
      </div>
      <div v-if="d.debito === 'com'" class="campo">
        <label>Aspecto</label>
        <input  data-testid="auto-input-modalsng-7" type="text" v-model="d.aspecto" placeholder="Ex: amarelado, bilioso, esverdeado">
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ d: Object })
</script>
