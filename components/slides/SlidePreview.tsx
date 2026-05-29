'use client';

import { Slide, SlideElement } from '@/types';
import { cn } from '@/utils/cn';
import { Type, Image, BarChart3, Table2, Shapes, Hash } from 'lucide-react';

interface SlidePreviewProps {
  slide: Slide;
  className?: string;
}

export function SlidePreview({ slide, className }: SlidePreviewProps) {
  const getTypeIcon = () => {
    const icons: Record<string, React.ReactNode> = {
      title: <Type className="h-3 w-3" />,
      agenda: <Hash className="h-3 w-3" />,
      content: <Type className="h-3 w-3" />,
      image: <Image className="h-3 w-3" />,
      chart: <BarChart3 className="h-3 w-3" />,
      table: <Table2 className="h-3 w-3" />,
      summary: <Type className="h-3 w-3" />,
      cta: <Shapes className="h-3 w-3" />,
    };
    return icons[slide.type] || <Type className="h-3 w-3" />;
  };

  const bgStyle = slide.background.type === 'gradient'
    ? { backgroundImage: slide.background.value }
    : slide.background.type === 'image'
      ? { backgroundImage: `url(${slide.background.value})`, backgroundSize: 'cover' }
      : { backgroundColor: slide.background.value };

  const renderElement = (elem: SlideElement) => {
    const style = {
      left: `${(elem.position.x / 960) * 100}%`,
      top: `${(elem.position.y / 540) * 100}%`,
      width: `${(elem.size.width / 960) * 100}%`,
      height: `${(elem.size.height / 540) * 100}%`,
      fontFamily: elem.style.font_family,
      fontSize: `${elem.style.font_size * 0.35}px`,
      fontWeight: elem.style.font_weight === 'bold' ? 700 : elem.style.font_weight === 'medium' ? 500 : 400,
      color: elem.style.color,
      textAlign: elem.style.alignment,
    };

    if (elem.type === 'text') {
      return (
        <div
          key={elem.id}
          className="absolute overflow-hidden whitespace-pre-wrap leading-tight"
          style={style}
        >
          {typeof elem.content === 'string' ? elem.content : JSON.stringify(elem.content)}
        </div>
      );
    }

    return (
      <div
        key={elem.id}
        className="absolute flex items-center justify-center bg-gray-100 rounded border border-dashed border-gray-300 text-[8px] text-gray-400 font-medium"
        style={style}
      >
        [{elem.type}]
      </div>
    );
  };

  return (
    <div className={cn('relative w-full aspect-video rounded-lg border shadow-sm overflow-hidden', className)} style={bgStyle}>
      <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-md text-white text-[10px] font-medium">
        {getTypeIcon()}
        <span className="capitalize">{slide.type}</span>
        <span className="text-white/50">|</span>
        <span>{slide.slide_number}</span>
      </div>
      {slide.elements.map(renderElement)}
    </div>
  );
}
