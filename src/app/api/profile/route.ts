import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const updateSchema = z.object({
  cafeName: z.string().min(1, 'Naziv kafića je obavezan.').max(100).transform(s => s.trim()),
  email: z.string().email('Nevažeći email format.').max(255),
  password: z.string().min(8, 'Lozinka mora imati najmanje 8 karaktera.').max(128).optional().or(z.literal('')),
})

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session) return NextResponse.json({ error: 'Nije autorizovan.' }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, cafeName: true },
    })

    if (!user) return NextResponse.json({ error: 'Korisnik nije pronađen.' }, { status: 404 })

    return NextResponse.json({ data: user })
  } catch (error) {
    console.error('[GET /api/profile]:', error)
    return NextResponse.json({ error: 'Interna greška servera.' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) return NextResponse.json({ error: 'Nije autorizovan.' }, { status: 401 })

    const body = await request.json()
    const parsed = updateSchema.safeParse(body)

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? 'Nevažeći unos.'
      return NextResponse.json({ error: message }, { status: 400 })
    }

    const { cafeName, email: rawEmail, password } = parsed.data
    const emailLower = rawEmail.toLowerCase().trim()

    const existing = await prisma.user.findUnique({ where: { email: emailLower } })
    if (existing && existing.id !== session.user.id) {
      return NextResponse.json({ error: 'Email je već u upotrebi.' }, { status: 409 })
    }

    const updateData: { cafeName: string; email: string; passwordHash?: string } = {
      cafeName,
      email: emailLower,
    }

    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 12)
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: { id: true, email: true, cafeName: true },
    })

    return NextResponse.json({ data: user })
  } catch (error) {
    console.error('[PUT /api/profile]:', error)
    return NextResponse.json({ error: 'Interna greška servera.' }, { status: 500 })
  }
}
