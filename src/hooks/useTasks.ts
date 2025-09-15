import { useEffect, useMemo, useState } from 'react'
import { load, save } from '../utils/storage'
import type { Task, UseTasksReturn } from '../types'

const seed: Task[] = [
  {
    id: crypto.randomUUID(), title: 'Read Chapter 3 - DS&A', course: 'CS201',
    status: 'todo', estimatedMin: 60, actualMin: 0,
    dueAt: new Date(Date.now()+36e5*6).toISOString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  {
    id: crypto.randomUUID(), title: 'Group meeting notes', course: 'HCI302',
    status: 'doing', estimatedMin: 40, actualMin: 10,
    dueAt: new Date(Date.now()+36e5*30).toISOString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  {
    id: crypto.randomUUID(), title: 'Lab 2 submission', course: 'PHY101',
    status: 'todo', estimatedMin: 90, actualMin: 0,
    dueAt: new Date(Date.now()-36e5*5).toISOString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  }
]

export function useTasks(): UseTasksReturn {
  const [tasks, setTasks] = useState<Task[]>(()=>load<Task[]>(seed))

  useEffect(()=>{ save(tasks) }, [tasks])

  function create(t: Omit<Task,'id'|'createdAt'|'updatedAt'>){
    const now = new Date().toISOString()
    setTasks(prev => [{...t, id: crypto.randomUUID(), createdAt: now, updatedAt: now}, ...prev])
  }
  function update(id: string, patch: Partial<Task>){
    const now = new Date().toISOString()
    setTasks(prev => prev.map(t => t.id===id ? {...t, ...patch, updatedAt: now} : t))
  }
  function remove(id: string){
    setTasks(prev => prev.filter(t => t.id!==id))
  }
  function clearDone(){
    setTasks(prev => prev.filter(t => t.status!=='done'))
  }

  return { tasks, create, update, remove, clearDone }
}

/** Procrastination coefficient: avg(actual / estimated) for done tasks (>=1). Default 1.2 */
export function useProcrastinationCoef(tasks: Task[]){
  return useMemo(()=>{
    const done = tasks.filter(t=>t.status==='done' && (t.actualMin ?? 0) > 0 && (t.estimatedMin ?? 0) > 0)
    if(done.length===0) return 1.2
    const ratios = done.map(t => (t.actualMin!)/(t.estimatedMin!))
    const avg = ratios.reduce((a,b)=>a+b,0)/ratios.length
    return Math.max(1, Number(avg.toFixed(2)))
  }, [tasks])
}
