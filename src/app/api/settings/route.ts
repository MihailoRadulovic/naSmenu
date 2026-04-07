import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session) return NextResponse.json({ error: 'Nije autorizovan.' }, { status: 401 })
    const userId = session.user.id

    const settings = await prisma.settings.upsert({
      where: { userId },
      create: { userId },
      update: {},
    })
    return NextResponse.json({ data: settings })
  } catch (error) {
    console.error('[GET /api/settings]:', error)
    return NextResponse.json({ error: 'Interna greška servera.' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) return NextResponse.json({ error: 'Nije autorizovan.' }, { status: 401 })
    const userId = session.user.id

    const body = await request.json()
    const { firstStart, firstEnd, secondStart, secondEnd } = body

    for (const [field, value] of Object.entries({ firstStart, firstEnd, secondStart, secondEnd })) {
      if (typeof value !== 'string' || !TIME_REGEX.test(value)) {
        return NextResponse.json(
          { error: `Polje ${field} mora biti u formatu HH:MM.` },
          { status: 400 }
        )
      }
    }

    const settings = await prisma.settings.upsert({
      where: { userId },
      create: { userId, firstStart, firstEnd, secondStart, secondEnd },
      update: { firstStart, firstEnd, secondStart, secondEnd },
    })

    return NextResponse.json({ data: settings })
  } catch (error) {
    console.error('[PUT /api/settings]:', error)
    return NextResponse.json({ error: 'Interna greška servera.' }, { status: 500 })
  }
}
