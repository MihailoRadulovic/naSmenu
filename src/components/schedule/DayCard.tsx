'use client'

import { useRouter } from 'next/navigation'
import type { WeekWithEntries, ShiftType } from '@/types'
import { DAY_NAMES } from '@/types'
import { ShiftBadge } from './ShiftBadge'
import { formatDateShort, toISODateString } from '@/lib/dates'
import { getHoliday } from '@/lib/holidays'
import { features } from '@/lib/features'
import { minutesToTime } from '@/lib/shiftHours'
import { DEFAULT_SHIFT_SETTINGS } from '@/lib/shiftSettings'
import type { ShiftSettings } from '@/lib/shiftSettings'

interface DayCardProps {
  day: number // 0=pon...6=ned
  date: Date
  weekId: number | null
  entries: WeekWithEntries['entries']
  shiftSettings?: ShiftSettings
}


function isToday(date: Date): boolean {
  const now = new Date()
  return (
    date.getUTCDate() === now.getUTCDate() &&
    date.getUTCMonth() === now.getUTCMonth() &&
    date.getUTCFullYear() === now.getUTCFullYear()
  )
}

export function DayCard({ day, date, weekId, entries, shiftSettings }: DayCardProps) {
  const settings = shiftSettings ?? DEFAULT_SHIFT_SETTINGS
  const router = useRouter()
  const today = isToday(date)
  const dateStr = toISODateString(date)
  const holiday = features.holidays ? getHoliday(dateStr) : undefined

  const firstShift = entries.filter((e) => e.shiftType === 'first')
  const middleShift = entries.filter((e) => e.shiftType === 'middle')
  const secondShift = entries.filter((e) => e.shiftType === 'second')
  const offShift = entries.filter((e) => e.shiftType === 'off')
  const sickLeave = entries.filter((e) => e.shiftType === 'sick_leave')
  const vacation = entries.filter((e) => e.shiftType === 'vacation')
  const late = entries.filter((e) => e.shiftType === 'late')

  function handleClick() {
    const weekStart = new Date(date)
    weekStart.setUTCDate(weekStart.getUTCDate() - day)
    const startDate = toISODateString(weekStart)
    if (weekId) {
      router.push(`/novi?weekId=${weekId}&day=${day}&startDate=${startDate}`)
    } else {
      router.push(`/novi?day=${day}&startDate=${startDate}`)
    }
  }

  return (
    <div
      onClick={handleClick}
      className={`cursor-pointer rounded-card border p-4 transition-all duration-200 hover:border-accent-green/40 hover:shadow-sm active:scale-[0.99] ${
        holiday
          ? 'border-[#FF7B47]/30 bg-[#FF7B47]/5'
          : today
          ? 'bg-bg-secondary border-l-4 border-accent-green/60 border-l-accent-green'
          : 'bg-bg-secondary border-border'
      }`}
    >
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-[family-name:var(--font-heading)] font-bold text-text-primary">
            {DAY_NAMES[day]}
          </span>
          {today && !holiday && (
            <span className="rounded-pill bg-accent-green-dark px-2 py-0.5 text-xs font-semibold text-white">
              Danas
            </span>
          )}
          {holiday && (
            <span className="rounded-pill bg-[#FF7B47]/20 px-2 py-0.5 text-xs font-semibold text-[#FF7B47]">
              🎉 {holiday.name}
            </span>
          )}
        </div>
        <span className="text-sm text-text-muted">{formatDateShort(date)}</span>
      </div>

      {/* Smene */}
      <div className="flex flex-col gap-2">
        <ShiftRow emoji="🌅" label="Prva" time={`${settings.firstStart}–${settings.firstEnd}`} entries={firstShift} shiftType="first" />
        {middleShift.length > 0 && (
          <MiddleShiftRow entries={middleShift} />
        )}
        <ShiftRow emoji="🌆" label="Druga" time={`${settings.secondStart}–${settings.secondEnd}`} entries={secondShift} shiftType="second" />
        <ShiftRow emoji="💤" label="Slobodan dan" entries={offShift} shiftType="off" />
        {features.absenceTypes && sickLeave.length > 0 && (
          <ShiftRow emoji="🏥" label="Bolovanje" entries={sickLeave} shiftType="sick_leave" />
        )}
        {features.absenceTypes && vacation.length > 0 && (
          <ShiftRow emoji="🏖️" label="Godišnji" entries={vacation} shiftType="vacation" />
        )}
        {features.absenceTypes && late.length > 0 && (
          <ShiftRow emoji="⏰" label="Kasnio/la" entries={late} shiftType="late" />
        )}
      </div>
    </div>
  )
}

function ShiftRow({
  emoji,
  label,
  time,
  entries,
  shiftType,
}: {
  emoji: string
  label: string
  time?: string
  entries: WeekWithEntries['entries']
  shiftType: ShiftType
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-xs shrink-0 text-text-muted tabular-nums w-[88px] pt-0.5 leading-5">
        {time ?? label}
      </span>
      <div className="flex flex-wrap gap-1.5 flex-1">
        {entries.length === 0 ? (
          <span className="text-sm text-text-muted">—</span>
        ) : (
          entries.map((e) => (
            <ShiftBadge
              key={e.id}
              name={e.employee.name}
              shiftType={shiftType}
              halfShift={e.halfShift}
            />
          ))
        )}
      </div>
    </div>
  )
}

function MiddleShiftRow({ entries }: { entries: WeekWithEntries['entries'] }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-xs shrink-0 text-text-muted tabular-nums w-[88px] pt-0.5 leading-5">
        Međusmena
      </span>
      <div className="flex flex-wrap gap-1.5 flex-1">
        {entries.map((e) => {
          const timeLabel =
            e.middleStart != null && e.middleEnd != null
              ? `${minutesToTime(e.middleStart)}–${minutesToTime(e.middleEnd)}`
              : undefined
          return (
            <ShiftBadge
              key={e.id}
              name={e.employee.name}
              shiftType="middle"
              timeLabel={timeLabel}
            />
          )
        })}
      </div>
    </div>
  )
}
