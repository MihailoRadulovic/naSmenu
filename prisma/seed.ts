import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '../src/generated/prisma/client'

const adapter = new PrismaBetterSqlite3({ url: 'file:prisma/demo.db' })
const prisma = new PrismaClient({ adapter } as never)

// Returns Monday of the week containing the given date
function getMondayOf(date: Date): Date {
  const d = new Date(date)
  const day = d.getUTCDay() // 0=Sun, 1=Mon...
  const diff = day === 0 ? -6 : 1 - day
  d.setUTCDate(d.getUTCDate() + diff)
  d.setUTCHours(0, 0, 0, 0)
  return d
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setUTCDate(d.getUTCDate() + days)
  return d
}

// Generate all Monday dates from startMonday to endMonday (inclusive)
function getWeekStarts(start: Date, end: Date): Date[] {
  const weeks: Date[] = []
  let current = new Date(start)
  while (current <= end) {
    weeks.push(new Date(current))
    current.setUTCDate(current.getUTCDate() + 7)
  }
  return weeks
}

// Rotation patterns: indices into employees array
// Each pattern: [first_shift_indices, second_shift_indices, off_indices]
const PATTERNS: [number[], number[], number[]][] = [
  [[0, 1], [2, 3], [4]],
  [[1, 2], [3, 4], [0]],
  [[2, 3], [4, 0], [1]],
  [[3, 4], [0, 1], [2]],
  [[4, 0], [1, 2], [3]],
  [[0, 2], [1, 4], [3]],
  [[1, 3], [2, 0], [4]],
  [[2, 4], [3, 1], [0]],
  [[3, 0], [4, 2], [1]],
  [[4, 1], [0, 3], [2]],
]

// Occasionally add absence types for realism
const ABSENCE_WEEKS: Record<number, Record<number, { empIdx: number; type: string }>> = {
  // week offset -> day -> {empIdx, type}
  3:  { 2: { empIdx: 2, type: 'sick_leave' } },
  7:  { 4: { empIdx: 0, type: 'sick_leave' }, 5: { empIdx: 0, type: 'sick_leave' } },
  11: { 1: { empIdx: 3, type: 'vacation' }, 2: { empIdx: 3, type: 'vacation' }, 3: { empIdx: 3, type: 'vacation' } },
  14: { 3: { empIdx: 1, type: 'late' } },
  18: { 0: { empIdx: 4, type: 'sick_leave' } },
  22: { 6: { empIdx: 2, type: 'vacation' } },
  25: { 2: { empIdx: 0, type: 'sick_leave' }, 3: { empIdx: 0, type: 'sick_leave' } },
  29: { 5: { empIdx: 3, type: 'late' } },
  33: { 1: { empIdx: 1, type: 'vacation' }, 2: { empIdx: 1, type: 'vacation' } },
  37: { 4: { empIdx: 4, type: 'sick_leave' } },
}

// Half-shift pattern: some workers do half shifts occasionally
const HALF_SHIFTS: Record<number, Record<number, number>> = {
  5:  { 3: 2 }, // week 5, day 3, employee index 2 = half shift
  12: { 1: 0 },
  20: { 5: 3 },
  28: { 2: 1 },
  36: { 4: 4 },
}

async function main() {
  console.log('Clearing existing data...')
  await prisma.scheduleEntry.deleteMany()
  await prisma.week.deleteMany()
  await prisma.employee.deleteMany()

  // Create employees
  const empData = [
    { name: 'Nemanja Glišić', hourlyRate: 1200, notes: 'Radi vikendom, vozač' },
    { name: 'Danilo Petrović', hourlyRate: 1100, notes: null },
    { name: 'Mihailo Jović', hourlyRate: 1150, notes: 'Student, max 4 dana' },
    { name: 'Anđela Simić', hourlyRate: 1100, notes: null },
    { name: 'Tamara Ilić', hourlyRate: 1200, notes: null },
  ]

  const employees = []
  for (const data of empData) {
    const emp = await prisma.employee.create({ data })
    employees.push(emp)
  }
  console.log(`Created ${employees.length} employees`)

  // Date range: July 7, 2025 → current week (Apr 5, 2026)
  const startMonday = new Date('2025-07-07T00:00:00.000Z')
  const endMonday   = getMondayOf(new Date('2026-04-02T00:00:00.000Z'))
  const weekStarts  = getWeekStarts(startMonday, endMonday)

  console.log(`Generating ${weekStarts.length} weeks (${weekStarts[0].toISOString().slice(0,10)} → ${weekStarts[weekStarts.length-1].toISOString().slice(0,10)})...`)

  for (let wi = 0; wi < weekStarts.length; wi++) {
    const monday = weekStarts[wi]
    const sunday = addDays(monday, 6)

    const week = await prisma.week.create({
      data: { startDate: monday, endDate: sunday },
    })

    const entries: {
      weekId: number
      day: number
      employeeId: number
      shiftType: string
      halfShift: boolean
    }[] = []

    const absenceForWeek = ABSENCE_WEEKS[wi] ?? {}
    const halfForWeek    = HALF_SHIFTS[wi] ?? {}

    for (let day = 0; day < 7; day++) {
      const patternIdx = (wi * 3 + day * 2) % PATTERNS.length
      const [firstIdxs, secondIdxs, offIdxs] = PATTERNS[patternIdx]

      // Check for absence override on this day
      const absence = absenceForWeek[day]
      const halfEmpIdx = halfForWeek[day]

      const assignedAsAbsent = new Set<number>()

      if (absence) {
        // The absent employee gets the absence type instead of their normal shift
        entries.push({
          weekId: week.id,
          day,
          employeeId: employees[absence.empIdx].id,
          shiftType: absence.type,
          halfShift: false,
        })
        assignedAsAbsent.add(absence.empIdx)
      }

      // First shift
      for (const idx of firstIdxs) {
        if (assignedAsAbsent.has(idx)) continue
        const isHalf = halfEmpIdx === idx
        entries.push({
          weekId: week.id,
          day,
          employeeId: employees[idx].id,
          shiftType: 'first',
          halfShift: isHalf,
        })
      }

      // Second shift
      for (const idx of secondIdxs) {
        if (assignedAsAbsent.has(idx)) continue
        const isHalf = halfEmpIdx === idx
        entries.push({
          weekId: week.id,
          day,
          employeeId: employees[idx].id,
          shiftType: 'second',
          halfShift: isHalf,
        })
      }

      // Off
      for (const idx of offIdxs) {
        if (assignedAsAbsent.has(idx)) continue
        entries.push({
          weekId: week.id,
          day,
          employeeId: employees[idx].id,
          shiftType: 'off',
          halfShift: false,
        })
      }
    }

    await prisma.scheduleEntry.createMany({ data: entries })

    if (wi % 5 === 0) {
      const date = monday.toISOString().slice(0, 10)
      process.stdout.write(`  Week ${wi + 1}/${weekStarts.length}: ${date}\n`)
    }
  }

  // Summary
  const totalWeeks = await prisma.week.count()
  const totalEntries = await prisma.scheduleEntry.count()
  console.log(`\n✅ Done!`)
  console.log(`   ${employees.length} zaposlenih`)
  console.log(`   ${totalWeeks} nedelja`)
  console.log(`   ${totalEntries} unosa rasporeda`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
