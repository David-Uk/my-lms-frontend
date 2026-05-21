'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api, getToken } from '@/lib/api';
import type { QuizQuestion } from '@/types';
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
  Play,
  Eye,
  Edit3,
  GripVertical,
  Shuffle,
  PlusCircle,
  X,
  BookOpen,
  Pencil,
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface PastQuiz {
  id: string;
  title: string;
  description: string | null;
  timeAllocated: number;
  totalMarks: number | null;
  passMark: number;
  startDateTime: string | null;
  endDateTime: string | null;
  durationMinutes: number | null;
  createdAt: string;
  questions?: QuizQuestion[];
  participants?: Array<{
    id: string;
    name: string;
    email: string;
    status: string;
    score: number | null;
    percentageScore: number | null;
  }>;
}

interface Participant {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  invited: boolean;
  token?: string;
}

interface QuestionEditor {
  id: string;
  type: 'single_option' | 'multiple_option' | 'true_false' | 'fill_in_the_blank';
  question: string;
  options: string[];
  correctAnswer: string | string[];
  marks: number;
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

interface SortableQuestionProps {
  question: QuestionEditor;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}

function SortableQuestion({ question, index, onEdit, onDelete }: SortableQuestionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="border border-gray-200 rounded-xl p-4 bg-white">
      <div className="flex items-start gap-3">
        <button {...attributes} {...listeners} className="mt-1 cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded">
          <GripVertical className="h-5 w-5 text-gray-400" />
        </button>
        <div className="flex-shrink-0 bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold">
          Q{index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800 truncate">{question.question || 'Untitled Question'}</p>
          <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
            <span className="bg-gray-100 px-2 py-0.5 rounded">{QUESTION_TYPES.find(t => t.id === question.type)?.label}</span>
            <span>{question.marks} marks</span>
            {question.options.length > 0 && <span>{question.options.length} options</span>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={onEdit}>
            <Edit3 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

interface QuestionEditModalProps {
  question: QuestionEditor | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (question: QuestionEditor) => void;
  totalMarks: number;
}

function QuestionEditModal({ question, isOpen, onClose, onSave, totalMarks }: QuestionEditModalProps) {
  const [editedQuestion, setEditedQuestion] = useState<QuestionEditor | null>(question);

  useEffect(() => {
    setEditedQuestion(question);
  }, [question]);

  if (!isOpen || !editedQuestion) return null;

  const handleSave = () => {
    if (!editedQuestion.question.trim()) {
      alert('Question text is required');
      return;
    }
    onSave(editedQuestion);
    onClose();
  };

  const addOption = () => {
    setEditedQuestion(prev => prev ? {
      ...prev,
      options: [...prev.options, ''],
    } : null);
  };

  const updateOption = (index: number, value: string) => {
    setEditedQuestion(prev => prev ? {
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt),
    } : null);
  };

  const removeOption = (index: number) => {
    setEditedQuestion(prev => prev ? {
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    } : null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-gray-900">{question?.id ? 'Edit Question' : 'Add Question'}</h3>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-bold text-gray-900 uppercase tracking-widest">Question Type</label>
            <select
              value={editedQuestion.type}
              onChange={(e) => setEditedQuestion(prev => prev ? {
                ...prev,
                type: e.target.value as QuestionEditor['type'],
                options: e.target.value.includes('single_option') || e.target.value.includes('multiple_option') ? (prev.options.length >= 2 ? prev.options : ['', '', '', '']) : [],
                correctAnswer: [],
              } : null)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 font-medium bg-white"
            >
              {QUESTION_TYPES.map(type => (
                <option key={type.id} value={type.id}>{type.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-gray-900 uppercase tracking-widest">Question Text</label>
            <textarea
              value={editedQuestion.question}
              onChange={(e) => setEditedQuestion(prev => prev ? { ...prev, question: e.target.value } : null)}
              placeholder="Enter your question..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 font-medium min-h-[100px] resize-none"
            />
          </div>

          {(editedQuestion.type === 'single_option' || editedQuestion.type === 'multiple_option') && (
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-900 uppercase tracking-widest">Options</label>
              <div className="space-y-2">
                {editedQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type={editedQuestion.type === 'multiple_option' ? 'checkbox' : 'radio'}
                      checked={Array.isArray(editedQuestion.correctAnswer) && editedQuestion.correctAnswer.includes(option)}
                      onChange={(e) => {
                        if (editedQuestion.type === 'single_option') {
                          setEditedQuestion(prev => prev ? { ...prev, correctAnswer: option } : null);
                        } else {
                          setEditedQuestion(prev => {
                            if (!prev) return null;
                            const current = Array.isArray(prev.correctAnswer) ? prev.correctAnswer : [];
                            const currentArray = current as string[];
                            if (e.target.checked) {
                              return { ...prev, correctAnswer: [...currentArray, option] };
                            } else {
                              return { ...prev, correctAnswer: currentArray.filter(a => a !== option) };
                            }
                          });
                        }
                      }}
                      className="h-5 w-5"
                      disabled={!option.trim()}
                    />
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium"
                    />
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-red-500" onClick={() => removeOption(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={addOption} className="rounded-xl gap-2">
                <Plus className="h-4 w-4" />
                Add Option
              </Button>
            </div>
          )}

          {editedQuestion.type === 'true_false' && (
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-900 uppercase tracking-widest">Correct Answer</label>
              <div className="flex gap-4">
                {['True', 'False'].map(answer => (
                  <label key={answer} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="trueFalseAnswer"
                      checked={editedQuestion.correctAnswer === answer}
                      onChange={() => setEditedQuestion(prev => prev ? { ...prev, correctAnswer: answer } : null)}
                      className="h-5 w-5"
                    />
                    <span className="font-medium">{answer}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {editedQuestion.type === 'fill_in_the_blank' && (
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-900 uppercase tracking-widest">Correct Answer</label>
              <input
                type="text"
                value={Array.isArray(editedQuestion.correctAnswer) ? editedQuestion.correctAnswer[0] : editedQuestion.correctAnswer}
                onChange={(e) => setEditedQuestion(prev => prev ? { ...prev, correctAnswer: [e.target.value] } : null)}
                placeholder="Enter the correct answer"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>
          )}

          <div className="space-y-3">
            <label className="text-sm font-bold text-gray-900 uppercase tracking-widest">Marks</label>
            <input
              type="number"
              min="1"
              max={totalMarks}
              value={editedQuestion.marks}
              onChange={(e) => setEditedQuestion(prev => prev ? { ...prev, marks: parseInt(e.target.value) || 1 } : null)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 font-medium"
            />
          </div>
        </div>
        <div className="p-6 border-t border-gray-100 flex gap-4">
          <Button variant="outline" onClick={onClose} className="flex-1 rounded-2xl">Cancel</Button>
          <Button onClick={handleSave} className="flex-1 rounded-2xl bg-blue-600 hover:bg-blue-700">Save Question</Button>
        </div>
      </div>
    </div>
  );
}

interface PreviewModalProps {
  quiz: { title: string; description?: string; totalMarks: number; passMark: number; durationMinutes: number };
  questions: QuestionEditor[];
  isOpen: boolean;
  onClose: () => void;
  randomize: boolean;
}

function PreviewModal({ quiz, questions, isOpen, onClose, randomize }: PreviewModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string | string[]>>({});
  const [showResults, setShowResults] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState<QuestionEditor[]>([]);

  useEffect(() => {
    if (randomize) {
      const shuffled = [...questions].sort(() => Math.random() - 0.5);
      setShuffledQuestions(shuffled);
    } else {
      setShuffledQuestions(questions);
    }
    setCurrentIndex(0);
    setSelectedAnswers({});
    setShowResults(false);
  }, [questions, randomize]);

  const displayQuestions = shuffledQuestions;

  if (!isOpen) return null;

  const currentQuestion = displayQuestions[currentIndex];
  const totalQuestions = displayQuestions.length;

  const calculateScore = () => {
    let earned = 0;
    displayQuestions.forEach(q => {
      const userAnswer = selectedAnswers[q.id];
      if (q.type === 'single_option' || q.type === 'true_false' || q.type === 'fill_in_the_blank') {
        const correct = q.correctAnswer;
        if (userAnswer === correct || (Array.isArray(correct) && correct[0] === userAnswer)) {
          earned += q.marks;
        }
      } else if (q.type === 'multiple_option') {
        const correct = Array.isArray(q.correctAnswer) ? q.correctAnswer : [q.correctAnswer];
        const user = Array.isArray(userAnswer) ? userAnswer : [];
        if (JSON.stringify(correct.sort()) === JSON.stringify(user.sort())) {
          earned += q.marks;
        }
      }
    });
    return earned;
  };

  if (showResults) {
    const score = calculateScore();
    const percentage = quiz.totalMarks > 0 ? Math.round((score / quiz.totalMarks) * 100) : 0;
    const passed = percentage >= quiz.passMark;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-2xl font-black text-center">Quiz Results</h3>
          </div>
          <div className="p-6 text-center space-y-6">
            <div className={`text-6xl font-black ${passed ? 'text-green-600' : 'text-red-600'}`}>
              {percentage}%
            </div>
            <p className="text-xl font-bold">{passed ? 'Congratulations! You passed!' : 'Keep trying!'}</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-100 rounded-2xl p-4">
                <p className="text-2xl font-black text-gray-900">{score}</p>
                <p className="text-sm text-gray-500">Score</p>
              </div>
              <div className="bg-gray-100 rounded-2xl p-4">
                <p className="text-2xl font-black text-gray-900">{quiz.totalMarks}</p>
                <p className="text-sm text-gray-500">Total Marks</p>
              </div>
            </div>
            <div className="space-y-3 text-left max-h-60 overflow-y-auto">
              {displayQuestions.map((q, i) => {
                const userAnswer = selectedAnswers[q.id];
                let isCorrect = false;
                if (q.type === 'single_option' || q.type === 'true_false' || q.type === 'fill_in_the_blank') {
                  isCorrect = userAnswer === q.correctAnswer || (Array.isArray(q.correctAnswer) && q.correctAnswer[0] === userAnswer);
                } else if (q.type === 'multiple_option') {
                  const correct = Array.isArray(q.correctAnswer) ? q.correctAnswer : [q.correctAnswer];
                  const user = Array.isArray(userAnswer) ? userAnswer : [];
                  isCorrect = JSON.stringify(correct.sort()) === JSON.stringify(user.sort());
                }
                return (
                  <div key={q.id} className={`p-3 rounded-xl ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <p className="text-sm font-medium">Q{i + 1}: {q.question}</p>
                    <p className="text-xs mt-1">Your answer: {JSON.stringify(userAnswer)}</p>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="p-6 border-t border-gray-100">
            <Button onClick={onClose} className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700">Close Preview</Button>
          </div>
        </div>
      </div>
    );
  }

  const selectAnswer = (answer: string) => {
    setSelectedAnswers(prev => {
      const current = Array.isArray(prev[currentQuestion.id]) ? prev[currentQuestion.id] : [];
      const currentArray = current as string[];
      if (currentQuestion.type === 'multiple_option') {
        if (currentArray.includes(answer)) {
          return { ...prev, [currentQuestion.id]: currentArray.filter(a => a !== answer) };
        } else {
          return { ...prev, [currentQuestion.id]: [...currentArray, answer] };
        }
      } else {
        return { ...prev, [currentQuestion.id]: answer };
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-gray-900">Preview: {quiz.title}</h3>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl">
              <X className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-1">Question {currentIndex + 1} of {totalQuestions}</p>
        </div>
        <div className="p-6 space-y-6">
          <div className="bg-blue-50 rounded-2xl p-4">
            <p className="text-lg font-semibold text-gray-900">{currentQuestion.question}</p>
            {currentQuestion.options.length > 0 && (
              <div className="space-y-2 mt-4">
                {currentQuestion.options.map((option, i) => {
                  const optionLabel = String.fromCharCode(97 + i);
                  const isSelected = Array.isArray(selectedAnswers[currentQuestion.id])
                    ? selectedAnswers[currentQuestion.id].includes(option)
                    : selectedAnswers[currentQuestion.id] === option;
                  return (
                    <button
                      key={i}
                      onClick={() => selectAnswer(option)}
                      className={`w-full text-left p-3 rounded-xl border-2 transition-colors ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                    >
                      <span className="font-bold mr-2">{optionLabel})</span>
                      {option}
                    </button>
                  );
                })}
              </div>
            )}
            {currentQuestion.type === 'true_false' && (
              <div className="space-y-2 mt-4">
                {['True', 'False'].map(answer => (
                  <button
                    key={answer}
                    onClick={() => selectAnswer(answer)}
                    className={`w-full text-left p-3 rounded-xl border-2 transition-colors ${selectedAnswers[currentQuestion.id] === answer ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                  >
                    {answer}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="p-6 border-t border-gray-100 flex gap-4">
          <Button
            variant="outline"
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="rounded-2xl"
          >
            Previous
          </Button>
          {currentIndex === totalQuestions - 1 ? (
            <Button onClick={() => setShowResults(true)} className="flex-1 rounded-2xl bg-green-600 hover:bg-green-700">
              See Results
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentIndex(prev => Math.min(totalQuestions - 1, prev + 1))}
              className="flex-1 rounded-2xl"
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminQuizGeneratorPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [tab, setTab] = useState<'list' | 'new'>('list');
  const [createMode, setCreateMode] = useState<'ai' | 'manual'>('ai');
  const [pastQuizzes, setPastQuizzes] = useState<PastQuiz[]>([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [previewRandomize, setPreviewRandomize] = useState(false);

  const [step, setStep] = useState<'configure' | 'preview' | 'invite' | 'complete'>('configure' as const);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSendingInvites, setIsSendingInvites] = useState(false);
  const [error, setError] = useState('');

  const [generatedQuiz, setGeneratedQuiz] = useState<{
    quiz: { id: string; title?: string; description?: string; timeAllocated?: number; totalMarks?: number; passMark?: number; startDateTime?: string; endDateTime?: string; durationMinutes?: number };
    questions: QuestionEditor[];
  } | null>(null);

  const [questions, setQuestions] = useState<QuestionEditor[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<QuestionEditor | null>(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [newEmail, setNewEmail] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchPastQuizzes = useCallback(async () => {
    try {
      setLoadingQuizzes(true);
      const response = await api.get<PastQuiz[]>('/quiz/list');
      setPastQuizzes(response);
    } catch (err) {
      console.error('Failed to fetch past quizzes:', err);
    } finally {
      setLoadingQuizzes(false);
    }
  }, []);

  useEffect(() => {
    fetchPastQuizzes();
  }, [fetchPastQuizzes]);

  const getDefaultEndDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    topics: '',
    numberOfQuestions: 10,
    totalMarks: 100,
    passMark: 50,
    questionTypes: ['single_option'] as string[],
    difficultyLevel: 'medium',
    startDate: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endDate: getDefaultEndDate(),
    endTime: '17:00',
    durationMinutes: 60,
  });

  const [manualQuizSettings, setManualQuizSettings] = useState({
    title: '',
    description: '',
    totalMarks: 100,
    passMark: 50,
    durationMinutes: 60,
    startDate: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endDate: getDefaultEndDate(),
    endTime: '17:00',
  });

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

      const token = await getToken();
      const saveResponse = await fetch('/api/quiz/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          quizId: response.quiz.id,
          participants: [],
          quiz: {
            ...response.quiz,
            questions: response.questions,
          },
        }),
      });

      if (!saveResponse.ok) {
        throw new Error('Failed to save generated quiz');
      }

      const saveData = await saveResponse.json();

      const questionsList: QuestionEditor[] = response.questions.map((q: Record<string, unknown>, i: number) => ({
        id: q.id || `q_${Date.now()}_${i}`,
        type: (q.type as QuestionEditor['type']) || 'single_option',
        question: q.question as string,
        options: Array.isArray(q.options) ? q.options : [],
        correctAnswer: q.correctAnswer,
        marks: (q.marks as number) || Math.floor(formData.totalMarks / formData.numberOfQuestions),
      }));

      setQuestions(questionsList);
      setGeneratedQuiz({
        quiz: { ...response.quiz, id: saveData.quizId },
        questions: questionsList,
      });
      setStep('preview');
    } catch (err) {
      console.error('Failed to generate quiz:', err);
      setError('Failed to generate quiz. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateManualQuiz = async () => {
    if (!manualQuizSettings.title.trim()) {
      setError('Quiz title is required');
      return;
    }

    if (questions.length === 0) {
      setError('Please add at least one question');
      return;
    }

    try {
      setIsGenerating(true);
      setError('');

      const token = await getToken();

      const createResponse = await fetch('/api/quiz/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          quizId: crypto.randomUUID(),
          participants: [],
          quiz: {
            title: manualQuizSettings.title,
            description: manualQuizSettings.description,
            totalMarks: manualQuizSettings.totalMarks,
            passMark: manualQuizSettings.passMark,
            durationMinutes: manualQuizSettings.durationMinutes,
            startDateTime: `${manualQuizSettings.startDate}T${manualQuizSettings.startTime}`,
            endDateTime: `${manualQuizSettings.endDate}T${manualQuizSettings.endTime}`,
            questions: questions.map((q) => ({
              id: q.id,
              type: q.type,
              question: q.question,
              options: q.options,
              correctAnswer: q.correctAnswer,
              marks: q.marks,
            })),
          },
        }),
      });

      if (!createResponse.ok) {
        throw new Error('Failed to create quiz');
      }

      const saveData = await createResponse.json();

      setGeneratedQuiz({
        quiz: {
          id: saveData.quizId,
          title: manualQuizSettings.title,
          description: manualQuizSettings.description,
          totalMarks: manualQuizSettings.totalMarks,
          passMark: manualQuizSettings.passMark,
          durationMinutes: manualQuizSettings.durationMinutes,
          startDateTime: `${manualQuizSettings.startDate}T${manualQuizSettings.startTime}`,
          endDateTime: `${manualQuizSettings.endDate}T${manualQuizSettings.endTime}`,
          timeAllocated: manualQuizSettings.durationMinutes,
        },
        questions: questions,
      });
      setStep('preview');
    } catch (err) {
      console.error('Failed to create quiz:', err);
      setError('Failed to create quiz. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setQuestions(prev => {
        const oldIndex = prev.findIndex(q => q.id === active.id);
        const newIndex = prev.findIndex(q => q.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  const addQuestion = () => {
    setEditingQuestion({
      id: `q_${Date.now()}`,
      type: 'single_option',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      marks: Math.floor(manualQuizSettings.totalMarks / Math.max(questions.length + 1, 1)),
    });
    setShowQuestionModal(true);
  };

  const saveQuestion = (question: QuestionEditor) => {
    setQuestions(prev => {
      const existing = prev.find(q => q.id === question.id);
      if (existing) {
        return prev.map(q => q.id === question.id ? question : q);
      }
      return [...prev, question];
    });
  };

  const deleteQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const randomizeQuestions = () => {
    setQuestions(prev => [...prev].sort(() => Math.random() - 0.5));
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
            questions: questions,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to send invites');
      }

      setParticipants(prev => prev.map(p => ({ ...p, invited: true })));
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
    setQuestions([]);
    setParticipants([]);
    setManualQuizSettings({
      title: '',
      description: '',
      totalMarks: 100,
      passMark: 50,
      durationMinutes: 60,
      startDate: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endDate: getDefaultEndDate(),
      endTime: '17:00',
    });
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

  const handleStartSession = async (quiz: PastQuiz) => {
    setTab('new');
    setCreateMode('manual');
    setStep('invite');
    const questionsList: QuestionEditor[] = (quiz.questions || []).map((q: any) => ({
      id: q.id,
      type: q.type as QuestionEditor['type'],
      question: q.question,
      options: Array.isArray(q.options) ? q.options : [],
      correctAnswer: q.correctAnswer,
      marks: q.marks,
    }));
    setGeneratedQuiz({
      quiz: {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description || '',
        timeAllocated: quiz.durationMinutes || quiz.timeAllocated,
        totalMarks: quiz.totalMarks || 100,
        passMark: quiz.passMark,
        startDateTime: quiz.startDateTime || '',
        endDateTime: quiz.endDateTime || '',
        durationMinutes: quiz.durationMinutes || quiz.timeAllocated,
      },
      questions: questionsList,
    });
  };

  const handlePreviewQuiz = (quiz: PastQuiz) => {
    setShowPreview(true);
    setPreviewRandomize(false);
  };

  const handleEditQuiz = (quiz: PastQuiz) => {
    setTab('new');
    setCreateMode('manual');
    setStep('preview');
    setManualQuizSettings({
      title: quiz.title,
      description: quiz.description || '',
      totalMarks: quiz.totalMarks || 100,
      passMark: quiz.passMark,
      durationMinutes: quiz.durationMinutes || quiz.timeAllocated,
      startDate: quiz.startDateTime ? new Date(quiz.startDateTime).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      startTime: quiz.startDateTime ? new Date(quiz.startDateTime).toTimeString().slice(0, 5) : '09:00',
      endDate: quiz.endDateTime ? new Date(quiz.endDateTime).toISOString().split('T')[0] : getDefaultEndDate(),
      endTime: quiz.endDateTime ? new Date(quiz.endDateTime).toTimeString().slice(0, 5) : '17:00',
    });
    setQuestions((quiz.questions || []).map(q => ({
      id: q.id,
      type: q.type as QuestionEditor['type'],
      question: q.question,
      options: Array.isArray(q.options) ? q.options : [],
      correctAnswer: q.correctAnswer,
      marks: q.marks,
    })));
    setGeneratedQuiz({
      quiz: {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description || '',
        timeAllocated: quiz.durationMinutes || quiz.timeAllocated,
        totalMarks: quiz.totalMarks || 100,
        passMark: quiz.passMark,
        startDateTime: quiz.startDateTime || '',
        endDateTime: quiz.endDateTime || '',
        durationMinutes: quiz.durationMinutes || quiz.timeAllocated,
      },
      questions: [],
    });
  };

  return (
    <>
      <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-1000 max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl shadow-lg">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight">AI Quiz Generator</h1>
              <p className="text-gray-500 font-medium mt-1">
                {tab === 'list' && 'View and manage quizzes'}
                {tab === 'new' && step === 'configure' && 'Configure your quiz settings'}
                {tab === 'new' && step === 'preview' && 'Review and edit quiz'}
                {tab === 'new' && step === 'invite' && 'Add participants to invite'}
                {tab === 'new' && step === 'complete' && 'Quiz ready to share'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setTab('list')}
            className={`px-4 py-2 rounded-xl font-bold transition-colors ${tab === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            <BookOpen className="h-4 w-4 inline mr-2" />
            Past Quizzes
          </button>
          <button
            onClick={() => { setTab('new'); resetForm(); }}
            className={`px-4 py-2 rounded-xl font-bold transition-colors ${tab === 'new' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            <PlusCircle className="h-4 w-4 inline mr-2" />
            Create New Quiz
          </button>
        </div>

        {tab === 'list' && (
          <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 p-8">
              <div className="flex items-center gap-3">
                <Brain className="h-6 w-6 text-blue-600" />
                <CardTitle className="text-2xl font-black">Your Past Quizzes</CardTitle>
              </div>
              <p className="text-gray-500 font-medium mt-2">View, edit, preview, and start sessions with your quizzes</p>
            </CardHeader>
            <CardContent className="p-8">
              {loadingQuizzes ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                </div>
              ) : pastQuizzes.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="mx-auto h-12 w-12 text-gray-300" />
                  <h3 className="mt-4 text-lg font-bold text-gray-900">No quizzes yet</h3>
                  <p className="mt-1 text-gray-500">Create your first quiz to get started.</p>
                  <Button onClick={() => setTab('new')} className="mt-4 rounded-2xl bg-blue-600">
                    Create Quiz
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="py-4 px-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Quiz</th>
                        <th className="py-4 px-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Questions</th>
                        <th className="py-4 px-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Duration</th>
                        <th className="py-4 px-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Created</th>
                        <th className="py-4 px-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {pastQuizzes.map((quiz) => (
                        <tr key={quiz.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="py-4 px-4">
                            <div>
                              <p className="font-bold text-gray-900">{quiz.title}</p>
                              <p className="text-xs text-gray-500">{quiz.description || 'No description'}</p>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-medium text-gray-700">{quiz.questions?.length || 0}</span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Clock className="h-4 w-4 text-blue-600" />
                              {quiz.durationMinutes || quiz.timeAllocated} min
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              {new Date(quiz.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" className="gap-1 rounded-xl" onClick={() => handlePreviewQuiz(quiz)}>
                                <Eye className="h-3 w-3" />
                                Preview
                              </Button>
                              <Button variant="outline" size="sm" className="gap-1 rounded-xl" onClick={() => handleEditQuiz(quiz)}>
                                <Edit3 className="h-3 w-3" />
                                Edit
                              </Button>
                              <Button variant="outline" size="sm" className="gap-1 rounded-xl" onClick={() => handleStartSession(quiz)}>
                                <Play className="h-3 w-3" />
                                Start Session
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {tab === 'new' && (
          <>
            <div className="flex gap-3 mb-6">
              <button
                onClick={() => setCreateMode('ai')}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold transition-colors ${createMode === 'ai' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                <Sparkles className="h-4 w-4" />
                AI Generate
              </button>
              <button
                onClick={() => setCreateMode('manual')}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold transition-colors ${createMode === 'manual' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                <Pencil className="h-4 w-4" />
                Manual Create
              </button>
            </div>

            {step !== 'configure' && (
              <div className="flex items-center gap-2 mb-6">
                <button
                  onClick={() => {
                    if (step === 'complete') {
                      setStep('invite');
                    } else {
                      setStep('configure');
                    }
                  }}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 mb-6">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {step === 'configure' && createMode === 'ai' && (
              <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 p-8">
                  <div className="flex items-center gap-3">
                    <Brain className="h-6 w-6 text-blue-600" />
                    <CardTitle className="text-2xl font-black">Quiz Configuration</CardTitle>
                  </div>
                  <p className="text-gray-500 font-medium mt-2">Configure your quiz settings and let AI generate questions</p>
                </CardHeader>
                <CardContent className="p-8">
                  <form onSubmit={handleGenerateQuiz} className="space-y-8">
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-widest">
                        <Layers className="h-4 w-4 text-blue-600" />
                        Topics
                      </label>
                      <textarea
                        value={formData.topics}
                        onChange={(e) => setFormData(prev => ({ ...prev, topics: e.target.value }))}
                        placeholder="Enter topics separated by commas (e.g., JavaScript fundamentals, React hooks, Node.js basics)"
                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 font-medium min-h-[120px] resize-none"
                      />
                      <p className="text-xs text-gray-500">Separate multiple topics with commas</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-widest">
                          <ListChecks className="h-4 w-4 text-blue-600" />
                          Number of Questions
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="50"
                          value={formData.numberOfQuestions}
                          onChange={(e) => setFormData(prev => ({ ...prev, numberOfQuestions: parseInt(e.target.value) || 10 }))}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 font-medium"
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-widest">
                          <Target className="h-4 w-4 text-blue-600" />
                          Difficulty Level
                        </label>
                        <select
                          value={formData.difficultyLevel}
                          onChange={(e) => setFormData(prev => ({ ...prev, difficultyLevel: e.target.value }))}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 font-medium bg-white"
                        >
                          {DIFFICULTY_LEVELS.map(level => (
                            <option key={level.id} value={level.id}>{level.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-3">
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-widest">
                          <Target className="h-4 w-4 text-blue-600" />
                          Total Marks
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="1000"
                          value={formData.totalMarks}
                          onChange={(e) => setFormData(prev => ({ ...prev, totalMarks: parseInt(e.target.value) || 100 }))}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 font-medium"
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-widest">
                          <CheckCircle2 className="h-4 w-4 text-blue-600" />
                          Pass Mark
                        </label>
                        <input
                          type="number"
                          min="1"
                          max={formData.totalMarks}
                          value={formData.passMark}
                          onChange={(e) => setFormData(prev => ({ ...prev, passMark: parseInt(e.target.value) || 50 }))}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 font-medium"
                        />
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-3xl border-2 border-blue-100 space-y-5">
                      <div className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-widest">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        Quiz Time Settings
                      </div>

                      <div className="grid sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Start Date</label>
                          <input
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 font-medium bg-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Start Time</label>
                          <input
                            type="time"
                            value={formData.startTime}
                            onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 font-medium bg-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">End Date</label>
                          <input
                            type="date"
                            value={formData.endDate}
                            onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 font-medium bg-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">End Time</label>
                          <input
                            type="time"
                            value={formData.endTime}
                            onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 font-medium bg-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs font-bold text-gray-600 uppercase tracking-wide">
                          <Clock className="h-4 w-4 text-blue-600" />
                          Duration (minutes)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="480"
                          value={formData.durationMinutes}
                          onChange={(e) => setFormData(prev => ({ ...prev, durationMinutes: parseInt(e.target.value) || 60 }))}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 font-medium"
                        />
                        <p className="text-xs text-gray-500">Time allowed to complete the quiz once started</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-widest">
                        <ListChecks className="h-4 w-4 text-blue-600" />
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
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                            }`}
                          >
                            <span className="text-2xl">{type.icon}</span>
                            <span className="font-bold text-sm">{type.label}</span>
                            {formData.questionTypes.includes(type.id) && (
                              <CheckCircle2 className="h-5 w-5 ml-auto text-blue-600" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isGenerating}
                      className="w-full h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-lg gap-3 shadow-lg shadow-blue-200"
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

            {step === 'configure' && createMode === 'manual' && (
              <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 p-8">
                  <div className="flex items-center gap-3">
                    <Pencil className="h-6 w-6 text-blue-600" />
                    <CardTitle className="text-2xl font-black">Manual Quiz Creation</CardTitle>
                  </div>
                  <p className="text-gray-500 font-medium mt-2">Create your quiz manually and add questions one by one</p>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="space-y-8">
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-widest">
                        <Layers className="h-4 w-4 text-blue-600" />
                        Quiz Title
                      </label>
                      <input
                        type="text"
                        value={manualQuizSettings.title}
                        onChange={(e) => setManualQuizSettings(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter quiz title..."
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 font-medium"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-widest">
                        <Layers className="h-4 w-4 text-blue-600" />
                        Description
                      </label>
                      <textarea
                        value={manualQuizSettings.description}
                        onChange={(e) => setManualQuizSettings(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Enter quiz description (optional)..."
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 font-medium min-h-[100px] resize-none"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-widest">
                          <Target className="h-4 w-4 text-blue-600" />
                          Total Marks
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="1000"
                          value={manualQuizSettings.totalMarks}
                          onChange={(e) => setManualQuizSettings(prev => ({ ...prev, totalMarks: parseInt(e.target.value) || 100 }))}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 font-medium"
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-widest">
                          <CheckCircle2 className="h-4 w-4 text-blue-600" />
                          Pass Mark
                        </label>
                        <input
                          type="number"
                          min="1"
                          max={manualQuizSettings.totalMarks}
                          value={manualQuizSettings.passMark}
                          onChange={(e) => setManualQuizSettings(prev => ({ ...prev, passMark: parseInt(e.target.value) || 50 }))}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 font-medium"
                        />
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-3xl border-2 border-blue-100 space-y-5">
                      <div className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-widest">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        Quiz Time Settings
                      </div>

                      <div className="grid sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Start Date</label>
                          <input
                            type="date"
                            value={manualQuizSettings.startDate}
                            onChange={(e) => setManualQuizSettings(prev => ({ ...prev, startDate: e.target.value }))}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 font-medium bg-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Start Time</label>
                          <input
                            type="time"
                            value={manualQuizSettings.startTime}
                            onChange={(e) => setManualQuizSettings(prev => ({ ...prev, startTime: e.target.value }))}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 font-medium bg-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">End Date</label>
                          <input
                            type="date"
                            value={manualQuizSettings.endDate}
                            onChange={(e) => setManualQuizSettings(prev => ({ ...prev, endDate: e.target.value }))}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 font-medium bg-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">End Time</label>
                          <input
                            type="time"
                            value={manualQuizSettings.endTime}
                            onChange={(e) => setManualQuizSettings(prev => ({ ...prev, endTime: e.target.value }))}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 font-medium bg-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs font-bold text-gray-600 uppercase tracking-wide">
                          <Clock className="h-4 w-4 text-blue-600" />
                          Duration (minutes)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="480"
                          value={manualQuizSettings.durationMinutes}
                          onChange={(e) => setManualQuizSettings(prev => ({ ...prev, durationMinutes: parseInt(e.target.value) || 60 }))}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 font-medium"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-widest">
                          <ListChecks className="h-4 w-4 text-blue-600" />
                          Questions ({questions.length})
                        </label>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={randomizeQuestions} className="gap-2 rounded-xl" disabled={questions.length === 0}>
                            <Shuffle className="h-4 w-4" />
                            Randomize
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setShowPreview(true)} className="gap-2 rounded-xl" disabled={questions.length === 0}>
                            <Eye className="h-4 w-4" />
                            Preview
                          </Button>
                        </div>
                      </div>

                      {questions.length > 0 ? (
                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragEnd={handleDragEnd}
                        >
                          <SortableContext items={questions.map(q => q.id)} strategy={verticalListSortingStrategy}>
                            <div className="space-y-3">
                              {questions.map((question, index) => (
                                <SortableQuestion
                                  key={question.id}
                                  question={question}
                                  index={index}
                                  onEdit={() => {
                                    setEditingQuestion(question);
                                    setShowQuestionModal(true);
                                  }}
                                  onDelete={() => deleteQuestion(question.id)}
                                />
                              ))}
                            </div>
                          </SortableContext>
                        </DndContext>
                      ) : (
                        <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-2xl">
                          <p className="text-gray-500">No questions added yet. Click below to add your first question.</p>
                        </div>
                      )}

                      <Button variant="outline" onClick={addQuestion} className="w-full rounded-2xl gap-2">
                        <PlusCircle className="h-4 w-4" />
                        Add Question
                      </Button>
                    </div>

                    <Button
                      onClick={handleCreateManualQuiz}
                      disabled={isGenerating || questions.length === 0 || !manualQuizSettings.title.trim()}
                      className="w-full h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-lg gap-3 shadow-lg shadow-blue-200"
                    >
                      {isGenerating ? (
                        <>
                          <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Creating Quiz...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-5 w-5" />
                          Continue to Invite
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 'preview' && generatedQuiz && (
              <Card className="border-none shadow-2xl shadow-gray-200/50 rounded-[2.5rem] overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 p-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-green-100 rounded-xl">
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-black">Quiz Preview</CardTitle>
                        <p className="text-sm text-gray-500">Review your quiz and edit questions before inviting</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => { setShowPreview(true); setPreviewRandomize(false); }} className="gap-2 rounded-xl border-blue-200 text-blue-600 hover:bg-blue-50">
                        <Eye className="h-4 w-4" />
                        Preview Quiz
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => { setShowPreview(true); setPreviewRandomize(true); }} className="gap-2 rounded-xl border-blue-200 text-blue-600 hover:bg-blue-50">
                        <Shuffle className="h-4 w-4" />
                        Random Preview
                      </Button>
                      <Button variant="outline" size="sm" onClick={copyInviteLink} className="gap-2 rounded-xl">
                        <Copy className="h-4 w-4" />
                        Copy Link
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  {createMode === 'manual' && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Quiz Questions ({questions.length})</h3>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={randomizeQuestions} className="gap-2 rounded-xl">
                            <Shuffle className="h-4 w-4" />
                            Randomize Order
                          </Button>
                          <Button variant="outline" size="sm" onClick={addQuestion} className="gap-2 rounded-xl">
                            <Plus className="h-4 w-4" />
                            Add Question
                          </Button>
                        </div>
                      </div>

                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                      >
                        <SortableContext items={questions.map(q => q.id)} strategy={verticalListSortingStrategy}>
                          <div className="space-y-3">
                            {questions.map((question, index) => (
                              <SortableQuestion
                                key={question.id}
                                question={question}
                                index={index}
                                onEdit={() => {
                                  setEditingQuestion(question);
                                  setShowQuestionModal(true);
                                }}
                                onDelete={() => deleteQuestion(question.id)}
                              />
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>
                    </div>
                  )}

                  <div className="mb-8 p-6 bg-blue-50 rounded-3xl border-2 border-blue-100 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-black text-blue-900 uppercase tracking-widest">Learner Access Link</h3>
                      <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">Live Link</span>
                    </div>
                    <code className="text-xs bg-white px-4 py-3 rounded-xl border border-blue-200 font-mono block break-all text-blue-700">
                      {typeof window !== 'undefined' ? `${window.location.origin}/quiz/take/${generatedQuiz.quiz.id}` : ''}
                    </code>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-24 rounded-full flex items-center justify-center bg-blue-100">
                        <Brain className="h-12 w-12 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-2xl font-black text-gray-900 mb-2">{generatedQuiz.quiz.title || 'Untitled Quiz'}</h2>
                        <p className="text-gray-600">{generatedQuiz.quiz.description || 'No description provided'}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-600" />
                            <span>{generatedQuiz.quiz.durationMinutes || generatedQuiz.quiz.timeAllocated} minutes</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-blue-600" />
                            <span>{generatedQuiz.quiz.totalMarks} total marks</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-blue-600" />
                            <span>{generatedQuiz.quiz.passMark}% pass mark</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {createMode === 'ai' && (
                    <div className="space-y-6 mt-6">
                      <h3 className="text-xl font-black text-gray-900 mb-4">Quiz Questions ({questions.length})</h3>
                      <div className="space-y-4">
                        {questions.map((question, index) => (
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
                                    {question.options.map((option: string, optIndex: number) => {
                                      const optionLabel = String.fromCharCode(97 + optIndex);
                                      const isCorrect = Array.isArray(question.correctAnswer)
                                        ? question.correctAnswer.some((ans: string) => ans === option)
                                        : question.correctAnswer === option;

                                      return (
                                        <div key={optIndex} className="flex items-center gap-2 pl-4">
                                          <div className={`w-3 h-3 rounded-full border-2 ${isCorrect ? 'border-green-500 bg-green-500' : 'border-gray-300 bg-gray-50'}`} />
                                          <span className={`flex-1 ${isCorrect ? 'text-green-700 font-bold' : ''}`}>
                                            {optionLabel}) {option}
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
                  )}
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
                    className="w-full h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-lg gap-3 shadow-lg shadow-blue-200"
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
                          <CardTitle className="text-xl font-black">Quiz Ready!</CardTitle>
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
                        <div className="text-2xl font-black text-blue-600">{questions.length}</div>
                        <div className="text-xs font-bold text-blue-800 uppercase">Questions</div>
                      </div>
                      <div className="bg-purple-50 rounded-xl p-4 text-center">
                        <div className="text-2xl font-black text-purple-600">{generatedQuiz.quiz.passMark}%</div>
                        <div className="text-xs font-bold text-purple-800 uppercase">Pass Mark</div>
                      </div>
                      <div className="bg-green-50 rounded-xl p-4 text-center">
                        <div className="text-2xl font-black text-green-600">{generatedQuiz.quiz.durationMinutes || generatedQuiz.quiz.timeAllocated}</div>
                        <div className="text-xs font-bold text-green-800 uppercase">Minutes</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-2xl shadow-gray-200/50 rounded-[2.5rem] overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 p-8">
                    <div className="flex items-center gap-3">
                      <Users className="h-6 w-6 text-blue-600" />
                      <CardTitle className="text-xl font-black">Add Participants</CardTitle>
                    </div>
                    <p className="text-gray-500 font-medium mt-2">Add participants who will receive an email invite to take the quiz</p>
                  </CardHeader>
                  <CardContent className="p-8">
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
                            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 font-medium"
                          />
                        </div>
                        <Button onClick={addParticipant} className="rounded-2xl gap-2 bg-blue-600 hover:bg-blue-700">
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
                                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
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
                        className="w-full h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-lg gap-3 shadow-lg shadow-blue-200 disabled:opacity-50"
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
                      <div className="bg-blue-50 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-bold text-lg text-blue-900">Learner Access Link</h3>
                          <Button variant="ghost" size="sm" onClick={copyInviteLink} className="gap-2 text-blue-600">
                            <Copy className="h-4 w-4" />
                            Copy Link
                          </Button>
                        </div>
                        <code className="text-sm bg-white px-4 py-3 rounded-xl border border-blue-200 font-mono block break-all text-blue-700">
                          {typeof window !== 'undefined' ? `${window.location.origin}/quiz/take/${generatedQuiz.quiz.id}` : ''}
                        </code>
                        <div className="flex items-center justify-between mt-4 p-4 bg-white rounded-xl border border-blue-100">
                          <div>
                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Quiz ID</p>
                            <p className="text-sm font-mono font-bold text-blue-900">{generatedQuiz.quiz.id}</p>
                          </div>
                          <Button variant="ghost" size="sm" onClick={copyQuizId} className="h-8 rounded-lg gap-2 text-blue-600">
                            <Copy className="h-3 w-3" />
                            Copy ID
                          </Button>
                        </div>
                        <p className="text-xs text-blue-700 mt-3">
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
                          onClick={() => router.push('/admin/dashboard')}
                          variant="outline"
                          className="flex-1 h-12 rounded-2xl gap-2"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          Back to Dashboard
                        </Button>
                        <Button
                          onClick={() => { setTab('list'); resetForm(); }}
                          className="flex-1 h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 gap-2"
                        >
                          <Sparkles className="h-4 w-4" />
                          View Past Quizzes
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}
      </div>

      <QuestionEditModal
        question={editingQuestion}
        isOpen={showQuestionModal}
        onClose={() => { setShowQuestionModal(false); setEditingQuestion(null); }}
        onSave={(q) => { saveQuestion(q); setShowQuestionModal(false); setEditingQuestion(null); }}
        totalMarks={manualQuizSettings.totalMarks}
      />

      <PreviewModal
        quiz={generatedQuiz ? {
          title: generatedQuiz.quiz.title || 'Untitled Quiz',
          description: generatedQuiz.quiz.description,
          totalMarks: generatedQuiz.quiz.totalMarks || 100,
          passMark: generatedQuiz.quiz.passMark || 50,
          durationMinutes: generatedQuiz.quiz.durationMinutes || 60,
        } : { title: '', totalMarks: 100, passMark: 50, durationMinutes: 60 }}
        questions={questions}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        randomize={previewRandomize}
      />
    </>
  );
}