# Changelog — Plantão

## O que é o app

**Plantão** é um PWA de anotações de enfermagem para uso no celular durante plantão hospitalar. Gera textos formatados prontos para copiar no sistema do hospital. Funciona offline, sincroniza via Firebase Realtime Database, e pode ser instalado como app no celular sem precisar de loja de aplicativos.

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
