'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import type { User, PaginatedResponse } from '@/types';
import { Search, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

interface UserTableProps {
  initialData: PaginatedResponse<User>;
  search: string;
}

export function UserTable({ initialData, search: initialSearch }: UserTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(initialSearch);
  const users = initialData.data;
  const page = initialData.meta?.page || 1;
  const totalPages = initialData.meta?.totalPages || 1;

  const handleSearch = (val: string) => {
    setSearch(val);
    const params = new URLSearchParams(searchParams.toString());
    if (val) params.set('search', val);
    else params.delete('search');
    params.set('page', '1');
    router.push(`/admin/users?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/admin/users?${params.toString()}`);
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to deactivate this user?')) return;
    try {
      await api.delete(`/users/${userId}`);
      router.refresh();
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      superadmin: 'bg-purple-100 text-purple-800 border-purple-200',
      admin: 'bg-blue-100 text-blue-800 border-blue-200',
      tutor: 'bg-green-100 text-green-800 border-green-200',
      learner: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colors[role] || colors.learner}`}>
        {role}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      inactive: 'bg-slate-100 text-slate-800 border-slate-200',
      suspended: 'bg-rose-100 text-rose-800 border-rose-200',
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colors[status] || colors.inactive}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 h-11 rounded-xl shadow-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-200">
              <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
              <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
              <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-gray-500 italic">
                  No users found matching your criteria.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="group hover:bg-gray-50/80 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-100">
                        {user.firstName[0]}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">{getRoleBadge(user.role)}</td>
                  <td className="py-4 px-6">{getStatusBadge(user.status)}</td>
                  <td className="py-4 px-6">
                    <div className="flex justify-end gap-1">
                      <Link href={`/admin/users/${user.id}/edit`}>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-blue-50 hover:text-blue-600 text-gray-400 transition-all">
                          <Pencil className="h-4.5 w-4.5" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(user.id)}
                        className="h-9 w-9 rounded-lg hover:bg-red-50 hover:text-red-600 text-gray-400 transition-all"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Footer / Pagination */}
        <div className="bg-gray-50/50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
          <p className="text-sm text-gray-500 font-medium">
            Showing <span className="text-gray-900">{users.length}</span> results
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg"
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center px-4 py-1.5 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-lg shadow-sm">
                {page} <span className="mx-1 text-gray-400 font-normal">/</span> {totalPages}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg"
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
