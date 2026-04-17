# Changelog — Plantão

## O que é o app

**Plantão** é um PWA de anotações de enfermagem para uso no celular durante plantão hospitalar. Gera textos formatados prontos para copiar no sistema do hospital. Funciona offline, sincroniza via Firebase Realtime Database, e pode ser instalado como app no celular sem precisar de loja de aplicativos.

---

## Sessão 2026-04-15

### Organização de contexto para Codex

- Criada uma memória local do Codex em `.codex/memory/` com `MEMORY.md`, `project_status.md` e `project_overview.md`
- `CODEX.md` foi refeito para começar com a lista fixa dos arquivos de leitura e atualização da sessão
- A documentação do Codex agora aponta para o design doc mais recente do gstack e para o `DESIGN.md` quando a tarefa envolver UI
- O estado real do app foi revalidado antes de documentar: Firebase Auth segue ativo, login por código usa `/api/login-by-code` com `customToken`, e a pasta `api/` tem 11 endpoints
- Os arquivos do Claude foram preservados sem alteração; o fluxo do Codex passou a ter memória própria

### Observação

- Nenhuma funcionalidade do app foi alterada nesta sessão; foi uma organização de contexto e documentação operacional

### Otimizações implementadas depois

- Sync automático do app agora só mantém retry enquanto houver pendências reais; removido polling contínuo do root
- Painel de sincronização do dashboard passou a reagir a eventos de sync em vez de polling a cada 2,5s
- Clara agora envia menos contexto por mensagem e inclui só um resumo curto do histórico antigo
- Permissão de notificações deixou de ser pedida no login; agora é solicitada apenas quando o usuário realmente define horário em uma pendência
- Agendamento de notificações em pacientes passou a usar diff com debounce, com limpeza inicial única de tags órfãs
- Safety net local das notificações passou a ser agendado só quando existem lembretes pendentes
- Lógica de dispositivos foi deduplicada entre a anotação inicial e o composable compartilhado
- Histórico e Admin ganharam renderização incremental com “Mostrar mais” para reduzir custo de listas grandes
- Notas Livres deixaram o polling fixo de modelos e passaram a sincronizar fila só quando necessário
- Removido texto de debug dos modelos e centralizado o fallback de cópia em telas que ainda copiavam manualmente
- Build do Vite ganhou `manualChunks` para separar `vue-core`, `vue-router`, `pinia`, `firebase-core`, `firebase-auth`, `firebase-db`, `firebase-messaging` e `ui-effects`
- `App.vue` passou a carregar chat, calculadora e configuração de push sob demanda para aliviar o bootstrap
- `usePushNotificacoes.js` agora faz lazy-load de `firebase/messaging`
- Resultado confirmado em build local: chunk principal caiu de cerca de 571 kB para cerca de 39 kB, sem warnings de chunk grande

## Sessão 2026-04-16

### Bootstrap offline e rede fraca

- Corrigido travamento inicial em rede fraca que podia deixar o app preso na tela azul antes de renderizar a rota
- `auth.js` agora restaura sessão local em cache logo no startup com `syncCode`, `uid`, `email` e `userName`
- Inicialização do auth ganhou timeout de fallback para não bloquear a UI indefinidamente enquanto o Firebase responde
- Sessão local foi centralizada em `src/utils/authSessionCache.js`
- Adicionados testes para cache de sessão e limpeza do estado local

### Observação

- O app continua precisando ter sido carregado online pelo menos uma vez para funcionar totalmente offline, porque os assets do PWA precisam estar em cache

### Revisão de UI/UX mobile

- Dashboard foi reestruturado para dar foco ao começo do plantão: hero para `Anotação inicial`, header mais simples e ferramentas secundárias em uma faixa própria
- Card de sincronização ficou mais compacto, com resumo visível e detalhes expansíveis sob demanda
- `Anotação Inicial` e `Passagem de Plantão` rebaixaram visualmente o botão `Limpar`, reduzindo competição com a ação principal
- `Medicação` ganhou seções separadas para preparo/checagem e para os medicamentos do horário, com hierarquia mais clara
- Banners de instalação PWA do shell passaram a usar formato flutuante mais compacto em vez de ocupar toda a largura

## Sessão 2026-04-01

### Bugs corrigidos

**Dispositivos sumiam após "Nova anotação" (PassagemPlantao + AnotaçãoInicial):**
- `Object.assign(form, { dispositivos: [] })` substituía o array por um novo, quebrando a referência do composable `useDispositivos`
- Resultado: após gerar a primeira passagem, clicar pra adicionar dispositivo não aparecia nada
- Correção: `form.dispositivos.splice(0)` — limpa in-place sem quebrar a referência

**Exclusão de pacientes lenta:**
- `pacientes.js`: `excluir()` e `excluirPendencia()` esperavam resposta do Firebase antes de atualizar a UI
- Correção: exclusão otimista — remove da lista local primeiro, Firebase em background (mesmo padrão do `anotacoes.js`)

### Melhorias

**Botão "Ao lado" no dashboard (desktop only):**
- Botão `⊞ Ao lado` no header, visível só em tela ≥ 768px
- Abre o app numa janela de 420px posicionada no lado direito da tela
- Objetivo: facilitar uso lado a lado com o sistema hospitalar sem precisar saber dividir a tela manualmente

### Auditoria de segurança (sem código alterado)

Verificação completa: Firebase Rules, .env, endpoints — tudo protegido. Projeto NÃO tem os problemas virais do Twitter (Supabase sem RLS). Arquitetura Firebase é fechada por padrão. Detalhes:
- Firebase Rules: todas as coleções exigem `auth != null` + ownership
- `.env.local`: apenas `VITE_FCM_VAPID_KEY` (chave pública por design)
- Todos os 9 endpoints verificam `verifyIdToken` + rate limiting
- Única pendência: rotacionar CRON_SECRET

### Decisões de produto
- Aviso iOS PWA: removido do backlog (não implementar)
- Dia corrido no plantão: não há feature que resolva falta de tempo para anotar — o app já ajuda quando senta pra digitar

---

## Resumo Março 2026

### Semana 4 (27-28)
- Curativo: referência expandida (3 chips prescrição/orientação/ambos) + campo nome Enf.
- Banho: higiene multi-add com chip Outro + N itens customizados
- Passagem: 12 tipos de dispositivos via `useDispositivos.js` compartilhado + decúbito simplificado
- Fix CSS global: `.radio-btn` herdava estilos de `.campo label`
- Auditoria de segurança completa (Firebase Rules, endpoints, .env) — sem vulnerabilidades

### Semana 3 (23-26)
- **Lançamento público:** Instagram `@plantao.app` (3 posts + anúncio R$80/5d), WhatsApp, Facebook
- Admin dashboard: 4 tabs (Usuários, Feedbacks, Métricas, Monitor) + email individual + broadcast modal
- Correções legais: linguagem inclusiva, auxiliares de enfermagem, LGPD completa
- Endpoint `admin.js` consolidado (substituiu 3 endpoints separados — limite Vercel Hobby 12)
- Monetização definida: R$14,99/mês, sem anual (risco CDC), sem anúncios
- Limite de 100 vagas: contador `config/total_usuarios`, landing com urgência, lista de espera

### Semana 2 (21-23)
- **v1.0 oficial:** FCM nativo (migração OneSignal), exclusão de conta robusta, broadcast admin
- Blindagem notificações: 6 bugs corrigidos, arquitetura 3 camadas (setTimeout + FCM cron + safety net)
- Dashboard desktop responsivo (grid 4 colunas ≥768px)
- Calculadora de medicação: 4 abas (dosagem, gotejamento, diluição, conversões), 34 testes Vitest
- Anotação Inicial: modal ⚙️ para 9 campos configuráveis, opção "Outro", localização poltrona
- Emails transacionais (Resend): welcome, day3, feedback, goodbye — voz do fundador
- Segurança: CRON_SECRET fail-closed, rate limiting todos os endpoints, email mascarado

### Semana 1 (pré-21)
- Firebase Auth completo (email/senha + Google), syncCode, owners, regras de segurança
- Domínio plantao.net (Cloudflare + Vercel), email contato@plantao.net
- Landing page reescrita (dor → solução → CTA)
- DESIGN.md criado via `/design-consultation`
- CurativoView: avaliação COREN-SP 2022, locais/materiais no Firebase
- SinaisVitaisView: escala de dor 0-10 colorida + conduta
- Medicação: local anatômico (IM/SC/EV) + dupla checagem
- Remoção de campos obrigatórios (só nome do paciente é obrigatório)
- Clara (IA) restrita a enfermagem
- PWA: banner instalação + atualização + offline completo

---

## Estado atual — v1.0 (Abril 2026)

### Views de anotação (horário obrigatório em todas)
- **Anotação Inicial** — dispositivos (12 tipos), posição, neuro, resp, eliminações, campos configuráveis (modal ⚙️), "Outro" livre, poltrona
- **Sinais Vitais** — PA, FC, FR, SpO2, Tax, HGT, DOR 0-10 + conduta
- **Medicação** — múltiplos meds, autocomplete, dupla checagem, local anatômico
- **Encaminhamento** — IDA/RETORNO, destinos personalizados
- **Banho** — aspersão/leito/fralda, higiene multi-add (chip Outro com N itens)
- **Curativo** — avaliação COREN colapsável, locais/materiais Firebase, referência 3 opções + nome Enf.
- **Passagem de Plantão** — 12 dispositivos (useDispositivos.js), decúbito, débito urinário
- **Intercorrência / Livre** — notas livres com modelos salvos

### Infraestrutura
- Firebase Auth (email/senha + Google) + Realtime DB
- Notificações FCM 3 camadas: setTimeout + cron + safety net
- Admin dashboard: 4 tabs + broadcast + email individual
- PWA offline-first, instalável sem loja
- Calculadora de medicação (34 testes Vitest)
- Assistente Clara (Groq Llama 3.3 70B)
- Emails: welcome, day3, feedback, goodbye (Resend)
- Vercel Hobby + cron-job.org + Cloudflare

### Serverless (api/) — 11 endpoints
cron, broadcast, chat, login-by-code, welcome, feedback, goodbye, delete-account, init-counter, admin, cleanup-notificacoes

---

## Firebase — estrutura

```
owners/{syncCode}/{uid}              mapeamento uid → syncCode (segurança)
uid_map/{uid}                        syncCode do usuário
usuarios/{syncCode}/                 nome, email, criadoEm, emails enviados
anotacoes/{syncCode}/                anotações gerais
pacientes/{syncCode}/                pacientes e pendências
organizador/{syncCode}/              template, plantão
encaminhamento/{syncCode}/           encaminhamentos
livres/{syncCode}/                   anotações livres + modelos
curativo/{syncCode}/                 curativos + locais/ + materiais/
fcm_tokens/{syncCode}/{deviceId}/    token FCM por dispositivo
notificacoes_agendadas/{syncCode}/   notificações pendentes
feedback/{syncCode}/                 feedbacks
config/total_usuarios                contador público de vagas
```
