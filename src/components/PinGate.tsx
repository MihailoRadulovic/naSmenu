'use client'

import { useState, useCallback, useEffect } from 'react'
import { PinScreen } from './PinScreen'

export function PinGate({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    const isAuthed = sessionStorage.getItem('smena_authed') === 'true'
    setAuthed(isAuthed)
    setChecked(true)
  }, [])

  const handleSuccess = useCallback(() => {
    setAuthed(true)
  }, [])

  if (!checked) return null // avoid flash

  if (!authed) {
    return <PinScreen onSuccess={handleSuccess} />
  }

  return <>{children}</>
}
