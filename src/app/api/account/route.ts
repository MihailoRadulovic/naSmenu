import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const deleteSchema = z.object({
  password: z.string().min(1, 'Lozinka je obavezna.'),
})

// DELETE /api/account — permanently deletes user account and all associated data
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) return NextResponse.json({ error: 'Nije autorizovan.' }, { status: 401 })

    const body = await request.json()
    const parsed = deleteSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Lozinka je obavezna.' }, { status: 400 })
    }

    // Verify password before deletion
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, passwordHash: true },
    })

    if (!user) return NextResponse.json({ error: 'Korisnik nije pronađen.' }, { status: 404 })

    const passwordOk = await bcrypt.compare(parsed.data.password, user.passwordHash)
    if (!passwordOk) {
      return NextResponse.json({ error: 'Pogrešna lozinka.' }, { status: 403 })
    }

    // Hard delete in correct order to avoid FK constraint errors
    await prisma.$transaction(async (tx) => {
      // 1. Get all week IDs and employee IDs belonging to this user
      const weeks = await tx.week.findMany({
        where: { userId: user.id },
        select: { id: true },
      })
      const employees = await tx.employee.findMany({
        where: { userId: user.id },
        select: { id: true },
      })

      const weekIds = weeks.map((w) => w.id)
      const employeeIds = employees.map((e) => e.id)

      // 2. Delete all ScheduleEntries linked to this user's weeks
      if (weekIds.length > 0) {
        await tx.scheduleEntry.deleteMany({ where: { weekId: { in: weekIds } } })
      }

      // 3. Delete all Weeks
      await tx.week.deleteMany({ where: { userId: user.id } })

      // 4. Delete remaining ScheduleEntries linked to user's employees (edge case)
      if (employeeIds.length > 0) {
        await tx.scheduleEntry.deleteMany({ where: { employeeId: { in: employeeIds } } })
      }

      // 5. Delete all Employees
      await tx.employee.deleteMany({ where: { userId: user.id } })

      // 6. Delete Settings
      await tx.settings.deleteMany({ where: { userId: user.id } })

      // 7. Delete the User
      await tx.user.delete({ where: { id: user.id } })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE /api/account]:', error)
    return NextResponse.json({ error: 'Interna greška servera.' }, { status: 500 })
  }
}
