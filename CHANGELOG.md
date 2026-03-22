# Changelog — Plantão

## O que é o app

**Plantão** é um PWA de anotações de enfermagem para uso no celular durante plantão hospitalar. Gera textos formatados prontos para copiar no sistema do hospital. Funciona offline, sincroniza via Firebase Realtime Database, e pode ser instalado como app no celular sem precisar de loja de aplicativos.

---

## Estado atual — Março 2026

### Funcionalidades completas

**Autenticação**
- Sistema próprio com syncCode (mín. 6 caracteres) + PIN (6 dígitos, SHA-256)
- Sessão de 30 dias no localStorage
- Sem Firebase Auth — syncCode é a chave raiz no Firebase

**Anotações**
- Avaliação inicial (dispositivos, posição, neuro, resp, eliminações)
- Sinais vitais (PA, FC, FR, SpO2, Tax, HGT, DOR com escala 0-10 colorida + conduta)
- Medicação (múltiplos meds, autocomplete, dupla checagem, vias: VO/EV/SC/IM/SNE/OFT/DERM/Sublingual/Recusa — dose opcional para DERM)
- Encaminhamento (IDA/RETORNO, destinos personalizados)
- Banho (aspersão/leito/fralda — higienes: Capilar, Facial, Corporal, Íntima, Oral)
- Curativo (avaliação COREN colapsável: tipo lesão, tamanho, leito+Outro, exsudato, perilesão+Outro, bordas; locais e materiais persistidos no Firebase ou temporários)
- Passagem de plantão
- Intercorrência / Livre

**Validação de formulários**
- Apenas nome do paciente é obrigatório em todas as anotações
- Todos os outros campos são opcionais — o enfermeiro preenche o que for relevante

**Pacientes**
- Cadastro com nome e leito
- Pendências com horário e notificação agendada

**Notificações (FCM completo)**
- Funciona com app aberto, em segundo plano e completamente fechado
- Arquitetura: localStorage + setInterval (fallback) + Firebase + cron-job.org + FCM
- cron-job.org chama /api/cron a cada minuto → Firebase Admin → FCM → dispositivo
- Aviso 30min antes + notificação no horário exato

**Organizador**
- Template de plantão
- Tarefas do plantão atual
- Planejamento do próximo plantão

**PWA**
- Banner de instalação ("Instalar o app")
- Banner de atualização disponível ("Atualizar")
- Funciona 100% offline (service worker Workbox)
- Sincronização automática quando volta online

**Assistente Clara (IA)**
- Powered by Groq — Llama 3.3 70B (gratuito)
- Persona restrita a enfermagem
- Ajuda a redigir anotações no formato correto do app
- Chips de atalho para situações comuns do plantão
- Disclaimer: "Clara é uma IA — verifique as respostas"
- API key segura no Vercel, nunca exposta no cliente

**Feedback**
- Usuários podem enviar feedback pelo app
- Regra Firebase corretamente configurada para gravação

---

## Firebase — estrutura atual

```
usuarios/{syncCode}/                             pin hash, nome, criadoEm
anotacoes/{syncCode}/                            anotações gerais
anotacoes_hc/{syncCode}/                         anotações HC
pacientes/{syncCode}/                            pacientes e pendências
organizador/{syncCode}/                          template, plantão
encaminhamento/{syncCode}/                       encaminhamentos
livres/{syncCode}/                               anotações livres
curativo/{syncCode}/                             curativos
curativo/{syncCode}/locais/                      locais customizados
curativo/{syncCode}/materiais/                   materiais customizados
fcm_tokens/{syncCode}/                           token FCM do dispositivo
notificacoes_agendadas/{syncCode}/               notificações pendentes de envio
feedback/{syncCode}/                             feedbacks dos usuários
```

---

## Infraestrutura

- **Vercel** (Hobby) — deploy automático via GitHub (main)
- **cron-job.org** — chama /api/cron a cada minuto (gratuito, sem limitação Hobby)
- **Firebase** — Realtime Database (plano Spark gratuito)
- **Groq** — Llama 3.3 70B, gratuito, 14.400 req/dia

---

## Histórico de sessões

### Mar 2026 — Conformidade COREN-SP 2022 + melhorias UX
- **CurativoView**: seção "Avaliação da lesão" colapsável (▼/▲) com campos COREN: tipo de lesão, tamanho em cm, leito da ferida (chips + "Outro" livre), exsudato (quantidade + aspecto), pele perilesão (chips + "outro" livre), bordas
- **CurativoView**: locais agora funcionam igual a materiais — botão "Salvar no banco de dados" ou "Só nesta anotação"
- **CurativoView**: Firebase subcoleções `curativo/{syncCode}/locais/` e `curativo/{syncCode}/materiais/`
- **CurativoView**: removidos Papaína gel 2% e Clorexidina aquosa dos materiais padrão; corrigido "purolento" → "purulento"
- **SinaisVitaisView**: escala de dor 0-10 com chips coloridos (0–3 neutro, 4–6 laranja, 7–10 vermelho) + conduta (comunicou enfermeira, medicou, reavaliou)
- **SinaisVitaisView**: CSS `btn-icon` scoped adicionado (botão voltar estava sem estilo)
- Leitura completa do COREN-SP 2022 (págs. 33–59) para alinhamento dos campos obrigatórios

### Mar 2026 — UX: Clara + landing + UX geral
- **Removido** banner "Pronto para começar?" do dashboard — UX desnecessária
- **Removidos** confetes ao copiar primeira anotação
- **Removida** obrigatoriedade de todos os campos exceto nome do paciente (em todas as 8 views de anotação + modais)
- **Corrigida** regra de segurança do Firebase: path `feedback` estava ausente, causando silencioso bloqueio de escrita
- **Corrigida** proteção `crypto.subtle` em contexto HTTP — erro explícito no login em vez de falha silenciosa

### Mar 2026 — Sessão estendida + onboarding
- Sessão estendida de 20h para 30 dias no localStorage
- Clara restrita a Intercorrência, banner de onboarding e bug de `ref` no template corrigidos

### Mar 2026 — Auditoria e polish de design
- Corrigido bug crítico: `router.push('/login')` causava tela azul/branca no iPhone no onboarding → corrigido para `router.push({ name: 'login' })`
- Banner de "Nova versão disponível" agora só aparece no dashboard, não durante login/onboarding
- Botão "Continuar no PC mesmo assim" (PcView) com touch target correto: min-height 44px (era 33px)
- Cores hardcoded #e57373/#ef9a9a no aviso de PIN substituídas por `var(--warning)`
- Emoji de foguete 🚀 substituído por ✓ no último slide do onboarding
- Dots de progresso do onboarding: visibilidade melhorada (`--text-muted` em vez de `--border`)
- SVG herda font-family do body — corrige fonte Times New Roman em alguns browsers

### Mar 2026 — Sessão anterior
- Corrigido bug crítico no api/cron.js (variável não declarada impedia envio FCM)
- Migrado cron do Vercel (plano Hobby não suporta `* * * * *`) para cron-job.org
- Implementado assistente Clara com Groq Llama 3.3 70B
- Dose opcional para via DERM corrigida no card da lista de medicamentos

### Mar 2026 — Sessões anteriores
- FCM completo implementado (notificações com app fechado no Android)
- Banner PWA de instalação e de atualização disponível
- Sistema de notificações agendadas (30min antes + horário exato)
- Offline-first com sincronização automática
- Rollback executado após integração Gemini quebrar notificações (outro AI)
