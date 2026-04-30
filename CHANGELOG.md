# Changelog - Plantao

## O que e o app

**Plantao** e um PWA de anotacoes de enfermagem para uso no celular durante plantao hospitalar. Gera textos formatados prontos para copiar no sistema do hospital. Funciona offline, sincroniza via Firebase Realtime Database e pode ser instalado como app no celular.

> Sessoes anteriores a 2026-04-23 foram movidas para `CHANGELOG_HISTORICO.md`.

---

## Sessão 2026-04-30 (parte 8 — landing sem escassez + CTAs /landing + LGPD)

### Landing — discurso de escassez removido
- Barra "Acesso antecipado" com contagem de vagas removida
- CTA final e FAQ atualizados (sem "100 vagas" ou "lista de espera")
- Firebase query de total_usuarios removida (não precisa mais consultar)

### Marketing — CTAs apontam para /landing
- Todos os 100 prompts e legendas: `plantao.net` → `plantao.net/landing`
- Step de instalação na landing ajustado: "Acessa o site" em vez de "Acessa plantao.net"
- Landing page enxuta: sem imports de Firebase e Vue API desnecessários

### Termos de Serviço — adequação LGPD
- §3: removido limite de "100 vagas gratuitas no lançamento"
- §6: plano pago atualizado (remove "período de lançamento")
- §11: adicionado foro e legislação aplicável (leis brasileiras)

### Política de Privacidade — adequação LGPD
- §1: Arthur explicitado como controlador dos dados
- §2: base legal adicionada (consentimento — art. 7º, I da LGPD)
- §4: garantias de transferência internacional (SCCs do Google)
- §6: período de retenção adicionado (enquanto a conta estiver ativa)
- §9: contato do encarregado/DPO adicionado

### Build
- Build validado (vite build ok)

### Landing — discurso de escassez removido
- Barra "Acesso antecipado" com contagem de vagas removida
- CTA final e FAQ atualizados (sem "100 vagas" ou "lista de espera")
- Firebase query de total_usuarios removida (não precisa mais consultar)

### Marketing — CTAs apontam para /landing
- Todos os 100 prompts e legendas: `plantao.net` → `plantao.net/landing`
- Step de instalação na landing ajustado: "Acessa o site" em vez de "Acessa plantao.net"
- Landing page enxuta: sem imports de Firebase e Vue API desnecessários

### Build
- Build validado (vite build ok, 92 precaches, 1712 KiB)

---

## Sessao 2026-04-30 (parte 7 — +50 prompts + broadcast batch + permissoes)

### Admin — 50 novos prompts (total 100)

- **9 novas categorias** adicionadas ao `marketingPrompts`: Especialidades (51-57), Dicas e Funcionalidades (58-64), Comunidade (65-70), Produtividade (71-77), Carrossel (78-82), Stories (83-87), Conversao e CTA (88-94), Fechamento (95-100)
- **50 prompts criados** seguindo as regras do MARKETING.md: foto realista de campanha, paleta azul escura, logo com tamanho exato (60px/40px 1:1, 50px/35px stories), sem emoji na imagem, sem mostrar app funcionando
- **Todas as categorias cobertas**: especialidades (UTI, pediatria, CC, PS, PSF, home care, enfermaria), dicas educativas, comunidade/prova social, produtividade avancada, carrossel tematico, stories diretos, CTAs de conversao
- Build validado (vite build ok)

### Broadcast — Resend Batch API

- `api/broadcast.js` substitui envio sequencial de emails por `POST /emails/batch` da Resend (1 request para todos)
- Fallback sequencial com 500ms se rate limit (429)
- Tokens FCM invalidos continuam sendo removidos automaticamente

### Logo sizing — consistencia

- Todos os 50 prompts existentes atualizados com tamanho exato do logo: 60px/40px (1:1), 50px/35px (stories)
- removido `.claude/settings.local.json` do tracking git + adicionado ao `.gitignore`
- Permissoes migradas para `defaultMode: bypassPermissions`

---

## Sessao 2026-04-30 (parte 6 — admin marketing busca/filtro)

### Admin — busca e filtros na aba Marketing

- **Campo de busca** — filtra por titulo, prompt e legenda em tempo real
- **Filtros por canal com contagem** — chips para cada canal (feed, facebook, whatsapp, story, carrossel) mostrando quantos prompts usam aquele canal
- **Result count** — "X de Y prompts" com link "limpar filtros" quando filtrando, ou "50 prompts · 5 canais" sem filtro
- **Estado vazio** — "Nenhum prompt encontrado." quando busca/filtro nao encontra nada
- **Visual** — cards sem margens laterais fixas, alinhados ao fluxo do admin-body
- Build validado

---

## Sessao 2026-04-30 (parte 5 — marketing)

### MARKETING.md: 50 prompts de imagem para divulgacao

**MARKETING.md expandido** de 15 para 50 prompts completos, organizados em 7 categorias com identificacao visual consistente (identidade do perfil).

**Categorias:**
- **DOR DIRETA (1-12):** PC ocupado, internet caiu, pendencia esquecida, papel molhou, letra ilegivel, passagem de plantao, evolucao sumiu, rasura, sistema lento, bolso do jaleco, papel perdido, caneta acabou
- **BENEFICIO DIRETO (13-24):** Anota no celular cola no sistema, 3 coisas, plantao no controle, texto pronto, modelos, sinais vitais, pendencias, notificacao, offline, copia e cola, WhatsApp app gratuito e equipe
- **VIBE/EMOCIONAL (25-33):** Voce cuida o Plantao anota, enfermagem nao e burocracia, maos que cuidam, cuidar de quem cuida, tecnologia + cuidado, foco, plantao mais leve, organizacao e cuidado, bolso descanso
- **PROVA SOCIAL (34-38):** +100 enfermeiros, enfermeira recomenda, ja pensou em testar, papel ficando de lado, todo mundo merece
- **HUMOR/ENGAJAMENTO (39-43):** PC ocupado humor, quem nunca perdeu, terceiro turno, multitarefa, salva post
- **CARROSSEL (44-47):** 3 passos, 5 motivos, papel vs app, tour rapido
- **STORIES (48-50):** Direto ao ponto, marca alguem, testei e aprovei

### AdminView — aba Marketing

- Nova tab "Marketing" no painel Admin com cards expansiveis para cada prompt
- Canais com chips coloridos: feed (azul), facebook (#1877F2), whatsapp (#25D366), story (#833AB4), carrossel (#E1306C)
- Botoes "Copiar prompt" e "Copiar legenda" com clipboard API + fallback
- Toggle done/not done por prompt via localStorage (`mkt_prontos`) — independe de Firebase
- CSS adicionado: `.mkt-card`, `.mkt-aberto`, `.mkt-topo`, `.mkt-chips`, `.mkt-chip`, `.mkt-feed/facebook/whatsapp/story/carrossel`, `.mkt-corpo`, `.mkt-texto`, `.mkt-copiar`, `.mkt-done`

### Outros
- `window.recalcularVagas` restaurado no Admin (helper para recalcular contador)
- Build validado

---

## Sessao 2026-04-30 (continuacao parte 5)

### Revisao de seguranca: duplicacao offline→online em pacientes.js

**Contexto:** Após migrar `onValue` → `onChildAdded/Changed/Removed` em pacientes.js para reduzir downloads do Firebase, o usuario questionou se isso poderia reintroduzir o bug antigo de paciente duplicado ao criar offline e voltar online.

**Analise do `sincronizarPendentes()`:**
1. Paciente criado offline → `_pacMap` guarda com `tempKey`
2. Ao voltar online, `push()` no Firebase → `onChildAdded` dispara (microtask) e adiciona com `realKey`
3. `_pacMap` fica momentaneamente com ambas as entries
4. Fim do loop: `_pacMap.delete(tempKey)` remove a temporaria
5. `_reconstruir(code)` gera array final sem duplicata

**Por que é seguro:** `onChildAdded` dispara como microtask entre os `await push()`. A limpeza de tempKeys roda depois de todas as iteracoes. Vue renderiza apenas o estado final (apos todos microtasks) — o usuario nunca ve o estado duplicado intermediario.

### Outros
- `window.recalcularVagas` mantido no AdminView com comentario atualizado (helper para recalcular contador apos exclusao pelo Firebase Console)
- Build validado

## Sessao 2026-04-29 (parte 5)

### Configurações: métodos de login falsos positivos

**Problema:** Usuário com conta Google-only via "Email e senha: Ativo" nas Configurações — mesmo sem ter senha. `providerData` vazio após `user.reload()` (comportamento do Firebase para contas Google) fazia `ids.length === 0` resultar em `temSenha = true`.

**Fixes em `src/views/ConfiguracoesView.vue`:**
- `temSenha.value` agora só considera `ids.includes('password')` — Google limpando `providerData` não gera mais falso positivo
- Email/senha só aparece na lista de métodos com `v-if="temSenha"` (Google-only não mostra mais "Ativo" indevidamente)
- Mensagem de sucesso ao criar senha: *"Senha criada! Agora você pode entrar com email ou código + senha."*

**Fix em `src/stores/auth.js`:**
- Ao registrar email já existente, detecta o método com `fetchSignInMethodsForEmail` e mostra mensagem específica:
  - Se for Google: *"Este email já está cadastrado com Google. Faça login com Google e vá em Configurações para criar uma senha."*
  - Se for senha: *"Este email já está cadastrado. Faça login com sua senha."*

**Verificado:** Firebase console confirma que contas Google-only aparecem sem `password` em `providerData`.

### Nota sobre colisão de email entre contas
Firebase Auth permite o mesmo email como provider Google na conta A e como email+senha na conta B. É comportamento padrão. Risco de colisão real: desprezível com < 100 usuários. Não foi implementada proteção para evitar falso positivo.

---

## Sessao 2026-04-29 (parte 4)

### Auth: registro quebrado por regra de segurança do Firebase (Permission denied)

**Problema:** Após o fix da race condition (parte 3), o registro começou a mostrar
`[Auth] register error: Permission denied Permission denied` no console. A conta
era criada no Firebase Auth e imediatamente deletada pelo rollback, resultando em
"Erro ao autenticar. Tente novamente." para o usuário.

**Causa raiz:** `_gerarSyncCodeUnico()` tentava ler `owners/${code}` para verificar
se o syncCode já estava em uso. A regra de segurança do Firebase
(`owners/$code/.read: data.child(auth.uid).exists()`) NEGA essa leitura porque o
uid do novo usuário ainda não existe sob nenhum código. Antes da parte 3, essa
função nunca era alcançada — o `onAuthStateChanged` (race condition) deslogava o
usuário antes.

**Correção em `src/stores/auth.js`:**
- `_gerarSyncCodeUnico()` simplificado para gerar código aleatório sem ler o
  banco — colisão é estatisticamente impossível (30^6 ≈ 729M combinações, < 100
  usuários)
- Adicionado check `_registrando` no handler `null` do `onAuthStateChanged` para
  evitar redirect durante registro (defense-in-depth)
- Novos códigos em `_traduzirErro`: `auth/operation-not-allowed`,
  `auth/unauthorized-domain`, `auth/quota-exceeded`, `auth/user-disabled`,
  `auth/credential-already-in-use`

### Auth: update multi-path com 3 caminhos negado pela regra do Firebase

**Problema:** Mesmo com `_gerarSyncCodeUnico` corrigido, o `update()` atômico que
escrevia `owners/$code/$uid`, `uid_map/$uid` e `usuarios/$code` em uma chamada
continuava falhando com `PERMISSION_DENIED`.

**Causa raiz:** A regra `usuarios/$code/.write` checa
`root.child('owners').child($code).child(auth.uid).val() === true`. Mas o Firebase
avalia cada caminho de um `update()` multi-path contra o estado **ATUAL** do banco,
não o final simulado. Quando `usuarios/$code` era verificado, o
`owners/$code/$uid` ainda não existia (estava sendo escrito no mesmo update).

**Correção em `register()` e `_vincularGoogleSeNovo()`:**
- Escrita em 2 passos: (1) `owners/$code/$uid` + `uid_map/$uid`, (2) `usuarios/$code`
- Rollback do passo 1 se o passo 2 falhar (remove owners + uid_map)
- Remove try/catch morto ao redor de `_gerarSyncCodeUnico` (não lança mais)

### Sobre o admin (a pedido do usuário): as 3 camadas de proteção estão intactas
1. Router guard (`beforeEach`): verifica `userEmail !== 'a.thurcos@gmail.com'`
2. Componente (`onMounted`): dupla verificação + redirect
3. API server-side (`api/admin.js`): verifica idToken + email do admin

O "Permission denied" do console NÃO é do admin — é exclusivamente do registro.

**Verificado após deploy:** registro email/senha funcionando, Google login no PC e celular funcionando. Conta criada com syncCode, redirecionamento ao dashboard, sessão persiste após refresh.

## Sessao 2026-04-29 (parte 3)

### Auth: race condition no onAuthStateChanged durante registro

**Problema:** Usuário via "Erro ao autenticar. Tente novamente." ao criar conta, mas o usuário era criado no Firebase Auth (conta órfã). O erro acontecia porque `onAuthStateChanged` disparava imediatamente após `createUserWithEmailAndPassword` e, ao não encontrar `uid_map` no RTDB (ainda não escrito), tratava como conta órfã e chamava `signOut()`.

**Causa raiz:** Race condition no `initAuthListener()`. O listener do Firebase Auth rodava antes do `register()` terminar de escrever no RTDB, deslogando o usuário no meio do registro.

**Correção em `src/stores/auth.js`:**
- Flag `_registrando` no escopo do módulo, ativada durante `register()`, `loginGoogle()` e `handleRedirectResult()`
- `onAuthStateChanged()` verifica a flag e pula a checagem de `uid_map` quando verdadeira
- `finally` blocks garantem limpeza da flag em todos os caminhos (sucesso, erro, exceção)
- `return` adicionado após restore de cache de sessão (evita uid_map lookup desnecessário)
- `'limite-atingido'` (sem prefixo `auth/`) adicionado ao `_traduzirErro` como fallback

### Auth: detecção de conta órfã + rollback automático (parte 2)

**Problema:** Usuário tentou criar conta durante deploy do Vercel. `createUserWithEmailAndPassword` criou o usuário no Firebase Auth, mas a escrita no RTDB falhou (instabilidade de rede). Resultado: **conta órfã** — existe no Auth, mas sem syncCode/dados.

**Causa raiz:** `register()` criava o Auth user antes de escrever no RTDB. Se o RTDB falhasse, não havia rollback. `login()` também não verificava se `uid_map` existia.

**Correções em `src/stores/auth.js` (parte 2):**
1. **`register()`** — `try/catch` no `update()` do RTDB com `usr.delete()` no catch (rollback)
2. **`login()`** — verifica `uid_map.exists()` após autenticar; se não existir, deleta o Auth user e mostra erro
3. **`loginComCustomToken()`** — mesma verificação do `login()`
4. **`initAuthListener()`** — se `uid_map` não existe para usuário autenticado, limpa sessão

### TWA / Play Store

- `scope: '/'` adicionado ao manifest (requisito TWA)
- `lang: pt-BR`, `id`, `categories` no manifest
- Ícones maskable adicionados
- `assetlinks.json` criado em `.well-known/` com fingerprint do PWABuilder
- `signing/` no `.gitignore`
- Roteiro Play Store documentado no TODOS.md

### Admin: segurança

- `AdminView.vue` redireciona se `userEmail !== 'a.thurcos@gmail.com'` (3 camadas: rota, view, API)

---

## Sessao 2026-04-29

### Fix crítico: PWA não atualizava em dispositivos com versão antiga

**Problema:** Usuários com versão antiga do app instalada (ex: tablet da namorada do Arthur, preso desde 26/04 quando os temas foram lançados) ficavam travados na versão antiga mesmo recarregando a página. O service worker nunca detectava atualizações.

**Causa raiz:** Vercel CDN cacheava `sw.js` (o service worker). O navegador comparava bytes do SW e sempre recebia o mesmo arquivo do CDN → achava que estava atualizado → nunca baixava o novo SW. Círculo vicioso: browser não atualiza porque o SW não muda, e o SW "não muda" porque o CDN cacheia.

**Solução:**

1. **`vercel.json`** — Regras de `Cache-Control: no-cache, no-store, must-revalidate` + `Surrogate-Control: no-store` para `sw.js`, `workbox-*.js` e `firebase-messaging-sw.js`. Impede CDN de cachear os arquivos de service worker.

2. **`App.vue`** — Adicionado `window.addEventListener('focus', () => registration.update())` no `onRegisteredSW`. O evento `focus` é mais confiável que `visibilitychange` em PWAs standalone (especialmente em alguns dispositivos), garantindo que o app cheque por atualizações sempre que o usuário retornar ao app.

**Como a correção chega em usuários já travados:**
- Com o `vercel.json` corrigido, o CDN não cacheia mais `sw.js`
- Quando o usuário abre o app (navegação), o browser compara o SW atual com o novo
- A versão antiga usava `registerType: 'autoUpdate'` com `skipWaiting: true` — o novo SW ativa automaticamente sem precisar de interação
- Na primeira navegação após o deploy, o browser detecta o novo SW e atualiza

**Validacao**
- `npm run build` passou

### Métodos de login unificado nas Configurações

- **Antes:** duas seções separadas ("Criar senha" e "Vincular Google") que apareciam conforme o método de login — confuso pra entender por que cada uma aparecia
- **Agora:** seção única "Métodos de login" que lista os métodos ativos (email+senha e/ou Google) com status "Ativo" e botões pra adicionar o que falta
- Criar senha fica num expand inline (só aparece os campos ao clicar em "+ Criar senha")
- Google extraído corretamente do `providerData` com email mostrado
- `user.reload()` + fallback seguro pra `providerData` vazio (assume que tem senha)
- Código do auth.js: tratado `auth/account-exists-with-different-credential` com mensagem clara, não genérica

### Validacao

- `npm run build` passou
- Commits: `0a8afc8`, `bff9280`

### Auditoria de autenticação + correção de bugs (parte 6)

**Auditoria:** 21 cenários de autenticação analisados (10 do TODOS.md + 11 edge cases):
- Registro email+senha, login, Google (popup e redirect), recuperação de senha, logout
- Multi-abas com contas diferentes, exclusão de conta + recadastro
- Provedores mistos (email A + Google B na mesma conta), offline, providerData vazio

**Bugs corrigidos em `src/stores/auth.js`:**

1. **`handleRedirectResult` não atualizava a store** — usuário novo via Google redirect (fallback quando popup é bloqueado) passava pela autenticação Firebase mas o Pinia store não recebia uid, syncCode, userName. Resultado: usuário voltava para a tela de login após autorizar. Fix: atualização do store + `_persistirSessaoSegura()` após `_vincularGoogleSeNovo()`.

2. **`_gerarSyncCodeUnico` sem verificação de unicidade** — função prometia syncCode único no nome mas nunca consultava o RTDB. Colisão improvável (6 chars, ~34⁶ combinações) mas possível. Fix: `for (let i = 0; i < 10; i++)` com `get(dbRef(db, 'owners/${code}'))` — se existir, tenta outro código.

3. **`register()` com `Promise.all` e `set()` individuais** — três `set()` paralelos: se um falhasse (ex: `uid_map`), `owners` e `usuarios` já estariam escritos — dados órfãos sem dono. Fix: `update()` atômico com todas as chaves num único objeto.

4. **`_vincularGoogleSeNovo()` com `Promise.all` e `set()` individuais** — mesmo problema do register. Fix: `update()` atômico.

**Bug introduzido durante correção e corrigido:** Ao substituir o bloco `register()` via `sed`, as linhas de `createUserWithEmailAndPassword` foram acidentalmente deletadas. O build passou porque Vite (bundler) não valida variáveis em template strings no estágio de análise. Fix: linhas restauradas com variável `usr` para evitar shadowing do parâmetro `user` do `onAuthStateChanged`.

**Verificação:** Line-by-line de auth.js completo + grep por `user.` em escopos incorretos — todos OK.

### Landing page reescrita com foco em problemas reais

**Problema:** Landing não comunicava os problemas concretos que o app resolve — usuário leigo não entendia por que precisava do app.

**Mudanças no hero (`LandingView.vue`):**
- Título: "Os computadores tão ocupados? Caiu a internet? Seu plantão não para."
- Subtítulo: cenários reais (esperar PC liberar, internet cair, pendência da manhã até a noite)
- Trust items: "Anoto no celular, colo no sistema" / "Funciona sem internet" / "Nunca mais esqueço pendência"

**Feature cards (6 cards):**
- "PC ocupado? Vai no celular" — esperar computador liberar
- "Internet caiu? Continua trabalhando" — subsolo/área rural/avião
- "Sinais vitais em segundos" — anotação rápida no leito
- "Nada esquecido até o fim do plantão" — pendências + notificações
- "Chega de papel solto" — papel perdido/molhado/rasgado
- "Copia e cola — sem redigitar" — texto formatado pronto

**Acentos corrigidos:** Os acentos portugueses deletados pelo `sed` (não, você, área, avião, pressão, etc.) foram restaurados via Edit tool.

### Validacao

- `npm run build` passou
- Landing page lida e conferida visualmente

---

## Sessao 2026-04-28 (parte 5)

### Hardcoded color fix no header do Notas Livres

- **`IntercorrenciaView.vue`**: `.livre-header` com `rgba(8, 18, 36, 0.82)` e `rgba(60, 86, 131, 0.34)` substituídos por `color-mix(in srgb, var(--bg-card) 85%, transparent)` e `color-mix(in srgb, var(--border) 60%, transparent)` — header agora respeita todos os temas claro/escuro

### TODOS.md — limpeza de pendências

- **Resend em produção**: verificado que `RESEND_API_KEY` já está configurada no Vercel (endpoint retorna 401 = passou na checagem da chave)
- **Métricas de anotações**: `total_anotacoes` já é incrementado por usuário + somado no backend; `ativos7d` calculado de `ultimo_acesso`
- **Broadcast no admin**: 📢 já está no header (linha 18), sempre visível
- **Firebase domain**: configurado no Firebase Console por Arthur

### Validacao

- `npm run build` passou
- Commit: `95146f4`

---

## Sessao 2026-04-28 (parte 4)

### Admin repaginada — tempo real, métricas, push individual

- **Auto-refresh:** admin agora atualiza sozinha a cada 20s com toggle ON/OFF, indicador "há Xs" e botão de recarregar manual
- **Métricas enriquecidas:** ativos hoje, retenção (%), crescimento vs semana anterior, novos esta semana / semana passada, anotações por tipo, total de pacientes, usuários com FCM
- **Push notification individual:** modal de contato agora permite enviar email, notificação push ou ambos para cada usuário
- **Detalhe do usuário:** modal ao clicar no card mostra email, syncCode, UID, cadastro, último acesso, anotações, dispositivos FCM, status, emails enviados
- **Filtros rápidos:** chips "Todos", "Hoje", "7 dias", "Inativos" para filtrar a lista de usuários
- **Barra compacta de métricas** no topo com total usuários, ativos hoje, crescimento, total anotações
- **Cards de tendência (crescimento):** comparação visual novos esta semana vs passada com indicador verde/vermelho
- **Backend:** GET /api/admin enriquecido com métricas avançadas e leitura de anotações/pacientes; POST agora aceita `canal: 'email' | 'push' | 'ambos'` para comunicação individual via FCM
- **AdminView CSS:** 15.71 kB, **JS:** 25.01 kB

### Dependência adicionada

- `twilio` instalado (preparado para uso futuro de SMS)

### PWA: check periódico de atualização + correção de inicialização

- Adicionado `setInterval` 30min no `onRegisteredSW` para verificar atualizações durante plantões longos (browser só checa em navegação, insuficiente em SPA)
- `onNeedRefresh()` mantém banner (sem auto-reload, que causava instabilidade)
- **Fix crítico:** `pacientes.iniciar()` e `organizador.iniciar()` não eram chamados no login — só `anotacoes.iniciar()`. Isso fazia o badge de pendências não aparecer ao dar refresh no Dashboard, porque os pacientes nunca carregavam (o Dashboard não tinha onMounted com iniciar). Adicionado no mesmo watch de `auth.isLoggedIn` no App.vue.
- Commits: `30f51a9`, `ab6cf32`, `464a8ab`

### Validacao

- `npm run build` passou

---

## Sessao 2026-04-28 (parte 3)

### Landing page — refinamentos finais

- **Hero-badge removido:** redundante com a barra de acesso antecipado no topo
- **Palavra "redigitando" removida** em dois lugares (feat card + step desc) — trocada por "perdido com papel" e "e so colar e pronto"
- **"no plano gratuito" removido** do CTA final — agora so "X vagas disponiveis" (evita sugerir que existe plano pago)
- **Stat "0" → "Zero"**: "0 Pendencias esquecidas" mudou para "Zero Pendencia esquecida" (visualmente mais limpo)
- **Stat "Menos redigitacao" → "Menos papel"**: mesma familia da palavra rejeitada
- **CSS morto removido:** ~200 linhas de `.install-section`, `.login-options`, `.hero-badge` e variacoes mobile sem template correspondente
- **LandingView CSS reduziu de 19.41 kB → 13.67 kB** no bundle

### Enxugamento estrutural da landing

- **LISTA DE FUNCIONALIDADES removida:** redundante com os 8 feat cards — eliminada junto com o array `features` e CSS associado (`.two-col`, `.features-list`, `.feature-item`, `.btn-outline`)
- **COMO FUNCIONA + DESTAQUES mesclados** em uma seção única com steps seguidos de feat cards (`style="margin-top: 60px"`)
- **Feats reduzidos de 8 → 6:** Clara (assistente IA) e Instala como app removidos — mantidos os cards mais focados em alívio de dor
- **DEPOIMENTOS mudou de `section-alt` para `section`** (removeu fundo alternado, ficou sobre fundo principal)
- **LandingView CSS:** 13.67 kB → **12.34 kB**
- **LandingView JS:** 12.99 kB → **11.78 kB**

### Analise critica da landing

- Estrutura validada contra o strategy doc `.gstack/landing-strategy.md` — todas as secoes estao na ordem correta
- Navegacao, hero (agora com mockup do dashboard real), stats, como funciona, cards de destaque, depoimentos, lista de funcionalidades, FAQ, CTA final e footer — coerentes e sem redundancia

### Validacao

- `npm run build` passou

---

## Sessao 2026-04-28 (parte 2)

### Landing page reformulada com posicionamento de dor/credibilidade

- **Posicionamento:** Hero trocado de "Organize seu plantao" para "Nunca mais perde uma pendencia no plantao" — copia centrada na dor do enfermeiro, nao em features
- **Barra de urgencia removida:** substituida por barra de "Acesso antecipado" com tom calmo (pill azul), mantendo a escassez real de 100 vagas do Firebase Spark sem parecer golpe de marketing
- **CTA unificado:** "Usar de graca →" em vez de "Comecar agora — gratis" / "Garantir minha vaga" (condicional que mudava conforme vagas)
- **Stats atualizados:** "Ferramentas no app" → "Tipos de anotacao", "100% Offline" → "+ Menos redigitacao, mais cuidado" (sem numero fixo)
- **Seccoes removidas:** Instalar, Formas de Entrar — informacao duplicada ou detalhe demais pra landing
- **Reordenação:** Como funciona → Destaques → Depoimentos (subiram) → Lista de funcionalidades → FAQ → CTA final
- **CTA final:** "Seu plantao nao pode esperar" em vez de "Entra no seu proximo plantao com tudo organizado"
- **Copias dos 8 cards de funcionalidades reescritas:** foco em alivio de dor ("Chega de esquecer", "Texto pronto em segundos") em vez de descricao de features
- **Mockup do celular atualizado:** reflete o design atual do app (badge de pendencias, card de paciente, barra de anotacao rapida)
- **Script limpo:** `displayUrl`, `urlCopiada` e `copiarUrl` removidos (eram da seccao Instalar que foi removida)
- **CSS:** barra de urgencia substituida por `.early-bar` + `.early-pill`

### Guia de implementacao de pagamento

- `PAYMENT_GUIDE.md` criado na raiz com modelo Free vs Pro (R$14,99/mes), arquitetura Stripe, estrutura Firebase, ordem de implementacao em 9 passos e riscos

### Validacao

- `npm run build` passou

### Design system: DESIGN.md e SESSAO.md atualizados para 12 temas

- `DESIGN.md` e `SESSAO.md` revisados para refletir o sistema de 12 temas (6 dark + 6 light)
- Secao "Dark mode" removida do DESIGN.md (que afirmava nao haver modo claro) — substituida por "Sistema de temas"

### Ajuste de font-size nos chips de paciente

- `AnotacaoMedicacaoView.vue`: `0.83rem` → `0.9rem`
- `AnotacaoInicialView.vue`: `0.83rem` → `0.9rem`  
- `SinaisVitaisView.vue`: `0.92rem` → `0.9rem`
- Padronizado em `0.9rem` em todas as views

### Modal de exclusao de conta com SVG

- `ConfiguracoesView.vue`: novo modal de confirmacao com SVG de carinha triste e mensagem "Desculpa nao ter sido suficiente pra voce..."
- Fluxo: modal → "Quero deletar" → prompt(codigo) → exclusao
- Usa `Teleport` + `Transition("del")` + overlay pattern

### Dashboard: pendências no cabecalho + modal

- Novo composable `usePendenciasDashboard.js` — lista plana de pendencias pendentes com dados do paciente, ordenadas por horario
- Botao vermelho no cabecalho do dashboard com contagem de pendencias abertas
- Modal com lista completa das pendencias — tocar no item marca como concluido
- Botao some automaticamente quando nao ha pendencias pendentes
- Card de sync agora oculto quando nao ha pendencias (v-if totalPendencias > 0)
- CSS morto removido (`.pend-card`, `.pend-titulo`, `.pend-ver-todas`)

### TourDashboard e Ajuda atualizados

- `TourDashboard.vue`: passo 4 agora menciona o badge de pendencias no dashboard
- Passo 6 inclui Login rapido por codigo como alternativa ao Google em computadores do hospital
- Passo 8 corrigido: "botao ❓ na tela de login" → "botao Ajuda no cabecalho do painel"
- `LoginView.vue` helpItens: adicionado item "Login rapido por codigo"
- `DashboardView.vue` helpItens: adicionado item "Pendencias" explicando o botao vermelho

### Validacao

- `npm run build` passou

## Sessao 2026-04-27

### Padronização visual: progress bars e chips

- **PassagemPlantaoView**: glow da barra de progresso corrigido de `var(--shadow-sm)` para `0 0 14px var(--blue-faint)`; chip-on trocado de `linear-gradient(135deg, ...)` para `linear-gradient(180deg, ...)` com `box-shadow: 0 7px 16px color-mix(...)` padronizado
- **AnotacaoInicialView**: progress-fill recebeu gradiente `var(--blue-dark) → var(--blue)` e glow `0 0 14px var(--blue-faint)`, substituindo o `box-shadow: var(--shadow-sm)` genérico anterior
- **CurativoView**: chip-on migrado do tema verde (`var(--success)`) para o padrão navy/azul do restante do app (`linear-gradient(180deg, var(--blue), var(--blue-dark))`), com sombra azul consistente
- **SinaisVitaisView**: chip-on ganhou `box-shadow: 0 7px 16px color-mix(in srgb, var(--blue) 16%, transparent)` para alinhar visualmente com as demais views

### Validacao

- `npm run build` passou

## Sessao 2026-04-25

### Varredura de hardcoded de cores para suportar temas claros

- Foi realizada uma varredura ampla em `src/views/**/*.vue` e `src/components/**/*.vue` para remover cores fixas de texto que quebravam nos temas claros
- Cores de texto hardcoded como `#fff`, `#eef4ff`, `#f5f8ff`, `#a6c4d8` e `#d9ecfb` foram substituidas por tokens (`--text`, `--text-dim` e `--text-on-accent`)
- Foi criado o token global `--text-on-accent` em `src/assets/style.css` e propagado para todos os temas em `src/composables/useTheme.js`
- Em telas criticas (`AnotacaoInicial`, `AnotacaoMedicacao`, `SinaisVitais`, `PassagemPlantao`, `Historico`) foram normalizados overlays, fundos e bordas para tokens (`--bg-card`, `--bg-input`, `--border`) conforme o design system
- Admin, Dashboard, Pacientes, Organizador, Landing e componentes compartilhados (como `CalculadoraModal`, `ChatAssistente`, `TourDashboard` e `BotaoChat`) tambem receberam ajuste para remover hardcodes residuais
- Varredura final confirmou ausencia dos hardcodes-alvo em views/components e linter sem erros
- Segunda passada de theming adaptou micro-glows para tokens globais (`--shadow-glow-blue`, `--shadow-md`, `--shadow-lg`, `--shadow-inset-soft`) nos modulos criticos e componentes compartilhados
- Foram adicionados tokens contextuais de tipografia (`--text-soft`, `--text-faint`, `--text-info`, `--text-warning`, `--text-danger-soft`, `--text-success-soft`) para eliminar tons fixos de texto e manter coerencia nos temas claros/escuros
- Busca final confirmou ausencia de `color`/`border-color`/gradientes com hex hardcoded em `views/components`

### Correcao de tema dinamico em telas com hardcolor

- `HistoricoView` foi ajustada para parar de usar tons fixos de azul em superficies, bordas e sombras, passando a derivar tudo de tokens do tema ativo
- `AnotacaoInicialView` recebeu unificacao de tema no final do arquivo para neutralizar cast azul fixo em cards, blocos, modais e campos
- Com isso, temas alternativos (rosa, floresta, roxo, carbono, cobalto) passam a refletir melhor nessas telas que ainda tinham acento visual preso ao azul original

### Cards de anotacao concluidos no novo padrao premium

- Todos os cards principais de anotacao usados no plantao agora estao fechados na nova linguagem visual premium, com padrao consolidado de hero no primeiro bloco, cards mais profundos, chips premium e fluxo final compartilhado quando faz sentido
- `Anotacao Inicial`, `Passagem de Plantao`, `Encaminhamento`, `Higienizacao/Banho` e `Curativos` foram revisitados para alinhar paleta, glow, hierarquia, paciente registrado no topo e consistencia entre blocos
- `Curativos` saiu do visual verde isolado e foi trazido para a mesma familia navy/azul do resto do app
- `Anotacao Inicial` tambem teve os acentos verde/ciano reduzidos para ficar no mesmo padrao visual das outras telas
- `Meus Pacientes` recebeu polimento premium: hero do modulo, cards mais fortes, pendencias mais legiveis, modal alinhado com o app e remocao do FAB local que colidia com o rodape global
- O aviso de notificacoes em `Meus Pacientes` continua abrindo uma vez e pode ser reaberto manualmente depois, agora com visual mais integrado

### Shell e modulos gerais refinados no mesmo padrao

- A calculadora saiu do FAB verde solto e passou a abrir pelo rodape fixo do app, com estado compartilhado em `useCalculadora.js`
- `CalculadoraModal.vue` foi redesenhado para a mesma linguagem navy/azul do produto, com header premium, abas melhores, campos mais fortes e resultados sem o verde isolado antigo
- `Historico` foi elevado visualmente, ganhou largura melhor para desktop e passou a usar os novos icones ilustrados por tipo de anotacao para acelerar leitura e copia no computador do hospital
- `Organizador do plantao` tambem entrou no padrao premium com hero, cards de resumo, progresso mais claro e modais alinhados ao restante do app
- O atalho `Como acessar no computador` na dashboard trocou o emoji corrompido por um SVG inline, estabilizando o icone no botao
- A grade de `Anotacoes` da dashboard foi simplificada no mobile: sairam as etiquetas `Rapido/Apoio/Turno` e os cards de `Higienizacao` e `Encaminhamento` ganharam espaco suficiente para o nome nao ficar mais cortado

### Estado consolidado para a proxima sessao

- O ciclo de fechamento visual dos cards de anotacao pode ser considerado concluido nesta etapa
- O shell principal tambem ja esta mais perto do padrao final, com dashboard, historico, organizador, pacientes e calculadora na mesma familia visual
- Proximos trabalhos podem sair de polimento de tela por tela e voltar para backlog funcional, linguagem clinica, metricas e refinamentos de fluxo

### Validacao

- `npm test` passou com 60 testes
- `npm run build` passou

---

## Sessao 2026-04-26

### Varredura fina de theming (deep sweep parcial em lote)

- Estrutura de temas reforcada em `src/composables/useTheme.js` para todos os temas ativos (`noturno`, `rosa`, `floresta`, `roxo`, `carbono`, `cobalto`) com tokens de contraste e elevacao: `--text`, `--text-on-accent`, `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-modal`
- `src/assets/style.css` deixou de declarar sombras estaticas no `:root`; agora o CSS global consome os tokens injetados por tema
- Sombras legadas (`--shadow-soft`, `--shadow-inset-soft`, `--shadow-glow-blue`) foram removidas dos modulos revisados e mapeadas para o novo padrao
- Overlays de modais revisados para o padrao `rgba(0, 0, 0, 0.65)` em componentes compartilhados
- Hardcodes criticos removidos de componentes-chave (`BotaoChat`, `ChatAssistente`, `CalculadoraModal`, `TourDashboard`) para usar apenas variaveis de tema
- Modulos de anotacao priorizados na revisao final (`AnotacaoInicial`, `SinaisVitais`, `AnotacaoMedicacao`) receberam normalizacao adicional de sombras e estados visuais
- Novo guia de design system criado em `THEME_GUIDE.md` com regras de uso obrigatorio dos tokens

### Varredura final de rgba fixo em AnotacaoInicialView

- `AnotacaoInicialView.vue` passou por varredura final que eliminou ~35 ocorrências de `rgba()` fixo do CSS scoped, substituindo por variáveis de tema locais (`--inicial-surface-*`, `--inicial-border-*`) e `color-mix()` com tokens do tema ativo
- Com isso o CSS scoped da view ficou **zero `rgba` fixo**, respondendo corretamente a qualquer tema (escuro ou claro) sem reter cor azul residual
- Único `rgba` mantido foi o do `modal-overlay` (`rgba(0,0,0,0.55)`), por ser universal e aplicar-se igualmente a todos os temas
- Build confirmado (`npm run build`) sem erros

---

## Sessao 2026-04-24

### Notas Livres: tela fechada no padrao premium

- `Notas Livres` foi elevada para a mesma linguagem visual de `Dashboard`, `Sinais Vitais` e `Medicacao`, com fundo premium, hero com PNG proprio e cards mais profundos
- O estado final de texto pronto passou a usar `ResultadoAnotacao.vue`, padronizando revisar, copiar, compartilhar, salvar e editar com os outros modulos ja atualizados
- O limite antigo de `400` caracteres no texto dos modelos foi removido, permitindo salvar modelos longos de uso real no plantao
- A biblioteca de modelos foi redesenhada para uso operacional: busca por titulo/texto, favoritos persistidos no Firebase e sync offline tambem para favoritar/remover favorito
- Depois de validar visualmente no app, a lista de modelos foi compactada para uma linha por modelo, com rolagem interna e botao `Gerar anotacao` acima dos modelos para nao empurrar a acao principal para o fim da pagina
- O modal `Gerenciar modelos` tambem ganhou busca propria para lidar melhor com muitos modelos cadastrados

### Aprendizados de UX confirmados na pratica

- Em telas de plantao, modelos sao aceleradores, nao o fluxo principal; por isso a acao `Gerar anotacao` precisa aparecer antes da biblioteca de modelos
- Preview grande de modelo parece bonito, mas aumenta scroll rapido demais; para uso real, titulo em uma linha + busca/favoritos funciona melhor
- Se uma lista pode crescer muito, ela precisa de busca e rolagem interna antes de virar um problema de dobra
- O componente `ResultadoAnotacao.vue` virou o padrao desejado para o final dos modulos de anotacao que geram texto

### Validacao

- `npm test` passou com 60 testes
- `npm run build` passou

---

## Sessao 2026-04-23

### Dashboard: redesign visual guiado por uso real

- Dashboard foi redesenhado com linguagem mais proxima do mock aprovado: topo com saudacao, ilustracao, cards mais premium e hierarquia mais clara entre `Anotacoes` e `Atalhos do plantao`
- Emojis antigos da home foram substituidos por PNGs ilustrados do dashboard, com versoes transparentes otimizadas para o bundle
- Icone do app em `public/icons/` tambem foi atualizado para acompanhar a nova identidade visual
- `Atalhos do plantao` passaram a usar os icones ilustrados tambem, incluindo `Configuracoes`
- `Feedback` saiu do fluxo inline e virou modal central com blur de fundo
- Home ganhou rodape fixo estilo app no mobile, com atalhos para `Inicio`, `Pacientes`, `Anotacoes`, `Tarefas` e `Perfil`
- Botao da Clara foi reposicionado para nao colidir com o rodape fixo no mobile
- Card de sincronizacao foi redesenhado varias vezes ate ficar mais compacto, com `Ver detalhes` restaurado e CTA bem menor
- Atalho `Ao lado` foi removido da dobra principal; abaixo do sync ficou apenas `Como acessar no computador`

### Aprendizados de UX confirmados na pratica

- Na home, visual bonito ajuda muito na percepcao do produto, mas qualquer excesso na primeira dobra atrapalha rapido
- Topo com ilustracao faz sentido, desde que a arte esteja em PNG transparente e em tamanho controlado
- O card de sincronizacao nao deve competir com a acao principal do plantao; ele funciona melhor como status util, nao como hero secundario
- Para dashboard mobile, manter `4 cards por linha` funcionou melhor do que voltar para `2 colunas grandes`
- Sempre que um ajuste for claro e incremental, seguir direto ate commit/push sem ficar pedindo confirmacao a cada passo
- Em `Sinais Vitais`, campos numericos devem chamar teclado numerico no mobile, mas `Localizacao da dor` continua melhor como texto livre; a tentativa com chips foi revertida
- A direcao visual futura do app ficou consolidada: usar a nova dashboard como referencia de linguagem premium para os outros modulos, sem abrir mao de velocidade operacional

### Validacao

- `npm test` passou com 60 testes
- `npm run build` passou
