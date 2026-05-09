'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import type { User } from '@/types';
import {
  Users,
  Search,
  Plus,
  Crown,
  Shield,
  GraduationCap,
  BookOpen,
  Calendar,
  MoreHorizontal,
  Trash2,
  UserCheck,
  UserX,
  Filter,
  TrendingUp,
  Sparkles,
  Pencil
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function SuperAdminDashboardPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalLearners: 0,
    totalTutors: 0,
    totalAdmins: 0,
    totalSuperAdmins: 0,
    activeUsers: 0,
  });

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      if (searchQuery) params.append('search', searchQuery);

      const response = await api.get<{ users?: User[]; data?: User[]; total?: number; totalPages?: number; meta?: { total: number; totalPages: number } }>(`/users?${params.toString()}`);
      const data = response.users || response.data || [];
      const total = response.total ?? response.meta?.total ?? 0;
      const totalPages = response.totalPages ?? response.meta?.totalPages ?? 0;

      setUsers(data);
      setPagination(prev => ({
        ...prev,
        total,
        totalPages,
      }));
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchQuery]);

  const fetchStats = async () => {
    try {
      const [learnersRes, tutorsRes, adminsRes, superAdminsRes, usersRes] = await Promise.allSettled([
        api.get<{ total?: number; meta?: { total: number } }>('/users?role=learner&limit=1'),
        api.get<{ total?: number; meta?: { total: number } }>('/users?role=tutor&limit=1'),
        api.get<{ total?: number; meta?: { total: number } }>('/users?role=admin&limit=1'),
        api.get<{ total?: number; meta?: { total: number } }>('/users?role=superadmin&limit=1'),
        api.get<{ total?: number; meta?: { total: number } }>('/users?limit=1'),
      ]);

      setStats({
        totalUsers: usersRes.status === 'fulfilled' ? (usersRes.value.total || usersRes.value.meta?.total || 0) : 0,
        totalLearners: learnersRes.status === 'fulfilled' ? (learnersRes.value.total || learnersRes.value.meta?.total || 0) : 0,
        totalTutors: tutorsRes.status === 'fulfilled' ? (tutorsRes.value.total || tutorsRes.value.meta?.total || 0) : 0,
        totalAdmins: adminsRes.status === 'fulfilled' ? (adminsRes.value.total || adminsRes.value.meta?.total || 0) : 0,
        totalSuperAdmins: superAdminsRes.status === 'fulfilled' ? (superAdminsRes.value.total || superAdminsRes.value.meta?.total || 0) : 0,
        activeUsers: usersRes.status === 'fulfilled' ? (usersRes.value.total || usersRes.value.meta?.total || 0) : 0,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [fetchUsers]);

  const handleDeactivate = async (userId: string) => {
    if (!confirm('Are you sure you want to deactivate this user?')) return;
    try {
      await api.patch(`/users/${userId}`, { status: 'inactive' });
      fetchUsers();
    } catch (error) {
      console.error('Failed to deactivate user:', error);
    }
  };

  const handleActivate = async (userId: string) => {
    try {
      await api.patch(`/users/${userId}`, { status: 'active' });
      fetchUsers();
    } catch (error) {
      console.error('Failed to activate user:', error);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      await api.delete(`/users/${userId}`);
      fetchUsers();
      fetchStats();
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user');
    }
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(u => u.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedUsers(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const getRoleBadge = (role: string) => {
    const roleConfig: Record<string, { bg: string; icon: React.ReactNode; label: string }> = {
      superadmin: { bg: 'bg-[#004D20] text-white', icon: <Crown className="h-3 w-3 mr-1" />, label: 'Super Admin' },
      admin: { bg: 'bg-purple-100 text-purple-800', icon: <Shield className="h-3 w-3 mr-1" />, label: 'Admin' },
      tutor: { bg: 'bg-emerald-100 text-emerald-800', icon: <BookOpen className="h-3 w-3 mr-1" />, label: 'Tutor' },
      learner: { bg: 'bg-blue-100 text-blue-800', icon: <GraduationCap className="h-3 w-3 mr-1" />, label: 'Learner' },
    };
    const config = roleConfig[role] || roleConfig.learner;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${config.bg}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-1000">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-[#004D20]/10 rounded-3xl shadow-lg">
              <Crown className="h-8 w-8 text-[#004D20]" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight">User Management</h1>
              <p className="text-gray-500 font-medium mt-1">System-wide user accounts and permissions</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">System Active</span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          <StatCard
            title="Total Users"
            value={loading ? '—' : stats.totalUsers}
            description="All accounts"
            icon={<Users className="h-5 w-5 text-blue-600" />}
            color="blue"
          />
          <StatCard
            title="Learners"
            value={loading ? '—' : stats.totalLearners}
            description="Students"
            icon={<GraduationCap className="h-5 w-5 text-emerald-600" />}
            color="emerald"
          />
          <StatCard
            title="Tutors"
            value={loading ? '—' : stats.totalTutors}
            description="Instructors"
            icon={<BookOpen className="h-5 w-5 text-purple-600" />}
            color="purple"
          />
          <StatCard
            title="Admins"
            value={loading ? '—' : stats.totalAdmins}
            description="System admins"
            icon={<Shield className="h-5 w-5 text-orange-600" />}
            color="orange"
          />
          <StatCard
            title="Super Admins"
            value={loading ? '—' : stats.totalSuperAdmins}
            description="Root access"
            icon={<Crown className="h-5 w-5 text-[#004D20]" />}
            color="green"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 border-none shadow-2xl shadow-gray-200/50 rounded-[2.5rem] overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-[#004D20]" />
                  <CardTitle className="text-xl font-black">All Users</CardTitle>
                </div>
                <Link href="/admin/users/create">
                  <Button className="rounded-2xl bg-[#004D20] hover:bg-[#003D1A] gap-2">
                    <Plus className="h-4 w-4" />
                    Add User
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#004D20] focus:border-transparent font-medium"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPagination(prev => ({ ...prev, page: 1 }));
                    }}
                  />
                </div>
                <Button variant="outline" className="gap-2 rounded-2xl h-12 px-6 border-gray-200 hover:border-[#004D20] hover:bg-emerald-50">
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
              </div>

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#004D20]" />
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-gray-300" />
                  <h3 className="mt-4 text-lg font-bold text-gray-900">No users found</h3>
                  <p className="mt-1 text-gray-500">Get started by creating your first user.</p>
                  <Link href="/admin/users/create">
                    <Button className="mt-4 rounded-2xl bg-[#004D20]">Create User</Button>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="py-4 px-4 text-left">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300"
                            checked={selectedUsers.length === users.length && users.length > 0}
                            onChange={toggleSelectAll}
                          />
                        </th>
                        <th className="py-4 px-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">User</th>
                        <th className="py-4 px-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Role</th>
                        <th className="py-4 px-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                        <th className="py-4 px-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Joined</th>
                        <th className="py-4 px-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="py-4 px-4">
                            <input
                              type="checkbox"
                              className="rounded border-gray-300"
                              checked={selectedUsers.includes(user.id)}
                              onChange={() => toggleSelect(user.id)}
                            />
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-[#004D20] to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                                {user.firstName[0]}{user.lastName[0]}
                              </div>
                              <div>
                                <p className="font-bold text-gray-900">{user.firstName} {user.lastName}</p>
                                <p className="text-xs text-gray-500">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            {getRoleBadge(user.role)}
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                              user.status === 'active'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Calendar className="h-3 w-3 text-gray-400" />
                              {new Date(user.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem asChild>
                                  <Link href={`/admin/users/${user.id}/edit`} className="flex items-center">
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit User
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/admin/users/${user.id}`} className="flex items-center">
                                    <UserCheck className="mr-2 h-4 w-4" />
                                    View Profile
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => user.status === 'active' ? handleDeactivate(user.id) : handleActivate(user.id)}
                                  className={user.status === 'active' ? 'text-red-600' : 'text-green-600'}
                                >
                                  {user.status === 'active' ? (
                                    <>
                                      <UserX className="mr-2 h-4 w-4" />
                                      Deactivate
                                    </>
                                  ) : (
                                    <>
                                      <UserCheck className="mr-2 h-4 w-4" />
                                      Activate
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDelete(user.id)}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete User
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {!loading && users.length > 0 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100">
                  <p className="text-sm text-gray-500 font-medium">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl"
                      disabled={pagination.page === 1}
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl"
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl shadow-gray-200/40 rounded-[2.5rem] bg-gray-900 text-white">
            <CardHeader className="p-8">
              <CardTitle className="text-xl font-black flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Active Rate</p>
                <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#004D20] rounded-full transition-all duration-1000"
                    style={{ width: `${stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1 font-medium">
                  {stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}% of total users
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Learners</span>
                  <span className="font-bold text-blue-400">{stats.totalLearners}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Tutors</span>
                  <span className="font-bold text-emerald-400">{stats.totalTutors}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Admins</span>
                  <span className="font-bold text-purple-400">{stats.totalAdmins}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Super Admins</span>
                  <span className="font-bold text-[#004D20]">{stats.totalSuperAdmins}</span>
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <Link href="/admin/users/create" className="block">
                  <Button className="w-full rounded-2xl h-12 bg-[#004D20] hover:bg-[#003D1A] gap-2">
                    <Plus className="h-4 w-4" />
                    Create User
                  </Button>
                </Link>
                <Link href="/admin/users" className="block">
                  <Button variant="outline" className="w-full rounded-2xl h-12 border-gray-700 text-gray-300 hover:bg-gray-800 gap-2">
                    <Users className="h-4 w-4" />
                    Manage Users
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ title, value, description, icon, color }: { title: string; value: string | number; description: string; icon: React.ReactNode; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
    green: 'bg-green-50 text-green-600',
  };

  return (
    <Card className="border-none shadow-lg shadow-gray-100 rounded-3xl overflow-hidden hover:scale-[1.02] transition-transform duration-300">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${colors[color]}`}>
            {icon}
          </div>
          <div>
            <div className="text-2xl font-black text-gray-900">{value}</div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5">{title}</p>
            <p className="text-[10px] text-gray-400 font-medium mt-1">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
