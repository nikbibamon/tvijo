'use client';

/**
 * Tvijo Landing Page — Main portal homepage
 * Generation: GEN-PORTAL-001
 *
 * Sections: Hero, Live Stats, News Feed, Signals, Features, Telegram CTA, Newsletter
 */

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/portal/Navbar';
import Footer from '@/components/portal/Footer';

// ============================================================================
// Types
// ============================================================================

interface Article {
  id: number;
  title: string;
  description: string;
  source_name: string;
  category: string;
  sentiment_label: string;
  published_at: string;
  image_url: string | null;
  view_count: number;
}

interface TrendingTopic {
  id: number;
  keyword: string;
  mention_count: number;
  sentiment_score: string;
}

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ============================================================================
// API
// ============================================================================

const API = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

// ============================================================================
// Helpers
// ============================================================================

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const CATEGORY_COLORS: Record<string, string> = {
  crypto: '#F59E0B',
  markets: '#3B82F6',
  finance: '#10B981',
  world: '#8B5CF6',
  politics: '#EF4444',
  tech: '#06B6D4',
  energy: '#F97316',
  general: '#6B7280',
};

const SENTIMENT_ICONS: Record<string, { icon: string; color: string }> = {
  positive: { icon: '↑', color: '#22C55E' },
  negative: { icon: '↓', color: '#EF4444' },
  neutral: { icon: '→', color: '#9CA3AF' },
};

// ============================================================================
// Sub-components
// ============================================================================

function HeroSection({ locale, stats }: { locale: string; stats: { articles: number; sources: number; events: number } }) {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 via-transparent to-transparent" />
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[120px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-4 py-1.5 mb-8 shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-none">
          <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
          <span className="text-xs text-slate-600 dark:text-gray-400">
            Monitoring {stats.sources} sources in real-time
          </span>
        </div>

        <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          <span className="text-slate-900 dark:text-white">AI-Powered</span>
          <br />
          <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
            Financial Intelligence
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Real-time news analysis, trading signals, and market intelligence
          from {stats.sources}+ sources. Powered by AI.
          All in one portal.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            href={`/${locale}/profile`}
            className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-amber-700 transition-all shadow-xl shadow-orange-500/25 text-base"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 4c2.21 0 4 1.79 4 4s-1.79 4-4 4-4-1.79-4-4 1.79-4 4-4zm0 16c-3.313 0-6.253-1.35-8.32-3.49C4.59 14.8 8.11 13 12 13c3.89 0 7.41 1.8 8.32 4.51C18.253 18.65 15.313 20 12 20z"/>
            </svg>
            Join Free — Register
          </Link>
          <Link
            href={`/${locale}/news`}
            className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-8 py-3.5 text-base font-semibold text-slate-900 shadow-sm transition-all hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:shadow-none dark:hover:bg-white/10"
          >
            Browse News
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>

        {/* Live stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
          {[
            { value: stats.articles.toLocaleString(), label: 'Articles Analyzed', icon: '📰' },
            { value: stats.sources.toString(), label: 'Live Sources', icon: '📡' },
            { value: stats.events.toLocaleString(), label: 'Events Detected', icon: '🎯' },
            { value: '24/7', label: 'AI Monitoring', icon: '🤖' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm backdrop-blur-sm dark:border-white/5 dark:bg-white/[0.03] dark:shadow-none"
            >
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</div>
              <div className="text-xs text-slate-500 dark:text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function NewsFeedSection({ articles, locale }: { articles: Article[]; locale: string }) {
  if (!articles.length) return null;

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Latest Intelligence</h2>
            <p className="text-slate-500 dark:text-gray-500 mt-1">Real-time news with AI sentiment analysis</p>
          </div>
          <Link
            href={`/${locale}/news`}
            className="text-sm text-orange-400 hover:text-orange-300 flex items-center gap-1 transition-colors"
          >
            All News
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {articles.slice(0, 8).map((article) => {
            const catColor = CATEGORY_COLORS[article.category] || CATEGORY_COLORS.general;
            const sent = SENTIMENT_ICONS[article.sentiment_label] || SENTIMENT_ICONS.neutral;

            return (
              <Link
                key={article.id}
                href={`/${locale}/news/${article.id}`}
                className="group flex gap-4 p-4 bg-slate-100 dark:bg-[#12121A] rounded-xl border border-slate-200 dark:border-white/5 hover:border-orange-500/20 transition-all"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                      style={{ color: catColor, backgroundColor: `${catColor}15` }}
                    >
                      {article.category}
                    </span>
                    <span className="text-[11px]" style={{ color: sent.color }}>
                      {sent.icon} {article.sentiment_label}
                    </span>
                    <span className="text-[11px] text-slate-600 dark:text-gray-600 ml-auto">{timeAgo(article.published_at)}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-orange-400 transition-colors line-clamp-2 leading-snug">
                    {article.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500 dark:text-gray-500">
                    <span>{article.source_name}</span>
                    <span>{article.view_count} views</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function TrendingSection({ topics }: { topics: TrendingTopic[] }) {
  if (!topics.length) return null;

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Trending Now</h2>
        <div className="flex flex-wrap gap-3">
          {topics.map((topic) => {
            const score = parseFloat(topic.sentiment_score);
            const borderColor = score > 0.2 ? 'border-green-500/30' : score < -0.2 ? 'border-red-500/30' : 'border-slate-300/80 dark:border-white/10';
            const textColor = score > 0.2 ? 'text-green-400' : score < -0.2 ? 'text-red-400' : 'text-slate-600 dark:text-gray-400';

            return (
              <div
                key={topic.id}
                className={`bg-slate-100 dark:bg-[#12121A] border ${borderColor} rounded-xl px-4 py-3 flex items-center gap-3`}
              >
                <span className="text-sm text-slate-900 dark:text-white font-medium">{topic.keyword}</span>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500 dark:text-gray-500">{topic.mention_count} mentions</span>
                  <span className={textColor}>
                    {score > 0 ? '+' : ''}{score.toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: '📡',
      title: 'Multi-Source Intelligence',
      desc: '90+ sources: Twitter, Telegram, RSS feeds from Reuters, Bloomberg, CNBC and more',
      color: 'from-blue-500/20 to-blue-600/5',
    },
    {
      icon: '🤖',
      title: 'AI Processing Pipeline',
      desc: 'Automatic classification, importance scoring, sentiment analysis, and event clustering',
      color: 'from-violet-500/20 to-violet-600/5',
    },
    {
      icon: '📈',
      title: 'Trading Signals',
      desc: '60+ keywords tracked: market crashes, rate decisions, sanctions, whale alerts, OSINT events',
      color: 'from-amber-500/20 to-amber-600/5',
    },
    {
      icon: '🔔',
      title: 'Instant Alerts',
      desc: 'Breaking news in under 90 seconds. Digests every 4h. Daily reports at 08:00 UTC',
      color: 'from-red-500/20 to-red-600/5',
    },
    {
      icon: '📊',
      title: 'Trend Detection',
      desc: 'Keyword spike detection, viral probability scoring, event lifecycle tracking',
      color: 'from-green-500/20 to-green-600/5',
    },
    {
      icon: '🌐',
      title: 'OSINT Coverage',
      desc: 'Military, geopolitical, cyber events from verified sources. Multi-language processing',
      color: 'from-cyan-500/20 to-cyan-600/5',
    },
  ];

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Intelligence Platform Features
          </h2>
          <p className="text-slate-500 dark:text-gray-500 mt-2 max-w-xl mx-auto">
            Institutional-grade news intelligence accessible to everyone
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className={`bg-gradient-to-br ${f.color} border border-slate-200 dark:border-white/5 rounded-2xl p-6 hover:border-slate-300/80 dark:border-white/10 transition-all`}
            >
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{f.title}</h3>
              <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      num: '01',
      title: 'AI Collects',
      desc: 'Our pipeline monitors 90+ sources — Twitter, Telegram, RSS feeds — every 60 seconds. Raw data flows into the processing engine.',
      icon: '📡',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      num: '02',
      title: 'AI Analyzes',
      desc: 'NLP classifies topics, scores importance (0-100), detects sentiment, clusters related articles into events, and identifies keyword spikes.',
      icon: '🧠',
      color: 'from-purple-500 to-violet-500',
    },
    {
      num: '03',
      title: 'Signals Generated',
      desc: 'Trading-relevant events trigger signals. 60+ keywords tracked across critical, high, and OSINT categories. Breaking news scored for urgency.',
      icon: '⚡',
      color: 'from-orange-500 to-amber-500',
    },
    {
      num: '04',
      title: 'You Get Alerted',
      desc: 'Signals reach you via Telegram in under 90 seconds. Digests every 4 hours. Daily reports at 08:00 UTC. Email newsletter weekly.',
      icon: '🔔',
      color: 'from-green-500 to-emerald-500',
    },
  ];

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">How It Works</h2>
          <p className="text-slate-500 dark:text-gray-500 mt-2 max-w-lg mx-auto">From raw data to actionable intelligence in under 90 seconds</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div key={step.num} className="relative">
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 right-0 translate-x-1/2 w-8 text-gray-700">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </div>
              )}
              <div className="bg-slate-100 dark:bg-[#12121A] border border-slate-200 dark:border-white/5 rounded-2xl p-6 h-full hover:border-slate-300/80 dark:border-white/10 transition-all">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center text-xl mb-4 shadow-lg`}>
                  {step.icon}
                </div>
                <div className="text-xs font-mono text-slate-600 dark:text-gray-600 mb-2">STEP {step.num}</div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Alex K.',
      role: 'Crypto Trader',
      text: 'The breaking news alerts are insanely fast. I got the ETF approval signal 2 minutes before it hit mainstream Twitter. Game changer for my trading.',
      rating: 5,
    },
    {
      name: 'Maria S.',
      role: 'DeFi Researcher',
      text: 'I use Tvijo\'s OSINT signals daily. The keyword spike detection caught a major protocol exploit before it was widely known. Saved me from a bad position.',
      rating: 5,
    },
    {
      name: 'Dmitry V.',
      role: 'Algorithmic Trader',
      text: 'The GOGA bot strategy presets are well-designed. I backtested all 8 strategies and deployed the Bollinger Bounce on demo — 15% return in 3 months.',
      rating: 4,
    },
    {
      name: 'James L.',
      role: 'Portfolio Manager',
      text: 'Finally a platform that combines news intelligence with trading tools. The Learn section helped my junior analysts understand on-chain analysis properly.',
      rating: 5,
    },
    {
      name: 'Sarah T.',
      role: 'Freelance Analyst',
      text: 'The daily reports at 08:00 UTC are my morning ritual. Concise, well-structured, and always highlight what actually matters for the markets.',
      rating: 5,
    },
    {
      name: 'Viktor P.',
      role: 'Swing Trader',
      text: 'Demo trading let me test strategies without risking real money. After 2 months of practice, I moved to live trading with confidence. The courses were a huge help.',
      rating: 4,
    },
  ];

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">What Traders Say</h2>
          <p className="text-slate-500 dark:text-gray-500 mt-2">Join thousands of traders using Tvijo daily</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="rounded-2xl border border-slate-200 bg-slate-100 p-6 transition-all hover:border-slate-300 dark:border-white/5 dark:bg-[#12121A] dark:hover:border-white/10"
            >
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <svg key={i} className={`w-4 h-4 ${i <= t.rating ? 'text-orange-400' : 'text-slate-300 dark:text-gray-700'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="mb-4 text-sm leading-relaxed text-slate-700 dark:text-gray-300">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-xs font-bold text-black">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-900 dark:text-white">{t.name}</div>
                  <div className="text-xs text-slate-500 dark:text-gray-500">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TelegramCTA() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-sky-50 via-white to-indigo-100 dark:border-white/5 dark:from-[#1A1A2E] dark:to-[#16162A]">
          <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-orange-500/10 blur-[100px] dark:bg-orange-500/10" />
          <div className="absolute bottom-0 left-0 h-60 w-60 rounded-full bg-blue-500/15 blur-[80px] dark:bg-blue-500/10" />

          <div className="relative p-8 text-center sm:p-12 lg:p-16">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/20">
              <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161l-1.97 9.287c-.146.658-.537.818-1.084.508l-3-2.211-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.935z"/>
              </svg>
            </div>

            <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
              Get Signals in Telegram
            </h2>
            <p className="mx-auto mb-8 max-w-lg leading-relaxed text-slate-600 dark:text-gray-400">
              Join <strong className="text-slate-900 dark:text-white">@bibadig</strong> for free real-time trading signals,
              breaking news alerts, market digests, and OSINT intelligence.
              No registration required.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://t.me/bibadig"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-8 py-3.5 bg-[#2AABEE] text-white font-semibold rounded-xl hover:bg-[#229ED9] transition-all shadow-lg shadow-blue-500/20"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161l-1.97 9.287c-.146.658-.537.818-1.084.508l-3-2.211-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.935z"/>
                </svg>
                Open @bibadig
              </a>
              <a
                href="https://t.me/bibanewsaibot"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-slate-600 transition-colors hover:text-orange-600 dark:text-gray-400 dark:hover:text-white"
              >
                or chat with AI Bot →
              </a>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 max-w-2xl mx-auto">
              {[
                { label: 'Trading Signals', detail: 'Every 2 min' },
                { label: 'Breaking News', detail: '< 90 sec' },
                { label: 'Market Digest', detail: 'Every 4h' },
                { label: 'Daily Report', detail: '08:00 UTC' },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <div className="text-sm font-medium text-slate-900 dark:text-white">{item.label}</div>
                  <div className="text-xs text-slate-500 dark:text-gray-500 mt-0.5">{item.detail}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/v1/newsletter/subscribe/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <section className="py-16 border-t border-slate-200 dark:border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto text-center">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Stay Updated</h3>
          <p className="text-sm text-slate-500 dark:text-gray-500 mb-6">
            Weekly digest of top market events and trading opportunities
          </p>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 rounded-lg border border-slate-300/80 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-orange-500/50 focus:outline-none dark:border-white/10 dark:bg-[#12121A] dark:text-white dark:placeholder:text-gray-500"
              required
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="px-6 py-2.5 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
              {status === 'loading' ? '...' : 'Subscribe'}
            </button>
          </form>
          {status === 'success' && (
            <p className="text-sm text-green-400 mt-3">Subscribed successfully!</p>
          )}
          {status === 'error' && (
            <p className="text-sm text-red-400 mt-3">Something went wrong. Try again.</p>
          )}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// Main Page
// ============================================================================

export default function HomePage() {
  const pathname = usePathname();
  const locale = pathname?.startsWith('/ru') ? 'ru' : 'en';

  const [articles, setArticles] = useState<Article[]>([]);
  const [trending, setTrending] = useState<TrendingTopic[]>([]);
  const [stats, setStats] = useState({ articles: 0, sources: 90, events: 0 });
  const [loaded, setLoaded] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [articlesData, trendingData, eventsData] = await Promise.all([
        apiFetch<PaginatedResponse<Article>>('/news/articles/?ordering=-published_at&page_size=8'),
        apiFetch<TrendingTopic[]>('/news/trending/?period=daily&limit=12'),
        apiFetch<{ count: number }>('/newsanalyzer/public/events/?hours=720').catch(() => ({ count: 0 })),
      ]);
      setArticles(articlesData.results || []);
      setTrending(trendingData || []);
      setStats((prev) => ({
        ...prev,
        articles: articlesData.count || prev.articles,
        events: eventsData.count || prev.events,
      }));
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, [loadData]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#0A0A0F] dark:text-white">
      <Navbar />
      <HeroSection locale={locale} stats={stats} />
      <HowItWorksSection />
      {loaded && <NewsFeedSection articles={articles} locale={locale} />}
      {loaded && <TrendingSection topics={trending} />}
      <FeaturesSection />
      <TestimonialsSection />
      <NewsletterSection />
      <Footer />
    </div>
  );
}
