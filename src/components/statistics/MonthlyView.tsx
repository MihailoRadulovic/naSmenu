'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { BarChart3, Plus } from 'lucide-react'
import type { EmployeeStats } from '@/types'
import { Spinner } from '@/components/ui/Spinner'
import { ErrorCard } from '@/components/ui/ErrorCard'
import { OfflinePlaceholder } from '@/components/ui/OfflinePlaceholder'
import { cacheSet, cacheGet } from '@/lib/localCache'
import { EmployeeStatRow } from './EmployeeStatRow'
import { MonthlyHoursChart } from './MonthlyHoursChart'
import { useFeatures } from '@/lib/features'

const MONTH_NAMES_SR = [
  'Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun',
  'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar',
]

type SortOrder = 'desc' | 'asc'

interface MonthlyViewProps {
  month: number
  year: number
  filteredEmployeeIds: Set<number>
}

export function MonthlyView({ month, year, filteredEmployeeIds }: MonthlyViewProps) {
  const features = useFeatures()
  const [data, setData] = useState<EmployeeStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  useEffect(() => {
    setLoading(true)
    setError(null)

    const cacheKey = `stats_monthly_${month}_${year}`
    fetch(`/api/stats/monthly?month=${month}&year=${year}`)
      .then((res) => res.json())
      .then((json) => {
        const d: EmployeeStats[] = json.data ?? []
        setData(d)
        cacheSet(cacheKey, d)
      })
      .catch(() => {
        const cached = cacheGet<EmployeeStats[]>(cacheKey)
        if (cached) {
          setData(cached)
        } else {
          setError(!navigator.onLine ? 'offline' : 'Greška pri učitavanju mesečnih statistika.')
        }
      })
      .finally(() => setLoading(false))
  }, [month, year, retryCount])

  const filteredData = useMemo(() => {
    const base = filteredEmployeeIds.size === 0
      ? data
      : data.filter((s) => filteredEmployeeIds.has(s.employee.id))

    return [...base].sort((a, b) =>
      sortOrder === 'desc'
        ? b.totalHours - a.totalHours
        : a.totalHours - b.totalHours
    )
  }, [data, filteredEmployeeIds, sortOrder])

  const maxTotalHours = useMemo(
    () => Math.max(...filteredData.map((s) => s.totalHours), 1),
    [filteredData]
  )

  const totalHours = useMemo(
    () => filteredData.reduce((sum, s) => sum + s.totalHours, 0),
    [filteredData]
  )

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

  const formattedTotal = totalHours % 1 === 0 ? String(totalHours) : totalHours.toFixed(1)

  return (
    <div className="flex flex-col gap-4">
      {/* Summary kartica */}
      <div className="rounded-card-lg border border-accent-green/30 bg-accent-green/10 p-5">
        <p className="text-sm text-text-secondary mb-1">Ukupno sati rada</p>
        <p className="font-[family-name:var(--font-heading)] text-3xl font-bold text-accent-green">
          {formattedTotal}h
        </p>
        <p className="text-xs text-text-muted mt-1">
          {filteredData.length} zaposlenih · {MONTH_NAMES_SR[month - 1]} {year}.
        </p>
      </div>

      {/* Bar chart */}
      {features.charts && filteredData.length >= 2 && (
        <MonthlyHoursChart data={filteredData} />
      )}

      {/* Sort + lista */}
      <div className="flex flex-col gap-2">
        {/* Sort pills */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted">Sortiraj:</span>
          <button
            onClick={() => setSortOrder('desc')}
            className={`rounded-pill border px-3 py-1 text-xs font-medium transition-colors ${
              sortOrder === 'desc'
                ? 'border-accent-green/40 bg-accent-green/10 text-accent-green'
                : 'border-border bg-transparent text-text-muted hover:border-accent-green/30 hover:text-text-secondary'
            }`}
          >
            Više → Manje
          </button>
          <button
            onClick={() => setSortOrder('asc')}
            className={`rounded-pill border px-3 py-1 text-xs font-medium transition-colors ${
              sortOrder === 'asc'
                ? 'border-accent-green/40 bg-accent-green/10 text-accent-green'
                : 'border-border bg-transparent text-text-muted hover:border-accent-green/30 hover:text-text-secondary'
            }`}
          >
            Manje → Više
          </button>
        </div>

        {/* Lista zaposlenih */}
        {filteredData.map((stat) => (
          <EmployeeStatRow
            key={stat.employee.id}
            stat={stat}
            maxTotalHours={maxTotalHours}
            month={month}
            year={year}
          />
        ))}
      </div>
    </div>
  )
}
