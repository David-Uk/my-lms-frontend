'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { Course, DifficultyLevel } from '@/types';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { updateCourseAction } from '../../actions';

export default function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficultyLevel: 'beginner' as DifficultyLevel,
  });

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const course = await api.get<Course>(`/courses/${id}`);
        setFormData({
          title: course.title,
          description: course.description || '',
          difficultyLevel: course.difficultyLevel,
        });
      } catch (err: any) {
        setError(err.message || 'Failed to fetch course');
      } finally {
        setIsFetching(false);
      }
    };

    fetchCourse();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const res = await updateCourseAction(id, formData);
    if (res?.error) {
      setError(res.error);
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link 
            href="/admin/courses" 
            className="flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Courses
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Edit Course</CardTitle>
            <CardDescription>Update course details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <Input
                label="Course Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  rows={4}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Difficulty Level</label>
                <select
                  value={formData.difficultyLevel}
                  onChange={(e) => setFormData({ ...formData, difficultyLevel: e.target.value as DifficultyLevel })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <Button type="submit" className="w-full" isLoading={isLoading}>
                Update Course
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
