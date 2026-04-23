'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { ArrowDownUp, ArrowDown, ArrowUp } from 'lucide-react'
import { useFeatures } from '@/lib/features'
import { ThemeToggleButton } from '@/components/layout/ThemeToggleButton'
import { useOffline } from '@/hooks/useOffline'
import { Spinner } from '@/components/ui/Spinner'
import { OfflinePlaceholder } from '@/components/ui/OfflinePlaceholder'
import { ErrorCard } from '@/components/ui/ErrorCard'
import { cacheSet, cacheGet } from '@/lib/localCache'

interface SalaryEntry {
  id: number
  name: string
  hourlyRate: number | null
  notes: string | null
  totalHours: number
  earned: number | null
}

const MONTH_NAMES = ['Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun', 'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar']

export default function SalaryPage() {
  const isOffline = useOffline()
  const features = useFeatures()
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [data, setData] = useState<SalaryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)
  const [saving, setSaving] = useState(false)
  const [localRates, setLocalRates] = useState<Record<number, string>>({})
  const [dirty, setDirty] = useState(false)
  const [sort, setSort] = useState<{ by: 'earned' | 'rate'; dir: 'desc' | 'asc' } | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setFetchError(false)
    const cacheKey = `salary_${month}_${year}`
    try {
      const res = await fetch(`/api/salary?month=${month}&year=${year}`)
      const json = await res.json()
      const entries: SalaryEntry[] = json.data ?? []
      setData(entries)
      cacheSet(cacheKey, entries)
      const rates: Record<number, string> = {}
      for (const emp of entries) {
        rates[emp.id] = emp.hourlyRate !== null ? Number(emp.hourlyRate).toFixed(1) : ''
      }
      setLocalRates(rates)
      setDirty(false)
    } catch {
      const cached = cacheGet<SalaryEntry[]>(cacheKey)
      if (cached) {
        setData(cached)
        const rates: Record<number, string> = {}
        for (const emp of cached) {
          rates[emp.id] = emp.hourlyRate !== null ? Number(emp.hourlyRate).toFixed(1) : ''
        }
        setLocalRates(rates)
        setDirty(false)
      } else {
        setFetchError(true)
      }
    } finally {
      setLoading(false)
    }
  }, [month, year])

  useEffect(() => { fetchData() }, [fetchData])

  const sortedData = useMemo(() => {
    if (!sort) return data
    return [...data].sort((a, b) => {
      const valA = sort.by === 'earned'
        ? a.totalHours * (parseFloat(localRates[a.id] ?? '0') || 0)
        : parseFloat(localRates[a.id] ?? '0') || 0
      const valB = sort.by === 'earned'
        ? b.totalHours * (parseFloat(localRates[b.id] ?? '0') || 0)
        : parseFloat(localRates[b.id] ?? '0') || 0
      return sort.dir === 'desc' ? valB - valA : valA - valB
    })
  }, [data, sort, localRates])

  const handleRateChange = (id: number, value: string) => {
    setLocalRates(prev => ({ ...prev, [id]: value }))
    setDirty(true)
  }

  const handleSaveAll = async () => {
    setSaving(true)
    try {
      await Promise.all(
        Object.entries(localRates).map(([id, rate]) =>
          fetch('/api/salary', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ employeeId: Number(id), hourlyRate: rate }),
          })
        )
      )
      await fetchData()
    } finally {
      setSaving(false)
    }
  }

  if (!features.salaryCalc) {
    return (
      <div className="py-10 text-center text-text-muted">
        <p>Kalkulator plata nije aktiviran za ovog klijenta.</p>
      </div>
    )
  }

  const totalEarned = data.reduce((acc, emp) => {
    const rate = parseFloat(localRates[emp.id] ?? '0') || 0
    return acc + (emp.totalHours * rate)
  }, 0)

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-text-primary">
          Plate
        </h1>
        <div className="flex items-center gap-1">
          <select
            value={month}
            onChange={e => setMonth(Number(e.target.value))}
            className="rounded-lg border border-border bg-bg-secondary px-2.5 py-1.5 text-sm text-text-primary cursor-pointer focus:outline-none focus:border-accent-green/50"
          >
            {MONTH_NAMES.map((m, i) => (
              <option key={i} value={i + 1}>{m}</option>
            ))}
          </select>
          <select
            value={year}
            onChange={e => setYear(Number(e.target.value))}
            className="rounded-lg border border-border bg-bg-secondary px-2.5 py-1.5 text-sm text-text-primary cursor-pointer focus:outline-none focus:border-accent-green/50"
          >
            {[2024, 2025, 2026, 2027].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <ThemeToggleButton />
        </div>
      </div>

      {!loading && (
        <div className="mb-3 flex items-center gap-1.5">
          <ArrowDownUp size={13} className="text-text-muted flex-shrink-0" />
          {(['earned', 'rate'] as const).map((by) => {
            const isActive = sort?.by === by
            const dir = isActive ? sort!.dir : null
            const Icon = dir === 'asc' ? ArrowUp : ArrowDown
            return (
              <button
                key={by}
                onClick={() => {
                  if (!isActive) setSort({ by, dir: 'desc' })
                  else if (dir === 'desc') setSort({ by, dir: 'asc' })
                  else setSort(null)
                }}
                className={`flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                  isActive
                    ? 'border-accent-green bg-accent-green/10 text-accent-green'
                    : 'border-border bg-bg-secondary text-text-secondary hover:text-text-primary'
                }`}
              >
                {by === 'earned' ? 'Po zaradi' : 'Po satnici'}
                {isActive && <Icon size={11} />}
              </button>
            )
          })}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : fetchError ? (
        isOffline
          ? <OfflinePlaceholder message="Plate nisu dostupne bez interneta." />
          : <ErrorCard message="Greška pri učitavanju plata." onRetry={fetchData} />
      ) : (
        <>
          {/* Employee cards */}
          <div className="mb-5 flex flex-col gap-2">
            {sortedData.map(emp => {
              const rate = parseFloat(localRates[emp.id] ?? '0') || 0
              const earned = emp.totalHours * rate

              return (
                <div
                  key={emp.id}
                  className="rounded-card border border-border bg-bg-secondary p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-text-primary">{emp.name}</div>
                      {emp.notes && (
                        <div className="mt-0.5 text-xs text-text-muted">{emp.notes}</div>
                      )}
                    </div>
                    <div className="rounded-lg bg-accent-green/10 px-2.5 py-1 text-sm font-semibold text-accent-green">
                      {emp.totalHours % 1 === 0 ? emp.totalHours : emp.totalHours.toFixed(1)}h
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="flex-1">
                      <label className="mb-1 block text-[0.72rem] text-text-muted">
                        Cena po satu (RSD/h)
                      </label>
                      <div className="flex gap-1.5">
                        <input
                          type="number"
                          value={localRates[emp.id] ?? ''}
                          onChange={e => handleRateChange(emp.id, e.target.value)}
                          placeholder="0.0"
                          step="0.1"
                          min="0"
                          max="9999"
                          className="w-24 rounded-lg border border-border bg-bg-tertiary px-2.5 py-2 text-sm text-text-primary tabular-nums outline-none focus:border-accent-green/50"
                        />
                      </div>
                    </div>

                    <div className="min-w-[90px] text-right">
                      <div className="text-[0.72rem] text-text-muted">Zarada</div>
                      <div className={`text-lg font-bold tabular-nums ${rate > 0 ? 'text-accent-green' : 'text-text-muted'}`}>
                        {rate > 0 ? `${earned.toLocaleString('sr-RS')} RSD` : '—'}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Monthly total */}
          <div className="flex items-center justify-between rounded-card border border-accent-green/20 bg-accent-green/8 px-5 py-4">
            <div className="text-sm text-text-secondary">
              Ukupno za {MONTH_NAMES[month - 1]}
            </div>
            <div className="text-xl font-bold tabular-nums text-accent-green">
              {totalEarned.toLocaleString('sr-RS')} RSD
            </div>
          </div>

          {dirty && (
            <button
              onClick={handleSaveAll}
              disabled={saving || isOffline}
              className="mt-3 w-full rounded-card bg-accent-green py-3 text-sm font-semibold text-bg-primary transition-opacity disabled:opacity-60"
            >
              {saving ? 'Čuvanje...' : isOffline ? 'Nije dostupno offline' : 'Sačuvaj cene'}
            </button>
          )}
        </>
      )}
    </div>
  )
}
