'use client';
import { useEffect, useState, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Navbar from '@/components/portal/Navbar';
import Footer from '@/components/portal/Footer';
import { parseLocale } from '@/i18n/config';

const API = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

interface ReferralCode { code: string; total_clicks: number; referral_url: string; created_at: string; }
interface ReferralEntry { id: number; referred_display: string; status: string; created_at: string; converted_at: string | null; xp_awarded_signup: boolean; xp_awarded_active: boolean; }
interface ReferralStats { total_invites: number; registered: number; active: number; total_xp_earned: number; }
interface ReferralData { code: ReferralCode; referrals: ReferralEntry[]; stats: ReferralStats; }

async function apiFetch<T>(path: string): Promise<T> {
  const token = localStorage.getItem('access_token');
  if (!token) throw new Error('No auth');
  const res = await fetch(`${API}${path}`, { headers: { Authorization: `Bearer ${token}` } });
  if (res.status === 401) throw new Error('Unauthorized');
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

function tAgo(d: string) { const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000); if (m < 1) return 'just now'; if (m < 60) return `${m}m ago`; const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`; return `${Math.floor(h / 24)}d ago`; }

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  registered: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

export default function ReferralsPage() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = parseLocale(pathname);
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isAuth, setIsAuth] = useState(false);

  const load = useCallback(async () => {
    try {
      const d = await apiFetch<ReferralData>('/gamification/referrals/');
      setData(d);
      setIsAuth(true);
    } catch {
      setIsAuth(false);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!localStorage.getItem('access_token')) { setLoading(false); return; }
    load();
  }, [load]);

  const copyLink = () => {
    if (!data) return;
    navigator.clipboard.writeText(data.code.referral_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Public view for unauthenticated users
  const PublicView = () => (
    <div className="max-w-3xl mx-auto text-center space-y-8">
      <div className="space-y-4">
        <div className="text-6xl">🎁</div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white">Invite Friends, Earn Rewards</h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">Share your unique referral link and earn <span className="text-emerald-400 font-semibold">100 XP</span> for every friend who signs up, plus <span className="text-emerald-400 font-semibold">50 bonus XP</span> when they become active!</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: '🔗', title: 'Share Your Link', desc: 'Get your unique referral link after signing in' },
          { icon: '👥', title: 'Friends Sign Up', desc: 'They join using your link — you earn 100 XP' },
          { icon: '⚡', title: 'They Get Active', desc: 'When they engage, you earn 50 more XP' },
        ].map(s => (
          <div key={s.title} className="bg-[#071d24]/80 border border-emerald-400/15 rounded-2xl p-6">
            <div className="text-3xl mb-3">{s.icon}</div>
            <h3 className="text-sm font-semibold text-white mb-1">{s.title}</h3>
            <p className="text-xs text-gray-500">{s.desc}</p>
          </div>
        ))}
      </div>
      <button onClick={() => router.push(`/${locale}/login`)} className="px-8 py-3 bg-emerald-400 text-[#001b18] font-semibold rounded-xl hover:bg-emerald-300 transition-all text-sm shadow-lg shadow-emerald-500/20">
        Sign In to Get Your Link
      </button>
    </div>
  );

  if (loading) return (
    <div className="bm-page"><Navbar /><main className="max-w-5xl mx-auto px-4 pt-24 pb-16"><div className="animate-pulse space-y-6"><div className="h-48 bg-white/5 rounded-2xl" /><div className="h-64 bg-white/5 rounded-2xl" /></div></main></div>
  );

  return (
    <div className="bm-page">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {!isAuth || !data ? <PublicView /> : (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Referral Program</h1>
                <p className="text-sm text-gray-500 mt-1">Invite friends and earn XP rewards</p>
              </div>
              <div className="text-4xl">🎁</div>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { v: data.stats.total_invites, l: 'Total Invites', icon: '📨', color: 'text-white' },
                { v: data.stats.registered, l: 'Registered', icon: '✅', color: 'text-blue-400' },
                { v: data.stats.active, l: 'Active Users', icon: '⚡', color: 'text-emerald-400' },
                { v: data.stats.total_xp_earned, l: 'XP Earned', icon: '✨', color: 'text-emerald-400' },
              ].map(s => (
                <div key={s.l} className="bg-[#071d24]/80 border border-emerald-400/15 rounded-xl p-4 text-center">
                  <div className="text-xl mb-1">{s.icon}</div>
                  <div className={`text-2xl font-bold ${s.color}`}>{s.v}</div>
                  <div className="text-[11px] text-gray-500 mt-1">{s.l}</div>
                </div>
              ))}
            </div>

            {/* Referral link card */}
            <div className="bg-[#071d24]/80 border border-emerald-400/15 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-1">Your Referral Link</h2>
              <p className="text-xs text-gray-500 mb-4">Share this link — earn 100 XP per signup + 50 XP when they become active</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-sm text-emerald-400 font-mono truncate">
                  {data.code.referral_url}
                </div>
                <button onClick={copyLink} className={`flex-shrink-0 px-5 py-3 rounded-lg font-semibold text-sm transition-all ${copied ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-400 text-[#001b18] hover:bg-emerald-300'}`}>
                  {copied ? '✓ Copied!' : 'Copy Link'}
                </button>
              </div>
              <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
                <span>Code: <span className="text-white font-mono">{data.code.code}</span></span>
                <span>•</span>
                <span>{data.code.total_clicks} clicks</span>
              </div>
            </div>

            {/* How it works */}
            <div className="bg-[#071d24]/80 border border-emerald-400/15 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">How It Works</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { step: '1', icon: '🔗', title: 'Share Link', desc: 'Send your referral link to friends via social media, email, or messaging' },
                  { step: '2', icon: '📝', title: 'They Sign Up', desc: 'When they register using your link, you earn 100 XP instantly' },
                  { step: '3', icon: '⚡', title: 'They Engage', desc: 'Once they complete 10+ activities, you earn 50 bonus XP' },
                ].map(s => (
                  <div key={s.step} className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center text-emerald-400 font-bold text-sm flex-shrink-0">{s.step}</div>
                    <div>
                      <div className="text-sm font-semibold text-white">{s.title}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Referrals list */}
            <div className="bg-[#071d24]/80 border border-emerald-400/15 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Your Referrals ({data.referrals.length})</h3>
              {!data.referrals.length ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">👥</div>
                  <p className="text-sm text-gray-500">No referrals yet. Share your link to start earning!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {data.referrals.map(r => (
                    <div key={r.id} className="flex items-center justify-between py-3 px-4 rounded-lg bg-white/[0.02] border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-sm">👤</div>
                        <div>
                          <div className="text-sm text-white">{r.referred_display}</div>
                          <div className="text-[11px] text-gray-500">{tAgo(r.created_at)}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                          {r.xp_awarded_signup && <span className="text-[10px] bg-emerald-400/10 text-emerald-400 px-2 py-0.5 rounded-full">+100 XP</span>}
                          {r.xp_awarded_active && <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">+50 XP</span>}
                        </div>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${STATUS_STYLES[r.status] || STATUS_STYLES.pending}`}>
                          {r.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* XP rewards breakdown */}
            <div className="bg-[#071d24]/80 border border-emerald-400/15 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Referral XP Rewards</h3>
              <div className="space-y-3">
                {[
                  { action: 'Friend signs up', xp: 100, icon: '📝' },
                  { action: 'Friend becomes active (10+ activities)', xp: 50, icon: '⚡' },
                ].map(r => (
                  <div key={r.action} className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/[0.02] border border-white/5">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{r.icon}</span>
                      <span className="text-sm text-white">{r.action}</span>
                    </div>
                    <span className="text-sm font-semibold text-emerald-400">+{r.xp} XP</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
