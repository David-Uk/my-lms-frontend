'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SlideElement, ElementType, FontWeight, TextAlignment } from '@/types';
import { X } from 'lucide-react';

interface ElementEditorProps {
  element?: SlideElement | null;
  onSave: (element: SlideElement) => void;
  onClose: () => void;
}

type MediaContent = {
  src: string;
  alt?: string;
  source?: string;
  label?: string;
  href?: string;
};

const ELEMENT_TYPES: { value: ElementType; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'image', label: 'Image' },
  { value: 'video', label: 'Video' },
  { value: 'audio', label: 'Audio' },
  { value: 'url', label: 'URL/Link' },
];

export function ElementEditor({ element, onSave, onClose }: ElementEditorProps) {
  const [type, setType] = useState<ElementType>(element?.type || 'text');
  const [content, setContent] = useState(
    typeof element?.content === 'string'
      ? element?.content || ''
      : JSON.stringify(element?.content || '', null, 2),
  );
  const [x, setX] = useState(element?.position.x ?? 100);
  const [y, setY] = useState(element?.position.y ?? 80);
  const [width, setWidth] = useState(element?.size.width ?? 400);
  const [height, setHeight] = useState(element?.size.height ?? 50);
  const [fontFamily, setFontFamily] = useState(element?.style?.font_family || 'Inter');
  const [fontSize, setFontSize] = useState(element?.style?.font_size || 18);
  const [fontWeight, setFontWeight] = useState<FontWeight>(element?.style?.font_weight || 'normal');
  const [color, setColor] = useState(element?.style?.color || '#1e293b');
  const [alignment, setAlignment] = useState<TextAlignment>(element?.style?.alignment || 'left');

  const buildContent = (): string | object => {
    if (type === 'text') return content;
    try {
      return JSON.parse(content) as MediaContent;
    } catch {
      return { src: content };
    }
  };

  const handleSave = () => {
    onSave({
      id: element?.id || `elem-${Date.now()}`,
      type,
      position: { x, y },
      size: { width, height },
      content: buildContent(),
      style: {
        font_family: fontFamily,
        font_size: fontSize,
        font_weight: fontWeight,
        color,
        alignment,
      },
      editable: true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            {element ? 'Edit Element' : 'Add Element'}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Element Type</label>
            <div className="flex flex-wrap gap-2">
              {ELEMENT_TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setType(t.value)}
                  className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                    type === t.value
                      ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content field - varies by type */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              {type === 'text' ? 'Content' :
               type === 'image' ? 'Image URL' :
               type === 'video' ? 'Video URL (YouTube/Vimeo/MP4)' :
               type === 'audio' ? 'Audio URL' :
               type === 'url' ? 'URL' : 'Content'}
            </label>
            <input
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-300"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                type === 'text' ? 'Enter text content...' :
                type === 'image' ? 'https://example.com/image.jpg' :
                type === 'video' ? 'https://youtube.com/watch?v=...' :
                type === 'audio' ? 'https://example.com/audio.mp3' :
                'https://example.com'
              }
            />
          </div>

          {type === 'image' && (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Alt Text</label>
              <input
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-300"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Descriptive text for the image"
              />
            </div>
          )}

          {type === 'text' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Font</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-indigo-300 focus:outline-none"
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                  >
                    {['Inter', 'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Courier New', 'Roboto'].map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Font Size</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-300"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    min={8}
                    max={72}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Weight</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-indigo-300 focus:outline-none"
                    value={fontWeight}
                    onChange={(e) => setFontWeight(e.target.value as FontWeight)}
                  >
                    <option value="normal">Normal</option>
                    <option value="medium">Medium</option>
                    <option value="bold">Bold</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                    />
                    <input
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-300"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Alignment</label>
                <div className="flex gap-2">
                  {(['left', 'center', 'right'] as TextAlignment[]).map((a) => (
                    <button
                      key={a}
                      onClick={() => setAlignment(a)}
                      className={`flex-1 px-4 py-2 rounded-xl border text-sm font-medium capitalize transition-all ${
                        alignment === a
                          ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-600'
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="border-t border-gray-100 pt-4">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Position & Size</label>
            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="text-xs text-gray-500">X</label>
                <input
                  type="number"
                  className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-300"
                  value={x}
                  onChange={(e) => setX(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Y</label>
                <input
                  type="number"
                  className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-300"
                  value={y}
                  onChange={(e) => setY(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Width</label>
                <input
                  type="number"
                  className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-300"
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Height</label>
                <input
                  type="number"
                  className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-300"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={handleSave} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
            {element ? 'Update Element' : 'Add Element'}
          </Button>
        </div>
      </div>
    </div>
  );
}
