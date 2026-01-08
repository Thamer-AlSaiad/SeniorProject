import { InputHTMLAttributes } from 'react'
import { Check } from 'lucide-react'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
}

export const Checkbox = ({ label, className, ...props }: CheckboxProps) => {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div className="relative">
        <input type="checkbox" className="sr-only peer" {...props} />
        <div className="w-5 h-5 border-2 border-gray-900 rounded peer-checked:bg-gray-900 flex items-center justify-center">
          <Check className="w-3 h-3 text-white hidden peer-checked:block" />
        </div>
      </div>
      {label && <span className="text-sm text-gray-900">{label}</span>}
    </label>
  )
}
