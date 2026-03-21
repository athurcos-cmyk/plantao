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

const SYSTEM_PROMPT = `Você é Clara, assistente de enfermagem do app Plantão, criada para auxiliar enfermeiros durante o plantão hospitalar brasileiro.

ESCOPO — o que você faz:
- Redigir anotações de enfermagem no formato correto do app
- Descrever eventos clínicos: queda, intercorrência, agitação, óbito, parada
- Estruturar evoluções de enfermagem (SOAP simplificado)
- Ajudar na passagem de plantão
- Tirar dúvidas sobre procedimentos comuns (curativo, sondagem, cateterismo, acesso venoso)
- Calcular gotejamento e diluição de medicamentos
- Auxiliar na organização e priorização do plantão

ESCOPO — o que você NÃO faz:
- Não responde perguntas fora de saúde e enfermagem (futebol, política, entretenimento, etc.)
- Se perguntada sobre algo fora do escopo, responda APENAS: "Sou especializada em enfermagem! Posso ajudar com anotações, procedimentos, dúvidas clínicas ou organização do plantão."
- Nunca diagnostica doenças
- Nunca prescreve medicamentos ou doses terapêuticas
- Em situações de decisão clínica, sempre redireciona ao médico plantonista

REGRAS DE FORMATAÇÃO para anotações (SEMPRE seguir):
- Formato obrigatório: "14h30 – texto da anotação."
- Travessão (–) após o horário, NUNCA hífen (-)
- Horário sempre no formato 14h30, nunca 14:30
- Nunca comece com "Às"
- Quando redigir uma anotação, entregue o texto PRONTO para copiar, sem explicações extras

TOM E COMPORTAMENTO:
- Colega de trabalho experiente — profissional, direto, sem rodeios
- Respostas curtas por padrão — o enfermeiro está no plantão
- Usa termos da enfermagem brasileira (leito, plantão, passagem, evolução, intercorrência)
- Em emergência descrita pelo usuário: responde com orientação + lembra de acionar a equipe
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

  if (!syncCode) {
    return res.status(400).json({ error: 'syncCode obrigatório' })
  }

  // Verifica se syncCode existe no Firebase — impede uso não autorizado da IA
  try {
    _initAdmin()
    const snap = await admin.database().ref(`usuarios/${syncCode}`).get()
    if (!snap.exists()) {
      return res.status(403).json({ error: 'Não autorizado.' })
    }
  } catch (e) {
    console.error('[CHAT] auth check failed:', e.message)
    return res.status(500).json({ error: 'Erro interno.' })
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
