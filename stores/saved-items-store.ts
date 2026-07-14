'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/lib/api';

export interface SavedQuizQuestion {
  question: string;
  options: string[] | Record<string, string>;
  correctAnswer: string;
}

export interface SavedQuiz {
  id: string;
  topic: string;
  title: string;
  questions: SavedQuizQuestion[];
  score: number | null;
  totalAnswered: number;
  createdAt: string;
  lastAccessedAt: string;
}

export interface SavedFlashcardSet {
  id: string;
  topic: string;
  flashcards: { front: string; back: string }[];
  createdAt: string;
  lastAccessedAt: string;
}

interface SavedItemsState {
  savedQuizzes: SavedQuiz[];
  savedFlashcardSets: SavedFlashcardSet[];

  saveQuiz: (quiz: Omit<SavedQuiz, 'id' | 'createdAt' | 'lastAccessedAt' | 'score' | 'totalAnswered'>) => string;
  updateQuizResult: (id: string, score: number, totalAnswered: number) => void;
  deleteQuiz: (id: string) => void;
  getQuiz: (id: string) => SavedQuiz | undefined;

  saveFlashcardSet: (set: Omit<SavedFlashcardSet, 'id' | 'createdAt' | 'lastAccessedAt'>) => string;
  deleteFlashcardSet: (id: string) => void;
  getFlashcardSet: (id: string) => SavedFlashcardSet | undefined;

  refreshFromApi: () => Promise<void>;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

const QUIZZES_ENDPOINT = '/api/v1/learner-items/quizzes';
const FLASHCARDS_ENDPOINT = '/api/v1/learner-items/flashcards';

export const useSavedItems = create<SavedItemsState>()(
  persist(
    (set, get) => ({
      savedQuizzes: [],
      savedFlashcardSets: [],

      saveQuiz: (quiz) => {
        const id = generateId();
        const now = new Date().toISOString();
        const entry: SavedQuiz = {
          ...quiz,
          id,
          score: null,
          totalAnswered: 0,
          createdAt: now,
          lastAccessedAt: now,
        };
        set((state) => ({
          savedQuizzes: [entry, ...state.savedQuizzes],
        }));
        api.post(QUIZZES_ENDPOINT, {
          topic: quiz.topic,
          title: quiz.title,
          questions: quiz.questions,
        }).then((res: any) => {
          if (res?.id && res.id !== id) {
            set((state) => ({
              savedQuizzes: state.savedQuizzes.map((q) =>
                q.id === id ? { ...q, id: res.id } : q
              ),
            }));
          }
        }).catch(() => {});
        return id;
      },

      updateQuizResult: (id, score, totalAnswered) => {
        set((state) => ({
          savedQuizzes: state.savedQuizzes.map((q) =>
            q.id === id
              ? { ...q, score, totalAnswered, lastAccessedAt: new Date().toISOString() }
              : q
          ),
        }));
        api.put(`${QUIZZES_ENDPOINT}/${id}/result`, { score, totalAnswered }).catch(() => {});
      },

      deleteQuiz: (id) => {
        set((state) => ({
          savedQuizzes: state.savedQuizzes.filter((q) => q.id !== id),
        }));
        api.delete(`${QUIZZES_ENDPOINT}/${id}`).catch(() => {});
      },

      getQuiz: (id) => {
        return get().savedQuizzes.find((q) => q.id === id);
      },

      saveFlashcardSet: (setData) => {
        const id = generateId();
        const now = new Date().toISOString();
        const entry: SavedFlashcardSet = {
          ...setData,
          id,
          createdAt: now,
          lastAccessedAt: now,
        };
        set((state) => ({
          savedFlashcardSets: [entry, ...state.savedFlashcardSets],
        }));
        api.post(FLASHCARDS_ENDPOINT, {
          topic: setData.topic,
          flashcards: setData.flashcards,
        }).then((res: any) => {
          if (res?.id && res.id !== id) {
            set((state) => ({
              savedFlashcardSets: state.savedFlashcardSets.map((s) =>
                s.id === id ? { ...s, id: res.id } : s
              ),
            }));
          }
        }).catch(() => {});
        return id;
      },

      deleteFlashcardSet: (id) => {
        set((state) => ({
          savedFlashcardSets: state.savedFlashcardSets.filter((s) => s.id !== id),
        }));
        api.delete(`${FLASHCARDS_ENDPOINT}/${id}`).catch(() => {});
      },

      getFlashcardSet: (id) => {
        return get().savedFlashcardSets.find((s) => s.id === id);
      },

      refreshFromApi: async () => {
        try {
          const [quizzesRes, flashcardsRes] = await Promise.all([
            api.get<any[]>(QUIZZES_ENDPOINT),
            api.get<any[]>(FLASHCARDS_ENDPOINT),
          ]);
          const quizzes: SavedQuiz[] = (quizzesRes || []).map((q: any) => ({
            id: q.id,
            topic: q.topic,
            title: q.title,
            questions: q.questions || [],
            score: q.score ?? null,
            totalAnswered: q.totalAnswered ?? 0,
            createdAt: q.createdAt,
            lastAccessedAt: q.lastAccessedAt || q.updatedAt || q.createdAt,
          }));
          const flashcardSets: SavedFlashcardSet[] = (flashcardsRes || []).map((s: any) => ({
            id: s.id,
            topic: s.topic,
            flashcards: s.flashcards || [],
            createdAt: s.createdAt,
            lastAccessedAt: s.lastAccessedAt || s.updatedAt || s.createdAt,
          }));
          set({ savedQuizzes: quizzes, savedFlashcardSets: flashcardSets });
        } catch {
          // Keep localStorage data as fallback
        }
      },
    }),
    {
      name: 'lms-saved-items',
    }
  )
);
