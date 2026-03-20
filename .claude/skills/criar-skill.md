---
name: criar-skill
description: Template e guia para criar novas skills para este projeto. Usar quando o usuário pedir para criar uma skill nova ou quando identificar um padrão repetitivo que merece virar skill.
---

# Como criar uma skill

## Quando criar uma skill

Criar skill quando:
- O mesmo tipo de tarefa se repete em sessões diferentes
- O agente comete o mesmo erro mais de uma vez
- Existe um padrão específico do projeto que precisa ser lembrado
- Uma ferramenta ou biblioteca tem convenções que o agente ignora

Não criar skill para:
- Coisas que acontecem uma vez só
- Preferências pessoais simples (essas vão no CLAUDE.md)
- Conhecimento geral que o modelo já tem

## Estrutura obrigatória

```markdown
---
name: nome-da-skill
description: Uma linha clara sobre quando ativar. Começa com verbo: "Ativar ao...", "Usar quando...", "Aplicar em..."
---

# Título da skill

## Quando ativar
[lista de gatilhos específicos]

## Regras
[o que fazer e o que não fazer]

## Exemplos
[exemplos concretos do projeto, não genéricos]

## Erros comuns
[o que o agente costuma errar sem essa skill]
```

## Regras do campo description

- É o que o agente lê para decidir se ativa a skill
- Deve ser específico o suficiente para não ativar à toa
- Deve cobrir os gatilhos reais: arquivos mexidos, tipo de tarefa, tecnologia envolvida

## Onde salvar

- Skill específica do Plantão: `Desktop\plantao\.claude\skills\nome.md`
- Skill global (vale pra qualquer projeto): `C:\Users\Thurcos\.claude\skills\nome.md`

## Depois de criar

Adicionar a linha `@.claude/skills/nome.md` no `CLAUDE.md` do projeto.
Testar pedindo uma tarefa que deveria ativar a skill e verificar se o comportamento mudou.
