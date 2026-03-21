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

---

### [ ] Criar DESIGN.md formal
**O quê:** Documentar o design system do app em `DESIGN.md` — tokens de cor, tipografia, espaçamento, padrões de componentes e diretrizes de UI.
**Por quê:** Sem DESIGN.md, cada sessão de desenvolvimento tende a adicionar cores ad-hoc fora do sistema (como o roxo `#9b59b6` encontrado e corrigido no plan-design-review). Ter um documento formal evita deriva visual.
**Como:** Rodar `/design-consultation` para gerar automaticamente um DESIGN.md com base no style.css existente e nas decisões de UI do app.
**Dependências:** Nenhuma.
**Contexto:** Identificado durante plan-design-review (2026-03-21). O de-facto design system já existe em `src/assets/style.css` — só precisa ser formalizado.

---

### [ ] Adicionar token --warning ao design system
**O quê:** Adicionar `--warning: #FFC107` e `--warning-muted: rgba(255, 193, 7, 0.1)` ao `:root` do `style.css`.
**Por quê:** `aviso-fcm` em `OrganizadorView.vue` usa `rgba(255,193,7,...)` hardcoded. Se aparecerem outros avisos amarelos no app, cada um vai reinventar a cor na mão.
**Como:** Adicionar 2 linhas ao `:root` em `src/assets/style.css` e atualizar o `aviso-fcm` para usar `var(--warning)` e `var(--warning-muted)`.
**Dependências:** Nenhuma. Opcional: fazer junto com a criação do DESIGN.md.
**Contexto:** Identificado durante plan-design-review (2026-03-21).
