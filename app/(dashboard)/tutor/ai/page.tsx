'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { Brain, Sparkles, FileAudio, CheckCircle2, AlertCircle, Plus, Trash2, Send, ChevronRight, ChevronLeft } from 'lucide-react';
import { QuizPlayer } from '@/components/ai/quiz-player';
import { FlashcardDeck } from '@/components/ai/flashcard-deck';
import { toast } from 'react-hot-toast';

type QuizStep = 'config' | 'preview' | 'invite';

export default function AIFeaturesPage() {
  const [activeTab, setActiveTab] = useState<'quiz' | 'flashcards' | 'transcribe'>('quiz');
  const [quizStep, setQuizStep] = useState<QuizStep>('config');
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Quiz Config States
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState('medium');
  const [duration, setDuration] = useState(30);
  const [passMark, setPassMark] = useState(70);
  const [totalMarks, setTotalMarks] = useState(100);

  // Invitation States
  const [participants, setParticipants] = useState<{ name: string; email: string }[]>([]);
  const [newParticipant, setNewParticipant] = useState({ name: '', email: '' });

  // Transcription states
  const [file, setFile] = useState<File | null>(null);

  const extractMessage = (err: unknown): string => {
    if (err instanceof Error) return err.message;
    if (err && typeof err === 'object' && 'message' in err) return String((err as any).message);
    return 'Something went wrong. Please try again.';
  };

  const handleGenerateQuiz = async () => {
    if (!topic) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await api.post('/ai/quiz', { 
        topic,
        numberOfQuestions: numQuestions,
        difficultyLevel: difficulty,
        durationMinutes: duration,
        passMark,
        totalMarks
      });
      setResult(response);
      setQuizStep('preview');
    } catch (err) {
      console.error('[AI Quiz]', err);
      setError(extractMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAndInvite = async () => {
    setIsLoading(true);
    try {
      await api.post('/ai/quiz/save-and-invite', {
        title: `AI Quiz: ${topic}`,
        description: `Generated quiz on ${topic}`,
        timeAllocated: duration,
        passMark,
        totalMarks,
        questions: result.questions,
        participants
      });
      toast.success('Quiz saved and invites sent successfully!');
      setResult(null);
      setQuizStep('config');
      setTopic('');
      setParticipants([]);
    } catch (err) {
      console.error('[Save & Invite]', err);
      toast.error('Failed to send invites: ' + extractMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const addParticipant = () => {
    if (!newParticipant.name || !newParticipant.email) return;
    if (!newParticipant.email.includes('@')) {
      toast.error('Invalid email address');
      return;
    }
    setParticipants([...participants, newParticipant]);
    setNewParticipant({ name: '', email: '' });
  };

  const removeParticipant = (index: number) => {
    setParticipants(participants.filter((_, i) => i !== index));
  };

  const handleGenerateFlashcards = async () => {
    if (!topic) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await api.post('/ai/flashcards', { topic });
      setResult(response);
    } catch (err) {
      console.error('[AI Flashcards]', err);
      setError(extractMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleTranscribe = async () => {
    if (!file) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.upload<any>('/ai/transcribe', formData);
      setResult(response);
    } catch (err) {
      console.error('[AI Transcribe]', err);
      setError(extractMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-blue-600" />
              AI Teaching Assistant
            </h1>
            <p className="text-gray-500 mt-1">Leverage AI to prepare course materials and transcribe lectures</p>
          </div>
          {activeTab === 'quiz' && result && (
            <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
              <div className={`h-2 w-2 rounded-full ${quizStep === 'preview' ? 'bg-blue-600' : 'bg-gray-300'}`} />
              <div className={`h-2 w-2 rounded-full ${quizStep === 'invite' ? 'bg-blue-600' : 'bg-gray-300'}`} />
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider ml-1">
                Step {quizStep === 'preview' ? '2: Preview' : '3: Invite'}
              </span>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-2xl w-fit">
          <button
            onClick={() => { setActiveTab('quiz'); setResult(null); setQuizStep('config'); }}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'quiz' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Quiz Generator
          </button>
          <button
            onClick={() => { setActiveTab('flashcards'); setResult(null); }}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'flashcards' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Flashcards
          </button>
          <button
            onClick={() => { setActiveTab('transcribe'); setResult(null); }}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'transcribe' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Transcription
          </button>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Controls - Left Side (Desktop) */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Settings</CardTitle>
                <CardDescription>
                  Configure your generation options.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {activeTab === 'quiz' && quizStep === 'config' && (
                  <>
                    <Input
                      label="Topic"
                      placeholder="e.g. Quantum Physics"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Questions"
                        type="number"
                        min={1}
                        max={20}
                        value={numQuestions}
                        onChange={(e) => setNumQuestions(Number(e.target.value))}
                      />
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Difficulty</label>
                        <select 
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                          value={difficulty}
                          onChange={(e) => setDifficulty(e.target.value)}
                        >
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                        </select>
                      </div>
                    </div>
                    <Input
                      label="Duration (min)"
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                    />
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={handleGenerateQuiz}
                      disabled={!topic || isLoading}
                      isLoading={isLoading}
                    >
                      <Brain className="h-4 w-4 mr-2" />
                      Generate Quiz
                    </Button>
                  </>
                )}

                {activeTab === 'flashcards' && (
                  <>
                    <Input
                      label="Topic"
                      placeholder="e.g. Ancient Rome"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                    />
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={handleGenerateFlashcards}
                      disabled={!topic || isLoading}
                      isLoading={isLoading}
                    >
                      Create Flashcards
                    </Button>
                  </>
                )}

                {activeTab === 'transcribe' && (
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center hover:border-blue-400 transition-colors group">
                      <input
                        type="file"
                        id="audio-upload"
                        className="hidden"
                        accept="audio/*"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                      />
                      <label htmlFor="audio-upload" className="cursor-pointer space-y-2 block">
                        <FileAudio className="h-8 w-8 text-gray-300 mx-auto group-hover:text-blue-500 transition-colors" />
                        <p className="text-xs font-medium text-gray-600 truncate">{file ? file.name : 'Upload Audio'}</p>
                      </label>
                    </div>
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={handleTranscribe}
                      disabled={!file || isLoading}
                      isLoading={isLoading}
                    >
                      Transcribe
                    </Button>
                  </div>
                )}

                {activeTab === 'quiz' && result && quizStep !== 'config' && (
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-gray-400 uppercase">Navigation</p>
                    {quizStep === 'preview' && (
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => setQuizStep('config')}
                      >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Back to Settings
                      </Button>
                    )}
                    {quizStep === 'invite' && (
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => setQuizStep('preview')}
                      >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Back to Preview
                      </Button>
                    )}
                    {quizStep === 'preview' && (
                      <Button 
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        onClick={() => setQuizStep('invite')}
                      >
                        Send Invites
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {error ? (
              <div className="h-full min-h-[500px] bg-red-50 border-2 border-red-200 rounded-3xl flex flex-col items-center justify-center text-center p-8 space-y-4">
                <AlertCircle className="h-12 w-12 text-red-400" />
                <div>
                  <h3 className="text-lg font-bold text-red-700">Generation Failed</h3>
                  <p className="text-red-600 mt-1 text-sm max-w-sm">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-xs text-red-500 underline hover:text-red-700"
                >
                  Try Again
                </button>
              </div>
            ) : !result && !isLoading ? (
              <div className="h-full min-h-[500px] bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                <Brain className="h-16 w-16 mb-4 opacity-20" />
                <h3 className="text-xl font-bold opacity-50">Awaiting Input</h3>
                <p className="max-w-xs mt-2 opacity-50">Configure the options on the left and start generating materials.</p>
              </div>
            ) : isLoading ? (
              <div className="h-full min-h-[500px] bg-white rounded-3xl shadow-lg p-12 flex flex-col items-center justify-center text-center space-y-4">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                  <Sparkles className="absolute inset-0 m-auto h-8 w-8 text-blue-600 animate-pulse" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">AI is generating...</h3>
                <p className="text-gray-500">Preparing high-quality content for your students.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {activeTab === 'quiz' && quizStep === 'preview' && (
                  <Card className="border-none shadow-xl bg-white overflow-hidden">
                    <CardHeader className="bg-gray-50 border-b flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-xl">Step 2: Preview Questions</CardTitle>
                        <CardDescription>Review the generated questions before sending invites.</CardDescription>
                      </div>
                      <Button onClick={() => setQuizStep('invite')} className="bg-blue-600 hover:bg-blue-700">
                        Looks Good
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </CardHeader>
                    <CardContent className="p-0 max-h-[600px] overflow-y-auto">
                      <QuizPlayer questions={result.questions} />
                    </CardContent>
                  </Card>
                )}

                {activeTab === 'quiz' && quizStep === 'invite' && (
                  <Card className="border-none shadow-xl bg-white">
                    <CardHeader className="bg-gray-50 border-b">
                      <CardTitle className="text-xl">Step 3: Invite Participants</CardTitle>
                      <CardDescription>Send email invitations to participate in this quiz.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                      <div className="grid md:grid-cols-2 gap-8">
                        {/* Add Form */}
                        <div className="space-y-4">
                          <h4 className="font-bold text-gray-700 flex items-center gap-2">
                            <Plus className="h-4 w-4 text-blue-600" />
                            Add Participant
                          </h4>
                          <div className="space-y-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <Input
                              placeholder="Full Name"
                              value={newParticipant.name}
                              onChange={(e) => setNewParticipant({ ...newParticipant, name: e.target.value })}
                            />
                            <Input
                              placeholder="Email Address"
                              type="email"
                              value={newParticipant.email}
                              onChange={(e) => setNewParticipant({ ...newParticipant, email: e.target.value })}
                            />
                            <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={addParticipant}>
                              Add to List
                            </Button>
                          </div>
                        </div>

                        {/* Participant List */}
                        <div className="space-y-4">
                          <h4 className="font-bold text-gray-700 flex justify-between items-center">
                            <span>Invite List ({participants.length})</span>
                            {participants.length > 0 && (
                              <button onClick={() => setParticipants([])} className="text-xs text-red-500 hover:underline">Clear All</button>
                            )}
                          </h4>
                          <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2">
                            {participants.length === 0 ? (
                              <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                <p className="text-sm text-gray-400">No participants added yet.</p>
                              </div>
                            ) : (
                              participants.map((p, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                                  <div>
                                    <p className="text-sm font-bold text-gray-900">{p.name}</p>
                                    <p className="text-xs text-gray-500">{p.email}</p>
                                  </div>
                                  <button onClick={() => removeParticipant(i)} className="text-gray-400 hover:text-red-500 transition-colors">
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="pt-6 border-t flex justify-end gap-4">
                        <Button variant="ghost" onClick={() => setQuizStep('preview')}>Back to Preview</Button>
                        <Button 
                          className="bg-green-600 hover:bg-green-700 px-8" 
                          disabled={participants.length === 0 || isLoading}
                          onClick={handleSaveAndInvite}
                          isLoading={isLoading}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Finalize & Send Emails
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {activeTab === 'flashcards' && result.flashcards && (
                  <Card className="border-none shadow-xl overflow-hidden bg-white">
                    <CardHeader className="bg-gray-50 border-b">
                      <CardTitle className="text-lg">Generated Flashcards</CardTitle>
                    </CardHeader>
                    <CardContent className="p-12">
                      <FlashcardDeck flashcards={result.flashcards} />
                    </CardContent>
                  </Card>
                )}

                {activeTab === 'transcribe' && result.transcription && (
                  <Card className="border-none shadow-xl bg-white overflow-hidden">
                    <CardHeader className="bg-gray-50 border-b">
                      <CardTitle className="text-lg">Transcription Result</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                      <div className="prose prose-blue max-w-none">
                        <p className="whitespace-pre-wrap text-gray-700 leading-relaxed font-medium">
                          {result.transcription}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
