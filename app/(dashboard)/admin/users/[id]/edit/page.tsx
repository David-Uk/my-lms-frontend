import { Metadata } from 'next';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { api } from '@/lib/api';
import { User } from '@/types';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { UserEditForm } from './user-edit-form';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Edit User - LMS Admin',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditUserPage({ params }: PageProps) {
  const { id } = await params;

  const fetchUser = async () => {
    try {
      return await api.get<User>(`/users/${id}`);
    } catch (err) {
      console.error('Failed to fetch user:', err);
      return null;
    }
  };

  const user = await fetchUser();

  if (!user) {
    notFound();
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin/users" 
            className="group flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-md border border-gray-100 hover:bg-gray-900 hover:text-white transition-all"
          >
            <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Configuration</h1>
            <p className="text-gray-500 font-medium">UPDATING {user.firstName.toUpperCase()}&apos;S ACCOUNT</p>
          </div>
        </div>

        <UserEditForm user={user} />
      </div>
    </DashboardLayout>
  );
}
