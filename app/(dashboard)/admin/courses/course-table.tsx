'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import type { Course, PaginatedResponse, DifficultyLevel } from '@/types';
import { Search, Pencil, Trash2, ChevronLeft, ChevronRight, BookOpen, Users, Layout } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

interface CourseTableProps {
  initialData: PaginatedResponse<Course>;
  search: string;
  difficulty: string;
}

export function CourseTable({ initialData, search: initialSearch, difficulty: initialDifficulty }: CourseTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(initialSearch);
  const [difficulty, setDifficulty] = useState(initialDifficulty);
  const courses = initialData.data;
  const page = initialData.meta?.page || 1;
  const totalPages = initialData.meta?.totalPages || 1;

  const updateFilters = (newParams: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, val]) => {
      if (val) params.set(key, val);
      else params.delete(key);
    });
    params.set('page', '1');
    router.push(`/admin/courses?${params.toString()}`);
  };

  const handleSearch = (val: string) => {
    setSearch(val);
    updateFilters({ search: val });
  };

  const handleDifficulty = (val: string) => {
    setDifficulty(val);
    updateFilters({ difficulty: val });
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/admin/courses?${params.toString()}`);
  };

  const handleDelete = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    try {
      await api.delete(`/courses/${courseId}`);
      router.refresh();
    } catch (error) {
      console.error('Failed to delete course:', error);
    }
  };

  const getDifficultyBadge = (level: DifficultyLevel) => {
    const colors: Record<string, string> = {
      beginner: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      intermediate: 'bg-orange-100 text-orange-800 border-orange-200',
      advanced: 'bg-rose-100 text-rose-800 border-rose-200',
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${colors[level] || colors.beginner}`}>
        {level}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search courses..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 h-11 rounded-xl shadow-sm border-gray-200 focus:border-blue-500 transition-all"
          />
        </div>
        <select
          value={difficulty}
          onChange={(e) => handleDifficulty(e.target.value)}
          className="h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 shadow-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
        >
          <option value="">All Difficulty Levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl shadow-gray-200/50">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100">
              <th className="py-5 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest text-center w-16">#</th>
              <th className="py-5 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Course Title</th>
              <th className="py-5 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Difficulty</th>
              <th className="py-5 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Stats</th>
              <th className="py-5 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {courses.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-2 opacity-40">
                    <BookOpen className="h-12 w-12" />
                    <p className="font-bold">No courses found</p>
                  </div>
                </td>
              </tr>
            ) : (
              courses.map((course, idx) => (
                <tr key={course.id} className="group hover:bg-blue-50/30 transition-all">
                  <td className="py-5 px-6 text-center text-gray-300 font-black italic">
                    {(page - 1) * 10 + idx + 1}
                  </td>
                  <td className="py-5 px-6">
                    <div className="flex flex-col">
                      <span className="font-extrabold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {course.title}
                      </span>
                      {course.description && (
                        <span className="text-xs text-gray-400 font-medium line-clamp-1 max-w-xs">{course.description}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-5 px-6">{getDifficultyBadge(course.difficultyLevel)}</td>
                  <td className="py-5 px-6">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-lg text-gray-600 font-bold text-[10px] uppercase">
                        <Layout className="h-3 w-3" />
                        {course.contents?.length || 0}
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-lg text-gray-600 font-bold text-[10px] uppercase">
                        <Users className="h-3 w-3" />
                        {course.courseTutors?.length || 0}
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <div className="flex justify-end gap-1.5">
                      <Link href={`/admin/courses/${course.id}/content`}>
                        <Button variant="ghost" size="icon" title="Manage Content" className="h-9 w-9 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 text-gray-400">
                          <Layout className="h-4.5 w-4.5" />
                        </Button>
                      </Link>
                      <Link href={`/admin/courses/${course.id}/edit`}>
                        <Button variant="ghost" size="icon" title="Edit Details" className="h-9 w-9 rounded-xl hover:bg-blue-50 hover:text-blue-600 text-gray-400">
                          <Pencil className="h-4.5 w-4.5" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Delete Course"
                        onClick={() => handleDelete(course.id)}
                        className="h-9 w-9 rounded-xl hover:bg-rose-50 hover:text-rose-600 text-gray-400"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="bg-gray-50/50 px-6 py-5 flex items-center justify-between border-t border-gray-100">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
            Leveling Up <span className="text-gray-900 mx-1">LMS</span> Ecosystem
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-xl border-gray-200 shadow-sm"
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="px-4 py-2 text-xs font-black text-blue-600 bg-white border border-gray-200 rounded-xl shadow-sm">
                {page} / {totalPages}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-xl border-gray-200 shadow-sm"
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
