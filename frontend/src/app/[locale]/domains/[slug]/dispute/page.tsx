'use client';

/**
 * Correction / removal request for a domain card.
 * Spec: bibamoney-backend/specs/2026-08-seo-geo-scanner-public-catalog.md §4.8.
 *
 * No account required, on purpose: making someone sign up before they can
 * object to a card about their own domain would be the wrong way round.
 */

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CheckCircle2, Loader2 } from 'lucide-react';
import Navbar from '@/components/portal/Navbar';
import Footer from '@/components/portal/Footer';
import { submitDispute } from '@/services/seo-geo-api';
import { marketingLocale, normalizeLocale } from '@/lib/seo/marketing';
import { catalogCopy } from '@/data/catalog-copy';

type Kind = 'correction' | 'removal' | 'personal';

export default function DisputePage() {
  const params = useParams<{ locale: string; slug: string }>();
  const locale = normalizeLocale(params?.locale || 'en');
  const lang = marketingLocale(locale);
  const copy = catalogCopy[lang].profile;
  const isRu = lang === 'ru';
  const slug = params?.slug || '';

  const [kind, setKind] = useState<Kind>('correction');
  const [reason, setReason] = useState('');
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  const options: { value: Kind; label: string; hint: string }[] = [
    {
      value: 'correction',
      label: isRu ? 'Исправление' : 'Correction',
      hint: isRu
        ? 'Находка неверна или устарела. Карточка сразу выходит из рейтинга до разбора.'
        : 'A finding is wrong or out of date. The card leaves the ranking immediately, before review.',
    },
    {
      value: 'removal',
      label: isRu ? 'Удаление' : 'Removal',
      hint: isRu
        ? 'Убрать карточку из публичного каталога.'
        : 'Take the card out of the public catalogue.',
    },
    {
      value: 'personal',
      label: isRu ? 'Личный / некоммерческий домен' : 'Personal or non-commercial domain',
      hint: isRu
        ? 'Удаляется сразу, без обсуждения.'
        : 'Removed on the spot, without discussion.',
    },
  ];

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (state === 'sending') return;
    setState('sending');
    const ok = await submitDispute(slug, kind, reason.trim(), email.trim() || undefined);
    setState(ok ? 'done' : 'error');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 pb-24 pt-28 sm:px-6">
        <nav className="text-xs text-slate-500">
          <Link href={`/${locale}/domains/${slug}`} className="hover:text-slate-300">
            {slug}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-400">{copy.disputeCta}</span>
        </nav>

        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-white">{copy.disputeTitle}</h1>
        <p className="mt-4 text-sm leading-6 text-slate-300">{copy.disputeBody}</p>

        {state === 'done' ? (
          <div role="status" className="mt-8 flex items-start gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] p-6">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" aria-hidden="true" />
            <p className="text-sm leading-6 text-slate-200">
              {kind === 'personal'
                ? isRu
                  ? 'Карточка удалена из каталога.'
                  : 'The card has been removed from the catalogue.'
                : isRu
                  ? 'Запрос принят, карточка выведена из рейтинга до разбора.'
                  : 'Request received; the card is out of the ranking until it is reviewed.'}
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold text-slate-200">
                {isRu ? 'Что нужно сделать' : 'What should happen'}
              </legend>
              {options.map((option) => (
                <label
                  key={option.value}
                  className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition ${
                    kind === option.value
                      ? 'border-emerald-400/40 bg-emerald-400/[0.06]'
                      : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'
                  }`}
                >
                  <input
                    type="radio"
                    name="kind"
                    value={option.value}
                    checked={kind === option.value}
                    onChange={() => setKind(option.value)}
                    className="mt-1"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-white">{option.label}</span>
                    <span className="mt-1 block text-xs leading-5 text-slate-400">{option.hint}</span>
                  </span>
                </label>
              ))}
            </fieldset>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-slate-300">
                {isRu ? 'Что именно не так' : 'What exactly is wrong'}
              </span>
              <textarea
                rows={4}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                className="w-full rounded-xl border border-white/15 bg-black/30 px-3.5 py-2.5 text-sm text-white outline-none focus:border-emerald-300/60"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-slate-300">
                {isRu ? 'Почта для ответа (необязательно)' : 'Email for a reply (optional)'}
              </span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-white/15 bg-black/30 px-3.5 py-2.5 text-sm text-white outline-none focus:border-emerald-300/60"
              />
            </label>

            {state === 'error' && (
              <p role="alert" className="text-sm text-rose-300">
                {isRu ? 'Не удалось отправить. Попробуйте ещё раз.' : 'Could not submit. Please try again.'}
              </p>
            )}

            <button
              type="submit"
              disabled={state === 'sending'}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-6 py-3 text-sm font-semibold text-[#001b18] transition hover:bg-emerald-300 disabled:opacity-60"
            >
              {state === 'sending' && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              {copy.disputeCta}
            </button>
          </form>
        )}
      </main>
      <Footer />
    </div>
  );
}
