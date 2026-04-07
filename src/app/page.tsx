import { Suspense } from 'react'
import { WeekView } from '@/components/schedule/WeekView'

export default function RasporedPage() {
  return (
    <Suspense>
      <WeekView />
    </Suspense>
  )
}
