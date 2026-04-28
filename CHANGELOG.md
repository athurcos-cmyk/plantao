# Changelog - Plantao

## O que e o app

**Plantao** e um PWA de anotacoes de enfermagem para uso no celular durante plantao hospitalar. Gera textos formatados prontos para copiar no sistema do hospital. Funciona offline, sincroniza via Firebase Realtime Database e pode ser instalado como app no celular.

> Sessoes anteriores a 2026-04-23 foram movidas para `CHANGELOG_HISTORICO.md`.

---

## Sessao 2026-04-28

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
