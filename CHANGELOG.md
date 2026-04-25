# Changelog - Plantao

## O que e o app

**Plantao** e um PWA de anotacoes de enfermagem para uso no celular durante plantao hospitalar. Gera textos formatados prontos para copiar no sistema do hospital. Funciona offline, sincroniza via Firebase Realtime Database e pode ser instalado como app no celular.

---

## Sessao 2026-04-25

### Cards de anotacao concluidos no novo padrao premium

- Todos os cards principais de anotacao usados no plantao agora estao fechados na nova linguagem visual premium, com padrao consolidado de hero no primeiro bloco, cards mais profundos, chips premium e fluxo final compartilhado quando faz sentido
- `Anotacao Inicial`, `Passagem de Plantao`, `Encaminhamento`, `Higienizacao/Banho` e `Curativos` foram revisitados para alinhar paleta, glow, hierarquia, paciente registrado no topo e consistencia entre blocos
- `Curativos` saiu do visual verde isolado e foi trazido para a mesma familia navy/azul do resto do app
- `Anotacao Inicial` tambem teve os acentos verde/ciano reduzidos para ficar no mesmo padrao visual das outras telas
- `Meus Pacientes` recebeu polimento premium: hero do modulo, cards mais fortes, pendencias mais legiveis, modal alinhado com o app e remocao do FAB local que colidia com o rodape global
- O aviso de notificacoes em `Meus Pacientes` continua abrindo uma vez e pode ser reaberto manualmente depois, agora com visual mais integrado

### Estado consolidado para a proxima sessao

- O ciclo de fechamento visual dos cards de anotacao pode ser considerado concluido nesta etapa
- Proximos trabalhos podem sair de polimento de tela por tela e voltar para backlog funcional, linguagem clinica, metricas e refinamentos de fluxo

### Validacao

- `npm test` passou com 60 testes
- `npm run build` passou

## Sessao 2026-04-24

### Notas Livres: tela fechada no padrao premium

- `Notas Livres` foi elevada para a mesma linguagem visual de `Dashboard`, `Sinais Vitais` e `Medicacao`, com fundo premium, hero com PNG proprio e cards mais profundos
- O estado final de texto pronto passou a usar `ResultadoAnotacao.vue`, padronizando revisar, copiar, compartilhar, salvar e editar com os outros modulos ja atualizados
- O limite antigo de `400` caracteres no texto dos modelos foi removido, permitindo salvar modelos longos de uso real no plantao
- A biblioteca de modelos foi redesenhada para uso operacional: busca por titulo/texto, favoritos persistidos no Firebase e sync offline tambem para favoritar/remover favorito
- Depois de validar visualmente no app, a lista de modelos foi compactada para uma linha por modelo, com rolagem interna e botao `Gerar anotacao` acima dos modelos para nao empurrar a acao principal para o fim da pagina
- O modal `Gerenciar modelos` tambem ganhou busca propria para lidar melhor com muitos modelos cadastrados
- A tela manteve a logica existente de notas, timeline, modelos offline, sync e historico, concentrando a mudanca em UX, hierarquia e organizacao visual

### Aprendizados de UX confirmados na pratica

- Em telas de plantao, modelos sao aceleradores, nao o fluxo principal; por isso a acao `Gerar anotacao` precisa aparecer antes da biblioteca de modelos
- Preview grande de modelo parece bonito, mas aumenta scroll rapido demais; para uso real, titulo em uma linha + busca/favoritos funciona melhor
- Se uma lista pode crescer muito, ela precisa de busca e rolagem interna antes de virar um problema de dobra
- O componente `ResultadoAnotacao.vue` virou o padrao desejado para o final dos modulos de anotacao que geram texto

### Validacao

- `npm test` passou com 60 testes
- `npm run build` passou

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
- O card de `Encaminhamento` precisou de ajuste especifico de tipografia; a melhor solucao foi corrigir o texto sem desfazer a grade
- Sempre que um ajuste for claro e incremental, seguir direto ate commit/push sem ficar pedindo confirmacao a cada passo
- Em `Sinais Vitais`, campos numericos devem chamar teclado numerico no mobile, mas `Localizacao da dor` continua melhor como texto livre; a tentativa com chips foi revertida
- A direcao visual futura do app ficou consolidada: usar a nova dashboard como referencia de linguagem premium para os outros modulos, sem abrir mao de velocidade operacional

### Validacao

- `npm test` passou com 60 testes
- `npm run build` passou

## Sessao 2026-04-21

### Medicacao: fluxo rapido completo

- Historico de medicacao foi reforcado para mesclar cache local e Firebase, com limite maior e deduplicacao por esquema completo da medicacao
- Tela de medicacao ganhou `Salvar e adicionar proxima`, mantendo o contexto util do modal para lancar varias medicacoes do mesmo horario sem recomecar do zero
- Adicionados chips de `Presets rapidos` e `Ultimos usados` para inserir medicacoes com um toque direto na lista do horario
- Usuario agora pode salvar presets proprios a partir de medicacoes ja lancadas na tela
- Autocomplete de medicacao foi enriquecido com catalogo estruturado de vias, doses e esquemas comuns, priorizando historico do usuario e depois presets do catalogo
- Modal ficou mais rapido para caso comum: detalhes como dupla checagem e lote foram rebaixados para um bloco secundario, sem esconder `Recusa`
- EV ficou mais guiado com distincao direta entre `Direto` e `Diluido`; ao escolher diluicao, o app abre solucao e volume
- Geracao de texto foi ajustada e testada para preservar via explicita em cada medicamento do texto final
- Tela de medicacao ganhou novo layout visual com painel-resumo do horario, atalhos de paciente mais claros, lista de itens mais legivel e bloco final de geracao melhor destacado

### Medicacao: ajuste apos uso real no plantao

- Revisao no uso real mostrou que o painel-resumo e microcopys extras atrasavam o fluxo em vez de ajudar
- A tela voltou para um formato mais enxuto, cortando resumo no topo, estados redundantes e explicacoes que empurravam `Adicionar medicamento` para baixo
- Foram mantidos apenas os aceleradores que provaram valor no uso real: `Ultimos usados`, presets, favoritar e `Salvar e adicionar proxima`
- O aprendizado registrado para frente e: na tela de medicacao, priorizar menos leitura, menos scroll e menos toque, mesmo que a hierarquia visual fique mais simples
- Historico e presets de medicacao agora preservam tambem dados de lote reaproveitaveis, como frasco, numero do lote, fabricacao, validade e marca, sem quebrar a deduplicacao pelo esquema clinico principal
- Catalogo de medicacao foi ampliado com `vias comuns` para varios medicamentos, mantendo presets completos so nos itens mais previsiveis e limitando os atalhos a no maximo 4 por remedio
- Avisos de atalho rapido foram encurtados depois do uso real: manter so `prescricao` e `apresentacao`, sem adicionar leitura extra desnecessaria

### Validacao

- `npm test` passou com 60 testes
- `npm run build` passou

## Sessao 2026-04-16

### Bootstrap offline e rede fraca

- Corrigido travamento inicial em rede fraca que podia deixar o app preso na tela azul antes de renderizar a rota
- `auth.js` agora restaura sessao local em cache logo no startup com `syncCode`, `uid`, `email` e `userName`
- Inicializacao do auth ganhou timeout de fallback para nao bloquear a UI indefinidamente enquanto o Firebase responde
- Sessao local foi centralizada em `src/utils/authSessionCache.js`
- Adicionados testes para cache de sessao e limpeza do estado local

### Revisao de UI/UX mobile

- Dashboard foi reestruturado para dar foco ao comeco do plantao, com sincronizacao mais compacta e menos ruido visual
- `Medicacao` ganhou secoes separadas para preparo/checagem e para os medicamentos do horario
- `Anotacao Inicial` e `Passagem de Plantao` rebaixaram visualmente o botao `Limpar`
- Banners de instalacao PWA do shell passaram a usar formato flutuante mais compacto

## Sessao 2026-04-15

### Organizacao de contexto para Codex

- Criada a memoria local do Codex em `.codex/memory/` com `MEMORY.md`, `project_status.md` e `project_overview.md`
- `CODEX.md` passou a comecar com a lista fixa dos arquivos de leitura e atualizacao da sessao
- O estado real do app foi revalidado antes de documentar: Firebase Auth segue ativo, login por codigo usa `/api/login-by-code` com `customToken`
- Os arquivos do Claude foram preservados sem alteracao

### Otimizacoes implementadas depois

- Sync automatico do app passou a evitar polling continuo sem pendencias
- Clara passou a enviar menos contexto por mensagem
- Permissao de notificacao passou a ser pedida sob demanda
- Logica de dispositivos foi deduplicada
- Historico/Admin ganharam renderizacao incremental
- Build passou a usar `manualChunks`, lazy-load de `firebase/messaging` e carregamento sob demanda de componentes do shell

## Sessao 2026-04-01

### Bugs corrigidos e melhorias relevantes

- Corrigido problema em `useDispositivos` apos `Nova anotacao`
- Exclusao de pacientes ficou otimista
- Dashboard desktop ganhou botao `Ao lado`
- Auditoria de seguranca confirmou protecao adequada em Firebase Rules e endpoints
- Pendencia mantida: rotacionar `CRON_SECRET`

---

## Marco de 2026 reconstruido

> Bloco reconstituido a partir de `TODOS.md` e da memoria do Claude em `C:\Users\Thurcos\.claude\projects\C--Users-Thurcos-Desktop-plantao\memory\`.

## Sessao 2026-03-28

### Auditoria e decisoes de backlog

- Auditoria de seguranca completa refeita em Firebase Rules, `.env` e endpoints, com confirmacao de que a arquitetura estava protegida e sem risco de vazamento entre usuarios
- Aviso de PWA para iOS foi removido do backlog por decisao de produto
- Ficou reforcado como pendencia operacional principal: rotacionar `CRON_SECRET` no Vercel e no cron externo
- Tambem ficou registrada a leitura de que atrasos de notificacao no Android vinham mais da latencia do FCM e da rede hospitalar do que de bug local

## Sessao 2026-03-26

### Lancamento publico e validacao de linguagem

- App foi lancado publicamente com divulgacao em Instagram, WhatsApp e grupos de Facebook
- `@plantao.app` entrou no ar com posts e anuncio em carrossel para validar captacao real
- Politica de privacidade e termos receberam validacao final de linguagem inclusiva
- Trocas de texto migraram de `enfermeiro` para `profissional de enfermagem` nos documentos publicos
- Feedback de enfermeira sobre formalidade das anotacoes foi registrado, mas a decisao foi manter o app mais pratico e menos academico por enquanto

### Contexto de gstack

- Doc de GTM em `Thurcos-main-design-20260326-gtm.md` reforcou a tese de distribuicao com Facebook grupos primeiro, WhatsApp como amplificador e Instagram em segunda etapa
- O mesmo doc registrou como diferencial central do produto a mobilidade offline em ambiente hospitalar caotico, e nao apenas o texto pronto
- Tambem ficou documentada ali a orientacao de so ligar paywall depois de preencher as 100 vagas gratuitas e observar engajamento real

## Sessao 2026-03-25

### Admin, LGPD e operacao interna

- Admin dashboard foi expandido para tabs de `Usuarios`, `Feedbacks`, `Metricas` e `Monitor`
- Painel admin ganhou busca, badge de atividade, email individual, leitura de feedbacks e visibilidade de tokens FCM por usuario
- Broadcast admin foi consolidado com melhor rastreio de erros e depois movido para modal no header para ficar sempre acessivel
- `api/admin-data.js`, `api/admin-delete-user.js` e `api/admin-email-user.js` entraram na operacao dessa fase
- Onboarding foi removido do app
- `privacidade.html` e `termos.html` foram revisados para LGPD, com base legal, DPO, transferencia internacional e disclaimer da Clara
- Ajustes legais adicionais garantiram revogacao via `contato@plantao.net` e ampliaram o publico descrito para incluir auxiliares de enfermagem

## Sessao 2026-03-23

### Push, conta, desktop e comunicacao

- Migracao de push saiu de OneSignal para FCM nativo com novo `usePushNotificacoes.js`, novo `firebase-messaging-sw.js` e cron adaptado
- Exclusao de conta ficou robusta com `api/delete-account.js`, limpeza completa de paths de dados e protecao contra re-cadastro Google acidental em conta deletada
- Sistema de notificacoes foi blindado com arquitetura em 3 camadas: `setTimeout` preciso, cron FCM e safety net por `setInterval`
- Dashboard ganhou layout desktop responsivo
- Admin broadcast foi entregue com push e email para todos os usuarios cadastrados
- Fix operacional confirmou que parte dos problemas de push vinham do `cron-job.org` desabilitado, nao de falha estrutural do codigo
- Branding publico deixou de usar `tecnico de enfermagem`

### Contexto de gstack

- Doc estrategico `Thurcos-main-design-20260323-205359.md` consolidou a virada de produto para ferramenta individual paga, com foco em habito de uso antes de monetizacao
- Nessa mesma discussao ficou mais claro o papel do checklist clinico como principal valor do app, acima de “app bonito” ou de features sociais

## Sessao 2026-03-22

### Auth, dominio, landing e features de v1

- Migracao completa de `syncCode + PIN` para Firebase Auth com email/senha e Google
- Login rapido por codigo passou a existir via endpoint serverless para resolver email no backend
- Dominio `plantao.net` foi conectado ao Vercel, Firebase Auth e Google OAuth
- Landing page foi reescrita com hero focado na dor, FAQ, prova de valor e CTA mais forte
- Sistema de emails transacionais com voz do fundador entrou no ar com `welcome`, `feedback`, `day3` e `goodbye`
- Notificacao FCM multi-dispositivo passou a salvar tokens por device em `fcm_tokens/{syncCode}/{deviceId}`
- Anotacao Inicial ganhou campos configuraveis, opcao `Outro` e localizacao `Poltrona`
- Backend recebeu endurecimento com `CRON_SECRET` obrigatorio, rate limit no chat e no login por codigo e respostas mais seguras
- Ficou registrado que a configuracao do Resend em producao ainda dependia de chave e verificacao de dominio

## Sessao 2026-03-21

### Base de design e calculadora

- `DESIGN.md` foi criado para formalizar o design system do app
- Tokens como `--warning`, `--info`, raios e variacoes de cor foram adicionados ao tema
- LoginView ganhou aviso de modo privado para Safari/iOS
- Calculadora de medicacao recebeu historico local dos ultimos calculos
- Calculadora ganhou aba de diluicao de medicamentos em po, com registro explicito do cuidado clinico sobre volume de deslocamento do po liofilizado

### Contexto de gstack

- Doc `Thurcos-main-design-20260321-223914.md` registrou a calculadora como um segundo motivo de abrir o app durante o plantao, com FAB acessivel de qualquer tela e foco total em uso offline
- Auditoria visual em `.gstack/design-reports/design-audit-meuplantao-2026-03-21.md` confirmou boa aderencia ao design system, corrigiu pontos como touch target baixo no `PcView` e bug de rota no onboarding
- Essa auditoria tambem marcou a linguagem visual do produto como precisa, clinica e sem “AI slop”, o que ajuda a contextualizar varias decisoes de UI daquele periodo

## Contexto de marco ainda visivel em outros arquivos

- `TODOS.md` segue sendo a fonte mais detalhada das entregas e pendencias de marco
- `DESIGN.md` preserva decisoes visuais formalizadas em `2026-03-21`
- A memoria do Claude ainda guarda o contexto de lancamento, estrategia e feedback clinico dessa fase
