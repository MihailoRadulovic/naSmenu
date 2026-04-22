import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Routes that require authentication
const PROTECTED_PATHS = ['/', '/novi', '/statistika', '/zaposleni', '/salary']

// Rate limiters — only created when Upstash env vars are present
function makeRatelimit(tokens: number, window: `${number} ${'s' | 'm' | 'h' | 'd'}`) {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null
  }
  return new Ratelimit({
    redis: new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    }),
    limiter: Ratelimit.slidingWindow(tokens, window),
    analytics: false,
  })
}

// 5 req/min on registration and password-reset flows; 10/min on login
const strictLimiter = makeRatelimit(5, '1 m')
const loginLimiter = makeRatelimit(10, '1 m')

const RATE_LIMIT_ROUTES: { prefix: string; limiter: Ratelimit | null }[] = [
  { prefix: '/api/register', limiter: strictLimiter },
  { prefix: '/api/auth/forgot-password', limiter: strictLimiter },
  { prefix: '/api/auth/reset-password', limiter: strictLimiter },
  { prefix: '/api/auth/callback/credentials', limiter: loginLimiter },
]

function getIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  )
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Rate limiting on sensitive API routes (skipped when Upstash is not configured)
  const route = RATE_LIMIT_ROUTES.find(r => pathname.startsWith(r.prefix))
  if (route?.limiter) {
    const ip = getIp(request)
    const { success } = await route.limiter.limit(`${ip}:${route.prefix}`)
    if (!success) {
      return NextResponse.json(
        { error: 'Previše zahteva. Pokušajte ponovo za minut.' },
        { status: 429 }
      )
    }
  }

  // 2. Protect page routes — redirect to /login if no session
  const isProtectedPage = PROTECTED_PATHS.some(p =>
    p === '/' ? pathname === '/' : pathname === p || pathname.startsWith(p + '/')
  )

  if (isProtectedPage) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    if (!token) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons|theme-init.js|sw.js|workbox-.*).*)',
  ],
}
