<template>
  <div class="admin-wrap">
    <header class="admin-header">
      <button class="btn-back" @click="$router.back()">←</button>
      <h1 class="admin-title">Admin</h1>
    </header>

    <div class="admin-body">

      <!-- ── Contador de vagas ── -->
      <div class="counter-card">
        <div class="counter-row">
          <div>
            <p class="counter-label">Usuários cadastrados</p>
            <p class="counter-num" v-if="contadorStatus !== 'carregando'">
              {{ totalUsuarios !== null ? totalUsuarios : '—' }}
              <span class="counter-de">/ 100 vagas</span>
            </p>
            <p class="counter-num" v-else>…</p>
          </div>
          <button class="btn-init" @click="inicializarContador" :disabled="inicializando">
            {{ inicializando ? 'Sincronizando…' : '🔄 Sincronizar' }}
          </button>
        </div>
        <p class="counter-hint" v-if="contadorMsg" :class="contadorMsg.startsWith('✅') ? 'counter-ok' : 'counter-err'">
          {{ contadorMsg }}
        </p>
      </div>

      <!-- ── Tabs ── -->
      <div class="tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="tab-btn"
          :class="{ 'tab-on': tabAtiva === tab.id }"
          @click="tabAtiva = tab.id"
        >{{ tab.label }}</button>
      </div>

      <!-- ── Carregando dados admin ── -->
      <p v-if="carregando" class="hint-central">Carregando…</p>
      <p v-else-if="erroAdmin" class="hint-erro">❌ {{ erroAdmin }}</p>

      <!-- ── Tab: Usuários ── -->
      <template v-if="tabAtiva === 'usuarios' && dadosAdmin">
        <div v-if="dadosAdmin.usuarios.length === 0" class="hint-vazio">Nenhum usuário cadastrado.</div>
        <div v-else class="usuarios-lista">
          <div
            v-for="u in dadosAdmin.usuarios"
            :key="u.uid || u.syncCode"
            class="usuario-card"
          >
            <div class="usuario-info">
              <p class="usuario-nome">{{ u.nome }}</p>
              <p class="usuario-email">{{ u.email }}</p>
              <p class="usuario-meta">
                {{ formatData(u.criadoEm) }}
                <span v-if="u.emailBoasVindasEnviado" class="badge badge-ok">✉ welcome</span>
                <span v-if="u.emailDia3Enviado" class="badge badge-ok">📅 d3</span>
              </p>
              <p class="usuario-code">{{ u.syncCode }}</p>
            </div>
            <button
              class="btn-excluir"
              :disabled="excluindo === u.uid"
              @click="excluirUsuario(u)"
            >
              {{ excluindo === u.uid ? '…' : '🗑' }}
            </button>
          </div>
        </div>
        <p v-if="erroExcluir" class="hint-erro">❌ {{ erroExcluir }}</p>
      </template>

      <!-- ── Tab: Feedbacks ── -->
      <template v-if="tabAtiva === 'feedbacks' && dadosAdmin">
        <div v-if="dadosAdmin.feedbacks.length === 0" class="hint-vazio">Nenhum feedback recebido ainda.</div>
        <div v-else class="feedbacks-lista">
          <div
            v-for="(fb, i) in dadosAdmin.feedbacks"
            :key="i"
            class="feedback-card"
          >
            <div class="feedback-header">
              <span class="feedback-nome">{{ fb.nomeUsuario }}</span>
              <span class="feedback-data">{{ formatData(fb.timestamp) }}</span>
              <span v-if="fb.versao" class="badge badge-dim">v{{ fb.versao }}</span>
            </div>
            <p class="feedback-texto">{{ fb.texto }}</p>
          </div>
        </div>
      </template>

      <!-- ── Tab: Métricas ── -->
      <template v-if="tabAtiva === 'metricas' && dadosAdmin">
        <div class="metricas-grid">
          <div class="metrica-card">
            <p class="metrica-label">Total cadastrados</p>
            <p class="metrica-num">{{ dadosAdmin.metricas.total }}</p>
          </div>
          <div class="metrica-card">
            <p class="metrica-label">Feedbacks recebidos</p>
            <p class="metrica-num">{{ dadosAdmin.metricas.totalFeedbacks }}</p>
          </div>
          <div class="metrica-card">
            <p class="metrica-label">E-mail boas-vindas</p>
            <p class="metrica-num">{{ dadosAdmin.metricas.taxaEmailEnviado }}</p>
          </div>
        </div>

        <div class="secao-titulo">Cadastros por semana</div>
        <div class="grafico-barras">
          <div
            v-for="s in dadosAdmin.metricas.cadastrosPorSemana"
            :key="s.label"
            class="barra-wrap"
          >
            <div class="barra-label">{{ s.label }}</div>
            <div class="barra-track">
              <div
                class="barra-fill"
                :style="{ width: barraLargura(s.count, dadosAdmin.metricas.cadastrosPorSemana) }"
              ></div>
            </div>
            <div class="barra-num">{{ s.count }}</div>
          </div>
        </div>
      </template>

      <!-- ── Divider ── -->
      <div class="divider"></div>

      <!-- ── Broadcast ── -->
      <p class="admin-hint">Enviar mensagem para todos os usuários cadastrados.</p>

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
          <button class="chip" :class="{ 'chip-on': form.tipo === 'push' }" @click="form.tipo = 'push'">🔔 Push</button>
          <button class="chip" :class="{ 'chip-on': form.tipo === 'email' }" @click="form.tipo = 'email'">✉️ Email</button>
          <button class="chip" :class="{ 'chip-on': form.tipo === 'ambos' }" @click="form.tipo = 'ambos'">📢 Ambos</button>
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
import { reactive, ref, onMounted } from 'vue'
import { getAuth } from 'firebase/auth'
import { db } from '../firebase.js'
import { ref as dbRef, get } from 'firebase/database'

// ── Contador de usuários ──
const totalUsuarios = ref(null)
const contadorStatus = ref('idle')
const contadorMsg = ref('')
const inicializando = ref(false)

// ── Dados admin (usuários + feedbacks + métricas) ──
const dadosAdmin = ref(null)
const carregando = ref(false)
const erroAdmin = ref('')

// ── Tab ativa ──
const tabAtiva = ref('usuarios')
const tabs = [
  { id: 'usuarios', label: 'Usuários' },
  { id: 'feedbacks', label: 'Feedbacks' },
  { id: 'metricas', label: 'Métricas' },
]

// ── Excluir usuário ──
const excluindo = ref(null)
const erroExcluir = ref('')

onMounted(async () => {
  contadorStatus.value = 'carregando'
  try {
    const snap = await get(dbRef(db, 'config/total_usuarios'))
    totalUsuarios.value = snap.exists() ? snap.val() : 0
  } catch {
    totalUsuarios.value = null
  }
  contadorStatus.value = 'idle'

  await carregarDadosAdmin()
})

async function getIdToken() {
  const user = getAuth().currentUser
  if (!user) throw new Error('Não autenticado')
  return user.getIdToken()
}

async function carregarDadosAdmin() {
  carregando.value = true
  erroAdmin.value = ''
  try {
    const idToken = await getIdToken()
    const res = await fetch('/api/admin-data', {
      headers: { Authorization: `Bearer ${idToken}` },
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || `Erro ${res.status}`)
    dadosAdmin.value = data
  } catch (e) {
    erroAdmin.value = e.message
  } finally {
    carregando.value = false
  }
}

async function inicializarContador() {
  if (inicializando.value) return
  inicializando.value = true
  contadorMsg.value = ''
  try {
    const idToken = await getIdToken()
    const res = await fetch('/api/init-counter', {
      method: 'POST',
      headers: { Authorization: `Bearer ${idToken}` },
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || `Erro ${res.status}`)
    totalUsuarios.value = data.total
    contadorMsg.value = `✅ ${data.mensagem}`
  } catch (e) {
    contadorMsg.value = `❌ ${e.message}`
  } finally {
    inicializando.value = false
  }
}

async function excluirUsuario(u) {
  if (!confirm(`Excluir ${u.nome} (${u.email})?\n\nTodos os dados serão removidos permanentemente.`)) return
  if (!u.uid) {
    erroExcluir.value = `Usuário ${u.nome} não tem uid — não é possível excluir.`
    return
  }
  excluindo.value = u.uid
  erroExcluir.value = ''
  try {
    const idToken = await getIdToken()
    const res = await fetch('/api/admin-delete-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
      body: JSON.stringify({ uid: u.uid }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || `Erro ${res.status}`)
    // Remove da lista local sem recarregar tudo
    dadosAdmin.value.usuarios = dadosAdmin.value.usuarios.filter(x => x.uid !== u.uid)
    if (totalUsuarios.value !== null) totalUsuarios.value = Math.max(0, totalUsuarios.value - 1)
    if (data.erros?.length) {
      erroExcluir.value = `Excluído com ${data.erros.length} erro(s): ${data.erros.join(', ')}`
    }
  } catch (e) {
    erroExcluir.value = e.message
  } finally {
    excluindo.value = null
  }
}

// ── Broadcast ──
const form = reactive({ titulo: '', mensagem: '', tipo: 'ambos' })
const enviando = ref(false)
const resultado = ref(null)

async function enviar() {
  if (enviando.value || !form.mensagem.trim()) return
  enviando.value = true
  resultado.value = null
  try {
    const idToken = await getIdToken()
    const res = await fetch('/api/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
      body: JSON.stringify({
        titulo: form.titulo.trim() || undefined,
        mensagem: form.mensagem.trim(),
        tipo: form.tipo,
      }),
    })
    const data = await res.json()
    resultado.value = res.ok ? data : { erro: data.error || `Erro ${res.status}` }
  } catch (e) {
    resultado.value = { erro: e.message || 'Erro desconhecido' }
  } finally {
    enviando.value = false
  }
}

// ── Helpers ──
function formatData(ts) {
  if (!ts) return '—'
  const d = new Date(typeof ts === 'string' ? ts : Number(ts))
  if (isNaN(d)) return '—'
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function barraLargura(count, semanas) {
  const max = Math.max(...semanas.map(s => s.count), 1)
  return `${Math.round((count / max) * 100)}%`
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

/* ── Counter ── */
.counter-card {
  background: #111d32;
  border: 1px solid #1e3050;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.counter-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.counter-label {
  margin: 0;
  font-size: 0.78rem;
  color: #8899AA;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.counter-num {
  margin: 4px 0 0;
  font-size: 1.8rem;
  font-weight: 700;
  color: #EAEEF3;
  line-height: 1;
}
.counter-de {
  font-size: 0.9rem;
  font-weight: 400;
  color: #8899AA;
}
.btn-init {
  background: #1E88E5;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 9px 14px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
}
.btn-init:disabled { opacity: 0.5; cursor: default; }
.counter-hint { margin: 0; font-size: 0.78rem; color: #8899AA; }
.counter-ok { color: #4caf50; }
.counter-err { color: #ef5350; }

/* ── Tabs ── */
.tabs {
  display: flex;
  gap: 8px;
}
.tab-btn {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #1e3050;
  background: #162033;
  color: #8899AA;
  font-size: 0.875rem;
  font-family: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.tab-on {
  background: rgba(30, 136, 229, 0.12);
  border-color: #1E88E5;
  color: #1E88E5;
}

/* ── Hints ── */
.hint-central { margin: 0; color: #8899AA; font-size: 0.875rem; text-align: center; }
.hint-erro { margin: 0; color: #ef5350; font-size: 0.875rem; }
.hint-vazio { margin: 0; color: #556677; font-size: 0.875rem; text-align: center; padding: 24px 0; }

/* ── Usuários ── */
.usuarios-lista { display: flex; flex-direction: column; gap: 10px; }
.usuario-card {
  background: #111d32;
  border: 1px solid #1e3050;
  border-radius: 10px;
  padding: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.usuario-info { flex: 1; min-width: 0; }
.usuario-nome {
  margin: 0 0 2px;
  font-size: 0.95rem;
  font-weight: 600;
  color: #EAEEF3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.usuario-email {
  margin: 0 0 4px;
  font-size: 0.8rem;
  color: #8899AA;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.usuario-meta {
  margin: 0 0 4px;
  font-size: 0.78rem;
  color: #556677;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.usuario-code {
  margin: 0;
  font-size: 0.72rem;
  color: #334455;
  font-family: monospace;
}
.badge {
  display: inline-block;
  padding: 1px 6px;
  border-radius: 9999px;
  font-size: 0.7rem;
  font-weight: 600;
}
.badge-ok { background: rgba(67,160,71,0.15); color: #43A047; }
.badge-dim { background: rgba(136,153,170,0.1); color: #8899AA; }
.btn-excluir {
  background: rgba(229, 57, 53, 0.1);
  border: 1px solid rgba(229, 57, 53, 0.25);
  color: #E53935;
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 1rem;
  cursor: pointer;
  flex-shrink: 0;
  min-height: 44px;
  transition: background 0.15s;
}
.btn-excluir:hover:not(:disabled) { background: rgba(229, 57, 53, 0.2); }
.btn-excluir:disabled { opacity: 0.4; cursor: default; }

/* ── Feedbacks ── */
.feedbacks-lista { display: flex; flex-direction: column; gap: 10px; }
.feedback-card {
  background: #111d32;
  border: 1px solid #1e3050;
  border-radius: 10px;
  padding: 14px;
}
.feedback-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}
.feedback-nome { font-size: 0.85rem; font-weight: 600; color: #EAEEF3; }
.feedback-data { font-size: 0.78rem; color: #556677; margin-left: auto; }
.feedback-texto { margin: 0; font-size: 0.875rem; color: #8899AA; line-height: 1.5; }

/* ── Métricas ── */
.metricas-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.metrica-card {
  background: #111d32;
  border: 1px solid #1e3050;
  border-radius: 10px;
  padding: 14px 12px;
  text-align: center;
}
.metrica-label {
  margin: 0 0 6px;
  font-size: 0.72rem;
  color: #8899AA;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  line-height: 1.3;
}
.metrica-num {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 700;
  color: #EAEEF3;
}
.secao-titulo {
  font-size: 0.78rem;
  font-weight: 600;
  color: #8899AA;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.grafico-barras { display: flex; flex-direction: column; gap: 10px; }
.barra-wrap { display: flex; align-items: center; gap: 10px; }
.barra-label { font-size: 0.78rem; color: #8899AA; width: 72px; flex-shrink: 0; }
.barra-track {
  flex: 1;
  height: 10px;
  background: #162033;
  border-radius: 9999px;
  overflow: hidden;
}
.barra-fill {
  height: 100%;
  background: #1E88E5;
  border-radius: 9999px;
  transition: width 0.3s ease;
  min-width: 2px;
}
.barra-num { font-size: 0.82rem; font-weight: 600; color: #EAEEF3; width: 20px; text-align: right; }

/* ── Divider ── */
.divider { height: 1px; background: #1e3050; }

/* ── Broadcast ── */
.admin-hint { margin: 0; font-size: 0.875rem; color: #8899AA; }
.field { display: flex; flex-direction: column; gap: 8px; }
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
.input:focus { border-color: #1E88E5; }
.textarea { resize: vertical; min-height: 120px; line-height: 1.6; }
.char-count { font-size: 0.78rem; color: #556677; text-align: right; }
.chips { display: flex; gap: 8px; flex-wrap: wrap; }
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
.btn-enviar:hover:not(:disabled) { background: #1565C0; }
.btn-enviar:disabled { opacity: 0.5; cursor: not-allowed; }
.resultado { border-radius: 10px; padding: 16px; }
.resultado-ok { background: rgba(67, 160, 71, 0.1); border: 1px solid rgba(67, 160, 71, 0.25); }
.resultado-erro { background: rgba(229, 57, 53, 0.1); border: 1px solid rgba(229, 57, 53, 0.25); }
.resultado-linha { margin: 0 0 6px; font-size: 0.9rem; color: #EAEEF3; }
.resultado-linha:last-child { margin-bottom: 0; }
.resultado-aviso { color: #FFC107; }
.erros-lista { margin: 8px 0 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 6px; }
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
.erro-tipo { font-weight: 700; text-transform: uppercase; font-size: 0.72rem; color: #E53935; letter-spacing: 0.04em; }
.erro-detalhe { color: #EAEEF3; }
.erro-msg { color: #8899AA; word-break: break-all; }
</style>
