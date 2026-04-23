'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { Employee } from '@/types'
import { StatsTabBar } from '@/components/statistics/StatsTabBar'
import { cacheSet, cacheGet } from '@/lib/localCache'
import { MonthYearPicker } from '@/components/statistics/MonthYearPicker'
import { DateRangePicker } from '@/components/statistics/DateRangePicker'
import { EmployeeFilter } from '@/components/statistics/EmployeeFilter'
import { WeeklyView } from '@/components/statistics/WeeklyView'
import { MonthlyView } from '@/components/statistics/MonthlyView'
import { CustomRangeView } from '@/components/statistics/CustomRangeView'
import { ThemeToggleButton } from '@/components/layout/ThemeToggleButton'

export default function StatistikaPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const now = new Date()

  const [month, setMonth] = useState(() => {
    const m = parseInt(searchParams.get('month') ?? '')
    return !isNaN(m) && m >= 1 && m <= 12 ? m : now.getMonth() + 1
  })
  const [year, setYear] = useState(() => {
    const y = parseInt(searchParams.get('year') ?? '')
    return !isNaN(y) && y >= 2020 ? y : now.getFullYear()
  })
  const [activeTab, setActiveTab] = useState<'sedmicno' | 'mesecno'>(() => {
    const t = searchParams.get('tab')
    return t === 'mesecno' ? 'mesecno' : 'sedmicno'
  })
  const [useCustomRange, setUseCustomRange] = useState(false)
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [allEmployees, setAllEmployees] = useState<Employee[]>([])
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<Set<number>>(new Set())

  // Sync state → URL
  useEffect(() => {
    const params = new URLSearchParams()
    params.set('month', String(month))
    params.set('year', String(year))
    params.set('tab', activeTab)
    router.replace(`/statistika?${params.toString()}`, { scroll: false })
  }, [month, year, activeTab, router])

  const fetchEmployees = useCallback(async () => {
    try {
      const res = await fetch('/api/employees?all=true')
      const json = await res.json()
      const employees = json.data ?? []
      setAllEmployees(employees)
      cacheSet('employees_all', employees)
    } catch {
      const cached = cacheGet<Employee[]>('employees_all')
      if (cached) setAllEmployees(cached)
      // Ako nema keša — filter jednostavno neće biti prikazan
    }
  }, [])

  useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  function handleMonthYearChange(newMonth: number, newYear: number) {
    setMonth(newMonth)
    setYear(newYear)
  }

  function handleTabChange(tab: 'sedmicno' | 'mesecno') {
    setActiveTab(tab)
  }

  function handleEmployeeToggle(id: number) {
    setSelectedEmployeeIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleEmployeeClear() {
    setSelectedEmployeeIds(new Set())
  }

  function handleToggleCustomRange() {
    setUseCustomRange((prev) => !prev)
    setSelectedEmployeeIds(new Set())
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-text-primary">
          Statistika
        </h1>
        <ThemeToggleButton />
      </div>

      {/* Tab bar — skriven u custom range modu */}
      {!useCustomRange && (
        <StatsTabBar activeTab={activeTab} onChange={handleTabChange} />
      )}

      {/* Period selektor */}
      {useCustomRange ? (
        <DateRangePicker
          from={customFrom}
          to={customTo}
          onChange={(f, t) => { setCustomFrom(f); setCustomTo(t) }}
        />
      ) : (
        <MonthYearPicker month={month} year={year} onChange={handleMonthYearChange} />
      )}

      {/* Toggle custom range */}
      <button
        onClick={handleToggleCustomRange}
        className="self-start text-xs text-text-muted hover:text-text-secondary underline underline-offset-2 transition-colors"
      >
        {useCustomRange ? '← Nazad na mesečni prikaz' : 'Prilagođeni period →'}
      </button>

      {/* Filter po zaposlenom */}
      {allEmployees.length > 0 && (
        <EmployeeFilter
          employees={allEmployees}
          selectedIds={selectedEmployeeIds}
          onToggle={handleEmployeeToggle}
          onClear={handleEmployeeClear}
        />
      )}

      {/* Glavni sadržaj */}
      {useCustomRange ? (
        <CustomRangeView
          from={customFrom}
          to={customTo}
          filteredEmployeeIds={selectedEmployeeIds}
        />
      ) : activeTab === 'sedmicno' ? (
        <WeeklyView
          month={month}
          year={year}
          filteredEmployeeIds={selectedEmployeeIds}
        />
      ) : (
        <MonthlyView
          month={month}
          year={year}
          filteredEmployeeIds={selectedEmployeeIds}
        />
      )}
    </div>
  )
}
