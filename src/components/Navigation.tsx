'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  BookOpen, 
  KeyRound, 
  LogOut, 
  ShieldCheck, 
  Sparkles, 
  User, 
  Menu, 
  X,
  Building2,
  CheckCircle2,
  AlertCircle,
  UploadCloud
} from 'lucide-react';

interface NavigationProps {
  user?: {
    id: string;
    name: string;
    email: string;
    role: 'student' | 'admin';
    institutionName?: string | null;
    branchName?: string | null;
    courseName?: string | null;
  } | null;
  hasApiKey?: boolean;
  onOpenAiSettings?: () => void;
  onLogout?: () => void;
}

export function Navigation({
  user,
  hasApiKey = false,
  onOpenAiSettings,
  onLogout,
}: NavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogoutClick = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore
    }
    if (onLogout) {
      onLogout();
    } else {
      router.push('/login');
      router.refresh();
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#e4d7b0]/95 backdrop-blur-md border-b border-[#b19681]/40 shadow-xs">
      {/* Top Advisory Banner showing logged-in institution context */}
      <div className="bg-[#2D3822] text-white py-1.5 px-4 text-xs font-medium flex items-center justify-between">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
            <span className="font-sans font-semibold text-[#fdfbf6]">
              {user?.institutionName ? (
                <span>Institutional Study Repository &bull; <strong>{user.institutionName}</strong></span>
              ) : (
                <span>College Academic Resource Platform</span>
              )}
            </span>
          </div>

          {user && (
            <div className="hidden sm:flex items-center gap-3 text-[11px] font-mono text-white/80">
              {user.branchName && (
                <span className="bg-white/10 px-2 py-0.5 rounded text-[#fdfbf6]">
                  {user.branchName}
                </span>
              )}
              <span className="uppercase font-bold tracking-wider text-[#D4AF37]">
                {user.role}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Brand Logo & Relevant College Name */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-[#2D3822] text-[#fdfbf6] flex items-center justify-center font-serif font-bold text-xl shadow-xs transition-transform group-hover:scale-105">
            NV
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-xl tracking-tight text-[#2D3822]">
                NoteVault
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#8d9d4f]/20 text-[#2D3822] font-bold border border-[#8d9d4f]/40">
                Academic Portal
              </span>
            </div>
            <p className="text-[11px] text-[#5c4b3e]/70 hidden sm:block font-sans">
              {user?.institutionName || 'Verified Study Resources and Materials'}
            </p>
          </div>
        </Link>

        {/* Action Controls & Navigation */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* AI Bring-Your-Own-Key Indicator & Config Button */}
          {user && onOpenAiSettings && (
            <button
              onClick={onOpenAiSettings}
              type="button"
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 min-h-[38px] rounded-lg border transition-all active:scale-95 cursor-pointer shadow-xs ${
                hasApiKey
                  ? 'bg-white hover:bg-[#8d9d4f]/20 border-[#8d9d4f]/60 text-[#2D3822]'
                  : 'bg-[#D4AF37]/20 hover:bg-[#D4AF37]/30 border-[#D4AF37]/60 text-[#5c4b3e]'
              }`}
              title="Configure Bring-Your-Own-Key (Gemini, OpenAI, Anthropic)"
              aria-label="AI Key Settings"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#8d9d4f]" />
              <span className="font-serif text-xs font-bold hidden sm:inline">
                {hasApiKey ? 'AI Ready' : 'Connect AI Key'}
              </span>
              <span
                className={`w-2 h-2 rounded-full ${
                  hasApiKey ? 'bg-emerald-600' : 'bg-amber-600 animate-ping'
                }`}
              />
            </button>
          )}

          {/* Upload / Admin Desk Link for Authenticated Users */}
          {user && (
            <Link
              href="/admin"
              className={`flex items-center gap-1.5 px-3 min-h-[38px] rounded-lg text-xs font-bold transition-all shadow-xs ${
                pathname.startsWith('/admin')
                  ? 'bg-[#2D3822] text-white shadow-xs'
                  : 'bg-white/80 hover:bg-white text-[#2D3822] border border-[#b19681]/40'
              }`}
            >
              {user.role === 'admin' ? (
                <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
              ) : (
                <UploadCloud className="w-4 h-4 text-[#D4AF37]" />
              )}
              <span className="hidden sm:inline">{user.role === 'admin' ? 'Admin Desk' : 'Upload Notes'}</span>
              <span className="sm:hidden">Upload</span>
            </Link>
          )}

          {/* User Sign In / Profile Status */}
          {!user ? (
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-4 min-h-[38px] rounded-lg bg-[#2D3822] hover:bg-[#3D4D2F] text-white font-bold text-xs shadow-xs transition-all active:scale-95"
            >
              <User className="w-4 h-4" />
              <span>Sign In</span>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex flex-col text-right">
                <span className="font-serif text-xs font-bold text-[#2D3822] leading-tight">
                  {user.name}
                </span>
                <span className="text-[10px] text-[#5c4b3e]/70 font-mono">
                  {user.email}
                </span>
              </div>
              <button
                onClick={handleLogoutClick}
                type="button"
                className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-lg bg-white/70 hover:bg-red-50 text-[#5c4b3e] hover:text-red-700 transition-colors border border-[#b19681]/30 cursor-pointer"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            type="button"
            className="md:hidden min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg border border-[#b19681]/40 text-[#2D3822] hover:bg-white"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pb-4 pt-2 border-t border-[#b19681]/30 bg-[#e4d7b0] flex flex-col gap-2 animate-ink">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="px-3 py-2.5 rounded-lg font-bold text-sm text-[#2D3822] hover:bg-white/60 min-h-[44px] flex items-center"
          >
            Study Resources
          </Link>
          {user?.role === 'admin' && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-lg font-bold text-sm text-[#2D3822] hover:bg-white/60 min-h-[44px] flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
              <span>Admin Desk</span>
            </Link>
          )}
          {onOpenAiSettings && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAiSettings();
              }}
              className="px-3 py-2.5 rounded-lg font-bold text-sm text-[#2D3822] hover:bg-white/60 min-h-[44px] flex items-center gap-2 text-left"
            >
              <Sparkles className="w-4 h-4 text-[#8d9d4f]" />
              <span>AI Bring-Your-Own-Key Settings</span>
            </button>
          )}
          {user && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogoutClick();
              }}
              className="px-3 py-2.5 rounded-lg font-bold text-sm text-red-800 hover:bg-red-50 min-h-[44px] flex items-center gap-2 text-left"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out ({user.name})</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
}
