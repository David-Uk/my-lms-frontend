'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { Brain, Sparkles, FileAudio, CheckCircle2, AlertCircle, Bookmark, Trash2, RotateCcw, BookmarkCheck, Clock } from 'lucide-react';
import { QuizPlayer } from '@/components/ai/quiz-player';
import { FlashcardDeck } from '@/components/ai/flashcard-deck';
import { useSavedItems, type SavedQuiz, type SavedFlashcardSet } from '@/stores/saved-items-store';

type Tab = 'quiz' | 'flashcards' | 'transcribe' | 'saved';

export default function AIFeaturesPage() {
  const [activeTab, setActiveTab] = useState<Tab>('quiz');
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedQuizId, setSavedQuizId] = useState<string | null>(null);
  const [savedFlashcardId, setSavedFlashcardId] = useState<string | null>(null);

  const [file, setFile] = useState<File | null>(null);

  const {
    savedQuizzes,
    savedFlashcardSets,
    saveQuiz,
    saveFlashcardSet,
    updateQuizResult,
    deleteQuiz,
    deleteFlashcardSet,
    refreshFromApi,
  } = useSavedItems();

  const syncSaved = useCallback(() => {
    if (activeTab === 'saved') {
      refreshFromApi();
    }
  }, [activeTab, refreshFromApi]);

  useEffect(() => {
    syncSaved();
  }, [syncSaved]);

  const [viewingSavedQuiz, setViewingSavedQuiz] = useState<SavedQuiz | null>(null);
  const [viewingSavedFlashcards, setViewingSavedFlashcards] = useState<SavedFlashcardSet | null>(null);

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
    setSavedQuizId(null);
    try {
      const response = await api.post('/ai/quiz', { topic });
      setResult(response);
    } catch (err) {
      console.error('[AI Quiz]', err);
      setError(extractMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateFlashcards = async () => {
    if (!topic) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    setSavedFlashcardId(null);
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

  const handleSaveQuiz = () => {
    if (!result?.questions) return;
    const id = saveQuiz({
      topic,
      title: `Quiz: ${topic}`,
      questions: result.questions,
    });
    setSavedQuizId(id);
  };

  const handleSaveFlashcards = () => {
    if (!result?.flashcards) return;
    const id = saveFlashcardSet({
      topic,
      flashcards: result.flashcards,
    });
    setSavedFlashcardId(id);
  };

  const handleQuizComplete = (score: number, total: number) => {
    if (savedQuizId) {
      updateQuizResult(savedQuizId, score, total);
    }
  };

  const handleViewSavedQuiz = (quiz: SavedQuiz) => {
    setActiveTab('quiz');
    setResult({ questions: quiz.questions });
    setSavedQuizId(quiz.id);
    setTopic(quiz.topic);
    setViewingSavedQuiz(quiz);
  };

  const handleViewSavedFlashcards = (set: SavedFlashcardSet) => {
    setActiveTab('flashcards');
    setResult({ flashcards: set.flashcards });
    setSavedFlashcardId(set.id);
    setTopic(set.topic);
    setViewingSavedFlashcards(set);
  };

  const handleNewGeneration = () => {
    setResult(null);
    setSavedQuizId(null);
    setSavedFlashcardId(null);
    setViewingSavedQuiz(null);
    setViewingSavedFlashcards(null);
    setTopic('');
    setError(null);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const renderSavedItems = () => (
    <div className="space-y-8">
      {/* Saved Quizzes */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Saved Quizzes</h3>
        {savedQuizzes.length === 0 ? (
          <p className="text-sm text-gray-400 py-8 text-center border-2 border-dashed border-gray-200 rounded-lg">
            No saved quizzes yet. Generate and save a quiz to see it here.
          </p>
        ) : (
          <div className="space-y-2">
            {savedQuizzes.map((quiz) => (
              <div key={quiz.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                <div className="flex-1 min-w-0 mr-4">
                  <p className="text-sm font-medium text-gray-900 truncate">{quiz.title}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <Clock className="h-3 w-3" />
                    {formatDate(quiz.createdAt)} · {quiz.questions.length} questions
                    {quiz.score !== null && (
                      <span className="font-medium text-blue-600">
                        · Score: {quiz.score}/{quiz.totalAnswered}
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewSavedQuiz(quiz)}
                  >
                    {quiz.score !== null ? 'Retake' : 'Start'}
                  </Button>
                  <button
                    onClick={() => deleteQuiz(quiz.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Saved Flashcards */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Saved Flashcard Sets</h3>
        {savedFlashcardSets.length === 0 ? (
          <p className="text-sm text-gray-400 py-8 text-center border-2 border-dashed border-gray-200 rounded-lg">
            No saved flashcard sets yet. Generate and save flashcards to see them here.
          </p>
        ) : (
          <div className="space-y-2">
            {savedFlashcardSets.map((set) => (
              <div key={set.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                <div className="flex-1 min-w-0 mr-4">
                  <p className="text-sm font-medium text-gray-900 truncate">Flashcards: {set.topic}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <Clock className="h-3 w-3" />
                    {formatDate(set.createdAt)} · {set.flashcards.length} cards
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewSavedFlashcards(set)}
                  >
                    Review
                  </Button>
                  <button
                    onClick={() => deleteFlashcardSet(set.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-blue-600" />
              AI Study Assistant
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Leverage AI to enhance your learning experience</p>
          </div>
          {(result || viewingSavedQuiz || viewingSavedFlashcards) && activeTab !== 'saved' && (
            <Button variant="ghost" size="sm" onClick={handleNewGeneration}>
              New Generation
            </Button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-lg w-fit">
          {(['quiz', 'flashcards', 'transcribe', 'saved'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); if (tab === 'saved') { setResult(null); setViewingSavedQuiz(null); setViewingSavedFlashcards(null); } }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {tab === 'quiz' && 'Quiz Generator'}
              {tab === 'flashcards' && 'Flashcards'}
              {tab === 'transcribe' && 'Transcription'}
              {tab === 'saved' && 'Saved Items'}
            </button>
          ))}
        </div>

        {activeTab === 'saved' ? (
          renderSavedItems()
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Generation Tools</CardTitle>
                <CardDescription>
                  {activeTab === 'quiz' && 'Generate a custom quiz on any topic.'}
                  {activeTab === 'flashcards' && 'Create study flashcards instantly.'}
                  {activeTab === 'transcribe' && 'Convert audio lectures to text.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeTab === 'transcribe' ? (
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-blue-400 transition-colors group">
                      <input
                        type="file"
                        id="audio-upload"
                        className="hidden"
                        accept="audio/*"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                      />
                      <label htmlFor="audio-upload" className="cursor-pointer space-y-2 block">
                        <FileAudio className="h-10 w-10 text-gray-300 mx-auto group-hover:text-blue-500 transition-colors" />
                        <p className="text-sm font-medium text-gray-600">{file ? file.name : 'Click to upload audio'}</p>
                        <p className="text-xs text-gray-400">MP3, WAV up to 25MB</p>
                      </label>
                    </div>
                    <Button
                      className="w-full"
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
                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        onClick={activeTab === 'quiz' ? handleGenerateQuiz : handleGenerateFlashcards}
                        disabled={!topic || isLoading}
                        isLoading={isLoading}
                      >
                        {activeTab === 'quiz' ? 'Generate' : 'Create'}
                      </Button>
                      {result && (
                        <Button
                          variant="outline"
                          onClick={activeTab === 'quiz' ? handleSaveQuiz : handleSaveFlashcards}
                          disabled={activeTab === 'quiz' ? !result?.questions : !result?.flashcards}
                          className={savedQuizId && activeTab === 'quiz' || savedFlashcardId && activeTab === 'flashcards' ? 'text-green-600 border-green-300' : ''}
                          title="Save for later"
                        >
                          {savedQuizId && activeTab === 'quiz' || savedFlashcardId && activeTab === 'flashcards'
                            ? <BookmarkCheck className="h-4 w-4" />
                            : <Bookmark className="h-4 w-4" />
                          }
                        </Button>
                      )}
                    </div>
                    {savedQuizId && activeTab === 'quiz' && (
                      <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Quiz saved! View it in Saved Items.
                      </p>
                    )}
                    {savedFlashcardId && activeTab === 'flashcards' && (
                      <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Flashcards saved! View them in Saved Items.
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Result Display */}
            <div className="lg:col-span-2">
              {error ? (
                <div className="h-full min-h-[300px] bg-red-50 border-2 border-red-200 rounded-lg flex flex-col items-center justify-center text-center p-8 space-y-4">
                  <AlertCircle className="h-10 w-10 text-red-400" />
                  <div>
                    <h3 className="text-base font-bold text-red-700">Generation Failed</h3>
                    <p className="text-red-600 mt-1 text-sm max-w-sm">{error}</p>
                  </div>
                  <button
                    onClick={() => setError(null)}
                    className="text-xs text-red-500 underline hover:text-red-700"
                  >
                    Dismiss
                  </button>
                </div>
              ) : !result && !isLoading ? (
                <div className="h-full min-h-[300px] bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                  <Brain className="h-12 w-12 mb-3 opacity-20" />
                  <h3 className="text-base font-bold opacity-50">Awaiting Input</h3>
                  <p className="text-xs mt-1 opacity-50 max-w-xs">Select a tool and provide a topic to see the magic happen.</p>
                </div>
              ) : isLoading ? (
                <div className="h-full min-h-[300px] bg-white rounded-lg border p-8 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                    <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-blue-600 animate-pulse" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900">AI is thinking...</h3>
                  <p className="text-sm text-gray-500">Generating premium learning materials for you.</p>
                </div>
              ) : (
                <Card className="h-full border overflow-hidden flex flex-col">
                  <CardHeader className="bg-gray-50 border-b py-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Generation Complete
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 overflow-y-auto max-h-[600px]">
                    {activeTab === 'quiz' && result?.questions && (
                      <QuizPlayer
                        questions={result.questions}
                        savedQuizId={savedQuizId || undefined}
                        onSave={handleQuizComplete}
                      />
                    )}
                    {activeTab === 'flashcards' && result?.flashcards && (
                      <FlashcardDeck flashcards={result.flashcards} />
                    )}
                    {activeTab === 'transcribe' && result?.transcription && (
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
        )}
      </div>
    </>
  );
}
