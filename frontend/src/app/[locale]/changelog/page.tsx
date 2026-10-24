'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/portal/Navbar';
import Footer from '@/components/portal/Footer';
import LiveExtensionRelease from '@/components/kb/LiveExtensionRelease';
import { useStaffUser } from '@/hooks/useStaffUser';
import { parseLocale } from '@/i18n/config';

interface ChangelogEntry {
  version: string;
  date: string;
  type: 'major' | 'minor' | 'patch';
  changes: string[];
}

const CHANGELOG_DATA: ChangelogEntry[] = [
  {
    version: 'v2.8.0',
    date: '2026-05-30',
    type: 'major',
    changes: [
      'Launched the Decision Center (/decmap) — a hub for collective decision-making with public decision bundles, per-node voting and threaded discussion',
      'Added a community activity feed and live engagement stats (members, decisions, discussions, knowledge maps) on the homepage and user dashboard',
      'Seeded starter decision bundles on AI governance topics (agent prod-write access, model-spend caps, BYOK rotation)',
      'New user Dashboard (/dashboard) aggregating your bubbles, bundles, progress and community pulse',
      'Account menu with Sign in / Profile / Sign out across desktop and mobile',
      'Rebranded the platform fully to Tvijo: Tvijo Bubbles, Tvijo — Super Map, and all in-map copy',
    ],
  },
  {
    version: 'v2.7.0',
    date: '2026-05-29',
    type: 'major',
    changes: [
      'Investment Funds directory live with 403 funds, cross-linked with the startup Directory via Startups | Funds tabs',
      'Imported 18 knowledge bubbles and 6 decision bundles; made Knowledge Base public with sitemap + robots coverage',
      'Added English AI-OS courses to Learn: Budget Guards for Model Spend, BYOK Security, Building Decision Bundles',
      'Fixed ChunkLoadError after deploys (immutable static caching + auto-reload) and a 500 on every news article page (SSR loopback fix)',
      'Surfaced Bubbles, Bundles, Funds and the Decision Center in the public Explore navigation',
    ],
  },
  {
    version: 'v2.6.0',
    date: '2026-04-13',
    type: 'major',
    changes: [
      'Added Mind Maps gallery page and linked it across KB navigation',
      'Fixed article MindMap Mermaid generation for icon-based nodes',
      'Improved KB visual discovery flow between articles, mindmaps, DecMap, and Tvijo Bubbles',
      'Added backend automation jobs for hourly KB links snapshots and daily cron history maintenance',
    ],
  },
  {
    version: 'v2.5.0',
    date: '2026-04-06',
    type: 'major',
    changes: [
      'Added Knowledge Base (KB) with 17 articles and role-based targeting',
      'Implemented onboarding flow with 12 platform roles',
      'New Agent Control Panel for security monitoring',
      'Added Decision Map (DecMap) feature for guided AI prompts',
      'Tvijo Bubbles canvas-based physics visualization',
      'Multi-agent trading pipeline (Scout → Analytics → Risk)',
      '3-layer security system: Skill Guard + Execution Guard + Observer',
    ],
  },
  {
    version: 'v2.4.0',
    date: '2026-03-15',
    type: 'major',
    changes: [
      'Trading signals page with real-time agent data',
      'News Intelligence Admin panel (newsadmin)',
      'News parsing system with AI analysis',
      'Trending topics detection',
      'Newsletter subscription system',
    ],
  },
  {
    version: 'v2.3.0',
    date: '2026-02-28',
    type: 'major',
    changes: [
      'Go Goga Bot integration for Gate.io market data',
      'Enhanced market screener with NASDAQ data',
      'Strategy rating system',
      'User achievements and gamification',
    ],
  },
  {
    version: 'v2.2.0',
    date: '2026-02-10',
    type: 'minor',
    changes: [
      'Google OAuth authentication',
      'JWT-based auth system',
      'Profile page with user preferences',
      'Referral program foundation',
    ],
  },
  {
    version: 'v2.1.0',
    date: '2026-01-25',
    type: 'minor',
    changes: [
      'New frontend design system with Tailwind CSS',
      'Dark theme as default',
      'Improved navigation and mobile responsiveness',
      'SEO optimization for landing pages',
    ],
  },
  {
    version: 'v2.0.0',
    date: '2026-01-10',
    type: 'major',
    changes: [
      'Complete platform rewrite: Next.js 14 + Django 5.0',
      'Migrated from legacy architecture',
      'New API v1 with DRF',
      'Celery + Redis for async tasks',
      'PostgreSQL as primary database',
    ],
  },
  {
    version: 'v1.5.0',
    date: '2025-12-20',
    type: 'minor',
    changes: [
      'Beta news aggregation system',
      'Basic market data endpoints',
      'User registration and login',
      'Landing page v1',
    ],
  },
  {
    version: 'v1.2.0',
    date: '2025-12-01',
    type: 'minor',
    changes: [
      'Initial API prototypes',
      'Database schema design',
      'Docker containerization setup',
    ],
  },
  {
    version: 'v1.0.0',
    date: '2025-11-15',
    type: 'major',
    changes: [
      'Initial project launch',
      'Tvijo concept and domain registered',
      'First landing page deployed',
    ],
  },
];

function getVersionColor(type: string): string {
  switch (type) {
    case 'major':
      return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    case 'minor':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'patch':
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
}

function getTypeLabel(type: string): string {
  switch (type) {
    case 'major':
      return 'Major';
    case 'minor':
      return 'Minor';
    case 'patch':
      return 'Patch';
    default:
      return type;
  }
}

export default function ChangelogPage() {
  const pathname = usePathname() || '';
  const locale = parseLocale(pathname);
  const isStaff = useStaffUser();

  if (!isStaff) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
        <Navbar />
        <main className="mx-auto max-w-2xl px-4 pb-16 pt-28 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-400">
            Staff only
          </p>
          <h1 className="text-4xl font-black">{locale === 'ru' ? 'История платформы — для сотрудников' : 'Platform history is internal'}</h1>
          <p className="mt-4 text-gray-400">
            {locale === 'ru' ? 'История платформы доступна сотрудникам. Публичные выпуски расширения показаны ниже.' : 'Platform history is available to staff. Public extension releases are listed below.'}
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href={`/${locale}`}
              className="rounded-xl bg-emerald-400 px-6 py-3 text-sm font-semibold text-[#001b18] transition hover:bg-emerald-300"
            >
              Back to AI OS homepage
            </Link>
            <Link
              href={`/${locale}/faq`}
              className="rounded-xl border border-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Open FAQ
            </Link>
          </div>
          <LiveExtensionRelease locale={locale} />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 pt-24 pb-16">
        <section className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            Changelog
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Track all updates, improvements, and new features added to Tvijo platform.
          </p>
        </section>

        <LiveExtensionRelease locale={locale} />

        <section className="space-y-8">
          {CHANGELOG_DATA.map((entry) => (
            <div
              key={entry.version}
              className="relative pl-8 border-l-2 border-slate-700 last:border-l-0"
            >
              {/* Timeline dot */}
              <div className="absolute left-[-5px] top-0 w-2 h-2 rounded-full bg-emerald-400" />

              <div className="bg-slate-900/40 border border-slate-700/50 rounded-xl p-6 -mt-2">
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-xl font-bold text-white">{entry.version}</h2>
                  <span
                    className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getVersionColor(
                      entry.type
                    )}`}
                  >
                    {getTypeLabel(entry.type)}
                  </span>
                  <span className="text-sm text-gray-500 ml-auto">{entry.date}</span>
                </div>

                <ul className="space-y-2">
                  {entry.changes.map((change, changeIdx) => (
                    <li key={changeIdx} className="flex items-start gap-2 text-gray-300">
                      <span className="text-emerald-400 mt-1">•</span>
                      <span>{change}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </section>

        <section className="mt-16 text-center p-6 bg-slate-900/40 border border-slate-700/50 rounded-xl">
          <p className="text-gray-400 mb-4">
            Have a feature request or found a bug?
          </p>
          <a
            href="https://t.me/bibamon"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-400 hover:bg-emerald-300 text-[#001b18] font-semibold rounded-xl transition-colors"
          >
            Contact Us →
          </a>
        </section>
      </main>

      <Footer />
    </div>
  );
}
