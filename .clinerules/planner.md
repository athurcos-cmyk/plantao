# Planner — Planejamento Técnico

Use esta skill quando o usuário pedir plano de implementação, decomposição de trabalho, fases de entrega, estratégia para refatorar ou visão estruturada antes de começar a codar.

## Saída Esperada

Produzir um plano com:
- visão geral
- requisitos
- impacto arquitetural
- fases de implementação
- dependências
- riscos
- estratégia de testes
- critérios de sucesso

## Método

### 1. Entender o pedido
- o que precisa existir no final?
- qual problema isso resolve?
- o que está explícito e o que é hipótese?

### 2. Mapear o sistema atual
- quais módulos serão afetados?
- já existe algo parecido?
- o que pode ser reaproveitado?

### 3. Quebrar em fases
Preferir fases pequenas, entregáveis e verificáveis.
Cada etapa deve responder: ação, arquivos/módulos impactados, dependências, risco, como validar.

### 4. Ordenar
Priorizar: fundação antes de superfície, dados antes de UI dependente, contratos antes de integrações, pequenos slices que permitam teste incremental.

## Regras
- Ser específico, sem virar pseudocódigo exagerado
- Mencionar paths ou módulos quando ajudar
- Considerar edge cases e erro, não só happy path
- Evitar plano que só funciona quando tudo termina junto
- Apontar onde o plano depende de decisão do usuário

## Heurísticas
- Fase 1: menor entrega útil
- Fase 2: happy path completo
- Fase 3: edge cases, observabilidade, polimento
- Fase 4: performance ou escala, se necessário

## Quando Não Usar
- Tarefa pequena e direta, sem ambiguidade
- Bug simples onde investigar e corrigir é mais rápido que planejar
