# TODOS — Plantão

## Concluídos

### [x] Aviso de modo privado na LoginView
**Concluído:** 2026-03-21
Implementado em `LoginView.vue` com `v-if="auth.modoPrivado"` — chip discreto informando que a sessão não será salva ao fechar o app em modo privado do iOS Safari.

---

### [x] Criar DESIGN.md formal
**Concluído:** 2026-03-21
`DESIGN.md` criado via `/design-consultation` com todos os tokens, tipografia, espaçamento, motion, componentes e anti-patterns. CLAUDE.md atualizado com referência.

---

## Pendentes

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

---

### [x] Adicionar token --warning ao style.css
**Concluído:** 2026-03-21
Adicionados `--warning`, `--warning-muted`, `--info`, `--info-muted`, `--blue-muted`, `--danger-muted`, `--success-muted`, `--radius-lg`, `--radius-full` ao `:root`. Atualizado `aviso-fcm` (OrganizadorView) e `aviso-pin` (LoginView) para usar `var(--warning-muted)`. Atualizado `.card` e `.toast-central` para usar `var(--radius-lg)`. Atualizado `.btn-ajuda` para usar `var(--radius-full)`.

---

