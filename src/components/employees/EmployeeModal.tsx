'use client'

import { useState, useEffect, useId } from 'react'
import { X } from 'lucide-react'
import type { Employee, EmployeeFormData } from '@/types'
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
  const nameId = useId()
  const rateId = useId()
  const notesId = useId()
  const nameErrorId = useId()
  const rateErrorId = useId()
  const [visible, setVisible] = useState(false)
  const [name, setName] = useState('')
  const [notes, setNotes] = useState('')
  const [hourlyRate, setHourlyRate] = useState('')
  const [errors, setErrors] = useState<{ name?: string; hourlyRate?: string }>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setName(employee?.name ?? '')
      setNotes((employee as (Employee & { notes?: string | null }))?.notes ?? '')
      setHourlyRate(employee?.hourlyRate != null ? String(employee.hourlyRate) : '')
      setErrors({})
      setSaving(false)
      const id = requestAnimationFrame(() => setVisible(true))
      return () => cancelAnimationFrame(id)
    }
  }, [isOpen, employee])

  function handleClose() {
    setVisible(false)
    setTimeout(onClose, 300)
  }

  function validate(): boolean {
    const newErrors: typeof errors = {}
    if (!name.trim()) newErrors.name = 'Ovo polje je obavezno'
    if (hourlyRate !== '' && (isNaN(Number(hourlyRate)) || Number(hourlyRate) < 0)) {
      newErrors.hourlyRate = 'Unesite ispravan broj'
    }
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
      if (hourlyRate !== '') data.hourlyRate = Number(hourlyRate)
      await onSave(data)
      handleClose()
    } catch {
      setErrors({ name: 'Greška pri čuvanju. Pokušajte ponovo.' })
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex items-start justify-center transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}
    >
      <div
        className={`flex w-full max-w-[430px] flex-col rounded-b-2xl border-b border-x border-border bg-bg-secondary transition-transform duration-300 ease-out ${visible ? 'translate-y-0' : '-translate-y-full'}`}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between px-6 py-5">
          <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold text-text-primary">
            {employee ? 'Izmeni zaposlenog' : 'Dodaj zaposlenog'}
          </h2>
          <button
            onClick={handleClose}
            aria-label="Zatvori"
            className="rounded-full p-2 text-text-muted transition-colors hover:bg-bg-tertiary hover:text-text-primary"
          >
            <X size={22} />
          </button>
        </div>

        {/* Forma */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 pb-6">
          {/* Ime */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor={nameId} className="text-sm font-medium text-text-secondary">
              Ime <span aria-hidden="true" className="text-accent-red">*</span>
            </label>
            <input
              id={nameId}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Unesite ime"
              aria-required="true"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? nameErrorId : undefined}
              className="w-full rounded-card border border-border bg-bg-tertiary px-4 py-3 text-base text-text-primary placeholder:text-text-muted outline-none transition-colors focus:border-accent-green/50"
            />
            {errors.name && (
              <p id={nameErrorId} role="alert" className="text-xs text-accent-red">{errors.name}</p>
            )}
          </div>

          {/* Satnica */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor={rateId} className="text-sm font-medium text-text-secondary">
              Satnica <span className="font-normal text-text-muted">(opciono)</span>
            </label>
            <input
              id={rateId}
              type="number"
              min="0"
              step="any"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              placeholder="npr. 350"
              aria-invalid={!!errors.hourlyRate}
              aria-describedby={errors.hourlyRate ? rateErrorId : undefined}
              className="w-full rounded-card border border-border bg-bg-tertiary px-4 py-3 text-base text-text-primary placeholder:text-text-muted outline-none transition-colors focus:border-accent-green/50"
            />
            {errors.hourlyRate && (
              <p id={rateErrorId} role="alert" className="text-xs text-accent-red">{errors.hourlyRate}</p>
            )}
          </div>

          {/* Beleška */}
          {features.employeeNotes && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor={notesId} className="text-sm font-medium text-text-secondary">
                Beleška <span className="font-normal text-text-muted">(opciono)</span>
              </label>
              <textarea
                id={notesId}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="npr. radi vikendom, vozač..."
                rows={3}
                className="w-full resize-none rounded-card border border-border bg-bg-tertiary px-4 py-3 text-base text-text-primary placeholder:text-text-muted outline-none transition-colors focus:border-accent-green/60"
              />
            </div>
          )}

          {/* Dugmad */}
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="ghost" fullWidth onClick={handleClose}>
              Otkaži
            </Button>
            <Button type="submit" fullWidth disabled={saving}>
              {saving ? 'Čuvanje...' : 'Sačuvaj'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
