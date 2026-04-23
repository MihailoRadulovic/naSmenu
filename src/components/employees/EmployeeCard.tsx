'use client'

import { useState, useRef, useEffect } from 'react'
import { MoreVertical, Pencil, UserX, UserCheck, Trash2 } from 'lucide-react'
import type { Employee } from '@/types'
import { Avatar } from '@/components/ui/Avatar'
import { EmployeeStatusBadge } from './EmployeeStatusBadge'

interface EmployeeCardProps {
  employee: Employee
  onEdit: (employee: Employee) => void
  onToggleActive: (id: number) => void
  onDelete: (id: number) => void
  disabled?: boolean
}

export function EmployeeCard({ employee, onEdit, onToggleActive, onDelete, disabled }: EmployeeCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  return (
    <div className="relative flex items-center gap-3 rounded-card border border-border bg-bg-secondary p-4">
      <Avatar name={employee.name} />

      <div className="flex-1 min-w-0">
        <p className="font-medium text-text-primary truncate">
          {employee.name}
        </p>
      </div>

      <EmployeeStatusBadge isActive={employee.isActive} />

      <div className="relative" ref={menuRef}>
        <button
          onClick={() => !disabled && setMenuOpen(!menuOpen)}
          disabled={disabled}
          aria-label="Više opcija"
          className="rounded-full p-1.5 text-text-muted transition-colors hover:bg-bg-tertiary hover:text-text-primary disabled:opacity-30 disabled:pointer-events-none"
        >
          <MoreVertical size={18} />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full z-10 mt-1 w-44 overflow-hidden rounded-card border border-border bg-bg-tertiary shadow-lg">
            <button
              onClick={() => {
                onEdit(employee)
                setMenuOpen(false)
              }}
              className="flex w-full items-center gap-2 px-4 py-3 text-sm text-text-primary transition-colors hover:bg-border"
            >
              <Pencil size={16} />
              Izmeni
            </button>
            <button
              onClick={() => {
                onToggleActive(employee.id)
                setMenuOpen(false)
              }}
              className={`flex w-full items-center gap-2 px-4 py-3 text-sm transition-colors hover:bg-border ${
                employee.isActive ? 'text-accent-red' : 'text-accent-green'
              }`}
            >
              {employee.isActive ? (
                <>
                  <UserX size={16} />
                  Deaktiviraj
                </>
              ) : (
                <>
                  <UserCheck size={16} />
                  Aktiviraj
                </>
              )}
            </button>
            <button
              onClick={() => {
                onDelete(employee.id)
                setMenuOpen(false)
              }}
              className="flex w-full items-center gap-2 px-4 py-3 text-sm text-accent-red transition-colors hover:bg-border border-t border-border"
            >
              <Trash2 size={16} />
              Obriši
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
