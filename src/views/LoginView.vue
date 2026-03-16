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
          <p>Exatamente 6 letras/números. Ex: <strong>ANA123</strong>, <strong>JOAO42</strong></p>
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
              <span><strong>Primeira vez?</strong> Escolha um código de exatamente 6 letras/números</span>
            </div>
          </div>
        </transition>

        <div class="campo">
          <input
            data-testid="input-codigo"
            v-model="codigo"
            type="text"
            class="input-grande"
            placeholder="Ex: ANA123"
            maxlength="6"
            autocomplete="off"
            autocorrect="off"
            spellcheck="false"
            @input="codigo = codigo.toUpperCase(); verificarCodigo()"
            @keyup.enter="codigo.length === 6 && modo && avancarPasso()"
          />
          <p class="campo-hint">Exatamente 6 letras ou números · maiúsculas automáticas</p>
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
          :disabled="!modo || carregando || codigo.length < 6"
          @click="avancarPasso"
        >
          Continuar
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </button>

        <!-- Ajuda código esquecido (passo 1) -->
        <div class="ajuda-login" style="margin-top:14px">
          <button  data-testid="auto-btn-loginview-1" class="ajuda-toggle" @click="mostrarAjudaCodigo = !mostrarAjudaCodigo">
            {{ mostrarAjudaCodigo ? '▲' : '▼' }} Não lembra seu código?
          </button>
          <transition name="fade">
            <div v-if="mostrarAjudaCodigo" class="ajuda-conteudo">
              <p>📋 <strong>Esqueceu o código?</strong> Sem ele não é possível recuperar o acesso. Sempre anote seu código após criar sua conta.</p>
            </div>
          </transition>
        </div>
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
          <p v-if="modo === 'cadastro'">6 dígitos numéricos — como um cartão de banco.</p>
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
            <span>Evite PINs óbvios: <strong>123456, 000000, 111111</strong> ou data de nascimento.</span>
          </div>
        </div>

        <div class="campo">
          <div class="pin-wrap">
            <input
              data-testid="input-pin"
              v-model="pin"
              type="password"
              inputmode="numeric"
              maxlength="6"
              placeholder="••••••"
              class="input-pin"
              @keyup.enter="entrar()"
            />
          </div>
        </div>

        <!-- Nome (só cadastro) -->
        <div v-if="modo === 'cadastro'" class="campo" style="margin-top:12px">
          <input
            data-testid="input-nome"
            v-model="nome"
            type="text"
            placeholder="Seu nome (opcional)"
            @keyup.enter="entrar"
          />
        </div>

        <button
          data-testid="btn-continuar-passo2"
          class="btn btn-primary btn-block"
          :disabled="pin.length !== 6 || carregando"
          @click="entrar()"
        >
          {{ modo === 'login' ? (carregando ? 'Entrando...' : 'Entrar') : (carregando ? 'Criando conta...' : 'Criar conta e entrar') }}
        </button>

        <!-- Ajuda PIN esquecido (só no login) -->
        <div v-if="modo === 'login'" class="ajuda-login">
          <button  data-testid="auto-btn-loginview-2" class="ajuda-toggle" @click="mostrarAjuda = !mostrarAjuda">
            {{ mostrarAjuda ? '▲' : '▼' }} Esqueceu o PIN?
          </button>
          <transition name="fade">
            <div v-if="mostrarAjuda" class="ajuda-conteudo">
              <p>🔑 <strong>Esqueceu o PIN?</strong> O administrador pode redefinir seu acesso — suas anotações não serão perdidas.</p>
            </div>
          </transition>
        </div>
      </div>


      <p v-if="erroMsg" class="erro-msg" style="margin-top:12px">{{ erroMsg }}</p>
    </div>

    <button class="btn-como-funciona" @click="helpAberto = true">❓ Como funciona?</button>

    <HelpModal :aberto="helpAberto" @fechar="helpAberto = false" titulo="Como funciona o acesso" :itens="helpItens" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import HelpModal from '../components/HelpModal.vue'

const router = useRouter()
const auth   = useAuthStore()

// Se já está logado (sessão válida no localStorage), vai direto pro dashboard
onMounted(() => {
  if (auth.isLoggedIn) router.replace({ name: 'dashboard' })
})

const codigo    = ref('')
const pin       = ref('')
const nome      = ref('')
const modo      = ref(null)       // 'login' | 'cadastro' | null
const passo     = ref(1)
const statusMsg = ref('')
const statusClass = ref('')
const erroMsg   = ref('')
const carregando   = ref(false)
const mostrarAjuda       = ref(false)
const mostrarAjudaCodigo = ref(false)
const helpAberto         = ref(false)

const helpItens = [
  { icone: '🔑', titulo: 'Código de acesso', desc: 'Escolha um código de exatamente 6 letras ou números. Ele identifica sua conta — use o mesmo em todos os seus dispositivos para sincronizar os dados.' },
  { icone: '🔒', titulo: 'PIN de segurança', desc: 'Senha numérica de 6 dígitos para proteger sua conta. Não há recuperação de PIN — se esquecer, precisará criar uma nova conta com outro código.' },
  { icone: '📱', titulo: 'Múltiplos dispositivos', desc: 'Acesse pelo celular, tablet ou computador usando o mesmo código e PIN. Todos os dados ficam sincronizados automaticamente.' },
  { icone: '⚠️', titulo: 'Segurança do código', desc: 'Quem souber seu código e PIN terá acesso aos seus dados. Use um código difícil de adivinhar e não compartilhe seu PIN.' },
  { icone: '🔄', titulo: 'Sincronização', desc: 'Pacientes, anotações, histórico e organizador ficam salvos na nuvem e acessíveis de qualquer lugar com internet.' },
]

const totalPassos = computed(() => 2)

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
  if (codigo.value.length < 6) {
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

/* ── Como funciona button ── */
.btn-como-funciona {
  background: none; border: none; color: var(--text-muted);
  font-size: 0.82rem; cursor: pointer; padding: 4px 8px;
  border-radius: 8px; font-family: inherit;
}
.btn-como-funciona:hover { color: var(--text); }
.btn-como-funciona:active { background: var(--bg-hover); }
</style>
