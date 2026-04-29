'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SuperAdminLayout from '../layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Shield, BookOpen, GraduationCap, Award, ArrowRight, Sparkles, TrendingUp, Activity, Crown, AlertTriangle, Server } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useAuth } from '@/stores/auth-store';
import type { User, Course, PaginatedResponse } from '@/types';

interface SystemStats {
  totalUsers: number;
  totalCourses: number;
  totalLearners: number;
  totalTutors: number;
  totalAdmins: number;
  totalSuperAdmins: number;
  activeUsers: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
}

export default function SuperAdminDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  // Client-side role check
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (user?.role !== 'superadmin') {
      // Redirect non-superadmins to their appropriate dashboard
      const redirectUrl = user?.role === 'admin' ? '/admin/dashboard' : '/login';
      router.push(redirectUrl);
    }
  }, [user, isAuthenticated, router]);

  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    totalCourses: 0,
    totalLearners: 0,
    totalTutors: 0,
    totalAdmins: 0,
    totalSuperAdmins: 0,
    activeUsers: 0,
    systemHealth: 'healthy',
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

        // Fetch role-specific counts
        const [learnersRes, tutorsRes, adminsRes, superAdminsRes] = await Promise.allSettled([
          api.get<PaginatedResponse<User>>('/users?page=1&limit=1&role=learner'),
          api.get<PaginatedResponse<User>>('/users?page=1&limit=1&role=tutor'),
          api.get<PaginatedResponse<User>>('/users?page=1&limit=1&role=admin'),
          api.get<PaginatedResponse<User>>('/users?page=1&limit=1&role=superadmin'),
        ]);

        const totalLearners = learnersRes.status === 'fulfilled'
          ? (learnersRes.value.total || learnersRes.value.meta?.total || 0)
          : 0;
        const totalTutors = tutorsRes.status === 'fulfilled'
          ? (tutorsRes.value.total || tutorsRes.value.meta?.total || 0)
          : 0;
        const totalAdmins = adminsRes.status === 'fulfilled'
          ? (adminsRes.value.total || adminsRes.value.meta?.total || 0)
          : 0;
        const totalSuperAdmins = superAdminsRes.status === 'fulfilled'
          ? (superAdminsRes.value.total || superAdminsRes.value.meta?.total || 0)
          : 0;

        setStats({
          totalUsers,
          totalCourses,
          totalLearners,
          totalTutors,
          totalAdmins,
          totalSuperAdmins,
          activeUsers: totalUsers,
          systemHealth: 'healthy',
        });
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        // Don't redirect on error - just show empty stats
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if authenticated
    if (isAuthenticated && user?.role === 'superadmin') {
      fetchStats();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toLocaleString();
  };

  return (
    <SuperAdminLayout>
      <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-1000">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-xl shadow-orange-200">
              <Crown className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight">Super Admin</h1>
              <p className="text-gray-500 font-medium mt-1">System-wide control and oversight</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">System Healthy</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Users"
            value={loading ? '—' : formatNumber(stats.totalUsers)}
            description="All accounts"
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
            title="Admins"
            value={loading ? '—' : formatNumber(stats.totalAdmins)}
            description="System admins"
            color="purple"
            icon={<Shield className="h-6 w-6" />}
            loading={loading}
          />
          <StatCard
            title="Super Admins"
            value={loading ? '—' : formatNumber(stats.totalSuperAdmins)}
            description="Root access"
            color="amber"
            icon={<Crown className="h-6 w-6" />}
            loading={loading}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Super Admin Actions */}
          <Card className="lg:col-span-2 border-none shadow-2xl shadow-gray-200/50 rounded-[2.5rem] overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 p-8">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-amber-500" />
                <CardTitle className="text-xl font-black">Super Admin Actions</CardTitle>
              </div>
              <CardDescription className="font-medium">System-wide administrative controls</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid sm:grid-cols-2 gap-4">
                <QuickActionLink
                  href="/superadmin/admins"
                  title="Manage Admins"
                  description="Create and manage admin accounts"
                  icon={<Shield className="h-5 w-5" />}
                  color="purple"
                />
                <QuickActionLink
                  href="/admin/users/create"
                  title="Create Super Admin"
                  description="Add new super admin accounts"
                  icon={<Crown className="h-5 w-5" />}
                  color="amber"
                />
                <QuickActionLink
                  href="/admin/courses/create"
                  title="Launch Course"
                  description="Create new learning path"
                  icon={<BookOpen className="h-5 w-5" />}
                  color="indigo"
                />
                <QuickActionLink
                  href="/superadmin/system"
                  title="System Settings"
                  description="Configure global settings"
                  icon={<Server className="h-5 w-5" />}
                  color="emerald"
                />
              </div>
            </CardContent>
          </Card>

          {/* Role Distribution */}
          <Card className="border-none shadow-xl shadow-gray-200/40 rounded-[2.5rem] bg-gray-900 text-white">
            <CardHeader className="p-8">
              <CardTitle className="text-xl font-black flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-amber-400" />
                Role Distribution
              </CardTitle>
              <CardDescription className="text-gray-400 font-medium">
                User breakdown by role
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <div className="space-y-6">
                <RoleBar
                  label="Learners"
                  count={stats.totalLearners}
                  total={stats.totalUsers}
                  color="bg-blue-500"
                  loading={loading}
                />
                <RoleBar
                  label="Tutors"
                  count={stats.totalTutors}
                  total={stats.totalUsers}
                  color="bg-emerald-500"
                  loading={loading}
                />
                <RoleBar
                  label="Admins"
                  count={stats.totalAdmins}
                  total={stats.totalUsers}
                  color="bg-purple-500"
                  loading={loading}
                />
                <RoleBar
                  label="Super Admins"
                  count={stats.totalSuperAdmins}
                  total={stats.totalUsers}
                  color="bg-amber-500"
                  loading={loading}
                />
              </div>
              <div className="pt-6 mt-6 border-t border-gray-800">
                <Link href="/admin/users">
                  <Button variant="outline" className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white rounded-2xl h-12">
                    View All Users
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Alerts */}
        <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-8 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
            <CardTitle className="text-xl font-black flex items-center gap-2 text-amber-900">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              System Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-4">
              <AlertItem
                type="warning"
                title="Admin Privileges"
                description="You have full system access. Changes you make affect all users."
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </SuperAdminLayout>
  );
}

function StatCard({ title, value, description, icon, color, loading }: any) {
  const colors: any = {
    blue: 'from-blue-500 to-blue-600 shadow-blue-100 text-blue-600 bg-blue-50',
    indigo: 'from-indigo-500 to-indigo-600 shadow-indigo-100 text-indigo-600 bg-indigo-50',
    emerald: 'from-emerald-500 to-emerald-600 shadow-emerald-100 text-emerald-600 bg-emerald-50',
    orange: 'from-orange-500 to-orange-600 shadow-orange-100 text-orange-600 bg-orange-50',
    purple: 'from-purple-500 to-purple-600 shadow-purple-100 text-purple-600 bg-purple-50',
    amber: 'from-amber-500 to-amber-600 shadow-amber-100 text-amber-600 bg-amber-50',
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
    amber: 'bg-amber-50 text-amber-600 group-hover:bg-amber-600',
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
      <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
    </Link>
  );
}

function RoleBar({ label, count, total, color, loading }: any) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-500">
        <span>{label}</span>
        <span className="text-white">{loading ? '...' : count}</span>
      </div>
      <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width: loading ? '0%' : `${Math.max(percentage, 5)}%` }} />
      </div>
    </div>
  );
}

function AlertItem({ type, title, description }: any) {
  const colors = {
    warning: 'bg-amber-50 border-amber-200 text-amber-900',
    info: 'bg-blue-50 border-blue-200 text-blue-900',
    success: 'bg-green-50 border-green-200 text-green-900',
  };

  return (
    <div className={`flex gap-4 p-4 rounded-2xl border ${colors[type as keyof typeof colors]}`}>
      <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
      <div>
        <h4 className="font-bold">{title}</h4>
        <p className="text-sm opacity-80 mt-1">{description}</p>
      </div>
    </div>
  );
}
