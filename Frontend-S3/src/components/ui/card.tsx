import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card = ({ children, className = '', onClick }: CardProps) => {
  return (
    <div 
      className={`bg-white rounded-xl shadow-sm border border-gray-100 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`px-6 py-4 border-b border-gray-100 ${className}`}>{children}</div>
);

export const CardContent = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`px-6 py-4 ${className}`}>{children}</div>
);

export const CardFooter = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`px-6 py-4 border-t border-gray-100 ${className}`}>{children}</div>
);
