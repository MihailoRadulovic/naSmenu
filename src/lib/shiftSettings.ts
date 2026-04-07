export interface ShiftSettings {
  firstStart: string  // "HH:MM"
  firstEnd: string
  secondStart: string
  secondEnd: string
}

export const DEFAULT_SHIFT_SETTINGS: ShiftSettings = {
  firstStart: '07:15',
  firstEnd: '15:23',
  secondStart: '15:23',
  secondEnd: '23:00',
}

const STORAGE_KEY = 'smena-shift-settings'

export function loadShiftSettings(): ShiftSettings {
  if (typeof window === 'undefined') return DEFAULT_SHIFT_SETTINGS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_SHIFT_SETTINGS
    return { ...DEFAULT_SHIFT_SETTINGS, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_SHIFT_SETTINGS
  }
}

export function saveShiftSettings(s: ShiftSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
}

export async function loadShiftSettingsFromApi(): Promise<ShiftSettings> {
  try {
    const res = await fetch('/api/settings')
    if (!res.ok) return loadShiftSettings()
    const json = await res.json()
    const s = json.data as ShiftSettings
    // Keep localStorage in sync for offline use
    saveShiftSettings(s)
    return s
  } catch {
    return loadShiftSettings()
  }
}

export async function saveShiftSettingsToApi(s: ShiftSettings): Promise<void> {
  saveShiftSettings(s)
  await fetch('/api/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(s),
  })
}

export function parseHoursFromSettings(settings: ShiftSettings): { firstHours: number; secondHours: number } {
  function toMinutes(t: string) {
    const [h, m] = t.split(':').map(Number)
    return h * 60 + m
  }
  const firstHours = (toMinutes(settings.firstEnd) - toMinutes(settings.firstStart)) / 60
  const secondHours = (toMinutes(settings.secondEnd) - toMinutes(settings.secondStart)) / 60
  return {
    firstHours: Math.max(0, firstHours),
    secondHours: Math.max(0, secondHours),
  }
}
