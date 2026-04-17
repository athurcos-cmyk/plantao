# Plantão — instruções do projeto (Codex)

## Arquivos fixos de contexto e mudança

Ler no início da sessão e atualizar no fim quando a tarefa mexer nesses assuntos:

1. `CHANGELOG.md`
2. `TODOS.md`
3. `.codex/memory/MEMORY.md`
4. `.codex/memory/project_status.md`
5. `.codex/memory/project_overview.md`
6. `DESIGN.md` quando a tarefa envolver UI, layout ou componentes visuais
7. Design doc gstack mais recente em `C:\Users\Thurcos\.gstack\projects\athurcos-cmyk-plantao\*-design-*.md`

Último design doc confirmado nesta base:
`C:\Users\Thurcos\.gstack\projects\athurcos-cmyk-plantao\Thurcos-main-design-20260326-gtm.md`

Arquivos originais do Claude, mantidos apenas como referência e sem edição por este fluxo:
- `C:\Users\Thurcos\.claude\projects\C--Users-Thurcos-Desktop-plantao\memory\MEMORY.md`
- `C:\Users\Thurcos\.claude\projects\C--Users-Thurcos-Desktop-plantao\memory\project_status.md`
- `C:\Users\Thurcos\.claude\projects\C--Users-Thurcos-Desktop-plantao\memory\project_overview.md`

## Início de sessão — leitura obrigatória

Antes de implementar qualquer coisa:

1. Ler `CHANGELOG.md` para entender o estado recente do app
2. Ler `TODOS.md` para ver pendências abertas e itens concluídos
3. Ler `.codex/memory/MEMORY.md`
4. Ler `.codex/memory/project_status.md`
5. Ler `.codex/memory/project_overview.md`
6. Se a tarefa envolver produto, estratégia, roadmap ou rollout, ler também o design doc gstack mais recente
7. Se a tarefa envolver UI, ler `DESIGN.md` antes de decidir qualquer direção visual

Comando útil para localizar o design doc mais recente:

```powershell
Get-ChildItem C:\Users\Thurcos\.gstack\projects\athurcos-cmyk-plantao\*-design-*.md |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1 -ExpandProperty FullName
```

## Fim de sessão — atualização obrigatória

Ao encerrar uma sessão relevante:

- Atualizar `CHANGELOG.md` com o que foi feito
- Atualizar `.codex/memory/MEMORY.md` com resumo curto da sessão
- Atualizar `.codex/memory/project_status.md` se mudou produto, risco, operação, roadmap ou negócio
- Atualizar `.codex/memory/project_overview.md` se mudou stack, estrutura, autenticação, rotas ou convenções
- Atualizar `TODOS.md` quando a sessão abrir ou fechar pendências reais

Não editar o `CLAUDE.md` nem a memória do Claude, a menos que o usuário peça explicitamente.

## Projeto

App PWA de anotações de enfermagem para uso no celular durante plantão hospitalar.
Gera textos formatados prontos para copiar no sistema do hospital.
Funciona offline, sincroniza via Firebase e pode ser instalado sem loja de apps.

## Stack

Vue 3 (`<script setup>`), Vite, Pinia, Firebase Auth, Firebase Realtime Database,
vite-plugin-pwa e CSS puro.

## Regras de código — SEMPRE seguir

- `reactive()` para forms, `ref()` para estado simples
- Imports com extensão `.js` explícita
- Travessão `–` após horário, nunca hífen `-`
- Nunca começar texto gerado com `Às`
- `formatHora(h)` = `h.replace(':', 'h')`
- Cópia: `navigator.clipboard.writeText()` com fallback `document.execCommand('copy')`
- Chips: `<button class="chip" :class="{'chip-on': cond}">`

## Autenticação

Estado atual do código:

- Auth principal via Firebase Auth
- Login por email/senha
- Login Google com `signInWithPopup()` e fallback `signInWithRedirect()`
- Login rápido por código via `/api/login-by-code`, que retorna `customToken`
- `syncCode` continua existindo como identificador do usuário no Realtime DB
- Sessão persistida pelo Firebase Auth, com `localStorage` como cache auxiliar de `sync_code`, `user_name`, `user_email` e `auth_uid`
- Bootstrap do app depende desse cache auxiliar para destravar a UI cedo em rede fraca enquanto o Firebase Auth ainda responde

## Firebase — estrutura principal

- `owners/{syncCode}/{uid}` — ownership para regras de segurança
- `uid_map/{uid}` — mapeamento uid → syncCode
- `usuarios/{syncCode}` — perfil, email, flags de email e metadados
- `anotacoes/{syncCode}/{pushKey}` — anotações gerais
- `anotacoes_hc/{syncCode}/{pushKey}` — anotações HC
- `pacientes/{syncCode}/{pushKey}` — pacientes e pendências
- `organizador/{syncCode}` — template e plantão
- `encaminhamento/{syncCode}` — encaminhamentos
- `livres/{syncCode}` — anotações livres e modelos
- `curativo/{syncCode}` — curativos, locais e materiais customizados
- `fcm_tokens/{syncCode}/{deviceId}` — tokens FCM por dispositivo
- `notificacoes_agendadas/{syncCode}` — notificações pendentes
- `feedback/{syncCode}` — feedbacks
- `config/total_usuarios` — contador público de vagas

## Serverless

- `api/cron.js` — FCM + email day 3
- `api/admin.js` — painel admin consolidado
- `api/broadcast.js` — broadcast push/email
- `api/chat.js` — proxy da Clara via Groq
- `api/login-by-code.js` — login rápido seguro com `customToken`
- `api/welcome.js`, `api/feedback.js`, `api/goodbye.js`
- `api/delete-account.js` — remoção completa dos dados do usuário
- `api/init-counter.js` — sincroniza contador de usuários
- `api/cleanup-notificacoes.js` — limpeza de notificações

## Alertas operacionais

- `cron-job.org` pode desabilitar o job após falhas HTTP consecutivas
- Push FCM precisa ser `data-only`
- Não usar `new Notification()` para lembrar agendamento em Android
- `useDispositivos.js` compartilha o mesmo array com views diferentes; limpar com `splice(0)`, nunca substituindo a referência
- Offline total ainda depende de os assets do PWA já terem sido cacheados em uma carga online anterior
- `CRON_SECRET` já apareceu em histórico público e precisa de rotação no ambiente, sem versionar valor em arquivo

### Notas de UI da sessão 2026-04-16

- `src/views/DashboardView.vue` foi reorganizado para foco mobile-first, com CTA principal para `Anotação inicial` e sincronização compacta
- `src/views/anotacoes/AnotacaoMedicacaoView.vue` hoje trabalha com duas zonas visuais principais (`preparo` e `medicamentos do horário`); evitar voltar para um formulário visualmente chapado
- `src/App.vue` usa banner PWA em formato de card flutuante menor; preservar essa abordagem menos invasiva se mexer no shell

## Padrão do texto gerado

```text
14h00 – [texto da anotação], sem intercorrências.
```

## Skills

Skills globais de workflow via gstack:

- `/office-hours`
- `/plan-ceo-review`
- `/plan-eng-review`
- `/plan-design-review`
- `/design-consultation`
- `/investigate`
- `/review`
- `/design-review`
- `/ship`
- `/qa`
- `/qa-only`
- `/document-release`
- `/retro`
- `/codex`
- `/careful`
- `/freeze`
- `/guard`
- `/unfreeze`
- `/gstack-upgrade`

Skills locais do projeto, reaproveitáveis pelo Codex a partir de `.claude/skills/`:

- `planner.md`
- `build-error-resolver.md`
- `revisao-seguranca.md`
- `refactor-cleaner.md`
- `pwa-plantao.md`
- `economia-tokens.md`
- `criar-skill.md`
- `modularizacao.md`
- `frontend-vue.md`
- `backend-firebase.md`
