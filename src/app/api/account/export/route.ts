import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'

// GET /api/account/export — returns all user data as a downloadable JSON (GDPR data portability)
export async function GET() {
  try {
    const session = await getServerSession()
    if (!session) return NextResponse.json({ error: 'Nije autorizovan.' }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        cafeName: true,
        emailVerified: true,
        createdAt: true,
        settings: {
          select: {
            firstStart: true,
            firstEnd: true,
            secondStart: true,
            secondEnd: true,
            featureSalary: true,
            featurePrint: true,
            featureHolidays: true,
            featureAbsence: true,
            featureNotes: true,
            featureCopyWeek: true,
            featureCharts: true,
          },
        },
        employees: {
          select: {
            id: true,
            name: true,
            isActive: true,
            hourlyRate: true,
            notes: true,
            createdAt: true,
          },
          orderBy: { name: 'asc' },
        },
        weeks: {
          select: {
            id: true,
            startDate: true,
            endDate: true,
            createdAt: true,
            entries: {
              select: {
                day: true,
                shiftType: true,
                halfShift: true,
                middleStart: true,
                middleEnd: true,
                employee: { select: { id: true, name: true } },
              },
            },
          },
          orderBy: { startDate: 'desc' },
        },
      },
    })

    if (!user) return NextResponse.json({ error: 'Korisnik nije pronađen.' }, { status: 404 })

    const payload = {
      exportedAt: new Date().toISOString(),
      exportVersion: '1',
      account: {
        email: user.email,
        cafeName: user.cafeName,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
      },
      settings: user.settings ?? null,
      employees: user.employees,
      schedules: user.weeks.map((w) => ({
        weekId: w.id,
        startDate: w.startDate,
        endDate: w.endDate,
        createdAt: w.createdAt,
        entries: w.entries.map((e) => ({
          day: e.day,
          shiftType: e.shiftType,
          halfShift: e.halfShift,
          middleStart: e.middleStart,
          middleEnd: e.middleEnd,
          employeeId: e.employee.id,
          employeeName: e.employee.name,
        })),
      })),
    }

    const filename = `nasmenu-export-${new Date().toISOString().slice(0, 10)}.json`

    return new NextResponse(JSON.stringify(payload, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('[GET /api/account/export]:', error)
    return NextResponse.json({ error: 'Interna greška servera.' }, { status: 500 })
  }
}
