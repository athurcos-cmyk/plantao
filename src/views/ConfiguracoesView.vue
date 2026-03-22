<template>
  <div class="screen">
    <header class="app-header">
      <button class="btn-voltar" @click="router.push({ name: 'dashboard' })">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <h1 class="header-titulo">Configurações</h1>
      <div style="width:34px"></div>
    </header>

    <main class="container" style="padding-top:20px;padding-bottom:60px">

      <!-- Perfil -->
      <section class="config-section">
        <h2 class="config-section-titulo">Perfil</h2>

        <div class="config-item">
          <span class="config-label">Nome</span>
          <span class="config-valor">{{ auth.userName || '—' }}</span>
        </div>

        <div class="config-item">
          <span class="config-label">Email</span>
          <span class="config-valor">{{ auth.userEmail || '—' }}</span>
        </div>

        <div class="config-item">
          <span class="config-label">Código de acesso rápido</span>
          <div class="config-code-row">
            <span class="config-code">{{ auth.syncCode }}</span>
            <button class="btn-copiar" @click="copiarCodigo">
              {{ copiou ? '✓' : 'Copiar' }}
            </button>
          </div>
        </div>

        <p class="config-dica">
          Use seu código + senha para entrar mais rápido em computadores compartilhados.
        </p>
      </section>

      <!-- Senha (para quem logou com Google) -->
      <section v-if="!temSenha" class="config-section">
        <h2 class="config-section-titulo">Criar senha</h2>
        <p class="config-sub">Você entrou com Google. Crie uma senha para usar o login com código.</p>

        <div class="campo">
          <input v-model="novaSenha" type="password" placeholder="Nova senha (mín. 8 caracteres)" autocomplete="new-password" />
        </div>
        <div class="campo">
          <input v-model="novaSenhaConfirm" type="password" placeholder="Confirmar senha" autocomplete="new-password" />
        </div>

        <button
          class="btn btn-primary btn-block"
          :disabled="novaSenha.length < 8 || novaSenha !== novaSenhaConfirm || salvandoSenha"
          @click="criarSenha"
        >
          {{ salvandoSenha ? 'Salvando...' : 'Criar senha' }}
        </button>
      </section>

      <!-- Vincular Google (para quem criou com email) -->
      <section v-if="!temGoogle" class="config-section">
        <h2 class="config-section-titulo">Vincular conta Google</h2>
        <p class="config-sub">Vincule sua conta Google para poder entrar com um toque, sem digitar email e senha.</p>
        <button
          class="btn btn-secondary btn-block"
          :disabled="vinculandoGoogle"
          @click="vincularGoogle"
        >
          <span v-if="vinculandoGoogle">Vinculando...</span>
          <span v-else>🔗 Vincular com Google</span>
        </button>
      </section>

      <!-- Alterar nome -->
      <section class="config-section">
        <h2 class="config-section-titulo">Alterar nome</h2>

        <div class="campo">
          <input v-model="novoNome" type="text" placeholder="Novo nome" maxlength="80" />
        </div>

        <button
          class="btn btn-primary btn-block"
          :disabled="!novoNome.trim() || novoNome.trim() === auth.userName || salvandoNome"
          @click="alterarNome"
        >
          {{ salvandoNome ? 'Salvando...' : 'Salvar nome' }}
        </button>
      </section>

      <!-- Sair -->
      <section class="config-section">
        <button class="btn btn-ghost btn-block" @click="sair">
          Sair da conta
        </button>
      </section>

      <!-- Zona de perigo -->
      <section class="config-section config-danger">
        <h2 class="config-section-titulo danger-titulo">Zona de perigo</h2>
        <p class="config-sub">
          Esta ação é irreversível. Todos os seus dados serão apagados permanentemente: anotações, pacientes, pendências, modelos e configurações.
        </p>

        <button
          class="btn btn-danger btn-block"
          :disabled="deletando"
          @click="confirmarDelete"
        >
          {{ deletando ? 'Deletando...' : 'Deletar minha conta' }}
        </button>
      </section>

      <!-- Erro global -->
      <p v-if="erro" class="erro-msg" style="margin-top:12px">{{ erro }}</p>
      <p v-if="sucesso" class="sucesso-msg" style="margin-top:12px">{{ sucesso }}</p>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { auth as firebaseAuth, db } from '../firebase.js'
import { ref as dbRef, remove, set } from 'firebase/database'
import {
  updateProfile,
  EmailAuthProvider,
  linkWithCredential,
  linkWithPopup,
  deleteUser,
} from 'firebase/auth'
import { googleProvider } from '../firebase.js'

const router = useRouter()
const auth = useAuthStore()

const copiou = ref(false)
const erro = ref('')
const sucesso = ref('')

// Providers vinculados
const temSenha = ref(true)
const temGoogle = ref(false)
const vinculandoGoogle = ref(false)

// Senha para Google users
const novaSenha = ref('')
const novaSenhaConfirm = ref('')
const salvandoSenha = ref(false)

// Nome
const novoNome = ref('')
const salvandoNome = ref(false)

// Delete
const deletando = ref(false)

onMounted(() => {
  novoNome.value = auth.userName || ''

  const user = firebaseAuth.currentUser
  if (user) {
    const providers = user.providerData.map(p => p.providerId)
    temSenha.value = providers.includes('password')
    temGoogle.value = providers.includes('google.com')
  }
})

async function copiarCodigo() {
  try {
    await navigator.clipboard.writeText(auth.syncCode)
    copiou.value = true
    setTimeout(() => { copiou.value = false }, 2000)
  } catch {
    // fallback
    const ta = document.createElement('textarea')
    ta.value = auth.syncCode
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    copiou.value = true
    setTimeout(() => { copiou.value = false }, 2000)
  }
}

async function criarSenha() {
  if (salvandoSenha.value) return
  erro.value = ''
  sucesso.value = ''
  salvandoSenha.value = true

  try {
    const user = firebaseAuth.currentUser
    const credential = EmailAuthProvider.credential(user.email, novaSenha.value)
    await linkWithCredential(user, credential)
    temSenha.value = true
    novaSenha.value = ''
    novaSenhaConfirm.value = ''
    sucesso.value = 'Senha criada! Agora você pode entrar com código + senha.'
  } catch (e) {
    if (e.code === 'auth/requires-recent-login') {
      erro.value = 'Faça login novamente antes de criar a senha.'
    } else if (e.code === 'auth/provider-already-linked') {
      temSenha.value = true
      sucesso.value = 'Você já tem uma senha cadastrada.'
    } else {
      erro.value = 'Erro ao criar senha. Tente novamente.'
    }
  } finally {
    salvandoSenha.value = false
  }
}

async function vincularGoogle() {
  if (vinculandoGoogle.value) return
  erro.value = ''
  sucesso.value = ''
  vinculandoGoogle.value = true
  try {
    const user = firebaseAuth.currentUser
    await linkWithPopup(user, googleProvider)
    temGoogle.value = true
    sucesso.value = 'Conta Google vinculada! Agora você pode entrar com Google também.'
  } catch (e) {
    if (e.code === 'auth/credential-already-in-use') {
      erro.value = 'Esta conta Google já está vinculada a outro usuário.'
    } else if (e.code === 'auth/popup-closed-by-user' || e.code === 'auth/cancelled-popup-request') {
      // cancelou, não exibe erro
    } else if (e.code === 'auth/requires-recent-login') {
      erro.value = 'Faça login novamente antes de vincular.'
    } else {
      erro.value = 'Erro ao vincular conta Google. Tente novamente.'
    }
  } finally {
    vinculandoGoogle.value = false
  }
}

async function alterarNome() {
  if (salvandoNome.value) return
  erro.value = ''
  sucesso.value = ''
  salvandoNome.value = true

  try {
    const nome = novoNome.value.trim()
    const user = firebaseAuth.currentUser

    // Atualizar no Firebase Auth
    await updateProfile(user, { displayName: nome })

    // Atualizar no Realtime DB
    await set(dbRef(db, `usuarios/${auth.syncCode}/nome`), nome)

    // Atualizar estado local
    auth.userName = nome
    try { localStorage.setItem('user_name', nome) } catch {}

    sucesso.value = 'Nome atualizado!'
  } catch {
    erro.value = 'Erro ao atualizar nome.'
  } finally {
    salvandoNome.value = false
  }
}

function sair() {
  if (confirm('Deseja sair da sua conta?')) {
    auth.logout()
    router.push({ name: 'login' })
  }
}

async function confirmarDelete() {
  const msg = `Tem certeza? TODOS os dados serão apagados:\n\n` +
    `• Anotações e histórico\n` +
    `• Pacientes e pendências\n` +
    `• Modelos e organizador\n` +
    `• Configurações e notificações\n\n` +
    `Esta ação NÃO pode ser desfeita.`

  if (!confirm(msg)) return

  // Segunda confirmação
  const code = prompt(`Para confirmar, digite seu código: ${auth.syncCode}`)
  if (code !== auth.syncCode) {
    erro.value = 'Código incorreto. Conta não deletada.'
    return
  }

  deletando.value = true
  erro.value = ''

  try {
    const syncCode = auth.syncCode
    const user = firebaseAuth.currentUser
    const uid = user.uid

    // 1. Deletar dados do Firebase Realtime DB
    const paths = [
      `usuarios/${syncCode}`,
      `anotacoes/${syncCode}`,
      `anotacoes_hc/${syncCode}`,
      `pacientes/${syncCode}`,
      `organizador/${syncCode}`,
      `encaminhamento/${syncCode}`,
      `livres/${syncCode}`,
      `curativo/${syncCode}`,
      `fcm_tokens/${syncCode}`,
      `notificacoes_agendadas/${syncCode}`,
      `configuracoes/${syncCode}`,
      `feedback/${syncCode}`,
      `owners/${syncCode}`,
      `uid_map/${uid}`,
    ]

    await Promise.all(paths.map(p => remove(dbRef(db, p)).catch(() => {})))

    // 2. Limpar localStorage
    try { localStorage.clear() } catch {}

    // 3. Deletar conta do Firebase Auth
    await deleteUser(user)

    // 4. Redirecionar
    router.push({ name: 'login' })
  } catch (e) {
    if (e.code === 'auth/requires-recent-login') {
      erro.value = 'Faça login novamente antes de deletar a conta.'
    } else {
      erro.value = 'Erro ao deletar conta. Tente novamente.'
      console.error('[CONFIG] delete error:', e)
    }
  } finally {
    deletando.value = false
  }
}
</script>

<style scoped>
.btn-voltar {
  background: none;
  border: none;
  color: var(--text-dim);
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
  display: flex;
  align-items: center;
}
.btn-voltar:active { background: var(--bg-hover); }

.header-titulo {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text);
}

.config-section {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 14px;
}

.config-section-titulo {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 12px;
}

.config-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid var(--border);
}
.config-item:last-of-type { border-bottom: none; }

.config-label {
  font-size: 0.88rem;
  color: var(--text-muted);
}

.config-valor {
  font-size: 0.88rem;
  color: var(--text);
  font-weight: 600;
}

.config-code-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.config-code {
  font-size: 1.1rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  color: var(--blue);
  font-family: monospace;
}

.btn-copiar {
  background: rgba(41, 98, 255, 0.1);
  border: 1px solid var(--blue);
  color: var(--blue);
  font-size: 0.75rem;
  font-weight: 700;
  border-radius: 6px;
  padding: 4px 10px;
  cursor: pointer;
  font-family: inherit;
}

.config-dica {
  font-size: 0.78rem;
  color: var(--text-dim);
  margin-top: 10px;
  line-height: 1.4;
}

.config-sub {
  font-size: 0.82rem;
  color: var(--text-dim);
  margin-bottom: 12px;
  line-height: 1.4;
}

.campo {
  margin-bottom: 10px;
}

.campo input {
  width: 100%;
  padding: 11px 14px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 10px;
  color: var(--text);
  font-size: 0.92rem;
  font-family: inherit;
  outline: none;
  transition: border-color 0.15s;
}
.campo input:focus { border-color: var(--blue); }
.campo input::placeholder { color: var(--text-dim); }

.btn-block {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-danger {
  background: rgba(239, 83, 80, 0.12);
  border: 1px solid var(--danger);
  color: var(--danger);
  padding: 12px;
  border-radius: 10px;
  font-size: 0.92rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
}
.btn-danger:disabled { opacity: 0.5; cursor: not-allowed; }

.config-danger {
  border-color: rgba(239, 83, 80, 0.3);
}

.danger-titulo {
  color: var(--danger) !important;
}

.erro-msg {
  color: var(--danger);
  font-size: 0.85rem;
  text-align: center;
}

.sucesso-msg {
  color: #4caf82;
  font-size: 0.85rem;
  text-align: center;
}
</style>
