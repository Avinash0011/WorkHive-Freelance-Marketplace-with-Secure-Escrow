import { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error = false, label, className = '', ...props }, ref) => {
    const baseClasses = 'input';
    const errorClasses = error ? 'input-error' : '';
    
    return (
      <div>
        {label && <label className="text-small text-slate mb-2 block">{label}</label>}
        <input
          ref={ref}
          className={`${baseClasses} ${errorClasses} ${className}`.trim()}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = 'Input';
