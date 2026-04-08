'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ClipboardList, Plus, BarChart3, Users, DollarSign } from 'lucide-react'
import { useFeatures } from '@/lib/features'

const BASE_NAV_ITEMS = [
  { href: '/', label: 'Raspored', icon: ClipboardList },
  { href: '/novi', label: 'Novi', icon: Plus },
  { href: '/statistika', label: 'Statistika', icon: BarChart3 },
  { href: '/zaposleni', label: 'Zaposleni', icon: Users },
]

const AUTH_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email']

export function BottomNav() {
  const pathname = usePathname()
  const features = useFeatures()

  if (AUTH_ROUTES.some((route) => pathname.startsWith(route))) return null

  const navItems = features.salaryCalc
    ? [...BASE_NAV_ITEMS, { href: '/salary', label: 'Plate', icon: DollarSign }]
    : BASE_NAV_ITEMS

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 no-print border-t border-border bg-bg-secondary"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)' }}
    >
      <div className="mx-auto flex max-w-[430px] items-center justify-around px-0 pt-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center gap-0.5 px-3 py-1 transition-colors duration-200 ${
                isActive ? 'text-accent-green' : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
              {isActive && (
                <span className="absolute bottom-0 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-accent-green" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
