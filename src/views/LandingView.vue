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
        <a class="nav-cta" href="#" @click.prevent="acessarNoPc">Abrir o app →</a>
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
            Para a equipe de enfermagem
          </div>
          <h1 class="hero-title">
            Organize seu plantão.<br>
            Não esqueça nada.<br>
            <span class="hero-accent">Atenda melhor.</span>
          </h1>
          <p class="hero-sub">
            Anotações, lembretes de medicação, calculadora de dose, organização de pacientes — tudo no celular, funciona offline.
          </p>
          <div class="hero-actions">
            <a class="btn-hero" href="#" @click.prevent="acessarNoPc">
              Começar agora — grátis
            </a>
            <p class="hero-hint">Cria a conta em 10 segundos com Google ou email. Sem cartão.</p>
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
          <span class="stat-num">0</span>
          <span class="stat-label">Pendências esquecidas</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-num">8+</span>
          <span class="stat-label">Ferramentas no app</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-num">100%</span>
          <span class="stat-label">Offline</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-num">R$0</span>
          <span class="stat-label">Para começar</span>
        </div>
      </div>
    </section>

    <!-- ── INSTALAR ── -->
    <section class="install-section">
      <div class="install-inner">
        <div class="install-text">
          <div class="install-eyebrow">
            <span class="install-eyebrow-dot"></span>
            Celular ou computador
          </div>
          <h2 class="install-title">Suas anotações<br>em qualquer dispositivo</h2>
          <p class="install-sub">
            Durante o plantão, use no <strong>celular</strong> — rápido, com uma mão, onde estiver.
            Em casa ou no posto, acesse pelo <strong>computador</strong> e veja tudo sincronizado.
          </p>
          <div class="install-devices">
            <div class="install-device">
              <div class="device-icon">📱</div>
              <div class="device-body">
                <strong>Celular</strong>
                <span>Instala na tela inicial. Funciona offline. Ideal para o plantão.</span>
              </div>
            </div>
            <div class="device-sync">⇄</div>
            <div class="install-device">
              <div class="device-icon">💻</div>
              <div class="device-body">
                <strong>Computador</strong>
                <span>Acesse pelo navegador. Mesmos dados, sincronizados.</span>
              </div>
            </div>
          </div>
          <p class="install-sync-note">
            Faça login com o mesmo <strong>email</strong> ou <strong>código de acesso</strong> em qualquer dispositivo para ter suas anotações sincronizadas.
          </p>
        </div>

        <div class="install-card">
          <div class="install-card-header">
            <span class="install-card-icon">🔗</span>
            <span class="install-card-label">Acesse agora</span>
          </div>
          <div class="install-url-box">
            <span class="install-url-text">{{ displayUrl }}</span>
            <button class="install-url-copy" @click="copiarUrl" :class="{ copied: urlCopiada }">
              {{ urlCopiada ? '✓ Copiado' : 'Copiar' }}
            </button>
          </div>
          <p class="install-card-hint">
            No celular: abra esse link no navegador e toque em <strong>"Adicionar à tela inicial"</strong> para instalar.
          </p>
          <div class="install-card-divider"></div>
          <p class="install-pc-label">No computador?</p>
          <p class="install-pc-hint">Funciona direto no navegador, sem instalar nada. Faça login e use normalmente.</p>
        </div>
      </div>
    </section>

    <!-- ── DESTAQUES ── -->
    <section class="section">
      <div class="section-inner">
        <div class="section-eyebrow">Por que usar</div>
        <h2 class="section-title">Mais que anotações — é o plantão inteiro organizado</h2>
        <div class="cards-grid">
          <div class="feat-card" v-for="f in feats" :key="f.title">
            <div class="feat-icon">{{ f.icon }}</div>
            <h3>{{ f.title }}</h3>
            <p>{{ f.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ── FORMAS DE ENTRAR ── -->
    <section class="section section-alt">
      <div class="section-inner">
        <div class="section-eyebrow">Acesso</div>
        <h2 class="section-title">Três formas de entrar</h2>
        <div class="login-options">
          <div class="login-opt">
            <div class="login-opt-icon">🔵</div>
            <div class="login-opt-body">
              <h3 class="login-opt-title">Google</h3>
              <p class="login-opt-desc">Um toque e pronto. Usa a conta Google que você já tem. Mais rápido para o dia a dia.</p>
            </div>
          </div>
          <div class="login-opt">
            <div class="login-opt-icon">✉️</div>
            <div class="login-opt-body">
              <h3 class="login-opt-title">Email e senha</h3>
              <p class="login-opt-desc">Cria uma conta com seu email. Bom para quem prefere manter separado do Google.</p>
            </div>
          </div>
          <div class="login-opt">
            <div class="login-opt-icon">🔑</div>
            <div class="login-opt-body">
              <h3 class="login-opt-title">Código de acesso</h3>
              <p class="login-opt-desc">Cada conta tem um código único de 6 letras. Ideal para entrar rápido no computador do posto, sem digitar o email.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── COMO FUNCIONA ── -->
    <section class="section">
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
          <h2 class="section-title no-margin-bottom">Tudo que você usa no plantão, em um lugar só</h2>
          <p class="two-col-sub">Anotações com texto pronto, lembretes por paciente, calculadora de medicação, IA para dúvidas clínicas e organizador de plantão.</p>
          <a class="btn-outline" href="#" @click.prevent="acessarNoPc">Explorar o app →</a>
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
        <div class="section-eyebrow">Quem já usa</div>
        <h2 class="section-title">Criado por quem vive o plantão, para quem vive o plantão</h2>
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

    <!-- ── FAQ / OBJEÇÕES ── -->
    <section class="section">
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
        <div class="section-eyebrow eyebrow-light">Comece agora</div>
        <h2 class="cta-title">Entra no seu próximo plantão<br>com tudo organizado</h2>
        <p class="cta-sub">Lembretes, calculadora, anotações prontas. Grátis. Conta em 10 segundos.</p>
        <a class="btn-hero btn-hero-lg" href="#" @click.prevent="acessarNoPc">Começar agora →</a>
        <p class="cta-hint">Android e iPhone. Funciona offline.</p>
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
        <a class="footer-email" href="mailto:contato@plantao.net">contato@plantao.net</a>
      </div>
    </footer>

  </div>
</template>

<script setup>
import { ref } from 'vue'

const appUrl = window.location.origin + '/'
const displayUrl = window.location.origin

const urlCopiada = ref(false)
function copiarUrl() {
  navigator.clipboard.writeText(appUrl).catch(() => {
    const el = document.createElement('textarea')
    el.value = appUrl
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
  })
  urlCopiada.value = true
  setTimeout(() => { urlCopiada.value = false }, 2000)
}

function acessarNoPc() {
  window.location.href = appUrl
}

const feats = [
  { icon: '🔔', title: 'Nunca mais esquece nada', desc: 'Coloca lembrete por paciente. Chega notificação no horário certo — mesmo com o celular na bolsa e tela bloqueada.' },
  { icon: '🧮', title: 'Calculadora de medicação', desc: 'Gotejamento, diluição, dosagem — tudo na palma da mão. Botão flutuante em qualquer tela, sem sair do que você tava fazendo.' },
  { icon: '🗂️', title: 'Organize o plantão inteiro', desc: 'Cadastra os pacientes, anota as pendências, organiza o template do plantão. Tudo no lugar, tudo acessível em segundos.' },
  { icon: '⚡', title: 'Texto pronto para copiar', desc: '8 tipos de anotação. Preenche, copia e cola no sistema do hospital. Sem redigitar, sem erro de formato.' },
  { icon: '🤖', title: 'IA especialista em enfermagem', desc: 'Clara tira dúvidas clínicas, calcula doses e ajuda a redigir anotações. Como ter uma colega experiente no bolso.' },
  { icon: '📡', title: 'Funciona sem internet', desc: 'Offline completo. Subsolo, área sem sinal, onde for — o app funciona. Sincroniza quando a rede voltar.' },
  { icon: '📲', title: 'Instala como app nativo', desc: 'Sem loja de apps. Abre o link, toca "Instalar", fica na tela inicial. Igual a um app da loja, sem baixar nada.' },
]

const steps = [
  { title: 'Instala em 10 segundos', desc: 'Abre o link no celular, toca "Adicionar à tela inicial". Fica na tela inicial igual app nativo.' },
  { title: 'Cadastra seus pacientes', desc: 'Coloca o nome, leito e as pendências de cada paciente. O app lembra tudo por você.' },
  { title: 'Usa durante o plantão', desc: 'Anota, configura lembretes, calcula dose. No fim, o texto tá pronto para copiar no sistema.' },
]

const features = [
  'Avaliação inicial de enfermagem',
  'Sinais vitais com escala de dor 0–10',
  'Administração de medicamentos com dupla checagem e local anatômico',
  'Banho (aspersão e leito)',
  'Curativo com avaliação COREN (lesão, exsudato, perilesão, bordas)',
  'Encaminhamento (IDA/RETORNO)',
  'Passagem de plantão',
  'Intercorrência / Anotação livre',
  'Calculadora de medicação (dosagem, gotejamento, diluição)',
]

const faq = [
  { q: 'Precisa de internet para funcionar?', a: 'Não. O app funciona 100% offline. Você anota durante o plantão e quando tiver internet, sincroniza automaticamente.' },
  { q: 'Funciona no meu celular?', a: 'Sim. Funciona em qualquer celular Android ou iPhone com navegador. Não precisa baixar na loja de apps.' },
  { q: 'É realmente gratuito?', a: 'Sim, completamente grátis. Sem período de teste, sem cartão de crédito, sem funcionalidade bloqueada.' },
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

/* ── INSTALL SECTION ── */
.install-section {
  background: var(--bg-card);
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  padding: 80px 32px;
  position: relative;
  overflow: hidden;
}
.install-section::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background-image: radial-gradient(circle, rgba(30, 136, 229, 0.07) 1px, transparent 1px);
  background-size: 28px 28px;
  pointer-events: none;
}
.install-inner {
  max-width: 1040px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: center;
  position: relative;
  z-index: 1;
}
.install-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--blue);
  margin-bottom: 14px;
}
.install-eyebrow-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--blue);
  box-shadow: 0 0 8px var(--blue);
  animation: pulse 2s ease-in-out infinite;
}
.install-title {
  font-size: clamp(1.8rem, 3.5vw, 2.4rem);
  font-weight: 700;
  letter-spacing: -0.025em;
  line-height: 1.1;
  margin: 0 0 16px;
}
.install-sub {
  color: var(--text-dim);
  font-size: 0.95rem;
  line-height: 1.65;
  margin: 0 0 28px;
  max-width: 400px;
}
.install-sub strong { color: var(--text); }

.install-devices {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 20px;
}
.install-device {
  flex: 1;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.device-icon { font-size: 1.5rem; flex-shrink: 0; margin-top: 2px; }
.device-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.device-body strong {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text);
}
.device-body span {
  font-size: 0.8rem;
  color: var(--text-muted);
  line-height: 1.45;
}
.device-sync {
  color: var(--blue);
  font-size: 1.1rem;
  font-weight: 700;
  flex-shrink: 0;
  padding: 0 4px;
}
.install-sync-note {
  font-size: 0.82rem;
  color: var(--text-muted);
  margin: 0;
  line-height: 1.5;
  padding: 10px 14px;
  background: var(--blue-muted);
  border: 1px solid rgba(30, 136, 229, 0.2);
  border-radius: var(--radius);
}
.install-sync-note strong { color: var(--blue); }

/* card direito */
.install-card {
  background: var(--bg);
  border: 1px solid rgba(30, 136, 229, 0.25);
  border-radius: 20px;
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 0 0 1px rgba(30, 136, 229, 0.06), 0 16px 48px rgba(0,0,0,0.3);
}
.install-card-header {
  display: flex;
  align-items: center;
  gap: 10px;
}
.install-card-icon { font-size: 1.3rem; }
.install-card-label {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
}
.install-url-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 10px 12px;
}
.install-url-text {
  flex: 1;
  font-size: 0.82rem;
  color: var(--blue);
  font-weight: 500;
  word-break: break-all;
  font-family: monospace;
}
.install-url-copy {
  background: var(--blue-muted);
  border: 1px solid rgba(30, 136, 229, 0.3);
  color: var(--blue);
  font-size: 0.75rem;
  font-weight: 600;
  padding: 5px 12px;
  border-radius: var(--radius-full);
  cursor: pointer;
  white-space: nowrap;
  font-family: inherit;
  transition: background 0.2s, color 0.2s;
  flex-shrink: 0;
}
.install-url-copy.copied {
  background: var(--success-muted);
  border-color: rgba(67, 160, 71, 0.4);
  color: var(--success);
}
.install-card-hint {
  font-size: 0.78rem;
  color: var(--text-muted);
  margin: 0;
  line-height: 1.5;
}
.install-card-divider {
  height: 1px;
  background: var(--border);
  margin: 4px 0;
}
.install-pc-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-dim);
  margin: 0;
}
.btn-pc {
  background: none;
  border: 1px solid var(--border);
  color: var(--text-dim);
  font-size: 0.88rem;
  font-weight: 600;
  font-family: inherit;
  padding: 12px 18px;
  border-radius: var(--radius);
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s, background 0.2s;
  text-align: left;
}
.btn-pc:hover {
  border-color: rgba(30, 136, 229, 0.45);
  color: var(--text);
  background: var(--blue-muted);
}
.install-pc-hint {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin: 0;
  line-height: 1.4;
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

  .install-section { padding: 56px 20px; }
  .install-inner {
    grid-template-columns: 1fr;
    gap: 40px;
  }
  .install-sub { max-width: 100%; }
}

/* ── FORMAS DE ENTRAR ── */
.login-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 560px;
  margin: 0 auto;
}
.login-opt {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 18px;
}
.login-opt-icon {
  font-size: 1.4rem;
  flex-shrink: 0;
  width: 36px;
  text-align: center;
  margin-top: 2px;
}
.login-opt-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text);
  margin: 0 0 4px;
}
.login-opt-desc {
  font-size: 0.85rem;
  color: var(--text-dim);
  line-height: 1.5;
  margin: 0;
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
