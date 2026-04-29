'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, BookOpen, GraduationCap, Award, ArrowRight, Sparkles, TrendingUp, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

        // Fetch learner count
        const learnersRes = await api.get<PaginatedResponse<User>>('/users?page=1&limit=1&role=learner').catch(() => null);
        const totalLearners = learnersRes
          ? (learnersRes.total || learnersRes.meta?.total || 0)
          : 0;

        // Fetch tutor count
        const tutorsRes = await api.get<PaginatedResponse<User>>('/users?page=1&limit=1&role=tutor').catch(() => null);
        const totalTutors = tutorsRes
          ? (tutorsRes.total || tutorsRes.meta?.total || 0)
          : 0;

        setStats({
          totalUsers,
          totalCourses,
          totalLearners,
          totalTutors,
          activeUsers: totalUsers, // all fetched users are in the system
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
    <DashboardLayout>
      <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-1000">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">System Overview</h1>
            <p className="text-gray-500 font-medium mt-1">Welcome back. Here is what&apos;s happening across the platform.</p>
          </div>
          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">System Live</span>
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Users"
            value={loading ? '—' : formatNumber(stats.totalUsers)}
            description="Active accounts"
            color="blue"
            icon={<Users className="h-6 w-6" />}
            loading={loading}
          />
          <StatCard
            title="Courses"
            value={loading ? '—' : formatNumber(stats.totalCourses)}
            description="Active catalogs"
            color="indigo"
            icon={<BookOpen className="h-6 w-6" />}
            loading={loading}
          />
          <StatCard
            title="Learners"
            value={loading ? '—' : formatNumber(stats.totalLearners)}
            description="Enrolled students"
            color="emerald"
            icon={<GraduationCap className="h-6 w-6" />}
            loading={loading}
          />
          <StatCard
            title="Tutors"
            value={loading ? '—' : formatNumber(stats.totalTutors)}
            description="Instructors"
            color="orange"
            icon={<Activity className="h-6 w-6" />}
            loading={loading}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <Card className="lg:col-span-2 border-none shadow-2xl shadow-gray-200/50 rounded-[2.5rem] overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 p-8">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-blue-500" />
                <CardTitle className="text-xl font-black">Intelligent Actions</CardTitle>
              </div>
              <CardDescription className="font-medium">Streamline your administrative workflow</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid sm:grid-cols-2 gap-4">
                <QuickActionLink
                  href="/admin/users/create"
                  title="Onboard User"
                  description="Add new staff or students"
                  icon={<Users className="h-5 w-5" />}
                  color="blue"
                />
                <QuickActionLink
                  href="/admin/courses/create"
                  title="Launch Course"
                  description="Create new learning path"
                  icon={<BookOpen className="h-5 w-5" />}
                  color="indigo"
                />
                <QuickActionLink
                  href="/admin/ai-performance"
                  title="AI Insights"
                  description="Run predictive analytics"
                  icon={<Award className="h-5 w-5" />}
                  color="purple"
                />
                <QuickActionLink
                  href="/admin/courses"
                  title="Manage Content"
                  description="Edit existing curriculum"
                  icon={<Activity className="h-5 w-5" />}
                  color="emerald"
                />
              </div>
            </CardContent>
          </Card>

          {/* Platform Summary */}
          <Card className="border-none shadow-xl shadow-gray-200/40 rounded-[2.5rem] bg-gray-900 text-white">
            <CardHeader className="p-8">
              <CardTitle className="text-xl font-black flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-400" />
                Platform Health
              </CardTitle>
              <CardDescription className="text-gray-400 font-medium">Real-time system metrics</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <div className="space-y-6">
                <TrendItem
                  label="Users"
                  val={stats.totalUsers}
                  maxVal={Math.max(stats.totalUsers, 1)}
                  color="bg-blue-500"
                  loading={loading}
                />
                <TrendItem
                  label="Courses"
                  val={stats.totalCourses}
                  maxVal={Math.max(stats.totalUsers, 1)}
                  color="bg-emerald-500"
                  loading={loading}
                />
                <TrendItem
                  label="Learners"
                  val={stats.totalLearners}
                  maxVal={Math.max(stats.totalUsers, 1)}
                  color="bg-purple-500"
                  loading={loading}
                />
                <div className="pt-4">
                  <Link href="/admin/users">
                    <Button variant="outline" className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white rounded-2xl h-12">
                      View All Users
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ title, value, description, icon, color, loading }: any) {
  const colors: any = {
    blue: 'from-blue-500 to-blue-600 shadow-blue-100 text-blue-600 bg-blue-50',
    indigo: 'from-indigo-500 to-indigo-600 shadow-indigo-100 text-indigo-600 bg-indigo-50',
    emerald: 'from-emerald-500 to-emerald-600 shadow-emerald-100 text-emerald-600 bg-emerald-50',
    orange: 'from-orange-500 to-orange-600 shadow-orange-100 text-orange-600 bg-orange-50',
  };

  return (
    <Card className="border-none shadow-lg shadow-gray-100 rounded-3xl overflow-hidden hover:scale-[1.02] transition-transform duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-2xl ${colors[color].split(' shadow')[0]} text-white shadow-lg ${colors[color].split('text-')[0].split(' shadow-')[1]}`}>
            {icon}
          </div>
        </div>
        <div>
          {loading ? (
            <div className="h-8 w-20 bg-gray-200 rounded-lg animate-pulse mb-1" />
          ) : (
            <div className="text-3xl font-black text-gray-900">{value}</div>
          )}
          <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mt-1">{title}</p>
          <p className="text-xs text-gray-400 mt-2 font-medium">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickActionLink({ href, title, description, icon, color }: any) {
  const colors: any = {
    blue: 'bg-blue-50 text-blue-600 group-hover:bg-blue-600',
    indigo: 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600',
    purple: 'bg-purple-50 text-purple-600 group-hover:bg-purple-600',
    emerald: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600',
  };

  return (
    <Link href={href} className="group flex items-center gap-4 p-4 rounded-3xl border border-gray-100 hover:border-transparent hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300">
      <div className={`p-4 rounded-2xl transition-colors duration-300 ${colors[color]} group-hover:text-white`}>
        {icon}
      </div>
      <div className="flex-1">
        <h4 className="font-bold text-gray-900">{title}</h4>
        <p className="text-xs text-gray-500 font-medium">{description}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
    </Link>
  );
}

function TrendItem({ label, val, maxVal, color, loading }: any) {
  const percentage = maxVal > 0 ? Math.round((val / maxVal) * 100) : 0;
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-500">
        <span>{label}</span>
        <span className="text-white">{loading ? '...' : val}</span>
      </div>
      <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width: loading ? '0%' : `${Math.max(percentage, 5)}%` }} />
      </div>
    </div>
  );
}
