'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Settings2, UserCircle } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import type { WeekWithEntries } from '@/types'
import type { WeekBounds } from '@/types'
import { getCurrentWeekBounds, addWeeks, toISODateString, getWeekBounds } from '@/lib/dates'
import { ThemeToggleButton } from '@/components/layout/ThemeToggleButton'
import { Spinner } from '@/components/ui/Spinner'
import { ErrorCard } from '@/components/ui/ErrorCard'
import { OfflinePlaceholder } from '@/components/ui/OfflinePlaceholder'
import { useOffline } from '@/hooks/useOffline'
import { WeekPicker } from './WeekPicker'
import { DayCard } from './DayCard'
import { WhatsAppShare } from './WhatsAppShare'
import { PrintScheduleButton } from './PrintScheduleButton'
import { ShiftSettingsModal } from './ShiftSettingsModal'
import { ProfileModal } from '@/components/profile/ProfileModal'
import { loadShiftSettings } from '@/lib/shiftSettings'
import type { ShiftSettings } from '@/lib/shiftSettings'
import { cacheSet, cacheGet } from '@/lib/localCache'

export function WeekView() {
  const isOffline = useOffline()
  const searchParams = useSearchParams()
  const [bounds, setBounds] = useState<WeekBounds>(() => {
    const startDate = searchParams.get('startDate')
    return startDate ? getWeekBounds(new Date(startDate)) : getCurrentWeekBounds()
  })
  const [weekData, setWeekData] = useState<WeekWithEntries | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [offlineError, setOfflineError] = useState(false)
  const [shiftSettings, setShiftSettings] = useState<ShiftSettings>(loadShiftSettings)
  const [showSettings, setShowSettings] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  const fetchWeek = useCallback(async (b: WeekBounds) => {
    setLoading(true)
    setError(false)
    setOfflineError(false)
    const cacheKey = `week_${toISODateString(b.startDate)}`
    try {
      const res = await fetch(
        `/api/weeks/by-date?startDate=${toISODateString(b.startDate)}`
      )
      const json = await res.json()
      setWeekData(json.data)
      cacheSet(cacheKey, json.data)
    } catch (err) {
      console.error('Greška pri učitavanju rasporeda:', err)
      const cached = cacheGet<WeekWithEntries | null>(cacheKey)
      if (cached !== null) {
        setWeekData(cached)
      } else if (!navigator.onLine) {
        setOfflineError(true)
        setWeekData(null)
      } else {
        setError(true)
        setWeekData(null)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchWeek(bounds)
  }, [bounds, fetchWeek])

  function handlePrev() {
    setBounds((b) => addWeeks(b, -1))
  }

  function handleNext() {
    setBounds((b) => addWeeks(b, 1))
  }

  // Generiši datume za svaki dan nedelje
  const dayDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(bounds.startDate)
    d.setDate(d.getDate() + i)
    return d
  })

  return (
    <div>
      <div className="flex items-center justify-between pb-4">
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-text-primary">
          Raspored
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowProfile(true)}
            className="rounded-full p-1.5 text-text-muted transition-colors hover:bg-bg-tertiary hover:text-text-primary"
            title="Profil"
            aria-label="Profil"
          >
            <UserCircle size={20} />
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="rounded-full p-1.5 text-text-muted transition-colors hover:bg-bg-tertiary hover:text-text-primary"
            title="Podesi vreme smena"
            aria-label="Podešavanja smena"
          >
            <Settings2 size={20} />
          </button>
          <ThemeToggleButton />
        </div>
      </div>

      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
      {showSettings && (
        <ShiftSettingsModal
          current={shiftSettings}
          onClose={() => setShowSettings(false)}
          onSave={setShiftSettings}
        />
      )}

      <div className="flex flex-col gap-4">
        <WeekPicker bounds={bounds} onPrev={handlePrev} onNext={handleNext} />

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : offlineError ? (
          <OfflinePlaceholder message="Raspored nije dostupan bez interneta. Otvori ovu stranicu dok si na mreži." />
        ) : error ? (
          <ErrorCard
            message="Greška pri učitavanju rasporeda."
            onRetry={() => fetchWeek(bounds)}
          />
        ) : weekData === null ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-card border border-dashed border-border py-16 text-center">
            <p className="text-text-secondary">Raspored za ovu nedelju nije kreiran.</p>
            {isOffline ? (
              <p className="text-xs text-text-muted">Kreiranje nije dostupno offline.</p>
            ) : (
              <Link
                href={`/novi?startDate=${toISODateString(bounds.startDate)}`}
                className="inline-flex items-center gap-2 rounded-pill bg-accent-green px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-accent-green-dark active:scale-[0.97]"
              >
                <Plus size={16} />
                Kreiraj raspored
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3">
              {dayDates.map((date, day) => (
                <DayCard
                  key={day}
                  day={day}
                  date={date}
                  weekId={weekData.id}
                  entries={weekData.entries.filter((e) => e.day === day)}
                  shiftSettings={shiftSettings}
                />
              ))}
            </div>

            <div className="flex flex-col gap-2 pt-2 pb-4">
              <WhatsAppShare weekData={weekData} />
              <PrintScheduleButton weekData={weekData} bounds={bounds} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
