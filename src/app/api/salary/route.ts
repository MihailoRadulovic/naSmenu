import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getShiftHours } from '@/lib/shiftHours'
import { parseHoursFromSettings } from '@/lib/shiftSettings'
import { getServerSession } from '@/lib/auth'

// GET /api/salary?month=3&year=2026
// Returns all employees with their hourlyRate + total hours for the month
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) return NextResponse.json({ error: 'Nije autorizovan.' }, { status: 401 })
    const userId = session.user.id

    const { searchParams } = new URL(request.url)
    const month = parseInt(searchParams.get('month') ?? String(new Date().getMonth() + 1))
    const year = parseInt(searchParams.get('year') ?? String(new Date().getFullYear()))

    const startOfMonth = new Date(year, month - 1, 1)
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999)

    const [dbSettings, employees] = await Promise.all([
      prisma.settings.upsert({ where: { userId }, create: { userId }, update: {} }),
      prisma.employee.findMany({
        where: { userId, isActive: true },
        include: {
          shifts: {
            where: {
              week: {
                startDate: { lte: endOfMonth },
                endDate: { gte: startOfMonth },
              },
              shiftType: { in: ['first', 'second', 'middle'] },
            },
            include: { week: true },
          },
        },
        orderBy: { name: 'asc' },
      }),
    ])

    const settings = parseHoursFromSettings(dbSettings)

    const data = employees.map(emp => {
      const shiftsThisMonth = emp.shifts.filter(s => {
        const weekStart = new Date(s.week.startDate)
        const shiftDate = new Date(weekStart)
        shiftDate.setDate(weekStart.getDate() + s.day)
        return shiftDate >= startOfMonth && shiftDate <= endOfMonth
      })

      const totalHours = shiftsThisMonth.reduce((acc, s) => {
        return acc + getShiftHours(s, settings)
      }, 0)

      const earned = emp.hourlyRate ? totalHours * emp.hourlyRate : null

      return {
        id: emp.id,
        name: emp.name,
        hourlyRate: emp.hourlyRate,
        notes: emp.notes,
        totalHours,
        earned,
      }
    })

    return NextResponse.json({ data, month, year })
  } catch (error) {
    console.error('[GET /api/salary]:', error)
    return NextResponse.json({ error: 'Interna greška servera.' }, { status: 500 })
  }
}

// PUT /api/salary
// Update employee hourlyRate
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) return NextResponse.json({ error: 'Nije autorizovan.' }, { status: 401 })
    const userId = session.user.id

    const body = await request.json()
    const { employeeId, hourlyRate } = body

    if (!employeeId) {
      return NextResponse.json({ error: 'employeeId je obavezan.' }, { status: 400 })
    }

    const parsedRate = hourlyRate !== '' && hourlyRate !== null ? Number(hourlyRate) : null
    if (parsedRate !== null && isNaN(parsedRate)) {
      return NextResponse.json({ error: 'hourlyRate mora biti broj.' }, { status: 400 })
    }

    const employee = await prisma.employee.update({
      where: { id: Number(employeeId), userId },
      data: { hourlyRate: parsedRate },
    })

    return NextResponse.json({ data: employee })
  } catch (error) {
    console.error('[PUT /api/salary]:', error)
    return NextResponse.json({ error: 'Interna greška servera.' }, { status: 500 })
  }
}
