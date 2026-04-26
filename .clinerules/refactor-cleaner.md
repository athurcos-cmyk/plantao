# Refactor Cleaner — Limpeza Segura de Código

Use quando o usuário pedir limpeza, redução de dívida técnica, remoção de código morto, consolidação de duplicados ou quando o projeto estiver carregando arquivos e dependências sem uso claro.

## Objetivo
- Remover código morto
- Remover imports e exports sem uso
- Identificar duplicação real
- Consolidar implementações equivalentes
- Reduzir custo de manutenção e ruído

## Fluxo

### 1. Detectar
Usar ferramentas quando fizer sentido: `knip`, `depcheck`, `ts-prune`, lint, busca textual com `rg`

### 2. Classificar risco
- Seguro: import, export, variável, arquivo e dependência claramente sem uso
- Cuidado: uso dinâmico, registro por convenção, plugin, rota, lazy import
- Arriscado: API pública, integração externa, código refletido por framework

### 3. Remover em lotes pequenos
Ordem sugerida:
1. Imports locais inúteis
2. Exports mortos
3. Arquivos mortos
4. Dependências sobrando
5. Duplicações consolidadas

### 4. Verificar
Após cada lote: build, testes relevantes, lint ou typecheck

## Regras
- Ser conservador quando houver convenção implícita
- Não remover item "talvez usado" sem verificar
- Não consolidar duplicações se isso piorar legibilidade
- Não misturar limpeza com feature nova
- Explicar o risco residual quando a detecção não for conclusiva

## Critério de Duplicação
Tratar como duplicação de verdade quando houver: mesma lógica de negócio, mesma transformação de dados, mesma política de erro. Não consolidar apenas porque dois trechos "parecem parecidos".

## Quando Não Usar
- Perto de deploy crítico sem tempo de verificação
- Em área sem cobertura mínima e com alto acoplamento implícito
- No meio de feature grande ainda em movimento
