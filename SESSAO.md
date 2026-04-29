# Brief — Plantão

## Estado atual (2026-04-29)

App PWA de anotações de enfermagem, em produção em plantao.net. Design system com 12 temas via variáveis CSS. Landing page reformulada com foco em problemas reais (PC ocupado, internet cai). Admin repaginada com tempo real, métricas enriquecidas e push individual. Guia de implementação Stripe documentado em PAYMENT_GUIDE.md. Auth auditada: 21 cenários verificados, 4 bugs corrigidos, store estável. Foco atual: refinamentos clínicos, validação com usuários.

## Última sessão (2026-04-29 — parte 2 / hardening auth)

- **Bug em produção:** `register()` criava Auth user antes de escrever no RTDB. Se RTDB falhasse, conta órfã (usuário existe no Auth, sem dados). Fix: rollback com `usr.delete()` no catch do `update()`.
- **Login() e loginComCustomToken()** não verificavam se `uid_map` existia — autenticavam no Firebase mas app ficava inconsistente. Fix: detecta uid_map ausente, deleta Auth user, mostra erro.
- **initAuthListener()** mantinha estado meio-logado se uid_map não existir. Fix: limpa sessão.
- **TWA preparado:** manifest com scope, lang pt-BR, id, categories, icons maskable, assetlinks.json no .well-known.
- **AdminView:** proteção extra na view (3 camadas: rota, view, API).
- **APK gerado pelo PWABuilder** — instalável no celular hoje, pronto pra Play Store quando quiser.

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
