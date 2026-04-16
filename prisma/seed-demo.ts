/**
 * Creates demo@gmail.com user (password: demodemo) with 6 months of fake data.
 * Run with: npx tsx prisma/seed-demo.ts
 */

import { config } from 'dotenv'
config({ path: '.env.local' })
config()

import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '../src/generated/prisma/client'
import bcrypt from 'bcryptjs'

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
const PATTERNS: [number[], number[], number[]][] = [
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

const ABSENCES: Record<number, Record<number, { idx: number; type: string }>> = {
  2:  { 2: { idx: 2, type: 'sick_leave' } },
  5:  { 4: { idx: 0, type: 'sick_leave' }, 5: { idx: 0, type: 'sick_leave' } },
  9:  { 1: { idx: 5, type: 'vacation' }, 2: { idx: 5, type: 'vacation' }, 3: { idx: 5, type: 'vacation' } },
  12: { 3: { idx: 1, type: 'late' } },
  16: { 0: { idx: 4, type: 'sick_leave' } },
  20: { 6: { idx: 2, type: 'vacation' } },
  22: { 2: { idx: 0, type: 'sick_leave' }, 3: { idx: 0, type: 'sick_leave' } },
}

const HALF_SHIFTS: Record<number, Record<number, number>> = {
  4:  { 3: 2 },
  10: { 1: 4 },
  18: { 5: 0 },
  24: { 2: 3 },
}

async function main() {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) throw new Error('DATABASE_URL is not set')

  const adapter = new PrismaNeon({ connectionString: dbUrl })
  const prisma = new PrismaClient({ adapter })

  try {
    // 1. Create or update demo user
    const passwordHash = await bcrypt.hash('demodemo', 12)

    const user = await prisma.user.upsert({
      where: { email: 'demo@gmail.com' },
      update: { passwordHash, emailVerified: true, verificationToken: null },
      create: {
        email: 'demo@gmail.com',
        cafeName: 'Demo Kafić',
        passwordHash,
        emailVerified: true,
        verificationToken: null,
      },
    })
    console.log(`✓ User: ${user.email} (id=${user.id})`)

    // 2. Clear existing data for this user
    const userWeeks = await prisma.week.findMany({ where: { userId: user.id }, select: { id: true } })
    const weekIds = userWeeks.map((w) => w.id)
    if (weekIds.length > 0) {
      await prisma.scheduleEntry.deleteMany({ where: { weekId: { in: weekIds } } })
    }
    await prisma.week.deleteMany({ where: { userId: user.id } })
    await prisma.employee.deleteMany({ where: { userId: user.id } })
    console.log('✓ Cleared old data')

    // 3. Create employees
    const empData = [
      { name: 'Nemanja Glišić',  hourlyRate: 365, notes: 'Radi vikendom, vozač' },
      { name: 'Danilo Petrović', hourlyRate: 335, notes: null },
      { name: 'Mihailo Jović',   hourlyRate: 325, notes: 'Student, max 4 dana' },
      { name: 'Anđela Simić',    hourlyRate: 340, notes: null },
      { name: 'Tamara Ilić',     hourlyRate: 360, notes: null },
      { name: 'Stefan Marković', hourlyRate: 320, notes: null },
      { name: 'Milica Nikolić',  hourlyRate: 350, notes: 'Zamijena vikendom' },
    ]

    const employees = await Promise.all(
      empData.map((d) => prisma.employee.create({ data: { ...d, userId: user.id } }))
    )
    console.log(`✓ Created ${employees.length} employees`)

    // 4. Create settings
    await prisma.settings.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id, firstStart: '07:15', firstEnd: '15:23', secondStart: '15:23', secondEnd: '23:00' },
    })

    // 5. Generate weeks: Oct 2025 → current week
    const startMonday = getMondayOf(new Date('2025-10-06T00:00:00.000Z'))
    const endMonday   = getMondayOf(new Date())
    const weekStarts  = weeksInRange(startMonday, endMonday)

    console.log(
      `Generating ${weekStarts.length} weeks ` +
      `(${weekStarts[0].toISOString().slice(0, 10)} → ${weekStarts.at(-1)!.toISOString().slice(0, 10)})...`
    )

    for (let wi = 0; wi < weekStarts.length; wi++) {
      const monday = weekStarts[wi]
      const sunday = addDays(monday, 6)

      const week = await prisma.week.create({
        data: { startDate: monday, endDate: sunday, userId: user.id },
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
        const patIdx = (wi * 3 + day) % PATTERNS.length
        const [firstIdxs, secondIdxs, offIdxs] = PATTERNS[patIdx]
        const absence    = absenceDay[day]
        const halfEmpIdx = halfDay[day]
        const absent     = new Set<number>()

        if (absence) {
          entries.push({ weekId: week.id, day, employeeId: employees[absence.idx].id, shiftType: absence.type, halfShift: false })
          absent.add(absence.idx)
        }

        for (const idx of firstIdxs) {
          if (absent.has(idx)) continue
          entries.push({ weekId: week.id, day, employeeId: employees[idx].id, shiftType: 'first', halfShift: halfEmpIdx === idx })
        }
        for (const idx of secondIdxs) {
          if (absent.has(idx)) continue
          entries.push({ weekId: week.id, day, employeeId: employees[idx].id, shiftType: 'second', halfShift: halfEmpIdx === idx })
        }
        for (const idx of offIdxs) {
          if (absent.has(idx)) continue
          entries.push({ weekId: week.id, day, employeeId: employees[idx].id, shiftType: 'off', halfShift: false })
        }
      }

      await prisma.scheduleEntry.createMany({ data: entries })
    }

    const totalWeeks   = await prisma.week.count({ where: { userId: user.id } })
    const totalEntries = await prisma.scheduleEntry.count({ where: { week: { userId: user.id } } })
    console.log('\n✅ Done!')
    console.log(`   Email:    demo@gmail.com`)
    console.log(`   Password: demodemo`)
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
