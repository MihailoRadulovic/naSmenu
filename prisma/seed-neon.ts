/**
 * Seed script for Neon PostgreSQL.
 * Populates 3 months of realistic schedule data (Jan–Mar 2026).
 * Run with: npx tsx prisma/seed-neon.ts
 */

import { config } from 'dotenv'
config({ path: '.env.local' })
config()

import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '../src/generated/prisma/client'

// ── helpers ──────────────────────────────────────────────────────────────────

function getMondayOf(date: Date): Date {
  const d = new Date(date)
  const dow = d.getUTCDay()
  const diff = dow === 0 ? -6 : 1 - dow
  d.setUTCDate(d.getUTCDate() + diff)
  d.setUTCHours(0, 0, 0, 0)
  return d
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date)
  d.setUTCDate(d.getUTCDate() + n)
  return d
}

function weeksInRange(start: Date, end: Date): Date[] {
  const list: Date[] = []
  let cur = new Date(start)
  while (cur <= end) {
    list.push(new Date(cur))
    cur.setUTCDate(cur.getUTCDate() + 7)
  }
  return list
}

// ── rotation patterns ─────────────────────────────────────────────────────────
// 7 employees, each gets ~1 off-day per week, balanced first/second rotation

// prettier-ignore
const WEEKLY_PATTERNS: [number[], number[], number[]][] = [
  [[0,1,2], [3,4,5], [6]],
  [[1,2,3], [4,5,6], [0]],
  [[2,3,4], [5,6,0], [1]],
  [[3,4,5], [6,0,1], [2]],
  [[4,5,6], [0,1,2], [3]],
  [[5,6,0], [1,2,3], [4]],
  [[6,0,1], [2,3,4], [5]],
  [[0,2,4], [1,3,5], [6]],
  [[1,3,5], [0,2,6], [4]],
  [[2,4,6], [0,1,3], [5]],
]

// Occasional absences: weekOffset -> day -> {idx, type}
const ABSENCES: Record<number, Record<number, { idx: number; type: string }>> = {
  2:  { 2: { idx: 2, type: 'sick_leave' } },
  5:  { 4: { idx: 0, type: 'sick_leave' }, 5: { idx: 0, type: 'sick_leave' } },
  8:  { 1: { idx: 5, type: 'vacation'  }, 2: { idx: 5, type: 'vacation'  }, 3: { idx: 5, type: 'vacation' } },
  10: { 3: { idx: 1, type: 'late'      } },
}

// Occasional half-shifts: weekOffset -> day -> empIdx
const HALF_SHIFTS: Record<number, Record<number, number>> = {
  3:  { 3: 2 },
  7:  { 1: 4 },
  9:  { 5: 0 },
}

// ── main ─────────────────────────────────────────────────────────────────────

async function main() {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) throw new Error('DATABASE_URL is not set')

  const adapter = new PrismaNeon({ connectionString: dbUrl })
  const prisma = new PrismaClient({ adapter })

  try {
    console.log('Clearing existing data...')
    await prisma.scheduleEntry.deleteMany()
    await prisma.week.deleteMany()
    await prisma.employee.deleteMany()

    const empData = [
      { name: 'Nemanja Glišić',  isActive: true },
      { name: 'Danilo Petrović', isActive: true },
      { name: 'Mihailo Jović',   isActive: true },
      { name: 'Anđela Simić',    isActive: true },
      { name: 'Tamara Ilić',     isActive: true },
      { name: 'Stefan Marković', isActive: true },
      { name: 'Milica Nikolić',  isActive: true },
    ]

    const employees = await Promise.all(
      empData.map((d) => prisma.employee.create({ data: d }))
    )
    console.log(`Created ${employees.length} employees`)

    // Weeks covering Jan–Mar 2026 (plus bordering weeks)
    const startMonday = getMondayOf(new Date('2025-12-29T00:00:00.000Z'))
    const endMonday   = getMondayOf(new Date('2026-03-30T00:00:00.000Z'))
    const weekStarts  = weeksInRange(startMonday, endMonday)

    console.log(
      `Generating ${weekStarts.length} weeks ` +
      `(${weekStarts[0].toISOString().slice(0, 10)} → ${weekStarts.at(-1)!.toISOString().slice(0, 10)})...`
    )

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

      const absenceDay = ABSENCES[wi] ?? {}
      const halfDay    = HALF_SHIFTS[wi] ?? {}

      for (let day = 0; day < 7; day++) {
        const patIdx = (wi * 3 + day) % WEEKLY_PATTERNS.length
        const [firstIdxs, secondIdxs, offIdxs] = WEEKLY_PATTERNS[patIdx]
        const absence    = absenceDay[day]
        const halfEmpIdx = halfDay[day]
        const absent     = new Set<number>()

        if (absence) {
          entries.push({
            weekId: week.id, day,
            employeeId: employees[absence.idx].id,
            shiftType: absence.type, halfShift: false,
          })
          absent.add(absence.idx)
        }

        for (const idx of firstIdxs) {
          if (absent.has(idx)) continue
          entries.push({
            weekId: week.id, day,
            employeeId: employees[idx].id,
            shiftType: 'first', halfShift: halfEmpIdx === idx,
          })
        }

        for (const idx of secondIdxs) {
          if (absent.has(idx)) continue
          entries.push({
            weekId: week.id, day,
            employeeId: employees[idx].id,
            shiftType: 'second', halfShift: halfEmpIdx === idx,
          })
        }

        for (const idx of offIdxs) {
          if (absent.has(idx)) continue
          entries.push({
            weekId: week.id, day,
            employeeId: employees[idx].id,
            shiftType: 'off', halfShift: false,
          })
        }
      }

      await prisma.scheduleEntry.createMany({ data: entries })
      process.stdout.write(
        `  Week ${(wi + 1).toString().padStart(2)}: ${monday.toISOString().slice(0, 10)}\n`
      )
    }

    const totalWeeks   = await prisma.week.count()
    const totalEntries = await prisma.scheduleEntry.count()
    console.log('\n✅ Done!')
    console.log(`   ${employees.length} zaposlenih`)
    console.log(`   ${totalWeeks} nedelja`)
    console.log(`   ${totalEntries} unosa rasporeda`)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
