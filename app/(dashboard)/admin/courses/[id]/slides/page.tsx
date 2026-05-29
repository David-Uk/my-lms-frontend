'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SlideDecksView } from '@/components/slides/SlideDecksView';
import { ArrowLeft } from 'lucide-react';

export default function CourseSlidesPage() {
  const params = useParams();
  const courseId = params.id as string;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/admin/courses/${courseId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Course
          </Button>
        </Link>
      </div>
      <SlideDecksView courseId={courseId} />
    </div>
  );
}
