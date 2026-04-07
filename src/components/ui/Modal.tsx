'use client'

import { useEffect, useCallback } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose]
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleEscape])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-black/60 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="relative mx-auto w-full max-w-[430px] max-h-[85dvh] rounded-t-[20px] bg-bg-secondary p-6 pb-8 shadow-xl animate-in slide-in-from-bottom sm:rounded-[20px] flex flex-col"
      >
        <div className="mb-6 flex items-center justify-between shrink-0">
          <h2 id="modal-title" className="font-[family-name:var(--font-heading)] text-lg font-bold text-text-primary">
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Zatvori"
            className="rounded-full p-1.5 text-text-muted transition-colors hover:bg-bg-tertiary hover:text-text-primary"
          >
            <X size={20} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 -mx-6 px-6 pb-[env(safe-area-inset-bottom)]">
          {children}
        </div>
      </div>
    </div>
  )
}
