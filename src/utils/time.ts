import { format, isBefore, isAfter, addMinutes, differenceInMinutes, isSameDay } from 'date-fns'

export const fmtDate = (iso?: string | null) => iso ? format(new Date(iso), 'dd/MM HH:mm') : '—'
export const overdue = (iso?: string | null) => iso ? isBefore(new Date(iso), new Date()) : false
export const dueSoon = (iso?: string | null, hours=24) => {
  if(!iso) return false
  const d = new Date(iso)
  const now = new Date()
  return isAfter(d, now) && differenceInMinutes(d, now) <= hours*60
}
export const plusMinutesISO = (startISO: string, min: number) =>
  addMinutes(new Date(startISO), min).toISOString()

export const sameDay = (a?: string|null, b?: string|null) =>
  (a && b) ? isSameDay(new Date(a), new Date(b)) : false
