# TODOS — Plantão

## Pendentes

### [ ] Aviso de modo privado na LoginView
**O quê:** Mostrar aviso sutil quando `auth.modoPrivado === true` na tela de login/registro.
**Por quê:** O fix de iOS Safari modo privado já funciona (sem crash), mas o usuário não sabe que sua sessão não será salva ao fechar o app — pode causar confusão.
**Como:** LoginView já importa `useAuthStore`. Adicionar `v-if="auth.modoPrivado"` num `<p>` ou chip discreto: _"Você está em modo privado — sua sessão não será salva ao fechar o app."_
**Dependências:** Nenhuma. `modoPrivado` já está exposto pela store.
**Contexto:** Identificado durante plan-eng-review (2026-03-21). O hook existe, só falta a UI.

---

### [ ] Proteção para crypto.subtle em HTTP
**O quê:** Envolver `hashPin()` e `hashPinLegacy()` em `try/catch` com mensagem de erro clara.
**Por quê:** `crypto.subtle` é `undefined` em contextos não-HTTPS (ex: acesso por IP local para testes). Atualmente o erro é silencioso — login/registro simplesmente quebra sem feedback.
**Como:**
```js
async function hashPin(pin, code) {
  if (!crypto?.subtle) throw new Error('Contexto inseguro — use HTTPS')
  // ... resto do código
}
```
**Dependências:** Nenhuma.
**Contexto:** Gap pré-existente identificado durante plan-eng-review (2026-03-21). Em produção (Vercel HTTPS) nunca ocorre, mas afeta testes locais via IP.
