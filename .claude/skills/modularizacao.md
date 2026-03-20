---
name: modularizacao
description: Ativar quando um arquivo Vue, JS ou composable ultrapassar 300 linhas, ou quando o usuário pedir para organizar, dividir ou refatorar estrutura de arquivos.
---

# Modularização — Plantão

## Limite por arquivo
- Views: máximo 300 linhas
- Composables: máximo 150 linhas
- Stores Pinia: máximo 200 linhas
- Arquivos utilitários: máximo 100 linhas

Se ultrapassar, dividir antes de continuar.

## Como dividir uma View grande

Identificar blocos candidatos a extração:
- Seção com lógica própria → novo composable em `src/composables/`
- Bloco de template repetido → novo componente em `src/components/`
- Grupo de funções utilitárias → arquivo em `src/utils/`
- Constantes e configurações → arquivo em `src/config/`

## Ordem de extração

1. Extrair lógica para composables primeiro
2. Extrair componentes de UI depois
3. Nunca extrair só para diminuir linhas — extração deve fazer sentido semântico

## Padrão de composable

```js
// src/composables/useNomeDoComposable.js
import { ref, reactive } from 'vue'

export function useNomeDoComposable() {
  // estado
  // funções
  // return só o que a View precisa
  return { }
}
```

## Regras

- Imports sempre com extensão `.js` explícita
- Um composable por responsabilidade — não agrupar coisas não relacionadas
- Se um composable passou de 150 linhas, ele tem responsabilidade demais
- Ao extrair, verificar se o arquivo original ficou menor que 300 linhas

## Antes de criar arquivo novo

Verificar se já existe composable ou utilitário que poderia receber a lógica.
Não criar arquivo novo quando uma função encaixa num existente.
