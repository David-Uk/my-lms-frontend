'use client';

import { cn } from '@/utils/cn';
import { useAuth } from '@/stores/auth-store';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { Loader2 } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isLoading } = useAuth();
  const sidebarWidth = 84;
  const sidebarCollapsedWidth = 72;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--background)]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--link-color)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar />
      <div
        className="transition-all duration-200"
        style={{
          marginLeft: `${sidebarWidth}px`,
        }}
      >
        <Header />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
