'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { LOCALES, LOCALE_META, type Locale } from '@/i18n/config';
import { useLocale } from '@/i18n/useLocale';

export default function HomeLanguageSwitcher({ className = '' }: { className?: string }) {
  const { locale } = useLocale();
  const router = useRouter();
  const pathname = usePathname() || '';
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const switchTo = (newLocale: Locale) => {
    const segments = pathname.split('/');
    if (segments[1] && LOCALES.includes(segments[1] as Locale)) {
      segments[1] = newLocale;
    } else {
      segments.splice(1, 0, newLocale);
    }
    router.push(segments.join('/') || `/${newLocale}`);
    setOpen(false);
  };

  const current = LOCALE_META[locale];

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Change language"
        aria-expanded={open}
        className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
      >
        <span className="text-sm leading-none">{current.flag}</span>
        {current.code.toUpperCase()}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-xl border border-white/10 bg-[#071d24] shadow-[0_18px_50px_rgba(0,0,0,0.45)]">
          {LOCALES.map((loc) => {
            const meta = LOCALE_META[loc];
            const isActive = loc === locale;
            return (
              <button
                key={loc}
                type="button"
                onClick={() => switchTo(loc)}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  isActive ? 'bg-emerald-400/10 font-medium text-emerald-300' : 'text-slate-300 hover:bg-white/[0.06] hover:text-white'
                }`}
              >
                <span className="text-base leading-none">{meta.flag}</span>
                <span>{meta.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
