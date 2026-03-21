'use client';

import Link from 'next/link';
import {
  BarChart3,
  Bell,
  Bot,
  FileText,
  Globe,
  Hash,
  MessageCircle,
  Radar,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  ArrowRight,
  Check,
} from 'lucide-react';

// ─── Data ─────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Radar,
    title: 'Social Listening',
    description:
      'Monitor every mention of your brand across Twitter, Facebook, Instagram, TikTok, YouTube, Reddit, LinkedIn, news sites, blogs, and forums — all in one unified feed.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
  },
  {
    icon: TrendingUp,
    title: 'Sentiment & Emotion Analysis',
    description:
      'Instantly classify mentions as positive, negative, or neutral. Drill deeper with emotion labels — joy, anger, surprise, sadness — to understand how your audience truly feels.',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
  },
  {
    icon: Bot,
    title: 'AI Digest',
    description:
      'Get a concise AI-generated daily summary of what people are saying about your brand. Spot emerging topics before they escalate.',
    color: 'text-pink-400',
    bg: 'bg-pink-500/10',
  },
  {
    icon: BarChart3,
    title: 'Ad & Page Analytics',
    description:
      'Connect your Facebook ad accounts and pages to track campaign performance, engagement rates, post reach, and messaging insights all in one place.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
  },
  {
    icon: Users,
    title: 'Influencer Tracking',
    description:
      'Identify the voices driving the conversation around your brand. See reach, voice share, sentiment, and performance scores for each influencer.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
  {
    icon: Bell,
    title: 'Real-time Alerts',
    description:
      'Set threshold-based alerts for spikes in negative sentiment, sudden mention surges, or competitor activity — and get notified the moment something happens.',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
  },
  {
    icon: FileText,
    title: 'Reports',
    description:
      'Generate shareable reports on brand performance, campaign results, and audience insights. Export to PDF or share a live link with your team.',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
  },
  {
    icon: Hash,
    title: 'Trending Topics & Hashtags',
    description:
      'See which hashtags and conversations are gaining momentum around your brand in real time. Stay ahead of cultural moments that matter.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
  },
  {
    icon: Globe,
    title: 'Multi-platform Coverage',
    description:
      'From mainstream social networks to niche forums and news aggregators — AdSync covers every surface where your brand is being talked about.',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
  },
];

const PLATFORMS = [
  'Twitter / X', 'Facebook', 'Instagram', 'TikTok',
  'YouTube', 'LinkedIn', 'Bluesky', 'Reddit',
  'News Sites', 'Blogs', 'Forums', 'Web',
];

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    description: 'Get started with the basics.',
    features: ['1 brand', '500 content / mo', '1 page', 'Basic analytics'],
    cta: 'Get started free',
    highlight: false,
  },
  {
    name: 'Starter',
    price: '$29',
    description: 'For small brands growing their presence.',
    features: ['3 brands', '5,000 content / mo', '5 pages', 'Full analytics', 'Alerts', 'Instagram', 'Export'],
    cta: 'Start free trial',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$79',
    description: 'For teams that need AI and full analytics.',
    features: ['10 brands', '50,000 content / mo', '20 pages', 'AI Digest', 'Influencer tracking', 'Instagram & TikTok', 'Reports', '10 team members'],
    cta: 'Start free trial',
    highlight: true,
  },
];

// ─── Components ───────────────────────────────────────────────────────────────

function Nav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-white/8 backdrop-blur-xl bg-[#0f0620]/80">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-purple-600 flex items-center justify-center">
            <BarChart3 className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="text-base font-bold text-white">AdSync</span>
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
        <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-300 mb-8">
          <Sparkles className="h-3 w-3" />
          Social Media Intelligence
        </span>

        <h1 className="text-5xl md:text-6xl font-black text-white leading-[1.08] tracking-tight mb-6">
          Know what the world<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
            is saying about your brand
          </span>
        </h1>

        <p className="text-lg text-white/60 leading-relaxed max-w-xl mx-auto mb-10">
          Monitor mentions across every platform, understand sentiment, track influencers, and get AI-powered insights — from a single dashboard.
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

function Features() {
  return (
    <section id="features" className="px-6 py-24">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Everything your brand needs</h2>
          <p className="text-white/50 max-w-lg mx-auto">
            One platform to listen, analyse, and act on everything being said about your brand online.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(f => (
            <div
              key={f.title}
              className="group rounded-2xl border border-white/8 bg-white/4 hover:bg-white/6 hover:border-white/14 p-6 transition-all duration-200"
            >
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${f.bg} mb-4`}>
                <f.icon className={`h-5 w-5 ${f.color}`} />
              </div>
              <h3 className="text-sm font-bold text-white mb-2">{f.title}</h3>
              <p className="text-xs text-white/50 leading-relaxed">{f.description}</p>
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
        <h2 className="text-2xl md:text-3xl font-black text-white mb-4">Every platform. One dashboard.</h2>
        <p className="text-white/50 mb-12 max-w-md mx-auto">
          From major social networks to niche communities — AdSync has you covered.
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
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Simple, transparent pricing</h2>
          <p className="text-white/50">Start free. Scale as you grow.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PLANS.map(plan => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-6 flex flex-col gap-4 transition-all ${
                plan.highlight
                  ? 'border-purple-500/60 bg-purple-600/10 shadow-xl shadow-purple-900/30'
                  : 'border-white/8 bg-white/4'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-purple-600 px-3 py-0.5 text-xs font-bold text-white shadow-lg">
                  Most popular
                </div>
              )}

              <div>
                <p className="text-sm font-bold text-white">{plan.name}</p>
                <p className="text-2xl font-black text-white mt-1">
                  {plan.price}
                  {plan.price !== 'Custom' && plan.price !== '$0' && (
                    <span className="text-sm font-normal text-white/40">/mo</span>
                  )}
                </p>
                <p className="text-xs text-white/45 mt-1">{plan.description}</p>
              </div>

              <ul className="flex flex-col gap-2 flex-1">
                {plan.features.map(feat => (
                  <li key={feat} className="flex items-center gap-2 text-xs text-white/65">
                    <Check className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>

              <Link
                href="/login?tab=signup"
                className={`block text-center text-sm font-semibold py-2.5 rounded-xl transition-all ${
                  plan.highlight
                    ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/40'
                    : 'border border-white/15 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
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
          <h2 className="text-3xl font-black text-white mb-4">
            Your brand reputation,<br />always under control
          </h2>
          <p className="text-white/55 mb-8">
            Join brands that use AdSync to stay ahead of the conversation. Start monitoring for free — no credit card required.
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
          <div className="h-6 w-6 rounded-md bg-purple-600 flex items-center justify-center">
            <BarChart3 className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-bold text-white">AdSync</span>
        </div>
        <p className="text-xs text-white/30">© 2026 AdSync · Social Media Intelligence Platform</p>
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
      style={{ background: 'linear-gradient(160deg, #1a0a2e 0%, #0f0620 40%, #0a0416 100%)' }}
    >
      <Nav />
      <Hero />
      <Platforms />
      <Features />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  );
}
