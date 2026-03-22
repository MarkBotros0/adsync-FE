'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { subscriptionsAPI } from '@/lib/api';
import { useBrandAuthContext } from '@/contexts/brand-auth-context';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { BarChart3, Eye, EyeOff, Loader2, Check, ArrowLeft, TrendingUp, Shield, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import type { Subscription } from '@/lib/types';
import { cn } from '@/lib/utils';

function getApiErrorMessage(err: unknown, fallback: string): string {
  const axiosErr = err as AxiosError<{ detail?: string }>;
  return axiosErr?.response?.data?.detail ?? fallback;
}

// ─── Field ────────────────────────────────────────────────────────────────────

function Field({
  label, type = 'text', value, onChange, placeholder, autoComplete, required,
}: {
  label: string; type?: string; value: string; onChange: (v: string) => void;
  placeholder?: string; autoComplete?: string; required?: boolean;
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (show ? 'text' : 'password') : type;

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-white/60 uppercase tracking-wide">{label}</label>
      <div className="relative">
        <input
          type={inputType}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          className={cn(
            'w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/25',
            'focus:outline-none focus:ring-2 focus:ring-purple-500/70 focus:border-purple-500/50 focus:bg-white/8 transition-all',
            isPassword && 'pr-10',
          )}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(s => !s)}
            tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Compact plan pill ─────────────────────────────────────────────────────────

const PLAN_ACCENT: Record<string, { ring: string; badge: string; dot: string }> = {
  free:    { ring: 'ring-white/20',    badge: 'bg-white/10 text-white/50',         dot: 'bg-white/40' },
  starter: { ring: 'ring-purple-500',  badge: 'bg-purple-600/30 text-purple-300',   dot: 'bg-purple-400' },
  pro:     { ring: 'ring-indigo-500',  badge: 'bg-indigo-600/30 text-indigo-300',   dot: 'bg-indigo-400' },
};

function PlanPill({ plan, selected, onSelect }: { plan: Subscription; selected: boolean; onSelect: () => void }) {
  const accent = PLAN_ACCENT[plan.name] ?? PLAN_ACCENT.free;
  const price = plan.price_monthly === 0
    ? 'Free'
    : `$${(plan.price_monthly / 100).toFixed(0)}/mo`;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'relative flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border transition-all duration-150 text-center',
        selected
          ? `bg-white/10 border-transparent ring-2 ${accent.ring}`
          : 'bg-white/5 border-white/8 hover:bg-white/8 hover:border-white/15',
      )}
    >
      {selected && (
        <div className={cn('absolute top-2 right-2 h-3.5 w-3.5 rounded-full flex items-center justify-center', accent.dot)}>
          <Check className="h-2 w-2 text-white" />
        </div>
      )}
      <span className="text-xs font-bold text-white">{plan.display_name}</span>
      <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold', accent.badge)}>{price}</span>
    </button>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const auth = useBrandAuthContext();

  const [tab, setTab] = useState<'login' | 'signup'>(
    searchParams.get('tab') === 'signup' ? 'signup' : 'login'
  );
  const [loading, setLoading] = useState(false);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirm, setSignupConfirm] = useState('');
  const [signupPlan, setSignupPlan] = useState('free');
  const [plans, setPlans] = useState<Subscription[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (auth.isAuthenticated && !auth.isLoading) router.replace('/content');
  }, [auth.isAuthenticated, auth.isLoading, router]);

  useEffect(() => {
    const session = searchParams.get('session_id');
    if (session) {
      sessionStorage.setItem('session_id', session);
      router.push(`/connect?session_id=${session}`);
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (tab === 'signup' && plans.length === 0) {
      subscriptionsAPI.list()
        .then(r => setPlans(r.data.subscriptions))
        .catch(() => {});
    }
  }, [tab, plans.length]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;
    setLoading(true);
    try {
      await auth.login(loginEmail, loginPassword);
      toast.success('Welcome back!');
      router.push('/content');
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, 'Login failed. Check your credentials.'));
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupPassword !== signupConfirm) { toast.error('Passwords do not match'); return; }
    if (signupPassword.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      await auth.register({ name: signupName, email: signupEmail, password: signupPassword, subscription_name: signupPlan });
      toast.success(`Welcome to AdSync, ${signupName}!`);
      router.push('/content');
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, 'Registration failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || auth.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0e]">
        <Loader2 className="h-8 w-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#0a0a0e]">

      {/* ── Left branding panel ── */}
      <div className="hidden lg:flex flex-col justify-between px-14 py-12 w-[52%] relative overflow-hidden bg-gradient-to-br from-[#15151d] via-[#111118] to-[#0a0a0e]">
        {/* Decorative blobs */}
        <div className="absolute top-0 left-0 h-96 w-96 rounded-full bg-purple-700/20 blur-[120px] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-indigo-700/15 blur-[100px] translate-x-1/4 translate-y-1/4" />

        {/* Logo */}
        <Link href="/" className="relative z-10 inline-flex items-center gap-3 hover:opacity-80 transition-opacity w-fit">
          <div className="h-9 w-9 rounded-xl bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-900/50">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">AdSync</span>
        </Link>

        {/* Hero copy */}
        <div className="relative z-10 flex-1 flex flex-col justify-center py-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-purple-400 mb-4">Social Media Intelligence</p>
          <h1 className="text-5xl font-black text-white leading-[1.1] mb-6">
            Monitor your brand<br />
            <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              across every platform
            </span>
          </h1>
          <p className="text-base text-white/50 leading-relaxed max-w-sm">
            Track mentions, analyze sentiment, discover influencers, and get AI-powered insights — all in one place.
          </p>

          {/* Feature bullets */}
          <div className="mt-10 flex flex-col gap-4">
            {[
              { icon: TrendingUp, text: 'Real-time analytics across Facebook, Instagram & TikTok' },
              { icon: Zap,        text: 'AI-powered digest and smart alerts' },
              { icon: Shield,     text: 'Enterprise-grade security and team controls' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-start gap-3">
                <div className="mt-0.5 h-6 w-6 rounded-lg bg-purple-600/20 flex items-center justify-center shrink-0">
                  <Icon className="h-3.5 w-3.5 text-purple-400" />
                </div>
                <p className="text-sm text-white/50 leading-snug">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom tag */}
        <p className="relative z-10 text-xs text-white/20">© 2026 AdSync · Social Media Intelligence Platform</p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-[420px]">

          {/* Back + mobile logo */}
          <div className="flex items-center justify-between mb-7">
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </Link>
            <div className="flex lg:hidden items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-purple-600 flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-bold text-white">AdSync</span>
            </div>
            <div className="w-10 lg:hidden" />
          </div>

          {/* Card */}
          <div className="bg-white/[0.04] backdrop-blur-xl border border-white/8 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden">

            {/* Tab strip */}
            <div className="flex border-b border-white/8">
              {(['login', 'signup'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    'flex-1 py-3.5 text-sm font-semibold transition-all duration-150',
                    tab === t
                      ? 'text-white border-b-2 border-purple-500 -mb-px bg-purple-600/5'
                      : 'text-white/35 hover:text-white/60',
                  )}
                >
                  {t === 'login' ? 'Sign In' : 'Sign Up'}
                </button>
              ))}
            </div>

            <div className="p-7">

              {/* ── Login form ── */}
              {tab === 'login' && (
                <form onSubmit={handleLogin} className="flex flex-col gap-5">
                  <div className="mb-1">
                    <h2 className="text-xl font-bold text-white">Welcome back</h2>
                    <p className="text-sm text-white/40 mt-1">Sign in to your brand account</p>
                  </div>

                  <Field label="Email" type="email" value={loginEmail} onChange={setLoginEmail}
                    placeholder="you@brand.com" autoComplete="email" required />
                  <Field label="Password" type="password" value={loginPassword} onChange={setLoginPassword}
                    placeholder="••••••••" autoComplete="current-password" required />

                  <Button type="submit" disabled={loading}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg shadow-lg shadow-purple-900/40 transition-all mt-1"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign In'}
                  </Button>

                  <p className="text-center text-xs text-white/30">
                    No account?{' '}
                    <button type="button" onClick={() => setTab('signup')} className="text-purple-400 hover:text-purple-300 font-medium">
                      Sign up free →
                    </button>
                  </p>
                </form>
              )}

              {/* ── Sign-up form ── */}
              {tab === 'signup' && (
                <form onSubmit={handleSignup} className="flex flex-col gap-4">
                  <div className="mb-1">
                    <h2 className="text-xl font-bold text-white">Create your account</h2>
                    <p className="text-sm text-white/40 mt-1">Start monitoring your brand today</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <Field label="Brand name" value={signupName} onChange={setSignupName}
                        placeholder="Acme Inc." autoComplete="organization" required />
                    </div>
                    <div className="col-span-2">
                      <Field label="Email" type="email" value={signupEmail} onChange={setSignupEmail}
                        placeholder="you@brand.com" autoComplete="email" required />
                    </div>
                    <Field label="Password" type="password" value={signupPassword} onChange={setSignupPassword}
                      placeholder="Min. 8 characters" autoComplete="new-password" required />
                    <Field label="Confirm" type="password" value={signupConfirm} onChange={setSignupConfirm}
                      placeholder="Repeat password" autoComplete="new-password" required />
                  </div>

                  {/* Compact plan picker — 2×2 grid */}
                  {plans.length > 0 && (
                    <div className="flex flex-col gap-2 mt-1">
                      <p className="text-xs font-medium uppercase tracking-wide text-white/40">Choose a plan</p>
                      <div className="grid grid-cols-2 gap-2">
                        {plans.map(plan => (
                          <PlanPill
                            key={plan.name}
                            plan={plan}
                            selected={signupPlan === plan.name}
                            onSelect={() => setSignupPlan(plan.name)}
                          />
                        ))}
                      </div>
                      <p className="text-[10px] text-white/25 text-center">You can change your plan anytime after signing up</p>
                    </div>
                  )}

                  <Button type="submit" disabled={loading}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg shadow-lg shadow-purple-900/40 transition-all mt-1"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create account'}
                  </Button>

                  <p className="text-center text-xs text-white/30">
                    Already have an account?{' '}
                    <button type="button" onClick={() => setTab('login')} className="text-purple-400 hover:text-purple-300 font-medium">
                      Sign in →
                    </button>
                  </p>
                </form>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
