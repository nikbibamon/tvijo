import type { Metadata } from 'next';
import Navbar from '@/components/portal/Navbar';
import Footer from '@/components/portal/Footer';

// Apex (non-localized) route: https://tvijo.com/partners must serve indexable
// HTML directly — it is the mutual-backlink target for bibamoney.com/partnership.
// EN-only, same policy as /partners/terms/.

const TIERS = [
  {
    name: 'Starter',
    firstSale: '10%',
    renewals: '5%',
    how: 'Default tier — everyone starts here after joining the program.',
  },
  {
    name: 'Pro',
    firstSale: '15%',
    renewals: '7%',
    how: 'Granted after 3 qualified referred customers.',
  },
  {
    name: 'Partner',
    firstSale: '20%',
    renewals: '10%',
    how: 'Manual upgrade for proven partners (10+ qualified customers).',
  },
];

const COMMITMENTS = [
  {
    title: 'Money only for conversions',
    body:
      'Cash commissions are paid for verified purchases after a 30-day holdback. Clicks and sign-ups earn non-withdrawable platform credits — never cash. Credits are not a token.',
  },
  {
    title: 'One attribution, forever',
    body:
      'A referred user is attributed to one partner once; existing attributions are never rewritten. Self-referral is blocked. Refunds reverse the related commission.',
  },
  {
    title: 'Emails never leak',
    body:
      'Between our systems emails travel only over signed server-to-server APIs and are stored hashed and masked. Partners see aggregates, never raw contact data. There is no export path.',
  },
  {
    title: 'Verifiable by design',
    body:
      'The platform ships in public: the development changelog is open, and program rules are enforced in code on both sides — not just written in policy.',
  },
];

export const metadata: Metadata = {
  title: 'Partners — Tvijo AIOS Powers Real Products',
  description:
    'The Tvijo AIOS partner ecosystem: products built on the platform, the public partnership record with BibaMoney, and a referral program paying 10–20% of license sales.',
  alternates: {
    canonical: 'https://tvijo.com/partners',
  },
  openGraph: {
    type: 'website',
    url: 'https://tvijo.com/partners',
    title: 'Partners — Tvijo AIOS Powers Real Products',
    description:
      'Products built on Tvijo AIOS, the public BibaMoney partnership record, and a referral program paying 10–20% of license sales.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Tvijo AIOS partner ecosystem',
      },
    ],
  },
  robots: { index: true, follow: true },
};

export default function PartnersPage() {
  return (
    <div className="bm-page">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 pb-16 pt-32 sm:px-6">
        {/* Hero */}
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">
          Partner ecosystem
        </p>
        <h1 className="mt-3 text-4xl font-bold text-slate-950 dark:text-white">
          Tvijo AIOS powers real products
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-400">
          Tvijo AIOS is an AI operating system for running real products: data pipelines, research
          automation, deterministic safety gates and human-approval workflows. This page is the
          public record of the products built on the platform and of the partner program that
          grows around them.
        </p>

        {/* Built on Tvijo AIOS — mutual backlink section */}
        <section className="mt-14">
          <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">
            Built on Tvijo AIOS
          </h2>
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm leading-7 text-slate-600 dark:text-slate-400">
              The first product built and operated end-to-end on Tvijo AIOS is{' '}
              <a
                href="https://bibamoney.com/partnership"
                className="font-semibold text-emerald-600 underline decoration-emerald-600/40 underline-offset-4 hover:decoration-emerald-600"
              >
                BibaMoney
              </a>{' '}
              — a live financial research platform: market analytics, strategy research with honest
              out-of-sample verdicts, and paper-first trading tools. Its data pipelines, safety
              gates and partner accounting all run on the platform in production.
            </p>
            <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-400">
              The partnership is documented on both sides: BibaMoney keeps its public partnership
              record at{' '}
              <a
                href="https://bibamoney.com/partnership"
                className="text-emerald-600 underline decoration-emerald-600/40 underline-offset-4 hover:decoration-emerald-600"
              >
                bibamoney.com/partnership
              </a>
              , and this page is the matching record on the Tvijo side. One platform, several
              public products — each surface does one job.
            </p>
          </div>
        </section>

        {/* Referral program tiers */}
        <section className="mt-14">
          <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">
            Tvijo referral program
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400">
            Bring customers to the platform and earn a share of every license sale — plus renewals
            for 12 months. Engagement (unique clicks and referred sign-ups) earns non-withdrawable
            platform credits on top, capped daily. Full rules:{' '}
            <a
              href="/partners/terms/"
              className="text-emerald-600 underline decoration-emerald-600/40 underline-offset-4 hover:decoration-emerald-600"
            >
              program terms
            </a>
            .
          </p>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-950 dark:border-slate-800 dark:bg-slate-900 dark:text-white">
                  <th className="px-5 py-3 font-semibold">Tier</th>
                  <th className="px-5 py-3 font-semibold">First license sale</th>
                  <th className="px-5 py-3 font-semibold">Renewals (12 mo)</th>
                  <th className="px-5 py-3 font-semibold">How to get it</th>
                </tr>
              </thead>
              <tbody className="text-slate-600 dark:text-slate-400">
                {TIERS.map((tier) => (
                  <tr
                    key={tier.name}
                    className="border-b border-slate-200 last:border-b-0 dark:border-slate-800"
                  >
                    <td className="px-5 py-4 font-semibold text-slate-950 dark:text-white">
                      {tier.name}
                    </td>
                    <td className="px-5 py-4">{tier.firstSale}</td>
                    <td className="px-5 py-4">{tier.renewals}</td>
                    <td className="px-5 py-4">{tier.how}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-6 text-slate-500 dark:text-slate-500">
            Commissions are calculated on verified paid orders, mature after a 30-day holdback and
            are paid out in USDT from a $50 minimum balance. Credits reward activity and are never
            withdrawable as cash.
          </p>
        </section>

        {/* Enforced commitments */}
        <section className="mt-14">
          <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">
            Public accounting — our commitments
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">
            The rules below are enforced in code on both sides of the partnership, not just written
            in policy.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {COMMITMENTS.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
              >
                <h3 className="text-base font-semibold text-slate-950 dark:text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mt-14 flex flex-wrap gap-3">
          <a
            href="/en/account/referrals"
            className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
          >
            Become a partner
          </a>
          <a
            href="/partners/terms/"
            className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-500"
          >
            Program terms
          </a>
          <a
            href="https://bibamoney.com/partnership"
            className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-500"
          >
            BibaMoney partnership record
          </a>
        </section>
      </main>
      <Footer />
    </div>
  );
}
