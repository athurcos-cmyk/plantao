<template>
  <div class="redef-screen">
    <div class="redef-card">

      <div class="redef-brand">
        <img src="/icons/icon-512.png" width="52" height="52" alt="Plantão" style="border-radius:12px;display:block" />
        <span class="redef-nome">Plantão</span>
      </div>

      <!-- Carregando -->
      <div v-if="estado === 'carregando'" class="redef-center">
        <p class="redef-sub">Verificando link…</p>
      </div>

      <!-- Link inválido / expirado -->
      <div v-else-if="estado === 'invalido'" class="redef-center">
        <div class="redef-icon-status">❌</div>
        <h1 class="redef-titulo">Link inválido ou expirado</h1>
        <p class="redef-sub">Este link de redefinição já foi usado ou expirou. Solicite um novo na tela de login.</p>
        <a href="/" class="btn-redef">Ir para o login</a>
      </div>

      <!-- Formulário -->
      <div v-else-if="estado === 'form'">
        <h1 class="redef-titulo">Nova senha</h1>
        <p class="redef-sub">Crie uma nova senha para <strong>{{ email }}</strong></p>

        <div class="campo">
          <label class="campo-label">Nova senha</label>
          <div class="input-wrap">
            <input
              v-model="senha"
              :type="mostrarSenha ? 'text' : 'password'"
              placeholder="Mínimo 8 caracteres"
              autocomplete="new-password"
              :class="{ invalido: erroSenha }"
            />
            <button class="btn-olho" type="button" @click="mostrarSenha = !mostrarSenha">
              {{ mostrarSenha ? '🙈' : '👁' }}
            </button>
          </div>
        </div>

        <div class="campo">
          <label class="campo-label">Confirmar senha</label>
          <div class="input-wrap">
            <input
              v-model="senhaConfirm"
              :type="mostrarConfirm ? 'text' : 'password'"
              placeholder="Repita a senha"
              autocomplete="new-password"
              :class="{ invalido: erroSenha }"
            />
            <button class="btn-olho" type="button" @click="mostrarConfirm = !mostrarConfirm">
              {{ mostrarConfirm ? '🙈' : '👁' }}
            </button>
          </div>
          <p v-if="erroSenha" class="campo-erro">{{ erroSenha }}</p>
        </div>

        <button
          class="btn-redef"
          :disabled="salvando || senha.length < 8 || senha !== senhaConfirm"
          @click="confirmar"
        >
          {{ salvando ? 'Salvando…' : 'Salvar nova senha' }}
        </button>

        <p v-if="erro" class="msg-erro">{{ erro }}</p>
      </div>

      <!-- Sucesso -->
      <div v-else-if="estado === 'sucesso'" class="redef-center">
        <div class="redef-icon-status">✅</div>
        <h1 class="redef-titulo">Senha redefinida!</h1>
        <p class="redef-sub">Sua nova senha foi salva. Agora você pode entrar no Plantão.</p>
        <a href="/" class="btn-redef">Entrar no app</a>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { auth as firebaseAuth } from '../firebase.js'
import { verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth'

const route = useRoute()

const estado = ref('carregando') // carregando | invalido | form | sucesso
const email = ref('')
const senha = ref('')
const senhaConfirm = ref('')
const mostrarSenha = ref(false)
const mostrarConfirm = ref(false)
const salvando = ref(false)
const erro = ref('')

const oobCode = route.query.oobCode || ''

const erroSenha = computed(() => {
  if (!senhaConfirm.value) return ''
  if (senha.value !== senhaConfirm.value) return 'As senhas não coincidem'
  return ''
})

onMounted(async () => {
  if (!oobCode) {
    estado.value = 'invalido'
    return
  }
  try {
    email.value = await verifyPasswordResetCode(firebaseAuth, oobCode)
    estado.value = 'form'
  } catch {
    estado.value = 'invalido'
  }
})

async function confirmar() {
  if (salvando.value || senha.value.length < 8 || senha.value !== senhaConfirm.value) return
  salvando.value = true
  erro.value = ''
  try {
    await confirmPasswordReset(firebaseAuth, oobCode, senha.value)
    estado.value = 'sucesso'
  } catch (e) {
    if (e.code === 'auth/expired-action-code') {
      estado.value = 'invalido'
    } else {
      erro.value = 'Erro ao salvar a senha. Tente novamente.'
    }
  } finally {
    salvando.value = false
  }
}
</script>

<style scoped>
.redef-screen {
  min-height: 100vh;
  background: var(--bg);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
}

.redef-card {
  width: 100%;
  max-width: 400px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 32px 24px;
}

.redef-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 28px;
}

.redef-nome {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text);
}

.redef-titulo {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text);
  margin: 0 0 8px;
}

.redef-sub {
  font-size: 0.9rem;
  color: var(--text-dim);
  margin: 0 0 24px;
  line-height: 1.5;
}

.redef-center {
  text-align: center;
}

.redef-icon-status {
  font-size: 2.5rem;
  margin-bottom: 12px;
}

.campo {
  margin-bottom: 16px;
}

.campo-label {
  display: block;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 6px;
}

.input-wrap {
  position: relative;
}

.input-wrap input {
  width: 100%;
  padding: 13px 44px 13px 14px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 10px;
  color: var(--text);
  font-size: 1rem;
  font-family: inherit;
  outline: none;
  transition: border-color 0.15s;
  box-sizing: border-box;
}

.input-wrap input:focus { border-color: var(--blue); }
.input-wrap input.invalido { border-color: var(--danger); }
.input-wrap input::placeholder { color: var(--text-dim); }

.btn-olho {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  padding: 0;
  line-height: 1;
}

.campo-erro {
  font-size: 0.8rem;
  color: var(--danger);
  margin: 6px 0 0;
}

.btn-redef {
  display: block;
  width: 100%;
  padding: 14px;
  background: var(--blue);
  color: var(--text-on-accent);
  border: none;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  text-align: center;
  text-decoration: none;
  transition: opacity 0.15s;
  margin-top: 8px;
}

.btn-redef:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-redef:hover:not(:disabled) { opacity: 0.9; }

.msg-erro {
  color: var(--danger);
  font-size: 0.85rem;
  text-align: center;
  margin-top: 12px;
}
</style>
