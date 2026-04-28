# Changelog — Histórico completo

Sessões anteriores a 2026-04-23 movidas para cá para manter o CHANGELOG.md principal enxuto.

---

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

---

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

---

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

---

## Sessao 2026-04-01

### Bugs corrigidos e melhorias relevantes

- Corrigido problema em `useDispositivos` apos `Nova anotacao`
- Exclusao de pacientes ficou otimista
- Dashboard desktop ganhou botao `Ao lado`
- Auditoria de seguranca confirmou protecao adequada em Firebase Rules e endpoints
- Pendencia mantida: rotacionar `CRON_SECRET`

---

## Marco de 2026 (reconstituído)

> Sessoes reconstituidas a partir de `TODOS.md` e da memoria antiga.

### Sessao 2026-03-28 — Auditoria e decisoes de backlog
### Sessao 2026-03-26 — Lancamento publico e validacao de linguagem
### Sessao 2026-03-25 — Admin, LGPD e operacao interna
### Sessao 2026-03-23 — Push, conta, desktop e comunicacao
### Sessao 2026-03-22 — Auth, dominio, landing e features de v1
### Sessao 2026-03-21 — Base de design e calculadora
