'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FileText, Link as LinkIcon, UploadCloud, Loader2 } from 'lucide-react';

interface AdminUploadTabProps {
  institutionName?: string;
  uploadType: 'file' | 'link';
  setUploadType: (type: 'file' | 'link') => void;
  selectedBranchId: string;
  setSelectedBranchId: (id: string) => void;
  selectedCourseId: string;
  setSelectedCourseId: (id: string) => void;
  branches: Array<{ id: string; name: string; code: string }>;
  availableUploadCourses: Array<{ id: string; name: string; code: string }>;
  title: string;
  setTitle: (title: string) => void;
  description: string;
  setDescription: (desc: string) => void;
  linkUrl: string;
  setLinkUrl: (url: string) => void;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function AdminUploadTab({
  institutionName,
  uploadType,
  setUploadType,
  selectedBranchId,
  setSelectedBranchId,
  selectedCourseId,
  setSelectedCourseId,
  branches,
  availableUploadCourses,
  title,
  setTitle,
  description,
  setDescription,
  linkUrl,
  setLinkUrl,
  selectedFile,
  setSelectedFile,
  isSubmitting,
  onSubmit,
}: AdminUploadTabProps) {
  return (
    <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[#b19681]/50 shadow-xs max-w-3xl space-y-6 animate-ink">
      <div className="border-b border-[#b19681]/30 pb-3">
        <h2 className="font-serif text-xl font-bold text-[#2D3822]">
          Upload New Study Material
        </h2>
        <p className="text-xs text-[#5c4b3e]/70">
          Uploaded materials become immediately accessible to enrolled students of {institutionName}.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Type Switcher */}
        <div className="space-y-1">
          <Label className="text-xs font-serif font-bold text-[#2D3822]">Resource Format</Label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setUploadType('file')}
              className={`py-2 px-3 rounded-xl text-xs font-serif font-bold border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                uploadType === 'file'
                  ? 'bg-[#2D3822] text-white border-[#2D3822]'
                  : 'bg-[#FDFBF7] text-[#5c4b3e] border-[#b19681]/40 hover:bg-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>File Upload (PDF, DOCX, ZIP)</span>
            </button>
            <button
              type="button"
              onClick={() => setUploadType('link')}
              className={`py-2 px-3 rounded-xl text-xs font-serif font-bold border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                uploadType === 'link'
                  ? 'bg-[#2D3822] text-white border-[#2D3822]'
                  : 'bg-[#FDFBF7] text-[#5c4b3e] border-[#b19681]/40 hover:bg-white'
              }`}
            >
              <LinkIcon className="w-4 h-4" />
              <span>External Link (URL)</span>
            </button>
          </div>
        </div>

        {/* Hierarchy Selection: Branch & Course */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="upload-branch" className="text-xs font-serif font-bold text-[#2D3822]">
              Branch / Department *
            </Label>
            <select
              id="upload-branch"
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              required
              className="w-full bg-[#FDFBF7] border border-[#b19681]/50 text-[#2D3822] rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-[#8d9d4f] min-h-[40px]"
            >
              <option value="">Select Branch</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.code} - {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="upload-course" className="text-xs font-serif font-bold text-[#2D3822]">
              Course / Subject *
            </Label>
            <select
              id="upload-course"
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              required
              className="w-full bg-[#FDFBF7] border border-[#b19681]/50 text-[#2D3822] rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-[#8d9d4f] min-h-[40px]"
            >
              <option value="">Select Course</option>
              {availableUploadCourses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code}: {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Resource Title */}
        <div className="space-y-1">
          <Label htmlFor="res-title" className="text-xs font-serif font-bold text-[#2D3822]">
            Resource Title *
          </Label>
          <Input
            id="res-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Unit 2: Process Synchronization & Semaphore Primitives"
            required
            className="bg-[#FDFBF7] border-[#b19681]/50 text-xs"
          />
        </div>

        {/* Description */}
        <div className="space-y-1">
          <Label htmlFor="res-desc" className="text-xs font-serif font-bold text-[#2D3822]">
            Syllabus Description & Topics Covered
          </Label>
          <Textarea
            id="res-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide syllabus topics, unit number, or key topics covered in this resource..."
            rows={3}
            className="bg-[#FDFBF7] border-[#b19681]/50 text-xs resize-none"
          />
        </div>

        {/* File Picker or Link Input */}
        {uploadType === 'file' ? (
          <div className="space-y-1">
            <Label htmlFor="file-input" className="text-xs font-serif font-bold text-[#2D3822]">
              Select Document File *
            </Label>
            <div className="p-4 border-2 border-dashed border-[#b19681]/50 rounded-xl bg-[#FDFBF7] text-center space-y-2">
              <input
                id="file-input"
                type="file"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                accept=".pdf,.docx,.pptx,.txt,.epub,.zip"
                required
                className="text-xs text-[#5c4b3e] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-serif file:font-bold file:bg-[#2D3822] file:text-white cursor-pointer"
              />
              <p className="text-[11px] text-[#5c4b3e]/60">
                Supported formats: PDF, DOCX, PPTX, TXT, ZIP (Max 15MB)
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            <Label htmlFor="link-url" className="text-xs font-serif font-bold text-[#2D3822]">
              Resource Web URL *
            </Label>
            <Input
              id="link-url"
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.university.edu/lectures/unit2"
              required
              className="bg-[#FDFBF7] border-[#b19681]/50 text-xs"
            />
          </div>
        )}

        <div className="pt-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-[#2D3822] hover:bg-[#3D4D2F] text-white font-serif font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing Upload...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4 text-[#D4AF37]" />
                <span>Publish Resource to {institutionName}</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </section>
  );
}
