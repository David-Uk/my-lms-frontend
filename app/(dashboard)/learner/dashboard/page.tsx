'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BookOpen, Award, Clock, Target, ArrowRight, Play, Zap, Sparkles, Loader2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

interface LearnerStats {
  totalEnrolled: number;
  activeCourses: number;
  completedCourses: number;
  averageProgress: number;
  recentEnrollments: number;
}

interface EnrolledCourse {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  difficultyLevel: string;
  progress: number;
  status: string;
  lastAccessed: string;
  cohortName: string;
}

interface LearnerDashboardData {
  stats: LearnerStats;
  enrolledCourses: EnrolledCourse[];
}

export default function LearnerDashboardPage() {
  const [data, setData] = useState<LearnerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get<LearnerDashboardData>('/stats/learner-dashboard');
      setData(response);
    } catch (error) {
      console.error('Failed to fetch learner dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatLastAccessed = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHrs < 1) return 'Just now';
    if (diffHrs < 24) return `${diffHrs} hour${diffHrs > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const getProgressGradient = (index: number) => {
    const gradients = [
      'from-blue-600 to-indigo-600',
      'from-emerald-500 to-teal-600',
      'from-purple-500 to-indigo-600',
      'from-rose-500 to-orange-600',
      'from-cyan-500 to-blue-600',
      'from-amber-500 to-orange-600',
    ];
    return gradients[index % gradients.length];
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  const stats = data?.stats || {
    totalEnrolled: 0,
    activeCourses: 0,
    completedCourses: 0,
    averageProgress: 0,
    recentEnrollments: 0,
  };

  return (
    <DashboardLayout>
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">My Journey</h1>
            <p className="text-gray-500 font-medium mt-1 text-lg">
              {stats.recentEnrollments > 0
                ? `You've enrolled in ${stats.recentEnrollments} new course${stats.recentEnrollments > 1 ? 's' : ''} this month!`
                : 'Keep learning and growing your skills.'}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white p-3 rounded-full shadow-sm border border-gray-100">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              {stats.activeCourses} Active Course{stats.activeCourses !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Enrolled"
            value={stats.totalEnrolled.toString()}
            description="Total courses"
            icon={<BookOpen className="h-5 w-5 text-blue-600" />}
            color="blue"
          />
          <StatCard
            title="Completed"
            value={stats.completedCourses.toString()}
            description="Finished courses"
            icon={<Award className="h-5 w-5 text-emerald-600" />}
            color="emerald"
          />
          <StatCard
            title="Active"
            value={stats.activeCourses.toString()}
            description="In progress"
            icon={<Clock className="h-5 w-5 text-purple-600" />}
            color="purple"
          />
          <StatCard
            title="Progress"
            value={`${stats.averageProgress}%`}
            description="Avg. completion"
            icon={<Target className="h-5 w-5 text-orange-600" />}
            color="orange"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Continue Learning */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                <Play className="h-5 w-5 text-blue-600 fill-blue-600" />
                Continue Learning
              </h2>
              <Link href="/learner/courses">
                <Button variant="ghost" className="text-blue-600 font-bold">View All Courses</Button>
              </Link>
            </div>

            {data?.enrolledCourses && data.enrolledCourses.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-6">
                {data.enrolledCourses.map((course, index) => (
                  <CourseProgressCard
                    key={course.id}
                    id={course.id}
                    title={course.title}
                    progress={course.progress}
                    lastAccessed={formatLastAccessed(course.lastAccessed)}
                    gradient={getProgressGradient(index)}
                  />
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <BookOpen className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No courses yet</h3>
                <p className="text-gray-500 mt-1">Enroll in a course to start your learning journey.</p>
                <Link href="/learner/courses" className="mt-4 inline-block">
                  <Button>Browse Courses</Button>
                </Link>
              </Card>
            )}
          </div>

          {/* Quick Actions & AI */}
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                Daily Pulse
              </h2>
            </div>

            <div className="space-y-4">
              <Link href="/learner/join-quiz" className="block group">
                <Card className="border-none shadow-lg hover:shadow-2xl hover:shadow-blue-100 transition-all duration-300 p-6 bg-gradient-to-br from-gray-900 to-black text-white rounded-3xl overflow-hidden relative">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl group-hover:bg-blue-500/40 transition-colors" />
                  <div className="relative z-10 flex items-center gap-4">
                    <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/50">
                      <Zap className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-black text-lg">Live Session</h4>
                      <p className="text-xs text-gray-400 font-medium">Join a quiz with your cohorts</p>
                    </div>
                    <ArrowRight className="ml-auto h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Card>
              </Link>

              <Link href="/learner/ai" className="block group">
                <Card className="border-none shadow-lg hover:shadow-2xl hover:shadow-purple-100 transition-all duration-300 p-6 bg-white rounded-3xl overflow-hidden relative border border-gray-100">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-colors" />
                  <div className="relative z-10 flex items-center gap-4">
                    <div className="p-3 bg-purple-100 rounded-2xl">
                      <Sparkles className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-black text-lg text-gray-900">AI Assistant</h4>
                      <p className="text-xs text-gray-500 font-medium">Generate quizzes & flashcards</p>
                    </div>
                    <ArrowRight className="ml-auto h-5 w-5 text-gray-300 group-hover:text-purple-600 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Card>
              </Link>
            </div>

            <Card className="border-none shadow-xl shadow-gray-100 rounded-3xl bg-blue-50 p-6">
              <h4 className="font-black text-gray-900 mb-2">Did you know?</h4>
              <p className="text-sm text-blue-700/80 font-medium italic leading-relaxed">
                &quot;Consistent learning for just 20 minutes a day increases retention by up to 60% compared to marathon sessions.&quot;
              </p>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ title, value, description, icon, color }: any) {
  const colors: any = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <Card className="border-none shadow-md hover:shadow-xl transition-all duration-300 rounded-[2rem] overflow-hidden border border-gray-50">
      <CardContent className="p-8 flex items-center gap-6">
        <div className={`p-4 rounded-2xl ${colors[color]} shadow-inner`}>
          {icon}
        </div>
        <div>
          <div className="text-3xl font-black text-gray-900 leading-none">{value}</div>
          <div className="mt-1">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{title}</p>
            <p className="text-[10px] text-gray-400 font-bold mt-1">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CourseProgressCard({ id, title, progress, lastAccessed, gradient }: { id: string; title: string; progress: number; lastAccessed: string; gradient: string }) {
  return (
    <div className="group relative bg-white rounded-3xl p-6 shadow-lg shadow-gray-100 border border-gray-50 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
      <div className="flex flex-col h-full">
        <div className="flex-1 space-y-2 mb-6">
          <h4 className="font-black text-gray-900 leading-tight group-hover:text-blue-600 transition-colors uppercase text-sm tracking-tight">{title}</h4>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active {lastAccessed}</p>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <span className="text-2xl font-black text-gray-900">{progress}%</span>
            <Link href={`/learner/courses/${id}`}>
              <Button className={`h-10 w-10 rounded-xl bg-gradient-to-br ${gradient} shadow-lg text-white transition-transform active:scale-90 group-hover:rotate-12`}>
                <Play className="h-4 w-4 fill-white" />
              </Button>
            </Link>
          </div>
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all duration-1000 shadow-sm`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
