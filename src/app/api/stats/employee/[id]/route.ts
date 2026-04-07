import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'

function toMinutes(t: string) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    if (!session) return NextResponse.json({ error: 'Nije autorizovan.' }, { status: 401 })
    const userId = session.user.id

    const { id } = await params
    const employeeId = parseInt(id)
    const { searchParams } = new URL(request.url)
    const month = parseInt(searchParams.get('month') ?? '')
    const year = parseInt(searchParams.get('year') ?? '')

    if (isNaN(month) || isNaN(year) || month < 1 || month > 12 || year < 2020) {
      return NextResponse.json(
        { error: 'Parametri month (1-12) i year su obavezni.' },
        { status: 400 }
      )
    }

    const [employee, settings] = await Promise.all([
      prisma.employee.findFirst({ where: { id: employeeId, userId } }),
      prisma.settings.upsert({ where: { userId }, create: { userId }, update: {} }),
    ])

    if (!employee) {
      return NextResponse.json({ error: 'Zaposleni nije pronađen.' }, { status: 404 })
    }

    const firstShiftHours = Math.max(0, (toMinutes(settings.firstEnd) - toMinutes(settings.firstStart)) / 60)
    const secondShiftHours = Math.max(0, (toMinutes(settings.secondEnd) - toMinutes(settings.secondStart)) / 60)

    const monthStart = new Date(year, month - 1, 1, 0, 0, 0, 0)
    const monthEnd = new Date(year, month, 0, 23, 59, 59, 999)

    const entries = await prisma.scheduleEntry.findMany({
      where: {
        employeeId,
        week: {
          userId,
          startDate: { lte: monthEnd },
          endDate: { gte: monthStart },
        },
      },
      include: { week: true },
      orderBy: [{ week: { startDate: 'asc' } }, { day: 'asc' }],
    })

    const daysInMonth = new Date(year, month, 0).getDate()
    const dailyData: {
      date: string
      dayOfWeek: number
      shifts: { shiftType: string; halfShift: boolean; middleStart: number | null; middleEnd: number | null }[]
    }[] = []

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month - 1, d)
      const dayOfWeek = date.getDay() === 0 ? 6 : date.getDay() - 1

      const matchingEntries = entries.filter((entry) => {
        const weekStart = new Date(entry.week.startDate)
        weekStart.setHours(0, 0, 0, 0)
        const entryDate = new Date(weekStart)
        entryDate.setDate(weekStart.getDate() + entry.day)
        return (
          entryDate.getFullYear() === date.getFullYear() &&
          entryDate.getMonth() === date.getMonth() &&
          entryDate.getDate() === date.getDate()
        )
      })

      dailyData.push({
        date: `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
        dayOfWeek,
        shifts: matchingEntries.map((e) => ({
          shiftType: e.shiftType,
          halfShift: e.halfShift,
          middleStart: e.middleStart ?? null,
          middleEnd: e.middleEnd ?? null,
        })),
      })
    }

    let firstShifts = 0, firstHours = 0
    let secondShifts = 0, secondHours = 0
    let middleShifts = 0, middleHours = 0
    let offDays = 0, totalHours = 0

    for (const day of dailyData) {
      for (const shift of day.shifts) {
        const value = shift.halfShift ? 0.5 : 1
        if (shift.shiftType === 'first') {
          const h = shift.halfShift ? firstShiftHours / 2 : firstShiftHours
          firstShifts += value; firstHours += h; totalHours += h
        } else if (shift.shiftType === 'second') {
          const h = shift.halfShift ? secondShiftHours / 2 : secondShiftHours
          secondShifts += value; secondHours += h; totalHours += h
        } else if (shift.shiftType === 'middle') {
          const h = shift.middleStart != null && shift.middleEnd != null && shift.middleEnd > shift.middleStart
            ? (shift.middleEnd - shift.middleStart) / 60 : 0
          middleShifts += 1; middleHours += h; totalHours += h
        } else if (shift.shiftType === 'off') {
          offDays += 1
        }
      }
    }

    return NextResponse.json({
      data: {
        employee: { id: employee.id, name: employee.name, isActive: employee.isActive },
        summary: {
          firstShifts, firstHours,
          secondShifts, secondHours,
          middleShifts, middleHours,
          workDays: firstShifts + secondShifts,
          offDays, totalHours,
        },
        days: dailyData,
      },
    })
  } catch (error) {
    console.error('[GET /api/stats/employee/[id]]:', error)
    return NextResponse.json({ error: 'Interna greška servera.' }, { status: 500 })
  }
}
