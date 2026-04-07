import { withAuth } from 'next-auth/middleware'

export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token,
  },
})

export const config = {
  matcher: [
    '/((?!login|register|forgot-password|reset-password|verify-email|api/auth|api/register|_next/static|_next/image|favicon\\.ico|icons|manifest).*)',
  ],
}
