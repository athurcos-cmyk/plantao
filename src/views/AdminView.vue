<template>
  <div class="admin-wrap">

    <!-- ══ HEADER ══ -->
    <header class="admin-header">
      <button class="btn-back" @click="$router.back()">←</button>
      <h1 class="admin-title">Admin</h1>
      <div class="header-spacer"></div>
      <span class="refresh-info" :class="ultimaAtualizacao ? 'refresh-info-on' : ''">
        {{ ultimaAtualizacao ? `${segundosPassados}s` : '…' }}
      </span>
      <button class="btn-toggle" :class="{ 'toggle-on': autoRefresh }" @click="toggleAutoRefresh" title="Auto-refresh">
        Auto
      </button>
      <button class="btn-refresh" :disabled="carregando" @click="carregarDadosAdmin(true)">
        <span :class="{ spin: carregando }">↺</span>
      </button>
      <button class="btn-broadcast" @click="broadcastAberto = true" title="Broadcast">📢</button>
    </header>

    <!-- ══ COMPACT METRICS BAR ══ -->
    <div class="metrics-bar" v-if="dadosAdmin">
      <div class="mbar-item">
        <span class="mbar-num">{{ dadosAdmin.metricas.total }}</span>
        <span class="mbar-label">usuários</span>
      </div>
      <div class="mbar-divider"></div>
      <div class="mbar-item">
        <span class="mbar-num mbar-hoje">{{ dadosAdmin.metricas.ativosHoje }}</span>
        <span class="mbar-label">hoje</span>
      </div>
      <div class="mbar-divider"></div>
      <div class="mbar-item">
        <span class="mbar-num" :class="crescimentoClass">{{ sinalCrescimento }}{{ dadosAdmin.metricas.crescimentoPercentual }}%</span>
        <span class="mbar-label">crescimento</span>
      </div>
      <div class="mbar-divider"></div>
      <div class="mbar-item">
        <span class="mbar-num">{{ dadosAdmin.metricas.totalAnotacoes }}</span>
        <span class="mbar-label">anotações</span>
      </div>
    </div>

    <!-- ══ TABS ══ -->
    <div class="tabs">
      <button v-for="tab in tabs" :key="tab.id" class="tab-btn" :class="{ 'tab-on': tabAtiva === tab.id }" @click="tabAtiva = tab.id">
        {{ tab.label }}
        <span v-if="tab.badge" class="tab-badge">{{ tab.badge }}</span>
      </button>
    </div>

    <div class="admin-body">
      <p v-if="carregando && !dadosAdmin" class="hint-central">Carregando…</p>
      <p v-else-if="erroAdmin" class="hint-erro">❌ {{ erroAdmin }}</p>

      <!-- ══ TAB: USUÁRIOS ══ -->
      <template v-if="tabAtiva === 'usuarios' && dadosAdmin">
        <div class="filter-row">
          <button v-for="f in filtros" :key="f.id" class="chip-filter" :class="{ 'chip-filter-on': filtroAtividade === f.id }" @click="filtroAtividade = f.id">
            {{ f.label }}
          </button>
        </div>
        <input v-model="busca" class="search-input" placeholder="🔍 Buscar por nome ou email…" />

        <div v-if="usuariosFiltrados.length === 0" class="hint-vazio">Nenhum usuário encontrado.</div>
        <div v-else class="usuarios-lista">
          <div v-for="u in usuariosVisiveis" :key="u.uid || u.syncCode" class="usuario-card" @click="abrirDetalhe(u)">
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
                <span>🔔 {{ u.fcmTokens }} disp.</span>
              </div>
              <div class="usuario-badges">
                <span v-if="u.emailBoasVindasEnviado" class="badge badge-ok">✉ welcome</span>
                <span v-if="u.emailDia3Enviado" class="badge badge-ok">📅 d3</span>
                <span class="badge badge-dim">{{ u.syncCode }}</span>
              </div>
            </div>
            <div class="usuario-acoes" @click.stop>
              <button class="btn-icon btn-email" :disabled="enviandoContato === `email-${u.uid}`" @click="abrirContato(u, 'email')" title="Enviar email">✉</button>
              <button class="btn-icon btn-push" :disabled="enviandoContato === `push-${u.uid}`" @click="abrirContato(u, 'push')" title="Notificação push">🔔</button>
              <button class="btn-icon btn-del" :disabled="excluindo === u.uid" @click="excluirUsuario(u)" title="Excluir">🗑</button>
            </div>
          </div>
        </div>
        <button
          v-if="usuariosVisiveis.length < usuariosFiltrados.length"
          class="btn-mais"
          @click="usuariosVisiveisCount += 30"
        >Mostrar mais usuários ({{ usuariosFiltrados.length - usuariosVisiveis.length }})</button>
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
          class="btn-mais"
          @click="feedbacksVisiveisCount += 20"
        >Mostrar mais feedbacks</button>
      </template>

      <!-- ══ TAB: MÉTRICAS ══ -->
      <template v-if="tabAtiva === 'metricas' && dadosAdmin">
        <div class="metricas-grid">
          <div class="metrica-card">
            <p class="metrica-label">Usuários</p>
            <p class="metrica-num">{{ dadosAdmin.metricas.total }}</p>
          </div>
          <div class="metrica-card metrica-destaque">
            <p class="metrica-label">Ativos 7d</p>
            <p class="metrica-num">{{ dadosAdmin.metricas.ativos7d }}</p>
          </div>
          <div class="metrica-card">
            <p class="metrica-label">Ativos hoje</p>
            <p class="metrica-num">{{ dadosAdmin.metricas.ativosHoje }}</p>
          </div>
          <div class="metrica-card">
            <p class="metrica-label">Retenção</p>
            <p class="metrica-num">{{ dadosAdmin.metricas.retencao }}%</p>
          </div>
          <div class="metrica-card">
            <p class="metrica-label">Anotações</p>
            <p class="metrica-num">{{ dadosAdmin.metricas.totalAnotacoes }}</p>
          </div>
          <div class="metrica-card">
            <p class="metrica-label">Pacientes</p>
            <p class="metrica-num">{{ dadosAdmin.metricas.totalPacientes }}</p>
          </div>
          <div class="metrica-card">
            <p class="metrica-label">FCM ativos</p>
            <p class="metrica-num">{{ dadosAdmin.metricas.usuariosComFCM }}</p>
          </div>
          <div class="metrica-card">
            <p class="metrica-label">Feedbacks</p>
            <p class="metrica-num">{{ dadosAdmin.metricas.totalFeedbacks }}</p>
          </div>
          <div class="metrica-card">
            <p class="metrica-label">Email taxa</p>
            <p class="metrica-num metrica-sm">{{ dadosAdmin.metricas.taxaEmailEnviado }}</p>
          </div>
        </div>

        <!-- Crescimento -->
        <div class="secao-titulo">Crescimento</div>
        <div class="growth-row">
          <div class="growth-card">
            <span class="growth-num">{{ dadosAdmin.metricas.novosEstaSemana }}</span>
            <span class="growth-label">Novos esta semana</span>
          </div>
          <div class="growth-card">
            <span class="growth-num">{{ dadosAdmin.metricas.novosSemanaPassada }}</span>
            <span class="growth-label">Semana passada</span>
          </div>
          <div class="growth-card" :class="dadosAdmin.metricas.crescimentoPercentual >= 0 ? 'growth-ok' : 'growth-err'">
            <span class="growth-num">{{ sinalCrescimento }}{{ dadosAdmin.metricas.crescimentoPercentual }}%</span>
            <span class="growth-label">vs semana anterior</span>
          </div>
        </div>

        <!-- Cadastros por semana -->
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

        <!-- Anotações por tipo -->
        <div v-if="dadosAdmin.metricas.anotacoesPorTipo.length" class="secao-titulo">Anotações por tipo</div>
        <div v-if="dadosAdmin.metricas.anotacoesPorTipo.length" class="tipo-grid">
          <div v-for="t in dadosAdmin.metricas.anotacoesPorTipo" :key="t.tipo" class="tipo-chip">
            <span class="tipo-label">{{ labelTipo(t.tipo) }}</span>
            <span class="tipo-count">{{ t.count }}</span>
          </div>
        </div>

        <!-- Crescimento acumulado -->
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
      </template>

      <!-- ══ TAB: MONITOR ══ -->
      <template v-if="tabAtiva === 'monitor' && dadosAdmin">
        <div class="secao-titulo">Cron</div>
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
            <span class="monitor-label">Notificações</span>
            <span class="monitor-val">{{ dadosAdmin.cronStatus.sent }}</span>
          </div>
          <div class="monitor-row">
            <span class="monitor-label">Status</span>
            <span class="monitor-val" :class="dadosAdmin.cronStatus.ok ? 'status-ok' : 'status-err'">
              {{ dadosAdmin.cronStatus.ok ? '✅ OK' : '❌ Erro' }}
            </span>
          </div>
          <p v-if="cronAtrasado" class="monitor-alerta">⚠️ Cron pode estar parado — verificar cron-job.org</p>
        </div>
        <div v-else class="hint-vazio">Nenhuma execução registrada.</div>

        <div class="secao-titulo" style="margin-top:20px">Broadcasts</div>
        <div v-if="dadosAdmin.broadcasts.length === 0" class="hint-vazio">Nenhum broadcast enviado.</div>
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
          class="btn-mais"
          @click="broadcastsVisiveisCount += 15"
        >Mostrar mais broadcasts</button>
      </template>
    </div>

    <!-- ══ MODAL: DETALHE DO USUÁRIO ══ -->
    <div v-if="modalUsuario" class="modal-overlay" @click.self="modalUsuario = null">
      <div class="modal">
        <h2 class="modal-titulo">{{ modalUsuario.nome }}</h2>
        <div class="detail-grid">
          <div class="detail-row">
            <span class="detail-key">Email</span>
            <span class="detail-val">{{ modalUsuario.email }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-key">SyncCode</span>
            <span class="detail-val">{{ modalUsuario.syncCode }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-key">UID</span>
            <span class="detail-val detail-mono">{{ modalUsuario.uid || '—' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-key">Cadastro</span>
            <span class="detail-val">{{ formatData(modalUsuario.criadoEm) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-key">Último acesso</span>
            <span class="detail-val">{{ modalUsuario.ultimoAcesso ? `${formatDataHora(modalUsuario.ultimoAcesso)} (${tempoAtras(modalUsuario.ultimoAcesso)})` : '—' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-key">Anotações</span>
            <span class="detail-val">{{ modalUsuario.totalAnotacoes }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-key">Dispositivos FCM</span>
            <span class="detail-val">{{ modalUsuario.fcmTokens }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-key">Status</span>
            <span class="detail-val">
              <span class="badge" :class="badgeAtividade(modalUsuario.diasSemAcesso)">
                {{ labelAtividade(modalUsuario.diasSemAcesso) }}
              </span>
            </span>
          </div>
          <div class="detail-row" v-if="modalUsuario.emailBoasVindasEnviado || modalUsuario.emailDia3Enviado">
            <span class="detail-key">Emails</span>
            <span class="detail-val">
              <span v-if="modalUsuario.emailBoasVindasEnviado" class="badge badge-ok">✉ welcome</span>
              <span v-if="modalUsuario.emailDia3Enviado" class="badge badge-ok">📅 d3</span>
            </span>
          </div>
        </div>
        <div class="modal-acoes" style="margin-top:8px">
          <button class="btn-cancel" @click="modalUsuario = null">Fechar</button>
          <button class="btn-enviar-modal btn-email-action" @click="abrirContato(modalUsuario, 'email'); modalUsuario = null">✉ Email</button>
          <button class="btn-enviar-modal btn-push-action" @click="abrirContato(modalUsuario, 'push'); modalUsuario = null">🔔 Push</button>
        </div>
      </div>
    </div>

    <!-- ══ MODAL: CONTATO INDIVIDUAL ══ -->
    <div v-if="modalContato" class="modal-overlay" @click.self="fecharContato">
      <div class="modal">
        <h2 class="modal-titulo">{{ contatoCanal === 'email' ? '✉' : contatoCanal === 'push' ? '🔔' : '📢' }} {{ modalContato.nome }}</h2>
        <p class="modal-sub" v-if="contatoCanal === 'email' || contatoCanal === 'ambos'">{{ modalContato.email }}</p>

        <div class="field">
          <label class="field-label">Canal</label>
          <div class="chips">
            <button class="chip" :class="{ 'chip-on': contatoCanal === 'email' }" @click="contatoCanal = 'email'">✉ Email</button>
            <button class="chip" :class="{ 'chip-on': contatoCanal === 'push' }" @click="contatoCanal = 'push'">🔔 Notificação</button>
            <button class="chip" :class="{ 'chip-on': contatoCanal === 'ambos' }" @click="contatoCanal = 'ambos'">📢 Ambos</button>
          </div>
        </div>

        <div class="field" v-if="contatoCanal === 'email' || contatoCanal === 'ambos'">
          <label class="field-label">Assunto</label>
          <input v-model="contatoAssunto" class="input" placeholder="Ex: Oi! Tenho uma novidade" maxlength="150" />
        </div>

        <div class="field">
          <label class="field-label">Mensagem</label>
          <textarea v-model="contatoMensagem" class="input textarea" placeholder="Escreva sua mensagem…" rows="5" maxlength="1000" />
          <span class="char-count">{{ contatoMensagem.length }}/1000</span>
        </div>

        <div class="modal-acoes">
          <button class="btn-cancel" @click="fecharContato">Cancelar</button>
          <button class="btn-enviar-modal" :disabled="enviandoContato || !contatoMensagem.trim()" @click="enviarContato">
            {{ enviandoContato ? 'Enviando…' : 'Enviar' }}
          </button>
        </div>
        <p v-if="erroContato" class="hint-erro" style="margin-top:8px">❌ {{ erroContato }}</p>
        <div v-if="sucessoContato" class="sucesso-contato">
          <p v-if="resultadoContato?.email" class="sucesso-linha">✅ Email enviado para {{ resultadoContato.email }}</p>
          <p v-if="resultadoContato?.push" class="sucesso-linha">✅ Push enviado para {{ resultadoContato.push }} dispositivo(s)</p>
        </div>
      </div>
    </div>

    <!-- ══ MODAL: BROADCAST ══ -->
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
            <button class="chip" :class="{ 'chip-on': form.tipo === 'email' }" @click="form.tipo = 'email'">✉ Email</button>
            <button class="chip" :class="{ 'chip-on': form.tipo === 'ambos' }" @click="form.tipo = 'ambos'">📢 Ambos</button>
          </div>
        </div>
        <div v-if="resultado" class="resultado" :class="resultado.erro ? 'resultado-erro' : 'resultado-ok'">
          <template v-if="!resultado.erro">
            <p class="resultado-linha">✅ Push: <strong>{{ resultado.push }}</strong> &nbsp; ✉ Email: <strong>{{ resultado.email }}</strong></p>
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
          <button class="btn-enviar-modal" :disabled="enviando || !form.mensagem.trim()" @click="enviarBroadcast">
            {{ enviando ? 'Enviando…' : 'Enviar' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getAuth } from 'firebase/auth'
import { db } from '../firebase.js'
import { ref as dbRef, get } from 'firebase/database'
import { useAuthStore } from '../stores/auth.js'

const router = useRouter()

// ── Estado ──
const totalUsuarios = ref(null)
const dadosAdmin = ref(null)
const carregando = ref(false)
const erroAdmin = ref('')
const tabAtiva = ref('usuarios')
const busca = ref('')
const filtroAtividade = ref('todos')
const excluindo = ref(null)
const erroExcluir = ref('')

// ── Auto-refresh ──
const autoRefresh = ref(true)
const ultimaAtualizacao = ref(null)
const segundosPassados = ref(0)
let _pollTimer = null
let _tickTimer = null

function toggleAutoRefresh() {
  autoRefresh.value = !autoRefresh.value
}

// ── Paginação ──
const usuariosVisiveisCount = ref(30)
const feedbacksVisiveisCount = ref(20)
const broadcastsVisiveisCount = ref(15)

// ── Feedbacks lidos ──
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

// ── Filtros ──
const filtros = [
  { id: 'todos', label: 'Todos' },
  { id: 'hoje', label: 'Hoje' },
  { id: '7d', label: '7 dias' },
  { id: 'inativos', label: 'Inativos' },
]

// ── Crescimento ──
const sinalCrescimento = computed(() => {
  const v = dadosAdmin.value?.metricas?.crescimentoPercentual
  if (v === undefined || v === null) return ''
  return v > 0 ? '+' : ''
})

const crescimentoClass = computed(() => {
  const v = dadosAdmin.value?.metricas?.crescimentoPercentual
  if (v > 0) return 'status-ok'
  if (v < 0) return 'status-err'
  return ''
})

// ── Usuários filtrados ──
const usuariosFiltrados = computed(() => {
  if (!dadosAdmin.value) return []
  let list = dadosAdmin.value.usuarios
  const q = busca.value.toLowerCase().trim()
  if (q) list = list.filter(u => u.nome.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))

  const agora = Date.now()
  const DIA = 86400000
  if (filtroAtividade.value === 'hoje') {
    list = list.filter(u => u.ultimoAcesso && (agora - Number(u.ultimoAcesso)) < DIA)
  } else if (filtroAtividade.value === '7d') {
    list = list.filter(u => u.ultimoAcesso && (agora - Number(u.ultimoAcesso)) < 7 * DIA)
  } else if (filtroAtividade.value === 'inativos') {
    list = list.filter(u => !u.ultimoAcesso || (agora - Number(u.ultimoAcesso)) >= 30 * DIA)
  }

  return list
})

const usuariosVisiveis = computed(() => usuariosFiltrados.value.slice(0, usuariosVisiveisCount.value))
const feedbacksVisiveis = computed(() => dadosAdmin.value ? dadosAdmin.value.feedbacks.slice(0, feedbacksVisiveisCount.value) : [])
const broadcastsVisiveis = computed(() => dadosAdmin.value ? dadosAdmin.value.broadcasts.slice(0, broadcastsVisiveisCount.value) : [])

// ── Cron ──
const cronAtrasado = computed(() => {
  const cs = dadosAdmin.value?.cronStatus
  if (!cs) return false
  return Date.now() - Number(cs.ts) > 5 * 60 * 1000
})

// ── Modal: Detalhe do usuário ──
const modalUsuario = ref(null)

function abrirDetalhe(u) {
  modalUsuario.value = u
  document.body.style.overflow = 'hidden'
}

// ── Modal: Contato individual ──
const modalContato = ref(null)
const contatoCanal = ref('email')
const contatoAssunto = ref('')
const contatoMensagem = ref('')
const enviandoContato = ref(false)
const erroContato = ref('')
const sucessoContato = ref(false)
const resultadoContato = ref(null)

function abrirContato(u, canal) {
  modalContato.value = u
  contatoCanal.value = canal
  contatoAssunto.value = ''
  contatoMensagem.value = ''
  erroContato.value = ''
  sucessoContato.value = false
  resultadoContato.value = null
  document.body.style.overflow = 'hidden'
}

function fecharContato() {
  modalContato.value = null
  document.body.style.overflow = ''
}

async function enviarContato() {
  if (enviandoContato.value || !contatoMensagem.trim()) return
  enviandoContato.value = true
  erroContato.value = ''
  sucessoContato.value = false
  resultadoContato.value = null

  try {
    const idToken = await getIdToken()
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
      body: JSON.stringify({
        uid: modalContato.value.uid,
        assunto: (contatoCanal.value === 'email' || contatoCanal.value === 'ambos') ? contatoAssunto.trim() || undefined : undefined,
        mensagem: contatoMensagem.trim(),
        canal: contatoCanal.value,
      }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || `Erro ${res.status}`)
    sucessoContato.value = true
    resultadoContato.value = data
    setTimeout(() => { if (modalContato.value) fecharContato() }, 2000)
  } catch (e) {
    erroContato.value = e.message
  } finally {
    enviandoContato.value = false
  }
}

// ── Modal: Broadcast ──
const broadcastAberto = ref(false)
const form = reactive({ titulo: '', mensagem: '', tipo: 'ambos' })
const enviando = ref(false)
const resultado = ref(null)

// ── Lifecycle ──
onMounted(async () => {
  // Dupla verificação: router já barra, mas aqui é segurança extra
  const auth = useAuthStore()
  if (auth.userEmail !== 'a.thurcos@gmail.com') {
    router.replace({ name: 'dashboard' })
    return
  }

  try {
    const snap = await get(dbRef(db, 'config/total_usuarios'))
    totalUsuarios.value = snap.exists() ? snap.val() : 0
  } catch {
    totalUsuarios.value = null
  }
  await carregarDadosAdmin()

  _pollTimer = setInterval(() => {
    if (autoRefresh.value) carregarDadosAdmin()
  }, 20000)

  _tickTimer = setInterval(() => {
    if (ultimaAtualizacao.value) {
      segundosPassados.value = Math.floor((Date.now() - ultimaAtualizacao.value) / 1000)
    }
  }, 1000)
})

onUnmounted(() => {
  clearInterval(_pollTimer)
  clearInterval(_tickTimer)
  document.body.style.overflow = ''
})

watch([busca, filtroAtividade, tabAtiva, dadosAdmin], () => {
  usuariosVisiveisCount.value = 30
  feedbacksVisiveisCount.value = 20
  broadcastsVisiveisCount.value = 15
})

// ── API helpers ──
async function getIdToken() {
  const user = getAuth().currentUser
  if (!user) throw new Error('Não autenticado')
  return user.getIdToken()
}

// Helper para recalcular vagas (usar se excluir contas direto pelo Firebase Console)
window.recalcularVagas = async () => {
  try {
    const token = await getIdToken()
    const res = await fetch('/api/init-counter', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token }
    })
    const data = await res.json()
    console.log('[VAGAS]', data)
    alert('Contador atualizado: ' + data.total + ' usuários')
  } catch (e) {
    console.error('[VAGAS] erro:', e)
    alert('Erro: ' + e.message)
  }
}

async function carregarDadosAdmin(forcar = false) {
  if (carregando.value && !forcar) return
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
    ultimaAtualizacao.value = Date.now()
    segundosPassados.value = 0
  } catch (e) {
    erroAdmin.value = e.message
  } finally {
    carregando.value = false
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
    if (data.errosCount) erroExcluir.value = `Excluído com ${data.errosCount} erro(s)`
  } catch (e) {
    erroExcluir.value = e.message
  } finally {
    excluindo.value = null
  }
}

async function enviarBroadcast() {
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
    if (res.ok) await carregarDadosAdmin()
  } catch (e) {
    resultado.value = { erro: e.message }
  } finally {
    enviando.value = false
  }
}

// ── Helpers ──
function labelTipo(tipo) {
  const map = {
    inicial: 'Avaliação', sv: 'Sinais', medicacao: 'Medicação',
    curativo: 'Curativo', banho: 'Banho', encaminhamento: 'Encaminhamento',
    passagem: 'Passagem', livre: 'Notas Livres', hc: 'HC',
  }
  return map[tipo] || tipo
}

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
  return `${d}d`
}

function badgeAtividade(dias) {
  if (dias === null || dias === undefined) return 'badge-dim'
  if (dias <= 1) return 'badge-ativo'
  if (dias <= 7) return 'badge-semana'
  if (dias <= 30) return 'badge-mes'
  return 'badge-inativo'
}

function labelAtividade(dias) {
  if (dias === null || dias === undefined) return '?'
  if (dias <= 1) return 'Ativo hoje'
  if (dias <= 7) return `${dias}d`
  if (dias <= 30) return `${dias}d`
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
.admin-header { display: flex; align-items: center; gap: 8px; padding: 12px 16px; background: var(--bg-card); border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 50; backdrop-filter: blur(8px); }
.header-spacer { flex: 1; }
.btn-back { background: none; border: none; color: var(--text-dim); font-size: 1.2rem; cursor: pointer; padding: 4px 4px 4px 0; }
.admin-title { margin: 0; font-size: 1.05rem; font-weight: 700; }
.refresh-info { font-size: 0.68rem; color: var(--text-muted); font-variant-numeric: tabular-nums; min-width: 28px; text-align: right; }
.refresh-info-on { color: var(--success); font-weight: 600; }
.btn-toggle { background: var(--bg-input); border: 1px solid var(--border); border-radius: 6px; padding: 4px 8px; font-size: 0.65rem; font-weight: 600; color: var(--text-dim); cursor: pointer; font-family: inherit; letter-spacing: 0.02em; }
.btn-toggle.toggle-on { background: var(--success-muted); border-color: var(--success); color: var(--success); }
.btn-refresh { background: none; border: none; color: var(--text-dim); font-size: 1.3rem; cursor: pointer; padding: 4px; }
.btn-refresh:hover:not(:disabled) { color: var(--blue); }
.btn-broadcast { background: var(--blue-muted); border: 1px solid var(--blue); color: var(--blue); font-size: 1rem; cursor: pointer; padding: 6px 8px; border-radius: 8px; }
.btn-broadcast:hover { background: color-mix(in srgb, var(--blue) 22%, transparent); }
.spin { display: inline-block; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Compact Metrics Bar ── */
.metrics-bar { display: flex; align-items: center; padding: 12px 16px; background: var(--bg-card); border-bottom: 1px solid var(--border); gap: 0; }
.mbar-item { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 2px; }
.mbar-num { font-size: 1.1rem; font-weight: 700; line-height: 1.2; color: var(--text); }
.mbar-hoje { color: var(--blue); }
.mbar-label { font-size: 0.6rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; white-space: nowrap; }
.mbar-divider { width: 1px; height: 28px; background: var(--border); flex-shrink: 0; }

/* ── Tabs ── */
.tabs { display: flex; gap: 6px; padding: 12px 16px 0; background: var(--bg); }
.tab-btn { flex: 1; padding: 9px 4px; border-radius: 8px 8px 0 0; border: 1px solid var(--border); border-bottom: none; background: var(--bg-input); color: var(--text-dim); font-size: 0.8rem; font-family: inherit; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px; }
.tab-on { background: var(--bg-card); color: var(--blue); border-color: var(--border); }
.tab-badge { background: var(--danger); color: var(--text-on-accent); border-radius: 9999px; font-size: 0.65rem; font-weight: 700; padding: 1px 5px; min-width: 16px; text-align: center; }

/* ── Body ── */
.admin-body { padding: 12px 16px 24px; max-width: 480px; margin: 0 auto; display: flex; flex-direction: column; gap: 12px; }

/* ── Hints ── */
.hint-central { margin: 0; color: var(--text-dim); font-size: 0.875rem; text-align: center; padding: 24px 0; }
.hint-erro { margin: 0; color: var(--danger); font-size: 0.875rem; }
.hint-vazio { margin: 0; color: var(--text-muted); font-size: 0.875rem; text-align: center; padding: 24px 0; }

/* ── Filter row ── */
.filter-row { display: flex; gap: 6px; flex-wrap: wrap; }
.chip-filter { padding: 6px 14px; border-radius: 9999px; border: 1px solid var(--border); background: var(--bg-input); color: var(--text-dim); font-size: 0.78rem; font-family: inherit; font-weight: 500; cursor: pointer; transition: all 0.15s; }
.chip-filter-on { background: var(--blue-muted); border-color: var(--blue); color: var(--blue); font-weight: 600; }
.chip-filter:hover { border-color: var(--text-muted); }

/* ── Search ── */
.search-input { width: 100%; box-sizing: border-box; background: var(--bg-input); border: 1px solid var(--border); border-radius: 10px; padding: 11px 14px; color: var(--text); font-size: 0.9rem; font-family: inherit; outline: none; }
.search-input:focus { border-color: var(--blue); }

/* ── Usuários ── */
.usuarios-lista { display: flex; flex-direction: column; gap: 8px; }
.usuario-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; padding: 12px; display: flex; align-items: flex-start; gap: 10px; cursor: pointer; transition: border-color 0.15s; }
.usuario-card:hover { border-color: color-mix(in srgb, var(--blue) 35%, transparent); }
.usuario-info { flex: 1; min-width: 0; }
.usuario-top { display: flex; align-items: center; gap: 8px; margin-bottom: 2px; }
.usuario-nome { margin: 0; font-size: 0.9rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.usuario-email { margin: 0 0 4px; font-size: 0.78rem; color: var(--text-dim); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.usuario-stats { display: flex; flex-wrap: wrap; gap: 6px; font-size: 0.7rem; color: var(--text-muted); margin-bottom: 4px; }
.usuario-badges { display: flex; gap: 4px; flex-wrap: wrap; }
.usuario-acoes { display: flex; flex-direction: column; gap: 4px; flex-shrink: 0; }

/* ── Badges ── */
.badge { display: inline-block; padding: 2px 7px; border-radius: 9999px; font-size: 0.65rem; font-weight: 600; white-space: nowrap; }
.badge-ok { background: var(--success-muted); color: var(--success); }
.badge-dim { background: color-mix(in srgb, var(--text-dim) 16%, transparent); color: var(--text-dim); }
.badge-new { background: var(--blue-muted); color: var(--blue); }
.badge-ativo { background: var(--success-muted); color: var(--success); }
.badge-semana { background: var(--warning-muted); color: var(--warning); }
.badge-mes { background: var(--warning-muted); color: var(--warning); }
.badge-inativo { background: var(--danger-muted); color: var(--danger); }

/* ── Action buttons ── */
.btn-icon { border-radius: 8px; border: 1px solid; padding: 6px 8px; font-size: 0.85rem; cursor: pointer; min-height: 34px; min-width: 34px; transition: background 0.15s; }
.btn-email { background: var(--blue-muted); border-color: var(--blue); color: var(--blue); }
.btn-email:hover:not(:disabled) { background: color-mix(in srgb, var(--blue) 18%, transparent); }
.btn-push { background: var(--success-muted); border-color: color-mix(in srgb, var(--success) 30%, transparent); color: var(--success); }
.btn-push:hover:not(:disabled) { background: color-mix(in srgb, var(--success) 18%, transparent); }
.btn-del { background: var(--danger-muted); border-color: color-mix(in srgb, var(--danger) 30%, transparent); color: var(--danger); }
.btn-del:hover:not(:disabled) { background: color-mix(in srgb, var(--danger) 18%, transparent); }
.btn-icon:disabled { opacity: 0.4; cursor: default; }
.btn-mais { width: 100%; padding: 10px; background: var(--bg-input); border: 1px solid var(--border); border-radius: 8px; color: var(--text-dim); font-size: 0.82rem; font-family: inherit; cursor: pointer; text-align: center; }
.btn-mais:hover { border-color: var(--blue); color: var(--blue); }

/* ── Feedbacks ── */
.feedbacks-lista { display: flex; flex-direction: column; gap: 8px; }
.feedback-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; padding: 12px; }
.fb-lido { opacity: 0.5; }
.feedback-header { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; flex-wrap: wrap; }
.feedback-nome { font-size: 0.85rem; font-weight: 600; }
.feedback-data { font-size: 0.75rem; color: var(--text-muted); margin-left: auto; }
.feedback-texto { margin: 0 0 8px; font-size: 0.85rem; color: var(--text-dim); line-height: 1.5; }
.feedback-acoes { display: flex; gap: 8px; }
.btn-reply { font-size: 0.75rem; color: var(--blue); text-decoration: none; padding: 4px 8px; border: 1px solid var(--blue); border-radius: 6px; }
.btn-lido { font-size: 0.75rem; color: var(--text-dim); background: none; border: 1px solid var(--border); border-radius: 6px; padding: 4px 8px; cursor: pointer; font-family: inherit; }

/* ── Detail modal ── */
.detail-grid { display: flex; flex-direction: column; gap: 8px; margin: 12px 0; }
.detail-row { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
.detail-key { font-size: 0.78rem; color: var(--text-dim); flex-shrink: 0; }
.detail-val { font-size: 0.85rem; font-weight: 500; text-align: right; word-break: break-all; }
.detail-mono { font-family: monospace; font-size: 0.75rem; }
.btn-email-action { background: var(--blue) !important; }
.btn-push-action { background: var(--success) !important; }

/* ── Métricas ── */
.metricas-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.metrica-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; padding: 14px 8px; text-align: center; }
.metrica-destaque { border-color: color-mix(in srgb, var(--blue) 40%, transparent); background: color-mix(in srgb, var(--blue) 6%, transparent); }
.metrica-label { margin: 0 0 4px; font-size: 0.65rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.04em; line-height: 1.3; }
.metrica-num { margin: 0; font-size: 1.3rem; font-weight: 700; }
.metrica-sm { font-size: 0.95rem; }

.growth-row { display: flex; gap: 8px; }
.growth-card { flex: 1; background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; padding: 14px 10px; text-align: center; }
.growth-num { display: block; font-size: 1.3rem; font-weight: 700; color: var(--text); }
.growth-label { display: block; font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.03em; margin-top: 2px; }
.growth-ok .growth-num { color: var(--success); }
.growth-err .growth-num { color: var(--danger); }

.secao-titulo { font-size: 0.75rem; font-weight: 600; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 8px; margin-top: 20px; }

.grafico-barras { display: flex; flex-direction: column; gap: 6px; }
.barra-wrap { display: flex; align-items: center; gap: 8px; }
.barra-label { font-size: 0.7rem; color: var(--text-dim); width: 60px; flex-shrink: 0; }
.barra-track { flex: 1; height: 8px; background: var(--bg-input); border-radius: 9999px; overflow: hidden; }
.barra-fill { height: 100%; background: var(--blue); border-radius: 9999px; transition: width 0.3s ease; min-width: 2px; }
.barra-acum { background: var(--success); }
.barra-num { font-size: 0.78rem; font-weight: 600; width: 20px; text-align: right; }

/* ── Tipo breakdown ── */
.tipo-grid { display: flex; flex-wrap: wrap; gap: 6px; }
.tipo-chip { background: var(--bg-input); border: 1px solid var(--border); border-radius: 9999px; padding: 5px 12px; display: flex; align-items: center; gap: 6px; }
.tipo-label { font-size: 0.75rem; color: var(--text-dim); }
.tipo-count { font-size: 0.78rem; font-weight: 700; color: var(--blue); }

/* ── Monitor ── */
.monitor-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; padding: 14px; display: flex; flex-direction: column; gap: 8px; }
.monitor-row { display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; }
.monitor-label { color: var(--text-dim); }
.monitor-val { font-weight: 600; }
.status-ok { color: var(--success); }
.status-err { color: var(--danger); }
.monitor-alerta { margin: 0; font-size: 0.78rem; color: var(--warning); background: var(--warning-muted); border: 1px solid color-mix(in srgb, var(--warning) 28%, transparent); border-radius: 8px; padding: 8px 12px; }

.broadcasts-lista { display: flex; flex-direction: column; gap: 8px; }
.broadcast-item { background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; padding: 12px; }
.broadcast-header { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.broadcast-titulo { font-size: 0.85rem; font-weight: 600; flex: 1; }
.broadcast-data { font-size: 0.72rem; color: var(--text-muted); white-space: nowrap; }
.broadcast-msg { margin: 0 0 6px; font-size: 0.78rem; color: var(--text-dim); line-height: 1.4; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.broadcast-stats { display: flex; gap: 6px; }

/* ── Modal ── */
.modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.65); display: flex; align-items: flex-end; justify-content: center; z-index: 100; padding: 0; }
.modal { background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px 16px 0 0; padding: 24px 20px 20px; width: 100%; max-width: 480px; max-height: 85vh; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; }
.modal-titulo { margin: 0; font-size: 1.05rem; font-weight: 700; }
.modal-sub { margin: -6px 0 0; font-size: 0.82rem; color: var(--text-dim); }
.modal-acoes { display: flex; gap: 8px; }
.btn-cancel { flex: 1; padding: 12px; background: var(--bg-input); border: 1px solid var(--border); border-radius: 10px; color: var(--text-dim); font-size: 0.9rem; font-family: inherit; cursor: pointer; }
.btn-enviar-modal { flex: 2; padding: 12px; background: var(--blue); color: var(--text-on-accent); border: none; border-radius: 10px; font-size: 0.9rem; font-weight: 700; font-family: inherit; cursor: pointer; }
.btn-enviar-modal:disabled { opacity: 0.5; cursor: not-allowed; }

.sucesso-contato { background: var(--success-muted); border: 1px solid color-mix(in srgb, var(--success) 30%, transparent); border-radius: 10px; padding: 12px; }
.sucesso-linha { margin: 0; font-size: 0.85rem; color: var(--success); font-weight: 600; }

/* ── Form fields ── */
.field { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-dim); }
.input { background: var(--bg-input); border: 1px solid var(--border); border-radius: 10px; padding: 12px 14px; color: var(--text); font-size: 1rem; font-family: inherit; outline: none; width: 100%; box-sizing: border-box; }
.input:focus { border-color: var(--blue); }
.textarea { resize: vertical; min-height: 80px; line-height: 1.6; }
.char-count { font-size: 0.72rem; color: var(--text-muted); text-align: right; }
.chips { display: flex; gap: 6px; flex-wrap: wrap; }
.chip { padding: 8px 14px; border-radius: 9999px; border: 1px solid var(--border); background: var(--bg-input); color: var(--text-dim); font-size: 0.82rem; font-family: inherit; cursor: pointer; }
.chip-on { background: var(--blue-muted); border-color: var(--blue); color: var(--blue); }
.resultado { border-radius: 10px; padding: 12px; }
.resultado-ok { background: var(--success-muted); border: 1px solid color-mix(in srgb, var(--success) 30%, transparent); }
.resultado-erro { background: var(--danger-muted); border: 1px solid color-mix(in srgb, var(--danger) 30%, transparent); }
.resultado-linha { margin: 0 0 4px; font-size: 0.85rem; }
.erros-lista { margin: 6px 0 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 4px; }
.erro-item { display: flex; gap: 6px; font-size: 0.78rem; }
.erro-tipo { font-weight: 700; text-transform: uppercase; font-size: 0.65rem; color: var(--danger); }
.erro-key { font-size: 0.72rem; color: var(--text-muted); font-family: monospace; }
.erro-msg { color: var(--text-dim); }
</style>
