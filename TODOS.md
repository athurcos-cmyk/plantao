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

### [ ] Board colaborativo (deferido do CEO Review 2026-03-21)
**O quê:** Avaliar funcionalidade colaborativa (múltiplos técnicos, mesmo plantão).
**Por quê:** Poderia servir clínicas pequenas onde o time é unido e quer compartilhar anotações.
**Por que deferido:** App permanece individual por decisão de produto — a proposta de valor é "ferramenta pessoal que independe do hospital". Tornar colaborativo introduziria dependência institucional.
**Quando revisar:** Se clínicas pequenas com time unido pedirem explicitamente (coletar via Pulso do App).
**Prioridade:** P3
**Depende de:** Feedback de usuários de clínicas (via Feature 5 — Pulso do App)

---

### [ ] Modo de Local de Trabalho — UPA/UBS/Clínicas (deferido do CEO Review 2026-03-21)
**O quê:** Adaptar terminologia do app para funcionar em UPA, UBS e clínicas, não só hospitais.
**Por quê:** Mercado endereçável ~5x maior: qualquer serviço de saúde que exige registro em prontuário usa o mesmo fluxo de documentação.
**Por que deferido:** Fundador não conhece os termos e fluxos de UPA/UBS. Abordagem lean: lançar com terminologia hospitalar + coletar feedback de usuários de UPA/UBS via Pulso do App antes de implementar.
**Como:** Pesquisar terminologia via web → validar com usuários reais → implementar somente termos confirmados.
**Prioridade:** P2
**Depende de:** Feature 5 (Pulso do App) estar live para coletar feedback de contexto

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

### [x] Adicionar token --warning ao style.css
**Concluído:** 2026-03-21
Adicionados `--warning`, `--warning-muted`, `--info`, `--info-muted`, `--blue-muted`, `--danger-muted`, `--success-muted`, `--radius-lg`, `--radius-full` ao `:root`. Atualizado `aviso-fcm` (OrganizadorView) e `aviso-pin` (LoginView) para usar `var(--warning-muted)`. Atualizado `.card` e `.toast-central` para usar `var(--radius-lg)`. Atualizado `.btn-ajuda` para usar `var(--radius-full)`.

---

