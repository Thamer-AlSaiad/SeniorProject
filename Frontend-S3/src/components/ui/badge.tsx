import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
}

const variantStyles = {
  default: 'bg-purple-100 text-purple-700',
  success: 'bg-purple-100 text-purple-700',
  warning: 'bg-purple-200 text-purple-800',
  error: 'bg-purple-50 text-purple-600',
  info: 'bg-purple-100 text-purple-700',
};

export const Badge = ({ children, variant = 'default', className = '' }: BadgeProps) => {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
};
