'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';
import { useAuth } from '@/stores/auth-store';
import { useSidebarStore } from '@/stores/sidebar-store';
import {
  LayoutDashboard,
  Users,
  Shield,
  BookOpen,
  Settings,
  LogOut,
  Crown,
  Server,
  FileText,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const superAdminNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/superadmin/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Manage Admins', href: '/superadmin/admins', icon: <Shield className="h-5 w-5" /> },
  { label: 'All Users', href: '/admin/users', icon: <Users className="h-5 w-5" /> },
  { label: 'Learners', href: '/admin/learners', icon: <Crown className="h-5 w-5" /> },
  { label: 'Tutors', href: '/admin/tutors', icon: <Users className="h-5 w-5" /> },
  { label: 'Courses', href: '/admin/courses', icon: <BookOpen className="h-5 w-5" /> },
  { label: 'System', href: '/superadmin/system', icon: <Server className="h-5 w-5" /> },
  { label: 'Audit Logs', href: '/superadmin/audit', icon: <FileText className="h-5 w-5" /> },
  { label: 'Profile', href: '/profile', icon: <Settings className="h-5 w-5" /> },
];

import { Logo } from '@/components/ui/logo';

export function SuperAdminSidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const { isCollapsed, toggleSidebar } = useSidebarStore();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-gradient-to-b from-gray-900 to-gray-800 border-r border-gray-700 shadow-xl transition-all duration-300',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-20 items-center px-4 border-b border-gray-700">
          <Link href="/superadmin/dashboard" className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex-shrink-0">
              <Crown className="h-5 w-5 text-white" />
            </div>
            {!isCollapsed && (
              <div className="flex-1">
                <Logo className="h-8 w-auto" />
                <p className="text-xs text-amber-400 font-bold uppercase tracking-widest">Super Admin</p>
              </div>
            )}
          </Link>
        </div>

        {/* Collapse Toggle */}
        <div className="flex justify-end p-2">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
          >
            {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        </div>

        {/* User Info */}
        {!isCollapsed && (
          <div className="px-6 py-4 border-b border-gray-700">
            <p className="text-sm text-gray-400">Logged in as</p>
            <p className="text-white font-bold truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-amber-400 font-medium uppercase tracking-wider">
              {user?.role}
            </p>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
          {superAdminNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-300',
                pathname === item.href || pathname.startsWith(item.href + '/')
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/20'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <div className={cn(
                "p-1.5 rounded-lg transition-colors flex-shrink-0",
                pathname === item.href || pathname.startsWith(item.href + '/')
                  ? "bg-white/10"
                  : "bg-gray-800 group-hover:bg-gray-700"
              )}>
                {item.icon}
              </div>
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="border-t border-gray-700 p-4">
          <button
            onClick={logout}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors",
              isCollapsed ? "justify-center" : "w-full"
            )}
            title={isCollapsed ? "Logout" : undefined}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
