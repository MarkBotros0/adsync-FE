'use client';

import Link from 'next/link';
import {
  BarChart3,
  Bell,
  Bot,
  Crosshair,
  FileText,
  Layers,
  Plug,
  Radar,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
  ArrowRight,
  Check,
} from 'lucide-react';
import { EchofoldLogo } from '@/components/brand/echofold-logo';
import type { ComponentType, SVGProps, ReactNode } from 'react';

type LucideIcon = ComponentType<SVGProps<SVGSVGElement>>;

// ─── Data ─────────────────────────────────────────────────────────────────────

const PLATFORMS = [
  'Twitter / X', 'Facebook', 'Instagram', 'TikTok',
  'YouTube', 'LinkedIn', 'Bluesky', 'Reddit',
  'News Sites', 'Blogs', 'Forums', 'Web',
];

const PLANS = [
  {
    name: 'Solo',
    price: '$0',
    description: 'For founders watching their first brand take shape.',
    features: ['1 brand', '500 content / mo', '1 page', 'Basic analytics'],
    cta: 'Start free',
    highlight: false,
  },
  {
    name: 'Studio',
    price: '$29',
    description: 'For boutique agencies running a handful of clients.',
    features: ['3 brands', '5,000 content / mo', '5 pages', 'Full analytics', 'Alerts', 'Instagram', 'Export'],
    cta: 'Get started',
    highlight: false,
  },
  {
    name: 'Agency',
    price: '$79',
    description: 'For full-service teams managing every brand under one roof.',
    features: ['10 brands', '50,000 content / mo', '20 pages', 'AI Digest', 'Influencer intelligence', 'Instagram & TikTok', 'Reports', '10 team members'],
    cta: 'Get started',
    highlight: true,
  },
];

// ─── Components ───────────────────────────────────────────────────────────────

function Nav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-white/8 backdrop-blur-xl bg-[#0a0a0e]/90">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-900/30">
            <EchofoldLogo variant="duo" size="sm" />
          </span>
          <span className="text-base font-bold text-white">Echofold</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#platforms" className="hover:text-white transition-colors">Platforms</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-white/70 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/8"
          >
            Sign In
          </Link>
          <Link
            href="/login?tab=signup"
            className="text-sm font-semibold text-white bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-lg transition-colors shadow-lg shadow-purple-900/40"
          >
            Get started
          </Link>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden pt-24 pb-32 px-6">
      {/* Background blobs */}
      <div className="absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-purple-600/15 blur-3xl pointer-events-none" />
      <div className="absolute top-16 right-1/4 h-64 w-64 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 h-48 w-48 rounded-full bg-pink-600/8 blur-3xl pointer-events-none" />

      <div className="relative max-w-3xl mx-auto text-center">
        {/* Echo-pulse mark behind/above the headline */}
        <div className="mx-auto mb-10 flex items-center justify-center">
          <span className="ef-echo-pulse h-16 w-16 rounded-full">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 shadow-2xl shadow-purple-900/50">
              <EchofoldLogo variant="duo" size="md" />
            </span>
          </span>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-300 mb-8">
          <Sparkles className="h-3 w-3" />
          Brand Intelligence Platform
        </span>

        <h1 className="font-display text-5xl md:text-6xl font-extrabold text-white leading-[1.05] tracking-[-0.025em] mb-6">
          Hear every echo of your brand —<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
            before it goes loud.
          </span>
        </h1>

        <p className="text-lg text-white/60 leading-relaxed max-w-xl mx-auto mb-10">
          Echofold is the intelligence layer for marketing agencies running multiple brands. Listen across every platform, read sentiment in real time, watch competitors, and turn the noise into AI-generated insight — from a single dashboard.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/login?tab=signup"
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-xl shadow-purple-900/40 hover:shadow-purple-800/50"
          >
            Start for free
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 border border-white/15 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white font-medium px-6 py-3 rounded-xl transition-all"
          >
            Sign in
          </Link>
        </div>
      </div>
    </section>
  );
}

interface BentoCellProps {
  icon: LucideIcon;
  title: string;
  description: string;
  iconColor: string;
  iconBg: string;
  span: string;
  hero?: boolean;
  children?: ReactNode;
}

function BentoCell({ icon: Icon, title, description, iconColor, iconBg, span, hero, children }: BentoCellProps) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-white/8 bg-white/[0.04] p-6 transition-all duration-200 hover:border-white/14 hover:bg-white/[0.06] ${span}`}
    >
      {/* Subtle inner glow on hero cell */}
      {hero && (
        <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-purple-500/15 blur-3xl" />
      )}

      <div className="relative flex h-full flex-col">
        <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>

        <h3 className={`mb-2 font-bold text-white ${hero ? 'text-xl' : 'text-sm'}`}>{title}</h3>
        <p className={`leading-relaxed text-white/50 ${hero ? 'text-sm max-w-md' : 'text-xs'}`}>
          {description}
        </p>

        {children && <div className="mt-5 flex-1">{children}</div>}
      </div>
    </div>
  );
}

function HeroCellVisual() {
  // Inline mock listening feed inside the Social Listening hero cell.
  const MOCK = [
    { platform: 'X',         handle: '@maya_creates', body: 'love how natural the new ad reads — no aggressive CTAs', sentiment: 'positive' as const },
    { platform: 'Instagram', handle: 'lila.jpg',      body: 'wait this brand is owned by who??',                       sentiment: 'neutral' as const  },
    { platform: 'Reddit',    handle: 'r/marketing',   body: 'their support response time has been awful lately',       sentiment: 'negative' as const },
  ];

  const sentimentChip = (s: 'positive' | 'neutral' | 'negative') => {
    const styles = {
      positive: 'bg-emerald-500/15 text-emerald-300',
      neutral:  'bg-slate-500/15 text-slate-300',
      negative: 'bg-rose-500/15 text-rose-300',
    } as const;
    return <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${styles[s]}`}>{s}</span>;
  };

  return (
    <div className="space-y-2.5">
      {MOCK.map(m => (
        <div
          key={m.handle + m.body}
          className="rounded-xl border border-white/6 bg-black/20 px-3.5 py-2.5"
        >
          <div className="mb-1 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[11px] text-white/40">
              <span className="font-semibold text-white/70">{m.platform}</span>
              <span>·</span>
              <span>{m.handle}</span>
            </div>
            {sentimentChip(m.sentiment)}
          </div>
          <p className="text-xs text-white/65 line-clamp-1">{m.body}</p>
        </div>
      ))}
    </div>
  );
}

function Features() {
  return (
    <section id="features" className="px-6 py-24">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-purple-400 mb-3">The Platform</p>
          <h2 className="font-display text-3xl md:text-4xl font-extrabold tracking-[-0.02em] text-white mb-4">Every echo. Every brand. One feed.</h2>
          <p className="text-white/50 max-w-lg mx-auto">
            One platform to listen, analyse, and act on every conversation that mentions you, your competitors, or the moments you care about.
          </p>
        </div>

        {/* Bento grid: 6-col on lg, stacked on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <BentoCell
            span="lg:col-span-4 lg:row-span-2 sm:col-span-2"
            icon={Radar}
            iconColor="text-purple-400"
            iconBg="bg-purple-500/10"
            title="Social Listening"
            description="Every mention of your brand across X, Facebook, Instagram, TikTok, YouTube, LinkedIn, Bluesky, Reddit, news, blogs, and forums — pulled into a single, searchable feed."
            hero
          >
            <HeroCellVisual />
          </BentoCell>

          <BentoCell
            span="lg:col-span-2"
            icon={Bot}
            iconColor="text-pink-400"
            iconBg="bg-pink-500/10"
            title="AI Digest"
            description="Wake up to a written brief on what changed overnight. Echofold surfaces emerging themes and tells you where to look first."
          />

          <BentoCell
            span="lg:col-span-2"
            icon={TrendingUp}
            iconColor="text-indigo-400"
            iconBg="bg-indigo-500/10"
            title="Sentiment & Emotion"
            description="Read the room in real time. Every mention scored and tagged with emotion — joy, anger, surprise, sadness."
          />

          <BentoCell
            span="lg:col-span-2"
            icon={Crosshair}
            iconColor="text-rose-400"
            iconBg="bg-rose-500/10"
            title="Competitor Tracking"
            description="Watch the brands you're up against. Share of voice, sentiment, and the moments they're winning — all in one view."
          />

          <BentoCell
            span="lg:col-span-2"
            icon={Users}
            iconColor="text-emerald-400"
            iconBg="bg-emerald-500/10"
            title="Influencer Intelligence"
            description="Find the voices steering the conversation. Reach, voice share, sentiment, and performance for every creator."
          />

          <BentoCell
            span="lg:col-span-2"
            icon={Bell}
            iconColor="text-yellow-400"
            iconBg="bg-yellow-500/10"
            title="Real-time Alerts"
            description="Set thresholds for negative spikes, mention surges, and competitor moves. Get pinged the moment a wave forms."
          />

          <BentoCell
            span="lg:col-span-3"
            icon={BarChart3}
            iconColor="text-blue-400"
            iconBg="bg-blue-500/10"
            title="Ad & Page Analytics"
            description="Plug in your Facebook, Instagram, and TikTok accounts. See campaign performance next to the conversation it's driving."
          />

          <BentoCell
            span="lg:col-span-3"
            icon={FileText}
            iconColor="text-orange-400"
            iconBg="bg-orange-500/10"
            title="Reports"
            description="Branded, shareable reports — PDF or live link — for clients, leadership, and weekly stand-ups."
          />

          <BentoCell
            span="lg:col-span-6"
            icon={Layers}
            iconColor="text-violet-400"
            iconBg="bg-violet-500/10"
            title="Multi-brand Workspace"
            description="One agency. One login. Every brand you manage, with its own permissions, alerts, and analytics. Switch in one click."
          />
        </div>
      </div>
    </section>
  );
}

// ─── Product preview (live-feed mock) ─────────────────────────────────────────

function ProductPreview() {
  const ROWS = [
    { platform: 'X',         handle: '@nora_writes',       reach: '12.4K', body: '@brand the new packaging is gorgeous — the unboxing made my week', sentiment: 'positive' as const },
    { platform: 'TikTok',    handle: '@aaronfilms',        reach: '88.2K', body: 'review of the latest drop. honest take, link in bio',               sentiment: 'neutral'  as const },
    { platform: 'Reddit',    handle: 'r/buyitforlife',     reach:   '4.1K', body: 'anyone else having issues with shipping times this month?',         sentiment: 'negative' as const },
    { platform: 'Instagram', handle: 'mara.cph',           reach: '23.8K', body: 'this campaign is the best work they’ve done in years',          sentiment: 'positive' as const },
  ];

  const chip = (s: 'positive' | 'neutral' | 'negative') => {
    const styles = {
      positive: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
      neutral:  'bg-slate-500/15 text-slate-300 border-slate-500/20',
      negative: 'bg-rose-500/15 text-rose-300 border-rose-500/20',
    } as const;
    return <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize ${styles[s]}`}>{s}</span>;
  };

  return (
    <section className="px-6 pb-12">
      <div className="max-w-5xl mx-auto">
        <div className="relative rounded-3xl border border-white/8 bg-gradient-to-b from-white/[0.03] to-transparent p-3 shadow-2xl shadow-black/40 sm:p-4">
          {/* Window chrome */}
          <div className="rounded-2xl border border-white/8 bg-[#0c0c12] overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/6 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500/50" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400/50" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/50" />
              </div>
              <div className="hidden items-center gap-2 sm:flex">
                <span className="ef-echo-pulse h-2 w-2 rounded-full">
                  <span className="block h-2 w-2 rounded-full bg-cyan-400" />
                </span>
                <span className="text-[11px] font-medium text-cyan-300">Listening · 4 platforms</span>
              </div>
              <span className="text-[11px] text-white/30">echofold.com/content</span>
            </div>

            {/* Stat row */}
            <div className="grid grid-cols-2 gap-px bg-white/6 sm:grid-cols-4">
              {[
                { label: 'Mentions today', value: '1,284', delta: '+18%' },
                { label: 'Reach',          value: '4.2M',  delta: '+9%'  },
                { label: 'Positive',       value: '62%',   delta: '+4 pp' },
                { label: 'Negative spike', value: '2',     delta: 'last hr', alert: true },
              ].map(s => (
                <div key={s.label} className="bg-[#0c0c12] px-4 py-3">
                  <p className="text-[10px] uppercase tracking-wider text-white/35">{s.label}</p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="font-mono text-lg font-semibold text-white tabular-nums">{s.value}</span>
                    <span className={`text-[10px] font-semibold ${s.alert ? 'text-amber-300' : 'text-emerald-300'}`}>{s.delta}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Feed */}
            <div className="divide-y divide-white/6">
              {ROWS.map(row => (
                <div key={row.handle + row.body} className="flex items-start gap-3 px-4 py-3 sm:px-5">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/8 text-[10px] font-bold text-white/70">
                    {row.platform.slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-[11px] text-white/45">
                        <span className="font-semibold text-white/75">{row.handle}</span>
                        <span>·</span>
                        <span>{row.platform}</span>
                        <span>·</span>
                        <span>{row.reach} reach</span>
                      </div>
                      {chip(row.sentiment)}
                    </div>
                    <p className="truncate text-sm text-white/70">{row.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Soft glow under the window */}
          <div className="pointer-events-none absolute -inset-x-10 -bottom-10 h-24 rounded-full bg-purple-700/20 blur-3xl" />
        </div>

        <p className="mt-6 text-center text-xs text-white/35">
          A live view of the Echofold feed — sentiment, reach, and platform in one read.
        </p>
      </div>
    </section>
  );
}

// ─── How it works ─────────────────────────────────────────────────────────────

function HowItWorks() {
  const STEPS: { icon: LucideIcon; title: string; body: string; }[] = [
    { icon: Plug,   title: 'Connect',
      body: 'Plug in Facebook, Instagram, and TikTok in two clicks. Echofold starts pulling mentions, ads, and conversations across the open web within minutes.' },
    { icon: Radar,  title: 'Listen',
      body: 'Every mention is scored for sentiment, tagged with emotion, and routed to the right brand workspace. Your AI Digest writes itself.' },
    { icon: Zap,    title: 'Act',
      body: 'Get pinged on negative spikes, surface the influencers worth replying to, and ship branded reports your clients actually read.' },
  ];

  return (
    <section className="px-6 py-24 border-y border-white/8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-purple-400 mb-3">How it works</p>
          <h2 className="font-display text-3xl md:text-4xl font-extrabold tracking-[-0.02em] text-white">From plug-in to written brief in a day.</h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.title} className="relative rounded-2xl border border-white/8 bg-white/[0.03] p-6">
              <div className="mb-4 flex items-center justify-between">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-purple-500/15 text-purple-300">
                  <s.icon className="h-4.5 w-4.5" />
                </span>
                <span className="font-mono text-xs text-white/30">0{i + 1}</span>
              </div>
              <h3 className="mb-2 text-base font-bold text-white">{s.title}</h3>
              <p className="text-sm leading-relaxed text-white/50">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Platforms() {
  return (
    <section id="platforms" className="px-6 py-20 border-y border-white/8">
      <div className="max-w-5xl mx-auto text-center">
        <p className="text-xs font-semibold text-purple-400 uppercase tracking-widest mb-6">Coverage</p>
        <h2 className="font-display text-2xl md:text-3xl font-extrabold tracking-[-0.02em] text-white mb-4">Wherever your brand is being talked about.</h2>
        <p className="text-white/50 mb-12 max-w-md mx-auto">
          From major social networks to niche communities — Echofold listens across them all.
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          {PLATFORMS.map(p => (
            <span
              key={p}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-white/70 font-medium"
            >
              {p}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="px-6 py-24">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-purple-400 mb-3">Pricing</p>
          <h2 className="font-display text-3xl md:text-4xl font-extrabold tracking-[-0.02em] text-white mb-4">For solo founders. For studios. For agencies.</h2>
          <p className="text-white/50 max-w-md mx-auto">Start free. Scale as you take on more brands. No card needed for Solo.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:items-stretch">
          {PLANS.map(plan => {
            const isHighlight = plan.highlight;
            return (
              <div
                key={plan.name}
                className={`relative ${isHighlight ? 'lg:-translate-y-3' : ''}`}
              >
                {/* Gradient ring on the highlight tier */}
                {isHighlight && (
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -inset-px rounded-[18px] bg-gradient-to-b from-purple-500/60 via-indigo-500/40 to-transparent"
                  />
                )}

                <div
                  className={`relative h-full rounded-[16px] border p-7 flex flex-col gap-5 ${
                    isHighlight
                      ? 'border-transparent bg-[#13121a] shadow-2xl shadow-purple-900/40'
                      : 'border-white/8 bg-white/[0.03]'
                  }`}
                >
                  {isHighlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-purple-400/30 bg-purple-600 px-3 py-0.5 text-[11px] font-bold text-white shadow-lg shadow-purple-900/50">
                      Most popular
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wider text-white/70">{plan.name}</p>
                    <div className="mt-3 flex items-baseline gap-1.5">
                      <span className="font-display text-4xl font-extrabold text-white tracking-[-0.03em] tabular-nums">{plan.price}</span>
                      {plan.price !== 'Custom' && plan.price !== '$0' && (
                        <span className="text-sm font-medium text-white/40">/ month</span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-white/50 leading-relaxed">{plan.description}</p>
                  </div>

                  <div className="h-px bg-white/8" />

                  <ul className="flex flex-col gap-2.5 flex-1">
                    {plan.features.map(feat => (
                      <li key={feat} className="flex items-start gap-2.5 text-sm text-white/70">
                        <span className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full ${isHighlight ? 'bg-purple-500/25' : 'bg-white/8'}`}>
                          <Check className={`h-3 w-3 ${isHighlight ? 'text-purple-300' : 'text-white/60'}`} />
                        </span>
                        {feat}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/login?tab=signup"
                    className={`block text-center text-sm font-semibold py-3 rounded-xl transition-all ${
                      isHighlight
                        ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/40'
                        : 'border border-white/15 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-10 text-center text-xs text-white/35">
          All plans include sentiment + emotion analysis, real-time alerts, and unlimited team members on the Agency tier.
        </p>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="px-6 py-24">
      <div className="max-w-2xl mx-auto text-center">
        <div className="rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-900/30 to-indigo-900/20 p-12">
          <ShieldCheck className="h-10 w-10 text-purple-400 mx-auto mb-6" />
          <h2 className="font-display text-3xl md:text-4xl font-extrabold tracking-[-0.02em] text-white mb-4 leading-[1.1]">
            Stop reacting.<br />Start reading the echo.
          </h2>
          <p className="text-white/55 mb-8">
            Echofold gives every brand on your roster the same listening power the biggest agencies use — for the price of a single seat there.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login?tab=signup"
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-xl shadow-purple-900/40"
            >
              Get started free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 border border-white/15 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-medium px-6 py-3 rounded-xl transition-all"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/8 px-6 py-8">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-md bg-gradient-to-br from-purple-600 to-indigo-600 text-white">
            <EchofoldLogo variant="duo" size="sm" className="h-3.5 w-3.5" />
          </span>
          <span className="text-sm font-bold text-white">Echofold</span>
        </div>
        <p className="text-xs text-white/30">© 2026 Echofold · Brand Intelligence Platform</p>
        <div className="flex items-center gap-5 text-xs text-white/40">
          <a href="#" className="hover:text-white/70 transition-colors">Privacy</a>
          <a href="#" className="hover:text-white/70 transition-colors">Terms</a>
          <Link href="/login" className="hover:text-white/70 transition-colors">Sign In</Link>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div
      className="min-h-screen text-white"
      style={{ background: 'linear-gradient(160deg, #13121a 0%, #0d0c14 40%, #0a0a0e 100%)' }}
    >
      <Nav />
      <Hero />
      <ProductPreview />
      <Platforms />
      <HowItWorks />
      <Features />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  );
}
