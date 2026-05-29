'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { api } from '@/lib/api';
import { GenerateSlideDeckRequest } from '@/types';
import { Sparkles, Settings2, Wand2 } from 'lucide-react';

interface SlideDeckGeneratorProps {
  courseId: string;
  onGenerated: () => void;
  onCancel: () => void;
}

export function SlideDeckGenerator({ courseId, onGenerated, onCancel }: SlideDeckGeneratorProps) {
  const [generating, setGenerating] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [form, setForm] = useState<GenerateSlideDeckRequest>({
    topic: '',
    audience: '',
    tone: 'professional',
    numberOfSlides: 8,
    language: 'en',
    additionalInstructions: '',
    stylePreferences: '',
    brandColors: '',
    fontPreferences: '',
  });

  const handleGenerate = async () => {
    if (!form.topic.trim()) return;
    setGenerating(true);
    try {
      await api.post(`/courses/${courseId}/slides/generate`, form);
      onGenerated();
    } catch {
      // Toast handled by api client
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card className="border-none shadow-xl rounded-2xl">
      <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-xl">
            <Wand2 className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-white">AI Slide Deck Generator</CardTitle>
            <CardDescription className="text-indigo-200">
              Generate a complete presentation with AI
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <Input
          label="Presentation Topic"
          value={form.topic}
          onChange={(e) => setForm({ ...form, topic: e.target.value })}
          placeholder="e.g. Introduction to Machine Learning"
          required
        />

        <Input
          label="Target Audience"
          value={form.audience || ''}
          onChange={(e) => setForm({ ...form, audience: e.target.value })}
          placeholder="e.g. Software engineering students"
        />

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Tone</label>
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={form.tone}
              onChange={(e) => setForm({ ...form, tone: e.target.value })}
            >
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
              <option value="enthusiastic">Enthusiastic</option>
              <option value="academic">Academic</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Number of Slides</label>
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={form.numberOfSlides}
              onChange={(e) => setForm({ ...form, numberOfSlides: Number(e.target.value) })}
            >
              {[5, 6, 7, 8, 10, 12, 15, 20].map((n) => (
                <option key={n} value={n}>{n} slides</option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <Settings2 className="h-4 w-4" />
          Advanced Settings
        </button>

        {showAdvanced && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <Input
              label="Style Preferences"
              value={form.stylePreferences || ''}
              onChange={(e) => setForm({ ...form, stylePreferences: e.target.value })}
              placeholder="e.g. minimal, clean, lots of diagrams"
            />
            <Input
              label="Brand Colors"
              value={form.brandColors || ''}
              onChange={(e) => setForm({ ...form, brandColors: e.target.value })}
              placeholder="e.g. #2563eb, #1e293b, #f8fafc"
            />
            <Input
              label="Font Preferences"
              value={form.fontPreferences || ''}
              onChange={(e) => setForm({ ...form, fontPreferences: e.target.value })}
              placeholder="e.g. Inter, Roboto"
            />
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Additional Instructions</label>
              <textarea
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                rows={3}
                value={form.additionalInstructions || ''}
                onChange={(e) => setForm({ ...form, additionalInstructions: e.target.value })}
                placeholder="Any specific requirements for the presentation..."
              />
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button
            onClick={handleGenerate}
            isLoading={generating}
            disabled={!form.topic.trim()}
            className="flex-1 h-12 bg-indigo-600 hover:bg-indigo-700"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {generating ? 'Generating...' : 'Generate Deck'}
          </Button>
          <Button variant="outline" onClick={onCancel} className="h-12">
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
