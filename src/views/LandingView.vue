<template>
  <div class="landing">

    <!-- ── NAV ── -->
    <nav class="nav">
      <div class="nav-inner">
        <div class="nav-brand">
          <img src="/icons/icon-512.png" width="28" height="28" alt="Plantão" style="border-radius:6px;display:block" />
          <span class="nav-logo">Plantão</span>
        </div>
        <a class="nav-cta" href="#" @click.prevent="acessarNoPc">Abrir o app →</a>
      </div>
    </nav>

    <!-- ── ACESSO ANTECIPADO ── -->
    <div class="early-bar">
      <span class="early-pill">Acesso antecipado</span>
      <span v-if="vagasRestantes > 0"><strong>{{ vagasRestantes }} vagas</strong> disponíveis</span>
      <span v-else>🔒 Vagas esgotadas — <a href="mailto:contato@plantao.net" style="color:var(--blue);font-weight:600;">contato@plantao.net</a></span>
    </div>

    <!-- ── HERO ── -->
    <section class="hero">
      <div class="hero-dots"></div>
      <div class="hero-glow"></div>
      <div class="hero-inner">
        <div class="hero-text">
          <h1 class="hero-title">
            Menos tempo<br>
            com papel.<br>
            <span class="hero-accent">Mais tempo pro paciente.</span>
          </h1>
          <p class="hero-sub">
            Anotações com texto pronto pra copiar, lembretes que não deixam você esquecer, calculadora de dose no bolso. Tudo offline, no celular.
          </p>
          <p class="hero-disclaimer">
            ⚠️ Ferramenta pessoal de apoio — não substitui o sistema oficial do hospital.
          </p>
          <div class="hero-actions">
            <a class="btn-hero" href="#" @click.prevent="acessarNoPc">
              Usar de graça →
            </a>
            <p class="hero-hint">
              Cria a conta em 10 segundos. Google, email ou código de acesso. Sem cartão.
            </p>
          </div>
          <div class="hero-trust">
            <div class="trust-item">
              <span class="trust-icon">✓</span>
              <span>Notificações de pendências</span>
            </div>
            <div class="trust-item">
              <span class="trust-icon">✓</span>
              <span>Calculadora de medicação</span>
            </div>
            <div class="trust-item">
              <span class="trust-icon">✓</span>
              <span>100% offline</span>
            </div>
          </div>
        </div>

        <div class="hero-ui">
          <div class="hero-ui-header">
            <div class="hero-ui-brand">
              <img src="/icons/icon-512.png" width="16" height="16" alt="" style="border-radius:4px;display:block" />
              <span class="hero-ui-title">Plantão</span>
            </div>
            <div class="hero-ui-pend">🔴 2</div>
          </div>
          <div class="hero-ui-label">ANOTAÇÕES</div>
          <div class="hero-ui-grid">
            <div class="hero-ui-card">
              <span class="hero-ui-icon">📋</span>
              <span>Avaliação</span>
            </div>
            <div class="hero-ui-card">
              <span class="hero-ui-icon">❤️</span>
              <span>Sinais</span>
            </div>
            <div class="hero-ui-card hero-ui-card-on">
              <span class="hero-ui-icon">💊</span>
              <span>Medicação</span>
            </div>
            <div class="hero-ui-card">
              <span class="hero-ui-icon">🩹</span>
              <span>Curativo</span>
            </div>
          </div>
          <div class="hero-ui-footer">
            <span class="hero-ui-tab hero-ui-tab-on">Início</span>
            <span class="hero-ui-tab">Pacientes</span>
            <span class="hero-ui-tab">Anotações</span>
            <span class="hero-ui-tab">Perfil</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ── STATS ── -->
    <section class="stats-section">
      <div class="stats-inner">
        <div class="stat-item">
          <span class="stat-num">Zero</span>
          <span class="stat-label">Pendência esquecida</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-num">8+</span>
          <span class="stat-label">Tipos de anotação</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-num">+</span>
          <span class="stat-label">Menos papel, mais cuidado</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-num">R$0</span>
          <span class="stat-label">Para começar</span>
        </div>
      </div>
    </section>

    <!-- ── COMO FUNCIONA + O QUE TEM ── -->
    <section class="section section-alt">
      <div class="section-inner">
        <div class="section-eyebrow">Como funciona</div>
        <h2 class="section-title">Instala em 10 segundos.<br>Usa o plantão inteiro.</h2>
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
        <div class="cards-grid" style="margin-top: 60px;">
          <div class="feat-card" v-for="f in feats" :key="f.title">
            <div class="feat-icon">{{ f.icon }}</div>
            <h3>{{ f.title }}</h3>
            <p>{{ f.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ── DEPOIMENTOS ── -->
    <section class="section">
      <div class="section-inner">
        <div class="section-eyebrow">Quem já usa</div>
        <h2 class="section-title">Criado por quem vive o plantão,<br>para quem vive o plantão</h2>
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

    <!-- ── FAQ ── -->
    <section class="section section-alt">
      <div class="section-inner">
        <div class="section-eyebrow">Dúvidas comuns</div>
        <h2 class="section-title">Perguntas frequentes</h2>
        <div class="faq-list">
          <details class="faq-item" v-for="q in faq" :key="q.q">
            <summary class="faq-question">{{ q.q }}</summary>
            <p class="faq-answer">{{ q.a }}</p>
          </details>
        </div>
      </div>
    </section>

    <!-- ── CTA FINAL ── -->
    <section class="cta-section">
      <div class="cta-glow"></div>
      <div class="section-inner cta-inner">
        <div class="section-eyebrow eyebrow-light">Teste agora</div>
        <h2 class="cta-title">Seu plantão não pode esperar</h2>
        <p class="cta-sub">
          Ainda restam <strong>{{ vagasRestantes }} vagas</strong> disponíveis. Cria sua conta em 10 segundos — sem cartão, sem compromisso.
        </p>
        <a class="btn-hero btn-hero-lg" href="#" @click.prevent="acessarNoPc">Usar de graça →</a>
        <p class="cta-hint">Android e iPhone. Funciona offline.</p>
      </div>
    </section>

    <!-- ── FOOTER ── -->
    <footer class="footer">
      <div class="footer-inner">
        <div class="footer-brand">
          <img src="/icons/icon-512.png" width="22" height="22" alt="Plantão" style="border-radius:5px;display:block" />
          <span class="nav-logo">Plantão</span>
        </div>
        <p class="footer-sub">App de anotações de enfermagem para uso no plantão hospitalar.</p>
        <a class="footer-email" href="mailto:contato@plantao.net">contato@plantao.net</a>
      </div>
    </footer>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db } from '../firebase.js'
import { ref as dbRef, get } from 'firebase/database'

const appUrl = window.location.origin + '/'

const vagasRestantes = ref(100)

onMounted(async () => {
  try {
    const snap = await get(dbRef(db, 'config/total_usuarios'))
    const total = snap.exists() ? snap.val() : 0
    vagasRestantes.value = Math.max(0, 100 - total)
  } catch {
    // se falhar, mantém 100 (não bloqueia a landing)
  }
})

function acessarNoPc() {
  window.location.href = appUrl
}

const feats = [
  { icon: '🔔', title: 'Chega de esquecer', desc: 'Coloca lembrete por paciente com horário exato. A notificação chega no celular mesmo com tela bloqueada — nunca mais perde uma medicação.' },
  { icon: '⚡', title: 'Texto pronto em segundos', desc: '8 tipos de anotação. Preenche os campos, copia e cola no sistema do hospital. Menos tempo perdido com papel, mais tempo pro paciente.' },
  { icon: '🧮', title: 'Calculadora de dose', desc: 'Gotejamento, diluição, dosagem — a conta que você precisa na hora. Abre em qualquer tela do app sem perder o que estava fazendo.' },
  { icon: '🗂️', title: 'Organizador de pacientes', desc: 'Cadastra os pacientes do plantão, anota as pendências de cada um, vê o resumo do dia. Tudo em dois toques.' },
  { icon: '📡', title: 'Funciona offline', desc: 'Subsolo do PS, área sem sinal, modo avião — o app funciona. Sincroniza automaticamente quando a internet voltar.' },
  { icon: '✏️', title: 'Cria seu modelo', desc: 'Não gostou do formato das anotações? Em Notas Livres você escreve do seu jeito, salva e reutiliza em todo plantão.' },
]

const steps = [
  { title: 'Abre e instala', desc: 'Acessa plantao.net no celular. Toca "Adicionar à tela inicial" — o app fica na tela igual app nativo. Leva 10 segundos.' },
  { title: 'Cadastra os pacientes', desc: 'Coloca nome, leito e as pendências de cada paciente do plantão. O app salva tudo e sincroniza sozinho.' },
  { title: 'Usa o plantão inteiro', desc: 'Anota, copia o texto pro sistema do hospital, configura lembretes. No fim do plantão, é só colar e pronto.' },
]

const faq = [
  { q: 'Isso substitui o sistema do hospital?', a: 'Não. O Plantão é uma ferramenta pessoal — você anota no celular e o app gera o texto formatado pronto. Depois é só copiar e colar no sistema oficial do seu hospital. O registro no prontuário continua sendo feito pelo sistema do hospital, normalmente.' },
  { q: 'Precisa de internet para funcionar?', a: 'Não. O app funciona 100% offline. Você anota durante o plantão e quando tiver internet, sincroniza automaticamente.' },
  { q: 'Funciona no meu celular?', a: 'Sim. Funciona em qualquer celular Android ou iPhone com navegador. Não precisa baixar na loja de apps.' },
  { q: 'É realmente gratuito?', a: 'Sim, 100% grátis. O lançamento é limitado a 100 vagas — sem cartão, sem funcionalidade bloqueada. Se as vagas esgotarem, entre em contato em contato@plantao.net para entrar na lista de espera.' },
  { q: 'Meus dados ficam seguros?', a: 'Sim. Login com Google ou email, dados criptografados e isolados por usuário. Ninguém mais tem acesso às suas anotações.' },
  { q: 'Consigo usar no computador do hospital também?', a: 'Sim. Faça login com a mesma conta em qualquer dispositivo. Suas anotações ficam sincronizadas.' },
]

const testimonials = [
  {
    text: 'Antes eu anotava num papel e depois digitava tudo de novo no sistema. Agora preencho no celular entre um paciente e outro e só colo. Economizo uns 30 minutos por plantão fácil.',
    name: 'Ana Paula R.',
    role: 'Técnica de Enfermagem — UTI',
    initials: 'AP',
  },
  {
    text: 'No subsolo do PS não pega internet. O app funciona normal offline — quando subo, sincroniza sozinho. Nunca perdi uma anotação.',
    name: 'Carlos M.',
    role: 'Enfermeiro — Pronto-Socorro',
    initials: 'CM',
  },
  {
    text: 'Coloquei lembrete pro Vancomicina das 22h. Chegou a notificação certinho, não precisei ficar olhando o relógio. Mudou meu plantão.',
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

/* ── BARRA DE ACESSO ANTECIPADO ── */
.early-bar {
  background: var(--bg-card);
  border-bottom: 1px solid var(--border);
  text-align: center;
  padding: 10px 16px;
  font-size: 0.82rem;
  color: var(--text-dim);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}
.early-pill {
  display: inline-flex;
  align-items: center;
  background: var(--blue-muted);
  color: var(--blue);
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  padding: 3px 10px;
  border-radius: var(--radius-full);
  white-space: nowrap;
}
.early-bar strong { color: var(--text); font-weight: 600; }

/* ── NAV ── */
.nav {
  position: sticky;
  top: 0;
  z-index: 100;
  background: color-mix(in srgb, var(--bg) 85%, transparent);
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
  color: var(--text-on-accent);
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
  background-image: radial-gradient(circle, color-mix(in srgb, var(--blue) 12%, transparent) 1px, transparent 1px);
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
  background: radial-gradient(ellipse, color-mix(in srgb, var(--blue) 8%, transparent) 0%, transparent 70%);
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
.hero-disclaimer {
  font-size: 0.78rem;
  color: var(--text-dim);
  opacity: 0.65;
  margin: 4px 0 0;
  letter-spacing: 0.01em;
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
  color: var(--text-on-accent);
  text-decoration: none;
  font-weight: 800;
  font-size: 1.05rem;
  padding: 16px 32px;
  border-radius: var(--radius-full);
  transition: all 0.2s ease;
  width: fit-content;
  box-shadow: var(--shadow-md);
}
.btn-hero:hover {
  background: var(--blue-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}
.btn-hero:active { transform: translateY(0) scale(0.97); }
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

/* ── HERO UI (dashboard mockup) ── */
.hero-ui {
  flex-shrink: 0;
  width: 320px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 20px;
  box-shadow: var(--shadow-modal);
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.hero-ui-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.hero-ui-brand {
  display: flex;
  align-items: center;
  gap: 8px;
}
.hero-ui-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text);
}
.hero-ui-pend {
  font-size: 0.7rem;
  font-weight: 700;
}
.hero-ui-label {
  font-size: 0.6rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  text-transform: uppercase;
}
.hero-ui-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.hero-ui-card {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 14px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  font-size: 0.68rem;
  color: var(--text-dim);
  font-weight: 500;
  text-align: center;
}
.hero-ui-card-on {
  background: var(--blue-muted);
  border-color: color-mix(in srgb, var(--blue) 40%, transparent);
  color: var(--text);
}
.hero-ui-icon { font-size: 1.2rem; }
.hero-ui-footer {
  display: flex;
  justify-content: space-around;
  padding-top: 8px;
  border-top: 1px solid var(--border);
  margin-top: 4px;
}
.hero-ui-tab {
  font-size: 0.6rem;
  color: var(--text-muted);
  font-weight: 500;
}
.hero-ui-tab-on {
  color: var(--blue);
  font-weight: 600;
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
  border-color: color-mix(in srgb, var(--blue) 45%, transparent);
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
  border: 2px solid color-mix(in srgb, var(--blue) 40%, transparent);
  color: var(--blue);
  font-weight: 700;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: var(--shadow-sm);
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
.testimonial:hover { border-color: color-mix(in srgb, var(--blue) 35%, transparent); }
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
  border: 1px solid color-mix(in srgb, var(--blue) 30%, transparent);
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
  background: linear-gradient(180deg, var(--bg-card) 0%, var(--bg) 100%);
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
  background: radial-gradient(ellipse, color-mix(in srgb, var(--blue) 10%, transparent) 0%, transparent 70%);
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
.eyebrow-light { color: color-mix(in srgb, var(--blue) 80%, transparent); }
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
.footer-email {
  color: var(--text-dim);
  font-size: 0.82rem;
  text-decoration: none;
  margin-top: 6px;
  transition: color 0.2s;
}
.footer-email:hover {
  color: var(--blue);
}

/* ── MOBILE RESPONSIVE ── */
@media (max-width: 780px) {
  .hero { padding: 48px 20px 56px; }
  .hero-inner {
    flex-direction: column;
    gap: 48px;
    text-align: center;
  }
  .btn-hero { align-self: center; }
  .hero-sub { max-width: 100%; }
  .hero-hint { text-align: center; }
  .hero-trust { justify-content: center; }
  .hero-ui { width: 100%; order: -1; }

  .stats-inner { gap: 0; flex-wrap: wrap; }
  .stat-item { min-width: 45%; padding: 12px 0; }
  .stat-divider { display: none; }

  .section { padding: 56px 20px; }
  .section-alt { padding: 56px 20px; }
  .nav-inner { padding: 12px 20px; }

  .cards-grid { grid-template-columns: 1fr; }
  .testimonials { grid-template-columns: 1fr; }

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

/* ── FAQ ── */
.faq-list {
  display: flex;
  flex-direction: column;
  gap: 0;
  max-width: 640px;
  margin: 0 auto;
}
.faq-item {
  border-bottom: 1px solid var(--border);
}
.faq-item:first-child {
  border-top: 1px solid var(--border);
}
.faq-question {
  padding: 18px 0;
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--text);
  cursor: pointer;
  list-style: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.faq-question::after {
  content: '+';
  font-size: 1.3rem;
  color: var(--text-dim);
  transition: transform 0.2s;
  flex-shrink: 0;
  margin-left: 16px;
}
.faq-item[open] .faq-question::after {
  content: '−';
}
.faq-question::-webkit-details-marker {
  display: none;
}
.faq-answer {
  color: var(--text-dim);
  font-size: 0.9rem;
  line-height: 1.6;
  margin: 0;
  padding: 0 0 18px;
}
</style>
