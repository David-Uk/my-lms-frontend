'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import {
  Users,
  Search,
  GraduationCap,
  BookOpen,
  Mail,
  Phone,
  Calendar,
  Filter,
  UserCheck,
  UserX,
  Sparkles,
  Activity,
  TrendingUp
} from 'lucide-react';
import type { User, PaginatedResponse } from '@/types';

export default function LearnersPage() {
  const [learners, setLearners] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [selectedLearners, setSelectedLearners] = useState<string[]>([]);

  const fetchLearners = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        role: 'learner',
      });
      if (searchQuery) params.append('search', searchQuery);

      const response = await api.get<PaginatedResponse<User>>(`/users?${params.toString()}`);
      setLearners(response.data);
      setPagination(prev => ({
        ...prev,
        total: response.total,
        totalPages: response.totalPages,
      }));
    } catch (error) {
      console.error('Failed to fetch learners:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLearners();
  }, [pagination.page, searchQuery]);

  const handleDeactivate = async (userId: string) => {
    if (!confirm('Are you sure you want to deactivate this learner?')) return;
    try {
      await api.patch(`/users/${userId}`, { status: 'inactive' });
      fetchLearners();
    } catch (error) {
      console.error('Failed to deactivate learner:', error);
    }
  };

  const handleActivate = async (userId: string) => {
    try {
      await api.patch(`/users/${userId}`, { status: 'active' });
      fetchLearners();
    } catch (error) {
      console.error('Failed to activate learner:', error);
    }
  };

  const toggleSelectAll = () => {
    if (selectedLearners.length === learners.length) {
      setSelectedLearners([]);
    } else {
      setSelectedLearners(learners.map(l => l.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedLearners(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const activeLearners = learners.filter(l => l.status === 'active').length;

  return (
    <DashboardLayout>
      <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-1000">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-emerald-50 rounded-3xl shadow-lg shadow-emerald-100">
              <GraduationCap className="h-8 w-8 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight">Learners</h1>
              <p className="text-gray-500 font-medium mt-1">Manage enrolled students and their progress</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">System Active</span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Learners"
            value={loading ? '—' : pagination.total}
            description="Enrolled students"
            icon={<Users className="h-5 w-5 text-emerald-600" />}
            color="emerald"
          />
          <StatCard
            title="Active"
            value={loading ? '—' : activeLearners}
            description="Currently learning"
            icon={<UserCheck className="h-5 w-5 text-green-600" />}
            color="green"
          />
          <StatCard
            title="Inactive"
            value={loading ? '—' : (pagination.total - activeLearners)}
            description="Paused accounts"
            icon={<UserX className="h-5 w-5 text-orange-600" />}
            color="orange"
          />
          <StatCard
            title="On This Page"
            value={loading ? '—' : learners.length}
            description="Currently viewing"
            icon={<Activity className="h-5 w-5 text-blue-600" />}
            color="blue"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 border-none shadow-2xl shadow-gray-200/50 rounded-[2.5rem] overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 p-8">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-emerald-500" />
                <CardTitle className="text-xl font-black">Learner Directory</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search learners by name or email..."
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-medium"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" className="gap-2 rounded-2xl h-12 px-6 border-gray-200 hover:border-emerald-500 hover:bg-emerald-50">
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
              </div>

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
                </div>
              ) : learners.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-gray-300" />
                  <h3 className="mt-4 text-lg font-bold text-gray-900">No learners found</h3>
                  <p className="mt-1 text-gray-500">Get started by enrolling your first learner.</p>
                  <Link href="/admin/learners/enroll">
                    <Button className="mt-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700">Enroll Learner</Button>
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
                            checked={selectedLearners.length === learners.length && learners.length > 0}
                            onChange={toggleSelectAll}
                          />
                        </th>
                        <th className="py-4 px-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Learner</th>
                        <th className="py-4 px-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Contact</th>
                        <th className="py-4 px-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Enrolled</th>
                        <th className="py-4 px-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                        <th className="py-4 px-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Joined</th>
                        <th className="py-4 px-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {learners.map((learner) => (
                        <tr key={learner.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="py-4 px-4">
                            <input
                              type="checkbox"
                              className="rounded border-gray-300"
                              checked={selectedLearners.includes(learner.id)}
                              onChange={() => toggleSelect(learner.id)}
                            />
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                                {learner.firstName[0]}{learner.lastName[0]}
                              </div>
                              <div>
                                <p className="font-bold text-gray-900">{learner.firstName} {learner.lastName}</p>
                                <p className="text-xs text-gray-500">{learner.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Mail className="h-3 w-3 text-gray-400" />
                                <span className="truncate max-w-[150px]">{learner.email}</span>
                              </div>
                              {learner.phoneNumber && (
                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                  <Phone className="h-3 w-3 text-gray-400" />
                                  {learner.phoneNumber}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <BookOpen className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-500">—</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${learner.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                            }`}>
                              {learner.status.charAt(0).toUpperCase() + learner.status.slice(1)}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Calendar className="h-3 w-3 text-gray-400" />
                              {new Date(learner.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <Link href={`/admin/learners/${learner.id}`}>
                                <Button variant="ghost" size="sm" className="rounded-xl">View</Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="sm"
                                className={`rounded-xl ${learner.status === 'active' ? 'text-red-600 hover:text-red-700 hover:bg-red-50' : 'text-green-600 hover:text-green-700 hover:bg-green-50'}`}
                                onClick={() => learner.status === 'active' ? handleDeactivate(learner.id) : handleActivate(learner.id)}
                              >
                                {learner.status === 'active' ? 'Deactivate' : 'Activate'}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {!loading && learners.length > 0 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100">
                  <p className="text-sm text-gray-500 font-medium">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} learners
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
                    className="h-full bg-emerald-500 rounded-full transition-all duration-1000" 
                    style={{ width: `${pagination.total > 0 ? Math.round((activeLearners / pagination.total) * 100) : 0}%` }} 
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1 font-medium">
                  {pagination.total > 0 ? Math.round((activeLearners / pagination.total) * 100) : 0}% of total learners
                </p>
              </div>

              <div className="pt-4 space-y-3">
                <Link href="/admin/learners/enroll" className="block">
                  <Button className="w-full rounded-2xl h-12 bg-emerald-600 hover:bg-emerald-700 gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Enroll New Learner
                  </Button>
                </Link>
                <Link href="/admin/learners/bulk-enroll" className="block">
                  <Button variant="outline" className="w-full rounded-2xl h-12 border-gray-700 text-gray-300 hover:bg-gray-800 gap-2">
                    <Users className="h-4 w-4" />
                    Bulk Enroll
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
    emerald: 'bg-emerald-50 text-emerald-600',
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
