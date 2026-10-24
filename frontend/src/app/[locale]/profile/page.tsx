'use client';
import { useEffect, useState, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/portal/Navbar';
import Footer from '@/components/portal/Footer';
import { portalApiFetch } from '@/lib/portal-auth-fetch';
import { kbArticlesApi } from '@/services/kb-api';
import { editorApi } from '@/services/editor-api';
import { parseLocale } from '@/i18n/config';

interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  bio: string;
  avatar: string;
  website: string;
  location: string;
  locale: string;
  experience_level: string;
  trading_interests: string[];
  level: number;
  experience: number;
  is_staff: boolean;
  is_superuser?: boolean;
  date_joined: string;
  platform_role: string;
  trader_level: string;
  tech_level: string;
  monthly_income: string;
  onboarding_completed: boolean;
}
interface XPProgress { xp_current_level: number; xp_needed: number; xp_to_next_level: number; progress_percent: number; }
interface GamStats { level: number; experience: number; level_title: string; xp_progress: XPProgress; total_activities: number; articles_read: number; comments_posted: number; shares_made: number; current_streak: number; longest_streak: number; badges: { id: number; badge: { name: string; slug: string; description: string; icon: string; tier: string }; earned_at: string }[]; recent_activities: { id: number; activity_type: string; xp_earned: number; created_at: string }[]; }

const TIER_C: Record<string, string> = { common: 'text-gray-400 border-gray-500/20 bg-gray-500/10', rare: 'text-blue-400 border-blue-500/20 bg-blue-500/10', epic: 'text-purple-400 border-purple-500/20 bg-purple-500/10', legendary: 'text-orange-400 border-orange-500/20 bg-orange-500/10' };
const ACT_M: Record<string, { l: string; i: string }> = { article_read: { l: 'Read Article', i: '📰' }, article_completed: { l: 'Completed Article', i: '✅' }, comment_posted: { l: 'Posted Comment', i: '💬' }, share: { l: 'Shared', i: '🔗' }, login: { l: 'Daily Login', i: '📅' }, daily_login: { l: 'Daily Login', i: '📅' }, profile_updated: { l: 'Profile Updated', i: '👤' }, newsletter_subscribed: { l: 'Subscribed', i: '📧' }, streak_7_days: { l: '7-Day Streak', i: '🔥' }, streak_30_days: { l: '30-Day Streak', i: '⚡' } };
/** Must match `User.EXPERIENCE_CHOICES` on the API (no blank; no legacy "expert"). */
const EXP_LEVELS = ['', 'beginner', 'intermediate', 'advanced'];
const INTERESTS = ['stocks', 'crypto', 'forex', 'commodities', 'etf', 'bonds', 'business', 'technology'];
const ROLE_OPTIONS = [['','Select...'],['trader','Trader'],['investor','Investor'],['manager','Manager / PM'],['devops','DevOps'],['boss','CEO / Founder'],['designer','UI/UX Designer'],['admin_mod','Admin / Moderator'],['architect','Software Architect'],['developer','Developer'],['data_analyst','Data Analyst'],['qa','QA Engineer'],['content','Content Creator']];
const TRADER_LEVEL_OPTIONS = [['','Select...'],['newbie','Beginner (< 1y)'],['middle','Intermediate (1-3y)'],['pro','Advanced (3-5y)'],['expert','Expert (5+y)']];
const TECH_LEVEL_OPTIONS = [['','Select...'],['junior','Junior'],['middle','Middle'],['senior','Senior'],['lead','Lead / Principal']];
const INCOME_OPTIONS = [['','Select...'],['<10k','Up to $10K/mo'],['10k-100k','$10K—$100K/mo'],['100k-1m','$100K—$1M/mo'],['>1m','$1M+/mo']];
const ROLE_ICONS: Record<string, string> = { trader:'📈', investor:'💰', manager:'📋', devops:'⚙️', boss:'👔', designer:'🎨', admin_mod:'🛡️', architect:'🏗️', developer:'💻', data_analyst:'📊', qa:'✅', content:'✍️' };
function tAgo(d: string) { const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000); if (m < 1) return 'just now'; if (m < 60) return `${m}m ago`; const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`; return `${Math.floor(h / 24)}d ago`; }

export default function ProfilePage() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = parseLocale(pathname);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<GamStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'overview' | 'edit' | 'badges' | 'activity' | 'staff'>('overview');
  const [form, setForm] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [authoredCount, setAuthoredCount] = useState<number>(0);
  const [aiJobsCount, setAiJobsCount] = useState<number>(0);
  const [vizCandidates, setVizCandidates] = useState<{
    count: number;
    sample_slugs: string[];
    sample_titles?: string[];
  } | null>(null);
  const [vizBackfillBusy, setVizBackfillBusy] = useState(false);
  const [vizBackfillNote, setVizBackfillNote] = useState('');
  const [vizLimit, setVizLimit] = useState('25');
  const [vizEnsureBubbles, setVizEnsureBubbles] = useState(true);
  const [vizSetAuto, setVizSetAuto] = useState(true);
  const [vizUseAsync, setVizUseAsync] = useState(true);

  const load = useCallback(async () => {
    try {
      const [p, s] = await Promise.all([portalApiFetch<UserProfile>('/auth/me/'), portalApiFetch<GamStats>('/gamification/stats/').catch(() => null)]);
      setProfile(p); setStats(s);
      setForm({
        first_name: p.first_name || '',
        last_name: p.last_name || '',
        bio: p.bio || '',
        avatar: p.avatar || '',
        website: p.website || '',
        location: p.location || '',
        locale: p.locale || 'en',
        experience_level: p.experience_level === 'expert' ? 'advanced' : p.experience_level || '',
        trading_interests: p.trading_interests || [],
        platform_role: (p as any).platform_role || '',
        trader_level: (p as any).trader_level || '',
        tech_level: (p as any).tech_level || '',
        monthly_income: (p as any).monthly_income || '',
      });
      try {
        const editorStats = await editorApi.getStats();
        setAiJobsCount(editorStats.total_jobs || 0);
      } catch {
        setAiJobsCount(0);
      }
      if (p.is_staff || p.is_superuser) {
        try {
          const authored = await kbArticlesApi.list({ author_me: 'true', sort: 'updated' });
          setAuthoredCount(Array.isArray(authored) ? authored.length : 0);
        } catch {
          setAuthoredCount(0);
        }
      }
    } catch { router.push(`/${locale}/login`); return; }
    setLoading(false);
  }, [locale, router]);

  useEffect(() => { if (!localStorage.getItem('access_token')) { router.push(`/${locale}/login`); return; } load(); }, [load, locale, router]);

  const save = async () => {
    setSaving(true); setMsg('');
    try {
      const payload: Record<string, unknown> = { ...form };
      for (const k of ['experience_level', 'platform_role', 'trader_level', 'tech_level', 'monthly_income'] as const) {
        if (payload[k] === '') delete payload[k];
      }
      await portalApiFetch('/auth/me/', { method: 'PATCH', body: JSON.stringify(payload) });
      const u = await portalApiFetch<UserProfile>('/auth/me/');
      setProfile(u);
      setMsg('✓ Saved!');
    } catch {
      setMsg('✗ Failed');
    }
    setSaving(false);
  };

  const staffTools = profile?.is_staff || profile?.is_superuser;

  const loadVizCandidates = async () => {
    setVizBackfillBusy(true);
    setVizBackfillNote('');
    try {
      const q = new URLSearchParams();
      if (vizLimit.trim()) q.set('limit', vizLimit.trim());
      if (vizEnsureBubbles) q.set('ensure_bubbles', 'true');
      q.set('order', 'updated');
      q.set('scan_limit', '12000');
      const data = await portalApiFetch<{
        ok?: boolean;
        count: number;
        sample_slugs: string[];
        sample_titles?: string[];
        rows_scanned?: number;
        scan_limit?: number;
        truncated_scan?: boolean;
        note?: string;
      }>(`/knowledge/staff/kb-viz/candidates/?${q.toString()}`);
      setVizCandidates(data);
      let note = `Кандидатов к догону: ${data.count}`;
      if (typeof data.rows_scanned === 'number') {
        note += ` (просмотрено строк БД: ${data.rows_scanned}`;
        if (data.scan_limit != null) note += ` / лимит скана ${data.scan_limit}`;
        note += ')';
      }
      if (data.truncated_scan && data.note) note += `. ${data.note}`;
      setVizBackfillNote(note);
    } catch (e: unknown) {
      setVizCandidates(null);
      setVizBackfillNote(e instanceof Error ? e.message : 'Ошибка запроса');
    } finally {
      setVizBackfillBusy(false);
    }
  };

  const runVizBackfill = async (dryRun: boolean) => {
    setVizBackfillBusy(true);
    setVizBackfillNote('');
    try {
      const lim = parseInt(vizLimit.trim(), 10);
      const body = {
        dry_run: dryRun,
        limit: Number.isFinite(lim) ? lim : 25,
        async: vizUseAsync,
        ensure_bubbles: vizEnsureBubbles,
        set_viz_type_auto: vizSetAuto,
        order: 'updated',
        scan_limit: 50000,
      };
      const data = await portalApiFetch<{
        ok?: boolean;
        dry_run?: boolean;
        count?: number;
        queued?: number;
        sync_processed?: number;
        errors?: { slug: string; error: string }[];
        message?: string;
      }>('/knowledge/staff/kb-viz/run/', { method: 'POST', body: JSON.stringify(body) });
      if (data.dry_run) {
        setVizBackfillNote(`Dry-run: кандидатов ${data.count ?? 0}`);
      } else if (vizUseAsync) {
        setVizBackfillNote(`В очередь Celery: ${data.queued ?? 0} (ошибок: ${data.errors?.length ?? 0})`);
      } else {
        setVizBackfillNote(`Синхронно обработано: ${data.sync_processed ?? 0}, ошибок: ${data.errors?.length ?? 0}`);
      }
      if (data.errors?.length) {
        setVizBackfillNote((n) => `${n} — ${data.errors!.slice(0, 3).map((x) => x.slug).join(', ')}`);
      }
    } catch (e: unknown) {
      setVizBackfillNote(e instanceof Error ? e.message : 'Ошибка запуска');
    } finally {
      setVizBackfillBusy(false);
    }
  };

  if (loading) return (<div className="bm-page"><Navbar /><main className="max-w-5xl mx-auto px-4 pt-24 pb-16"><div className="animate-pulse space-y-6"><div className="h-48 rounded-2xl bg-slate-200 dark:bg-white/5" /><div className="h-64 rounded-2xl bg-slate-200 dark:bg-white/5" /></div></main></div>);
  if (!profile) return null;

  const initials = (profile.first_name?.[0] || '') + (profile.last_name?.[0] || '') || profile.email[0].toUpperCase();

  return (
    <div className="bm-page">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Header card */}
        <div className="bg-[#071d24]/80 border border-emerald-400/15 rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {profile.avatar ? <img src={profile.avatar} alt="" className="w-20 h-20 rounded-2xl object-cover" /> : <div className="w-20 h-20 rounded-2xl bg-emerald-400 flex items-center justify-center text-2xl font-bold text-[#001b18]">{initials}</div>}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-white truncate">{profile.full_name}</h1>
              <p className="text-sm text-gray-400">{profile.email}</p>
              {profile.bio && <p className="text-sm text-gray-500 mt-2 line-clamp-2">{profile.bio}</p>}
              <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-gray-600">
                {profile.platform_role && <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full font-medium">{ROLE_ICONS[profile.platform_role] || '👤'} {ROLE_OPTIONS.find(r=>r[0]===profile.platform_role)?.[1] || profile.platform_role}</span>}
                {profile.trader_level && <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-medium">{TRADER_LEVEL_OPTIONS.find(r=>r[0]===profile.trader_level)?.[1]}</span>}
                {profile.tech_level && <span className="bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full font-medium">{TECH_LEVEL_OPTIONS.find(r=>r[0]===profile.tech_level)?.[1]}</span>}
                {profile.location && <span>📍 {profile.location}</span>}
                <span>Joined {new Date(profile.date_joined).toLocaleDateString()}</span>
                {(profile.is_staff || profile.is_superuser) && (
                  <span className="bg-emerald-400/10 text-emerald-400 px-2 py-0.5 rounded-full font-medium">
                    {profile.is_superuser ? 'Superuser' : 'Staff'}
                  </span>
                )}
                <Link href={`/${locale}/onboarding`} className="text-blue-400 hover:text-blue-300 underline">🔄 Retake Onboarding</Link>
                {staffTools && (
                  <button
                    type="button"
                    onClick={() => {
                      setTab('staff');
                      setTimeout(() => document.getElementById('profile-staff-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
                    }}
                    className="text-teal-400 hover:text-teal-300 underline font-medium"
                  >
                    🛠️ Staff · KB tools
                  </button>
                )}
              </div>
            </div>
            {stats && <div className="text-center flex-shrink-0"><div className="w-16 h-16 rounded-2xl bg-emerald-400 flex items-center justify-center text-2xl font-bold text-[#001b18] shadow-lg shadow-emerald-500/20 mx-auto">{stats.level}</div><div className="text-xs text-emerald-400 font-medium mt-2">{stats.level_title}</div><div className="text-[11px] text-gray-500">{stats.experience.toLocaleString()} XP</div></div>}
          </div>
          {stats && <div className="mt-6 pt-6 border-t border-white/5"><div className="flex justify-between text-xs text-gray-500 mb-1"><span>Lv {stats.level}</span><span>{stats.xp_progress.progress_percent}%</span><span>Lv {stats.level+1}</span></div><div className="h-2 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-emerald-400 rounded-full transition-all duration-1000" style={{width:`${stats.xp_progress.progress_percent}%`}}/></div></div>}
          {stats && <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-6 pt-6 border-t border-white/5">{[{v:stats.current_streak,l:'🔥 Streak'},{v:stats.articles_read,l:'📰 Articles'},{v:stats.comments_posted,l:'💬 Comments'},{v:stats.shares_made,l:'🔗 Shares'},{v:stats.badges.length,l:'🏅 Badges'}].map(s=><div key={s.l} className="text-center"><div className="text-lg font-bold text-white">{s.v}</div><div className="text-[11px] text-gray-500">{s.l}</div></div>)}</div>}
        </div>
        {staffTools && (
          <div id="profile-staff-panel" className="bg-[#071d24]/80 border border-teal-500/25 rounded-2xl p-6 mt-6 scroll-mt-24 shadow-[0_0_40px_-12px_rgba(20,184,166,0.15)]">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Staff Content Studio</h3>
                <p className="text-[11px] text-teal-400/80 font-mono mb-1">UI rev. staff-kb-2026-04-14 — если этой строки нет, сделайте redeploy фронта и сбросьте кэш (Ctrl+Shift+R / Cloudflare purge).</p>
                <p className="text-sm text-gray-400 mt-1 max-w-2xl">
                  Редактор, SEO, Django KB и догон AI-визуализаций (сущности, ключи, mind map, bubbles) по API — без SSH.
                </p>
                <ul className="text-[11px] text-gray-500 mt-2 list-disc list-inside space-y-0.5 max-w-2xl">
                  <li>С страницы статьи: Staff-панель — виз 1–3 уровня, content profile, перевод EN.</li>
                  <li>Догон по базе — блок ниже; полный проход без лимита — только <code className="text-cyan-400/80">manage.py backfill_kb_visualizations</code> по SSH/cron.</li>
                  <li>Идеи на потом: пакетный content profile, пересбор auto-links, превью «что изменится» перед публикацией.</li>
                </ul>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                <Link href={`/${locale}/kb`} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300 hover:bg-white/10">
                  KB home
                </Link>
              </div>
            </div>

            <div className="rounded-xl border border-teal-500/30 bg-teal-500/[0.06] p-4 mb-5">
              <h4 className="text-sm font-semibold text-teal-100 mb-3 flex items-center gap-2">
                <span className="text-base">⚡</span> KB: догон визуализаций
              </h4>
              <ol className="text-xs sm:text-sm text-gray-400 space-y-1.5 list-decimal list-inside mb-4">
                <li>
                  Выбираются <strong className="text-gray-300">опубликованные</strong> статьи с непустым{' '}
                  <code className="text-cyan-400/90">content_md</code>, где нет данных визуализации / мало entities / нет ключей
                  {vizEnsureBubbles ? ' или нет bubble map' : ''}.
                </li>
                <li>
                  <strong className="text-gray-300">Предпросмотр</strong> — GET к API (только счётчик и примеры slug).{' '}
                  <strong className="text-gray-300">Dry-run</strong> — POST без записи. <strong className="text-gray-300">Запуск</strong> — тот же код, что{' '}
                  <code className="text-cyan-400/90">analyze_article_async</code> (или очередь Celery).
                </li>
                <li>
                  На сервере:{' '}
                  <code className="text-cyan-400/90 break-all">python manage.py backfill_kb_visualizations --dry-run --limit 20</code>
                </li>
              </ol>

              <div className="flex flex-wrap items-end gap-3 sm:gap-4 mb-3">
                <div>
                  <label className="block text-[11px] text-teal-200/60 mb-1">Limit</label>
                  <input
                    type="number"
                    min={1}
                    max={500}
                    value={vizLimit}
                    onChange={(e) => setVizLimit(e.target.value)}
                    className="w-24 bg-black/30 border border-teal-500/20 rounded-lg px-2 py-1.5 text-sm text-white"
                  />
                </div>
                <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer pt-5">
                  <input type="checkbox" checked={vizEnsureBubbles} onChange={(e) => setVizEnsureBubbles(e.target.checked)} />
                  ensure bubbles
                </label>
                <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer pt-5">
                  <input type="checkbox" checked={vizSetAuto} onChange={(e) => setVizSetAuto(e.target.checked)} />
                  viz_type → auto
                </label>
                <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer pt-5">
                  <input type="checkbox" checked={vizUseAsync} onChange={(e) => setVizUseAsync(e.target.checked)} />
                  Celery async
                </label>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={vizBackfillBusy}
                  onClick={() => void loadVizCandidates()}
                  className="px-3 py-2 rounded-lg bg-teal-500/25 border border-teal-400/40 text-teal-50 text-sm font-medium hover:bg-teal-500/35 disabled:opacity-50"
                >
                  1 · Предпросмотр
                </button>
                <button
                  type="button"
                  disabled={vizBackfillBusy}
                  onClick={() => void runVizBackfill(true)}
                  className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-gray-100 text-sm hover:bg-white/15 disabled:opacity-50"
                >
                  2 · Dry-run
                </button>
                <button
                  type="button"
                  disabled={vizBackfillBusy}
                  onClick={() => void runVizBackfill(false)}
                  className="px-3 py-2 rounded-lg bg-emerald-600/30 border border-emerald-400/50 text-emerald-50 text-sm font-medium hover:bg-emerald-600/40 disabled:opacity-50"
                >
                  3 · Запустить
                </button>
              </div>

              {vizBackfillBusy && <p className="text-xs text-teal-200/70 mt-3">Запрос…</p>}
              {vizBackfillNote && !vizBackfillBusy && (
                <p className={`text-xs mt-3 whitespace-pre-wrap ${vizBackfillNote.includes('Ошибка') || vizBackfillNote.includes('API ') ? 'text-red-300' : 'text-emerald-200/90'}`}>
                  {vizBackfillNote}
                </p>
              )}
              {vizCandidates && vizCandidates.sample_slugs?.length > 0 && (
                <div className="text-[11px] text-gray-400 font-mono break-all max-h-28 overflow-y-auto border border-white/10 rounded-lg p-2 bg-black/30 mt-2">
                  {vizCandidates.sample_slugs.slice(0, 25).join(', ')}
                </div>
              )}
              <p className="text-[10px] text-gray-600 mt-3 font-mono break-all">
                GET …/knowledge/staff/kb-viz/candidates/?order=updated · scan_limit=12000 — ограничение скана, чтобы ответ не «висел» на большой базе.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              <div className="bg-white/[0.03] border border-white/5 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-white">{authoredCount}</div>
                <div className="text-[11px] text-gray-500">My KB Articles</div>
              </div>
              <div className="bg-white/[0.03] border border-white/5 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-cyan-400">{aiJobsCount}</div>
                <div className="text-[11px] text-gray-500">AI Editor jobs</div>
              </div>
              <div className="bg-white/[0.03] border border-white/5 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-emerald-400">Editor</div>
                <div className="text-[11px] text-gray-500">Studio</div>
              </div>
              <div className="bg-white/[0.03] border border-white/5 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-purple-400">Admin</div>
                <div className="text-[11px] text-gray-500">Django</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href={`/${locale}/editor`} className="px-4 py-2 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/25 transition-colors text-sm">
                ✨ AI Editor Studio
              </Link>
              <Link href={`/${locale}/agentadmin/seo`} className="px-4 py-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 transition-colors text-sm">
                📊 SEO Dashboard
              </Link>
              <a href="/admin/knowledge/kbarticle/" className="px-4 py-2 rounded-lg bg-emerald-400/15 border border-emerald-400/30 text-emerald-300 hover:bg-emerald-400/25 transition-colors text-sm">
                📝 KB в Django Admin
              </a>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-1 mt-6 mb-6 bg-white/[0.03] rounded-xl p-1 border border-white/5 w-fit max-w-full">
          {[
            { id: 'overview' as const, l: '📊 Overview' },
            { id: 'edit' as const, l: '✏️ Edit' },
            { id: 'badges' as const, l: '🏅 Badges' },
            { id: 'activity' as const, l: '📋 Activity' },
            ...(staffTools ? [{ id: 'staff' as const, l: '🛠️ Staff' }] : []),
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setTab(t.id);
                if (t.id === 'staff') {
                  setTimeout(() => document.getElementById('profile-staff-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
                }
              }}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${tab === t.id ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
            >
              {t.l}
            </button>
          ))}
        </div>

        {tab === 'staff' && staffTools && (
          <div className="mb-6 rounded-xl border border-dashed border-teal-500/30 bg-teal-500/5 px-4 py-4 text-center text-sm text-gray-400">
            Панель <strong className="text-teal-200/90">Staff Content Studio</strong> с догоном KB —{' '}
            <strong className="text-white">блок с оранжевой рамкой выше</strong> на этой странице. Нажмите «Staff · KB tools» в шапке
            профиля, чтобы прокрутить к нему.
          </div>
        )}

        {/* Overview */}
        {tab === 'overview' && stats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#071d24]/80 border border-emerald-400/15 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">🔥 Daily Streak</h3>
              <div className="flex items-center justify-center gap-6"><div className="text-center"><div className="text-4xl font-bold text-emerald-400">{stats.current_streak}</div><div className="text-xs text-gray-500 mt-1">Current</div></div><div className="text-gray-700 text-2xl">/</div><div className="text-center"><div className="text-4xl font-bold text-white">{stats.longest_streak}</div><div className="text-xs text-gray-500 mt-1">Best</div></div></div>
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5 text-xs"><span className={stats.current_streak>=7?'text-emerald-400':'text-gray-600'}>🔥 7d</span><span className={stats.current_streak>=30?'text-emerald-400':'text-gray-600'}>⚡ 30d</span><span className={stats.current_streak>=100?'text-emerald-400':'text-gray-600'}>💎 100d</span></div>
            </div>
            <div className="bg-[#071d24]/80 border border-emerald-400/15 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">🏅 Latest Badges</h3>
              {!stats.badges.length ? <p className="text-sm text-gray-500 text-center py-4">No badges yet</p> : <div className="space-y-3">{stats.badges.slice(0,5).map(ub=><div key={ub.id} className="flex items-center gap-3"><span className="text-2xl">{ub.badge.icon}</span><div className="flex-1"><div className="text-sm text-white">{ub.badge.name}</div><div className="text-[11px] text-gray-500">{ub.badge.description}</div></div><span className="text-[11px] text-gray-600">{tAgo(ub.earned_at)}</span></div>)}</div>}
            </div>
          </div>
        )}
        {tab === 'overview' && !stats && <div className="bg-[#071d24]/80 border border-emerald-400/15 rounded-2xl p-8 text-center text-gray-500">Gamification data unavailable</div>}

        {/* Edit */}
        {tab === 'edit' && (
          <div className="bg-[#071d24]/80 border border-emerald-400/15 rounded-2xl p-6 space-y-5">
            <h3 className="text-lg font-semibold text-white">Edit Profile</h3>
            {msg && <div className={`text-sm px-4 py-2 rounded-lg ${msg.startsWith('✓')?'bg-emerald-500/10 text-emerald-400':'bg-red-500/10 text-red-400'}`}>{msg}</div>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="block text-xs text-gray-500 mb-1">First Name</label><input type="text" value={form.first_name||''} onChange={e=>setForm(p=>({...p,first_name:e.target.value}))} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-400/50 focus:outline-none"/></div>
              <div><label className="block text-xs text-gray-500 mb-1">Last Name</label><input type="text" value={form.last_name||''} onChange={e=>setForm(p=>({...p,last_name:e.target.value}))} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-400/50 focus:outline-none"/></div>
            </div>
            <div><label className="block text-xs text-gray-500 mb-1">Bio</label><textarea value={form.bio||''} onChange={e=>setForm(p=>({...p,bio:e.target.value}))} rows={3} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-400/50 focus:outline-none resize-none" placeholder="Tell us about yourself..."/></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="block text-xs text-gray-500 mb-1">Location</label><input type="text" value={form.location||''} onChange={e=>setForm(p=>({...p,location:e.target.value}))} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-400/50 focus:outline-none" placeholder="City, Country"/></div>
              <div><label className="block text-xs text-gray-500 mb-1">Experience</label><select value={form.experience_level||''} onChange={e=>setForm(p=>({...p,experience_level:e.target.value}))} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-400/50 focus:outline-none">{EXP_LEVELS.map(l=><option key={l} value={l}>{l||'Select...'}</option>)}</select></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="block text-xs text-gray-500 mb-1">Platform Role</label><select value={form.platform_role||''} onChange={e=>setForm(p=>({...p,platform_role:e.target.value}))} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-400/50 focus:outline-none">{ROLE_OPTIONS.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></div>
              {['trader','investor'].includes(form.platform_role) && <div><label className="block text-xs text-gray-500 mb-1">Trader Level</label><select value={form.trader_level||''} onChange={e=>setForm(p=>({...p,trader_level:e.target.value}))} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-400/50 focus:outline-none">{TRADER_LEVEL_OPTIONS.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></div>}
              {['devops','architect','developer','data_analyst','qa'].includes(form.platform_role) && <div><label className="block text-xs text-gray-500 mb-1">Tech Level</label><select value={form.tech_level||''} onChange={e=>setForm(p=>({...p,tech_level:e.target.value}))} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-400/50 focus:outline-none">{TECH_LEVEL_OPTIONS.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></div>}
              <div><label className="block text-xs text-gray-500 mb-1">Monthly Income</label><select value={form.monthly_income||''} onChange={e=>setForm(p=>({...p,monthly_income:e.target.value}))} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-400/50 focus:outline-none">{INCOME_OPTIONS.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></div>
            </div>
            <div><label className="block text-xs text-gray-500 mb-2">Trading Interests</label><div className="flex flex-wrap gap-2">{INTERESTS.map(i=><button key={i} onClick={()=>setForm(p=>({...p,trading_interests:p.trading_interests?.includes(i)?p.trading_interests.filter((x:string)=>x!==i):[...(p.trading_interests||[]),i]}))} className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${form.trading_interests?.includes(i)?'border-emerald-400/50 bg-emerald-400/10 text-emerald-400':'border-white/10 text-gray-500 hover:text-white'}`}>{i}</button>)}</div></div>
            <button onClick={save} disabled={saving} className="px-6 py-2.5 bg-emerald-400 text-[#001b18] font-semibold rounded-xl hover:bg-emerald-300 transition-all disabled:opacity-50 text-sm">{saving?'Saving...':'Save Changes'}</button>
          </div>
        )}

        {/* Badges */}
        {tab === 'badges' && (
          <div className="bg-[#071d24]/80 border border-emerald-400/15 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Earned Badges ({stats?.badges.length || 0})</h3>
            {!stats?.badges.length ? <p className="text-sm text-gray-500 text-center py-8">No badges yet. Start reading and engaging!</p> : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">{stats.badges.map(ub=>{const tc=TIER_C[ub.badge.tier]||TIER_C.common;return(<div key={ub.id} className={`border rounded-xl p-4 ${tc}`}><div className="flex items-start justify-between mb-2"><span className="text-3xl">{ub.badge.icon}</span><span className="text-[9px] font-bold uppercase tracking-wider opacity-70">{ub.badge.tier}</span></div><div className="text-sm font-semibold text-white">{ub.badge.name}</div><div className="text-xs text-gray-400 mt-1">{ub.badge.description}</div><div className="text-[10px] text-gray-600 mt-2">{tAgo(ub.earned_at)}</div></div>);})}</div>}
          </div>
        )}

        {/* Activity */}
        {tab === 'activity' && (
          <div className="bg-[#071d24]/80 border border-emerald-400/15 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
            {!stats?.recent_activities.length ? <p className="text-sm text-gray-500 text-center py-8">No activity yet</p> : <div className="space-y-2">{stats.recent_activities.map(a=>{const m=ACT_M[a.activity_type]||{l:a.activity_type,i:'🔹'};return(<div key={a.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-white/[0.02] border border-white/5"><div className="flex items-center gap-3"><span className="text-lg">{m.i}</span><div><div className="text-sm text-white">{m.l}</div><div className="text-[11px] text-gray-500">{tAgo(a.created_at)}</div></div></div><span className="text-sm font-semibold text-emerald-400">+{a.xp_earned} XP</span></div>);})}</div>}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
