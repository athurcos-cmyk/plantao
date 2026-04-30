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

      <!-- ══ TAB: MARKETING ══ -->
      <template v-if="tabAtiva === 'marketing'">
        <div class="secao-titulo">Imagens de divulgação</div>
        <!-- Busca -->
        <input v-model="mktBusca" class="search-input" placeholder="🔍 Buscar por título, prompt ou legenda…" />

        <!-- Filtros por canal com contagem -->
        <div class="filter-row">
          <button class="chip-filter" :class="{ 'chip-filter-on': !mktFiltroCanal }" @click="mktFiltroCanal = null">
            Todos ({{ marketingPrompts.length }})
          </button>
          <button v-for="c in mktCanais" :key="c.canal" class="chip-filter" :class="{ 'chip-filter-on': mktFiltroCanal === c.canal }" @click="mktFiltroCanal = mktFiltroCanal === c.canal ? null : c.canal">
            {{ c.label }} ({{ c.count }})
          </button>
        </div>

        <!-- Status dos resultados -->
        <div class="mkt-result-count" :class="{ 'mkt-result-dim': marketingFiltrados.length < marketingPrompts.length }">
          <template v-if="marketingFiltrados.length < marketingPrompts.length">
            {{ marketingFiltrados.length }} de {{ marketingPrompts.length }} prompts
            <button class="mkt-limpar-filtro" @click="mktBusca = ''; mktFiltroCanal = null">limpar filtros</button>
          </template>
          <template v-else>
            {{ marketingPrompts.length }} prompts · {{ mktCanais.length }} canais
          </template>
        </div>

        <!-- Vazio -->
        <div v-if="marketingFiltrados.length === 0" class="hint-vazio">Nenhum prompt encontrado.</div>
        <div v-for="p in marketingFiltrados" :key="p.id" class="mkt-card" :class="{ 'mkt-aberto': mktAberto === p.id }" @click="mktAberto = mktAberto === p.id ? null : p.id">
          <div class="mkt-topo">
            <span class="mkt-titulo">{{ p.titulo }}</span>
            <div class="mkt-chips">
              <span v-for="ch in p.canais" :key="ch" class="mkt-chip" :class="'mkt-'+ch">{{ ch }}</span>
              <button class="mkt-chip mkt-done" :class="{'mkt-done-on': mktSalvos[p.id]}" @click.stop="mktToggle(p.id)">{{ mktSalvos[p.id] ? '✅' : '⬜' }}</button>
            </div>
          </div>
          <div v-if="mktAberto === p.id" class="mkt-corpo">
            <div class="mkt-label">Prompt da imagem:</div>
            <div class="mkt-texto">{{ p.prompt }}</div>
            <button class="mkt-copiar" @click.stop="copiarMkt(p.prompt)">📋 Copiar prompt</button>
            <div v-if="p.legenda" class="mkt-legenda-box">
              <div class="mkt-label">Legenda:</div>
              <div class="mkt-texto mkt-legenda">{{ p.legenda }}</div>
              <button class="mkt-copiar" @click.stop="copiarMkt(p.legenda)">📋 Copiar legenda</button>
            </div>
          </div>
        </div>
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
const mktAberto = ref(null)
const mktSalvos = ref(JSON.parse(localStorage.getItem('mkt_prontos') || '{}'))
const mktBusca = ref('')
const mktFiltroCanal = ref(null)

function copiarMkt(texto) {
  navigator.clipboard.writeText(texto).catch(() => {
    const ta = document.createElement('textarea')
    ta.value = texto
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
  })
}

function mktToggle(id) {
  const obj = { ...mktSalvos.value }
  if (obj[id]) delete obj[id]
  else obj[id] = true
  mktSalvos.value = obj
  localStorage.setItem('mkt_prontos', JSON.stringify(obj))
}

const marketingPrompts = [
  // ── DOR DIRETA (1-12) ──
  {
    id: 1,
    titulo: 'PC ocupado de novo?',
    canais: ['feed', 'facebook', 'whatsapp'],
    prompt: 'Crie uma imagem realista para post no Instagram (formato quadrado 1:1) de um técnico ou técnica de enfermagem em uniforme hospitalar, segurando um celular com as duas mãos, olhando para a tela com expressão aliviada. Ao fundo, visível, um computador de hospital (estilo carrinho ou suporte de parede) com a tela congelada/travada. O ambiente é um corredor ou posto de enfermagem com iluminação fria e profissional. Na imagem, inclua os textos: título grande no topo "PC ocupado de novo?" em letras brancas e grossas; abaixo "Suas anotações de enfermagem no celular. Funciona sem internet." em letras menores; três bullets no canto inferior esquerdo: "Texto pronto pra copiar | Pendências com notificação | Zero papel perdido". Use o ícone que vou enviar como anexo no canto inferior direito sem alterar suas cores ou formato. Estilo foto realista de campanha publicitária hospitalar.',
    legenda: 'PC ocupado de novo? 😅\n\nEnquanto você espera o computador liberar, suas anotações podem estar prontas no celular.\n\nO Plantão é o app que transforma seu celular em uma ferramenta de trabalho durante o plantão:\n• Texto formatado pronto pra copiar\n• Funciona sem internet (subsolo, elevador, área rural)\n• Pendências com notificação pra não esquecer nada\n• Zero papel perdido ou molhado\n\n📲 Baixe grátis: plantao.net\n\n#Enfermagem #Plantao #TecnicoDeEnfermagem #AppDeEnfermagem #AnotacoesDeEnfermagem #EnfermeirosDoBrasil'
  },
  {
    id: 2,
    titulo: 'Caiu a internet? Nem percebi.',
    canais: ['feed', 'facebook'],
    prompt: 'Crie uma imagem realista de uma técnica de enfermagem segurando um celular em um corredor de hospital com iluminação fria. Ela está sorrindo, resolvida. Ao fundo, levemente desfocado, um aviso ou placa escrito "Sem sinal" ou um roteador com um X vermelho — mas ela não se importa, está usando o celular tranquilamente. Texto grande na imagem, no topo: "Caiu a internet? Nem percebi." em letras brancas. Texto menor abaixo: "O Plantão funciona offline. Anota no celular, sincroniza quando voltar." Use o ícone que vou enviar como anexo no canto inferior direito. Estilo foto realista, iluminação hospitalar fria.',
    legenda: 'Caiu a internet? Nem percebi. 📶\n\nSubsolo, área rural, elevador, rede que caiu no meio do plantão — o Plantão continua funcionando.\n\nVocê anota tudo no celular, e quando a internet volta, sincroniza automaticamente. Não perde nenhuma informação.\n\n📲 plantao.net — gratuito\n\n#Enfermagem #InternetCaiu #PlantaoHospitalar #AppOffline #TecnicoDeEnfermagem'
  },
  {
    id: 3,
    titulo: 'Esqueceu uma pendência?',
    canais: ['feed', 'facebook'],
    prompt: 'Crie uma imagem realista de uma enfermeira no meio do plantão, expressão de "algo está errado" — uma mão na testa, lembrando de algo que esqueceu. Ao fundo, um relógio de parede marcando horário avançado e outro profissional saindo do plantão. O clima é de cansaço e sobrecarga. Mas na outra mão dela, um celular com o logo do Plantão e plantao.net na tela. Texto grande no topo: "Aquela pendência das 6h que você lembrou às 18h." em letras brancas. Texto menor: "O Plantão notifica. Você não esquece mais." Use o ícone que vou enviar como anexo no canto inferior direito. Estilo foto realista, iluminação fria hospitalar.',
    legenda: 'Aquela pendência das 6h que você lembrou às 18h. 😰\n\nTodo enfermeiro conhece esse momento.\n\nCom o Plantão você cria pendências com notificação programada. Na hora certa, seu celular avisa. Não depende da sua memória.\n\n📲 plantao.net\n\n#Enfermagem #PendenciasDePlantao #TecnicoDeEnfermagem #AppDeEnfermagem #PlantaoHospitalar'
  },
  {
    id: 4,
    titulo: 'Papel molhou de novo?',
    canais: ['feed', 'facebook'],
    prompt: 'Crie uma imagem realista de close-up de um bloco de papel de enfermagem molhado, manchado, com a tinta borrada e ilegível. Ao lado, um celular seco e limpo com o logo do Plantão e plantao.net na tela. Fundo escuro com iluminação fria. Texto grande no topo: "Papel molhou de novo?" em branco. Abaixo: "Suas anotações no celular. Secas, legíveis, organizadas." Use o ícone que vou enviar como anexo no canto inferior direito. Estilo foto realista dramática.',
    legenda: 'Papel molhou de novo? 🌊📄\n\nÁlcool, água, soro, café — tudo vira inimigo do papel no plantão.\n\nCom o Plantão suas anotações ficam no celular. Secas, legíveis, organizadas e sincronizadas.\n\n📲 plantao.net\n\n#Enfermagem #Plantao #TecnicoDeEnfermagem #AppDeEnfermagem #Organizacao'
  },
  {
    id: 5,
    titulo: 'Letra de enfermeiro ninguém merece',
    canais: ['feed'],
    prompt: 'Crie uma imagem de close-up de um papel de anotação hospitalar com letra difícil de ler, rasuras, rabiscos. Ao lado, um celular com o logo do Plantão e plantao.net mostrando um texto limpo e formatado. Contraste claro entre o papel confuso e o celular organizado. Iluminação fria, fundo escuro. Texto na imagem: "Letra de enfermeiro ninguém merece. O Plantão formata pra você." em branco. Use o ícone que vou enviar como anexo no canto inferior direito. Estilo foto realista.',
    legenda: 'Letra de enfermeiro ninguém merece — nem você, nem o sistema. 🖊️❌\n\nCom o Plantão você digita e o texto já sai formatado. Copia e cola direto no sistema do hospital. Sem rasura, sem releitura, sem estresse.\n\n📲 plantao.net\n\n#Enfermagem #TecnicoDeEnfermagem #AnotacoesDeEnfermagem #AppDeEnfermagem #Plantao'
  },
  {
    id: 6,
    titulo: 'Passagem de plantão corrida?',
    canais: ['feed', 'facebook', 'whatsapp'],
    prompt: 'Crie uma imagem realista de um grupo de enfermeiros na passagem de plantão, em volta de uma mesa ou balcão, com papéis espalhados. Um deles está segurando um celular com o logo do Plantão e plantao.net na tela, como se estivesse lendo as anotações do dia. Ambiente noturno, iluminação fria de hospital. Texto no topo: "Passagem de plantão corrida? Suas anotações organizadas no celular." em branco. Use o ícone que vou enviar como anexo no canto inferior direito. Estilo foto realista de cena hospitalar.',
    legenda: 'Passagem de plantão corrida? 😰\n\nTodo mundo falando ao mesmo tempo, papéis voando, informações se perdendo.\n\nCom o Plantão suas anotações estão organizadas no celular. Na passagem de plantão, você tem tudo na mão, legível e completo.\n\n📲 plantao.net\n\n#Enfermagem #PassagemDePlantao #TecnicoDeEnfermagem #Organizacao #AppDeEnfermagem'
  },
  {
    id: 7,
    titulo: 'Três folhas de evolução e sumiu',
    canais: ['feed'],
    prompt: 'Crie uma imagem de uma mão segurando várias folhas de evolução amassadas e soltas, algumas caindo. Na outra mão, um celular com o logo do Plantão e plantao.net na tela. Fundo de posto de enfermagem desfocado. Texto na imagem: "Três folhas de evolução e uma sumiu. No celular nenhuma se perde." em branco. Use o ícone que vou enviar como anexo no canto inferior direito. Estilo foto realista.',
    legenda: 'Três folhas de evolução e uma sumiu. 📄🔍\n\nNo celular, nenhuma se perde. Todas organizadas, sincronizadas, disponíveis.\n\n📲 plantao.net — gratuito\n\n#Enfermagem #Plantao #TecnicoDeEnfermagem #Evolucao #AppDeEnfermagem'
  },
  {
    id: 8,
    titulo: 'Escreveu errado? Rasurou?',
    canais: ['feed', 'facebook'],
    prompt: 'Crie uma imagem de close-up de um papel de enfermagem cheio de rasuras, corretivo, palavras riscadas. Parece uma folha de evolução que foi corrigida várias vezes. Ao lado, um celular com o logo do Plantão e plantao.net mostrando texto limpo e arrumado. Iluminação fria. Texto: "Escreveu errado? Rasurou? No Plantão você apaga e escreve de novo. Sem rasura." em branco. Use o ícone que vou enviar como anexo no canto inferior direito. Estilo foto realista.',
    legenda: 'Escreveu errado? Rasurou? 🖊️❌\n\nNo celular não tem rasura. Você apaga, corrige, e o texto sai perfeito.\n\n📲 plantao.net\n\n#Enfermagem #TecnicoDeEnfermagem #AnotacoesDeEnfermagem #Plantao'
  },
  {
    id: 9,
    titulo: 'Sistema do hospital lento?',
    canais: ['feed', 'story', 'facebook'],
    prompt: 'Crie uma imagem realista de uma enfermeira ao lado de um computador de hospital com uma ampulheta ou círculo de carregamento na tela — o sistema claramente travado. Ela está de pé, segurando o celular com o logo do Plantão e plantao.net na tela, com expressão de quem não está preocupada. Fundo de corredor hospitalar. Texto grande: "Sistema do hospital lento? Anota no celular enquanto espera." em branco. Use o ícone que vou enviar como anexo no canto inferior direito. Estilo foto realista.',
    legenda: 'Sistema do hospital lento? 💻🐌\n\nEm vez de esperar o PC liberar, anota no celular. Quando o sistema voltar, é só copiar e colar.\n\n📲 plantao.net\n\n#Enfermagem #TecnicoDeEnfermagem #Plantao #AppDeEnfermagem #SistemaLento'
  },
  {
    id: 10,
    titulo: 'O bolso do jaleco não é arquivo',
    canais: ['feed', 'facebook'],
    prompt: 'Crie uma imagem realista e bem iluminada de um jaleco de enfermagem pendurado. Do bolso do jaleco, vários papéis amassados e dobrados estão saindo, quase caindo. Ao lado, uma mão segura um celular com o logo do Plantão e plantao.net na tela. O contraste é claro: papéis bagunçados vs. celular organizado. Iluminação fria hospitalar, fundo neutro. Texto grande no topo: "O bolso do jaleco não é arquivo." em letras brancas. Abaixo: "Seus registros no celular. Sem papel amassado." Use o ícone que vou enviar como anexo no canto inferior direito. Estilo foto realista.',
    legenda: 'O bolso do jaleco não é arquivo. 👚📄\n\nPapel amassado, molhado, rasgado, perdido — todo enfermeiro já passou por isso.\n\nCom o Plantão, suas anotações ficam no celular, organizadas e sincronizadas na nuvem.\n\n📲 plantao.net — gratuito\n\n#Enfermagem #Plantao #TecnicoDeEnfermagem #MenosPapel #Organizacao'
  },
  {
    id: 11,
    titulo: 'Cada enfermeiro já perdeu um papel',
    canais: ['feed'],
    prompt: 'Crie uma imagem realista de close-up de uma mão de enfermeiro segurando um papel amassado e manchado (simulando água ou suor), com aspecto de "não serve mais". O papel está ilegível. A outra mão segura um celular com o logo do Plantão e plantao.net na tela. Iluminação dramática: fundo escuro, luz destacando as mãos. Texto na imagem: "Cada enfermeiro já perdeu um papel no plantão." em letras brancas. Abaixo: "O Plantão resolve." Use o ícone que vou enviar como anexo no canto inferior direito. Estilo foto realista, tons frios.',
    legenda: 'Cada enfermeiro já perdeu um papel no plantão. 📄❌\n\nMolhou, rasgou, o paciente derrubou, caiu no lixo sem querer, sumiu no bolso do jaleco...\n\nCom o Plantão suas anotações ficam no celular. Seguras. Organizadas. Prontas.\n\nJá aconteceu com você? Comenta aí 👇\n\n📲 plantao.net\n\n#Enfermagem #Plantao #TecnicoDeEnfermagem #AppDeEnfermagem #MemóriasDoPlantao'
  },
  {
    id: 12,
    titulo: 'Acabou a caneta? Azar o seu.',
    canais: ['feed', 'story'],
    prompt: 'Crie uma imagem de uma mão segurando uma caneta BIC transparente vazia (sem tinta), tentando escrever em um papel — mas não sai nada. Ao lado, um celular com o logo do Plantão e plantao.net na tela. Iluminação fria, fundo de plantão noturno. Texto na imagem: "Acabou a caneta? Azar o seu. O Plantão não acaba." em branco com tom bem-humorado. Use o ícone que vou enviar como anexo no canto inferior direito. Estilo foto realista.',
    legenda: 'Acabou a caneta? Azar o seu. 🖊️😅\n\nO Plantão não acaba, não falha, não molha, não rasga.\n\n📲 plantao.net\n\n#Enfermagem #Plantao #TecnicoDeEnfermagem #AppDeEnfermagem #HumorEnfermagem'
  },

  // ── BENEFÍCIO DIRETO (13-24) ──
  {
    id: 13,
    titulo: 'Anota no celular. Cola no sistema.',
    canais: ['feed', 'facebook'],
    prompt: 'Crie uma imagem realista de uma enfermeira em ambiente hospitalar. Ela está ao lado de um computador de hospital (estilo suporte de parede ou carrinho). Com uma mão segura o celular mostrando o logo do Plantão e plantao.net na tela, e com a outra mão está usando o mouse do computador — como se estivesse copiando a anotação do celular para o sistema. O foco está nas mãos e no fluxo celular para computador. Iluminação fria, profissional, hospitalar. No topo, em letras limpas e grandes: "Anota no celular. Cola no sistema." Use o ícone que vou enviar como anexo no canto inferior direito. Estilo foto realista de alta qualidade.',
    legenda: 'Anota no celular. Cola no sistema. 🔄\n\nEsse é o fluxo: você anota durante o plantão no celular, o app formata o texto, e na hora que senta no computador é só copiar e colar.\n\nSem redigitar. Sem papel. Sem perder tempo.\n\n📲 plantao.net\n\n#Enfermagem #TecnicoDeEnfermagem #AnotacoesDeEnfermagem #AppDeEnfermagem #CopiarEColar'
  },
  {
    id: 14,
    titulo: '3 coisas que você não precisa mais',
    canais: ['feed', 'carrossel'],
    prompt: 'Crie uma imagem limpa e conceitual para post no Instagram (formato quadrado 1:1). Uma mesa de hospital com três objetos: (1) um bloco de papel amassado, (2) uma caneta quebrada, (3) um computador com tela azul de erro. Todos com aspecto de "não servem mais". Ao lado, um celular moderno brilhando com o logo do Plantão e plantao.net na tela. Iluminação fria, fundo escuro. Texto grande na imagem: "3 coisas que você não precisa mais no plantão." e abaixo: "Papel • Caneta • PC ocupado". Estilo foto realista editorial. Use o ícone que vou enviar como anexo no canto inferior direito.',
    legenda: '3 coisas que você não precisa mais no plantão:\n\n📝 Papel que molha/rasga/perde\n🖊️ Caneta que some\n💻 PC que tá sempre ocupado\n\nSó precisa do celular e do Plantão.\n\nTexto formatado, pendências com notificação, funciona offline, copia e cola no sistema.\n\n📲 plantao.net — gratuito\n\n#Enfermagem #Plantao #AppDeEnfermagem #MenosPapel #TecnicoDeEnfermagem'
  },
  {
    id: 15,
    titulo: 'Seu plantão no controle',
    canais: ['feed'],
    prompt: 'Crie uma imagem realista de uma enfermeira durante o plantão hospitalar. Ela está em um corredor de hospital, segurando um celular com uma mão. Na tela do celular aparece o logo do Plantão e o texto plantao.net. O ambiente ao fundo mostra movimento de plantão — outros profissionais, macas — mas ela está calma, no controle. Iluminação com contraste entre o azul escuro do ambiente e a luz suave do celular. No canto superior direito, em letras brancas limpas: "Seu plantão no controle." Use o ícone que vou enviar como anexo no canto inferior direito. Estilo foto realista de campanha publicitária profissional.',
    legenda: 'Seu plantão no controle. 📱\n\nEm meio ao caos do plantão, ter as anotações organizadas no celular faz toda diferença.\n\n• Anotações prontas em segundos\n• Pendências que não escapam\n• Tudo offline\n• Copia direto pro sistema\n\n📲 plantao.net\n\n#Enfermagem #Plantao #TecnicoDeEnfermagem #Organizacao #AppDeEnfermagem'
  },
  {
    id: 16,
    titulo: 'Texto pronto em segundos',
    canais: ['feed', 'facebook'],
    prompt: 'Crie uma imagem de um celular segurado por mãos de enfermeiro, com a tela mostrando um texto de anotação formatado e limpo. Ao lado, um papel com o mesmo texto mas cheio de rasuras e rabiscos. Fundo hospitalar desfocado. Texto na imagem: "Enquanto você escreve no papel, o Plantão já formatou." em branco. Use o ícone que vou enviar como anexo no canto inferior direito. Estilo foto realista com contraste claro.',
    legenda: 'Enquanto você escreve no papel, o Plantão já formatou. ⚡\n\nTexto pronto, organizado e bonito em segundos. Copia direto pro sistema.\n\n📲 plantao.net\n\n#Enfermagem #TecnicoDeEnfermagem #AnotacoesDeEnfermagem #Plantao #Praticidade'
  },
  {
    id: 17,
    titulo: 'Modelos que salvam seu tempo',
    canais: ['feed'],
    prompt: 'Crie uma imagem de close-up de um celular com a tela mostrando o logo do Plantão e plantao.net. Ao redor, pequenos ícones flutuando: checkboxes, modelos de texto, curativos, medicamentos. Fundo azul escuro hospitalar. Texto na imagem: "Modelos prontos pra cada tipo de anotação. Você só preenche o essencial." em branco. Use o ícone que vou enviar como anexo no canto inferior direito. Estilo foto realista editorial.',
    legenda: 'Modelos prontos pra cada tipo de anotação. 📋\n\nCurativos, medicamentos, evolução, passagem de plantão — você só preenche o que muda. O resto o app formata.\n\n📲 plantao.net\n\n#Enfermagem #TecnicoDeEnfermagem #AnotacoesDeEnfermagem #AppDeEnfermagem #Plantao'
  },
  {
    id: 18,
    titulo: 'Sinais vitais organizados',
    canais: ['feed', 'facebook'],
    prompt: 'Crie uma imagem realista de uma enfermeira com um aparelho de sinais vitais (medidor de pressão, oxímetro) em um paciente. Na outra mão, o celular com o logo do Plantão e plantao.net na tela — como se estivesse registrando os sinais na hora. Fundo de leito hospitalar, iluminação fria. Texto na imagem: "Sinais vitais na hora certa, do jeito certo." em branco. Use o ícone que vou enviar como anexo no canto inferior direito. Estilo foto realista.',
    legenda: 'Sinais vitais organizados, do seu jeito. ❤️\n\nRegistre PA, pulso, temperatura, saturação e tudo mais direto no celular. Na hora de copiar pro sistema, já está tudo certinho.\n\n📲 plantao.net\n\n#Enfermagem #SinaisVitais #TecnicoDeEnfermagem #Plantao #AppDeEnfermagem'
  },
  {
    id: 19,
    titulo: 'Pendências que não escapam',
    canais: ['feed'],
    prompt: 'Crie uma imagem de um celular com uma notificação na tela, mostrando o logo do Plantão e plantao.net. Ao fundo, uma enfermeira olhando para o relógio com expressão de "lembrei!" — como se a notificação tivesse acabado de salvar o dia. Ambiente hospitalar noturno, iluminação fria. Texto na imagem: "Pendência na hora certa. Nem antes, nem depois." em branco. Use o ícone que vou enviar como anexo no canto inferior direito. Estilo foto realista.',
    legenda: 'Pendências que não escapam. ⏰\n\nVocê programa a notificação e o celular avisa na hora certa. Sem depender da memória, sem esquecer o que fazer.\n\n📲 plantao.net\n\n#Enfermagem #Pendencias #Plantao #TecnicoDeEnfermagem #AppDeEnfermagem'
  },
  {
    id: 20,
    titulo: 'Notificação na hora certa',
    canais: ['feed', 'story'],
    prompt: 'Crie uma imagem vertical 9:16 de uma mão segurando um celular com uma notificação visível na tela. O logo do Plantão e plantao.net aparecem na tela. Fundo escuro com luz suave vindo do celular. Texto na imagem: "LEMBRETE: São 14h — verificar sinais. O Plantão não esquece." em branco. Estilo foto realista noturno.',
    legenda: 'Seu celular avisando na hora certa. Sem stress, sem esquecimento.\n\n📲 plantao.net\n\n#Enfermagem #Plantao #Lembrete #AppDeEnfermagem'
  },
  {
    id: 21,
    titulo: 'Funciona offline — sempre',
    canais: ['feed', 'whatsapp'],
    prompt: 'Crie uma imagem de uma técnica de enfermagem no corredor de um hospital, segurando o celular com o logo do Plantão e plantao.net na tela. Um aviso de "Sem sinal" aparece no topo do celular — mas ela continua usando o app tranquilamente. Fundo de hospital com iluminação fria. Texto na imagem: "Sem sinal? Sem problema. O Plantão funciona offline." em branco. Use o ícone que vou enviar como anexo no canto inferior direito. Estilo foto realista.',
    legenda: 'Sem sinal? Sem problema. 📶🚫\n\nO Plantão funciona offline. Anota tudo no celular durante o plantão, e quando a internet volta, sincroniza automaticamente.\n\n📲 plantao.net\n\n#Enfermagem #Offline #TecnicoDeEnfermagem #Plantao #AppDeEnfermagem'
  },
  {
    id: 22,
    titulo: 'Copia e cola — pronto',
    canais: ['feed', 'facebook'],
    prompt: 'Crie uma imagem de close-up de duas mãos: uma segurando um celular com o logo do Plantão e plantao.net na tela, e a outra mão usando o mouse de um computador. Uma seta sutil conectando os dois: "copiar → colar". Fundo hospitalar desfocado. Texto na imagem: "Copia. Cola. Pronto." em letras grandes e brancas. Use o ícone que vou enviar como anexo no canto inferior direito. Estilo foto realista limpo.',
    legenda: 'Copia. Cola. Pronto. ✅\n\nO texto já sai formatado do celular. É só copiar e colar no sistema do hospital.\n\n📲 plantao.net\n\n#Enfermagem #TecnicoDeEnfermagem #Plantao #CopiarEColar #AppDeEnfermagem'
  },
  {
    id: 23,
    titulo: 'WhatsApp — App gratuito',
    canais: ['whatsapp'],
    prompt: 'Crie uma imagem quadrada 1:1 limpa e informativa. Um celular com a tela mostrando o logo do Plantão e o texto plantao.net. Ao redor do celular, pequenos ícones sutis: Wi-Fi com risco (offline), checkmark (pronto), relógio (pendências). Fundo azul escuro hospitalar. Texto grande: "APP GRATUITO PARA ENFERMAGEM" em branco. Abaixo: "Anotações • Pendências • Offline • Copia e cola". Bottom: "plantao.net". Use o ícone que vou enviar como anexo no canto inferior direito. Estilo foto realista limpo.',
    legenda: 'Galera, descobri um app que salvou meu plantão: Plantão! 🚑\n\nVocês anotam tudo no celular (funciona sem internet), o texto já sai formatado, e na hora que o PC libera é só copiar e colar no sistema. Pendências com notificação também.\n\nÉ grátis: plantao.net\n\nCompartilha com a equipe! 💙'
  },
  {
    id: 24,
    titulo: 'WhatsApp — Sua equipe merece',
    canais: ['whatsapp'],
    prompt: 'Crie uma imagem quadrada 1:1 com uma composição mostrando vários celulares (3 ou 4) em diferentes mãos de enfermeiros, todos com o logo do Plantão e plantao.net na tela. Ideia de "a equipe toda usando". Fundo hospitalar desfocado, iluminação fria. Texto grande no topo: "SUA EQUIPE MERECE ORGANIZAÇÃO" em branco. Abaixo: "App gratuito de anotações de enfermagem. Cada um no seu celular, tudo sincronizado." Bottom: "plantao.net". Use o ícone que vou enviar como anexo. Estilo foto realista.',
    legenda: 'Pessoal, apresentando o app que a gente tava precisando: Plantão!\n\n✅ Anotações prontas em segundos\n✅ Funciona sem internet\n✅ Pendências com notificação\n✅ Copia direto pro sistema do hospital\n✅ Grátis\n\nBasta entrar em plantao.net e criar conta. Bora testar? 💪'
  },

  // ── VIBE/EMOCIONAL (25-33) ──
  {
    id: 25,
    titulo: 'Você cuida, o Plantão anota',
    canais: ['feed'],
    prompt: 'Crie uma imagem emocional e profissional de uma enfermeira em um leito hospitalar, ajustando o acesso ou o soro de um paciente idoso. Ela está com uma mão no paciente e a outra segurando um celular com o logo do Plantão e plantao.net na tela — como se tivesse acabado de anotar algo e agora está cuidando. O paciente está calmo, olhando para ela com confiança. Iluminação profissional, fundo de enfermaria com luz suave. Texto na imagem, canto superior esquerdo: "Você cuida. O Plantão anota." em letras elegantes. Use o ícone que vou enviar como anexo no canto inferior direito. Estilo foto realista emocional.',
    legenda: 'Você cuida. O Plantão anota. 💙\n\nNo fim do dia, o que importa é o cuidado com o paciente. As anotações são só o registro.\n\nMas quando o registro é rápido, sobra mais tempo pro que realmente importa.\n\n📲 plantao.net\n\n#Enfermagem #Cuidado #TecnicoDeEnfermagem #Paciente #Enfermeiros #Humanização'
  },
  {
    id: 26,
    titulo: 'Enfermagem não é burocracia',
    canais: ['feed'],
    prompt: 'Crie uma imagem com estilo conceitual e editorial. Close-up de um jaleco ou uniforme de enfermagem com um crachá. Na mão da enfermeira, um celular com o logo do Plantão e plantao.net visíveis na tela. Ao fundo, muito desfocado (bokeh), luzes de hospital e movimento suave. Iluminação dramática — contraste entre luz no celular e fundo frio. Texto na imagem em letras elegantes: "Enfermagem não é burocracia." em branco. Abaixo, menor: "As anotações são só o registro. O cuidado é o que importa." Use o ícone que vou enviar como anexo no canto inferior direito. Estilo foto realista editorial.',
    legenda: 'Enfermagem não é burocracia. 💙\n\nVocê estudou pra cuidar, não pra preencher papel. Mas as anotações precisam ser feitas.\n\nO Plantão existe pra fazer a parte chata voar, pra sobrar mais tempo pro que realmente importa: o paciente.\n\n📲 plantao.net\n\n#Enfermagem #Cuidado #TecnicoDeEnfermagem #Valorização #AppDeEnfermagem'
  },
  {
    id: 27,
    titulo: 'Mãos que cuidam',
    canais: ['feed'],
    prompt: 'Crie uma imagem emocional em close-up de duas mãos de enfermagem: uma mão segurando a mão de um paciente idoso e a outra mão segurando um celular com o logo do Plantão e plantao.net na tela. Fundo suave, iluminação quente (contrastando com o frio hospitalar). Texto elegante no canto: "Mãos que cuidam. Apps que ajudam." em branco. Use o ícone que vou enviar como anexo no canto inferior direito. Estilo foto realista emocional.',
    legenda: 'Mãos que cuidam. Apps que ajudam. 🤲💙\n\nA tecnologia não substitui o cuidado humano — ela dá tempo pra ele acontecer.\n\n📲 plantao.net\n\n#Enfermagem #Cuidado #Humanização #TecnicoDeEnfermagem #Plantao'
  },
  {
    id: 28,
    titulo: 'Cuidar de quem cuida',
    canais: ['feed'],
    prompt: 'Crie uma imagem de uma enfermeira sentada na sala de descanso do hospital, segurando uma xícara de café em uma mão e o celular com o logo do Plantão e plantao.net na outra. Ela está cansada mas sorrindo, com expressão de "finalmente terminei as anotações". Ambiente de descanso, luz suave. Texto na imagem: "Cuidar de quem cuida também é deixar o plantão mais leve." em branco. Use o ícone que vou enviar como anexo no canto inferior direito. Estilo foto realista.',
    legenda: 'Cuidar de quem cuida também é oferecer ferramentas que facilitam o dia. 💙\n\nCom o Plantão, suas anotações ficam prontas em segundos. Menos tempo no papel, mais tempo pra você.\n\n📲 plantao.net\n\n#Enfermagem #Cuidado #SaudeMental #Plantao #TecnicoDeEnfermagem'
  },
  {
    id: 29,
    titulo: 'A tecnologia a serviço do cuidado',
    canais: ['feed', 'facebook'],
    prompt: 'Crie uma imagem conceitual: de um lado, uma mão segurando um celular com o logo do Plantão e plantao.net na tela; do outro lado, uma mão segurando a mão de um paciente. As duas mãos estão conectadas visualmente por uma linha de luz sutil. Fundo escuro com iluminação dramática. Texto: "Tecnologia a serviço do cuidado." em letras elegantes. Use o ícone que vou enviar como anexo no canto inferior direito. Estilo foto realista conceitual.',
    legenda: 'Tecnologia a serviço do cuidado. 🌐💙\n\nO Plantão não substitui o enfermeiro — ele dá mais tempo pro que realmente importa.\n\n📲 plantao.net\n\n#Enfermagem #Cuidado #Tecnologia #Humanização #Plantao'
  },
  {
    id: 30,
    titulo: 'Foco no que importa',
    canais: ['feed'],
    prompt: 'Crie uma imagem de uma enfermeira olhando diretamente para a câmera, com um sorriso profissional. Ela segura um celular com o logo do Plantão e plantao.net na tela junto ao peito. Fundo hospitalar desfocado com bokeh de luzes. Texto na imagem: "Foco no que importa: o paciente." em letras limpas e elegantes. Use o ícone que vou enviar como anexo no canto inferior direito. Estilo foto realista profissional.',
    legenda: 'Foco no que importa: o paciente. 🎯💙\n\nO Plantão cuida das anotações pra você cuidar do que realmente importa.\n\n📲 plantao.net\n\n#Enfermagem #Cuidado #Foco #TecnicoDeEnfermagem #Plantao'
  },
  {
    id: 31,
    titulo: 'Plantão mais leve',
    canais: ['feed'],
    prompt: 'Crie uma imagem de uma enfermeira andando pelo corredor do hospital com passos leves e confiantes, segurando um celular com o logo do Plantão e plantao.net na tela. Ao fundo, outros profissionais correndo com papéis na mão — ela é a única calma. Iluminação fria, porém com um tom mais claro e otimista. Texto: "Plantão mais leve. Anotação mais rápida." em branco. Use o ícone que vou enviar como anexo no canto inferior direito. Estilo foto realista.',
    legenda: 'Plantão mais leve. Anotação mais rápida. 🚶‍♀️💨\n\nEnquanto todo mundo corre atrás de papel, você já terminou.\n\n📲 plantao.net\n\n#Enfermagem #Plantao #TecnicoDeEnfermagem #AppDeEnfermagem #Organizacao'
  },
  {
    id: 32,
    titulo: 'Organização é cuidado',
    canais: ['feed'],
    prompt: 'Crie uma imagem de close-up de um celular com o logo do Plantão e plantao.net na tela, apoiado sobre um balcão de posto de enfermagem limpo e organizado. Ao fundo, um ambiente hospitalar arrumado, com pastas e materiais nos lugares. Iluminação fria profissional. Texto: "Organização não é burocracia. Organização é cuidado." em branco. Use o ícone que vou enviar como anexo no canto inferior direito. Estilo foto realista editorial.',
    legenda: 'Organização não é burocracia. Organização é cuidado. 📱✨\n\nQuando as anotações estão em ordem, sobra espaço mental pro que realmente importa.\n\n📲 plantao.net\n\n#Enfermagem #Organizacao #Cuidado #TecnicoDeEnfermagem #Plantao'
  },
  {
    id: 33,
    titulo: 'Seu bolso merecia um descanso',
    canais: ['feed'],
    prompt: 'Crie uma imagem de close-up de um jaleco de enfermagem pendurado, com o bolso vazio e limpo — sem papéis saindo. Ao lado, um celular com o logo do Plantão e plantao.net na tela. O contraste com as imagens de bolso cheio de papel é proposital. Texto: "Seu bolso merecia um descanso. Todo o plantão no celular." em branco. Use o ícone que vou enviar como anexo no canto inferior direito. Estilo foto realista limpo.',
    legenda: 'Seu bolso merecia um descanso. 👚✨\n\nNada de papel amassado, molhado ou perdido. Todo o plantão no celular.\n\n📲 plantao.net\n\n#Enfermagem #TecnicoDeEnfermagem #Plantao #AppDeEnfermagem #Organizacao'
  },

  // ── PROVA SOCIAL (34-38) ──
  {
    id: 34,
    titulo: 'Já são mais de 100 enfermeiros',
    canais: ['feed', 'facebook'],
    prompt: 'Crie uma imagem de um grupo de profissionais de enfermagem (diversos) em um corredor de hospital, cada um segurando um celular com o logo do Plantão e plantao.net na tela. Eles estão conversando e sorrindo. Ambiente de união e equipe. Texto grande: "Já são mais de 100 enfermeiros usando o Plantão." em branco. Abaixo: "E você, ainda usa papel?" Use o ícone que vou enviar como anexo no canto inferior direito. Estilo foto realista de grupo.',
    legenda: 'Já são mais de 100 enfermeiros usando o Plantão. 🎉\n\nAos poucos, o papel vai ficando de lado. Vem com a gente?\n\n📲 plantao.net — gratuito\n\n#Enfermagem #Comunidade #TecnicoDeEnfermagem #Plantao #AppDeEnfermagem'
  },
  {
    id: 35,
    titulo: 'Enfermeira recomenda',
    canais: ['feed', 'story'],
    prompt: 'Crie uma imagem de uma enfermeira segurando um celular com o logo do Plantão e plantao.net na tela, fazendo joinha com a mão livre. Fundo hospitalar desfocado. Texto grande: "ENFERMEIRA RECOMENDA" em branco. Abaixo: "App gratuito de anotações • plantao.net" em letras menores. Use o ícone que vou enviar como anexo no canto inferior direito. Estilo foto realista com tom de depoimento.',
    legenda: 'Enfermeira recomenda ✅\n\nDe profissional pra profissional: o Plantão salva tempo, papel e paciência.\n\n📲 plantao.net\n\n#Enfermagem #Recomendo #TecnicoDeEnfermagem #Plantao #AppDeEnfermagem'
  },
  {
    id: 36,
    titulo: 'Já pensou em testar?',
    canais: ['feed', 'facebook'],
    prompt: 'Crie uma imagem de close-up de uma mão de enfermeira apontando para a tela de um celular que mostra o logo do Plantão e plantao.net. A outra mão está segurando o celular. Fundo de plantão noturno. Texto na imagem: "Já pensou em testar o Plantão? É grátis." em letras brancas com tom curioso. Use o ícone que vou enviar como anexo no canto inferior direito. Estilo foto realista.',
    legenda: 'Já pensou em testar o Plantão? 🤔\n\nÉ grátis, funciona sem internet, e você vai se perguntar como não usou antes.\n\n📲 plantao.net\n\n#Enfermagem #TesteiEAprovei #TecnicoDeEnfermagem #Plantao #AppDeEnfermagem'
  },
  {
    id: 37,
    titulo: 'Aos poucos o papel vai ficando',
    canais: ['feed'],
    prompt: 'Crie uma imagem de uma mesa de posto de enfermagem. De um lado, uma pilha de papéis usados, amassados. Do outro, um celular com o logo do Plantão e plantao.net brilhando. No centro, uma seta sutil indicando a transição: do papel para o celular. Iluminação fria. Texto: "Aos poucos, o papel vai ficando de lado." em branco. Use o ícone que vou enviar como anexo no canto inferior direito. Estilo foto realista conceitual.',
    legenda: 'Aos poucos, o papel vai ficando de lado. 📄➡️📱\n\nNão é sobre abandonar tudo de uma vez. É sobre descobrir que existe um jeito mais fácil.\n\n📲 plantao.net\n\n#Enfermagem #TransicaoDigital #TecnicoDeEnfermagem #Plantao #AppDeEnfermagem'
  },
  {
    id: 38,
    titulo: 'Todo mundo merece um app assim',
    canais: ['feed', 'whatsapp'],
    prompt: 'Crie uma imagem de várias mãos de enfermeiros (diferentes tons de pele) segurando cada uma um celular com o logo do Plantão e plantao.net na tela. Mãos sobrepostas em composição de união e diversidade. Fundo escuro com iluminação destacando as mãos. Texto: "Todo profissional de enfermagem merece um app assim." em branco. Use o ícone que vou enviar como anexo no canto inferior direito. Estilo foto realista emocional e inclusivo.',
    legenda: 'Todo profissional de enfermagem merece ferramentas que facilitam o dia. 💙\n\nO Plantão é gratuito e feito pra você.\n\n📲 plantao.net\n\n#Enfermagem #Diversidade #TecnicoDeEnfermagem #Plantao #AppDeEnfermagem'
  },

  // ── HUMOR/ENGAJAMENTO (39-43) ──
  {
    id: 39,
    titulo: 'PC ocupado é parente do que nunca volta',
    canais: ['feed', 'story'],
    prompt: 'Crie uma imagem bem-humorada de um computador de hospital com a tela congelada e um bilhete grudado no monitor escrito "VOLTO EM 10 MIN" — mas já é noite e o bilhete está amarelado de velho. Ao lado, uma enfermeira no celular com o logo do Plantão e plantao.net na tela, dando um sorriso irônico. Iluminação fria hospitalar. Texto: "PC ocupado é parente do \'já volto\' que nunca volta." em branco. Use o ícone que vou enviar como anexo no canto inferior direito. Estilo foto realista com tom de humor.',
    legenda: 'PC ocupado é parente do "já volto" que nunca volta. 😂💻\n\nEnquanto o PC não libera, anota no celular. Quando liberar, é só copiar.\n\n📲 plantao.net\n\n#Enfermagem #Humor #TecnicoDeEnfermagem #Plantao #AppDeEnfermagem'
  },
  {
    id: 40,
    titulo: 'Quem nunca perdeu um papel?',
    canais: ['feed', 'story'],
    prompt: 'Crie uma imagem de uma enfermeira com uma mão no bolso do jaleco, expressão de "cadê?", procurando algo. No bolso oposto, um celular com o logo do Plantão e plantao.net aparece. Fundo hospitalar. Texto: "Quem nunca perdeu um papel no plantão? Atire a primeira caneta." em branco com tom bem-humorado. Use o ícone que vou enviar como anexo no canto inferior direito. Estilo foto realista engraçado.',
    legenda: 'Quem nunca perdeu um papel no plantão? Atire a primeira caneta. 🖊️😅\n\nCom o Plantão, suas anotações não se perdem mais.\n\n📲 plantao.net\n\n#Enfermagem #Humor #TecnicoDeEnfermagem #MemoriasDoPlantao #Plantao'
  },
  {
    id: 41,
    titulo: 'O terceiro turno é o mais difícil',
    canais: ['feed'],
    prompt: 'Crie uma imagem de uma enfermeira no período noturno, visivelmente cansada mas ainda de pé, segurando um celular com o logo do Plantão e plantao.net na tela. O celular ilumina o rosto dela na penumbra do plantão noturno. Relógio na parede marcando 3h ou 4h da manhã. Texto com tom empático: "O terceiro turno é o mais difícil. O Plantão não cansa." em branco. Use o ícone que vou enviar como anexo no canto inferior direito. Estilo foto realista noturno.',
    legenda: 'O terceiro turno é o mais difícil. 😴⏰\n\nQuando o cansaço bate, o Plantão mantém suas anotações organizadas. Você só precisa copiar.\n\n📲 plantao.net\n\n#Enfermagem #PlantaoNoturno #TecnicoDeEnfermagem #Cansaco #Plantao'
  },
  {
    id: 42,
    titulo: 'Enfermagem: multitarefa nível hard',
    canais: ['feed', 'facebook'],
    prompt: 'Crie uma imagem realista de uma enfermeira fazendo várias coisas ao mesmo tempo: segurando uma pasta, olhando para um paciente, e com o celular no bolso com o logo do Plantão e plantao.net aparecendo. Uma imagem que transmite a energia multitarefa da enfermagem. Fundo de corredor movimentado. Texto bem-humorado: "Enfermagem: multitarefa nível hard. O Plantão ajuda em uma delas." em branco. Use o ícone que vou enviar como anexo no canto inferior direito. Estilo foto realista.',
    legenda: 'Enfermagem: multitarefa nível hard. 🏃‍♀️💨\n\nPelo menos as anotações a gente resolve — o resto é com você.\n\n📲 plantao.net\n\n#Enfermagem #Multitarefa #TecnicoDeEnfermagem #Humor #Plantao'
  },
  {
    id: 43,
    titulo: 'Salva esse post pra não esquecer',
    canais: ['feed', 'story'],
    prompt: 'Crie uma imagem de um celular sendo segurado por mão de enfermeira, com o logo do Plantão e plantao.net na tela. Ao redor do celular, ícones sutis de salvar, favoritar, compartilhar. Fundo azul escuro. Texto: "Salva esse post pra não esquecer. Baixa o app quando der tempo." em branco. Use o ícone que vou enviar como anexo no canto inferior direito. Estilo foto realista com tom de CTA.',
    legenda: 'Salva esse post pra não esquecer. 📌\n\nDepois que baixar, me conta o que achou!\n\n📲 plantao.net\n\n#Enfermagem #TecnicoDeEnfermagem #Plantao #AppDeEnfermagem'
  },

  // ── CARROSSEL (44-47) ──
  {
    id: 44,
    titulo: 'Carrossel — Como funciona em 3 passos',
    canais: ['carrossel'],
    prompt: 'Crie 3 imagens para carrossel no Instagram (formato quadrado 1:1):\n\nSlide 1 (Capa): Fundo azul escuro, texto centralizado "COMO FUNCIONA O PLANTÃO" em branco. Abaixo: "3 passos • 1 minuto • Gratuito" em azul. Use o ícone anexado no canto inferior direito.\n\nSlide 2 (Passos): Fundo azul escuro com 3 etapas visuais: (1) ícone de celular + "Anota durante o plantão", (2) ícone de nuvem + "Sincroniza automático", (3) ícone de computador + "Copia pro sistema". Use o ícone anexado.\n\nSlide 3 (CTA): Fundo azul escuro, texto "PRONTO. AGORA É SÓ COPIAR." em branco. Abaixo: "Baixe grátis • plantao.net • Sem cadastro complicado". Use o ícone anexado.\n\nEstilo infográfico limpo, moderno.',
    legenda: 'Como funciona o Plantão em 3 passos 🚀\n\n1️⃣ Durante o plantão, você anota tudo no celular\n2️⃣ O app sincroniza automaticamente (funciona offline!)\n3️⃣ No computador, é só copiar e colar no sistema\n\n📲 plantao.net — gratuito\n\n#Enfermagem #Tutorial #Plantao #AppDeEnfermagem'
  },
  {
    id: 45,
    titulo: 'Carrossel — 5 motivos pra largar o papel',
    canais: ['carrossel'],
    prompt: 'Crie 4 imagens para carrossel no Instagram (formato quadrado 1:1):\n\nSlide 1 (Capa): Fundo azul escuro, texto centralizado "5 MOTIVOS PRA LARGAR O PAPEL NO PLANTÃO" em branco. Use o ícone anexado.\n\nSlide 2: Fundo azul escuro. "1 — Molha" em grande. Abaixo, ícone de água + "Álcool, soro, café... o papel não resiste." em branco.\n\nSlide 3: Fundo azul escuro. "2 — Perde" em grande. Abaixo, ícone de ? + "Já perdeu um papel no meio do plantão? No celular não." em branco.\n\nSlide 4: Fundo azul escuro. "3 — Amassa" em grande. Abaixo, ícone de papel amassado + "Bolso do jaleco não é arquivo." Embaixo: "Veja os outros 2 motivos no nosso perfil!" em branco. Use o ícone anexado.\n\nEstilo infográfico limpo, moderno, mesma identidade visual.',
    legenda: '5 motivos pra largar o papel no plantão 📄➡️📱\n\n1️⃣ Molha\n2️⃣ Perde\n3️⃣ Amassa\n4️⃣ Rasga\n5️⃣ Ocupa espaço\n\nO Plantão resolve todos. 📲 plantao.net\n\n#Enfermagem #TecnicoDeEnfermagem #Plantao #AppDeEnfermagem #MenosPapel'
  },
  {
    id: 46,
    titulo: 'Carrossel — Papel vs App',
    canais: ['carrossel'],
    prompt: 'Crie 3 imagens para carrossel no Instagram (formato quadrado 1:1) comparando papel vs Plantão:\n\nSlide 1 (Capa): Fundo azul escuro, dividido ao meio: lado esquerdo "PAPEL" com fundo avermelhado, lado direito "PLANTÃO" com fundo azul. Texto: "QUAL VOCÊ ESCOLHE?" em branco. Use o ícone anexado.\n\nSlide 2 (Comparação): Esquerda: papel manchado, texto "Molha, rasga, perde, ocupa espaço". Direita: celular com logo do Plantão e plantao.net, texto "Seguro, organizado, sempre disponível".\n\nSlide 3 (CTA): Fundo azul escuro, texto "A ESCOLHA É FÁCIL" em branco. Abaixo: "Baixe grátis: plantao.net". Use o ícone anexado.\n\nEstilo infográfico de comparação.',
    legenda: 'Papel vs Plantão — qual você escolhe? 📄🤔📱\n\nDe um lado, papel que molha, rasga e perde. Do outro, o Plantão: seguro, organizado, sempre no celular.\n\n📲 plantao.net\n\n#Enfermagem #Comparacao #Plantao #AppDeEnfermagem #TecnicoDeEnfermagem'
  },
  {
    id: 47,
    titulo: 'Carrossel — Tour rápido pelo app',
    canais: ['carrossel'],
    prompt: 'Crie 4 imagens para carrossel no Instagram (formato quadrado 1:1) mostrando um tour visual:\n\nSlide 1 (Capa): Fundo azul escuro, texto "TOUR RÁPIDO PELO PLANTÃO" em branco. Abaixo: "O app que organiza seu plantão • 30 segundos" em azul. Use o ícone anexado.\n\nSlide 2: Fundo azul escuro. Ícone de texto + "Anotações prontas em segundos. Escolha o tipo, preencha, copie." Texto limpo.\n\nSlide 3: Fundo azul escuro. Ícone de sino + "Pendências com notificação. O celular avisa na hora certa."\n\nSlide 4: Fundo azul escuro. Ícone de Wi-Fi cortado + "Funciona offline. Anota sem internet, sincroniza depois." CTA: "plantao.net". Use o ícone anexado.\n\nEstilo infográfico moderno.',
    legenda: 'Tour rápido pelo Plantão 🚀\n\n📝 Anotações prontas\n🔔 Pendências com aviso\n📶 Funciona offline\n🔄 Copia pro sistema\n\nTudo gratuito em plantao.net\n\n#Enfermagem #Tour #Plantao #AppDeEnfermagem #TecnicoDeEnfermagem'
  },

  // ── STORIES (48-50) ──
  {
    id: 48,
    titulo: 'Story — Direto ao ponto',
    canais: ['story'],
    prompt: 'Crie uma imagem no formato vertical 9:16 (story Instagram) de uma técnica de enfermagem segurando um celular próximo ao rosto, sorrindo, com um fundo hospitalar desfocado com luzes noturnas. A iluminação do celular ilumina suavemente o rosto dela. Na imagem, inclua o texto: topo "VOCÊ AINDA USA PAPEL?" em letras grandes e grossas; meio "O Plantão é grátis. Funciona sem internet. Texto pronto pra copiar."; bottom "plantao.net". Use o ícone que vou enviar como anexo no canto inferior direito. Estilo foto realista.',
    legenda: 'App que toda enfermeira precisa conhecer 📱'
  },
  {
    id: 49,
    titulo: 'Story — Marca alguém',
    canais: ['story'],
    prompt: 'Crie uma imagem vertical 9:16 mostrando duas mãos de enfermagem: uma segurando um papel amassado e outra segurando um celular com o logo do Plantão e plantao.net na tela. Fundo escuro com textura sutil de luz azul hospitalar. Texto grande: "MARQUE AQUELA ENFERMEIRA QUE AINDA USA PAPEL" em letras brancas. Abaixo: "Apresenta o Plantão pra ela plantao.net" em letras menores. Use o ícone que vou enviar como anexo no canto superior direito. Estilo foto realista.',
    legenda: 'Marque aquela amiga que ainda perde papel no plantão 😂👇'
  },
  {
    id: 50,
    titulo: 'Story — Testei e aprovei',
    canais: ['story'],
    prompt: 'Crie uma imagem vertical 9:16 de uma tela de celular mostrando o logo do Plantão e plantao.net na tela, segurada por uma mão com unhas curtas e limpas (mão de profissional de saúde). Fundo suave azul escuro. Texto grande no topo: "TESTEI E APROVEI" em branco. Abaixo: "App gratuito de anotações de enfermagem. Funciona offline. Copia e cola no sistema do hospital." no meio. Bottom: "plantao.net". Use o ícone que vou enviar como anexo no topo direito. Estilo foto realista.',
    legenda: 'Testa e me conta depois! https://plantao.net'
  }
]

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
    { id: 'marketing', label: 'Marketing' },
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

// ── Marketing — filtros e busca ──
const mktCanais = computed(() => {
  const counts = {}
  for (const p of marketingPrompts) {
    for (const ch of p.canais) {
      counts[ch] = (counts[ch] || 0) + 1
    }
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([canal, count]) => ({ canal, count, label: canal.charAt(0).toUpperCase() + canal.slice(1) }))
})

const marketingFiltrados = computed(() => {
  let list = marketingPrompts
  const q = mktBusca.value.toLowerCase().trim()
  if (q) {
    list = list.filter(p =>
      p.titulo.toLowerCase().includes(q) ||
      p.prompt.toLowerCase().includes(q) ||
      (p.legenda && p.legenda.toLowerCase().includes(q))
    )
  }
  if (mktFiltroCanal.value) {
    list = list.filter(p => p.canais.includes(mktFiltroCanal.value))
  }
  return list
})

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

/* ══ MARKETING ══ */
.mkt-result-count { font-size: 0.75rem; color: var(--text-dim); font-weight: 500; display: flex; align-items: center; gap: 6px; }
.mkt-result-dim { color: var(--blue); font-weight: 600; }
.mkt-limpar-filtro { background: none; border: none; color: var(--text-muted); font-size: 0.7rem; font-family: inherit; cursor: pointer; text-decoration: underline; padding: 0; }
.mkt-limpar-filtro:hover { color: var(--text-dim); }
.mkt-card { background: var(--bg-card); border-radius: 10px; padding: 14px 16px; cursor: pointer; border: 1px solid var(--border); transition: border-color 0.2s; }
.mkt-card:active { border-color: var(--blue); }
.mkt-card:active { border-color: var(--blue); }
.mkt-aberto { border-color: var(--blue); }
.mkt-topo { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; }
.mkt-titulo { font-size: 0.9rem; font-weight: 600; color: var(--text); }
.mkt-chips { display: flex; gap: 4px; flex-wrap: wrap; }
.mkt-chip { font-size: 0.65rem; padding: 2px 8px; border-radius: 9999px; background: var(--bg-input); color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.04em; font-weight: 600; }
.mkt-feed { background: #1E88E5; color: #fff; }
.mkt-facebook { background: #1877F2; color: #fff; }
.mkt-whatsapp { background: #25D366; color: #fff; }
.mkt-story { background: #833AB4; color: #fff; }
.mkt-carrossel { background: #E1306C; color: #fff; }
.mkt-corpo { margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border); }
.mkt-label { font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; font-weight: 600; margin-bottom: 6px; }
.mkt-texto { font-size: 0.82rem; color: var(--text-dim); line-height: 1.5; white-space: pre-wrap; margin-bottom: 10px; }
.mkt-legenda { color: var(--text); }
.mkt-copiar { background: var(--blue-muted); color: var(--blue); border: 1px solid var(--blue); padding: 6px 14px; border-radius: 8px; font-size: 0.8rem; font-family: inherit; font-weight: 600; cursor: pointer; }
.mkt-copiar:active { background: var(--blue); color: #fff; }
</style>

