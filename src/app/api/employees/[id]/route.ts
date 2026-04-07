import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    if (!session) return NextResponse.json({ error: 'Nije autorizovan.' }, { status: 401 })
    const userId = session.user.id

    const { id } = await params
    const employeeId = parseInt(id)
    if (isNaN(employeeId)) {
      return NextResponse.json({ error: 'Nevažeći ID zaposlenog.' }, { status: 400 })
    }
    const body = await request.json()
    const { name, notes } = body

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Ime je obavezno.' }, { status: 400 })
    }

    const existing = await prisma.employee.findFirst({ where: { id: employeeId, userId } })
    if (!existing) {
      return NextResponse.json({ error: 'Zaposleni nije pronađen.' }, { status: 404 })
    }

    const employee = await prisma.employee.update({
      where: { id: employeeId },
      data: { name: name.trim(), notes: notes?.trim() || null },
    })

    return NextResponse.json({ data: employee })
  } catch (error) {
    console.error('[PUT /api/employees/[id]]:', error)
    return NextResponse.json({ error: 'Interna greška servera.' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    if (!session) return NextResponse.json({ error: 'Nije autorizovan.' }, { status: 401 })
    const userId = session.user.id

    const { id } = await params
    const employeeId = parseInt(id)

    const existing = await prisma.employee.findFirst({ where: { id: employeeId, userId } })
    if (!existing) {
      return NextResponse.json({ error: 'Zaposleni nije pronađen.' }, { status: 404 })
    }

    await prisma.scheduleEntry.deleteMany({ where: { employeeId } })
    await prisma.employee.delete({ where: { id: employeeId } })

    return NextResponse.json({ data: { success: true } })
  } catch (error) {
    console.error('[DELETE /api/employees/[id]]:', error)
    return NextResponse.json({ error: 'Interna greška servera.' }, { status: 500 })
  }
}

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    if (!session) return NextResponse.json({ error: 'Nije autorizovan.' }, { status: 401 })
    const userId = session.user.id

    const { id } = await params
    const employeeId = parseInt(id)

    const existing = await prisma.employee.findFirst({ where: { id: employeeId, userId } })
    if (!existing) {
      return NextResponse.json({ error: 'Zaposleni nije pronađen.' }, { status: 404 })
    }

    const employee = await prisma.employee.update({
      where: { id: employeeId },
      data: { isActive: !existing.isActive },
    })

    return NextResponse.json({ data: employee })
  } catch (error) {
    console.error('[PATCH /api/employees/[id]]:', error)
    return NextResponse.json({ error: 'Interna greška servera.' }, { status: 500 })
  }
}
