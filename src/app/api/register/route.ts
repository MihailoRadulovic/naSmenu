import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'
import { sendVerificationEmail, sendAdminApprovalEmail } from '@/lib/email'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email('Nevažeći email format.').max(255),
  cafeName: z.string().min(1, 'Naziv kafića je obavezan.').max(100).transform(s => s.trim()),
  password: z.string().min(8, 'Lozinka mora imati najmanje 8 karaktera.').max(128),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? 'Nevažeći unos.'
      return NextResponse.json({ error: message }, { status: 400 })
    }

    const { email: rawEmail, cafeName, password } = parsed.data
    const email = rawEmail.toLowerCase().trim()

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { error: 'Korisnik sa ovim emailom već postoji.' },
        { status: 409 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const verificationToken = randomBytes(32).toString('hex')
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h
    const approvalToken = randomBytes(32).toString('hex')

    const user = await prisma.user.create({
      data: {
        email,
        cafeName,
        passwordHash,
        verificationToken,
        verificationTokenExpiry,
        approvalToken,
      },
    })

    try {
      await sendVerificationEmail(user.email, verificationToken)
    } catch (emailError) {
      console.error('[POST /api/register] Email nije poslat:', emailError)
      await prisma.user.delete({ where: { id: user.id } })
      return NextResponse.json(
        { error: 'Nalog nije kreiran — greška pri slanju verifikacionog emaila. Pokušajte ponovo.' },
        { status: 500 }
      )
    }

    // Admin notifikacija — ne blokira registraciju ako padne
    sendAdminApprovalEmail(user.id, user.cafeName, user.email, approvalToken).catch(err =>
      console.error('[POST /api/register] Admin notifikacija nije poslata:', err)
    )

    return NextResponse.json(
      { data: { id: user.id, email: user.email, cafeName: user.cafeName } },
      { status: 201 }
    )
  } catch (error) {
    console.error('[POST /api/register]:', error)
    return NextResponse.json({ error: 'Interna greška servera.' }, { status: 500 })
  }
}
