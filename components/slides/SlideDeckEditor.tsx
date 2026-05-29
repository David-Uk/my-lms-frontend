'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { SlideDeck, Slide } from '@/types';
import { SlidePreview } from './SlidePreview';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Download,
  FileDown,
  Edit3,
  Eye,
} from 'lucide-react';

interface SlideDeckEditorProps {
  courseId: string;
  deckId: string;
  onBack: () => void;
}

export function SlideDeckEditor({ courseId, deckId, onBack }: SlideDeckEditorProps) {
  const [deck, setDeck] = useState<SlideDeck | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSlideIndex, setSelectedSlideIndex] = useState(0);
  const [editingSlideIndex, setEditingSlideIndex] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');

  const fetchDeck = useCallback(async () => {
    try {
      const data = await api.get<SlideDeck>(`/courses/${courseId}/slides/${deckId}`);
      setDeck(data);
    } catch {
      // handled by api client
    } finally {
      setLoading(false);
    }
  }, [courseId, deckId]);

  useEffect(() => {
    fetchDeck();
  }, [fetchDeck]);

  const updateSlide = async (slideId: string, data: Partial<Slide>) => {
    try {
      const updated = await api.put<SlideDeck>(`/courses/${courseId}/slides/${deckId}/slides/${slideId}`, { data });
      setDeck(updated);
    } catch {
      // handled by api client
    }
  };

  const removeSlide = async (slideId: string) => {
    try {
      const updated = await api.del<SlideDeck>(`/courses/${courseId}/slides/${deckId}/slides/${slideId}`);
      setDeck(updated);
      setSelectedSlideIndex(Math.max(0, selectedSlideIndex - 1));
    } catch {
      // handled by api client
    }
  };

  const duplicateSlide = async (slideId: string) => {
    try {
      const updated = await api.post<SlideDeck>(`/courses/${courseId}/slides/${deckId}/slides/${slideId}/duplicate`, {});
      setDeck(updated);
    } catch {
      // handled by api client
    }
  };

  const addSlide = async () => {
    const newSlide: Partial<Slide> = {
      type: 'content',
      title: 'New Slide',
      layout: 'two-column',
      background: { type: 'solid', value: '#ffffff' },
      elements: [
        {
          id: `elem-new-${Date.now()}`,
          type: 'text',
          position: { x: 100, y: 80 },
          size: { width: 760, height: 50 },
          content: 'New Slide',
          style: { font_family: 'Inter', font_size: 32, font_weight: 'bold', color: '#1e293b', alignment: 'left' },
          editable: true,
        },
      ],
      speaker_notes: '',
      image_suggestions: [],
    };
    try {
      const updated = await api.post<SlideDeck>(`/courses/${courseId}/slides/${deckId}/slides`, { slide: newSlide });
      setDeck(updated);
    } catch {
      // handled by api client
    }
  };

  const startEditing = (index: number) => {
    if (!deck) return;
    const slide = deck.slides[index];
    const textElem = slide.elements.find(e => e.type === 'text');
    setEditingSlideIndex(index);
    setEditContent(typeof textElem?.content === 'string' ? textElem.content : '');
  };

  const saveEdit = () => {
    if (editingSlideIndex === null || !deck) return;
    const slide = deck.slides[editingSlideIndex];
    const textElem = slide.elements.find(e => e.type === 'text');
    if (textElem) {
      updateSlide(slide.id, {
        elements: slide.elements.map(e =>
          e.id === textElem.id ? { ...e, content: editContent } : e
        ),
      });
    }
    setEditingSlideIndex(null);
  };

  const moveSlide = async (index: number, direction: 'up' | 'down') => {
    if (!deck) return;
    const slides = deck.slides;
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= slides.length) return;

    const ids = slides.map(s => s.id);
    [ids[index], ids[newIndex]] = [ids[newIndex], ids[index]];

    try {
      const updated = await api.post<SlideDeck>(`/courses/${courseId}/slides/${deckId}/reorder`, { slideIds: ids });
      setDeck(updated);
      setSelectedSlideIndex(newIndex);
    } catch {
      // handled by api client
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/courses/${courseId}/slides/${deckId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      const data = await response.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${deck?.title || 'presentation'}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // handled by api client
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!deck) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Slide deck not found.</p>
        <Button onClick={onBack} className="mt-4">Back</Button>
      </div>
    );
  }

  const slides = deck.slides || [];
  const currentSlide = slides[selectedSlideIndex];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{deck.title}</h2>
            <p className="text-sm text-gray-500">
              {slides.length} {slides.length === 1 ? 'slide' : 'slides'}
              {deck.topic && ` · ${deck.topic}`}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-1" />
            Export JSON
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">Slides</h3>
            <Button size="sm" variant="ghost" onClick={addSlide}>
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`group relative flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedSlideIndex === index
                    ? 'border-indigo-300 bg-indigo-50 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => { setSelectedSlideIndex(index); setEditingSlideIndex(null); }}
              >
                <div className="flex-shrink-0 w-8 h-6 bg-gray-100 rounded text-[10px] font-bold text-gray-500 flex items-center justify-center">
                  {slide.slide_number}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {slide.title || 'Untitled'}
                  </p>
                  <p className="text-[10px] text-gray-400 capitalize">{slide.type}</p>
                </div>
                <div className="hidden group-hover:flex items-center gap-0.5">
                  <button
                    onClick={(e) => { e.stopPropagation(); moveSlide(index, 'up'); }}
                    disabled={index === 0}
                    className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                  >
                    <ChevronUp className="h-3 w-3" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); moveSlide(index, 'down'); }}
                    disabled={index === slides.length - 1}
                    className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                  >
                    <ChevronDown className="h-3 w-3" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); duplicateSlide(slide.id); }}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeSlide(slide.id); }}
                    className="p-1 hover:bg-red-100 rounded text-red-500"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-8 space-y-4">
          {currentSlide && (
            <>
              <SlidePreview slide={currentSlide} />

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Slide Details</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="capitalize">{currentSlide.type}</Badge>
                      <Badge variant="secondary">{currentSlide.layout}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <label className="text-xs font-medium text-gray-500">Title</label>
                      <input
                        className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-900 focus:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-300"
                        value={currentSlide.title}
                        onChange={(e) => updateSlide(currentSlide.id, { title: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500">Speaker Notes</label>
                    <textarea
                      className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-300"
                      rows={3}
                      value={currentSlide.speaker_notes}
                      onChange={(e) => updateSlide(currentSlide.id, { speaker_notes: e.target.value })}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-medium text-gray-500">Text Content</label>
                      {editingSlideIndex === selectedSlideIndex ? (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={saveEdit}>Save</Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingSlideIndex(null)}>Cancel</Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="ghost" onClick={() => startEditing(selectedSlideIndex)}>
                          <Edit3 className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      )}
                    </div>
                    {editingSlideIndex === selectedSlideIndex ? (
                      <textarea
                        className="w-full px-3 py-2 border border-indigo-300 rounded-lg text-sm text-gray-900 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 font-mono"
                        rows={6}
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700 whitespace-pre-wrap">
                        {currentSlide.elements.find(e => e.type === 'text')?.content as string || 'No text content'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500">Elements ({currentSlide.elements.length})</label>
                    <div className="mt-1 space-y-1">
                      {currentSlide.elements.map((elem) => (
                        <div key={elem.id} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-xs text-gray-600">
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">{elem.type}</Badge>
                          <span className="truncate">
                            {typeof elem.content === 'string'
                              ? elem.content.substring(0, 40)
                              : `[${elem.type} data]`
                            }
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
