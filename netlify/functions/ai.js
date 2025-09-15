export async function handler(event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: JSON.stringify({ ok: false, reason: 'method_not_allowed' }) }
  const apiKey = process.env.OPENAI_API_KEY
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini'
  if (!apiKey) return { statusCode: 200, body: JSON.stringify({ ok: false, reason: 'no_api_key' }) }

  try {
    const { mode, text, tasks, hint } = JSON.parse(event.body || '{}')
    let messages = []
    if (mode === 'extract') {
      messages = [
        { role: 'system', content: `You extract student tasks... (same as Vercel version)` },
        { role: 'user', content: `Default course hint: ${hint?.defaultCourse ?? '(none)'}\n\nRaw:\n${text}` }
      ]
    } else if (mode === 'prioritize') {
      messages = [
        { role: 'system', content: `You are a smart student planner... (same as Vercel version)` },
        { role: 'user', content: `Tasks JSON:\n${JSON.stringify(tasks)}` }
      ]
    } else {
      return { statusCode: 400, body: JSON.stringify({ ok: false, reason: 'bad_mode' }) }
    }

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({ model, response_format: { type: 'json_object' }, temperature: 0.2, messages })
    })
    const data = await r.json()
    const content = data?.choices?.[0]?.message?.content ?? '{}'
    let parsed
    try { parsed = JSON.parse(content) } catch { parsed = { error: 'bad_json', raw: content } }
    return { statusCode: 200, body: JSON.stringify({ ok: true, mode, data: parsed }) }
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ ok: false, reason: 'ai_error' }) }
  }
}
