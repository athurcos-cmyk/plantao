# TODOS — Plantão

## Pendentes

### [ ] Terminologia clínica: limpeza asséptica vs antisséptica (P2)
**O quê:** Enfermeira amiga do Arthur validou que o módulo de curativo precisa de distinção clara entre limpeza asséptica (SF 0,9%) e antisséptica (PHMB, hipoclorito). Texto gerado deveria refletir isso automaticamente conforme a solução escolhida.
**Prioridade:** P2

---

### [ ] Botão de broadcast mais acessível no admin (P2)
**O quê:** Com usuários crescendo, o botão de broadcast (📢) está no header do modal mas o usuário sente que precisa descer muito para alcançar a funcionalidade.
**Como:** Avaliar se o botão fixo no topo da tab Monitor ou um FAB no AdminView resolve.
**Prioridade:** P2

---

### [ ] Métricas de anotações no painel admin (P2)
**O quê:** Counters `config/total_anotacoes` e `config/usuarios_ativos_7d` incrementados nas stores ao criar anotação.
**Por quê:** Métricas de engajamento real — "X anotações feitas" é melhor sinal de valor que "X cadastros" para decisão de paywall.
**Prioridade:** P2

---

### [ ] Configurar Resend em produção (P1)
**O quê:** Criar conta no Resend, verificar domínio plantao.net e adicionar `RESEND_API_KEY` no Vercel.
**Por quê:** Sem a chave, todos os emails transacionais (welcome, feedback, day3, goodbye) retornam `{ ok: false, reason: 'not_configured' }` silenciosamente.
**Como:**
1. resend.com → Sign Up → Domains → Add Domain → `plantao.net`
2. Adicionar registros DNS no Cloudflare
3. API Keys → Create → copiar chave `re_...`
4. Vercel → Settings → Environment Variables → `RESEND_API_KEY` → Redeploy
**Prioridade:** P1 — bloqueia todos os emails

---

### [ ] Paywall Stripe Checkout (após validação)
**O quê:** 45 dias gratuitos → R$14,99/mês. Stripe Checkout (sem UI customizada).
**Depende de:** Validação de disposição a pagar com usuários reais.
**Prioridade:** P1

---

### [ ] Verificação domínio Firebase para email de reset (P2)
**O quê:** Aguardar propagação dos registros DNS para o Firebase Auth usar plantao.net como remetente no email de reset de senha.
**Por quê:** Atualmente o reset sai de `noreply@anotacao-hc.firebaseapp.com` — confuso para o usuário.
**Prioridade:** P2

---

### [ ] Modo de Local de Trabalho — UPA/UBS/Clínicas (P2)
**O quê:** Adaptar terminologia do app para funcionar em UPA, UBS e clínicas, não só hospitais.
**Por quê:** Mercado endereçável ~5x maior.
**Depende de:** Feedback de usuários de UPA/UBS via Pulso do App.
**Prioridade:** P2

---

### [ ] Resend Batch API para broadcast em escala (P3)
**O quê:** Quando base crescer para 50+ usuários, substituir envio sequencial por `/emails/batch` do Resend (até 100 por request).
**Prioridade:** P3

---

### [ ] Board colaborativo (P3)
**O quê:** Avaliar funcionalidade colaborativa (múltiplos técnicos, mesmo plantão).
**Quando revisar:** Se clínicas pequenas pedirem explicitamente via Pulso do App.
**Prioridade:** P3

---

## Concluídos

### [x] Deep sweep de temas: tokens dinamicos + guia (2026-04-26)
- `useTheme.js` passou a concentrar tambem tokens de contraste e elevacao por tema (`--text`, `--text-on-accent`, `--shadow-sm/md/lg/modal`)
- `style.css` deixou de carregar sombras fixas no `:root` (sombras agora variam por tema)
- Hardcodes de cores/sombras removidos de componentes compartilhados criticos e de modulos de anotacao prioritarios
- Criado `THEME_GUIDE.md` na raiz com dicionario oficial de variaveis e regra anti-hardcode

---

### [x] Varredura hardcoded de cores para temas claros (2026-04-25)
- Removidos hardcodes de texto (`#fff`, `#eef4ff`, `#f5f8ff`, `#a6c4d8`, `#d9ecfb`) em views/components e substituidos por tokens de tipografia
- Criado token `--text-on-accent` e aplicado nos botões/chips com fundo semântico (`--blue`, `--success`, `--danger`)
- Validação final com busca global e linter sem pendências

---

### [x] Corrigir hardcolor azul em Historico e Anotacao Inicial (2026-04-25)
- `HistoricoView.vue` deixou de depender de tons azuis fixos
- `AnotacaoInicialView.vue` ganhou camada de unificação de tema
- Build validado com sucesso

---

### [x] Calculadora, Historico e Organizador no padrao premium (2026-04-25)
- Calculadora movida para o rodape fixo com visual premium
- `Historico` alargado para desktop com icones ilustrados
- `Organizador` com hero, cards de resumo e progresso
- Grade mobile da dashboard fechada

---

### [x] Fechamento visual dos cards principais de anotação (2026-04-25)
Todos os cards principais (`Sinais Vitais`, `Medicacao`, `Notas Livres`, `Passagem de Plantao`, `Encaminhamento`, `Higienizacao/Banho`, `Curativos`, `Anotacao Inicial`) consolidados no padrão premium navy/azul.

---

### [x] Padronização visual: progress bars e chips (2026-04-27)
Barras de progresso com gradiente `blue-dark→blue` e glow azul consistente. Chips `chip-on` padronizados com `linear-gradient(180deg)` + `box-shadow` azul em todas as views. `Curativos` migrado do verde para o padrão navy/azul.

---

### [x] Diversos (2026-03-21 até 2026-04-01)
- Firebase Auth completo (email/senha + Google)
- Migração OneSignal → FCM nativo
- Exclusão de conta robusta + proteção anti-re-cadastro Google
- Blindagem do sistema de notificações (3 camadas)
- Admin dashboard completo (tabs, broadcast, monitor)
- Correções legais LGPD + linguagem inclusiva
- Landing page reescrita, domínio plantao.net
- Sistema de emails transacionais (welcome, feedback, day3, goodbye)
- Fix dispositivos sumiam após "Nova anotação"
- Exclusão otimista de pacientes e pendências
- DESIGN.md formal, tokens CSS, calculadora de diluição
- Lançamento público (Instagram, WhatsApp, Facebook)
