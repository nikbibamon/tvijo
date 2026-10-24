'use client';

/**
 * Login Page — User authentication
 * Generation: GEN-PORTAL-001
 */

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/portal/Navbar';
import Footer from '@/components/portal/Footer';
import Script from 'next/script';
import {
  createMsalInstance,
  exchangeMicrosoftIdToken,
  persistAuthTokens,
  MICROSOFT_CLIENT_ID,
  MSAL_RETURN_TO_KEY,
  MSAL_SCOPES,
} from '@/lib/microsoft-auth';

const API = process.env.NEXT_PUBLIC_API_URL || '/api/v1';
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '639812511237-ih3lq07nt15shadrkdbnbai6jv8dp30r.apps.googleusercontent.com';

async function readAuthError(res: Response, fallback: string) {
  try {
    const data = await res.json();
    if (typeof data?.detail === 'string') return data.detail;
    if (typeof data?.error === 'string') return data.error;
    const msg = Object.values(data || {}).flat().filter(Boolean).join(', ');
    return msg || fallback;
  } catch {
    return fallback;
  }
}

/**
 * Where a signed-in visitor lands when no explicit destination survived
 * the login: the workspace overview, which is now the single entry.
 * `/dashboard` only redirects here, so sending people through it would
 * cost them a hop.
 */
function defaultDestination(locale: string) {
  return `/${locale}/workspace`;
}

function safeRedirect(raw: string | null, fallback: string) {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return fallback;
  return raw;
}

async function subscribeToNewsletter(email: string, locale: string) {
  const res = await fetch(`${API}/newsletter/subscribe/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      source: `registration_${locale}`,
    }),
  });

  if (!res.ok) {
    throw new Error(await readAuthError(res, 'Newsletter subscription failed'));
  }
}

function LoginPageInner() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = (params?.locale as string) || 'en';
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [newsletterConsent, setNewsletterConsent] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('access_token')) {
      const redirect = safeRedirect(searchParams?.get('redirect'), defaultDestination(locale));
      router.replace(redirect);
    }
  }, [locale, router, searchParams]);

  useEffect(() => {
    const msError = searchParams?.get('microsoft_error');
    if (msError) {
      setError(decodeURIComponent(msError));
    }
  }, [searchParams]);

  // Set initial mode based on URL parameter
  useEffect(() => {
    const mode = searchParams?.get('mode');
    if (mode === 'register') {
      setIsLogin(false);
    } else if (mode === 'login') {
      setIsLogin(true);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        // Login
        const res = await fetch(`${API}/auth/login/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
          throw new Error(await readAuthError(res, 'Invalid credentials'));
        }

        const data = await res.json();
        persistAuthTokens(data);
        
        // Default authenticated landing is the TVIJO AI OS demo workspace.
        router.replace(safeRedirect(searchParams?.get('redirect'), defaultDestination(locale)));
        router.refresh();
      } else {
        // Register
        const res = await fetch(`${API}/auth/register/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            password_confirm: password,
            first_name: firstName,
            last_name: lastName,
            locale,
          }),
        });

        if (!res.ok) {
          throw new Error(await readAuthError(res, 'Registration failed'));
        }

        if (newsletterConsent) {
          try {
            await subscribeToNewsletter(email, locale);
          } catch (newsletterError) {
            console.warn('Newsletter subscription failed:', newsletterError);
          }
        }

        setRegisteredEmail(email);
        setPassword('');
        setRegistrationComplete(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    const targetEmail = registeredEmail || email;
    if (!targetEmail) return;

    setLoading(true);
    setError(null);
    setResendStatus(null);

    try {
      const res = await fetch(`${API}/auth/resend-verification/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail }),
      });

      if (!res.ok) {
        throw new Error(await readAuthError(res, 'Could not resend verification email'));
      }

      setResendStatus('Verification email sent again. Please check your inbox.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not resend verification email');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleResponse = useCallback(async (response: any) => {
    if (!response.credential) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/auth/google/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      });
      if (!res.ok) {
        throw new Error(await readAuthError(res, 'Google authentication failed'));
      }
      const data = await res.json();
      persistAuthTokens(data);
      
      // Default authenticated landing is the TVIJO AI OS demo workspace.
      router.replace(safeRedirect(searchParams?.get('redirect'), defaultDestination(locale)));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google authentication failed');
    } finally {
      setLoading(false);
    }
  }, [locale, router, searchParams]);

  const handleMicrosoftSignIn = useCallback(async () => {
    if (!MICROSOFT_CLIENT_ID) {
      setError('Microsoft Sign-In is not configured');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const redirect = searchParams?.get('redirect');
      sessionStorage.setItem(
        MSAL_RETURN_TO_KEY,
        safeRedirect(redirect, defaultDestination(locale))
      );

      const app = await createMsalInstance();
      const authResult = await app.loginPopup({
        scopes: [...MSAL_SCOPES],
        prompt: 'select_account',
      });

      if (!authResult?.idToken) {
        throw new Error('Microsoft id_token was not returned');
      }

      const data = await exchangeMicrosoftIdToken(authResult.idToken);
      persistAuthTokens(data);
      sessionStorage.removeItem(MSAL_RETURN_TO_KEY);
      router.replace(safeRedirect(redirect, defaultDestination(locale)));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Microsoft authentication failed');
    } finally {
      setLoading(false);
    }
  }, [locale, router, searchParams]);

  // Initialize Google Sign-In button
  useEffect(() => {
    if (!googleLoaded || !googleBtnRef.current) return;
    try {
      (window as any).google?.accounts?.id?.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
        auto_select: false,
      });
      (window as any).google?.accounts?.id?.renderButton(
        googleBtnRef.current,
        {
          type: 'standard',
          theme: 'filled_black',
          size: 'large',
          width: Math.max(240, Math.min(400, googleBtnRef.current.clientWidth || 320)),
          text: 'continue_with',
          shape: 'pill',
          logo_alignment: 'left',
          // See demo/page.tsx: without a locale Google follows the browser, not
          // the page, and an EN page can render a German button.
          locale,
        }
      );
    } catch (e) {
      console.warn('Google Sign-In init failed:', e);
    }
  }, [googleLoaded, handleGoogleResponse, locale]);

  return (
    <div className="bm-page">
      <Navbar />

      <main className="max-w-md mx-auto px-4 pt-32 pb-16">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {isLogin ? 'Sign in to TVIJO AI OS' : 'Join TVIJO AI OS'}
          </h1>
          <p className="text-gray-400">
            {isLogin ? 'Access your AI governance workspace' : 'Create an account to explore the control plane'}
          </p>
        </div>

        {/* Google Identity Services */}
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
          onLoad={() => setGoogleLoaded(true)}
        />
        
        {/* Google Sign-In Button (rendered by GSI) */}
        <div className="mb-6 flex justify-center">
          <div ref={googleBtnRef} className="w-full" />
          {!googleLoaded && (
            <button
              disabled
              className="w-full py-3 px-4 bg-white/10 text-gray-400 font-medium rounded-xl flex items-center justify-center gap-3 cursor-not-allowed"
            >
              <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Loading Google Sign-In...
            </button>
          )}
        </div>

        <div className="mb-4">
          <button
            type="button"
            onClick={handleMicrosoftSignIn}
            disabled={!MICROSOFT_CLIENT_ID || loading}
            className="w-full py-3 px-4 bg-[#2F2F2F] hover:bg-[#3A3A3A] text-white font-medium rounded-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
              <rect x="2" y="2" width="9" height="9" fill="#f25022" />
              <rect x="13" y="2" width="9" height="9" fill="#7fba00" />
              <rect x="2" y="13" width="9" height="9" fill="#00a4ef" />
              <rect x="13" y="13" width="9" height="9" fill="#ffb900" />
            </svg>
            {!MICROSOFT_CLIENT_ID
              ? 'Microsoft Sign-In unavailable'
              : 'Continue with Microsoft'}
          </button>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-slate-50 px-2 text-slate-500 dark:bg-[#031117] dark:text-gray-500">or with email</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        {registrationComplete ? (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-center">
            <h2 className="text-xl font-semibold text-white">Check your email</h2>
            <p className="mt-3 text-sm leading-6 text-gray-300">
              We sent a verification link to{' '}
              <span className="font-medium text-white">{registeredEmail}</span>. Verify your email to activate the account, then sign in to open the AI OS workspace.
            </p>
            {resendStatus && (
              <p className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
                {resendStatus}
              </p>
            )}
            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={loading}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Resend verification email'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setRegistrationComplete(false);
                  setIsLogin(true);
                  setResendStatus(null);
                }}
                className="text-sm text-emerald-400 transition hover:text-emerald-300"
              >
                Back to sign in
              </button>
            </div>
          </div>
        ) : (
          <>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm text-gray-400 mb-1">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400/50 transition-colors"
                  placeholder="John"
                  required={!isLogin}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400/50 transition-colors"
                  placeholder="Doe"
                  required={!isLogin}
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400/50 transition-colors"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400/50 transition-colors"
              placeholder="••••••••"
              required
              minLength={8}
            />
          </div>

          {!isLogin && (
            <label className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left">
              <input
                type="checkbox"
                checked={newsletterConsent}
                onChange={(e) => setNewsletterConsent(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-white/10 bg-white/5 text-emerald-400 focus:ring-emerald-400/50"
              />
              <span className="text-xs leading-5 text-gray-400">
                I agree to receive product updates, AI governance insights and newsletter emails. I can unsubscribe at any time.
              </span>
            </label>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-emerald-400 text-[#001b18] font-semibold rounded-xl hover:bg-emerald-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="animate-pulse">{isLogin ? 'Signing in...' : 'Creating account...'}</span>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
              setResendStatus(null);
            }}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <span className="text-emerald-400 hover:underline">
              {isLogin ? 'Join Free' : 'Sign In'}
            </span>
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-xs text-gray-500">
            By signing up, you agree to our{' '}
            <Link href={`/${locale}/terms`} className="text-gray-400 hover:text-white">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href={`/${locale}/privacy`} className="text-gray-400 hover:text-white">
              Privacy Policy
            </Link>
          </p>
        </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  );
}
