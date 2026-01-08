import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  children: ReactNode
  loading?: boolean
  className?: string
  variant?: 'primary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  type?: 'button' | 'submit' | 'reset'
}

export const Button = ({ 
  children, 
  loading, 
  className, 
  variant = 'primary',
  size = 'md',
  disabled,
  type = 'button',
  ...props 
}: ButtonProps) => {
  const baseStyles = 'rounded-full font-medium transition-colors disabled:opacity-50';
  
  const variantStyles = {
    primary: 'bg-[#1a0b2e] text-white hover:bg-[#2a1b3e]',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };
  
  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-2.5',
    lg: 'px-8 py-3',
  };

  return (
    <button
      type={type}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className || ''}`}
      disabled={loading || disabled}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  )
}
