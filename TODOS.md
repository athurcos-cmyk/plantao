# TODOS — Plantão

## Concluídos

### [x] Migração OneSignal → FCM nativo (v1.0)
**Concluído:** 2026-03-23

Migração completa da infraestrutura de push notifications de OneSignal para Firebase Cloud Messaging nativo:
- `usePushNotificacoes.js` reescrito com `getMessaging`, `getToken` (VAPID), `onMessage` para foreground
- `public/firebase-messaging-sw.js` — novo service worker com Firebase compat SDK para background delivery
- `api/cron.js` — novo payload `webpush.notification` via `admin.messaging().send()`, auto-remove tokens inválidos
- `OneSignalSDKWorker.js` deletado, CDN removido do `index.html`
- `VITE_FCM_VAPID_KEY` adicionada ao Vercel

---

### [x] Exclusão de conta robusta + proteção anti-re-cadastro Google (v1.0)
**Concluído:** 2026-03-23

- `api/delete-account.js` (NOVO): endpoint serverless com firebase-admin que deleta todos os 15 paths de dados incluindo `owners/{code}` (que tinha regra restrita e não era deletável pelo cliente)
- `ConfiguracoesView.vue`: usa `/api/delete-account` com Bearer token em vez de `remove()` direto
- `auth.js` → `_vincularGoogleSeNovo`: verifica existência de `owners/{code}/{uid}` antes de reutilizar `uid_map` — evita re-vincular syncCode de conta deletada
- Após exclusão: `localStorage.clear()` + `window.location.replace('/')` (era `router.push`)
- Logout automático multi-dispositivo via guard `eraLogado` no `onAuthStateChanged`

---

### [x] Blindagem do sistema de notificações
**Concluído:** 2026-03-22

**O que estava quebrado e o que foi feito:**

| Bug | Causa raiz | Correção |
|-----|-----------|----------|
| Notificações substituídas silenciosamente | `push-handlers.js` não extraía `notification?.tag` — tudo virava tag `'plantao'` | Adicionado `payload.notification?.tag` na cadeia de extração |
| FCM engolido com app aberto | Sem `onMessage` handler — SDK consumia silenciosamente | Handler `onMessage` via `messagingReady` adicionado |
| Notificação atrasava com app aberto | `setInterval` 20s impreciso, throttled em bg tabs | `setTimeout` preciso por notificação via Map `_timers` |
| Token FCM expirava silenciosamente | Sem refresh — cron enviava para token morto | Refresh automático a cada 12h + retry 30s |
| Listeners Firebase vazavam no logout | `off(newRef)` em vez de `unsubscribe()` | `pacientes.js` e `organizador.js` chamam `unsubscribe()` corretamente |
| `pacientes.parar()` nunca chamado | `App.vue` só chamava `anotacoes.parar()` | Adicionado `pacientes.parar()` + `organizador.parar()` + `limparConversa()` |
| Tag não propagava pelo cron | `cron.js` só enviava em `webpush.notification.tag` | Adicionado `data: { tag }` no payload FCM (redundância) |

**Arquitetura final — 3 camadas:**
1. `setTimeout` preciso por notificação (app aberto, funciona offline)
2. FCM via cron (app fechado/minimizado, requer internet)
3. `setInterval` 60s safety net (recaptura timers perdidos)

**Arquivos alterados:** `usePushNotificacoes.js` (reescrita), `push-handlers.js`, `api/cron.js`, `pacientes.js`, `organizador.js`, `App.vue`, `useChat.js`

---

### [x] Aviso de modo privado na LoginView
**Concluído:** 2026-03-21
Implementado em `LoginView.vue` com `v-if="auth.modoPrivado"` — chip discreto informando que a sessão não será salva ao fechar o app em modo privado do iOS Safari.

---

### [x] Criar DESIGN.md formal
**Concluído:** 2026-03-21
`DESIGN.md` criado via `/design-consultation` com todos os tokens, tipografia, espaçamento, motion, componentes e anti-patterns. CLAUDE.md atualizado com referência.

---

### [x] Anotação Inicial: campos configuráveis + Outro + Poltrona
**Concluído:** 2026-03-22
Modal ⚙️ para ligar/desligar 9 campos no texto gerado. Opção "Outro" (texto livre) em todos os grupos de radio. Localização "Poltrona" quando paciente não está no leito. Config salva em localStorage + Firebase.

---

### [x] FCM multi-dispositivo
**Concluído:** 2026-03-22
Cada dispositivo salva token FCM separado em `fcm_tokens/{syncCode}/{deviceId}`. Cron envia para todos os dispositivos. Removido lock por transaction que impedia envio. Mutex agora aguarda registro em andamento em vez de ignorar.

---

## Pendentes

### [ ] Validação de pagamento com usuárias (próxima ação prioritária)
**O quê:** Perguntar pessoalmente para cada uma das 5 usuárias: "Você pagaria R$14,99/mês?"
**Por quê:** É a validação mais importante antes de qualquer linha de código de paywall.
**Como:** Presencialmente ou ligação — não por mensagem. Ouvir a resposta completa.
**Meta:** ≥3 de 5 dizem sim → implementar paywall. Abaixo disso → ajustar proposta.
**Prioridade:** P0 — fazer essa semana

---

### [ ] Paywall Stripe Checkout (após validação)
**O quê:** 45 dias gratuitos → R$14,99/mês. Stripe Checkout (sem UI customizada).
**Implementação:**
- Salvar status em `usuarios/{syncCode}/subscription` no Firebase
- Bloquear acesso apenas quando online (offline = período de graça — nurse mid-shift não é bloqueada)
- Cancelamento via Stripe portal (self-serve)
**Depende de:** Validação com usuárias (item acima)
**Prioridade:** P1

---

### [ ] Aviso iOS: reinstalar PWA se ícone sumir
**O quê:** Pequeno aviso no onboarding ou login para usuários iOS: "Se o ícone sumir após atualização do iOS, abra o Safari, acesse plantao.net e adicione à tela novamente. Seus dados estão salvos."
**Por quê:** iOS remove PWAs após atualização do sistema. Usuária reportou o problema.
**Prioridade:** P2

---

### [ ] Resend Batch API para broadcast em escala
**O quê:** Quando base crescer para 50+ usuários, substituir envio sequencial por `/emails/batch` do Resend (até 100 por request).
**Por quê:** Envio sequencial com 500ms funciona para 8 usuários mas não escala.
**Prioridade:** P3 — só quando necessário

---

### [x] Admin broadcast (concluído 2026-03-23)
**O quê:** Página `/admin` para enviar push e/ou email para todos os usuários cadastrados.
**Implementado:**
- `api/broadcast.js`: idToken verificado + restrição ao email admin. FCM data-only + Resend. Tokens inválidos auto-removidos.
- `AdminView.vue`: form com título, mensagem, chips push/email/ambos. Exibe resultado com erros parciais detalhados.
- `router/index.js`: rota com `requiresAdmin` — redireciona para dashboard se não for o admin.

---

### [x] Dashboard desktop responsivo (concluído 2026-03-23)
**O quê:** Layout melhorado para PC (≥768px) sem alterar mobile.
**Implementado:** Grid 4 colunas nos cards de anotação. Histórico + Pacientes + Organizador em 3 colunas, histórico em destaque azul e primeiro. Container 960px.

---

### [x] Fix notificações: cron desabilitado no cron-job.org (concluído 2026-03-23)
**Causa raiz:** cron-job.org auto-desabilita o job após falhas HTTP consecutivas. Toggle estava off no painel — não era bug de código.
**Fix:** reativar toggle no painel + payload data-only no cron + push handler raw no SW antes do Firebase SDK.
**Regra:** erros de token FCM nunca derrubam o cron (retorna 200 sempre). Se FCM parar: checar cron-job.org primeiro.

---

### [x] Branding: remoção de "técnico de enfermagem" (concluído 2026-03-23)
`welcome.js` e `LandingView.vue` atualizados — referências removidas de todos os textos públicos.

---

### [x] Histórico de cálculos na Calculadora (concluído 2026-03-21)
**O quê:** Salvar os últimos 5 cálculos no `localStorage` para reutilizar durante o plantão.
**Por quê:** Evita redigitar a mesma prescrição ao medicar múltiplos pacientes — comum em plantão.
**Pros:** Baixa complexidade (só localStorage), zero Firebase, alto valor de uso repetitivo.
**Cons:** Aumenta levemente a complexidade do `useCalculadora.js`; precisa decidir formato de exibição no bottom sheet.
**Contexto:** Feature pendente do MVP da calculadora (FAB flutuante). A calculadora atual reseta ao fechar — o histórico seria uma camada adicional, não substituição do comportamento atual. Começar por: array de 5 objetos `{tipo, inputs, resultado, timestamp}` no localStorage, exibir em lista colapsável na parte de baixo do modal.
**Depende de:** Calculadora MVP estar live (CalculadoraModal.vue + useCalculadora.js).
**Prioridade:** P3

---

### [x] Calculadora de Diluição de Medicamentos em Pó (concluído 2026-03-21)
**O quê:** Aba adicional "Diluição" na calculadora — dado um medicamento liofilizado em pó + diluente adicionado, calcula concentração resultante e volume a aspirar.
**Por quê:** Muito comum em internação, UTI e pediatria. Ampicilina, Penicilina Cristalina, Cefazolina — todos vêm em pó e exigem reconstituição antes do cálculo de dose.
**ATENÇÃO CLÍNICA — volume do pó liofilizado (NÃO é universal):**
Apenas certos medicamentos têm deslocamento de pó significativo que altera o volume final. **A maioria não precisa** (ex: Meropenem, Ceftriaxona, Metronidazol → deslocamento desprezível).
Medicamentos que **precisam** do ajuste:
- Penicilina Cristalina 5.000.000 UI: pó ocupa ~2 mL → adicionar 8 mL diluente = 10 mL total
- Penicilina Cristalina 10.000.000 UI: pó ocupa ~4 mL → adicionar 6 mL diluente = 10 mL total
- Ampicilina e Cefazolina: verificar bula — alguns fabricantes têm deslocamento relevante
**Decisão de UX:** O campo "Volume do pó (mL)" deve ser **opcional, colapsável e default 0**. UI deve ter uma nota: "Só preencha se a bula informar o volume de deslocamento (ex: Penicilina Cristalina)". Não exibir o campo com destaque — a maioria dos medicamentos não usa.
**A calculadora deve:**
  1. Campo opcional "Volume do pó (mL)" — default 0
  2. Volume total = volume_diluente + volume_pó
  3. Resultado: concentração (mg/mL ou UI/mL) + volume a aspirar para a dose prescrita
**Cons:** Se o campo for mal compreendido, o usuário pode preencher volume de pó em medicamentos que não precisam → cálculo errado. Mitigação: texto de ajuda claro + field discreto (não em destaque).
**Como implementar:** 4ª aba no mesmo CalculadoraModal.vue, composable useCalculadora.js já existente.
**Nota no CHANGELOG:** Ao implementar, registrar o aviso clínico sobre volume do pó liofilizado explicitamente.
**Depende de:** Calculadora MVP estar live.
**Prioridade:** P2

---

### [x] Firebase Auth completo
**Concluído:** 2026-03-22
Migração de syncCode+PIN para Firebase Auth (email/senha + Google). LoginView com 4 telas, ConfiguracoesView, api/resolve-code.js, regras Firebase com isolamento por uid, router guard com authReady.

---

### [x] Domínio plantao.net
**Concluído:** 2026-03-22
Registrado no Cloudflare. Conectado ao Vercel. Email contato@plantao.net com routing para plantao.contato.net@gmail.com. Domínio adicionado no Firebase Auth e Google OAuth.

---

### [x] Segurança backend (pós-auth)
**Concluído:** 2026-03-22
CRON_SECRET obrigatório (fail-closed). Rate limiting em resolve-code (10/min por IP) e chat (20/min por uid). Email mascarado no resolve-code. Erro genérico sem expor variáveis internas.

---

### [x] Landing page reescrita
**Concluído:** 2026-03-22
Hero focado na dor. Stats com tempo economizado. Features reescritas com benefício. Depoimentos específicos. Seção FAQ. CTA reformulado. Email contato@plantao.net no footer.

---

### [x] Sistema de emails transacionais com voz do fundador
**Concluído:** 2026-03-22
5 emails implementados via Resend (contato@plantao.net):
- **Welcome** (api/welcome.js): tom pessoal do Arthur, deduplicação via `email_boas_vindas_enviado`, dica sobre copiar texto pronto.
- **Feedback ack** (api/feedback.js): agradecimento ao usuário + notificação interna para Arthur. Auth idToken obrigatório, rate limit 5/min.
- **Day 3 tips** (api/cron.js): email com dicas 3 dias após cadastro (janela 1h, flag `email_dia3_enviado`).
- **Goodbye** (api/goodbye.js): despedida ao deletar conta. Busca dados server-side, timeout 5s, nunca bloqueia delete.
**Pendente de configuração manual:** criar conta Resend → verificar plantao.net → adicionar `RESEND_API_KEY` no Vercel. Sem isso, os emails ficam desativados silenciosamente.

---

### [ ] Configurar Resend em produção
**O quê:** Criar conta no Resend, verificar domínio plantao.net e adicionar `RESEND_API_KEY` no Vercel.
**Por quê:** Sem a chave, todos os 5 emails retornam `{ ok: false, reason: 'not_configured' }` silenciosamente — o cadastro funciona normalmente, mas nenhum email é enviado.
**Como:**
1. resend.com → Sign Up → Domains → Add Domain → `plantao.net`
2. Adicionar registros DNS no Cloudflare (automático ou manual)
3. API Keys → Create → copiar chave `re_...`
4. Vercel → Settings → Environment Variables → `RESEND_API_KEY` → Redeploy
**Prioridade:** P1 — bloqueia todos os emails

---

### [ ] Verificação domínio Firebase para email de reset
**O quê:** Aguardar propagação dos registros DNS (TXT + CNAME) para o Firebase Auth usar plantao.net como remetente no email de reset de senha.
**Por quê:** Atualmente o reset sai de `noreply@anotacao-hc.firebaseapp.com` — confuso para o usuário.
**Status:** Registros DNS adicionados no Cloudflare. Aguardando até 48h para verificação.
**Após verificar:** No Firebase Console → Authentication → Templates → mudar nome do remetente para "Plantão" e reply-to para contato@plantao.net.
**Prioridade:** P2 — cosmético, não bloqueia funcionalidade

---

### [ ] Board colaborativo (deferido do CEO Review 2026-03-21)
**O quê:** Avaliar funcionalidade colaborativa (múltiplos técnicos, mesmo plantão).
**Por quê:** Poderia servir clínicas pequenas onde o time é unido e quer compartilhar anotações.
**Por que deferido:** App permanece individual por decisão de produto — a proposta de valor é "ferramenta pessoal que independe do hospital". Tornar colaborativo introduziria dependência institucional.
**Quando revisar:** Se clínicas pequenas com time unido pedirem explicitamente (coletar via Pulso do App).
**Prioridade:** P3
**Depende de:** Feedback de usuários de clínicas (via Feature 5 — Pulso do App)

---

### [ ] Modo de Local de Trabalho — UPA/UBS/Clínicas (deferido do CEO Review 2026-03-21)
**O quê:** Adaptar terminologia do app para funcionar em UPA, UBS e clínicas, não só hospitais.
**Por quê:** Mercado endereçável ~5x maior: qualquer serviço de saúde que exige registro em prontuário usa o mesmo fluxo de documentação.
**Por que deferido:** Fundador não conhece os termos e fluxos de UPA/UBS. Abordagem lean: lançar com terminologia hospitalar + coletar feedback de usuários de UPA/UBS via Pulso do App antes de implementar.
**Como:** Pesquisar terminologia via web → validar com usuários reais → implementar somente termos confirmados.
**Prioridade:** P2
**Depende de:** Feature 5 (Pulso do App) estar live para coletar feedback de contexto

---

### [x] Proteção para crypto.subtle em HTTP
**Concluído (indireto):** 2026-03-22
Com a migração para Firebase Auth, `hashPin()` e `hashPinLegacy()` foram removidos por completo. Firebase Auth gerencia autenticação nativamente via HTTPS. Não há mais uso de `crypto.subtle` no fluxo de login.

---

### [x] Adicionar token --warning ao style.css
**Concluído:** 2026-03-21
Adicionados `--warning`, `--warning-muted`, `--info`, `--info-muted`, `--blue-muted`, `--danger-muted`, `--success-muted`, `--radius-lg`, `--radius-full` ao `:root`. Atualizado `aviso-fcm` (OrganizadorView) e `aviso-pin` (LoginView) para usar `var(--warning-muted)`. Atualizado `.card` e `.toast-central` para usar `var(--radius-lg)`. Atualizado `.btn-ajuda` para usar `var(--radius-full)`.

---

