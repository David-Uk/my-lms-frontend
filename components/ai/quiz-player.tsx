'use client';

import { useState } from 'react';
import { CheckCircle2, XCircle, RotateCcw, Trophy } from 'lucide-react';

interface QuizQuestion {
    question: string;
    options: string[] | Record<string, string>;
    correctAnswer: string;
}

interface QuizPlayerProps {
    questions: QuizQuestion[];
}

type QuizState = 'taking' | 'results';

export function QuizPlayer({ questions }: QuizPlayerProps) {
    const [selected, setSelected] = useState<Record<number, string>>({});
    const [submitted, setSubmitted] = useState<Record<number, boolean>>({});
    const [quizState, setQuizState] = useState<QuizState>('taking');

    // Normalise options to a plain string array regardless of what the AI returned
    const getOptions = (q: QuizQuestion): string[] => {
        if (Array.isArray(q.options)) return q.options;
        if (q.options && typeof q.options === 'object') return Object.values(q.options);
        return [];
    };

    const handleSelect = (qIndex: number, option: string) => {
        if (submitted[qIndex]) return; // locked after submission
        setSelected((prev) => ({ ...prev, [qIndex]: option }));
    };

    const handleSubmitQuestion = (qIndex: number) => {
        if (!selected[qIndex]) return;
        setSubmitted((prev) => ({ ...prev, [qIndex]: true }));
    };

    const allAnswered = questions.every((_, i) => submitted[i]);

    const score = questions.reduce((acc, q, i) => {
        if (!submitted[i]) return acc;
        return acc + (selected[i] === q.correctAnswer ? 1 : 0);
    }, 0);

    const percentage = Math.round((score / questions.length) * 100);

    const handleReset = () => {
        setSelected({});
        setSubmitted({});
        setQuizState('taking');
    };

    if (quizState === 'results') {
        return (
            <div className="space-y-6">
                {/* Score card */}
                <div className={`rounded-2xl p-6 text-center ${percentage >= 60 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <Trophy className={`h-10 w-10 mx-auto mb-2 ${percentage >= 60 ? 'text-green-500' : 'text-red-400'}`} />
                    <p className="text-3xl font-black text-gray-900">{score} / {questions.length}</p>
                    <p className={`text-lg font-bold mt-1 ${percentage >= 60 ? 'text-green-600' : 'text-red-600'}`}>
                        {percentage}% — {percentage >= 60 ? 'Passed' : 'Needs improvement'}
                    </p>
                </div>

                {/* Review */}
                <div className="space-y-4">
                    {questions.map((q, i) => {
                        const opts = getOptions(q);
                        const isCorrect = selected[i] === q.correctAnswer;
                        return (
                            <div key={i} className={`p-4 rounded-2xl border-2 ${isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                                <div className="flex items-start gap-2 mb-3">
                                    {isCorrect
                                        ? <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        : <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />}
                                    <p className="font-bold text-gray-900">{i + 1}. {q.question}</p>
                                </div>
                                <div className="space-y-2 ml-7">
                                    {opts.map((opt, j) => {
                                        const isAnswer = opt === q.correctAnswer;
                                        const isChosen = opt === selected[i];
                                        return (
                                            <div
                                                key={j}
                                                className={`px-3 py-2 rounded-xl text-sm font-medium border ${isAnswer
                                                        ? 'bg-green-100 border-green-400 text-green-800'
                                                        : isChosen && !isAnswer
                                                            ? 'bg-red-100 border-red-400 text-red-800'
                                                            : 'bg-white border-gray-200 text-gray-600'
                                                    }`}
                                            >
                                                {opt}
                                                {isAnswer && <span className="ml-2 text-xs font-bold text-green-700">✓ Correct</span>}
                                                {isChosen && !isAnswer && <span className="ml-2 text-xs font-bold text-red-700">✗ Your answer</span>}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <button
                    onClick={handleReset}
                    className="flex items-center gap-2 mx-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all"
                >
                    <RotateCcw className="h-4 w-4" />
                    Retake Quiz
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            {questions.map((q, i) => {
                const opts = getOptions(q);
                const isSubmitted = submitted[i];
                const isCorrect = isSubmitted && selected[i] === q.correctAnswer;

                return (
                    <div key={i} className="p-5 bg-gray-50 rounded-2xl border">
                        <p className="font-bold text-gray-900 mb-4">{i + 1}. {q.question}</p>

                        <div className="space-y-2">
                            {opts.map((opt, j) => {
                                const isSelected = selected[i] === opt;
                                const isAnswer = opt === q.correctAnswer;

                                let style = 'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50';
                                if (isSelected && !isSubmitted) style = 'bg-blue-600 border-blue-600 text-white';
                                if (isSubmitted && isAnswer) style = 'bg-green-100 border-green-500 text-green-800';
                                if (isSubmitted && isSelected && !isAnswer) style = 'bg-red-100 border-red-500 text-red-800';

                                return (
                                    <button
                                        key={j}
                                        onClick={() => handleSelect(i, opt)}
                                        disabled={isSubmitted}
                                        className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all flex items-center justify-between ${style}`}
                                    >
                                        <span>{opt}</span>
                                        {isSubmitted && isAnswer && <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />}
                                        {isSubmitted && isSelected && !isAnswer && <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />}
                                    </button>
                                );
                            })}
                        </div>

                        {!isSubmitted ? (
                            <button
                                onClick={() => handleSubmitQuestion(i)}
                                disabled={!selected[i]}
                                className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-all"
                            >
                                Confirm Answer
                            </button>
                        ) : (
                            <p className={`mt-3 text-sm font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                {isCorrect ? '✓ Correct!' : `✗ Incorrect — correct answer: ${q.correctAnswer}`}
                            </p>
                        )}
                    </div>
                );
            })}

            {allAnswered && (
                <button
                    onClick={() => setQuizState('results')}
                    className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
                >
                    <Trophy className="h-5 w-5" />
                    See Results
                </button>
            )}
        </div>
    );
}
