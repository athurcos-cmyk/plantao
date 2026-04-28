# Plantão — visão geral para qualquer agente

App PWA de anotações de enfermagem para celular durante plantão hospitalar.
Gera textos formatados prontos para copiar no sistema do hospital.
Funciona offline, sincroniza via Firebase, instalável sem loja de apps.

## Fontes da verdade

**1. `SESSAO.md`** — brief do projeto (~30 linhas). Comece sempre aqui.

**2. Ler só o que for relevante para a tarefa:**
- `CHANGELOG.md` — contexto das últimas sessões
- `TODOS.md` — pendências abertas
- `C:\Users\Thurcos\.claude\projects\C--Users-Thurcos-Desktop-plantao\memory\MEMORY.md` — índice da memória
- `C:\Users\Thurcos\.claude\projects\C--Users-Thurcos-Desktop-plantao\memory\project_status.md` — features, alertas
- `C:\Users\Thurcos\.claude\projects\C--Users-Thurcos-Desktop-plantao\memory\project_overview.md` — estrutura, rotas
- `DESIGN.md` — se a tarefa envolver UI
- Design doc gstack mais recente — decisões de produto/arquitetura

Ao fim da sessão: atualizar CHANGELOG.md, TODOS.md e a memória do projeto.

**Regra:** não ler o projeto inteiro — só o necessário para a tarefa.

## Stack

Vue 3 (script setup), Vite, Pinia, Firebase Auth + Realtime DB, vite-plugin-pwa, CSS puro.

## Convenções de código

- `reactive()` para forms, `ref()` para estado simples
- Imports com extensão `.js` explícita
- Travessão `–` após horário (não hífen `-`)
- Sem "Às" no início do texto gerado
- `formatHora(h)` = `h.replace(':', 'h')` → "14h30"
- Copiar: `navigator.clipboard.writeText()` + fallback `document.execCommand('copy')`
- Chips: `<button class="chip" :class="{'chip-on': cond}">` com toggle

## Firebase — estrutura

- `owners/{syncCode}/{uid}` — ownership (regras de segurança)
- `uid_map/{uid}` — syncCode do usuário
- `usuarios/{syncCode}/` — perfil, email, flags
- `anotacoes/{syncCode}/` — anotações
- `pacientes/{syncCode}/` — pacientes + pendências
- `organizador/{syncCode}/` — template e plantão
- `encaminhamento/{syncCode}/` — encaminhamentos
- `livres/{syncCode}/` — notas livres + modelos
- `curativo/{syncCode}/` — curativos, locais, materiais
- `fcm_tokens/{syncCode}/{deviceId}/` — tokens push
- `notificacoes_agendadas/{syncCode}/` — notificações

## Serverless (api/)

- `cron.js` — FCM + email day 3
- `chat.js` — proxy Clara via Groq
- `login-by-code.js` — login rápido com customToken
- `welcome.js`, `feedback.js`, `goodbye.js` — emails transacionais
- `delete-account.js` — exclusão completa de dados
- `broadcast.js` — push/email em massa (admin)
- `admin.js` — dados do admin

## Clarity notes

- Este arquivo é um overview para qualquer IA (Claude, Codex, Gemini, etc.)
- Cada ferramenta tem seu próprio arquivo de instruções (CLAUDE.md, CODEX.md)
- A memória do projeto é compartilhada entre ferramentas no diretório do Claude
