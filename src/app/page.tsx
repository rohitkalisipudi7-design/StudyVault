'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Navigation } from '@/components/Navigation';
import { AiSettingsModal } from '@/components/AiSettingsModal';
import { AiSummarizeModal } from '@/components/AiSummarizeModal';
import { BreadcrumbNav } from '@/components/dashboard/BreadcrumbNav';
import { AiSearchSection } from '@/components/dashboard/AiSearchSection';
import { ResourceFilterBar } from '@/components/dashboard/ResourceFilterBar';
import { ResourceGrid } from '@/components/dashboard/ResourceGrid';
import { ResourceItem } from '@/server/services/resource.service';
import { Loader2, Sparkles, UploadCloud } from 'lucide-react';

export default function StudentDashboardPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading, logout } = useAuth();

  // Hierarchy data
  const [branches, setBranches] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [isLoadingResources, setIsLoadingResources] = useState(false);
  const [resourceError, setResourceError] = useState<string | null>(null);

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

  // 1. Redirect if not authenticated
  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login');
    }
  }, [isAuthLoading, user, router]);

  // 2. Initialize branch/course filters from user profile
  useEffect(() => {
    if (user?.branchId) setSelectedBranchId(user.branchId);
    if (user?.courseId) setSelectedCourseId(user.courseId);
  }, [user]);

  // 3. Load AI Config
  const loadAiConfig = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/ai/config');
      const data = await res.json();
      if (data.success) {
        setAiConfig(data.config);
      }
    } catch {
      // Ignore
    }
  }, [user]);

  useEffect(() => {
    loadAiConfig();
  }, [loadAiConfig]);

  // 4. Load Branches and Courses for User's Institution
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

  // 5. Load Scoped Resources
  const fetchResources = useCallback(async () => {
    if (!user) return;
    setIsLoadingResources(true);
    setResourceError(null);
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
      } else {
        setResourceError(data.error || 'Failed to load study resources');
      }
    } catch (err: any) {
      setResourceError(err.message || 'Network error fetching resources');
    } finally {
      setIsLoadingResources(false);
    }
  }, [user, selectedBranchId, selectedCourseId, selectedType, searchQuery]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  // 6. Fetch AI Suggestions if BYOK configured
  useEffect(() => {
    if (!user || !aiConfig.configured) return;
    async function fetchAiSuggestions() {
      try {
        const res = await fetch('/api/ai/suggest', { method: 'POST' });
        const data = await res.json();
        if (data.success && data.result?.recommendations) {
          setSuggestions(data.result.recommendations);
        }
      } catch {
        // Ignore
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

  const handleResetFilters = () => {
    setSelectedBranchId('all');
    setSelectedCourseId('all');
    setSelectedType('all');
    setSearchQuery('');
  };

  const availableCourses = courses.filter(
    (c) => selectedBranchId === 'all' || c.branch_id === selectedBranchId
  );

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
        onLogout={logout}
      />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 lg:px-8 py-6 space-y-6">
        {/* HIERARCHY BREADCRUMBS */}
        <BreadcrumbNav
          institutionName={user?.institutionName}
          branches={branches}
          courses={courses}
          selectedBranchId={selectedBranchId}
          selectedCourseId={selectedCourseId}
          onSelectBranch={setSelectedBranchId}
          onSelectCourse={setSelectedCourseId}
          totalResources={resources.length}
        />

        {/* AI-ASSISTED SEARCH BAR */}
        <AiSearchSection
          institutionName={user?.institutionName}
          isAiConfigured={aiConfig.configured}
          providerName={aiConfig.provider}
          aiSearchQuery={aiSearchQuery}
          setAiSearchQuery={setAiSearchQuery}
          isAiSearching={isAiSearching}
          aiSearchResult={aiSearchResult}
          setAiSearchResult={setAiSearchResult}
          aiSearchError={aiSearchError}
          onOpenAiSettings={() => setIsAiSettingsOpen(true)}
          onExecuteAiSearch={handleExecuteAiSearch}
          resources={resources}
        />

        {/* RESOURCE FILTERS */}
        <ResourceFilterBar
          branches={branches}
          availableCourses={availableCourses}
          selectedBranchId={selectedBranchId}
          selectedCourseId={selectedCourseId}
          selectedType={selectedType}
          searchQuery={searchQuery}
          onSelectBranch={setSelectedBranchId}
          onSelectCourse={setSelectedCourseId}
          onSelectType={setSelectedType}
          onResetFilters={handleResetFilters}
        />

        {/* AI RECOMMENDATIONS */}
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#2D3822]">
                Study Materials & Resources
              </h3>
              <p className="text-xs text-[#5c4b3e]/70">
                Full syllabus notes, question banks, and lab manuals for {user?.institutionName || 'your college'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs bg-white text-[#2D3822] px-3 py-1.5 rounded-xl border border-[#b19681]/40 font-bold shadow-xs">
                {resources.length} Found
              </span>
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#2D3822] hover:bg-[#3D4D2F] text-white text-xs font-serif font-bold shadow-xs transition-all active:scale-95 min-h-[36px]"
              >
                <UploadCloud className="w-4 h-4 text-[#D4AF37]" />
                <span>Upload Material</span>
              </Link>
            </div>
          </div>

          <ResourceGrid
            resources={resources}
            isLoading={isLoadingResources}
            error={resourceError}
            institutionName={user?.institutionName}
            onSummarize={(res) => setSummarizeResource(res)}
            onResetFilters={handleResetFilters}
            onRetry={fetchResources}
          />
        </section>
      </main>

      {/* MODALS */}
      <AiSettingsModal
        isOpen={isAiSettingsOpen}
        onClose={() => setIsAiSettingsOpen(false)}
        config={aiConfig}
        onConfigUpdated={(cfg) => setAiConfig(cfg)}
      />

      <AiSummarizeModal
        isOpen={Boolean(summarizeResource)}
        onClose={() => setSummarizeResource(null)}
        resource={summarizeResource}
        hasApiKey={aiConfig.configured}
        onOpenAiSettings={() => {
          setSummarizeResource(null);
          setIsAiSettingsOpen(true);
        }}
      />
    </div>
  );
}
