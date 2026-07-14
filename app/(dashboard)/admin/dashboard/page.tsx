'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, BookOpen, GraduationCap, Activity, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/dashboard/stat-card';
import { api } from '@/lib/api';
import type { User, Course, PaginatedResponse } from '@/types';

interface DashboardStats {
  totalUsers: number;
  totalCourses: number;
  totalLearners: number;
  totalTutors: number;
  activeUsers: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalCourses: 0,
    totalLearners: 0,
    totalTutors: 0,
    activeUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, coursesRes] = await Promise.allSettled([
          api.get<PaginatedResponse<User>>('/users?page=1&limit=1'),
          api.get<PaginatedResponse<Course>>('/courses?page=1&limit=1'),
        ]);

        const totalUsers = usersRes.status === 'fulfilled'
          ? (usersRes.value.total || usersRes.value.meta?.total || 0)
          : 0;
        const totalCourses = coursesRes.status === 'fulfilled'
          ? (coursesRes.value.total || coursesRes.value.meta?.total || 0)
          : 0;

        const learnersRes = await api.get<PaginatedResponse<User>>('/users?page=1&limit=1&role=learner').catch(() => null);
        const totalLearners = learnersRes
          ? (learnersRes.total || learnersRes.meta?.total || 0)
          : 0;

        const tutorsRes = await api.get<PaginatedResponse<User>>('/users?page=1&limit=1&role=tutor').catch(() => null);
        const totalTutors = tutorsRes
          ? (tutorsRes.total || tutorsRes.meta?.total || 0)
          : 0;

        setStats({
          totalUsers,
          totalCourses,
          totalLearners,
          totalTutors,
          activeUsers: totalUsers,
        });
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Overview</h1>
        <p className="text-sm text-gray-500 mt-0.5">Welcome back. Here&apos;s the platform status.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={loading ? '—' : formatNumber(stats.totalUsers)}
          description="Active accounts"
          color="blue"
          icon={<Users className="h-5 w-5" />}
          loading={loading}
        />
        <StatCard
          title="Courses"
          value={loading ? '—' : formatNumber(stats.totalCourses)}
          description="Active catalogs"
          color="emerald"
          icon={<BookOpen className="h-5 w-5" />}
          loading={loading}
        />
        <StatCard
          title="Learners"
          value={loading ? '—' : formatNumber(stats.totalLearners)}
          description="Enrolled students"
          color="purple"
          icon={<GraduationCap className="h-5 w-5" />}
          loading={loading}
        />
        <StatCard
          title="Tutors"
          value={loading ? '—' : formatNumber(stats.totalTutors)}
          description="Instructors"
          color="orange"
          icon={<Activity className="h-5 w-5" />}
          loading={loading}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-gray-400" />
              <CardTitle>Quick Actions</CardTitle>
            </div>
            <CardDescription>Streamline your administrative workflow</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-3">
              <QuickActionLink
                href="/admin/users/create"
                title="Add User"
                description="Onboard new staff or students"
                color="blue"
              />
              <QuickActionLink
                href="/admin/courses/create"
                title="New Course"
                description="Create a new learning path"
                color="indigo"
              />
              <QuickActionLink
                href="/admin/ai-performance"
                title="AI Insights"
                description="View predictive analytics"
                color="purple"
              />
              <QuickActionLink
                href="/admin/courses"
                title="Manage Content"
                description="Edit existing curriculum"
                color="emerald"
              />
            </div>
          </CardContent>
        </Card>

        {/* Platform Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Health</CardTitle>
            <CardDescription>System metrics overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <TrendItem
                label="Users"
                value={stats.totalUsers}
                maxValue={Math.max(stats.totalUsers, 1)}
                loading={loading}
              />
              <TrendItem
                label="Courses"
                value={stats.totalCourses}
                maxValue={Math.max(stats.totalUsers, 1)}
                loading={loading}
              />
              <TrendItem
                label="Learners"
                value={stats.totalLearners}
                maxValue={Math.max(stats.totalUsers, 1)}
                loading={loading}
              />
              <div className="pt-2">
                <Link href="/admin/users">
                  <Button variant="outline" className="w-full">
                    View All Users
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function QuickActionLink({ href, title, description, color }: { href: string; title: string; description: string; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
    indigo: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100',
    purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
    emerald: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100',
  };

  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors group"
    >
      <div className={`p-2 rounded-lg ${colors[color]} transition-colors`}>
        <ArrowRight className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-xs text-gray-500 truncate">{description}</p>
      </div>
    </Link>
  );
}

function TrendItem({ label, value, maxValue, loading }: { label: string; value: number; maxValue: number; loading: boolean }) {
  const percentage = maxValue > 0 ? Math.round((value / maxValue) * 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="font-medium text-gray-600">{label}</span>
        <span className="text-gray-900 font-medium">{loading ? '...' : value}</span>
      </div>
      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-[var(--brand-primary)] rounded-full transition-all duration-1000"
          style={{ width: loading ? '0%' : `${Math.max(percentage, 3)}%` }}
        />
      </div>
    </div>
  );
}
