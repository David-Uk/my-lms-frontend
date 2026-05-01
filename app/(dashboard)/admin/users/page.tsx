import { Metadata } from 'next';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import type { User, PaginatedResponse } from '@/types';
import { Plus, Users } from 'lucide-react';
import { UserTable } from './user-table';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'User Management - LMS Admin',
  description: 'Manage users, roles, and permissions',
};

interface PageProps {
  searchParams: Promise<{
    search?: string;
    page?: string;
  }>;
}

export default async function UsersPage({ searchParams }: PageProps) {
  const { search = '', page = '1' } = await searchParams;

  const fetchUsers = async () => {
    const params = new URLSearchParams({
      page,
      limit: '10',
    });
    if (search) params.append('search', search);

    try {
      return await api.get<PaginatedResponse<User>>(`/users?${params.toString()}`);
    } catch (error) {
      console.error('Server-side fetch error:', error);
      return { data: [], total: 0, page: 1, limit: 10, totalPages: 1, meta: { total: 0, page: 1, limit: 10, totalPages: 1 } } as PaginatedResponse<User>;
    }
  };

  const initialData = await fetchUsers();

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-2xl text-blue-600 shadow-inner">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Users</h1>
              <p className="text-gray-500 font-medium">System-wide user accounts and roles</p>
            </div>
          </div>
          <Link href="/admin/users/create">
            <Button className="h-12 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95">
              <Plus className="mr-2 h-5 w-5" />
              Add New User
            </Button>
          </Link>
        </div>

        <Suspense fallback={
          <div className="space-y-4">
            <div className="h-10 w-64 bg-gray-200 rounded-xl animate-pulse" />
            <div className="h-[500px] w-full bg-gray-100 rounded-3xl animate-pulse" />
          </div>
        }>
          <UserTable initialData={initialData} search={search} />
        </Suspense>
      </div>
    </DashboardLayout>
  );
}
