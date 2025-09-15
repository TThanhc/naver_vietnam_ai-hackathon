import type { Task } from '../types'
import { fmtDate, overdue, dueSoon } from '../utils/time'

export default function TaskList({
  tasks,
  onUpdate,
  onRemove
}:{
  tasks: Task[]
  onUpdate: (id: string, patch: Partial<Task>) => void
  onRemove: (id: string) => void
}){
  return (
    <table className="table">
      <thead>
        <tr>
          <th style={{width:40}}></th>
          <th>Task</th>
          <th>Course</th>
          <th>Due</th>
          <th>Est</th>
          <th>Status</th>
          <th style={{width:110}}></th>
        </tr>
      </thead>
      <tbody>
        {tasks.map(t=>(
          <tr key={t.id}>
            <td>
              <input type="checkbox" checked={t.status==='done'} onChange={e=>onUpdate(t.id, { status: e.target.checked ? 'done':'todo' })} />
            </td>
            <td>{t.title}</td>
            <td>{t.course ? <span className="tag">{t.course}</span> : '—'}</td>
            <td>
              {fmtDate(t.dueAt)}
              {overdue(t.dueAt) && <span className="pill" style={{borderColor:'#5a2323', color:'#ffb3b3'}}>overdue</span>}
              {!overdue(t.dueAt) && dueSoon(t.dueAt, 24) && <span className="pill">soon</span>}
            </td>
            <td>{t.estimatedMin ?? '—'}</td>
            <td>
              <select value={t.status} onChange={e=>onUpdate(t.id, { status: e.target.value as Task['status'] })}>
                <option value="todo">todo</option>
                <option value="doing">doing</option>
                <option value="done">done</option>
              </select>
            </td>
            <td className="row right">
              <button className="btn ghost" onClick={()=>onUpdate(t.id, { dueAt: t.dueAt ? null : new Date(Date.now()+36e5).toISOString() })}>
                {t.dueAt ? 'Clear due' : 'Due +1h'}
              </button>
              <button className="btn danger" onClick={()=>onRemove(t.id)}>Del</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
