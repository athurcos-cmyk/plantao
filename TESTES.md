# Plano de Testes — Plantão App

> Versão do app: 0.5.0
> Última atualização: 2026-03-14
> Usuário de teste automatizado: **TESTE1** / PIN **1234**

---

## Legenda

- `[x]` — passou (manual ou automatizado)
- `[ ]` — a testar
- `[!]` — falhou / bug encontrado
- `[A]` — coberto por teste automatizado (Playwright)

---

## Como rodar os testes

```bash
# Inicie o servidor de desenvolvimento em outro terminal
npm run dev

# Rode todos os testes
npm test

# Rode um módulo específico
npm run test:auth
npm run test:med
npm run test:anotacao

# Interface visual (recomendado para debug)
npm run test:ui

# Relatório HTML dos resultados
npm run test:report
```

> **Importante**: o primeiro `npm test` cria automaticamente o usuário TESTE1 no Firebase.

---

## 1. AUTENTICAÇÃO

### 1.1 Validação do campo de código
- [x][A] Botão "Continuar" desabilitado com campo vazio
- [x][A] Botão "Continuar" desabilitado com menos de 3 caracteres
- [x][A] Código é automaticamente convertido para maiúsculas
- [x][A] Código com mais de 6 caracteres é truncado
- [x]    Código com 3–6 caracteres → botão habilitado após check do Firebase
- [x]    Código novo → exibe destaque "Primeira vez aqui!"
- [x]    Código existente → exibe destaque "Bem-vindo de volta!"

### 1.2 Login — Usuário existente (TESTE1)
- [x][A] Código existente exibe destaque "Bem-vindo de volta"
- [x][A] PIN com menos de 4 dígitos → botão desabilitado
- [x][A] PIN incorreto → exibe mensagem de erro, não redireciona
- [x][A] PIN correto → redireciona para o Dashboard
- [x]    Botão "Voltar" no passo 2 retorna para passo 1

### 1.3 Cadastro — Novo usuário
- [x]    Código disponível → passo 2 com título "Crie seu PIN"
- [x]    Passo 2 (cadastro) → avança para passo 3 (nome) com PIN de 4 dígitos
- [x]    Passo 3 → botão "Criar conta e entrar" funciona (nome opcional)
- [x]    Após cadastro → redireciona para Dashboard exibindo o nome cadastrado
- [x]    Botão "Voltar" no passo 3 retorna para passo 2

### 1.4 Sessão e persistência
- [x][A] Sessão persiste após reload da página
- [x][A] Acesso direto a `/dashboard` sem login redireciona para login
- [x][A] Botão "Sair da conta" desloga, limpa localStorage e redireciona

---

## 2. DASHBOARD

- [x][A] Saudação exibe hora correta (Bom dia / Boa tarde / Boa noite)
- [x][A] Saudação exibe nome do usuário
- [x][A] Card "Anotação inicial" navega para `/anotar/inicial`
- [x][A] Card "Medicação" navega para `/anotar/medicacao`
- [x][A] Cards "Em breve" disparam alerta e não navegam
- [x][A] Ícone relógio navega para `/historico`
- [x][A] Botão "Ver histórico" navega para `/historico`
- [x][A] Botão "Sair da conta" desloga e limpa localStorage

---

## 3. ANOTAÇÃO INICIAL (5 Blocos)

### 3.1 Bloco 1 — Dados gerais / cama
- [x][A] Campo horário visível
- [x][A] Botão "Próximo" bloqueado sem horário e sexo
- [x][A] Botão "Próximo" bloqueado só com horário (falta sexo)
- [x][A] Avança para bloco 2 com horário + sexo preenchidos
- [x][A] Botão "Limpar" reseta campos do bloco
- [x]    Campos de posição cama, rodas, grades, decúbito funcionam

### 3.2 Bloco 2 — Neurológico / Respiratório / Acompanhante
- [x][A] Campos neurológicos e respiratórios visíveis
- [x][A] Campo "nome do acompanhante" aparece ao marcar "sim"
- [x][A] Campo "litros de O2" aparece ao selecionar O2 suplementar
- [x]    Estado mental alterado → exibe campo de descrição
- [x]    Opções de deambulação funcionam (leito, cadeira, deambula)

### 3.3 Bloco 3 — Dispositivos
- [x][A] Botões de tipo de dispositivo aparecem
- [x]    Clicar em um tipo abre o modal de dispositivo
- [x]    Dispositivo adicionado aparece na lista com nome correto
- [x]    Botões mover ▲▼ reordenam os dispositivos
- [x]    Botão ✕ remove o dispositivo da lista

### 3.4 Bloco 4 — Eliminações
- [x][A] Campos de evacuação e diurese visíveis
- [x]    Seleção de evacuação (presente/ausente/ostomia) funciona
- [x]    Campo data de última evacuação aparece quando relevante
- [x]    Opções de diurese (espontânea, SVD, cateter) funcionam
- [x]    Campo débito e aspecto da SVD aparecem ao selecionar SVD

### 3.5 Bloco 5 — Gerar Anotação
- [x][A] Botão "Gerar anotação" visível
- [x][A] Após gerar: botões "Copiar" e "Salvar" visíveis
- [x][A] Texto gerado contém o horário preenchido
- [x]    Texto gerado reflete o sexo e dados preenchidos corretamente
- [ ]    Botão "Salvar no histórico" salva e redefine o formulário
- [ ]    Botão "Compartilhar" abre opções de compartilhamento

### 3.6 Rascunho automático
- [x][A] Banner de rascunho aparece ao retornar com dados preenchidos
- [x][A] Botão "Continuar" restaura o horário salvo
- [x][A] Botão "Descartar" limpa o formulário e remove o banner

---

## 4. MEDICAÇÃO

### 4.1 Interface Principal
- [ ][A] Campo horário visível na tela principal
- [ ][A] Tentativa de gerar sem horário ou medicamentos não avança para preview
- [ ]    Campos de identificação do paciente (com/do paciente) visíveis
- [ ]    Checkbox "Oriento paciente" funciona
- [ ]    Seleção de "conforme" (prescrição/orientação) funciona

### 4.2 Modal de Adição/Edição
- [ ][A] Botão "+ Adicionar medicamento" abre o modal
- [ ][A] Confirmar com formulário vazio → modal permanece aberto (erro)
- [ ][A] Autocomplete: digitar ≥ 2 caracteres exibe sugestões
- [ ][A] Digitar < 2 caracteres → dropdown de sugestões some
- [ ]    Sugestões do histórico mostram badge dose/via e preenchem tudo ao clicar
- [ ]    Sugestões genéricas preenchem apenas o nome
- [ ]    Editar um medicamento salvo abre modal com dados preenchidos
- [ ]    Remover medicamento funciona

### 4.3 Vias de Administração
- [ ][A] Via OFT exige seleção de olho (direito/esquerdo/ambos)
- [ ][A] Via EV exibe checkbox "Com diluição"
- [ ][A] EV com diluição: campos volume, solução e checkbox BIC aparecem
- [ ][A] EV BIC: campos Tempo e Velocidade aparecem
- [ ]    Vias VO / SC / IM / SNE / Sublingual: apenas dose e unidade
- [ ]    EV sem diluição: nenhum campo extra

### 4.4 Dupla Checagem
- [ ][A] Checkbox "Dupla checagem" exibe campo de nome do profissional
- [ ]    Cargo (dropdown) é opcional
- [ ]    Badge "dupla ✓" aparece no card do medicamento na lista

### 4.5 Geração e Histórico
- [ ][A] Fluxo completo VO → preview com botão "Copiar" visível
- [ ][A] Texto gerado contém horário e nome do medicamento
- [ ]    Múltiplos medicamentos no mesmo horário → gerados em uma só linha
- [ ]    Linha de dupla checagem gerada sem o prefixo do horário
- [ ]    Botão "Salvar no histórico" salva e limpa formulário
- [ ]    Histórico de medicamentos persiste entre sessões (localStorage → Firebase)

---

## 5. HISTÓRICO DE ANOTAÇÕES

### 5.1 Interface
- [ ][A] Tela de histórico carrega com campo de busca e filtros
- [ ][A] Chips de filtro por tipo aparecem (≥ 2 opções)
- [ ][A] Botão voltar retorna ao Dashboard
- [ ][A] Botão logo retorna ao Dashboard

### 5.2 Busca e Filtros
- [ ][A] Campo de busca aceita texto
- [ ][A] Limpar busca funciona
- [ ]    Filtro por tipo "Medicação" exibe apenas anotações de medicação
- [ ]    Filtro por tipo "Inicial" exibe apenas anotações iniciais
- [ ]    Busca por nome do paciente filtra corretamente

### 5.3 Ações nas Anotações
- [ ][A] Anotação salva aparece na lista
- [ ][A] Busca pelo nome do paciente encontra a anotação
- [ ][A] Botão "Copiar texto" visível nas anotações
- [ ][A] Botão "Editar" abre campos de edição (nome + leito)
- [ ][A] Editar e salvar fecha os campos de edição
- [ ][A] Botão "Excluir" abre modal de confirmação
- [ ][A] Cancelar exclusão fecha o modal sem excluir
- [ ]    Confirmar exclusão remove a anotação da lista
- [ ]    Botão "Compartilhar" abre opções de compartilhamento

---

## Arquivos de teste

| Arquivo | Módulo | Testes |
|---|---|---|
| `testes_claw/auth.spec.js` | Autenticação | ~10 |
| `testes_claw/dashboard.spec.js` | Dashboard | ~8 |
| `testes_claw/anotacao.spec.js` | Anotação Inicial | ~13 |
| `testes_claw/medicacao.spec.js` | Medicação | ~10 |
| `testes_claw/historico.spec.js` | Histórico | ~10 |
| **Total** | | **~51 automatizados** |
