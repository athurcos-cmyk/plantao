<template>
  <div class="screen">
    <header class="app-header">
      <button class="btn-voltar" @click="router.push({ name: 'dashboard' })">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <h1 class="header-titulo">Configurações</h1>
      <div style="width:34px"></div>
    </header>

    <!-- Modal de deletar conta -->
    <Teleport to="body">
      <Transition name="del">
        <div v-if="showDeleteModal" class="del-overlay" @click.self="showDeleteModal = false">
          <div class="del-modal" role="dialog" aria-modal="true" aria-label="Deletar conta">
            <div class="del-boneco">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="28" stroke="var(--danger)" stroke-width="2" fill="color-mix(in srgb, var(--danger) 10%, transparent)" />
                <circle cx="23" cy="27" r="3" fill="var(--danger)" />
                <circle cx="41" cy="27" r="3" fill="var(--danger)" />
                <path d="M20 43c0-8 24-8 24 0" stroke="var(--danger)" stroke-width="2" stroke-linecap="round" fill="none" />
              </svg>
            </div>
            <p class="del-msg">Desculpa não ter sido suficiente pra você...</p>
            <p class="del-sub">Suas anotações, pacientes e configurações serão apagados permanentemente. Não tem como desfazer.</p>
            <div class="del-acoes">
              <button class="btn btn-primary btn-block" style="background:var(--danger);border-color:var(--danger)" @click="confirmarDeleteSegundoPasso">
                Quero deletar
              </button>
              <button class="btn btn-secondary btn-block" style="margin-top:8px" @click="showDeleteModal = false">
                Mudei de ideia
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

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

      <!-- Aparência -->
      <section class="config-section">
        <h2 class="config-section-titulo">Aparência</h2>

        <h3 class="config-sub-titulo">🌙 Escuros</h3>
        <div class="temas-grid">
          <button
            v-for="tema in temasDark"
            :key="tema.id"
            class="tema-card"
            :class="{ 'tema-card-on': temaAtivo === tema.id }"
            @click="aplicarTema(tema.id)"
          >
            <div class="tema-preview-wrap">
              <div class="tema-prev-bg" :style="{ background: tema.preview.bg }">
                <div class="tema-prev-card" :style="{ background: tema.preview.card }">
                  <div class="tema-prev-accent" :style="{ background: tema.preview.accent }"></div>
                  <div class="tema-prev-line" :style="{ background: tema.preview.accent, opacity: 0.4 }"></div>
                </div>
              </div>
            </div>
            <span class="tema-nome">{{ tema.nome }}</span>
            <span v-if="temaAtivo === tema.id" class="tema-check">✓</span>
          </button>
        </div>

        <h3 class="config-sub-titulo" style="margin-top:16px">☀️ Claros</h3>
        <div class="temas-grid">
          <button
            v-for="tema in temasLight"
            :key="tema.id"
            class="tema-card"
            :class="{ 'tema-card-on': temaAtivo === tema.id }"
            @click="aplicarTema(tema.id)"
          >
            <div class="tema-preview-wrap">
              <div class="tema-prev-bg" :style="{ background: tema.preview.bg }">
                <div class="tema-prev-card" :style="{ background: tema.preview.card }">
                  <div class="tema-prev-accent" :style="{ background: tema.preview.accent }"></div>
                  <div class="tema-prev-line" :style="{ background: tema.preview.accent, opacity: 0.4 }"></div>
                </div>
              </div>
            </div>
            <span class="tema-nome">{{ tema.nome }}</span>
            <span v-if="temaAtivo === tema.id" class="tema-check">✓</span>
          </button>
        </div>
      </section>


      <!-- Métodos de login -->
      <section v-if="providersReady" class="config-section">
        <h2 class="config-section-titulo">Métodos de login</h2>

        <div v-if="temSenha" class="metodo-item">
          <div class="metodo-info">
            <span class="metodo-nome">✉ Email e senha</span>
            <span class="metodo-email">{{ auth.userEmail }}</span>
          </div>
          <span class="metodo-status ativo">Ativo</span>
        </div>

        <div v-if="temGoogle" class="metodo-item">
          <div class="metodo-info">
            <span class="metodo-nome">G Google</span>
            <span class="metodo-email">{{ emailGoogle || auth.userEmail }}</span>
          </div>
          <span class="metodo-status ativo">Ativo</span>
        </div>

        <button
          v-if="!temGoogle"
          class="btn btn-secondary btn-block"
          style="margin-top:12px"
          :disabled="vinculandoGoogle"
          @click="vincularGoogle"
        >
          <span v-if="vinculandoGoogle">Vinculando...</span>
          <span v-else>+ Adicionar login com Google</span>
        </button>

        <template v-if="!temSenha">
          <button
            class="btn btn-secondary btn-block"
            style="margin-top:8px"
            @click="mostrarCriarSenha = !mostrarCriarSenha"
          >
            {{ mostrarCriarSenha ? 'Cancelar' : '+ Criar senha' }}
          </button>
          <div v-if="mostrarCriarSenha" style="margin-top:12px">
            <p class="config-sub">Crie uma senha para entrar em computadores do hospital onde o Google pode não funcionar.</p>
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
          </div>
        </template>
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

      <!-- Legal -->
      <section class="config-section">
        <h2 class="config-section-titulo">Legal</h2>
        <div class="legal-links">
          <a href="/privacidade" target="_blank" class="legal-link">Política de Privacidade</a>
          <a href="/termos" target="_blank" class="legal-link">Termos de Serviço</a>
        </div>
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
import { ref as dbRef, set } from 'firebase/database'
import {
  updateProfile,
  EmailAuthProvider,
  linkWithCredential,
  linkWithPopup,
  onAuthStateChanged,
} from 'firebase/auth'
import { googleProvider } from '../firebase.js'
import { useCopia } from '../composables/useCopia.js'
import { useTheme } from '../composables/useTheme.js'

const router = useRouter()
const auth = useAuthStore()
const { copiar } = useCopia()
const { temas, temaAtivo, aplicarTema, temasAgrupados } = useTheme()
const { dark: temasDark, light: temasLight } = temasAgrupados()


const copiou = ref(false)
const erro = ref('')
const sucesso = ref('')

// Providers vinculados
const providersReady = ref(false)
const temSenha = ref(false)
const temGoogle = ref(false)
const emailGoogle = ref('')
const vinculandoGoogle = ref(false)
const mostrarCriarSenha = ref(false)

// Senha para Google users
const novaSenha = ref('')
const novaSenhaConfirm = ref('')
const salvandoSenha = ref(false)

// Nome
const novoNome = ref('')
const salvandoNome = ref(false)

// Delete
const deletando = ref(false)

onMounted(async () => {
  novoNome.value = auth.userName || ''

  // Aguarda auth estar pronto antes de ler providers
  await auth.initAuthListener()

  // initAuthListener pode ter resolvido do cache enquanto Firebase Auth
  // ainda restaura a sessão do IndexedDB. Nesse caso currentUser é null —
  // espera o onAuthStateChanged de verdade.
  const user = await new Promise(resolve => {
    const u = firebaseAuth.currentUser
    if (u) { resolve(u); return }
    const unsub = onAuthStateChanged(firebaseAuth, (user) => {
      unsub()
      resolve(user)
    })
  })

  if (user) {
    await user.reload()
    const providers = firebaseAuth.currentUser?.providerData || []
    const ids = providers.map(p => p.providerId)
    // Se providerData vazio, assume que tem senha (método padrão de cadastro)
    temSenha.value = ids.includes('password')
    temGoogle.value = ids.includes('google.com')
    if (temGoogle.value) {
      const g = providers.find(p => p.providerId === 'google.com')
      emailGoogle.value = g?.email || ''
    }
  } else {
    // Conta não existe mais no Firebase Auth (deletada) mas o cache
    // local ainda tinha sessão. O auth.js já tratou o deslogueio.
    // Redireciona para a landing/login.
    window.location.replace('/')
    return
  }
  providersReady.value = true
})

async function copiarCodigo() {
  const ok = await copiar(auth.syncCode)
  if (ok) {
    copiou.value = true
    setTimeout(() => { copiou.value = false }, 2000)
  } else {
    erro.value = 'Erro ao copiar o código.'
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
    sucesso.value = 'Senha criada! Agora você pode entrar com email ou código + senha.'
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

const showDeleteModal = ref(false)

function confirmarDelete() {
  showDeleteModal.value = true
}

async function confirmarDeleteSegundoPasso() {
  showDeleteModal.value = false

  // Segunda confirmação
  const code = prompt(`Para confirmar, digite seu código: ${auth.syncCode}`)
  if (code !== auth.syncCode) {
    erro.value = 'Código incorreto. Conta não deletada.'
    return
  }

  deletando.value = true
  erro.value = ''

  try {
    const user = firebaseAuth.currentUser
    // Força renovação do token — evita token expirado no servidor
    const idToken = await user.getIdToken(true)

    // 0. Email de despedida (timeout 5s — nunca bloqueia o delete)
    try {
      await Promise.race([
        fetch('/api/goodbye', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken}` },
          body: JSON.stringify({}),
        }),
        new Promise(resolve => setTimeout(resolve, 5000)),
      ])
    } catch (_) { /* falha silenciosa */ }

    // 1. Deletar todos os dados via servidor (firebase-admin bypassa regras de segurança)
    const deleteRes = await fetch('/api/delete-account', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${idToken}` },
    })
    if (!deleteRes.ok) {
      const errBody = await deleteRes.json().catch(() => ({}))
      throw new Error(errBody.error || `delete-account falhou: ${deleteRes.status}`)
    }

    // 2. Limpar localStorage (FCM token, syncCode, cache)
    try { localStorage.clear() } catch {}

    // 3. Recarregar a página completamente — limpa todo estado Vue/Pinia/listeners/FCM
    // (conta Auth já foi deletada pelo servidor via admin.auth().deleteUser)
    window.location.replace('/')
  } catch (e) {
    if (e.code === 'auth/requires-recent-login') {
      erro.value = 'Faça login novamente antes de deletar a conta.'
    } else {
      // Mostra o erro real do servidor, não mensagem genérica
      const motivo = e.message || 'Erro ao deletar conta. Tente novamente.'
      erro.value = motivo.startsWith('delete-account falhou')
        ? `Servidor retornou erro (${e.message.split(': ')[1] || 'desconhecido'}). Tente novamente ou contate o suporte.`
        : motivo
      console.error('[CONFIG] delete error:', e)
    }
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

.legal-links {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.legal-link {
  color: var(--text-muted);
  font-size: 0.9rem;
  text-decoration: none;
  padding: 10px 0;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.legal-link:last-child { border-bottom: none; }
.legal-link::after { content: '→'; opacity: 0.4; }
.legal-link:hover { color: var(--text); }

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
  background: var(--blue-muted);
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

.metodo-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid var(--border);
}
.metodo-item:last-of-type { border-bottom: none; }
.metodo-info { display: flex; flex-direction: column; gap: 2px; }
.metodo-nome { font-size: 0.88rem; font-weight: 600; color: var(--text); }
.metodo-email { font-size: 0.78rem; color: var(--text-muted); }
.metodo-status { font-size: 0.72rem; font-weight: 700; padding: 3px 8px; border-radius: 6px; }
.metodo-status.ativo { background: var(--success-muted); color: var(--success); }

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
  background: color-mix(in srgb, var(--danger) 14%, transparent);
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
  border-color: color-mix(in srgb, var(--danger) 30%, transparent);
}

.config-sub-titulo {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-muted);
  margin-bottom: 8px;
  margin-top: 12px;
}
.config-sub-titulo:first-of-type { margin-top: 0; }

.danger-titulo {

  color: var(--danger) !important;
}

.erro-msg {
  color: var(--danger);
  font-size: 0.85rem;
  text-align: center;
}

.sucesso-msg {
  color: var(--success);
  font-size: 0.85rem;
  text-align: center;
}

/* ── Temas ── */
.temas-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.tema-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
  background: var(--bg);
  border: 2px solid var(--border);
  border-radius: 14px;
  padding: 10px 8px;
  cursor: pointer;
  transition: border-color 0.15s;
}

.tema-card-on {
  border-color: var(--blue);
}

.tema-preview-wrap {
  width: 100%;
  height: 52px;
  border-radius: 8px;
  overflow: hidden;
}

.tema-prev-bg {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: flex-end;
  padding: 5px;
}

.tema-prev-card {
  width: 100%;
  border-radius: 5px;
  padding: 5px 6px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.tema-prev-accent {
  height: 6px;
  border-radius: 3px;
  width: 60%;
}

.tema-prev-line {
  height: 4px;
  border-radius: 2px;
  width: 85%;
}

.tema-nome {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.tema-check {
  position: absolute;
  top: 6px;
  right: 8px;
  font-size: 0.75rem;
  color: var(--blue);
  font-weight: 700;
}

/* ── Modal deletar conta ── */
.del-overlay {
  position: fixed; inset: 0; z-index: 999;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  padding: 20px;
}

.del-modal {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 32px 24px 20px;
  max-width: 340px;
  width: 100%;
  text-align: center;
}

.del-boneco {
  margin-bottom: 12px;
  line-height: 1;
  display: flex;
  justify-content: center;
}

.del-msg {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 8px;
}

.del-sub {
  font-size: 0.83rem;
  color: var(--text-dim);
  line-height: 1.5;
  margin-bottom: 20px;
}

.del-acoes {
  display: flex;
  flex-direction: column;
}

.del-enter-active,
.del-leave-active {
  transition: opacity 0.2s ease;
}
.del-enter-from,
.del-leave-to {
  opacity: 0;
}
</style>
