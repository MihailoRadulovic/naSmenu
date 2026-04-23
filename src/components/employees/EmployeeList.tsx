'use client'

import { useState, useEffect, useCallback } from 'react'
import { Users } from 'lucide-react'
import type { Employee, EmployeeFormData } from '@/types'
import { PageHeader } from '@/components/ui/PageHeader'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/contexts/ToastContext'
import { Spinner } from '@/components/ui/Spinner'
import { OfflinePlaceholder } from '@/components/ui/OfflinePlaceholder'
import { useOffline } from '@/hooks/useOffline'
import { cacheSet, cacheGet } from '@/lib/localCache'
import { EmployeeCard } from './EmployeeCard'
import { EmployeeModal } from './EmployeeModal'

export function EmployeeList() {
  const isOffline = useOffline()
  const { showToast } = useToast()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [offlineError, setOfflineError] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)

  const fetchEmployees = useCallback(async () => {
    try {
      const res = await fetch('/api/employees?all=true')
      const json = await res.json()
      setEmployees(json.data)
      cacheSet('employees_all', json.data)
    } catch (err) {
      console.error('Greška pri učitavanju zaposlenih:', err)
      const cached = cacheGet<Employee[]>('employees_all')
      if (cached) {
        setEmployees(cached)
      } else {
        setOfflineError(true)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  function handleAddNew() {
    setEditingEmployee(null)
    setModalOpen(true)
  }

  function handleEdit(employee: Employee) {
    setEditingEmployee(employee)
    setModalOpen(true)
  }

  async function handleToggleActive(id: number) {
    const emp = employees.find((e) => e.id === id)
    await fetch(`/api/employees/${id}`, { method: 'PATCH' })
    fetchEmployees()
    if (emp) {
      showToast(emp.isActive ? `${emp.name} deaktiviran/a` : `${emp.name} aktiviran/a`)
    }
  }

  function handleDelete(id: number) {
    setConfirmDeleteId(id)
  }

  async function confirmDelete() {
    if (confirmDeleteId === null) return
    const employee = employees.find((e) => e.id === confirmDeleteId)
    setConfirmDeleteId(null)
    if (!employee) return
    await fetch(`/api/employees/${confirmDeleteId}`, { method: 'DELETE' })
    fetchEmployees()
    showToast(`${employee.name} obrisan/a`)
  }

  async function handleSave(data: EmployeeFormData) {
    if (editingEmployee) {
      await fetch(`/api/employees/${editingEmployee.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      showToast('Zaposleni ažuriran')
    } else {
      await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      showToast('Zaposleni dodat')
    }
    fetchEmployees()
  }

  return (
    <div>
      <PageHeader
        title="Zaposleni"
        action={isOffline ? undefined : { label: '+ Dodaj', onClick: handleAddNew }}
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : offlineError ? (
        <OfflinePlaceholder message="Lista zaposlenih nije dostupna bez interneta." />
      ) : employees.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-text-secondary">
          <Users size={48} className="text-text-muted" />
          <p className="text-center">
            Nema zaposlenih.
            <br />
            Dodajte prvog zaposlenog.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {employees.map((employee) => (
            <EmployeeCard
              key={employee.id}
              employee={employee}
              onEdit={handleEdit}
              onToggleActive={handleToggleActive}
              onDelete={handleDelete}
              disabled={isOffline}
            />
          ))}
        </div>
      )}

      <EmployeeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        employee={editingEmployee}
      />

      {/* Delete confirmation modal */}
      <Modal
        isOpen={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
        title="Obriši zaposlenog"
      >
        {(() => {
          const emp = employees.find((e) => e.id === confirmDeleteId)
          return (
            <div className="flex flex-col gap-5">
              <p className="text-text-secondary text-sm">
                Da li ste sigurni da želite da obrišete{' '}
                <span className="font-semibold text-text-primary">
                  {emp ? emp.name : ''}
                </span>
                ? Ova akcija se ne može poništiti.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  fullWidth
                  onClick={() => setConfirmDeleteId(null)}
                >
                  Otkaži
                </Button>
                <Button
                  variant="danger"
                  fullWidth
                  onClick={confirmDelete}
                >
                  Obriši
                </Button>
              </div>
            </div>
          )
        })()}
      </Modal>
    </div>
  )
}
