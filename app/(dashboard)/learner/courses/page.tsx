import { Metadata } from 'next';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { api } from '@/lib/api';
import type { Course, PaginatedResponse } from '@/types';
import { LearnerCourseGrid } from './learner-course-grid';
import { Suspense } from 'react';
import { GraduationCap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'My Learning - LMS Learner',
  description: 'Track your progress and continue your education',
};

interface PageProps {
  searchParams: Promise<{
    search?: string;
  }>;
}

export default async function LearnerCoursesPage({ searchParams }: PageProps) {
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
      console.error('Server-side fetch error for learner courses:', error);
      return [];
    }
  };

  const courses = await fetchCourses();

  return (
    <DashboardLayout>
      <div className="space-y-12 animate-in fade-in duration-1000">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
             <div className="h-20 w-20 bg-gray-900 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-gray-200 group">
                <GraduationCap className="h-10 w-10 transition-transform group-hover:scale-110" />
             </div>
             <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-4xl font-black text-gray-900 tracking-tight">University Hub</h1>
                  <div className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-black uppercase tracking-widest animate-pulse">Live</div>
                </div>
                <p className="text-gray-500 font-bold tracking-widest text-[10px] uppercase mt-2">Personalized Academic Catalog</p>
             </div>
          </div>
          <div className="hidden lg:flex items-center gap-4 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
             <div className="text-right pr-4 border-r border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Global Rank</p>
                <p className="text-xl font-black text-gray-900">#128</p>
             </div>
             <div className="px-2">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Achievements</p>
                <p className="text-xl font-black text-gray-900">24</p>
             </div>
          </div>
        </div>

        <Suspense fallback={
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 bg-gray-50 rounded-[3rem] animate-pulse border border-gray-100 shadow-sm" />
            ))}
          </div>
        }>
          <LearnerCourseGrid initialCourses={courses} search={search} />
        </Suspense>
      </div>
    </DashboardLayout>
  );
}
