import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'
import bcrypt from 'bcryptjs'

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
    const { cafeName, email, password } = body

    if (!cafeName?.trim()) {
      return NextResponse.json({ error: 'Naziv kafića je obavezan.' }, { status: 400 })
    }
    if (!email?.trim()) {
      return NextResponse.json({ error: 'Email je obavezan.' }, { status: 400 })
    }
    if (password && password.length < 8) {
      return NextResponse.json({ error: 'Lozinka mora imati najmanje 8 karaktera.' }, { status: 400 })
    }

    // Proveri da li email već koristi drugi korisnik
    const emailLower = email.toLowerCase().trim()
    const existing = await prisma.user.findUnique({ where: { email: emailLower } })
    if (existing && existing.id !== session.user.id) {
      return NextResponse.json({ error: 'Email je već u upotrebi.' }, { status: 409 })
    }

    const updateData: { cafeName: string; email: string; passwordHash?: string } = {
      cafeName: cafeName.trim(),
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
