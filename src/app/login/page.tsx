'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { 
  ArrowLeft, 
  BookOpen, 
  AlertCircle, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';

interface InstitutionOption {
  id: string;
  name: string;
  code: string;
}

interface BranchOption {
  id: string;
  institution_id: string;
  name: string;
  code: string;
}

interface CourseOption {
  id: string;
  branch_id: string;
  name: string;
  code: string;
}

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';

  const { login } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupRole, setSignupRole] = useState<'student' | 'admin'>('student');
  const [selectedInstitutionId, setSelectedInstitutionId] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');

  // College search & custom college registration state
  const [collegeSearchFilter, setCollegeSearchFilter] = useState('');
  const [isRegisteringCustomCollege, setIsRegisteringCustomCollege] = useState(false);
  const [customCollegeName, setCustomCollegeName] = useState('');
  const [customCollegeCode, setCustomCollegeCode] = useState('');
  const [isAddingCollege, setIsAddingCollege] = useState(false);

  // Dynamic dropdown lists
  const [institutions, setInstitutions] = useState<InstitutionOption[]>([]);
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [isFetchingOptions, setIsFetchingOptions] = useState(false);

  // Fetch institutions on mount
  useEffect(() => {
    async function loadInstitutions() {
      try {
        const res = await fetch('/api/institutions');
        if (res.ok) {
          const data = await res.json();
          const list: InstitutionOption[] = data.institutions || [];
          setInstitutions(list);
          if (list.length > 0 && !selectedInstitutionId) {
            setSelectedInstitutionId(list[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load institutions:', err);
      }
    }
    loadInstitutions();
  }, [selectedInstitutionId]);

  // Fetch branches when selectedInstitutionId changes
  useEffect(() => {
    if (!selectedInstitutionId) {
      setBranches([]);
      setSelectedBranchId('');
      return;
    }
    async function loadBranches() {
      setIsFetchingOptions(true);
      try {
        const res = await fetch(`/api/branches?institutionId=${selectedInstitutionId}`);
        if (res.ok) {
          const data = await res.json();
          setBranches(data.branches || []);
          setSelectedBranchId('');
        }
      } catch (err) {
        console.error('Failed to fetch branches:', err);
      } finally {
        setIsFetchingOptions(false);
      }
    }
    loadBranches();
  }, [selectedInstitutionId]);

  // Fetch courses when selectedBranchId changes
  useEffect(() => {
    if (!selectedInstitutionId || !selectedBranchId) {
      setCourses([]);
      setSelectedCourseId('');
      return;
    }
    async function loadCourses() {
      try {
        const res = await fetch(`/api/courses?institutionId=${selectedInstitutionId}&branchId=${selectedBranchId}`);
        if (res.ok) {
          const data = await res.json();
          setCourses(data.courses || []);
          setSelectedCourseId('');
        }
      } catch (err) {
        console.error('Failed to fetch courses:', err);
      }
    }
    loadCourses();
  }, [selectedInstitutionId, selectedBranchId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredInstitutions = useMemo(() => {
    if (!collegeSearchFilter.trim()) return institutions;
    const term = collegeSearchFilter.toLowerCase();
    return institutions.filter(
      (inst) =>
        inst.name.toLowerCase().includes(term) ||
        inst.code.toLowerCase().includes(term)
    );
  }, [institutions, collegeSearchFilter]);

  const handleAddCustomCollege = async () => {
    if (!customCollegeName.trim() || !customCollegeCode.trim()) {
      setErrorMessage('Please provide both College Full Name and Short Code.');
      return;
    }
    setIsAddingCollege(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/institutions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: customCollegeName.trim(),
          code: customCollegeCode.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to register institution.');
      }
      setInstitutions((prev) => [data.institution, ...prev]);
      setSelectedInstitutionId(data.institution.id);
      setIsRegisteringCustomCollege(false);
      setCustomCollegeName('');
      setCustomCollegeCode('');
      showToast(`Registered "${data.institution.name}" successfully.`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error registering custom institution.');
    } finally {
      setIsAddingCollege(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const user = await login(loginEmail, loginPassword);
      showToast(`Welcome back, ${user.name}!`);
      if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/');
      }
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to authenticate');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (!selectedInstitutionId) {
        throw new Error('Please select your institution from the registered list.');
      }

      const payload = {
        name: signupName.trim(),
        email: signupEmail.trim(),
        password: signupPassword,
        role: signupRole,
        institutionId: selectedInstitutionId,
        branchId: signupRole === 'student' ? selectedBranchId || undefined : undefined,
        courseId: signupRole === 'student' ? selectedCourseId || undefined : undefined,
      };

      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Account creation failed');
      }

      showToast(`Account created successfully for ${data.user.institutionName}.`);
      if (data.user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/');
      }
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Account registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoAccount = (email: string) => {
    setMode('login');
    setLoginEmail(email);
    setLoginPassword('Password@123');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2D3822] flex flex-col justify-between font-sans selection:bg-[#8d9d4f]/30">
      {/* Top Header */}
      <header className="w-full py-4 px-6 border-b border-[#b19681]/40 bg-[#e4d7b0]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5c4b3e] hover:text-[#2D3822] transition-colors min-h-[44px] py-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Repository</span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#2D3822] text-[#fdfbf6] flex items-center justify-center font-serif font-bold text-base shadow-xs">
              NV
            </div>
            <span className="font-serif font-bold text-base sm:text-lg tracking-tight text-[#2D3822]">
              NoteVault Academic Portal
            </span>
          </div>

          <span className="font-mono text-[11px] text-[#5c4b3e] uppercase tracking-wider hidden sm:block">
            Institutional Access
          </span>
        </div>
      </header>

      {/* Main Container Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="relative w-full max-w-[560px] bg-white rounded-2xl shadow-md border border-[#b19681]/40 p-6 sm:p-8 flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col items-center text-center gap-2">
            <div className="w-12 h-12 rounded-full bg-[#FDFBF7] border border-[#8d9d4f]/40 flex items-center justify-center text-[#2D3822] shadow-xs">
              <BookOpen className="w-6 h-6 text-[#2D3822]" />
            </div>

            <div className="space-y-1">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2D3822] tracking-tight">
                {mode === 'login' ? 'Institutional Sign-In' : 'Student & Admin Registration'}
              </h1>
              <p className="text-xs text-[#5c4b3e] font-medium max-w-sm">
                Access verified syllabus materials, complete lecture notes, and reference links across colleges in India.
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="w-full grid grid-cols-2 p-1 bg-[#FDFBF7] rounded-xl border border-[#b19681]/40 mt-2">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage(null);
                }}
                className={`py-2 px-3 rounded-lg text-xs font-serif font-bold min-h-[44px] flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  mode === 'login'
                    ? 'bg-[#2D3822] text-white shadow-xs'
                    : 'text-[#5c4b3e] hover:text-[#2D3822]'
                }`}
              >
                <span>Existing Account</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMessage(null);
                }}
                className={`py-2 px-3 rounded-lg text-xs font-serif font-bold min-h-[44px] flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-[#2D3822] text-white shadow-xs'
                    : 'text-[#5c4b3e] hover:text-[#2D3822]'
                }`}
              >
                <span>Create Account</span>
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {/* Toast Message */}
          {toastMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}

          {mode === 'login' ? (
            <LoginForm
              loginEmail={loginEmail}
              setLoginEmail={setLoginEmail}
              loginPassword={loginPassword}
              setLoginPassword={setLoginPassword}
              isLoading={isLoading}
              onSubmit={handleLoginSubmit}
              onFillDemoAccount={fillDemoAccount}
            />
          ) : (
            <SignupForm
              signupName={signupName}
              setSignupName={setSignupName}
              signupEmail={signupEmail}
              setSignupEmail={setSignupEmail}
              signupPassword={signupPassword}
              setSignupPassword={setSignupPassword}
              signupRole={signupRole}
              setSignupRole={setSignupRole}
              selectedInstitutionId={selectedInstitutionId}
              setSelectedInstitutionId={setSelectedInstitutionId}
              selectedBranchId={selectedBranchId}
              setSelectedBranchId={setSelectedBranchId}
              selectedCourseId={selectedCourseId}
              setSelectedCourseId={setSelectedCourseId}
              institutions={institutions}
              filteredInstitutions={filteredInstitutions}
              branches={branches}
              courses={courses}
              collegeSearchFilter={collegeSearchFilter}
              setCollegeSearchFilter={setCollegeSearchFilter}
              isRegisteringCustomCollege={isRegisteringCustomCollege}
              setIsRegisteringCustomCollege={setIsRegisteringCustomCollege}
              customCollegeName={customCollegeName}
              setCustomCollegeName={setCustomCollegeName}
              customCollegeCode={customCollegeCode}
              setCustomCollegeCode={setCustomCollegeCode}
              isAddingCollege={isAddingCollege}
              onAddCustomCollege={handleAddCustomCollege}
              isLoading={isLoading}
              isFetchingOptions={isFetchingOptions}
              onSubmit={handleSignupSubmit}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-[#5c4b3e] font-medium border-t border-[#b19681]/30">
        NoteVault Academic Platform &bull; Strictly Scoped Institutional Study Materials
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#8d9d4f]" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
