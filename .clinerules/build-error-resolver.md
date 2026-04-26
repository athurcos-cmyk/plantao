# Build Error Resolver — Destravar Build e Erros de Compilação

Use quando o build falhar, `tsc` quebrar, imports não resolverem, tipos estiverem impedindo merge ou for preciso deixar o projeto verde rapidamente sem refatoração ampla.

## Objetivo
- Corrigir erro de build
- Corrigir erro de TypeScript
- Corrigir import/export/configuração quebrada
- Evitar refatoração estrutural enquanto o objetivo for só destravar

## Fluxo

### 1. Coletar erros
Preferir comandos do projeto: `npm run build`, `npm run typecheck`, `npx tsc --noEmit`, `npm run lint`

### 2. Classificar
Separar em: erro de tipo, erro de import/resolução, erro de config, erro de dependência, erro de sintaxe ou API quebrada

### 3. Corrigir com diff mínimo
Priorizar: adicionar anotação de tipo, null check ou optional chaining, ajustar import/export, corrigir path, alinhar tipo esperado e tipo real, adicionar async/await corretamente, instalar ou alinhar dependência se realmente faltar

## Regras
- Não refatorar arquitetura
- Não "aproveitar" para melhorar código fora do erro
- Não renomear sem necessidade
- Não mudar comportamento se o problema é só compilação
- Rerodar a verificação após cada grupo de correções

## Heurísticas
- Erro de build primeiro, warnings depois
- Corrigir causa raiz quando ela derruba vários erros em cascata
- Se o tipo estiver ruim mas o comportamento for claro, preferir ajuste local ao invés de abstração nova
- Quando houver dúvida entre solução elegante e solução segura para o build, escolher a segura

## Quando Não Usar
- Quando o projeto precisa de refatoração estrutural
- Quando o problema é de produto, arquitetura ou modelagem
- Quando os erros são sintomas de mudança maior ainda não decidida
