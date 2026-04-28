# Brief — Plantão

## Estado atual (2026-04-28)

App PWA de anotações de enfermagem, em produção em plantao.net. Design system com 12 temas (6 dark + 6 light) via variáveis CSS — cores nunca hardcoded. Padrão visual do "paciente registrado" unificado nas 8 views de anotação. Sync de pacientes migrado para `onValue` único (fim de pacientes fantasmas). Header do app adaptado a temas em BanhoView e CurativoView. Foco atual: backlog funcional, refinamentos clínicos.

## Última sessão (2026-04-28)

Padronização visual do "paciente registrado" nas 8 views de anotação (card, chips, gap). Correção de header theming em BanhoView e CurativoView (hardcoded → variáveis de tema). Migração pacientes store de 3 listeners onChild\* para onValue único — fim de pacientes fantasmas. Fix login flash (rota `/` redireciona para dashboard). Font-size de chips de paciente padronizado em 0.9rem. Novo modal de exclusão de conta com SVG. Dashboard: botão de pendências no cabeçalho + modal com lista completa (novo composable `usePendenciasDashboard.js`). TourDashboard e helpItens atualizados (pendências, login-by-code, localização da ajuda).

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
