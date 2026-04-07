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
    const fromParam = searchParams.get('from')
    const toParam = searchParams.get('to')
    const employeeIdsParam = searchParams.get('employeeIds')

    if (!fromParam || !toParam) {
      return NextResponse.json(
        { error: 'Parametri from i to su obavezni (format: YYYY-MM-DD).' },
        { status: 400 }
      )
    }

    const fromDate = new Date(fromParam + 'T00:00:00')
    const toDate = new Date(toParam + 'T23:59:59')

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return NextResponse.json({ error: 'Nevažeći format datuma.' }, { status: 400 })
    }

    if (fromDate > toDate) {
      return NextResponse.json(
        { error: 'Datum "od" mora biti pre ili jednak datumu "do".' },
        { status: 400 }
      )
    }

    const employeeIds =
      employeeIdsParam && employeeIdsParam.trim() !== ''
        ? employeeIdsParam
            .split(',')
            .map((s) => parseInt(s.trim(), 10))
            .filter((n) => !isNaN(n) && n > 0)
        : null

    const entries = await prisma.scheduleEntry.findMany({
      where: {
        week: {
          userId,
          startDate: { lte: toDate },
          endDate: { gte: fromDate },
        },
        ...(employeeIds && employeeIds.length > 0
          ? { employeeId: { in: employeeIds } }
          : {}),
      },
      include: { employee: true },
    })

    const empMap = new Map<number, SimpleEmployee>()
    for (const entry of entries) {
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

    const stats = computeEmployeeStats(entries, Array.from(empMap.values()), settings)
    stats.sort((a, b) => {
      if (b.totalHours !== a.totalHours) return b.totalHours - a.totalHours
      return a.employee.name.localeCompare(b.employee.name, 'sr-Latn')
    })

    return NextResponse.json({ data: stats })
  } catch (error) {
    console.error('[GET /api/stats/custom]:', error)
    return NextResponse.json({ error: 'Interna greška servera.' }, { status: 500 })
  }
}
