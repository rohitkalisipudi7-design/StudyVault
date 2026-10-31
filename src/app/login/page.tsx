'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  School, 
  ShieldCheck, 
  Lock, 
  Mail, 
  User,
  Eye, 
  EyeOff, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Building2,
  GitBranch,
  BookOpen,
  Search,
  Plus,
  Globe
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

  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
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
  }, []);

  // Filtered institutions based on user search query
  const filteredInstitutions = useMemo(() => {
    if (!collegeSearchFilter.trim()) return institutions;
    const q = collegeSearchFilter.toLowerCase().trim();
    return institutions.filter(
      (inst) =>
        inst.name.toLowerCase().includes(q) ||
        inst.code.toLowerCase().includes(q)
    );
  }, [institutions, collegeSearchFilter]);

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
        const res = await fetch(`/api/branches?institutionId=${encodeURIComponent(selectedInstitutionId)}`);
        if (res.ok) {
          const data = await res.json();
          const branchList = data.branches || [];
          setBranches(branchList);
          if (branchList.length > 0) {
            setSelectedBranchId(branchList[0].id);
          } else {
            setSelectedBranchId('');
          }
        }
      } catch (err) {
        console.error('Failed to load branches:', err);
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
        const res = await fetch(
          `/api/courses?institutionId=${encodeURIComponent(selectedInstitutionId)}&branchId=${encodeURIComponent(selectedBranchId)}`
        );
        if (res.ok) {
          const data = await res.json();
          const courseList = data.courses || [];
          setCourses(courseList);
          if (courseList.length > 0) {
            setSelectedCourseId(courseList[0].id);
          } else {
            setSelectedCourseId('');
          }
        }
      } catch (err) {
        console.error('Failed to load courses:', err);
      }
    }
    loadCourses();
  }, [selectedInstitutionId, selectedBranchId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleRegisterCustomCollege = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCollegeName.trim() || !customCollegeCode.trim()) {
      setErrorMessage('Please provide both College Full Name and Abbreviation/Code.');
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
          code: customCollegeCode.trim().toUpperCase(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to register college.');
      }

      const createdInst: InstitutionOption = data.institution;
      setInstitutions((prev) => [createdInst, ...prev.filter((i) => i.id !== createdInst.id)]);
      setSelectedInstitutionId(createdInst.id);
      setIsRegisteringCustomCollege(false);
      setCustomCollegeName('');
      setCustomCollegeCode('');
      showToast(`Registered and selected "${createdInst.name}".`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error adding college');
    } finally {
      setIsAddingCollege(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed. Please verify credentials.');
      }

      showToast(`Welcome back, ${data.user.name}.`);
      if (data.user.role === 'admin') {
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
          
          {/* Folio Crest & Header */}
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

          {/* TAB 1: LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#2D3822]" htmlFor="login-email">
                  Institutional Email Address
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3 text-[#5c4b3e] w-4 h-4 pointer-events-none" />
                  <input
                    id="login-email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="student@andhrauniversity.edu.in"
                    required
                    className="w-full bg-[#FDFBF7] text-[#2D3822] text-xs pl-9 pr-3 py-3 rounded-xl border border-[#b19681]/40 focus:outline-none focus:border-[#8d9d4f] focus:bg-white transition-all min-h-[44px]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#2D3822]" htmlFor="login-password">
                  Password
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3 text-[#5c4b3e] w-4 h-4 pointer-events-none" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full bg-[#FDFBF7] text-[#2D3822] text-xs pl-9 pr-10 py-3 rounded-xl border border-[#b19681]/40 focus:outline-none focus:border-[#8d9d4f] focus:bg-white transition-all font-mono min-h-[44px]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 p-2 text-[#5c4b3e] hover:text-[#2D3822] cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-[#2D3822] hover:bg-[#3D4D2F] text-white font-serif font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 active:scale-98 min-h-[44px] cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Sign In to Repository</span>
                )}
              </button>

              {/* Demo Accounts Quick-Select for Reviewer Evaluation */}
              <div className="pt-3 border-t border-[#b19681]/30">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-mono uppercase tracking-wider text-[#5c4b3e] font-semibold">
                    Pre-configured Accounts (Click to Fill):
                  </p>
                  <span className="text-[10px] text-[#8d9d4f] font-mono">Password@123</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {/* AU */}
                  <button
                    type="button"
                    onClick={() => fillDemoAccount('student@andhrauniversity.edu.in')}
                    className="p-2.5 rounded-lg border border-[#b19681]/40 bg-[#FDFBF7] hover:bg-[#e4d7b0]/40 text-left transition-colors cursor-pointer min-h-[44px]"
                  >
                    <div className="font-bold text-[#2D3822] text-[11px]">AU Student</div>
                    <div className="text-[10px] text-[#5c4b3e] truncate">Andhra University</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemoAccount('admin@andhrauniversity.edu.in')}
                    className="p-2.5 rounded-lg border border-[#b19681]/40 bg-[#FDFBF7] hover:bg-[#e4d7b0]/40 text-left transition-colors cursor-pointer min-h-[44px]"
                  >
                    <div className="font-bold text-[#2D3822] text-[11px] flex items-center gap-1">
                      AU Admin <ShieldCheck className="w-3 h-3 text-[#D4AF37]" />
                    </div>
                    <div className="text-[10px] text-[#5c4b3e] truncate">Andhra University</div>
                  </button>

                  {/* GVPCE */}
                  <button
                    type="button"
                    onClick={() => fillDemoAccount('student@gvpce.ac.in')}
                    className="p-2.5 rounded-lg border border-[#b19681]/40 bg-[#FDFBF7] hover:bg-[#e4d7b0]/40 text-left transition-colors cursor-pointer min-h-[44px]"
                  >
                    <div className="font-bold text-[#2D3822] text-[11px]">GVP Student</div>
                    <div className="text-[10px] text-[#5c4b3e] truncate">Gayatri Vidya Parishad</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemoAccount('admin@gvpce.ac.in')}
                    className="p-2.5 rounded-lg border border-[#b19681]/40 bg-[#FDFBF7] hover:bg-[#e4d7b0]/40 text-left transition-colors cursor-pointer min-h-[44px]"
                  >
                    <div className="font-bold text-[#2D3822] text-[11px] flex items-center gap-1">
                      GVP Admin <ShieldCheck className="w-3 h-3 text-[#D4AF37]" />
                    </div>
                    <div className="text-[10px] text-[#5c4b3e] truncate">Gayatri Vidya Parishad</div>
                  </button>

                  {/* GITAM */}
                  <button
                    type="button"
                    onClick={() => fillDemoAccount('student@gitam.edu')}
                    className="p-2.5 rounded-lg border border-[#b19681]/40 bg-[#FDFBF7] hover:bg-[#e4d7b0]/40 text-left transition-colors cursor-pointer min-h-[44px]"
                  >
                    <div className="font-bold text-[#2D3822] text-[11px]">GITAM Student</div>
                    <div className="text-[10px] text-[#5c4b3e] truncate">GITAM University</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemoAccount('admin@gitam.edu')}
                    className="p-2.5 rounded-lg border border-[#b19681]/40 bg-[#FDFBF7] hover:bg-[#e4d7b0]/40 text-left transition-colors cursor-pointer min-h-[44px]"
                  >
                    <div className="font-bold text-[#2D3822] text-[11px] flex items-center gap-1">
                      GITAM Admin <ShieldCheck className="w-3 h-3 text-[#D4AF37]" />
                    </div>
                    <div className="text-[10px] text-[#5c4b3e] truncate">GITAM University</div>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: SIGNUP FORM */}
          {mode === 'signup' && (
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#2D3822]" htmlFor="signup-name">
                  Full Name
                </label>
                <div className="relative flex items-center">
                  <User className="absolute left-3 text-[#5c4b3e] w-4 h-4 pointer-events-none" />
                  <input
                    id="signup-name"
                    type="text"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="Aditya Sharma"
                    required
                    className="w-full bg-[#FDFBF7] text-[#2D3822] text-xs pl-9 pr-3 py-3 rounded-xl border border-[#b19681]/40 focus:outline-none focus:border-[#8d9d4f] focus:bg-white transition-all min-h-[44px]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#2D3822]" htmlFor="signup-email">
                  Institutional Email
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3 text-[#5c4b3e] w-4 h-4 pointer-events-none" />
                  <input
                    id="signup-email"
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="aditya@andhrauniversity.edu.in"
                    required
                    className="w-full bg-[#FDFBF7] text-[#2D3822] text-xs pl-9 pr-3 py-3 rounded-xl border border-[#b19681]/40 focus:outline-none focus:border-[#8d9d4f] focus:bg-white transition-all min-h-[44px]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#2D3822]" htmlFor="signup-password">
                  Password (min 6 characters)
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3 text-[#5c4b3e] w-4 h-4 pointer-events-none" />
                  <input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    minLength={6}
                    className="w-full bg-[#FDFBF7] text-[#2D3822] text-xs pl-9 pr-10 py-3 rounded-xl border border-[#b19681]/40 focus:outline-none focus:border-[#8d9d4f] focus:bg-white transition-all font-mono min-h-[44px]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 p-2 text-[#5c4b3e] hover:text-[#2D3822] cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Role Selector */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#2D3822]">Account Role</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSignupRole('student')}
                    className={`py-2 px-3 rounded-xl text-xs font-serif font-bold min-h-[44px] flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                      signupRole === 'student'
                        ? 'bg-[#2D3822] text-white border-[#2D3822] shadow-xs'
                        : 'bg-[#FDFBF7] text-[#5c4b3e] border-[#b19681]/40 hover:bg-[#e4d7b0]/30'
                    }`}
                  >
                    <School className="w-4 h-4" />
                    <span>Student</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSignupRole('admin')}
                    className={`py-2 px-3 rounded-xl text-xs font-serif font-bold min-h-[44px] flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                      signupRole === 'admin'
                        ? 'bg-[#2D3822] text-white border-[#2D3822] shadow-xs'
                        : 'bg-[#FDFBF7] text-[#5c4b3e] border-[#b19681]/40 hover:bg-[#e4d7b0]/30'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>College Admin</span>
                  </button>
                </div>
              </div>

              {/* Institution Selection with Search Across India */}
              <div className="space-y-2 pt-1 border-t border-[#b19681]/30">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#2D3822] flex items-center gap-1.5" htmlFor="signup-institution">
                    <Globe className="w-3.5 h-3.5 text-[#8d9d4f]" />
                    <span>Your College Across India</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsRegisteringCustomCollege(!isRegisteringCustomCollege)}
                    className="text-[11px] font-serif font-bold text-[#8d9d4f] hover:text-[#2D3822] underline cursor-pointer inline-flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{isRegisteringCustomCollege ? 'Back to College List' : '+ Register Another College'}</span>
                  </button>
                </div>

                {/* Inline Register Another College Form */}
                {isRegisteringCustomCollege ? (
                  <div className="p-3 rounded-xl bg-[#FDFBF7] border border-[#8d9d4f]/60 space-y-2.5 animate-ink">
                    <div className="text-[11px] font-bold text-[#2D3822]">
                      Register a New College / Institution (Pan-India):
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-[10px] font-mono text-[#5c4b3e]">College Full Name</label>
                        <input
                          type="text"
                          value={customCollegeName}
                          onChange={(e) => setCustomCollegeName(e.target.value)}
                          placeholder="e.g. National Institute of Technology Goa"
                          className="w-full bg-white text-xs px-3 py-2 rounded-lg border border-[#b19681]/40 focus:border-[#8d9d4f] focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-[#5c4b3e]">Code / Abbr.</label>
                        <input
                          type="text"
                          value={customCollegeCode}
                          onChange={(e) => setCustomCollegeCode(e.target.value)}
                          placeholder="e.g. NIT-GOA"
                          className="w-full bg-white text-xs px-3 py-2 rounded-lg border border-[#b19681]/40 focus:border-[#8d9d4f] focus:outline-none uppercase font-mono"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRegisterCustomCollege}
                      disabled={isAddingCollege}
                      className="px-3 py-1.5 rounded-lg bg-[#2D3822] text-white text-xs font-bold hover:bg-[#3D4D2F] transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isAddingCollege ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                      <span>Add &amp; Select College</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {/* Live Search Filter Box */}
                    <div className="relative flex items-center">
                      <Search className="absolute left-3 text-[#5c4b3e] w-3.5 h-3.5 pointer-events-none" />
                      <input
                        type="text"
                        value={collegeSearchFilter}
                        onChange={(e) => setCollegeSearchFilter(e.target.value)}
                        placeholder="Search 35+ universities across India (IIT, NIT, AU, GVP, GITAM, BITS, Anna, Pune)..."
                        className="w-full bg-[#FDFBF7] text-[#2D3822] text-[11px] pl-8 pr-3 py-2 rounded-lg border border-[#b19681]/40 focus:outline-none focus:border-[#8d9d4f] focus:bg-white transition-all"
                      />
                    </div>

                    {/* Primary Select Dropdown */}
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 text-[#5c4b3e] w-4 h-4 pointer-events-none" />
                      <select
                        id="signup-institution"
                        value={selectedInstitutionId}
                        onChange={(e) => setSelectedInstitutionId(e.target.value)}
                        required
                        className="w-full bg-[#FDFBF7] text-[#2D3822] text-xs pl-9 pr-3 py-3 rounded-xl border border-[#b19681]/40 focus:outline-none focus:border-[#8d9d4f] focus:bg-white transition-all appearance-none min-h-[44px] cursor-pointer font-sans"
                      >
                        {filteredInstitutions.length === 0 ? (
                          <option value="" disabled>No colleges match filter</option>
                        ) : (
                          filteredInstitutions.map((inst) => (
                            <option key={inst.id} value={inst.id}>
                              {inst.name} ({inst.code})
                            </option>
                          ))
                        )}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Student Branch & Course Selection */}
              {signupRole === 'student' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#2D3822]" htmlFor="signup-branch">
                      Branch / Department
                    </label>
                    <div className="relative">
                      <GitBranch className="absolute left-3 top-3 text-[#5c4b3e] w-4 h-4 pointer-events-none" />
                      <select
                        id="signup-branch"
                        value={selectedBranchId}
                        onChange={(e) => setSelectedBranchId(e.target.value)}
                        required
                        disabled={isFetchingOptions || branches.length === 0}
                        className="w-full bg-[#FDFBF7] text-[#2D3822] text-xs pl-9 pr-3 py-3 rounded-xl border border-[#b19681]/40 focus:outline-none focus:border-[#8d9d4f] focus:bg-white transition-all appearance-none min-h-[44px] cursor-pointer disabled:opacity-50"
                      >
                        {branches.length === 0 ? (
                          <option value="">No branches registered</option>
                        ) : (
                          branches.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.name} ({b.code})
                            </option>
                          ))
                        )}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#2D3822]" htmlFor="signup-course">
                      Primary Course
                    </label>
                    <div className="relative">
                      <BookOpen className="absolute left-3 top-3 text-[#5c4b3e] w-4 h-4 pointer-events-none" />
                      <select
                        id="signup-course"
                        value={selectedCourseId}
                        onChange={(e) => setSelectedCourseId(e.target.value)}
                        required
                        disabled={courses.length === 0}
                        className="w-full bg-[#FDFBF7] text-[#2D3822] text-xs pl-9 pr-3 py-3 rounded-xl border border-[#b19681]/40 focus:outline-none focus:border-[#8d9d4f] focus:bg-white transition-all appearance-none min-h-[44px] cursor-pointer disabled:opacity-50"
                      >
                        {courses.length === 0 ? (
                          <option value="">No courses registered</option>
                        ) : (
                          courses.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name} ({c.code})
                            </option>
                          ))
                        )}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-[#2D3822] hover:bg-[#3D4D2F] text-white font-serif font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 active:scale-98 min-h-[44px] cursor-pointer disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Register &amp; Enter Archive</span>
                )}
              </button>
            </form>
          )}

        </div>
      </main>

      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-ink">
          <div className="px-4 py-3 rounded-xl bg-[#2D3822] text-white text-xs font-semibold shadow-lg border border-[#8d9d4f]/40 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#8d9d4f]" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-[#5c4b3e] border-t border-[#b19681]/40 bg-[#e4d7b0]/50">
        <p>Institutional Study Platform &bull; Multi-Tenant Academic Repository Across India</p>
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#2D3822]" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
