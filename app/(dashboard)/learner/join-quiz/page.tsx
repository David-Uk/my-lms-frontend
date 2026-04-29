'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { Trophy, Hash, ArrowRight } from 'lucide-react';

export default function JoinQuizPage() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (pin.length !== 6) {
      setError('PIN must be 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      // In this system, joining might technically just be redirecting to a page 
      // that polls the session status using the PIN or sessionId.
      // For now, let's assume we search for the session by PIN.
      // The backend doesn't have a direct 'join by pin' GET, but we can assume /assessments/sessions/pin/:pin
      const session = await api.get<any>(`/assessments/sessions/pin/${pin}`);
      router.push(`/learner/join-quiz/${session.id}`);
    } catch (err: any) {
      setError(err.message || 'Session not found or inactive');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-md mx-auto pt-12">
        <Card className="border-2 border-blue-100 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-center text-white">
            <Trophy className="h-16 w-16 mx-auto mb-4 animate-bounce" />
            <h1 className="text-3xl font-bold">Live Quiz</h1>
            <p className="text-blue-100 mt-2">Enter the PIN to join the session</p>
          </div>
          
          <CardContent className="p-8">
            <form onSubmit={handleJoin} className="space-y-6">
              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center">
                  {error}
                </div>
              )}
              
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-6 w-6" />
                <input
                  type="text"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.toUpperCase().slice(0, 6))}
                  placeholder="000000"
                  className="w-full text-4xl tracking-[0.5em] font-black text-center py-6 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all placeholder:text-gray-200"
                  maxLength={6}
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full py-8 text-xl font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 group"
                isLoading={isLoading}
              >
                Join Now
                <ArrowRight className="ml-2 h-6 w-6 transition-transform group-hover:translate-x-1" />
              </Button>
            </form>
            
            <p className="text-center text-sm text-gray-500 mt-8">
              Waiting for your tutor to start the session? Make sure you have the correct 6-digit code.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
