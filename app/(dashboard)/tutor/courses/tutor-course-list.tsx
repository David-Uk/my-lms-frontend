'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Course } from '@/types';
import { BookOpen, Search, ArrowUpRight, Layout, Sparkles } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

export function TutorCourseList({ initialCourses, search: initialSearch }: { initialCourses: Course[], search: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(initialSearch);

  const handleSearch = (val: string) => {
    setSearch(val);
    const params = new URLSearchParams(searchParams.toString());
    if (val) params.set('search', val);
    else params.delete('search');
    router.push(`/tutor/courses?${params.toString()}`);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          <Input
            placeholder="Search your assigned courses..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="h-14 pl-12 rounded-[1.25rem] border-gray-200 bg-white shadow-xl shadow-gray-100/50 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all font-medium"
          />
        </div>
        <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
          <div className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-black uppercase tracking-wider">
            {initialCourses.length} Assigned
          </div>
        </div>
      </div>

      {initialCourses.length === 0 ? (
        <Card className="p-20 text-center border-none shadow-2xl rounded-[3rem] bg-gray-50/50 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-10 opacity-5">
             <BookOpen className="h-64 w-64" />
          </div>
          <div className="relative z-10">
            <div className="h-20 w-20 bg-white rounded-3xl flex items-center justify-center text-gray-300 mx-auto mb-6 shadow-xl">
              <BookOpen className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">No Courses Found</h3>
            <p className="text-gray-500 font-medium max-w-sm mx-auto">
              You haven&apos;t been assigned to any curriculum yet. Contact your administrator to get started.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {initialCourses.map((course) => (
            <Card key={course.id} className="group relative border-none shadow-xl hover:shadow-2xl transition-all duration-500 rounded-[2.5rem] bg-white overflow-hidden hover:-translate-y-2">
              <div className="absolute top-0 right-0 p-8">
                <div className="h-12 w-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 rotate-12 group-hover:rotate-0">
                  <BookOpen className="h-6 w-6" />
                </div>
              </div>
              <CardHeader className="p-8 pt-10">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 w-fit px-3 py-1 rounded-full mb-3">
                    <Sparkles className="h-3 w-3" />
                    {course.difficultyLevel}
                  </div>
                  <CardTitle className="text-2xl font-black text-gray-900 group-hover:text-blue-600 transition-colors leading-tight line-clamp-2">
                    {course.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <p className="text-gray-500 font-medium text-sm line-clamp-3 mb-8 min-h-[4.5rem]">
                  {course.description || 'No description provided.'}
                </p>
                
                <div className="flex items-center gap-4 mb-8">
                   <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-2xl">
                      <Layout className="h-4 w-4 text-gray-400" />
                      <span className="text-xs font-black text-gray-900">{course.contents?.length || 0} Modules</span>
                   </div>
                </div>

                <div className="flex items-center gap-2">
                   <Link href={`/admin/courses/${course.id}/content`} className="flex-1">
                    <Button className="w-full h-14 bg-gray-900 hover:bg-black text-white rounded-2xl font-black shadow-lg shadow-gray-200 transition-all active:scale-95">
                      Configure
                    </Button>
                  </Link>
                  <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl border-gray-100 hover:bg-blue-50 hover:text-blue-600 transition-all">
                    <ArrowUpRight className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
