'use client';

import { useState } from 'react';
import { RotateCcw } from 'lucide-react';

interface Flashcard {
    front: string;
    back: string;
}

interface FlashcardDeckProps {
    flashcards: Flashcard[];
    savedSetId?: string;
}

function FlashcardItem({ card, index }: { card: Flashcard; index: number }) {
    const [flipped, setFlipped] = useState(false);

    return (
        <div
            onClick={() => setFlipped((f) => !f)}
            className="cursor-pointer"
            style={{ perspective: '1000px' }}
            role="button"
            aria-label={flipped ? 'Show question' : 'Show answer'}
        >
            <div
                className="relative w-full transition-transform duration-500"
                style={{
                    transformStyle: 'preserve-3d',
                    transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    minHeight: '160px',
                }}
            >
                <div
                    className="absolute inset-0 flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 text-center"
                    style={{ backfaceVisibility: 'hidden' }}
                >
                    <p className="text-xs text-blue-500 font-bold uppercase tracking-widest mb-2">
                        Card {index + 1} · Click to reveal
                    </p>
                    <p className="font-bold text-gray-900 text-sm leading-relaxed">{card.front}</p>
                </div>

                <div
                    className="absolute inset-0 flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 text-center"
                    style={{
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                    }}
                >
                    <p className="text-xs text-green-600 font-bold uppercase tracking-widest mb-2">
                        Answer · Click to flip back
                    </p>
                    <p className="font-bold text-gray-900 text-sm leading-relaxed">{card.back}</p>
                </div>
            </div>
        </div>
    );
}

export function FlashcardDeck({ flashcards }: FlashcardDeckProps) {
    const [key, setKey] = useState(0);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500 font-medium">{flashcards.length} cards — click any card to reveal the answer</p>
                <button
                    onClick={() => setKey((k) => k + 1)}
                    className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-bold transition-colors"
                >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset all
                </button>
            </div>

            <div key={key} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {flashcards.map((card, i) => (
                    <FlashcardItem key={i} card={card} index={i} />
                ))}
            </div>
        </div>
    );
}
