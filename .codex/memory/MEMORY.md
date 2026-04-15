# Memory Index — Plantão (Codex)

> Última atualização: 2026-04-15

## Arquivos locais do Codex

- [project_status.md](project_status.md) — status do app, alertas operacionais, pendências e negócio
- [project_overview.md](project_overview.md) — stack, estrutura, rotas, stores, composables e integrações

## Fontes herdadas do Claude

Arquivos preservados como referência, sem edição por este fluxo:

- `C:\Users\Thurcos\.claude\projects\C--Users-Thurcos-Desktop-plantao\memory\MEMORY.md`
- `C:\Users\Thurcos\.claude\projects\C--Users-Thurcos-Desktop-plantao\memory\project_status.md`
- `C:\Users\Thurcos\.claude\projects\C--Users-Thurcos-Desktop-plantao\memory\project_overview.md`

## Última sessão (2026-04-15)

- ✅ Estrutura `.codex/memory/` criada para o Plantão
- ✅ `CODEX.md` refeito com ordem fixa de leitura e atualização
- ✅ Estado real do código conferido antes de documentar: Firebase Auth ativo, login por código via `/api/login-by-code`, 11 endpoints serverless
- ✅ Referência ao design doc mais recente do gstack fixada na documentação do Codex
- ✅ Arquivos do Claude mantidos sem alteração
- ✅ Polling principal reduzido: dashboard passou para eventos e sync automático só roda quando há pendências
- ✅ Clara otimizada com contexto recente + resumo curto do histórico
- ✅ Notificações agora pedem permissão sob demanda e usam diff com debounce nas pendências
- ✅ Lógica de dispositivos consolidada em util compartilhado
- ✅ Histórico/Admin renderizam listas grandes em lotes
- ✅ Bundle inicial do app foi reduzido com `manualChunks`, async components no shell e lazy-load de `firebase/messaging`

## Estado herdado da sessão anterior registrada no projeto (2026-04-01)

- Fix de `useDispositivos` para não quebrar referência do array após "Nova anotação"
- Exclusão otimista em pacientes e pendências
- Botão desktop `⊞ Ao lado` no dashboard
- Auditoria de segurança confirmada
- Pendência crítica mantida: rotacionar `CRON_SECRET`

## Leitura obrigatória no início de cada sessão

1. `CHANGELOG.md`
2. `TODOS.md`
3. `.codex/memory/project_status.md`
4. `.codex/memory/project_overview.md`
5. `DESIGN.md` se houver UI
6. Design doc gstack mais recente em `C:\Users\Thurcos\.gstack\projects\athurcos-cmyk-plantao\*-design-*.md`
