# Guia de Implementação — Paywall Stripe

## Quando implementar

**Não implementar agora.** Gatilhos para começar:

1. **Bater o limite de 100 usuários** — quando o Firebase Spark começar a bloquear conexões, você sabe que tem demanda
2. **Alguém perguntar "como eu pago?"** — validação de disposição a pagar
3. **Custo do Firebase começar a doer** — se precisar subir pro Blaze, o custo mensal justifica a cobrança

Enquanto nenhum desses acontecer: **só coletar feedback e observar retenção.**

---

## Modelo de assinatura

### Plano Grátis (Free)
- Acesso completo a todas as funcionalidades atuais
- Sem limite de tempo (não é trial)
- Única restrição: **máquina de 100 usuários simultâneos** (limitação do Firebase Spark)
- Serve como validação contínua

### Plano Pro (R$14,99/mês)
- Tudo do Free +
- Prioridade no limite de usuários (se bater 100, usuários Free entram em fila de espera, Pro sempre entram)
- Futuro: funcionalidades premium (temas exclusivos, exportação de relatórios, dados ilimitados)

### Por que R$14,99?
- Abaixo disso não cobre Firebase + Stripe + trabalho
- Acima disso vira barreira para técnico de enfermagem pagar do próprio bolso
- Referência: apps de enfermagem na Play Store cobram R$19,90–R$39,90

---

## Arquitetura da implementação

```
┌─────────────┐     ┌──────────────┐     ┌────────────┐
│  Landing    │────▶│  Stripe      │────▶│  Firebase  │
│  Page       │     │  Checkout    │     │  /planos/  │
└─────────────┘     └──────┬───────┘     │  /faturas/ │
                           │             └────────────┘
                    ┌──────▼───────┐
                    │  Stripe      │
                    │  Webhook     │
                    │  → /api/     │
                    └──────────────┘
```

### Fluxo de entrada (primeiro acesso)
```
Usuário acessa → ainda há vagas Free? → sim → cria conta normalmente
                                      → não → tela de plano: "Vagas Free esgotadas.
                                              Assine o Pro por R$14,99/mês"
```

### Fluxo de assinatura
```
Usuário toca "Assinar" → Stripe Checkout (não precisa de UI customizada)
                       → usuário paga no Stripe
                       → webhook `checkout.session.completed` → salva `{status: active}` no Firebase
                       → redireciona pro app logado
```

### Fluxo de renovação/mensalidade
```
Stripe cobra no cartão todo mês
→ webhook `invoice.paid` → atualiza `vencimento` no Firebase
→ webhook `invoice.payment_failed` → avisa usuário, dá 7 dias pra resolver
→ webhook `customer.subscription.deleted` → rebaixa pra Free
```

---

## Estrutura no Firebase

```json
{
  "planos": {
    "syncCode": {
      "tier": "free" | "pro",
      "status": "active" | "past_due" | "canceled",
      "stripe_customer_id": "cus_xxx",
      "stripe_subscription_id": "sub_xxx",
      "vencimento": 1714435200000,
      "criado_em": 1711747200000
    }
  }
}
```

O campo `tier` pode ser lido na store de auth/user para travar/bloquear telas se necessário.

---

## Endpoints Stripe necessários

### 1. `api/create-checkout.js`
- POST, requer idToken
- Cria Stripe Checkout Session com `price_id` do Plano Pro
- Salva `stripe_customer_id` no Firebase antes de redirecionar
- Retorna URL do Checkout

### 2. `api/portal.js`
- POST, requer idToken
- Cria Stripe Customer Portal (gerenciar assinatura)
- Redireciona usuário pra página de cancelamento/troca de plano

### 3. `api/webhooks-stripe.js`
- POST, webhook Stripe (verificar assinatura com `stripe.webhooks.constructEvent`)
- Eventos para tratar:
  - `checkout.session.completed` — ativar plano Pro
  - `invoice.paid` — atualizar vencimento
  - `invoice.payment_failed` — marcar como `past_due`
  - `customer.subscription.deleted` — rebaixar pra Free
- Esse é o endpoint mais crítico — precisa de `try/catch` em cada handler e log

### 4. `api/check-subscription.js`
- GET, requer idToken
- Verifica status atual (útil para o app saber se está ativo)
- Pode também verificar direto no Firebase sem endpoint

---

## Funcionalidades pagas vs gratuitas

### Bloqueio por tier
```js
// Exemplo de guard numa view
const planosStore = usePlanosStore()
if (planosStore.tier === 'free' && !planosStore.dentroDoLimite) {
  // Mostra tela de upgrade
}
```

### O que NÃO bloquear
- Anotações básicas (avaliação, sinais vitais, medicação) — essencial pro uso diário
- Calculadora — ferramenta de segurança
- Modo offline — principal diferencial do app

### Possível bloqueio futuro (quando houver demanda)
- Temas premium / customização visual
- Exportação de relatório de plantão
- Dados ilimitados (se Firebase Blaze cobrar por banda)

---

## Stripe — setup

### Produtos e Preços
1. Stripe Dashboard → Products → Create Product
2. Nome: "Plantão Pro"
3. Preço: R$14,99/mês (recurring)
4. Salvar o `price_id` (ex: `price_1Qwx...`) como variável de ambiente

### Webhook
1. Stripe Dashboard → Developers → Webhooks → Add endpoint
2. URL: `https://plantao.net/api/webhooks-stripe`
3. Eventos: `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.deleted`
4. Copiar `webhook_secret` (ex: `whsec_...`) como variável de ambiente

### Variáveis de ambiente
```
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## Limites do Firebase Spark vs Blaze

| Recurso | Spark (grátis) | Blaze (pago conforme uso) |
|---------|---------------|--------------------------|
| Conexões simultâneas | 100 | Ilimitado |
| Downloads Realtime DB | 10 GB/mês | $1/GB adicional |
| Uploads | 2 GB/mês | $1/GB adicional |
| Cloud Functions | 2M/mês | $0.40/milhão |

**Quando subir pro Blaze:** ao implementar o Stripe. O custo de 100–200 usuários no Blaze é ~$5–15/mês. O Stripe cobre isso com 1 assinatura.

---

## Ordem de implementação (quando chegar a hora)

1. **Stripe Dashboard**: criar produto + preço + webhook
2. **Variáveis de ambiente**: adicionar no Vercel
3. **`api/create-checkout.js`**: endpoint de checkout
4. **`api/webhooks-stripe.js`**: processar eventos
5. **Store `planosStore.js`**: ler `tier` do Firebase
6. **Tela de upgrade**: modal/rota quando Free bater o limite
7. **`api/portal.js`**: gerenciar assinatura (cancelar, trocar cartão)
8. **Testar ciclo completo**: cadastrar, assinar, renovar, cancelar
9. **Upgrade Firebase**: Spark → Blaze

---

## Riscos

| Risco | Mitigação |
|-------|-----------|
| Usuário paga mas webhook falha | Implementar retry + verificação manual no admin dashboard |
| Cartão recusado na renovação | Stripe tenta automaticamente por ~7 dias antes de cancelar |
| Usuário quer cancelar | Stripe Customer Portal resolve sem código extra |
| Fraude / chargeback | Stripe Radar cobre a maior parte |
| Usuário Free acusa "golpe" por não avisar | Na landing, deixar claro: "acesso antecipado limitado — modelo gratuito pode ser descontinuado" |

---

## Referências

- [Stripe Checkout Session](https://stripe.com/docs/api/checkout/sessions/create)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Stripe Customer Portal](https://stripe.com/docs/customer-management)
- [Vercel env vars](https://vercel.com/docs/projects/environment-variables)
- [Firebase Blaze pricing](https://firebase.google.com/pricing)
