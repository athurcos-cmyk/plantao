# Changelog — Plantão

## O que é o app

**Plantão** é um PWA de anotações de enfermagem para uso no celular durante plantão hospitalar. Gera textos formatados prontos para copiar no sistema do hospital. Funciona offline, sincroniza via Firebase Realtime Database, e pode ser instalado como app no celular sem precisar de loja de aplicativos.

---

## Sessão 2026-03-28 — Auditoria de segurança + decisões de produto

### Auditoria de segurança (sem código alterado)

Verificação completa dos 3 pontos críticos do projeto:

**Firebase Rules (`database.rules.json`):**
- Todas as coleções exigem `auth != null` + verificação de ownership via `root.child('owners').child($code).child(auth.uid)`
- Nenhuma regra permissiva exposta — `config/total_usuarios` é a única leitura pública (intencional, sem dado sensível)
- `usuarios/plano` tem `.write: false` no client — só o admin SDK pode alterar
- `feedback` tem `.read: false` — só escrita pelo dono
- **Conclusão: regras bem configuradas, sem vazamento possível de dados de outros usuários**

**Variáveis de ambiente:**
- `.env.local` contém apenas `VITE_FCM_VAPID_KEY` — chave pública por design, pode ser exposta
- Secrets reais (`FIREBASE_SERVICE_ACCOUNT`, `CRON_SECRET`, `GROQ_API_KEY`, `RESEND_API_KEY`) confirmados apenas no Vercel, fora do código
- **Conclusão: sem secrets no bundle ou no repositório**

**Endpoints serverless (`api/`):**
- Todos os 9 endpoints verificam `verifyIdToken` antes de qualquer operação
- `api/cron.js` fail-closed: `if (!secret || req.headers.authorization !== Bearer ${secret})` — bloqueia se variável ausente
- Rate limiting em todos os endpoints sensíveis
- **Conclusão: endpoints protegidos**

**O que NÃO se aplica ao Plantão (são problemas do Supabase):**
Anon key exposta, RLS não configurado, storage buckets abertos, `security definer` functions, chamadas REST diretas sem autenticação. O Firebase tem arquitetura fundamentalmente diferente — segurança fechada por padrão.

**Única pendência real:** rotacionar CRON_SECRET no Vercel + cron-job.org (secret foi exposto em commit público). Não expõe dados de usuários — apenas permite disparar notificações FCM.

### Decisões de produto

**Modo lado a lado no computador (descartado):**
- Usuário reportou dificuldade para quem não sabe dividir a tela no computador
- Opções avaliadas: PWA instalado no desktop, botão janela flutuante, rota `/mini`
- Decisão: deixar como está. Fluxo atual (copiar texto e colar no prontuário) resolve o problema

**Aviso iOS PWA (removido do TODOS):**
- Item "avisar sobre reinstalação de PWA se ícone sumir no iOS" avaliado
- Decisão: não implementar, removido do backlog

---

## Sessão 2026-03-27 — Curativo + Banho + Passagem (melhorias clínicas)

### Módulo Curativo — melhorias clínicas

**Referência à prescrição expandida:**
- 3 chips: "Conforme prescrição de enfermagem" / "Conforme orientação Enf." / "Prescrição + orientação Enf."
- Campo de texto para nome do(a) Enf. aparece ao selecionar "orientação" ou "ambos"
- Texto gerado: `Conforme orientação Enf. Maria Souza.` / `Conforme prescrição de enfermagem e orientação Enf. Maria Souza.`
- "Conforme orientação da(o) Enf." → "Conforme orientação Enf." (removido da(o))

**Commits:** `63c14da`, `a05077f`

### Módulo Banho — higiene multi-add

**Higiene realizada — chip Outro com múltiplos itens:**
- Antes: campo de texto único `higieneOutro` (não permitia 2 itens customizados)
- Agora: chip "Outro" abre campo de texto + botão "+ Adicionar"
- Cada item vira chip com botão `×` para remover individualmente
- Foco automático no input ao clicar Outro (watch + nextTick)
- Múltiplos itens aparecem no texto gerado em ordem de adição
- Enter adiciona, Esc fecha o campo
- `higieneExtras` ref separado da lógica de higiene padrão

**Commit:** `6869d1a`

### Módulo Passagem de Plantão — correções e melhorias

**Dispositivos:**
- Sistema completo de dispositivos (mesmo da Anotação Inicial) adicionado — todos os 12 tipos (AVP, CVC, PICC, Permcath, Shilley, SNE, SNG, Pulseira, Monitor, Dreno, Curativo, Outros)
- "Dieta enteral" e "Infusão venosa" removidos das informações adicionais (cobertos pelos dispositivos AVP/SNE)
- Apenas "Débito urinário" mantido em informações adicionais
- `useDispositivos.js` — composable extraído e compartilhado entre Passagem e Anotação Inicial

**Decúbito:**
- Simplificado para 4 opções: parcialmente elevado, dorsal, lateral direito, lateral esquerdo
- Chip "Outro" com campo de texto livre (mesmo padrão da Anotação Inicial)

**Visual — correção CSS global:**
- `.radio-btn` herdava estilos de `.campo label` do style.css global (display:block, text-transform:uppercase, font-weight:600, margin-bottom:8px)
- Corrigido com reset explícito em `.radio-btn`: font-weight:500, text-transform:none, letter-spacing:normal, margin-bottom:0

**ModalAVP revertido:**
- Locais restaurados para original: MSE, MSD, MIE, MID, jugular D, jugular E

**Commits:** `5db1e49`, `69bced8`, `b987000`

---

## Sessão 2026-03-26 — Divulgação + Instagram

### Lançamento público iniciado

**OAuth Google — melhorias visuais:**
- Email de suporte do OAuth trocado de `arthurzika3@gmail.com` para `contato-plantao@googlegroups.com` (Google Group criado para contornar restrição do campo)
- Decisão: não migrar Firebase Hosting (custaria as serverless functions do Vercel + perda dos 12 usuários Auth)
- Decisão: não criar novo projeto Firebase (perda de usuários Auth, horas de reconfiguração)
- authDomain mantido como `anotacao-hc.firebaseapp.com` (mudar causaria erro no login com Google)

**Instagram `@plantao.app` criado:**
- Conta profissional criada com email `plantao.contato.net@gmail.com`
- Bio: "App para organizar seu plantão inteiro. Anotações prontas, pacientes, calculadora e notificações. Gratuito. Funciona offline."
- Link na bio: `plantao.net/landing`
- 3 posts publicados:
  1. Carrossel 5 slides (história real → problema → solução → app → CTA)
  2. Post com prints reais do dashboard + sinais vitais gerados
  3. Post de engajamento "Como você anota durante o plantão?" com emojis

**Meta Business Suite configurado:**
- Conta criada e Instagram `@plantao.app` conectado
- Anúncio criado: carrossel impulsionado, R$16/dia por 5 dias (R$80 total), só Instagram
- Público: automático (sem segmentação manual disponível no fluxo simplificado de impulsionar)

**Divulgação WhatsApp:**
- Grupos de enfermagem encontrados via gruposwhats.app
- 4 modelos de texto criados com variação natural ("sou da enfermagem há 2 anos...")
- Texto final: história real do sistema travando no plantão

---

## Sessão 2026-03-25 (continuação — noite)

### Correções legais + melhorias admin

**Correções na Política de Privacidade:**
- Revogação de consentimento para e-mails: removido "link descadastrar no rodapé" (inexistente) → substituído por "enviar e-mail para contato@plantao.net"

**Correções nos Termos de Serviço:**
- Adicionados "auxiliares de enfermagem" na lista de público-alvo (antes só tinha enfermeiros e técnicos)
- "julgamento profissional do enfermeiro" → "do profissional de enfermagem" (inclusivo para técnico e auxiliar)

**Correção crítica no broadcast.js:**
- `SyntaxError`: `const { titulo, mensagem, tipo }` redeclarado na linha 168 (histórico fire-and-forget) — causava crash da função e resposta HTML em vez de JSON → "Unexpected token 'A'" no admin
- Removida redeclaração; variáveis já declaradas na linha 58 são reutilizadas

**Admin — broadcast no header:**
- Botão `📢` adicionado no header do AdminView (sempre visível, sem precisar rolar)
- Formulário de broadcast movido para modal overlay
- Seção de broadcast removida do final da página

**Admin — erros de broadcast mais detalhados:**
- Lista de erros agora exibe `device key` (push) ou `email` (email) além do tipo e mensagem
- "Requested entity was not found" agora identifica qual token específico falhou

**Commits:** `a29d72a`, `db96637`, `d7611a5`, `ae9c39f`, `d14541f`

---

## Sessão 2026-03-25 (continuação — tarde)

### Admin dashboard completo + métricas de engajamento

**Novos dados coletados automaticamente:**
- `usuarios/{syncCode}/ultimo_acesso` — salvo a cada login via `auth.js`
- `usuarios/{syncCode}/total_anotacoes` — incrementado via `anotacoes.js` a cada anotação salva
- `config/cron_last_run` — registrado pelo `cron.js` após cada execução
- `admin/broadcasts/{pushKey}` — histórico salvo pelo `broadcast.js` após cada envio

**4 tabs no AdminView:**
- **Usuários**: busca por nome/email, badge atividade (ativo hoje/Xd/inativo), stats (último acesso, total anotações, FCM tokens), email individual via modal, excluir
- **Feedbacks**: lido/não lido (localStorage), responder via mailto, badge de não lidos na tab
- **Métricas**: ativos 7d, total anotações global, crescimento acumulado 8 semanas, cadastros por semana
- **Monitor**: status do cron (última execução, há quanto tempo, alerta se >5min parado), histórico broadcasts

**Novos endpoints:**
- `api/admin-email-user.js` — POST `{ uid, assunto, mensagem }` — envia email individual via Resend

**Discussões estratégicas:**
- Monetização: mensal apenas (R$14,99/mês) — anual tem risco jurídico (CDC) se app descontinuar
- Freemium: campo `subscription: 'free'|'pro'` no Firebase, bloqueio só quando online
- Stripe: `cancel_at_period_end: true` — usuário usa até fim do período mesmo após cancelar
- Anúncios: descartado para esse público
- Firebase aguenta para tudo planejado; Supabase só valeria para queries SQL complexas
- Rede social futura: Firestore + Algolia + FCM — aguenta 1-2M usuários

**Commit:** `436dba2`

---

## Sessão 2026-03-25

### Admin dashboard melhorado + remoção onboarding + LGPD

**Admin dashboard (AdminView.vue):**
- Tabs Usuários / Feedbacks / Métricas carregados do Firebase via `api/admin-data.js`
- Lista de usuários com nome, email, data de cadastro, badges de emails enviados e syncCode
- Botão 🗑 por usuário — exclui todos os dados (15 paths + Auth + decrementa contador) via `api/admin-delete-user.js`
- Tab Feedbacks: lista completa com autor, data e versão
- Tab Métricas: total de usuários, total de feedbacks, taxa de email boas-vindas, gráfico de barras de cadastros por semana (últimas 4 semanas)

**Novos endpoints serverless:**
- `api/admin-data.js` — GET. Lê `usuarios/`, `feedback/`, `owners/` em paralelo via firebase-admin. Retorna lista enriquecida (uid via owners) + feedbacks + métricas calculadas. Restrito a `a.thurcos@gmail.com`
- `api/admin-delete-user.js` — POST `{ uid }`. Replica lógica do delete-account mas acionado pelo admin. Deleta 15 paths + conta Auth + decrementa contador. Restrito a admin

**Remoção do onboarding:**
- `OnboardingView.vue` deletado
- `src/config/onboarding.js` deletado
- Router: `/onboarding` redireciona para login, catch-all `/:pathMatch(.*)` → login

**Conformidade LGPD (privacidade.html + termos.html):**
- Corrigida afirmação falsa: "não temos acesso ao conteúdo das anotações" → texto honesto sobre acesso técnico restrito
- Removida promessa de exportação via e-mail (direito de portabilidade mantido via contato)
- Adicionada base legal de tratamento (Art. 7 LGPD): execução de contrato, legítimo interesse, consentimento
- Adicionada seção de transferência internacional (Firebase/EUA, Art. 33 LGPD)
- Nomeado encarregado DPO (Art. 41 LGPD): Arthur Olímpio Lima
- Adicionada cláusula sobre assistente Clara (IA não substitui julgamento clínico) nos Termos
- Prazo mínimo de 15 dias para alterações de política, 30 dias para mudança de plano pago
- Adicionado foro competente e lei aplicável (legislação brasileira) nos Termos
- skill `economia-tokens.md`: adicionada regra de não reler arquivo já lido na sessão

**Commits:** `82ef943`, `ffa610a`

---

## Estado atual — Março 2026 (v1.0)

### Funcionalidades completas

**Autenticação**
- Firebase Auth completo — email/senha + Google (popup com fallback redirect)
- syncCode gerado automaticamente no primeiro acesso, vinculado ao uid via `uid_map/{uid}`
- Isolamento por usuário via `owners/{code}/{uid}` nas regras do Firebase
- Login rápido com código: syncCode + senha via `/api/resolve-code` (serverless)
- Sessão gerida pelo Firebase Auth (persistência nativa)
- Configurações: alterar nome, criar senha (usuários Google), logout, excluir conta
- Logout automático multi-dispositivo: se conta excluída em outro dispositivo, sessão ativa detecta via onAuthStateChanged e recarrega a página
- Exclusão de conta via `/api/delete-account` (firebase-admin) — garante remoção de todos os nós incluindo `owners` (que tem regra restrita no cliente)

**Anotações**
- Avaliação inicial (dispositivos, posição, neuro, resp, eliminações, campos configuráveis via modal ⚙️, opção "Outro" livre em todos os grupos, localização poltrona)
- Sinais vitais (PA, FC, FR, SpO2, Tax, HGT, DOR com escala 0-10 colorida + conduta)
- Medicação (múltiplos meds, autocomplete, dupla checagem, vias: VO/EV/SC/IM/SNE/OFT/DERM/Sublingual/Recusa — dose opcional para DERM; local anatômico para IM e SC)
- Encaminhamento (IDA/RETORNO, destinos personalizados)
- Banho (aspersão/leito/fralda — higienes: Capilar, Facial, Corporal, Íntima, Oral)
- Curativo (avaliação COREN colapsável: tipo lesão, tamanho, leito+Outro, exsudato, perilesão+Outro, bordas; locais e materiais persistidos no Firebase ou temporários)
- Passagem de plantão
- Intercorrência / Livre

**Validação de formulários**
- Apenas nome do paciente é obrigatório em todas as anotações
- Todos os outros campos são opcionais — o enfermeiro preenche o que for relevante

**Pacientes**
- Cadastro com nome e leito
- Pendências com horário e notificação agendada

**Notificações (3 camadas de confiabilidade)**
- Funciona com app aberto, em segundo plano e completamente fechado (requer internet quando fechado)
- **Camada 1**: setTimeout preciso por notificação — dispara no horário exato com app aberto (funciona offline)
- **Camada 2**: FCM via cron — cron-job.org → /api/cron → Firebase Admin → FCM → Service Worker (app fechado/minimizado)
- **Camada 3**: setInterval 60s — safety net que recaptura timers perdidos pelo browser
- **Multi-dispositivo**: cada dispositivo salva seu próprio token FCM, cron envia para todos
- **Token FCM**: refresh automático a cada 12h + retry em 30s se falhar
- **Tag única**: cada notificação tem tag própria — evita substituição silenciosa pelo browser
- **onMessage**: handler obrigatório para receber FCM com app em foreground
- **Service Worker FCM**: `firebase-messaging-sw.js` usa Firebase compat SDK para entrega em background
- **Aviso contextual no app**: PacientesView exibe instruções específicas para Android e iPhone sobre como manter o app em segundo plano

**Organizador**
- Template de plantão
- Tarefas do plantão atual
- Planejamento do próximo plantão

**PWA**
- Banner de instalação ("Instalar o app")
- Banner de atualização disponível ("Atualizar")
- Funciona 100% offline (service worker Workbox)
- Sincronização automática quando volta online

**Calculadora de Medicação (FAB flutuante)**
- Dosagem: regra de três (prescrição / disponível × volume)
- Gotejamento: 4 fórmulas automáticas (macro/micro × horas/minutos)
- Diluição: reconstituição de pó com campo de volume do pó liofilizado (ex: Penicilina Cristalina)
- Conversões: tabela de referência estática
- Histórico dos últimos 5 cálculos em localStorage
- 34 testes Vitest com cobertura de segurança (entradas negativas, parseNum pt-BR)

**Assistente Clara (IA)**
- Powered by Groq — Llama 3.3 70B (gratuito)
- Persona restrita a enfermagem
- Ajuda a redigir anotações no formato correto do app
- Chips de atalho para situações comuns do plantão
- Disclaimer: "Clara é uma IA — verifique as respostas"
- API key segura no Vercel, nunca exposta no cliente

**Feedback**
- Usuários podem enviar feedback pelo app (usePulso.js — Pulso do App)
- Salvo em `feedback/{syncCode}/` no Firebase
- Email de agradecimento automático ao usuário + notificação interna para Arthur via Resend

**Emails transacionais (Resend)**
- Welcome: voz pessoal do Arthur, com deduplicação server-side
- Feedback ack: confirmação de recebimento ao usuário
- Admin notify: Arthur recebe cada feedback por email
- Day 3 tips: email com dicas 3 dias após o cadastro
- Goodbye: email de despedida ao deletar conta

---

## Firebase — estrutura atual

```
owners/{syncCode}/{uid}                          mapeamento uid → syncCode (segurança)
uid_map/{uid}                                    syncCode do usuário (restauração de sessão)
usuarios/{syncCode}/                             nome, email, criadoEm, email_boas_vindas_enviado, email_dia3_enviado
anotacoes/{syncCode}/                            anotações gerais
anotacoes_hc/{syncCode}/                         anotações HC
pacientes/{syncCode}/                            pacientes e pendências
organizador/{syncCode}/                          template, plantão
encaminhamento/{syncCode}/                       encaminhamentos
livres/{syncCode}/                               anotações livres
curativo/{syncCode}/                             curativos
curativo/{syncCode}/locais/                      locais customizados
curativo/{syncCode}/materiais/                   materiais customizados
fcm_tokens/{syncCode}/{deviceId}/                token FCM por dispositivo (multi-device)
notificacoes_agendadas/{syncCode}/               notificações pendentes de envio
feedback/{syncCode}/                             feedbacks dos usuários
```

---

## Infraestrutura

- **Vercel** (Hobby) — deploy automático via GitHub (main)
- **Firebase Auth** — autenticação email/senha + Google (gratuito, Spark)
- **Firebase Realtime DB** — dados do app (plano Spark gratuito)
- **cron-job.org** — chama /api/cron a cada minuto (gratuito, sem limitação Hobby)
- **Groq** — Llama 3.3 70B, gratuito, 14.400 req/dia
- **Resend** — emails transacionais (welcome, feedback, day 3, goodbye) via contato@plantao.net
- **Domínio** — plantao.net (Cloudflare), email contato@plantao.net → plantao.contato.net@gmail.com

---

## Histórico de sessões

### Mar 2026 — Lançamento público: limite de vagas + landing com urgência + horário obrigatório

**Decisão estratégica:**
- Pivot do plano original (validar pagamento com 5 conhecidas) para lançamento público real
- Motivo: quem o fundador conhece não está usando o app mesmo de graça — desconhecidos engajam mais
- Modelo mantido: 100 vagas gratuitas no lançamento → depois lista de espera → futuro paywall

**Horário obrigatório em todas as anotações:**
- 7 views de anotação + composable `useAnotacaoInicial.js` agora exigem horário antes de avançar/gerar
- Label `Horário *` com asterisco vermelho (`<span class="obrigatorio">*</span>`) em todos os campos
- Views multi-passo: validação em `avancar()` (Banho, Curativo, Encaminhamento, Passagem)
- Views passo único: validação em `gerar()` (Medicação, Sinais Vitais, Inicial)

**Limite de 100 vagas:**
- `auth.js`: `_verificarVagas()` lê `config/total_usuarios` antes de criar conta (email e Google). Se ≥ 100, bloqueia com erro `'limite-atingido'`
- `auth.js`: após cadastro bem-sucedido, incrementa `config/total_usuarios` com `increment(1)`
- `api/delete-account.js`: decrementa `config/total_usuarios` via transaction quando conta é excluída (nunca vai abaixo de 0)
- `database.rules.json`: `config/total_usuarios` com leitura pública + escrita autenticada. **Regras publicadas no Firebase Console.**

**Landing page com urgência e escassez:**
- Badge do hero: "Lançamento beta · X vagas restantes" (lê Firebase no `onMounted`)
- Barra de urgência vermelha pulsante quando restam ≤ 20 vagas
- CTA final: "Ainda restam X vagas" + botão "Garantir minha vaga →"
- Quando esgotado: botão vira "Entrar na lista de espera →" apontando para `mailto:contato@plantao.net`
- FAQ: resposta sobre "É gratuito?" atualizada mencionando o limite de 100 vagas

**Tela de lista de espera (LoginView):**
- Quando limite atingido, exibe tela dedicada com 🔒, título "Vagas esgotadas", email `contato@plantao.net` clicável
- Detectado automaticamente após `criarConta()` ou `entrarGoogle()` retornarem `'limite-atingido'`

**Painel admin de contador (AdminView + api/init-counter.js):**
- AdminView: card exibe total de usuários cadastrados / 100 vagas em tempo real ao abrir `/admin`
- Botão "🔄 Sincronizar contador": chama `/api/init-counter` que conta `usuarios/` via firebase-admin e seta o valor real
- **Uso obrigatório após deploy para inicializar com usuários existentes** — já feito (10 usuários encontrados)
- `api/init-counter.js`: endpoint admin-only (idToken + email `a.thurcos@gmail.com`)

**Estado atual após sessão:**
- 10 usuários cadastrados → 90 vagas restantes (confirmado via sync no /admin)

---

### Mar 2026 — Documentação: localização do MEMORY.md

- `CLAUDE.md`: instrução de leitura obrigatória agora inclui caminho completo do MEMORY.md (`C:\Users\Thurcos\.claude\projects\C--Users-Thurcos-Desktop-plantao\memory\MEMORY.md`) — evita confusão com MEMORY.md inexistente na raiz do projeto.

---

### Mar 2026 — Sessão pós-v1.0: usabilidade, histórico offline e estratégia de negócio

**Fix: excluir histórico sem internet**
- `anotacoes.js`: `deletar()` e `limparTudo()` agora atualizam local primeiro (otimista) — funciona offline, Firebase sincroniza quando voltar.
- Nova função `limparPorKeys(keys)` para exclusão seletiva.

**Limpar histórico por paciente**
- `HistoricoView`: quando chip de paciente está ativo, botão vira "Limpar [Nome]" e modal confirma apenas as anotações daquele paciente.

**Tour interativo + aviso Google no hospital**
- Novo passo no tour: explica que login Google pode não funcionar no computador do hospital → orientar criar senha em Configurações → Criar senha. Badge com logo Google colorido inline.

**Paywall de broadcast (HTTP 429)**
- `api/broadcast.js`: emails agora enviados sequencialmente com 500ms entre cada um. Elimina HTTP 429 do Resend. Para >50 usuários implementar Resend Batch API.

**Estratégia de negócio definida (office-hours)**
- Modelo: 45 dias gratuitos → R$14,99/mês (individual, não B2B)
- O Plantão é uma lista de verificação clínica portátil, não apenas app de notas
- Visão longa: rede profissional da enfermagem brasileira (Doximity brasileiro) — adiada para 5.000+ usuários
- Design doc: `Thurcos-main-design-20260323-205359.md`
- **Próxima ação:** perguntar pessoalmente para as 5 usuárias se pagariam R$14,99/mês

**Memória do projeto atualizada**
- `~/.claude/projects/C--Users-Thurcos-Desktop-plantao/memory/` atualizado com status v1.0 e estratégia
- `CLAUDE.md`: leitura obrigatória agora inclui MEMORY.md + design doc gstack + regra de atualizar ao fim de sessão

---

### Mar 2026 — v1.0 oficial: broadcast admin + desktop responsivo + fix notificações

**Fix crítico: cron desabilitado no cron-job.org**
- **Causa raiz:** cron-job.org auto-desabilita jobs após N falhas HTTP consecutivas (toggle fica off silenciosamente no painel). Não era problema de código, CRON_SECRET ou Vercel — o job simplesmente estava desativado.
- **Solução:** reativar manualmente o toggle no painel do cron-job.org.
- **Aprendizado:** se notificações FCM pararem de funcionar com app fechado, verificar PRIMEIRO se o job está ativo em cron-job.org antes de debugar código. Tokens FCM inválidos não derrubam o cron (erros são capturados por `Promise.allSettled`, cron retorna 200 sempre).

**Fix: notificações não chegavam com app minimizado**
- **Causa:** Firebase SDK no SW detectava aba congelada (minimizada) e encaminhava push via `postMessage` para a aba em vez de exibir a notificação → mensagem perdida silenciosamente.
- **Solução 1:** `api/cron.js` alterado para payload **data-only** (sem `webpush.notification`) — sem `notification`, Firebase SDK não tenta auto-exibir nem encaminhar.
- **Solução 2:** push handler raw registrado **antes** do Firebase SDK no `firebase-messaging-sw.js` — sempre chama `showNotification()` independente do estado da aba.
- **`onMessage` removido** do `usePushNotificacoes.js` — sem ele, Firebase SDK não encaminha push para aba congelada.

**Admin broadcast — `api/broadcast.js` + `AdminView.vue` (NOVO)**
- `api/broadcast.js`: endpoint serverless com verificação de idToken + restrição ao email admin (`a.thurcos@gmail.com`). Envia FCM data-only e/ou email Resend para todos os usuários cadastrados. Tokens FCM inválidos removidos automaticamente. Retorna `{push, email, erros}`.
- `src/views/AdminView.vue`: página `/admin` com form (título, mensagem, tipo push/email/ambos) e exibição detalhada dos erros parciais (tipo, device key, mensagem de erro).
- `src/router/index.js`: rota `/admin` com guards `requiresAuth` + `requiresAdmin` — redireciona para dashboard se não for o admin.

**Dashboard desktop responsivo**
- Media query `≥768px`: grid de 4 colunas nos cards de anotação, container alargado para 960px.
- Histórico, Pacientes e Organizador em 3 colunas lado a lado — **Histórico em destaque azul e posicionado primeiro** (mais usado no PC).
- Mobile sem nenhuma alteração.

**Branding: remoção de "técnico de enfermagem"**
- `api/welcome.js`: removida frase "Sou técnico de enfermagem e criei esse app..." — agora apenas "Criei esse app porque sentia falta de uma ferramenta que entendesse de verdade a rotina do plantão."
- `LandingView.vue`: badge hero → "Para a equipe de enfermagem"; título dos depoimentos → "Criado por quem vive o plantão, para quem vive o plantão".

---

### Mar 2026 — v1.0: FCM nativo + exclusão de conta robusta + UX de notificações

**Migração OneSignal → FCM nativo:**
- `usePushNotificacoes.js` reescrito do zero: `getMessaging(app)`, `getToken()` com VAPID key, `onMessage()` para foreground
- `public/firebase-messaging-sw.js` (NOVO): Service Worker com Firebase compat SDK para entrega em background
- `api/cron.js` reescrito para usar `admin.messaging().send()` com payload `webpush.notification` (sem `data` nem `notification` top-level)
- Token multi-dispositivo: `fcm_tokens/{syncCode}/{deviceId}`, refresh automático a cada 12h
- `OneSignalSDKWorker.js` deletado; script CDN removido do `index.html`
- `vite.config.js`: `globIgnores: ['firebase-messaging-sw.js']` + `importScripts` no workbox

**Exclusão de conta robusta (`api/delete-account.js` — NOVO):**
- Endpoint serverless autenticado (Bearer idToken) via firebase-admin
- Deleta todos os 15 paths de dados incluindo `owners/{code}` — que tem regra de escrita restrita no Firebase e não podia ser deletado pelo cliente
- `ConfiguracoesView.vue`: chama `/api/delete-account` com Bearer token, faz `localStorage.clear()`, `deleteUser()` e `window.location.replace('/')`

**Fix: re-cadastro Google com conta deletada:**
- `_vincularGoogleSeNovo` em `auth.js` agora verifica `owners/{code}/{uid}` depois de encontrar `uid_map` — detecta dados órfãos de conta excluída e trata como novo usuário

**Fix: logout automático multi-dispositivo:**
- `onAuthStateChanged` null handler em `auth.js` usa guard `eraLogado` — distingue login inicial (null esperado) de sessão encerrada por exclusão remota
- Se `eraLogado === true` e uid.value estava setado, limpa estado e chama `window.location.replace('/')`

**UX — PacientesView:**
- Aviso de notificações com instruções específicas para Android (otimização de bateria) e iPhone (manter em segundo plano)
- Botão `+ Paciente` sempre visível na linha do título (não dependia só do FAB)

**UX — OrganizadorView:**
- Removido ícone de relógio e input de horário das tarefas (notificações via app de pacientes, não aqui)

---

### Mar 2026 — Blindagem do sistema de notificações
**Problema:** notificações não funcionavam com app fechado e atrasavam com app aberto. Bugs acumulados de sessões anteriores tornavam o sistema não confiável.

**Root causes encontrados:**
1. **Tag duplicada no push** — `push-handlers.js` não extraía `payload.notification?.tag`, então TODAS as notificações recebiam tag fallback `'plantao'` → browser substituía uma pela outra silenciosamente
2. **FCM engolido em foreground** — sem handler `onMessage`, o Firebase SDK consumia mensagens FCM silenciosamente quando app estava aberto
3. **Polling impreciso** — `setInterval` de 20s como único mecanismo local → impreciso e throttled pelo browser em background tabs
4. **Token FCM expirava** — sem refresh automático, cron enviava para tokens mortos sem feedback
5. **Listener leak no logout** — `pacientes.js` e `organizador.js` usavam `off(newRef)` em vez de chamar `unsubscribe()` retornada por `onValue()`. `App.vue` só chamava `anotacoes.parar()` — os outros stores nunca eram limpos
6. **Tag não propagava no cron** — `api/cron.js` só enviava tag em `webpush.notification.tag`, mas `push-handlers.js` checava `payload.data?.tag` primeiro

**Correções (3 commits):**
- `2741096` — **Listener leak**: `pacientes.js` e `organizador.js` agora chamam `unsubscribe()` corretamente; `App.vue` chama `parar()` de TODOS os stores no logout + limpa chat
- `28a6838` — **Reescrita usePushNotificacoes.js**: setTimeout preciso por notificação, onMessage handler, token refresh 12h, safety net 60s, re-init ao voltar à aba
- `e2da47f` — **Tag única**: `push-handlers.js` checa `notification?.tag`; `cron.js` envia tag em `data.tag` (redundância)

**Cobertura de cenários:**
| Cenário | Funciona? | Mecanismo |
|---------|-----------|-----------|
| App aberto + internet | ✅ | setTimeout local + onMessage FCM |
| App aberto + offline | ✅ | setTimeout local (100% offline) |
| App minimizado + internet | ✅ | FCM via Service Worker |
| App fechado + internet | ✅ | FCM via Service Worker |
| App fechado + offline | ❌ | Limitação do browser — PWA não tem acesso a alarmes do OS |

### Mar 2026 — Sistema de emails transacionais com voz do fundador
- **api/welcome.js**: reescrito com tom pessoal do Arthur ("Aqui é o Arthur, fundador do Plantão") + deduplicação server-side via flag `email_boas_vindas_enviado` no Firebase + syncCode no payload. Dica: copiar texto formatado pronto para o prontuário.
- **api/feedback.js** (NOVO): endpoint autenticado (idToken obrigatório) que ao receber feedback via usePulso.js: (1) envia email de agradecimento ao usuário, (2) notifica Arthur em contato@plantao.net com o texto e a versão do app. Rate limit 5 req/min por uid.
- **api/goodbye.js** (NOVO): endpoint autenticado que envia email de despedida quando usuário deleta a conta. Busca nome/email server-side via Firebase Admin (não confia no body). Timeout 5s, falha silenciosa — nunca bloqueia o delete.
- **api/cron.js**: adicionada lógica de Day 3 email — envia dicas para usuários criados há exatamente 3 dias (janela 1h). Flag `email_dia3_enviado` setada antes do envio para idempotência. Destaca notificações (Organizador + Pendências), calculadora e Meus Pacientes.
- **src/composables/usePulso.js**: após salvar feedback no Firebase, dispara fetch para api/feedback com idToken + auth.userEmail (fire-and-forget, guarded por auth.userEmail).
- **src/views/ConfiguracoesView.vue**: chama api/goodbye.js com `Promise.race([fetch, delay(5000)])` antes de deleteUser — sempre prossegue independente do resultado.
- **src/stores/auth.js**: passa `syncCode` no payload do welcome (necessário para deduplicação server-side).
- **Todos os emails**: remetente `Arthur do Plantão <contato@plantao.net>` via Resend — sem referência ao Firebase interno.
- **Firebase Console**: domínio plantao.net em verificação DNS para emails de reset (48h). Não afeta os emails via Resend.
- **Firebase Dynamic Links**: aviso de descontinuação NÃO afeta o Plantão — app usa email/senha e Google OAuth, não email link auth.

### Mar 2026 — Segurança backend + Landing page + Email de contato
- **api/cron.js**: `CRON_SECRET` agora obrigatório (fail-closed) — antes passava qualquer request se a variável não existisse
- **api/resolve-code.js**: rate limiting 10 req/min por IP + email mascarado na resposta (`a****@gmail.com`) para evitar enumeração
- **api/chat.js**: rate limiting 20 msg/min por uid + erro genérico sem expor nome de variável interna
- **Landing page**: hero focado na dor ("Chega de anotar no papel e digitar tudo de novo"), stats com tempo economizado (~30min/plantão), features reescritas com benefício, depoimentos com situações reais, seção FAQ com 6 perguntas comuns, CTA final reescrito
- **Footer landing**: email `contato@plantao.net` clicável

### Mar 2026 — Firebase Auth + domínio plantao.net
- **Migração completa** de syncCode+PIN para Firebase Auth (email/senha + Google)
- **LoginView**: telas de login, cadastro, login por código (syncCode+senha via API), recuperar senha
- **ConfiguracoesView**: nome, email, syncCode, criar senha (Google users via linkWithCredential), logout, excluir conta (apaga 14 paths Firebase + Firebase Auth)
- **api/resolve-code.js**: serverless — recebe syncCode, retorna email via admin SDK (sem expor email no cliente)
- **api/chat.js**: autenticação migrada para Firebase Auth idToken + verificação owners table
- **database.rules.json**: isolamento total por uid via `owners/{code}/{uid}`, `uid_map` read-only por uid dono
- **Router guard**: aguarda `authReady` antes de qualquer redirect
- **DashboardView**: botão ⚙️ no header → ConfiguracoesView
- **Domínio**: plantao.net registrado no Cloudflare, conectado ao Vercel, email contato@plantao.net
- **Landing/Onboarding**: copy atualizado para Firebase Auth (sem referências a syncCode+PIN)
- **Google OAuth**: consent screen atualizado com nome "Plantão" e domínio plantao.net

### Mar 2026 — Anotação Inicial customizável + FCM multi-dispositivo
- **AnotacaoInicialView**: modal de personalização (⚙️) para ligar/desligar 9 campos individuais no texto gerado
- **AnotacaoInicialView**: opção "Outro" (texto livre) em todos os grupos de radio/chips — posição da cama, rodas, grades, decúbito, colaboração, deambulação, respiração
- **AnotacaoInicialView**: localização "Poltrona" — quando paciente não está no leito, esconde campos de cama/rodas/grades/decúbito e gera texto "com paciente em poltrona"
- **gerarTextoInicial.js**: aceita `camposAtivos` para controle field-level; guard para todos off
- **camposAnotacaoInicial.js**: config central dos 9 campos customizáveis
- **ConfigAnotacaoInicialModal.vue**: bottom sheet com checkboxes para cada campo
- **gerarTextoInicial.test.js**: 12 testes Vitest cobrindo on/off, poltrona, backward compat
- **FCM multi-dispositivo**: cada dispositivo gera `plantao_device_id` no localStorage e salva token em `fcm_tokens/{syncCode}/{deviceId}` — celular e PC recebem notificações simultaneamente
- **FCM cron simplificado**: removido lock por `transaction()` que impedia envio (Firebase Admin SDK retorna null no callback sem cache local no serverless)
- **FCM mutex melhorado**: segunda chamada de `configurarFCM` agora aguarda o registro em andamento em vez de ignorar — corrige aviso falso "só com app aberto" no OrganizadorView

### Mar 2026 — Calculadora de Medicação (FAB flutuante)
- **CalculadoraModal.vue**: bottom sheet com 4 abas — Dosagem, Gotejamento, Diluição, Conversões
- **Dosagem**: regra de três (dose prescrita / disponível × volume = ml a aspirar)
- **Gotejamento**: 4 fórmulas automáticas conforme equipo (macro/micro) e unidade de tempo (horas/minutos) com gotas/min e ml/h simultâneos para microgotas
- **Diluição**: reconstituição de medicamento em pó com campo "Volume do pó liofilizado" colapsável e dica "só preencha se a bula informar" — correto para Penicilina Cristalina (pó desloca 2-4ml), transparente para Meropenem e outros sem deslocamento relevante
- **Conversões**: tabela de referência estática (massa, gotejamento, medidas caseiras)
- **Histórico**: últimos 5 cálculos salvos no localStorage, visíveis na parte inferior do modal, com botão limpar
- **FAB verde** em `bottom: 152px right: 18px` — empilhado acima de Clara (90px) sem sobreposição
- **useCalculadora.js**: composable singleton com scroll lock + onUnmounted cleanup, reset ao fechar, limpeza de campos ao trocar unidade
- **useCalculadora.test.js**: 24 testes Vitest — parseNum, fmt, dosagem (4 casos), gotejamento (5 casos), diluição (4 casos), reset
- **Inputs**: `type="text" inputmode="decimal"` com `replace(',', '.')` — aceita vírgula pt-BR no iOS
- **Segurança matemática (review pós-implementação)**: 4 bugs críticos corrigidos via `/review`:
  - Dosagem: entradas negativas agora retornam `--` (era possível exibir "−2,4 ml")
  - Gotejamento: tempo negativo agora retorna `--` (era possível exibir "−42 gotas/min")
  - Diluição: diluente negativo retorna `--`; volumePo negativo é tratado como 0
  - `parseNum`: `"5.000,00"` agora parseia como 5000 (ponto como milhar quando há vírgula decimal)
- **Testes ampliados**: 34 testes Vitest — inclui cobertura de todos os casos de entrada inválida

### Mar 2026 — Medicação: local anatômico + dupla checagem
- **AnotacaoMedicacaoView**: adicionado campo "Local anatômico" (chips opcionais) para vias IM, SC e EV — locais IM: Glúteo D/E, Deltoide D/E, Vasto lat. D/E; locais SC: Abdômen D/E, Braço D/E, Coxa D/E; locais EV: Braço D/E, Antebraço D/E, Mão D/E
- **AnotacaoMedicacaoView**: local anatômico incluso no texto gerado ("IM no glúteo D") e no resumo do card de medicamento
- **Dupla checagem**: já implementada por medicamento com campo de cargo (Téc./Enf.) + nome com autocomplete — verificado e funcional

### Mar 2026 — Conformidade COREN-SP 2022 + melhorias UX
- **CurativoView**: seção "Avaliação da lesão" colapsável (▼/▲) com campos COREN: tipo de lesão, tamanho em cm, leito da ferida (chips + "Outro" livre), exsudato (quantidade + aspecto), pele perilesão (chips + "outro" livre), bordas
- **CurativoView**: locais agora funcionam igual a materiais — botão "Salvar no banco de dados" ou "Só nesta anotação"
- **CurativoView**: Firebase subcoleções `curativo/{syncCode}/locais/` e `curativo/{syncCode}/materiais/`
- **CurativoView**: removidos Papaína gel 2% e Clorexidina aquosa dos materiais padrão; corrigido "purolento" → "purulento"
- **SinaisVitaisView**: escala de dor 0-10 com chips coloridos (0–3 neutro, 4–6 laranja, 7–10 vermelho) + conduta (comunicou enfermeira, medicou, reavaliou)
- **SinaisVitaisView**: CSS `btn-icon` scoped adicionado (botão voltar estava sem estilo)
- Leitura completa do COREN-SP 2022 (págs. 33–59) para alinhamento dos campos obrigatórios

### Mar 2026 — UX: Clara + landing + UX geral
- **Removido** banner "Pronto para começar?" do dashboard — UX desnecessária
- **Removidos** confetes ao copiar primeira anotação
- **Removida** obrigatoriedade de todos os campos exceto nome do paciente (em todas as 8 views de anotação + modais)
- **Corrigida** regra de segurança do Firebase: path `feedback` estava ausente, causando silencioso bloqueio de escrita
- **Corrigida** proteção `crypto.subtle` em contexto HTTP — erro explícito no login em vez de falha silenciosa

### Mar 2026 — Sessão estendida + onboarding
- Sessão estendida de 20h para 30 dias no localStorage
- Clara restrita a Intercorrência, banner de onboarding e bug de `ref` no template corrigidos

### Mar 2026 — Auditoria e polish de design
- Corrigido bug crítico: `router.push('/login')` causava tela azul/branca no iPhone no onboarding → corrigido para `router.push({ name: 'login' })`
- Banner de "Nova versão disponível" agora só aparece no dashboard, não durante login/onboarding
- Botão "Continuar no PC mesmo assim" (PcView) com touch target correto: min-height 44px (era 33px)
- Cores hardcoded #e57373/#ef9a9a no aviso de PIN substituídas por `var(--warning)`
- Emoji de foguete 🚀 substituído por ✓ no último slide do onboarding
- Dots de progresso do onboarding: visibilidade melhorada (`--text-muted` em vez de `--border`)
- SVG herda font-family do body — corrige fonte Times New Roman em alguns browsers

### Mar 2026 — Sessão anterior
- Corrigido bug crítico no api/cron.js (variável não declarada impedia envio FCM)
- Migrado cron do Vercel (plano Hobby não suporta `* * * * *`) para cron-job.org
- Implementado assistente Clara com Groq Llama 3.3 70B
- Dose opcional para via DERM corrigida no card da lista de medicamentos

### Mar 2026 — Sessões anteriores
- FCM completo implementado (notificações com app fechado no Android)
- Banner PWA de instalação e de atualização disponível
- Sistema de notificações agendadas (30min antes + horário exato)
- Offline-first com sincronização automática
- Rollback executado após integração Gemini quebrar notificações (outro AI)

### Mar 2026 — Ícone real + página de redefinição de senha + melhorias visuais

**Ícone do app:**
- Novo ícone gerado via Imagen 3 (Gemini): clipboard médico com lombada azul (#1E88E5), 3 argolas, linhas de anotações e estetoscópio bold no topo
- Substituídos SVGs genéricos em login, dashboard e landing pelo ícone real (`icon-512.png`)
- Corrigido erro crítico de build do Vercel: `icon.png` (3.77 MB) remov ido — vite-plugin-pwa tem limite de 2 MB para precache
- `icon-512.png` (298 KB) e `icon-192.png` (37 KB) são os arquivos definitivos em `public/icons/`

**Página de redefinição de senha (`/auth/action`):**
- Nova rota `/auth/action` no router com `AuthActionView.vue`
- Recebe `oobCode` + `mode` do Firebase Auth e exibe formulário para criar nova senha
- Firebase Console: URL acionável configurável para `https://plantao.net/auth/action`
- Template de email de reset melhorado (português, texto mais claro)

**Política de privacidade / termos:**
- Identificado: política mencionava "descadastrar no rodapé do email" mas emails não têm essa opção — pendente correção
- Discussão: "profissional de enfermagem" é o termo correto (inclui técnicos e auxiliares) vs "enfermeiro" — pendente aplicar nos documentos legais

**Admin:**
- Broadcast para usuários: mensagem sobre atualização de Política/Termos (LGPD, COFEN) redigida
- Discussão sobre botão de broadcast mais acessível no topo do admin (usuários estão crescendo)
