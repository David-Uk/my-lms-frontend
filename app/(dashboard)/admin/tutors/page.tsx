'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent } from '@/components/ui/card';
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
  Plus
} from 'lucide-react';
import type { User } from '@/types';

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

      const response = await api.get<any>(`/users?${params.toString()}`);
      
      // Handle different response shapes from the API
      const users = response.users || response.data || [];
      const total = response.total ?? response.meta?.total ?? 0;
      const totalPages = response.totalPages ?? response.meta?.totalPages ?? 0;
      
      setTutors(users);
      setPagination(prev => ({
        ...prev,
        total,
        totalPages,
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tutors</h1>
            <p className="text-gray-500">Manage instructors and their course assignments</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/tutors/invite">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Invite Tutor
              </Button>
            </Link>
            <Link href="/admin/tutors/assignments">
              <Button variant="outline">
                <BookOpen className="h-4 w-4 mr-2" />
                Course Assignments
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="py-4">
              <p className="text-2xl font-bold text-gray-900">{loading ? '—' : pagination.total}</p>
              <p className="text-sm text-gray-500">Total Tutors</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <p className="text-2xl font-bold text-green-600">{loading ? '—' : activeTutors}</p>
              <p className="text-sm text-gray-500">Active</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <p className="text-2xl font-bold text-blue-600">{loading ? '—' : (pagination.total - activeTutors)}</p>
              <p className="text-sm text-gray-500">Inactive</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <p className="text-2xl font-bold text-purple-600">{loading ? '—' : tutors.length}</p>
              <p className="text-sm text-gray-500">On This Page</p>
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
                  placeholder="Search tutors by name or email..."
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

        {/* Tutors Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : tutors.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <GraduationCap className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No tutors found</h3>
              <p className="mt-1 text-gray-500">Get started by inviting your first tutor.</p>
              <Link href="/admin/tutors/invite">
                <Button className="mt-4">Invite Tutor</Button>
              </Link>
            </div>
          ) : (
            tutors.map((tutor) => (
              <Card key={tutor.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                        {tutor.firstName[0]}{tutor.lastName[0]}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{tutor.firstName} {tutor.lastName}</h3>
                        <p className="text-sm text-gray-500">{tutor.email}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => tutor.status === 'active' ? handleDeactivate(tutor.id) : handleActivate(tutor.id)}
                          >
                            {tutor.status === 'active' ? 'Deactivate' : 'Activate'}
                          </Button>
                        </div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                      checked={selectedTutors.includes(tutor.id)}
                      onChange={() => toggleSelect(tutor.id)}
                    />
                  </div>

                  <div className="mt-4 space-y-2">
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

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tutor.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : tutor.status === 'suspended'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                        {tutor.status.charAt(0).toUpperCase() + tutor.status.slice(1)}
                      </span>
                      {tutor.lastLoginAt && (
                        <span className="text-xs text-gray-400">
                          Last login: {new Date(tutor.lastLoginAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Link href={`/admin/tutors/${tutor.id}`} className="flex-1">
                      <Button variant="outline" className="w-full" size="sm">View Profile</Button>
                    </Link>
                    <Link href={`/admin/tutors/${tutor.id}/courses`} className="flex-1">
                      <Button variant="outline" className="w-full" size="sm">Assign Courses</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Pagination */}
        {!loading && tutors.length > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} tutors
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
      </div>
    </DashboardLayout>
  );
}
