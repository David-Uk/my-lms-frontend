'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import SuperAdminLayout from '../layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import type { User, PaginatedResponse } from '@/types';
import { Shield, Plus, Crown, MoreHorizontal, Edit, Trash2, UserCheck } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface AdminUser extends User {
  lastLoginAt: string | null;
}

export default function SuperAdminManageAdminsPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      // Fetch both admin and superadmin roles
      const [adminsRes, superAdminsRes] = await Promise.all([
        api.get<PaginatedResponse<AdminUser>>('/users?role=admin&limit=100'),
        api.get<PaginatedResponse<AdminUser>>('/users?role=superadmin&limit=100'),
      ]);

      const allAdmins = [
        ...(adminsRes.data || []),
        ...(superAdminsRes.data || []),
      ];

      setAdmins(allAdmins);
    } catch (err) {
      setError('Failed to fetch admin users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAdmin = async (adminId: string) => {
    if (!confirm('Are you sure you want to delete this admin? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/users/${adminId}`);
      setAdmins(admins.filter(a => a.id !== adminId));
    } catch (err) {
      alert('Failed to delete admin');
      console.error(err);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'superadmin':
        return <Crown className="h-3 w-3 mr-1" />;
      case 'admin':
        return <Shield className="h-3 w-3 mr-1" />;
      default:
        return null;
    }
  };

  return (
    <SuperAdminLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl text-white shadow-xl shadow-purple-200">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Manage Admins</h1>
              <p className="text-gray-500 font-medium">Admin and super admin accounts</p>
            </div>
          </div>
          <Link href="/admin/users/create">
            <Button className="h-12 px-6 rounded-2xl bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-200 transition-all active:scale-95">
              <Plus className="mr-2 h-5 w-5" />
              Create Admin
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-none shadow-lg rounded-2xl">
            <CardContent className="p-6">
              <div className="text-3xl font-black text-gray-900">
                {admins.filter(a => a.role === 'admin').length}
              </div>
              <p className="text-sm text-gray-500 font-medium">Regular Admins</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-lg rounded-2xl">
            <CardContent className="p-6">
              <div className="text-3xl font-black text-gray-900">
                {admins.filter(a => a.role === 'superadmin').length}
              </div>
              <p className="text-sm text-gray-500 font-medium">Super Admins</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-lg rounded-2xl">
            <CardContent className="p-6">
              <div className="text-3xl font-black text-gray-900">
                {admins.filter(a => a.status === 'active').length}
              </div>
              <p className="text-sm text-gray-500 font-medium">Active Admins</p>
            </CardContent>
          </Card>
        </div>

        {/* Admins Table */}
        <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-8 border-b border-gray-100">
            <CardTitle className="text-xl font-black">Admin Users</CardTitle>
            <CardDescription className="font-medium">
              Manage administrator accounts and permissions
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <p className="text-red-600">{error}</p>
                <Button onClick={fetchAdmins} className="mt-4">Retry</Button>
              </div>
            ) : admins.length === 0 ? (
              <div className="p-12 text-center">
                <Shield className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No admin users found</h3>
                <p className="text-gray-500 mt-1">Create your first admin account to get started.</p>
                <Link href="/admin/users/create" className="mt-4 inline-block">
                  <Button>Create Admin</Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {admins.map((admin) => (
                  <div
                    key={admin.id}
                    className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                        {admin.firstName[0]}{admin.lastName[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-gray-900">
                            {admin.firstName} {admin.lastName}
                          </h4>
                          <Badge variant="outline" className={getRoleBadgeColor(admin.role)}>
                            <span className="flex items-center">
                              {getRoleIcon(admin.role)}
                              {admin.role}
                            </span>
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">{admin.email}</p>
                        {admin.lastLoginAt && (
                          <p className="text-xs text-gray-400 mt-1">
                            Last login: {new Date(admin.lastLoginAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full">
                          <MoreHorizontal className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/users/${admin.id}`} className="flex items-center">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/users/${admin.id}/permissions`} className="flex items-center">
                            <UserCheck className="mr-2 h-4 w-4" />
                            Permissions
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteAdmin(admin.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
