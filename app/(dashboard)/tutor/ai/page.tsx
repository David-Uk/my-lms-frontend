'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import {
  Brain,
  Sparkles,
  FileAudio,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Send,
  ChevronRight,
  ChevronLeft,
  Edit,
  Eye,
  RefreshCw,
  Clock,
  Calendar,
  Users,
  ShieldAlert,
  AlertTriangle,
  Award,
  BookOpen,
  Info,
  CheckCircle,
} from 'lucide-react';
import { QuizPlayer } from '@/components/ai/quiz-player';
import { FlashcardDeck } from '@/components/ai/flashcard-deck';
import { toast } from 'react-hot-toast';

type QuizView =
  | 'list'
  | 'create'
  | 'ai-config'
  | 'manual-config'
  | 'preview'
  | 'invite'
  | 'stats'
  | 'edit';

export default function AIFeaturesPage() {
  const [activeTab, setActiveTab] = useState<'quiz' | 'flashcards' | 'transcribe'>('quiz');
  const [quizView, setQuizView] = useState<QuizView>('list');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Loaded Quizzes
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [isQuizzesLoading, setIsQuizzesLoading] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);

  // AI Quiz Config States
  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState('medium');
  const [duration, setDuration] = useState(30);
  const [passMark, setPassMark] = useState(70);
  const [totalMarks, setTotalMarks] = useState(100);
  const [result, setResult] = useState<any>(null); // Stores AI gen preview

  // Manual Quiz Config States
  const [manualTitle, setManualTitle] = useState('');
  const [manualDescription, setManualDescription] = useState('');
  const [manualDuration, setManualDuration] = useState(30);
  const [manualPassMark, setManualPassMark] = useState(70);
  const [manualTotalMarks, setManualTotalMarks] = useState(100);
  const [manualStartDate, setManualStartDate] = useState('');
  const [manualEndDate, setManualEndDate] = useState('');
  const [manualQuestions, setManualQuestions] = useState<any[]>([]);

  // Manual New Question States
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionType, setNewQuestionType] = useState('single_option');
  const [newQuestionOptions, setNewQuestionOptions] = useState(['', '', '', '']);
  const [newQuestionCorrect, setNewQuestionCorrect] = useState(0);
  const [newQuestionMarks, setNewQuestionMarks] = useState(5);
  const [newQuestionTimeLimit, setNewQuestionTimeLimit] = useState(30);

  // Question Editing States (Inside Edit View)
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editQuestionText, setEditQuestionText] = useState('');
  const [editQuestionType, setEditQuestionType] = useState('single_option');
  const [editQuestionOptions, setEditQuestionOptions] = useState(['', '', '', '']);
  const [editQuestionCorrect, setEditQuestionCorrect] = useState(0);
  const [editQuestionMarks, setEditQuestionMarks] = useState(5);
  const [editQuestionTimeLimit, setEditQuestionTimeLimit] = useState(30);

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

  const fetchQuizzes = async () => {
    setIsQuizzesLoading(true);
    try {
      const response = await api.get<any[]>('/quizzes/standalone');
      setQuizzes(response || []);
    } catch (err) {
      console.error('[Fetch Quizzes]', err);
      toast.error('Failed to load quizzes');
    } finally {
      setIsQuizzesLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'quiz') {
      fetchQuizzes();
    }
  }, [activeTab]);

  // AI Quiz Generation
  const handleGenerateQuiz = async () => {
    if (!topic) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await api.post<any>('/ai/quiz', {
        topic,
        numberOfQuestions: numQuestions,
        difficultyLevel: difficulty,
        durationMinutes: duration,
        passMark,
        totalMarks,
      });
      setResult(response);
      setQuizView('preview');
    } catch (err) {
      console.error('[AI Quiz]', err);
      setError(extractMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  // AI Quiz Save & Invite (Step 3)
  const handleSaveAndInviteAIQuiz = async () => {
    setIsLoading(true);
    try {
      await api.post('/ai/quiz/save-and-invite', {
        title: `AI Quiz: ${topic}`,
        description: `Generated quiz on ${topic}`,
        timeAllocated: duration,
        passMark,
        totalMarks,
        questions: result.questions,
        participants,
      });
      toast.success('Quiz saved and invites sent successfully!');
      setResult(null);
      setTopic('');
      setParticipants([]);
      setQuizView('list');
      fetchQuizzes();
    } catch (err) {
      console.error('[Save & Invite]', err);
      toast.error('Failed to send invites: ' + extractMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Manual Quiz Question Add (Local State)
  const handleAddLocalQuestion = () => {
    if (!newQuestionText.trim()) {
      toast.error('Question text cannot be empty');
      return;
    }
    const finalOptions =
      newQuestionType === 'true_false' ? ['True', 'False'] : newQuestionOptions.filter(o => o.trim());

    if (newQuestionType !== 'true_false' && finalOptions.length < 2) {
      toast.error('Please enter at least 2 options');
      return;
    }

    const correctAns =
      newQuestionType === 'true_false'
        ? newQuestionCorrect === 0
          ? 'True'
          : 'False'
        : finalOptions[newQuestionCorrect] || '';

    const newQ = {
      type: newQuestionType,
      question: newQuestionText,
      options: finalOptions,
      correctAnswer: correctAns,
      marks: newQuestionMarks,
      timeLimit: newQuestionTimeLimit,
    };

    setManualQuestions([...manualQuestions, newQ]);
    setNewQuestionText('');
    setNewQuestionOptions(['', '', '', '']);
    setNewQuestionCorrect(0);
    toast.success('Question added locally');
  };

  // Manual Quiz Save
  const handleSaveManualQuiz = async () => {
    if (!manualTitle.trim()) {
      toast.error('Please enter a quiz title');
      return;
    }
    if (manualQuestions.length === 0) {
      toast.error('Please add at least one question');
      return;
    }

    setIsLoading(true);
    try {
      const quizRes = await api.post<any>('/quizzes/standalone', {
        title: manualTitle,
        description: manualDescription,
        timeAllocated: manualDuration,
        passMark: manualPassMark,
        totalMarks: manualTotalMarks,
        startDateTime: manualStartDate ? new Date(manualStartDate).toISOString() : null,
        endDateTime: manualEndDate ? new Date(manualEndDate).toISOString() : null,
      });

      // Add Questions sequentially
      for (const q of manualQuestions) {
        await api.post(`/quizzes/standalone/${quizRes.id}/questions`, {
          type: q.type,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          marks: q.marks,
          timeLimit: q.timeLimit,
        });
      }

      toast.success('Quiz saved successfully!');
      setSelectedQuiz({ ...quizRes, questions: manualQuestions, participants: [] });
      setManualTitle('');
      setManualDescription('');
      setManualQuestions([]);
      setQuizView('invite');
    } catch (err) {
      console.error('[Save Manual Quiz]', err);
      toast.error('Failed to create manual quiz: ' + extractMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Update existing quiz metadata
  const handleUpdateQuizMetadata = async () => {
    if (!selectedQuiz) return;
    setIsLoading(true);
    try {
      const updatedQuiz = await api.put<any>(`/quizzes/standalone/${selectedQuiz.id}`, {
        title: selectedQuiz.title,
        description: selectedQuiz.description,
        timeAllocated: selectedQuiz.timeAllocated,
        passMark: selectedQuiz.passMark,
        totalMarks: selectedQuiz.totalMarks,
        startDateTime: selectedQuiz.startDateTime ? new Date(selectedQuiz.startDateTime).toISOString() : null,
        endDateTime: selectedQuiz.endDateTime ? new Date(selectedQuiz.endDateTime).toISOString() : null,
      });
      toast.success('Quiz settings updated successfully!');
      setSelectedQuiz({ ...selectedQuiz, ...updatedQuiz });
      fetchQuizzes();
    } catch (err) {
      console.error('[Update Quiz]', err);
      toast.error('Failed to update quiz settings');
    } finally {
      setIsLoading(false);
    }
  };

  // Edit / Add questions inside Edit view
  const handleAddQuestionToExistingQuiz = async () => {
    if (!selectedQuiz) return;
    if (!newQuestionText.trim()) return;

    const finalOptions =
      newQuestionType === 'true_false' ? ['True', 'False'] : newQuestionOptions.filter(o => o.trim());

    const correctAns =
      newQuestionType === 'true_false'
        ? newQuestionCorrect === 0
          ? 'True'
          : 'False'
        : finalOptions[newQuestionCorrect] || '';

    try {
      const addedQ = await api.post<any>(`/quizzes/standalone/${selectedQuiz.id}/questions`, {
        type: newQuestionType,
        question: newQuestionText,
        options: finalOptions,
        correctAnswer: correctAns,
        marks: newQuestionMarks,
        timeLimit: newQuestionTimeLimit,
      });
      toast.success('Question added successfully!');
      setSelectedQuiz({
        ...selectedQuiz,
        questions: [...(selectedQuiz.questions || []), addedQ],
      });
      setNewQuestionText('');
      setNewQuestionOptions(['', '', '', '']);
      setNewQuestionCorrect(0);
    } catch (err) {
      console.error('[Add Question]', err);
      toast.error('Failed to add question');
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!selectedQuiz) return;
    try {
      await api.delete(`/quizzes/standalone/${selectedQuiz.id}/questions/${questionId}`);
      toast.success('Question deleted successfully!');
      setSelectedQuiz({
        ...selectedQuiz,
        questions: selectedQuiz.questions.filter((q: any) => q.id !== questionId),
      });
    } catch (err) {
      console.error('[Delete Question]', err);
      toast.error('Failed to delete question');
    }
  };

  const startEditQuestion = (q: any) => {
    setEditingQuestionId(q.id);
    setEditQuestionText(q.question);
    setEditQuestionType(q.type);
    setEditQuestionOptions(q.options || ['', '', '', '']);
    const corrIndex = (q.options || []).indexOf(q.correctAnswer);
    setEditQuestionCorrect(corrIndex >= 0 ? corrIndex : 0);
    setEditQuestionMarks(q.marks || 5);
    setEditQuestionTimeLimit(q.timeLimit || 30);
  };

  const handleSaveEditedQuestion = async () => {
    if (!selectedQuiz || !editingQuestionId) return;
    const finalOptions =
      editQuestionType === 'true_false' ? ['True', 'False'] : editQuestionOptions.filter(o => o.trim());

    const correctAns =
      editQuestionType === 'true_false'
        ? editQuestionCorrect === 0
          ? 'True'
          : 'False'
        : finalOptions[editQuestionCorrect] || '';

    try {
      const updatedQ = await api.put<any>(
        `/quizzes/standalone/${selectedQuiz.id}/questions/${editingQuestionId}`,
        {
          type: editQuestionType,
          question: editQuestionText,
          options: finalOptions,
          correctAnswer: correctAns,
          marks: editQuestionMarks,
          timeLimit: editQuestionTimeLimit,
        }
      );
      toast.success('Question updated successfully!');
      setSelectedQuiz({
        ...selectedQuiz,
        questions: selectedQuiz.questions.map((q: any) =>
          q.id === editingQuestionId ? updatedQ : q
        ),
      });
      setEditingQuestionId(null);
    } catch (err) {
      console.error('[Edit Question]', err);
      toast.error('Failed to update question');
    }
  };

  // Delete Standalone Quiz
  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm('Are you sure you want to delete this quiz? All participant records will be lost.'))
      return;
    try {
      await api.delete(`/quizzes/standalone/${quizId}`);
      toast.success('Quiz deleted successfully');
      fetchQuizzes();
    } catch (err) {
      console.error('[Delete Quiz]', err);
      toast.error('Failed to delete quiz');
    }
  };

  // Reset participant session (Run another session)
  const handleResetParticipant = async (participantId: string) => {
    if (!selectedQuiz) return;
    try {
      const res = await api.post<any>(
        `/quizzes/standalone/${selectedQuiz.id}/participants/${participantId}/reset`,
        {}
      );
      toast.success('Participant session reset! They can now reuse their invite link to retake.');

      // Update local state
      const updatedParticipants = selectedQuiz.participants.map((p: any) =>
        p.id === participantId ? res.participant : p
      );
      setSelectedQuiz({ ...selectedQuiz, participants: updatedParticipants });

      // Update lists state
      setQuizzes(
        quizzes.map((q: any) =>
          q.id === selectedQuiz.id ? { ...q, participants: updatedParticipants } : q
        )
      );
    } catch (err) {
      console.error('[Reset Participant]', err);
      toast.error('Failed to reset participant session');
    }
  };

  // Add participants to selected quiz
  const handleAddParticipantsOnly = async () => {
    if (!selectedQuiz) return;
    if (participants.length === 0) {
      toast.error('Invite list is empty');
      return;
    }
    setIsLoading(true);
    try {
      await api.post(`/quizzes/standalone/${selectedQuiz.id}/participants`, {
        participants,
      });
      toast.success('New participants added & emails sent!');
      setParticipants([]);
      setQuizView('list');
      fetchQuizzes();
    } catch (err) {
      console.error('[Add Participants]', err);
      toast.error('Failed to add participants');
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

  // AI Flashcards Generation
  const handleGenerateFlashcards = async () => {
    if (!topic) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await api.post<any>('/ai/flashcards', { topic });
      setResult(response);
    } catch (err) {
      console.error('[AI Flashcards]', err);
      setError(extractMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  // AI Audio Transcription
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
    <>
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-blue-600 animate-pulse" />
              AI & Manual Quiz Generator
            </h1>
            <p className="text-gray-500 mt-1">
              Create, manage, and analyze quizzes manually or using AI
            </p>
          </div>
          {activeTab === 'quiz' && quizView === 'preview' && result && (
            <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
              <div className="h-2 w-2 rounded-full bg-blue-600 animate-ping" />
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                Step 2: Preview
              </span>
            </div>
          )}
        </div>

        {/* Top-Level Tabs */}
        <div className="flex bg-gray-100 p-1.5 rounded-2xl w-fit border border-gray-200/50 shadow-sm">
          <button
            onClick={() => {
              setActiveTab('quiz');
              setResult(null);
              setQuizView('list');
              setTopic('');
              setParticipants([]);
            }}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
              activeTab === 'quiz'
                ? 'bg-white text-blue-600 shadow-sm border border-gray-100'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
            }`}
          >
            Quiz Manager
          </button>
          <button
            onClick={() => {
              setActiveTab('flashcards');
              setResult(null);
            }}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
              activeTab === 'flashcards'
                ? 'bg-white text-blue-600 shadow-sm border border-gray-100'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
            }`}
          >
            Flashcards
          </button>
          <button
            onClick={() => {
              setActiveTab('transcribe');
              setResult(null);
            }}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
              activeTab === 'transcribe'
                ? 'bg-white text-blue-600 shadow-sm border border-gray-100'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
            }`}
          >
            Transcription
          </button>
        </div>

        {/* ======================================================== */}
        {/* QUIZ TAB FLOW */}
        {/* ======================================================== */}
        {activeTab === 'quiz' && (
          <div className="space-y-6">
            {/* VIEW 1: QUIZZES LIST (DASHBOARD) */}
            {quizView === 'list' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Your Quizzes</h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                      View performance analytics, host sessions, and add participants
                    </p>
                  </div>
                  <Button
                    onClick={() => setQuizView('create')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md transition-all duration-200 hover:translate-y-[-1px]"
                  >
                    <Plus className="mr-2 h-4 w-4" /> Create New Quiz
                  </Button>
                </div>

                {isQuizzesLoading ? (
                  <div className="h-64 flex flex-col items-center justify-center space-y-4">
                    <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
                    <p className="text-sm text-gray-400 font-medium">Loading quizzes...</p>
                  </div>
                ) : quizzes.length === 0 ? (
                  <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                    <Brain className="h-16 w-16 mx-auto text-gray-300 mb-4 opacity-50 animate-pulse" />
                    <h3 className="text-lg font-bold text-gray-600">No quizzes generated yet</h3>
                    <p className="text-sm text-gray-400 max-w-sm mx-auto mt-2">
                      Get started by creating a manual quiz or generating one using AI.
                    </p>
                    <Button onClick={() => setQuizView('create')} className="mt-6 bg-blue-600 hover:bg-blue-700">
                      Create First Quiz
                    </Button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {quizzes.map((quiz: any) => {
                      const totalInvited = quiz.participants?.length || 0;
                      const attemptedParticipants =
                        quiz.participants?.filter((p: any) => p.status !== 'invited') || [];
                      const totalAttempted = attemptedParticipants.length;
                      const passedParticipants =
                        attemptedParticipants.filter((p: any) => p.passed) || [];
                      const successRate =
                        totalAttempted > 0
                          ? Math.round((passedParticipants.length / totalAttempted) * 100)
                          : 0;

                      return (
                        <Card
                          key={quiz.id}
                          className="border border-gray-150 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden bg-white group rounded-2xl"
                        >
                          <div className="p-6 space-y-4">
                            <div>
                              <div className="flex justify-between items-start">
                                <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-50 font-bold border border-blue-100">
                                  {quiz.questions?.length || 0} Questions
                                </Badge>
                                {quiz.startDateTime && (
                                  <span className="text-xs text-gray-400 flex items-center gap-1 font-medium">
                                    <Calendar className="h-3 w-3" /> Scheduled
                                  </span>
                                )}
                              </div>
                              <h3 className="font-bold text-lg text-gray-900 mt-3 group-hover:text-blue-600 transition-colors line-clamp-1">
                                {quiz.title}
                              </h3>
                              <p className="text-gray-500 text-sm mt-1 line-clamp-2 min-h-[40px]">
                                {quiz.description || 'No description provided.'}
                              </p>
                            </div>

                            {/* Metatags */}
                            <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-gray-500 bg-gray-50 p-3 rounded-xl">
                              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-blue-500" /> {quiz.timeAllocated} mins</span>
                              <span className="flex items-center gap-1"><Award className="h-3.5 w-3.5 text-indigo-500" /> Pass: {quiz.passMark}%</span>
                            </div>

                            {/* Stats mini bar */}
                            <div className="pt-2 border-t border-gray-100 grid grid-cols-3 gap-2 text-center">
                              <div>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Invited</p>
                                <p className="text-lg font-extrabold text-gray-800 mt-0.5">{totalInvited}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Attempted</p>
                                <p className="text-lg font-extrabold text-blue-600 mt-0.5">{totalAttempted}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Success</p>
                                <p className="text-lg font-extrabold text-green-600 mt-0.5">{successRate}%</p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex gap-2 justify-end">
                            <button
                              onClick={() => {
                                setSelectedQuiz(quiz);
                                setQuizView('stats');
                              }}
                              className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors border border-blue-100 bg-white shadow-sm"
                              title="View Stats"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedQuiz(quiz);
                                setQuizView('edit');
                              }}
                              className="p-2 hover:bg-amber-100 text-amber-600 rounded-lg transition-colors border border-amber-100 bg-white shadow-sm"
                              title="Edit Quiz"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedQuiz(quiz);
                                setParticipants([]);
                                setQuizView('invite');
                              }}
                              className="p-2 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-colors border border-emerald-100 bg-white shadow-sm"
                              title="Invite/Add Participants"
                            >
                              <Users className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteQuiz(quiz.id)}
                              className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors border border-red-100 bg-white shadow-sm"
                              title="Delete Quiz"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* VIEW 2: QUIZ CREATION SELECTION */}
            {quizView === 'create' && (
              <div className="max-w-3xl mx-auto space-y-6">
                <Button variant="ghost" onClick={() => setQuizView('list')} className="text-gray-600">
                  <ChevronLeft className="h-4 w-4 mr-2" /> Back to Dashboard
                </Button>
                <div className="text-center py-6">
                  <h2 className="text-2xl font-extrabold text-gray-900">Create New Quiz</h2>
                  <p className="text-gray-500 mt-1">Choose between fully-automated AI generation or manual creation</p>
                </div>
                <div className="grid md:grid-cols-2 gap-6 pt-4">
                  {/* AI Card */}
                  <div
                    onClick={() => setQuizView('ai-config')}
                    className="cursor-pointer border-2 border-blue-100 hover:border-blue-500 p-8 rounded-3xl bg-gradient-to-br from-white to-blue-50/20 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center space-y-4 hover:translate-y-[-4px]"
                  >
                    <div className="h-16 w-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                      <Brain className="h-10 w-10 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-950">AI Quiz Generator</h3>
                      <p className="text-sm text-gray-500 mt-2">
                        Provide a topic and let Gemini AI curate high-quality questions, options, and difficulty settings in seconds.
                      </p>
                    </div>
                    <span className="text-blue-600 font-bold text-sm flex items-center gap-1 pt-2">
                      Start Generation <ChevronRight className="h-4 w-4" />
                    </span>
                  </div>

                  {/* Manual Card */}
                  <div
                    onClick={() => setQuizView('manual-config')}
                    className="cursor-pointer border-2 border-purple-100 hover:border-purple-500 p-8 rounded-3xl bg-gradient-to-br from-white to-purple-50/20 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center space-y-4 hover:translate-y-[-4px]"
                  >
                    <div className="h-16 w-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center">
                      <Plus className="h-10 w-10" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-950">Manual Quiz Creator</h3>
                      <p className="text-sm text-gray-500 mt-2">
                        Design your own assessment. Write questions, custom multiple-choice options, set marks, and time limits.
                      </p>
                    </div>
                    <span className="text-purple-600 font-bold text-sm flex items-center gap-1 pt-2">
                      Start Building <ChevronRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 3: AI CONFIGURATION */}
            {quizView === 'ai-config' && (
              <div className="max-w-2xl mx-auto space-y-6">
                <Button variant="ghost" onClick={() => setQuizView('create')} className="text-gray-600">
                  <ChevronLeft className="h-4 w-4 mr-2" /> Back to Choice
                </Button>
                <Card className="border-none shadow-xl bg-white">
                  <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-3xl">
                    <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5" /> AI Generation Settings</CardTitle>
                    <CardDescription className="text-blue-100">Specify details for your AI Quiz</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                    <Input
                      label="Topic/Subject"
                      placeholder="e.g. Node.js Streams & Buffers"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      required
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Number of Questions"
                        type="number"
                        min={1}
                        max={30}
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
                    <div className="grid grid-cols-3 gap-4">
                      <Input
                        label="Duration (min)"
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                      />
                      <Input
                        label="Pass Mark (%)"
                        type="number"
                        value={passMark}
                        onChange={(e) => setPassMark(Number(e.target.value))}
                      />
                      <Input
                        label="Total Marks"
                        type="number"
                        value={totalMarks}
                        onChange={(e) => setTotalMarks(Number(e.target.value))}
                      />
                    </div>
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-base font-bold shadow-lg"
                      onClick={handleGenerateQuiz}
                      disabled={!topic || isLoading}
                      isLoading={isLoading}
                    >
                      <Brain className="h-5 w-5 mr-2" />
                      Generate Quiz Questions
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* VIEW 4: MANUAL CREATION FORM */}
            {quizView === 'manual-config' && (
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Form: Settings */}
                <div className="lg:col-span-1 space-y-6">
                  <Button variant="ghost" onClick={() => setQuizView('create')} className="text-gray-600">
                    <ChevronLeft className="h-4 w-4 mr-2" /> Back
                  </Button>
                  <Card className="border-none shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-lg">Quiz Information</CardTitle>
                      <CardDescription>Setup basic configuration</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Input
                        label="Title"
                        placeholder="e.g. JavaScript Quiz 1"
                        value={manualTitle}
                        onChange={(e) => setManualTitle(e.target.value)}
                      />
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
                        <textarea
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 h-20"
                          placeholder="What is this quiz about?"
                          value={manualDescription}
                          onChange={(e) => setManualDescription(e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          label="Duration (min)"
                          type="number"
                          value={manualDuration}
                          onChange={(e) => setManualDuration(Number(e.target.value))}
                        />
                        <Input
                          label="Pass Mark (%)"
                          type="number"
                          value={manualPassMark}
                          onChange={(e) => setManualPassMark(Number(e.target.value))}
                        />
                      </div>
                      <Input
                        label="Total Marks"
                        type="number"
                        value={manualTotalMarks}
                        onChange={(e) => setManualTotalMarks(Number(e.target.value))}
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          label="Start Time (Optional)"
                          type="datetime-local"
                          value={manualStartDate}
                          onChange={(e) => setManualStartDate(e.target.value)}
                        />
                        <Input
                          label="End Time (Optional)"
                          type="datetime-local"
                          value={manualEndDate}
                          onChange={(e) => setManualEndDate(e.target.value)}
                        />
                      </div>

                      <Button
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold"
                        onClick={handleSaveManualQuiz}
                        disabled={isLoading}
                        isLoading={isLoading}
                      >
                        Create Quiz & Setup Invites
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Form: Questions manager */}
                <div className="lg:col-span-2 space-y-6">
                  <Card className="border-none shadow-lg">
                    <CardHeader className="bg-purple-50/50 border-b">
                      <CardTitle className="text-lg text-purple-950 flex items-center justify-between">
                        <span>Quiz Questions ({manualQuestions.length})</span>
                        <span className="text-xs text-purple-700 bg-purple-100/50 px-3 py-1 rounded-full font-bold">
                          Manual Builder
                        </span>
                      </CardTitle>
                      <CardDescription>Create the questions for your manual quiz below</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      {/* Form to add a question */}
                      <div className="border border-purple-100 p-4 rounded-2xl bg-purple-50/10 space-y-4">
                        <h4 className="font-bold text-sm text-purple-900">Add New Question</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Question Type</label>
                            <select
                              className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
                              value={newQuestionType}
                              onChange={(e) => {
                                setNewQuestionType(e.target.value);
                                setNewQuestionCorrect(0);
                              }}
                            >
                              <option value="single_option">Multiple Choice (Single Option)</option>
                              <option value="true_false">True / False</option>
                            </select>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              label="Marks"
                              type="number"
                              value={newQuestionMarks}
                              onChange={(e) => setNewQuestionMarks(Number(e.target.value))}
                            />
                            <Input
                              label="Time Limit (sec)"
                              type="number"
                              value={newQuestionTimeLimit}
                              onChange={(e) => setNewQuestionTimeLimit(Number(e.target.value))}
                            />
                          </div>
                        </div>

                        <Input
                          label="Question Text"
                          placeholder="e.g. Which of the following is not a javascript framework?"
                          value={newQuestionText}
                          onChange={(e) => setNewQuestionText(e.target.value)}
                        />

                        {newQuestionType === 'single_option' && (
                          <div className="space-y-3">
                            <label className="text-xs font-bold text-gray-500 uppercase block">Options</label>
                            <div className="grid md:grid-cols-2 gap-3">
                              {newQuestionOptions.map((opt, i) => (
                                <div key={i} className="flex items-center gap-2 bg-white p-2 border rounded-xl">
                                  <input
                                    type="radio"
                                    name="correct-option"
                                    checked={newQuestionCorrect === i}
                                    onChange={() => setNewQuestionCorrect(i)}
                                    className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                                  />
                                  <input
                                    type="text"
                                    className="w-full text-sm outline-none bg-transparent"
                                    placeholder={`Option ${i + 1}`}
                                    value={opt}
                                    onChange={(e) => {
                                      const updated = [...newQuestionOptions];
                                      updated[i] = e.target.value;
                                      setNewQuestionOptions(updated);
                                    }}
                                  />
                                </div>
                              ))}
                            </div>
                            <p className="text-[11px] text-gray-400 font-medium">
                              Select the radio button beside the correct answer option.
                            </p>
                          </div>
                        )}

                        {newQuestionType === 'true_false' && (
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Correct Answer</label>
                            <div className="flex gap-4">
                              <label className="flex items-center gap-2 cursor-pointer font-semibold text-sm">
                                <input
                                  type="radio"
                                  name="tf-correct"
                                  checked={newQuestionCorrect === 0}
                                  onChange={() => setNewQuestionCorrect(0)}
                                />
                                True
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer font-semibold text-sm">
                                <input
                                  type="radio"
                                  name="tf-correct"
                                  checked={newQuestionCorrect === 1}
                                  onChange={() => setNewQuestionCorrect(1)}
                                />
                                False
                              </label>
                            </div>
                          </div>
                        )}

                        <Button
                          type="button"
                          className="bg-purple-600 hover:bg-purple-700 text-white font-bold"
                          onClick={handleAddLocalQuestion}
                        >
                          <Plus className="h-4 w-4 mr-2" /> Add Question to List
                        </Button>
                      </div>

                      {/* Display added questions */}
                      <div className="space-y-4 pt-4 border-t">
                        <h4 className="font-bold text-gray-800">Added Questions List</h4>
                        {manualQuestions.length === 0 ? (
                          <div className="text-center py-8 text-gray-400 text-sm">
                            No questions added yet. Use the form above to add questions.
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {manualQuestions.map((q, idx) => (
                              <div
                                key={idx}
                                className="p-4 bg-white border border-gray-150 rounded-xl shadow-sm flex justify-between items-start gap-4"
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 text-xs font-bold text-purple-700">
                                    <span>#{idx + 1}</span>
                                    <span className="uppercase">{q.type.replace('_', ' ')}</span>
                                    <span>• {q.marks} Marks</span>
                                    <span>• {q.timeLimit}s Limit</span>
                                  </div>
                                  <p className="font-bold text-gray-900 mt-1">{q.question}</p>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                                    {q.options?.map((opt: string, oi: number) => (
                                      <span
                                        key={oi}
                                        className={`text-xs px-2.5 py-1 rounded-lg border font-medium ${
                                          opt === q.correctAnswer
                                            ? 'bg-green-50 border-green-200 text-green-700 font-bold'
                                            : 'bg-gray-50 border-gray-200 text-gray-600'
                                        }`}
                                      >
                                        {opt}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <button
                                  onClick={() =>
                                    setManualQuestions(manualQuestions.filter((_, i) => i !== idx))
                                  }
                                  className="text-gray-400 hover:text-red-500 p-1"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* VIEW 5: PREVIEW AI GENERATED QUESTIONS */}
            {quizView === 'preview' && result && (
              <div className="space-y-6 max-w-4xl mx-auto">
                <Card className="border-none shadow-xl bg-white overflow-hidden">
                  <CardHeader className="bg-gray-50 border-b flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">Step 2: Preview Questions</CardTitle>
                      <CardDescription>
                        Review the generated questions before setting up invitations.
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" onClick={() => setQuizView('ai-config')}>
                        Back
                      </Button>
                      <Button onClick={() => setQuizView('invite')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
                        Looks Good <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 max-h-[600px] overflow-y-auto">
                    <QuizPlayer questions={result.questions} />
                  </CardContent>
                </Card>
              </div>
            )}

            {/* VIEW 6: INVITE PARTICIPANTS */}
            {quizView === 'invite' && (
              <Card className="border-none shadow-xl bg-white max-w-4xl mx-auto">
                <CardHeader className="bg-gray-50 border-b flex flex-row justify-between items-center">
                  <div>
                    <CardTitle className="text-xl">Invite Participants</CardTitle>
                    <CardDescription>
                      Send email invitations to participate in this quiz: <span className="font-bold text-gray-900">{selectedQuiz?.title || topic}</span>
                    </CardDescription>
                  </div>
                  <Button variant="ghost" onClick={() => setQuizView('list')}>
                    Cancel
                  </Button>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Add Form */}
                    <div className="space-y-4">
                      <h4 className="font-bold text-gray-700 flex items-center gap-2">
                        <Plus className="h-4 w-4 text-blue-600" />
                        Add Participant
                      </h4>
                      <div className="space-y-3 p-4 bg-gray-50 rounded-2xl border border-gray-150">
                        <Input
                          placeholder="Full Name"
                          value={newParticipant.name}
                          onChange={(e) =>
                            setNewParticipant({ ...newParticipant, name: e.target.value })
                          }
                        />
                        <Input
                          placeholder="Email Address"
                          type="email"
                          value={newParticipant.email}
                          onChange={(e) =>
                            setNewParticipant({ ...newParticipant, email: e.target.value })
                          }
                        />
                        <Button
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold"
                          onClick={addParticipant}
                        >
                          Add to List
                        </Button>
                      </div>
                    </div>

                    {/* Participant List */}
                    <div className="space-y-4">
                      <h4 className="font-bold text-gray-700 flex justify-between items-center">
                        <span>Invite List ({participants.length})</span>
                        {participants.length > 0 && (
                          <button
                            onClick={() => setParticipants([])}
                            className="text-xs text-red-500 hover:underline"
                          >
                            Clear All
                          </button>
                        )}
                      </h4>
                      <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2">
                        {participants.length === 0 ? (
                          <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                            <p className="text-sm text-gray-400">No participants added yet.</p>
                          </div>
                        ) : (
                          participants.map((p, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl shadow-sm"
                            >
                              <div>
                                <p className="text-sm font-bold text-gray-900">{p.name}</p>
                                <p className="text-xs text-gray-500">{p.email}</p>
                              </div>
                              <button
                                onClick={() => removeParticipant(i)}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t flex justify-end gap-4">
                    <Button variant="ghost" onClick={() => setQuizView('list')}>
                      Back to Dashboard
                    </Button>
                    <Button
                      className="bg-green-600 hover:bg-green-700 px-8 text-white font-bold shadow-md"
                      disabled={participants.length === 0 || isLoading}
                      onClick={selectedQuiz ? handleAddParticipantsOnly : handleSaveAndInviteAIQuiz}
                      isLoading={isLoading}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Finalize & Send Emails
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* VIEW 7: DETAILED STATISTICS & SESSIONS */}
            {quizView === 'stats' && selectedQuiz && (
              <div className="space-y-8">
                <div className="flex justify-between items-start">
                  <div>
                    <Button variant="ghost" onClick={() => setQuizView('list')} className="text-gray-600 mb-2">
                      <ChevronLeft className="h-4 w-4 mr-2" /> Back to Quizzes
                    </Button>
                    <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
                      <BookOpen className="text-blue-600 h-7 w-7" /> {selectedQuiz.title}
                    </h2>
                    <p className="text-gray-500 text-sm mt-0.5">{selectedQuiz.description}</p>
                  </div>
                  <Badge className="bg-blue-600 hover:bg-blue-600 text-white font-extrabold px-3 py-1.5 rounded-full border border-blue-700">
                    Stats Dashboard
                  </Badge>
                </div>

                {/* Calculate statistics */}
                {(() => {
                  const participantsList = selectedQuiz.participants || [];
                  const totalInvited = participantsList.length;
                  const attempted = participantsList.filter((p: any) => p.status !== 'invited');
                  const totalAttempted = attempted.length;
                  const completed = attempted.filter((p: any) => p.status === 'completed');
                  const totalCompleted = completed.length;
                  const passed = completed.filter((p: any) => p.passed);
                  const totalPassed = passed.length;
                  const totalFailed = totalCompleted - totalPassed;

                  const successRate = totalCompleted > 0 ? Math.round((totalPassed / totalCompleted) * 100) : 0;
                  const failureRate = totalCompleted > 0 ? Math.round((totalFailed / totalCompleted) * 100) : 0;
                  const completionRate = totalAttempted > 0 ? Math.round((totalCompleted / totalAttempted) * 100) : 0;

                  // Failures Analysis
                  const failedByTabSwitch = participantsList.filter((p: any) => p.terminatedByTabSwitch).length;
                  const failedByLowScore = completed.filter((p: any) => !p.passed && !p.terminatedByTabSwitch).length;
                  const abandoned = participantsList.filter((p: any) => p.status === 'started').length;
                  const unattempted = participantsList.filter((p: any) => p.status === 'invited').length;
                  const totalTabSwitches = participantsList.reduce((sum: number, p: any) => sum + (p.tabSwitchCount || 0), 0);

                  return (
                    <div className="space-y-6">
                      {/* Metric Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <Card className="border border-gray-100 bg-white shadow-sm rounded-2xl">
                          <CardContent className="p-6">
                            <span className="text-xs font-bold text-gray-400 uppercase block tracking-wider">Total Invited</span>
                            <span className="text-3xl font-black text-gray-900 mt-2 block">{totalInvited}</span>
                            <span className="text-xs text-gray-400 mt-1 block">participants on list</span>
                          </CardContent>
                        </Card>
                        <Card className="border border-gray-100 bg-white shadow-sm rounded-2xl">
                          <CardContent className="p-6">
                            <span className="text-xs font-bold text-gray-400 uppercase block tracking-wider">Completion Rate</span>
                            <span className="text-3xl font-black text-blue-600 mt-2 block">{completionRate}%</span>
                            <span className="text-xs text-gray-400 mt-1 block">{totalCompleted} of {totalAttempted || 1} attempts finished</span>
                          </CardContent>
                        </Card>
                        <Card className="border border-gray-100 bg-white shadow-sm rounded-2xl">
                          <CardContent className="p-6">
                            <span className="text-xs font-bold text-gray-400 uppercase block tracking-wider">Success Rate</span>
                            <span className="text-3xl font-black text-green-600 mt-2 block">{successRate}%</span>
                            <span className="text-xs text-gray-400 mt-1 block">{totalPassed} passed candidates</span>
                          </CardContent>
                        </Card>
                        <Card className="border border-gray-100 bg-white shadow-sm rounded-2xl">
                          <CardContent className="p-6">
                            <span className="text-xs font-bold text-gray-400 uppercase block tracking-wider">Failure Rate</span>
                            <span className="text-3xl font-black text-red-600 mt-2 block">{failureRate}%</span>
                            <span className="text-xs text-gray-400 mt-1 block">{totalFailed} failed candidates</span>
                          </CardContent>
                        </Card>
                      </div>

                      <div className="grid md:grid-cols-3 gap-6">
                        {/* Failure Reasons Card */}
                        <Card className="border border-gray-100 bg-white shadow-sm rounded-2xl md:col-span-1">
                          <CardHeader className="bg-red-50/50 border-b pb-4">
                            <CardTitle className="text-sm font-extrabold text-red-950 flex items-center gap-1.5">
                              <AlertTriangle className="h-4.5 w-4.5 text-red-600" /> Failure Reasons Analysis
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-6 space-y-4">
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs font-semibold text-gray-600">
                                <span>Security Auto-Terminated (Cheated)</span>
                                <span className="font-extrabold text-red-600">{failedByTabSwitch}</span>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-2">
                                <div className="bg-red-500 h-2 rounded-full" style={{ width: `${totalInvited > 0 ? (failedByTabSwitch / totalInvited) * 100 : 0}%` }} />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs font-semibold text-gray-600">
                                <span>Scored Below Pass Mark</span>
                                <span className="font-extrabold text-amber-600">{failedByLowScore}</span>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-2">
                                <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${totalInvited > 0 ? (failedByLowScore / totalInvited) * 100 : 0}%` }} />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs font-semibold text-gray-600">
                                <span>Abandoned/Incomplete Session</span>
                                <span className="font-extrabold text-gray-500">{abandoned}</span>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-2">
                                <div className="bg-gray-400 h-2 rounded-full" style={{ width: `${totalInvited > 0 ? (abandoned / totalInvited) * 100 : 0}%` }} />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs font-semibold text-gray-600">
                                <span>Unattempted (No Show)</span>
                                <span className="font-extrabold text-blue-500">{unattempted}</span>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-2">
                                <div className="bg-blue-400 h-2 rounded-full" style={{ width: `${totalInvited > 0 ? (unattempted / totalInvited) * 100 : 0}%` }} />
                              </div>
                            </div>
                            <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-xs font-bold text-gray-500">
                              <span>Total Tab Switches logged</span>
                              <Badge className="bg-red-50 text-red-600 hover:bg-red-50 border border-red-200">
                                {totalTabSwitches} Switches
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Sessions/Participants Table */}
                        <Card className="border border-gray-100 bg-white shadow-sm rounded-2xl md:col-span-2 overflow-hidden">
                          <CardHeader className="border-b bg-gray-50/50 pb-4">
                            <CardTitle className="text-base font-bold text-gray-900 flex justify-between items-center">
                              <span>Quiz Sessions / Participants List</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setParticipants([]);
                                  setQuizView('invite');
                                }}
                              >
                                <Plus className="h-4 w-4 mr-1" /> Add Participants
                              </Button>
                            </CardTitle>
                          </CardHeader>
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-sm">
                              <thead>
                                <tr className="border-b bg-gray-50 text-xs font-bold text-gray-500 uppercase">
                                  <th className="px-6 py-4">Participant</th>
                                  <th className="px-6 py-4">Status</th>
                                  <th className="px-6 py-4">Score</th>
                                  <th className="px-6 py-4">Proctoring Flags</th>
                                  <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {participantsList.length === 0 ? (
                                  <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-medium">
                                      No participants invited yet. Click "Add Participants" above to add.
                                    </td>
                                  </tr>
                                ) : (
                                  participantsList.map((p: any) => (
                                    <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50/30 transition-colors">
                                      <td className="px-6 py-4">
                                        <div className="font-bold text-gray-900">{p.name}</div>
                                        <div className="text-xs text-gray-500">{p.email}</div>
                                      </td>
                                      <td className="px-6 py-4">
                                        <Badge
                                          variant="secondary"
                                          className={`font-bold ${
                                            p.status === 'completed'
                                              ? 'bg-green-50 text-green-700 border border-green-200'
                                              : p.status === 'started'
                                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                              : 'bg-gray-50 text-gray-600 border border-gray-200'
                                          }`}
                                        >
                                          {p.status}
                                        </Badge>
                                      </td>
                                      <td className="px-6 py-4">
                                        {p.status === 'completed' ? (
                                          <div className="space-y-0.5">
                                            <span className="font-black text-gray-900">{Math.round(p.percentageScore)}%</span>
                                            <span className="text-xs text-gray-500 block">({p.score} pts)</span>
                                          </div>
                                        ) : (
                                          <span className="text-gray-400">—</span>
                                        )}
                                      </td>
                                      <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                          {p.terminatedByTabSwitch && (
                                            <Badge variant="destructive" className="font-extrabold w-fit flex items-center gap-1 text-[10px] px-2 py-0.5 bg-red-600 text-white rounded-md">
                                              <ShieldAlert className="h-3 w-3" /> Terminated (Cheat)
                                            </Badge>
                                          )}
                                          {p.tabSwitchCount > 0 ? (
                                            <span className="text-xs text-amber-600 font-semibold flex items-center gap-1">
                                              <AlertCircle className="h-3.5 w-3.5" /> {p.tabSwitchCount} Tab Switched
                                            </span>
                                          ) : (
                                            p.status !== 'invited' && (
                                              <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                                                <CheckCircle className="h-3.5 w-3.5" /> Proctoring Clean
                                              </span>
                                            )
                                          )}
                                          {p.status === 'invited' && <span className="text-gray-400 text-xs">—</span>}
                                        </div>
                                      </td>
                                      <td className="px-6 py-4 text-right">
                                        {(p.status === 'completed' || p.status === 'started') && (
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="border-blue-200 hover:bg-blue-50 text-blue-700 font-bold gap-1 rounded-xl"
                                            onClick={() => handleResetParticipant(p.id)}
                                          >
                                            <RefreshCw className="h-3 w-3" /> Reset/Retake
                                          </Button>
                                        )}
                                        {p.status === 'invited' && (
                                          <span className="text-xs text-gray-400 italic">Waiting to join</span>
                                        )}
                                      </td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        </Card>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* VIEW 8: EDIT METADATA & QUESTIONS */}
            {quizView === 'edit' && selectedQuiz && (
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Left: Metadata form */}
                <div className="lg:col-span-1 space-y-6">
                  <Button variant="ghost" onClick={() => setQuizView('list')} className="text-gray-600">
                    <ChevronLeft className="h-4 w-4 mr-2" /> Back
                  </Button>
                  <Card className="border border-gray-100 shadow-md bg-white">
                    <CardHeader>
                      <CardTitle className="text-lg">Edit Quiz Settings</CardTitle>
                      <CardDescription>Update quiz parameters</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Input
                        label="Title"
                        value={selectedQuiz.title}
                        onChange={(e) => setSelectedQuiz({ ...selectedQuiz, title: e.target.value })}
                      />
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
                        <textarea
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 h-20"
                          value={selectedQuiz.description || ''}
                          onChange={(e) =>
                            setSelectedQuiz({ ...selectedQuiz, description: e.target.value })
                          }
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          label="Duration (min)"
                          type="number"
                          value={selectedQuiz.timeAllocated}
                          onChange={(e) =>
                            setSelectedQuiz({
                              ...selectedQuiz,
                              timeAllocated: Number(e.target.value),
                            })
                          }
                        />
                        <Input
                          label="Pass Mark (%)"
                          type="number"
                          value={selectedQuiz.passMark}
                          onChange={(e) =>
                            setSelectedQuiz({ ...selectedQuiz, passMark: Number(e.target.value) })
                          }
                        />
                      </div>
                      <Input
                        label="Total Marks"
                        type="number"
                        value={selectedQuiz.totalMarks || 100}
                        onChange={(e) =>
                          setSelectedQuiz({ ...selectedQuiz, totalMarks: Number(e.target.value) })
                        }
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          label="Start Date"
                          type="datetime-local"
                          value={
                            selectedQuiz.startDateTime
                              ? new Date(
                                  new Date(selectedQuiz.startDateTime).getTime() -
                                    new Date().getTimezoneOffset() * 60000
                                )
                                  .toISOString()
                                  .slice(0, 16)
                              : ''
                          }
                          onChange={(e) =>
                            setSelectedQuiz({ ...selectedQuiz, startDateTime: e.target.value })
                          }
                        />
                        <Input
                          label="End Date"
                          type="datetime-local"
                          value={
                            selectedQuiz.endDateTime
                              ? new Date(
                                  new Date(selectedQuiz.endDateTime).getTime() -
                                    new Date().getTimezoneOffset() * 60000
                                )
                                  .toISOString()
                                  .slice(0, 16)
                              : ''
                          }
                          onChange={(e) =>
                            setSelectedQuiz({ ...selectedQuiz, endDateTime: e.target.value })
                          }
                        />
                      </div>
                      <Button
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold"
                        onClick={handleUpdateQuizMetadata}
                        disabled={isLoading}
                        isLoading={isLoading}
                      >
                        Save Quiz Settings
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Right: Manage Questions */}
                <div className="lg:col-span-2 space-y-6">
                  <Card className="border border-gray-100 shadow-md bg-white">
                    <CardHeader className="border-b bg-gray-50/50 pb-4">
                      <CardTitle className="text-base font-bold text-gray-900">
                        Questions Manager ({selectedQuiz.questions?.length || 0})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      {/* Add Question block */}
                      {editingQuestionId === null && (
                        <div className="border border-blue-100 p-4 bg-blue-50/10 rounded-2xl space-y-4">
                          <h4 className="font-bold text-sm text-blue-900 flex items-center gap-1">
                            <Plus className="h-4 w-4 text-blue-600" /> Add New Question to Quiz
                          </h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-gray-500 uppercase block">
                                Question Type
                              </label>
                              <select
                                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                value={newQuestionType}
                                onChange={(e) => {
                                  setNewQuestionType(e.target.value);
                                  setNewQuestionCorrect(0);
                                }}
                              >
                                <option value="single_option">Multiple Choice (Single Option)</option>
                                <option value="true_false">True / False</option>
                              </select>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                label="Marks"
                                type="number"
                                value={newQuestionMarks}
                                onChange={(e) => setNewQuestionMarks(Number(e.target.value))}
                              />
                              <Input
                                label="Time Limit (sec)"
                                type="number"
                                value={newQuestionTimeLimit}
                                onChange={(e) => setNewQuestionTimeLimit(Number(e.target.value))}
                              />
                            </div>
                          </div>

                          <Input
                            label="Question Text"
                            placeholder="e.g. Which of the following is not a javascript framework?"
                            value={newQuestionText}
                            onChange={(e) => setNewQuestionText(e.target.value)}
                          />

                          {newQuestionType === 'single_option' && (
                            <div className="space-y-3">
                              <label className="text-xs font-bold text-gray-500 uppercase block">Options</label>
                              <div className="grid md:grid-cols-2 gap-3">
                                {newQuestionOptions.map((opt, i) => (
                                  <div key={i} className="flex items-center gap-2 bg-white p-2 border rounded-xl">
                                    <input
                                      type="radio"
                                      name="edit-new-correct-option"
                                      checked={newQuestionCorrect === i}
                                      onChange={() => setNewQuestionCorrect(i)}
                                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                                    />
                                    <input
                                      type="text"
                                      className="w-full text-sm outline-none bg-transparent"
                                      placeholder={`Option ${i + 1}`}
                                      value={opt}
                                      onChange={(e) => {
                                        const updated = [...newQuestionOptions];
                                        updated[i] = e.target.value;
                                        setNewQuestionOptions(updated);
                                      }}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {newQuestionType === 'true_false' && (
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-gray-500 uppercase block">Correct Answer</label>
                              <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer font-semibold text-sm">
                                  <input
                                    type="radio"
                                    name="edit-new-tf-correct"
                                    checked={newQuestionCorrect === 0}
                                    onChange={() => setNewQuestionCorrect(0)}
                                  />
                                  True
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer font-semibold text-sm">
                                  <input
                                    type="radio"
                                    name="edit-new-tf-correct"
                                    checked={newQuestionCorrect === 1}
                                    onChange={() => setNewQuestionCorrect(1)}
                                  />
                                  False
                                </label>
                              </div>
                            </div>
                          )}

                          <Button
                            type="button"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
                            onClick={handleAddQuestionToExistingQuiz}
                          >
                            Add Question
                          </Button>
                        </div>
                      )}

                      {/* Edit Question inline editor */}
                      {editingQuestionId !== null && (
                        <div className="border border-amber-200 p-4 bg-amber-50/10 rounded-2xl space-y-4">
                          <h4 className="font-bold text-sm text-amber-900 flex items-center gap-1">
                            <Edit className="h-4 w-4 text-amber-600" /> Edit Question
                          </h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-gray-500 uppercase block">
                                Question Type
                              </label>
                              <select
                                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500"
                                value={editQuestionType}
                                onChange={(e) => {
                                  setEditQuestionType(e.target.value);
                                  setEditQuestionCorrect(0);
                                }}
                              >
                                <option value="single_option">Multiple Choice (Single Option)</option>
                                <option value="true_false">True / False</option>
                              </select>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                label="Marks"
                                type="number"
                                value={editQuestionMarks}
                                onChange={(e) => setEditQuestionMarks(Number(e.target.value))}
                              />
                              <Input
                                label="Time Limit (sec)"
                                type="number"
                                value={editQuestionTimeLimit}
                                onChange={(e) => setEditQuestionTimeLimit(Number(e.target.value))}
                              />
                            </div>
                          </div>

                          <Input
                            label="Question Text"
                            value={editQuestionText}
                            onChange={(e) => setEditQuestionText(e.target.value)}
                          />

                          {editQuestionType === 'single_option' && (
                            <div className="space-y-3">
                              <label className="text-xs font-bold text-gray-500 uppercase block">Options</label>
                              <div className="grid md:grid-cols-2 gap-3">
                                {editQuestionOptions.map((opt, i) => (
                                  <div key={i} className="flex items-center gap-2 bg-white p-2 border rounded-xl">
                                    <input
                                      type="radio"
                                      name="edit-inline-correct-option"
                                      checked={editQuestionCorrect === i}
                                      onChange={() => setEditQuestionCorrect(i)}
                                      className="h-4 w-4 text-amber-600 focus:ring-amber-500"
                                    />
                                    <input
                                      type="text"
                                      className="w-full text-sm outline-none bg-transparent"
                                      placeholder={`Option ${i + 1}`}
                                      value={opt}
                                      onChange={(e) => {
                                        const updated = [...editQuestionOptions];
                                        updated[i] = e.target.value;
                                        setEditQuestionOptions(updated);
                                      }}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {editQuestionType === 'true_false' && (
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-gray-500 uppercase block">Correct Answer</label>
                              <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer font-semibold text-sm">
                                  <input
                                    type="radio"
                                    name="edit-inline-tf-correct"
                                    checked={editQuestionCorrect === 0}
                                    onChange={() => setEditQuestionCorrect(0)}
                                  />
                                  True
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer font-semibold text-sm">
                                  <input
                                    type="radio"
                                    name="edit-inline-tf-correct"
                                    checked={editQuestionCorrect === 1}
                                    onChange={() => setEditQuestionCorrect(1)}
                                  />
                                  False
                                </label>
                              </div>
                            </div>
                          )}

                          <div className="flex gap-2">
                            <Button
                              type="button"
                              className="bg-amber-600 hover:bg-amber-700 text-white font-bold"
                              onClick={handleSaveEditedQuestion}
                            >
                              Save Question
                            </Button>
                            <Button type="button" variant="ghost" onClick={() => setEditingQuestionId(null)}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Display existing questions */}
                      <div className="space-y-4 pt-4 border-t">
                        <h4 className="font-bold text-gray-800">Questions List</h4>
                        {!selectedQuiz.questions || selectedQuiz.questions.length === 0 ? (
                          <div className="text-center py-8 text-gray-400 text-sm">
                            No questions found in this quiz. Add one above.
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {selectedQuiz.questions.map((q: any, idx: number) => (
                              <div
                                key={q.id}
                                className="p-4 bg-white border border-gray-150 rounded-xl shadow-sm flex justify-between items-start gap-4"
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 text-xs font-bold text-blue-700">
                                    <span>#{idx + 1}</span>
                                    <span className="uppercase">{q.type.replace('_', ' ')}</span>
                                    <span>• {q.marks} Marks</span>
                                    <span>• {q.timeLimit}s Limit</span>
                                  </div>
                                  <p className="font-bold text-gray-900 mt-1">{q.question}</p>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                                    {q.options?.map((opt: string, oi: number) => (
                                      <span
                                        key={oi}
                                        className={`text-xs px-2.5 py-1 rounded-lg border font-medium ${
                                          opt === q.correctAnswer
                                            ? 'bg-green-50 border-green-200 text-green-700 font-bold'
                                            : 'bg-gray-50 border-gray-200 text-gray-600'
                                        }`}
                                      >
                                        {opt}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <div className="flex gap-1.5">
                                  <button
                                    onClick={() => startEditQuestion(q)}
                                    className="text-gray-400 hover:text-amber-600 p-1 hover:bg-amber-50 rounded-lg transition-colors border border-transparent hover:border-amber-100"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteQuestion(q.id)}
                                    className="text-gray-400 hover:text-red-600 p-1 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* FLASHCARDS TAB FLOW */}
        {/* ======================================================== */}
        {activeTab === 'flashcards' && (
          <div className="grid lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <Card className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Settings</CardTitle>
                  <CardDescription>Configure flashcards options.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Input
                    label="Topic"
                    placeholder="e.g. Ancient Rome"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold"
                    onClick={handleGenerateFlashcards}
                    disabled={!topic || isLoading}
                    isLoading={isLoading}
                  >
                    Create Flashcards
                  </Button>
                </CardContent>
              </Card>
            </div>

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
                  <p className="max-w-xs mt-2 opacity-50">
                    Configure the topic on the left to start generating flashcards.
                  </p>
                </div>
              ) : isLoading ? (
                <div className="h-full min-h-[500px] bg-white rounded-3xl shadow-lg p-12 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="relative">
                    <div className="w-20 h-20 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                    <Sparkles className="absolute inset-0 m-auto h-8 w-8 text-blue-600 animate-pulse" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">AI is generating...</h3>
                  <p className="text-gray-500">Preparing high-quality materials for your students.</p>
                </div>
              ) : (
                result.flashcards && (
                  <Card className="border-none shadow-xl overflow-hidden bg-white">
                    <CardHeader className="bg-gray-50 border-b">
                      <CardTitle className="text-lg">Generated Flashcards</CardTitle>
                    </CardHeader>
                    <CardContent className="p-12">
                      <FlashcardDeck flashcards={result.flashcards} />
                    </CardContent>
                  </Card>
                )
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TRANSCRIBE TAB FLOW */}
        {/* ======================================================== */}
        {activeTab === 'transcribe' && (
          <div className="grid lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <Card className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Settings</CardTitle>
                  <CardDescription>Configure transcription options.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
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
                      <p className="text-xs font-medium text-gray-600 truncate">
                        {file ? file.name : 'Upload Audio'}
                      </p>
                    </label>
                  </div>
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold"
                    onClick={handleTranscribe}
                    disabled={!file || isLoading}
                    isLoading={isLoading}
                  >
                    Transcribe Audio
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-3">
              {error ? (
                <div className="h-full min-h-[500px] bg-red-50 border-2 border-red-200 rounded-3xl flex flex-col items-center justify-center text-center p-8 space-y-4">
                  <AlertCircle className="h-12 w-12 text-red-400" />
                  <div>
                    <h3 className="text-lg font-bold text-red-700">Transcription Failed</h3>
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
                  <FileAudio className="h-16 w-16 mb-4 opacity-20" />
                  <h3 className="text-xl font-bold opacity-50">Awaiting Upload</h3>
                  <p className="max-w-xs mt-2 opacity-50">
                    Upload an audio lecture file on the left to start transcribing it.
                  </p>
                </div>
              ) : isLoading ? (
                <div className="h-full min-h-[500px] bg-white rounded-3xl shadow-lg p-12 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="relative">
                    <div className="w-20 h-20 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                    <Sparkles className="absolute inset-0 m-auto h-8 w-8 text-blue-600 animate-pulse" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">AI is transcribing...</h3>
                  <p className="text-gray-500">Transcribing audio lecture data into clean readable text.</p>
                </div>
              ) : (
                result.transcription && (
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
                )
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
