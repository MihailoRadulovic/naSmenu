import { EmployeeDailyView } from '@/components/statistics/EmployeeDailyView'

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ month?: string; year?: string }>
}

export default async function EmployeeStatsPage({ params, searchParams }: PageProps) {
  const { id } = await params
  const sp = await searchParams
  const now = new Date()
  const month = sp.month ? parseInt(sp.month) : now.getMonth() + 1
  const year = sp.year ? parseInt(sp.year) : now.getFullYear()

  return (
    <EmployeeDailyView
      employeeId={parseInt(id)}
      initialMonth={month}
      initialYear={year}
    />
  )
}
