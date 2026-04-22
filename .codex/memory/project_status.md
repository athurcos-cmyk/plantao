---
name: Plantao - Status do projeto (Codex)
description: Status do app, alertas operacionais, pendencias tecnicas e contexto de negocio
type: project
updated: 2026-04-21
---

## Status geral

Plantao esta em producao em `plantao.net` e o produto ja passou da fase de construcao basica.
O foco atual e melhorar velocidade operacional no plantao, reduzir atrito mobile e aprender com uso real antes de monetizar.

Ultimo numero explicitamente registrado no contexto do projeto, em 2026-04-01:
- 12 usuarios cadastrados
- 88 vagas restantes dentro da oferta inicial de 100 vagas

Esse numero nao deve ser tratado como dado em tempo real sem nova verificacao.

## Direcao de negocio

- Lancamento publico ja aconteceu
- Estrategia registrada: preencher as 100 vagas gratuitas, medir uso real e so depois ligar paywall
- Modelo desejado continua sendo mensal, sem plano anual
- B2B hospitalar foi descartado no curto prazo
- A principal tese do produto continua sendo mobilidade offline em ambiente hospitalar caotico

Design doc estrategico mais recente conhecido:
`C:\Users\Thurcos\.gstack\projects\athurcos-cmyk-plantao\Thurcos-main-design-20260326-gtm.md`

## Features prontas

- Anotacao Inicial com dispositivos, campos configuraveis e fluxo de poltrona
- Sinais Vitais com dor 0-10 e conduta
- Medicacao com multiplos itens, autocomplete detalhado, historico robusto, presets rapidos, `Salvar e adicionar proxima` e dupla checagem
- Tela de medicacao mantida em formato mais enxuto e operacional, depois de validar que excesso de resumo e microcopy piorava o uso no plantao real
- Encaminhamento com destinos customizados
- Banho com higiene multi-add e item Outro
- Curativo com avaliacao COREN, locais/materiais no Firebase e referencia expandida
- Passagem de Plantao com `useDispositivos.js`, decubito e debito urinario
- Intercorrencia/Livre com modelos salvos
- Historico, pacientes, organizador e dashboard
- Admin dashboard com tabs, broadcast e monitor
- Calculadora de medicacao com testes Vitest
- Clara via Groq
- Emails transacionais via Resend
- PWA offline-first instalavel

## Estado tecnico atual confirmado no codigo

- Autenticacao principal e Firebase Auth, nao o fluxo legado de PIN isolado
- Login rapido por codigo existe, mas passa pelo endpoint `/api/login-by-code` e fecha com `signInWithCustomToken`
- `syncCode` e a chave funcional do usuario no Realtime DB
- Ha 11 endpoints em `api/`
- Realtime Database continua sendo a base principal de dados
- Sync automatico do app foi enxugado para evitar polling continuo sem pendencias
- Permissao de notificacao agora e pedida no momento de definir horario em pendencia, nao mais no login
- Chat da Clara foi otimizado para enviar menos historico bruto por requisicao
- Build web usa code-splitting mais agressivo, com chunks separados para Vue, Router, Pinia e modulos do Firebase
- Registro FCM e componentes auxiliares do shell foram movidos para carregamento sob demanda
- Bootstrap inicial de autenticacao agora sobe com cache local de sessao e timeout de fallback, reduzindo risco de tela azul em rede fraca
- Historico da tela de medicacao agora mescla local + Firebase, com deduplicacao por esquema completo para reduzir sumicos e duplicacoes
- `src/data/medicamentos.js` agora funciona como catalogo enriquecido de sugestoes com vias, doses e alguns esquemas EV comuns
- A tela de medicacao passou a oferecer quick add por historico/preset e fluxo `Salvar e adicionar proxima` para montar o horario com menos toques
- A mesma tela foi reajustada depois do uso real: remover resumo, estados obvios e textos explicativos trouxe a experiencia de volta para um fluxo mais rapido
- O template reaproveitavel de medicacao passou a manter tambem dados de lote, sem transformar lote diferente em chave nova do historico

## Alertas operacionais

- `cron-job.org` pode desligar o job apos falhas HTTP seguidas
- Push do FCM precisa ser `data-only`
- Em Android, latencia de push com app fechado pode vir da entrega do FCM e nao de bug local
- `useDispositivos.js` nao tolera troca da referencia do array; limpar com `splice(0)`
- Offline real continua dependendo de o PWA ja ter sido carregado online ao menos uma vez para cachear assets
- `CRON_SECRET` precisa ser rotacionado no ambiente e no cron externo
- `config/total_usuarios` depende do sync correto com `api/init-counter.js` se houver reset de base

## Pendentes tecnicos e de produto

- [ ] Rotacionar `CRON_SECRET` no Vercel e no cron-job.org
- [ ] Validar resultados reais da divulgacao e retencao dos usuarios publicos
- [ ] Implementar paywall mensal so depois de sinais fortes de uso recorrente
- [ ] Avaliar Resend Batch API quando a base crescer
- [ ] Revisar qualquer documentacao antiga que ainda descreva auth legado

## Conformidade e posicionamento

- Docs legais foram revisados para LGPD
- Linguagem inclusiva ja foi ajustada para "profissional de enfermagem"
- Clara precisa continuar com disclaimer explicito de IA
- O app nao substitui julgamento clinico e isso deve permanecer claro em UI e documentacao
