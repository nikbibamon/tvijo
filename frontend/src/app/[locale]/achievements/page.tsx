'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/portal/Navbar';
import Footer from '@/components/portal/Footer';
import { parseLocale } from '@/i18n/config';

const API = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

interface XPProgress { xp_current_level: number; xp_needed: number; xp_to_next_level: number; progress_percent: number; }
interface Badge { id: number; name: string; slug: string; description: string; icon: string; tier: string; xp_reward: number; requirements: Record<string, number>; is_active: boolean; }
interface UserBadge { id: number; badge: Badge; earned_at: string; }
interface UserActivity { id: number; activity_type: string; xp_earned: number; related_object_type: string; related_object_id: number | null; metadata: Record<string, unknown>; created_at: string; }
interface UserStats { level: number; experience: number; level_title: string; xp_progress: XPProgress; total_activities: number; articles_read: number; comments_posted: number; shares_made: number; current_streak: number; longest_streak: number; badges: UserBadge[]; recent_activities: UserActivity[]; }

async function apiFetchAuth<T>(path: string): Promise<T> {
  const token = localStorage.getItem('access_token');
  const res = await fetch(`${API}${path}`, { headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

const LEVEL_TITLES: Record<number, string> = { 1: 'Novice Trader', 5: 'Apprentice Investor', 10: 'Skilled Analyst', 15: 'Expert Trader', 20: 'Master Investor', 25: 'Financial Guru', 30: 'Market Wizard', 40: 'Trading Legend', 50: 'Financial Titan' };

const XP_REWARDS = [
  { activity: 'Read Article', xp: 5, icon: '📰' }, { activity: 'Complete Article', xp: 15, icon: '✅' },
  { activity: 'Post Comment', xp: 20, icon: '💬' }, { activity: 'Share Article', xp: 10, icon: '🔗' },
  { activity: 'Daily Login', xp: 10, icon: '📅' }, { activity: 'Newsletter Subscribe', xp: 25, icon: '📧' },
  { activity: 'Referral Signup', xp: 100, icon: '👥' }, { activity: 'First Article', xp: 50, icon: '🎯' },
  { activity: '7-Day Streak', xp: 50, icon: '🔥' }, { activity: '30-Day Streak', xp: 200, icon: '⚡' },
  { activity: '100-Day Streak', xp: 1000, icon: '💎' },
];

const ALL_BADGES: Badge[] = [
  { id:1, name:'First Steps', slug:'first-steps', description:'Read your first article', icon:'📖', tier:'common', xp_reward:50, requirements:{articles_read:1}, is_active:true },
  { id:2, name:'Bookworm', slug:'bookworm', description:'Read 10 articles', icon:'📚', tier:'common', xp_reward:100, requirements:{articles_read:10}, is_active:true },
  { id:3, name:'Scholar', slug:'scholar', description:'Read 50 articles', icon:'🎓', tier:'rare', xp_reward:250, requirements:{articles_read:50}, is_active:true },
  { id:4, name:'Master Reader', slug:'master-reader', description:'Read 100 articles', icon:'📜', tier:'epic', xp_reward:500, requirements:{articles_read:100}, is_active:true },
  { id:5, name:'First Comment', slug:'first-comment', description:'Post your first comment', icon:'💬', tier:'common', xp_reward:50, requirements:{comments_posted:1}, is_active:true },
  { id:6, name:'Conversationalist', slug:'conversationalist', description:'Post 25 comments', icon:'🗣️', tier:'rare', xp_reward:200, requirements:{comments_posted:25}, is_active:true },
  { id:7, name:'Community Leader', slug:'community-leader', description:'Post 100 comments', icon:'👑', tier:'epic', xp_reward:500, requirements:{comments_posted:100}, is_active:true },
  { id:8, name:'First Share', slug:'first-share', description:'Share your first article', icon:'🔗', tier:'common', xp_reward:50, requirements:{shares_made:1}, is_active:true },
  { id:9, name:'Influencer', slug:'influencer', description:'Share 25 articles', icon:'📢', tier:'rare', xp_reward:200, requirements:{shares_made:25}, is_active:true },
  { id:10, name:'Week Warrior', slug:'week-warrior', description:'7-day login streak', icon:'🔥', tier:'common', xp_reward:100, requirements:{current_streak:7}, is_active:true },
  { id:11, name:'Month Master', slug:'month-master', description:'30-day login streak', icon:'⚡', tier:'rare', xp_reward:300, requirements:{current_streak:30}, is_active:true },
  { id:12, name:'Century Champion', slug:'century-champion', description:'100-day login streak', icon:'💎', tier:'legendary', xp_reward:1000, requirements:{current_streak:100}, is_active:true },
  { id:13, name:'Rising Star', slug:'level-10', description:'Reach level 10', icon:'⭐', tier:'rare', xp_reward:200, requirements:{level:10}, is_active:true },
  { id:14, name:'Elite Trader', slug:'level-25', description:'Reach level 25', icon:'🌟', tier:'epic', xp_reward:500, requirements:{level:25}, is_active:true },
  { id:15, name:'Legendary Investor', slug:'level-50', description:'Reach level 50', icon:'💫', tier:'legendary', xp_reward:2000, requirements:{level:50}, is_active:true },
];

const TIER_S: Record<string, { bg: string; border: string; text: string }> = {
  common: { bg:'bg-gray-500/10', border:'border-gray-500/20', text:'text-gray-400' },
  rare: { bg:'bg-blue-500/10', border:'border-blue-500/20', text:'text-blue-400' },
  epic: { bg:'bg-purple-500/10', border:'border-purple-500/20', text:'text-purple-400' },
  legendary: { bg:'bg-orange-500/10', border:'border-orange-500/20', text:'text-orange-400' },
};

const ACT_LABELS: Record<string, { label: string; icon: string }> = {
  article_read: { label:'Read Article', icon:'📰' }, article_completed: { label:'Completed Article', icon:'✅' },
  comment_posted: { label:'Posted Comment', icon:'💬' }, share: { label:'Shared Content', icon:'🔗' },
  login: { label:'Daily Login', icon:'📅' }, profile_updated: { label:'Updated Profile', icon:'👤' },
  newsletter_subscribed: { label:'Subscribed', icon:'📧' }, referral: { label:'Referral', icon:'👥' },
};

function timeAgo(d: string) { const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000); if (m < 1) return 'just now'; if (m < 60) return `${m}m ago`; const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`; return `${Math.floor(h / 24)}d ago`; }

function BadgeCard({ badge, earned }: { badge: Badge; earned: boolean }) {
  const t = TIER_S[badge.tier] || TIER_S.common;
  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:scale-[1.02] dark:border-emerald-400/15 dark:bg-[#071d24] dark:shadow-none ${earned ? 'ring-1 ring-emerald-400/40' : 'opacity-70'}`}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-3xl">{badge.icon}</span>
        <span className={`text-[10px] font-bold uppercase tracking-wider ${t.text}`}>{badge.tier}</span>
      </div>
      <div className="text-sm font-semibold text-slate-900 dark:text-white mb-1">{badge.name}</div>
      <div className="text-xs text-slate-600 dark:text-gray-400 mb-3">{badge.description}</div>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">+{badge.xp_reward} XP</span>
        {earned
          ? <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">Earned</span>
          : <span className="text-[10px] text-slate-500 dark:text-gray-500">{Object.entries(badge.requirements).map(([k,v])=>`${k.replace(/_/g,' ')}: ${v}`).join(', ')}</span>}
      </div>
    </div>
  );
}

function XPProgressCard({ stats }: { stats: UserStats }) {
  return (
    <div className="bg-[#071d24]/80 border border-emerald-400/15 rounded-2xl p-6 sm:p-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-2xl bg-emerald-400 flex items-center justify-center text-2xl font-bold text-[#001b18] shadow-lg shadow-emerald-500/20">{stats.level}</div>
        <div>
          <div className="text-xl font-bold text-white">{stats.level_title}</div>
          <div className="text-sm text-gray-400">Level {stats.level} &bull; {stats.experience.toLocaleString()} XP total</div>
        </div>
      </div>
      <div className="mb-2">
        <div className="flex justify-between text-xs text-gray-500 mb-1"><span>{stats.xp_progress.xp_current_level} XP</span><span>{stats.xp_progress.xp_needed} XP needed</span></div>
        <div className="h-3 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-emerald-400 rounded-full transition-all duration-1000" style={{width:`${stats.xp_progress.progress_percent}%`}}/></div>
        <div className="text-xs text-gray-500 mt-1 text-right">{stats.xp_progress.xp_to_next_level} XP to level {stats.level+1}</div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/5">
        {[{v:stats.current_streak,l:'Day Streak'},{v:stats.articles_read,l:'Articles Read'},{v:stats.comments_posted,l:'Comments'},{v:stats.badges.length,l:'Badges'}].map(s=>(
          <div key={s.l} className="text-center"><div className="text-2xl font-bold text-white">{s.v}</div><div className="text-xs text-gray-500">{s.l}</div></div>
        ))}
      </div>
    </div>
  );
}

export default function AchievementsPage() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = parseLocale(pathname);
  const [isAuth, setIsAuth] = useState(false);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'badges'|'levels'|'xp'|'activity'>('badges');
  const [badgeFilter, setBadgeFilter] = useState<'all'|'common'|'rare'|'epic'|'legendary'>('all');

  const loadData = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    setIsAuth(!!token);
    if (token) {
      try { const s = await apiFetchAuth<UserStats>('/gamification/stats/'); setStats(s); } catch { /* noop */ }
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const earnedSlugs = new Set(stats?.badges.map(b => b.badge.slug) || []);
  const filteredBadges = badgeFilter === 'all' ? ALL_BADGES : ALL_BADGES.filter(b => b.tier === badgeFilter);

  return (
    <div className="bm-page">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-4 py-1.5 mb-4">
            <span className="text-sm">🎮</span>
            <span className="text-xs text-emerald-400 font-medium">Gamification System</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">Achievements & Rewards</h1>
          <p className="text-gray-400 max-w-xl mx-auto">Earn XP by reading articles, posting comments, and maintaining streaks. Level up, collect badges, and climb the leaderboard.</p>
        </div>

        {loading && <div className="text-center text-gray-500 py-20 animate-pulse">Loading...</div>}

        {!loading && (
          <>
            {/* User stats card (if authenticated) */}
            {isAuth && stats && <div className="mb-8"><XPProgressCard stats={stats} /></div>}

            {/* Streak (if authenticated) */}
            {isAuth && stats && (
              <div className="bg-[#071d24]/80 border border-emerald-400/15 rounded-2xl p-6 mb-8">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><span>🔥</span> Daily Streak</h3>
                <div className="flex items-center justify-center gap-6">
                  <div className="text-center"><div className="text-4xl font-bold text-emerald-400">{stats.current_streak}</div><div className="text-xs text-gray-500 mt-1">Current</div></div>
                  <div className="text-gray-700 text-2xl">/</div>
                  <div className="text-center"><div className="text-4xl font-bold text-white">{stats.longest_streak}</div><div className="text-xs text-gray-500 mt-1">Best</div></div>
                </div>
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5 text-xs">
                  <span className={stats.current_streak >= 7 ? 'text-emerald-400' : 'text-gray-600'}>🔥 7d (+50 XP)</span>
                  <span className={stats.current_streak >= 30 ? 'text-emerald-400' : 'text-gray-600'}>⚡ 30d (+200 XP)</span>
                  <span className={stats.current_streak >= 100 ? 'text-emerald-400' : 'text-gray-600'}>💎 100d (+1000 XP)</span>
                </div>
              </div>
            )}

            {/* Not authenticated CTA */}
            {!isAuth && (
              <div className="bg-emerald-400/10 border border-emerald-400/20 rounded-2xl p-8 text-center mb-8">
                <div className="text-4xl mb-3">🏆</div>
                <h2 className="text-xl font-bold text-white mb-2">Start Earning XP</h2>
                <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">Sign in to track your progress, earn badges, maintain streaks, and compete on the leaderboard.</p>
                <button onClick={() => router.push(`/${locale}/login`)} className="px-8 py-3 bg-emerald-400 text-[#001b18] font-semibold rounded-xl hover:bg-emerald-300 transition-all text-sm shadow-lg shadow-emerald-500/20">
                  Sign In to Get Your Link
                </button>
              </div>
            )}

            {/* Tabs */}
            <div className="flex items-center gap-1 mb-6 bg-white/[0.03] rounded-xl p-1 border border-white/5 w-fit">
              {[{id:'badges' as const,l:'🏅 Badges'},{id:'levels' as const,l:'📊 Levels'},{id:'xp' as const,l:'⚡ XP Rules'},{id:'activity' as const,l:'📋 Activity'}].map(t=>(
                <button key={t.id} onClick={()=>setTab(t.id)} className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${tab===t.id?'bg-white/10 text-white':'text-gray-500 hover:text-white'}`}>{t.l}</button>
              ))}
            </div>

            {/* Tab content */}
            {tab === 'badges' && (
              <div>
                <div className="flex items-center gap-2 mb-6 flex-wrap">
                  {(['all','common','rare','epic','legendary'] as const).map(f=>(
                    <button key={f} onClick={()=>setBadgeFilter(f)} className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${badgeFilter===f?'border-emerald-400/50 bg-emerald-400/10 text-emerald-400':'border-white/10 text-gray-500 hover:text-white'}`}>
                      {f==='all'?`All (${ALL_BADGES.length})`:f.charAt(0).toUpperCase()+f.slice(1)}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredBadges.map(b=><BadgeCard key={b.slug} badge={b} earned={earnedSlugs.has(b.slug)}/>)}
                </div>
              </div>
            )}

            {tab === 'levels' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-[#071d24]/80 border border-emerald-400/15 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-6">Level Roadmap</h3>
                  <div className="relative">
                    <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-emerald-400/50 via-purple-500/30 to-transparent"/>
                    <div className="space-y-5">
                      {Object.entries(LEVEL_TITLES).map(([lvl,title],i)=>(
                        <div key={lvl} className="flex items-center gap-4 relative">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold z-10 ${i===0?'bg-emerald-400 text-[#001b18] shadow-lg shadow-emerald-500/20':i<4?'bg-white/5 border border-white/10 text-white':'bg-white/[0.03] border border-white/5 text-gray-500'}`}>{lvl}</div>
                          <div><div className="text-sm font-semibold text-white">{title}</div><div className="text-xs text-gray-500">Level {lvl}</div></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="bg-[#071d24]/80 border border-emerald-400/15 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">XP Formula</h3>
                  <p className="text-sm text-gray-400 mb-4">Each level requires more XP than the last, following an exponential curve:</p>
                  <div className="bg-white/[0.03] rounded-xl p-4 font-mono text-sm text-emerald-400 mb-4">XP = 100 × 1.5^(level - 1)</div>
                  <div className="space-y-2 text-sm">
                    {[{l:2,x:100},{l:5,x:813},{l:10,x:5764},{l:15,x:46856},{l:20,x:362481},{l:25,x:2807300}].map(e=>(
                      <div key={e.l} className="flex justify-between py-1.5 px-3 rounded-lg hover:bg-white/[0.03]"><span className="text-gray-400">Level {e.l}</span><span className="text-white font-medium">{e.x.toLocaleString()} XP</span></div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {tab === 'xp' && (
              <div className="bg-[#071d24]/80 border border-emerald-400/15 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-6">XP Rewards</h3>
                <div className="space-y-2">
                  {XP_REWARDS.map(r=>(
                    <div key={r.activity} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-white/[0.03] transition-colors">
                      <div className="flex items-center gap-3"><span className="text-lg">{r.icon}</span><span className="text-sm text-white">{r.activity}</span></div>
                      <span className="text-sm font-semibold text-emerald-400">+{r.xp} XP</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'activity' && (
              <div className="bg-[#071d24]/80 border border-emerald-400/15 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                {!isAuth ? (
                  <div className="text-center text-gray-500 py-8 text-sm">Sign in to see your activity feed</div>
                ) : !stats?.recent_activities.length ? (
                  <div className="text-center text-gray-500 py-8 text-sm">No activities yet. Start reading articles to earn XP!</div>
                ) : (
                  <div className="space-y-2">
                    {stats.recent_activities.slice(0,15).map(a=>{
                      const m = ACT_LABELS[a.activity_type]||{label:a.activity_type,icon:'🔹'};
                      return (
                        <div key={a.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-white/[0.02] border border-white/5">
                          <div className="flex items-center gap-3"><span className="text-lg">{m.icon}</span><div><div className="text-sm text-white">{m.label}</div><div className="text-[11px] text-gray-500">{timeAgo(a.created_at)}</div></div></div>
                          <span className="text-sm font-semibold text-emerald-400">+{a.xp_earned} XP</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
