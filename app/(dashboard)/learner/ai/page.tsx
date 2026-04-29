'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { Brain, Mic, BookOpen, Layers, Send, Sparkles, FileAudio, CheckCircle2 } from 'lucide-react';

export default function AIFeaturesPage() {
  const [activeTab, setActiveTab] = useState<'quiz' | 'flashcards' | 'transcribe'>('quiz');
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Transcription states
  const [file, setFile] = useState<File | null>(null);

  const handleGenerateQuiz = async () => {
    if (!topic) return;
    setIsLoading(true);
    try {
      const response = await api.post('/ai/quiz', { topic });
      setResult(response);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateFlashcards = async () => {
    if (!topic) return;
    setIsLoading(true);
    try {
      const response = await api.post('/ai/flashcards', { topic });
      setResult(response);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTranscribe = async () => {
    if (!file) return;
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.upload<any>('/ai/transcribe', formData);
      setResult(response);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-blue-600" />
            AI Study Assistant
          </h1>
          <p className="text-gray-500 mt-1">Leverage AI to enhance your learning experience</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-2xl w-fit">
          <button 
            onClick={() => { setActiveTab('quiz'); setResult(null); }}
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

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Controls */}
          <Card className="lg:col-span-1 border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Generation Tools</CardTitle>
              <CardDescription>
                {activeTab === 'quiz' && 'Generate a custom quiz on any topic.'}
                {activeTab === 'flashcards' && 'Create study flashcards instantly.'}
                {activeTab === 'transcribe' && 'Convert audio lectures to text.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {activeTab === 'transcribe' ? (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-blue-400 transition-colors group">
                    <input 
                      type="file" 
                      id="audio-upload" 
                      className="hidden" 
                      accept="audio/*" 
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                    <label htmlFor="audio-upload" className="cursor-pointer space-y-2 block">
                      <FileAudio className="h-12 w-12 text-gray-300 mx-auto group-hover:text-blue-500 transition-colors" />
                      <p className="text-sm font-medium text-gray-600">{file ? file.name : 'Click to upload audio file'}</p>
                      <p className="text-xs text-gray-400">MP3, WAV up to 25MB</p>
                    </label>
                  </div>
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700" 
                    onClick={handleTranscribe}
                    disabled={!file || isLoading}
                    isLoading={isLoading}
                  >
                    Start Transcription
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Input
                    label="Topic"
                    placeholder="e.g. Quantum Physics, Web Dev..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700" 
                    onClick={activeTab === 'quiz' ? handleGenerateQuiz : handleGenerateFlashcards}
                    disabled={!topic || isLoading}
                    isLoading={isLoading}
                  >
                    {activeTab === 'quiz' ? 'Generate Quiz' : 'Create Flashcards'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Result Display */}
          <div className="lg:col-span-2">
            {!result && !isLoading ? (
              <div className="h-full min-h-[400px] bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                <Brain className="h-16 w-16 mb-4 opacity-20" />
                <h3 className="text-xl font-bold opacity-50">Awaiting Input</h3>
                <p className="max-w-xs mt-2 opacity-50">Select a tool and provide a topic to see the magic happen.</p>
              </div>
            ) : isLoading ? (
              <div className="h-full min-h-[400px] bg-white rounded-3xl shadow-lg p-12 flex flex-col items-center justify-center text-center space-y-4">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                  <Sparkles className="absolute inset-0 m-auto h-8 w-8 text-blue-600 animate-pulse" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">AI is thinking...</h3>
                <p className="text-gray-500">Generating premium learning materials for you.</p>
              </div>
            ) : (
              <Card className="h-full border-none shadow-lg overflow-hidden flex flex-col bg-white">
                <CardHeader className="bg-gray-50 border-b">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    Generation Complete
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 overflow-y-auto max-h-[600px]">
                  {activeTab === 'quiz' && result.questions && (
                    <div className="space-y-6">
                      {result.questions.map((q: any, i: number) => (
                        <div key={i} className="p-4 bg-gray-50 rounded-2xl border">
                          <p className="font-bold mb-3">{i+1}. {q.question}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {q.options && typeof q.options === 'object' && Object.entries(q.options).map(([key, val]) => (
                              <div key={key} className="p-2 bg-white rounded-lg text-sm border">
                                {String(val)}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {activeTab === 'flashcards' && result.flashcards && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {result.flashcards.map((card: any, i: number) => (
                        <div key={i} className="p-6 bg-gradient-to-br from-white to-gray-50 rounded-2xl border shadow-sm aspect-video flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-md transition-all">
                          <p className="text-xs text-blue-600 font-bold mb-2 uppercase tracking-widest">Question</p>
                          <p className="font-bold">{card.front}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {activeTab === 'transcribe' && result.transcription && (
                    <div className="prose prose-sm max-w-none">
                      <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                        {result.transcription}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
