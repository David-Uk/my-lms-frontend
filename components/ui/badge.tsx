import * as React from 'react';
import { cn } from '@/utils/cn';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'outline';
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'neutral', ...props }, ref) => {
    const variants: Record<string, string> = {
      primary: 'bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]',
      success: 'bg-green-50 text-green-700',
      warning: 'bg-amber-50 text-amber-700',
      danger: 'bg-red-50 text-red-700',
      info: 'bg-blue-50 text-blue-700',
      neutral: 'bg-gray-100 text-gray-700',
      outline: 'border border-gray-300 text-gray-600 bg-transparent',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold leading-tight',
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };
