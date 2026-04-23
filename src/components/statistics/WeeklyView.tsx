'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { BarChart3, Plus, ArrowUp } from 'lucide-react'
import type { WeekStats } from '@/types'
import { Spinner } from '@/components/ui/Spinner'
import { ErrorCard } from '@/components/ui/ErrorCard'
import { OfflinePlaceholder } from '@/components/ui/OfflinePlaceholder'
import { cacheSet, cacheGet } from '@/lib/localCache'
import { WeekAccordion } from './WeekAccordion'
import { useFeatures } from '@/lib/features'

const MONTH_NAMES_SR = [
  'Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun',
  'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar',
]

interface WeeklyViewProps {
  month: number
  year: number
  filteredEmployeeIds: Set<number>
}

export function WeeklyView({ month, year, filteredEmployeeIds }: WeeklyViewProps) {
  const features = useFeatures()
  const [data, setData] = useState<WeekStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [openWeekIds, setOpenWeekIds] = useState<Set<number>>(new Set())
  const [scrolledFar, setScrolledFar] = useState(false)

  const handleScroll = useCallback(() => {
    setScrolledFar(window.scrollY > window.innerHeight)
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  useEffect(() => {
    setLoading(true)
    setError(null)

    const cacheKey = `stats_weekly_${month}_${year}`
    fetch(`/api/stats/weekly?month=${month}&year=${year}`)
      .then((res) => res.json())
      .then((json) => {
        const weeks: WeekStats[] = json.data ?? []
        setData(weeks)
        cacheSet(cacheKey, weeks)
        setOpenWeekIds(new Set())
      })
      .catch(() => {
        const cached = cacheGet<WeekStats[]>(cacheKey)
        if (cached) {
          setData(cached)
        } else {
          setError(!navigator.onLine ? 'offline' : 'Greška pri učitavanju sedmičnih statistika.')
        }
      })
      .finally(() => setLoading(false))
  }, [month, year, retryCount])

  function handleToggle(weekId: number) {
    setOpenWeekIds((prev) => {
      const next = new Set(prev)
      if (next.has(weekId)) next.delete(weekId)
      else next.add(weekId)
      return next
    })
  }

  const allOpen = data.length > 0 && openWeekIds.size === data.length
  const shouldShowClose = allOpen || openWeekIds.size > 2

  function handleExpandCollapseAll() {
    if (shouldShowClose) {
      setOpenWeekIds(new Set())
    } else {
      setOpenWeekIds(new Set(data.map((w) => w.weekId)))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return error === 'offline'
      ? <OfflinePlaceholder message="Statistika nije dostupna bez interneta." />
      : <ErrorCard message={error} onRetry={() => setRetryCount((c) => c + 1)} />
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-text-secondary">
        <BarChart3 size={48} className="text-text-muted" />
        <p className="text-center text-sm">
          Nema rasporeda za {MONTH_NAMES_SR[month - 1]} {year}.
        </p>
        <Link
          href="/novi"
          className="inline-flex items-center gap-2 rounded-pill bg-accent-green px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-accent-green-dark active:scale-[0.97]"
        >
          <Plus size={16} />
          Kreiraj raspored
        </Link>
      </div>
    )
  }

  const showScrollTop = scrolledFar && openWeekIds.size >= 2

  return (
    <div className="flex flex-col gap-3">
      {/* Scroll to top FAB */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Nazad na vrh"
        className={`fixed bottom-24 right-4 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-bg-secondary border border-border text-text-secondary shadow-lg transition-all duration-200 hover:border-accent-green/50 hover:text-accent-green active:scale-90 ${
          showScrollTop ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-2 pointer-events-none'
        }`}
      >
        <ArrowUp size={18} />
      </button>

      {/* Expand / collapse all */}
      <div className="flex justify-end">
        <button
          onClick={handleExpandCollapseAll}
          className="text-xs text-accent-green hover:underline active:opacity-70"
        >
          {shouldShowClose ? 'Zatvori sve' : 'Proširi sve'}
        </button>
      </div>

      {data.map((weekStats) => (
        <WeekAccordion
          key={weekStats.weekId}
          weekStats={weekStats}
          filteredEmployeeIds={filteredEmployeeIds}
          isOpen={openWeekIds.has(weekStats.weekId)}
          onToggle={() => handleToggle(weekStats.weekId)}
          selectedMonth={month}
          selectedYear={year}
        />
      ))}
    </div>
  )
}
