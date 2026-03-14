<template>
  <div class="login-screen">

    <!-- Hero -->
    <div class="hero">
      <div class="hero-icon">
        <svg width="38" height="38" viewBox="0 0 48 48" fill="none">
          <rect x="8" y="4" width="32" height="40" rx="4" fill="#1B3B6F"/>
          <rect x="8" y="4" width="8" height="40" rx="2" fill="#2962FF"/>
          <circle cx="12" cy="13" r="2" fill="white"/>
          <circle cx="12" cy="21" r="2" fill="white"/>
          <circle cx="12" cy="29" r="2" fill="white"/>
          <circle cx="12" cy="37" r="2" fill="white"/>
          <rect x="20" y="16" width="16" height="2" rx="1" fill="#B0C4DE"/>
          <rect x="20" y="22" width="12" height="2" rx="1" fill="#B0C4DE"/>
          <rect x="20" y="28" width="14" height="2" rx="1" fill="#B0C4DE"/>
          <rect x="20" y="34" width="10" height="2" rx="1" fill="#B0C4DE"/>
        </svg>
      </div>
      <h1>Plantão</h1>
      <p>Anotações de enfermagem</p>
    </div>

    <!-- Card principal -->
    <div class="login-card">

      <!-- Passo 1: Código -->
      <div v-if="passo === 1">
        <div class="card-header">
          <span class="card-step">1 de {{ totalPassos }}</span>
          <h2>Seu código pessoal</h2>
          <p>Suas iniciais + um número. Ex: <strong>ANA1</strong>, <strong>JOAO2</strong></p>
        </div>

        <!-- Instruções rápidas (antes de digitar) -->
        <transition name="fade">
          <div v-if="!modo" class="instrucoes-rapidas">
            <div class="instrucao-item">
              <span>🔄</span>
              <span><strong>Já tem conta?</strong> Digite seu código abaixo</span>
            </div>
            <div class="instrucao-item">
              <span>✨</span>
              <span><strong>Primeira vez?</strong> Escolha um código de 3 a 6 letras/números</span>
            </div>
          </div>
        </transition>

        <div class="campo">
          <input
            data-testid="input-codigo"
            v-model="codigo"
            type="text"
            class="input-grande"
            placeholder="Ex: ANA1"
            maxlength="6"
            autocomplete="off"
            autocorrect="off"
            spellcheck="false"
            @input="codigo = codigo.toUpperCase(); verificarCodigo()"
            @keyup.enter="codigo.length >= 3 && modo && avancarPasso()"
          />
          <p class="campo-hint">3 a 6 letras ou números · maiúsculas automáticas</p>
          <transition name="fade">
            <p v-if="statusMsg" class="status-msg" :class="statusClass">{{ statusMsg }}</p>
          </transition>
        </div>

        <transition name="fade">
          <div v-if="modo === 'cadastro'" class="destaque-novo" data-testid="msg-cadastro">
            <span class="destaque-icon">✨</span>
            <div>
              <strong>Código disponível — primeira vez aqui!</strong>
              <p>Você vai criar seu acesso agora. Anote o código em lugar seguro.</p>
            </div>
          </div>
          <div v-else-if="modo === 'login'" class="destaque-volta" data-testid="msg-login">
            <span class="destaque-icon">👋</span>
            <div>
              <strong>Bem-vindo de volta!</strong>
              <p>Código encontrado. Vamos ao PIN.</p>
            </div>
          </div>
        </transition>

        <button
          data-testid="btn-continuar-passo1"
          class="btn btn-primary btn-block"
          :disabled="!modo || carregando"
          @click="avancarPasso"
        >
          Continuar
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>

      <!-- Passo 2: PIN -->
      <div v-else-if="passo === 2">
        <button class="btn-voltar" data-testid="btn-voltar-passo2" @click="voltarPasso">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
          Voltar
        </button>

        <div class="card-header">
          <span class="card-step" data-testid="step-indicador">2 de {{ totalPassos }}</span>
          <h2 data-testid="titulo-passo2">{{ modo === 'cadastro' ? 'Crie seu PIN' : 'Digite seu PIN' }}</h2>
          <p v-if="modo === 'cadastro'">4 dígitos numéricos.</p>
          <p v-else>Bem-vindo de volta, <strong>{{ codigo }}</strong>.</p>
        </div>

        <!-- Aviso forte de cadastro -->
        <div v-if="modo === 'cadastro'" class="aviso-pin">
          <div class="aviso-pin-linha">
            <span>📌</span>
            <span><strong>Anote seu PIN agora</strong> — ele será pedido a cada acesso e não pode ser recuperado sem o administrador.</span>
          </div>
          <div class="aviso-pin-linha aviso-pin-perigo">
            <span>⚠️</span>
            <span>Evite PINs óbvios: <strong>1234, 0000, 1111</strong> ou data de nascimento.</span>
          </div>
        </div>

        <div class="campo">
          <div class="pin-wrap">
            <input
              data-testid="input-pin"
              v-model="pin"
              type="password"
              inputmode="numeric"
              maxlength="4"
              placeholder="••••"
              class="input-pin"
              @keyup.enter="totalPassos === 2 ? entrar() : avancarPasso()"
            />
          </div>
        </div>

        <button
          data-testid="btn-continuar-passo2"
          class="btn btn-primary btn-block"
          :disabled="pin.length !== 4 || carregando"
          @click="totalPassos === 2 ? entrar() : avancarPasso()"
        >
          {{ modo === 'login' ? (carregando ? 'Entrando...' : 'Entrar') : 'Continuar' }}
          <svg v-if="modo !== 'login'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </button>

        <!-- Ajuda para quem esqueceu (só no login) -->
        <div v-if="modo === 'login'" class="ajuda-login">
          <button class="ajuda-toggle" @click="mostrarAjuda = !mostrarAjuda">
            {{ mostrarAjuda ? '▲' : '▼' }} Problemas para entrar?
          </button>
          <transition name="fade">
            <div v-if="mostrarAjuda" class="ajuda-conteudo">
              <p>🔑 <strong>Esqueceu o PIN?</strong> O administrador pode redefinir seu acesso — suas anotações não serão perdidas.</p>
              <p>📋 <strong>Esqueceu o código?</strong> Sem o código não é possível recuperar o acesso. Sempre anote-o após criar sua conta.</p>
            </div>
          </transition>
        </div>
      </div>

      <!-- Passo 3: Nome (só cadastro) -->
      <div v-else-if="passo === 3">
        <button class="btn-voltar" data-testid="btn-voltar-passo3" @click="voltarPasso">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
          Voltar
        </button>

        <div class="card-header">
          <span class="card-step" data-testid="step-indicador">3 de 3</span>
          <h2 data-testid="titulo-passo3">Seu nome</h2>
          <p>Opcional — aparece no topo do app.</p>
        </div>

        <div class="campo">
          <input
            data-testid="input-nome"
            v-model="nome"
            type="text"
            placeholder="Ex: Ana Lima"
            @keyup.enter="entrar"
          />
        </div>

        <button
          data-testid="btn-entrar"
          class="btn btn-primary btn-block"
          :disabled="carregando"
          @click="entrar"
        >
          {{ carregando ? 'Criando conta...' : 'Criar conta e entrar' }}
        </button>
      </div>

      <p v-if="erroMsg" class="erro-msg" style="margin-top:12px">{{ erroMsg }}</p>
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
const modo      = ref(null)       // 'login' | 'cadastro' | null
const passo     = ref(1)
const statusMsg = ref('')
const statusClass = ref('')
const erroMsg   = ref('')
const carregando   = ref(false)
const mostrarAjuda = ref(false)

const totalPassos = computed(() => modo.value === 'cadastro' ? 3 : 2)

let debounceTimer = null

function avancarPasso() {
  erroMsg.value = ''
  passo.value++
}

function voltarPasso() {
  erroMsg.value = ''
  passo.value--
}

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
        statusMsg.value = ''
        statusClass.value = 'status-ok'
      } else {
        modo.value = 'cadastro'
        statusMsg.value = ''
        statusClass.value = 'status-new'
      }
    } catch {
      modo.value = null
      statusMsg.value = 'Erro ao verificar. Verifique sua conexão.'
      statusClass.value = 'status-err'
    }
  }, 500)
}

async function entrar() {
  if (carregando.value) return
  erroMsg.value = ''
  carregando.value = true

  try {
    let ok = false
    if (modo.value === 'login') {
      ok = await auth.login(codigo.value, pin.value)
      if (!ok) erroMsg.value = 'PIN incorreto. Tente novamente.'
    } else {
      ok = await auth.register(codigo.value, pin.value, nome.value)
    }
    if (ok) router.push({ name: 'dashboard' })
  } catch (e) {
    if (e?.code === 'PERMISSION_DENIED' || e?.message?.includes('PERMISSION_DENIED')) {
      erroMsg.value = 'Sem permissão no banco de dados.'
    } else {
      erroMsg.value = 'Erro de conexão. Tente novamente.'
    }
  } finally {
    carregando.value = false
  }
}
</script>

<style scoped>
.login-screen {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  gap: 28px;
}

/* ── Hero ── */
.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-align: center;
}

.hero-icon {
  width: 72px;
  height: 72px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero h1 {
  font-size: 1.9rem;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -0.02em;
}

.hero p {
  color: var(--text-muted);
  font-size: 0.9rem;
}

/* ── Card ── */
.login-card {
  width: 100%;
  max-width: 380px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 28px 24px;
}

/* ── Card header ── */
.card-step {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--blue);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.card-header {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.card-header h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text);
  margin: 0;
}

.card-header p {
  font-size: 0.87rem;
  color: var(--text-muted);
  margin: 0;
}

.card-header p strong {
  color: var(--text);
}

/* ── Input grande ── */
.input-grande {
  font-size: 1.4rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-align: center;
  text-transform: uppercase;
}

.input-pin {
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: 0.3em;
  text-align: center;
  width: 100%;
}

.pin-wrap {
  display: flex;
  justify-content: center;
}

/* ── Status ── */
.status-msg {
  font-size: 0.83rem;
  margin-top: 6px;
  text-align: center;
}
.status-ok   { color: var(--success); }
.status-new  { color: var(--blue); }
.status-err  { color: var(--danger); }
.status-wait { color: var(--text-muted); }

/* ── Destaques ── */
.destaque-novo,
.destaque-volta {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  margin-bottom: 16px;
}

.destaque-novo {
  background: rgba(41, 98, 255, 0.08);
  border: 1px solid rgba(41, 98, 255, 0.2);
}

.destaque-volta {
  background: rgba(67, 160, 71, 0.08);
  border: 1px solid rgba(67, 160, 71, 0.2);
}

.destaque-icon {
  font-size: 1.2rem;
  line-height: 1.4;
}

.destaque-novo strong,
.destaque-volta strong {
  font-size: 0.9rem;
  display: block;
  color: var(--text);
  margin-bottom: 2px;
}

.destaque-novo p,
.destaque-volta p {
  font-size: 0.82rem;
  color: var(--text-muted);
  margin: 0;
}

/* ── Botões ── */
.btn-block {
  width: 100%;
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.btn-voltar {
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 0.85rem;
  cursor: pointer;
  padding: 0;
  margin-bottom: 16px;
}

.btn-voltar:hover {
  color: var(--text);
}

/* ── Instruções rápidas (passo 1 antes de digitar) ── */
.instrucoes-rapidas {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
  padding: 12px 14px;
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--border);
  border-radius: 12px;
}

.instrucao-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 0.85rem;
  color: var(--text-muted);
  line-height: 1.4;
}

.instrucao-item strong {
  color: var(--text);
}

/* ── Hint do campo ── */
.campo-hint {
  font-size: 0.78rem;
  color: var(--text-muted);
  margin: 4px 0 0;
  text-align: center;
}

/* ── Aviso PIN (cadastro) ── */
.aviso-pin {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 14px;
  background: rgba(255, 193, 7, 0.07);
  border: 1px solid rgba(255, 193, 7, 0.25);
  border-radius: 12px;
  margin-bottom: 16px;
}

.aviso-pin-linha {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 0.83rem;
  color: var(--text-muted);
  line-height: 1.45;
}

.aviso-pin-linha strong {
  color: var(--text);
}

.aviso-pin-perigo {
  color: #e57373;
}

.aviso-pin-perigo strong {
  color: #ef9a9a;
}

/* ── Ajuda login ── */
.ajuda-login {
  margin-top: 16px;
  border-top: 1px solid var(--border);
  padding-top: 12px;
}

.ajuda-toggle {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 0.82rem;
  cursor: pointer;
  padding: 0;
  width: 100%;
  text-align: center;
}

.ajuda-toggle:hover {
  color: var(--text);
}

.ajuda-conteudo {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ajuda-conteudo p {
  font-size: 0.82rem;
  color: var(--text-muted);
  margin: 0;
  line-height: 1.5;
}

.ajuda-conteudo p strong {
  color: var(--text);
}

/* ── Transition ── */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s, transform 0.2s; }
.fade-enter-from { opacity: 0; transform: translateY(4px); }
.fade-leave-to   { opacity: 0; transform: translateY(-4px); }
</style>
