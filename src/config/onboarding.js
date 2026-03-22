/**
 * Configurações do fluxo de Onboarding e Primeiro Sucesso Guiado.
 * Centralizado aqui para facilitar ajustes de copy sem mexer nos componentes.
 */

export const ONBOARDING_TELAS = [
  {
    icone: '📋',
    titulo: 'Chega de papel no plantão',
    descricao: 'Anote tudo direto no celular e gere textos prontos para copiar no sistema do hospital.',
  },
  {
    icone: '✍️',
    titulo: 'Escreva. Copie. Pronto.',
    descricao: 'Preencha os campos, toque em Copiar e cole direto no prontuário. Simples assim.',
  },
  {
    icone: '🔒',
    titulo: 'Seguro e sincronizado',
    descricao: 'Entre com Google ou email. Seus dados ficam protegidos e acessíveis em qualquer dispositivo.',
  },
  {
    icone: '✅',
    titulo: 'Crie sua conta gratuita',
    descricao: 'Comece agora — é rápido e grátis.',
    cta: true,
  },
]

export const PRIMEIRO_SUCESSO_EXEMPLO = {
  tipo: 'intercorrencia',
  rotulo: 'Intercorrência',
  descricao: 'Paciente agitado, leito 12. Comunicado ao médico plantonista.',
}

export const STORAGE_KEYS = {
  ONBOARDING_VISTO: 'onboarding_visto',
  PRIMEIRO_LOGIN: 'primeiro_login',
  PRIMEIRA_COPIA: 'primeira_copia_feita',
}
