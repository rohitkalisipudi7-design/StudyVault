'use client';

import { Sparkles, KeyRound, Search, Loader2, ArrowRight, X, FileText, ExternalLink, AlertCircle } from 'lucide-react';
import { ResourceItem } from '@/server/services/resource.service';

interface AiSearchSectionProps {
  institutionName?: string;
  isAiConfigured: boolean;
  providerName?: string | null;
  aiSearchQuery: string;
  setAiSearchQuery: (query: string) => void;
  isAiSearching: boolean;
  aiSearchResult: {
    answer: string;
    matchedResourceIds: string[];
    relevanceExplanation: string;
  } | null;
  setAiSearchResult: (result: any) => void;
  aiSearchError: string | null;
  onOpenAiSettings: () => void;
  onExecuteAiSearch: (e?: React.FormEvent) => void;
  resources: ResourceItem[];
}

export function AiSearchSection({
  institutionName,
  isAiConfigured,
  providerName,
  aiSearchQuery,
  setAiSearchQuery,
  isAiSearching,
  aiSearchResult,
  setAiSearchResult,
  aiSearchError,
  onOpenAiSettings,
  onExecuteAiSearch,
  resources,
}: AiSearchSectionProps) {
  const suggestedQueries = [
    'Operating Systems CPU scheduling algorithms',
    'Process synchronization and semaphores',
    'Relational schema normalization BCNF',
  ];

  return (
    <section className="bg-gradient-to-r from-[#e7dbbf] via-[#f3ead2] to-[#e4d7b0] p-5 sm:p-6 rounded-2xl border border-[#b19681]/60 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#b19681]/30 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#2D3822] text-[#fdfbf6] flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-base sm:text-lg text-[#2D3822]">
              AI Syllabus & Resource Assistant
            </h2>
            <p className="text-[11px] text-[#5c4b3e]/80">
              Search and answer strictly from verified resources of <strong>{institutionName}</strong>
            </p>
          </div>
        </div>

        <button
          onClick={onOpenAiSettings}
          type="button"
          className="text-xs font-serif font-bold text-[#2D3822] hover:text-[#8d9d4f] flex items-center gap-1 self-start sm:self-auto cursor-pointer"
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>
            {isAiConfigured ? `${providerName?.toUpperCase()} Key Active` : 'Connect API Key'}
          </span>
        </button>
      </div>

      <form onSubmit={onExecuteAiSearch} className="space-y-3">
        <div className="relative flex items-center">
          <Search className="w-5 h-5 text-[#5c4b3e]/60 absolute left-4 pointer-events-none" />
          <input
            type="text"
            value={aiSearchQuery}
            onChange={(e) => setAiSearchQuery(e.target.value)}
            placeholder="Ask any question from your college materials (e.g., Bankers algorithm, semaphores, BCNF)..."
            className="w-full pl-12 pr-28 py-3.5 rounded-xl bg-white border border-[#b19681]/50 focus:border-[#8d9d4f] text-[#2D3822] placeholder-[#5c4b3e]/50 text-xs sm:text-sm outline-none transition-all shadow-xs"
          />
          <button
            type="submit"
            disabled={isAiSearching || !aiSearchQuery.trim()}
            className="absolute right-2 px-4 py-2 min-h-[38px] rounded-lg bg-[#2D3822] hover:bg-[#3D4D2F] text-white font-serif font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer shadow-xs active:scale-95"
          >
            {isAiSearching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Ask AI</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[11px] font-mono text-[#5c4b3e]/70 font-semibold mr-1">
            Suggested questions:
          </span>
          {suggestedQueries.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => {
                setAiSearchQuery(chip);
                if (isAiConfigured) {
                  setTimeout(() => {
                    onExecuteAiSearch();
                  }, 50);
                }
              }}
              className="px-2.5 py-1 rounded-lg bg-white/70 hover:bg-white border border-[#b19681]/40 text-[#2D3822] text-[11px] font-medium transition-all cursor-pointer"
            >
              {chip}
            </button>
          ))}
        </div>
      </form>

      {aiSearchResult && (
        <div className="p-4 bg-white rounded-xl border border-[#8d9d4f]/50 shadow-xs space-y-3 animate-ink">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#8d9d4f]">
              Grounded College Answer
            </span>
            <button
              onClick={() => setAiSearchResult(null)}
              type="button"
              aria-label="Close search result"
              className="text-[#5c4b3e]/60 hover:text-[#2D3822] p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs sm:text-sm text-[#2D3822] leading-relaxed font-sans whitespace-pre-wrap">
            {aiSearchResult.answer}
          </p>

          {aiSearchResult.matchedResourceIds?.length > 0 && (
            <div className="pt-2 border-t border-[#b19681]/30">
              <span className="font-serif font-bold text-xs text-[#2D3822] block mb-1.5">
                Matching Resources in {institutionName}:
              </span>
              <div className="flex flex-wrap gap-2">
                {resources
                  .filter((r) => aiSearchResult.matchedResourceIds.includes(r.id))
                  .map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        const targetUrl = r.type === 'file' ? `/api/resources/${r.id}/download` : r.url;
                        window.open(targetUrl, '_blank');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#8d9d4f]/15 hover:bg-[#8d9d4f]/30 border border-[#8d9d4f]/40 text-xs text-[#2D3822] font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      {r.type === 'file' ? <FileText className="w-3.5 h-3.5" /> : <ExternalLink className="w-3.5 h-3.5" />}
                      <span>{r.title}</span>
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {aiSearchError && (
        <div className="p-3 bg-red-100/90 border border-red-300 rounded-xl text-xs text-red-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
            <span>{aiSearchError}</span>
          </div>
          <button
            onClick={onOpenAiSettings}
            type="button"
            className="font-bold underline cursor-pointer"
          >
            Settings
          </button>
        </div>
      )}
    </section>
  );
}
