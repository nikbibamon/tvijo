'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

const THEME_STORAGE_KEY = 'tvijo-theme';
const UI_STORAGE_KEY = 'tvijo-ui-mode';

export type SiteThemeMode = 'light' | 'dark';
export type UiSkinMode = 'rich' | 'simple';

type SiteThemeContextValue = {
  theme: SiteThemeMode;
  resolvedTheme: SiteThemeMode;
  setTheme: (theme: SiteThemeMode) => void;
};

type SiteChromeContextValue = {
  uiMode: UiSkinMode;
  setUiMode: (mode: UiSkinMode) => void;
};

const SiteThemeContext = createContext<SiteThemeContextValue | null>(null);
const SiteChromeContext = createContext<SiteChromeContextValue | null>(null);

function applyTheme(theme: SiteThemeMode) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(theme);
  root.style.colorScheme = theme;

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute('content', theme === 'light' ? '#f8fafc' : '#0A0A0F');
  }
}

function UiModeHydration() {
  const ctx = useContext(SiteChromeContext);
  if (!ctx) return null;
  const { uiMode } = ctx;

  useEffect(() => {
    document.documentElement.dataset.ui = uiMode;
  }, [uiMode]);

  return null;
}

export function SiteThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<SiteThemeMode>('dark');
  const [uiMode, setUiModeState] = useState<UiSkinMode>('rich');

  useEffect(() => {
    try {
      const rawTheme = localStorage.getItem(THEME_STORAGE_KEY);
      const storedTheme = rawTheme === 'light' ? 'light' : 'dark';
      setThemeState(storedTheme);
      applyTheme(storedTheme);
    } catch {
      applyTheme('dark');
    }

    try {
      const raw = localStorage.getItem(UI_STORAGE_KEY);
      if (raw === 'simple' || raw === 'rich') {
        setUiModeState(raw);
        document.documentElement.dataset.ui = raw;
      } else {
        document.documentElement.dataset.ui = 'rich';
      }
    } catch {
      document.documentElement.dataset.ui = 'rich';
    }
  }, []);

  const setTheme = useCallback((mode: SiteThemeMode) => {
    setThemeState(mode);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {
      /* ignore */
    }
    applyTheme(mode);
  }, []);

  const setUiMode = useCallback((mode: UiSkinMode) => {
    setUiModeState(mode);
    try {
      localStorage.setItem(UI_STORAGE_KEY, mode);
    } catch {
      /* ignore */
    }
    document.documentElement.dataset.ui = mode;
  }, []);

  const themeValue = useMemo(
    () => ({ theme, resolvedTheme: theme, setTheme }),
    [theme, setTheme],
  );
  const chromeValue = useMemo(() => ({ uiMode, setUiMode }), [uiMode, setUiMode]);

  return (
    <SiteThemeContext.Provider value={themeValue}>
      <SiteChromeContext.Provider value={chromeValue}>
        <UiModeHydration />
        {children}
      </SiteChromeContext.Provider>
    </SiteThemeContext.Provider>
  );
}

export function useTvijoTheme() {
  const ctx = useContext(SiteThemeContext);
  if (!ctx) {
    throw new Error('useTvijoTheme must be used within SiteThemeProvider');
  }
  return ctx;
}

export function useSiteChrome() {
  const ctx = useContext(SiteChromeContext);
  if (!ctx) {
    throw new Error('useSiteChrome must be used within SiteThemeProvider');
  }
  return ctx;
}
