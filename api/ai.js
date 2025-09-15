export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, reason: 'method_not_allowed' })
  const apiKey = process.env.OPENAI_API_KEY
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini'
  if (!apiKey) return res.status(200).json({ ok: false, reason: 'no_api_key' })

  try {
    const { mode, text, tasks, hint } = req.body ?? {}
    let messages = []

    if (mode === 'extract') {
      messages = [
        { role: 'system', content: `Extract student tasks from raw text. Output STRICT JSON ONLY:
{"tasks":[{"title":string,"course":string?,"dueAt":string?,"estimatedMin":number?}]}
- "dueAt" must be ISO 8601 if present; if unsure, omit.
- Titles concise (<=12 words).
- Convert relative times to ISO (assume user's local now).
- If default course provided, use it when not specified.` },
        { role: 'user', content: `Default course: ${hint?.defaultCourse ?? '(none)'}\n\nRAW:\n${text}` }
      ]
    } else if (mode === 'prioritize') {
      messages = [
        { role: 'system', content: `Given tasks, return STRICT JSON ONLY:
{"order":[{"id":string,"reason":string}], "notes":string?}
Rules:
- Up to 7 items, sorted by do-now priority.
- Consider: overdue > soonest due, status(todo>doing), short tasks can go earlier.
- Reasons <= 18 words.` },
        { role: 'user', content: `Tasks JSON:\n${JSON.stringify(tasks)}` }
      ]
    } else {
      return res.status(400).json({ ok: false, reason: 'bad_mode' })
    }

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({ model, response_format: { type:'json_object' }, temperature: 0.2, messages })
    })
    const data = await r.json()
    const content = data?.choices?.[0]?.message?.content ?? '{}'
    let parsed
    try { parsed = JSON.parse(content) } catch { parsed = { error:'bad_json', raw: content } }
    return res.status(200).json({ ok:true, mode, data: parsed })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ ok:false, reason:'ai_error' })
  }
}
