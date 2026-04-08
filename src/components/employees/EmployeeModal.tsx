'use client'

import { useState, useEffect } from 'react'
import type { Employee, EmployeeFormData } from '@/types'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useFeatures } from '@/lib/features'

interface EmployeeModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: EmployeeFormData) => Promise<void>
  employee: Employee | null
}

export function EmployeeModal({ isOpen, onClose, onSave, employee }: EmployeeModalProps) {
  const features = useFeatures()
  const [name, setName] = useState('')
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<{ name?: string }>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setName(employee?.name ?? '')
      setNotes((employee as (Employee & { notes?: string | null }))?.notes ?? '')
      setErrors({})
      setSaving(false)
    }
  }, [isOpen, employee])

  function validate(): boolean {
    const newErrors: typeof errors = {}
    if (!name.trim()) newErrors.name = 'Ovo polje je obavezno'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setSaving(true)
    try {
      const data: EmployeeFormData = { name: name.trim() }
      if (features.employeeNotes) data.notes = notes.trim() || undefined
      await onSave(data)
      onClose()
    } catch {
      setErrors({ name: 'Greška pri čuvanju. Pokušajte ponovo.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={employee ? 'Izmeni zaposlenog' : 'Dodaj zaposlenog'}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Ime"
          placeholder="Unesite ime"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
        />
        {features.employeeNotes && (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-secondary">
              Beleška <span className="text-text-muted font-normal">(opciono)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="npr. radi vikendom, vozač..."
              rows={3}
              className="w-full resize-none rounded-card border border-border bg-bg-tertiary px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none transition-colors focus:border-accent-green/60"
            />
          </div>
        )}
        <div className="mt-2 flex gap-3">
          <Button
            type="button"
            variant="ghost"
            fullWidth
            onClick={onClose}
          >
            Otkaži
          </Button>
          <Button
            type="submit"
            fullWidth
            disabled={saving}
          >
            {saving ? 'Čuvanje...' : 'Sačuvaj'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
