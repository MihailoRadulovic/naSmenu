import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'
import { sendPasswordResetEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email?.trim()) {
      return NextResponse.json({ error: 'Email je obavezan.' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    })

    // Uvek vraćamo isti odgovor da ne otkrijemo da li email postoji
    if (!user) {
      return NextResponse.json({ data: { sent: true } })
    }

    const resetToken = randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 sat

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry },
    })

    try {
      await sendPasswordResetEmail(user.email, resetToken)
    } catch (emailError) {
      console.error('[POST /api/auth/forgot-password] Email nije poslat:', emailError)
      return NextResponse.json(
        { error: 'Greška pri slanju emaila. Pokušajte ponovo.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: { sent: true } })
  } catch (error) {
    console.error('[POST /api/auth/forgot-password]:', error)
    return NextResponse.json({ error: 'Interna greška servera.' }, { status: 500 })
  }
}
