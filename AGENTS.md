# Plantão — instruções do projeto

## Projeto
App PWA de anotações de enfermagem para uso no celular durante plantão hospitalar.
Gera textos formatados prontos para copiar no sistema do hospital.

## Stack
Vue 3 (script setup), Vite, Pinia, Firebase Auth, Firebase Realtime DB, vite-plugin-pwa, CSS puro.

## Regras de código — SEMPRE seguir
- `reactive()` para forms, `ref()` para estado simples
- Imports com extensão `.js` explícita
- Travessão `–` após horário (não hífen `-`)
- Sem "Às" no início do texto gerado
- `formatHora(h)` = `h.replace(':', 'h')` → "14h30"
- Copiar: `navigator.clipboard.writeText()` + fallback `document.execCommand('copy')`
- Chips: `<button class="chip" :class="{'chip-on': cond}">` com toggle

## Autenticação
Firebase Auth é o sistema de autenticação ativo.

- Cadastro/login principal por email e senha em `src/stores/auth.js`
- Login com Google via Firebase Auth em `src/stores/auth.js`
- Login rápido por código usa `/api/login-by-code.js`: recebe `syncCode` + senha, resolve o email server-side, valida a senha via Identity Toolkit e retorna `customToken`
- O client entra com `signInWithCustomToken()` em `loginComCustomToken()`
- Sessão local cacheia `syncCode`, `uid`, `userEmail` e `userName` em `localStorage` via `src/utils/authSessionCache.js`
- `syncCode` continua sendo a chave/partição dos dados no Realtime DB, mas a identidade autenticada vem do Firebase Auth
- Vínculo entre Auth e dados: `uid_map/{uid}` aponta para o `syncCode`, e `owners/{syncCode}/{uid}` confirma posse

## Firebase — estrutura
- `usuarios/{syncCode}/` — nome, email, criadoEm, ultimo_acesso
- `uid_map/{uid}` — syncCode do usuário autenticado
- `owners/{syncCode}/{uid}` — true para vincular UID ao syncCode
- `anotacoes/{syncCode}/{pushKey}/` — tipo, texto, nome, leito, timestamp
- `pacientes/{syncCode}/{pushKey}/` — nome, leito, criadoEm, pendencias/
- `organizador/{syncCode}/` — template/, plantao/

## Padrão do texto gerado
```
14h00 – [texto da anotação], sem intercorrências.
```

## Estado atual do produto - 2026-04-25
- Os cards principais de anotação do app podem ser considerados concluídos no novo padrão premium
- O padrão atual consolidado é: `paciente registrado` no topo quando aplicável, hero apenas no primeiro bloco, cards navy/azul, chips premium e resultado final padronizado
- Módulos revisados nesta fase: `Sinais Vitais`, `Medicacao`, `Notas Livres`, `Passagem de Plantao`, `Encaminhamento`, `Higienizacao/Banho`, `Curativos` e `Anotacao Inicial`
- `Meus Pacientes` também foi elevado visualmente e o FAB local de adicionar paciente foi removido para não colidir com o rodapé global
- Para a próxima sessão, assumir que o ciclo de fechamento visual dos cards terminou e priorizar backlog funcional, refinamentos clínicos e fluxos operacionais

## Skills disponíveis
@.clinerules/planner.md
@.clinerules/build-error-resolver.md
@.clinerules/revisao-seguranca.md
@.clinerules/refactor-cleaner.md
@.clinerules/pwa-plantao.md
@.clinerules/economia-tokens.md
@.clinerules/criar-skill.md
@.clinerules/modularizacao.md
