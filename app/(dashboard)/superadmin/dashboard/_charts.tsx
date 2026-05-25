'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface ChartsProps {
  totalQuizzes: number;
  totalQuestions: number;
  attendancePresent: number;
  attendanceAbsent: number;
  totalAttendances: number;
  completionRate: number;
  totalLearners: number;
  totalTutors: number;
  activeLearners: number;
  totalEnrollments: number;
  desktopVisits: number;
  mobileVisits: number;
  tabletVisits: number;
  totalVisits: number;
}

const PIE_COLORS = ['#10b981', '#f59e0b', '#ef4444'];
const TRAFFIC_COLORS = ['#3b82f6', '#8b5cf6', '#14b8a6'];

export default function Charts({
  totalQuizzes,
  totalQuestions,
  attendancePresent,
  attendanceAbsent,
  totalAttendances,
  completionRate,
  totalLearners,
  totalTutors,
  activeLearners,
  totalEnrollments,
  desktopVisits,
  mobileVisits,
  tabletVisits,
  totalVisits,
}: ChartsProps) {
  const aiIntegrationData = [
    { name: 'Quizzes Generated', value: totalQuizzes },
    { name: 'Total Questions', value: totalQuestions },
  ];

  const attendanceData = [
    { name: 'Present', value: attendancePresent },
    { name: 'Absent/Late', value: attendanceAbsent },
    { name: 'Unmarked', value: Math.max(0, totalAttendances - attendancePresent - attendanceAbsent) },
  ];

  const trafficData = [
    { name: 'Desktop', value: desktopVisits },
    { name: 'Mobile', value: mobileVisits },
    { name: 'Tablet', value: tabletVisits },
  ];

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <Card className="border-none shadow-xl shadow-gray-200/40 rounded-[2.5rem]">
        <CardHeader className="p-8 pb-0">
          <CardTitle className="text-xl font-black text-gray-900">AI Integrations</CardTitle>
        </CardHeader>
        <CardContent className="p-8 h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={aiIntegrationData}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 600 }} />
              <Tooltip
                cursor={{ fill: '#f3f4f6' }}
                contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="value" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-none shadow-xl shadow-gray-200/40 rounded-[2.5rem]">
        <CardHeader className="p-8 pb-0">
          <CardTitle className="text-xl font-black text-gray-900">System Attendance</CardTitle>
        </CardHeader>
        <CardContent className="p-8 h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={attendanceData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {attendanceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {totalVisits > 0 && (
        <>
          <Card className="border-none shadow-xl shadow-gray-200/40 rounded-[2.5rem]">
            <CardHeader className="p-8 pb-0">
              <CardTitle className="text-xl font-black text-gray-900">Traffic by Device Type</CardTitle>
            </CardHeader>
            <CardContent className="p-8 h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={trafficData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {trafficData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={TRAFFIC_COLORS[index % TRAFFIC_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl shadow-gray-200/40 rounded-[2.5rem] bg-gray-900 text-white">
            <CardHeader className="p-8">
              <CardTitle className="text-xl font-black flex items-center gap-2">
                <span className="text-blue-400">📊</span>
                Visitor Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Total Unique Visits</span>
                  <span className="font-bold text-white text-xl">{totalVisits}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Desktop Users</span>
                  <span className="font-bold text-blue-400">{desktopVisits}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Mobile Users</span>
                  <span className="font-bold text-purple-400">{mobileVisits}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Tablet Users</span>
                  <span className="font-bold text-teal-400">{tabletVisits}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
