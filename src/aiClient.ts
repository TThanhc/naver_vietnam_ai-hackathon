import type { Task } from './types'

type ExtractResult = { tasks: Array<{ title: string; course?: string; dueAt?: string; estimatedMin?: number }> }
type PrioritizeResult = { order: Array<{ id: string; reason: string }>; notes?: string }

async function postAI<T>(body: any): Promise<{ ok: boolean; data?: T; reason?: string }> {
  try{
    const res = await fetch('/api/ai', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) })
    return await res.json()
  }catch{
    return { ok:false, reason:'network_error' }
  }
}

export async function aiExtract(text: string, hint?: { defaultCourse?: string }){
  return await postAI<ExtractResult>({ mode:'extract', text, hint })
}
export async function aiPrioritize(tasks: Task[]){
  const slim = tasks.map(t=>({ id:t.id, title:t.title, status:t.status, dueAt:t.dueAt??null, estimatedMin:t.estimatedMin??null }))
  return await postAI<PrioritizeResult>({ mode:'prioritize', tasks: slim })
}
