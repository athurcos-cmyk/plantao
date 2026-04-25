# Plantão — instruções do projeto

## Início de sessão — leitura OBRIGATÓRIA (sem exceção)

**REGRA ABSOLUTA:** Antes de qualquer tarefa, ler TODOS estes arquivos na ordem abaixo.
Não iniciar nenhuma implementação sem ter lido todos. Contexto incompleto = trabalho errado.

1. **CHANGELOG.md** — estado atual do app, funcionalidades completas, histórico de sessões recentes
2. **TODOS.md** — pendências abertas e itens já concluídos
3. **MEMORY.md** (índice) — `C:\Users\Thurcos\.claude\projects\C--Users-Thurcos-Desktop-plantao\memory\MEMORY.md`
4. **project_status.md** — `C:\Users\Thurcos\.claude\projects\C--Users-Thurcos-Desktop-plantao\memory\project_status.md` — features prontas, alertas operacionais, pendentes técnicos, estratégia de negócio, conformidade legal
5. **project_overview.md** — `C:\Users\Thurcos\.claude\projects\C--Users-Thurcos-Desktop-plantao\memory\project_overview.md` — stack, estrutura de pastas, convenções de código
6. **Design doc gstack mais recente** — ler o arquivo `*-design-*.md` com timestamp mais novo em `C:\Users\Thurcos\.gstack\projects\athurcos-cmyk-plantao\`. Contém decisões de produto, premissas confirmadas, estratégia de monetização e arquitetura das features em desenvolvimento.

**Como ler o design doc mais recente:**
```
ls -t C:\Users\Thurcos\.gstack\projects\athurcos-cmyk-plantao\*-design-*.md | head -1
```
Ler esse arquivo completo antes de qualquer decisão de produto ou arquitetura.

**Ao fim de cada sessão:** atualizar CHANGELOG.md, TODOS.md e o MEMORY.md em `C:\Users\Thurcos\.claude\projects\C--Users-Thurcos-Desktop-plantao\memory\MEMORY.md` com o que foi feito.
Não fechar sessão sem atualizar a memória do projeto.

## Status atual - 2026-04-25
- O ciclo de fechamento visual dos cards principais de anotação está concluído nesta etapa
- O padrão visual consolidado do app agora é: `paciente registrado` no topo quando aplicável, hero apenas no primeiro bloco, cards navy/azul, chips premium e resultado final padronizado
- Módulos fechados nesta fase: `Sinais Vitais`, `Medicacao`, `Notas Livres`, `Passagem de Plantao`, `Encaminhamento`, `Higienizacao/Banho`, `Curativos` e `Anotacao Inicial`
- `Meus Pacientes` também foi polido no mesmo padrão e o FAB local foi removido para não competir com o rodapé global
- Para a próxima sessão, assumir esse fechamento como baseline e focar mais em backlog funcional, refinamentos clínicos e fluxos

## Design System
Sempre ler DESIGN.md antes de qualquer decisão visual ou de UI.
Todas as escolhas de fonte, cor, espaçamento e direção estética estão definidas lá.
Não desviar sem aprovação explícita do usuário.
Em modo QA, sinalizar qualquer código que não siga o DESIGN.md.

## Projeto
App PWA de anotações de enfermagem para uso no celular durante plantão hospitalar.
Gera textos formatados prontos para copiar no sistema do hospital.
Funciona offline, sincroniza via Firebase, instalável sem loja de apps.

## Stack
Vue 3 (script setup), Vite, Pinia, Firebase Auth + Firebase Realtime DB, vite-plugin-pwa, CSS puro.

## Regras de código — SEMPRE seguir
- `reactive()` para forms, `ref()` para estado simples
- Imports com extensão `.js` explícita
- Travessão `–` após horário (não hífen `-`)
- Sem "Às" no início do texto gerado
- `formatHora(h)` = `h.replace(':', 'h')` → "14h30"
- Copiar: `navigator.clipboard.writeText()` + fallback `document.execCommand('copy')`
- Chips: `<button class="chip" :class="{'chip-on': cond}">` com toggle

## Autenticação
Firebase Auth — email/senha + Google (signInWithPopup, fallback signInWithRedirect).
syncCode gerado automaticamente no cadastro (6 chars alfanuméricos, crypto.getRandomValues).
Mapeamento uid → syncCode via `uid_map/{uid}`. Isolamento por `owners/{code}/{uid}`.
Login rápido por código: `/api/login-by-code` (serverless) resolve email server-side → retorna customToken → signInWithCustomToken.
Sessão gerida pelo Firebase Auth (persistência nativa, sem localStorage manual).
Store: `src/stores/auth.js` — initAuthListener() chamado uma vez no App.vue.

## Firebase — estrutura completa
- `owners/{syncCode}/{uid}` — mapeamento de propriedade (regras de segurança)
- `uid_map/{uid}` — syncCode do usuário (restauração de sessão)
- `usuarios/{syncCode}/` — nome, email, criadoEm, email_boas_vindas_enviado, email_dia3_enviado
- `anotacoes/{syncCode}/{pushKey}/` — tipo, texto, nome, leito, timestamp
- `anotacoes_hc/{syncCode}/{pushKey}/` — anotações HC
- `pacientes/{syncCode}/{pushKey}/` — nome, leito, criadoEm, pendencias/
- `organizador/{syncCode}/` — template/, plantao/
- `encaminhamento/{syncCode}/` — encaminhamentos
- `livres/{syncCode}/` — anotações livres
- `curativo/{syncCode}/` — curativos
- `curativo/{syncCode}/locais/` — locais customizados do curativo
- `curativo/{syncCode}/materiais/` — materiais customizados do curativo
- `fcm_tokens/{syncCode}/{deviceId}/` — token FCM por dispositivo (multi-device)
- `notificacoes_agendadas/{syncCode}/agendadas/` — notificações pendentes

## Serverless (api/)
- `api/cron.js` — FCM via firebase-admin + Day 3 email via Resend. CRON_SECRET obrigatório (fail-closed). Chamado pelo cron-job.org (URL: https://plantao.net/api/cron) a cada minuto.
- `api/chat.js` — proxy para Groq API (Llama 3.3 70B). Protege GROQ_API_KEY. Verifica Firebase Auth idToken + owners. Rate limit 20 msg/min por uid.
- `api/login-by-code.js` — login seguro via syncCode+senha. Resolve email server-side, verifica credenciais via Firebase REST API, retorna customToken. Rate limit 10/min por IP.
- `api/welcome.js` — email de boas-vindas (Resend) + incremento do contador de usuários. Requer idToken. Deduplicação via flag `email_boas_vindas_enviado`. Rate limit 5/min por IP.
- `api/feedback.js` — email de agradecimento ao usuário + notificação interna para Arthur (Resend). Auth idToken obrigatório. Rate limit 5/min por uid.
- `api/goodbye.js` — email de despedida ao deletar conta (Resend). Auth idToken obrigatório. Busca nome/email server-side. Timeout 5s, falha silenciosa.
- `api/delete-account.js` — deleta todos os dados do usuário via firebase-admin (bypassa regras de segurança). Verifica idToken, busca syncCode via uid_map, remove 15 paths incluindo owners e uid_map. Chamado pela ConfiguracoesView antes de deleteUser().
- `api/broadcast.js` — envia push FCM e/ou email Resend para todos os usuários cadastrados. Restrito ao email admin (a.thurcos@gmail.com) via idToken. Tokens inválidos auto-removidos. Retorna `{push, email, erros}`.

## Variáveis de ambiente — NUNCA no .env, sempre no Vercel
- `VITE_FCM_VAPID_KEY` — chave pública VAPID (compilada no bundle)
- `FIREBASE_SERVICE_ACCOUNT` — JSON service account (server-side)
- `CRON_SECRET` — Bearer token /api/cron (valor APENAS no Vercel, NUNCA commitar aqui)
- `GROQ_API_KEY` — chave Groq para Clara
- `RESEND_API_KEY` — chave Resend para emails transacionais (welcome, feedback, day 3, goodbye)

## Padrão do texto gerado
```
14h00 – [texto da anotação], sem intercorrências.
```

## Notificações — arquitetura de 3 camadas
Sistema de notificações com 3 camadas de confiabilidade:

**Camada 1 — setTimeout preciso (app aberto)**
- `usePushNotificacoes.js` cria um `setTimeout` por notificação com timestamp exato
- Map `_timers` guarda tag → timeoutId para cancelamento individual
- Re-inicializa timers ao voltar à aba (`visibilitychange`) — browser pode matar timers em background tabs

**Camada 2 — FCM via cron (app fechado/minimizado)**
- cron-job.org → `/api/cron` a cada minuto → Firebase Admin → FCM → Service Worker
- Payload **data-only** (sem `webpush.notification`) — evita que Firebase SDK encaminhe push para aba congelada em vez de exibir
- Push handler raw no SW (`firebase-messaging-sw.js`) registrado ANTES do Firebase SDK — sempre chama `showNotification()` independente do estado da aba
- `push-handlers.js` extrai tag de: `data?.tag` → fallback `'plantao'`
- Tag única por notificação evita que browser substitua uma pela outra
- **ATENÇÃO cron-job.org:** o job pode ser auto-desabilitado após falhas HTTP consecutivas (toggle fica off no painel silenciosamente). Se FCM parar de funcionar com app fechado, verificar PRIMEIRO se o job está ativo em cron-job.org antes de debugar código.

**Camada 3 — setInterval 60s (safety net)**
- Roda a cada 60s verificando localStorage por notificações perdidas
- Re-cria timers que o browser tenha cancelado

**Token FCM**
- Refresh automático a cada 12h (tokens FCM expiram)
- Retry em 30s se registro falhar
- Re-registro ao voltar à aba se token não estiver ativo
- Multi-dispositivo: `plantao_device_id` no localStorage → `fcm_tokens/{syncCode}/{deviceId}`

**Regras**
- NUNCA usar `new Notification()` — Android ignora em background
- NUNCA cachear rotas Firebase no service worker
- SEMPRE usar `registration.showNotification()` via Service Worker
- Listener Firebase: chamar a função `unsubscribe()` retornada por `onValue()`, NUNCA `off(newRef)`

## Assistente Clara
- Groq Llama 3.3 70B via api/chat.js
- Persona restrita a enfermagem — recusa futebol, política, etc.
- Disclaimer obrigatório na UI: "Clara é uma IA — verifique as respostas"

## Skills disponíveis
@.claude/skills/planner.md
@.claude/skills/build-error-resolver.md
@.claude/skills/revisao-seguranca.md
@.claude/skills/refactor-cleaner.md
@.claude/skills/pwa-plantao.md
@.claude/skills/economia-tokens.md
@.claude/skills/criar-skill.md
@.claude/skills/modularizacao.md
@.claude/skills/frontend-vue.md
@.claude/skills/backend-firebase.md

## gstack
Skills de workflow instaladas globalmente. Use `/browse` para navegação web (nunca `mcp__claude-in-chrome__*`).

Skills disponíveis:
- `/office-hours` — brainstorming de ideias
- `/plan-ceo-review` — revisão estratégica
- `/plan-eng-review` — revisão de arquitetura
- `/plan-design-review` — revisão de design
- `/design-consultation` — criação de design system
- `/investigate` — debug de erros
- `/review` — code review antes de merge
- `/design-review` — auditoria visual
- `/ship` — preparar PR / deploy
- `/qa` — testes no browser (requer bun)
- `/qa-only` — só testes
- `/document-release` — docs pós-deploy
- `/retro` — retrospectiva semanal
- `/codex` — segunda opinião / review adversarial
- `/careful` — modo cuidadoso para produção
- `/freeze` — restringir edições a um módulo
- `/guard` — modo máxima segurança
- `/unfreeze` — remover restrições
- `/gstack-upgrade` — atualizar gstack
