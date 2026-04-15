---
name: Plantão - Status do projeto (Codex)
description: Status do app, alertas operacionais, pendências técnicas e contexto de negócio
type: project
updated: 2026-04-15
---

## Status geral

Plantão está em produção em `plantao.net` e o produto já passou da fase de construção básica.
O foco mais recente registrado no material de contexto foi distribuição, feedback real de usuários e preparação para monetização futura.

Último número explicitamente registrado no contexto do projeto, em 2026-04-01:
- 12 usuários cadastrados
- 88 vagas restantes dentro da oferta inicial de 100 vagas

Esse número não deve ser tratado como dado em tempo real sem nova verificação.

## Direção de negócio

- Lançamento público já aconteceu
- Estratégia atual registrada: preencher as 100 vagas gratuitas, medir uso real e só depois ligar paywall
- Modelo desejado continua sendo mensal, sem plano anual
- B2B hospitalar foi descartado no curto prazo
- A principal tese do produto continua sendo mobilidade offline em ambiente hospitalar caótico

Design doc estratégico mais recente conhecido:
`C:\Users\Thurcos\.gstack\projects\athurcos-cmyk-plantao\Thurcos-main-design-20260326-gtm.md`

## Features prontas

- Anotação Inicial com dispositivos, campos configuráveis e fluxo de poltrona
- Sinais Vitais com dor 0-10 e conduta
- Medicação com múltiplos itens, autocomplete e dupla checagem
- Encaminhamento com destinos customizados
- Banho com higiene multi-add e item Outro
- Curativo com avaliação COREN, locais/materiais no Firebase e referência expandida
- Passagem de Plantão com `useDispositivos.js`, decúbito e débito urinário
- Intercorrência/Livre com modelos salvos
- Histórico, pacientes, organizador e dashboard
- Admin dashboard com tabs, broadcast e monitor
- Calculadora de medicação com testes Vitest
- Clara via Groq
- Emails transacionais via Resend
- PWA offline-first instalável

## Estado técnico atual confirmado no código

- Autenticação principal é Firebase Auth, não o fluxo legado de PIN isolado
- Login rápido por código existe, mas passa pelo endpoint `/api/login-by-code` e fecha com `signInWithCustomToken`
- `syncCode` é a chave funcional do usuário no Realtime DB
- Há 11 endpoints em `api/`
- Realtime Database continua sendo a base principal de dados
- Sync automático do app foi enxugado para evitar polling contínuo sem pendências
- Permissão de notificação agora é pedida no momento de definir horário em pendência, não mais no login
- Chat da Clara foi otimizado para enviar menos histórico bruto por requisição
- Build web agora usa code-splitting mais agressivo, com chunks separados para Vue, Router, Pinia e módulos do Firebase
- Registro FCM e componentes auxiliares do shell foram movidos para carregamento sob demanda, reduzindo o custo do bootstrap

## Alertas operacionais

- `cron-job.org` pode desligar o job após falhas HTTP seguidas
- Push do FCM precisa ser `data-only`
- Em Android, latência de push com app fechado pode vir da entrega do FCM e não de bug local
- `useDispositivos.js` não tolera troca da referência do array; limpar com `splice(0)`
- `CRON_SECRET` precisa ser rotacionado no ambiente e no cron externo
- `config/total_usuarios` depende do sync correto com `api/init-counter.js` se houver reset de base

## Pendentes técnicos e de produto

- [ ] Rotacionar `CRON_SECRET` no Vercel e no cron-job.org
- [ ] Validar resultados reais da divulgação e retenção dos usuários públicos
- [ ] Implementar paywall mensal só depois de sinais fortes de uso recorrente
- [ ] Avaliar Resend Batch API quando a base crescer
- [ ] Revisar qualquer documentação antiga que ainda descreva auth legado

## Conformidade e posicionamento

- Docs legais foram revisados para LGPD
- Linguagem inclusiva já foi ajustada para "profissional de enfermagem"
- Clara precisa continuar com disclaimer explícito de IA
- O app não substitui julgamento clínico e isso deve permanecer claro em UI e documentação
