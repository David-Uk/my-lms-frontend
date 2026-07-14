import type { Metadata } from 'next';
import Link from 'next/link';
import { Logo } from '@/components/ui/logo';

export const metadata: Metadata = {
  title: 'Authentication - LMS',
  description: 'Login or sign up to access the Learning Management System',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)]">
      <div className="flex items-center justify-center px-4 py-8 border-b border-gray-200 bg-white">
        <Link href="/">
          <Logo />
        </Link>
      </div>
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
