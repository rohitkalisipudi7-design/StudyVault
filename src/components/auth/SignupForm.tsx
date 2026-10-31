'use client';

import { useState } from 'react';
import { 
  User, 
  Mail, 
  Lock, 
  School, 
  ShieldCheck, 
  Globe, 
  Plus, 
  Search, 
  Loader2, 
  Eye, 
  EyeOff, 
  Building2, 
  GitBranch, 
  BookOpen 
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

interface SignupFormProps {
  signupName: string;
  setSignupName: (val: string) => void;
  signupEmail: string;
  setSignupEmail: (val: string) => void;
  signupPassword: string;
  setSignupPassword: (val: string) => void;
  signupRole: 'student' | 'admin';
  setSignupRole: (role: 'student' | 'admin') => void;
  selectedInstitutionId: string;
  setSelectedInstitutionId: (id: string) => void;
  selectedBranchId: string;
  setSelectedBranchId: (id: string) => void;
  selectedCourseId: string;
  setSelectedCourseId: (id: string) => void;
  institutions: InstitutionOption[];
  filteredInstitutions: InstitutionOption[];
  branches: BranchOption[];
  courses: CourseOption[];
  collegeSearchFilter: string;
  setCollegeSearchFilter: (val: string) => void;
  isRegisteringCustomCollege: boolean;
  setIsRegisteringCustomCollege: (val: boolean) => void;
  customCollegeName: string;
  setCustomCollegeName: (val: string) => void;
  customCollegeCode: string;
  setCustomCollegeCode: (val: string) => void;
  isAddingCollege: boolean;
  onAddCustomCollege: () => void;
  isLoading: boolean;
  isFetchingOptions: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function SignupForm({
  signupName,
  setSignupName,
  signupEmail,
  setSignupEmail,
  signupPassword,
  setSignupPassword,
  signupRole,
  setSignupRole,
  selectedInstitutionId,
  setSelectedInstitutionId,
  selectedBranchId,
  setSelectedBranchId,
  selectedCourseId,
  setSelectedCourseId,
  institutions,
  filteredInstitutions,
  branches,
  courses,
  collegeSearchFilter,
  setCollegeSearchFilter,
  isRegisteringCustomCollege,
  setIsRegisteringCustomCollege,
  customCollegeName,
  setCustomCollegeName,
  customCollegeCode,
  setCustomCollegeCode,
  isAddingCollege,
  onAddCustomCollege,
  isLoading,
  isFetchingOptions,
  onSubmit,
}: SignupFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form onSubmit={onSubmit} className="space-y-4">
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
                  placeholder="e.g. SRM Institute of Science & Technology"
                  className="w-full bg-white text-xs px-2.5 py-2 rounded-lg border border-[#b19681]/50 text-[#2D3822] min-h-[38px]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-[#5c4b3e]">Short Code</label>
                <input
                  type="text"
                  value={customCollegeCode}
                  onChange={(e) => setCustomCollegeCode(e.target.value.toUpperCase())}
                  placeholder="e.g. SRM"
                  className="w-full bg-white text-xs px-2.5 py-2 rounded-lg border border-[#b19681]/50 text-[#2D3822] uppercase min-h-[38px]"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsRegisteringCustomCollege(false)}
                className="px-3 py-1.5 rounded-lg border border-[#b19681]/40 text-xs font-semibold text-[#5c4b3e] hover:bg-white cursor-pointer min-h-[36px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onAddCustomCollege}
                disabled={isAddingCollege || !customCollegeName.trim() || !customCollegeCode.trim()}
                className="px-3.5 py-1.5 rounded-lg bg-[#2D3822] text-white font-serif font-bold text-xs hover:bg-[#3D4D2F] cursor-pointer disabled:opacity-50 min-h-[36px]"
              >
                {isAddingCollege ? 'Registering...' : 'Add College'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#5c4b3e]/60 pointer-events-none" />
              <input
                type="text"
                value={collegeSearchFilter}
                onChange={(e) => setCollegeSearchFilter(e.target.value)}
                placeholder="Filter college by name (e.g. Andhra, IIT, Gayatri, Anna, BITS)..."
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#FDFBF7] text-xs border border-[#b19681]/40 text-[#2D3822] placeholder:text-[#5c4b3e]/50 min-h-[38px]"
              />
            </div>

            <div className="relative">
              <Building2 className="absolute left-3 top-3 w-4 h-4 text-[#5c4b3e] pointer-events-none" />
              <select
                id="signup-institution"
                value={selectedInstitutionId}
                onChange={(e) => setSelectedInstitutionId(e.target.value)}
                required
                className="w-full bg-[#FDFBF7] text-[#2D3822] text-xs pl-9 pr-3 py-2.5 rounded-xl border border-[#b19681]/40 focus:outline-none focus:border-[#8d9d4f] focus:bg-white transition-all min-h-[44px]"
              >
                {filteredInstitutions.length === 0 ? (
                  <option value="">No institutions match filter</option>
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

      {/* Optional Branch and Course Selection for Student */}
      {signupRole === 'student' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-[#b19681]/30">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#2D3822] flex items-center gap-1" htmlFor="signup-branch">
              <GitBranch className="w-3.5 h-3.5 text-[#8d9d4f]" />
              <span>Branch</span>
            </label>
            <select
              id="signup-branch"
              value={selectedBranchId}
              onChange={(e) => {
                setSelectedBranchId(e.target.value);
                setSelectedCourseId('');
              }}
              disabled={isFetchingOptions}
              className="w-full bg-[#FDFBF7] text-[#2D3822] text-xs px-3 py-2.5 rounded-xl border border-[#b19681]/40 focus:outline-none focus:border-[#8d9d4f] min-h-[44px]"
            >
              <option value="">Select Branch (Optional)</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#2D3822] flex items-center gap-1" htmlFor="signup-course">
              <BookOpen className="w-3.5 h-3.5 text-[#8d9d4f]" />
              <span>Course</span>
            </label>
            <select
              id="signup-course"
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              disabled={isFetchingOptions || courses.length === 0}
              className="w-full bg-[#FDFBF7] text-[#2D3822] text-xs px-3 py-2.5 rounded-xl border border-[#b19681]/40 focus:outline-none focus:border-[#8d9d4f] min-h-[44px]"
            >
              <option value="">Select Course (Optional)</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 px-4 rounded-xl bg-[#2D3822] hover:bg-[#3D4D2F] text-white font-serif font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 active:scale-98 min-h-[44px] cursor-pointer disabled:opacity-50 mt-4"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <span>Complete Registration</span>
        )}
      </button>
    </form>
  );
}
