import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
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

    const entries = await prisma.scheduleEntry.findMany({
      where: {
        week: {
          userId,
          startDate: { lte: monthEnd },
          endDate: { gte: monthStart },
        },
      },
      include: { employee: true, week: true },
    })

    const inMonthEntries = entries.filter((entry) => {
      const weekStart = new Date(entry.week.startDate)
      const entryDate = new Date(weekStart)
      entryDate.setUTCDate(weekStart.getUTCDate() + entry.day)
      return entryDate.getUTCMonth() === month - 1 && entryDate.getUTCFullYear() === year
    })

    const empMap = new Map<number, SimpleEmployee>()
    for (const entry of inMonthEntries) {
      if (!empMap.has(entry.employeeId)) {
        empMap.set(entry.employeeId, {
          id: entry.employee.id,
          name: entry.employee.name,
          isActive: entry.employee.isActive,
        })
      }
    }

    const dbSettings = await prisma.settings.upsert({ where: { userId }, create: { userId }, update: {} })
    const settings = parseHoursFromSettings(dbSettings)

    const stats = computeEmployeeStats(inMonthEntries, Array.from(empMap.values()), settings)
    stats.sort((a, b) => {
      if (b.totalHours !== a.totalHours) return b.totalHours - a.totalHours
      return a.employee.name.localeCompare(b.employee.name, 'sr-Latn')
    })

    return NextResponse.json({ data: stats })
  } catch (error) {
    console.error('[GET /api/stats/monthly]:', error)
    return NextResponse.json({ error: 'Interna greška servera.' }, { status: 500 })
  }
}
