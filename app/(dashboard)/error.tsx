'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Next.js Error Boundary caught:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95 duration-300">
      <div className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center text-red-600 mb-6 shadow-xl shadow-red-100">
        <AlertCircle className="h-10 w-10" />
      </div>
      <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Something went wrong</h1>
      <p className="text-gray-500 max-w-sm mb-8 font-medium">
        {error.message || "We encountered an unexpected error while processing your request."}
      </p>
      <div className="flex items-center gap-4">
        <Button 
          onClick={() => reset()}
          className="h-12 px-6 rounded-2xl bg-gray-900 hover:bg-black text-white shadow-lg transition-all active:scale-95"
        >
          <RefreshCcw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
        <Link href="/">
          <Button 
            variant="outline"
            className="h-12 px-6 rounded-2xl border-gray-200 hover:bg-gray-50 transition-all font-bold"
          >
            <Home className="mr-2 h-4 w-4" />
            Back Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
