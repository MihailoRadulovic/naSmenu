'use client'

import { useState, useEffect, useMemo } from 'react'
import { BarChart3 } from 'lucide-react'
import type { EmployeeStats } from '@/types'
import { Spinner } from '@/components/ui/Spinner'
import { ErrorCard } from '@/components/ui/ErrorCard'
import { EmployeeStatRow } from './EmployeeStatRow'

interface CustomRangeViewProps {
  from: string   // "YYYY-MM-DD" ili ""
  to: string
  filteredEmployeeIds: Set<number>
}

export function CustomRangeView({ from, to, filteredEmployeeIds }: CustomRangeViewProps) {
  const [data, setData] = useState<EmployeeStats[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const isValidRange = Boolean(from && to && from <= to)

  useEffect(() => {
    if (!isValidRange) {
      setData([])
      return
    }

    setLoading(true)
    setError(null)

    const empParam =
      filteredEmployeeIds.size > 0
        ? `&employeeIds=${Array.from(filteredEmployeeIds).join(',')}`
        : ''

    fetch(`/api/stats/custom?from=${from}&to=${to}${empParam}`)
      .then((res) => res.json())
      .then((json) => setData(json.data ?? []))
      .catch(() => setError('Greška pri učitavanju statistika.'))
      .finally(() => setLoading(false))
  }, [from, to, filteredEmployeeIds, isValidRange, retryCount])

  const filteredData = useMemo(() => {
    if (filteredEmployeeIds.size === 0) return data
    return data.filter((s) => filteredEmployeeIds.has(s.employee.id))
  }, [data, filteredEmployeeIds])

  const maxTotalHours = useMemo(
    () => Math.max(...filteredData.map((s) => s.totalHours), 1),
    [filteredData]
  )

  if (!from || !to) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-text-secondary">
        <BarChart3 size={48} className="text-text-muted" />
        <p className="text-center text-sm">Izaberite period za prikaz statistike.</p>
      </div>
    )
  }

  if (!isValidRange) return null  // DateRangePicker pokazuje error poruku

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <ErrorCard
        message={error}
        onRetry={() => setRetryCount((c) => c + 1)}
      />
    )
  }

  if (filteredData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-text-secondary">
        <BarChart3 size={48} className="text-text-muted" />
        <p className="text-center text-sm">Nema podataka za izabrani period.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {filteredData.map((stat) => (
        <EmployeeStatRow
          key={stat.employee.id}
          stat={stat}
          maxTotalHours={maxTotalHours}
        />
      ))}
    </div>
  )
}
