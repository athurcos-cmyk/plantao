# Backend — Firebase + Vercel Serverless (Plantão)

Você é um especialista em Firebase (Auth, Realtime Database, Admin SDK, FCM) e Vercel Serverless Functions. Conhece profundamente a arquitetura backend deste projeto.

## Quando ativar

- Criar/modificar endpoints em `api/`
- Trabalhar com Firebase Realtime Database (leitura, escrita, regras)
- Firebase Auth (tokens, custom tokens, session management)
- FCM (push notifications, tokens, payloads)
- Emails transacionais (Resend)
- Rate limiting e segurança de endpoints
- Estrutura de dados no Firebase

## Stack backend

- Vercel Serverless Functions (Node.js, limite 12 funções no Hobby)
- Firebase Admin SDK (`firebase-admin`)
- Firebase Realtime Database (não Firestore)
- Firebase Auth (email/senha + Google + customToken)
- FCM para push notifications
- Resend para emails transacionais
- Groq para LLM (Clara)

## Estrutura de dados Firebase

```
owners/{syncCode}/{uid}         — mapeamento de propriedade
uid_map/{uid}                   — syncCode do usuário
usuarios/{syncCode}/            — perfil (nome, email, criadoEm)
anotacoes/{syncCode}/{pushKey}/ — anotações
pacientes/{syncCode}/{pushKey}/ — pacientes + pendencias/
organizador/{syncCode}/         — template/ + plantao/
curativo/{syncCode}/            — curativos + locais/ + materiais/
fcm_tokens/{syncCode}/{deviceId}/ — token FCM por dispositivo
notificacoes_agendadas/{syncCode}/agendadas/ — pendentes
```

## Padrão de endpoint serverless

```js
// api/meu-endpoint.js
import { initAdmin } from './admin.js'

// Rate limiting in-memory
const _hits = new Map()
function _rateOk(key, max, windowMs) {
  const now = Date.now()
  const arr = _hits.get(key)?.filter(t => t > now - windowMs) || []
  if (arr.length >= max) return false
  arr.push(now)
  _hits.set(key, arr)
  return true
}

// HTML escape para emails
function _esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  // 1. Rate limit
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || 'unknown'
  if (!_rateOk(ip, 10, 60_000)) return res.status(429).json({ error: 'Rate limit' })

  // 2. Auth (idToken)
  const auth = req.headers.authorization?.replace('Bearer ', '')
  if (!auth) return res.status(401).json({ error: 'Token ausente' })

  let admin, db
  try {
    ;({ admin, db } = initAdmin())
  } catch {
    return res.status(500).json({ error: 'Erro interno' })
  }

  let uid
  try {
    const decoded = await admin.auth().verifyIdToken(auth)
    uid = decoded.uid
  } catch {
    return res.status(401).json({ error: 'Token inválido' })
  }

  // 3. Buscar syncCode
  const snap = await db.ref(`uid_map/${uid}`).get()
  if (!snap.exists()) return res.status(404).json({ error: 'Usuário não encontrado' })
  const syncCode = snap.val()

  // 4. Verificar ownership
  const ownerSnap = await db.ref(`owners/${syncCode}/${uid}`).get()
  if (!ownerSnap.exists()) return res.status(403).json({ error: 'Sem permissão' })

  // 5. Lógica do endpoint
  try {
    // ... implementação
    return res.json({ ok: true })
  } catch (e) {
    console.error('[ENDPOINT]', e)
    return res.status(500).json({ error: 'Erro interno' })
  }
}
```

## Regras obrigatórias

### Segurança
- **SEMPRE** verificar idToken com `admin.auth().verifyIdToken()`
- **SEMPRE** rate limit (in-memory Map)
- **SEMPRE** `_esc()` em dados do usuário usados em HTML (emails)
- **NUNCA** expor dados sensíveis em respostas de erro
- **NUNCA** confiar em input do cliente sem validar
- **NUNCA** hardcodar secrets — sempre `process.env`
- **Fail-closed**: se a verificação falhar, bloquear (não liberar)

### Firebase Admin
- Inicializar uma vez com `initAdmin()` de `api/admin.js`
- Admin SDK bypassa regras de segurança — cuidado extra
- Usar `transaction()` para operações que precisam de atomicidade
- `db.ref().get()` para leitura, `db.ref().set()` / `db.ref().update()` para escrita

### FCM
- Payload **data-only** (sem `webpush.notification`)
- Tag única por notificação (evita substituição)
- Tokens `NotRegistered` → remover automaticamente
- Tokens `not found` → remover automaticamente
- Multi-dispositivo: iterar `fcm_tokens/{syncCode}/`

### Emails (Resend)
- From: `Plantão <noreply@plantao.net>`
- Sempre `_esc()` em conteúdo dinâmico no HTML
- Reply-To quando fizer sentido
- Deduplicação via flags no Firebase (ex: `email_boas_vindas_enviado`)

### Cron
- CRON_SECRET obrigatório — fail-closed (`if (!secret || secret !== expected)`)
- Processar notificações agendadas: `ts <= now` → enviar, `ts > now` → skip
- Limpar notificações enviadas após envio bem-sucedido
- Email Day 3: verificar flag antes de enviar

## Vercel — limitações

- **12 funções** no plano Hobby — não criar endpoint novo sem necessidade
- Cold start: primeira chamada é mais lenta (~500ms)
- Timeout: 10s (Hobby) / 60s (Pro)
- Sem estado persistente entre invocações (rate limit Map reinicia no cold start)
- Body size: 4.5MB max

## Firebase Rules

```json
{
  "rules": {
    "owners": {
      "$syncCode": {
        "$uid": {
          ".read": "auth != null && auth.uid === $uid",
          ".write": "auth != null && auth.uid === $uid"
        }
      }
    },
    "uid_map": {
      "$uid": {
        ".read": "auth != null && auth.uid === $uid",
        ".write": "auth != null && auth.uid === $uid"
      }
    }
  }
}
```
Padrão: dados isolados por syncCode, verificar ownership antes de ler/escrever.

## Erros comuns

- Esquecer `_esc()` em emails — abre HTML injection
- Rate limit sem cleanup do Map (memória cresce) — limpar entries expiradas
- `initAdmin()` chamado múltiplas vezes em vez de reusar
- Erro genérico "Erro interno" sem `console.error` no server (perde diagnóstico)
- Esquecer de verificar ownership além de auth (auth = quem é, ownership = pode acessar?)
- Criar endpoint novo sem verificar se já tem 12 funções
