import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const token = new URL(request.url).searchParams.get('token')

    if (!token) {
      return NextResponse.redirect(new URL('/login?error=invalid-token', request.url))
    }

    const user = await prisma.user.findUnique({ where: { verificationToken: token } })

    if (!user) {
      return NextResponse.redirect(new URL('/login?error=invalid-token', request.url))
    }

    // Provjera expiry (24h)
    if (user.verificationTokenExpiry && user.verificationTokenExpiry < new Date()) {
      // Poništi token da se ne može ponovo koristiti
      await prisma.user.update({
        where: { id: user.id },
        data: { verificationToken: null, verificationTokenExpiry: null },
      })
      return NextResponse.redirect(new URL('/login?error=token-expired', request.url))
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, verificationToken: null, verificationTokenExpiry: null },
    })

    return NextResponse.redirect(new URL('/login?verified=1', request.url))
  } catch (error) {
    console.error('[GET /api/auth/verify-email]:', error)
    return NextResponse.redirect(new URL('/login?error=server', request.url))
  }
}
