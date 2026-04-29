'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';
import { useAuth } from '@/stores/auth-store';
import { useSidebarStore } from '@/stores/sidebar-store';
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Settings,
  LogOut,
  Brain,
  Trophy,
  Users,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const tutorNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/tutor/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'My Courses', href: '/tutor/courses', icon: <BookOpen className="h-5 w-5" /> },
  { label: 'My Students', href: '/tutor/students', icon: <Users className="h-5 w-5" /> },
  { label: 'Quiz Sessions', href: '/tutor/sessions', icon: <Trophy className="h-5 w-5" /> },
  { label: 'AI Tools', href: '/tutor/ai', icon: <Brain className="h-5 w-5" /> },
  { label: 'Profile', href: '/profile', icon: <Settings className="h-5 w-5" /> },
];

import { Logo } from '@/components/ui/logo';

export function TutorSidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const { isCollapsed, toggleSidebar } = useSidebarStore();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-white border-r border-gray-100 shadow-xl shadow-gray-200/50 transition-all duration-300',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-20 items-center px-4">
          <Link href="/tutor/dashboard" className="flex items-center gap-3">
            <div className="p-2 bg-[#004D20] rounded-xl flex-shrink-0">
              <Logo iconOnly className="h-5 w-5 text-white" />
            </div>
            {!isCollapsed && <Logo />}
          </Link>
        </div>

        {/* Collapse Toggle */}
        <div className="flex justify-end p-2">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        </div>

        {/* User Info */}
        {!isCollapsed && (
          <div className="px-6 py-4 border-b border-gray-100">
            <p className="text-sm text-gray-500">Logged in as</p>
            <p className="text-gray-900 font-bold truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-[#004D20] font-medium uppercase tracking-wider">
              {user?.role}
            </p>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 space-y-2 p-4 overflow-y-auto">
          {tutorNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-300',
                pathname === item.href
                  ? 'bg-[#004D20] text-white shadow-lg shadow-green-900/20'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-[#004D20]'
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <div className={cn(
                "p-1.5 rounded-lg transition-colors flex-shrink-0",
                pathname === item.href ? "bg-white/10" : "bg-gray-50 group-hover:bg-green-50"
              )}>
                {item.icon}
              </div>
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="border-t border-gray-200 p-4">
          <button
            onClick={logout}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors",
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
