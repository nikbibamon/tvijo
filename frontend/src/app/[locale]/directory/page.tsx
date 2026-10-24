'use client';

/**
 * Tvijo Directory — Company Catalog Page
 * Search, filter, and browse 12,000+ tech companies
 */

import { useEffect, useState, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/portal/Navbar';
import DirectoryTabs from '@/components/portal/DirectoryTabs';
import { useLocale } from '@/i18n/useLocale';

const API = process.env.NEXT_PUBLIC_API_URL || '';

interface Company {
  id: string;
  domain: string;
  name: string;
  slug: string;
  tagline: string;
  logo_url: string;
  country: string;
  city: string;
  cms: string;
  lead_score: number;
  tvijo_score: number;
  quadrant: string;
  review_count: number;
  avg_rating: number;
  has_email: boolean;
  has_phone: boolean;
  email_count: number;
  categories: string[];
  tier: string;
  is_verified: boolean;
  is_featured: boolean;
  payment_detected: boolean;
  tracking_detected: boolean;
  has_blog: boolean;
  news_mentions_count: number;
  github_url: string;
  github_stars_total: number;
  github_repos_count: number;
  github_score: number;
  github_top_languages: string[];
}

interface Stats {
  total_companies: number;
  total_with_email: number;
  total_with_phone: number;
  total_categories: number;
  avg_lead_score: number;
  top_cms: { cms: string; count: number }[];
  quadrant_distribution: Record<string, number>;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  company_count: number;
  children: Category[];
}

const QUADRANT_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  leader: { label: 'Leader', color: '#22C55E', icon: '👑' },
  contender: { label: 'Contender', color: '#3B82F6', icon: '🚀' },
  influencer: { label: 'Influencer', color: '#F59E0B', icon: '⭐' },
  achiever: { label: 'Achiever', color: '#8B5CF6', icon: '💎' },
  unranked: { label: 'Unranked', color: '#6B7280', icon: '—' },
};

function QuadrantBadge({ quadrant }: { quadrant: string }) {
  const q = QUADRANT_LABELS[quadrant] || QUADRANT_LABELS.unranked;
  return (
    <span
      className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide"
      style={{ color: q.color, backgroundColor: `${q.color}15`, border: `1px solid ${q.color}30` }}
    >
      {q.icon} {q.label}
    </span>
  );
}

function ScoreBar({ score, max = 100, color = '#F97316' }: { score: number; max?: number; color?: string }) {
  const pct = Math.min((score / max) * 100, 100);
  return (
    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden w-full">
      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  );
}

function CompanyCard({ company }: { company: Company }) {
  const { locale } = useLocale();
  const q = QUADRANT_LABELS[company.quadrant] || QUADRANT_LABELS.unranked;
  return (
    <Link
      href={`/${locale}/directory/${company.slug}`}
      className="group block bg-[#071d24]/80 rounded-xl border border-emerald-400/15 hover:border-emerald-400/30 transition-all p-5"
    >
      <div className="flex items-start gap-4">
        {/* Logo / Domain initial */}
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-400/20 to-emerald-600/5 border border-white/10 flex items-center justify-center text-lg font-bold text-emerald-400 shrink-0">
          {company.name?.charAt(0)?.toUpperCase() || company.domain.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors truncate">
              {company.name}
            </h3>
            {company.is_verified && <span className="text-blue-400 text-xs" title="Verified">✓</span>}
            {company.is_featured && <span className="text-yellow-400 text-xs" title="Featured">★</span>}
          </div>
          <p className="text-[11px] text-gray-500 truncate">{company.domain}</p>
        </div>
        <QuadrantBadge quadrant={company.quadrant} />
      </div>

      {/* Categories */}
      {company.categories.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {company.categories.slice(0, 3).map(cat => (
            <span key={cat} className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-gray-400">{cat}</span>
          ))}
        </div>
      )}

      {/* Scores row */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-gray-500">Tvijo Score</span>
            <span className="text-[10px] font-mono text-emerald-400">{company.tvijo_score.toFixed(0)}</span>
          </div>
          <ScoreBar score={company.tvijo_score} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-gray-500">Lead Score</span>
            <span className="text-[10px] font-mono text-emerald-400">{company.lead_score}</span>
          </div>
          <ScoreBar score={company.lead_score} color="#10B981" />
        </div>
        {company.github_score > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-gray-500">GitHub</span>
              <span className="text-[10px] font-mono text-purple-400">{company.github_score}</span>
            </div>
            <ScoreBar score={company.github_score} color="#A855F7" />
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-gray-500">Rating</span>
              <span className="text-[10px] font-mono text-yellow-400">
                {company.avg_rating > 0 ? `${company.avg_rating.toFixed(1)}★` : '—'}
              </span>
            </div>
            <ScoreBar score={company.avg_rating} max={5} color="#EAB308" />
          </div>
        )}
      </div>

      {/* Footer signals */}
      <div className="flex items-center gap-3 mt-3 text-[10px] text-gray-500">
        {company.cms && <span className="px-1.5 py-0.5 bg-white/5 rounded">{company.cms}</span>}
        {company.has_email && <span title="Has email">📧</span>}
        {company.has_phone && <span title="Has phone">📱</span>}
        {company.has_blog && <span title="Has blog">📝</span>}
        {company.github_stars_total > 0 && (
          <span className="flex items-center gap-0.5" title="GitHub stars">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 16 16"><path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z"/></svg>
            {company.github_stars_total.toLocaleString()}
          </span>
        )}
        {company.github_repos_count > 0 && (
          <span className="flex items-center gap-0.5" title="GitHub repos">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 16 16"><path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9z"/></svg>
            {company.github_repos_count}
          </span>
        )}
        {company.news_mentions_count > 0 && <span title="News mentions">📰 {company.news_mentions_count}</span>}
        <span className="ml-auto text-gray-600">{company.review_count} reviews</span>
      </div>
    </Link>
  );
}

function DirectoryPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [quadrant, setQuadrant] = useState(searchParams.get('quadrant') || '');
  const [cms, setCms] = useState(searchParams.get('cms') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [hasGithub, setHasGithub] = useState(searchParams.get('has_github') === 'true');
  const [sortBy, setSortBy] = useState(searchParams.get('ordering') || '-tvijo_score');

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ format: 'json', page: String(page), ordering: sortBy });
      if (search) params.set('search', search);
      if (quadrant) params.set('quadrant', quadrant);
      if (cms) params.set('cms', cms);
      if (category) params.set('category', category);
      if (hasGithub) params.set('github_score__gt', '0');
      
      const res = await fetch(`${API}/api/v1/directory/companies/?${params}`);
      const data = await res.json();
      setCompanies(data.results || []);
      setTotal(data.count || 0);
    } catch (e) {
      console.error('Failed to fetch companies:', e);
    }
    setLoading(false);
  }, [page, search, quadrant, cms, category, hasGithub, sortBy]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  useEffect(() => {
    // Fetch stats + categories once
    fetch(`${API}/api/v1/directory/companies/stats/?format=json`)
      .then(r => r.json()).then(setStats).catch(() => {});
    fetch(`${API}/api/v1/directory/categories/?format=json`)
      .then(r => r.json()).then(d => setCategories(d.results || d || [])).catch(() => {});
  }, []);

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="min-h-screen bg-[#0A0A12] text-white">
      <Navbar />
      {/* Hero */}
      <div className="border-b border-white/5 bg-gradient-to-b from-emerald-400/5 to-transparent pt-20">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <DirectoryTabs />
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Tvijo <span className="text-emerald-400">Directory</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl">
            Discover and compare {stats ? stats.total_companies.toLocaleString() : '12,000+'} tech companies.
            Scored by OSINT intelligence, GitHub activity, and market signals.
          </p>

          {/* Quick stats */}
          {stats && (
            <div className="flex flex-wrap gap-6 mt-6 text-sm">
              <div><span className="text-emerald-400 font-bold">{stats.total_companies.toLocaleString()}</span> <span className="text-gray-500">Companies</span></div>
              <div><span className="text-emerald-400 font-bold">{stats.total_with_email.toLocaleString()}</span> <span className="text-gray-500">With Email</span></div>
              <div><span className="text-blue-400 font-bold">{stats.total_categories}</span> <span className="text-gray-500">Categories</span></div>
              <div><span className="text-purple-400 font-bold">{stats.quadrant_distribution?.leader || 0}</span> <span className="text-gray-500">Leaders</span></div>
            </div>
          )}

          {/* Search bar */}
          <div className="mt-6 flex gap-3">
            <div className="relative flex-1 max-w-xl">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by company name, domain, or keywords..."
                className="w-full bg-[#071d24]/80 border border-emerald-400/15 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-emerald-400/50 focus:outline-none transition"
              />
            </div>
            <button
              onClick={() => fetchCompanies()}
              className="px-5 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-[#001b18] text-sm font-medium rounded-lg transition"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className="hidden lg:block w-64 shrink-0 space-y-6">
            {/* Sort */}
            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Sort By</h4>
              <select
                value={sortBy}
                onChange={e => { setSortBy(e.target.value); setPage(1); }}
                className="w-full bg-[#071d24]/80 border border-emerald-400/15 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-400/50 focus:outline-none"
              >
                <option value="-tvijo_score">Tvijo Score ↓</option>
                <option value="-lead_score">Lead Score ↓</option>
                <option value="-github_score">GitHub Score ↓</option>
                <option value="-review_count">Most Reviews</option>
                <option value="-news_mentions_count">Most News</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>

            {/* Quadrant */}
            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Quadrant</h4>
              <div className="space-y-1">
                {['', 'leader', 'contender', 'influencer', 'achiever'].map(q => (
                  <button
                    key={q}
                    onClick={() => { setQuadrant(q); setPage(1); }}
                    className={`block w-full text-left px-3 py-1.5 rounded-lg text-sm transition ${
                      quadrant === q ? 'bg-emerald-400/20 text-emerald-400' : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {q ? `${QUADRANT_LABELS[q].icon} ${QUADRANT_LABELS[q].label}` : 'All Quadrants'}
                  </button>
                ))}
              </div>
            </div>

            {/* CMS */}
            {stats?.top_cms && (
              <div>
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">CMS / Framework</h4>
                <div className="space-y-1">
                  <button
                    onClick={() => { setCms(''); setPage(1); }}
                    className={`block w-full text-left px-3 py-1.5 rounded-lg text-sm transition ${
                      cms === '' ? 'bg-emerald-400/20 text-emerald-400' : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    All CMS
                  </button>
                  {stats.top_cms.map(c => (
                    <button
                      key={c.cms}
                      onClick={() => { setCms(c.cms); setPage(1); }}
                      className={`flex w-full items-center justify-between px-3 py-1.5 rounded-lg text-sm transition ${
                        cms === c.cms ? 'bg-emerald-400/20 text-emerald-400' : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span>{c.cms}</span>
                      <span className="text-[10px] text-gray-600">{c.count}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* GitHub filter */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasGithub}
                  onChange={e => { setHasGithub(e.target.checked); setPage(1); }}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-emerald-400 focus:ring-emerald-400/50"
                />
                <span className="text-sm text-gray-400">Has GitHub activity</span>
              </label>
            </div>

            {/* Categories */}
            {categories.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Category</h4>
                <div className="space-y-1 max-h-64 overflow-y-auto pr-2">
                  <button
                    onClick={() => { setCategory(''); setPage(1); }}
                    className={`block w-full text-left px-3 py-1.5 rounded-lg text-sm transition ${
                      category === '' ? 'bg-emerald-400/20 text-emerald-400' : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.filter(c => c.company_count > 0).slice(0, 20).map(c => (
                    <button
                      key={c.slug}
                      onClick={() => { setCategory(c.slug); setPage(1); }}
                      className={`flex w-full items-center justify-between px-3 py-1.5 rounded-lg text-sm transition ${
                        category === c.slug ? 'bg-emerald-400/20 text-emerald-400' : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span className="truncate">{c.name}</span>
                      <span className="text-[10px] text-gray-600 shrink-0 ml-1">{c.company_count}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Results header */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-400">
                {total.toLocaleString()} companies found
                {search && <span> for &ldquo;<span className="text-emerald-400">{search}</span>&rdquo;</span>}
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                Page {page} of {totalPages || 1}
              </div>
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
              </div>
            )}

            {/* Company grid */}
            {!loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {companies.map(company => (
                  <CompanyCard key={company.id} company={company} />
                ))}
              </div>
            )}

            {!loading && companies.length === 0 && (
              <div className="text-center py-20 text-gray-500">
                <p className="text-lg mb-2">No companies found</p>
                <p className="text-sm">Try adjusting your search or filters</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg text-sm bg-white/5 text-gray-400 hover:bg-white/10 disabled:opacity-30 transition"
                >
                  ← Prev
                </button>
                {[...Array(Math.min(7, totalPages))].map((_, i) => {
                  let p: number;
                  if (totalPages <= 7) p = i + 1;
                  else if (page <= 4) p = i + 1;
                  else if (page >= totalPages - 3) p = totalPages - 6 + i;
                  else p = page - 3 + i;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-sm transition ${
                        page === p ? 'bg-emerald-400 text-[#001b18]' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 rounded-lg text-sm bg-white/5 text-gray-400 hover:bg-white/10 disabled:opacity-30 transition"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DirectoryPage() {
  return (
    <Suspense fallback={null}>
      <DirectoryPageInner />
    </Suspense>
  );
}
