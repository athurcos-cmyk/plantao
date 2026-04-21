# Memory Index - Plantao (Codex)

> Ultima atualizacao: 2026-04-21

## Arquivos locais do Codex

- [project_status.md](project_status.md) - status do app, alertas operacionais, pendencias e negocio
- [project_overview.md](project_overview.md) - stack, estrutura, rotas, stores, composables e integracoes

## Fontes herdadas do Claude

Arquivos preservados como referencia, sem edicao por este fluxo:

- `C:\Users\Thurcos\.claude\projects\C--Users-Thurcos-Desktop-plantao\memory\MEMORY.md`
- `C:\Users\Thurcos\.claude\projects\C--Users-Thurcos-Desktop-plantao\memory\project_status.md`
- `C:\Users\Thurcos\.claude\projects\C--Users-Thurcos-Desktop-plantao\memory\project_overview.md`

## Ultima sessao (2026-04-21)

- Tela de `Medicacao` ganhou fluxo rapido completo com `Salvar e adicionar proxima`
- Historico de medicacao agora mescla cache local e Firebase com deduplicacao por esquema completo
- Adicionados chips de `Presets rapidos` e `Ultimos usados` para lancar medicacoes com um toque
- Usuario pode salvar presets proprios a partir dos itens ja adicionados
- Catalogo de medicacoes foi enriquecido com vias, doses e alguns esquemas EV comuns para autocomplete detalhado
- Modal ficou mais leve para caso comum e manteve `Recusa` sempre visivel
- EV passou a ser guiado entre `Direto` e `Diluido`, abrindo solucao e volume quando necessario
- Layout da tela de `Medicacao` foi refinado com painel-resumo do horario, atalhos de paciente em card proprio, lista de itens mais legivel e CTA final de geracao mais destacado
- Testes passaram com 56 testes e o build de producao tambem passou

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
