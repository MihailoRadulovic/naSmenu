export interface WeekBounds {
  startDate: Date
  endDate: Date
}

/** Vraća granice nedelje (pon 00:00 UTC → ned 23:59:59 UTC) za dati datum.
 *  Koristi UTC metode da izbegne timezone razlike između klijenta i servera. */
export function getWeekBounds(date: Date): WeekBounds {
  const d = new Date(date)
  // UTC day of week: 0=nedjelja, 1=ponedeljak ... 6=subota
  const day = d.getUTCDay()
  const diffToMon = day === 0 ? -6 : 1 - day
  const monday = new Date(d)
  monday.setUTCDate(d.getUTCDate() + diffToMon)
  monday.setUTCHours(0, 0, 0, 0)

  const sunday = new Date(monday)
  sunday.setUTCDate(monday.getUTCDate() + 6)
  sunday.setUTCHours(23, 59, 59, 999)

  return { startDate: monday, endDate: sunday }
}

/** Pomera granice nedelje za n nedelja (može biti negativno) */
export function addWeeks(bounds: WeekBounds, n: number): WeekBounds {
  const newStart = new Date(bounds.startDate)
  newStart.setUTCDate(newStart.getUTCDate() + n * 7)
  return getWeekBounds(newStart)
}

/** Vraća granice trenutne nedelje */
export function getCurrentWeekBounds(): WeekBounds {
  return getWeekBounds(new Date())
}

/** Formatira datum u "09.03.2026." (koristi UTC da izbegne timezone shift) */
export function formatDate(date: Date): string {
  const d = String(date.getUTCDate()).padStart(2, '0')
  const m = String(date.getUTCMonth() + 1).padStart(2, '0')
  const y = date.getUTCFullYear()
  return `${d}.${m}.${y}.`
}

/** Formatira datum u "09.03." (koristi UTC) */
export function formatDateShort(date: Date): string {
  const d = String(date.getUTCDate()).padStart(2, '0')
  const m = String(date.getUTCMonth() + 1).padStart(2, '0')
  return `${d}.${m}.`
}

/** Vraća ISO broj nedelje u godini */
export function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

/** Formatira datum u ISO string za API: "2026-03-09" (koristi UTC) */
export function toISODateString(date: Date): string {
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, '0')
  const d = String(date.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
