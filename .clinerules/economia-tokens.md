# Economia de Tokens — Uso Eficiente do Contexto

Estratégias para maximizar o valor de cada interação dentro do limite de contexto.

## Princípios
- Preferir respostas diretas e acionáveis
- Incluir apenas o código relevante para a mudança, não o arquivo inteiro
- Usar `replace_in_file` com SEARCH/REPLACE preciso em vez de reescrever arquivos inteiros
- Ao listar arquivos, preferir `list_code_definition_names` para visão geral em vez de `read_file` em cada arquivo
- Agrupar operações independentes em uma única resposta

## Boas Práticas
- Para explorar: comece com `list_files` ou `search_files` antes de `read_file`
- Para editar: use `replace_in_file` com diffs mínimos
- Para múltiplas mudanças no mesmo arquivo: faça vários SEARCH/REPLACE em vez de reescrever tudo
- Prefira comandos CLI a scripts para operações simples
- Use `task_progress` para manter contexto sem repetir informações

## O que Evitar
- Ler arquivos inteiros quando só precisa de uma seção
- Incluir código não modificado em respostas
- Repetir o conteúdo de arquivos que já estão no contexto
- Explicações prolixas quando o código fala por si
