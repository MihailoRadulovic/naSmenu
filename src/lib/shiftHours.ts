export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function timeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return (h ?? 0) * 60 + (m ?? 0)
}

interface ShiftEntry {
  shiftType: string
  halfShift?: boolean
  middleStart?: number | null
  middleEnd?: number | null
}

export interface ShiftHoursSettings {
  firstHours: number
  secondHours: number
}

export function getShiftHours(entry: ShiftEntry, settings?: ShiftHoursSettings): number {
  if (entry.shiftType === 'first') {
    const h = settings?.firstHours ?? 8
    return entry.halfShift ? h / 2 : h
  }
  if (entry.shiftType === 'second') {
    const h = settings?.secondHours ?? 8
    return entry.halfShift ? h / 2 : h
  }
  if (entry.shiftType === 'middle') {
    if (entry.middleStart != null && entry.middleEnd != null && entry.middleEnd > entry.middleStart) {
      return (entry.middleEnd - entry.middleStart) / 60
    }
    return 0
  }
  return 0
}
