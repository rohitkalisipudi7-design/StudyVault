'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Navigation } from '@/components/Navigation';
import { AdminUploadTab } from '@/components/admin/AdminUploadTab';
import { AdminHierarchyTab } from '@/components/admin/AdminHierarchyTab';
import { AdminResourcesTab } from '@/components/admin/AdminResourcesTab';
import { EditResourceDialog } from '@/components/admin/EditResourceDialog';
import { 
  ShieldCheck, 
  UploadCloud, 
  Layers, 
  BookOpen, 
  Loader2, 
  AlertCircle, 
  ArrowLeft 
} from 'lucide-react';

export default function AdminPortalPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();

  // Active admin tab
  const [activeTab, setActiveTab] = useState<'upload' | 'hierarchy' | 'resources'>('upload');

  // Hierarchy data
  const [branches, setBranches] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);

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

  // Toast & Error Messages
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const showError = (msg: string) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(null), 4000);
  };

  // 1. Verify Admin Session
  useEffect(() => {
    if (!isAuthLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'admin') {
        router.push('/');
      }
    }
  }, [isAuthLoading, user, router]);

  // 2. Fetch Admin's Institution Data
  const refreshData = useCallback(async () => {
    if (!user || user.role !== 'admin') return;
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
      if (rData.success) {
        setResources(rData.resources);
      }
    } catch {
      showError('Failed to refresh data from server.');
    }
  }, [user, selectedBranchId, selectedCourseId]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Handler: Upload Resource
  const handleResourceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBranchId || !selectedCourseId || !title.trim()) {
      showError('Please fill in all required fields (Branch, Course, Title).');
      return;
    }

    if (uploadType === 'file' && !selectedFile) {
      showError('Please choose a file to upload.');
      return;
    }

    if (uploadType === 'link' && !linkUrl.trim()) {
      showError('Please enter a valid URL.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      let res: Response;
      if (uploadType === 'file') {
        const formData = new FormData();
        formData.append('title', title.trim());
        formData.append('description', description.trim());
        formData.append('branchId', selectedBranchId);
        formData.append('courseId', selectedCourseId);
        if (selectedFile) formData.append('file', selectedFile);

        res = await fetch('/api/resources', {
          method: 'POST',
          body: formData,
        });
      } else {
        res = await fetch('/api/resources', {
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
      }

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload resource.');
      }

      setTitle('');
      setDescription('');
      setLinkUrl('');
      setSelectedFile(null);
      refreshData();
      setActiveTab('resources');
    } catch (err: any) {
      showError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler: Create Branch
  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchName.trim() || !newBranchCode.trim()) return;

    try {
      const res = await fetch('/api/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newBranchName.trim(), code: newBranchCode.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to create branch.');

      setNewBranchName('');
      setNewBranchCode('');
      refreshData();
    } catch (err: any) {
      showError(err.message);
    }
  };

  // Handler: Create Course
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseBranchId || !newCourseName.trim() || !newCourseCode.trim()) return;

    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branchId: courseBranchId,
          name: newCourseName.trim(),
          code: newCourseCode.trim(),
          description: newCourseDesc.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to create course.');

      setNewCourseName('');
      setNewCourseCode('');
      setNewCourseDesc('');
      refreshData();
    } catch (err: any) {
      showError(err.message);
    }
  };

  // Handler: Delete Resource
  const handleDeleteResource = async (id: string) => {
    if (!confirm('Are you sure you want to delete this study resource? This will remove the file from storage.')) {
      return;
    }

    try {
      const res = await fetch(`/api/resources/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to delete resource.');
      refreshData();
    } catch (err: any) {
      showError(err.message);
    }
  };

  // Handler: Save Edited Resource
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResource) return;

    try {
      const res = await fetch(`/api/resources/${editingResource.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle.trim(),
          description: editDesc.trim(),
          url: editingResource.type === 'link' ? editUrl.trim() : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Update failed.');

      setEditingResource(null);
      refreshData();
    } catch (err: any) {
      showError(err.message);
    }
  };

  const availableUploadCourses = courses.filter(
    (c) => !selectedBranchId || c.branch_id === selectedBranchId
  );

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
        {/* Admin Header */}
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

        {activeTab === 'upload' && (
          <AdminUploadTab
            institutionName={user?.institutionName}
            uploadType={uploadType}
            setUploadType={setUploadType}
            selectedBranchId={selectedBranchId}
            setSelectedBranchId={setSelectedBranchId}
            selectedCourseId={selectedCourseId}
            setSelectedCourseId={setSelectedCourseId}
            branches={branches}
            availableUploadCourses={availableUploadCourses}
            title={title}
            setTitle={setTitle}
            description={description}
            setDescription={setDescription}
            linkUrl={linkUrl}
            setLinkUrl={setLinkUrl}
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
            isSubmitting={isSubmitting}
            onSubmit={handleResourceSubmit}
          />
        )}

        {activeTab === 'hierarchy' && (
          <AdminHierarchyTab
            branches={branches}
            courses={courses}
            newBranchName={newBranchName}
            setNewBranchName={setNewBranchName}
            newBranchCode={newBranchCode}
            setNewBranchCode={setNewBranchCode}
            courseBranchId={courseBranchId}
            setCourseBranchId={setCourseBranchId}
            newCourseName={newCourseName}
            setNewCourseName={setNewCourseName}
            newCourseCode={newCourseCode}
            setNewCourseCode={setNewCourseCode}
            newCourseDesc={newCourseDesc}
            setNewCourseDesc={setNewCourseDesc}
            onCreateBranch={handleCreateBranch}
            onCreateCourse={handleCreateCourse}
          />
        )}

        {activeTab === 'resources' && (
          <AdminResourcesTab
            institutionName={user?.institutionName}
            resources={resources}
            resourceSearch={resourceSearch}
            setResourceSearch={setResourceSearch}
            onEditResource={(res) => {
              setEditingResource(res);
              setEditTitle(res.title);
              setEditDesc(res.description || '');
              setEditUrl(res.url);
            }}
            onDeleteResource={handleDeleteResource}
          />
        )}
      </main>

      <EditResourceDialog
        editingResource={editingResource}
        onClose={() => setEditingResource(null)}
        editTitle={editTitle}
        setEditTitle={setEditTitle}
        editDesc={editDesc}
        setEditDesc={setEditDesc}
        editUrl={editUrl}
        setEditUrl={setEditUrl}
        onSave={handleSaveEdit}
      />
    </div>
  );
}
