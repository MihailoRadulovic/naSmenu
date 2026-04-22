export type { Employee, Week, ScheduleEntry } from '@/generated/prisma/client'
import type { Employee, Week, ScheduleEntry } from '@/generated/prisma/client'

export interface EmployeeFormData {
  name: string
  notes?: string
  hourlyRate?: number
}

export const SHIFT_TYPES = {
  FIRST: 'first',
  SECOND: 'second',
  MIDDLE: 'middle',
  OFF: 'off',
  SICK_LEAVE: 'sick_leave',
  VACATION: 'vacation',
  LATE: 'late',
} as const

export type ShiftType = (typeof SHIFT_TYPES)[keyof typeof SHIFT_TYPES]

export const DAY_NAMES = [
  'Ponedeljak',
  'Utorak',
  'Sreda',
  'Četvrtak',
  'Petak',
  'Subota',
  'Nedelja',
] as const

export const DAY_NAMES_SHORT = [
  'PON', 'UTO', 'SRE', 'ČET', 'PET', 'SUB', 'NED',
] as const

// Raspored tipovi
export interface WeekWithEntries extends Week {
  entries: (ScheduleEntry & { employee: Employee })[]
}

export interface DayAssignment {
  shiftType: ShiftType
  halfShift: boolean
  middleStart?: number | null
  middleEnd?: number | null
}

export interface DaySchedule {
  [employeeId: number]: DayAssignment[]
}

export interface WeekSchedule {
  [day: number]: DaySchedule // 0=pon ... 6=ned
}

export interface WeekBounds {
  startDate: Date
  endDate: Date
}

export interface ScheduleEntryInput {
  day: number
  employeeId: number
  shiftType: ShiftType
  halfShift: boolean
  middleStart?: number | null
  middleEnd?: number | null
}

// --- Statistika tipovi ---

export interface MiddleShiftGroup {
  hours: number
  count: number
}

export interface EmployeeStats {
  employee: {
    id: number
    name: string
    isActive: boolean
  }
  firstShifts: number   // 0.5 za polovičnu smenu
  secondShifts: number
  middleShifts: number
  workDays: number      // firstShifts + secondShifts
  offDays: number       // uvek ceo broj (halfShift ignorisan za 'off')
  totalHours: number
  middleShiftGroups: MiddleShiftGroup[]
}

export interface WeekStats {
  weekId: number
  startDate: string     // ISO string — parsiraj sa new Date() u UI
  endDate: string
  weekNumber: number    // ISO broj sedmice
  employees: EmployeeStats[]
}
