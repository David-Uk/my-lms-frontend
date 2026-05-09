'use client';

import { cn } from '@/utils/cn';
import { useAuth } from '@/stores/auth-store';
import { useSidebarStore } from '@/stores/sidebar-store';
import { AdminSidebar } from './admin-sidebar';
import { TutorSidebar } from './tutor-sidebar';
import { LearnerSidebar } from './learner-sidebar';
import { SuperAdminSidebar } from './superadmin-sidebar';
import { Header } from './header';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, isLoading } = useAuth();
  const userRole = user?.role;
  const { isCollapsed } = useSidebarStore();

  // Don't render the sidebar until the auth store has rehydrated from localStorage.
  // Without this guard, the server renders with user=null (AdminSidebar fallback)
  // while the client renders with the real role — causing a hydration mismatch.
  const renderSidebar = () => {
    if (isLoading) return null;

    if (userRole === 'superadmin') {
      return <SuperAdminSidebar />;
    }
    if (userRole === 'admin') {
      return <AdminSidebar />;
    }
    if (userRole === 'tutor') {
      return <TutorSidebar />;
    }
    if (userRole === 'learner') {
      return <LearnerSidebar />;
    }
    return <AdminSidebar />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderSidebar()}
      <div className={cn(
        'transition-all duration-300',
        isLoading ? '' : isCollapsed ? 'lg:ml-20' : 'lg:ml-64'
      )}>
        <Header />
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
