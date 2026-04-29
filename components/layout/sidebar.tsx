'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';
import { useAuth } from '@/stores/auth-store';
import {
  LayoutDashboard,
  Users,
  UserCircle,
  BookOpen,
  GraduationCap,
  Settings,
  LogOut,
  Brain,
  Trophy
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles: string[];
}

export function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  // Get role directly from user object (works after rehydration)
  const userRole = user?.role;
  const isAdmin = userRole === 'admin' || userRole === 'superadmin';
  const isTutor = userRole === 'tutor' || isAdmin;
  const isLearner = userRole === 'learner';

  const navItems: NavItem[] = [
    // Admin/SuperAdmin
    ...(isAdmin ? [
      { label: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard className="h-5 w-5" />, roles: ['admin', 'superadmin'] },
    ] : []),

    // User Management Section
    ...(isAdmin ? [
      { label: 'Users', href: '/admin/users', icon: <Users className="h-5 w-5" />, roles: ['admin', 'superadmin'] },
      { label: 'Learners', href: '/admin/learners', icon: <GraduationCap className="h-5 w-5" />, roles: ['admin', 'superadmin'] },
      { label: 'Tutors', href: '/admin/tutors', icon: <UserCircle className="h-5 w-5" />, roles: ['admin', 'superadmin'] },
    ] : []),

    // Course Management Section
    ...(isAdmin ? [
      { label: 'Courses', href: '/admin/courses', icon: <BookOpen className="h-5 w-5" />, roles: ['admin', 'superadmin'] },
    ] : []),

    // AI & Analytics Section
    ...(isAdmin ? [
      { label: 'AI Performance', href: '/admin/ai-performance', icon: <Brain className="h-5 w-5" />, roles: ['admin', 'superadmin'] },
    ] : []),

    // Tutor
    ...(isTutor ? [
      { label: 'My Courses', href: '/tutor/courses', icon: <BookOpen className="h-5 w-5" />, roles: ['tutor'] },
      { label: 'Quiz Sessions', href: '/tutor/sessions', icon: <Trophy className="h-5 w-5" />, roles: ['tutor'] },
      { label: 'AI Tools', href: '/tutor/ai', icon: <Brain className="h-5 w-5" />, roles: ['tutor'] },
    ] : []),

    // Learner
    ...(isLearner ? [
      { label: 'My Courses', href: '/learner/courses', icon: <BookOpen className="h-5 w-5" />, roles: ['learner'] },
      { label: 'Join Quiz', href: '/learner/join-quiz', icon: <Trophy className="h-5 w-5" />, roles: ['learner'] },
      { label: 'AI Tools', href: '/learner/ai', icon: <Brain className="h-5 w-5" />, roles: ['learner'] },
    ] : []),

    // Common
    { label: 'Profile', href: '/profile', icon: <Settings className="h-5 w-5" />, roles: ['superadmin', 'admin', 'tutor', 'learner'] },
  ];

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-white border-r border-gray-200">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-gray-200 px-6">
          <Link href="/" className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">LMS</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                pathname === item.href
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="border-t border-gray-200 p-4">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
