'use client';

import { Loader2, FileText, Link as LinkIcon, Sparkles, Download, ExternalLink, AlertCircle } from 'lucide-react';
import { ResourceItem } from '@/server/services/resource.service';

interface ResourceGridProps {
  resources: ResourceItem[];
  isLoading: boolean;
  error?: string | null;
  institutionName?: string;
  onSummarize: (resource: ResourceItem) => void;
  onResetFilters: () => void;
  onRetry?: () => void;
}

export function ResourceGrid({
  resources,
  isLoading,
  error,
  institutionName,
  onSummarize,
  onResetFilters,
  onRetry,
}: ResourceGridProps) {
  if (isLoading) {
    return (
      <div className="py-16 text-center space-y-3 bg-white rounded-2xl border border-[#b19681]/30">
        <Loader2 className="w-8 h-8 animate-spin text-[#8d9d4f] mx-auto" />
        <p className="text-xs font-serif font-bold text-[#2D3822]">
          Loading verified study resources...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center space-y-3 bg-red-50 rounded-2xl border border-red-200 p-6">
        <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
        <h4 className="font-serif font-bold text-base text-red-900">
          Failed to load study resources
        </h4>
        <p className="text-xs text-red-700 max-w-sm mx-auto">
          {error}
        </p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="px-4 py-2 rounded-xl bg-[#2D3822] text-white font-serif font-bold text-xs cursor-pointer shadow-xs"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  if (resources.length === 0) {
    return (
      <div className="py-16 text-center space-y-3 bg-white rounded-2xl border border-[#b19681]/40">
        <FileText className="w-10 h-10 text-[#5c4b3e]/40 mx-auto" />
        <h4 className="font-serif font-bold text-base text-[#2D3822]">
          No Resources Found
        </h4>
        <p className="text-xs text-[#5c4b3e]/70 max-w-sm mx-auto">
          No materials match the selected branch, course, or search filters in {institutionName}.
        </p>
        <button
          type="button"
          onClick={onResetFilters}
          className="px-4 py-2 rounded-xl bg-[#2D3822] text-white font-serif font-bold text-xs cursor-pointer shadow-xs"
        >
          Show All Resources
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {resources.map((res) => (
        <div
          key={res.id}
          className="bg-white p-5 rounded-2xl border border-[#b19681]/50 hover:border-[#8d9d4f] transition-all shadow-xs flex flex-col justify-between gap-4"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-lg bg-[#FDFBF7] text-[#2D3822] font-bold border border-[#b19681]/50">
                  {res.course_code}
                </span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-[#8d9d4f]/15 text-[#2D3822] font-bold border border-[#8d9d4f]/30">
                  {res.branch_code}
                </span>
              </div>

              <span
                className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  res.type === 'file'
                    ? 'bg-blue-50 text-blue-800 border border-blue-200'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}
              >
                {res.type === 'file' ? <FileText className="w-3 h-3" /> : <LinkIcon className="w-3 h-3" />}
                <span>{res.type === 'file' ? res.file_size || 'File' : 'Link'}</span>
              </span>
            </div>

            <h4 className="font-serif text-base sm:text-lg font-bold text-[#2D3822] leading-snug">
              {res.title}
            </h4>

            <p className="text-xs text-[#5c4b3e]/80 line-clamp-2 leading-relaxed">
              {res.description || 'No additional syllabus notes provided.'}
            </p>

            <div className="text-[11px] text-[#5c4b3e]/60 font-mono pt-1">
              Uploaded by {res.uploader_name} &bull;{' '}
              {new Date(res.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-[#b19681]/30 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => onSummarize(res)}
              className="px-3 py-2 min-h-[38px] rounded-xl bg-[#FDFBF7] hover:bg-[#8d9d4f]/20 border border-[#b19681]/50 text-xs font-bold text-[#2D3822] flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
              title="Generate high-yield AI summary with study questions"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#8d9d4f]" />
              <span>AI Digest</span>
            </button>

            <div className="flex items-center gap-2">
              {res.type === 'file' ? (
                <a
                  href={`/api/resources/${res.id}/download`}
                  download={res.file_name || `${res.course_code}_Notes.pdf`}
                  className="px-4 py-2 min-h-[38px] rounded-xl bg-[#2D3822] hover:bg-[#3D4D2F] text-white font-serif font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Download</span>
                </a>
              ) : (
                <a
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 min-h-[38px] rounded-xl bg-[#2D3822] hover:bg-[#3D4D2F] text-white font-serif font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Open Link</span>
                </a>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
