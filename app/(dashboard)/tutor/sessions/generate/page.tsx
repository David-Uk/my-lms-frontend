'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getToken } from '@/lib/api';
import type { Quiz, QuizQuestion } from '@/types';
import {
  Sparkles,
  Brain,
  ListChecks,
  Target,
  Layers,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Copy,
  Mail,
  Trash2,
  Send,
  Plus,
  Users,
  FileSpreadsheet,
  Calendar,
  Clock,
} from 'lucide-react';

interface Participant {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  invited: boolean;
  token?: string;
}

interface GenerateQuizRequest {
  topics: string;
  numberOfQuestions: number;
  totalMarks: number;
  passMark: number;
  questionTypes: string[];
  difficultyLevel: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  durationMinutes: number;
}

interface GenerateQuizResponse {
  quiz: Quiz;
  questions: QuizQuestion[];
  invites?: Array<{
    id: string;
    quizId: string;
    email: string;
    firstName: string;
    lastName: string;
    token: string;
    status: string;
    invitedAt: string;
    expiresAt: string;
  }>;
}

const QUESTION_TYPES = [
  { id: 'single_option', label: 'Multiple Choice (Single)', icon: '☀️' },
  { id: 'multiple_option', label: 'Multiple Choice (Multi)', icon: '☑️' },
  { id: 'true_false', label: 'True or False', icon: '✓' },
  { id: 'fill_in_the_blank', label: 'Fill in the Blank', icon: '📝' },
];

const DIFFICULTY_LEVELS = [
  { id: 'easy', label: 'Easy', description: 'Basic questions' },
  { id: 'medium', label: 'Medium', description: 'Moderate complexity' },
  { id: 'hard', label: 'Hard', description: 'Advanced questions' },
];

export default function GenerateQuizPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [step, setStep] = useState<'configure' | 'preview' | 'invite' | 'complete'>('configure');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSendingInvites, setIsSendingInvites] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState<GenerateQuizResponse | null>(null);
  const [error, setError] = useState('');
  
  const getDefaultEndDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState<GenerateQuizRequest>({
    topics: '',
    numberOfQuestions: 10,
    totalMarks: 100,
    passMark: 50,
    questionTypes: ['single_option'],
    difficultyLevel: 'medium',
    startDate: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endDate: getDefaultEndDate(),
    endTime: '17:00',
    durationMinutes: 60,
  });

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [newEmail, setNewEmail] = useState('');

  const toggleQuestionType = (typeId: string) => {
    setFormData(prev => ({
      ...prev,
      questionTypes: prev.questionTypes.includes(typeId)
        ? prev.questionTypes.filter(t => t !== typeId)
        : [...prev.questionTypes, typeId]
    }));
  };

  const handleGenerateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.questionTypes.length === 0) {
      setError('Please select at least one question type');
      return;
    }

    if (formData.topics.trim() === '') {
      setError('Please enter at least one topic');
      return;
    }

    if (formData.passMark > formData.totalMarks) {
      setError('Pass mark cannot exceed total marks');
      return;
    }

    if (!formData.startDate || !formData.startTime || !formData.endDate || !formData.endTime) {
      setError('Please set start and end dates/times for the quiz');
      return;
    }

    const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
    
    if (startDateTime >= endDateTime) {
      setError('End date/time must be after start date/time');
      return;
    }

    if (formData.durationMinutes <= 0 || formData.durationMinutes > 480) {
      setError('Duration must be between 1 and 480 minutes');
      return;
    }

    try {
      setIsGenerating(true);
      setError('');

      const localResponse = await fetch('/api/ai/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topics: formData.topics,
          numberOfQuestions: formData.numberOfQuestions,
          totalMarks: formData.totalMarks,
          passMark: formData.passMark,
          questionTypes: formData.questionTypes,
          difficultyLevel: formData.difficultyLevel,
          startDate: formData.startDate,
          startTime: formData.startTime,
          endDate: formData.endDate,
          endTime: formData.endTime,
          durationMinutes: formData.durationMinutes,
        }),
      });

      if (!localResponse.ok) {
        throw new Error('Failed to generate quiz');
      }

      const response = await localResponse.json();
      
      const questions = response.questions.map((q: Record<string, unknown>, i: number) => ({
        id: `q_${Date.now()}_${i}`,
        quizId: response.quiz.id,
        type: q.type || 'single_option',
        question: q.question,
        options: Array.isArray(q.options) ? q.options : [],
        correctAnswer: q.correctAnswer,
        marks: Math.floor(formData.totalMarks / formData.numberOfQuestions),
        timeLimit: null,
      }));

      setGeneratedQuiz({ quiz: response.quiz, questions });
      setStep('preview');
    } catch (err) {
      console.error('Failed to generate quiz:', err);
      setError('Failed to generate quiz. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const addParticipant = () => {
    if (!newEmail.trim()) return;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    if (participants.some(p => p.email.toLowerCase() === newEmail.toLowerCase())) {
      setError('This email has already been added');
      return;
    }

    const emailParts = newEmail.split('@')[0].split('.');
    const firstName = emailParts[0] ? emailParts[0].charAt(0).toUpperCase() + emailParts[0].slice(1).toLowerCase() : '';
    const lastName = emailParts.length > 1 ? emailParts[1].charAt(0).toUpperCase() + emailParts[1].slice(1).toLowerCase() : '';

    setParticipants(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        email: newEmail,
        firstName,
        lastName,
        invited: false,
      }
    ]);
    setNewEmail('');
    setError('');
  };

  const removeParticipant = (id: string) => {
    setParticipants(prev => prev.filter(p => p.id !== id));
  };

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          setError('Excel file should have headers and at least one email');
          return;
        }

        const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
        const emailIndex = headers.findIndex(h => h.includes('email'));
        
        if (emailIndex === -1) {
          setError('Could not find email column in the file');
          return;
        }

        const newParticipants: Participant[] = [];
        for (let i = 1; i < lines.length; i++) {
          const columns = lines[i].split(',').map(c => c.trim());
          const email = columns[emailIndex];
          
          if (email && !participants.some(p => p.email.toLowerCase() === email.toLowerCase())) {
            const emailParts = email.split('@')[0].split('.');
            const firstName = emailParts[0] ? emailParts[0].charAt(0).toUpperCase() + emailParts[0].slice(1).toLowerCase() : '';
            const lastName = emailParts.length > 1 ? emailParts[1].charAt(0).toUpperCase() + emailParts[1].slice(1).toLowerCase() : '';

            newParticipants.push({
              id: crypto.randomUUID(),
              email,
              firstName,
              lastName,
              invited: false,
            });
          }
        }

        setParticipants(prev => [...prev, ...newParticipants]);
        setError('');
      } catch {
        setError('Failed to parse Excel file. Please ensure it is a CSV format.');
      }
    };
    reader.readAsText(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const sendInvites = async () => {
    if (participants.length === 0) {
      setError('Please add at least one participant');
      return;
    }

    if (!generatedQuiz) {
      setError('No quiz generated');
      return;
    }

    try {
      setIsSendingInvites(true);
      setError('');

      const token = await getToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/quiz/invite', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          quizId: generatedQuiz.quiz.id,
          participants: participants.map(p => ({
            email: p.email,
            firstName: p.firstName,
            lastName: p.lastName,
          })),
          quiz: {
            ...generatedQuiz.quiz,
            questions: generatedQuiz.questions,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to send invites');
      }

      const data = await response.json();
      setParticipants(prev => prev.map(p => ({ ...p, invited: true })));
      setGeneratedQuiz(prev => prev ? { 
        ...prev, 
        quiz: { ...prev.quiz, id: data.quizId },
        invites: data.invites 
      } : null);
      setStep('complete');
    } catch (err) {
      console.error('Failed to send invites:', err);
      setError(err instanceof Error ? err.message : 'Failed to send invites. Please try again.');
    } finally {
      setIsSendingInvites(false);
    }
  };

  const copyQuizId = () => {
    if (generatedQuiz?.quiz.id) {
      navigator.clipboard.writeText(generatedQuiz.quiz.id);
    }
  };

  const copyInviteLink = () => {
    if (generatedQuiz?.quiz.id) {
      const link = `${window.location.origin}/quiz/take/${generatedQuiz.quiz.id}`;
      navigator.clipboard.writeText(link);
    }
  };

  const resetForm = () => {
    setStep('configure');
    setGeneratedQuiz(null);
    setParticipants([]);
    setFormData({
      topics: '',
      numberOfQuestions: 10,
      totalMarks: 100,
      passMark: 50,
      questionTypes: ['single_option'],
      difficultyLevel: 'medium',
      startDate: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endDate: getDefaultEndDate(),
      endTime: '17:00',
      durationMinutes: 60,
    });
  };

  return (
    <>
      <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-1000 max-w-5xl mx-auto">
        <div className="flex items-center gap-4">
          <Link href="/tutor/sessions">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl shadow-lg">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight">AI Quiz Generator</h1>
              <p className="text-gray-500 font-medium mt-1">
                {step === 'configure' && 'Configure your quiz settings'}
                {step === 'invite' && 'Add participants to invite'}
                {step === 'complete' && 'Quiz ready to share'}
              </p>
            </div>
          </div>
        </div>

        {step !== 'configure' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => step === 'complete' ? setStep('invite') : setStep('configure')}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
             <div className="flex-1 flex items-center justify-center gap-4">
               <div className={`flex items-center gap-2 ${step !== 'configure' ? 'text-purple-600' : 'text-gray-400'}`}>
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step !== 'configure' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
                   {step === 'configure' ? '1' : <CheckCircle2 className="h-5 w-5" />}
                 </div>
                 <span className="font-medium">Configure</span>
               </div>
               <div className="w-12 h-0.5 bg-gray-200" />
               <div className={`flex items-center gap-2 ${step === 'preview' || step === 'invite' || step === 'complete' ? 'text-purple-600' : 'text-gray-400'}`}>
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step === 'preview' || step === 'invite' || step === 'complete' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
                   {step === 'preview' ? '2' : <CheckCircle2 className="h-5 w-5" />}
                 </div>
                 <span className="font-medium">Preview</span>
               </div>
               <div className="w-12 h-0.5 bg-gray-200" />
               <div className={`flex items-center gap-2 ${step === 'invite' || step === 'complete' ? 'text-purple-600' : 'text-gray-400'}`}>
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step === 'invite' || step === 'complete' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
                   {step === 'invite' ? '3' : <CheckCircle2 className="h-5 w-5" />}
                 </div>
                 <span className="font-medium">Invite</span>
               </div>
               <div className="w-12 h-0.5 bg-gray-200" />
               <div className={`flex items-center gap-2 ${step === 'complete' ? 'text-purple-600' : 'text-gray-400'}`}>
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step === 'complete' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
                   4
                 </div>
                 <span className="font-medium">Complete</span>
               </div>
             </div>
          </div>
        )}

        {step === 'configure' && (
          <Card className="border-none shadow-2xl shadow-gray-200/50 rounded-[2.5rem] overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100 p-8">
              <div className="flex items-center gap-3">
                <Brain className="h-6 w-6 text-purple-600" />
                <CardTitle className="text-2xl font-black">Quiz Configuration</CardTitle>
              </div>
              <p className="text-gray-500 font-medium mt-2">Configure your quiz settings and let AI generate questions</p>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleGenerateQuiz} className="space-y-8">
                {error && (
                  <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                )}

                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-widest">
                    <Layers className="h-4 w-4 text-purple-600" />
                    Topics
                  </label>
                  <textarea
                    value={formData.topics}
                    onChange={(e) => setFormData(prev => ({ ...prev, topics: e.target.value }))}
                    placeholder="Enter topics separated by commas (e.g., JavaScript fundamentals, React hooks, Node.js basics)"
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-purple-500 font-medium min-h-[120px] resize-none"
                  />
                  <p className="text-xs text-gray-500">Separate multiple topics with commas</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-widest">
                      <ListChecks className="h-4 w-4 text-purple-600" />
                      Number of Questions
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={formData.numberOfQuestions}
                      onChange={(e) => setFormData(prev => ({ ...prev, numberOfQuestions: parseInt(e.target.value) || 10 }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-purple-500 font-medium"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-widest">
                      <Target className="h-4 w-4 text-purple-600" />
                      Difficulty Level
                    </label>
                    <select
                      value={formData.difficultyLevel}
                      onChange={(e) => setFormData(prev => ({ ...prev, difficultyLevel: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-purple-500 font-medium bg-white"
                    >
                      {DIFFICULTY_LEVELS.map(level => (
                        <option key={level.id} value={level.id}>{level.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-widest">
                      <Target className="h-4 w-4 text-purple-600" />
                      Total Marks
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={formData.totalMarks}
                      onChange={(e) => setFormData(prev => ({ ...prev, totalMarks: parseInt(e.target.value) || 100 }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-purple-500 font-medium"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-widest">
                      <CheckCircle2 className="h-4 w-4 text-purple-600" />
                      Pass Mark
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={formData.totalMarks}
                      value={formData.passMark}
                      onChange={(e) => setFormData(prev => ({ ...prev, passMark: parseInt(e.target.value) || 50 }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-purple-500 font-medium"
                    />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-3xl border-2 border-purple-100 space-y-5">
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-widest">
                    <Calendar className="h-4 w-4 text-purple-600" />
                    Quiz Time Settings
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Start Date</label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-purple-500 font-medium bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Start Time</label>
                      <input
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-purple-500 font-medium bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">End Date</label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-purple-500 font-medium bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">End Time</label>
                      <input
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-purple-500 font-medium bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-bold text-gray-600 uppercase tracking-wide">
                      <Clock className="h-4 w-4 text-purple-600" />
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="480"
                      value={formData.durationMinutes}
                      onChange={(e) => setFormData(prev => ({ ...prev, durationMinutes: parseInt(e.target.value) || 60 }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-purple-500 font-medium"
                    />
                    <p className="text-xs text-gray-500">Time allowed to complete the quiz once started</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-widest">
                    <ListChecks className="h-4 w-4 text-purple-600" />
                    Question Types
                  </label>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {QUESTION_TYPES.map(type => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => toggleQuestionType(type.id)}
                        className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-200 ${
                          formData.questionTypes.includes(type.id)
                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                            : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
                        }`}
                      >
                        <span className="text-2xl">{type.icon}</span>
                        <span className="font-bold text-sm">{type.label}</span>
                        {formData.questionTypes.includes(type.id) && (
                          <CheckCircle2 className="h-5 w-5 ml-auto text-purple-600" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full h-14 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-lg gap-3 shadow-lg shadow-purple-200"
                >
                  {isGenerating ? (
                    <>
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Generating Quiz...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      Generate Quiz with AI
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {step === 'preview' && generatedQuiz && (
          <Card className="border-none shadow-2xl shadow-gray-200/50 rounded-[2.5rem] overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100 p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-black">Quiz Preview</CardTitle>
                    <p className="text-sm text-gray-500">Review your quiz before inviting participants</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={copyQuizId} className="gap-2 rounded-xl">
                  <Copy className="h-4 w-4" />
                  Copy ID
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-full flex items-center justify-center bg-purple-100">
                    <Brain className="h-12 w-12 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-black text-gray-900 mb-2">{generatedQuiz.quiz.title}</h2>
                    <p className="text-gray-600">{generatedQuiz.quiz.description || 'No description provided'}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-purple-600" />
                        <span>{generatedQuiz.quiz.timeAllocated} minutes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-purple-600" />
                        <span>{generatedQuiz.quiz.totalMarks} total marks</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-purple-600" />
                        <span>{generatedQuiz.quiz.passMark}% pass mark</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Quiz Questions */}
              <div className="space-y-6">
                <h3 className="text-xl font-black text-gray-900 mb-4">Quiz Questions ({generatedQuiz.questions.length})</h3>
                <div className="space-y-4">
                  {generatedQuiz.questions.map((question, index) => (
                    <div key={question.id} className="border border-gray-200 rounded-xl p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 bg-blue-50 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold">
                          Q{index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="mb-2 font-semibold text-gray-800">{question.question}</div>
                          {question.options && question.options.length > 0 ? (
                            <div className="space-y-2">
                              <div className="text-sm font-medium text-gray-700 mb-1">Options:</div>
                              {question.options.map((option, optIndex) => {
                                const optionLabel = String.fromCharCode(97 + optIndex);
                                const isCorrect = Array.isArray(question.correctAnswer)
                                  ? question.correctAnswer.some(ans => 
                                      (typeof ans === 'object' && ans.text === (typeof option === 'string' ? option : option.text)) ||
                                      (typeof ans === 'string' && ans === (typeof option === 'string' ? option : option.text))
                                    )
                                  : (typeof question.correctAnswer === 'object' && question.correctAnswer.text === (typeof option === 'string' ? option : option.text)) ||
                                    (typeof question.correctAnswer === 'string' && question.correctAnswer === (typeof option === 'string' ? option : option.text));
                                
                                return (
                                  <div key={optIndex} className="flex items-center gap-2 pl-4">
                                    <div className={`w-3 h-3 rounded-full border-2 ${isCorrect ? 'border-green-500 bg-green-500' : 'border-gray-300 bg-gray-50'}`} />
                                    <span className={`flex-1 ${isCorrect ? 'text-green-700 font-bold' : ''}`}>
                                      {optionLabel}) {typeof option === 'string' ? option : option.text}
                                      {isCorrect && <span className="ml-2 text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase tracking-widest font-black">Correct Answer</span>}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="mt-2 p-4 bg-green-50 rounded-2xl border border-green-100">
                              <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1">Correct Answer</p>
                              <p className="text-sm font-bold text-green-900">{Array.isArray(question.correctAnswer) ? question.correctAnswer.join(', ') : String(question.correctAnswer)}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex-shrink-0 text-xs font-medium text-gray-500">
                          {question.marks} marks
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Time Settings */}
              <div className="space-y-6">
                <h3 className="text-xl font-black text-gray-900 mb-4">Quiz Availability & Timing</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-widest">
                      <Calendar className="h-4 w-4 text-purple-600" />
                      Available From
                    </label>
                    <p className="text-gray-700">{new Date(generatedQuiz.quiz.startDateTime).toLocaleString()}</p>
                  </div>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-widest">
                      <Calendar className="h-4 w-4 text-purple-600" />
                      Available Until
                    </label>
                    <p className="text-gray-700">{new Date(generatedQuiz.quiz.endDateTime).toLocaleString()}</p>
                  </div>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-widest">
                      <Clock className="h-4 w-4 text-purple-600" />
                      Duration
                    </label>
                    <p className="text-gray-700">{generatedQuiz.quiz.durationMinutes} minutes</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="px-6 py-4 border-t border-gray-100 flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => setStep('configure')}
                className="gap-2 rounded-xl"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Configure
              </Button>
              <Button
                onClick={() => setStep('invite')}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-lg gap-3 shadow-lg shadow-purple-200"
              >
                <ArrowRight className="h-4 w-4" />
                Continue to Invite Participants
              </Button>
            </CardFooter>
          </Card>
        )}
        {step === 'invite' && generatedQuiz && (
          <div className="space-y-6">
            <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-100 rounded-xl">
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-black">Quiz Generated!</CardTitle>
                      <p className="text-sm text-gray-500">ID: {generatedQuiz.quiz.id.slice(0, 8)}...</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={copyQuizId} className="gap-2 rounded-xl">
                    <Copy className="h-4 w-4" />
                    Copy ID
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-black text-blue-600">{generatedQuiz.questions.length}</div>
                    <div className="text-xs font-bold text-blue-800 uppercase">Questions</div>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-black text-purple-600">{generatedQuiz.quiz.passMark}%</div>
                    <div className="text-xs font-bold text-purple-800 uppercase">Pass Mark</div>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-black text-green-600">{generatedQuiz.quiz.timeAllocated}</div>
                    <div className="text-xs font-bold text-green-800 uppercase">Minutes</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-2xl shadow-gray-200/50 rounded-[2.5rem] overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100 p-8">
                <div className="flex items-center gap-3">
                  <Users className="h-6 w-6 text-purple-600" />
                  <CardTitle className="text-xl font-black">Add Participants</CardTitle>
                </div>
                <p className="text-gray-500 font-medium mt-2">Add participants who will receive an email invite to take the quiz</p>
              </CardHeader>
              <CardContent className="p-8">
                {error && (
                  <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 mb-6">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                )}

                <div className="space-y-6">
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addParticipant())}
                        placeholder="Enter email address..."
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-purple-500 font-medium"
                      />
                    </div>
                    <Button onClick={addParticipant} className="rounded-2xl gap-2 bg-purple-600 hover:bg-purple-700">
                      <Plus className="h-4 w-4" />
                      Add
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleExcelUpload}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-2xl gap-2"
                    >
                      <FileSpreadsheet className="h-4 w-4" />
                      Upload Excel
                    </Button>
                  </div>

                  <p className="text-xs text-gray-500">
                    Upload a CSV or Excel file with an &quot;email&quot; column, or add emails manually
                  </p>

                  {participants.length > 0 && (
                    <div className="border-2 border-gray-100 rounded-2xl overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-700">{participants.length} Participant{participants.length !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
                        {participants.map((p) => (
                          <div key={p.id} className="flex items-center justify-between px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-sm">
                                {p.firstName[0]}{p.lastName[0]}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{p.email}</p>
                                <p className="text-xs text-gray-500">{p.firstName} {p.lastName}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => removeParticipant(p.id)}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={sendInvites}
                    disabled={participants.length === 0 || isSendingInvites}
                    className="w-full h-14 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-lg gap-3 shadow-lg shadow-purple-200 disabled:opacity-50"
                  >
                    {isSendingInvites ? (
                      <>
                        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending Invites...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        Send Invites ({participants.length})
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 'complete' && generatedQuiz && (
          <div className="space-y-6">
            <Card className="border-none shadow-2xl shadow-gray-200/50 rounded-[2.5rem] overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100 p-8">
                <div className="flex items-center justify-center gap-4">
                  <div className="p-4 bg-green-100 rounded-full">
                    <CheckCircle2 className="h-12 w-12 text-green-600" />
                  </div>
                  <div className="text-center">
                    <CardTitle className="text-3xl font-black text-green-900">Invites Sent Successfully!</CardTitle>
                    <p className="text-green-700 font-medium mt-2">
                      {participants.length} participant{participants.length !== 1 ? 's have' : ' has'} been invited
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="bg-purple-50 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-lg text-purple-900">Learner Access Link</h3>
                      <Button variant="ghost" size="sm" onClick={copyInviteLink} className="gap-2 text-purple-600">
                        <Copy className="h-4 w-4" />
                        Copy Link
                      </Button>
                    </div>
                    <code className="text-sm bg-white px-4 py-3 rounded-xl border border-purple-200 font-mono block break-all text-purple-700">
                      {typeof window !== 'undefined' ? `${window.location.origin}/quiz/take/${generatedQuiz.quiz.id}` : ''}
                    </code>
                    <div className="flex items-center justify-between mt-4 p-4 bg-white rounded-xl border border-purple-100">
                      <div>
                        <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Quiz ID</p>
                        <p className="text-sm font-mono font-bold text-purple-900">{generatedQuiz.quiz.id}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={copyQuizId} className="h-8 rounded-lg gap-2 text-purple-600">
                        <Copy className="h-3 w-3" />
                        Copy ID
                      </Button>
                    </div>
                    <p className="text-xs text-purple-700 mt-3">
                      Participants can access the quiz using this link after receiving their invite email
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h3 className="font-bold text-lg text-gray-900 mb-4">Participants Invited</h3>
                    <div className="space-y-2">
                      {participants.map((p) => (
                        <div key={p.id} className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          </div>
                          <span className="font-medium text-gray-900">{p.email}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      onClick={() => router.push('/tutor/sessions')}
                      variant="outline"
                      className="flex-1 h-12 rounded-2xl gap-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to Sessions
                    </Button>
                    <Button
                      onClick={resetForm}
                      className="flex-1 h-12 rounded-2xl bg-purple-600 hover:bg-purple-700 gap-2"
                    >
                      <Sparkles className="h-4 w-4" />
                      Create Another Quiz
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}
