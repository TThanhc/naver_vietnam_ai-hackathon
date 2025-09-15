import type { UseTasksReturn } from '../types'
import { differenceInMinutes, isBefore } from 'date-fns'

export default function AnalyticsView({ tasks }: UseTasksReturn){
  const total = tasks.length
  const done = tasks.filter(t=>t.status==='done').length
  const overdue = tasks.filter(t=>t.dueAt && isBefore(new Date(t.dueAt), new Date()) && t.status!=='done').length
  const est = tasks.reduce((a,t)=>a+(t.estimatedMin??0),0)
  const act = tasks.reduce((a,t)=>a+(t.actualMin??0),0)

  const byCourse = Object.entries(tasks.reduce((acc:Record<string,number>, t)=>{
    const k = t.course || '—'
    acc[k] = (acc[k]||0) + 1
    return acc
  }, {}))

  const last7 = tasks
    .filter(t=>t.status==='done')
    .slice(0, 50)
    .map(t=>({
      title: t.title,
      ratio: (t.actualMin ?? 0) && (t.estimatedMin ?? 0) ? (t.actualMin!/(t.estimatedMin!)) : 1
    }))

  return (
    <section className="page grid" style={{gap:16}}>
      <h1>Analytics</h1>
      <div className="grid cols-3">
        <div className="card">
          <div className="muted small">Tasks</div>
          <div className="kpi">{done}/{total} done</div>
        </div>
        <div className="card">
          <div className="muted small">Overdue (not done)</div>
          <div className="kpi" style={{color:'#ffb3b3'}}>{overdue}</div>
        </div>
        <div className="card">
          <div className="muted small">Time (Est → Actual)</div>
          <div className="kpi">{est} → {act} min</div>
        </div>
      </div>

      <div className="grid cols-2">
        <div className="card">
          <strong>Tasks by course</strong>
          <hr className="div" />
          {byCourse.length===0 ? <div className="muted small">No data</div> : (
            <ul style={{listStyle:'none', padding:0, margin:0, display:'grid', gap:6}}>
              {byCourse.map(([k,v])=>(
                <li key={k} className="row">
                  <span className="tag">{k}</span>
                  <div className="spacer" />
                  <span className="badge">{v}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <strong>Estimate vs Actual (recent done)</strong>
          <hr className="div" />
          {last7.length===0 ? <div className="muted small">Mark tasks as done to see chart</div> : (
            <div style={{display:'grid', gap:6}}>
              {last7.map((x,i)=>(
                <div key={i} className="row" title={x.title}>
                  <div className="muted small" style={{width:26}}>{Math.round(x.ratio*100)}%</div>
                  <div style={{height:10, background:'#143232', border:'1px solid #1e4a4a', borderRadius:6, flex:1, overflow:'hidden'}}>
                    <div style={{height:'100%', width: Math.min(180, Math.round(x.ratio*100))+'px', background:'linear-gradient(90deg, #45d1ff, #5ff2a5)'}} />
                  </div>
                </div>
              ))}
              <div className="muted small">100% = đúng ước lượng; &gt;100% = lâu hơn dự kiến.</div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
