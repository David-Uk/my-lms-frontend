import * as React from 'react';
import { cn } from '@/utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'link';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants: Record<string, string> = {
      primary: 'bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary)]/90 focus:ring-[var(--brand-primary)]/30 rounded-lg',
      secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-300 rounded-lg',
      outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:ring-gray-300 rounded-lg bg-white',
      ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-300 rounded-lg',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 rounded-lg',
      link: 'text-[var(--link-color)] hover:underline focus:ring-[var(--link-color)]/30 underline-offset-2',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-2.5 text-base',
      icon: 'p-2',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
export type { ButtonProps };
