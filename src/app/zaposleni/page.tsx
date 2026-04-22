import type { Metadata } from 'next'
import { EmployeeList } from '@/components/employees/EmployeeList'

export const metadata: Metadata = { title: 'Zaposleni' }

export default function ZaposleniPage() {
  return <EmployeeList />
}
