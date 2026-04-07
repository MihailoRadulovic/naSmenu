import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getWeekBounds } from '@/lib/dates'
import { getServerSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) return NextResponse.json({ error: 'Nije autorizovan.' }, { status: 401 })
    const userId = session.user.id

    const { searchParams } = new URL(request.url)
    const last = searchParams.get('last') === 'true'

    if (last) {
      const week = await prisma.week.findFirst({
        where: { userId },
        include: {
          entries: {
            include: { employee: true },
            orderBy: [{ day: 'asc' }, { shiftType: 'asc' }],
          },
        },
        orderBy: { startDate: 'desc' },
      })

      if (!week) {
        return NextResponse.json({ data: null, message: 'Nema podataka za prošlu nedelju.' }, { status: 404 })
      }
      return NextResponse.json({ data: week })
    }

    const weeks = await prisma.week.findMany({
      where: { userId },
      include: {
        entries: {
          include: { employee: true },
          orderBy: [{ day: 'asc' }, { shiftType: 'asc' }],
        },
      },
      orderBy: { startDate: 'desc' },
    })
    return NextResponse.json({ data: weeks })
  } catch (error) {
    console.error('[GET /api/weeks]:', error)
    return NextResponse.json({ error: 'Interna greška servera.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) return NextResponse.json({ error: 'Nije autorizovan.' }, { status: 401 })
    const userId = session.user.id

    const body = await request.json()
    const { startDate, entries } = body

    if (!startDate) {
      return NextResponse.json({ error: 'startDate je obavezan.' }, { status: 400 })
    }

    const start = new Date(startDate)
    const bounds = getWeekBounds(start)

    const week = await prisma.week.upsert({
      where: { startDate_userId: { startDate: bounds.startDate, userId } },
      update: { endDate: bounds.endDate },
      create: { startDate: bounds.startDate, endDate: bounds.endDate, userId },
    })

    const VALID_SHIFT_TYPES = ['first', 'second', 'middle', 'off', 'sick_leave', 'vacation', 'late']

    if (entries && Array.isArray(entries)) {
      // Validacija svakog unosa
      for (const e of entries) {
        if (!Number.isInteger(e.day) || e.day < 0 || e.day > 6) {
          return NextResponse.json({ error: 'Polje day mora biti broj između 0 i 6.' }, { status: 400 })
        }
        if (!VALID_SHIFT_TYPES.includes(e.shiftType)) {
          return NextResponse.json({ error: `Nevažeći tip smene: ${e.shiftType}` }, { status: 400 })
        }
        if (e.shiftType === 'middle' && (e.middleStart == null || e.middleEnd == null || e.middleStart >= e.middleEnd)) {
          return NextResponse.json({ error: 'Međusmena mora imati validno vreme (start < end).' }, { status: 400 })
        }
      }

      // Provera da svi employeeId-ovi pripadaju ovom korisniku
      const employeeIds = [...new Set(entries.map((e: { employeeId: number }) => e.employeeId))]
      if (employeeIds.length > 0) {
        const ownedCount = await prisma.employee.count({
          where: { id: { in: employeeIds }, userId },
        })
        if (ownedCount !== employeeIds.length) {
          return NextResponse.json({ error: 'Nevažeći zaposleni.' }, { status: 403 })
        }
      }

      await prisma.scheduleEntry.deleteMany({ where: { weekId: week.id } })
      if (entries.length > 0) {
        await prisma.scheduleEntry.createMany({
          data: entries.map((e: { day: number; employeeId: number; shiftType: string; halfShift: boolean; middleStart?: number | null; middleEnd?: number | null }) => ({
            weekId: week.id,
            day: e.day,
            employeeId: e.employeeId,
            shiftType: e.shiftType,
            halfShift: e.halfShift ?? false,
            middleStart: e.shiftType === 'middle' ? (e.middleStart ?? null) : null,
            middleEnd: e.shiftType === 'middle' ? (e.middleEnd ?? null) : null,
          })),
        })
      }
    }

    const result = await prisma.week.findUnique({
      where: { id: week.id },
      include: {
        entries: {
          include: { employee: true },
          orderBy: [{ day: 'asc' }],
        },
      },
    })

    return NextResponse.json({ data: result }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/weeks]:', error)
    return NextResponse.json({ error: 'Interna greška servera.' }, { status: 500 })
  }
}
