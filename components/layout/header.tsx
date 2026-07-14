'use client';

import { useAuth } from '@/stores/auth-store';
import { usePathname } from 'next/navigation';
import { Bell, User, ChevronDown, Menu, LogOut, Settings } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/utils/cn';
import Link from 'next/link';

function getBreadcrumbs(pathname: string): { label: string; href: string }[] {
  const segments = pathname.split('/').filter(Boolean);
  const crumbs: { label: string; href: string }[] = [];

  const labelMap: Record<string, string> = {
    admin: 'Admin',
    superadmin: 'Super Admin',
    tutor: 'Tutor',
    learner: 'Learner',
    dashboard: 'Dashboard',
    users: 'Users',
    learners: 'Learners',
    tutors: 'Tutors',
    courses: 'Courses',
    create: 'Create',
    edit: 'Edit',
    content: 'Content',
    slides: 'Slides',
    quiz: 'Quiz',
    sessions: 'Sessions',
    generate: 'Generate',
    students: 'Students',
    progress: 'Progress',
    profile: 'Profile',
    ai: 'AI Tools',
    'ai-performance': 'AI Performance',
    'quiz-generator': 'Quiz Generator',
    'join-quiz': 'Join Quiz',
    system: 'System',
    audit: 'Audit Logs',
    admins: 'Manage Admins',
    take: 'Take Quiz',
    live: 'Live Session',
  };

  for (let i = 0; i < segments.length; i++) {
    const href = '/' + segments.slice(0, i + 1).join('/');
    const segment = segments[i];
    const label = labelMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    crumbs.push({ label, href });
  }

  return crumbs;
}

export function Header() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const breadcrumbs = getBreadcrumbs(pathname);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-14 border-b border-gray-200 bg-white">
      <div className="flex h-full items-center justify-between px-4 sm:px-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1 text-sm min-w-0">
          {breadcrumbs.map((crumb, index) => (
            <span key={crumb.href} className="flex items-center gap-1 min-w-0">
              {index > 0 && (
                <span className="text-gray-300 mx-0.5 flex-shrink-0">/</span>
              )}
              {index === breadcrumbs.length - 1 ? (
                <span className="text-gray-900 font-medium truncate">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="text-[var(--link-color)] hover:underline truncate flex-shrink-0"
                >
                  {crumb.label}
                </Link>
              )}
            </span>
          ))}
        </nav>

        {/* Right section */}
        <div className="flex items-center gap-3">
          {/* Notification bell */}
          <button className="relative p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0.5 right-0.5 h-2 w-2 rounded-full bg-red-500 ring-1 ring-white" />
          </button>

          {/* User menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-1.5 rounded hover:bg-gray-100 transition-colors"
            >
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.firstName}
                  className="h-7 w-7 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-200">
                  <User className="h-4 w-4 text-gray-500" />
                </div>
              )}
              <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-56 rounded-lg border border-gray-200 bg-white shadow-lg py-1 z-50">
                <div className="px-4 py-2.5 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
                <Link
                  href="/profile"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  Profile Settings
                </Link>
                <button
                  onClick={() => { setUserMenuOpen(false); logout(); }}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
