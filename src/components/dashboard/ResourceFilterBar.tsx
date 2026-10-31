'use client';

interface ResourceFilterBarProps {
  branches: Array<{ id: string; name: string; code: string }>;
  availableCourses: Array<{ id: string; name: string; code: string }>;
  selectedBranchId: string;
  selectedCourseId: string;
  selectedType: 'all' | 'file' | 'link';
  searchQuery: string;
  onSelectBranch: (branchId: string) => void;
  onSelectCourse: (courseId: string) => void;
  onSelectType: (type: 'all' | 'file' | 'link') => void;
  onResetFilters: () => void;
}

export function ResourceFilterBar({
  branches,
  availableCourses,
  selectedBranchId,
  selectedCourseId,
  selectedType,
  searchQuery,
  onSelectBranch,
  onSelectCourse,
  onSelectType,
  onResetFilters,
}: ResourceFilterBarProps) {
  const isFiltered =
    selectedBranchId !== 'all' ||
    selectedCourseId !== 'all' ||
    selectedType !== 'all' ||
    Boolean(searchQuery);

  return (
    <section className="bg-white p-4 rounded-2xl border border-[#b19681]/50 shadow-xs space-y-3">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 flex-1">
          {/* Branch Filter */}
          <div className="flex flex-col">
            <label
              htmlFor="branch-filter"
              className="text-[10px] font-mono uppercase font-bold text-[#5c4b3e]/70 mb-1"
            >
              1. Branch / Department
            </label>
            <select
              id="branch-filter"
              value={selectedBranchId}
              onChange={(e) => {
                onSelectBranch(e.target.value);
                onSelectCourse('all');
              }}
              className="bg-[#FDFBF7] border border-[#b19681]/50 text-[#2D3822] rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-[#8d9d4f] min-h-[40px]"
            >
              <option value="all">All Branches ({branches.length})</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.code} - {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Course Filter */}
          <div className="flex flex-col">
            <label
              htmlFor="course-filter"
              className="text-[10px] font-mono uppercase font-bold text-[#5c4b3e]/70 mb-1"
            >
              2. Course / Subject
            </label>
            <select
              id="course-filter"
              value={selectedCourseId}
              onChange={(e) => onSelectCourse(e.target.value)}
              className="bg-[#FDFBF7] border border-[#b19681]/50 text-[#2D3822] rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-[#8d9d4f] min-h-[40px]"
            >
              <option value="all">All Courses ({availableCourses.length})</option>
              {availableCourses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code}: {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Resource Type Filter */}
          <div className="flex flex-col">
            <label
              htmlFor="type-filter"
              className="text-[10px] font-mono uppercase font-bold text-[#5c4b3e]/70 mb-1"
            >
              3. Resource Format
            </label>
            <select
              id="type-filter"
              value={selectedType}
              onChange={(e) => onSelectType(e.target.value as any)}
              className="bg-[#FDFBF7] border border-[#b19681]/50 text-[#2D3822] rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-[#8d9d4f] min-h-[40px]"
            >
              <option value="all">All Formats (Files & Links)</option>
              <option value="file">Files Only (PDF, DOCX, etc.)</option>
              <option value="link">Links Only (Web, Repositories)</option>
            </select>
          </div>
        </div>

        {isFiltered && (
          <button
            type="button"
            onClick={onResetFilters}
            className="px-3.5 py-2 min-h-[40px] rounded-xl bg-[#FDFBF7] hover:bg-[#8d9d4f]/20 border border-[#b19681]/50 text-xs font-bold text-[#2D3822] self-end md:self-end transition-all cursor-pointer"
          >
            Reset Filters
          </button>
        )}
      </div>
    </section>
  );
}
