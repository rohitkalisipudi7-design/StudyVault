'use client';

import { Layers, BookOpen, Plus } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface AdminHierarchyTabProps {
  branches: Array<{ id: string; name: string; code: string }>;
  courses: Array<{ id: string; name: string; code: string; branch_id: string; description?: string }>;
  newBranchName: string;
  setNewBranchName: (val: string) => void;
  newBranchCode: string;
  setNewBranchCode: (val: string) => void;
  courseBranchId: string;
  setCourseBranchId: (val: string) => void;
  newCourseName: string;
  setNewCourseName: (val: string) => void;
  newCourseCode: string;
  setNewCourseCode: (val: string) => void;
  newCourseDesc: string;
  setNewCourseDesc: (val: string) => void;
  onCreateBranch: (e: React.FormEvent) => void;
  onCreateCourse: (e: React.FormEvent) => void;
}

export function AdminHierarchyTab({
  branches,
  courses,
  newBranchName,
  setNewBranchName,
  newBranchCode,
  setNewBranchCode,
  courseBranchId,
  setCourseBranchId,
  newCourseName,
  setNewCourseName,
  newCourseCode,
  setNewCourseCode,
  newCourseDesc,
  setNewCourseDesc,
  onCreateBranch,
  onCreateCourse,
}: AdminHierarchyTabProps) {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-ink">
      {/* Create Branch Card */}
      <div className="bg-white p-6 rounded-2xl border border-[#b19681]/50 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-[#b19681]/30 pb-2.5">
          <Layers className="w-5 h-5 text-[#8d9d4f]" />
          <h3 className="font-serif font-bold text-base text-[#2D3822]">
            Add New Branch / Department
          </h3>
        </div>

        <form onSubmit={onCreateBranch} className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs font-serif font-bold text-[#2D3822]">Branch Name</Label>
            <Input
              type="text"
              value={newBranchName}
              onChange={(e) => setNewBranchName(e.target.value)}
              placeholder="e.g. Mechanical Engineering"
              required
              className="bg-[#FDFBF7] border-[#b19681]/50 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-serif font-bold text-[#2D3822]">Branch Code</Label>
            <Input
              type="text"
              value={newBranchCode}
              onChange={(e) => setNewBranchCode(e.target.value)}
              placeholder="e.g. MECH"
              required
              className="bg-[#FDFBF7] border-[#b19681]/50 text-xs uppercase"
            />
          </div>
          <Button
            type="submit"
            className="bg-[#2D3822] hover:bg-[#3D4D2F] text-white text-xs font-bold"
          >
            <Plus className="w-4 h-4 mr-1" /> Add Branch
          </Button>
        </form>

        {/* Existing Branches List */}
        <div className="pt-3 border-t border-[#b19681]/30 space-y-2">
          <span className="text-[11px] font-mono uppercase font-bold text-[#5c4b3e]/70">
            Existing Branches ({branches.length})
          </span>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {branches.map((b) => (
              <div
                key={b.id}
                className="p-2.5 rounded-lg bg-[#FDFBF7] border border-[#b19681]/30 flex items-center justify-between text-xs"
              >
                <span className="font-bold text-[#2D3822]">{b.name}</span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-white font-bold border border-[#b19681]/40">
                  {b.code}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create Course Card */}
      <div className="bg-white p-6 rounded-2xl border border-[#b19681]/50 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-[#b19681]/30 pb-2.5">
          <BookOpen className="w-5 h-5 text-[#8d9d4f]" />
          <h3 className="font-serif font-bold text-base text-[#2D3822]">
            Add New Course / Subject
          </h3>
        </div>

        <form onSubmit={onCreateCourse} className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs font-serif font-bold text-[#2D3822]">Parent Branch</Label>
            <select
              value={courseBranchId}
              onChange={(e) => setCourseBranchId(e.target.value)}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs font-serif font-bold text-[#2D3822]">Course Name</Label>
              <Input
                type="text"
                value={newCourseName}
                onChange={(e) => setNewCourseName(e.target.value)}
                placeholder="e.g. Compiler Design"
                required
                className="bg-[#FDFBF7] border-[#b19681]/50 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-serif font-bold text-[#2D3822]">Course Code</Label>
              <Input
                type="text"
                value={newCourseCode}
                onChange={(e) => setNewCourseCode(e.target.value)}
                placeholder="e.g. CS401"
                required
                className="bg-[#FDFBF7] border-[#b19681]/50 text-xs uppercase"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-serif font-bold text-[#2D3822]">Description</Label>
            <Input
              type="text"
              value={newCourseDesc}
              onChange={(e) => setNewCourseDesc(e.target.value)}
              placeholder="Short course overview"
              className="bg-[#FDFBF7] border-[#b19681]/50 text-xs"
            />
          </div>

          <Button
            type="submit"
            className="bg-[#2D3822] hover:bg-[#3D4D2F] text-white text-xs font-bold"
          >
            <Plus className="w-4 h-4 mr-1" /> Add Course
          </Button>
        </form>

        {/* Existing Courses List */}
        <div className="pt-3 border-t border-[#b19681]/30 space-y-2">
          <span className="text-[11px] font-mono uppercase font-bold text-[#5c4b3e]/70">
            Existing Courses ({courses.length})
          </span>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {courses.map((c) => (
              <div
                key={c.id}
                className="p-2.5 rounded-lg bg-[#FDFBF7] border border-[#b19681]/30 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-[#2D3822] block">{c.name}</span>
                  <span className="text-[10px] text-[#5c4b3e]/60">{c.description || 'Core Course'}</span>
                </div>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-white font-bold border border-[#b19681]/40">
                  {c.code}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
