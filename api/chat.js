/**
 * api/chat.js
 * Serverless function — chama a API do Google Gemini.
 * A GEMINI_API_KEY nunca é exposta no cliente.
 */

const SYSTEM_PROMPT = `Você é Clara, assistente de enfermagem do app Plantão, criado para auxiliar enfermeiros durante o plantão hospitalar.

Seu papel:
- Responder dúvidas de enfermagem de forma clara, objetiva e baseada em boas práticas
- Ajudar a redigir anotações de enfermagem no formato correto
- Descrever eventos clínicos como queda de paciente, intercorrência, evolução
- Auxiliar na organização do plantão

Regras de formatação para anotações (SEMPRE seguir quando redigir anotações):
- Formato obrigatório: "14h30 – texto da anotação."
- Use travessão (–) após o horário, NUNCA hífen (-)
- Horário sempre no formato 14h30, nunca 14:30
- Nunca comece com "Às"
- Quando não souber o horário exato, use "HHhMM –" como placeholder

Tom e comportamento:
- Profissional mas acessível e amigável
- Respostas curtas e diretas — o enfermeiro está no plantão e não tem tempo
- Em caso de dúvida clínica grave, sempre oriente a consultar o médico plantonista
- Nunca diagnostique nem prescreva medicamentos
- Responda em português brasileiro`

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY não configurada' })
  }

  const { messages, syncCode } = req.body || {}

  if (!syncCode) {
    return res.status(400).json({ error: 'syncCode obrigatório' })
  }

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages obrigatório' })
  }

  // Limita janela de contexto para controlar custo
  const ultimasMensagens = messages.slice(-20)

  // Converte formato { role, content } para o formato do Gemini
  const contents = ultimasMensagens.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 512,
        },
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('[CHAT] Gemini error:', err)
      return res.status(502).json({ error: 'Erro ao contatar a IA. Tente novamente.' })
    }

    const data = await response.json()
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text

    if (!reply) {
      return res.status(502).json({ error: 'Resposta inválida da IA.' })
    }

    return res.json({ reply })
  } catch (e) {
    console.error('[CHAT] fetch error:', e.message)
    return res.status(500).json({ error: 'Erro interno. Tente novamente.' })
  }
}
