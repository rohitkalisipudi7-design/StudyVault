'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { 
  ShieldCheck, 
  UploadCloud, 
  Link as LinkIcon, 
  FileText, 
  Plus, 
  Trash2, 
  Edit3, 
  Building2, 
  Layers, 
  BookOpen, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft,
  Search,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';

export default function AdminPortalPage() {
  const router = useRouter();

  // Auth state
  const [user, setUser] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Active admin tab
  const [activeTab, setActiveTab] = useState<'upload' | 'hierarchy' | 'resources'>('upload');

  // Hierarchy data
  const [branches, setBranches] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Upload Form State
  const [uploadType, setUploadType] = useState<'file' | 'link'>('file');
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Branch / Course Form State
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchCode, setNewBranchCode] = useState('');
  const [courseBranchId, setCourseBranchId] = useState('');
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseDesc, setNewCourseDesc] = useState('');

  // Edit Resource Dialog State
  const [editingResource, setEditingResource] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editUrl, setEditUrl] = useState('');

  // Resource Filter & Search
  const [resourceSearch, setResourceSearch] = useState('');

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const showError = (msg: string) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(null), 4000);
  };

  // 1. Verify Admin Session
  useEffect(() => {
    async function verifyAdmin() {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.push('/login');
          return;
        }
        const data = await res.json();
        if (!data.success || data.user.role !== 'admin') {
          router.push('/');
          return;
        }
        setUser(data.user);
      } catch {
        router.push('/login');
      } finally {
        setIsAuthLoading(false);
      }
    }
    verifyAdmin();
  }, [router]);

  // 2. Fetch Admin's Institution Data
  const refreshData = async () => {
    if (!user) return;
    setIsLoadingData(true);
    try {
      const [bRes, cRes, rRes] = await Promise.all([
        fetch('/api/branches'),
        fetch('/api/courses'),
        fetch('/api/resources'),
      ]);

      const [bData, cData, rData] = await Promise.all([
        bRes.json(),
        cRes.json(),
        rRes.json(),
      ]);

      if (bData.success) {
        setBranches(bData.branches);
        if (!selectedBranchId && bData.branches.length > 0) {
          setSelectedBranchId(bData.branches[0].id);
          setCourseBranchId(bData.branches[0].id);
        }
      }
      if (cData.success) {
        setCourses(cData.courses);
        if (!selectedCourseId && cData.courses.length > 0) {
          setSelectedCourseId(cData.courses[0].id);
        }
      }
      if (rData.success) setResources(rData.resources);
    } catch (e: any) {
      showError('Failed to load institutional data');
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [user]);

  // Handle Resource Upload Submission
  const handleResourceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedBranchId || !selectedCourseId) {
      showError('Title, branch, and course are required.');
      return;
    }

    if (uploadType === 'file' && !selectedFile) {
      showError('Please select a file to upload.');
      return;
    }

    if (uploadType === 'link' && !linkUrl.trim()) {
      showError('Please enter a valid URL.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (uploadType === 'file' && selectedFile) {
        const formData = new FormData();
        formData.append('title', title.trim());
        formData.append('description', description.trim());
        formData.append('branchId', selectedBranchId);
        formData.append('courseId', selectedCourseId);
        formData.append('file', selectedFile);

        const res = await fetch('/api/resources', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Upload failed.');
        }

        showToast('File uploaded and cataloged successfully.');
      } else {
        const res = await fetch('/api/resources', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim(),
            branchId: selectedBranchId,
            courseId: selectedCourseId,
            url: linkUrl.trim(),
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Link addition failed.');
        }

        showToast('Resource link added successfully.');
      }

      // Reset form
      setTitle('');
      setDescription('');
      setLinkUrl('');
      setSelectedFile(null);
      refreshData();
    } catch (err: any) {
      showError(err.message || 'Error uploading resource.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Create Branch
  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchName.trim() || !newBranchCode.trim()) {
      showError('Branch name and code are required.');
      return;
    }

    try {
      const res = await fetch('/api/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newBranchName, code: newBranchCode }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to create branch.');

      showToast(`Branch "${newBranchCode}" created.`);
      setNewBranchName('');
      setNewBranchCode('');
      refreshData();
    } catch (err: any) {
      showError(err.message);
    }
  };

  // Handle Create Course
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseBranchId || !newCourseName.trim() || !newCourseCode.trim()) {
      showError('Branch, course name, and code are required.');
      return;
    }

    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branchId: courseBranchId,
          name: newCourseName,
          code: newCourseCode,
          description: newCourseDesc,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to create course.');

      showToast(`Course "${newCourseCode}" created.`);
      setNewCourseName('');
      setNewCourseCode('');
      setNewCourseDesc('');
      refreshData();
    } catch (err: any) {
      showError(err.message);
    }
  };

  // Handle Delete Resource
  const handleDeleteResource = async (id: string, resTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${resTitle}"?`)) return;

    try {
      const res = await fetch(`/api/resources/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Delete failed.');

      showToast('Resource deleted.');
      refreshData();
    } catch (err: any) {
      showError(err.message);
    }
  };

  // Handle Edit Resource Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResource) return;

    try {
      const res = await fetch(`/api/resources/${editingResource.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle.trim(),
          description: editDesc.trim(),
          url: editUrl.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Update failed.');

      showToast('Resource updated successfully.');
      setEditingResource(null);
      refreshData();
    } catch (err: any) {
      showError(err.message);
    }
  };

  // Filter courses for upload form
  const availableUploadCourses = courses.filter(
    (c) => !selectedBranchId || c.branch_id === selectedBranchId
  );

  // Filter resources table
  const filteredResources = resources.filter((r) => {
    if (!resourceSearch.trim()) return true;
    const term = resourceSearch.toLowerCase();
    return (
      r.title.toLowerCase().includes(term) ||
      r.course_name?.toLowerCase().includes(term) ||
      r.course_code?.toLowerCase().includes(term) ||
      r.branch_code?.toLowerCase().includes(term)
    );
  });

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#8d9d4f]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#5c4b3e] flex flex-col font-sans selection:bg-[#8d9d4f] selection:text-white">
      <Navigation user={user} />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 lg:px-8 py-8 space-y-6">
        {/* Admin Header with verified institution context */}
        <div className="bg-white p-6 rounded-2xl border border-[#b19681]/50 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-[#2D3822] text-[#fdfbf6]">
                <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
              </span>
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-[#8d9d4f]">
                Institutional Administrator Portal
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2D3822]">
              {user?.institutionName} Management Desk
            </h1>
            <p className="text-xs text-[#5c4b3e]/70">
              Upload study files, manage branches and courses, and maintain link integrity for your college.
            </p>
          </div>

          <Link
            href="/"
            className="px-4 py-2 min-h-[40px] rounded-xl bg-[#FDFBF7] hover:bg-[#8d9d4f]/20 border border-[#b19681]/50 text-xs font-bold text-[#2D3822] flex items-center gap-1.5 self-start sm:self-auto transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Student View</span>
          </Link>
        </div>

        {/* Status Alerts */}
        {errorMessage && (
          <div className="p-4 bg-red-100 border border-red-300 rounded-xl text-xs text-red-900 flex items-center gap-2 animate-ink">
            <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Tab Selection Navigation */}
        <div className="flex items-center gap-2 border-b border-[#b19681]/30 pb-2">
          {[
            { id: 'upload', label: 'Upload Study Resource', icon: UploadCloud },
            { id: 'hierarchy', label: 'Manage Branches & Courses', icon: Layers },
            { id: 'resources', label: `Manage Repository (${resources.length})`, icon: BookOpen },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 min-h-[42px] rounded-xl text-xs font-serif font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#2D3822] text-white shadow-xs'
                    : 'bg-white/70 hover:bg-white text-[#5c4b3e] border border-[#b19681]/30'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: UPLOAD STUDY RESOURCE */}
        {activeTab === 'upload' && (
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[#b19681]/50 shadow-xs max-w-3xl space-y-6 animate-ink">
            <div className="border-b border-[#b19681]/30 pb-3">
              <h2 className="font-serif text-xl font-bold text-[#2D3822]">
                Upload New Study Material
              </h2>
              <p className="text-xs text-[#5c4b3e]/70">
                Uploaded materials become immediately accessible to enrolled students of {user?.institutionName}.
              </p>
            </div>

            <form onSubmit={handleResourceSubmit} className="space-y-4">
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
                      accept=".pdf,.docx,.pptx,.txt,.epub,.zip,.mp4"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setSelectedFile(e.target.files[0]);
                        }
                      }}
                      className="block w-full text-xs text-[#5c4b3e] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#2D3822] file:text-white hover:file:bg-[#3D4D2F] cursor-pointer"
                    />
                    <p className="text-[10px] text-[#5c4b3e]/60 font-mono">
                      Permitted formats: PDF, DOCX, PPTX, TXT, EPUB, ZIP (Max 15MB)
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <Label htmlFor="link-input" className="text-xs font-serif font-bold text-[#2D3822]">
                    Resource URL *
                  </Label>
                  <Input
                    id="link-input"
                    type="url"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://ocw.mit.edu/courses/... or https://nptel.ac.in/..."
                    required
                    className="bg-[#FDFBF7] border-[#b19681]/50 text-xs"
                  />
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#2D3822] hover:bg-[#3D4D2F] text-white font-serif font-bold text-xs h-11 rounded-xl shadow-xs active:scale-95 transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading and Verifying...
                  </>
                ) : (
                  'Publish Study Resource to College Repository'
                )}
              </Button>
            </form>
          </section>
        )}

        {/* TAB 2: MANAGE BRANCHES & COURSES */}
        {activeTab === 'hierarchy' && (
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-ink">
            {/* Create Branch Card */}
            <div className="bg-white p-6 rounded-2xl border border-[#b19681]/50 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-[#b19681]/30 pb-2.5">
                <Layers className="w-5 h-5 text-[#8d9d4f]" />
                <h3 className="font-serif font-bold text-base text-[#2D3822]">
                  Add New Branch / Department
                </h3>
              </div>

              <form onSubmit={handleCreateBranch} className="space-y-3">
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

              <form onSubmit={handleCreateCourse} className="space-y-3">
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
                        <span className="font-bold text-[#2D3822]">{c.name}</span>
                        <span className="font-mono text-[10px] text-[#5c4b3e]/70 block">
                          {c.code}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* TAB 3: MANAGE COLLEGE REPOSITORY */}
        {activeTab === 'resources' && (
          <section className="bg-white p-6 rounded-2xl border border-[#b19681]/50 shadow-xs space-y-4 animate-ink">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#b19681]/30 pb-3">
              <div>
                <h3 className="font-serif font-bold text-lg text-[#2D3822]">
                  Institutional Study Resources
                </h3>
                <p className="text-xs text-[#5c4b3e]/70">
                  All files and links stored under {user?.institutionName}.
                </p>
              </div>

              {/* Search input */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-[#5c4b3e]/60 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  type="text"
                  value={resourceSearch}
                  onChange={(e) => setResourceSearch(e.target.value)}
                  placeholder="Filter resources..."
                  className="pl-9 bg-[#FDFBF7] border-[#b19681]/50 text-xs h-9"
                />
              </div>
            </div>

            {/* Resources Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#b19681]/40 text-[#5c4b3e]/80 font-mono uppercase text-[10px]">
                    <th className="py-2.5 px-3">Format</th>
                    <th className="py-2.5 px-3">Title & Details</th>
                    <th className="py-2.5 px-3">Branch & Course</th>
                    <th className="py-2.5 px-3">Uploaded</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#b19681]/20">
                  {filteredResources.map((res) => (
                    <tr key={res.id} className="hover:bg-[#FDFBF7] transition-colors">
                      <td className="py-3 px-3 align-top">
                        <span
                          className={`inline-flex items-center gap-1 font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                            res.type === 'file'
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {res.type === 'file' ? <FileText className="w-3 h-3" /> : <LinkIcon className="w-3 h-3" />}
                          <span>{res.type}</span>
                        </span>
                      </td>

                      <td className="py-3 px-3 align-top max-w-sm">
                        <span className="font-serif font-bold text-[#2D3822] block leading-snug">
                          {res.title}
                        </span>
                        <p className="text-[11px] text-[#5c4b3e]/70 line-clamp-1 mt-0.5">
                          {res.description}
                        </p>
                        <a
                          href={res.type === 'file' ? `/api/resources/${res.id}/download` : res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-[#8d9d4f] font-mono hover:underline inline-flex items-center gap-1 mt-1"
                        >
                          {res.file_name || res.url} <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </td>

                      <td className="py-3 px-3 align-top font-mono text-[11px]">
                        <span className="font-bold text-[#2D3822]">{res.course_code}</span>
                        <span className="text-[#5c4b3e]/60 block">{res.branch_code}</span>
                      </td>

                      <td className="py-3 px-3 align-top text-[11px] text-[#5c4b3e]/70 font-mono">
                        {new Date(res.created_at).toLocaleDateString()}
                      </td>

                      <td className="py-3 px-3 align-top text-right space-x-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingResource(res);
                            setEditTitle(res.title);
                            setEditDesc(res.description || '');
                            setEditUrl(res.url);
                          }}
                          className="p-1.5 rounded-lg text-[#5c4b3e] hover:bg-[#8d9d4f]/20 hover:text-[#2D3822] transition-colors cursor-pointer"
                          title="Edit Resource"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteResource(res.id, res.title)}
                          className="p-1.5 rounded-lg text-red-700 hover:bg-red-50 hover:text-red-900 transition-colors cursor-pointer"
                          title="Delete Resource"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredResources.length === 0 && (
                <div className="py-8 text-center text-xs text-[#5c4b3e]/60">
                  No resources found matching filter.
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      {/* EDIT RESOURCE MODAL */}
      {editingResource && (
        <Dialog open={!!editingResource} onOpenChange={(open) => !open && setEditingResource(null)}>
          <DialogContent className="max-w-md bg-[#e7dbbf] text-[#5c4b3e] border border-[#b19681] p-6 rounded-2xl shadow-xl">
            <DialogHeader>
              <DialogTitle className="font-serif font-bold text-lg text-[#2D3822]">
                Edit Study Resource
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleEditSubmit} className="space-y-3 pt-2">
              <div className="space-y-1">
                <Label className="text-xs font-serif font-bold text-[#2D3822]">Title</Label>
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  className="bg-white border-[#b19681]/50 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-serif font-bold text-[#2D3822]">Description</Label>
                <Textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={3}
                  className="bg-white border-[#b19681]/50 text-xs resize-none"
                />
              </div>

              {editingResource.type === 'link' && (
                <div className="space-y-1">
                  <Label className="text-xs font-serif font-bold text-[#2D3822]">URL</Label>
                  <Input
                    value={editUrl}
                    onChange={(e) => setEditUrl(e.target.value)}
                    required
                    className="bg-white border-[#b19681]/50 text-xs"
                  />
                </div>
              )}

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingResource(null)}
                  className="text-xs font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#2D3822] hover:bg-[#3D4D2F] text-white text-xs font-bold"
                >
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-ink">
          <div className="px-4 py-2.5 rounded-xl bg-[#2D3822] text-white text-xs font-semibold shadow-lg border border-[#8d9d4f]/40 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#8d9d4f]" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}
