import type { Metadata } from 'next'
import { Suspense } from 'react'
import { WeekView } from '@/components/schedule/WeekView'

export const metadata: Metadata = { title: 'Raspored' }

export default function RasporedPage() {
  return (
    <Suspense>
      <WeekView />
    </Suspense>
  )
}
