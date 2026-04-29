'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import type { Course } from '@/types';
import { BookOpen, Search, ArrowRight, Star, Clock, Trophy } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

export function LearnerCourseGrid({ initialCourses, search: initialSearch }: { initialCourses: Course[], search: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(initialSearch);

  const handleSearch = (val: string) => {
    setSearch(val);
    const params = new URLSearchParams(searchParams.toString());
    if (val) params.set('search', val);
    else params.delete('search');
    router.push(`/learner/courses?${params.toString()}`);
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative flex-1 max-w-xl group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          <Input
            placeholder="Search your learning path..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="h-16 pl-14 rounded-[1.5rem] border-gray-100 bg-white shadow-2xl shadow-blue-50/50 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all font-bold text-lg placeholder:text-gray-300"
          />
        </div>
      </div>

      {initialCourses.length === 0 ? (
        <Card className="p-24 text-center border-none shadow-2xl rounded-[3rem] bg-white overflow-hidden relative border border-gray-50">
           <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
           <div className="relative z-10">
            <div className="h-24 w-24 bg-blue-50 rounded-[2rem] flex items-center justify-center text-blue-600 mx-auto mb-8 shadow-inner ring-8 ring-blue-50/50">
              <BookOpen className="h-10 w-10" />
            </div>
            <h3 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Empty Backpack?</h3>
            <p className="text-gray-500 font-medium max-w-md mx-auto text-lg leading-relaxed mb-10">
              You haven&apos;t enrolled in any courses yet. Your next big skill is just one click away.
            </p>
            <Link href="/courses">
              <Button className="h-14 px-10 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow-xl shadow-blue-200 transition-all active:scale-95">
                Explore The Catalog
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {initialCourses.map((course) => (
            <Link key={course.id} href={`/learner/courses/${course.id}`} className="group">
              <Card className="flex flex-col border-none shadow-xl hover:shadow-2xl transition-all duration-500 rounded-[2.5rem] bg-white overflow-hidden hover:-translate-y-3">
                <div className="h-44 bg-gradient-to-br from-gray-900 to-black p-8 relative overflow-hidden">
                  <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl group-hover:bg-blue-600/40 transition-colors" />
                  <div className="relative z-10 flex flex-col justify-between h-full">
                    <div className="flex justify-between items-start">
                       <div className="h-14 w-14 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white border border-white/20 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                        <BookOpen className="h-7 w-7" />
                      </div>
                      <div className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-xl text-white text-[10px] font-black uppercase tracking-[0.2em] border border-white/10">
                        {course.difficultyLevel}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                       <div className="flex items-center gap-1.5 text-blue-400 font-black text-[10px] uppercase tracking-widest bg-blue-400/10 px-3 py-1 rounded-full">
                         <Star className="h-3 w-3 fill-blue-400" />
                         Popular
                       </div>
                    </div>
                  </div>
                </div>
                
                <CardContent className="p-8 flex-1 flex flex-col">
                  <h3 className="text-2xl font-black text-gray-900 mb-3 group-hover:text-blue-600 transition-colors leading-tight line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-gray-500 font-medium text-sm line-clamp-3 mb-8 flex-1 leading-relaxed">
                    {course.description || 'Master this subject with our expert-led curriculum designed for modern careers.'}
                  </p>
                  
                  <div className="pt-8 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-gray-400">
                        <Clock className="h-4 w-4" />
                        <span className="text-xs font-black uppercase tracking-widest">Self-Paced</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-500">
                        <Trophy className="h-4 w-4" />
                        <span className="text-xs font-black uppercase tracking-widest">Verifiable</span>
                      </div>
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white group-hover:rotate-12 transition-all duration-500">
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
