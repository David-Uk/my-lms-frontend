'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Award, Clock, Target, ArrowRight, Play, Zap, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { StatCard } from '@/components/dashboard/stat-card';

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

  const getCourseColor = (index: number) => {
    const colors = [
      'border-l-blue-500',
      'border-l-emerald-500',
      'border-l-purple-500',
      'border-l-amber-500',
      'border-l-cyan-500',
      'border-l-rose-500',
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--link-color)]" />
      </div>
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {stats.recentEnrollments > 0
            ? `You've enrolled in ${stats.recentEnrollments} new course${stats.recentEnrollments > 1 ? 's' : ''} this month!`
            : 'Keep learning and growing your skills.'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Enrolled"
          value={stats.totalEnrolled.toString()}
          description="Total courses"
          icon={<BookOpen className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          title="Completed"
          value={stats.completedCourses.toString()}
          description="Finished courses"
          icon={<Award className="h-5 w-5" />}
          color="emerald"
        />
        <StatCard
          title="Active"
          value={stats.activeCourses.toString()}
          description="In progress"
          icon={<Clock className="h-5 w-5" />}
          color="purple"
        />
        <StatCard
          title="Progress"
          value={`${stats.averageProgress}%`}
          description="Avg. completion"
          icon={<Target className="h-5 w-5" />}
          color="amber"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Continue Learning */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Play className="h-4 w-4 text-blue-600" />
              Continue Learning
            </h2>
            <Link href="/learner/courses">
              <Button variant="ghost" size="sm" className="text-[var(--link-color)]">
                View All Courses
              </Button>
            </Link>
          </div>

          {data?.enrolledCourses && data.enrolledCourses.length > 0 ? (
            <div className="space-y-3">
              {data.enrolledCourses.map((course, index) => (
                <CourseProgressCard
                  key={course.id}
                  id={course.id}
                  title={course.title}
                  progress={course.progress}
                  lastAccessed={formatLastAccessed(course.lastAccessed)}
                  borderColor={getCourseColor(index)}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                <h3 className="text-base font-medium text-gray-900">No courses yet</h3>
                <p className="text-sm text-gray-500 mt-1">Enroll in a course to start your learning journey.</p>
                <Link href="/learner/courses" className="mt-4 inline-block">
                  <Button size="sm">Browse Courses</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            Quick Links
          </h2>

          <Link href="/learner/join-quiz" className="block">
            <Card className="hover:border-gray-300 transition-colors cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Zap className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Live Quiz</p>
                  <p className="text-xs text-gray-500">Join a quiz session</p>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-300" />
              </CardContent>
            </Card>
          </Link>

          <Link href="/learner/ai" className="block">
            <Card className="hover:border-gray-300 transition-colors cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">AI Study Tools</p>
                  <p className="text-xs text-gray-500">Generate quizzes & flashcards</p>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-300" />
              </CardContent>
            </Card>
          </Link>

          <Card className="bg-blue-50 border-blue-100">
            <CardContent className="p-4">
              <p className="text-sm font-medium text-gray-900 mb-1">Did you know?</p>
              <p className="text-xs text-blue-700/80 leading-relaxed">
                &quot;Just 20 minutes of daily learning can boost retention by up to 60%.&quot;
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function CourseProgressCard({ id, title, progress, lastAccessed, borderColor }: { id: string; title: string; progress: number; lastAccessed: string; borderColor: string }) {
  return (
    <Link href={`/learner/courses/${id}`}>
      <Card className={`hover:border-gray-300 transition-colors border-l-4 ${borderColor}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0 mr-4">
              <p className="text-sm font-medium text-gray-900 truncate">{title}</p>
              <p className="text-xs text-gray-500 mt-0.5">Last accessed {lastAccessed}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{progress}%</p>
              </div>
              <div className="w-24">
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--brand-primary)] rounded-full transition-all duration-1000"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
