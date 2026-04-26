# PWA Plantão — Skills Específicas do Projeto

Skills específicas para o desenvolvimento do app PWA de anotações de enfermagem.

## Stack do Projeto
Vue 3 (script setup), Vite, Pinia, Firebase Auth, Firebase Realtime DB, vite-plugin-pwa, CSS puro.

## Regras de Código
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
- Login rápido por código usa `/api/login-by-code.js`
- Sessão local cacheia `syncCode`, `uid`, `userEmail` e `userName` em `localStorage` via `src/utils/authSessionCache.js`
- Vínculo entre Auth e dados: `uid_map/{uid}` aponta para o `syncCode`, e `owners/{syncCode}/{uid}` confirma posse

## Firebase — Estrutura
- `usuarios/{syncCode}/` — nome, email, criadoEm, ultimo_acesso
- `uid_map/{uid}` — syncCode do usuário autenticado
- `owners/{syncCode}/{uid}` — true para vincular UID ao syncCode
- `anotacoes/{syncCode}/{pushKey}/` — tipo, texto, nome, leito, timestamp
- `pacientes/{syncCode}/{pushKey}/` — nome, leito, criadoEm, pendencias/
- `organizador/{syncCode}/` — template/, plantao/

## Padrão do Texto Gerado
```
14h00 – [texto da anotação], sem intercorrências.
```

## Estado Atual do Produto
- Cards principais de anotação concluídos no novo padrão premium
- Padrão consolidado: `paciente registrado` no topo quando aplicável, hero apenas no primeiro bloco, cards navy/azul, chips premium e resultado final padronizado
- Módulos revisados: Sinais Vitais, Medicação, Notas Livres, Passagem de Plantão, Encaminhamento, Higienização/Banho, Curativos e Anotação Inicial
- Meus Pacientes elevado visualmente, FAB local de adicionar paciente removido
- Próximo ciclo: backlog funcional, refinamentos clínicos e fluxos operacionais
