export type Task = {
  id: string
  title: string
  course?: string
  dueAt?: string | null // ISO
  estimatedMin?: number | null
  actualMin?: number | null
  status: 'todo' | 'doing' | 'done'
  createdAt: string // ISO
  updatedAt: string // ISO
}

export type UseTasksReturn = {
  tasks: Task[]
  create: (t: Omit<Task, 'id'|'createdAt'|'updatedAt'>) => void
  update: (id: string, patch: Partial<Task>) => void
  remove: (id: string) => void
  clearDone: () => void
}
