<template>
  <div class="landing">

    <!-- ── NAV ── -->
    <nav class="nav">
      <div class="nav-inner">
        <div class="nav-brand">
          <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="22" stroke="#1E88E5" stroke-width="2.5"/>
            <path d="M24 13v22M13 24h22" stroke="#1E88E5" stroke-width="3" stroke-linecap="round"/>
          </svg>
          <span class="nav-logo">Plantão</span>
        </div>
        <a class="nav-cta" :href="appUrl">Abrir o app →</a>
      </div>
    </nav>

    <!-- ── HERO ── -->
    <section class="hero">
      <div class="hero-dots"></div>
      <div class="hero-glow"></div>
      <div class="hero-inner">
        <div class="hero-text">
          <div class="hero-badge">
            <span class="badge-dot"></span>
            Para técnicos e enfermeiros
          </div>
          <h1 class="hero-title">
            Anotações de<br>
            enfermagem<br>
            <span class="hero-accent">em segundos</span>
          </h1>
          <p class="hero-sub">
            Gera o texto formatado pronto para copiar no sistema do hospital.
            Funciona offline. Instala no celular sem loja de apps.
          </p>
          <div class="hero-actions">
            <a class="btn-hero" :href="appUrl">
              Usar agora — é grátis
            </a>
            <p class="hero-hint">Sem e-mail. Sem cartão. Instala em 1 minuto.</p>
          </div>
          <div class="hero-trust">
            <div class="trust-item">
              <span class="trust-icon">✓</span>
              <span>100% offline</span>
            </div>
            <div class="trust-item">
              <span class="trust-icon">✓</span>
              <span>Android & iPhone</span>
            </div>
            <div class="trust-item">
              <span class="trust-icon">✓</span>
              <span>Dados seguros</span>
            </div>
          </div>
        </div>

        <div class="phone-wrap">
          <div class="phone-glow"></div>
          <div class="phone">
            <div class="phone-notch"></div>
            <div class="phone-screen">
              <div class="sim-header">
                <div class="sim-brand">
                  <svg width="14" height="14" viewBox="0 0 48 48" fill="none">
                    <circle cx="24" cy="24" r="22" stroke="#1E88E5" stroke-width="3"/>
                    <path d="M24 13v22M13 24h22" stroke="#1E88E5" stroke-width="3.5" stroke-linecap="round"/>
                  </svg>
                  <span class="sim-title">Plantão</span>
                </div>
                <span class="sim-badge">● online</span>
              </div>
              <div class="sim-label">ANOTAÇÕES</div>
              <div class="sim-grid">
                <div class="sim-card">
                  <span class="sim-icon">📋</span>
                  <span>Avaliação<br>inicial</span>
                </div>
                <div class="sim-card">
                  <span class="sim-icon">❤️</span>
                  <span>Sinais<br>vitais</span>
                </div>
                <div class="sim-card">
                  <span class="sim-icon">💊</span>
                  <span>Medica-<br>ção</span>
                </div>
                <div class="sim-card sim-card-active">
                  <span class="sim-icon">🩹</span>
                  <span>Curativo</span>
                </div>
              </div>
              <div class="sim-output">
                <div class="sim-output-header">
                  <span class="sim-output-label">TEXTO GERADO</span>
                  <span class="sim-output-time">14h30</span>
                </div>
                <div class="sim-output-text">14h30 – Avaliação de enfermagem realizada. Paciente em decúbito dorsal, grades elevadas, colaborativo...</div>
                <button class="sim-copy-btn">
                  <span>✓</span> Copiado!
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── STATS ── -->
    <section class="stats-section">
      <div class="stats-inner">
        <div class="stat-item">
          <span class="stat-num">8</span>
          <span class="stat-label">Tipos de anotação</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-num">100%</span>
          <span class="stat-label">Offline</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-num">0</span>
          <span class="stat-label">Custo pra começar</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-num">1min</span>
          <span class="stat-label">Para instalar</span>
        </div>
      </div>
    </section>

    <!-- ── DESTAQUES ── -->
    <section class="section">
      <div class="section-inner">
        <div class="section-eyebrow">Por que usar</div>
        <h2 class="section-title">Feito para o ritmo do plantão</h2>
        <div class="cards-grid">
          <div class="feat-card" v-for="f in feats" :key="f.title">
            <div class="feat-icon">{{ f.icon }}</div>
            <h3>{{ f.title }}</h3>
            <p>{{ f.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ── COMO FUNCIONA ── -->
    <section class="section section-alt">
      <div class="section-inner">
        <div class="section-eyebrow">Simples assim</div>
        <h2 class="section-title">Começa a usar em 3 passos</h2>
        <div class="steps">
          <div class="step" v-for="(s, i) in steps" :key="i">
            <div class="step-num">{{ i + 1 }}</div>
            <div class="step-body">
              <h3>{{ s.title }}</h3>
              <p>{{ s.desc }}</p>
            </div>
            <div v-if="i < steps.length - 1" class="step-arrow">→</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── LISTA DE FUNCIONALIDADES ── -->
    <section class="section">
      <div class="section-inner two-col">
        <div class="two-col-text">
          <div class="section-eyebrow">Completo</div>
          <h2 class="section-title no-margin-bottom">8 tipos de anotação incluídos</h2>
          <p class="two-col-sub">Cada anotação gera o texto no formato correto do prontuário. Sem deixar nada de fora.</p>
          <a class="btn-outline" :href="appUrl">Explorar o app →</a>
        </div>
        <div class="features-list">
          <div class="feature-item" v-for="f in features" :key="f">
            <span class="feature-check">✓</span>
            <span>{{ f }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ── DEPOIMENTOS ── -->
    <section class="section section-alt">
      <div class="section-inner">
        <div class="section-eyebrow">Quem usa</div>
        <h2 class="section-title">Feito por quem é da área</h2>
        <div class="testimonials">
          <div class="testimonial" v-for="t in testimonials" :key="t.name">
            <p class="testimonial-text">"{{ t.text }}"</p>
            <div class="testimonial-author">
              <div class="author-avatar">{{ t.initials }}</div>
              <div>
                <div class="author-name">{{ t.name }}</div>
                <div class="author-role">{{ t.role }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── CTA FINAL ── -->
    <section class="cta-section">
      <div class="cta-glow"></div>
      <div class="section-inner cta-inner">
        <div class="section-eyebrow eyebrow-light">Comece agora</div>
        <h2 class="cta-title">Tudo pronto para o seu<br>próximo plantão</h2>
        <p class="cta-sub">100% gratuito. Sem cadastro de e-mail. Instala em menos de 1 minuto.</p>
        <a class="btn-hero btn-hero-lg" :href="appUrl">Abrir o Plantão →</a>
        <p class="cta-hint">Compatible com Android e iPhone</p>
      </div>
    </section>

    <!-- ── FOOTER ── -->
    <footer class="footer">
      <div class="footer-inner">
        <div class="footer-brand">
          <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="22" stroke="#1E88E5" stroke-width="2.5"/>
            <path d="M24 13v22M13 24h22" stroke="#1E88E5" stroke-width="3" stroke-linecap="round"/>
          </svg>
          <span class="nav-logo">Plantão</span>
        </div>
        <p class="footer-sub">App de anotações de enfermagem para uso no plantão hospitalar.</p>
      </div>
    </footer>

  </div>
</template>

<script setup>
const appUrl = window.location.origin + window.location.pathname + '#/'

const feats = [
  { icon: '⚡', title: 'Texto pronto para copiar', desc: 'Avaliação inicial, sinais vitais, medicação, curativo e mais. Texto formatado para colar direto no sistema do hospital.' },
  { icon: '📡', title: 'Funciona sem internet', desc: 'Offline-first completo. Registre as anotações mesmo sem sinal. Sincroniza automaticamente quando a conexão voltar.' },
  { icon: '📲', title: 'Instala como app nativo', desc: 'Sem baixar pela loja. Abre o link no celular, toca em "Instalar" e fica na tela inicial igual a um app nativo.' },
  { icon: '🔔', title: 'Notificações de pendências', desc: 'Agende lembretes por paciente. Recebe notificação 30 minutos antes e no horário exato — mesmo com o app fechado.' },
  { icon: '🤖', title: 'Assistente IA Clara', desc: 'IA especialista em enfermagem para ajudar a redigir anotações no formato correto e tirar dúvidas do plantão.' },
  { icon: '🔒', title: 'Dados protegidos', desc: 'Acesso por syncCode + PIN. Dados isolados por usuário. Sem anúncios. Sem terceiros com acesso às suas informações.' },
]

const steps = [
  { title: 'Abra no celular e instale', desc: 'Acesse o link pelo celular. O navegador sugere "Adicionar à tela inicial". Um toque — instalado.' },
  { title: 'Crie seu perfil', desc: 'Escolha um syncCode e um PIN de 6 dígitos. Sem e-mail, sem senha complicada.' },
  { title: 'Anote, preencha e copie', desc: 'Selecione o tipo de anotação, preencha os campos e copie o texto pronto com um toque.' },
]

const features = [
  'Avaliação inicial de enfermagem',
  'Sinais vitais (PA, FC, FR, SpO₂, Tax, HGT, DOR)',
  'Administração de medicamentos com dupla checagem',
  'Banho (aspersão e leito)',
  'Curativo',
  'Encaminhamento (IDA/RETORNO)',
  'Passagem de plantão',
  'Intercorrência / Anotação livre',
]

const testimonials = [
  {
    text: 'Economizo muito tempo na hora de registrar no prontuário. O texto já sai no formato que o hospital pede.',
    name: 'Ana Paula R.',
    role: 'Técnica de Enfermagem — UTI',
    initials: 'AP',
  },
  {
    text: 'Funciona mesmo sem internet no subsolo do hospital. Quando subo, sincroniza sozinho. Perfeito.',
    name: 'Carlos M.',
    role: 'Enfermeiro — Pronto-Socorro',
    initials: 'CM',
  },
  {
    text: 'A notificação de pendências salvou minha pele mais de uma vez. Nunca mais esqueci medicação agendada.',
    name: 'Renata S.',
    role: 'Técnica de Enfermagem — Clínica Médica',
    initials: 'RS',
  },
]
</script>

<style scoped>
/* ── RESET & BASE ── */
.landing {
  background: var(--bg);
  color: var(--text);
  font-family: inherit;
  min-height: 100dvh;
  overflow-x: hidden;
}

/* ── NAV ── */
.nav {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(10, 22, 40, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
}
.nav-inner {
  max-width: 1040px;
  margin: 0 auto;
  padding: 14px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.nav-brand {
  display: flex;
  align-items: center;
  gap: 8px;
}
.nav-logo {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.02em;
}
.nav-cta {
  background: var(--blue);
  color: #fff;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.88rem;
  padding: 9px 20px;
  border-radius: var(--radius-full);
  transition: background 0.2s, transform 0.1s;
  white-space: nowrap;
}
.nav-cta:hover { background: var(--blue-dark); }
.nav-cta:active { transform: scale(0.97); }

/* ── HERO ── */
.hero {
  position: relative;
  padding: 80px 32px 96px;
  overflow: hidden;
}
.hero-dots {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle, rgba(30, 136, 229, 0.12) 1px, transparent 1px);
  background-size: 28px 28px;
  z-index: 0;
  pointer-events: none;
}
.hero-glow {
  position: absolute;
  top: -100px;
  left: 50%;
  transform: translateX(-50%);
  width: 600px;
  height: 400px;
  background: radial-gradient(ellipse, rgba(30, 136, 229, 0.08) 0%, transparent 70%);
  pointer-events: none;
  z-index: 0;
}
.hero-inner {
  max-width: 1040px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 80px;
  position: relative;
  z-index: 1;
}
.hero-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--blue-muted);
  color: var(--blue);
  border: 1px solid rgba(30, 136, 229, 0.3);
  border-radius: var(--radius-full);
  padding: 5px 14px 5px 10px;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  width: fit-content;
}
.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--blue);
  animation: pulse 2s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.8); }
}
.hero-title {
  font-size: clamp(2rem, 4.5vw, 3.2rem);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.03em;
  margin: 0;
}
.hero-accent {
  color: var(--blue);
  position: relative;
}
.hero-sub {
  color: var(--text-dim);
  font-size: 1.05rem;
  line-height: 1.65;
  margin: 0;
  max-width: 440px;
}
.hero-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.btn-hero {
  display: inline-flex;
  align-items: center;
  background: var(--blue);
  color: #fff;
  text-decoration: none;
  font-weight: 700;
  font-size: 1rem;
  padding: 16px 32px;
  border-radius: var(--radius-full);
  transition: background 0.2s, transform 0.1s, box-shadow 0.2s;
  width: fit-content;
  box-shadow: 0 4px 24px rgba(30, 136, 229, 0.3);
}
.btn-hero:hover {
  background: var(--blue-dark);
  box-shadow: 0 6px 32px rgba(30, 136, 229, 0.4);
}
.btn-hero:active { transform: scale(0.97); }
.btn-hero-lg {
  font-size: 1.1rem;
  padding: 18px 40px;
}
.hero-hint {
  color: var(--text-muted);
  font-size: 0.82rem;
  margin: 0;
}
.hero-trust {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  margin-top: 4px;
}
.trust-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-dim);
  font-size: 0.85rem;
}
.trust-icon {
  color: var(--success);
  font-weight: 700;
  font-size: 0.8rem;
}

/* ── PHONE MOCKUP ── */
.phone-wrap {
  flex-shrink: 0;
  position: relative;
  display: flex;
  justify-content: center;
}
.phone-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 320px;
  height: 400px;
  background: radial-gradient(ellipse, rgba(30, 136, 229, 0.18) 0%, transparent 65%);
  pointer-events: none;
  z-index: 0;
}
.phone {
  width: 258px;
  background: #0d1e38;
  border: 2px solid #1e3050;
  border-radius: 44px;
  padding: 14px 12px 20px;
  box-shadow:
    0 32px 80px rgba(0, 0, 0, 0.6),
    0 0 0 1px rgba(30, 136, 229, 0.1),
    inset 0 1px 0 rgba(255,255,255,0.05);
  position: relative;
  z-index: 1;
}
.phone-notch {
  width: 80px;
  height: 6px;
  background: #1e3050;
  border-radius: 3px;
  margin: 0 auto 12px;
}
.phone-screen {
  background: var(--bg);
  border-radius: 32px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px 14px;
  min-height: 460px;
}
.sim-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2px;
}
.sim-brand {
  display: flex;
  align-items: center;
  gap: 6px;
}
.sim-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.01em;
}
.sim-badge {
  font-size: 0.6rem;
  color: var(--success);
  font-weight: 600;
}
.sim-label {
  font-size: 0.58rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  text-transform: uppercase;
  margin-bottom: -4px;
}
.sim-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.sim-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px 10px;
  font-size: 0.65rem;
  color: var(--text-dim);
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-weight: 500;
  line-height: 1.3;
  transition: border-color 0.2s;
}
.sim-card-active {
  background: var(--blue-muted);
  border-color: rgba(30, 136, 229, 0.4);
  color: var(--text);
}
.sim-icon { font-size: 1rem; }
.sim-output {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px;
  margin-top: 2px;
}
.sim-output-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.sim-output-label {
  font-size: 0.55rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  text-transform: uppercase;
}
.sim-output-time {
  font-size: 0.6rem;
  color: var(--blue);
  font-weight: 600;
}
.sim-output-text {
  font-size: 0.62rem;
  color: var(--text-dim);
  line-height: 1.55;
  margin-bottom: 10px;
}
.sim-copy-btn {
  background: var(--success);
  color: #fff;
  font-size: 0.62rem;
  font-weight: 700;
  padding: 7px 12px;
  border-radius: 8px;
  text-align: center;
  width: 100%;
  border: none;
  cursor: default;
  letter-spacing: 0.02em;
}

/* ── STATS ── */
.stats-section {
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  background: var(--bg-card);
}
.stats-inner {
  max-width: 1040px;
  margin: 0 auto;
  padding: 28px 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
}
.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-align: center;
}
.stat-num {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--blue);
  letter-spacing: -0.03em;
}
.stat-label {
  font-size: 0.78rem;
  color: var(--text-muted);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.stat-divider {
  width: 1px;
  height: 40px;
  background: var(--border);
  flex-shrink: 0;
}

/* ── SECTIONS ── */
.section {
  padding: 80px 32px;
}
.section-alt {
  background: var(--bg-card);
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}
.section-inner {
  max-width: 1040px;
  margin: 0 auto;
}
.section-eyebrow {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--blue);
  margin-bottom: 12px;
}
.section-title {
  font-size: clamp(1.4rem, 3vw, 2rem);
  font-weight: 700;
  margin: 0 0 40px;
  letter-spacing: -0.02em;
  line-height: 1.2;
}
.no-margin-bottom { margin-bottom: 16px; }

/* ── FEATURE CARDS ── */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}
.feat-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 28px 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: border-color 0.2s, transform 0.2s;
}
.feat-card:hover {
  border-color: rgba(30, 136, 229, 0.45);
  transform: translateY(-2px);
}
.feat-icon { font-size: 1.6rem; }
.feat-card h3 {
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0;
  color: var(--text);
}
.feat-card p {
  font-size: 0.88rem;
  color: var(--text-dim);
  line-height: 1.65;
  margin: 0;
}

/* ── STEPS ── */
.steps {
  display: flex;
  align-items: flex-start;
  gap: 0;
}
.step {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 14px;
  padding: 0 16px;
  position: relative;
}
.step-num {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--blue-muted);
  border: 2px solid rgba(30, 136, 229, 0.4);
  color: var(--blue);
  font-weight: 700;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 0 0 6px rgba(30, 136, 229, 0.06);
}
.step-body h3 {
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0 0 6px;
}
.step-body p {
  font-size: 0.85rem;
  color: var(--text-dim);
  line-height: 1.6;
  margin: 0;
}
.step-arrow {
  flex-shrink: 0;
  color: var(--text-muted);
  font-size: 1.2rem;
  margin-top: 10px;
  align-self: flex-start;
  padding-top: 12px;
}

/* ── TWO COL ── */
.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: start;
}
.two-col-text {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.two-col-sub {
  color: var(--text-dim);
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0;
}
.btn-outline {
  display: inline-flex;
  align-items: center;
  color: var(--blue);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  border: 1px solid rgba(30, 136, 229, 0.4);
  border-radius: var(--radius-full);
  padding: 10px 20px;
  width: fit-content;
  transition: background 0.2s, border-color 0.2s;
  margin-top: 8px;
}
.btn-outline:hover {
  background: var(--blue-muted);
  border-color: rgba(30, 136, 229, 0.6);
}

/* ── FEATURES LIST ── */
.features-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font-size: 0.88rem;
  color: var(--text-dim);
  background: var(--bg);
  transition: border-color 0.2s;
}
.feature-item:hover { border-color: rgba(30, 136, 229, 0.35); }
.feature-check {
  color: var(--success);
  font-weight: 700;
  flex-shrink: 0;
}

/* ── TESTIMONIALS ── */
.testimonials {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}
.testimonial {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 28px 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  transition: border-color 0.2s;
}
.testimonial:hover { border-color: rgba(30, 136, 229, 0.35); }
.testimonial-text {
  font-size: 0.92rem;
  color: var(--text-dim);
  line-height: 1.7;
  margin: 0;
  font-style: italic;
}
.testimonial-author {
  display: flex;
  align-items: center;
  gap: 12px;
}
.author-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--blue-muted);
  border: 1px solid rgba(30, 136, 229, 0.3);
  color: var(--blue);
  font-size: 0.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.author-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text);
}
.author-role {
  font-size: 0.78rem;
  color: var(--text-muted);
}

/* ── CTA SECTION ── */
.cta-section {
  position: relative;
  padding: 96px 32px;
  background: linear-gradient(180deg, var(--bg-card) 0%, #0a1628 100%);
  border-top: 1px solid var(--border);
  overflow: hidden;
  text-align: center;
}
.cta-glow {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 700px;
  height: 300px;
  background: radial-gradient(ellipse, rgba(30, 136, 229, 0.1) 0%, transparent 70%);
  pointer-events: none;
}
.cta-inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}
.eyebrow-light { color: rgba(30, 136, 229, 0.8); }
.cta-title {
  font-size: clamp(1.6rem, 3.5vw, 2.4rem);
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.025em;
  line-height: 1.15;
}
.cta-sub {
  color: var(--text-dim);
  font-size: 1rem;
  margin: 0;
  max-width: 400px;
}
.cta-hint {
  color: var(--text-muted);
  font-size: 0.82rem;
  margin: 0;
}

/* ── FOOTER ── */
.footer {
  padding: 48px 32px;
  border-top: 1px solid var(--border);
}
.footer-inner {
  max-width: 1040px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-align: center;
}
.footer-brand {
  display: flex;
  align-items: center;
  gap: 8px;
}
.footer-sub {
  color: var(--text-muted);
  font-size: 0.85rem;
  margin: 0;
}

/* ── MOBILE RESPONSIVE ── */
@media (max-width: 780px) {
  .hero { padding: 48px 20px 56px; }
  .hero-inner {
    flex-direction: column;
    gap: 48px;
    text-align: center;
  }
  .hero-badge, .btn-hero { align-self: center; }
  .hero-sub { max-width: 100%; }
  .hero-hint { text-align: center; }
  .hero-trust { justify-content: center; }
  .phone-wrap { order: -1; }
  .phone { width: 220px; }
  .phone-screen { min-height: 380px; }

  .stats-inner { gap: 0; flex-wrap: wrap; }
  .stat-item { min-width: 45%; padding: 12px 0; }
  .stat-divider { display: none; }

  .section { padding: 56px 20px; }
  .section-alt { padding: 56px 20px; }
  .nav-inner { padding: 12px 20px; }

  .cards-grid { grid-template-columns: 1fr; }
  .testimonials { grid-template-columns: 1fr; }

  .two-col {
    grid-template-columns: 1fr;
    gap: 40px;
  }

  .steps {
    flex-direction: column;
    gap: 24px;
  }
  .step {
    flex-direction: row;
    text-align: left;
    align-items: flex-start;
    padding: 0;
  }
  .step-arrow { display: none; }

  .cta-section { padding: 64px 20px; }
  .cta-title br { display: none; }
  .footer { padding: 40px 20px; }
}
</style>
