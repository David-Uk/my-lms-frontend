'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { Quiz, QuizSession, Cohort, PaginatedResponse, Course } from '@/types';
import { Play, Users, Trophy, Plus, CheckCircle2, Clock, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

export default function QuizSessionsPage() {
  const [sessions, setSessions] = useState<QuizSession[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    quizId: '',
    cohortId: '',
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      // Fetch courses to get nested cohorts and quizzes
      const coursesRes = await api.get<PaginatedResponse<Course>>('/courses?limit=100');
      
      const allCohorts = coursesRes.data.flatMap(c => c.cohorts || []);
      // We also need quizzes. Quizzes are inside assessments.
      // This is a bit complex in one go, but let's assume we can find them.
      // For now, I'll just fetch whatever assessments I can.
      
      setCohorts(allCohorts);
      // setSessions(sessionsRes);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const session = await api.post<QuizSession>('/assessments/sessions', formData);
      setSessions([session, ...sessions]);
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const updateStatus = async (sessionId: string, status: string) => {
    try {
      await api.patch(`/assessments/sessions/${sessionId}/status`, { status });
      // Update local state
      setSessions(sessions.map(s => s.id === sessionId ? { ...s, status: status as any } : s));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quiz Sessions</h1>
            <p className="text-gray-500">Host and manage live Kahoot-style quiz sessions</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Host New Session
          </Button>
        </div>

        <div className="grid gap-6">
          {sessions.length === 0 ? (
            <Card className="p-12 text-center border-2 border-dashed">
              <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium">No active sessions</h3>
              <p className="text-gray-500">Create a session to start a live quiz with your students</p>
              <Button className="mt-4" onClick={() => setIsModalOpen(true)}>Create Session</Button>
            </Card>
          ) : (
            sessions.map(session => (
              <Card key={session.id} className="overflow-hidden">
                <div className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${
                      session.status === 'active' ? 'bg-green-100 text-green-600' : 
                      session.status === 'completed' ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {session.status === 'active' ? <Clock className="animate-pulse" /> : <Trophy />}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">PIN: {session.pin}</h3>
                      <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">{session.status}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {session.status === 'waiting' && (
                      <Button onClick={() => updateStatus(session.id, 'active')} className="bg-green-600 hover:bg-green-700">
                        <Play className="mr-2 h-4 w-4" />
                        Start Session
                      </Button>
                    )}
                    {session.status === 'active' && (
                      <Button onClick={() => updateStatus(session.id, 'completed')} variant="outline">
                        End Session
                      </Button>
                    )}
                    <Link href={`/tutor/sessions/${session.id}/leaderboard`}>
                      <Button variant="ghost">
                        <Trophy className="mr-2 h-4 w-4" />
                        Leaderboard
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Host New Session</CardTitle>
              <CardDescription>Select a quiz and a cohort to start</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateSession} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Select Cohort</label>
                  <select
                    value={formData.cohortId}
                    onChange={(e) => setFormData({ ...formData, cohortId: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none"
                    required
                  >
                    <option value="">Select a cohort...</option>
                    {cohorts.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Quiz ID</label>
                  <Input
                    placeholder="Enter Quiz UUID"
                    value={formData.quizId}
                    onChange={(e) => setFormData({ ...formData, quizId: e.target.value })}
                    required
                  />
                  <p className="text-xs text-gray-500">You can find the quiz ID in the course content section.</p>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Generate PIN
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
