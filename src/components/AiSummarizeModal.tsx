'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  BookOpen, 
  CheckCircle2, 
  HelpCircle, 
  Loader2, 
  AlertCircle,
  KeyRound,
  Copy,
  Check
} from 'lucide-react';
import { ResourceItem } from '@/server/services/resource.service';

interface AiSummarizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  resource: ResourceItem | null;
  hasApiKey: boolean;
  onOpenAiSettings: () => void;
}

export function AiSummarizeModal({
  isOpen,
  onClose,
  resource,
  hasApiKey,
  onOpenAiSettings,
}: AiSummarizeModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [summaryData, setSummaryData] = useState<{
    summary: string;
    keyTopics: string[];
    suggestedStudyQuestions: string[];
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && resource && hasApiKey) {
      fetchSummary();
    } else {
      setSummaryData(null);
      setErrorMsg(null);
    }
  }, [isOpen, resource, hasApiKey]);

  const fetchSummary = async () => {
    if (!resource) return;
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resourceId: resource.id }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate summary.');
      }

      setSummaryData(data.result);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error communicating with AI provider.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!summaryData || !resource) return;
    const text = `Resource: ${resource.title}\nCourse: ${resource.course_name}\n\nSummary:\n${summaryData.summary}\n\nKey Topics:\n${summaryData.keyTopics.join(', ')}\n\nStudy Questions:\n${summaryData.suggestedStudyQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!resource) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent onEscapeKeyDown={onClose} className="max-w-2xl bg-[#e7dbbf] text-[#5c4b3e] border border-[#b19681] p-6 rounded-2xl shadow-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#2D3822] text-[#fdfbf6] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <DialogTitle className="font-serif font-bold text-xl text-[#2D3822]">
              AI Resource Digest
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-[#5c4b3e]/80">
            {resource.course_code} {resource.course_name} &bull; {resource.title}
          </DialogDescription>
        </DialogHeader>

        {/* Not Configured Warning */}
        {!hasApiKey ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#D4AF37]/20 text-[#5c4b3e] flex items-center justify-center mx-auto border border-[#D4AF37]/50">
              <KeyRound className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-serif font-bold text-base text-[#2D3822]">
                AI API Key Required
              </h4>
              <p className="text-xs text-[#5c4b3e]/80 max-w-md mx-auto">
                Connect your personal Google Gemini, OpenAI, or Anthropic API key in Settings to activate instant resource summarization and key concept extraction.
              </p>
            </div>
            <Button
              onClick={() => {
                onClose();
                onOpenAiSettings();
              }}
              className="bg-[#2D3822] hover:bg-[#3D4D2F] text-white text-xs font-bold px-5"
            >
              Configure API Key Now
            </Button>
          </div>
        ) : isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
            <Loader2 className="w-7 h-7 animate-spin text-[#8d9d4f]" />
            <span className="font-serif font-bold text-sm text-[#2D3822]">
              Generating high-yield study summary...
            </span>
            <span className="text-xs text-[#5c4b3e]/70">
              Analyzing resource contents against your college curriculum
            </span>
          </div>
        ) : errorMsg ? (
          <div className="p-4 bg-red-100/90 border border-red-300 rounded-xl text-xs text-red-900 space-y-2">
            <div className="flex items-center gap-2 font-bold">
              <AlertCircle className="w-4 h-4 text-red-700" />
              <span>AI Provider Error</span>
            </div>
            <p>{errorMsg}</p>
            <div className="pt-2 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchSummary}
                className="text-xs font-bold border-red-300"
              >
                Retry
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  onOpenAiSettings();
                }}
                className="text-xs font-bold border-red-300"
              >
                Check API Key
              </Button>
            </div>
          </div>
        ) : summaryData ? (
          <div className="space-y-4 pt-1 animate-ink">
            {/* Core Summary */}
            <div className="bg-white/80 p-4 rounded-xl border border-[#b19681]/40 space-y-1.5 shadow-xs">
              <span className="text-[11px] font-mono uppercase font-bold text-[#8d9d4f] tracking-wider block">
                Exam-Yield Summary
              </span>
              <p className="text-xs sm:text-sm text-[#5c4b3e] leading-relaxed font-sans">
                {summaryData.summary}
              </p>
            </div>

            {/* Key Topics */}
            {summaryData.keyTopics?.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-xs font-serif font-bold text-[#2D3822] block">
                  Core Topics Covered:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {summaryData.keyTopics.map((topic, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-[#8d9d4f]/20 border border-[#8d9d4f]/40 text-[#2D3822] text-xs font-medium"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested Self-Test Questions */}
            {summaryData.suggestedStudyQuestions?.length > 0 && (
              <div className="space-y-2 pt-1">
                <span className="text-xs font-serif font-bold text-[#2D3822] block">
                  Practice Questions:
                </span>
                <div className="space-y-1.5">
                  {summaryData.suggestedStudyQuestions.map((q, i) => (
                    <div
                      key={i}
                      className="p-2.5 bg-white/60 rounded-lg border border-[#b19681]/30 text-xs text-[#5c4b3e] flex items-start gap-2"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-[#8d9d4f] shrink-0 mt-0.5" />
                      <span>{q}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}

        <DialogFooter className="pt-2 flex items-center justify-between">
          {summaryData ? (
            <Button
              type="button"
              variant="outline"
              onClick={handleCopy}
              className="text-xs font-bold border-[#b19681]/50 flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Summary'}</span>
            </Button>
          ) : <div />}

          <Button
            type="button"
            onClick={onClose}
            className="bg-[#2D3822] hover:bg-[#3D4D2F] text-white text-xs font-bold px-4"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
