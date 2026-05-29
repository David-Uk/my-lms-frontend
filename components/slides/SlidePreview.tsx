'use client';

import { Slide, SlideElement } from '@/types';
import { cn } from '@/utils/cn';

interface SlidePreviewProps {
  slide: Slide;
  className?: string;
}

export function SlidePreview({ slide, className }: SlidePreviewProps) {
  const typeIcons: Record<string, string> = {
    title: 'T', agenda: '☰', content: '¶', image: '🖼',
    section: '—', comparison: '⇔', timeline: '↕',
    chart: '▤', table: '⊞', summary: '✓', cta: '→',
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

    if (elem.type === 'image') {
      const src = typeof elem.content === 'string' ? elem.content : (elem.content as any)?.src || '';
      return (
        <div key={elem.id} className="absolute overflow-hidden" style={style}>
          <img
            src={src}
            alt={(elem.content as any)?.alt || ''}
            className="w-full h-full object-cover rounded"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).parentElement!.classList.add('bg-gray-100', 'flex', 'items-center', 'justify-center');
              (e.target as HTMLImageElement).parentElement!.innerHTML = '<span class="text-[8px] text-gray-400">[image]</span>';
            }}
          />
        </div>
      );
    }

    if (elem.type === 'video') {
      const src = typeof elem.content === 'string' ? elem.content : (elem.content as any)?.src || '';
      const isEmbed = src.includes('youtube') || src.includes('youtu.be') || src.includes('vimeo');
      if (isEmbed) {
        const embedUrl = src.includes('youtube')
          ? `https://www.youtube.com/embed/${src.split('v=')[1]?.split('&')[0] || src.split('/').pop()}`
          : src.includes('vimeo')
            ? `https://player.vimeo.com/video/${src.split('/').pop()}`
            : src;
        return (
          <div key={elem.id} className="absolute overflow-hidden rounded" style={style}>
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        );
      }
      return (
        <div key={elem.id} className="absolute overflow-hidden rounded bg-black" style={style}>
          <video src={src} controls className="w-full h-full object-contain" />
        </div>
      );
    }

    if (elem.type === 'audio') {
      const src = typeof elem.content === 'string' ? elem.content : (elem.content as any)?.src || '';
      return (
        <div key={elem.id} className="absolute flex items-center justify-center bg-gray-50 rounded border border-gray-200" style={style}>
          <audio src={src} controls className="w-[90%]" />
        </div>
      );
    }

    if (elem.type === 'url') {
      const href = typeof elem.content === 'string' ? elem.content : (elem.content as any)?.href || '#';
      const label = (elem.content as any)?.label || href;
      return (
        <div key={elem.id} className="absolute flex items-center" style={style}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs underline hover:text-indigo-600 truncate max-w-full"
            style={{ color: elem.style.color, fontFamily: elem.style.font_family }}
          >
            {label}
          </a>
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
        <span>{typeIcons[slide.type] || '?'}</span>
        <span className="capitalize">{slide.type}</span>
        <span className="text-white/50">|</span>
        <span>{slide.slide_number}</span>
      </div>
      {slide.elements.map(renderElement)}
    </div>
  );
}
