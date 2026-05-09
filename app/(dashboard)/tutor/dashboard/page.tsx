'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { useAuth } from '@/stores/auth-store';
import type { Course } from '@/types';
import {
  BookOpen,
  Users,
  Trophy,
  Clock,
  Play,
  Sparkles,
  TrendingUp,
  Calendar,
  ArrowRight,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/dashboard/stat-card';

interface TutorStats {
  totalCourses: number;
  totalStudents: number;
  activeSessions: number;
  totalHours: number;
}

interface UpcomingSession {
  id: string;
  title: string;
  startTime: string;
  status: string;
}

interface EnrolledStudent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  enrolledAt: string;
}

interface TutorDashboardData {
  stats: TutorStats;
  courses: Course[];
  recentStudents: EnrolledStudent[];
  upcomingSessions: UpcomingSession[];
}

export default function TutorDashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<TutorStats>({
    totalCourses: 0,
    totalStudents: 0,
    activeSessions: 0,
    totalHours: 0,
  });
  const [courses, setCourses] = useState<Course[]>([]);
  const [recentStudents, setRecentStudents] = useState<EnrolledStudent[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSession[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await api.get<TutorDashboardData>('/stats/tutor-dashboard');
      setStats(data.stats);
      setCourses(data.courses);
      setRecentStudents(data.recentStudents);
      setUpcomingSessions(data.upcomingSessions);
    } catch (error) {
      console.error('Failed to fetch tutor dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-1000">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-emerald-50 rounded-3xl shadow-lg">
              <BookOpen className="h-8 w-8 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight">My Dashboard</h1>
              <p className="text-gray-500 font-medium mt-1">
                Welcome back, {user?.firstName}. Here&apos;s your teaching overview.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Online</span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="My Courses"
            value={loading ? '—' : stats.totalCourses}
            description="Assigned courses"
            icon={<BookOpen className="h-5 w-5 text-blue-600" />}
            color="blue"
            loading={loading}
          />
          <StatCard
            title="Students"
            value={loading ? '—' : stats.totalStudents}
            description="Enrolled learners"
            icon={<Users className="h-5 w-5 text-emerald-600" />}
            color="emerald"
            loading={loading}
          />
          <StatCard
            title="Live Sessions"
            value={loading ? '—' : stats.activeSessions}
            description="Active sessions"
            icon={<Trophy className="h-5 w-5 text-purple-600" />}
            color="purple"
            loading={loading}
          />
          <StatCard
            title="This Week"
            value={loading ? '—' : `${stats.totalHours}h`}
            description="Teaching hours"
            icon={<Clock className="h-5 w-5 text-orange-600" />}
            color="orange"
            loading={loading}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 border-none shadow-2xl shadow-gray-200/50 rounded-[2.5rem] overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-emerald-600" />
                  <CardTitle className="text-xl font-black">My Courses</CardTitle>
                </div>
                <Link href="/tutor/courses">
                  <Button variant="ghost" className="text-emerald-600 font-bold">View All</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : courses.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="mx-auto h-12 w-12 text-gray-300" />
                  <h3 className="mt-4 text-lg font-bold text-gray-900">No courses assigned</h3>
                  <p className="mt-1 text-gray-500">Contact an admin to get courses assigned to you.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {courses.slice(0, 5).map((course) => (
                    <div
                      key={course.id}
                      className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl hover:bg-gray-100/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center text-white font-bold">
                          <BookOpen className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{course.title}</h4>
                          <p className="text-sm text-gray-500">{course.difficultyLevel || 'All levels'}</p>
                        </div>
                      </div>
                      <Link href={`/tutor/courses/${course.id}`}>
                        <Button variant="ghost" size="sm" className="rounded-xl">
                          <Play className="h-4 w-4 mr-1" />
                          Manage
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl shadow-gray-200/40 rounded-[2.5rem] bg-gray-900 text-white">
            <CardHeader className="p-8">
              <CardTitle className="text-xl font-black flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-4">
              <Link href="/tutor/courses" className="block">
                <Button className="w-full rounded-2xl h-14 bg-emerald-600 hover:bg-emerald-700 gap-3 justify-start">
                  <BookOpen className="h-5 w-5" />
                  Manage Courses
                </Button>
              </Link>
              <Link href="/tutor/sessions" className="block">
                <Button className="w-full rounded-2xl h-14 bg-purple-600 hover:bg-purple-700 gap-3 justify-start">
                  <Trophy className="h-5 w-5" />
                  Quiz Sessions
                </Button>
              </Link>
              <Link href="/tutor/ai" className="block">
                <Button className="w-full rounded-2xl h-14 bg-blue-600 hover:bg-blue-700 gap-3 justify-start">
                  <Sparkles className="h-5 w-5" />
                  AI Study Tools
                </Button>
              </Link>
              <Link href="/tutor/students" className="block">
                <Button className="w-full rounded-2xl h-14 bg-orange-600 hover:bg-orange-700 gap-3 justify-start">
                  <Users className="h-5 w-5" />
                  My Students
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  <CardTitle className="text-xl font-black">Recent Enrollments</CardTitle>
                </div>
                <Link href="/tutor/students">
                  <Button variant="ghost" size="sm" className="text-purple-600 font-bold rounded-xl">
                    View All
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : recentStudents.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="mx-auto h-10 w-10 text-gray-300" />
                  <p className="mt-2 text-gray-500">No recent enrollments</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentStudents.slice(0, 5).map((student) => (
                    <div key={student.id} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                          {student.firstName[0]}{student.lastName[0]}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{student.firstName} {student.lastName}</p>
                          <p className="text-xs text-gray-500">{student.email}</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">
                        {formatDate(student.enrolledAt)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Trophy className="h-5 w-5 text-amber-600" />
                  <CardTitle className="text-xl font-black">Upcoming Sessions</CardTitle>
                </div>
                <Link href="/tutor/sessions">
                  <Button variant="ghost" size="sm" className="text-amber-600 font-bold rounded-xl">
                    View All
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : upcomingSessions.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="mx-auto h-10 w-10 text-gray-300" />
                  <p className="mt-2 text-gray-500">No upcoming sessions</p>
                  <Link href="/tutor/sessions" className="mt-4 inline-block">
                    <Button className="rounded-xl bg-amber-600 hover:bg-amber-700 gap-2">
                      <Plus className="h-4 w-4" />
                      Schedule Session
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingSessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                          <Calendar className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-gray-900">{session.title}</p>
                          <p className="text-[10px] text-gray-500 font-medium">
                            {new Date(session.startTime).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Link href={`/tutor/sessions/${session.id}`}>
                        <Button variant="ghost" size="sm" className="h-8 rounded-lg text-xs font-bold text-amber-600">
                          Join
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
      </div>
    </div>
  );
}

