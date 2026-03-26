'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useBrandAuthContext } from '@/contexts/brand-auth-context';
import { UserRole } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import {
  BarChart3, Eye, EyeOff, Loader2, ArrowLeft, TrendingUp, Shield,
  Zap, Check, ChevronRight, Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import { cn } from '@/lib/utils';

function getApiErrorMessage(err: unknown, fallback: string): string {
  const axiosErr = err as AxiosError<{ detail?: string }>;
  return axiosErr?.response?.data?.detail ?? fallback;
}

// ─── Shared field ─────────────────────────────────────────────────────────────

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

// ─── Plan data ────────────────────────────────────────────────────────────────

interface Plan {
  name: string;
  displayName: string;
  price: string;
  description: string;
  features: string[];
  highlighted: boolean;
}

const PLANS: Plan[] = [
  {
    name: 'free',
    displayName: 'Free',
    price: '$0',
    description: 'Get started at no cost',
    features: ['1 brand', '1 connected page', '500 content items/mo', 'Basic analytics'],
    highlighted: false,
  },
  {
    name: 'starter',
    displayName: 'Starter',
    price: '$29',
    description: 'For growing teams',
    features: ['3 brands', '5 pages', '5,000 content items/mo', 'Full analytics', '3 team members', 'Alerts & reports'],
    highlighted: true,
  },
  {
    name: 'pro',
    displayName: 'Pro',
    price: '$79',
    description: 'For serious brands',
    features: ['10 brands', '20 pages', '50,000 content items/mo', 'AI Digest', 'Influencer tracking', '10 team members'],
    highlighted: false,
  },
];

// ─── Main page ────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const auth = useBrandAuthContext();

  const [tab, setTab] = useState<'login' | 'signup'>(
    searchParams.get('tab') === 'signup' ? 'signup' : 'login'
  );
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // ── Login state ────────────────────────────────────────────────────────────
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // ── Sign-up state (2-step) ─────────────────────────────────────────────────
  const [signupStep, setSignupStep] = useState<1 | 2>(1);
  const [selectedPlan, setSelectedPlan] = useState<string>('starter');
  const [signupOrgName, setSignupOrgName] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirm, setSignupConfirm] = useState('');

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (auth.isAuthenticated && !auth.isLoading) {
      if (auth.user?.role === UserRole.SUPER) router.replace('/users');
      else if (auth.requiresBrandCreation) router.replace('/brands');
      else router.replace('/content');
    }
  }, [auth.isAuthenticated, auth.isLoading, auth.user?.role, auth.requiresBrandCreation, router]);

  useEffect(() => {
    const session = searchParams.get('session_id');
    if (session) {
      sessionStorage.setItem('session_id', session);
      router.push(`/connect?session_id=${session}`);
    }
  }, [searchParams, router]);

  // Reset signup steps when switching tabs
  const handleTabChange = (t: 'login' | 'signup') => {
    setTab(t);
    if (t === 'signup') setSignupStep(1);
  };

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;
    setLoading(true);
    try {
      const data = await auth.login(loginEmail, loginPassword);
      toast.success('Welcome back!');
      const role = data.user?.role;
      if (role === UserRole.SUPER) router.push('/users');
      else if (auth.requiresBrandCreation) router.push('/brands');
      else router.push('/content');
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, 'Login failed. Check your credentials.'));
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupOrgName.trim()) { toast.error('Agency name is required'); return; }
    if (signupPassword !== signupConfirm) { toast.error('Passwords do not match'); return; }
    if (signupPassword.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      await auth.register({
        org_name: signupOrgName,
        name: signupName,
        email: signupEmail,
        password: signupPassword,
        subscription_name: selectedPlan,
      });
      toast.success(`Welcome to AdSync, ${signupName}! Create your first brand to get started.`);
      router.push('/brands');
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

  // Left panel copy changes based on tab + step
  const isSignupPlans = tab === 'signup' && signupStep === 1;

  return (
    <div className="min-h-screen flex bg-[#0a0a0e]">

      {/* ── Left branding panel ── */}
      <div className="hidden lg:flex flex-col justify-between px-14 py-12 w-[52%] relative overflow-hidden bg-gradient-to-br from-[#15151d] via-[#111118] to-[#0a0a0e]">
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
          {isSignupPlans ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-widest text-purple-400 mb-4">Flexible Plans</p>
              <h1 className="text-4xl font-black text-white leading-[1.1] mb-6">
                Pick the plan that<br />
                <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  fits your brand
                </span>
              </h1>
              <p className="text-base text-white/50 leading-relaxed max-w-sm">
                Start free and upgrade as you grow. Every plan includes full platform access — no credit card required for Free.
              </p>
              <div className="mt-10 flex flex-col gap-4">
                {[
                  { icon: Users,     text: 'Invite your team and manage roles per brand' },
                  { icon: TrendingUp, text: 'All plans include analytics across Facebook, Instagram & TikTok' },
                  { icon: Shield,    text: 'Upgrade or downgrade anytime from your settings' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-start gap-3">
                    <div className="mt-0.5 h-6 w-6 rounded-lg bg-purple-600/20 flex items-center justify-center shrink-0">
                      <Icon className="h-3.5 w-3.5 text-purple-400" />
                    </div>
                    <p className="text-sm text-white/50 leading-snug">{text}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>

        <p className="relative z-10 text-xs text-white/20">© 2026 AdSync · Social Media Intelligence Platform</p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 overflow-y-auto">
        <div className={cn('w-full', tab === 'signup' && signupStep === 1 ? 'max-w-[640px]' : 'max-w-[420px]')}>

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
                  onClick={() => handleTabChange(t)}
                  className={cn(
                    'flex-1 py-3.5 text-sm font-semibold transition-all duration-150',
                    tab === t
                      ? 'text-white border-b-2 border-purple-500 -mb-px bg-purple-600/5'
                      : 'text-white/35 hover:text-white/60',
                  )}
                >
                  {t === 'login' ? 'Sign In' : 'Create Account'}
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
                    New brand?{' '}
                    <button type="button" onClick={() => handleTabChange('signup')} className="text-purple-400 hover:text-purple-300 font-medium">
                      Create an account →
                    </button>
                  </p>
                  <p className="text-center text-xs text-white/20 -mt-2">
                    Team member?{' '}
                    <span className="text-white/30">Use the invitation link sent to your email.</span>
                  </p>
                </form>
              )}

              {/* ── Sign-up: Step 1 — Choose plan ── */}
              {tab === 'signup' && signupStep === 1 && (
                <div className="flex flex-col gap-5">
                  <div className="mb-1">
                    <h2 className="text-xl font-bold text-white">Choose your plan</h2>
                    <p className="text-sm text-white/40 mt-1">You're creating a brand account. Team members join via invitation.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {PLANS.map(plan => {
                      const isSelected = selectedPlan === plan.name;
                      return (
                        <button
                          key={plan.name}
                          type="button"
                          onClick={() => setSelectedPlan(plan.name)}
                          className={cn(
                            'relative text-left rounded-xl border p-4 transition-all duration-150 flex flex-col gap-3',
                            isSelected
                              ? 'border-purple-500 bg-purple-600/10 ring-1 ring-purple-500/40'
                              : 'border-white/10 bg-white/3 hover:border-white/20 hover:bg-white/5',
                          )}
                        >
                          {plan.highlighted && (
                            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider bg-purple-600 text-white px-2.5 py-0.5 rounded-full">
                              Popular
                            </span>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-white">{plan.displayName}</span>
                            {isSelected && (
                              <div className="h-4 w-4 rounded-full bg-purple-600 flex items-center justify-center shrink-0">
                                <Check className="h-2.5 w-2.5 text-white" />
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="text-2xl font-black text-white">{plan.price}</span>
                            <span className="text-xs text-white/40">/mo</span>
                          </div>
                          <p className="text-xs text-white/40">{plan.description}</p>
                          <ul className="flex flex-col gap-1.5 mt-1">
                            {plan.features.map(f => (
                              <li key={f} className="flex items-start gap-1.5 text-xs text-white/55">
                                <Check className="h-3 w-3 text-purple-400 mt-0.5 shrink-0" />
                                {f}
                              </li>
                            ))}
                          </ul>
                        </button>
                      );
                    })}
                  </div>

                  <Button
                    type="button"
                    onClick={() => setSignupStep(2)}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg shadow-lg shadow-purple-900/40 transition-all flex items-center justify-center gap-2"
                  >
                    Continue with {PLANS.find(p => p.name === selectedPlan)?.displayName}
                    <ChevronRight className="h-4 w-4" />
                  </Button>

                  <p className="text-center text-xs text-white/30">
                    Already have an account?{' '}
                    <button type="button" onClick={() => handleTabChange('login')} className="text-purple-400 hover:text-purple-300 font-medium">
                      Sign in →
                    </button>
                  </p>
                </div>
              )}

              {/* ── Sign-up: Step 2 — Account details ── */}
              {tab === 'signup' && signupStep === 2 && (
                <form onSubmit={handleSignup} className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 mb-1">
                    <button
                      type="button"
                      onClick={() => setSignupStep(1)}
                      className="text-white/40 hover:text-white/70 transition-colors"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                    <div>
                      <h2 className="text-xl font-bold text-white">Create your account</h2>
                      <p className="text-sm text-white/40 mt-0.5">
                        Plan: <span className="text-purple-400 font-medium">{PLANS.find(p => p.name === selectedPlan)?.displayName}</span>
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <Field label="Agency name" value={signupOrgName} onChange={setSignupOrgName}
                        placeholder="Nike Agency" autoComplete="organization" required />
                    </div>
                    <div className="col-span-2">
                      <Field label="Your name" value={signupName} onChange={setSignupName}
                        placeholder="Jane Smith" autoComplete="name" required />
                    </div>
                    <div className="col-span-2">
                      <Field label="Work email" type="email" value={signupEmail} onChange={setSignupEmail}
                        placeholder="you@agency.com" autoComplete="email" required />
                    </div>
                    <Field label="Password" type="password" value={signupPassword} onChange={setSignupPassword}
                      placeholder="Min. 8 characters" autoComplete="new-password" required />
                    <Field label="Confirm" type="password" value={signupConfirm} onChange={setSignupConfirm}
                      placeholder="Repeat password" autoComplete="new-password" required />
                  </div>

                  <Button type="submit" disabled={loading}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg shadow-lg shadow-purple-900/40 transition-all mt-1"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create agency account'}
                  </Button>

                  <p className="text-center text-xs text-white/30">
                    Already have an account?{' '}
                    <button type="button" onClick={() => handleTabChange('login')} className="text-purple-400 hover:text-purple-300 font-medium">
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
