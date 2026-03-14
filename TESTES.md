# Plano de Testes — Plantão App

> Versão do app: 0.3.0
> Última atualização: 2026-03-14
> Testar sempre no dispositivo móvel (PWA instalado) e no navegador.

---

## Legenda

- `[ ]` — a testar
- `[x]` — passou
- `[!]` — falhou / bug encontrado

---

## 1. AUTENTICAÇÃO

### 1.1 Login — Novo usuário (cadastro)

- [ ] Digitar código com menos de 3 caracteres → campos de PIN **não aparecem**, sem mensagem de "cadastro"
- [ ] Digitar código com exatamente 3 caracteres → verifica e mostra destaque "Primeira vez aqui"
- [ ] Digitar código de 4–6 caracteres (disponível) → destaque "✨ Código disponível!"
- [ ] Código é automaticamente convertido para maiúsculas ao digitar
- [ ] Botão "Continuar" fica **desabilitado** enquanto código não foi verificado
- [ ] Botão "Continuar" fica **habilitado** após verificação bem-sucedida
- [ ] Avança para passo 2 (PIN) ao clicar Continuar
- [ ] Passo 2: campo PIN aceita apenas 4 dígitos
- [ ] Passo 2: botão "Continuar" fica desabilitado com menos de 4 dígitos
- [ ] Passo 2: botão "Continuar" fica habilitado com 4 dígitos
- [ ] Avança para passo 3 (nome) ao clicar Continuar
- [ ] Passo 3: campo nome é opcional (pode deixar em branco)
- [ ] Passo 3: botão "Criar conta e entrar" funciona com nome em branco
- [ ] Passo 3: botão "Criar conta e entrar" funciona com nome preenchido
- [ ] Após cadastro → redireciona para Dashboard
- [ ] Dashboard exibe o nome cadastrado no cabeçalho
- [ ] Botão "Voltar" no passo 2 retorna ao passo 1
- [ ] Botão "Voltar" no passo 3 retorna ao passo 2
- [ ] Indicador "1 de 3", "2 de 3", "3 de 3" exibido corretamente

### 1.2 Login — Usuário existente

- [ ] Digitar código já cadastrado → destaque "👋 Bem-vindo de volta!"
- [ ] Avança para passo 2 (PIN)
- [ ] Passo 2 mostra "2 de 2" (fluxo de 2 passos, sem passo de nome)
- [ ] PIN correto → redireciona para Dashboard
- [ ] PIN incorreto → mensagem de erro "PIN incorreto. Tente novamente."
- [ ] Mensagem de erro desaparece ao tentar novamente
- [ ] `Enter` no campo PIN dispara login

### 1.3 Sessão e persistência

- [ ] Fechar e reabrir o app (dentro de 30 dias) → **não** pede login novamente
- [ ] Fechar e reabrir abas do navegador → mantém logado
- [ ] Clicar em "Sair da conta" no Dashboard → modal de confirmação aparece
- [ ] Confirmar logout → redireciona para login e sessão é encerrada
- [ ] Cancelar logout → permanece no Dashboard
- [ ] Tentar acessar `/dashboard` sem login → redireciona para login
- [ ] Tentar acessar `/historico` sem login → redireciona para login
- [ ] Tentar acessar `/anotar/inicial` sem login → redireciona para login

### 1.4 Acesso por PC (não mobile)

- [ ] Acessar pelo computador → tela de aviso "use pelo celular" aparece
- [ ] Botão "continuar mesmo assim" → permite acesso
- [ ] Acesso por localhost → não mostra tela de aviso (dev bypass)

---

## 2. DASHBOARD

- [ ] Saudação correta: "Bom dia" (0h–11h59), "Boa tarde" (12h–17h59), "Boa noite" (18h–23h59)
- [ ] Nome do usuário exibido (se cadastrado)
- [ ] Cards disponíveis: Anotação inicial, Sinais vitais → clicáveis
- [ ] Cards "em breve": Medicação, Encaminhamento, Banho, Curativo, Passagem, Intercorrência → mostram alerta "em breve"
- [ ] Botão "Ver histórico" → navega para Histórico
- [ ] Ícone de relógio no header → navega para Histórico
- [ ] Logo "Plantão" no header → não navega (fica na mesma tela)

---

## 3. ANOTAÇÃO INICIAL — FLUXO GERAL

### 3.1 Barra de progresso

- [ ] Exibe "Bloco 1 de 5" no bloco 1
- [ ] Barra preenche 20% a cada bloco avançado
- [ ] Exibe "Bloco 5 de 5" no bloco 5
- [ ] Barra **desaparece** na tela de preview/resultado

### 3.2 Navegação entre blocos

- [ ] Botão "←" no header: no bloco 1 → volta para Dashboard (com confirmação se houver dados)
- [ ] Botão "←" no header: nos blocos 2–5 → volta para bloco anterior
- [ ] Botão "Próximo" avança para próximo bloco
- [ ] Botão "Limpar" reseta os campos do bloco atual
- [ ] Tela rola para o topo ao trocar de bloco

### 3.3 Rascunho automático

- [ ] Preencher qualquer campo → após ~800ms, rascunho é salvo no localStorage
- [ ] Navegar para outra tela e voltar → banner "📝 Você tem um rascunho salvo" aparece
- [ ] Botão "Continuar" → restaura o formulário no bloco onde parou
- [ ] Botão "Descartar" → limpa o rascunho e banner some
- [ ] Clicar "Nova anotação" na tela de preview → rascunho é apagado, banner não aparece na próxima vez
- [ ] Rascunho **não aparece** se não havia dados preenchidos
- [ ] Rascunho salva: horário, sexo, dispositivos, diurese e todos os outros campos

---

## 4. BLOCO 1 — IDENTIFICAÇÃO

- [ ] Campo "Horário" — obrigatório (formato HH:MM)
- [ ] Campo "Sexo" — obrigatório: opções F / M
- [ ] Posição da cama — opções: elevada / plana / Fowler / semi-Fowler
- [ ] Rodas — opções: travadas / soltas
- [ ] Grades — opções: elevadas / baixas / ausentes
- [ ] Decúbito — opções: dorsal / lateral D / lateral E / ventral / Fowler / semi-Fowler
- [ ] Tentar avançar sem horário → mensagem de erro
- [ ] Tentar avançar sem sexo → mensagem de erro
- [ ] Mudar sexo de F para M → campos de colaboração e acompanhante atualizam gênero no texto gerado
- [ ] Avançar com todos os campos preenchidos → vai para bloco 2

---

## 5. BLOCO 2 — ESTADO GERAL

### 5.1 Estado mental

- [ ] Toggle "Estado mental alterado" — OFF por padrão
- [ ] Ao ativar → campo de descrição aparece
- [ ] Campo de descrição aceita texto livre
- [ ] Ao desativar → campo de descrição some e valor é limpo

### 5.2 Colaboração

- [ ] Opções para sexo F: "sendo colaborativa", "pouco colaborativa", "não colaborativa"
- [ ] Opções para sexo M: "sendo colaborativo", "pouco colaborativo", "não colaborativo"
- [ ] Ao mudar sexo no bloco 1 e voltar ao bloco 2 → opções atualizam corretamente
- [ ] Obrigatório — tentar avançar sem selecionar → mensagem de erro

### 5.3 Deambulação

- [ ] Opções: deambula, deambula com auxílio, não deambula
- [ ] Selecionar "deambula com auxílio" → campo de texto para especificar auxílio aparece
- [ ] Selecionar outra opção → campo de auxílio some
- [ ] Clicar na opção já selecionada → deseleciona (toggle)
- [ ] Obrigatório — tentar avançar sem selecionar → mensagem de erro

### 5.4 Padrão respiratório

- [ ] Opções: eupneico, taquidispneico, bradipneico, dispneico, ortopneico
- [ ] Selecionar qualquer opção → valor registrado
- [ ] Clicar na opção já selecionada → deseleciona (toggle)
- [ ] Campo opcional (pode avançar sem selecionar)

### 5.5 Respiração

- [ ] Opções: ar ambiente, cateter nasal de O₂, máscara de O₂, ventilação mecânica, VNI
- [ ] Selecionar "cateter nasal de O₂" → campo de litros aparece
- [ ] Selecionar "máscara de O₂" → campo de litros aparece
- [ ] Selecionar "ar ambiente" → campo de litros **não** aparece
- [ ] Selecionar "ar ambiente" com padrão respiratório → texto gera "eupneico em ar ambiente"
- [ ] Obrigatório — tentar avançar sem selecionar → mensagem de erro
- [ ] Campo de litros: aceita número inteiro

### 5.6 Acompanhante

- [ ] Opções: sim / não
- [ ] Selecionar "sim" → campos de parentesco e nome aparecem
- [ ] Parentesco — texto livre
- [ ] Nome do acompanhante — texto livre
- [ ] Gênero no texto gerado: "acompanhado" (M) / "acompanhada" (F)
- [ ] Obrigatório — tentar avançar sem selecionar → mensagem de erro

---

## 6. BLOCO 3 — DISPOSITIVOS

### 6.1 Lista de dispositivos

- [ ] Inicialmente lista vazia com texto orientativo
- [ ] Botão "Adicionar dispositivo" → abre menu de tipos
- [ ] Tipos disponíveis: AVP, CVC, PICC, Permcath, Shilley, SNE, SNG, Pulseira, Monitor, Dreno, Curativo, Outros
- [ ] Cada tipo abre o modal correto
- [ ] Cancelar modal → nenhum dispositivo adicionado
- [ ] Adicionar dispositivo → aparece na lista

### 6.2 Gerenciamento da lista

- [ ] Ícone de arrastar (⠿) → arrastar para reordenar dispositivos
- [ ] Ao soltar em nova posição → ordem atualizada visualmente e no texto gerado
- [ ] Botão "↑" / "↓" → move dispositivo para cima/baixo
- [ ] Botão "✕" → remove dispositivo (sem confirmação)
- [ ] Múltiplos dispositivos do mesmo tipo → todos adicionados

### 6.3 Modal — AVP

- [ ] Local obrigatório: MSE / MSD / MIE / MID / jugular D / jugular E
- [ ] Status (opcionais, múltiplos): Salinizado / Ocluído / Datado / Em infusão
- [ ] Selecionar "Datado" → campo de data aparece
- [ ] Selecionar "Em infusão" → campos de solução, velocidade e BIC aparecem
- [ ] Campo solução — obrigatório se em infusão
- [ ] Campo velocidade — opcional (ml/h)
- [ ] Checkbox BIC → altera texto gerado
- [ ] Tentar confirmar sem local → erro
- [ ] Tentar confirmar em infusão sem solução → erro
- [ ] Texto gerado: "AVP em MSD, salinizado, datado de 14/03"
- [ ] Texto com infusão: "AVP em MSE, recebendo SF0,9% 500ml a 21ml/h em BIC"

### 6.4 Modal — CVC

- [ ] Local obrigatório: femoral D/E, jugular D/E, subclávia D/E
- [ ] Lúmens obrigatório: Mono / Duplo / Triplo
- [ ] Status: mesmos do AVP + heparinizado (N/A — CVC não tem heparinizado)
- [ ] Em infusão: mesmos campos do AVP
- [ ] Texto gerado: "CVC duplo lúmen em jugular D, salinizado"

### 6.5 Modal — PICC

- [ ] Membro obrigatório: MSD / MSE
- [ ] Lúmens obrigatório: Mono / Duplo
- [ ] Status: Salinizado / **Heparinizado** / Ocluído / Datado / Em infusão
- [ ] Selecionar "Heparinizado" → aparece no texto gerado
- [ ] Em infusão: mesmos campos
- [ ] Texto gerado: "PICC duplo lúmen em MSD, heparinizado"

### 6.6 Modal — Permcath

- [ ] Local obrigatório: mesmos da CVC (locais centrais)
- [ ] Status: Salinizado / **Heparinizado** / Ocluído / Datado / Em infusão
- [ ] Texto gerado: "Permcath em femoral D, heparinizado, salinizado"

### 6.7 Modal — Shilley

- [ ] Local obrigatório: femoral D / femoral E / jugular D / jugular E
- [ ] Status: Salinizado / **Heparinizado** / Ocluído / Datado / Em infusão
- [ ] Texto gerado: "Shilley em femoral E, heparinizado"

### 6.8 Modal — SNE

- [ ] Narina obrigatória: Direita / Esquerda
- [ ] Marcação obrigatória (cm) — número inteiro
- [ ] Status obrigatório: Aberta / Fechada
- [ ] Dieta enteral obrigatório: Sim / Não
- [ ] Selecionar "Sim" → campo de velocidade da dieta (ml/h) aparece, obrigatório
- [ ] Texto: "SNE em narina direita, marcação 65cm, aberta, recebendo dieta enteral a 60ml/h"

### 6.9 Modal — SNG

- [ ] Narina obrigatória: Direita / Esquerda
- [ ] Marcação obrigatória (cm)
- [ ] Modo obrigatório: Aberta / Fechada / Recebendo dieta / Em drenagem
- [ ] Selecionar "dieta" → campo velocidade aparece, obrigatório
- [ ] Selecionar "drenagem" → campos de débito (sem/com) aparecem
- [ ] Débito "com" → campo ml aparece + campo aspecto (opcional)
- [ ] Texto drenagem sem débito: "SNG em narina E, marcação 70cm, em drenagem, sem débito"
- [ ] Texto drenagem com débito: "...com débito de 200ml, aspecto bilioso"

### 6.10 Modal — Pulseira

- [ ] Membro obrigatório: MSE / MSD / MIE / MID
- [ ] Tipos obrigatório (múltiplos): identificação / risco de queda / alergia / precaução / preservação de membro
- [ ] Cada tipo exibe cor diferente quando selecionado
- [ ] Cor da pulseira NÃO afeta cor do texto (texto legível)
- [ ] Texto gerado lista todos os tipos selecionados

### 6.11 Modal — Monitor

- [ ] Tipo obrigatório: monitor multiparamétrico / oxímetro de pulso / monitor cardíaco
- [ ] Texto gerado: "monitor multiparamétrico"

### 6.12 Modal — Dreno

- [ ] Tipo do dreno — texto livre, obrigatório
- [ ] Localização — texto livre, obrigatório
- [ ] Débito drenado — número, opcional (ml)
- [ ] Aspecto/coloração — texto livre, opcional
- [ ] Checkbox "Possui selo d'água" → campo de débito do selo aparece
- [ ] Texto gerado com todos os campos

### 6.13 Modal — Curativo

- [ ] Locais (checkboxes, múltiplos): MSD / MSE / MID / MIE
- [ ] Campo "Outro local" — texto livre, adiciona ao texto
- [ ] MMSS selecionados → texto agrupa: "MMSS"
- [ ] MMII selecionados → texto agrupa: "MMII"
- [ ] Todos selecionados → "MMSS e MMII"
- [ ] Mistura de locais padrão + outro local → concatena corretamente
- [ ] Condição (toggle): limpo e seco externamente / sujo externamente
- [ ] Clicar na opção já selecionada → deseleciona
- [ ] Checkbox "Com enfaixamento" → aparece no texto
- [ ] Texto: "curativo oclusivo em MSD, limpo e seco externamente"
- [ ] Texto com enfaixamento: "curativo oclusivo em MIE com enfaixamento, limpo e seco externamente"

### 6.14 Modal — Outros

- [ ] Campo de descrição livre, obrigatório
- [ ] Texto gerado: exatamente o que foi digitado

---

## 7. BLOCO 4 — ELIMINAÇÕES

### 7.1 Evacuação

- [ ] Opções: hoje / ontem / data específica / não avaliada
- [ ] Selecionar "data específica" → campo de data aparece
- [ ] Data no formato dd/mm no texto gerado
- [ ] Texto: "Refere última evacuação hoje"
- [ ] Texto: "Refere última evacuação ontem"
- [ ] Texto: "Refere última evacuação em 10/03"
- [ ] Texto: "Evacuação não avaliada"
- [ ] Obrigatório — tentar avançar sem selecionar → mensagem de erro

### 7.2 Diurese

- [ ] Opções (múltiplas): não avaliado / banheiro / papagaio / comadre / fralda / SVD
- [ ] Selecionar "não avaliado" → outras opções desmarcadas automaticamente
- [ ] Selecionar qualquer outra opção → "não avaliado" desmarcado automaticamente
- [ ] Selecionar "SVD" → campo de débito (ml) aparece — **obrigatório**
- [ ] Selecionar "SVD" → campo de aspecto/coloração aparece — opcional
- [ ] SVD com aspecto → texto: "SVD com débito presente de 500ml, aspecto amarelado"
- [ ] SVD sem aspecto → texto: "SVD com débito presente de 500ml"
- [ ] Combinação banheiro + fralda → "diurese espontânea ao banheiro e em fralda"
- [ ] Combinação papagaio + comadre → "diurese espontânea em uso de papagaio e em uso de comadre"
- [ ] Somente fralda → "diurese em fralda"
- [ ] Campo de texto livre (nefrostomia, ureterostomia etc.) — opcional, acrescenta ao texto
- [ ] Tentar avançar com SVD sem débito → mensagem de erro
- [ ] Tentar avançar sem nenhuma seleção → mensagem de erro

### 7.3 Queixas / Observações

- [ ] Campo de texto livre, opcional
- [ ] Texto digitado aparece após "Refere" no texto gerado, com inicial em minúsculo
- [ ] Campo "Apresenta" (obsApresenta) — opcional, aparece no texto como "Apresenta ..."

---

## 8. BLOCO 5 — FECHAMENTO

- [ ] Campo de fechamento preenchido automaticamente com texto padrão ao entrar no bloco
- [ ] Texto padrão pode ser editado manualmente
- [ ] Texto aparece ao final da anotação gerada
- [ ] Obrigatório — tentar gerar sem fechamento → mensagem de erro
- [ ] Botão "Gerar texto" → gera anotação e exibe tela de preview

---

## 9. PREVIEW / TEXTO GERADO

### 9.1 Conteúdo do texto

- [ ] Texto começa com horário no formato "07h00 –"
- [ ] Sexo M gera "acompanhado" / sexo F gera "acompanhada"
- [ ] Estado mental alterado → frase "Aparentemente [descrição]." após cama/posição
- [ ] Padrão respiratório + respiração → combinação correta no texto
- [ ] Dispositivos aparecem em ordem: "Mantém [disp1]; [disp2]; [disp3]."
- [ ] "Apresenta [obs]." aparece apenas se campo preenchido
- [ ] Eliminações: "Refere última evacuação [quando], [diurese], [queixas]."
- [ ] Fechamento aparece ao final

### 9.2 Campos de identificação do paciente

- [ ] Campo "Nome do paciente" — texto livre, opcional, salvo com a anotação
- [ ] Campo "Leito" — texto livre, opcional, salvo com a anotação
- [ ] Não afetam o texto gerado (metadados do histórico)

### 9.3 Ações

- [ ] "Copiar texto" → copia para clipboard → toast "✓ Copiado!" aparece no **centro** da tela
- [ ] "Salvar no histórico" → salva no Firebase → toast "✓ Salvo no histórico!" aparece no **centro**
- [ ] "Salvar no histórico" botão fica desabilitado durante salvamento ("Salvando...")
- [ ] "Compartilhar" → abre WhatsApp com o texto
- [ ] "Nova anotação" → reseta formulário e volta para bloco 1, rascunho é apagado
- [ ] "← Editar" → volta para bloco 5 para editar

### 9.4 Toast de feedback

- [ ] Aparece centralizado na tela (não embaixo da página)
- [ ] Dura 3 segundos e some automaticamente
- [ ] Animação suave de entrada e saída
- [ ] Não é clicável (pointer-events: none)

---

## 10. SINAIS VITAIS

### 10.1 Campos do formulário

- [ ] Horário — obrigatório
- [ ] PA — dois campos: sistólica / diastólica (ambos numéricos, opcionais)
- [ ] PAM — numérico, opcional
- [ ] FC — numérico, opcional (bpm)
- [ ] FR — numérico, opcional (rpm)
- [ ] Temperatura — decimal, opcional (°C)
- [ ] SAT O₂ — numérico, opcional (%)
- [ ] Dextro — numérico, opcional (mg/dL)
- [ ] Algias: opções "Nega algias" / "Refere dor" (toggle — pode desmarcar)
- [ ] "Refere dor" → campo descrição da dor aparece, obrigatório
- [ ] Tentar gerar sem horário → erro
- [ ] Tentar gerar com "refere dor" sem descrição → erro

### 10.2 Lógica do texto gerado

- [ ] ≥ 4 sinais principais preenchidos → "Realizado aferição de sinais vitais"
- [ ] < 4 sinais principais → "Realizado aferição **parcial** de sinais vitais"
- [ ] Algias "nega" → ", nega algias" no texto
- [ ] Algias "refere" → ", refere dor: [descrição]"
- [ ] Sinais aparecem linha por linha: PA, PAM, FC, FR, T, SAT, Dextro
- [ ] Somente sinais preenchidos aparecem no texto
- [ ] Apenas horário preenchido → gera texto válido apenas com a abertura

### 10.3 Preview e ações

- [ ] Preview exibe texto com quebras de linha
- [ ] Campo nome/leito — opcionais
- [ ] Copiar, Salvar, Compartilhar, Nova aferição, Editar — mesmos comportamentos da anotação inicial
- [ ] "Nova aferição" reseta formulário

---

## 11. HISTÓRICO

### 11.1 Listagem

- [ ] Anotações exibidas em ordem decrescente de data (mais recentes primeiro)
- [ ] Cada card mostra: tipo (ícone + nome), data/hora, nome e leito do paciente, texto
- [ ] Sem anotações → mensagem "Nenhuma anotação salva ainda."
- [ ] Tipo da anotação identificado: 📋 Inicial, 📊 Sinais Vitais, etc.

### 11.2 Filtros

- [ ] Busca por nome do paciente (case insensitive)
- [ ] Busca por número de leito
- [ ] Nenhum resultado na busca → "Nenhuma anotação encontrada."
- [ ] Chips de filtro por tipo: Todos / Inicial / Sinais Vitais / Medicação / Curativo / Banho / Encaminhamento / Passagem / Intercorrência
- [ ] Chip ativo fica destacado em azul
- [ ] Combinação de filtro de tipo + busca de texto funciona corretamente

### 11.3 Ações por anotação

- [ ] Botão "Copiar" → copia o texto da anotação → toast "Copiado!" aparece
- [ ] Botão "Enviar" → abre WhatsApp com o texto
- [ ] Botão "Excluir" → abre modal de confirmação com nome e data
- [ ] Confirmar exclusão → remove do histórico e do Firebase
- [ ] Cancelar exclusão → nada acontece, modal fecha
- [ ] Clicar fora do modal de confirmação → modal fecha sem excluir

### 11.4 Edição de paciente

- [ ] Botão ✏️ em cada card → campos de nome e leito ficam editáveis inline
- [ ] Salvar edição → atualiza no Firebase e exibe "Atualizado!"
- [ ] Cancelar edição → campos voltam ao estado anterior

### 11.5 Código de sincronização

- [ ] Código exibido mascarado por padrão (primeiros 4 caracteres + ••••)
- [ ] Clicar na pílula do código → revela o código completo
- [ ] Clicar novamente → mascara novamente
- [ ] Código correto para o usuário logado

---

## 12. PWA / INSTALAÇÃO

- [ ] App pode ser instalado na tela inicial do celular
- [ ] Ícone instalado é o da caderneta (não quadrado azul genérico)
- [ ] Nome na tela inicial: "Plantão"
- [ ] App abre em modo standalone (sem barra do navegador)
- [ ] Orientação travada em retrato (portrait)
- [ ] Cor da barra de status: azul escuro (#0A1628)
- [ ] App funciona offline após primeira carga (conteúdo em cache)
- [ ] Nova versão implantada → app atualiza automaticamente na próxima abertura
- [ ] Após atualização automática → usuário **não** é deslogado

---

## 13. SINCRONIZAÇÃO / FIREBASE

- [ ] Anotação salva aparece imediatamente no histórico
- [ ] Anotação criada em um dispositivo aparece em outro com o mesmo código (sync)
- [ ] Excluir anotação → removida de todos os dispositivos sincronizados
- [ ] Editar nome/leito → atualizado em todos os dispositivos
- [ ] Sem conexão → salvamento falha com mensagem de erro (não trava o app)
- [ ] Reconectar → consegue salvar normalmente

---

## 14. CASOS EXTREMOS / EDGE CASES

- [ ] Formulário com horário "00:00" → gera "00h00 –" corretamente
- [ ] Horário "12:30" → gera "12h30 –"
- [ ] Paciente sem nome cadastrado no histórico → exibe "sem paciente registrado" em itálico
- [ ] Texto da anotação muito longo → não quebra o layout do card no histórico
- [ ] Adicionar 10+ dispositivos → lista funciona, drag funciona, texto gerado inclui todos
- [ ] Dispositivo com todos os status selecionados → texto gerado correto
- [ ] Dois dispositivos do mesmo tipo (ex: dois AVPs) → ambos no texto, separados por ";"
- [ ] Pulseira com todas as 5 cores → todas aparecem no texto
- [ ] Dreno com selo d'água + débito + aspecto → texto completo
- [ ] Curativo em todos os 4 locais padrão → agrupa "MMSS e MMII"
- [ ] Curativo em MSD + MID + local personalizado → texto correto
- [ ] SVD + banheiro + fralda + obs → todos no texto, sem duplicatas de "diurese"
- [ ] Queixa começando com maiúscula → convertida para minúscula no texto
- [ ] "Apresenta" começando com maiúscula → convertida para minúscula
- [ ] Campo fechamento editado manualmente → texto gerado usa o fechamento editado
- [ ] Botão "Limpar" no bloco 3 → lista de dispositivos é esvaziada
- [ ] Navegação rápida entre telas → sem crash ou estado corrompido

---

## 15. TEXTO GERADO — EXEMPLOS DE REFERÊNCIA

### Exemplo 1 — Anotação completa feminino

```
07h00 – Recebo plantão com paciente em seu leito com cama elevada, rodas travadas, grades elevadas e decúbito dorsal.
Sendo colaborativa, deambula com auxílio de andador, eupneico em ar ambiente, acompanhada de filha Maria.
Mantém AVP em MSD, salinizado, datado de 14/03; CVC duplo lúmen em jugular D, salinizado; pulseira de identificação e risco de queda em MSE.
Apresenta edema em MMII.
Refere última evacuação ontem, SVD com débito presente de 350ml, aspecto amarelado, diurese espontânea ao banheiro, refere dor em região lombar.
Paciente em acompanhamento. Intercorrências comunicadas à equipe médica. Plantão assumido.
```

### Exemplo 2 — Sinais vitais completo

```
07h30 – Realizado aferição de sinais vitais, nega algias.
PA 130/85mmHg
PAM 100mmHg
FC 88bpm
FR 18rpm
T 37.2°C
SAT 96%
Dextro 145mg/dL
```

### Exemplo 3 — Sinais vitais parcial com dor

```
14h00 – Realizado aferição parcial de sinais vitais, refere dor: cefaleia leve.
PA 110/70mmHg
SAT 98%
```

---

*Gerado automaticamente com base no código-fonte v0.3.0*
