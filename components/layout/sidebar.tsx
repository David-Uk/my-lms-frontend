'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';
import { useAuth } from '@/stores/auth-store';
import { useSidebarStore } from '@/stores/sidebar-store';
import {
  LayoutDashboard,
  Users,
  UserCircle,
  BookOpen,
  GraduationCap,
  Settings,
  LogOut,
  Brain,
  Sparkles,
  Shield,
  Server,
  FileText,
  Trophy,
  BarChart3,
} from 'lucide-react';
import { memo, useMemo } from 'react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navConfigs: Record<string, NavItem[]> = {
  superadmin: [
    { label: 'Dashboard', href: '/superadmin/dashboard', icon: <LayoutDashboard /> },
    { label: 'Manage Admins', href: '/superadmin/admins', icon: <Shield /> },
    { label: 'All Users', href: '/admin/users', icon: <Users /> },
    { label: 'Learners', href: '/admin/learners', icon: <GraduationCap /> },
    { label: 'Tutors', href: '/admin/tutors', icon: <UserCircle /> },
    { label: 'Courses', href: '/admin/courses', icon: <BookOpen /> },
    { label: 'Quiz Generator', href: '/tutor/sessions/generate', icon: <Sparkles /> },
    { label: 'System', href: '/superadmin/system', icon: <Server /> },
    { label: 'Audit Logs', href: '/superadmin/audit', icon: <FileText /> },
    { label: 'Profile', href: '/profile', icon: <Settings /> },
  ],
  admin: [
    { label: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard /> },
    { label: 'Users', href: '/admin/users', icon: <Users /> },
    { label: 'Learners', href: '/admin/learners', icon: <GraduationCap /> },
    { label: 'Tutors', href: '/admin/tutors', icon: <UserCircle /> },
    { label: 'Courses', href: '/admin/courses', icon: <BookOpen /> },
    { label: 'Quiz Gen', href: '/tutor/sessions/generate', icon: <Sparkles /> },
    { label: 'AI Perf', href: '/admin/ai-performance', icon: <Brain /> },
    { label: 'Profile', href: '/profile', icon: <Settings /> },
  ],
  tutor: [
    { label: 'Dashboard', href: '/tutor/dashboard', icon: <LayoutDashboard /> },
    { label: 'Courses', href: '/tutor/courses', icon: <BookOpen /> },
    { label: 'Students', href: '/tutor/students', icon: <Users /> },
    { label: 'Quiz Sessions', href: '/tutor/sessions', icon: <Trophy /> },
    { label: 'Quiz Gen', href: '/tutor/sessions/generate', icon: <Sparkles /> },
    { label: 'AI Tools', href: '/tutor/ai', icon: <Brain /> },
    { label: 'Profile', href: '/profile', icon: <Settings /> },
  ],
  learner: [
    { label: 'Dashboard', href: '/learner/dashboard', icon: <LayoutDashboard /> },
    { label: 'Courses', href: '/learner/courses', icon: <BookOpen /> },
    { label: 'Progress', href: '/learner/progress', icon: <BarChart3 /> },
    { label: 'Join Quiz', href: '/learner/join-quiz', icon: <Trophy /> },
    { label: 'Study Tools', href: '/learner/ai', icon: <Brain /> },
    { label: 'Profile', href: '/profile', icon: <Settings /> },
  ],
};

const fallbackNav = navConfigs.admin;

const CanvasNavItem = memo(function CanvasNavItem({
  item,
  isActive,
}: {
  item: NavItem;
  isActive: boolean;
}) {
  return (
    <Link
      href={item.href}
      className={cn(
        'ic-app-header__menu-list-link group',
        isActive && 'active'
      )}
      title={item.label}
    >
      <div className="ic-app-header__menu-list-item-icon">
        {item.icon}
      </div>
      <span>{item.label}</span>
    </Link>
  );
});

function CanvasLogo() {
  return (
    <div className="flex items-center justify-center h-16 border-b border-white/10">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--brand-primary)]">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5 text-white"
        >
          <path d="M15 6h.01" />
          <path d="M17 18h.01" />
          <path d="M10 20h4" />
          <path d="M9 16c-1.6 0-3-1.3-3-3s1.4-3 3-3 3 1.3 3 3-1.4 3-3 3" />
          <path d="M15 13c1.6 0 3-1.3 3-3s-1.4-3-3-3-3 1.3-3 3 1.4 3 3 3" />
          <path d="M13 16h3" />
        </svg>
      </div>
    </div>
  );
}

export const Sidebar = memo(function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const { isCollapsed } = useSidebarStore();

  const navItems = useMemo(() => {
    return navConfigs[user?.role || ''] || fallbackNav;
  }, [user?.role]);

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-[var(--canvas-nav)] flex flex-col transition-all duration-200',
        isCollapsed ? 'w-[72px]' : 'w-[84px]'
      )}
    >
      <CanvasLogo />

      <nav className="flex-1 flex flex-col pt-2 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => (
          <div key={item.href} className="ic-app-header__menu-list-item">
            <CanvasNavItem
              item={item}
              isActive={isActive(item.href)}
            />
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10">
        <div className="ic-app-header__menu-list-item">
          <button
            onClick={logout}
            className="ic-app-header__menu-list-link w-full"
            title="Logout"
          >
            <div className="ic-app-header__menu-list-item-icon">
              <LogOut />
            </div>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
});
