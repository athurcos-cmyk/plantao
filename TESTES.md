# Plano de Testes — Plantão App

> Versão do app: 0.10.11
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
- [x] Sessão dura 30 dias (armazenada no localStorage)
- [x] Acesso direto a `/dashboard` sem login redireciona para login
- [x] Botão "Sair da conta" desloga, limpa localStorage e redireciona
- [x] PWA Android: reabrir app com sessão válida → redireciona para Dashboard sem exibir tela de login
- [x] LoginView: `onMounted` guard redireciona automaticamente se já autenticado

---

## 2. DASHBOARD

- [x] Saudação exibe hora correta (Bom dia / Boa tarde / Boa noite)
- [x] Saudação exibe nome do usuário
- [x] Card "Anotação inicial" navega para `/anotar/inicial`
- [x] Card "Medicação" navega para `/anotar/medicacao`
- [x] Card "Encaminhamento" navega para `/anotar/encaminhamento`
- [x] Cards "Em breve" disparam alerta e não navegam
- [x] Ícone relógio navega para `/historico`
- [x] Botão "Ver histórico" navega para `/historico`
- [x] Botão "Sair da conta" desloga e limpa localStorage
- [x] Botão "? Ajuda" abre modal com descrição de todas as funcionalidades

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
- [x] Múltiplas recusas com mesmo profissional → agrupadas em uma linha
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

## 5. ENCAMINHAMENTO

> Testes de lógica verificados programaticamente via setupState (v0.10.11).
> Testes de UI/Firebase marcados com `[UI]` foram verificados manualmente no preview.

### 5.1 Interface
- [x] Rota `/encaminhamento` carrega sem erros
- [x] Card "Encaminhamento" no Dashboard navega corretamente (sem badge "em breve")
- [x] Barra de progresso exibe "Bloco X de 3"
- [x] Botão voltar navega entre blocos (bloco 1 → volta ao Dashboard)

### 5.2 Bloco 1 — Identificação
- [x] Chips de tipo: "🚑 Encaminhamento" e "🔙 Retorno" visíveis e funcionando
- [x] Tipo padrão é "Encaminhamento" (ida)
- [x] Campo horário obrigatório — erro ao tentar avançar sem preencher
- [x] Campo nome obrigatório — erro ao tentar avançar sem preencher
- [x] Campo leito opcional
- [x] Chips de pacientes registrados aparecem e preenchem nome+leito ao clicar `[UI]`
- [x] Rascunho automático salva e restaura dados (incluindo tipo ida/retorno) `[UI]`

### 5.3 Bloco 2 — Encaminhamento (ida)
- [x] Título exibe "Destino e Transporte"
- [x] Chips de destino padrão: UTI, Centro Cirúrgico, Raio-X, Tomografia, Endoscopia, Hemodinâmica (6 chips)
- [x] Chip toggle: clicar no ativo deseleciona
- [x] Campo "Ou digite manualmente" preenche destino livre
- [x] Chips personalizados salvos no Firebase aparecem com botão × `[UI/Firebase]`
- [x] Botão × remove chip personalizado `[UI/Firebase]`
- [x] Botão "+ Adicionar" abre input inline (placeholder "Ex: INRAD, INCOR, IOT...") `[UI]`
- [x] Salvar novo destino → chip criado e selecionado `[UI]`
- [x] Chips de transporte: Cadeira de rodas, Maca, A pé, Ambulância, Outro
- [x] Chip "Outro" abre input de transporte livre
- [x] Motivo: opcional — omitido do texto se vazio
- [x] Condição clínica: opcional, toggle (clicar ativo deseleciona)
- [x] Validação: destino vazio → erro "Informe o destino"
- [x] Validação: transporte vazio → erro "Selecione o tipo de transporte"
- [x] limparBloco: destino, transporte, motivo, condicao, localRetorno, procedRetorno resetados

### 5.4 Bloco 2 — Retorno
- [x] Título exibe "Origem e Transporte"
- [x] Campo "Local de origem" obrigatório (chips de destino ocultos)
- [x] Campo "Procedimento realizado" opcional
- [x] Chips de transporte mantidos (mesmo que ida)
- [x] Validação: localRetorno vazio → erro "Informe o local de origem"
- [x] Validação: transporte vazio → erro "Selecione o tipo de transporte"

### 5.5 Bloco 3 — Acompanhante e Dispositivos
- [x] Chips de cargo: Téc. de enfermagem, Téc.ª de enfermagem, Enf., Enf.ª, Médico, Médica, Sem acompanhante
- [x] Artigos corretos: "do" (masc.) / "da" (fem.) por cargo
- [x] Campo "Nome do profissional" aparece para todos exceto "Sem acompanhante"
- [x] Validação: cargo obrigatório — erro ao gerar sem selecionar

#### Dispositivos simples
- [x] Chips: SVD, SNG, TOT — toggle individual
- [x] Seleção múltipla: todos aparecem separados por vírgula no texto
- [x] Chip "Nenhum": deseleciona todos os dispositivos/pulseiras/etc.
- [x] Selecionar dispositivo quando "Nenhum" ativo: desmarca "Nenhum"

#### Acessos centrais (cards com local)
- [x] CVC: card com chips de local (femoral D/E, jugular D/E, subclávia D/E)
- [x] CVC com local: "CVC em jugular D" no texto
- [x] CVC sem local: apenas "CVC"
- [x] PICC: card com chips de local (MSE, MSD, MIE, MID)
- [x] PICC com local: "PICC em MSD" no texto
- [x] Permcath: card com locais centrais → "Permcath em femoral D"
- [x] Shilley: card com locais centrais → "Shilley em subclávia E"
- [x] Múltiplos acessos centrais: todos listados

#### AVP
- [x] "+ AVP": adiciona card com chips MSE/MSD/MIE/MID
- [x] AVP com local: "AVP em MSE"
- [x] AVP com infusão: "AVP em MSD recebendo SF 0,9%"
- [x] Múltiplos AVPs: todos listados individualmente
- [x] Botão ✕ remove AVP específico

#### Cateter nasal O₂
- [x] Toggle chip abre card com campo L/min
- [x] Com L/min: "cateter nasal de O₂ a 3L/min"
- [x] Sem L/min: apenas "cateter nasal de O₂"
- [x] Desativar: limpa lMin

#### SNE
- [x] Toggle SNE abre card com chips "Dieta integral" / "Outro"
- [x] Sem dieta selecionada: texto apenas "SNE"
- [x] Chip "Dieta integral": exibe campo ml/h com sufixo "ml/h"
- [x] SNE integral + ml/h: "SNE com dieta enteral integral a 60ml/h"
- [x] SNE integral sem ml/h: "SNE com dieta enteral integral" (sem ml/h)
- [x] Chip "Outro": exibe campo texto livre + campo ml/h
- [x] SNE outro + desc + ml/h: "SNE com TNE polimérica a 45ml/h"
- [x] SNE outro sem desc + ml/h: "SNE com dieta enteral a 30ml/h" (fallback)
- [x] SNE: NÃO gera "em uso com" (removido)
- [x] Chips são toggle: clicar no ativo deseleciona
- [x] Desativar SNE: limpa dietaTipo, mlH, dietaDesc

#### Dreno
- [x] "+ Dreno": adiciona card com campo de local livre
- [x] Dreno com local: "dreno em tórax D"
- [x] Dreno sem local: apenas "dreno"
- [x] Múltiplos drenos: todos listados
- [x] Botão ✕ remove dreno específico

#### Outro dispositivo
- [x] "+ Outro": adiciona card com campo descrição livre
- [x] Outro com descrição: aparece no texto
- [x] Outro sem descrição: não aparece no texto (omitido)
- [x] Múltiplos "Outros": todos listados
- [x] Botão ✕ remove "Outro" específico

#### Pulseiras
- [x] Chip "Pulseiras" abre card com 5 opções: Identificação, Alergia, Risco de queda, Precaução, Preservação de membro
- [x] Toggle individual por opção
- [x] Pulseira única: "Paciente com pulseira de [tipo]."
- [x] Múltiplas pulseiras: "Paciente com pulseiras de X e Y."
- [x] Pulseiras geram frase SEPARADA — NÃO aparecem dentro de "Dispositivos em uso:"
- [x] Desativar chip Pulseiras: limpa todas as seleções

### 5.6 Texto Gerado — Encaminhamento (ida)
- [x] Formato horário: "09:40" → "09h40" (HHhMM)
- [x] Formato completo: "Às 09h40, paciente [nome][, leito Y], encaminhado em [transporte], acompanhado [artigo] [cargo] [nome], para [destino][, para [motivo]]."
- [x] Com condição clínica: "Condição clínica: Estável."
- [x] Com recebido por: "Recebido por Enf. Ana."
- [x] Com observações: "Observações: paciente agitado."
- [x] Dispositivos: "Dispositivos em uso: SVD, CVC em jugular D, SNE com dieta enteral integral a 60ml/h, AVP em MSE."
- [x] Sem dispositivos: frase de dispositivos omitida
- [x] Ordem final: identificação → transporte → acompanhante → destino → condição → dispositivos → pulseiras → recebido → observações

### 5.7 Texto Gerado — Retorno
- [x] Formato: "Às 10h00, paciente [nome], retorna para unidade de internação, em [transporte], acompanhado [cargo], após [procedimento] no [local]."
- [x] Com proc + local: "após realização de tomografia no 3° andar do INRAD"
- [x] Só local (sem procedimento): "proveniente de Centro Cirúrgico"
- [x] NÃO contém "encaminhado" nem destino da ida
- [x] Dispositivos e pulseiras funcionam igual à ida

### 5.8 Ações pós-geração
- [x] Botão "Copiar texto": copia via navigator.clipboard (com fallback execCommand para Android)
- [x] Botão "Salvar no histórico": salva e exibe toast `[UI]`
- [x] Botão "← Editar": retorna ao bloco 3 sem perder dados
- [x] Botão "Nova anotação": reseta form (tipo volta para "ida", passo=1, gerado=false)

### 5.9 Destinos Personalizados
- [x] Destinos salvos no Firebase em `encaminhamento/{code}/destinos` `[Firebase]`
- [x] Cache em localStorage para acesso offline
- [x] Tentativa de adicionar destino offline exibe toast de erro `[UI]`
- [x] Persistem entre sessões `[Firebase]`

---

## 6. HISTÓRICO DE ANOTAÇÕES

### 6.1 Interface
- [x] Tela de histórico carrega com campo de busca e filtros
- [x] Chips de filtro por tipo aparecem (≥ 2 opções)
- [x] Botão voltar retorna ao Dashboard
- [x] Botão logo retorna ao Dashboard

### 6.2 Busca e Filtros
- [x] Campo de busca aceita texto
- [x] Limpar busca funciona
- [x] Filtro por tipo "Medicação" exibe apenas anotações de medicação
- [x] Filtro por tipo "Inicial" exibe apenas anotações iniciais
- [x] Filtro por tipo "Encaminhamento" exibe apenas encaminhamentos
- [x] Busca por nome do paciente filtra corretamente

### 6.3 Ações nas Anotações
- [x] Anotação salva aparece na lista
- [x] Busca pelo nome do paciente encontra a anotação
- [x] Botão "Copiar texto" funciona
- [x] Botão "Editar" abre campos de edição (nome + leito)
- [x] Editar e salvar fecha os campos de edição
- [x] Botão "Excluir" abre modal de confirmação
- [x] Cancelar exclusão fecha o modal sem excluir
- [x] Confirmar exclusão remove a anotação da lista
- [x] Botão "Compartilhar" abre opções de compartilhamento (requer interação manual)

### 6.4 Limpar Histórico
- [x] Botão "Limpar tudo" aparece ao lado da busca quando há anotações
- [x] Clicar abre modal de confirmação com contagem de anotações
- [x] Cancelar fecha modal sem apagar nada
- [x] Confirmar apaga todas as anotações do Firebase e lista fica vazia
- [x] Botão "Limpar tudo" desaparece automaticamente quando histórico está vazio

### 6.5 Filtro por Paciente Registrado
- [x] Chips de pacientes registrados aparecem abaixo dos filtros de tipo
- [x] Clicar no chip preenche o campo de busca com o nome do paciente
- [x] Clicar no chip ativo limpa o filtro (toggle)
- [x] Chips exibem leito · nome (ex: "2A · João Souza")

---

## 7. MEUS PACIENTES

### 7.1 Interface
- [x] Rota `/pacientes` carrega sem erros
- [x] Empty state com ícone 🛏️, título e botão "Adicionar paciente" quando lista vazia
- [x] Contador "X registrado(s)" no cabeçalho atualiza em tempo real
- [x] Botão voltar retorna ao Dashboard
- [x] Botão logo retorna ao Dashboard

### 7.2 Cadastro de Paciente
- [x] Clicar em "+ Adicionar paciente" abre modal
- [x] Salvar sem nome exibe erro "Informe o nome do paciente"
- [x] Salvar com nome (leito opcional) → paciente aparece na lista sincronizado via Firebase
- [x] FAB (+) aparece quando há pacientes na lista

### 7.3 Edição e Exclusão
- [x] Botão ✏️ abre modal com dados preenchidos
- [x] Editar leito → card atualiza em tempo real
- [x] Botão 🗑️ abre modal de confirmação com nome do paciente
- [x] Confirmar exclusão remove paciente e todas as pendências
- [x] Cancelar exclusão fecha modal sem remover

### 7.4 Pendências (Checklist)
- [x] Campo "Nova pendência..." visível em cada card
- [x] Digitar texto + Enter adiciona a pendência na lista do Firebase
- [x] Botão "Ok" aparece ao digitar, clicando também adiciona
- [x] Clicar no checkbox marca pendência como feita (linha riscada, opacidade reduzida)
- [x] Clicar novamente desmarca
- [x] Botão × ao lado de cada pendência exclui apenas aquela pendência

### 7.5 Ordenação e Visual
- [x] Pacientes ordenados por leito (ordem alfanumérica)
- [x] Leito exibido como badge azul no card

### 7.6 Integração — Seletor nas Anotações
- [x] Ao gerar anotação inicial (preview): chips de pacientes registrados aparecem
- [x] Clicar no chip preenche nome e leito automaticamente
- [x] Chip fica marcado como ativo quando nome+leito correspondem ao formulário
- [x] Mesmo comportamento na tela de Medicação e Encaminhamento
- [x] Se não há pacientes registrados, seção de chips não aparece

### 7.7 Sincronização Firebase
- [x] Adicionar paciente → aparece em tempo real via onValue listener
- [x] Editar paciente → atualiza em tempo real
- [x] Excluir paciente → remove em tempo real
- [x] Adicionar/toggle/excluir pendência → reflete em tempo real
- [x] Dados persistem após reload da página

---

## 8. ORGANIZADOR DO PLANTÃO

### 8.1 Interface / Estado vazio
- [x] Rota `/organizador` carrega sem erros
- [x] Card "Organizador do Plantão" aparece no Dashboard entre Pacientes e Histórico
- [x] Empty state com ícone 📋, título e botão "Iniciar plantão" quando nenhum plantão ativo
- [x] Botão voltar retorna ao Dashboard
- [x] Botão logo retorna ao Dashboard
- [x] Ícone de engrenagem (⚙️) no header abre modal de tarefas padrão

### 8.2 Iniciar Plantão
- [x] Botão "Iniciar plantão" cria plantão com as 7 tarefas padrão do template
- [x] Tarefas padrão: Passar nos quartos, Organizar setor, Retirar hamper, Repor materiais, Limpar expurgo, Trocar prescrição, Organizar copa
- [x] Hora de início exibida corretamente ("Iniciado às HHhMM · DDD, DD/MM")
- [x] Contador "0 de 7 tarefas concluídas" visível
- [x] Badge com número de pendentes aparece no título "TAREFAS DO PLANTÃO"

### 8.3 Checklist de Tarefas
- [x] Checkbox marca tarefa como feita (verde, texto riscado, opacidade reduzida)
- [x] Barra de progresso avança ao marcar tarefas
- [x] Badge de pendentes atualiza em tempo real
- [x] Ícone de relógio abre input de horário inline na tarefa
- [x] Horário salvo aparece como badge na tarefa
- [x] Badge de urgência: azul (horário definido), laranja (≤ 30 min), vermelho (vencido)
- [x] Campo "＋ Tarefa extra..." adiciona tarefa avulsa com horário opcional
- [x] Tarefa avulsa exibe botão × para excluir (tarefas padrão não exibem ×)

### 8.4 Botão "Novo Plantão"
- [x] Clique abre modal de confirmação
- [x] Cancelar fecha modal sem alterar
- [x] Confirmar reseta todas as tarefas e cria novo plantão com template atual

### 8.5 Gerenciar Tarefas Padrão (⚙️)
- [x] Modal lista todas as tarefas do template
- [x] Botão × remove tarefa do template permanentemente
- [x] Campo "Nova tarefa padrão..." adiciona nova tarefa ao template
- [x] Botão "↺ Restaurar padrões" recarrega as 7 tarefas originais
- [x] Alterações no template refletem no próximo "Novo plantão"

### 8.6 Passar pro Próximo Plantão
- [x] Seção separada abaixo das tarefas
- [x] Empty hint "Nenhuma anotação para o próximo plantão" quando vazio
- [x] Campo adicionar nota funciona (Enter ou botão Ok)
- [x] Botão × remove nota individualmente

### 8.7 Dashboard — Card Organizador
- [x] Card exibe "Nenhum plantão ativo" quando não há plantão
- [x] Card exibe "X/N tarefas · Y pendentes" quando plantão ativo
- [x] Clicar no card navega para /organizador

### 8.8 Sincronização Firebase
- [x] Tarefas e progresso sincronizados via Firebase Realtime Database
- [x] Template persiste entre sessões
- [x] Plantão ativo persiste após reload

---

## 9. SUPORTE OFFLINE

> Testado via simulação de rede (DevTools → offline) e reload com conexão desativada.

### 9.1 Indicador de status
- [x] Barra laranja "Sem conexão" aparece no topo do app quando offline
- [x] Barra desaparece ao reconectar
- [x] Toast "Conexão restaurada. Sincronizando..." exibido ao reconectar

### 9.2 Anotações (Encaminhamento, Medicação, Inicial)
- [x] Salvar offline → operação enfileirada localmente (não trava em "Salvando...")
- [x] Toast ou feedback imediato ao salvar offline
- [x] Ao reconectar → pendentes sincronizados automaticamente
- [x] Contador de pendentes visível enquanto offline `[UI]`

### 9.3 Pacientes
- [x] Adicionar paciente offline → aparece imediatamente na lista (optimistic update)
- [x] Editar paciente offline → atualização local imediata
- [x] Excluir paciente offline → removido da lista local
- [x] Pendências offline (add/toggle/delete) → enfileiradas
- [x] Ao reconectar → todos os CRUDs sincronizados com mapeamento de chaves temporárias → reais
- [x] Chips de pacientes nas anotações funcionam offline (dados do cache local)

### 9.4 Organizador do Plantão
- [x] Marcar/desmarcar tarefa offline → atualização local imediata (dirty flag)
- [x] Adicionar tarefa extra offline → salvo localmente
- [x] Editar template offline → salvo localmente
- [x] Ao reconectar → estado completo enviado ao Firebase (set() full state)

### 9.5 Cache de leitura
- [x] Histórico de anotações carrega do cache localStorage se Firebase demorar
- [x] Lista de pacientes carrega do cache offline
- [x] Destinos personalizados do Encaminhamento carregam do cache

### 9.6 Persistência de login (PWA Android)
- [x] Sessão de 30 dias armazenada no localStorage
- [x] Reabrir app (PWA instalado) com sessão válida → redireciona diretamente para Dashboard (não exibe tela de login)
- [x] LoginView redireciona automaticamente se já autenticado (`onMounted` guard)

---

## 10. FORMATO E CONSISTÊNCIA DE TEXTO

### 10.1 Formato de horário
- [x] `formatHora("09:40")` → `"09h40"` (não "09:40h")
- [x] `formatHora("10:00")` → `"10h00"`
- [x] `formatHora("00:00")` → `"00h00"`
- [x] Aplicado em: Encaminhamento ida, Encaminhamento retorno
- [ ] Verificar Anotação Inicial e Medicação (usar mesmo padrão)

### 10.2 Copiar texto
- [x] `navigator.clipboard.writeText` usado quando disponível
- [x] Fallback `document.execCommand('copy')` para Android/contextos sem permissão
- [x] Toast "Texto copiado!" exibido após cópia bem-sucedida
- [x] Toast "Erro ao copiar" em falha
- [x] Botão muda para "Copiado!" por 2 segundos após copiar

### 10.3 Artigos de gênero (acompanhante)
- [x] Téc. de enfermagem → "acompanhado do técnico de enfermagem"
- [x] Téc.ª de enfermagem → "acompanhado da técnica de enfermagem"
- [x] Enf. → "acompanhado do enfermeiro"
- [x] Enf.ª → "acompanhado da enfermeira"
- [x] Médico → "acompanhado do médico"
- [x] Médica → "acompanhado da médica"
- [x] Sem acompanhante → "sem acompanhante"
