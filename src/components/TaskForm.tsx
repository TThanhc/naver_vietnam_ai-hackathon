import { useState } from 'react'
import type { Task } from '../types'

export default function TaskForm({ onSubmit }:{
  onSubmit: (t: Omit<Task,'id'|'createdAt'|'updatedAt'>) => void
}){
  const [title, setTitle] = useState('')
  const [course, setCourse] = useState('')
  const [dueLocal, setDueLocal] = useState('')
  const [est, setEst] = useState<number|''>('')

  function handleSubmit(e: React.FormEvent){
    e.preventDefault()
    if(!title.trim()) return
    onSubmit({
      title: title.trim(),
      course: course.trim() || undefined,
      dueAt: dueLocal ? new Date(dueLocal).toISOString() : null,
      estimatedMin: est === '' ? null : Number(est),
      actualMin: 0,
      status: 'todo'
    })
    setTitle(''); setCourse(''); setDueLocal(''); setEst('')
  }

  return (
    <form className="card grid cols-3" onSubmit={handleSubmit}>
      <input className="input" placeholder="Task title *" value={title} onChange={e=>setTitle(e.target.value)} />
      <input className="input" placeholder="Course (optional)" value={course} onChange={e=>setCourse(e.target.value)} />
      <div className="row">
        <input className="input" type="datetime-local" value={dueLocal} onChange={e=>setDueLocal(e.target.value)} />
        <input className="input" type="number" min={5} step={5} placeholder="Est (min)" value={est} onChange={e=>setEst(e.target.value===''?'':Number(e.target.value))} />
        <button className="btn primary" type="submit">Add</button>
      </div>
    </form>
  )
}
