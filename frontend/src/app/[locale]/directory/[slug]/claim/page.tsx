'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import Navbar from '@/components/portal/Navbar';
import Footer from '@/components/portal/Footer';

function domainFromSlug(slug: string) {
  return slug.split('-').slice(0, 3).join('-') || 'example';
}

export default function DirectoryClaimPage() {
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const slug = (params.slug as string) || 'company';
  const demoDomain = `${domainFromSlug(slug)}.com`;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
        <Link href={`/${locale}/directory/${slug}`} className="text-sm text-emerald-300 hover:text-emerald-200">
          Back to company profile
        </Link>

        <section className="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">Claim Company</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">Claim & Verify Domain</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
            Claiming a profile starts the TVIJO AI OS onboarding path: verify domain ownership, create an organization,
            create an AI OS project, run an AI risk audit, then open the demo workspace.
          </p>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <div className="rounded-3xl border border-white/10 bg-[#101018] p-6">
            <h2 className="text-xl font-semibold">Ownership request</h2>
            <div className="mt-5 grid gap-4">
              <label className="block">
                <span className="text-sm text-slate-400">Company domain</span>
                <input
                  value={demoDomain}
                  readOnly
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white"
                />
              </label>
              <label className="block">
                <span className="text-sm text-slate-400">Work email for claim notices</span>
                <input
                  placeholder={`admin@${demoDomain}`}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white placeholder:text-slate-600"
                />
              </label>
              <p className="rounded-xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm leading-6 text-amber-100">
                Free email domains like gmail.com, yahoo.com or personal mailboxes are not enough for ownership verification.
                Use DNS, HTML meta tag, well-known file or domain email fallback.
              </p>
              <Link
                href={`/${locale}/directory/${slug}/verify`}
                className="rounded-xl bg-emerald-400 px-5 py-3 text-center text-sm font-semibold text-[#001b18] hover:bg-emerald-300"
              >
                Continue to Domain Verification
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-6">
            <h2 className="text-xl font-semibold">AI OS project after verification</h2>
            <div className="mt-5 space-y-3 text-sm text-emerald-50/90">
              <p>Organization ID: <span className="font-mono text-emerald-200">org_demo_{slug.slice(0, 8)}</span></p>
              <p>Project ID: <span className="font-mono text-emerald-200">prj_demo_aios</span></p>
              <p>Verified domain: <span className="font-mono text-emerald-200">{demoDomain}</span></p>
              <p>Gateway URL: <span className="font-mono text-emerald-200">https://api.tvijo.com/v1</span></p>
            </div>
            <p className="mt-5 text-sm leading-6 text-emerald-100/80">
              API keys are demo placeholders only in this slice. Production keys must be hash-only stored and shown once.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
