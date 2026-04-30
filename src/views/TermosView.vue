<template>
  <div class="doc-wrap">
    <div class="doc-header">
      <a href="/landing" class="doc-back">← Plantão</a>
    </div>
    <div class="doc-body">
      <h1>Termos de Serviço</h1>
      <p class="doc-updated">Última atualização: março de 2026</p>

      <h2>1. Aceitação dos termos</h2>
      <p>Ao criar uma conta ou usar o Plantão, você concorda com estes termos. Se não concordar, não utilize o app.</p>

      <h2>2. O que é o Plantão</h2>
      <p>O Plantão é uma ferramenta de apoio para profissionais de enfermagem registrarem anotações e organizarem pendências durante o plantão hospitalar. <strong>O Plantão não é um sistema hospitalar oficial, não substitui o prontuário eletrônico e não tem responsabilidade sobre decisões clínicas.</strong></p>

      <h2>3. Quem pode usar</h2>
      <ul>
        <li>Profissionais de saúde maiores de 18 anos</li>
        <li>Uso pessoal — uma conta por profissional</li>
      </ul>

      <h2>4. Responsabilidades do usuário</h2>
      <ul>
        <li>Manter a confidencialidade da sua senha</li>
        <li>Não compartilhar sua conta com terceiros</li>
        <li>Seguir as normas do seu hospital quanto ao registro de informações</li>
        <li>Não inserir dados de pacientes além do necessário para uso pessoal</li>
        <li>Não usar o app para fins ilegais ou antiéticos</li>
      </ul>

      <h2>5. Limitação de responsabilidade</h2>
      <p>O Plantão é fornecido "como está". Não garantimos disponibilidade contínua 24/7. Não nos responsabilizamos por:</p>
      <ul>
        <li>Erros ou omissões em anotações geradas pelo app</li>
        <li>Decisões clínicas tomadas com base nas anotações</li>
        <li>Perda de dados por falha de rede ou dispositivo</li>
        <li>Indisponibilidade temporária do serviço</li>
      </ul>
      <p>O profissional de saúde é sempre o responsável pela conferência e validade das informações registradas.</p>

      <h2>6. Plano gratuito e futuro pagamento</h2>
      <p>O acesso atual é gratuito. No futuro, poderá ser introduzido um plano pago com funcionalidades adicionais. Usuários cadastrados receberão aviso por e-mail com antecedência.</p>

      <h2>7. Cancelamento</h2>
      <p>Você pode excluir sua conta a qualquer momento em Configurações → Excluir conta. Todos os seus dados são removidos permanentemente. Para encerrar antes disso, basta parar de usar o app.</p>

      <h2>8. Propriedade intelectual</h2>
      <p>O código, design e marca "Plantão" pertencem ao desenvolvedor. Você não pode copiar, redistribuir ou criar produtos derivados sem autorização.</p>

      <h2>9. Alterações nos termos</h2>
      <p>Mudanças significativas serão comunicadas por e-mail. O uso continuado após a notificação implica aceite dos novos termos.</p>

      <h2>10. Contato</h2>
      <p>Dúvidas ou solicitações: <a href="mailto:contato@plantao.net">contato@plantao.net</a></p>

      <h2>11. Legislação aplicável</h2>
      <p>Estes termos são regidos pelas leis brasileiras. Fica eleito o foro da comarca do desenvolvedor para dirimir controvérsias relacionadas a este instrumento.</p>
    </div>
  </div>
</template>

<style scoped>
.doc-wrap {
  min-height: 100vh;
  background: var(--bg);
  color: var(--text);
  padding-bottom: 60px;
}

.doc-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
}

.doc-back {
  color: var(--blue);
  text-decoration: none;
  font-size: 0.95rem;
}

.doc-body {
  max-width: 720px;
  margin: 0 auto;
  padding: 32px 20px;
}

h1 {
  font-size: 1.6rem;
  font-weight: 700;
  margin-bottom: 4px;
}

.doc-updated {
  color: var(--text-muted);
  font-size: 0.85rem;
  margin-bottom: 32px;
}

h2 {
  font-size: 1.05rem;
  font-weight: 600;
  margin-top: 28px;
  margin-bottom: 10px;
  color: var(--blue);
}

p {
  line-height: 1.7;
  margin-bottom: 12px;
  font-size: 0.95rem;
}

ul {
  padding-left: 20px;
  margin-bottom: 12px;
}

li {
  line-height: 1.7;
  font-size: 0.95rem;
  margin-bottom: 4px;
}

a {
  color: var(--blue);
}
</style>
