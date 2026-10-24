'use client';

/**
 * Tvijo Directory — Company Profile Page
 * Full company details with GitHub analysis, OSINT signals, reviews
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Navbar from '@/components/portal/Navbar';
import EntityEngagement from '@/components/engagement/EntityEngagement';

const API = process.env.NEXT_PUBLIC_API_URL || '';

interface CompanyDetail {
  id: string;
  domain: string;
  name: string;
  slug: string;
  tagline: string;
  logo_url: string;
  description: string;
  keywords: string;
  country: string;
  city: string;
  employees_min: number | null;
  employees_max: number | null;
  founded_year: number | null;
  hourly_rate_min: number | null;
  hourly_rate_max: number | null;
  categories: { id: number; name: string; slug: string; is_primary: boolean }[];
  emails: string;
  email_list: string[];
  phones: string;
  contact_page_url: string;
  contact_form_url: string;
  telegram_urls: string;
  x_urls: string;
  linkedin_urls: string;
  facebook_urls: string;
  instagram_urls: string;
  youtube_urls: string;
  discord_urls: string;
  reddit_urls: string;
  linkedin_people: string;
  social_links_count: number;
  cms: string;
  tracking_detected: boolean;
  ads_detected: boolean;
  meta_pixel_detected: boolean;
  payment_detected: boolean;
  chat_detected: boolean;
  has_blog: boolean;
  has_signup: boolean;
  github_url: string;
  github_org: string;
  github_repos_count: number;
  github_stars_total: number;
  github_forks_total: number;
  github_contributors_count: number;
  github_top_languages: string[];
  github_last_push_at: string | null;
  github_profile_bio: string;
  github_score: number;
  lead_score: number;
  lead_score_reasons: string;
  core_competency_score: number;
  performance_360_score: number;
  tvijo_score: number;
  quadrant: string;
  review_count: number;
  avg_rating: number;
  news_mentions_count: number;
  news_sentiment: string;
  is_claimed: boolean;
  tier: string;
  is_verified: boolean;
  is_featured: boolean;
  recent_reviews: any[];
  recent_news: any[];
  created_at: string;
  updated_at: string;
  aios_metadata: Record<string, any>;
  aios_signals: Record<string, any>;
  source_quality: Record<string, any>;
  last_aios_sync_at: string | null;
}

const QUADRANT_CONFIG: Record<string, { label: string; color: string; icon: string; desc: string }> = {
  leader: { label: 'Leader', color: '#22C55E', icon: '👑', desc: 'High competency + high market performance' },
  contender: { label: 'Contender', color: '#3B82F6', icon: '🚀', desc: 'Growing market presence, building competency' },
  influencer: { label: 'Influencer', color: '#F59E0B', icon: '⭐', desc: 'Strong competency, expanding market reach' },
  achiever: { label: 'Achiever', color: '#8B5CF6', icon: '💎', desc: 'Emerging company with growth potential' },
  unranked: { label: 'Unranked', color: '#6B7280', icon: '—', desc: 'Not yet ranked' },
};

const LANG_COLORS: Record<string, string> = {
  JavaScript: '#F7DF1E', TypeScript: '#3178C6', Python: '#3776AB', Java: '#ED8B00',
  Go: '#00ADD8', Rust: '#CE412B', Ruby: '#CC342D', PHP: '#777BB4', C: '#555555',
  'C++': '#00599C', 'C#': '#239120', Swift: '#FA7343', Kotlin: '#7F52FF',
  Dart: '#0175C2', Scala: '#DC322F', HTML: '#E34F26', CSS: '#1572B6',
  Shell: '#89E051', Lua: '#000080', R: '#276DC3', Vue: '#4FC08D',
};

function ScoreGauge({ label, score, max = 100, color }: { label: string; score: number; max?: number; color: string }) {
  const pct = Math.min((score / max) * 100, 100);
  return (
    <div className="text-center">
      <div className="relative w-20 h-20 mx-auto">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
          <circle
            cx="18" cy="18" r="15.9" fill="none" stroke={color} strokeWidth="3"
            strokeDasharray={`${pct} ${100 - pct}`} strokeLinecap="round"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-base font-bold" style={{ color }}>
          {score.toFixed(0)}
        </span>
      </div>
      <p className="text-[11px] text-gray-400 mt-1.5">{label}</p>
    </div>
  );
}

function SocialLink({ url, label, icon }: { url: string; label: string; icon: string }) {
  if (!url) return null;
  const firstUrl = url.split(';')[0].split(',')[0].trim();
  if (!firstUrl) return null;
  const href = firstUrl.startsWith('http') ? firstUrl : `https://${firstUrl}`;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
       className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-300 hover:text-white transition">
      <span>{icon}</span> {label}
    </a>
  );
}

function TechSignalBadge({ active, label, icon }: { active: boolean; label: string; icon: string }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
      active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-gray-600'
    }`}>
      <span>{icon}</span> {label}
    </div>
  );
}

function getAiReadinessSignals(company: CompanyDetail) {
  const activeSignals = [
    company.cms ? `CMS detected: ${company.cms}` : null,
    company.tracking_detected ? 'Analytics detected' : null,
    company.ads_detected ? 'Ads detected' : null,
    company.payment_detected ? 'Payments detected' : null,
    company.chat_detected ? 'Live chat detected' : null,
    company.has_blog ? 'Blog/content workflow' : null,
    company.has_signup ? 'Sign-up form' : null,
    company.github_score > 0 ? 'GitHub active' : null,
    company.contact_page_url ? 'Contact page' : null,
    company.lead_score ? `Lead score ${company.lead_score}` : null,
    company.core_competency_score ? `Core competency ${company.core_competency_score}` : null,
  ].filter(Boolean) as string[];

  const riskPoints = [
    company.payment_detected,
    company.has_signup,
    company.chat_detected,
    company.tracking_detected,
    company.github_score > 0,
    company.contact_form_url || company.contact_page_url,
  ].filter(Boolean).length;

  const grade = riskPoints >= 5 ? 'D' : riskPoints >= 3 ? 'C' : riskPoints >= 1 ? 'B' : 'A';

  return { activeSignals, grade };
}

function AiosClaimBlock({ company, slug, locale }: { company: CompanyDetail; slug: string; locale: string }) {
  const claimHref = `/${locale}/directory/${slug}/claim`;
  const readinessHref = '#ai-readiness';

  if (company.is_claimed || company.is_verified) {
    return (
      <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">Verified company workspace</p>
        <h2 className="mt-2 text-xl font-bold text-white">Connect this profile to TVIJO AI OS</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-emerald-50/80">
          This domain can use TVIJO AI OS to control prompts, model keys, budgets and audit evidence.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Link href={`/${locale}/demo`} className="rounded-xl bg-emerald-400 px-4 py-2.5 text-center text-sm font-semibold text-slate-950">
            Open AI OS Workspace
          </Link>
          <a href={readinessHref} className="rounded-xl border border-emerald-300/30 px-4 py-2.5 text-center text-sm font-semibold text-white">
            Run Audit
          </a>
          <Link href={`/${locale}/directory/${slug}/verify`} className="rounded-xl border border-emerald-300/30 px-4 py-2.5 text-center text-sm font-semibold text-white">
            Configure API Gateway
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">TVIJO AI OS onboarding</p>
      <h2 className="mt-2 text-xl font-bold text-white">Own this domain?</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-emerald-50/80">
        Claim this profile and run an AI readiness audit for your company. Domain ownership must be verified before a workspace is activated.
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <Link href={claimHref} className="rounded-xl bg-emerald-400 px-4 py-2.5 text-center text-sm font-semibold text-[#001b18] hover:bg-emerald-300">
          Claim & Verify Domain
        </Link>
        <a href={readinessHref} className="rounded-xl border border-emerald-300/30 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-emerald-400/10">
          Preview AI Risk Report
        </a>
      </div>
    </div>
  );
}



function AiosEvidencePanel({ company }: { company: CompanyDetail }) {
  const m = company.aios_metadata || {};
  const s = company.aios_signals || {};
  const q = company.source_quality || {};

  const items = [
    { label: 'Last AIOS Sync', value: company.last_aios_sync_at || '—' },
    { label: 'AIOS Last Enriched', value: m.last_enriched_at || '—' },
    { label: 'AIOS Last Visited', value: m.last_visited_at || '—' },
    { label: 'Source Updated', value: m.updated_at || '—' },
    { label: 'Seedtable Score', value: String(s.seedtable_score ?? '—') },
    { label: 'Comp2 Lead', value: String(s.comp2_lead_score ?? '—') },
    { label: 'Has Contacts', value: q.has_contacts ? 'yes' : 'no' },
    { label: 'Has Description', value: q.has_description ? 'yes' : 'no' },
  ];

  return (
    <div className="bg-[#071d24]/80 rounded-xl border border-emerald-400/15 p-6">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">AI OS Evidence</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        {items.map((it) => (
          <div key={it.label} className="rounded-lg border border-white/5 bg-white/5 px-3 py-2">
            <p className="text-[11px] uppercase tracking-wide text-gray-500">{it.label}</p>
            <p className="text-gray-200 mt-1 break-all">{it.value || '—'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AiReadinessPanel({ company }: { company: CompanyDetail }) {
  const { activeSignals, grade } = getAiReadinessSignals(company);
  const likelyRisks = [
    company.payment_detected || company.has_signup ? 'Likely customer data risk from payments or sign-up flows.' : 'Customer data exposure appears limited from public signals.',
    company.github_score > 0 ? 'Likely developer AI adoption due to active GitHub signals.' : 'Developer AI adoption is not visible from public GitHub signals.',
    company.chat_detected || company.has_blog ? 'Likely support or marketing AI workflow opportunity.' : 'Support and marketing workflow signals are not strongly visible.',
  ];

  return (
    <div id="ai-readiness" className="bg-[#071d24]/80 rounded-xl border border-emerald-400/20 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">AI Control Gap Report</p>
          <h3 className="mt-2 text-lg font-bold text-white">Directory signals translated into AI OS controls</h3>
          <p className="mt-2 text-sm leading-6 text-gray-400">
            This is a directional, frontend-only prefill based on public profile data. Verification and production controls require backend implementation.
          </p>
        </div>
        <div className="rounded-2xl bg-emerald-400/10 px-5 py-4 text-center">
          <p className="text-xs text-emerald-200">AI Control Gap Score</p>
          <p className="mt-1 text-4xl font-bold text-emerald-300">{grade}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        {likelyRisks.map((risk) => (
          <div key={risk} className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-gray-300">
            {risk}
          </div>
        ))}
      </div>

      <div className="mt-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Detected signals</p>
        <div className="flex flex-wrap gap-2">
          {activeSignals.slice(0, 14).map((signal) => (
            <span key={signal} className="rounded-full bg-white/5 px-3 py-1 text-xs text-gray-300">{signal}</span>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Recommended controls</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {['Audit Trail', 'PII Guard', 'Budget Guard', 'BYOK', 'Model Router', 'Access Policy'].map((control) => (
            <span key={control} className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-100">{control}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function GitHubSection({ company }: { company: CompanyDetail }) {
  if (!company.github_org && company.github_score === 0) return null;

  const daysSinceLastPush = company.github_last_push_at
    ? Math.floor((Date.now() - new Date(company.github_last_push_at).getTime()) / 86400000)
    : null;

  return (
    <div className="bg-[#071d24]/80 rounded-xl border border-emerald-400/15 p-6">
      <div className="flex items-center gap-3 mb-5">
        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 16 16">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
        </svg>
        <h3 className="text-lg font-bold text-white">GitHub Activity</h3>
        {company.github_url && (
          <a href={company.github_url} target="_blank" rel="noopener noreferrer"
             className="ml-auto text-sm text-emerald-400 hover:text-emerald-300 transition">
            @{company.github_org} →
          </a>
        )}
      </div>

      {company.github_profile_bio && (
        <p className="text-sm text-gray-400 mb-4">{company.github_profile_bio}</p>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <p className="text-xl font-bold text-white">{company.github_repos_count.toLocaleString()}</p>
          <p className="text-[11px] text-gray-500 mt-0.5">Repositories</p>
        </div>
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <p className="text-xl font-bold text-yellow-400">{company.github_stars_total.toLocaleString()}</p>
          <p className="text-[11px] text-gray-500 mt-0.5">Stars</p>
        </div>
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <p className="text-xl font-bold text-blue-400">{company.github_forks_total.toLocaleString()}</p>
          <p className="text-[11px] text-gray-500 mt-0.5">Forks</p>
        </div>
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <p className="text-xl font-bold text-purple-400">{company.github_score}</p>
          <p className="text-[11px] text-gray-500 mt-0.5">GitHub Score</p>
        </div>
      </div>

      {/* Languages */}
      {company.github_top_languages.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-2">Top Languages</p>
          <div className="flex flex-wrap gap-2">
            {company.github_top_languages.map(lang => (
              <span key={lang} className="flex items-center gap-1.5 text-xs px-2.5 py-1 bg-white/5 rounded-full text-gray-300">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: LANG_COLORS[lang] || '#6B7280' }} />
                {lang}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Last activity */}
      {daysSinceLastPush !== null && (
        <p className="text-xs text-gray-500 mt-3">
          Last push: {daysSinceLastPush === 0 ? 'Today' : daysSinceLastPush === 1 ? 'Yesterday' : `${daysSinceLastPush} days ago`}
          {daysSinceLastPush < 7 && <span className="ml-2 text-emerald-400">● Active</span>}
          {daysSinceLastPush >= 7 && daysSinceLastPush < 90 && <span className="ml-2 text-yellow-400">● Moderate</span>}
          {daysSinceLastPush >= 90 && <span className="ml-2 text-gray-600">● Inactive</span>}
        </p>
      )}
    </div>
  );
}

export default function CompanyProfilePage() {
  const params = useParams();
  const slug = params.slug as string;
  const locale = (params.locale as string) || 'en';
  const [company, setCompany] = useState<CompanyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`${API}/api/v1/directory/companies/${slug}/?format=json`)
      .then(r => {
        if (!r.ok) throw new Error('Company not found');
        return r.json();
      })
      .then(setCompany)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A12] text-white">
        <Navbar />
        <div className="flex min-h-screen items-center justify-center pt-20">
          <div className="w-10 h-10 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen bg-[#0A0A12] text-white">
        <Navbar />
        <div className="flex min-h-screen items-center justify-center pt-20 text-center">
          <div>
            <p className="text-2xl text-white mb-2">Company not found</p>
            <Link href={`/${locale}/directory`} className="text-emerald-400 hover:text-emerald-300 text-sm">← Back to directory</Link>
          </div>
        </div>
      </div>
    );
  }

  const q = QUADRANT_CONFIG[company.quadrant] || QUADRANT_CONFIG.unranked;

  return (
    <div className="min-h-screen bg-[#0A0A12] text-white">
      <Navbar />
      {/* Breadcrumb */}
      <div className="border-b border-white/5 pt-20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-2 text-xs text-gray-500">
          <Link href={`/${locale}/directory`} className="hover:text-emerald-400 transition">Directory</Link>
          <span>/</span>
          <span className="text-gray-300">{company.name}</span>
        </div>
      </div>

      {/* Header */}
      <div className="border-b border-white/5 bg-gradient-to-b from-emerald-400/5 to-transparent">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-400/20 to-emerald-600/5 border border-white/10 flex items-center justify-center text-2xl font-bold text-emerald-400 shrink-0">
              {company.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl md:text-3xl font-bold">{company.name}</h1>
                {company.is_verified && <span className="text-blue-400 text-lg" title="Verified">✓</span>}
                <span className="text-sm px-3 py-0.5 rounded-full font-semibold"
                      style={{ color: q.color, backgroundColor: `${q.color}15`, border: `1px solid ${q.color}30` }}>
                  {q.icon} {q.label}
                </span>
              </div>
              <p className="text-gray-400">
                <a href={`https://${company.domain}`} target="_blank" rel="noopener noreferrer"
                   className="hover:text-emerald-400 transition">{company.domain} ↗</a>
                {company.city && company.country && <span className="ml-3">📍 {company.city}, {company.country}</span>}
                {!company.city && company.country && <span className="ml-3">📍 {company.country}</span>}
              </p>
              {company.tagline && <p className="text-gray-300 mt-2 text-sm">{company.tagline}</p>}

              {/* Categories */}
              {company.categories.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {company.categories.map(cat => (
                    <Link key={cat.slug} href={`/${locale}/directory?category=${cat.slug}`}
                          className={`text-xs px-2.5 py-1 rounded-full transition ${
                            cat.is_primary
                              ? 'bg-emerald-400/20 text-emerald-400 border border-emerald-400/30'
                              : 'bg-white/5 text-gray-400 hover:text-white'
                          }`}>
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <AiosClaimBlock company={company} slug={slug} locale={locale} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content - 2 cols */}
          <div className="lg:col-span-2 space-y-6 mt-6">
            {/* Score gauges */}
            <div className="bg-[#071d24]/80 rounded-xl border border-emerald-400/15 p-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Leaders Matrix Scores</h3>
              <div className="flex items-center justify-around">
                <ScoreGauge label="Tvijo Score" score={company.tvijo_score} color="#F97316" />
                <ScoreGauge label="Core Competency" score={company.core_competency_score} color="#3B82F6" />
                <ScoreGauge label="360° Performance" score={company.performance_360_score} color="#22C55E" />
                <ScoreGauge label="Lead Score" score={company.lead_score} color="#10B981" />
                {company.github_score > 0 && (
                  <ScoreGauge label="GitHub Score" score={company.github_score} color="#A855F7" />
                )}
              </div>
              <p className="text-center text-xs text-gray-500 mt-4">{q.desc}</p>
            </div>

            {/* GitHub Section */}
            <GitHubSection company={company} />

            {/* Description */}
            {company.description && (
              <div className="bg-[#071d24]/80 rounded-xl border border-emerald-400/15 p-6">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">About</h3>
                <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">{company.description}</p>
              </div>
            )}

            <AiosEvidencePanel company={company} />

            {/* Tech Signals */}
            <div className="bg-[#071d24]/80 rounded-xl border border-emerald-400/15 p-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Tech & Signal Analysis</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {company.cms && <TechSignalBadge active={true} label={`CMS: ${company.cms}`} icon="🔧" />}
                <TechSignalBadge active={company.tracking_detected} label="Analytics" icon="📊" />
                <TechSignalBadge active={company.ads_detected} label="Ads Detected" icon="📢" />
                <TechSignalBadge active={company.meta_pixel_detected} label="Meta Pixel" icon="👁" />
                <TechSignalBadge active={company.payment_detected} label="Payments" icon="💳" />
                <TechSignalBadge active={company.chat_detected} label="Live Chat" icon="💬" />
                <TechSignalBadge active={company.has_blog} label="Blog" icon="📝" />
                <TechSignalBadge active={company.has_signup} label="Sign-up Form" icon="✍️" />
                <TechSignalBadge active={company.github_score > 0} label="GitHub Active" icon="🐙" />
              </div>
              {company.lead_score_reasons && (
                <p className="text-xs text-gray-500 mt-3">Score factors: {company.lead_score_reasons}</p>
              )}
            </div>

            <AiReadinessPanel company={company} />

            {/* News mentions */}
            {company.recent_news && company.recent_news.length > 0 && (
              <div className="bg-[#071d24]/80 rounded-xl border border-emerald-400/15 p-6">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                  OSINT News Mentions <span className="text-emerald-400 ml-1">({company.news_mentions_count})</span>
                </h3>
                <div className="space-y-3">
                  {company.recent_news.map((news: any, i: number) => (
                    <a key={i} href={news.url} target="_blank" rel="noopener noreferrer"
                       className="block p-3 bg-white/5 rounded-lg hover:bg-white/10 transition">
                      <p className="text-sm text-white font-medium">{news.title}</p>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-500">
                        <span>{news.source_name}</span>
                        <span>{new Date(news.published_at).toLocaleDateString()}</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            {company.recent_reviews && company.recent_reviews.length > 0 && (
              <div className="bg-[#071d24]/80 rounded-xl border border-emerald-400/15 p-6">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                  Reviews <span className="text-emerald-400 ml-1">({company.review_count})</span>
                </h3>
                <div className="space-y-4">
                  {company.recent_reviews.map((review: any, i: number) => (
                    <div key={i} className="p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-yellow-400 text-sm">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                        <span className="text-xs text-gray-500">{new Date(review.created_at).toLocaleDateString()}</span>
                      </div>
                      {review.title && <p className="text-sm font-semibold text-white mb-1">{review.title}</p>}
                      <p className="text-sm text-gray-400">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <EntityEngagement targetType="company" targetId={slug} title="Community discussion" />
          </div>

          {/* Sidebar - 1 col */}
          <div className="space-y-6 mt-6">
            {/* Quick info card */}
            <div className="bg-[#071d24]/80 rounded-xl border border-emerald-400/15 p-5">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Company Info</h3>
              <div className="space-y-3 text-sm">
                {(company.employees_min || company.employees_max) && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Employees</span>
                    <span className="text-white">{company.employees_min || '?'}–{company.employees_max || '?'}</span>
                  </div>
                )}
                {company.founded_year && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Founded</span>
                    <span className="text-white">{company.founded_year}</span>
                  </div>
                )}
                {(company.hourly_rate_min || company.hourly_rate_max) && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Hourly Rate</span>
                    <span className="text-white">${company.hourly_rate_min || '?'}–${company.hourly_rate_max || '?'}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Tier</span>
                  <span className={`font-semibold ${company.tier === 'sponsor' ? 'text-yellow-400' : company.tier === 'pro_plus' ? 'text-purple-400' : company.tier === 'pro' ? 'text-blue-400' : 'text-gray-400'}`}>
                    {company.tier === 'free' ? 'Free' : company.tier === 'pro' ? 'Pro' : company.tier === 'pro_plus' ? 'Pro+' : 'Sponsor'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Reviews</span>
                  <span className="text-white">{company.review_count} ({company.avg_rating > 0 ? `${company.avg_rating.toFixed(1)}★` : 'No ratings'})</span>
                </div>
                {company.cms && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">CMS</span>
                    <span className="text-white">{company.cms}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Claimed</span>
                  <span className={company.is_claimed ? 'text-emerald-400' : 'text-gray-600'}>{company.is_claimed ? 'Yes' : 'No'}</span>
                </div>
              </div>

              {!company.is_claimed && (
                <Link
                  href={`/${locale}/directory/${slug}/claim`}
                  className="block w-full mt-4 px-4 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-[#001b18] text-sm font-medium rounded-lg text-center transition"
                >
                  Claim & Verify Domain
                </Link>
              )}
            </div>

            <div className="bg-[#071d24]/80 rounded-xl border border-emerald-400/20 p-5">
              <h3 className="text-sm font-semibold text-emerald-300 uppercase tracking-wider mb-3">AI OS next step</h3>
              <p className="text-sm leading-6 text-gray-400">
                Verified owners can create an organization, project, gateway placeholder and risk-audit report for this domain.
              </p>
              <Link
                href={`/${locale}/directory/${slug}/verify`}
                className="mt-4 block rounded-lg border border-emerald-400/30 px-4 py-2.5 text-center text-sm font-semibold text-emerald-100 hover:bg-emerald-400/10"
              >
                View verification methods
              </Link>
            </div>

            {/* Contact */}
            <div className="bg-[#071d24]/80 rounded-xl border border-emerald-400/15 p-5">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Contact</h3>
              <div className="space-y-2">
                {company.email_list.length > 0 && (
                  <div className="text-sm">
                    <p className="text-gray-500 text-xs mb-1">Email</p>
                    {company.email_list.slice(0, 3).map(email => (
                      <a key={email} href={`mailto:${email}`}
                         className="block text-emerald-400 hover:text-emerald-300 truncate transition">{email}</a>
                    ))}
                  </div>
                )}
                {company.phones && (
                  <div className="text-sm">
                    <p className="text-gray-500 text-xs mb-1">Phone</p>
                    <p className="text-gray-300">{company.phones.split(';')[0]}</p>
                  </div>
                )}
                {company.contact_page_url && (
                  <a href={company.contact_page_url} target="_blank" rel="noopener noreferrer"
                     className="block text-sm text-emerald-400 hover:text-emerald-300 transition">Contact Page →</a>
                )}
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-[#071d24]/80 rounded-xl border border-emerald-400/15 p-5">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                Social ({company.social_links_count})
              </h3>
              <div className="space-y-2">
                <SocialLink url={company.linkedin_urls} label="LinkedIn" icon="🔗" />
                <SocialLink url={company.x_urls} label="X / Twitter" icon="𝕏" />
                <SocialLink url={company.github_url || ''} label="GitHub" icon="🐙" />
                <SocialLink url={company.telegram_urls} label="Telegram" icon="✈️" />
                <SocialLink url={company.facebook_urls} label="Facebook" icon="📘" />
                <SocialLink url={company.instagram_urls} label="Instagram" icon="📷" />
                <SocialLink url={company.youtube_urls} label="YouTube" icon="▶️" />
                <SocialLink url={company.discord_urls} label="Discord" icon="🎮" />
                <SocialLink url={company.reddit_urls} label="Reddit" icon="🤖" />
              </div>
            </div>

            {/* Keywords */}
            {company.keywords && (
              <div className="bg-[#071d24]/80 rounded-xl border border-emerald-400/15 p-5">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Keywords</h3>
                <div className="flex flex-wrap gap-1.5">
                  {company.keywords.split(',').slice(0, 20).map((kw, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 bg-white/5 rounded text-gray-400">{kw.trim()}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
