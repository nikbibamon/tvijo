'use client';

import { Check, LayoutTemplate, Moon, Sparkles, Sun } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useSiteChrome, useTvijoTheme } from './SiteThemeProvider';

export default function DisplayPreferencesMenu() {
  const { theme, setTheme, resolvedTheme } = useTvijoTheme();
  const { uiMode, setUiMode } = useSiteChrome();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const effectiveTheme = mounted ? (resolvedTheme ?? theme ?? 'dark') : 'dark';

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-200/90 bg-white/80 px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm backdrop-blur-sm transition-colors hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:hover:bg-white/10 simple:rounded-md simple:px-2 simple:py-1 simple:shadow-none"
        aria-expanded={open}
        aria-haspopup="true"
        title="Display"
      >
        <Sparkles className="h-3.5 w-3.5 opacity-80" aria-hidden />
        <span className="hidden sm:inline">Display</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-[60] mt-2 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 dark:border-emerald-400/15 dark:bg-[#071d24] dark:shadow-black/40 simple:rounded-md simple:shadow-md">
          <div className="border-b border-slate-100 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:border-white/5 dark:text-gray-500">
            Theme
          </div>
          <div className="p-1.5">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-slate-800 hover:bg-slate-50 dark:text-gray-200 dark:hover:bg-white/5"
            >
              <Sun className="h-4 w-4 shrink-0 text-amber-500" />
              <span className="flex-1">Light</span>
              {effectiveTheme === 'light' && <Check className="h-4 w-4 text-emerald-500" />}
            </button>
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-slate-800 hover:bg-slate-50 dark:text-gray-200 dark:hover:bg-white/5"
            >
              <Moon className="h-4 w-4 shrink-0 text-indigo-400" />
              <span className="flex-1">Dark</span>
              {effectiveTheme === 'dark' && <Check className="h-4 w-4 text-emerald-500" />}
            </button>
          </div>

          <div className="border-b border-slate-100 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:border-white/5 dark:text-gray-500">
            Layout
          </div>
          <div className="p-1.5 pb-2">
            <button
              type="button"
              onClick={() => setUiMode('rich')}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-slate-800 hover:bg-slate-50 dark:text-gray-200 dark:hover:bg-white/5"
            >
              <Sparkles className="h-4 w-4 shrink-0 text-emerald-400" />
              <span className="flex-1">Rich (default)</span>
              {uiMode === 'rich' && <Check className="h-4 w-4 text-emerald-500" />}
            </button>
            <button
              type="button"
              onClick={() => setUiMode('simple')}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-slate-800 hover:bg-slate-50 dark:text-gray-200 dark:hover:bg-white/5"
            >
              <LayoutTemplate className="h-4 w-4 shrink-0 text-slate-500 dark:text-gray-400" />
              <span className="flex-1">Simple</span>
              {uiMode === 'simple' && <Check className="h-4 w-4 text-emerald-500" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
