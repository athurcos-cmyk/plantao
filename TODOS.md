# TODOS — Plantão

## Pendentes

### [ ] PWA: validar que usuários com versão antiga agora atualizam
**O quê:** Após deploy da correção (vercel.json + focus event), verificar no tablet da namorada do Arthur se o app atualiza para a versão mais recente. Abrir o app, ver se o banner de atualização aparece ou se o SW atualiza automaticamente.
**Como testar:** Após deploy, abrir o PWA instalado no tablet → verificar se o conteúdo atualizou. Se não atualizar automaticamente, fechar e abrir novamente.
**Prioridade:** CRÍTICA

---

### [ ] Testar todos os cenários de autenticação (parte 6)
**Testar amanhã para garantir que mudanças na ConfiguracoesView e auth.js não quebraram nada.**

| # | Cenário | Fluxo | Resultado esperado |
|---|---------|-------|--------------------|
| 1 | **Registro email+senha → Configurações** | Criar conta nova, ir em Perfil > Configurações | Ver "Email e senha" como método ativo, Google como "Não vinculado" |
| 2 | **Registro email+senha → Vincular Google** | Criar conta, ir em Configurações, clicar "+ Adicionar login com Google" | Google aparece como método ativo ao lado de Email e senha |
| 3 | **Google → Configurações** | Login com Google, ir em Configurações | Ver "Google" como método ativo, sem opção de senha |
| 4 | **Google → Criar senha** | Login com Google, ir em Configurações, clicar "+ Criar senha", preencher email+senha | Email e senha aparece como ativo ao lado do Google |
| 5 | **Google com email já cadastrado (senha)** | 1) Criar conta email+senha com X@email.com. 2) Logout. 3) Tentar login Google com X@email.com | Erro: "X@email.com já possui cadastro com senha. Faça login com email e senha, depois vincule o Google nas Configurações." |
| 6 | **Google com email DIFERENTE do email da conta** | 1) Criar conta email+senha com A@email.com. 2) Configurações > Vincular Google com B@email.com. 3) Ambos métodos ativos. 4) Logout. 5) Login Google com B@email.com | Login normal com Google (B), mesma conta syncCode, ambos provedores ativos |
| 7 | **PWA update banner** | Estando no app, publicar nova versão (build+deploy), voltar ao app | Banner "Nova versão disponível" aparece (não recarrega sozinho). Clicar "Atualizar" executa `updateSW()`. |
| 8 | **Notas Livres — tema claro** | Mudar tema para claro, abrir Notas Livres | Header do Notas Livres acompanha o tema (fundo e borda não ficam com cor fixa escura) |
| 9 | **providerData vazio (edge case)** | Simular usuário sem providerData (ex: migração antiga), acessar Configurações | Fallback seguro: assume email+senha como método padrão, não quebra |
| 10 | **Delete conta + recadastro Google** | Deletar conta, tentar recadastrar com mesmo Google | Cria nova conta normalmente (sem conflito de uid_map deletado) |

**Prioridade:** Alta — testar antes de qualquer outro trabalho.
**Commit da mudança:** `bff9280`
**Risco:** Baixo (só UI + error handling, sem alteração de dados ou rotas)

---

### [ ] Terminologia clínica: limpeza asséptica vs antisséptica (P2)
**O quê:** Enfermeira amiga do Arthur validou que o módulo de curativo precisa de distinção clara entre limpeza asséptica (SF 0,9%) e antisséptica (PHMB, hipoclorito). Texto gerado deveria refletir isso automaticamente conforme a solução escolhida.
**Prioridade:** P2

---

### [ ] Paywall Stripe Checkout (após validação)
**O quê:** 45 dias gratuitos → R$14,99/mês. Stripe Checkout (sem UI customizada).
**Depende de:** Validação de disposição a pagar com usuários reais.
**Prioridade:** P1

---

### [ ] Verificação domínio Firebase para email de reset (P2)
**O quê:** Aguardar propagação dos registros DNS para o Firebase Auth usar plantao.net como remetente no email de reset de senha.
**Por quê:** Atualmente o reset sai de `noreply@anotacao-hc.firebaseapp.com` — confuso para o usuário.
**Prioridade:** P2

---

### [ ] Modo de Local de Trabalho — UPA/UBS/Clínicas (P2)
**O quê:** Adaptar terminologia do app para funcionar em UPA, UBS e clínicas, não só hospitais.
**Por quê:** Mercado endereçável ~5x maior.
**Depende de:** Feedback de usuários de UPA/UBS via Pulso do App.
**Prioridade:** P2

---

### [ ] Resend Batch API para broadcast em escala (P3)
**O quê:** Quando base crescer para 50+ usuários, substituir envio sequencial por `/emails/batch` do Resend (até 100 por request).
**Prioridade:** P3

---

### [ ] Board colaborativo (P3)
**O quê:** Avaliar funcionalidade colaborativa (múltiplos técnicos, mesmo plantão).
**Quando revisar:** Se clínicas pequenas pedirem explicitamente via Pulso do App.
**Prioridade:** P3

---

## Concluídos

### [x] Botão de broadcast acessível no admin (2026-04-28)
- 📢 já está no header do admin (linha 18), sempre visível. Fechado após verificação.

---

### [x] Verificação domínio Firebase para email de reset (2026-04-28)
- Configurado no painel do Firebase Console por Arthur.

---

### [x] Métricas de anotações no painel admin (2026-04-28)
- **Verificado:** `RESEND_API_KEY` configurada no Vercel — endpoint `/api/welcome` retorna `401` (passou na checagem da chave, barrou no auth), confirmando emails transacionais operacionais

---

### [x] Métricas de anotações no painel admin (2026-04-28)
- `total_anotacoes` incrementado por usuário em `anotacoes.js:201` e somado no backend. `ativos7d` calculado de `ultimo_acesso`. AdminView exibe na tab Métricas + barra compacta + gráficos de crescimento e anotações por tipo

---

### [x] Deep sweep de temas: tokens dinamicos + guia (2026-04-26)
- `useTheme.js` passou a concentrar tambem tokens de contraste e elevacao por tema (`--text`, `--text-on-accent`, `--shadow-sm/md/lg/modal`)
- `style.css` deixou de carregar sombras fixas no `:root` (sombras agora variam por tema)
- Hardcodes de cores/sombras removidos de componentes compartilhados criticos e de modulos de anotacao prioritarios
- Criado `THEME_GUIDE.md` na raiz com dicionario oficial de variaveis e regra anti-hardcode

---

### [x] Varredura hardcoded de cores para temas claros (2026-04-25)
- Removidos hardcodes de texto (`#fff`, `#eef4ff`, `#f5f8ff`, `#a6c4d8`, `#d9ecfb`) em views/components e substituidos por tokens de tipografia
- Criado token `--text-on-accent` e aplicado nos botões/chips com fundo semântico (`--blue`, `--success`, `--danger`)
- Validação final com busca global e linter sem pendências

---

### [x] Corrigir hardcolor azul em Historico e Anotacao Inicial (2026-04-25)
- `HistoricoView.vue` deixou de depender de tons azuis fixos
- `AnotacaoInicialView.vue` ganhou camada de unificação de tema
- Build validado com sucesso

---

### [x] Calculadora, Historico e Organizador no padrao premium (2026-04-25)
- Calculadora movida para o rodape fixo com visual premium
- `Historico` alargado para desktop com icones ilustrados
- `Organizador` com hero, cards de resumo e progresso
- Grade mobile da dashboard fechada

---

### [x] Fechamento visual dos cards principais de anotação (2026-04-25)
Todos os cards principais (`Sinais Vitais`, `Medicacao`, `Notas Livres`, `Passagem de Plantao`, `Encaminhamento`, `Higienizacao/Banho`, `Curativos`, `Anotacao Inicial`) consolidados no padrão premium navy/azul.

---

### [x] Padronização visual: progress bars e chips (2026-04-27)
Barras de progresso com gradiente `blue-dark→blue` e glow azul consistente. Chips `chip-on` padronizados com `linear-gradient(180deg)` + `box-shadow` azul em todas as views. `Curativos` migrado do verde para o padrão navy/azul.

---

### [x] Diversos (2026-03-21 até 2026-04-01)
- Firebase Auth completo (email/senha + Google)
- Migração OneSignal → FCM nativo
- Exclusão de conta robusta + proteção anti-re-cadastro Google
- Blindagem do sistema de notificações (3 camadas)
- Admin dashboard completo (tabs, broadcast, monitor)
- Correções legais LGPD + linguagem inclusiva
- Landing page reescrita, domínio plantao.net
- Sistema de emails transacionais (welcome, feedback, day3, goodbye)
- Fix dispositivos sumiam após "Nova anotação"
- Exclusão otimista de pacientes e pendências
- DESIGN.md formal, tokens CSS, calculadora de diluição
- Lançamento público (Instagram, WhatsApp, Facebook)
