---
name: Plantao - Visao geral do projeto (Codex)
description: Stack, estrutura de pastas, rotas, stores, composables e integracoes
type: project
updated: 2026-04-25
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
- `src/App.vue` tambem concentra o rodape fixo e o gatilho global da calculadora
- `src/router/index.js` - rotas e guards
- `src/firebase.js` - setup Firebase client
- `src/stores/` - `auth.js`, `anotacoes.js`, `pacientes.js`, `organizador.js`
- `src/composables/` - `useAnotacaoInicial.js`, `useCalculadora.js`, `useChat.js`, `useClara.js`, `useCopia.js`, `useDispositivos.js`, `useOnlineStatus.js`, `usePulso.js`, `usePushNotificacoes.js`, `useRascunho.js`, `useToast.js`
- `src/utils/` - `gerarTextoInicial.js`, `dispositivos.js`, `medicacao.js`, `syncEvents.js`
- `src/data/medicamentos.js` - catalogo base com vias comuns e presets enriquecidos para autocomplete/quick add da tela de medicacao
- `src/views/` - telas gerais, marketing, auth, admin e configuracoes
- `src/views/anotacoes/` - views especificas de anotacao
- `src/components/ResultadoAnotacao.vue` - componente compartilhado do estado final de texto pronto para modulos de anotacao
- `src/components/BotaoChat.vue` - botao flutuante da Clara, com ajuste de posicionamento no mobile por causa do rodape fixo
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
- `src/views/DashboardView.vue` passou a concentrar a nova home mobile: topo com ilustracao, sync card compacto, grid 4x no celular, feedback modal, rodape fixo tipo app e atalhos ilustrados
- `src/views/DashboardView.vue` manteve o atalho `Como acessar no computador` logo abaixo do sync; o icone desse atalho agora e SVG inline para evitar quebra de emoji
- `src/views/DashboardView.vue` tambem teve a grade `Anotacoes` simplificada no mobile, sem selos secundarios e com mais espaco para os titulos dos cards
- `src/views/DashboardView.vue` tambem guarda um aprendizado forte de produto: manter a primeira dobra leve, sem voltar a crescer o card de sincronizacao nem encher a home de microcopy
- `src/assets/dashboard-icons-png/` e agora a pasta fonte dos icones ilustrados usados no dashboard; manter assets leves e transparentes
- A direcao visual atual do projeto e usar a dashboard como referencia de linguagem premium para os outros modulos, desde que cada tela preserve leitura rapida, pouco atrito e foco operacional
- `src/views/HistoricoView.vue` agora usa esses PNGs tambem dentro das capsulas do tipo de anotacao
- `src/views/OrganizadorView.vue` foi elevado para o mesmo padrao premium de dashboard/pacientes
- `src/components/CalculadoraModal.vue` tambem entrou nessa mesma familia visual e continua sendo controlada globalmente por `src/composables/useCalculadora.js`
- `src/views/anotacoes/AnotacaoMedicacaoView.vue` hoje tem duas zonas visuais principais (`preparo` e `medicamentos do horario`), quick add por historico/preset, catalogo detalhado e fluxo `Salvar e adicionar proxima`; preservar essa hierarquia se evoluir a tela
- Aprendizado importante dessa view: evitar resumos grandes, estados obvios e microcopy em excesso; na medicacao, a melhor UX ate agora foi a mais enxuta e direta para chegar rapido em `Adicionar medicamento`
- Nos avisos de quick add/modelos, manter texto curto e operacional; a versao atual fala so de `prescricao` e `apresentacao`
- `src/utils/medicacao.js` preserva dados de lote dentro do template reaproveitavel da medicacao, mas continua deduplicando o historico pela chave clinica principal em vez de criar um item novo para cada lote
- `src/views/anotacoes/SinaisVitaisView.vue` usa teclado numerico/decimal nos campos de medida para mobile, mas `Localizacao da dor` deve permanecer como texto livre, nao como chips
- `src/views/anotacoes/IntercorrenciaView.vue` e a tela de `Notas Livres`; manter a biblioteca de modelos compacta, pesquisavel, com favoritos e rolagem interna
- Em `Notas Livres`, `Gerar anotacao` deve ficar antes dos modelos. Modelos sao aceleradores, nao o ultimo passo obrigatorio do fluxo
- Modelos de `Notas Livres` ficam em `livres/{syncCode}/modelos`; favoritos sao salvos no proprio modelo e tambem entram na fila offline de update
- `src/components/ResultadoAnotacao.vue` virou o padrao consolidado para o estado final dos modulos que geram texto pronto
- O padrao visual atual das views principais de anotacao e: `paciente registrado` no topo quando aplicavel, hero so no primeiro bloco, cards navy/azul e chips premium
- `src/views/anotacoes/PassagemPlantaoView.vue`, `src/views/anotacoes/EncaminhamentoView.vue`, `src/views/anotacoes/BanhoView.vue`, `src/views/anotacoes/CurativoView.vue` e `src/views/anotacoes/AnotacaoInicialView.vue` ja estao alinhadas nesse mesmo padrao
- `src/views/PacientesView.vue` tambem foi polida nesse ciclo e nao usa mais FAB local de adicionar paciente; a acao principal ficou integrada ao topo da tela para nao colidir com o rodape global
