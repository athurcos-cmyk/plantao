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

## Skills disponíveis
@.Codex/skills/planner.md
@.Codex/skills/build-error-resolver.md
@.Codex/skills/revisao-seguranca.md
@.Codex/skills/refactor-cleaner.md
@.Codex/skills/pwa-plantao.md
@.Codex/skills/economia-tokens.md
@.Codex/skills/criar-skill.md
@.Codex/skills/modularizacao.md
