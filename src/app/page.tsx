'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { AiSettingsModal } from '@/components/AiSettingsModal';
import { AiSummarizeModal } from '@/components/AiSummarizeModal';
import { ResourceItem } from '@/server/services/resource.service';
import { 
  Search, 
  Download, 
  ExternalLink, 
  Sparkles, 
  FileText, 
  Link as LinkIcon, 
  Building2, 
  Layers, 
  BookOpen, 
  Calendar, 
  User, 
  ChevronRight, 
  X, 
  Loader2, 
  KeyRound, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  Filter,
  RefreshCw
} from 'lucide-react';

export default function StudentDashboardPage() {
  const router = useRouter();

  // User state
  const [user, setUser] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Hierarchy data
  const [branches, setBranches] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [isLoadingResources, setIsLoadingResources] = useState(false);

  // Filters state
  const [selectedBranchId, setSelectedBranchId] = useState<string>('all');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'file' | 'link'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // AI state
  const [aiConfig, setAiConfig] = useState<{
    configured: boolean;
    provider: 'gemini' | 'openai' | 'anthropic' | null;
    keyHint: string | null;
  }>({ configured: false, provider: null, keyHint: null });

  const [isAiSettingsOpen, setIsAiSettingsOpen] = useState(false);
  const [summarizeResource, setSummarizeResource] = useState<ResourceItem | null>(null);

  // AI Search state
  const [aiSearchQuery, setAiSearchQuery] = useState('');
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiSearchResult, setAiSearchResult] = useState<{
    answer: string;
    matchedResourceIds: string[];
    relevanceExplanation: string;
  } | null>(null);
  const [aiSearchError, setAiSearchError] = useState<string | null>(null);

  // AI Recommendations
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1. Check Auth & Load User Profile
  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.push('/login');
          return;
        }
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
          // Set initial branch and course from student profile if available
          if (data.user.branchId) {
            setSelectedBranchId(data.user.branchId);
          }
          if (data.user.courseId) {
            setSelectedCourseId(data.user.courseId);
          }
        } else {
          router.push('/login');
        }
      } catch {
        router.push('/login');
      } finally {
        setIsAuthLoading(false);
      }
    }
    loadUser();
  }, [router]);

  // 2. Load AI Config
  useEffect(() => {
    if (!user) return;
    async function loadAiConfig() {
      try {
        const res = await fetch('/api/ai/config');
        const data = await res.json();
        if (data.success) {
          setAiConfig(data.config);
        }
      } catch {
        // Ignore
      }
    }
    loadAiConfig();
  }, [user]);

  // 3. Load Branches and Courses for User's Institution
  useEffect(() => {
    if (!user) return;
    async function loadHierarchy() {
      try {
        const [bRes, cRes] = await Promise.all([
          fetch('/api/branches'),
          fetch('/api/courses'),
        ]);
        const bData = await bRes.json();
        const cData = await cRes.json();
        if (bData.success) setBranches(bData.branches);
        if (cData.success) setCourses(cData.courses);
      } catch {
        // Ignore
      }
    }
    loadHierarchy();
  }, [user]);

  // 4. Load Scoped Resources for User's College
  const fetchResources = async () => {
    if (!user) return;
    setIsLoadingResources(true);
    try {
      const params = new URLSearchParams();
      if (selectedBranchId !== 'all') params.set('branchId', selectedBranchId);
      if (selectedCourseId !== 'all') params.set('courseId', selectedCourseId);
      if (selectedType !== 'all') params.set('type', selectedType);
      if (searchQuery.trim()) params.set('query', searchQuery.trim());

      const res = await fetch(`/api/resources?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setResources(data.resources);
      }
    } catch {
      // Ignore
    } finally {
      setIsLoadingResources(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [user, selectedBranchId, selectedCourseId, selectedType]);

  // 5. Fetch AI Suggestions if BYOK configured
  useEffect(() => {
    if (!user || !aiConfig.configured) return;
    async function fetchAiSuggestions() {
      setIsLoadingSuggestions(true);
      try {
        const res = await fetch('/api/ai/suggest', { method: 'POST' });
        const data = await res.json();
        if (data.success && data.result?.recommendations) {
          setSuggestions(data.result.recommendations);
        }
      } catch {
        // Ignore
      } finally {
        setIsLoadingSuggestions(false);
      }
    }
    fetchAiSuggestions();
  }, [user, aiConfig.configured]);

  // Handle AI Search Execution
  const handleExecuteAiSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!aiSearchQuery.trim()) return;

    if (!aiConfig.configured) {
      setIsAiSettingsOpen(true);
      return;
    }

    setIsAiSearching(true);
    setAiSearchError(null);
    setAiSearchResult(null);

    try {
      const res = await fetch('/api/ai/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: aiSearchQuery.trim(),
          branchId: selectedBranchId !== 'all' ? selectedBranchId : undefined,
          courseId: selectedCourseId !== 'all' ? selectedCourseId : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to execute AI search.');
      }

      setAiSearchResult(data.result);
    } catch (err: any) {
      setAiSearchError(err.message || 'Error executing AI search.');
    } finally {
      setIsAiSearching(false);
    }
  };

  // Filter courses dropdown according to selected branch
  const availableCourses = courses.filter(
    (c) => selectedBranchId === 'all' || c.branch_id === selectedBranchId
  );

  // Find active branch and course objects for breadcrumbs
  const activeBranch = branches.find((b) => b.id === selectedBranchId);
  const activeCourse = courses.find((c) => c.id === selectedCourseId);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#8d9d4f]" />
        <span className="font-serif font-bold text-sm text-[#2D3822]">
          Loading College Study Portal...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#5c4b3e] flex flex-col font-sans selection:bg-[#8d9d4f] selection:text-white">
      <Navigation
        user={user}
        hasApiKey={aiConfig.configured}
        onOpenAiSettings={() => setIsAiSettingsOpen(true)}
      />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 lg:px-8 py-6 space-y-6">
        {/* HIERARCHY BREADCRUMBS */}
        <nav
          aria-label="Hierarchy Breadcrumbs"
          className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#5c4b3e]/70 bg-white/70 p-2.5 rounded-xl border border-[#b19681]/30 shadow-xs"
        >
          <div className="flex items-center gap-1.5 font-bold text-[#2D3822]">
            <Building2 className="w-3.5 h-3.5 text-[#8d9d4f]" />
            <span>{user?.institutionName}</span>
          </div>

          <ChevronRight className="w-3.5 h-3.5 text-[#b19681]" />

          <button
            onClick={() => {
              setSelectedBranchId('all');
              setSelectedCourseId('all');
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
                onClick={() => setSelectedCourseId('all')}
                className={`hover:underline cursor-pointer ${
                  selectedCourseId === 'all' ? 'font-bold text-[#2D3822]' : ''
                }`}
              >
                {activeCourse ? `${activeCourse.code} - ${activeCourse.name}` : 'All Courses'}
              </button>
            </>
          )}

          <div className="ml-auto text-[11px] font-sans font-medium text-[#5c4b3e]/60">
            {resources.length} Verified {resources.length === 1 ? 'Resource' : 'Resources'}
          </div>
        </nav>

        {/* AI-ASSISTED SEARCH BAR WITH BRING-YOUR-OWN-KEY INTEGRATION */}
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
                  Search and answer strictly from verified resources of <strong>{user?.institutionName}</strong>
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsAiSettingsOpen(true)}
              className="text-xs font-serif font-bold text-[#2D3822] hover:text-[#8d9d4f] flex items-center gap-1 self-start sm:self-auto cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>
                {aiConfig.configured
                  ? `${aiConfig.provider?.toUpperCase()} Key Active`
                  : 'Connect API Key'}
              </span>
            </button>
          </div>

          {/* Search Query Input */}
          <form onSubmit={handleExecuteAiSearch} className="space-y-3">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-[#5c4b3e]/60 absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={aiSearchQuery}
                onChange={(e) => setAiSearchQuery(e.target.value)}
                placeholder="Ask any question from your college materials (e.g., Bankers algorithm safe state, semaphores, ER diagram rules)..."
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

            {/* Quick Prompt Chips */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-[11px] font-mono text-[#5c4b3e]/70 font-semibold mr-1">
                Suggested questions:
              </span>
              {[
                'Operating Systems CPU scheduling algorithms',
                'Process synchronization and semaphores',
                'Relational schema normalization BCNF',
              ].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => {
                    setAiSearchQuery(chip);
                    if (aiConfig.configured) {
                      setTimeout(() => {
                        handleExecuteAiSearch();
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

          {/* AI Search Answer Display */}
          {aiSearchResult && (
            <div className="p-4 bg-white rounded-xl border border-[#8d9d4f]/50 shadow-xs space-y-3 animate-ink">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#8d9d4f]">
                  Grounded College Answer
                </span>
                <button
                  onClick={() => setAiSearchResult(null)}
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
                    Matching Resources in {user?.institutionName}:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {resources
                      .filter((r) => aiSearchResult.matchedResourceIds.includes(r.id))
                      .map((r) => (
                        <button
                          key={r.id}
                          onClick={() => {
                            if (r.type === 'file') {
                              window.open(r.url, '_blank');
                            } else {
                              window.open(r.url, '_blank');
                            }
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
                onClick={() => setIsAiSettingsOpen(true)}
                className="font-bold underline text-red-900 hover:text-red-950 ml-2 cursor-pointer"
              >
                Check API Key
              </button>
            </div>
          )}
        </section>

        {/* HIERARCHICAL FILTERS BAR: College -> Branch -> Course */}
        <section className="bg-white p-4 rounded-2xl border border-[#b19681]/50 shadow-xs space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 flex-1">
              {/* Branch Filter */}
              <div className="flex flex-col">
                <label htmlFor="branch-filter" className="text-[10px] font-mono uppercase font-bold text-[#5c4b3e]/70 mb-1">
                  1. Branch / Department
                </label>
                <select
                  id="branch-filter"
                  value={selectedBranchId}
                  onChange={(e) => {
                    setSelectedBranchId(e.target.value);
                    setSelectedCourseId('all');
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
                <label htmlFor="course-filter" className="text-[10px] font-mono uppercase font-bold text-[#5c4b3e]/70 mb-1">
                  2. Course / Subject
                </label>
                <select
                  id="course-filter"
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
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
                <label htmlFor="type-filter" className="text-[10px] font-mono uppercase font-bold text-[#5c4b3e]/70 mb-1">
                  3. Resource Format
                </label>
                <select
                  id="type-filter"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as any)}
                  className="bg-[#FDFBF7] border border-[#b19681]/50 text-[#2D3822] rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-[#8d9d4f] min-h-[40px]"
                >
                  <option value="all">All Formats (Files & Links)</option>
                  <option value="file">Files Only (PDF, DOCX, etc.)</option>
                  <option value="link">Links Only (Web, Repositories)</option>
                </select>
              </div>
            </div>

            {/* Reset Filters Button */}
            {(selectedBranchId !== 'all' || selectedCourseId !== 'all' || selectedType !== 'all' || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedBranchId('all');
                  setSelectedCourseId('all');
                  setSelectedType('all');
                  setSearchQuery('');
                }}
                className="px-3.5 py-2 min-h-[40px] rounded-xl bg-[#FDFBF7] hover:bg-[#8d9d4f]/20 border border-[#b19681]/50 text-xs font-bold text-[#2D3822] self-end md:self-end transition-all cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        </section>

        {/* AI RECOMMENDED NEXT STUDY RESOURCES */}
        {suggestions.length > 0 && (
          <section className="bg-white/80 p-4 rounded-2xl border border-[#b19681]/40 shadow-xs space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#8d9d4f]" />
              <h3 className="font-serif font-bold text-xs uppercase tracking-wider text-[#2D3822]">
                Recommended Next for Your Enrolled Course ({user?.courseName || 'Core'})
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {suggestions.map((sug, i) => {
                const res = resources.find((r) => r.id === sug.resourceId);
                if (!res) return null;
                return (
                  <div
                    key={i}
                    onClick={() => setSummarizeResource(res)}
                    className="p-3 rounded-xl bg-[#FDFBF7] border border-[#b19681]/40 hover:border-[#8d9d4f] transition-all cursor-pointer space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#8d9d4f] font-bold">
                      <span>{res.course_code}</span>
                      <span className="uppercase">{res.type}</span>
                    </div>
                    <h5 className="font-serif font-bold text-xs text-[#2D3822] line-clamp-1">
                      {res.title}
                    </h5>
                    <p className="text-[11px] text-[#5c4b3e]/70 line-clamp-2">
                      {sug.reason}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* STUDY RESOURCES REPOSITORY LIST */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#2D3822]">
              Study Materials & Resources
            </h3>
            <span className="font-mono text-xs bg-white text-[#2D3822] px-3 py-1 rounded-xl border border-[#b19681]/40 font-bold">
              {resources.length} Found
            </span>
          </div>

          {isLoadingResources ? (
            <div className="py-16 text-center space-y-3 bg-white rounded-2xl border border-[#b19681]/30">
              <Loader2 className="w-8 h-8 animate-spin text-[#8d9d4f] mx-auto" />
              <p className="text-xs font-serif font-bold text-[#2D3822]">
                Loading study resources...
              </p>
            </div>
          ) : resources.length === 0 ? (
            <div className="py-16 text-center space-y-3 bg-white rounded-2xl border border-[#b19681]/40">
              <FileText className="w-10 h-10 text-[#5c4b3e]/40 mx-auto" />
              <h4 className="font-serif font-bold text-base text-[#2D3822]">
                No Resources Found
              </h4>
              <p className="text-xs text-[#5c4b3e]/70 max-w-sm mx-auto">
                No materials match the selected branch, course, or search filters in {user?.institutionName}.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedBranchId('all');
                  setSelectedCourseId('all');
                  setSelectedType('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-xl bg-[#2D3822] text-white font-serif font-bold text-xs cursor-pointer"
              >
                Show All Resources
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resources.map((res) => (
                <div
                  key={res.id}
                  className="bg-white p-5 rounded-2xl border border-[#b19681]/50 hover:border-[#8d9d4f] transition-all shadow-xs flex flex-col justify-between gap-4"
                >
                  <div className="space-y-2">
                    {/* Header tags */}
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

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-[#b19681]/30 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setSummarizeResource(res)}
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
          )}
        </section>
      </main>

      {/* AI Bring-Your-Own-Key Settings Modal */}
      <AiSettingsModal
        isOpen={isAiSettingsOpen}
        onClose={() => setIsAiSettingsOpen(false)}
        config={aiConfig}
        onConfigUpdated={(newConfig) => {
          setAiConfig(newConfig);
          showToast('AI Settings updated.');
        }}
      />

      {/* AI Resource Summarize Modal */}
      <AiSummarizeModal
        isOpen={!!summarizeResource}
        onClose={() => setSummarizeResource(null)}
        resource={summarizeResource}
        hasApiKey={aiConfig.configured}
        onOpenAiSettings={() => {
          setSummarizeResource(null);
          setIsAiSettingsOpen(true);
        }}
      />

      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-ink">
          <div className="px-4 py-2.5 rounded-xl bg-[#2D3822] text-white text-xs font-semibold shadow-lg border border-[#8d9d4f]/40 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#8d9d4f]" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Clean Academic Footer */}
      <footer className="mt-16 border-t border-[#b19681]/30 bg-white/50 py-6 px-4 text-center text-xs text-[#5c4b3e]/70">
        <p className="font-serif font-bold text-[#2D3822]">
          NoteVault Academic Resource Platform &bull; {user?.institutionName}
        </p>
        <p className="text-[11px] mt-0.5">
          Organized by College, Branch, and Course &bull; AI-Assisted Study Hub
        </p>
      </footer>
    </div>
  );
}
