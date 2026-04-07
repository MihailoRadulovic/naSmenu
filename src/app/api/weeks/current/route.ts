import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentWeekBounds } from '@/lib/dates'
import { getServerSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session) return NextResponse.json({ error: 'Nije autorizovan.' }, { status: 401 })
    const userId = session.user.id

    const { startDate } = getCurrentWeekBounds()

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
    console.error('[GET /api/weeks/current]:', error)
    return NextResponse.json({ error: 'Interna greška servera.' }, { status: 500 })
  }
}
