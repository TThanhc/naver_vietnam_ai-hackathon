import { addDays, addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, startOfMonth, startOfWeek, isSameMonth } from 'date-fns'
import type { UseTasksReturn, Task } from '../types'
import { sameDay } from '../utils/time'
import { useState } from 'react'

export default function CalendarView({ tasks, update }: UseTasksReturn){
  const [month, setMonth] = useState(new Date())
  const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 })
  const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start, end })
  const today = new Date()

  const tasksByDate = (d: Date) =>
    tasks.filter(t => t.dueAt && sameDay(t.dueAt, d.toISOString()))

  function bump(id: string){
    const t = tasks.find(x=>x.id===id)
    if(!t?.dueAt) return
    update(id, { dueAt: addDays(new Date(t.dueAt), 1).toISOString() })
  }

  return (
    <section className="page grid" style={{gap:16}}>
      <div className="row space-between">
        <h1>Calendar</h1>
        <div className="row">
          <button className="btn" onClick={()=>setMonth(addMonths(month,-1))}>← Prev</button>
          <div className="tag">{format(month,'MMMM yyyy')}</div>
          <button className="btn" onClick={()=>setMonth(addMonths(month,1))}>Next →</button>
        </div>
      </div>

      <div className="calendar">
        {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d=>
          <div key={d} className="muted small" style={{textAlign:'center'}}>{d}</div>
        )}
        {days.map((d, i)=>(
          <div key={i} className={`day ${d.toDateString()===today.toDateString()?'today':''} ${isSameMonth(d,month)?'':'muted'}`}>
            <div className="d">
              <span>{format(d,'d')}</span>
              <span className="muted small">{format(d,'MMM')}</span>
            </div>
            <div className="t">
              {tasksByDate(d).slice(0,4).map((t: Task)=>(
                <div key={t.id} className="chip">
                  {t.title}
                  <button className="btn ghost" style={{marginLeft:6, padding:'2px 6px'}} onClick={()=>bump(t.id)}>+1d</button>
                </div>
              ))}
              {tasksByDate(d).length>4 && <div className="muted small">+{tasksByDate(d).length-4} more…</div>}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
