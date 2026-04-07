/**
 * Adds future weeks (Apr 7 – May 25, 2026) without clearing existing data.
 * Run with: npx tsx prisma/seed-future.ts
 */

import { config } from 'dotenv'
config({ path: '.env.local' })
config()

import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '../src/generated/prisma/client'

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

async function main() {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) throw new Error('DATABASE_URL is not set')

  const adapter = new PrismaNeon({ connectionString: dbUrl })
  const prisma = new PrismaClient({ adapter })

  try {
    // Fetch existing employees
    const employees = await prisma.employee.findMany({ orderBy: { id: 'asc' } })
    if (employees.length === 0) throw new Error('No employees found — run seed-neon.ts first')
    console.log(`Found ${employees.length} employees`)

    // Apr 7 → May 25 2026
    const startMonday = getMondayOf(new Date('2026-04-07T00:00:00.000Z'))
    const endMonday   = getMondayOf(new Date('2026-05-25T00:00:00.000Z'))
    const weekStarts  = weeksInRange(startMonday, endMonday)

    console.log(
      `Adding ${weekStarts.length} future weeks ` +
      `(${weekStarts[0].toISOString().slice(0, 10)} → ${weekStarts.at(-1)!.toISOString().slice(0, 10)})...`
    )

    let added = 0

    for (let wi = 0; wi < weekStarts.length; wi++) {
      const monday = weekStarts[wi]
      const sunday = addDays(monday, 6)

      // Skip if week already exists
      const existing = await prisma.week.findFirst({ where: { startDate: monday } })
      if (existing) {
        console.log(`  Skipping ${monday.toISOString().slice(0, 10)} (already exists)`)
        continue
      }

      const week = await prisma.week.create({ data: { startDate: monday, endDate: sunday } })

      const entries: {
        weekId: number; day: number; employeeId: number; shiftType: string; halfShift: boolean
      }[] = []

      for (let day = 0; day < 7; day++) {
        const patIdx = ((wi + 14) * 3 + day) % WEEKLY_PATTERNS.length
        const [firstIdxs, secondIdxs, offIdxs] = WEEKLY_PATTERNS[patIdx]

        for (const idx of firstIdxs) {
          if (idx >= employees.length) continue
          entries.push({ weekId: week.id, day, employeeId: employees[idx].id, shiftType: 'first', halfShift: false })
        }
        for (const idx of secondIdxs) {
          if (idx >= employees.length) continue
          entries.push({ weekId: week.id, day, employeeId: employees[idx].id, shiftType: 'second', halfShift: false })
        }
        for (const idx of offIdxs) {
          if (idx >= employees.length) continue
          entries.push({ weekId: week.id, day, employeeId: employees[idx].id, shiftType: 'off', halfShift: false })
        }
      }

      await prisma.scheduleEntry.createMany({ data: entries })
      console.log(`  Week ${(wi + 1).toString().padStart(2)}: ${monday.toISOString().slice(0, 10)}`)
      added++
    }

    console.log(`\n✅ Added ${added} new weeks`)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((e) => { console.error(e); process.exit(1) })
