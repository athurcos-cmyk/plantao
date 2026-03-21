# Plantão — instruções do projeto

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
Sessão 20h no localStorage. syncCode é a chave raiz no Firebase.

## Firebase — estrutura completa
- `usuarios/{syncCode}/` — pin hash, nome, criadoEm
- `anotacoes/{syncCode}/{pushKey}/` — tipo, texto, nome, leito, timestamp
- `anotacoes_hc/{syncCode}/{pushKey}/` — anotações HC
- `pacientes/{syncCode}/{pushKey}/` — nome, leito, criadoEm, pendencias/
- `organizador/{syncCode}/` — template/, plantao/
- `encaminhamento/{syncCode}/` — encaminhamentos
- `livres/{syncCode}/` — anotações livres
- `curativo/{syncCode}/` — curativos
- `fcm_tokens/{syncCode}/` — token FCM do dispositivo
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
- Com app aberto: setInterval 20s + registration.showNotification()
- Com app fechado: cron-job.org → /api/cron → FCM → dispositivo
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
