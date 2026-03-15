# Plano de Testes — Plantão App

> Versão do app: 0.5.0
> Última atualização: 2026-03-14
> Testar sempre no dispositivo móvel (PWA instalado) e no navegador.

---

## Legenda

- `[x]` — passou
- `[ ]` — a testar
- `[!]` — falhou / bug encontrado

---

## 1. AUTENTICAÇÃO

### 1.1 Login — Novo usuário (cadastro)
- [x] Digitar código com menos de 3 caracteres → botões desabilitados.
- [x] Digitar código disponível → destaque "Primeira vez aqui!".
- [x] Avançar e cadastrar PIN de 4 dígitos.
- [x] Preencher Nome (opcional) e criar conta → Redireciona para Dashboard.

### 1.2 Login — Usuário existente
- [x] Digitar código existente → destaque "Bem-vindo de volta!".
- [x] Digitar PIN incorreto → exibe erro.
- [x] Digitar PIN correto → Redireciona para Dashboard.

### 1.3 Sessão e persistência
- [x] Fechar e reabrir → mantém logado.
- [x] Botão "Sair da conta" no Dashboard desloga o usuário.
- [x] Acesso direto a `/dashboard` sem login redireciona.

---

## 2. DASHBOARD

- [x] Saudação de acordo com o horário (Bom dia/Boa tarde/Boa noite) e exibe Nome.
- [x] Cards "Anotação inicial", "Medicação", etc. navegam corretamente.
- [x] Cards "em breve" disparam alerta.
- [x] Ícone de relógio e botão "Ver histórico" navegam para `/historico`.

---

## 3. ANOTAÇÃO INICIAL (Admissão / Sinais Vitais)
- [x] Barra de progresso funciona (Blocos 1 a 5).
- [x] Validação de campos obrigatórios (Horário, Sexo).
- [x] Rascunho salva automaticamente (debounce) no localStorage.
- [x] Voltar para a tela exibe banner de rascunho com opções "Continuar" e "Descartar".

---

## 4. MEDICAÇÃO (NOVA FEATURE)

### 4.1 Interface Principal
- [ ] Acessar "Medicação" via Dashboard.
- [ ] Formulário exibe campos: Horário, Identificação do paciente (com/do), Oriento paciente, Conforme (prescrição/orientação).
- [ ] Medicamentos listados aparecem em cartões com nome, detalhe de dose/via e badge de "dupla checagem" (se aplicável).
- [ ] Validação: tentar gerar texto sem horário ou sem medicamentos bloqueia com erro.

### 4.2 Modal de Adição/Edição de Medicamento
- [ ] Abrir modal "+ Adicionar medicamento".
- [ ] Tentar confirmar sem nome, via ou dose exibe erro.
- [ ] **Autocomplete**: Digitar >= 2 caracteres sugere medicamentos.
- [ ] Sugestões do histórico mostram badge com dose/via e preenchem o formulário completo ao clicar.
- [ ] Sugestões genéricas (base de dados) preenchem apenas o nome.

### 4.3 Vias de Administração
- [ ] Vias padrão (VO, SC, IM, SNE, Sublingual): exigem Dose e Unidade.
- [ ] Via **OFT (Oftálmica)**: exige quantidade, unidade fica fixa em "Gts", exige seleção de Olho (direito/esquerdo/ambos).
- [ ] Via **EV (Endovenosa)**: exibe checkbox "Com diluição".
- [ ] Via **EV s/ diluição**: Sem campos extras.
- [ ] Via **EV c/ diluição**: exige Volume (ml) e Solução (SF/SG/Água).
- [ ] **EV BIC (Bomba de Infusão)**: exibe campos Tempo (min/h) e Velocidade (ml/h). Validar que exige ao menos um dos dois.

### 4.4 Dupla Checagem
- [ ] Marcar "Dupla checagem".
- [ ] Exige nome do profissional (cargo é opcional).
- [ ] Ao salvar medicamento, badge azul "dupla ✓" aparece na listagem.

### 4.5 Geração e Histórico
- [ ] Clicar "Gerar texto" cria o preview.
- [ ] Formatação reflete medicamentos agrupados por horário e linhas de dupla checagem separadas sem o prefixo do horário.
- [ ] Botão "Copiar texto" copia para clipboard.
- [ ] Botão "Salvar no histórico" salva e reseta formulário (limpa rascunho).
- [ ] Checar persistência de Histórico de Medicamentos (localStorage -> Firebase via write-through).

---

## 5. HISTÓRICO DE ANOTAÇÕES GERAIS
- [ ] Tela de histórico lista anotações salvas (seja Inicial ou Medicação).
- [ ] Anotações podem ser expandidas ou copiadas.