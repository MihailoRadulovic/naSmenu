import type { Metadata } from 'next'
import { Suspense } from 'react'

export const metadata: Metadata = { title: 'Novi raspored' }
import { ScheduleEditor } from '@/components/schedule/ScheduleEditor'
import { Spinner } from '@/components/ui/Spinner'

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center py-32">
      <Spinner size="lg" />
    </div>
  )
}

export default function NoviRasporedPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ScheduleEditor />
    </Suspense>
  )
}
