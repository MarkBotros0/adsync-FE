'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { invitationAPI } from '@/lib/api';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';
import { EchofoldLogo } from '@/components/brand/echofold-logo';
import Link from 'next/link';
import { AxiosError } from 'axios';
import type { InviteVerifyResponse, UserSession } from '@/lib/types';

const STORAGE_KEY = 'brand_session';

function getApiError(err: unknown, fallback: string): string {
  return (err as AxiosError<{ detail?: string }>)?.response?.data?.detail ?? fallback;
}

// ─── Inner component (needs useSearchParams) ──────────────────────────────────

function InvitePageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get('token') ?? '';

  const [verifying, setVerifying] = useState(true);
  const [invite, setInvite] = useState<InviteVerifyResponse | null>(null);
  const [invalid, setInvalid] = useState(false);

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  // Verify the token on load
  useEffect(() => {
    if (!token) { setInvalid(true); setVerifying(false); return; }
    invitationAPI.verify(token)
      .then(res => {
        if (res.data.valid) {
          setInvite(res.data);
        } else {
          setInvalid(true);
        }
      })
      .catch(() => setInvalid(true))
      .finally(() => setVerifying(false));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Please enter your name'); return; }
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    if (password !== confirm) { toast.error('Passwords do not match'); return; }
    setSubmitting(true);
    try {
      const res = await invitationAPI.accept({ token, name: name.trim(), password });
      const session = res.data as unknown as UserSession;
      // Persist session (same key as use-brand-auth.ts)
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: session.access_token, user: session.user }));
      setDone(true);
      toast.success(`Welcome to Echofold, ${name}!`);
      setTimeout(() => router.push('/content'), 1500);
    } catch (err) {
      toast.error(getApiError(err, 'Failed to accept invitation. The link may have expired.'));
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0e]">
        <Loader2 className="h-8 w-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  // ── Invalid / expired ──────────────────────────────────────────────────────

  if (invalid || !invite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0e] px-6">
        <div className="w-full max-w-sm text-center">
          <div className="h-14 w-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-5">
            <span className="text-2xl">⚠️</span>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Invalid or expired link</h1>
          <p className="text-sm text-white/40 mb-6">
            This invitation link is no longer valid. It may have expired or already been used.
          </p>
          <Link href="/login"
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors">
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  // ── Success ────────────────────────────────────────────────────────────────

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0e] px-6">
        <div className="text-center">
          <CheckCircle2 className="h-14 w-14 text-green-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">You're all set!</h1>
          <p className="text-sm text-white/40">Redirecting you to your dashboard…</p>
        </div>
      </div>
    );
  }

  // ── Accept form ────────────────────────────────────────────────────────────

  const expiresAt = new Date(invite.expires_at);
  const hoursLeft = Math.max(0, Math.round((expiresAt.getTime() - Date.now()) / 3_600_000));

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0e] px-6 py-12">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-2.5 mb-8 hover:opacity-80 transition-opacity">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-900/30">
            <EchofoldLogo variant="duo" size="sm" />
          </span>
          <span className="text-base font-bold text-white">Echofold</span>
        </Link>

        {/* Invite info banner */}
        {invite.role === 'ORG_ADMIN' ? (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3.5 mb-6">
            <p className="text-xs text-amber-300/60 mb-0.5">You were invited as an Admin of</p>
            <p className="text-white font-semibold">{invite.org_name ?? 'an organization'}</p>
            <p className="text-xs text-amber-300/50 mt-1">
              Full access to all brands
              {hoursLeft > 0 && ` · expires in ${hoursLeft}h`}
            </p>
          </div>
        ) : (
          <div className="bg-white/[0.04] border border-white/8 rounded-xl px-4 py-3.5 mb-6">
            <p className="text-xs text-white/40 mb-0.5">You were invited to join</p>
            <p className="text-white font-semibold">{invite.brand_name ?? 'a brand'}</p>
            <p className="text-xs text-white/30 mt-1">
              as Member
              {hoursLeft > 0 && ` · expires in ${hoursLeft}h`}
            </p>
          </div>
        )}

        {/* Form */}
        <div className="bg-white/[0.04] border border-white/8 rounded-2xl p-6 shadow-2xl shadow-black/40">
          <h1 className="text-lg font-bold text-white mb-1">Set up your account</h1>
          <p className="text-sm text-white/40 mb-5">Accepting invite for <span className="text-white/70">{invite.email}</span></p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-white/50 uppercase tracking-wide">Your name</label>
              <input
                type="text" required value={name} onChange={e => setName(e.target.value)}
                placeholder="Jane Smith" autoComplete="name"
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-purple-500/70 transition-all"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-white/50 uppercase tracking-wide">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'} required value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 8 characters" autoComplete="new-password"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 pr-10 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-purple-500/70 transition-all"
                />
                <button type="button" tabIndex={-1} onClick={() => setShowPass(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-white/50 uppercase tracking-wide">Confirm password</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'} required value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Repeat password" autoComplete="new-password"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 pr-10 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-purple-500/70 transition-all"
                />
                <button type="button" tabIndex={-1} onClick={() => setShowConfirm(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit" disabled={submitting}
              className="mt-1 w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-900/40"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Accept & Join'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-white/20">
          Already have an account?{' '}
          <Link href="/login" className="text-purple-400 hover:text-purple-300">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

// ─── Page (wraps in Suspense for useSearchParams) ─────────────────────────────

export default function InvitePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0e]">
        <Loader2 className="h-8 w-8 text-purple-400 animate-spin" />
      </div>
    }>
      <InvitePageInner />
    </Suspense>
  );
}
