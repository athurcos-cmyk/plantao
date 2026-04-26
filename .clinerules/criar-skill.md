# Criar Skill — Como Criar Novas Skills para o Cline

Guia para criar novas skills (arquivos `.md` em `.clinerules/`) que o Cline usará como instruções contextuais.

## Formato
Cada skill é um arquivo Markdown em `.clinerules/` com:
- Um título descritivo (nível 1)
- Quando usar a skill
- Instruções detalhadas
- Regras e limites
- Exemplos quando aplicável

## Estrutura Recomendada
```markdown
# Nome da Skill — Descrição Curta

Use quando [situações em que esta skill deve ser ativada].

## Objetivo
[o que esta skill deve produzir/garantir]

## Método
[passos para executar a skill]

## Regras
[limites e diretrizes]

## Quando Não Usar
[situações em que esta skill não se aplica]
```

## Boas Práticas
- Nomear o arquivo de forma clara e sem espaços (ex: `revisao-codigo.md`)
- Manter cada skill focada em uma responsabilidade
- Incluir exemplos práticos quando ajudar
- Referenciar paths de arquivos do projeto quando relevante
- Atualizar skills conforme o projeto evolui

## Onde Colocar
- Skills gerais do projeto: `c:/Users/Thurcos/Desktop/plantao/.clinerules/`
- Skills que se aplicam a subdiretórios específicos: colocar `AGENTS.md` no próprio subdiretório
