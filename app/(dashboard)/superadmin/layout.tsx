'use client';

import { cn } from '@/utils/cn';
import { useSidebarStore } from '@/stores/sidebar-store';
import { SuperAdminSidebar } from '@/components/layout/superadmin-sidebar';
import { Header } from '@/components/layout/header';

interface SuperAdminLayoutProps {
  children: React.ReactNode;
}

export default function SuperAdminLayout({ children }: SuperAdminLayoutProps) {
  const { isCollapsed } = useSidebarStore();

  return (
    <div className="min-h-screen bg-gray-900">
      <SuperAdminSidebar />
      <div className={cn('transition-all duration-300', isCollapsed ? 'lg:ml-20' : 'lg:ml-64')}>
        <Header />
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
