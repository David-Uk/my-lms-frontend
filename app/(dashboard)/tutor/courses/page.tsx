import { Metadata } from 'next';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { api } from '@/lib/api';
import type { Course, PaginatedResponse } from '@/types';
import { TutorCourseList } from './tutor-course-list';
import { Suspense } from 'react';
import { Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'My Courses - LMS Tutor',
  description: 'Manage and update your assigned educational content',
};

interface PageProps {
  searchParams: Promise<{
    search?: string;
  }>;
}

export default async function TutorCoursesPage({ searchParams }: PageProps) {
  const { search = '' } = await searchParams;

  const fetchCourses = async () => {
    const params = new URLSearchParams({
      limit: '100',
    });
    if (search) params.append('search', search);

    try {
      const response = await api.get<PaginatedResponse<Course>>(`/courses?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Server-side fetch error for tutor courses:', error);
      return [];
    }
  };

  const courses = await fetchCourses();

  return (
    <DashboardLayout>
      <div className="space-y-10 animate-in fade-in duration-1000">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
             <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl text-white shadow-xl shadow-blue-200">
                <Sparkles className="h-7 w-7" />
             </div>
             <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Assigned Curriculum</h1>
                <p className="text-gray-500 font-bold tracking-widest text-[10px] uppercase mt-1">Instructor Workstation</p>
             </div>
          </div>
        </div>

        <Suspense fallback={
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 bg-white rounded-[2.5rem] animate-pulse border border-gray-100 shadow-sm" />
            ))}
          </div>
        }>
          <TutorCourseList initialCourses={courses} search={search} />
        </Suspense>
      </div>
    </DashboardLayout>
  );
}
