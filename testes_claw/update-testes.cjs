const fs = require('fs');
const path = require('path');

const filePath = 'C:\\Users\\Thurcos\\Desktop\\plantao\\TESTES.md';
let content = fs.readFileSync(filePath, 'utf8');

// Atualizando Bloco 1.1
content = content.replace(/- \[ \] Digitar código com menos de 3/g, '- [x] Digitar código com menos de 3');
content = content.replace(/- \[ \] Botão "Continuar" fica \*\*desabilitado\*\*/g, '- [x] Botão "Continuar" fica **desabilitado**');
content = content.replace(/- \[ \] Digitar código de 4–6 caracteres/g, '- [x] Digitar código de 4–6 caracteres');
content = content.replace(/- \[ \] Código é automaticamente convertido para maiúsculas/g, '- [x] Código é automaticamente convertido para maiúsculas');
content = content.replace(/- \[ \] Botão "Continuar" fica \*\*habilitado\*\*/g, '- [x] Botão "Continuar" fica **habilitado**');
content = content.replace(/- \[ \] Avança para passo 2 \(PIN\)/g, '- [x] Avança para passo 2 (PIN)');
content = content.replace(/- \[ \] Passo 2: campo PIN aceita apenas/g, '- [x] Passo 2: campo PIN aceita apenas');
content = content.replace(/- \[ \] Passo 2: botão "Continuar" fica desabilitado/g, '- [x] Passo 2: botão "Continuar" fica desabilitado');
content = content.replace(/- \[ \] Passo 2: botão "Continuar" fica habilitado/g, '- [x] Passo 2: botão "Continuar" fica habilitado');
content = content.replace(/- \[ \] Avança para passo 3 \(nome\)/g, '- [x] Avança para passo 3 (nome)');
content = content.replace(/- \[ \] Passo 3: botão "Criar conta e entrar" funciona com nome preenchido/g, '- [x] Passo 3: botão "Criar conta e entrar" funciona com nome preenchido');
content = content.replace(/- \[ \] Após cadastro → redireciona/g, '- [x] Após cadastro → redireciona');
content = content.replace(/- \[ \] Dashboard exibe o nome cadastrado/g, '- [x] Dashboard exibe o nome cadastrado');
content = content.replace(/- \[ \] Botão "Voltar" no passo 2/g, '- [x] Botão "Voltar" no passo 2');
content = content.replace(/- \[ \] Botão "Voltar" no passo 3/g, '- [x] Botão "Voltar" no passo 3');
content = content.replace(/- \[ \] Indicador "1 de 3/g, '- [x] Indicador "1 de 3');

// Atualizando Bloco 1.2 e 1.3
content = content.replace(/- \[ \] Digitar código já cadastrado → destaque/g, '- [x] Digitar código já cadastrado → destaque');
content = content.replace(/- \[ \] Passo 2 mostra "2 de 2"/g, '- [x] Passo 2 mostra "2 de 2"');
content = content.replace(/- \[ \] PIN incorreto → mensagem de erro/g, '- [x] PIN incorreto → mensagem de erro');
content = content.replace(/- \[ \] PIN correto → redireciona para/g, '- [x] PIN correto → redireciona para');
content = content.replace(/- \[ \] Clicar em "Sair da conta" no Dashboard/g, '- [x] Clicar em "Sair da conta" no Dashboard');
content = content.replace(/- \[ \] Tentar acessar `\/dashboard` sem login/g, '- [x] Tentar acessar `/dashboard` sem login');

// Atualizando Bloco 2 (Dashboard)
content = content.replace(/- \[ \] Saudação correta: "Bom dia"/g, '- [x] Saudação correta: "Bom dia"');
content = content.replace(/- \[ \] Nome do usuário exibido \(se cadastrado\)/g, '- [x] Nome do usuário exibido (se cadastrado)');
content = content.replace(/- \[ \] Cards "em breve": Medicação/g, '- [x] Cards "em breve": Medicação');
content = content.replace(/- \[ \] Botão "Ver histórico" → navega/g, '- [x] Botão "Ver histórico" → navega');
content = content.replace(/- \[ \] Ícone de relógio no header → navega/g, '- [x] Ícone de relógio no header → navega');
content = content.replace(/- \[ \] Logo "Plantão" no header → não navega/g, '- [x] Logo "Plantão" no header → não navega');

fs.writeFileSync(filePath, content, 'utf8');
console.log('TESTES.md atualizado com as marcações de sucesso [x]!');