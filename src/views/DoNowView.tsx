import { useMemo, useState } from 'react'
import type { UseTasksReturn } from '../types'
import TaskForm from '../components/TaskForm'
import TaskList from '../components/TaskList'
import { dueSoon, overdue } from '../utils/time'
import { useProcrastinationCoef } from '../hooks/useTasks'

export default function DoNowView({ tasks, create, update, remove, clearDone }: UseTasksReturn){
  const [q, setQ] = useState('')
  const coef = useProcrastinationCoef(tasks)

  // Ưu tiên: overdue > dueSoon > doing > todo, ước lượng thời gian theo hệ số trì hoãn
  const filtered = useMemo(()=>{
    const kw = q.trim().toLowerCase()
    const pool = kw ? tasks.filter(t =>
      t.title.toLowerCase().includes(kw) || (t.course||'').toLowerCase().includes(kw)
    ) : tasks

    return [...pool].sort((a,b)=>{
      const A = score(a), B = score(b)
      return B - A
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, q, coef])

  function score(t: any){
    const overdueScore = overdue(t.dueAt) ? 1000 : 0
    const soonScore = !overdue(t.dueAt) && dueSoon(t.dueAt, 24) ? 300 : 0
    const statusScore = t.status==='doing' ? 120 : t.status==='todo' ? 80 : 0
    const est = t.estimatedMin ?? 60
    const adjusted = est * coef
    const smallTaskBonus = adjusted <= 45 ? 40 : adjusted <= 90 ? 10 : 0
    return overdueScore + soonScore + statusScore + smallTaskBonus
  }

  return (
    <section className="page grid" style={{gap:16}}>
      <div>
        <h1>Do Now</h1>
        <div className="muted small">Procrastination coefficient: <span className="badge">{coef}×</span></div>
      </div>

      <TaskForm onSubmit={create} />

      <div className="toolbar">
        <input className="input" placeholder="Search title/course…" value={q} onChange={e=>setQ(e.target.value)} />
        <div className="spacer" />
        <button className="btn" onClick={clearDone}>Clear done</button>
      </div>

      <div className="card">
        <TaskList tasks={filtered} onUpdate={update} onRemove={remove} />
      </div>
    </section>
  )
}
