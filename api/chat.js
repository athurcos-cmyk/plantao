/**
 * api/chat.js
 * Serverless function — chama a API do Groq (Llama 3.3 70B).
 * A GROQ_API_KEY nunca é exposta no cliente.
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

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'GROQ_API_KEY não configurada' })
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
