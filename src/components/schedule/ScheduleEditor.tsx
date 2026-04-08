'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Save, ArrowLeft, Info, Copy, Clock } from 'lucide-react'
import type { Employee, WeekSchedule, ShiftType, DayAssignment, ScheduleEntryInput } from '@/types'
import { DAY_NAMES, SHIFT_TYPES } from '@/types'
import { minutesToTime, timeToMinutes } from '@/lib/shiftHours'
import type { WeekBounds } from '@/types'
import {
  getCurrentWeekBounds,
  addWeeks,
  toISODateString,
  formatDateShort,
  getWeekBounds,
} from '@/lib/dates'
import { Spinner } from '@/components/ui/Spinner'
import { ThemeToggleButton } from '@/components/layout/ThemeToggleButton'
import { useToast } from '@/contexts/ToastContext'
import { WeekPicker } from './WeekPicker'
import { DayTabs } from './DayTabs'
import { EmployeeChip } from './EmployeeChip'
import { TimeSelect } from './TimeSelect'
import { useFeatures } from '@/lib/features'
import { getHoliday } from '@/lib/holidays'

const BASE_SHIFT_SECTIONS: { shiftType: ShiftType; emoji: string; label: string }[] = [
  { shiftType: SHIFT_TYPES.FIRST, emoji: '🌅', label: 'Prva smena' },
  { shiftType: SHIFT_TYPES.SECOND, emoji: '🌆', label: 'Druga smena' },
  { shiftType: SHIFT_TYPES.MIDDLE, emoji: '🕐', label: 'Međusmena' },
  { shiftType: SHIFT_TYPES.OFF, emoji: '💤', label: 'Slobodan dan' },
]

const ABSENCE_SHIFT_SECTIONS: { shiftType: ShiftType; emoji: string; label: string }[] = [
  { shiftType: SHIFT_TYPES.SICK_LEAVE, emoji: '🏥', label: 'Bolovanje' },
  { shiftType: SHIFT_TYPES.VACATION, emoji: '🏖️', label: 'Godišnji odmor' },
  { shiftType: SHIFT_TYPES.LATE, emoji: '⏰', label: 'Kasnio/la' },
]

function getShifts(schedule: WeekSchedule, day: number, empId: number): DayAssignment[] {
  return schedule[day]?.[empId] ?? []
}

function getShiftTypes(schedule: WeekSchedule, day: number, empId: number): ShiftType[] {
  return getShifts(schedule, day, empId).map((a) => a.shiftType)
}

export function ScheduleEditor() {
  const features = useFeatures()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { showToast } = useToast()

  const initialDay = Number(searchParams.get('day') ?? 0)
  const initialWeekId = searchParams.get('weekId')
  const initialStartDate = searchParams.get('startDate')

  const [bounds, setBounds] = useState<WeekBounds>(() =>
    initialStartDate ? getWeekBounds(new Date(initialStartDate)) : getCurrentWeekBounds()
  )
  const [selectedDay, setSelectedDay] = useState(initialDay)
  const [schedule, setSchedule] = useState<WeekSchedule>({})
  const [employees, setEmployees] = useState<Employee[]>([])
  const [existingWeekId, setExistingWeekId] = useState<number | null>(
    initialWeekId ? parseInt(initialWeekId) : null
  )
  const [saving, setSaving] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [copyingWeek, setCopyingWeek] = useState(false)
  // key = `${day}-${employeeId}`, value = { start: "HH:MM", end: "HH:MM" }
  const [middleTimes, setMiddleTimes] = useState<Record<string, { start: string; end: string }>>({})

  const loadData = useCallback(async (b: WeekBounds, weekId: number | null) => {
    setLoadingData(true)
    try {
      const empRes = await fetch('/api/employees')
      const empJson = await empRes.json()
      setEmployees(empJson.data ?? [])

      const url = weekId
        ? `/api/weeks/${weekId}`
        : `/api/weeks/by-date?startDate=${toISODateString(b.startDate)}`

      const weekRes = await fetch(url)
      const weekJson = await weekRes.json()

      if (weekJson.data) {
        setExistingWeekId(weekJson.data.id)
        const newSchedule: WeekSchedule = {}
        const newMiddleTimes: Record<string, { start: string; end: string }> = {}
        for (const entry of weekJson.data.entries) {
          if (!newSchedule[entry.day]) newSchedule[entry.day] = {}
          if (!newSchedule[entry.day][entry.employeeId]) newSchedule[entry.day][entry.employeeId] = []
          newSchedule[entry.day][entry.employeeId].push({
            shiftType: entry.shiftType as ShiftType,
            halfShift: entry.halfShift,
            middleStart: entry.middleStart ?? null,
            middleEnd: entry.middleEnd ?? null,
          })
          if (entry.shiftType === 'middle' && entry.middleStart != null && entry.middleEnd != null) {
            newMiddleTimes[`${entry.day}-${entry.employeeId}`] = {
              start: minutesToTime(entry.middleStart),
              end: minutesToTime(entry.middleEnd),
            }
          }
        }
        setSchedule(newSchedule)
        setMiddleTimes(newMiddleTimes)
      } else {
        setExistingWeekId(null)
        setSchedule({})
        setMiddleTimes({})
      }
    } catch (err) {
      console.error('Greška pri učitavanju podataka:', err)
      showToast('Greška pri učitavanju podataka', 'error')
    } finally {
      setLoadingData(false)
    }
  }, [])

  useEffect(() => {
    loadData(bounds, existingWeekId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleCopyPreviousWeek() {
    if (!features.copyWeek) return
    setCopyingWeek(true)
    try {
      const res = await fetch('/api/weeks?last=true')
      if (!res.ok) {
        showToast('Nema podataka za prošlu nedelju', 'error')
        return
      }
      const json = await res.json()
      if (!json.data) {
        showToast('Nema podataka za prošlu nedelju', 'error')
        return
      }

      const newSchedule: WeekSchedule = {}
      const newMiddleTimes: Record<string, { start: string; end: string }> = {}
      for (const entry of json.data.entries) {
        if (!newSchedule[entry.day]) newSchedule[entry.day] = {}
        if (!newSchedule[entry.day][entry.employeeId]) newSchedule[entry.day][entry.employeeId] = []
        newSchedule[entry.day][entry.employeeId].push({
          shiftType: entry.shiftType as ShiftType,
          halfShift: entry.halfShift,
          middleStart: entry.middleStart ?? null,
          middleEnd: entry.middleEnd ?? null,
        })
        if (entry.shiftType === 'middle' && entry.middleStart != null && entry.middleEnd != null) {
          newMiddleTimes[`${entry.day}-${entry.employeeId}`] = {
            start: minutesToTime(entry.middleStart),
            end: minutesToTime(entry.middleEnd),
          }
        }
      }
      setSchedule(newSchedule)
      setMiddleTimes(newMiddleTimes)
      showToast('Prošla nedelja kopirana — možete izmeniti pre čuvanja')
    } catch {
      showToast('Greška pri kopiranju', 'error')
    } finally {
      setCopyingWeek(false)
    }
  }

  function handleChipSelect(employeeId: number, targetShift: ShiftType) {
    // Postavi default vreme kada se DODAJE međusmena
    if (targetShift === 'middle') {
      const isCurrentlyAssigned = getShiftTypes(schedule, selectedDay, employeeId).includes('middle')
      if (!isCurrentlyAssigned) {
        const key = `${selectedDay}-${employeeId}`
        setMiddleTimes((prev) => ({
          ...prev,
          [key]: prev[key]?.start ? prev[key] : { start: '12:00', end: '16:00' },
        }))
      }
    }

    setSchedule((prev) => {
      const daySchedule = { ...(prev[selectedDay] ?? {}) }
      const currentShifts = [...(daySchedule[employeeId] ?? [])]
      const hasThisShift = currentShifts.some((a) => a.shiftType === targetShift)

      if (targetShift === 'off') {
        if (hasThisShift) {
          const { [employeeId]: _, ...rest } = daySchedule
          return { ...prev, [selectedDay]: rest }
        } else {
          daySchedule[employeeId] = [{ shiftType: 'off', halfShift: false }]
          return { ...prev, [selectedDay]: daySchedule }
        }
      }

      if (hasThisShift) {
        const remaining = currentShifts.filter((a) => a.shiftType !== targetShift)
        if (remaining.length === 0) {
          const { [employeeId]: _, ...rest } = daySchedule
          return { ...prev, [selectedDay]: rest }
        }
        daySchedule[employeeId] = remaining
        return { ...prev, [selectedDay]: daySchedule }
      } else {
        const withoutOff = currentShifts.filter((a) => a.shiftType !== 'off')
        withoutOff.push({ shiftType: targetShift, halfShift: false })
        daySchedule[employeeId] = withoutOff
        return { ...prev, [selectedDay]: daySchedule }
      }
    })
  }

  function handleToggleHalf(employeeId: number, shiftType: ShiftType) {
    setSchedule((prev) => {
      const daySchedule = { ...(prev[selectedDay] ?? {}) }
      const currentShifts = [...(daySchedule[employeeId] ?? [])]
      const idx = currentShifts.findIndex((a) => a.shiftType === shiftType)
      if (idx === -1) return prev
      currentShifts[idx] = { ...currentShifts[idx], halfShift: !currentShifts[idx].halfShift }
      daySchedule[employeeId] = currentShifts
      return { ...prev, [selectedDay]: daySchedule }
    })
  }

  async function handleSave() {
    // Validacija: svi middle zaposleni moraju imati uneta vremena
    for (let day = 0; day < 7; day++) {
      const daySchedule = schedule[day] ?? {}
      for (const [empIdStr, assignments] of Object.entries(daySchedule)) {
        const hasMiddle = (assignments as DayAssignment[]).some((a) => a.shiftType === 'middle')
        if (hasMiddle) {
          const key = `${day}-${empIdStr}`
          const times = middleTimes[key]
          if (!times || !times.start || !times.end || timeToMinutes(times.start) >= timeToMinutes(times.end)) {
            showToast('Međusmena mora imati validno vreme (od < do) za sve zaposlene.', 'error')
            return
          }
        }
      }
    }

    setSaving(true)
    try {
      const entries: ScheduleEntryInput[] = []
      const employeeIds = employees.map((e) => e.id)

      for (let day = 0; day < 7; day++) {
        const daySchedule = schedule[day] ?? {}
        const assignedIds = new Set<number>()

        for (const [empIdStr, assignments] of Object.entries(daySchedule)) {
          const empId = parseInt(empIdStr)
          if (!employeeIds.includes(empId)) continue
          for (const assignment of assignments as DayAssignment[]) {
            const isMiddle = assignment.shiftType === 'middle'
            const times = isMiddle ? middleTimes[`${day}-${empId}`] : null
            entries.push({
              day,
              employeeId: empId,
              shiftType: assignment.shiftType,
              halfShift: assignment.halfShift,
              middleStart: isMiddle && times ? timeToMinutes(times.start) : null,
              middleEnd: isMiddle && times ? timeToMinutes(times.end) : null,
            })
          }
          assignedIds.add(empId)
        }

        for (const empId of employeeIds) {
          if (!assignedIds.has(empId)) {
            entries.push({ day, employeeId: empId, shiftType: 'off', halfShift: false })
          }
        }
      }

      if (existingWeekId) {
        await fetch(`/api/weeks/${existingWeekId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ entries }),
        })
      } else {
        const res = await fetch('/api/weeks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ startDate: toISODateString(bounds.startDate), entries }),
        })
        const json = await res.json()
        if (json.data?.id) setExistingWeekId(json.data.id)
      }

      showToast('Raspored sačuvan')
      router.push(`/?startDate=${toISODateString(bounds.startDate)}`)
    } catch (err) {
      console.error('Greška pri čuvanju rasporeda:', err)
      showToast('Greška pri čuvanju rasporeda', 'error')
    } finally {
      setSaving(false)
    }
  }

  function handlePrev() {
    const newBounds = addWeeks(bounds, -1)
    setBounds(newBounds)
    setSelectedDay(0)
    setExistingWeekId(null)
    loadData(newBounds, null)
  }

  function handleNext() {
    const newBounds = addWeeks(bounds, 1)
    setBounds(newBounds)
    setSelectedDay(0)
    setExistingWeekId(null)
    loadData(newBounds, null)
  }

  const selectedDate = new Date(bounds.startDate)
  selectedDate.setDate(selectedDate.getDate() + selectedDay)

  const unassignedEmployees = employees.filter(
    (emp) => !schedule[selectedDay]?.[emp.id] || schedule[selectedDay][emp.id].length === 0
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 pb-2">
        <button
          onClick={() => router.push(`/?startDate=${toISODateString(bounds.startDate)}`)}
          className="rounded-full p-1.5 text-text-muted transition-colors hover:bg-bg-tertiary hover:text-text-primary"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-text-primary">
          {existingWeekId ? 'Izmeni raspored' : 'Novi raspored'}
        </h1>
        <div className="ml-auto">
          <ThemeToggleButton />
        </div>
      </div>

      <WeekPicker bounds={bounds} onPrev={handlePrev} onNext={handleNext} />

      {/* Copy previous week button */}
      {features.copyWeek && (
        <button
          onClick={handleCopyPreviousWeek}
          disabled={copyingWeek || loadingData}
          className="no-print flex items-center justify-center gap-2 rounded-card border border-border bg-bg-secondary px-4 py-2.5 text-sm text-text-secondary transition-colors hover:border-accent-green/40 hover:text-accent-green disabled:opacity-50 disabled:pointer-events-none"
        >
          {copyingWeek ? <Spinner size="sm" /> : <Copy size={15} />}
          {copyingWeek ? 'Kopiranje...' : 'Kopiraj prošlu nedelju'}
        </button>
      )}


      <DayTabs selectedDay={selectedDay} schedule={schedule} onSelectDay={setSelectedDay} weekStartDate={bounds.startDate} />

      <div className="flex items-center gap-2">
        <span className="font-[family-name:var(--font-heading)] font-bold text-text-primary">
          {DAY_NAMES[selectedDay]}
        </span>
        {features.holidays && (() => {
          const holiday = getHoliday(toISODateString(selectedDate))
          return holiday ? <span className="text-text-secondary text-sm">({holiday.name})</span> : null
        })()}
        <span className="text-text-muted text-sm">- {formatDateShort(selectedDate)}</span>
      </div>

      {!loadingData && unassignedEmployees.length > 0 && (
        <div className="flex items-center gap-2 rounded-card bg-accent-blue/10 border border-accent-blue/25 px-3 py-2.5 text-sm text-accent-blue-dark">
          <Info size={16} className="shrink-0" />
          <span>Neraspoređeni zaposleni automatski dobijaju slobodan dan.</span>
        </div>
      )}

      {loadingData ? (
        <div className="flex items-center justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {[...BASE_SHIFT_SECTIONS, ...(features.absenceTypes ? ABSENCE_SHIFT_SECTIONS : [])].map(({ shiftType, emoji, label }) => {
            const hasSelected = employees.some((emp) =>
              getShiftTypes(schedule, selectedDay, emp.id).includes(shiftType)
            )
            return (
              <div key={shiftType} className="rounded-card border border-border bg-bg-secondary p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {shiftType === 'middle'
                      ? <Clock size={16} className="text-[#F59E0B] shrink-0" />
                      : <span>{emoji}</span>
                    }
                    <span className="font-semibold text-text-primary">{label}</span>
                  </div>
                  {hasSelected && shiftType !== 'off' && shiftType !== 'middle' && (
                    <span className="text-xs text-text-muted">Tap ½ za pol. smenu</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {employees.map((emp) => {
                    const empShifts = getShiftTypes(schedule, selectedDay, emp.id)
                    const assignment = getShifts(schedule, selectedDay, emp.id)
                      .find((a) => a.shiftType === shiftType)
                    const isMiddleAssigned = shiftType === 'middle' && empShifts.includes('middle')
                    const middleKey = `${selectedDay}-${emp.id}`
                    const times = middleTimes[middleKey] ?? { start: '', end: '' }
                    const middleHours =
                      isMiddleAssigned && times.start && times.end
                        ? (() => {
                            const s = timeToMinutes(times.start)
                            const e = timeToMinutes(times.end)
                            return e > s ? ((e - s) / 60).toFixed(1) : null
                          })()
                        : null
                    if (isMiddleAssigned) {
                      return (
                        <div
                          key={emp.id}
                          className="inline-flex items-center rounded-pill border border-[#F59E0B]/40 bg-[#F59E0B]/10"
                        >
                          {/* Ime — klik za uklanjanje */}
                          <button
                            onClick={() => handleChipSelect(emp.id, shiftType)}
                            className="h-full px-3 py-1.5 text-sm font-medium text-[#B45309] border-r border-[#F59E0B]/25 hover:bg-[#F59E0B]/15 transition-colors active:scale-95 rounded-l-full"
                          >
                            {emp.name}
                          </button>

                          {/* Vreme */}
                          <div className="flex items-center gap-1.5 px-2.5 py-1">
                            <TimeSelect
                              value={times.start}
                              onChange={(val) =>
                                setMiddleTimes((prev) => {
                                  const current = prev[middleKey] ?? { start: '', end: '' }
                                  const newStartH = parseInt(val.split(':')[0])
                                  const currentEndH = current.end ? parseInt(current.end.split(':')[0]) : null
                                  // Auto-pomeri end ako bi postao <= start
                                  let newEnd = current.end
                                  if (currentEndH !== null && currentEndH <= newStartH) {
                                    const adjustedH = Math.min(newStartH + 4, 23)
                                    newEnd = `${String(adjustedH).padStart(2, '0')}:00`
                                  }
                                  return { ...prev, [middleKey]: { start: val, end: newEnd } }
                                })
                              }
                            />
                            <span className="text-xs text-text-muted select-none">–</span>
                            <TimeSelect
                              value={times.end}
                              minHour={times.start ? parseInt(times.start.split(':')[0]) + 1 : undefined}
                              onChange={(val) =>
                                setMiddleTimes((prev) => ({
                                  ...prev,
                                  [middleKey]: { ...prev[middleKey] ?? { start: '', end: '' }, end: val },
                                }))
                              }
                            />
                            {middleHours && (
                              <span className="flex items-center gap-0.5 text-xs font-semibold text-[#F59E0B]">
                                <Clock size={11} />
                                {middleHours}h
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    }

                    return (
                      <EmployeeChip
                        key={emp.id}
                        employee={emp}
                        currentShifts={empShifts}
                        halfShift={assignment?.halfShift ?? false}
                        targetShift={shiftType}
                        onSelect={() => handleChipSelect(emp.id, shiftType)}
                        onToggleHalf={() => handleToggleHalf(emp.id, shiftType)}
                      />
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="pb-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-pill bg-accent-green px-6 py-3.5 font-semibold text-white transition-all duration-200 hover:bg-accent-green-dark active:scale-[0.97] disabled:opacity-60 disabled:pointer-events-none shadow-sm"
        >
          <Save size={18} />
          {saving ? 'Čuvanje...' : 'Sačuvaj raspored'}
        </button>
      </div>
    </div>
  )
}
