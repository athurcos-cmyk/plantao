# Revisão de Segurança

Use quando o usuário estiver criando ou alterando rotas, auth, storage, formulários, arquivos, webhooks, billing ou qualquer fluxo com risco de segurança.

## Foco
- Segredos e credenciais
- Validação de input
- Auth e authz
- Exposição de dados sensíveis
- Rate limiting
- Uploads
- Endpoints e webhooks
- Integrações externas
- Armazenamento e transporte de dados

## Checklist Base

### Secrets
- Sem chave hardcoded
- Usar env vars
- Falhar se secret crítico estiver ausente

### Input
- Validar tudo na fronteira
- Usar schema quando possível
- Whitelist, não blacklist

### Auth / Authz
- Distinguir autenticação de autorização
- Checar permissão antes de ação sensível
- Não confiar em estado do cliente

### Dados
- Não logar segredo, token, senha ou dado sensível bruto
- Não devolver stack trace ou erro interno ao cliente
- Limitar exposição de payload

### Endpoints
- Validar método HTTP
- Validar origem e assinatura quando necessário
- Rate limit em rota pública ou cara

### Uploads
- Limitar tamanho
- Limitar tipo
- Desconfiar de nome/extensão

## Como Responder
Quando revisar código ou plano, devolver:
- Riscos críticos
- Riscos médios
- O que já está bom
- Mitigações recomendadas
- Lacunas de verificação

Se possível, apontar: vetor de ataque plausível, impacto, correção mínima segura.

## Regras
- Privilegiar proteção simples e robusta
- Não assumir que backend ou framework já cobre tudo
- Não aprovar fluxo sensível sem verificar authz
- Marcar explicitamente quando algo depende de configuração externa

## Quando Não Usar
- Mudanças puramente visuais sem entrada de usuário nem integração
- Tarefas totalmente locais e sem superfície de risco relevante
