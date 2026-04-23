import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  // Sve sedmice u bazi
  const weeks = await prisma.week.findMany({
    orderBy: { startDate: 'asc' },
  })

  console.log(`Ukupno sedmica: ${weeks.length}`)

  let totalAdded = 0

  for (const week of weeks) {
    // Aktivni zaposleni za tog usera
    const employees = await prisma.employee.findMany({
      where: { userId: week.userId, isActive: true },
      select: { id: true, name: true },
    })
    const employeeIds = employees.map(e => e.id)

    // Svi postojeći entry-ji za tu sedmicu
    const existingEntries = await prisma.scheduleEntry.findMany({
      where: { weekId: week.id },
      select: { day: true, employeeId: true },
    })

    // Grupiši po danu: koji dani imaju bar jedan entry
    const daysWithEntries = new Set(existingEntries.map(e => e.day))

    // Za svaki dan koji ima bar jedan entry, provjeri ko nedostaje
    const toCreate: { weekId: number; day: number; employeeId: number; shiftType: string; halfShift: boolean }[] = []

    for (const day of daysWithEntries) {
      const coveredEmployeeIds = new Set(
        existingEntries.filter(e => e.day === day).map(e => e.employeeId)
      )

      for (const empId of employeeIds) {
        if (!coveredEmployeeIds.has(empId)) {
          toCreate.push({
            weekId: week.id,
            day,
            employeeId: empId,
            shiftType: 'off',
            halfShift: false,
          })
        }
      }
    }

    if (toCreate.length > 0) {
      await prisma.scheduleEntry.createMany({ data: toCreate })
      const startStr = new Date(week.startDate).toISOString().slice(0, 10)
      console.log(`  Sedmica ${week.id} (${startStr}): dodato ${toCreate.length} 'off' entry-ja`)
      totalAdded += toCreate.length
    }
  }

  console.log(`\nUkupno dodato: ${totalAdded} 'off' entry-ja`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
