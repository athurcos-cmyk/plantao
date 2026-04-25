<template>
  <div class="admin-wrap">
    <header class="admin-header">
      <button class="btn-back" @click="$router.back()">←</button>
      <h1 class="admin-title">Admin</h1>
      <div class="header-acoes">
        <button class="btn-broadcast" @click="broadcastAberto = true" title="Enviar broadcast">📢</button>
        <button class="btn-refresh" :disabled="carregando" @click="carregarDadosAdmin" title="Recarregar">
          <span :class="{ 'spin': carregando }">↺</span>
        </button>
      </div>
    </header>

    <div class="admin-body">

      <!-- ── Contador ── -->
      <div class="counter-card">
        <div class="counter-row">
          <div>
            <p class="counter-label">Usuários cadastrados</p>
            <p class="counter-num">
              {{ totalUsuarios !== null ? totalUsuarios : '…' }}
              <span class="counter-de">/ 100 vagas</span>
            </p>
          </div>
          <button class="btn-init" @click="inicializarContador" :disabled="inicializando">
            {{ inicializando ? '…' : '🔄 Sincronizar' }}
          </button>
        </div>
        <p v-if="contadorMsg" class="counter-hint" :class="contadorMsg.startsWith('✅') ? 'counter-ok' : 'counter-err'">
          {{ contadorMsg }}
        </p>
      </div>

      <!-- ── Tabs ── -->
      <div class="tabs">
        <button v-for="tab in tabs" :key="tab.id" class="tab-btn" :class="{ 'tab-on': tabAtiva === tab.id }" @click="tabAtiva = tab.id">
          {{ tab.label }}
          <span v-if="tab.badge" class="tab-badge">{{ tab.badge }}</span>
        </button>
      </div>

      <p v-if="carregando" class="hint-central">Carregando…</p>
      <p v-else-if="erroAdmin" class="hint-erro">❌ {{ erroAdmin }}</p>

      <!-- ══ TAB: USUÁRIOS ══ -->
      <template v-if="tabAtiva === 'usuarios' && dadosAdmin">
        <input v-model="busca" class="search-input" placeholder="🔍 Buscar por nome ou email…" />

        <div v-if="usuariosFiltrados.length === 0" class="hint-vazio">Nenhum usuário encontrado.</div>
        <div v-else class="usuarios-lista">
          <div v-for="u in usuariosVisiveis" :key="u.uid || u.syncCode" class="usuario-card">
            <div class="usuario-info">
              <div class="usuario-top">
                <p class="usuario-nome">{{ u.nome }}</p>
                <span class="badge" :class="badgeAtividade(u.diasSemAcesso)">
                  {{ labelAtividade(u.diasSemAcesso) }}
                </span>
              </div>
              <p class="usuario-email">{{ u.email }}</p>
              <div class="usuario-stats">
                <span>📅 {{ formatData(u.criadoEm) }}</span>
                <span v-if="u.ultimoAcesso">🕐 {{ tempoAtras(u.ultimoAcesso) }}</span>
                <span>📝 {{ u.totalAnotacoes }} anot.</span>
                <span>🔔 {{ u.fcmTokens }} FCM</span>
              </div>
              <div class="usuario-badges">
                <span v-if="u.emailBoasVindasEnviado" class="badge badge-ok">✉ welcome</span>
                <span v-if="u.emailDia3Enviado" class="badge badge-ok">📅 d3</span>
                <span class="badge badge-dim">{{ u.syncCode }}</span>
              </div>
            </div>
            <div class="usuario-acoes">
              <button class="btn-icon btn-email" :disabled="enviandoEmail === u.uid" @click="abrirModalEmail(u)" title="Enviar email">✉</button>
              <button class="btn-icon btn-del" :disabled="excluindo === u.uid" @click="excluirUsuario(u)" title="Excluir conta">
                {{ excluindo === u.uid ? '…' : '🗑' }}
              </button>
            </div>
          </div>
        </div>
        <button
          v-if="usuariosVisiveis.length < usuariosFiltrados.length"
          class="btn-lido"
          style="width:100%;justify-content:center"
          @click="usuariosVisiveisCount += 30"
        >Mostrar mais usuários</button>
        <p v-if="erroExcluir" class="hint-erro">❌ {{ erroExcluir }}</p>
      </template>

      <!-- ══ TAB: FEEDBACKS ══ -->
      <template v-if="tabAtiva === 'feedbacks' && dadosAdmin">
        <div v-if="dadosAdmin.feedbacks.length === 0" class="hint-vazio">Nenhum feedback ainda.</div>
        <div v-else class="feedbacks-lista">
          <div v-for="fb in feedbacksVisiveis" :key="fb.id" class="feedback-card" :class="{ 'fb-lido': feedbacksLidos.has(fb.id) }">
            <div class="feedback-header">
              <span class="feedback-nome">{{ fb.nomeUsuario }}</span>
              <span class="feedback-data">{{ formatData(fb.timestamp) }}</span>
              <span v-if="fb.versao" class="badge badge-dim">v{{ fb.versao }}</span>
              <span v-if="!feedbacksLidos.has(fb.id)" class="badge badge-new">Novo</span>
            </div>
            <p class="feedback-texto">{{ fb.texto }}</p>
            <div class="feedback-acoes">
              <a v-if="fb.emailUsuario" :href="`mailto:${fb.emailUsuario}?subject=Re: Feedback Plantão`" class="btn-reply">↩ Responder</a>
              <button class="btn-lido" @click="toggleLido(fb.id)">
                {{ feedbacksLidos.has(fb.id) ? '○ Não lido' : '✓ Marcar lido' }}
              </button>
            </div>
          </div>
        </div>
        <button
          v-if="feedbacksVisiveis.length < dadosAdmin.feedbacks.length"
          class="btn-lido"
          style="width:100%;justify-content:center"
          @click="feedbacksVisiveisCount += 20"
        >Mostrar mais feedbacks</button>
      </template>

      <!-- ══ TAB: MÉTRICAS ══ -->
      <template v-if="tabAtiva === 'metricas' && dadosAdmin">
        <div class="metricas-grid">
          <div class="metrica-card">
            <p class="metrica-label">Total</p>
            <p class="metrica-num">{{ dadosAdmin.metricas.total }}</p>
          </div>
          <div class="metrica-card metrica-destaque">
            <p class="metrica-label">Ativos 7d</p>
            <p class="metrica-num">{{ dadosAdmin.metricas.ativos7d }}</p>
          </div>
          <div class="metrica-card">
            <p class="metrica-label">Anotações</p>
            <p class="metrica-num">{{ dadosAdmin.metricas.totalAnotacoes }}</p>
          </div>
          <div class="metrica-card">
            <p class="metrica-label">Feedbacks</p>
            <p class="metrica-num">{{ dadosAdmin.metricas.totalFeedbacks }}</p>
          </div>
          <div class="metrica-card">
            <p class="metrica-label">E-mail ok</p>
            <p class="metrica-num metrica-sm">{{ dadosAdmin.metricas.taxaEmailEnviado }}</p>
          </div>
        </div>

        <div class="secao-titulo">Crescimento acumulado</div>
        <div class="grafico-barras">
          <div v-for="s in dadosAdmin.metricas.crescimentoAcumulado" :key="s.label" class="barra-wrap">
            <div class="barra-label">{{ s.label }}</div>
            <div class="barra-track">
              <div class="barra-fill barra-acum" :style="{ width: barraLargura(s.count, dadosAdmin.metricas.crescimentoAcumulado) }"></div>
            </div>
            <div class="barra-num">{{ s.count }}</div>
          </div>
        </div>

        <div class="secao-titulo">Cadastros por semana</div>
        <div class="grafico-barras">
          <div v-for="s in dadosAdmin.metricas.cadastrosPorSemana" :key="s.label" class="barra-wrap">
            <div class="barra-label">{{ s.label }}</div>
            <div class="barra-track">
              <div class="barra-fill" :style="{ width: barraLargura(s.count, dadosAdmin.metricas.cadastrosPorSemana) }"></div>
            </div>
            <div class="barra-num">{{ s.count }}</div>
          </div>
        </div>
      </template>

      <!-- ══ TAB: MONITORAMENTO ══ -->
      <template v-if="tabAtiva === 'monitor' && dadosAdmin">
        <!-- Cron status -->
        <div class="secao-titulo">Status do Cron</div>
        <div v-if="dadosAdmin.cronStatus" class="monitor-card">
          <div class="monitor-row">
            <span class="monitor-label">Última execução</span>
            <span class="monitor-val">{{ formatDataHora(dadosAdmin.cronStatus.ts) }}</span>
          </div>
          <div class="monitor-row">
            <span class="monitor-label">Há</span>
            <span class="monitor-val">{{ tempoAtras(dadosAdmin.cronStatus.ts) }}</span>
          </div>
          <div class="monitor-row">
            <span class="monitor-label">Notificações enviadas</span>
            <span class="monitor-val">{{ dadosAdmin.cronStatus.sent }}</span>
          </div>
          <div class="monitor-row">
            <span class="monitor-label">Status</span>
            <span class="monitor-val" :class="dadosAdmin.cronStatus.ok ? 'status-ok' : 'status-err'">
              {{ dadosAdmin.cronStatus.ok ? '✅ OK' : '❌ Erro' }}
            </span>
          </div>
          <!-- Alerta se cron ficou mais de 5min sem rodar -->
          <p v-if="cronAtrasado" class="monitor-alerta">⚠️ Cron pode estar parado — verificar cron-job.org</p>
        </div>
        <div v-else class="hint-vazio">Nenhuma execução registrada ainda.</div>

        <!-- Histórico de broadcasts -->
        <div class="secao-titulo" style="margin-top:20px">Histórico de Broadcasts</div>
        <div v-if="dadosAdmin.broadcasts.length === 0" class="hint-vazio">Nenhum broadcast enviado ainda.</div>
        <div v-else class="broadcasts-lista">
          <div v-for="b in broadcastsVisiveis" :key="b.id" class="broadcast-item">
            <div class="broadcast-header">
              <span class="broadcast-titulo">{{ b.titulo || '(sem título)' }}</span>
              <span class="broadcast-data">{{ formatDataHora(b.ts) }}</span>
            </div>
            <p class="broadcast-msg">{{ b.mensagem }}</p>
            <div class="broadcast-stats">
              <span class="badge badge-dim">{{ b.tipo }}</span>
              <span class="badge badge-ok">🔔 {{ b.push }}</span>
              <span class="badge badge-ok">✉ {{ b.email }}</span>
            </div>
          </div>
        </div>
        <button
          v-if="broadcastsVisiveis.length < dadosAdmin.broadcasts.length"
          class="btn-lido"
          style="width:100%;justify-content:center"
          @click="broadcastsVisiveisCount += 15"
        >Mostrar mais broadcasts</button>
      </template>

    </div>

    <!-- ── Modal: Broadcast ── -->
    <div v-if="broadcastAberto" class="modal-overlay" @click.self="broadcastAberto = false">
      <div class="modal">
        <h2 class="modal-titulo">📢 Broadcast</h2>
        <p class="modal-sub">Envia para todos os usuários cadastrados</p>
        <div class="field">
          <label class="field-label">Título</label>
          <input v-model="form.titulo" class="input" placeholder="Ex: Novidade no Plantão 🎉" maxlength="100" />
        </div>
        <div class="field">
          <label class="field-label">Mensagem</label>
          <textarea v-model="form.mensagem" class="input textarea" placeholder="Escreva a mensagem aqui..." rows="5" maxlength="1000" />
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
        <div v-if="resultado" class="resultado" :class="resultado.erro ? 'resultado-erro' : 'resultado-ok'" style="margin-bottom:12px">
          <template v-if="!resultado.erro">
            <p class="resultado-linha">✅ Push: <strong>{{ resultado.push }}</strong> &nbsp; ✉️ Email: <strong>{{ resultado.email }}</strong></p>
            <ul v-if="resultado.erros?.length" class="erros-lista">
              <li v-for="(e, i) in resultado.erros" :key="i" class="erro-item">
                <span class="erro-tipo">{{ e.tipo }}</span>
                <span v-if="e.key || e.email" class="erro-key">{{ e.email || e.key }}</span>
                <span class="erro-msg">{{ e.error }}</span>
              </li>
            </ul>
          </template>
          <p v-else class="resultado-linha">❌ {{ resultado.erro }}</p>
        </div>
        <div class="modal-acoes">
          <button class="btn-cancel" @click="broadcastAberto = false">Fechar</button>
          <button class="btn-enviar-modal" :disabled="enviando || !form.mensagem.trim()" @click="enviar">
            {{ enviando ? 'Enviando…' : 'Enviar' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ── Modal: Email individual ── -->
    <div v-if="modalEmail" class="modal-overlay" @click.self="modalEmail = null">
      <div class="modal">
        <h2 class="modal-titulo">✉ Email para {{ modalEmail.nome }}</h2>
        <p class="modal-sub">{{ modalEmail.email }}</p>
        <div class="field">
          <label class="field-label">Assunto</label>
          <input v-model="emailForm.assunto" class="input" placeholder="Ex: Oi! Tenho uma novidade para você" maxlength="150" />
        </div>
        <div class="field">
          <label class="field-label">Mensagem</label>
          <textarea v-model="emailForm.mensagem" class="input textarea" placeholder="Escreva sua mensagem…" rows="6" maxlength="2000" />
        </div>
        <div class="modal-acoes">
          <button class="btn-cancel" @click="modalEmail = null">Cancelar</button>
          <button class="btn-enviar-modal" :disabled="enviandoEmail || !emailForm.assunto.trim() || !emailForm.mensagem.trim()" @click="enviarEmailIndividual">
            {{ enviandoEmail ? 'Enviando…' : 'Enviar' }}
          </button>
        </div>
        <p v-if="erroEmail" class="hint-erro" style="margin-top:8px">❌ {{ erroEmail }}</p>
        <p v-if="sucessoEmail" class="counter-ok" style="margin-top:8px;font-size:0.875rem">✅ Email enviado!</p>
      </div>
    </div>

  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted, watch } from 'vue'
import { getAuth } from 'firebase/auth'
import { db } from '../firebase.js'
import { ref as dbRef, get } from 'firebase/database'

// ── Estado base ──
const totalUsuarios = ref(null)
const contadorMsg = ref('')
const inicializando = ref(false)
const dadosAdmin = ref(null)
const carregando = ref(false)
const erroAdmin = ref('')
const tabAtiva = ref('usuarios')
const busca = ref('')
const excluindo = ref(null)
const erroExcluir = ref('')

// ── Feedbacks lidos (localStorage) ──
const _lsKey = 'admin_feedbacks_lidos'
const feedbacksLidos = ref(new Set(JSON.parse(localStorage.getItem(_lsKey) || '[]')))

function toggleLido(id) {
  if (feedbacksLidos.value.has(id)) {
    feedbacksLidos.value.delete(id)
  } else {
    feedbacksLidos.value.add(id)
  }
  localStorage.setItem(_lsKey, JSON.stringify([...feedbacksLidos.value]))
}

// ── Tabs ──
const tabs = computed(() => {
  const naoLidos = dadosAdmin.value
    ? dadosAdmin.value.feedbacks.filter(fb => !feedbacksLidos.value.has(fb.id)).length
    : 0
  return [
    { id: 'usuarios', label: 'Usuários' },
    { id: 'feedbacks', label: 'Feedbacks', badge: naoLidos || null },
    { id: 'metricas', label: 'Métricas' },
    { id: 'monitor', label: 'Monitor' },
  ]
})

// ── Usuários filtrados ──
const usuariosFiltrados = computed(() => {
  if (!dadosAdmin.value) return []
  const q = busca.value.toLowerCase().trim()
  if (!q) return dadosAdmin.value.usuarios
  return dadosAdmin.value.usuarios.filter(u =>
    u.nome.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
  )
})

const usuariosVisiveis = computed(() =>
  usuariosFiltrados.value.slice(0, usuariosVisiveisCount.value)
)

const feedbacksVisiveis = computed(() =>
  dadosAdmin.value
    ? dadosAdmin.value.feedbacks.slice(0, feedbacksVisiveisCount.value)
    : []
)

const broadcastsVisiveis = computed(() =>
  dadosAdmin.value
    ? dadosAdmin.value.broadcasts.slice(0, broadcastsVisiveisCount.value)
    : []
)

// ── Cron atrasado (> 5 min sem rodar) ──
const cronAtrasado = computed(() => {
  const cs = dadosAdmin.value?.cronStatus
  if (!cs) return false
  return Date.now() - Number(cs.ts) > 5 * 60 * 1000
})

// ── Modal email individual ──
const modalEmail = ref(null)
const emailForm = reactive({ assunto: '', mensagem: '' })
const enviandoEmail = ref(false)
const erroEmail = ref('')
const sucessoEmail = ref(false)
const usuariosVisiveisCount = ref(30)
const feedbacksVisiveisCount = ref(20)
const broadcastsVisiveisCount = ref(15)

function abrirModalEmail(u) {
  modalEmail.value = u
  emailForm.assunto = ''
  emailForm.mensagem = ''
  erroEmail.value = ''
  sucessoEmail.value = false
}

async function enviarEmailIndividual() {
  if (enviandoEmail.value) return
  enviandoEmail.value = true
  erroEmail.value = ''
  sucessoEmail.value = false
  try {
    const idToken = await getIdToken()
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
      body: JSON.stringify({ uid: modalEmail.value.uid, assunto: emailForm.assunto.trim(), mensagem: emailForm.mensagem.trim() }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || `Erro ${res.status}`)
    sucessoEmail.value = true
    setTimeout(() => { modalEmail.value = null }, 1500)
  } catch (e) {
    erroEmail.value = e.message
  } finally {
    enviandoEmail.value = false
  }
}

// ── Broadcast ──
const broadcastAberto = ref(false)
const form = reactive({ titulo: '', mensagem: '', tipo: 'ambos' })
const enviando = ref(false)
const resultado = ref(null)

onMounted(async () => {
  try {
    const snap = await get(dbRef(db, 'config/total_usuarios'))
    totalUsuarios.value = snap.exists() ? snap.val() : 0
  } catch {
    totalUsuarios.value = null
  }
  await carregarDadosAdmin()
})

watch([busca, tabAtiva, dadosAdmin], () => {
  usuariosVisiveisCount.value = 30
  feedbacksVisiveisCount.value = 20
  broadcastsVisiveisCount.value = 15
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
    const res = await fetch('/api/admin', {
      headers: { Authorization: `Bearer ${idToken}` },
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || `Erro ${res.status}`)
    dadosAdmin.value = data
    totalUsuarios.value = data.metricas.total
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
  if (!u.uid) { erroExcluir.value = `${u.nome} não tem uid.`; return }
  excluindo.value = u.uid
  erroExcluir.value = ''
  try {
    const idToken = await getIdToken()
    const res = await fetch('/api/admin', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
      body: JSON.stringify({ uid: u.uid }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || `Erro ${res.status}`)
    dadosAdmin.value.usuarios = dadosAdmin.value.usuarios.filter(x => x.uid !== u.uid)
    if (totalUsuarios.value !== null) totalUsuarios.value = Math.max(0, totalUsuarios.value - 1)
    if (data.erros?.length) erroExcluir.value = `Excluído com ${data.erros.length} erro(s)`
  } catch (e) {
    erroExcluir.value = e.message
  } finally {
    excluindo.value = null
  }
}

async function enviar() {
  if (enviando.value || !form.mensagem.trim()) return
  enviando.value = true
  resultado.value = null
  try {
    const idToken = await getIdToken()
    const res = await fetch('/api/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
      body: JSON.stringify({ titulo: form.titulo.trim() || undefined, mensagem: form.mensagem.trim(), tipo: form.tipo }),
    })
    const data = await res.json()
    resultado.value = res.ok ? data : { erro: data.error || `Erro ${res.status}` }
    if (res.ok) await carregarDadosAdmin() // atualiza histórico
  } catch (e) {
    resultado.value = { erro: e.message }
  } finally {
    enviando.value = false
  }
}

// ── Helpers ──
function formatData(ts) {
  if (!ts) return '—'
  const d = new Date(typeof ts === 'string' ? ts : Number(ts))
  if (isNaN(d)) return '—'
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

function formatDataHora(ts) {
  if (!ts) return '—'
  const d = new Date(Number(ts))
  if (isNaN(d)) return '—'
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

function tempoAtras(ts) {
  if (!ts) return '—'
  const diff = Date.now() - Number(ts)
  const min = Math.floor(diff / 60000)
  if (min < 2) return 'agora'
  if (min < 60) return `${min}min`
  const h = Math.floor(diff / 3600000)
  if (h < 24) return `${h}h`
  const d = Math.floor(diff / 86400000)
  return `${d}d atrás`
}

function badgeAtividade(dias) {
  if (dias === null) return 'badge-dim'
  if (dias <= 1) return 'badge-ativo'
  if (dias <= 7) return 'badge-semana'
  if (dias <= 30) return 'badge-mes'
  return 'badge-inativo'
}

function labelAtividade(dias) {
  if (dias === null) return '?'
  if (dias <= 1) return 'Ativo hoje'
  if (dias <= 7) return `${dias}d`
  if (dias <= 30) return `${dias}d inativo`
  return 'Inativo'
}

function barraLargura(count, lista) {
  const max = Math.max(...lista.map(s => s.count), 1)
  return `${Math.max(2, Math.round((count / max) * 100))}%`
}
</script>

<style scoped>
.admin-wrap { min-height: 100vh; background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; }

/* ── Header ── */
.admin-header { display: flex; align-items: center; gap: 12px; padding: 16px; background: var(--bg-card); border-bottom: 1px solid var(--border); }
.header-acoes { display: flex; align-items: center; gap: 4px; margin-left: auto; }
.btn-broadcast { background: var(--blue-muted); border: 1px solid var(--blue); color: var(--blue); font-size: 1.1rem; cursor: pointer; padding: 6px 10px; border-radius: 8px; transition: background 0.15s; }
.btn-broadcast:hover { background: color-mix(in srgb, var(--blue) 22%, transparent); }
.btn-back { background: none; border: none; color: #8899AA; font-size: 1.2rem; cursor: pointer; padding: 4px 8px; }
.admin-title { margin: 0; font-size: 1.1rem; font-weight: 700; }
.btn-refresh { background: none; border: none; color: #8899AA; font-size: 1.4rem; cursor: pointer; padding: 4px 8px; transition: color 0.15s; }
.btn-refresh:hover:not(:disabled) { color: var(--blue); }
.spin { display: inline-block; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Body ── */
.admin-body { padding: 20px 16px; max-width: 480px; margin: 0 auto; display: flex; flex-direction: column; gap: 16px; }

/* ── Counter ── */
.counter-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 16px; }
.counter-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.counter-label { margin: 0; font-size: 0.78rem; color: #8899AA; text-transform: uppercase; letter-spacing: 0.04em; }
.counter-num { margin: 4px 0 0; font-size: 1.8rem; font-weight: 700; line-height: 1; }
.counter-de { font-size: 0.9rem; font-weight: 400; color: #8899AA; }
.btn-init { background: var(--blue); color: #fff; border: none; border-radius: 8px; padding: 9px 14px; font-size: 0.82rem; font-weight: 600; cursor: pointer; white-space: nowrap; }
.btn-init:disabled { opacity: 0.5; cursor: default; }
.counter-hint { margin: 8px 0 0; font-size: 0.78rem; }
.counter-ok { color: #4caf50; }
.counter-err { color: #ef5350; }

/* ── Tabs ── */
.tabs { display: flex; gap: 6px; }
.tab-btn { flex: 1; padding: 9px 4px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-input); color: var(--text-dim); font-size: 0.8rem; font-family: inherit; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px; }
.tab-on { background: var(--blue-muted); border-color: var(--blue); color: var(--blue); }
.tab-badge { background: var(--danger); color: #fff; border-radius: 9999px; font-size: 0.65rem; font-weight: 700; padding: 1px 5px; min-width: 16px; text-align: center; }

/* ── Hints ── */
.hint-central { margin: 0; color: #8899AA; font-size: 0.875rem; text-align: center; }
.hint-erro { margin: 0; color: #ef5350; font-size: 0.875rem; }
.hint-vazio { margin: 0; color: #556677; font-size: 0.875rem; text-align: center; padding: 24px 0; }

/* ── Busca ── */
.search-input { width: 100%; box-sizing: border-box; background: var(--bg-input); border: 1px solid var(--border); border-radius: 10px; padding: 11px 14px; color: var(--text); font-size: 0.9rem; font-family: inherit; outline: none; }
.search-input:focus { border-color: var(--blue); }

/* ── Usuários ── */
.usuarios-lista { display: flex; flex-direction: column; gap: 10px; }
.usuario-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; padding: 14px; display: flex; align-items: flex-start; gap: 10px; }
.usuario-info { flex: 1; min-width: 0; }
.usuario-top { display: flex; align-items: center; gap: 8px; margin-bottom: 2px; }
.usuario-nome { margin: 0; font-size: 0.95rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.usuario-email { margin: 0 0 6px; font-size: 0.8rem; color: #8899AA; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.usuario-stats { display: flex; flex-wrap: wrap; gap: 8px; font-size: 0.75rem; color: #556677; margin-bottom: 6px; }
.usuario-badges { display: flex; gap: 5px; flex-wrap: wrap; }
.usuario-acoes { display: flex; flex-direction: column; gap: 6px; flex-shrink: 0; }

/* ── Badges ── */
.badge { display: inline-block; padding: 2px 7px; border-radius: 9999px; font-size: 0.68rem; font-weight: 600; white-space: nowrap; }
.badge-ok { background: rgba(67,160,71,0.15); color: #43A047; }
.badge-dim { background: rgba(136,153,170,0.1); color: #8899AA; }
.badge-new { background: var(--blue-muted); color: var(--blue); }
.badge-ativo { background: rgba(67,160,71,0.2); color: #43A047; }
.badge-semana { background: rgba(255,193,7,0.15); color: #FFC107; }
.badge-mes { background: rgba(255,152,0,0.15); color: #FF9800; }
.badge-inativo { background: rgba(229,57,53,0.12); color: #EF5350; }

/* ── Botões de ação por usuário ── */
.btn-icon { border-radius: 8px; border: 1px solid; padding: 8px 10px; font-size: 0.9rem; cursor: pointer; min-height: 38px; min-width: 38px; transition: background 0.15s; }
.btn-email { background: var(--blue-muted); border-color: var(--blue); color: var(--blue); }
.btn-email:hover:not(:disabled) { background: color-mix(in srgb, var(--blue) 18%, transparent); }
.btn-del { background: rgba(229,57,53,0.08); border-color: rgba(229,57,53,0.25); color: #E53935; }
.btn-del:hover:not(:disabled) { background: rgba(229,57,53,0.18); }
.btn-icon:disabled { opacity: 0.4; cursor: default; }

/* ── Feedbacks ── */
.feedbacks-lista { display: flex; flex-direction: column; gap: 10px; }
.feedback-card { background: #111d32; border: 1px solid #1e3050; border-radius: 10px; padding: 14px; }
.fb-lido { opacity: 0.5; }
.feedback-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; flex-wrap: wrap; }
.feedback-nome { font-size: 0.85rem; font-weight: 600; }
.feedback-data { font-size: 0.78rem; color: #556677; margin-left: auto; }
.feedback-texto { margin: 0 0 10px; font-size: 0.875rem; color: #8899AA; line-height: 1.5; }
.feedback-acoes { display: flex; gap: 8px; }
.btn-reply { font-size: 0.78rem; color: var(--blue); text-decoration: none; padding: 5px 10px; border: 1px solid var(--blue); border-radius: 6px; }
.btn-lido { font-size: 0.78rem; color: #8899AA; background: none; border: 1px solid #1e3050; border-radius: 6px; padding: 5px 10px; cursor: pointer; font-family: inherit; }
.btn-lido:hover { color: #EAEEF3; border-color: #8899AA; }

/* ── Métricas ── */
.metricas-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.metrica-card { background: #111d32; border: 1px solid #1e3050; border-radius: 10px; padding: 14px 10px; text-align: center; }
.metrica-destaque { border-color: color-mix(in srgb, var(--blue) 40%, transparent); background: color-mix(in srgb, var(--blue) 6%, transparent); }
.metrica-label { margin: 0 0 4px; font-size: 0.7rem; color: #8899AA; text-transform: uppercase; letter-spacing: 0.04em; line-height: 1.3; }
.metrica-num { margin: 0; font-size: 1.4rem; font-weight: 700; }
.metrica-sm { font-size: 1rem; }
.secao-titulo { font-size: 0.78rem; font-weight: 600; color: #8899AA; text-transform: uppercase; letter-spacing: 0.04em; }
.grafico-barras { display: flex; flex-direction: column; gap: 8px; }
.barra-wrap { display: flex; align-items: center; gap: 8px; }
.barra-label { font-size: 0.72rem; color: #8899AA; width: 68px; flex-shrink: 0; }
.barra-track { flex: 1; height: 10px; background: var(--bg-input); border-radius: 9999px; overflow: hidden; }
.barra-fill { height: 100%; background: var(--blue); border-radius: 9999px; transition: width 0.3s ease; min-width: 2px; }
.barra-acum { background: var(--success); }
.barra-num { font-size: 0.8rem; font-weight: 600; width: 20px; text-align: right; }

/* ── Monitor ── */
.monitor-card { background: #111d32; border: 1px solid #1e3050; border-radius: 10px; padding: 14px; display: flex; flex-direction: column; gap: 10px; }
.monitor-row { display: flex; justify-content: space-between; align-items: center; font-size: 0.875rem; }
.monitor-label { color: #8899AA; }
.monitor-val { font-weight: 600; }
.status-ok { color: #43A047; }
.status-err { color: #E53935; }
.monitor-alerta { margin: 0; font-size: 0.8rem; color: #FFC107; background: rgba(255,193,7,0.08); border: 1px solid rgba(255,193,7,0.2); border-radius: 8px; padding: 8px 12px; }
.broadcasts-lista { display: flex; flex-direction: column; gap: 8px; }
.broadcast-item { background: #111d32; border: 1px solid #1e3050; border-radius: 10px; padding: 12px; }
.broadcast-header { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.broadcast-titulo { font-size: 0.875rem; font-weight: 600; flex: 1; }
.broadcast-data { font-size: 0.75rem; color: #556677; white-space: nowrap; }
.broadcast-msg { margin: 0 0 8px; font-size: 0.8rem; color: #8899AA; line-height: 1.4; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.broadcast-stats { display: flex; gap: 6px; }

/* ── Divider ── */
.divider { height: 1px; background: var(--border); }

/* ── Broadcast form ── */
.admin-hint { margin: 0; font-size: 0.875rem; color: #8899AA; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-size: 0.78rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: #8899AA; }
.input { background: var(--bg-input); border: 1px solid var(--border); border-radius: 10px; padding: 12px 14px; color: var(--text); font-size: 1rem; font-family: inherit; outline: none; width: 100%; box-sizing: border-box; }
.input:focus { border-color: var(--blue); }
.textarea { resize: vertical; min-height: 100px; line-height: 1.6; }
.char-count { font-size: 0.75rem; color: #556677; text-align: right; }
.chips { display: flex; gap: 8px; }
.chip { padding: 8px 16px; border-radius: 9999px; border: 1px solid var(--border); background: var(--bg-input); color: var(--text-dim); font-size: 0.875rem; font-family: inherit; cursor: pointer; }
.chip-on { background: var(--blue-muted); border-color: var(--blue); color: var(--blue); }
.btn-enviar { width: 100%; padding: 14px; background: var(--blue); color: #fff; border: none; border-radius: 10px; font-size: 1rem; font-weight: 700; font-family: inherit; cursor: pointer; min-height: 52px; }
.btn-enviar:hover:not(:disabled) { background: var(--blue-dark); }
.btn-enviar:disabled { opacity: 0.5; cursor: not-allowed; }
.resultado { border-radius: 10px; padding: 14px; }
.resultado-ok { background: rgba(67,160,71,0.1); border: 1px solid rgba(67,160,71,0.25); }
.resultado-erro { background: rgba(229,57,53,0.1); border: 1px solid rgba(229,57,53,0.25); }
.resultado-linha { margin: 0 0 4px; font-size: 0.875rem; }
.erros-lista { margin: 8px 0 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 4px; }
.erro-item { display: flex; gap: 6px; font-size: 0.8rem; }
.erro-tipo { font-weight: 700; text-transform: uppercase; font-size: 0.7rem; color: #E53935; }
.erro-key { font-size: 0.75rem; color: #556677; font-family: monospace; }
.erro-msg { color: #8899AA; }

/* ── Modal ── */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: flex-end; justify-content: center; z-index: 100; padding: 0; }
.modal { background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px 16px 0 0; padding: 24px 20px; width: 100%; max-width: 480px; max-height: 90vh; overflow-y: auto; display: flex; flex-direction: column; gap: 14px; }
.modal-titulo { margin: 0; font-size: 1.05rem; font-weight: 700; }
.modal-sub { margin: -8px 0 0; font-size: 0.82rem; color: #8899AA; }
.modal-acoes { display: flex; gap: 10px; }
.btn-cancel { flex: 1; padding: 12px; background: var(--bg-input); border: 1px solid var(--border); border-radius: 10px; color: var(--text-dim); font-size: 0.9rem; font-family: inherit; cursor: pointer; }
.btn-enviar-modal { flex: 2; padding: 12px; background: var(--blue); color: #fff; border: none; border-radius: 10px; font-size: 0.9rem; font-weight: 700; font-family: inherit; cursor: pointer; }
.btn-enviar-modal:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
