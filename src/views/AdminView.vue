<template>
  <div class="admin-wrap">
    <header class="admin-header">
      <button class="btn-back" @click="$router.back()">←</button>
      <h1 class="admin-title">Admin</h1>
    </header>

    <div class="admin-body">
      <p class="admin-hint">Envia mensagem para todos os usuários cadastrados.</p>

      <div class="field">
        <label class="field-label">Título</label>
        <input
          v-model="form.titulo"
          class="input"
          placeholder="Ex: Novidade no Plantão 🎉"
          maxlength="100"
        />
      </div>

      <div class="field">
        <label class="field-label">Mensagem</label>
        <textarea
          v-model="form.mensagem"
          class="input textarea"
          placeholder="Escreva a mensagem aqui..."
          rows="5"
          maxlength="1000"
        />
        <span class="char-count">{{ form.mensagem.length }}/1000</span>
      </div>

      <div class="field">
        <label class="field-label">Enviar via</label>
        <div class="chips">
          <button
            class="chip"
            :class="{ 'chip-on': form.tipo === 'push' }"
            @click="form.tipo = 'push'"
          >🔔 Push</button>
          <button
            class="chip"
            :class="{ 'chip-on': form.tipo === 'email' }"
            @click="form.tipo = 'email'"
          >✉️ Email</button>
          <button
            class="chip"
            :class="{ 'chip-on': form.tipo === 'ambos' }"
            @click="form.tipo = 'ambos'"
          >📢 Ambos</button>
        </div>
      </div>

      <button
        class="btn-enviar"
        :disabled="enviando || !form.mensagem.trim()"
        @click="enviar"
      >
        <span v-if="enviando">Enviando…</span>
        <span v-else>Enviar</span>
      </button>

      <div v-if="resultado" class="resultado" :class="resultado.erro ? 'resultado-erro' : 'resultado-ok'">
        <template v-if="!resultado.erro">
          <p class="resultado-linha">✅ Push enviados: <strong>{{ resultado.push }}</strong></p>
          <p class="resultado-linha">✅ Emails enviados: <strong>{{ resultado.email }}</strong></p>
          <template v-if="resultado.erros?.length">
            <p class="resultado-linha resultado-aviso">⚠️ {{ resultado.erros.length }} erro(s) parcial(is):</p>
            <ul class="erros-lista">
              <li v-for="(e, i) in resultado.erros" :key="i" class="erro-item">
                <span class="erro-tipo">{{ e.tipo }}</span>
                <span v-if="e.email" class="erro-detalhe">{{ e.email }}</span>
                <span v-else-if="e.key" class="erro-detalhe">device: {{ e.key }}</span>
                <span class="erro-msg">{{ e.error }}</span>
              </li>
            </ul>
          </template>
        </template>
        <p v-else class="resultado-linha">❌ {{ resultado.erro }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { getAuth } from 'firebase/auth'

const auth = useAuthStore()

const form = reactive({
  titulo: '',
  mensagem: '',
  tipo: 'ambos',
})

const enviando = ref(false)
const resultado = ref(null)

async function enviar() {
  if (enviando.value || !form.mensagem.trim()) return

  enviando.value = true
  resultado.value = null

  try {
    const user = getAuth().currentUser
    if (!user) throw new Error('Não autenticado')

    const idToken = await user.getIdToken()

    const res = await fetch('/api/broadcast', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        titulo: form.titulo.trim() || undefined,
        mensagem: form.mensagem.trim(),
        tipo: form.tipo,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      resultado.value = { erro: data.error || `Erro ${res.status}` }
    } else {
      resultado.value = data
    }
  } catch (e) {
    resultado.value = { erro: e.message || 'Erro desconhecido' }
  } finally {
    enviando.value = false
  }
}
</script>

<style scoped>
.admin-wrap {
  min-height: 100vh;
  background: #0A1628;
  color: #EAEEF3;
  font-family: 'DM Sans', sans-serif;
}

.admin-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #111d32;
  border-bottom: 1px solid #1e3050;
}

.btn-back {
  background: none;
  border: none;
  color: #8899AA;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 4px 8px;
  line-height: 1;
}

.admin-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #EAEEF3;
}

.admin-body {
  padding: 24px 16px;
  max-width: 480px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.admin-hint {
  margin: 0;
  font-size: 0.875rem;
  color: #8899AA;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #8899AA;
}

.input {
  background: #162033;
  border: 1px solid #1e3050;
  border-radius: 10px;
  padding: 12px 14px;
  color: #EAEEF3;
  font-size: 1rem;
  font-family: inherit;
  outline: none;
  transition: border-color 0.15s;
  width: 100%;
  box-sizing: border-box;
}

.input:focus {
  border-color: #1E88E5;
}

.textarea {
  resize: vertical;
  min-height: 120px;
  line-height: 1.6;
}

.char-count {
  font-size: 0.78rem;
  color: #556677;
  text-align: right;
}

.chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.chip {
  padding: 8px 16px;
  border-radius: 9999px;
  border: 1px solid #1e3050;
  background: #162033;
  color: #8899AA;
  font-size: 0.875rem;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s;
}

.chip-on {
  background: rgba(30, 136, 229, 0.12);
  border-color: #1E88E5;
  color: #1E88E5;
}

.btn-enviar {
  width: 100%;
  padding: 14px;
  background: #1E88E5;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s;
  min-height: 52px;
}

.btn-enviar:hover:not(:disabled) {
  background: #1565C0;
}

.btn-enviar:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.resultado {
  border-radius: 10px;
  padding: 16px;
}

.resultado-ok {
  background: rgba(67, 160, 71, 0.1);
  border: 1px solid rgba(67, 160, 71, 0.25);
}

.resultado-erro {
  background: rgba(229, 57, 53, 0.1);
  border: 1px solid rgba(229, 57, 53, 0.25);
}

.resultado-linha {
  margin: 0 0 6px;
  font-size: 0.9rem;
  color: #EAEEF3;
}

.resultado-linha:last-child {
  margin-bottom: 0;
}

.resultado-aviso {
  color: #FFC107;
}

.erros-lista {
  margin: 8px 0 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.erro-item {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: baseline;
  font-size: 0.82rem;
  background: rgba(229, 57, 53, 0.08);
  border-radius: 6px;
  padding: 6px 10px;
}

.erro-tipo {
  font-weight: 700;
  text-transform: uppercase;
  font-size: 0.72rem;
  color: #E53935;
  letter-spacing: 0.04em;
}

.erro-detalhe {
  color: #EAEEF3;
}

.erro-msg {
  color: #8899AA;
  word-break: break-all;
}
</style>
