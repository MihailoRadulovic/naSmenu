import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'
import { sendVerificationEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, cafeName, password } = body

    if (!email?.trim() || !cafeName?.trim() || !password) {
      return NextResponse.json({ error: 'Sva polja su obavezna.' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Lozinka mora imati najmanje 8 karaktera.' },
        { status: 400 }
      )
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Korisnik sa ovim emailom već postoji.' },
        { status: 409 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const verificationToken = randomBytes(32).toString('hex')

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        cafeName: cafeName.trim(),
        passwordHash,
        verificationToken,
      },
    })

    await sendVerificationEmail(user.email, verificationToken)

    return NextResponse.json(
      { data: { id: user.id, email: user.email, cafeName: user.cafeName } },
      { status: 201 }
    )
  } catch (error) {
    console.error('[POST /api/register]:', error)
    return NextResponse.json({ error: 'Interna greška servera.' }, { status: 500 })
  }
}
