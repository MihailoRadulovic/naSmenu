import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'
import { z } from 'zod'

const updateSchema = z.object({
  name: z.string().min(1, 'Ime je obavezno.').max(100).transform(s => s.trim()),
  notes: z.string().max(500).optional().nullable(),
  hourlyRate: z.number().min(0).max(100_000).optional().nullable(),
})

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
    const parsed = updateSchema.safeParse(body)

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? 'Nevažeći unos.'
      return NextResponse.json({ error: message }, { status: 400 })
    }

    const { name, notes } = parsed.data

    const existing = await prisma.employee.findFirst({
      where: { id: employeeId, userId, deletedAt: null },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Zaposleni nije pronađen.' }, { status: 404 })
    }

    const employee = await prisma.employee.update({
      where: { id: employeeId },
      data: { name, notes: notes?.trim() || null },
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
    if (isNaN(employeeId)) {
      return NextResponse.json({ error: 'Nevažeći ID zaposlenog.' }, { status: 400 })
    }

    const existing = await prisma.employee.findFirst({
      where: { id: employeeId, userId, deletedAt: null },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Zaposleni nije pronađen.' }, { status: 404 })
    }

    // Soft delete — čuvamo zaposlenog i sve istorijske smene za statistiku
    await prisma.employee.update({
      where: { id: employeeId },
      data: { isActive: false, deletedAt: new Date() },
    })

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
    if (isNaN(employeeId)) {
      return NextResponse.json({ error: 'Nevažeći ID zaposlenog.' }, { status: 400 })
    }

    const existing = await prisma.employee.findFirst({
      where: { id: employeeId, userId, deletedAt: null },
    })
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
