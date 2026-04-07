import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) return NextResponse.json({ error: 'Nije autorizovan.' }, { status: 401 })
    const userId = session.user.id

    const { searchParams } = new URL(request.url)
    const showAll = searchParams.get('all') === 'true'

    const employees = await prisma.employee.findMany({
      where: showAll ? { userId } : { userId, isActive: true },
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
    const { name } = body

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Ime i prezime su obavezni.' }, { status: 400 })
    }

    const employee = await prisma.employee.create({
      data: { name: name.trim(), userId },
    })

    return NextResponse.json({ data: employee }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/employees]:', error)
    return NextResponse.json({ error: 'Interna greška servera.' }, { status: 500 })
  }
}
