# Brief — Plantão

## Estado atual (2026-04-30)

App PWA de anotações de enfermagem, em produção em plantao.net. Admin com aba Marketing com 100 prompts de imagem com toggle done/not done (localStorage). Broadcast usando Resend Batch API. Landing page sem discurso de escassez. CTAs de marketing apontam para plantao.net/landing. Próximo foco: gerar imagens no ChatGPT e publicar.

## Última sessão (2026-04-30 — landing sem escassez + CTAs /landing)

- **LandingView:** barra de vagas restantes removida, CTA final e FAQ sem escassez ("100 vagas", "lista de espera"). Importações não usadas (firebase, vue) removidas.
- **MARKETING.md:** todos os 100 prompts e legendas com `plantao.net` substituído por `plantao.net/landing`
- **Build validado** e commit/push feitos

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

- `owners/{syncCode}/{uid}` — ownership, regra de leitura: `data.child(auth.uid).exists()`
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
| `database.rules.json` | Regras de segurança do Firebase RTDB |
