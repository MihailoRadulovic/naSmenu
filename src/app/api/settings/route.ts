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
    const updateData: Record<string, unknown> = {}

    // Shift times (optional — validate only if provided)
    const timeFields = ['firstStart', 'firstEnd', 'secondStart', 'secondEnd'] as const
    for (const field of timeFields) {
      if (body[field] !== undefined) {
        if (typeof body[field] !== 'string' || !TIME_REGEX.test(body[field])) {
          return NextResponse.json(
            { error: `Polje ${field} mora biti u formatu HH:MM.` },
            { status: 400 }
          )
        }
        updateData[field] = body[field]
      }
    }

    // Feature flags (optional)
    const featureFields = [
      'featureSalary', 'featurePrint', 'featureHolidays',
      'featureAbsence', 'featureNotes', 'featureCopyWeek', 'featureCharts',
    ] as const
    for (const field of featureFields) {
      if (typeof body[field] === 'boolean') {
        updateData[field] = body[field]
      }
    }

    const settings = await prisma.settings.upsert({
      where: { userId },
      create: { userId, ...updateData },
      update: updateData,
    })

    return NextResponse.json({ data: settings })
  } catch (error) {
    console.error('[PUT /api/settings]:', error)
    return NextResponse.json({ error: 'Interna greška servera.' }, { status: 500 })
  }
}
