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
    const startDateParam = searchParams.get('startDate')

    if (!startDateParam) {
      return NextResponse.json({ error: 'startDate parametar je obavezan.' }, { status: 400 })
    }

    const { startDate } = getWeekBounds(new Date(startDateParam))

    const week = await prisma.week.findUnique({
      where: { startDate_userId: { startDate, userId } },
      include: {
        entries: {
          include: { employee: true },
          orderBy: [{ day: 'asc' }],
        },
      },
    })

    return NextResponse.json({ data: week ?? null })
  } catch (error) {
    console.error('[GET /api/weeks/by-date]:', error)
    return NextResponse.json({ error: 'Interna greška servera.' }, { status: 500 })
  }
}
