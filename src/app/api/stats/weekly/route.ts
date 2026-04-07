import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getWeekNumber } from '@/lib/dates'
import type { WeekStats } from '@/types'
import { computeEmployeeStats, type SimpleEmployee } from '@/lib/statsUtils'
import { parseHoursFromSettings } from '@/lib/shiftSettings'
import { getServerSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) return NextResponse.json({ error: 'Nije autorizovan.' }, { status: 401 })
    const userId = session.user.id

    const { searchParams } = new URL(request.url)
    const month = parseInt(searchParams.get('month') ?? '')
    const year = parseInt(searchParams.get('year') ?? '')

    if (isNaN(month) || isNaN(year) || month < 1 || month > 12 || year < 2020) {
      return NextResponse.json(
        { error: 'Parametri month (1-12) i year su obavezni.' },
        { status: 400 }
      )
    }

    const monthStart = new Date(year, month - 1, 1, 0, 0, 0, 0)
    const monthEnd = new Date(year, month, 0, 23, 59, 59, 999)

    const [dbSettings, weeks] = await Promise.all([
      prisma.settings.upsert({ where: { userId }, create: { userId }, update: {} }),
      prisma.week.findMany({
        where: {
          userId,
          startDate: { lte: monthEnd },
          endDate: { gte: monthStart },
        },
        include: {
          entries: { include: { employee: true } },
        },
        orderBy: { startDate: 'asc' },
      }),
    ])

    const settings = parseHoursFromSettings(dbSettings)

    const result: WeekStats[] = weeks.map((week) => {
      const empMap = new Map<number, SimpleEmployee>()
      for (const entry of week.entries) {
        if (!empMap.has(entry.employeeId)) {
          empMap.set(entry.employeeId, {
            id: entry.employee.id,
            name: entry.employee.name,
            isActive: entry.employee.isActive,
          })
        }
      }

      const employees = Array.from(empMap.values())
      const stats = computeEmployeeStats(week.entries, employees, settings)
      stats.sort((a, b) => a.employee.name.localeCompare(b.employee.name, 'sr-Latn'))

      return {
        weekId: week.id,
        startDate: week.startDate.toISOString(),
        endDate: week.endDate.toISOString(),
        weekNumber: getWeekNumber(week.startDate),
        employees: stats,
      }
    })

    return NextResponse.json({ data: result })
  } catch (error) {
    console.error('[GET /api/stats/weekly]:', error)
    return NextResponse.json({ error: 'Interna greška servera.' }, { status: 500 })
  }
}
