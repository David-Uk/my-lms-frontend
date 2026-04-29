'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Search, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import type { User } from '@/types';

interface StudentData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  createdAt: string;
  enrollmentStatus: string;
  enrolledAt: string;
  cohortName: string;
  courseName: string;
}

interface StudentsResponse {
  students: StudentData[];
  totalStudents: number;
}

export default function TutorStudentsPage() {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await api.get<StudentsResponse>('/stats/my-students');
      setStudents(data.students);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student =>
    `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Students</h1>
            <p className="text-gray-500">View and track your students progress</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-gray-900">{students.length}</p>
            <p className="text-sm text-gray-500">Total Students</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </CardHeader>
          <CardContent>
            {students.length === 0 ? (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No students assigned</h3>
                <p className="text-gray-500 mt-1">You don&apos;t have any students assigned to your courses yet.</p>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No students match your search.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredStudents.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {student.firstName[0]}{student.lastName[0]}
                      </div>
                      <div>
                        <p className="font-medium">{student.firstName} {student.lastName}</p>
                        <p className="text-sm text-gray-500">{student.email}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{student.courseName} • {student.cohortName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${student.enrollmentStatus === 'active'
                          ? 'bg-green-100 text-green-700'
                          : student.enrollmentStatus === 'completed'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                        {student.enrollmentStatus.charAt(0).toUpperCase() + student.enrollmentStatus.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
