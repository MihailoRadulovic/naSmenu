'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle, XCircle, Info } from 'lucide-react'

interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
}

interface ToastContextValue {
  showToast: (message: string, type?: Toast['type']) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

let nextId = 0

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = ++nextId
    setToasts((prev) => [...prev, { id, message, type }])

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast container */}
      <div className="fixed bottom-24 left-1/2 z-[70] -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none w-full max-w-[400px] px-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              pointer-events-auto animate-in slide-in-from-bottom fade-in duration-200
              flex items-center gap-2
              rounded-pill px-5 py-3 text-sm font-medium shadow-lg
              ${toast.type === 'success'
                ? 'bg-accent-green text-white'
                : toast.type === 'error'
                ? 'bg-accent-red text-white'
                : 'bg-accent-blue text-white'
              }
            `}
          >
            {toast.type === 'success' && <CheckCircle size={16} className="shrink-0" />}
            {toast.type === 'error' && <XCircle size={16} className="shrink-0" />}
            {toast.type === 'info' && <Info size={16} className="shrink-0" />}
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}
