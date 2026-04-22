import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendAdminApprovalEmail } from '@/lib/email'

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

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, verificationToken: null },
    })

    try {
      await sendAdminApprovalEmail(user.id, user.cafeName, user.email)
    } catch (emailError) {
      console.error('[verify-email] Admin notifikacija nije poslata:', emailError)
    }

    return NextResponse.redirect(new URL('/login?verified=1', request.url))
  } catch (error) {
    console.error('[GET /api/auth/verify-email]:', error)
    return NextResponse.redirect(new URL('/login?error=server', request.url))
  }
}
