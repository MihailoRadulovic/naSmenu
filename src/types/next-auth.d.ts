import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: number
      email: string
      cafeName: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId: number
    cafeName: string
  }
}
