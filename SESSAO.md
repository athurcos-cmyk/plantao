# Brief — Plantão

## Estado atual (2026-04-28)

App PWA de anotações de enfermagem, em produção em plantao.net. Design system com 12 temas via variáveis CSS. Landing page reformulada (hero "Menos tempo com papel. Mais tempo pro paciente.", mockup do dashboard real, CTA "Usar de graça", barra de acesso antecipado, depoimentos em destaque). Guia de implementação Stripe documentado em PAYMENT_GUIDE.md. Foco atual: refinamentos clínicos, validação com usuários.

## Última sessão (2026-04-28 noite)

Landing page refinada: hero-badge redundante removido, "redigitando"/"redigitação" substituídos (feedback do usuário), "no plano gratuito" → "disponíveis" no CTA (evita sugerir plano pago), stat "0" → "Zero", CSS morto de seções removidas (~200 linhas de `.install-section`, `.login-options` eliminadas). LandingView CSS reduziu de 19.41 kB → 13.67 kB no bundle. Hero agora usa mockup do dashboard real (hero-ui) no lugar do celular antigo. Estrutura validada contra `.gstack/landing-strategy.md`. Build validado.

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
