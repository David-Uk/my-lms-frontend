import { Metadata } from 'next';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BookOpen, Users, Trophy, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Tutor Dashboard - LMS',
  description: 'Tutor dashboard for managing courses and sessions',
};

export default function TutorDashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Tutor Dashboard</h1>
        
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="My Courses"
            value="5"
            description="Assigned courses"
            icon={<BookOpen className="h-4 w-4 text-blue-600" />}
          />
          <StatCard
            title="Students"
            value="128"
            description="Enrolled students"
            icon={<Users className="h-4 w-4 text-green-600" />}
          />
          <StatCard
            title="Live Sessions"
            value="3"
            description="Active quiz sessions"
            icon={<Trophy className="h-4 w-4 text-purple-600" />}
          />
          <StatCard
            title="Hours"
            value="24"
            description="Teaching hours this week"
            icon={<Clock className="h-4 w-4 text-orange-600" />}
          />
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your teaching activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <a
                href="/tutor/courses"
                className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                View Courses
              </a>
              <a
                href="/tutor/sessions/create"
                className="inline-flex items-center rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
              >
                <Trophy className="mr-2 h-4 w-4" />
                Start Quiz Session
              </a>
              <a
                href="/tutor/ai"
                className="inline-flex items-center rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
              >
                <Trophy className="mr-2 h-4 w-4" />
                AI Tools
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}

function StatCard({ title, value, description, icon }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
