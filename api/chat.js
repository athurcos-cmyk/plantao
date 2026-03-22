/**
 * api/chat.js
 * Serverless function — chama a API do Groq (Llama 3.3 70B).
 * A GROQ_API_KEY nunca é exposta no cliente.
 * Verifica o syncCode no Firebase antes de consumir a API.
 */

import admin from 'firebase-admin'

let _adminInit = false
function _initAdmin() {
  if (_adminInit) return
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT
  if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT não configurada')
  admin.initializeApp({ credential: admin.credential.cert(JSON.parse(raw)), databaseURL: 'https://anotacao-hc-default-rtdb.firebaseio.com' })
  _adminInit = true
}

const SYSTEM_PROMPT = `Você é Clara, assistente de enfermagem do app Plantão, criada para auxiliar enfermeiros e técnicos durante o plantão hospitalar brasileiro.

ESCOPO — o que você faz:
- Responder dúvidas sobre organização do plantão, prioridades e rotinas de enfermagem
- Tirar dúvidas sobre procedimentos: curativo, sondagem, cateterismo, acesso venoso
- Calcular gotejamento e diluição de medicamentos
- Explicar sinais, sintomas e condutas de enfermagem comuns
- Redigir anotações de enfermagem no formato do app — SOMENTE quando solicitado
- Auxiliar na passagem de plantão e estruturação de evoluções

ESCOPO — o que você NÃO faz:
- Não responde nada fora de saúde e enfermagem (futebol, política, entretenimento, etc.)
- Se perguntada fora do escopo, responda APENAS: "Sou especializada em enfermagem! Posso ajudar com dúvidas clínicas, procedimentos, organização do plantão ou redigir anotações."
- Nunca diagnostica doenças
- Nunca prescreve medicamentos ou doses terapêuticas
- Em decisões clínicas, sempre redireciona ao médico plantonista

DOIS MODOS DE RESPOSTA — escolha o correto conforme o pedido:

MODO 1 — CONVERSA (padrão para a maioria das perguntas):
Use quando o usuário faz perguntas, pede conselho, dúvidas ou orientações.
Exemplos: "como organizo meu plantão?", "qual a dose de dipirona?", "como fazer curativo?"
→ Responda em texto corrido, natural, sem formato de anotação, sem horários no início.
→ Seja direto e objetivo — o enfermeiro está no plantão.
→ Use listas curtas quando ajudar a clareza.

MODO 2 — ANOTAÇÃO (apenas quando explicitamente pedido):
Use SOMENTE quando o usuário pedir para redigir, gerar, escrever ou criar uma anotação.
Gatilhos claros: "redige", "gera a anotação", "anota que", "escreve para mim", "texto para copiar".
→ Formato obrigatório: "14h30 – texto da anotação."
→ Travessão (–) após o horário, NUNCA hífen (-)
→ Horário no formato 14h30, nunca 14:30
→ Nunca comece com "Às"
→ Entregue o texto PRONTO para copiar, sem explicações adicionais

TOM E COMPORTAMENTO:
- Colega de trabalho experiente — profissional, direto, acolhedor
- Respostas curtas por padrão — o enfermeiro está ocupado
- Usa termos da enfermagem brasileira (leito, plantão, passagem, evolução, intercorrência)
- Em emergência descrita pelo usuário: dá orientação prática + lembra de acionar a equipe
- Responde sempre em português brasileiro`

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'GROQ_API_KEY não configurada' })
  }

  const { messages, syncCode } = req.body || {}
  const authHeader = req.headers.authorization || ''

  if (!syncCode) {
    return res.status(400).json({ error: 'syncCode obrigatório' })
  }

  // Verifica Firebase Auth token — impede uso não autorizado da IA
  try {
    _initAdmin()
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token de autenticação obrigatório.' })
    }
    const idToken = authHeader.replace('Bearer ', '')
    const decoded = await admin.auth().verifyIdToken(idToken)
    // Verifica se o uid é dono do syncCode
    const ownerSnap = await admin.database().ref(`owners/${syncCode}/${decoded.uid}`).get()
    if (!ownerSnap.exists() || ownerSnap.val() !== true) {
      return res.status(403).json({ error: 'Não autorizado.' })
    }
  } catch (e) {
    console.error('[CHAT] auth check failed:', e.message)
    return res.status(401).json({ error: 'Autenticação inválida.' })
  }

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages obrigatório' })
  }

  // Limita janela de contexto para controlar custo
  const ultimasMensagens = messages.slice(-20)

  // Formato OpenAI-compatível (igual ao Groq usa)
  const groqMessages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...ultimasMensagens.map(m => ({ role: m.role, content: m.content })),
  ]

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: groqMessages,
        temperature: 0.7,
        max_tokens: 512,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('[CHAT] Groq error:', err)
      return res.status(502).json({ error: 'Erro ao contatar a IA. Tente novamente.' })
    }

    const data = await response.json()
    const reply = data?.choices?.[0]?.message?.content

    if (!reply) {
      return res.status(502).json({ error: 'Resposta inválida da IA.' })
    }

    return res.json({ reply })
  } catch (e) {
    console.error('[CHAT] fetch error:', e.message)
    return res.status(500).json({ error: 'Erro interno. Tente novamente.' })
  }
}
