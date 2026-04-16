'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Calendar } from 'lucide-react'
import { DAY_NAMES } from '@/types'
import { Spinner } from '@/components/ui/Spinner'
import { MonthYearPicker } from './MonthYearPicker'

const MONTH_NAMES_SR = [
  'Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun',
  'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar',
]

interface DayEntry {
  date: string
  dayOfWeek: number
  shifts: { shiftType: string; halfShift: boolean; middleStart: number | null; middleEnd: number | null }[]
}

interface EmployeeData {
  employee: {
    id: number
    name: string
    isActive: boolean
  }
  summary: {
    firstShifts: number
    firstHours: number
    secondShifts: number
    secondHours: number
    middleShifts: number
    middleHours: number
    workDays: number
    offDays: number
    totalHours: number
  }
  days: DayEntry[]
}

type FilterType = 'first' | 'second' | 'middle' | 'off'

function formatCount(value: number): string {
  return value % 1 === 0 ? String(value) : value.toFixed(1)
}

function shiftLabel(
  shiftType: string,
  halfShift: boolean,
  middleStart: number | null,
  middleEnd: number | null,
): { emoji: string; text: string; colorClass: string } {
  switch (shiftType) {
    case 'first':
      return {
        emoji: '🌅',
        text: halfShift ? 'Prva (½)' : 'Prva smena',
        colorClass: 'bg-accent-green/15 text-accent-green-dark border-accent-green/30',
      }
    case 'second':
      return {
        emoji: '🌆',
        text: halfShift ? 'Druga (½)' : 'Druga smena',
        colorClass: 'bg-accent-blue/15 text-accent-blue-dark border-accent-blue/30',
      }
    case 'middle': {
      const hours =
        middleStart != null && middleEnd != null
          ? Math.round((middleEnd - middleStart) / 60)
          : null
      return {
        emoji: '🕐',
        text: hours ? `Međusmena ${hours}h` : 'Međusmena',
        colorClass: 'bg-[#F59E0B]/15 text-[#B45309] border-[#F59E0B]/30',
      }
    }
    case 'off':
      return {
        emoji: '💤',
        text: 'Slobodan',
        colorClass: 'bg-accent-red/10 text-accent-red border-accent-red/25',
      }
    default:
      return { emoji: '', text: '', colorClass: '' }
  }
}

interface EmployeeDailyViewProps {
  employeeId: number
  initialMonth: number
  initialYear: number
}

export function EmployeeDailyView({ employeeId, initialMonth, initialYear }: EmployeeDailyViewProps) {
  const router = useRouter()
  const [month, setMonth] = useState(initialMonth)
  const [year, setYear] = useState(initialYear)
  const [data, setData] = useState<EmployeeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeFilters, setActiveFilters] = useState<Set<FilterType>>(new Set())

  useEffect(() => {
    setLoading(true)
    setActiveFilters(new Set())
    fetch(`/api/stats/employee/${employeeId}?month=${month}&year=${year}`)
      .then((res) => res.json())
      .then((json) => setData(json.data ?? null))
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [employeeId, month, year])

  function toggleFilter(type: FilterType) {
    setActiveFilters((prev) => {
      const next = new Set(prev)
      if (next.has(type)) {
        next.delete(type)
      } else {
        next.add(type)
      }
      return next
    })
  }

  const filteredDays = data
    ? activeFilters.size === 0
      ? data.days
      : data.days.filter((d) => d.shifts.some((s) => activeFilters.has(s.shiftType as FilterType)))
    : []

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3 pb-2">
        <button
          onClick={() => router.back()}
          className="rounded-full p-1.5 text-text-muted transition-colors hover:bg-bg-tertiary hover:text-text-primary"
        >
          <ArrowLeft size={22} />
        </button>
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-xl font-bold text-text-primary">
            {data ? data.employee.name : 'Učitavanje...'}
          </h1>
          <p className="text-sm text-text-muted">Dnevni pregled</p>
        </div>
      </div>

      {/* Month/Year picker */}
      <MonthYearPicker
        month={month}
        year={year}
        onChange={(m, y) => { setMonth(m); setYear(y) }}
      />

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : !data ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-text-secondary">
          <Calendar size={48} className="text-text-muted" />
          <p className="text-center text-sm">Nema podataka.</p>
        </div>
      ) : (
        <>
          {/* Summary cards — 3+2 grid */}
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-3 gap-2">
              <SummaryCard
                emoji="🌅"
                label="Prva"
                value={`${Math.round(data.summary.firstHours)}h`}
                subValue={`${formatCount(data.summary.firstShifts)} smena`}
                colorClass="bg-accent-green/15 text-accent-green-dark"
                isActive={activeFilters.has('first')}
                onClick={() => toggleFilter('first')}
              />
              <SummaryCard
                emoji="🌆"
                label="Druga"
                value={`${Math.round(data.summary.secondHours)}h`}
                subValue={`${formatCount(data.summary.secondShifts)} smena`}
                colorClass="bg-accent-blue/15 text-accent-blue-dark"
                isActive={activeFilters.has('second')}
                onClick={() => toggleFilter('second')}
              />
              <SummaryCard
                emoji="🕐"
                label="Međusm."
                value={`${Math.round(data.summary.middleHours)}h`}
                subValue={`${formatCount(data.summary.middleShifts)} smena`}
                colorClass="bg-[#F59E0B]/15 text-[#B45309]"
                isActive={activeFilters.has('middle')}
                onClick={() => toggleFilter('middle')}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <SummaryCard
                emoji="Σ"
                label="Ukupno"
                value={`${Math.round(data.summary.totalHours)}h`}
                subValue={`${formatCount(data.summary.workDays)} radnih dana`}
                colorClass="bg-bg-tertiary text-text-primary"
                isActive={activeFilters.size === 0}
                onClick={() => setActiveFilters(new Set())}
              />
              <SummaryCard
                emoji="💤"
                label="Slobodni"
                value={String(data.summary.offDays)}
                subValue="dana"
                colorClass="bg-accent-red/10 text-accent-red"
                isActive={activeFilters.has('off')}
                onClick={() => toggleFilter('off')}
              />
            </div>
          </div>

          {/* Daily list */}
          <div className="flex flex-col gap-1.5">
            {filteredDays.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-text-muted">
                <Calendar size={32} className="opacity-40" />
                <p className="text-sm">Nema unosa za izabrani filter.</p>
              </div>
            )}
            {filteredDays.map((day) => {
              const dateObj = new Date(day.date)
              const dateStr = `${String(dateObj.getDate()).padStart(2, '0')}.${String(dateObj.getMonth() + 1).padStart(2, '0')}.`
              const dayName = DAY_NAMES[day.dayOfWeek]
              const isWeekend = day.dayOfWeek >= 5
              const hasShifts = day.shifts.length > 0

              return (
                <div
                  key={day.date}
                  className={`flex items-center gap-3 rounded-card px-3 py-2.5 ${
                    isWeekend ? 'bg-bg-tertiary/50' : 'bg-bg-secondary'
                  } border border-border`}
                >
                  <div className="w-16 shrink-0">
                    <span className="text-sm font-medium text-text-primary">{dateStr}</span>
                  </div>
                  <div className="w-20 shrink-0">
                    <span className={`text-xs font-medium ${isWeekend ? 'text-accent-red' : 'text-text-muted'}`}>
                      {dayName}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 flex-1">
                    {hasShifts ? (
                      day.shifts.map((shift, idx) => {
                        const info = shiftLabel(shift.shiftType, shift.halfShift, shift.middleStart, shift.middleEnd)
                        return (
                          <span
                            key={idx}
                            className={`inline-flex items-center gap-1 rounded-pill border px-2.5 py-0.5 text-xs font-medium ${info.colorClass}`}
                          >
                            <span>{info.emoji}</span>
                            <span>{info.text}</span>
                          </span>
                        )
                      })
                    ) : (
                      <span className="text-xs text-text-muted">—</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

function SummaryCard({
  emoji,
  label,
  value,
  subValue,
  colorClass,
  onClick,
  isActive,
}: {
  emoji: string
  label: string
  value: string
  subValue?: string
  colorClass: string
  onClick?: () => void
  isActive?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full flex-col items-center gap-0.5 rounded-card border p-3 transition-all duration-150 active:scale-[0.97] cursor-pointer ${colorClass} ${
        isActive ? 'border-accent-green ring-2 ring-accent-green scale-[1.03]' : 'border-border'
      }`}
    >
      <span className="text-sm">{emoji}</span>
      <span className="font-[family-name:var(--font-heading)] text-xl font-bold leading-tight">{value}</span>
      {subValue && (
        <span className="text-[10px] font-medium opacity-60 leading-tight">{subValue}</span>
      )}
      <span className="text-[10px] font-medium opacity-70 mt-0.5">{label}</span>
    </button>
  )
}
