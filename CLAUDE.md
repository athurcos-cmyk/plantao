# Plantão — instruções do projeto

## Início de sessão — leitura obrigatória
Antes de qualquer tarefa, ler:
1. **CHANGELOG.md** — estado atual do app, funcionalidades completas, histórico de sessões recentes
2. **TODOS.md** — pendências abertas e itens já concluídos
3. **Designs gstack** — ler o design doc mais recente em `C:\Users\Thurcos\.gstack\projects\athurcos-cmyk-plantao\` (arquivo `*-design-*.md` com timestamp mais novo). Contém decisões de produto, premissas confirmadas e arquitetura das features em desenvolvimento.

Esses arquivos são a memória do projeto. Sem lê-los, o contexto está incompleto.

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
Vue 3 (script setup), Vite, Pinia, Firebase Realtime DB, vite-plugin-pwa, CSS puro.

## Regras de código — SEMPRE seguir
- `reactive()` para forms, `ref()` para estado simples
- Imports com extensão `.js` explícita
- Travessão `–` após horário (não hífen `-`)
- Sem "Às" no início do texto gerado
- `formatHora(h)` = `h.replace(':', 'h')` → "14h30"
- Copiar: `navigator.clipboard.writeText()` + fallback `document.execCommand('copy')`
- Chips: `<button class="chip" :class="{'chip-on': cond}">` com toggle

## Autenticação
Sistema próprio com syncCode (mín. 6 chars) + PIN (6 dígitos, SHA-256). Sem Firebase Auth.
Sessão 30 dias no localStorage. syncCode é a chave raiz no Firebase.

## Firebase — estrutura completa
- `usuarios/{syncCode}/` — pin hash, nome, criadoEm
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
- `api/cron.js` — lê Firebase, envia FCM via firebase-admin. Chamado pelo cron-job.org a cada minuto.
- `api/chat.js` — proxy para Groq API (Llama 3.3 70B). Protege GROQ_API_KEY.

## Variáveis de ambiente — NUNCA no .env, sempre no Vercel
- `VITE_FCM_VAPID_KEY` — chave pública VAPID (compilada no bundle)
- `FIREBASE_SERVICE_ACCOUNT` — JSON service account (server-side)
- `CRON_SECRET` — Bearer token /api/cron (valor: plantao2026)
- `GROQ_API_KEY` — chave Groq para Clara

## Padrão do texto gerado
```
14h00 – [texto da anotação], sem intercorrências.
```

## Notificações FCM
- Multi-dispositivo: cada device tem `plantao_device_id` no localStorage → `fcm_tokens/{syncCode}/{deviceId}`
- Com app aberto: setInterval 20s + registration.showNotification()
- Com app fechado: cron-job.org → /api/cron → FCM → todos os dispositivos do usuário
- NUNCA usar new Notification() — Android ignora em background
- NUNCA cachear rotas Firebase no service worker

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
