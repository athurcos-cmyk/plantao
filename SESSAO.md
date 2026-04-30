# Brief — Plantão

## Estado atual (2026-04-29)

App PWA de anotações de enfermagem, em produção em plantao.net. Auth completamente revisada e corrigida — 4 sessões de hardening (partes 2, 3, 4, 5). Bugs resolvidos: rollback ausente, race condition onAuthStateChanged vs register, uid setado antes do _registrando, _gerarSyncCodeUnico bloqueado por regra do Firebase, update multi-path com 3 caminhos negado, Configurações mostrava "Email e senha: Ativo" falso para Google-only. Registro email/senha e Google verificados e funcionando. Admin com 3 camadas de proteção. Próximo foco: validação com usuários reais e refinamentos clínicos.

## Última sessão (2026-04-30 — continuação parte 5 / revisão sync)

- **Revisão de risco de duplicação offline→online:** Código de pacientes.js com child listeners + tempKey cleanup foi revisado. `onChildAdded` dispara como microtask entre os `await push()`, e a limpeza de tempKeys roda depois do loop. Vue só renderiza após todos microtasks — usuário nunca vê estado duplicado. Confirmado seguro.
- **window.recalcularVagas mantido** no AdminView (útil se excluir contas pelo Firebase Console de novo).
- **Build passou.**

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
