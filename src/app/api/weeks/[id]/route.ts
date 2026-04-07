import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    if (!session) return NextResponse.json({ error: 'Nije autorizovan.' }, { status: 401 })
    const userId = session.user.id

    const { id } = await params
    const weekId = parseInt(id)

    const week = await prisma.week.findFirst({
      where: { id: weekId, userId },
      include: {
        entries: {
          include: { employee: true },
          orderBy: [{ day: 'asc' }],
        },
      },
    })

    if (!week) {
      return NextResponse.json({ error: 'Nedelja nije pronađena.' }, { status: 404 })
    }

    return NextResponse.json({ data: week })
  } catch (error) {
    console.error('[GET /api/weeks/[id]]:', error)
    return NextResponse.json({ error: 'Interna greška servera.' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    if (!session) return NextResponse.json({ error: 'Nije autorizovan.' }, { status: 401 })
    const userId = session.user.id

    const { id } = await params
    const weekId = parseInt(id)
    const body = await request.json()
    const { entries } = body

    const week = await prisma.week.findFirst({ where: { id: weekId, userId } })
    if (!week) {
      return NextResponse.json({ error: 'Nedelja nije pronađena.' }, { status: 404 })
    }

    await prisma.scheduleEntry.deleteMany({ where: { weekId } })

    if (entries && entries.length > 0) {
      for (const e of entries) {
        if (e.shiftType === 'middle' && (e.middleStart == null || e.middleEnd == null || e.middleStart >= e.middleEnd)) {
          return NextResponse.json({ error: 'Međusmena mora imati validno vreme (start < end).' }, { status: 400 })
        }
      }

      await prisma.scheduleEntry.createMany({
        data: entries.map((e: { day: number; employeeId: number; shiftType: string; halfShift: boolean; middleStart?: number | null; middleEnd?: number | null }) => ({
          weekId,
          day: e.day,
          employeeId: e.employeeId,
          shiftType: e.shiftType,
          halfShift: e.halfShift ?? false,
          middleStart: e.shiftType === 'middle' ? (e.middleStart ?? null) : null,
          middleEnd: e.shiftType === 'middle' ? (e.middleEnd ?? null) : null,
        })),
      })
    }

    const result = await prisma.week.findUnique({
      where: { id: weekId },
      include: {
        entries: {
          include: { employee: true },
          orderBy: [{ day: 'asc' }],
        },
      },
    })

    return NextResponse.json({ data: result })
  } catch (error) {
    console.error('[PUT /api/weeks/[id]]:', error)
    return NextResponse.json({ error: 'Interna greška servera.' }, { status: 500 })
  }
}
