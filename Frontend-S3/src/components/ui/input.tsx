interface InputProps {
  label?: string
  error?: string
  type?: string
  value?: string
  onChange?: (e: any) => void
  className?: string
  autoComplete?: string
  placeholder?: string
}

export const Input = ({ label, error, className, ...props }: InputProps) => {
  return (
    <div className="space-y-2">
      {label && <label className="text-sm text-gray-600">{label}</label>}
      <input
        {...props}
        className={`w-full h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-200 ${error ? 'border-red-500' : ''} ${className || ''}`}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
