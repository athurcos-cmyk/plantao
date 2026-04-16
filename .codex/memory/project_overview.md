---
name: Plantão - Visão geral do projeto (Codex)
description: Stack, estrutura de pastas, rotas, stores, composables e integrações
type: project
updated: 2026-04-16
---

## O que é

Plantão é um PWA de anotações de enfermagem para uso no celular durante o plantão.
O objetivo é gerar textos padronizados, rápidos de copiar e utilizáveis mesmo quando o sistema do hospital não ajuda.

## Stack

- Vue 3 com `<script setup>`
- Vite
- Pinia
- Firebase Auth
- Firebase Realtime Database
- `vite-plugin-pwa`
- CSS puro
- Vitest para testes pontuais
- Build com `manualChunks` para separar vendors críticos e reduzir o chunk inicial

## Estrutura principal

- `src/main.js` — bootstrap do app
- `src/App.vue` — shell principal
- `src/router/index.js` — rotas e guards
- `src/firebase.js` — setup Firebase client
- `src/stores/` — `auth.js`, `anotacoes.js`, `pacientes.js`, `organizador.js`
- `src/composables/` — `useAnotacaoInicial.js`, `useCalculadora.js`, `useChat.js`, `useClara.js`, `useCopia.js`, `useDispositivos.js`, `useOnlineStatus.js`, `usePulso.js`, `usePushNotificacoes.js`, `useRascunho.js`, `useToast.js`
- `src/utils/` — `gerarTextoInicial.js`, `dispositivos.js`, `syncEvents.js`
- `src/views/` — telas gerais, marketing, auth, admin e configurações
- `src/views/anotacoes/` — views específicas de anotação
- `api/` — funções serverless da Vercel
- `public/` — ícones, assets estáticos e service worker relacionado ao PWA

## Rotas principais

- `/` — login
- `/landing` — landing pública
- `/dashboard`
- `/historico`
- `/pacientes`
- `/organizador`
- `/configuracoes`
- `/admin`
- `/auth/action` — redefinição de senha
- `/anotar/inicial`
- `/anotar/sv`
- `/anotar/medicacao`
- `/anotar/encaminhamento`
- `/anotar/banho`
- `/anotar/curativo`
- `/anotar/passagem`
- `/anotar/livre`

## Autenticação e sessão

- Firebase Auth gerencia sessão principal
- Cadastro por email/senha e Google
- Login por código passa por `/api/login-by-code`
- `syncCode` é gerado para mapear o usuário no Realtime DB
- `uid_map/{uid}` resolve o `syncCode`
- `owners/{syncCode}/{uid}` sustenta o isolamento por regras
- `localStorage` é usado como cache auxiliar de `sync_code`, `user_name`, `user_email` e `auth_uid`
- `src/utils/authSessionCache.js` concentra a leitura e limpeza desse cache para permitir bootstrap rápido em rede fraca

## Banco de dados

Estruturas mais relevantes:

- `owners/{syncCode}/{uid}`
- `uid_map/{uid}`
- `usuarios/{syncCode}`
- `anotacoes/{syncCode}`
- `anotacoes_hc/{syncCode}`
- `pacientes/{syncCode}`
- `organizador/{syncCode}`
- `encaminhamento/{syncCode}`
- `livres/{syncCode}`
- `curativo/{syncCode}`
- `fcm_tokens/{syncCode}/{deviceId}`
- `notificacoes_agendadas/{syncCode}`
- `feedback/{syncCode}`
- `config/total_usuarios`

## Serverless em api/

- `admin.js`
- `broadcast.js`
- `chat.js`
- `cleanup-notificacoes.js`
- `cron.js`
- `delete-account.js`
- `feedback.js`
- `goodbye.js`
- `init-counter.js`
- `login-by-code.js`
- `welcome.js`

## Convenções importantes

- Forms com `reactive()`
- Estado simples com `ref()`
- Imports sempre com `.js`
- Horário formatado com `formatHora(h) = h.replace(':', 'h')`
- Texto gerado sem `Às` no começo
- Travessão `–` depois do horário
- Copiar com `navigator.clipboard.writeText()` e fallback de `document.execCommand('copy')`
- Chips no padrão `<button class="chip" :class="{'chip-on': cond}">`

## Observações de manutenção

- Se a tarefa envolver UI, ler `DESIGN.md`
- Se a tarefa envolver produto ou rollout, ler o design doc gstack mais recente
- Se a tarefa envolver auth, lembrar que parte da documentação antiga ainda cita fluxo legado e precisa ser checada contra o código real
- `src/App.vue` foi aliviado com async components para chat/calculadora e importa push sob demanda; evitar reverter isso sem necessidade
- `src/composables/usePushNotificacoes.js` carrega `firebase/messaging` dinamicamente; se mexer em push, preservar esse lazy-load
- `src/stores/auth.js` depende do cache local para liberar a UI cedo; se mexer no bootstrap, preservar a restauração rápida e o timeout de fallback
