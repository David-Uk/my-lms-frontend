import { Metadata } from 'next';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import type { Course, PaginatedResponse } from '@/types';
import { Plus, BookOpen, Sparkles } from 'lucide-react';
import { CourseTable } from './course-table';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Course Management - LMS Admin',
  description: 'Manage educational content, curriculum, and structure',
};

interface PageProps {
  searchParams: Promise<{
    search?: string;
    difficulty?: string;
    page?: string;
  }>;
}

export default async function CoursesPage({ searchParams }: PageProps) {
  const { search = '', difficulty = '', page = '1' } = await searchParams;

  const fetchCourses = async () => {
    const params = new URLSearchParams({
      page,
      limit: '10',
    });
    if (search) params.append('search', search);
    if (difficulty) params.append('difficultyLevel', difficulty);

    try {
      return await api.get<PaginatedResponse<Course>>(`/courses?${params.toString()}`);
    } catch (error) {
      console.error('Server-side fetch error:', error);
      return { data: [], total: 0, page: 1, limit: 10, totalPages: 1, meta: { total: 0, page: 1, limit: 10, totalPages: 1 } } as PaginatedResponse<Course>;
    }
  };

  const initialData = await fetchCourses();

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl text-white shadow-xl shadow-indigo-200">
              <BookOpen className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Catalog</h1>
                <Sparkles className="h-5 w-5 text-indigo-400" />
              </div>
              <p className="text-gray-500 font-semibold tracking-wide text-sm">DESIGN & MANAGE CURRICULUM</p>
            </div>
          </div>
          <Link href="/admin/courses/create">
            <Button className="h-14 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-2xl shadow-indigo-300 transition-all hover:-translate-y-1 active:translate-y-0">
              <Plus className="mr-2 h-6 w-6" />
              New Course
            </Button>
          </Link>
        </div>

        <Suspense fallback={
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="h-11 w-64 bg-gray-200 rounded-xl animate-pulse" />
              <div className="h-11 w-40 bg-gray-200 rounded-xl animate-pulse" />
            </div>
            <div className="h-[600px] w-full bg-gray-50 rounded-[2.5rem] animate-pulse border border-gray-100" />
          </div>
        }>
          <CourseTable initialData={initialData} search={search} difficulty={difficulty} />
        </Suspense>
      </div>
    </DashboardLayout>
  );
}
