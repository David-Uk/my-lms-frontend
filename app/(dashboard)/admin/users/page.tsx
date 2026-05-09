'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import type { User } from '@/types';
import { StatCard } from '@/components/dashboard/stat-card';
import {
  Users,
  Search,
  Plus,
  Crown,
  Shield,
  BookOpen,
  GraduationCap,
  Calendar,
  MoreHorizontal,
  Trash2,
  UserCheck,
  UserX,
  Filter,
  TrendingUp,
  Sparkles,
  Pencil,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  X
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface FilterState {
  role: string[];
  status: string[];
  search: string;
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    role: [],
    status: [],
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'DESC',
  });
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAdmins: 0,
    totalTutors: 0,
    totalLearners: 0,
    activeUsers: 0,
  });

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (filters.search) params.append('search', filters.search);
      if (filters.role.length > 0) params.append('role', filters.role.join(','));
      if (filters.status.length > 0) params.append('status', filters.status.join(','));
      params.append('sortBy', filters.sortBy);
      params.append('sortOrder', filters.sortOrder);

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
  }, [pagination.page, pagination.limit, filters]);

  const fetchStats = async () => {
    try {
      const [adminsRes, tutorsRes, learnersRes, allUsersRes] = await Promise.allSettled([
        api.get<{ total?: number; meta?: { total: number } }>('/users?role=admin&limit=1'),
        api.get<{ total?: number; meta?: { total: number } }>('/users?role=tutor&limit=1'),
        api.get<{ total?: number; meta?: { total: number } }>('/users?role=learner&limit=1'),
        api.get<{ total?: number; meta?: { total: number } }>('/users?limit=1'),
      ]);

      setStats({
        totalUsers: allUsersRes.status === 'fulfilled' ? (allUsersRes.value.total || allUsersRes.value.meta?.total || 0) : 0,
        totalAdmins: adminsRes.status === 'fulfilled' ? (adminsRes.value.total || adminsRes.value.meta?.total || 0) : 0,
        totalTutors: tutorsRes.status === 'fulfilled' ? (tutorsRes.value.total || tutorsRes.value.meta?.total || 0) : 0,
        totalLearners: learnersRes.status === 'fulfilled' ? (learnersRes.value.total || learnersRes.value.meta?.total || 0) : 0,
        activeUsers: users.filter(u => u.status === 'active').length,
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

  const toggleRoleFilter = (role: string) => {
    setFilters(prev => ({
      ...prev,
      role: prev.role.includes(role)
        ? prev.role.filter(r => r !== role)
        : [...prev.role, role]
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const toggleStatusFilter = (status: string) => {
    setFilters(prev => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter(s => s !== status)
        : [...prev.status, status]
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ role: [], status: [], search: '', sortBy: 'createdAt', sortOrder: 'DESC' });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSort = (column: string) => {
    setFilters(prev => ({
      ...prev,
      sortBy: column,
      sortOrder: prev.sortBy === column && prev.sortOrder === 'ASC' ? 'DESC' : 'ASC'
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const hasActiveFilters = filters.role.length > 0 || filters.status.length > 0 || filters.search.length > 0;

  const getRoleBadge = (role: string) => {
    const roleConfig: Record<string, { bg: string; icon: React.ReactNode; label: string }> = {
      superadmin: { bg: 'bg-[#004D20] text-white', icon: <Crown className="h-3 w-3 mr-1" />, label: 'Super Admin' },
      admin: { bg: 'bg-blue-100 text-blue-800', icon: <Shield className="h-3 w-3 mr-1" />, label: 'Admin' },
      tutor: { bg: 'bg-emerald-100 text-emerald-800', icon: <BookOpen className="h-3 w-3 mr-1" />, label: 'Tutor' },
      learner: { bg: 'bg-purple-100 text-purple-800', icon: <GraduationCap className="h-3 w-3 mr-1" />, label: 'Learner' },
    };
    const config = roleConfig[role] || roleConfig.learner;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${config.bg}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  const activeUsers = users.filter(u => u.status === 'active').length;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-1000">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-blue-50 rounded-3xl shadow-lg">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight">User Management</h1>
              <p className="text-gray-500 font-medium mt-1">Manage all system users</p>
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
            title="Admins"
            value={loading ? '—' : stats.totalAdmins}
            description="Administrators"
            icon={<Shield className="h-5 w-5 text-purple-600" />}
            color="purple"
          />
          <StatCard
            title="Tutors"
            value={loading ? '—' : stats.totalTutors}
            description="Instructors"
            icon={<BookOpen className="h-5 w-5 text-emerald-600" />}
            color="emerald"
          />
          <StatCard
            title="Learners"
            value={loading ? '—' : stats.totalLearners}
            description="Students"
            icon={<GraduationCap className="h-5 w-5 text-orange-600" />}
            color="orange"
          />
          <StatCard
            title="Active"
            value={loading ? '—' : activeUsers}
            description="Currently active"
            icon={<UserCheck className="h-5 w-5 text-green-600" />}
            color="green"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 border-none shadow-2xl shadow-gray-200/50 rounded-[2.5rem] overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-xl font-black">All Users</CardTitle>
                </div>
                <Link href="/admin/users/create">
                  <Button className="rounded-2xl bg-blue-600 hover:bg-blue-700 gap-2">
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
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                    value={filters.search}
                    onChange={(e) => {
                      setFilters(prev => ({ ...prev, search: e.target.value }));
                      setPagination(prev => ({ ...prev, page: 1 }));
                    }}
                  />
                </div>

                <DropdownMenu open={showFilterMenu} onOpenChange={setShowFilterMenu}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className={`gap-2 rounded-2xl h-12 px-6 border-gray-200 hover:border-blue-500 hover:bg-blue-50 ${hasActiveFilters ? 'border-blue-500 bg-blue-50 text-blue-600' : ''}`}
                    >
                      <Filter className="h-4 w-4" />
                      Filters
                      {hasActiveFilters && (
                        <span className="ml-1 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                          {filters.role.length + filters.status.length}
                        </span>
                      )}
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-72 p-4">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-bold text-gray-900 mb-2">Role</p>
                        <div className="flex flex-wrap gap-2">
                          {['admin', 'tutor', 'learner'].map((role) => (
                            <button
                              key={role}
                              onClick={() => toggleRoleFilter(role)}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                filters.role.includes(role)
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {role.charAt(0).toUpperCase() + role.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-bold text-gray-900 mb-2">Status</p>
                        <div className="flex flex-wrap gap-2">
                          {['active', 'inactive'].map((status) => (
                            <button
                              key={status}
                              onClick={() => toggleStatusFilter(status)}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                filters.status.includes(status)
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>

                      {hasActiveFilters && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearFilters}
                          className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Clear All Filters
                        </Button>
                      )}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {hasActiveFilters && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {filters.role.map((role) => (
                    <span key={role} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                      <button onClick={() => toggleRoleFilter(role)} className="hover:text-blue-600">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  {filters.status.map((status) => (
                    <span key={status} className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                      <button onClick={() => toggleStatusFilter(status)} className="hover:text-green-600">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-gray-300" />
                  <h3 className="mt-4 text-lg font-bold text-gray-900">No users found</h3>
                  <p className="mt-1 text-gray-500">
                    {hasActiveFilters ? 'Try adjusting your filters.' : 'Get started by creating your first user.'}
                  </p>
                  {hasActiveFilters ? (
                    <Button onClick={clearFilters} className="mt-4 rounded-2xl bg-blue-600">
                      Clear Filters
                    </Button>
                  ) : (
                    <Link href="/admin/users/create">
                      <Button className="mt-4 rounded-2xl bg-blue-600">Create User</Button>
                    </Link>
                  )}
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
                        <th className="py-4 px-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-600 transition-colors" onClick={() => handleSort('firstName')}>
                          <div className="flex items-center gap-1">
                            User
                            {filters.sortBy === 'firstName' ? (
                              filters.sortOrder === 'ASC' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                            ) : (
                              <ArrowUpDown className="h-3 w-3 opacity-0 group-hover:opacity-100" />
                            )}
                          </div>
                        </th>
                        <th className="py-4 px-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-600 transition-colors" onClick={() => handleSort('role')}>
                          <div className="flex items-center gap-1">
                            Role
                            {filters.sortBy === 'role' ? (
                              filters.sortOrder === 'ASC' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                            ) : (
                              <ArrowUpDown className="h-3 w-3" />
                            )}
                          </div>
                        </th>
                        <th className="py-4 px-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-600 transition-colors" onClick={() => handleSort('status')}>
                          <div className="flex items-center gap-1">
                            Status
                            {filters.sortBy === 'status' ? (
                              filters.sortOrder === 'ASC' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                            ) : (
                              <ArrowUpDown className="h-3 w-3" />
                            )}
                          </div>
                        </th>
                        <th className="py-4 px-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-600 transition-colors" onClick={() => handleSort('createdAt')}>
                          <div className="flex items-center gap-1">
                            Joined
                            {filters.sortBy === 'createdAt' ? (
                              filters.sortOrder === 'ASC' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                            ) : (
                              <ArrowUpDown className="h-3 w-3" />
                            )}
                          </div>
                        </th>
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
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
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
                                <DropdownMenuSeparator />
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
                <TrendingUp className="h-5 w-5 text-blue-400" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Active Rate</p>
                <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                    style={{ width: `${users.length > 0 ? Math.round((activeUsers / users.length) * 100) : 0}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1 font-medium">
                  {users.length > 0 ? Math.round((activeUsers / users.length) * 100) : 0}% of displayed users
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Admins</span>
                  <span className="font-bold text-purple-400">{stats.totalAdmins}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Tutors</span>
                  <span className="font-bold text-emerald-400">{stats.totalTutors}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Learners</span>
                  <span className="font-bold text-orange-400">{stats.totalLearners}</span>
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <Link href="/admin/users/create" className="block">
                  <Button className="w-full rounded-2xl h-12 bg-blue-600 hover:bg-blue-700 gap-2">
                    <Plus className="h-4 w-4" />
                    Create User
                  </Button>
                </Link>
                <Link href="/admin/learners" className="block">
                  <Button variant="outline" className="w-full rounded-2xl h-12 border-gray-700 text-gray-300 hover:bg-gray-800 gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Manage Learners
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
      </div>
    </div>
  );
}

