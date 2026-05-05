'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle2, XCircle, AlertTriangle, Clock, ChevronRight, Loader2 } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

// ─── Types ────────────────────────────────────────────────────────────────────

interface QuizQuestion {
    id: string;
    type: string;
    question: string;
    options: string[] | Record<string, string> | null;
    marks: number;
    timeLimit: number | null;
}

interface QuizData {
    id: string;
    title: string;
    description: string | null;
    timeAllocated: number; // minutes
    passMark: number;
}

interface Participant {
    id: string;
    name: string;
    email: string;
    status: string;
    tabSwitchCount: number;
    terminatedByTabSwitch: boolean;
}

type QuizPhase = 'loading' | 'ready' | 'taking' | 'terminated' | 'completed' | 'error';

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function apiPost<T>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${API_BASE_URL}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || 'Request failed');
    return data as T;
}

async function apiGet<T>(path: string): Promise<T> {
    const res = await fetch(`${API_BASE_URL}${path}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || 'Request failed');
    return data as T;
}

function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TakeQuizPage() {
    const params = useParams();
    const router = useRouter();
    const quizId = params.quizId as string;
    const token = params.token as string;

    const [phase, setPhase] = useState<QuizPhase>('loading');
    const [quiz, setQuiz] = useState<QuizData | null>(null);
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [participant, setParticipant] = useState<Participant | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [submittedQuestions, setSubmittedQuestions] = useState<Set<string>>(new Set());
    const [timeLeft, setTimeLeft] = useState(0);
    const [error, setError] = useState('');
    const [results, setResults] = useState<Participant | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Ref so event listeners always see the latest participant/phase
    const participantRef = useRef<Participant | null>(null);
    const phaseRef = useRef<QuizPhase>('loading');
    const hasTerminatedRef = useRef(false);

    useEffect(() => { participantRef.current = participant; }, [participant]);
    useEffect(() => { phaseRef.current = phase; }, [phase]);

    // ── Load quiz on mount ──────────────────────────────────────────────────────
    useEffect(() => {
        if (!quizId || !token) return;

        (async () => {
            try {
                const data = await apiGet<{ quiz: QuizData; questions: QuizQuestion[]; participant: Participant }>(
                    `/quizzes/take/${quizId}/${token}`,
                );
                setQuiz(data.quiz);
                setQuestions(data.questions);
                setParticipant(data.participant);
                setTimeLeft(data.quiz.timeAllocated * 60);

                if (data.participant.status === 'completed') {
                    // Already done — fetch results directly
                    const res = await apiGet<{ participant: Participant }>(`/quizzes/results/${data.participant.id}`);
                    setResults(res.participant);
                    setPhase('completed');
                } else {
                    setPhase('ready');
                }
            } catch (err: any) {
                setError(err.message || 'Failed to load quiz');
                setPhase('error');
            }
        })();
    }, [quizId, token]);

    // ── Countdown timer ─────────────────────────────────────────────────────────
    useEffect(() => {
        if (phase !== 'taking') return;

        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    handleComplete();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [phase]);

    // ── Tab-switch detection ────────────────────────────────────────────────────
    const handleTabSwitch = useCallback(async () => {
        // Only fire once, and only while the quiz is actively being taken
        if (hasTerminatedRef.current) return;
        if (phaseRef.current !== 'taking') return;

        hasTerminatedRef.current = true;
        setPhase('terminated');

        const p = participantRef.current;
        if (!p) return;

        try {
            const res = await apiPost<{ participant: Participant; terminated: boolean }>(
                `/quizzes/take/${quizId}/${p.id}/tab-switch`,
            );
            setResults(res.participant);
        } catch {
            // Even if the API call fails, the UI already shows the terminated screen
        }
    }, [quizId]);

    useEffect(() => {
        const onVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                handleTabSwitch();
            }
        };

        document.addEventListener('visibilitychange', onVisibilityChange);
        return () => document.removeEventListener('visibilitychange', onVisibilityChange);
    }, [handleTabSwitch]);

    // ── Start quiz ──────────────────────────────────────────────────────────────
    const handleStart = async () => {
        if (!participant) return;
        setIsSubmitting(true);
        try {
            // Call start endpoint to mark participant as STARTED (idempotent if already started)
            const res = await apiPost<{ quiz: QuizData; participant: Participant }>('/quizzes/start', {
                quizId,
                token,
            });
            setParticipant(res.participant);
            setPhase('taking');
        } catch (err: any) {
            setError(err.message || 'Failed to start quiz');
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Submit a single answer ──────────────────────────────────────────────────
    const handleSubmitAnswer = async (questionId: string, answer: any) => {
        if (!participant || submittedQuestions.has(questionId)) return;

        try {
            await apiPost(`/quizzes/take/${quizId}/${participant.id}/answer`, {
                questionId,
                answer,
            });
            setSubmittedQuestions((prev) => new Set(prev).add(questionId));
        } catch {
            // Non-fatal — answer may not have saved, but we continue
        }
    };

    // ── Complete quiz normally ──────────────────────────────────────────────────
    const handleComplete = useCallback(async () => {
        if (!participant || hasTerminatedRef.current) return;
        hasTerminatedRef.current = true;
        setIsSubmitting(true);

        try {
            const res = await apiPost<Participant>(`/quizzes/take/${quizId}/${participant.id}/complete`);
            setResults(res);
            setPhase('completed');
        } catch (err: any) {
            setError(err.message || 'Failed to submit quiz');
        } finally {
            setIsSubmitting(false);
        }
    }, [participant, quizId]);

    // ── Answer selection ────────────────────────────────────────────────────────
    const handleSelectAnswer = (questionId: string, answer: any) => {
        setAnswers((prev) => ({ ...prev, [questionId]: answer }));
    };

    const handleNextQuestion = async () => {
        const q = questions[currentIndex];
        if (q && answers[q.id] !== undefined) {
            await handleSubmitAnswer(q.id, answers[q.id]);
        }

        if (currentIndex < questions.length - 1) {
            setCurrentIndex((i) => i + 1);
        } else {
            await handleComplete();
        }
    };

    // ─── Render helpers ──────────────────────────────────────────────────────────

    const renderOptions = (q: QuizQuestion) => {
        const selected = answers[q.id];

        if (q.type === 'true_false') {
            return (
                <div className="grid grid-cols-2 gap-4">
                    {['True', 'False'].map((opt) => (
                        <button
                            key={opt}
                            onClick={() => handleSelectAnswer(q.id, opt.toLowerCase())}
                            className={`py-4 rounded-2xl font-bold text-lg border-2 transition-all ${selected === opt.toLowerCase()
                                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200'
                                    : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300'
                                }`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            );
        }

        if (q.type === 'fill_in_the_blank' || q.type === 'short_answer') {
            return (
                <textarea
                    value={selected ?? ''}
                    onChange={(e) => handleSelectAnswer(q.id, e.target.value)}
                    placeholder="Type your answer here..."
                    rows={4}
                    className="w-full border-2 border-gray-200 rounded-2xl p-4 text-gray-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none resize-none transition-all"
                />
            );
        }

        const options: string[] = Array.isArray(q.options)
            ? q.options
            : q.options
                ? Object.values(q.options)
                : [];

        const isMultiple = q.type === 'multiple_option';

        return (
            <div className="space-y-3">
                {options.map((opt, i) => {
                    const isSelected = isMultiple
                        ? Array.isArray(selected) && selected.includes(opt)
                        : selected === opt;

                    const handleClick = () => {
                        if (isMultiple) {
                            const current: string[] = Array.isArray(selected) ? selected : [];
                            const next = isSelected
                                ? current.filter((v) => v !== opt)
                                : [...current, opt];
                            handleSelectAnswer(q.id, next);
                        } else {
                            handleSelectAnswer(q.id, opt);
                        }
                    };

                    return (
                        <button
                            key={i}
                            onClick={handleClick}
                            className={`w-full text-left px-5 py-4 rounded-2xl border-2 font-medium transition-all flex items-center gap-3 ${isSelected
                                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200'
                                    : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                                }`}
                        >
                            <span
                                className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-sm font-bold flex-shrink-0 ${isSelected ? 'border-white bg-white text-blue-600' : 'border-gray-300 text-gray-500'
                                    }`}
                            >
                                {String.fromCharCode(65 + i)}
                            </span>
                            {opt}
                        </button>
                    );
                })}
            </div>
        );
    };

    // ─── Phase: loading ───────────────────────────────────────────────────────────
    if (phase === 'loading') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Loading your quiz...</p>
                </div>
            </div>
        );
    }

    // ─── Phase: error ─────────────────────────────────────────────────────────────
    if (phase === 'error') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
                    <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Quiz</h2>
                    <p className="text-gray-500">{error}</p>
                </div>
            </div>
        );
    }

    // ─── Phase: ready ─────────────────────────────────────────────────────────────
    if (phase === 'ready' && quiz && participant) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-lg w-full">
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                            <Clock className="h-10 w-10 text-blue-600" />
                        </div>
                        <h1 className="text-3xl font-black text-gray-900">{quiz.title}</h1>
                        {quiz.description && (
                            <p className="text-gray-500 mt-2">{quiz.description}</p>
                        )}
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-bold text-amber-800 text-sm">Tab-Switch Policy</p>
                                <p className="text-amber-700 text-sm mt-1">
                                    Switching tabs or minimising this window will <strong>immediately end your quiz</strong>.
                                    Only the questions you have already answered will count toward your score.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-8 text-center">
                        <div className="bg-gray-50 rounded-2xl p-4">
                            <p className="text-2xl font-black text-gray-900">{questions.length}</p>
                            <p className="text-xs text-gray-500 font-medium mt-1">Questions</p>
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-4">
                            <p className="text-2xl font-black text-gray-900">{quiz.timeAllocated}m</p>
                            <p className="text-xs text-gray-500 font-medium mt-1">Time Limit</p>
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-4">
                            <p className="text-2xl font-black text-gray-900">{quiz.passMark}%</p>
                            <p className="text-xs text-gray-500 font-medium mt-1">Pass Mark</p>
                        </div>
                    </div>

                    <p className="text-center text-gray-600 mb-6">
                        Welcome, <strong>{participant.name}</strong>. Ready when you are.
                    </p>

                    <button
                        onClick={handleStart}
                        disabled={isSubmitting}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-lg rounded-2xl transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <>
                                Start Quiz
                                <ChevronRight className="h-5 w-5" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        );
    }

    // ─── Phase: taking ────────────────────────────────────────────────────────────
    if (phase === 'taking' && quiz && questions.length > 0) {
        const q = questions[currentIndex];
        const progress = ((currentIndex + 1) / questions.length) * 100;
        const isLast = currentIndex === questions.length - 1;
        const hasAnswer = answers[q.id] !== undefined && answers[q.id] !== '';

        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
                {/* Header */}
                <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-gray-500">
                            {currentIndex + 1} / {questions.length}
                        </span>
                        <div className="w-40 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    <div
                        className={`flex items-center gap-2 font-mono font-bold text-lg px-4 py-1.5 rounded-xl ${timeLeft < 60 ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-blue-700'
                            }`}
                    >
                        <Clock className="h-4 w-4" />
                        {formatTime(timeLeft)}
                    </div>
                </div>

                {/* Question */}
                <div className="flex-1 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-xl p-8 max-w-2xl w-full">
                        <div className="flex items-center gap-2 mb-6">
                            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                {q.type.replace(/_/g, ' ')}
                            </span>
                            <span className="text-xs text-gray-400 font-medium">{q.marks} mark{q.marks !== 1 ? 's' : ''}</span>
                        </div>

                        <h2 className="text-xl font-bold text-gray-900 mb-8 leading-relaxed">{q.question}</h2>

                        {renderOptions(q)}

                        <div className="mt-8 flex justify-end">
                            <button
                                onClick={handleNextQuestion}
                                disabled={!hasAnswer || isSubmitting}
                                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-200 flex items-center gap-2"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : isLast ? (
                                    'Submit Quiz'
                                ) : (
                                    <>
                                        Next
                                        <ChevronRight className="h-4 w-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ─── Phase: terminated (tab switch) ──────────────────────────────────────────
    if (phase === 'terminated') {
        const answered = Object.keys(answers).length;
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <AlertTriangle className="h-10 w-10 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-3">Quiz Terminated</h2>
                    <p className="text-gray-600 mb-6">
                        You switched tabs or left this window. Your quiz has been automatically
                        ended as per the exam policy.
                    </p>

                    {results ? (
                        <div className="bg-gray-50 rounded-2xl p-6 mb-6 text-left space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Questions answered</span>
                                <span className="font-bold text-gray-900">
                                    {answered} / {questions.length}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Score</span>
                                <span className="font-bold text-gray-900">
                                    {results.score ?? 0} marks
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Percentage</span>
                                <span className="font-bold text-gray-900">
                                    {(results.percentageScore ?? 0).toFixed(1)}%
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Result</span>
                                <span
                                    className={`font-bold ${results.passed ? 'text-green-600' : 'text-red-600'}`}
                                >
                                    {results.passed ? 'Passed' : 'Failed'}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-50 rounded-2xl p-6 mb-6 text-center text-gray-500 text-sm">
                            <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                            Calculating your score...
                        </div>
                    )}

                    <p className="text-xs text-gray-400">
                        Contact your tutor if you believe this was an error.
                    </p>
                </div>
            </div>
        );
    }

    // ─── Phase: completed ─────────────────────────────────────────────────────────
    if (phase === 'completed' && results) {
        const answered = Object.keys(answers).length || questions.length;
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
                    <div
                        className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 ${results.passed ? 'bg-green-100' : 'bg-red-100'
                            }`}
                    >
                        {results.passed ? (
                            <CheckCircle2 className="h-10 w-10 text-green-600" />
                        ) : (
                            <XCircle className="h-10 w-10 text-red-600" />
                        )}
                    </div>

                    <h2 className="text-2xl font-black text-gray-900 mb-1">
                        {results.passed ? 'Well done!' : 'Quiz Complete'}
                    </h2>
                    <p className="text-gray-500 mb-8">
                        {results.passed
                            ? 'You passed the quiz.'
                            : `You needed ${quiz?.passMark}% to pass.`}
                    </p>

                    <div className="bg-gray-50 rounded-2xl p-6 mb-6 text-left space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Questions answered</span>
                            <span className="font-bold text-gray-900">
                                {answered} / {questions.length}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Score</span>
                            <span className="font-bold text-gray-900">{results.score ?? 0} marks</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Percentage</span>
                            <span className="font-bold text-gray-900">
                                {(results.percentageScore ?? 0).toFixed(1)}%
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Result</span>
                            <span
                                className={`font-bold ${results.passed ? 'text-green-600' : 'text-red-600'}`}
                            >
                                {results.passed ? 'Passed' : 'Failed'}
                            </span>
                        </div>
                    </div>

                    <p className="text-xs text-gray-400">You may close this window.</p>
                </div>
            </div>
        );
    }

    return null;
}
