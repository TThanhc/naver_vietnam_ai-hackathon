import { useMemo, useState } from 'react'
import type { UseTasksReturn, Task } from '../types'
import { aiExtract, aiPrioritize } from '../aiClient'

export default function AIAssistView(props: UseTasksReturn){
  const { tasks, create, update } = props
  return (
    <section className="page grid" style={{gap:16}}>
      <h1>AI Assist</h1>
      <div className="grid cols-2">
        <ExtractCard onCreate={(arr)=>{
          for(const t of arr){
            const payload: Omit<Task,'id'|'createdAt'|'updatedAt'> = {
              title: t.title,
              course: t.course,
              dueAt: t.dueAt ?? null,
              estimatedMin: t.estimatedMin ?? null,
              actualMin: 0,
              status: 'todo'
            }
            create(payload)
          }
        }} />
        <PrioritizeCard tasks={tasks} onUpdate={update} />
      </div>
    </section>
  )
}

function ExtractCard({ onCreate }:{ onCreate: (arr:{title:string;course?:string;dueAt?:string;estimatedMin?:number}[])=>void }){
  const [text, setText] = useState('')
  const [course, setCourse] = useState('')
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<any[]>([])
  const [msg, setMsg] = useState<string>('')

  async function run(){
    setLoading(true); setMsg('')
    const r = await aiExtract(text, { defaultCourse: course || undefined })
    if(r.ok && r.data?.tasks?.length){
      setPreview(r.data.tasks.slice(0,12))
    }else{
      // fallback: lấy các dòng bắt đầu bằng bullet
      const simple = text.split('\n')
        .map(s=>s.trim()).filter(s=>/^[-*•]/.test(s))
        .map(s=>s.replace(/^[-*•]\s?/, ''))
        .filter(Boolean).map(t=>({ title: t, course: course || undefined }))
        .slice(0,12)
      setPreview(simple)
      if(!r.ok) setMsg('⚠️ Không có API key / AI lỗi. Dùng heuristic fallback.')
    }
    setLoading(false)
  }

  return (
    <div className="card">
      <div className="row space-between">
        <strong>🧠 Extract tasks từ mô tả</strong>
        <span className="muted small">Dán đề bài / syllabus</span>
      </div>
      <div className="row" style={{marginTop:8}}>
        <textarea className="input" rows={8} placeholder="- Project checkpoint 1 (due 15/09 23:59)
- Reading Ch.2
- Quiz tuần 3 ..."
          value={text} onChange={e=>setText(e.target.value)} />
      </div>
      <div className="toolbar">
        <input className="input" placeholder="Gợi ý Course (optional)" value={course} onChange={e=>setCourse(e.target.value)} />
        <div className="spacer" />
        <button className="btn" onClick={run} disabled={loading}>{loading?'Extracting…':'Extract'}</button>
      </div>
      {msg && <div className="muted small" style={{marginTop:6}}>{msg}</div>}
      {preview.length>0 && (
        <>
          <hr className="div" />
          <ul style={{margin:0, paddingLeft:20}}>
            {preview.map((t,i)=>(
              <li key={i} style={{marginBottom:6}}>
                {t.title} {t.course && <span className="pill">{t.course}</span>} {t.dueAt && <span className="pill">Due {new Date(t.dueAt).toLocaleString()}</span>}
              </li>
            ))}
          </ul>
          <div className="row right" style={{marginTop:8}}>
            <button className="btn primary" onClick={()=>onCreate(preview)}>Create tasks</button>
          </div>
        </>
      )}
    </div>
  )
}

function PrioritizeCard({ tasks, onUpdate }:{ tasks: Task[]; onUpdate:(id:string, p:Partial<Task>)=>void }){
  const candid = useMemo(()=> tasks.filter(t=>t.status!=='done'), [tasks])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Array<{id:string;reason:string}>>([])
  const [notes, setNotes] = useState('')

  async function run(){
    setLoading(true); setNotes('')
    const r = await aiPrioritize(candid)
    if(r.ok && r.data?.order?.length){
      setResult(r.data.order.slice(0,7)); setNotes(r.data.notes ?? '')
    }else{
      // fallback: due gần nhất trước
      const ranked = candid
        .map(t=>{
          const due = t.dueAt ? new Date(t.dueAt).getTime() : Infinity
          const score = isFinite(due) ? 1e12 - due : 0
          return { id: t.id, reason: t.dueAt ? 'nearest deadline' : 'no deadline', score }
        })
        .sort((a,b)=>b.score-a.score).slice(0,7)
      setResult(ranked.map(({id,reason})=>({id,reason})))
      setNotes('⚠️ Không có API key / AI lỗi. Dùng heuristic fallback.')
    }
    setLoading(false)
  }

  return (
    <div className="card">
      <div className="row space-between">
        <strong>⚡ Prioritize Do Now</strong>
        <span className="muted small">Xếp 5–7 việc nên làm trước</span>
      </div>
      <div className="toolbar">
        <span className="muted">Candidates: {candid.length}</span>
        <div className="spacer" />
        <button className="btn" onClick={run} disabled={loading || candid.length===0}>{loading?'Thinking…':'Prioritize'}</button>
      </div>
      {notes && <div className="muted small" style={{marginTop:6}}>{notes}</div>}
      {result.length>0 && (
        <ol style={{paddingLeft:18, marginTop:8, display:'grid', gap:8}}>
          {result.map((r,i)=>{
            const t = tasks.find(x=>x.id===r.id)
            if(!t) return null
            return (
              <li key={r.id} className="card">
                <div className="row space-between">
                  <div>
                    <strong>{t.title}</strong> {t.course && <span className="pill">{t.course}</span>}
                  </div>
                  <select value={t.status} onChange={e=>onUpdate(t.id, { status: e.target.value as Task['status'] })}>
                    <option value="todo">todo</option>
                    <option value="doing">doing</option>
                    <option value="done">done</option>
                  </select>
                </div>
                <div className="muted small" style={{marginTop:6}}>{r.reason}</div>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
