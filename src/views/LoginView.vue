<template>
  <div class="login-screen">
    <div class="login-box">
      <!-- Logo -->
      <div class="login-logo">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="23" stroke="#1E88E5" stroke-width="2"/>
          <path d="M24 14v20M14 24h20" stroke="#1E88E5" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
        <h1>Plantão</h1>
        <p>Sistema de anotações de enfermagem</p>
      </div>

      <!-- Formulário -->
      <div class="card">
        <div class="campo">
          <label>Seu código pessoal</label>
          <input
            v-model="codigo"
            type="text"
            placeholder="Ex: ANA1"
            maxlength="6"
            @input="codigo = codigo.toUpperCase(); verificarCodigo()"
            autocomplete="off"
            autocorrect="off"
            spellcheck="false"
          />
          <p v-if="statusMsg" class="login-status" :class="statusClass">{{ statusMsg }}</p>
        </div>

        <!-- PIN para login -->
        <div v-if="modo === 'login'" class="campo">
          <label>Seu PIN</label>
          <input
            v-model="pin"
            type="password"
            placeholder="••••"
            maxlength="4"
            inputmode="numeric"
            @keyup.enter="entrar"
          />
        </div>

        <!-- PIN + nome para cadastro -->
        <template v-if="modo === 'cadastro'">
          <div class="campo">
            <label>Crie um PIN de 4 dígitos</label>
            <input
              v-model="pin"
              type="password"
              placeholder="••••"
              maxlength="4"
              inputmode="numeric"
            />
            <p class="hint">Anote seu PIN — será pedido em cada acesso.</p>
          </div>
          <div class="campo">
            <label>Seu nome <span class="hint">(opcional)</span></label>
            <input v-model="nome" type="text" placeholder="Ex: Ana Lima" />
          </div>
        </template>

        <p v-if="erroMsg" class="erro-msg">{{ erroMsg }}</p>

        <button
          v-if="modo !== null"
          class="btn btn-primary"
          :disabled="carregando || !podeEntrar"
          @click="entrar"
        >
          {{ carregando ? 'Aguarde...' : modo === 'login' ? 'Entrar' : 'Criar conta e entrar' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const router = useRouter()
const auth   = useAuthStore()

const codigo    = ref('')
const pin       = ref('')
const nome      = ref('')
const modo      = ref(null)      // 'login' | 'cadastro' | null
const statusMsg = ref('')
const statusClass = ref('')
const erroMsg   = ref('')
const carregando = ref(false)

let debounceTimer = null

const podeEntrar = computed(() => {
  return codigo.value.length >= 3 && pin.value.length === 4
})

async function verificarCodigo() {
  erroMsg.value = ''
  if (codigo.value.length < 3) {
    modo.value = null
    statusMsg.value = ''
    return
  }

  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(async () => {
    statusMsg.value = 'Verificando...'
    statusClass.value = 'status-wait'
    try {
      const result = await auth.checkCode(codigo.value)
      if (result.exists) {
        modo.value = 'login'
        statusMsg.value = `✅ Código encontrado. Digite seu PIN.`
        statusClass.value = 'status-ok'
      } else {
        modo.value = 'cadastro'
        statusMsg.value = '✨ Código disponível! Faça seu cadastro.'
        statusClass.value = 'status-new'
      }
    } catch {
      statusMsg.value = 'Erro ao verificar. Verifique sua conexão.'
      statusClass.value = 'status-err'
    }
  }, 500)
}

async function entrar() {
  if (!podeEntrar.value || carregando.value) return
  erroMsg.value = ''
  carregando.value = true

  try {
    let ok = false
    if (modo.value === 'login') {
      ok = await auth.login(codigo.value, pin.value)
      if (!ok) erroMsg.value = 'PIN incorreto.'
    } else {
      ok = await auth.register(codigo.value, pin.value, nome.value)
    }
    if (ok) router.push({ name: 'dashboard' })
  } catch (e) {
    if (e?.code === 'PERMISSION_DENIED' || e?.message?.includes('PERMISSION_DENIED')) {
      erroMsg.value = 'Sem permissão no banco de dados. As regras do Firebase precisam ser atualizadas.'
    } else {
      erroMsg.value = 'Erro de conexão. Tente novamente.'
    }
    console.error('[login] erro:', e)
  } finally {
    carregando.value = false
  }
}
</script>

<style scoped>
.login-screen {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
}

.login-box {
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.login-logo {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.login-logo h1 {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--blue);
}

.login-logo p {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.login-status {
  font-size: 0.85rem;
  margin-top: 6px;
}

.status-ok   { color: var(--success); }
.status-new  { color: var(--blue); }
.status-err  { color: var(--danger); }
.status-wait { color: var(--text-muted); }
</style>
