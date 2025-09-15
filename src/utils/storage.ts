const KEY = 'studyflow.tasks.v1'

export function save<T>(data: T){
  localStorage.setItem(KEY, JSON.stringify({ v:1, data }))
}

export function load<T>(fallback: T): T {
  try{
    const raw = localStorage.getItem(KEY)
    if(!raw) return fallback
    const parsed = JSON.parse(raw)
    if(parsed?.v===1) return parsed.data as T
    return fallback
  }catch{
    return fallback
  }
}
