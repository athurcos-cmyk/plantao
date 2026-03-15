# Plano de Testes — Plantão App

> Versão do app: 0.8.0
> Última atualização: 2026-03-15

---

## Legenda

- `[x]` — passou
- `[ ]` — a testar
- `[!]` — falhou / bug encontrado

---

## 1. AUTENTICAÇÃO

### 1.1 Validação do campo de código
- [x] Botão "Continuar" desabilitado com campo vazio
- [x] Botão "Continuar" desabilitado com menos de 3 caracteres
- [x] Código é automaticamente convertido para maiúsculas
- [x] Código com mais de 6 caracteres é truncado (maxlength=6)
- [x] Código com 3–6 caracteres → botão habilitado após check do Firebase
- [x] Código novo → exibe destaque "Primeira vez aqui!"
- [x] Código existente → exibe destaque "Bem-vindo de volta!" (confirmado no passo 2)

### 1.2 Login — Usuário existente
- [x] Código existente exibe destaque "Bem-vindo de volta" (texto confirmado no passo 2)
- [x] PIN com menos de 4 dígitos → botão desabilitado
- [x] PIN incorreto → exibe mensagem de erro, não redireciona
- [x] PIN correto → redireciona para o Dashboard
- [x] Botão "Voltar" no passo 2 retorna para passo 1

### 1.3 Cadastro — Novo usuário
- [x] Código disponível → passo 2 com título "Crie seu PIN"
- [x] Passo 2 (cadastro) → avança para passo 3 (nome) com PIN de 4 dígitos
- [x] Passo 3 → botão "Criar conta e entrar" funciona (nome opcional)
- [x] Após cadastro → redireciona para Dashboard exibindo o nome cadastrado
- [x] Botão "Voltar" no passo 3 retorna para passo 2

### 1.4 Sessão e persistência
- [x] Sessão persiste após reload da página
- [x] Acesso direto a `/dashboard` sem login redireciona para login
- [x] Botão "Sair da conta" desloga, limpa localStorage e redireciona

---

## 2. DASHBOARD

- [x] Saudação exibe hora correta (Bom dia / Boa tarde / Boa noite)
- [x] Saudação exibe nome do usuário
- [x] Card "Anotação inicial" navega para `/anotar/inicial`
- [x] Card "Medicação" navega para `/anotar/medicacao`
- [x] Cards "Em breve" disparam alerta e não navegam
- [x] Ícone relógio navega para `/historico`
- [x] Botão "Ver histórico" navega para `/historico`
- [x] Botão "Sair da conta" desloga e limpa localStorage

---

## 3. ANOTAÇÃO INICIAL (5 Blocos)

### 3.1 Bloco 1 — Dados gerais / cama
- [x] Campo horário visível
- [x] Botão "Próximo" valida sem horário (exibe "Informe o horário")
- [x] Botão "Próximo" valida sem posição da cama (exibe "Selecione a posição da cama")
- [x] Avança para bloco 2 com todos os campos obrigatórios preenchidos
- [x] Botão "Limpar" reseta campos do bloco
- [x] Seleção visual de posição cama, rodas, grades, decúbito funciona

### 3.2 Bloco 2 — Neurológico / Respiratório / Acompanhante
- [x] Campos neurológicos e respiratórios visíveis
- [x] Estado mental alterado → exibe campo de descrição
- [x] Opções de deambulação funcionam (sozinha, com auxílio, não deambula, acamada, restrita)
- [x] "Deambula com auxílio" → campo para descrever o auxílio aparece e é obrigatório
- [x] Campo "litros de O₂" aparece ao selecionar O₂ suplementar e é obrigatório
- [x] Acompanhante SIM → campo nome obrigatório e campo parentesco obrigatório aparecem

### 3.3 Bloco 3 — Dispositivos
- [x] Botões de tipo de dispositivo aparecem (AVP, CVC, PICC, SNE, etc.)
- [x] Clicar em um tipo abre o modal de dispositivo
- [x] AVP — local + status → texto correto na lista
- [x] CVC — local + lúmens → texto correto na lista
- [x] PICC — membro + lúmens → texto correto na lista
- [x] Permcath — local → texto correto na lista
- [x] Shilley — local → texto correto na lista
- [x] SNE — narina + marcação + status + dieta (velocidade obrigatória se dieta = sim) → texto correto
- [x] SNG — narina + marcação + modo → texto correto na lista
- [x] Pulseira — membro + tipo → texto correto na lista
- [x] Monitor — tipo → texto correto na lista
- [x] Dreno — tipo (texto livre) + localização → texto correto na lista
- [x] Curativo — local (checkbox) + condição → texto correto na lista
- [x] Outros — descrição livre → texto correto na lista
- [x] Botões mover ▲▼ reordenam os dispositivos
- [x] Botão ✕ remove o dispositivo da lista

### 3.4 Bloco 4 — Eliminações
- [x] Campos de evacuação e diurese visíveis
- [x] Seleção de evacuação funciona (Hoje, Ontem, Escolher data, Não avaliado)
- [x] "Escolher data" → campo de data aparece
- [x] Opções de diurese funcionam (Fralda, Comadre, Papagaio, Banheiro, SVD, Não avaliado)
- [x] SVD → campos débito (obrigatório) e aspecto aparecem

### 3.5 Bloco 5 — Gerar Anotação
- [x] Botão "Gerar anotação" visível
- [x] Após gerar: botões "Copiar", "Salvar no histórico", "Compartilhar" e "Nova anotação" visíveis
- [x] Texto gerado contém o horário no formato correto (ex: 08h00)
- [x] Texto gerado reflete todos os dados preenchidos (decúbito, dispositivos, eliminações, etc.)
- [x] Botão "Salvar no histórico" salva e exibe toast de confirmação
- [x] Botão "Nova anotação" redefine o formulário e retorna ao bloco 1
- [x] Botão "Compartilhar" abre WhatsApp com o texto (requer interação manual)

### 3.6 Rascunho automático
- [x] Banner de rascunho aparece ao retornar com dados preenchidos
- [x] Botão "Continuar" restaura os dados salvos
- [x] Botão "Descartar" limpa o formulário e remove o banner

---

## 4. MEDICAÇÃO

### 4.1 Interface Principal
- [x] Campo horário visível na tela principal
- [x] Tentativa de gerar sem horário ou medicamentos exibe erro
- [x] Campos de identificação do paciente (com/do paciente) visíveis
- [x] Checkbox "Oriento paciente" funciona
- [x] Seleção de "conforme" (prescrição/orientação) funciona

### 4.2 Modal de Adição/Edição
- [x] Botão "+ Adicionar medicamento" abre o modal
- [x] Confirmar com formulário vazio → modal permanece aberto (erro de validação)
- [x] Autocomplete: digitar ≥ 2 caracteres exibe sugestões
- [x] Digitar < 2 caracteres → dropdown de sugestões some
- [x] Sugestões do histórico mostram badge dose/via e preenchem tudo ao clicar
- [x] Sugestões genéricas preenchem apenas o nome
- [x] Editar um medicamento salvo abre modal com dados preenchidos
- [x] Remover medicamento funciona

### 4.3 Vias de Administração
- [x] Via OFT exige seleção de olho (direito/esquerdo/ambos)
- [x] Via EV exibe checkbox "Com diluição"
- [x] EV com diluição: campos volume, solução e checkbox BIC aparecem
- [x] EV BIC: campos Tempo e Velocidade aparecem
- [x] Vias VO / SC / IM / SNE / Sublingual: apenas dose e unidade
- [x] EV sem diluição: nenhum campo extra
- [x] EV solução "Outra" exibe campo de texto livre → texto gerado usa valor digitado

### 4.6 Autocomplete — Novos medicamentos
- [x] Digitar "gli" exibe glicose 50%, 25%, 10%, 5% e hipertônica nas sugestões
- [x] Selecionar glicose do autocomplete preenche o nome corretamente

### 4.7 Lote / Validade
- [x] Checkbox "Informar lote / validade" aparece no modal
- [x] Ao ativar exibe campos: Nº do frasco (opcional), Lote, Fabricação, Validade, Marca
- [x] Campos Lote, Fabricação, Validade e Marca são obrigatórios quando ativado
- [x] Nº do frasco preenchido → texto gerado com "o N° Frasco de [medicamento]"
- [x] Bloco de lote aparece no texto gerado após a linha do medicamento

### 4.8 Recusa de Medicação
- [x] Via "Recusa" disponível na lista de vias
- [x] Ao selecionar Recusa: campos Dose/Unidade, Dupla checagem e Lote ficam ocultos
- [x] Campo "Comunicado a (Enf.)" aparece e é obrigatório
- [x] Card na lista exibe "Recusa · Enf. [nome]"
- [x] Recusa não aparece na linha "administrado" do texto gerado
- [x] Recusa gera linha separada: "Paciente recusa [med] prescrito, comunico Enf. [nome]"
- [x] Múltiplas recusas com mesmo profissional → agrupadas em uma linha (ex: "Paciente recusa omeprazol e dipirona prescrito, comunico Enf. Andre")
- [x] Recusas com profissionais diferentes → linhas separadas por profissional
- [x] Mix de med normal + recusas → administrado na primeira linha, recusas ao final

### 4.4 Dupla Checagem
- [x] Checkbox "Dupla checagem" exibe campo de nome do profissional
- [x] Cargo (dropdown) pré-selecionado com "Téc. de enfermagem"
- [x] Badge "dupla ✓" aparece no card do medicamento na lista

### 4.5 Geração e Histórico
- [x] Fluxo completo VO → preview com botão "Copiar" visível
- [x] Texto gerado contém horário e nome do medicamento corretamente
- [x] Múltiplos medicamentos no mesmo horário → gerados em uma só linha
- [x] Linha de dupla checagem gerada sem o prefixo do horário
- [x] Botão "Salvar no histórico" salva e exibe toast de confirmação
- [x] Histórico de medicamentos persiste entre sessões

---

## 5. HISTÓRICO DE ANOTAÇÕES

### 5.1 Interface
- [x] Tela de histórico carrega com campo de busca e filtros
- [x] Chips de filtro por tipo aparecem (≥ 2 opções)
- [x] Botão voltar retorna ao Dashboard
- [x] Botão logo retorna ao Dashboard

### 5.2 Busca e Filtros
- [x] Campo de busca aceita texto
- [x] Limpar busca funciona
- [x] Filtro por tipo "Medicação" exibe apenas anotações de medicação
- [x] Filtro por tipo "Inicial" exibe apenas anotações iniciais
- [x] Busca por nome do paciente filtra corretamente

### 5.3 Ações nas Anotações
- [x] Anotação salva aparece na lista
- [x] Busca pelo nome do paciente encontra a anotação
- [x] Botão "Copiar texto" funciona
- [x] Botão "Editar" abre campos de edição (nome + leito)
- [x] Editar e salvar fecha os campos de edição
- [x] Botão "Excluir" abre modal de confirmação
- [x] Cancelar exclusão fecha o modal sem excluir
- [x] Confirmar exclusão remove a anotação da lista
- [x] Botão "Compartilhar" abre opções de compartilhamento (requer interação manual)

### 5.4 Limpar Histórico
- [x] Botão "Limpar tudo" aparece ao lado da busca quando há anotações
- [x] Clicar abre modal de confirmação com contagem de anotações
- [x] Cancelar fecha modal sem apagar nada
- [x] Confirmar apaga todas as anotações do Firebase e lista fica vazia
- [x] Botão "Limpar tudo" desaparece automaticamente quando histórico está vazio

### 5.5 Filtro por Paciente Registrado
- [x] Chips de pacientes registrados aparecem abaixo dos filtros de tipo
- [x] Clicar no chip preenche o campo de busca com o nome do paciente
- [x] Clicar no chip ativo limpa o filtro (toggle)
- [x] Chips exibem leito · nome (ex: "2A · João Souza")

---

## 6. MEUS PACIENTES

### 6.1 Interface
- [x] Rota `/pacientes` carrega sem erros
- [x] Empty state com ícone 🛏️, título e botão "Adicionar paciente" quando lista vazia
- [x] Contador "X registrado(s)" no cabeçalho atualiza em tempo real
- [x] Botão voltar retorna ao Dashboard
- [x] Botão logo retorna ao Dashboard

### 6.2 Cadastro de Paciente
- [x] Clicar em "+ Adicionar paciente" abre modal
- [x] Salvar sem nome exibe erro "Informe o nome do paciente"
- [x] Salvar com nome (leito opcional) → paciente aparece na lista sincronizado via Firebase
- [x] FAB (+) aparece quando há pacientes na lista

### 6.3 Edição e Exclusão
- [x] Botão ✏️ abre modal com dados preenchidos
- [x] Editar leito → card atualiza em tempo real
- [x] Botão 🗑️ abre modal de confirmação com nome do paciente
- [x] Confirmar exclusão remove paciente e todas as pendências
- [x] Cancelar exclusão fecha modal sem remover

### 6.4 Pendências (Checklist)
- [x] Campo "Nova pendência..." visível em cada card
- [x] Digitar texto + Enter adiciona a pendência na lista do Firebase
- [x] Botão "Ok" aparece ao digitar, clicando também adiciona
- [x] Clicar no checkbox marca pendência como feita (linha riscada, opacidade reduzida)
- [x] Clicar novamente desmarca
- [x] Botão × ao lado de cada pendência exclui apenas aquela pendência

### 6.5 Ordenação e Visual
- [x] Pacientes ordenados por leito (ordem alfanumérica)
- [x] Leito exibido como badge azul no card

### 6.6 Integração — Seletor nas Anotações
- [x] Ao gerar anotação inicial (preview): chips de pacientes registrados aparecem
- [x] Clicar no chip preenche nome e leito automaticamente
- [x] Chip fica marcado como ativo quando nome+leito correspondem ao formulário
- [x] Mesmo comportamento na tela de Medicação
- [x] Se não há pacientes registrados, seção de chips não aparece

### 6.7 Sincronização Firebase
- [x] Adicionar paciente → aparece em tempo real via onValue listener
- [x] Editar paciente → atualiza em tempo real
- [x] Excluir paciente → remove em tempo real
- [x] Adicionar/toggle/excluir pendência → reflete em tempo real
- [x] Dados persistem após reload da página

---

## 7. ORGANIZADOR DO PLANTÃO

### 7.1 Interface / Estado vazio
- [x] Rota `/organizador` carrega sem erros
- [x] Card "Organizador do Plantão" aparece no Dashboard entre Pacientes e Histórico
- [x] Empty state com ícone 📋, título e botão "Iniciar plantão" quando nenhum plantão ativo
- [x] Botão voltar retorna ao Dashboard
- [x] Botão logo retorna ao Dashboard
- [x] Ícone de engrenagem (⚙️) no header abre modal de tarefas padrão

### 7.2 Iniciar Plantão
- [x] Botão "Iniciar plantão" cria plantão com as 7 tarefas padrão do template
- [x] Tarefas padrão: Passar nos quartos, Organizar setor, Retirar hamper, Repor materiais, Limpar expurgo, Trocar prescrição, Organizar copa
- [x] Hora de início exibida corretamente ("Iniciado às HHhMM · DDD, DD/MM")
- [x] Contador "0 de 7 tarefas concluídas" visível
- [x] Badge com número de pendentes aparece no título "TAREFAS DO PLANTÃO"

### 7.3 Checklist de Tarefas
- [x] Checkbox marca tarefa como feita (verde, texto riscado, opacidade reduzida)
- [x] Barra de progresso avança ao marcar tarefas
- [x] Badge de pendentes atualiza em tempo real
- [x] Ícone de relógio abre input de horário inline na tarefa
- [x] Horário salvo aparece como badge na tarefa
- [x] Badge de urgência: azul (horário definido), laranja (≤ 30 min), vermelho (vencido)
- [x] Campo "＋ Tarefa extra..." adiciona tarefa avulsa com horário opcional
- [x] Tarefa avulsa exibe botão × para excluir (tarefas padrão não exibem ×)

### 7.4 Botão "Novo Plantão"
- [x] Clique abre modal de confirmação
- [x] Cancelar fecha modal sem alterar
- [x] Confirmar reseta todas as tarefas e cria novo plantão com template atual

### 7.5 Gerenciar Tarefas Padrão (⚙️)
- [x] Modal lista todas as tarefas do template
- [x] Botão × remove tarefa do template permanentemente
- [x] Campo "Nova tarefa padrão..." adiciona nova tarefa ao template
- [x] Botão "↺ Restaurar padrões" recarrega as 7 tarefas originais
- [x] Alterações no template refletem no próximo "Novo plantão"

### 7.6 Passar pro Próximo Plantão
- [x] Seção separada abaixo das tarefas
- [x] Empty hint "Nenhuma anotação para o próximo plantão" quando vazio
- [x] Campo adicionar nota funciona (Enter ou botão Ok)
- [x] Botão × remove nota individualmente

### 7.7 Dashboard — Card Organizador
- [x] Card exibe "Nenhum plantão ativo" quando não há plantão
- [x] Card exibe "X/N tarefas · Y pendentes" quando plantão ativo
- [x] Clicar no card navega para /organizador

### 7.8 Sincronização Firebase
- [x] Tarefas e progresso sincronizados via Firebase Realtime Database
- [x] Template persiste entre sessões
- [x] Plantão ativo persiste após reload
