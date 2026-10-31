'use client';

import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  KeyRound, 
  Sparkles, 
  ShieldCheck, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ExternalLink,
  Eye,
  EyeOff
} from 'lucide-react';

interface AiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: {
    configured: boolean;
    provider: 'gemini' | 'openai' | 'anthropic' | null;
    keyHint: string | null;
  };
  onConfigUpdated: (newConfig: any) => void;
}

export function AiSettingsModal({
  isOpen,
  onClose,
  config,
  onConfigUpdated,
}: AiSettingsModalProps) {
  const [provider, setProvider] = useState<'gemini' | 'openai' | 'anthropic'>(
    config.provider || 'gemini'
  );
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const providerLinks = {
    gemini: {
      name: 'Google Gemini (2.5 / 2.0 Flash)',
      url: 'https://aistudio.google.com/app/apikey',
      desc: 'Free tier available via Google AI Studio — Supports Gemini 2.5 Flash & 2.0 Flash',
    },
    openai: {
      name: 'OpenAI (GPT-4o Mini)',
      url: 'https://platform.openai.com/api-keys',
      desc: 'Requires an OpenAI platform account with active billing/quota',
    },
    anthropic: {
      name: 'Anthropic (Claude 3 Haiku)',
      url: 'https://console.anthropic.com/settings/keys',
      desc: 'Requires an Anthropic console account with active credits',
    },
  };

  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      setErrorMsg('Please enter an API key.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/ai/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, apiKey: apiKey.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to validate API key.');
      }

      setSuccessMsg(`Successfully connected to ${provider.toUpperCase()}.`);
      setApiKey('');
      onConfigUpdated(data.config);
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error testing and saving API key.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteKey = async () => {
    if (!confirm('Are you sure you want to remove your stored API key?')) return;

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/ai/config', { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to remove API key.');
      }

      setSuccessMsg('API key deleted.');
      onConfigUpdated({ configured: false, provider: null, keyHint: null });
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 800);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error deleting API key.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent onEscapeKeyDown={onClose} className="max-w-lg bg-[#e7dbbf] text-[#5c4b3e] border border-[#b19681] p-6 rounded-2xl shadow-xl">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#2D3822] text-[#fdfbf6] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <DialogTitle className="font-serif font-bold text-xl text-[#2D3822]">
              AI Integration (Bring-Your-Own-Key)
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-[#5c4b3e]/80">
            Provide your personal API key to power AI-assisted search, resource summaries, and study recommendations. Keys are encrypted at rest on the server with AES-256-GCM.
          </DialogDescription>
        </DialogHeader>

        {/* Existing Stored Key Badge */}
        {config.configured && (
          <div className="p-3.5 bg-white/70 rounded-xl border border-[#b19681]/40 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <div>
                <span className="font-bold text-[#2D3822] uppercase font-mono text-[11px] flex items-center gap-1.5 flex-wrap">
                  {config.provider} Key Active
                  {config.provider === 'gemini' && (
                    <span className="text-[10px] bg-[#8d9d4f]/25 text-[#2D3822] px-1.5 py-0.5 rounded font-sans font-semibold normal-case">
                      Gemini 2.5 Flash / 2.0 Flash
                    </span>
                  )}
                </span>
                <span className="font-mono text-xs text-[#5c4b3e]/70 block">
                  {config.keyHint}
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteKey}
              disabled={isLoading}
              className="text-red-700 hover:bg-red-50 hover:text-red-800 border-red-300 text-xs h-8 px-2.5 font-bold"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Delete Key
            </Button>
          </div>
        )}

        {/* Form to enter / update key */}
        <form onSubmit={handleSaveKey} className="space-y-4 pt-2">
          {/* Provider Selection */}
          <div className="space-y-1.5">
            <Label className="text-xs font-serif font-bold text-[#2D3822]">
              Select AI Provider
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'gemini', name: 'Gemini (2.5 / 2.0 Flash)' },
                { id: 'openai', name: 'OpenAI' },
                { id: 'anthropic', name: 'Anthropic' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setProvider(p.id as any)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-serif font-bold border transition-all text-center min-h-[44px] ${
                    provider === p.id
                      ? 'bg-[#2D3822] text-white border-[#2D3822] shadow-xs'
                      : 'bg-white/60 hover:bg-white text-[#5c4b3e] border-[#b19681]/40'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>

            <div className="text-[11px] text-[#5c4b3e]/80 pt-1 flex items-center justify-between">
              <span>{providerLinks[provider].desc}</span>
              <a
                href={providerLinks[provider].url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#2D3822] font-bold underline flex items-center gap-1 hover:text-[#8d9d4f]"
              >
                Get Key <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* API Key Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-serif font-bold text-[#2D3822]">
                {providerLinks[provider].name} API Key
              </Label>
              {provider === 'gemini' && (
                <span className="text-[10px] bg-[#8d9d4f]/20 text-[#2D3822] font-semibold px-2 py-0.5 rounded-full border border-[#8d9d4f]/40 font-mono">
                  gemini-2.5-flash / gemini-2.0-flash
                </span>
              )}
            </div>
            <div className="relative flex items-center">
              <Input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={`Paste your ${provider === 'gemini' ? 'Gemini (AI Studio)' : provider.toUpperCase()} API key here...`}
                className="pr-10 bg-white border-[#b19681]/50 text-xs font-mono h-10"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                aria-label={showKey ? 'Hide API key' : 'Show API key'}
                className="absolute right-3 text-[#5c4b3e]/60 hover:text-[#2D3822] cursor-pointer p-1"
                tabIndex={-1}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-[#5c4b3e]/60 font-mono">
              Encrypted server-side using AES-256-GCM. Tested with Gemini 2.5 Flash &amp; 2.0 Flash models.
            </p>
          </div>

          {/* Status Notifications */}
          {errorMsg && (
            <div className="p-3 bg-red-100/80 border border-red-300 rounded-xl text-xs text-red-900 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-100/80 border border-emerald-300 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <DialogFooter className="pt-2 flex flex-row justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="border-[#b19681]/60 text-xs font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !apiKey.trim()}
              className="bg-[#2D3822] hover:bg-[#3D4D2F] text-white text-xs font-bold px-5"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                  Validating Key...
                </>
              ) : (
                'Save and Test Key'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
