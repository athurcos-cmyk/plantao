# Modularização — Divisão de Arquivos e Responsabilidades

Use quando o usuário pedir para organizar código, dividir arquivos, extrair lógica, reduzir acoplamento ou quando um arquivo grande estiver difícil de manter, testar ou entender.

## Sinais de Que Vale Modularizar
- Arquivo grande demais para leitura rápida
- Responsabilidades misturadas
- UI e lógica fortemente embaralhadas
- Função ou módulo com muitos motivos para mudar
- Dificuldade de testar partes isoladas
- Repetição estrutural aparecendo em vários lugares

## Estratégia

### 1. Encontrar blocos semânticos
- Lógica de estado ou fluxo → hook/composable/service
- Template ou trecho visual repetido → componente
- Transformação pura → utilitário
- Constantes e configuração → arquivo próprio

### 2. Extrair na ordem certa
1. Lógica primeiro
2. UI repetida depois
3. Utilidades por último

### 3. Manter contrato claro
Ao extrair: retornar só o necessário, reduzir dependência do módulo original, evitar criar módulo "caixa de bagunça"

## Regras
- Não extrair só para diminuir linhas
- Não criar arquivo novo se a lógica ainda for coesa
- Não juntar coisas não relacionadas no mesmo módulo "helper"
- Preferir nomes que revelem responsabilidade
- Verificar se o arquivo original ficou mais simples de verdade

## Heurísticas por Tipo
- Componente/view: separar quando mistura layout, estado, efeitos e integrações demais
- Hook/composable: separar quando uma rotina tem vida própria e pode ser testada
- Store: separar quando há domínios diferentes no mesmo estado global
- Utilitário: separar quando a lógica é pura e reaproveitável

## Resultado Esperado
Depois da modularização, deve ficar mais claro: onde editar cada coisa, como testar cada parte, qual módulo contém a regra de negócio, o que é UI e o que é infraestrutura.
