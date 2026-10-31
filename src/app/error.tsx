'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#5c4b3e] flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="w-16 h-16 rounded-2xl bg-red-100 border border-red-200 flex items-center justify-center mb-4 text-red-700 shadow-xs">
        <AlertCircle className="w-8 h-8" />
      </div>

      <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2D3822] mb-2">
        Something went wrong
      </h1>
      <p className="text-sm text-[#5c4b3e]/80 max-w-md mb-6 leading-relaxed">
        An unexpected error occurred while loading this page. Our service has logged the error details.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => reset()}
          type="button"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2D3822] hover:bg-[#3D4D2F] text-white font-serif font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-[#D4AF37]" />
          <span>Try Again</span>
        </button>

        <Link
          href="/"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-neutral-50 border border-[#b19681]/40 text-[#2D3822] font-serif font-bold text-xs shadow-xs transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
