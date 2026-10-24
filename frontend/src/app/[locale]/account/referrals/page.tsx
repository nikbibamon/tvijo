'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Copy } from 'lucide-react';
import Navbar from '@/components/portal/Navbar';
import Footer from '@/components/portal/Footer';
import { portalApiFetch } from '@/lib/portal-auth-fetch';
import { useLocale } from '@/i18n/useLocale';

// Partner cabinet on top of /api/v1/referrals/ (GEN-REFERRALS-001).
// Invitee emails are never rendered (the API never returns them); every amount
// shown comes verbatim from API strings — no client-side money math.

interface Commission {
  id: string;
  kind: 'first_sale' | 'renewal';
  status: 'pending' | 'matured' | 'reversed' | 'paid';
  amount_usd: string;
  pct: string;
  created_at: string;
}

interface PartnerMe {
  joined: boolean;
  code?: string;
  link?: string;
  tier?: string;
  status?: string;
  visits_30d?: number;
  signups?: number;
  purchases?: number;
  pending_usd?: string;
  matured_usd?: string;
  paid_usd?: string;
  credits_usd?: string;
  min_payout_usd?: string;
  commissions?: Commission[];
}

const PAYOUT_NETWORKS = [
  { value: 'trc20', label: 'USDT TRC20' },
  { value: 'bep20', label: 'USDT BSC (BEP20)' },
  { value: 'arb', label: 'USDT Arbitrum' },
  { value: 'erc20', label: 'USDT ERC20' },
] as const;

const COMMISSION_STATUS_STYLE: Record<Commission['status'], string> = {
  pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  matured: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  paid: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
  reversed: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
};

const API_ERROR_TEXT: Record<string, string> = {
  payout_address_missing: 'Add a payout address before requesting a payout.',
  below_min_payout: 'Matured balance is below the minimum payout amount.',
  partner_not_active: 'Your partner account is not active.',
  invalid_network_or_address: 'Choose a network and enter a valid address.',
  terms_not_accepted: 'You must accept the program terms to join.',
};

function apiErrorText(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  return API_ERROR_TEXT[raw] ?? raw;
}

function CopyLinkButton({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = link;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copy}
      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">{value}</p>
    </div>
  );
}

export default function AccountReferralsPage() {
  const router = useRouter();
  const { locale } = useLocale();

  const [me, setMe] = useState<PartnerMe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [joining, setJoining] = useState(false);

  const [network, setNetwork] = useState<string>('trc20');
  const [address, setAddress] = useState('');
  const [savingAddress, setSavingAddress] = useState(false);
  const [requestingPayout, setRequestingPayout] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await portalApiFetch<PartnerMe>('/referrals/me/');
      setMe(data);
      setError('');
    } catch (err) {
      if (err instanceof Error && (err.message === 'No auth' || err.message === 'Unauthorized')) {
        router.push(`/${locale}/login?redirect=/${locale}/account/referrals`);
        return;
      }
      setError(apiErrorText(err));
    } finally {
      setLoading(false);
    }
  }, [router, locale]);

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('access_token')) {
      router.push(`/${locale}/login?redirect=/${locale}/account/referrals`);
      return;
    }
    void load();
  }, [load, router, locale]);

  const join = async () => {
    if (!acceptedTerms || joining) return;
    setJoining(true);
    setError('');
    try {
      await portalApiFetch('/referrals/join/', {
        method: 'POST',
        body: JSON.stringify({ accept_terms: true }),
      });
      await load();
    } catch (err) {
      setError(apiErrorText(err));
    } finally {
      setJoining(false);
    }
  };

  const saveAddress = async () => {
    if (savingAddress) return;
    setSavingAddress(true);
    setError('');
    setNotice('');
    try {
      await portalApiFetch('/referrals/settings/', {
        method: 'POST',
        body: JSON.stringify({ network, address }),
      });
      setNotice('Payout address saved.');
    } catch (err) {
      setError(apiErrorText(err));
    } finally {
      setSavingAddress(false);
    }
  };

  const requestPayout = async () => {
    if (requestingPayout) return;
    setRequestingPayout(true);
    setError('');
    setNotice('');
    try {
      const res = await portalApiFetch<{ amount_usd: string }>('/referrals/payout/', {
        method: 'POST',
        body: JSON.stringify({}),
      });
      setNotice(`Payout of $${res.amount_usd} requested. It will be processed manually (NET-30).`);
      await load();
    } catch (err) {
      setError(apiErrorText(err));
    } finally {
      setRequestingPayout(false);
    }
  };

  const payoutReady =
    me?.joined === true &&
    Number(me.matured_usd ?? '0') >= Number(me.min_payout_usd ?? '50');

  return (
    <div className="bm-page">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 pb-16 pt-32 sm:px-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">Account</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-950 dark:text-white">Partner cabinet</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
          Earn 10–20% of license sales you refer, plus renewals for 12 months. Program details:{' '}
          <a href="/partners" className="text-emerald-600 underline underline-offset-4">partner ecosystem</a>{' '}
          ·{' '}
          <a href="/partners/terms/" className="text-emerald-600 underline underline-offset-4">program terms</a>.
        </p>

        {error && (
          <div className="mt-6 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-600 dark:text-rose-400">
            {error}
          </div>
        )}
        {notice && (
          <div className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400">
            {notice}
          </div>
        )}

        {loading && (
          <div className="mt-10 space-y-4">
            <div className="h-24 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
            <div className="h-40 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
          </div>
        )}

        {!loading && me?.joined === false && (
          <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Join the program</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
              You get a personal referral link. Verified purchases earn cash commissions (30-day
              holdback, USDT payouts from $50); clicks and sign-ups earn platform credits.
            </p>
            <label className="mt-5 flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-emerald-600"
              />
              <span>
                I have read and accept the{' '}
                <a
                  href="/partners/terms/"
                  target="_blank"
                  rel="noopener"
                  className="text-emerald-600 underline underline-offset-4"
                >
                  Tvijo Referral Program Terms
                </a>
                . Acceptance is required to join.
              </span>
            </label>
            <button
              onClick={join}
              disabled={!acceptedTerms || joining}
              className="mt-5 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {joining ? 'Joining…' : 'Join the program'}
            </button>
          </div>
        )}

        {!loading && me?.joined === true && (
          <div className="mt-10 space-y-8">
            {/* Referral link */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Your referral link</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Tier: <span className="font-semibold">{me.tier}</span> · Status:{' '}
                    <span className="font-semibold">{me.status}</span>
                  </p>
                </div>
                <CopyLinkButton link={me.link ?? ''} />
              </div>
              <code className="mt-4 block overflow-x-auto rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-950 dark:bg-slate-800 dark:text-slate-200">
                {me.link}
              </code>
            </div>

            {/* Counters */}
            <div className="grid gap-4 sm:grid-cols-3">
              <StatTile label="Visits (30d)" value={me.visits_30d ?? 0} />
              <StatTile label="Sign-ups" value={me.signups ?? 0} />
              <StatTile label="Purchases" value={me.purchases ?? 0} />
            </div>

            {/* Balances */}
            <div className="grid gap-4 sm:grid-cols-4">
              <StatTile label="Pending" value={`$${me.pending_usd}`} />
              <StatTile label="Matured" value={`$${me.matured_usd}`} />
              <StatTile label="Paid out" value={`$${me.paid_usd}`} />
              <StatTile label="Credits" value={`$${me.credits_usd}`} />
            </div>

            {/* Payout */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Payout</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Matured balance is paid in USDT once it reaches ${me.min_payout_usd}. Save your
                payout address first.
              </p>
              <div className="mt-4 flex flex-wrap items-end gap-3">
                <label className="text-sm text-slate-600 dark:text-slate-400">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Network</span>
                  <select
                    value={network}
                    onChange={(e) => setNetwork(e.target.value)}
                    className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {PAYOUT_NETWORKS.map((n) => (
                      <option key={n.value} value={n.value}>{n.label}</option>
                    ))}
                  </select>
                </label>
                <label className="min-w-[240px] flex-1 text-sm text-slate-600 dark:text-slate-400">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Address</span>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="USDT wallet address"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </label>
                <button
                  onClick={saveAddress}
                  disabled={savingAddress || !address.trim()}
                  className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-500"
                >
                  {savingAddress ? 'Saving…' : 'Save address'}
                </button>
              </div>
              <button
                onClick={requestPayout}
                disabled={!payoutReady || requestingPayout}
                title={payoutReady ? undefined : `Available when matured balance reaches $${me.min_payout_usd}`}
                className="mt-5 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {requestingPayout ? 'Requesting…' : 'Request payout'}
              </button>
            </div>

            {/* Commissions */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Commissions</h2>
              {(me.commissions?.length ?? 0) === 0 ? (
                <p className="mt-3 text-sm text-slate-500">
                  No commissions yet. Share your link — commissions appear here after referred
                  purchases.
                </p>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[480px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-800">
                        <th className="py-2 pr-4">Date</th>
                        <th className="py-2 pr-4">Type</th>
                        <th className="py-2 pr-4">Rate</th>
                        <th className="py-2 pr-4">Amount</th>
                        <th className="py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-600 dark:text-slate-400">
                      {me.commissions!.map((c) => (
                        <tr key={c.id} className="border-b border-slate-100 last:border-b-0 dark:border-slate-800/60">
                          <td className="py-2.5 pr-4">{new Date(c.created_at).toLocaleDateString()}</td>
                          <td className="py-2.5 pr-4">{c.kind === 'first_sale' ? 'First sale' : 'Renewal'}</td>
                          <td className="py-2.5 pr-4">{c.pct}%</td>
                          <td className="py-2.5 pr-4 font-semibold text-slate-950 dark:text-white">${c.amount_usd}</td>
                          <td className="py-2.5">
                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${COMMISSION_STATUS_STYLE[c.status]}`}>
                              {c.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
