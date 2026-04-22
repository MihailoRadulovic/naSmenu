import { NextAuthOptions, getServerSession as _getServerSession } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 dana
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Lozinka', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        })

        if (!user) return null

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!isValid) return null

        if (!user.emailVerified) throw new Error('EmailNotVerified')
        if (!user.isApproved) throw new Error('NotApproved')

        return {
          id: String(user.id),
          email: user.email,
          name: user.cafeName,
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.userId = parseInt(user.id)
        token.cafeName = user.name as string
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.userId
      session.user.cafeName = token.cafeName
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
}

export function getServerSession() {
  return _getServerSession(authOptions)
}
