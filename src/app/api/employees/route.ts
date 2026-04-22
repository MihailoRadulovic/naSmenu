import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'
import { z } from 'zod'

const createSchema = z.object({
  name: z.string().min(1, 'Ime i prezime su obavezni.').max(100).transform(s => s.trim()),
  notes: z.string().max(500).optional().nullable(),
  hourlyRate: z.number().min(0).max(100_000).optional().nullable(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) return NextResponse.json({ error: 'Nije autorizovan.' }, { status: 401 })
    const userId = session.user.id

    const { searchParams } = new URL(request.url)
    const showAll = searchParams.get('all') === 'true'

    const employees = await prisma.employee.findMany({
      where: showAll
        ? { userId, deletedAt: null }
        : { userId, isActive: true, deletedAt: null },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ data: employees })
  } catch (error) {
    console.error('[GET /api/employees]:', error)
    return NextResponse.json({ error: 'Interna greška servera.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) return NextResponse.json({ error: 'Nije autorizovan.' }, { status: 401 })
    const userId = session.user.id

    const body = await request.json()
    const parsed = createSchema.safeParse(body)

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? 'Nevažeći unos.'
      return NextResponse.json({ error: message }, { status: 400 })
    }

    const { name, notes, hourlyRate } = parsed.data

    const employee = await prisma.employee.create({
      data: {
        name,
        userId,
        notes: notes?.trim() || null,
        hourlyRate: hourlyRate ?? null,
      },
    })

    return NextResponse.json({ data: employee }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/employees]:', error)
    return NextResponse.json({ error: 'Interna greška servera.' }, { status: 500 })
  }
}
