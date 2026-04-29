'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Trophy, Clock, BookOpen } from 'lucide-react';

export default function LearnerProgressPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Progress</h1>
          <p className="text-gray-500">Track your learning achievements</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="py-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
                <BookOpen className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-2xl font-bold">4</p>
              <p className="text-sm text-gray-500">Enrolled Courses</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                <Trophy className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold">12</p>
              <p className="text-sm text-gray-500">Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-2xl font-bold">48h</p>
              <p className="text-sm text-gray-500">Learning Time</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mb-2">
                <BarChart3 className="h-5 w-5 text-yellow-600" />
              </div>
              <p className="text-2xl font-bold">50%</p>
              <p className="text-sm text-gray-500">Avg. Score</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: 'Completed Lesson', detail: 'Introduction to React Hooks', time: '2 hours ago' },
                { action: 'Scored 85%', detail: 'JavaScript Fundamentals Quiz', time: 'Yesterday' },
                { action: 'Started Course', detail: 'UI/UX Design Principles', time: '3 days ago' },
                { action: 'Earned Badge', detail: '7-Day Streak', time: '1 week ago' },
              ].map((activity, i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-sm text-gray-500">{activity.detail}</p>
                  </div>
                  <span className="text-sm text-gray-400">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
