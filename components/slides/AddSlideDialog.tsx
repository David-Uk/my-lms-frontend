'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SlideType } from '@/types';
import { Plus, X } from 'lucide-react';

interface AddSlideDialogProps {
  onAdd: (type: SlideType, title: string, count: number) => void;
  onClose: () => void;
}

const SLIDE_TYPE_OPTIONS: { value: SlideType; label: string; icon: string }[] = [
  { value: 'title', label: 'Title Slide', icon: 'T' },
  { value: 'content', label: 'Content', icon: '¶' },
  { value: 'section', label: 'Section Divider', icon: '—' },
  { value: 'image', label: 'Image', icon: '🖼' },
  { value: 'comparison', label: 'Comparison', icon: '⇔' },
  { value: 'timeline', label: 'Timeline', icon: '↕' },
  { value: 'chart', label: 'Chart', icon: '▤' },
  { value: 'table', label: 'Table', icon: '⊞' },
  { value: 'agenda', label: 'Agenda', icon: '☰' },
  { value: 'summary', label: 'Summary', icon: '✓' },
  { value: 'cta', label: 'Call to Action', icon: '→' },
];

export function AddSlideDialog({ onAdd, onClose }: AddSlideDialogProps) {
  const [type, setType] = useState<SlideType>('content');
  const [title, setTitle] = useState('');
  const [count, setCount] = useState(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Add Slide</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Slide Type</label>
            <div className="grid grid-cols-3 gap-2">
              {SLIDE_TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setType(opt.value)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs transition-all ${
                    type === opt.value
                      ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <span className="text-lg">{opt.icon}</span>
                  <span className="font-medium">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Title (optional)</label>
            <input
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-300"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Key Concepts"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Number of slides</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCount(Math.max(1, count - 1))}
                className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-lg hover:bg-gray-50 disabled:opacity-30"
                disabled={count <= 1}
              >
                -
              </button>
              <span className="text-2xl font-bold text-gray-900 w-8 text-center">{count}</span>
              <button
                onClick={() => setCount(Math.min(10, count + 1))}
                className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-lg hover:bg-gray-50 disabled:opacity-30"
                disabled={count >= 10}
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={() => onAdd(type, title, count)} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
            <Plus className="h-4 w-4 mr-1" />
            Add {count > 1 ? `${count} Slides` : 'Slide'}
          </Button>
        </div>
      </div>
    </div>
  );
}
