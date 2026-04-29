'use client';

import { cn } from '@/utils/cn';
import { useAuth } from '@/stores/auth-store';
import { useSidebarStore } from '@/stores/sidebar-store';
import { AdminSidebar } from './admin-sidebar';
import { TutorSidebar } from './tutor-sidebar';
import { LearnerSidebar } from './learner-sidebar';
import { Header } from './header';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuth();
  const userRole = user?.role;
  const { isCollapsed } = useSidebarStore();

  // Select sidebar based on role
  const renderSidebar = () => {
    if (userRole === 'admin') {
      return <AdminSidebar />;
    }
    if (userRole === 'tutor') {
      return <TutorSidebar />;
    }
    if (userRole === 'learner') {
      return <LearnerSidebar />;
    }
    // Default/fallback - shouldn't happen with middleware protection
    return <AdminSidebar />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderSidebar()}
      <div className={cn('transition-all duration-300', isCollapsed ? 'lg:ml-20' : 'lg:ml-64')}>
        <Header />
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
