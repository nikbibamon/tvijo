/**
 * Honest placeholder for decision services that have not passed acceptance
 * (People, MyOwnAI, PeopleVsAI). These addresses used to render the home page.
 * No voting, form or data collection here; noindex until the service exists.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/portal/Navbar';
import Footer from '@/components/portal/Footer';

export function serviceNotOpenMetadata(name: string, path: string): Metadata {
  const title = `${name} — not open · Tvijo`;
  const description = `${name} has not launched. A small verifiable experiment comes before any public voting.`;
  return {
    title: { absolute: title },
    description,
    robots: { index: false, follow: true },
    alternates: { canonical: `https://tvijo.com${path}` },
  };
}

export default function ServiceNotOpen({ name }: { name: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 pb-16 pt-28">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">Not open</p>
        <h1 className="text-3xl font-black md:text-4xl">{name} is not open</h1>
        <p className="mt-4 text-gray-300">
          Public voting and this service have not launched. Our review decided that a small, verifiable
          experiment comes first; this address will show the service only after it passes acceptance.
        </p>
        <section lang="ru" className="mt-8 border-t border-white/10 pt-6">
          <h2 className="text-xl font-bold">{name} пока закрыт</h2>
          <p className="mt-3 text-gray-300">
            Публичное голосование и этот сервис не запущены. По итогам разбора сначала проводится небольшой
            проверяемый эксперимент; сервис появится по этому адресу только после приёмки.
          </p>
        </section>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/en" className="rounded-xl bg-emerald-400 px-6 py-3 text-center text-sm font-semibold text-[#001b18] transition hover:bg-emerald-300">
            Tvijo home
          </Link>
          <Link href="/ru" lang="ru" className="rounded-xl border border-white/10 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10">
            Главная Tvijo
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
