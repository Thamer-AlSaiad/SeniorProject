import { ChangeEvent } from 'react';

interface TextareaProps {
  label?: string;
  error?: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  className?: string;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
}

export const Textarea = ({ label, error, className = '', rows = 4, ...props }: TextareaProps) => {
  return (
    <div className="space-y-2">
      {label && <label className="text-sm text-gray-600">{label}</label>}
      <textarea
        {...props}
        rows={rows}
        className={`w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-200 resize-none ${error ? 'border-red-500' : ''} ${className}`}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};
