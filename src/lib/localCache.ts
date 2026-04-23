const PREFIX = 'nasmenu_'
const TTL = 7 * 24 * 60 * 60 * 1000 // 7 dana

interface Entry<T> {
  data: T
  ts: number
}

export function cacheSet<T>(key: string, data: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify({ data, ts: Date.now() } satisfies Entry<T>))
  } catch {
    // localStorage pun ili nedostupan — ignoriši
  }
}

export function cacheGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (!raw) return null
    const entry = JSON.parse(raw) as Entry<T>
    if (Date.now() - entry.ts > TTL) {
      localStorage.removeItem(PREFIX + key)
      return null
    }
    return entry.data
  } catch {
    return null
  }
}
