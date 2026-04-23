# Memory Index - Plantao (Codex)

> Ultima atualizacao: 2026-04-23

## Arquivos locais do Codex

- [project_status.md](project_status.md) - status do app, alertas operacionais, pendencias e negocio
- [project_overview.md](project_overview.md) - stack, estrutura, rotas, stores, composables e integracoes

## Fontes herdadas do Claude

Arquivos preservados como referencia, sem edicao por este fluxo:

- `C:\Users\Thurcos\.claude\projects\C--Users-Thurcos-Desktop-plantao\memory\MEMORY.md`
- `C:\Users\Thurcos\.claude\projects\C--Users-Thurcos-Desktop-plantao\memory\project_status.md`
- `C:\Users\Thurcos\.claude\projects\C--Users-Thurcos-Desktop-plantao\memory\project_overview.md`

## Ultima sessao (2026-04-23)

- Dashboard entrou numa nova fase visual: topo com saudacao + ilustracao, cards ilustrados em PNG e atalhos com mais cara de app de verdade
- Os PNGs finais do dashboard precisam continuar transparentes e otimizados; arte com fundo branco piora muito o topo e os cards
- O card de sincronizacao foi reduzido varias vezes depois de feedback real no celular; o estado atual privilegia compactacao, `Ver detalhes` e CTA pequeno
- `Feedback` agora abre como modal central com blur, em vez de aparecer inline la embaixo
- Dashboard mobile ganhou rodape fixo estilo app com `Inicio`, `Pacientes`, `Anotacoes`, `Tarefas` e `Perfil`
- Botao da Clara foi reposicionado acima do rodape fixo no mobile para nao colidir com a navegacao
- Aprendizado importante: na home, visual premium ajuda, mas qualquer excesso na dobra principal e percebido imediatamente como atrito
- Para a grade de `Anotacoes`, manter `4 cards por linha` funcionou melhor do que voltar para `2 colunas grandes`
- `Encaminhamento` exigiu ajuste proprio de tipografia; a solucao foi tratar esse card especificamente sem desmontar a grade toda
- Abaixo do sync ficou so o atalho `Como acessar no computador`; `Ao lado` saiu da primeira dobra
- Regra de colaboracao alinhada com o usuario: para ajustes diretos e incrementais, seguir ate commit/push sem ficar pedindo confirmacao a cada micro-etapa
- Testes passaram com 60 testes e o build de producao tambem passou

## Sessao anterior (2026-04-21)

- Tela de `Medicacao` ganhou fluxo rapido completo com `Salvar e adicionar proxima`
- Historico de medicacao agora mescla cache local e Firebase com deduplicacao por esquema completo
- Adicionados chips de `Presets rapidos` e `Ultimos usados` para lancar medicacoes com um toque
- Usuario pode salvar presets proprios a partir dos itens ja adicionados
- Catalogo de medicacoes foi enriquecido com vias, doses e alguns esquemas EV comuns para autocomplete detalhado
- Catalogo de medicacoes agora tambem cobre varias `vias comuns`, mas continua limitando atalhos por medicamento e evitando preset completo em tudo
- Modal ficou mais leve para caso comum e manteve `Recusa` sempre visivel
- EV passou a ser guiado entre `Direto` e `Diluido`, abrindo solucao e volume quando necessario
- Depois de validar no plantao real, a tela de `Medicacao` voltou a um formato mais enxuto: sem painel-resumo, sem microcopy redundante e com `Adicionar medicamento` mais direto
- Fica registrado como regra de produto: nessa tela, manter so o que acelera de verdade (`Ultimos usados`, presets, favoritos e `Salvar e adicionar proxima`)
- Microcopy de atalho rapido deve ser curta e objetiva: falar de `prescricao` e `apresentacao`, sem adicionar termos extras como `protocolo`
- Historico reaproveitavel da `Medicacao` agora mantem tambem os dados de lote, para nao perder frasco, lote, fabricacao, validade e marca ao repetir medicamentos semelhantes
- Testes passaram com 60 testes e o build de producao tambem passou

## Sessao anterior (2026-04-16)

- Corrigido bootstrap inicial preso em rede fraca com cache local de sessao
- `auth.js` ganhou timeout de fallback para destravar a UI mesmo quando o Firebase demora
- `Medicacao` ja tinha ganho separacao visual entre preparo e administracao
- Dashboard mobile e shell PWA foram refinados visualmente

## Sessao anterior registrada no projeto (2026-04-01)

- Fix de `useDispositivos` para nao quebrar referencia do array apos `Nova anotacao`
- Exclusao otimista em pacientes e pendencias
- Botao desktop `Ao lado` no dashboard
- Auditoria de seguranca confirmada
- Pendencia critica mantida: rotacionar `CRON_SECRET`

## Leitura obrigatoria no inicio de cada sessao

1. `CHANGELOG.md`
2. `TODOS.md`
3. `.codex/memory/project_status.md`
4. `.codex/memory/project_overview.md`
5. `DESIGN.md` se houver UI
6. Design doc gstack mais recente em `C:\Users\Thurcos\.gstack\projects\athurcos-cmyk-plantao\*-design-*.md`
