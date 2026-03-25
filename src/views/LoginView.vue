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

      <!-- ══ Tela de Login (padrão) ══ -->
      <div v-if="tela === 'login'">
        <div class="card-header">
          <h2>Entrar</h2>
          <p>Use seu email e senha para acessar</p>
        </div>

        <div class="campo">
          <input
            v-model="email"
            type="email"
            placeholder="Email"
            autocomplete="email"
            @keyup.enter="$refs.senhaInput?.focus()"
          />
        </div>

        <div class="campo campo-senha">
          <input
            ref="senhaInput"
            v-model="senha"
            :type="mostrarSenha ? 'text' : 'password'"
            placeholder="Senha"
            autocomplete="current-password"
            @keyup.enter="entrar"
          />
          <button type="button" class="btn-olho" @click="mostrarSenha = !mostrarSenha" tabindex="-1" :aria-label="mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'">
            <svg v-if="!mostrarSenha" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
          </button>
        </div>

        <button
          class="btn btn-primary btn-block"
          :disabled="!emailValido || senha.length < 8 || carregando"
          @click="entrar"
        >
          {{ carregando ? 'Entrando...' : 'Entrar' }}
        </button>

        <div class="separador">
          <span>ou</span>
        </div>

        <button class="btn-google" @click="entrarGoogle" :disabled="carregando">
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Entrar com Google
        </button>

        <div class="links-login">
          <button class="link-btn" @click="tela = 'cadastro'">Criar conta</button>
          <span class="link-sep">·</span>
          <button class="link-btn" @click="tela = 'recuperar'">Esqueci a senha</button>
        </div>

        <div class="links-login" style="margin-top:4px">
          <button class="link-btn link-codigo" @click="tela = 'codigo'">
            Entrar com código
          </button>
        </div>

      </div>

      <!-- ══ Tela de Login com Código ══ -->
      <div v-else-if="tela === 'codigo'">
        <button class="btn-voltar" @click="tela = 'login'">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
          Voltar
        </button>

        <div class="card-header">
          <h2>Entrar com código</h2>
          <p>Use seu código de acesso rápido e senha</p>
        </div>

        <div class="campo">
          <input
            v-model="codigo"
            type="text"
            class="input-codigo"
            placeholder="Seu código (ex: ANA123)"
            maxlength="6"
            autocomplete="off"
            @input="codigo = codigo.toUpperCase()"
            @keyup.enter="$refs.senhaCodigoInput?.focus()"
          />
        </div>

        <div class="campo campo-senha">
          <input
            ref="senhaCodigoInput"
            v-model="senha"
            :type="mostrarSenha ? 'text' : 'password'"
            placeholder="Senha"
            autocomplete="current-password"
            @keyup.enter="entrarComCodigo"
          />
          <button type="button" class="btn-olho" @click="mostrarSenha = !mostrarSenha" tabindex="-1" :aria-label="mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'">
            <svg v-if="!mostrarSenha" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
          </button>
        </div>

        <button
          class="btn btn-primary btn-block"
          :disabled="codigo.length < 4 || senha.length < 8 || carregando"
          @click="entrarComCodigo"
        >
          {{ carregando ? 'Entrando...' : 'Entrar' }}
        </button>
      </div>

      <!-- ══ Tela de Cadastro ══ -->
      <div v-else-if="tela === 'cadastro'">
        <button class="btn-voltar" @click="tela = 'login'">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
          Voltar
        </button>

        <div class="card-header">
          <h2>Criar conta</h2>
          <p>Seu código de sincronização será gerado automaticamente</p>
        </div>

        <div class="campo">
          <input v-model="nome" type="text" placeholder="Seu nome" autocomplete="name" />
        </div>

        <div class="campo">
          <input v-model="email" type="email" placeholder="Email" autocomplete="email" />
        </div>

        <div class="campo campo-senha">
          <input v-model="senha" :type="mostrarSenha ? 'text' : 'password'" placeholder="Senha (mín. 8 caracteres)" autocomplete="new-password" />
          <button type="button" class="btn-olho" @click="mostrarSenha = !mostrarSenha" tabindex="-1" :aria-label="mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'">
            <svg v-if="!mostrarSenha" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
          </button>
        </div>

        <div class="campo campo-senha">
          <input v-model="senhaConfirm" :type="mostrarSenhaConfirm ? 'text' : 'password'" placeholder="Confirmar senha" autocomplete="new-password" @keyup.enter="criarConta" />
          <button type="button" class="btn-olho" @click="mostrarSenhaConfirm = !mostrarSenhaConfirm" tabindex="-1" :aria-label="mostrarSenhaConfirm ? 'Ocultar senha' : 'Mostrar senha'">
            <svg v-if="!mostrarSenhaConfirm" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
          </button>
        </div>

        <button
          class="btn btn-primary btn-block"
          :disabled="!emailValido || senha.length < 8 || senha !== senhaConfirm || carregando"
          @click="criarConta"
        >
          {{ carregando ? 'Criando conta...' : 'Criar conta' }}
        </button>

        <div class="separador"><span>ou</span></div>

        <button class="btn-google" @click="entrarGoogle" :disabled="carregando">
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Cadastrar com Google
        </button>

        <p class="texto-termos">
          Ao criar conta, você concorda com os
          <a href="/termos" target="_blank">Termos de Serviço</a>
          e a
          <a href="/privacidade" target="_blank">Política de Privacidade</a>.
        </p>
      </div>

      <!-- ══ Tela de Recuperar Senha ══ -->
      <div v-else-if="tela === 'recuperar'">
        <button class="btn-voltar" @click="tela = 'login'">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
          Voltar
        </button>

        <div class="card-header">
          <h2>Recuperar senha</h2>
          <p>Digite seu email para receber o link de redefinição</p>
        </div>

        <div class="campo">
          <input v-model="email" type="email" placeholder="Email" autocomplete="email" @keyup.enter="recuperar" />
        </div>

        <button
          class="btn btn-primary btn-block"
          :disabled="!emailValido || carregando"
          @click="recuperar"
        >
          {{ carregando ? 'Enviando...' : 'Enviar link' }}
        </button>

        <transition name="fade">
          <div v-if="recuperacaoEnviada" class="destaque-sucesso">
            <span>✉️</span>
            <div>
              <strong>Email enviado!</strong>
              <p>Verifique sua caixa de entrada e spam.</p>
            </div>
          </div>
        </transition>
      </div>

      <!-- ══ Tela de Lista de Espera ══ -->
      <div v-else-if="tela === 'lista-espera'" class="lista-espera-wrap">
        <div class="lista-espera-icon">🔒</div>
        <h2 class="lista-espera-titulo">Vagas esgotadas</h2>
        <p class="lista-espera-desc">
          O Plantão está em lançamento limitado com <strong>100 vagas gratuitas</strong> e todas foram preenchidas.
        </p>
        <p class="lista-espera-desc">
          Para entrar na lista de espera e ser avisado quando abrirmos novas vagas, entre em contato:
        </p>
        <a href="mailto:contato@plantao.net" class="lista-espera-email">
          ✉️ contato@plantao.net
        </a>
        <p class="lista-espera-hint">Respondo pessoalmente a todos os emails.</p>
        <button class="btn btn-secondary btn-block" style="margin-top:16px" @click="tela = 'login'">Voltar ao login</button>
      </div>

      <!-- Erro global -->
      <p v-if="auth.authError && auth.authError !== 'limite-atingido'" class="erro-msg" style="margin-top:12px">{{ auth.authError }}</p>
    </div>

    <!-- Aviso modo privado -->
    <transition name="fade">
      <div v-if="auth.modoPrivado" class="aviso-privado">
        <span>🔒</span>
        <span>Modo privado — sua sessão <strong>não será salva</strong> ao fechar o app</span>
      </div>
    </transition>

    <!-- Aviso iOS: ícone pode sumir após atualização do iOS -->
    <transition name="fade">
      <div v-if="isIosNaoBrowser" class="aviso-ios">
        <span>🍎</span>
        <span>No iPhone, o ícone pode sumir após atualizar o iOS. Se acontecer, abra o Safari, acesse <strong>plantao.net</strong> e adicione à tela inicial novamente. Seus dados ficam salvos.</span>
      </div>
    </transition>

    <div class="login-footer-btns">
      <button class="btn-como-funciona" @click="helpAberto = true">❓ Como funciona?</button>
      <button class="btn-como-funciona" @click="() => location.reload()">🔄 Verificar atualizações</button>
    </div>

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

// Aviso iOS: mostra só em iPhone/iPad fora do modo standalone (não instalado)
const isIosNaoBrowser = /iphone|ipad|ipod/i.test(navigator.userAgent) &&
  !window.navigator.standalone

onMounted(async () => {
  // Processar resultado do Google Redirect
  await auth.handleRedirectResult()
  if (auth.isLoggedIn) router.replace({ name: 'dashboard' })
})

const tela = ref('login') // 'login' | 'cadastro' | 'codigo' | 'recuperar'

const email = ref('')
const senha = ref('')
const senhaConfirm = ref('')
const nome = ref('')
const codigo = ref('')
const carregando = ref(false)
const recuperacaoEnviada = ref(false)
const helpAberto = ref(false)
const mostrarSenha = ref(false)
const mostrarSenhaConfirm = ref(false)

const emailValido = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value))

const helpItens = [
  { icone: '✉️', titulo: 'Email e senha', desc: 'Crie sua conta com email e senha. Mais seguro e com recuperação de senha por email.' },
  { icone: '🔑', titulo: 'Login com Google', desc: 'Faça login com sua conta Google — rápido e sem precisar criar senha.' },
  { icone: '📱', titulo: 'Múltiplos dispositivos', desc: 'Acesse pelo celular, tablet ou computador com o mesmo email. Todos os dados ficam sincronizados.' },
  { icone: '🔒', titulo: 'Segurança', desc: 'Seus dados são protegidos por autenticação Firebase. Só você pode acessar suas anotações.' },
]

async function entrar() {
  if (carregando.value) return
  carregando.value = true
  auth.authError = ''
  const ok = await auth.login(email.value, senha.value)
  if (ok) router.push({ name: 'dashboard' })
  carregando.value = false
}

async function criarConta() {
  if (carregando.value) return
  if (senha.value !== senhaConfirm.value) {
    auth.authError = 'As senhas não conferem.'
    return
  }
  carregando.value = true
  auth.authError = ''
  const ok = await auth.register(email.value, senha.value, nome.value)
  if (ok) router.push({ name: 'dashboard' })
  else if (auth.authError === 'limite-atingido') tela.value = 'lista-espera'
  carregando.value = false
}

async function entrarGoogle() {
  if (carregando.value) return
  carregando.value = true
  auth.authError = ''
  const ok = await auth.loginGoogle()
  if (ok) router.push({ name: 'dashboard' })
  else if (auth.authError === 'limite-atingido') tela.value = 'lista-espera'
  carregando.value = false
}

async function entrarComCodigo() {
  if (carregando.value) return
  carregando.value = true
  auth.authError = ''

  try {
    // 1. Resolver código → email via API serverless
    const res = await fetch('/api/resolve-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ syncCode: codigo.value }),
    })

    const data = await res.json()
    if (!res.ok || !data.email) {
      auth.authError = data.error || 'Código não encontrado.'
      carregando.value = false
      return
    }

    // 2. Login com email + senha
    const ok = await auth.login(data.email, senha.value)
    if (ok) router.push({ name: 'dashboard' })
  } catch {
    auth.authError = 'Sem conexão com o servidor.'
  } finally {
    carregando.value = false
  }
}

async function recuperar() {
  if (carregando.value) return
  carregando.value = true
  auth.authError = ''
  const ok = await auth.recuperarSenha(email.value)
  if (ok) recuperacaoEnviada.value = true
  carregando.value = false
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

/* ── Campos ── */
.campo {
  margin-bottom: 12px;
}

.campo-senha {
  position: relative;
}
.campo-senha input {
  padding-right: 44px;
}
.btn-olho {
  position: absolute;
  right: 1px;
  top: 1px;
  bottom: 1px;
  width: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: var(--text-dim);
  cursor: pointer;
  border-radius: 0 10px 10px 0;
}
.btn-olho:active { color: var(--text); }

.campo input {
  width: 100%;
  padding: 12px 14px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 10px;
  color: var(--text);
  font-size: 0.95rem;
  font-family: inherit;
  outline: none;
  transition: border-color 0.15s;
}

.campo input:focus {
  border-color: var(--blue);
}

.campo input::placeholder {
  color: var(--text-dim);
}

.input-grande {
  font-size: 1.4rem !important;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-align: center;
  text-transform: uppercase;
}

/* ── Botões ── */
.btn-block {
  width: 100%;
  margin-top: 4px;
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
  font-family: inherit;
}
.btn-voltar:hover { color: var(--text); }

.btn-google {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 10px;
  color: var(--text);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
}
.btn-google:hover { background: var(--bg-hover); }
.btn-google:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── Separador ── */
.separador {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 16px 0;
}
.separador::before,
.separador::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border);
}
.separador span {
  font-size: 0.8rem;
  color: var(--text-dim);
}

/* ── Links ── */
.links-login {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
}
.link-btn {
  background: none;
  border: none;
  color: var(--blue);
  font-size: 0.85rem;
  cursor: pointer;
  padding: 0;
  font-family: inherit;
}
.link-btn:hover { text-decoration: underline; }
.link-sep { color: var(--text-dim); font-size: 0.8rem; }
.link-codigo { color: var(--text-muted); font-size: 0.8rem; }

.input-codigo {
  font-size: 1.4rem !important;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-align: center;
  text-transform: uppercase;
}

/* ── Destaques ── */
.destaque-info {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  margin-bottom: 16px;
  background: rgba(41, 98, 255, 0.08);
  border: 1px solid rgba(41, 98, 255, 0.2);
}
.destaque-info strong {
  font-size: 0.9rem;
  display: block;
  color: var(--text);
  margin-bottom: 2px;
}
.destaque-info p {
  font-size: 0.82rem;
  color: var(--text-muted);
  margin: 0;
}

.destaque-sucesso {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  margin-top: 16px;
  background: rgba(67, 160, 71, 0.08);
  border: 1px solid rgba(67, 160, 71, 0.2);
}
.destaque-sucesso strong {
  font-size: 0.9rem;
  display: block;
  color: var(--text);
  margin-bottom: 2px;
}
.destaque-sucesso p {
  font-size: 0.82rem;
  color: var(--text-muted);
  margin: 0;
}

/* ── Transition ── */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s, transform 0.2s; }
.fade-enter-from { opacity: 0; transform: translateY(4px); }
.fade-leave-to   { opacity: 0; transform: translateY(-4px); }

/* ── Aviso modo privado ── */
.aviso-privado {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  color: var(--text-muted);
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 9px 14px;
  max-width: 380px;
  width: 100%;
}
.aviso-privado strong { color: var(--text); }

/* ── Aviso iOS ── */
.aviso-ios {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 0.8rem;
  color: var(--text-muted);
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 9px 14px;
  max-width: 380px;
  width: 100%;
}
.aviso-ios strong { color: var(--text); }

/* ── Footer buttons ── */
.login-footer-btns {
  display: flex;
  justify-content: center;
  gap: 8px;
  max-width: 380px;
  width: 100%;
}
.btn-como-funciona {
  background: none; border: none; color: var(--text-muted);
  font-size: 0.82rem; cursor: pointer; padding: 4px 8px;
  border-radius: 8px; font-family: inherit;
}
.btn-como-funciona:hover { color: var(--text); }
.btn-como-funciona:active { background: var(--bg-hover); }

/* ── Texto termos ── */
.texto-termos {
  font-size: 0.75rem;
  color: var(--text-dim);
  text-align: center;
  margin-top: 14px;
  line-height: 1.5;
}
.texto-termos a {
  color: var(--text-muted);
  text-decoration: underline;
}
.texto-termos a:hover { color: var(--text); }

/* ── Erro ── */
.erro-msg {
  color: var(--danger);
  font-size: 0.85rem;
  text-align: center;
}
.lista-espera-wrap {
  text-align: center;
  padding: 8px 0 4px;
}
.lista-espera-icon {
  font-size: 2.5rem;
  margin-bottom: 12px;
}
.lista-espera-titulo {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 12px;
}
.lista-espera-desc {
  font-size: 0.9rem;
  color: var(--text-muted);
  margin-bottom: 10px;
  line-height: 1.5;
}
.lista-espera-email {
  display: inline-block;
  font-size: 1rem;
  font-weight: 600;
  color: var(--blue);
  text-decoration: none;
  margin: 8px 0 4px;
}
.lista-espera-hint {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-top: 4px;
}
</style>
