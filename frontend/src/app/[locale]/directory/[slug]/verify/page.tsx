'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import Navbar from '@/components/portal/Navbar';
import Footer from '@/components/portal/Footer';

function tokenFromSlug(slug: string) {
  return `demo_${slug.replace(/[^a-z0-9]/gi, '').slice(0, 16) || 'company'}`;
}

export default function DirectoryVerifyPage() {
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const slug = (params.slug as string) || 'company';
  const token = tokenFromSlug(slug);
  const domain = `${slug.split('-').slice(0, 3).join('-') || 'example'}.com`;
  const orgId = `org_demo_${token.slice(-8)}`;
  const projectId = `prj_demo_${token.slice(-6)}`;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
        <Link href={`/${locale}/directory/${slug}/claim`} className="text-sm text-orange-300 hover:text-orange-200">
          Back to claim request
        </Link>

        <section className="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-300">Verification pending</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">Verify domain ownership before activating AI OS</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
            This screen is UI/spec only. Backend verification, token hashing, audit events and organization persistence are not implemented in this slice.
          </p>
        </section>

        <section className="mt-6 grid gap-5 lg:grid-cols-2">
          {[
            {
              title: 'DNS TXT',
              body: `_tvijo-verification.${domain} TXT "tvijo-verify=${token}"`,
            },
            {
              title: 'HTML meta tag',
              body: `<meta name="tvijo-domain-verification" content="${token}">`,
            },
            {
              title: 'Well-known file',
              body: `https://${domain}/.well-known/tvijo-verification.txt\n\nFile content:\ntvijo-verify=${token}`,
            },
            {
              title: 'Domain email fallback',
              body: `Allowed: admin@${domain}, security@${domain}, webmaster@${domain}\nNot enough alone: gmail.com, yahoo.com or unrelated personal email.`,
            },
          ].map((method) => (
            <div key={method.title} className="rounded-3xl border border-white/10 bg-[#101018] p-6">
              <h2 className="text-xl font-semibold">{method.title}</h2>
              <pre className="mt-4 overflow-x-auto whitespace-pre-wrap rounded-2xl border border-white/10 bg-black/30 p-4 text-sm leading-6 text-slate-200">
                {method.body}
              </pre>
            </div>
          ))}
        </section>

        <section className="mt-6 rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">After verified claim</p>
              <h2 className="mt-3 text-2xl font-semibold">Create AI OS organization and project</h2>
              <p className="mt-3 text-sm leading-6 text-emerald-50/80">
                Verified owners should land in TVIJO AI OS workspace or risk audit, not the trading module.
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Link href={`/${locale}/demo`} className="rounded-xl bg-emerald-400 px-5 py-3 text-center text-sm font-semibold text-slate-950">
                  Open AI OS Workspace
                </Link>
                <Link href={`/${locale}/#cta`} className="rounded-xl border border-emerald-300/30 px-5 py-3 text-center text-sm font-semibold text-white">
                  Request Demo
                </Link>
              </div>
            </div>
            <div className="rounded-2xl border border-emerald-300/20 bg-black/20 p-5 text-sm leading-7 text-emerald-50/90">
              <p>Organization ID: <span className="font-mono text-emerald-200">{orgId}</span></p>
              <p>Project ID: <span className="font-mono text-emerald-200">{projectId}</span></p>
              <p>Verified domain: <span className="font-mono text-emerald-200">{domain}</span></p>
              <p>Gateway URL: <span className="font-mono text-emerald-200">https://api.tvijo.com/v1</span></p>
              <p className="mt-3 text-xs text-emerald-100/70">
                TVIJO_API_KEY is intentionally not generated here. Raw secrets must never be stored or rendered after creation.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
