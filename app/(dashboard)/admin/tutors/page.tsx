'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import {
  GraduationCap,
  Search,
  BookOpen,
  Mail,
  Phone,
  Calendar,
  Filter,
  Plus,
  UserCheck,
  UserX,
  Sparkles,
  Activity,
  TrendingUp,
  Users
} from 'lucide-react';
import type { User, PaginatedResponse } from '@/types';

export default function TutorsPage() {
  const [tutors, setTutors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [selectedTutors, setSelectedTutors] = useState<string[]>([]);

  const fetchTutors = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        role: 'tutor',
      });
      if (searchQuery) params.append('search', searchQuery);

      const response = await api.get<PaginatedResponse<User>>(`/users?${params.toString()}`);
      
      setTutors(response.data);
      setPagination(prev => ({
        ...prev,
        total: response.total,
        totalPages: response.totalPages,
      }));
    } catch (error) {
      console.error('Failed to fetch tutors:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchQuery]);

  useEffect(() => {
    fetchTutors();
  }, [fetchTutors]);

  const handleDeactivate = async (userId: string) => {
    if (!confirm('Are you sure you want to deactivate this tutor?')) return;
    try {
      await api.patch(`/users/${userId}`, { status: 'inactive' });
      fetchTutors();
    } catch (error) {
      console.error('Failed to deactivate tutor:', error);
    }
  };

  const handleActivate = async (userId: string) => {
    try {
      await api.patch(`/users/${userId}`, { status: 'active' });
      fetchTutors();
    } catch (error) {
      console.error('Failed to activate tutor:', error);
    }
  };

  const toggleSelectAll = () => {
    if (selectedTutors.length === tutors.length) {
      setSelectedTutors([]);
    } else {
      setSelectedTutors(tutors.map(t => t.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedTutors(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const activeTutors = tutors.filter(t => t.status === 'active').length;

  return (
    <DashboardLayout>
      <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-1000">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-purple-50 rounded-3xl shadow-lg shadow-purple-100">
              <GraduationCap className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight">Tutors</h1>
              <p className="text-gray-500 font-medium mt-1">Manage instructors and their course assignments</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">System Active</span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Tutors"
            value={loading ? '—' : pagination.total}
            description="Instructors"
            icon={<Users className="h-5 w-5 text-purple-600" />}
            color="purple"
          />
          <StatCard
            title="Active"
            value={loading ? '—' : activeTutors}
            description="Currently teaching"
            icon={<UserCheck className="h-5 w-5 text-green-600" />}
            color="green"
          />
          <StatCard
            title="Inactive"
            value={loading ? '—' : (pagination.total - activeTutors)}
            description="Paused accounts"
            icon={<UserX className="h-5 w-5 text-orange-600" />}
            color="orange"
          />
          <StatCard
            title="On This Page"
            value={loading ? '—' : tutors.length}
            description="Currently viewing"
            icon={<Activity className="h-5 w-5 text-blue-600" />}
            color="blue"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 border-none shadow-2xl shadow-gray-200/50 rounded-[2.5rem] overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 p-8">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-purple-500" />
                <CardTitle className="text-xl font-black">Tutor Directory</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search tutors by name or email..."
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-medium"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" className="gap-2 rounded-2xl h-12 px-6 border-gray-200 hover:border-purple-500 hover:bg-purple-50">
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
              </div>

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
                </div>
              ) : tutors.length === 0 ? (
                <div className="text-center py-12">
                  <GraduationCap className="mx-auto h-12 w-12 text-gray-300" />
                  <h3 className="mt-4 text-lg font-bold text-gray-900">No tutors found</h3>
                  <p className="mt-1 text-gray-500">Get started by inviting your first tutor.</p>
                  <Link href="/admin/tutors/invite">
                    <Button className="mt-4 rounded-2xl bg-purple-600 hover:bg-purple-700">Invite Tutor</Button>
                  </Link>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {tutors.map((tutor) => (
                    <div key={tutor.id} className="bg-gray-50/50 rounded-3xl p-6 hover:bg-gray-100/50 transition-colors border border-gray-100">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                            {tutor.firstName[0]}{tutor.lastName[0]}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900">{tutor.firstName} {tutor.lastName}</h3>
                            <p className="text-sm text-gray-500">{tutor.email}</p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                          checked={selectedTutors.includes(tutor.id)}
                          onChange={() => toggleSelect(tutor.id)}
                        />
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="h-4 w-4 text-gray-400" />
                          {tutor.email}
                        </div>
                        {tutor.phoneNumber && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="h-4 w-4 text-gray-400" />
                            {tutor.phoneNumber}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          Joined {new Date(tutor.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${tutor.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                          }`}>
                          {tutor.status.charAt(0).toUpperCase() + tutor.status.slice(1)}
                        </span>
                        <div className="flex gap-1">
                          <Link href={`/admin/tutors/${tutor.id}`}>
                            <Button variant="ghost" size="sm" className="rounded-xl h-8">View</Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`rounded-xl h-8 ${tutor.status === 'active' ? 'text-red-600 hover:text-red-700 hover:bg-red-50' : 'text-green-600 hover:text-green-700 hover:bg-green-50'}`}
                            onClick={() => tutor.status === 'active' ? handleDeactivate(tutor.id) : handleActivate(tutor.id)}
                          >
                            {tutor.status === 'active' ? 'Deactivate' : 'Activate'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!loading && tutors.length > 0 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100">
                  <p className="text-sm text-gray-500 font-medium">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} tutors
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
                <TrendingUp className="h-5 w-5 text-purple-400" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Active Rate</p>
                <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 rounded-full transition-all duration-1000" 
                    style={{ width: `${pagination.total > 0 ? Math.round((activeTutors / pagination.total) * 100) : 0}%` }} 
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1 font-medium">
                  {pagination.total > 0 ? Math.round((activeTutors / pagination.total) * 100) : 0}% of total tutors
                </p>
              </div>

              <div className="pt-4 space-y-3">
                <Link href="/admin/tutors/invite" className="block">
                  <Button className="w-full rounded-2xl h-12 bg-purple-600 hover:bg-purple-700 gap-2">
                    <Plus className="h-4 w-4" />
                    Invite Tutor
                  </Button>
                </Link>
                <Link href="/admin/tutors/assignments" className="block">
                  <Button variant="outline" className="w-full rounded-2xl h-12 border-gray-700 text-gray-300 hover:bg-gray-800 gap-2">
                    <BookOpen className="h-4 w-4" />
                    Course Assignments
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
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    blue: 'bg-blue-50 text-blue-600',
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
