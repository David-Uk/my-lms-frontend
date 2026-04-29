'use client';

import { useState, useEffect, use } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { User, CourseTutor, Course } from '@/types';
import { ArrowLeft, UserPlus, Trash2, Mail, Phone } from 'lucide-react';
import Link from 'next/link';

export default function CourseTutorsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [course, setCourse] = useState<Course | null>(null);
  const [tutors, setTutors] = useState<User[]>([]);
  const [allTutors, setAllTutors] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTutors, setSelectedTutors] = useState<string[]>([]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [courseRes, tutorsRes, allTutorsRes] = await Promise.all([
        api.get<Course>(`/courses/${id}`),
        api.get<User[]>(`/courses/${id}/tutors`),
        api.get<any>(`/users?role=tutor&limit=100`),
      ]);
      setCourse(courseRes);
      setTutors(tutorsRes);
      setAllTutors(allTutorsRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleAssign = async () => {
    try {
      await api.post(`/courses/${id}/tutors/bulk`, { tutorIds: selectedTutors });
      setIsModalOpen(false);
      setSelectedTutors([]);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemove = async (tutorId: string) => {
    if (!confirm('Remove this tutor from the course?')) return;
    try {
      await api.delete(`/courses/${id}/tutors/${tutorId}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
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
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/courses" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{course?.title}</h1>
              <p className="text-sm text-gray-500">Manage assigned instructors</p>
            </div>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Assign Tutors
          </Button>
        </div>

        <div className="grid gap-4">
          {tutors.length === 0 ? (
            <Card className="p-12 text-center border-2 border-dashed">
              <Mail className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No tutors assigned yet</p>
              <Button variant="link" onClick={() => setIsModalOpen(true)} className="text-blue-600">Assign your first tutor</Button>
            </Card>
          ) : (
            tutors.map(tutor => (
              <Card key={tutor.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                        {tutor.firstName[0]}{tutor.lastName[0]}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{tutor.firstName} {tutor.lastName}</h4>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {tutor.email}</span>
                          {tutor.phoneNumber && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {tutor.phoneNumber}</span>}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleRemove(tutor.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Assignment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>Assign Tutors</CardTitle>
              <CardDescription>Select tutors to add to this course</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="max-h-60 overflow-y-auto space-y-2 p-1">
                {allTutors.filter(t => !tutors.some(at => at.id === t.id)).map(tutor => (
                  <label key={tutor.id} className="flex items-center gap-3 p-3 rounded-xl border hover:bg-gray-50 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={selectedTutors.includes(tutor.id)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedTutors([...selectedTutors, tutor.id]);
                        else setSelectedTutors(selectedTutors.filter(id => id !== tutor.id));
                      }}
                    />
                    <div>
                      <p className="font-bold text-sm">{tutor.firstName} {tutor.lastName}</p>
                      <p className="text-xs text-gray-500">{tutor.email}</p>
                    </div>
                  </label>
                ))}
                {allTutors.filter(t => !tutors.some(at => at.id === t.id)).length === 0 && (
                  <p className="text-center py-4 text-sm text-gray-500">All available tutors are already assigned.</p>
                )}
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button 
                  onClick={handleAssign} 
                  disabled={selectedTutors.length === 0}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Confirm Assignment ({selectedTutors.length})
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
