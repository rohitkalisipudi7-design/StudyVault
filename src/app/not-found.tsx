import Link from 'next/link';
import { BookOpen, Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#5c4b3e] flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="w-16 h-16 rounded-2xl bg-[#e7dbbf] border border-[#b19681]/40 flex items-center justify-center mb-4 text-[#2D3822] shadow-xs">
        <BookOpen className="w-8 h-8 text-[#8d9d4f]" />
      </div>

      <div className="inline-block px-3 py-1 rounded-full bg-[#8d9d4f]/15 border border-[#8d9d4f]/30 font-mono text-xs font-bold text-[#2D3822] mb-3">
        404 Not Found
      </div>

      <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2D3822] mb-2">
        Academic Resource Not Found
      </h1>
      <p className="text-sm text-[#5c4b3e]/80 max-w-md mb-6 leading-relaxed">
        The study resource, course catalog, or page you requested could not be located in your college repository.
      </p>

      <div className="flex items-center justify-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2D3822] hover:bg-[#3D4D2F] text-white font-serif font-bold text-xs shadow-xs transition-all active:scale-95"
        >
          <Home className="w-4 h-4 text-[#D4AF37]" />
          <span>Go to Home Repository</span>
        </Link>
      </div>
    </div>
  );
}
