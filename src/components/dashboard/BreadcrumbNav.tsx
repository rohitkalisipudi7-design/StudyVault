'use client';

import { Building2, ChevronRight } from 'lucide-react';

interface BreadcrumbNavProps {
  institutionName?: string;
  branches: Array<{ id: string; name: string }>;
  courses: Array<{ id: string; name: string; code: string }>;
  selectedBranchId: string;
  selectedCourseId: string;
  onSelectBranch: (branchId: string) => void;
  onSelectCourse: (courseId: string) => void;
  totalResources: number;
}

export function BreadcrumbNav({
  institutionName,
  branches,
  courses,
  selectedBranchId,
  selectedCourseId,
  onSelectBranch,
  onSelectCourse,
  totalResources,
}: BreadcrumbNavProps) {
  const activeBranch = branches.find((b) => b.id === selectedBranchId);
  const activeCourse = courses.find((c) => c.id === selectedCourseId);

  return (
    <nav
      aria-label="Hierarchy Breadcrumbs"
      className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#5c4b3e]/70 bg-white/70 p-2.5 rounded-xl border border-[#b19681]/30 shadow-xs"
    >
      <div className="flex items-center gap-1.5 font-bold text-[#2D3822]">
        <Building2 className="w-3.5 h-3.5 text-[#8d9d4f]" />
        <span>{institutionName}</span>
      </div>

      <ChevronRight className="w-3.5 h-3.5 text-[#b19681]" />

      <button
        type="button"
        onClick={() => {
          onSelectBranch('all');
          onSelectCourse('all');
        }}
        className={`hover:underline cursor-pointer ${
          selectedBranchId === 'all' ? 'font-bold text-[#2D3822]' : ''
        }`}
      >
        {activeBranch ? activeBranch.name : 'All Branches'}
      </button>

      {selectedBranchId !== 'all' && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-[#b19681]" />
          <button
            type="button"
            onClick={() => onSelectCourse('all')}
            className={`hover:underline cursor-pointer ${
              selectedCourseId === 'all' ? 'font-bold text-[#2D3822]' : ''
            }`}
          >
            {activeCourse ? `${activeCourse.code} - ${activeCourse.name}` : 'All Courses'}
          </button>
        </>
      )}

      <div className="ml-auto text-[11px] font-sans font-medium text-[#5c4b3e]/60">
        {totalResources} Verified {totalResources === 1 ? 'Resource' : 'Resources'}
      </div>
    </nav>
  );
}
