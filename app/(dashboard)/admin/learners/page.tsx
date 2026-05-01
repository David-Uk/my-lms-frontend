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
  Filter
} from 'lucide-react';
import type { User, PaginationParams } from '@/types';

interface LearnerStats {
  totalLearners: number;
  activeLearners: number;
  newLearnersThisMonth: number;
  completionRate: number;
}

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
  const [stats, setStats] = useState<LearnerStats | null>(null);

  useEffect(() => {
    fetchLearners();
    fetchLearnerStats();
  }, [pagination.page, searchQuery]);

  const fetchLearnerStats = async () => {
    try {
      const data = await api.get<LearnerStats>('/stats/learners');
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch learner stats:', error);
    }
  };

  const fetchLearners = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        role: 'learner',
      });
      if (searchQuery) params.append('search', searchQuery);

      const response = await api.get<{ users: User[]; total: number; totalPages: number }>(`/users?${params.toString()}`);
      setLearners(response.users);
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

  const handleDeactivate = async (userId: string) => {
    if (!confirm('Are you sure you want to deactivate this learner?')) return;
    try {
      await api.patch(`/users/${userId}/deactivate`);
      fetchLearners();
    } catch (error) {
      console.error('Failed to deactivate learner:', error);
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Learners</h1>
            <p className="text-gray-500">Manage enrolled students and their progress</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/learners/enroll">
              <Button>
                <GraduationCap className="h-4 w-4 mr-2" />
                Enroll New Learner
              </Button>
            </Link>
            <Link href="/admin/learners/bulk-enroll">
              <Button variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Bulk Enroll
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="py-4">
              <p className="text-2xl font-bold text-gray-900">{stats?.totalLearners || pagination.total}</p>
              <p className="text-sm text-gray-500">Total Learners</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <p className="text-2xl font-bold text-green-600">{stats?.activeLearners || learners.filter(l => l.status === 'active').length}</p>
              <p className="text-sm text-gray-500">Active</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <p className="text-2xl font-bold text-blue-600">{stats?.newLearnersThisMonth || 0}</p>
              <p className="text-sm text-gray-500">New This Month</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <p className="text-2xl font-bold text-purple-600">{stats?.completionRate || 0}%</p>
              <p className="text-sm text-gray-500">Avg. Completion</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search learners by name or email..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Learners Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Learners</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            ) : learners.length === 0 ? (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No learners found</h3>
                <p className="mt-1 text-gray-500">Get started by enrolling your first learner.</p>
                <Link href="/admin/learners/enroll">
                  <Button className="mt-4">Enroll Learner</Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="py-3 px-4 text-left">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                          checked={selectedLearners.length === learners.length && learners.length > 0}
                          onChange={toggleSelectAll}
                        />
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Learner</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Contact</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Enrolled Courses</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Status</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Joined</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {learners.map((learner) => (
                      <tr key={learner.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300"
                            checked={selectedLearners.includes(learner.id)}
                            onChange={() => toggleSelect(learner.id)}
                          />
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {learner.firstName[0]}{learner.lastName[0]}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{learner.firstName} {learner.lastName}</p>
                              <p className="text-sm text-gray-500">{learner.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Mail className="h-3 w-3" />
                              {learner.email}
                            </div>
                            {learner.phoneNumber && (
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Phone className="h-3 w-3" />
                                {learner.phoneNumber}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-500">-</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${learner.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : learner.status === 'suspended'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-700'
                            }`}>
                            {learner.status.charAt(0).toUpperCase() + learner.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Calendar className="h-3 w-3" />
                            {new Date(learner.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <Link href={`/admin/learners/${learner.id}`}>
                              <Button variant="ghost" size="sm">View</Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeactivate(learner.id)}
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

            {/* Pagination */}
            {!loading && learners.length > 0 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} learners
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page === 1}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
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
      </div>
    </DashboardLayout>
  );
}
