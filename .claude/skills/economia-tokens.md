---
name: economia-tokens
description: Regras de comportamento para reduzir consumo de tokens sem perder qualidade. Ativar em todas as sessões automaticamente.
---

# Economia de tokens

## Antes de agir

- Ler apenas os arquivos necessários para a tarefa — não ler o projeto inteiro
- Se a tarefa afeta 1 arquivo, ler só esse arquivo
- Perguntar se houver ambiguidade antes de executar — não tentar adivinhar e corrigir depois

## Ao editar código

- Fazer edições cirúrgicas — nunca reescrever um arquivo inteiro para mudar 3 linhas
- Usar str_replace para substituições pontuais
- Não reescrever código que já funciona para "melhorar" sem pedido explícito
- Não adicionar comentários desnecessários em código já claro

## Ao responder

- Ser direto — não repetir o que o usuário acabou de dizer
- Não confirmar o óbvio ("Entendido! Vou agora fazer...")
- Não listar o que foi feito depois de fazer — o usuário pode ver
- Se der erro, explicar o problema e a solução em uma mensagem só

## Verificação antes de screenshots

- Usar `preview_snapshot`, `preview_console_logs` e `preview_eval` primeiro
- Screenshot só quando for impossível verificar de outro jeito
- Nunca tirar print só para confirmar algo que o código já garante

## Sessões longas

- Se a conversa estiver longa, resumir o contexto relevante antes de continuar
- Não carregar arquivos de memória que não sejam necessários para a tarefa atual
- Preferir tarefas menores e incrementais a blocos grandes de mudança
- Na mesma sessão, não reler arquivo que já foi lido — usar o que está no contexto
