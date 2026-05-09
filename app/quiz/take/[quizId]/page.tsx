'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Brain, Mail, ArrowRight, AlertCircle, Sparkles, Clock, Calendar } from 'lucide-react';
import { api } from '@/lib/api';

export default function QuizAccessPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.quizId as string;

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [quizInfo, setQuizInfo] = useState<any>(null);

  useEffect(() => {
    // Optionally fetch public quiz info (title, description)
    const fetchQuizInfo = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/quizzes/standalone/${quizId}/public`);
        if (response.ok) {
          const data = await response.json();
          setQuizInfo(data);
        }
      } catch (err) {
        console.error('Failed to fetch quiz info:', err);
      }
    };
    if (quizId) fetchQuizInfo();
  }, [quizId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/quiz/access-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId, email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Access denied');
      }

      // Redirect to the actual quiz taking page with the token
      router.push(`/quiz/take/${quizId}/${data.token}`);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-purple-200/30 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-200/30 rounded-full blur-[120px]" />
      </div>

      <Card className="w-full max-w-md border-none shadow-2xl shadow-purple-200/50 rounded-[2.5rem] overflow-hidden relative z-10">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 p-10 text-white text-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <Brain className="h-10 w-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-black tracking-tight">Quiz Access</CardTitle>
          <p className="text-purple-100 font-medium mt-2">Enter your email to begin the assessment</p>
        </CardHeader>
        
        <CardContent className="p-10">
          {quizInfo && (
            <div className="mb-8 p-6 bg-purple-50 rounded-3xl border border-purple-100">
              <h2 className="text-xl font-black text-gray-900 mb-2">{quizInfo.title}</h2>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4 text-purple-600" />
                  <span>{quizInfo.timeAllocated} Minutes</span>
                </div>
                {quizInfo.startDateTime && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4 text-purple-600" />
                    <span>Starts: {new Date(quizInfo.startDateTime).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-widest ml-1">
                Your Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-14 pl-12 rounded-2xl border-2 border-gray-100 focus:border-purple-500 focus:ring-purple-500 bg-gray-50/50 font-medium transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 animate-in fade-in slide-in-from-top-2 duration-300">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p className="text-sm font-bold">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-lg gap-3 shadow-xl shadow-purple-200 transition-all active:scale-[0.98]"
            >
              {isLoading ? (
                <div className="h-6 w-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Enter Quiz
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-100 text-center">
            <div className="flex items-center justify-center gap-2 text-gray-400 text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              Powered by EdoInnovates AI
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
