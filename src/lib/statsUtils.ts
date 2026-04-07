import type { EmployeeStats, MiddleShiftGroup } from '@/types'
import { getShiftHours, type ShiftHoursSettings } from './shiftHours'

export interface RawEntry {
  employeeId: number
  shiftType: string
  halfShift: boolean
  middleStart?: number | null
  middleEnd?: number | null
  employee: {
    id: number
    name: string
    isActive: boolean
  }
}

export interface SimpleEmployee {
  id: number
  name: string
  isActive: boolean
}

export function computeEmployeeStats(
  entries: RawEntry[],
  employees: SimpleEmployee[],
  settings?: ShiftHoursSettings
): EmployeeStats[] {
  const map = new Map<number, EmployeeStats>()

  for (const emp of employees) {
    map.set(emp.id, {
      employee: { id: emp.id, name: emp.name, isActive: emp.isActive },
      firstShifts: 0,
      secondShifts: 0,
      middleShifts: 0,
      workDays: 0,
      offDays: 0,
      totalHours: 0,
      middleShiftGroups: [],
    })
  }

  for (const entry of entries) {
    const stat = map.get(entry.employeeId)
    if (!stat) continue
    const value = entry.halfShift ? 0.5 : 1
    const hours = getShiftHours(entry, settings)

    if (entry.shiftType === 'first') {
      stat.firstShifts += value
      stat.workDays += value
      stat.totalHours += hours
    } else if (entry.shiftType === 'second') {
      stat.secondShifts += value
      stat.workDays += value
      stat.totalHours += hours
    } else if (entry.shiftType === 'middle') {
      stat.middleShifts += 1
      stat.totalHours += hours
      // Group by duration
      if (hours > 0) {
        const existing = stat.middleShiftGroups.find((g) => g.hours === hours)
        if (existing) {
          existing.count += 1
        } else {
          stat.middleShiftGroups.push({ hours, count: 1 })
        }
      }
    } else if (entry.shiftType === 'off') {
      stat.offDays += 1
    }
  }

  return Array.from(map.values())
}
