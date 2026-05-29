'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { SlideDeckListItem } from '@/types';
import { SlideDeckGenerator } from './SlideDeckGenerator';
import { SlideDeckEditor } from './SlideDeckEditor';
import {
  Presentation,
  Plus,
  Sparkles,
  Trash2,
  ArrowRight,
  Clock,
  FileText,
} from 'lucide-react';

interface SlideDecksViewProps {
  courseId: string;
}

export function SlideDecksView({ courseId }: SlideDecksViewProps) {
  const [decks, setDecks] = useState<SlideDeckListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGenerator, setShowGenerator] = useState(false);
  const [activeDeckId, setActiveDeckId] = useState<string | null>(null);

  const fetchDecks = useCallback(async () => {
    try {
      const data = await api.get<SlideDeckListItem[]>(`/courses/${courseId}/slides`);
      setDecks(data);
    } catch {
      // handled by api client
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchDecks();
  }, [fetchDecks]);

  const handleGenerated = () => {
    setShowGenerator(false);
    fetchDecks();
  };

  const handleDelete = async (deckId: string) => {
    if (!confirm('Delete this slide deck?')) return;
    try {
      await api.del(`/courses/${courseId}/slides/${deckId}`);
      fetchDecks();
    } catch {
      // handled by api client
    }
  };

  if (activeDeckId) {
    return (
      <SlideDeckEditor
        courseId={courseId}
        deckId={activeDeckId}
        onBack={() => setActiveDeckId(null)}
      />
    );
  }

  if (showGenerator) {
    return (
      <div className="max-w-2xl mx-auto">
        <SlideDeckGenerator
          courseId={courseId}
          onGenerated={handleGenerated}
          onCancel={() => setShowGenerator(false)}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Slide Decks</h3>
          <p className="text-sm text-gray-500">
            {decks.length} {decks.length === 1 ? 'deck' : 'decks'} for this course
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowGenerator(true)} className="bg-indigo-600 hover:bg-indigo-700">
            <Sparkles className="h-4 w-4 mr-1" />
            AI Generate
          </Button>
          <Button variant="outline" onClick={() => setShowGenerator(true)}>
            <Plus className="h-4 w-4 mr-1" />
            New Empty
          </Button>
        </div>
      </div>

      {decks.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-2 border-gray-200 bg-gray-50/50">
          <div className="h-16 w-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-400 mx-auto mb-4">
            <Presentation className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No slide decks yet</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Generate a presentation with AI or create one from scratch to accompany your course content.
          </p>
          <div className="flex justify-center gap-3">
            <Button onClick={() => setShowGenerator(true)} className="bg-indigo-600 hover:bg-indigo-700">
              <Sparkles className="h-4 w-4 mr-2" />
              Generate with AI
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {decks.map((deck) => (
            <Card
              key={deck.id}
              className="group hover:shadow-lg transition-all cursor-pointer border-gray-200 hover:border-indigo-200"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="p-2 bg-indigo-50 rounded-xl">
                    <Presentation className="h-5 w-5 text-indigo-600" />
                  </div>
                  <Badge variant="outline" className="text-[10px]">{deck.templateId}</Badge>
                </div>
                <CardTitle className="text-base mt-3 group-hover:text-indigo-600 transition-colors">
                  {deck.title}
                </CardTitle>
                {deck.topic && (
                  <CardDescription className="line-clamp-1">{deck.topic}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(deck.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => setActiveDeckId(deck.id)}
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    Open
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(deck.id)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
