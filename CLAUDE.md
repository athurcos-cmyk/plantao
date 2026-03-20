# Plantão — instruções do projeto

## Projeto
App PWA de anotações de enfermagem para uso no celular durante plantão hospitalar.
Gera textos formatados prontos para copiar no sistema do hospital.

## Stack
Vue 3 (script setup), Vite, Pinia, Firebase Realtime DB, vite-plugin-pwa, CSS puro.

## Regras de código — SEMPRE seguir
- `reactive()` para forms, `ref()` para estado simples
- Imports com extensão `.js` explícita
- Travessão `–` após horário (não hífen `-`)
- Sem "Às" no início do texto gerado
- `formatHora(h)` = `h.replace(':', 'h')` → "14h30"
- Copiar: `navigator.clipboard.writeText()` + fallback `document.execCommand('copy')`
- Chips: `<button class="chip" :class="{'chip-on': cond}">` com toggle

## Autenticação
Sistema próprio com syncCode + PIN (SHA-256). Sem Firebase Auth.
Sessão 30 dias no localStorage. syncCode é a chave raiz no Firebase.

## Firebase — estrutura
- `usuarios/{syncCode}/` — pin hash, nome, criadoEm
- `anotacoes/{syncCode}/{pushKey}/` — tipo, texto, nome, leito, timestamp
- `pacientes/{syncCode}/{pushKey}/` — nome, leito, criadoEm, pendencias/
- `organizador/{syncCode}/` — template/, plantao/

## Padrão do texto gerado
```
14h00 – [texto da anotação], sem intercorrências.
```

## Skills disponíveis
@.claude/skills/planner.md
@.claude/skills/build-error-resolver.md
@.claude/skills/revisao-seguranca.md
@.claude/skills/refactor-cleaner.md
@.claude/skills/pwa-plantao.md
@.claude/skills/economia-tokens.md
@.claude/skills/criar-skill.md
@.claude/skills/modularizacao.md