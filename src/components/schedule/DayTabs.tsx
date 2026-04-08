'use client'

import { DAY_NAMES_SHORT } from '@/types'
import type { WeekSchedule } from '@/types'
import { toISODateString } from '@/lib/dates'
import { getHoliday } from '@/lib/holidays'
import { useFeatures } from '@/lib/features'

interface DayTabsProps {
  selectedDay: number
  schedule: WeekSchedule
  onSelectDay: (day: number) => void
  weekStartDate?: Date
}

export function DayTabs({ selectedDay, schedule, onSelectDay, weekStartDate }: DayTabsProps) {
  const features = useFeatures()
  return (
    <div className="flex overflow-x-auto gap-1 rounded-card bg-bg-secondary border border-border p-1.5 no-scrollbar">
      {DAY_NAMES_SHORT.map((label, day) => {
        const isActive = selectedDay === day
        const hasEntries = schedule[day] && Object.keys(schedule[day]).length > 0

        let holiday = undefined
        if (features.holidays && weekStartDate) {
          const d = new Date(weekStartDate)
          d.setUTCDate(d.getUTCDate() + day)
          holiday = getHoliday(toISODateString(d))
        }

        return (
          <button
            key={day}
            onClick={() => onSelectDay(day)}
            className={`
              relative flex flex-col items-center justify-center min-w-[42px] flex-1
              rounded-[10px] py-2 px-1 text-xs font-semibold
              transition-all duration-150 active:scale-95
              ${isActive
                ? 'bg-accent-green text-white shadow-sm'
                : holiday
                ? 'text-[#FF7B47] hover:bg-bg-tertiary'
                : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
              }
            `}
          >
            {label}
            {holiday && !isActive && (
              <span className="mt-0.5 h-1 w-1 rounded-full bg-[#FF7B47]/60" />
            )}
            {hasEntries && !holiday && (
              <span
                className={`mt-0.5 h-1 w-1 rounded-full ${
                  isActive ? 'bg-white/60' : 'bg-accent-green'
                }`}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
