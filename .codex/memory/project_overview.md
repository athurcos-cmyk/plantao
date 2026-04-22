---
name: Plantao - Visao geral do projeto (Codex)
description: Stack, estrutura de pastas, rotas, stores, composables e integracoes
type: project
updated: 2026-04-21
---

## O que e

Plantao e um PWA de anotacoes de enfermagem para uso no celular durante o plantao.
O objetivo e gerar textos padronizados, rapidos de copiar e utilizaveis mesmo quando o sistema do hospital nao ajuda.

## Stack

- Vue 3 com `<script setup>`
- Vite
- Pinia
- Firebase Auth
- Firebase Realtime Database
- `vite-plugin-pwa`
- CSS puro
- Vitest para testes pontuais
- Build com `manualChunks` para separar vendors criticos e reduzir o chunk inicial

## Estrutura principal

- `src/main.js` - bootstrap do app
- `src/App.vue` - shell principal
- `src/router/index.js` - rotas e guards
- `src/firebase.js` - setup Firebase client
- `src/stores/` - `auth.js`, `anotacoes.js`, `pacientes.js`, `organizador.js`
- `src/composables/` - `useAnotacaoInicial.js`, `useCalculadora.js`, `useChat.js`, `useClara.js`, `useCopia.js`, `useDispositivos.js`, `useOnlineStatus.js`, `usePulso.js`, `usePushNotificacoes.js`, `useRascunho.js`, `useToast.js`
- `src/utils/` - `gerarTextoInicial.js`, `dispositivos.js`, `medicacao.js`, `syncEvents.js`
- `src/data/medicamentos.js` - catalogo base e presets enriquecidos para autocomplete/quick add da tela de medicacao
- `src/views/` - telas gerais, marketing, auth, admin e configuracoes
- `src/views/anotacoes/` - views especificas de anotacao
- `api/` - funcoes serverless da Vercel
- `public/` - icones, assets estaticos e service worker relacionado ao PWA

## Rotas principais

- `/` - login
- `/landing` - landing publica
- `/dashboard`
- `/historico`
- `/pacientes`
- `/organizador`
- `/configuracoes`
- `/admin`
- `/auth/action` - redefinicao de senha
- `/anotar/inicial`
- `/anotar/sv`
- `/anotar/medicacao`
- `/anotar/encaminhamento`
- `/anotar/banho`
- `/anotar/curativo`
- `/anotar/passagem`
- `/anotar/livre`

## Autenticacao e sessao

- Firebase Auth gerencia sessao principal
- Cadastro por email/senha e Google
- Login por codigo passa por `/api/login-by-code`
- `syncCode` e gerado para mapear o usuario no Realtime DB
- `uid_map/{uid}` resolve o `syncCode`
- `owners/{syncCode}/{uid}` sustenta o isolamento por regras
- `localStorage` e usado como cache auxiliar de `sync_code`, `user_name`, `user_email` e `auth_uid`
- `src/utils/authSessionCache.js` concentra a leitura e limpeza desse cache para permitir bootstrap rapido em rede fraca

## Banco de dados

Estruturas mais relevantes:

- `owners/{syncCode}/{uid}`
- `uid_map/{uid}`
- `usuarios/{syncCode}`
- `anotacoes/{syncCode}`
- `anotacoes_hc/{syncCode}`
- `med_historico/{syncCode}`
- `med_presets/{syncCode}`
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

## Convencoes importantes

- Forms com `reactive()`
- Estado simples com `ref()`
- Imports sempre com `.js`
- Horario formatado com `formatHora(h) = h.replace(':', 'h')`
- Texto gerado sem `As` no comeco
- Travessao `-` depois do horario no contexto desta documentacao; no app, manter o padrao clinico vigente
- Copiar com `navigator.clipboard.writeText()` e fallback de `document.execCommand('copy')`
- Chips no padrao `<button class="chip" :class="{'chip-on': cond}">`

## Observacoes de manutencao

- Se a tarefa envolver UI, ler `DESIGN.md`
- Se a tarefa envolver produto ou rollout, ler o design doc gstack mais recente
- Se a tarefa envolver auth, lembrar que parte da documentacao antiga ainda cita fluxo legado e precisa ser checada contra o codigo real
- `src/App.vue` foi aliviado com async components para chat/calculadora e importa push sob demanda; evitar reverter isso sem necessidade
- `src/App.vue` tambem concentra os banners de instalacao PWA; o formato atual foi compactado para card flutuante, entao qualquer ajuste futuro deve preservar esse comportamento menos invasivo
- `src/composables/usePushNotificacoes.js` carrega `firebase/messaging` dinamicamente; se mexer em push, preservar esse lazy-load
- `src/stores/auth.js` depende do cache local para liberar a UI cedo; se mexer no bootstrap, preservar a restauracao rapida e o timeout de fallback
- `src/views/anotacoes/AnotacaoMedicacaoView.vue` hoje tem duas zonas visuais principais (`preparo` e `medicamentos do horario`), quick add por historico/preset, catalogo detalhado e fluxo `Salvar e adicionar proxima`; preservar essa hierarquia se evoluir a tela
- Aprendizado importante dessa view: evitar resumos grandes, estados obvios e microcopy em excesso; na medicacao, a melhor UX ate agora foi a mais enxuta e direta para chegar rapido em `Adicionar medicamento`
- `src/utils/medicacao.js` preserva dados de lote dentro do template reaproveitavel da medicacao, mas continua deduplicando o historico pela chave clinica principal em vez de criar um item novo para cada lote
