'use client';

import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';

interface LoginFormProps {
  loginEmail: string;
  setLoginEmail: (val: string) => void;
  loginPassword: string;
  setLoginPassword: (val: string) => void;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onFillDemoAccount: (email: string) => void;
}

export function LoginForm({
  loginEmail,
  setLoginEmail,
  loginPassword,
  setLoginPassword,
  isLoading,
  onSubmit,
  onFillDemoAccount,
}: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form onSubmit={onSubmit} className="space-y-4">
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
            placeholder="Enter your account password"
            required
            className="w-full bg-[#FDFBF7] text-[#2D3822] text-xs pl-9 pr-10 py-3 rounded-xl border border-[#b19681]/40 focus:outline-none focus:border-[#8d9d4f] focus:bg-white transition-all min-h-[44px]"
          />
          <button
            type="button"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 text-[#5c4b3e] hover:text-[#2D3822] p-1 cursor-pointer"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 px-4 rounded-xl bg-[#2D3822] hover:bg-[#3D4D2F] text-white font-serif font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer min-h-[44px]"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Verifying Credentials...</span>
          </>
        ) : (
          <>
            <span>Sign In to Repository</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      {/* Quick Demo Pre-seed Access */}
      <div className="pt-3 border-t border-[#b19681]/30">
        <span className="text-[10px] font-mono uppercase tracking-wider text-[#5c4b3e] font-bold block mb-2 text-center">
          Quick Demo Accounts (Password: Password@123)
        </span>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => onFillDemoAccount('student@andhrauniversity.edu.in')}
            className="p-2 rounded-lg bg-[#FDFBF7] hover:bg-[#8d9d4f]/20 border border-[#b19681]/30 text-left cursor-pointer transition-all"
          >
            <span className="font-bold text-[#2D3822] block text-[11px]">AU Student</span>
            <span className="text-[10px] text-[#5c4b3e]/70 truncate block">CSE Dept</span>
          </button>
          <button
            type="button"
            onClick={() => onFillDemoAccount('admin@andhrauniversity.edu.in')}
            className="p-2 rounded-lg bg-[#FDFBF7] hover:bg-[#8d9d4f]/20 border border-[#b19681]/30 text-left cursor-pointer transition-all"
          >
            <span className="font-bold text-[#2D3822] block text-[11px]">AU Admin</span>
            <span className="text-[10px] text-[#5c4b3e]/70 truncate block">Department Admin</span>
          </button>
          <button
            type="button"
            onClick={() => onFillDemoAccount('student@gvpce.ac.in')}
            className="p-2 rounded-lg bg-[#FDFBF7] hover:bg-[#8d9d4f]/20 border border-[#b19681]/30 text-left cursor-pointer transition-all"
          >
            <span className="font-bold text-[#2D3822] block text-[11px]">GVPCE Student</span>
            <span className="text-[10px] text-[#5c4b3e]/70 truncate block">CSE Dept</span>
          </button>
          <button
            type="button"
            onClick={() => onFillDemoAccount('student@gitam.edu')}
            className="p-2 rounded-lg bg-[#FDFBF7] hover:bg-[#8d9d4f]/20 border border-[#b19681]/30 text-left cursor-pointer transition-all"
          >
            <span className="font-bold text-[#2D3822] block text-[11px]">GITAM Student</span>
            <span className="text-[10px] text-[#5c4b3e]/70 truncate block">CSE Dept</span>
          </button>
        </div>
      </div>
    </form>
  );
}
