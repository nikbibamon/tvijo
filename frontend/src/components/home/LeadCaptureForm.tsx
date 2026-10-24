'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useLocale } from '@/i18n/useLocale';
import { captureLead } from '@/services/trading-api';
import { trackEvent } from '@/components/analytics/GoogleAnalytics';

type LeadCaptureFormProps = {
  /**
   * LeadCapture.source on the backend (apps/trading/views.py: valid_sources).
   * Prefixed sources are also accepted for per-surface attribution:
   * `module_<slug>` (module pages) and `landing_<slug>` (/solutions/* landings).
   * Anything else is coerced to 'contact' server-side.
   */
  source?: 'demo_signup' | 'contact' | 'control_review' | `module_${string}` | `landing_${string}`;
  /** Copy overrides — the exposure report asks for a control review, not a demo. */
  title?: string;
  subtitle?: string;
  submitLabel?: string;
  /** Appended to the message so the operator gets the context (e.g. report link). */
  extraMessage?: string;
  onSuccess?: () => void;
};

function collectUtm(): { utm_source?: string; utm_campaign?: string } {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get('utm_source') || sessionStorage.getItem('utm_source') || undefined,
    utm_campaign: params.get('utm_campaign') || sessionStorage.getItem('utm_campaign') || undefined,
  };
}

export default function LeadCaptureForm({
  source = 'demo_signup',
  title,
  subtitle,
  submitLabel,
  extraMessage,
  onSuccess,
}: LeadCaptureFormProps) {
  const { t, locale } = useLocale();
  const copy = t.home.leadForm;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [telegram, setTelegram] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorText, setErrorText] = useState('');
  const submittingRef = useRef(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submittingRef.current || status === 'sending') return;

    const trimmedEmail = email.trim();
    const trimmedTelegram = telegram.trim();
    if (!trimmedEmail && !trimmedTelegram) {
      setStatus('error');
      setErrorText(copy.errorRequired);
      return;
    }
    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setStatus('error');
      setErrorText(copy.errorEmail);
      return;
    }

    submittingRef.current = true;
    setStatus('sending');
    setErrorText('');
    const result = await captureLead({
      email: trimmedEmail || undefined,
      telegram_username: trimmedTelegram || undefined,
      name: name.trim() || undefined,
      message: [message.trim(), extraMessage].filter(Boolean).join('\n\n') || undefined,
      source,
      page_url: typeof window !== 'undefined' ? window.location.href : undefined,
      referrer: typeof document !== 'undefined' ? document.referrer || undefined : undefined,
      website: honeypot || undefined,
      ...collectUtm(),
    });
    submittingRef.current = false;

    if (result?.ok) {
      setStatus('success');
      trackEvent('generate_lead', { source });
      onSuccess?.();
    } else {
      setStatus('error');
      setErrorText(copy.errorGeneric);
      trackEvent('generate_lead_failed', { source });
    }
  };

  if (status === 'success') {
    return (
      <div
        role="status"
        className="flex h-full min-h-[260px] flex-col items-center justify-center gap-3 p-8 text-center"
      >
        <CheckCircle2 className="h-10 w-10 text-emerald-300" aria-hidden="true" />
        <p className="max-w-xs text-sm leading-6 text-slate-200">{copy.success}</p>
        <div className="mt-2 flex flex-col items-center gap-2">
          <p className="text-xs text-slate-500">{copy.successCta}</p>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs">
            <a
              href="https://t.me/bibamon"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-emerald-300 underline-offset-4 hover:underline"
            >
              {copy.successTelegram}
            </a>
            <span className="text-slate-600">·</span>
            <Link href={`/${locale}/kb`} className="font-semibold text-emerald-300 underline-offset-4 hover:underline">
              {copy.successKb}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const inputClass =
    'w-full rounded-lg border border-white/15 bg-black/25 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-emerald-300/60 focus:ring-2 focus:ring-emerald-400/20';

  return (
    <form onSubmit={onSubmit} noValidate className="relative flex h-full flex-col gap-3 p-6 sm:p-8">
      <h3 className="text-base font-bold text-white">{title ?? copy.title}</h3>
      <p className="text-xs leading-5 text-slate-400">{subtitle ?? copy.subtitle}</p>

      <label className="mt-1 block">
        <span className="mb-1 block text-xs font-semibold text-slate-300">{copy.nameLabel}</span>
        <input
          type="text"
          name="name"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={copy.namePlaceholder}
          className={inputClass}
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-slate-300">{copy.emailLabel}</span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={copy.emailPlaceholder}
          className={inputClass}
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-slate-300">{copy.telegramLabel}</span>
        <input
          type="text"
          name="telegram"
          value={telegram}
          onChange={(e) => setTelegram(e.target.value)}
          placeholder={copy.telegramPlaceholder}
          className={inputClass}
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-slate-300">{copy.messageLabel}</span>
        <textarea
          name="message"
          rows={2}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={copy.messagePlaceholder}
          className={`${inputClass} resize-none`}
        />
      </label>

      {/* Honeypot: visually hidden from humans, still in the DOM for bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
        <label>
          website
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </label>
      </div>

      {status === 'error' && errorText && (
        <p role="alert" className="text-xs font-medium text-red-300">
          {errorText}
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="mt-1 inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-400 px-6 py-3 text-sm font-bold text-[#001b18] shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === 'sending' && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {status === 'sending'
          ? copy.sending
          : submitLabel ?? (source === 'demo_signup' ? copy.submitDemo : copy.submitContact)}
      </button>
    </form>
  );
}
