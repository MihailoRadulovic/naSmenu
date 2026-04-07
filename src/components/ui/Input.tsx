'use client'

import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-text-secondary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full rounded-card bg-bg-tertiary px-4 py-3
            text-sm text-text-primary
            border border-border
            placeholder:text-text-muted
            focus:border-accent-green focus:ring-2 focus:ring-accent-green/20 focus:outline-none
            transition-all duration-200
            ${error ? 'border-accent-red focus:border-accent-red focus:ring-accent-red/20' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <span className="text-xs text-accent-red">{error}</span>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
