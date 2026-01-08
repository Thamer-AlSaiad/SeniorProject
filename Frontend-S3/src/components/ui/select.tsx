import { ReactNode } from 'react'

interface SelectProps {
  label?: string
  error?: string
  value?: string
  onChange?: (e: any) => void
  className?: string
  children: ReactNode
}

export const Select = ({ label, error, className, children, ...props }: SelectProps) => {
  return (
    <div className="space-y-2">
      {label && <label className="text-sm text-gray-600">{label}</label>}
      <select
        {...props}
        className={`w-full h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-200 bg-white ${error ? 'border-red-500' : ''} ${className || ''}`}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
