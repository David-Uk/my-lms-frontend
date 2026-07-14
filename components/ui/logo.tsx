import { cn } from '@/utils/cn';

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
}

export function Logo({ className, iconOnly = false }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-primary)] text-white overflow-hidden group">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6 relative z-10 text-white"
        >
          <path d="M15 6h.01" />
          <path d="M17 18h.01" />
          <path d="M10 20h4" />
          <path d="M9 16c-1.6 0-3-1.3-3-3s1.4-3 3-3 3 1.3 3 3-1.4 3-3 3" />
          <path d="M15 13c1.6 0 3-1.3 3-3s-1.4-3-3-3-3 1.3-3 3 1.4 3 3 3" />
          <path d="M13 16h3" />
        </svg>
        <div className="absolute inset-0 bg-gradient-to-tr from-[var(--brand-primary)] to-[var(--brand-secondary)] opacity-50" />
      </div>

      {!iconOnly && (
        <div className="flex flex-col -space-y-1">
          <span className="text-lg font-black tracking-tighter text-[var(--text-primary)]">
            EDO <span className="text-[var(--brand-primary)]">INNOVATES</span>
          </span>
          <span className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">
            Learning Management
          </span>
        </div>
      )}
    </div>
  );
}
