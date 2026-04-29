# Brief — Plantão

## Estado atual (2026-04-29)

App PWA de anotações de enfermagem, em produção em plantao.net. Design system com 12 temas via variáveis CSS. Landing page reformulada com foco em problemas reais (PC ocupado, internet cai). Admin repaginada com tempo real, métricas enriquecidas e push individual. Guia de implementação Stripe documentado em PAYMENT_GUIDE.md. Auth auditada: 21 cenários verificados, 4 bugs corrigidos, store estável. Foco atual: refinamentos clínicos, validação com usuários.

## Última sessão (2026-04-29 — parte 3 / race condition auth)

- **Bug crítico descoberto:** Race condition entre `onAuthStateChanged` e `register()`. O listener disparava antes do RTDB ser escrito, via `uid_map` ausente, e deslogava o usuário no meio do registro. Causava "Erro ao autenticar" genérico + conta órfã no Auth.
- **Fix:** Flag `_registrando` no módulo, ativada durante register/loginGoogle/handleRedirectResult. `onAuthStateChanged` pula checagem de uid_map quando a flag está ativa.
- **Também:** `return` após restore de cache de sessão (evita uid_map lookup desnecessário), `'limite-atingido'` (sem prefixo) no `_traduzirErro`.
- **Parte 2 (hardening auth):** rollback no register(), detecção de uid_map ausente em login/loginComCustomToken, limpeza de sessão em initAuthListener.
- **TWA preparado:** manifest, assetlinks.json, APK gerado.
- **Admin:** proteção extra na view (3 camadas).

## Stack

Vue 3 (script setup), Vite, Pinia, Firebase Auth + Realtime DB, vite-plugin-pwa, CSS puro.

## Convenções essenciais

- `reactive()` p/ forms, `ref()` p/ estado simples
- Imports com `.js` explícito
- Travessão `–` após horário (não hífen)
- Sem "Às" no início do texto gerado
- `formatHora(h)` = `h.replace(':', 'h')` → "14h30"
- Copiar: `navigator.clipboard.writeText()` + fallback `execCommand`
- Chips: `<button class="chip" :class="{'chip-on': cond}">`
- **Ler só o necessário p/ tarefa** — não ler o projeto inteiro

## Firebase

- `owners/{syncCode}/{uid}` — ownership
- `uid_map/{uid}` — syncCode do usuário
- `usuarios/{syncCode}/` — perfil
- `anotacoes/{syncCode}/`, `pacientes/{syncCode}/`, `organizador/{syncCode}/`
- `curativo/{syncCode}/`, `livres/{syncCode}/`, `encaminhamento/{syncCode}/`
- `fcm_tokens/{syncCode}/{deviceId}/`, `notificacoes_agendadas/{syncCode}/`

## Serverless (api/)

- `cron.js` (FCM + email), `chat.js` (Clara/Groq), `login-by-code.js`
- `welcome.js`, `feedback.js`, `goodbye.js`, `delete-account.js`, `broadcast.js`, `admin.js`

## Leitura sob demanda

| Arquivo | Quando ler |
|---------|-----------|
| `CHANGELOG.md` | Se quiser detalhes das últimas sessões |
| `CHANGELOG_HISTORICO.md` | Sessões anteriores a 2026-04-23 |
| `TODOS.md` | Pendências abertas |
| `DESIGN.md` | Tarefas de UI/UX |
| Design doc gstack | Decisões de produto/arquitetura |
| Skills (.claude/skills/) | Conforme o assunto da tarefa |
