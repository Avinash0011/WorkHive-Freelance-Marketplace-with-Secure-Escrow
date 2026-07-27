import { HTMLAttributes, forwardRef } from 'react';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'draft' | 'pending' | 'posted' | 'submitted' | 'assigned' | 'escrowed' | 'paid' | 'accepted' | 'succeeded' | 'rejected' | 'failed' | 'cancelled' | 'withdrawn';
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'pending', className = '', children, ...props }, ref) => {
    const baseClasses = 'badge';
    const variantClasses = `badge-${variant}`;
    
    return (
      <span
        ref={ref}
        className={`${baseClasses} ${variantClasses} ${className}`.trim()}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
