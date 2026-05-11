const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent'

function sanitize(input: string): string {
  return input.replace(/<[^>]*>/g, '').trim()
}

export async function generateHandler(req: Request): Promise<Response> {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const raw = (body as Record<string, unknown>)?.jobTitle
  if (typeof raw !== 'string' || !raw.trim()) {
    return Response.json({ error: 'jobTitle is required' }, { status: 400 })
  }
  if (raw.trim().length > 100) {
    return Response.json({ error: 'jobTitle must be 100 characters or fewer' }, { status: 400 })
  }

  const jobTitle = sanitize(raw)

  const prompt = `You are an expert interviewer. Generate exactly 3 thoughtful, behavioral interview questions for a ${jobTitle} role. Return ONLY a JSON array of 3 strings. No preamble, no numbering, no extra text. Example: ["Question one?", "Question two?", "Question three?"]`

  const apiKey = process.env.GEMINI_API_KEY
  const geminiRes = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 512 },
    }),
  })

  if (!geminiRes.ok) {
    return Response.json({ error: 'Failed to generate questions. Please try again.' }, { status: 500 })
  }

  const geminiData = await geminiRes.json()
  const text: string = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

  let questions: string[]
  try {
    questions = JSON.parse(text)
    if (!Array.isArray(questions) || questions.length !== 3) throw new Error('unexpected shape')
  } catch {
    const match = text.match(/\[[\s\S]*\]/)
    if (!match) {
      return Response.json({ error: 'Failed to parse response. Please try again.' }, { status: 500 })
    }
    questions = JSON.parse(match[0])
  }

  return Response.json({ questions })
}
