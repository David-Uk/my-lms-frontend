'use client';

import * as React from 'react';
import { cn } from '@/utils/cn';

interface DropdownMenuProps {
  children: React.ReactNode;
}

const DropdownMenuContext = React.createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
}>({ open: false, setOpen: () => {} });

function DropdownMenu({ children }: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false);
  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div className="relative">{children}</div>
    </DropdownMenuContext.Provider>
  );
}

interface DropdownMenuTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

function DropdownMenuTrigger({ children, asChild }: DropdownMenuTriggerProps) {
  const { setOpen } = React.useContext(DropdownMenuContext);
  
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: () => setOpen(true),
    } as any);
  }

  return (
    <button onClick={() => setOpen(true)}>
      {children}
    </button>
  );
}

interface DropdownMenuContentProps {
  children: React.ReactNode;
  align?: 'start' | 'end' | 'center';
  className?: string;
}

function DropdownMenuContent({ children, align = 'center', className }: DropdownMenuContentProps) {
  const { open, setOpen } = React.useContext(DropdownMenuContext);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, setOpen]);

  if (!open) return null;

  const alignClasses = {
    start: 'left-0',
    end: 'right-0',
    center: 'left-1/2 -translate-x-1/2',
  };

  return (
    <div
      ref={ref}
      className={cn(
        'absolute z-50 mt-2 min-w-[8rem] overflow-hidden rounded-xl border border-gray-200 bg-white p-1 shadow-lg animate-in fade-in zoom-in-95 duration-200',
        alignClasses[align],
        className
      )}
    >
      {children}
    </div>
  );
}

interface DropdownMenuItemProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  asChild?: boolean;
}

function DropdownMenuItem({ children, className, onClick, asChild }: DropdownMenuItemProps) {
  const { setOpen } = React.useContext(DropdownMenuContext);
  
  const handleClick = () => {
    onClick?.();
    setOpen(false);
  };

  if (asChild && React.isValidElement(children)) {
    return (
      <div className={cn(
        'relative flex cursor-pointer select-none items-center rounded-lg px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-100 focus:bg-gray-100',
        className
      )}>
        {React.cloneElement(children, { onClick: handleClick } as any)}
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        'relative flex w-full cursor-pointer select-none items-center rounded-lg px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-100 focus:bg-gray-100',
        className
      )}
    >
      {children}
    </button>
  );
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
};
