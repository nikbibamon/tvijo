'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  createMsalInstance,
  exchangeMicrosoftIdToken,
  persistAuthTokens,
  MSAL_RETURN_TO_KEY,
  MSAL_ERROR_KEY,
} from '@/lib/microsoft-auth';

export default function MicrosoftCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState('Completing Microsoft sign-in...');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const app = await createMsalInstance();
        const response = await app.handleRedirectPromise();

        if (!response?.idToken) {
          if (window.opener && !window.opener.closed) {
            window.close();
            return;
          }
          throw new Error('Microsoft sign-in did not return a token');
        }

        const data = await exchangeMicrosoftIdToken(response.idToken);
        persistAuthTokens(data);

        const returnTo =
          sessionStorage.getItem(MSAL_RETURN_TO_KEY) || '/en/profile';
        sessionStorage.removeItem(MSAL_RETURN_TO_KEY);
        sessionStorage.removeItem(MSAL_ERROR_KEY);

        if (window.opener && !window.opener.closed) {
          window.opener.location.assign(returnTo);
          window.close();
          return;
        }

        if (!cancelled) {
          router.replace(returnTo);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Microsoft sign-in failed';
        sessionStorage.setItem(MSAL_ERROR_KEY, errorMessage);

        const returnTo =
          sessionStorage.getItem(MSAL_RETURN_TO_KEY) || '/en/login';
        const target = `${returnTo}${returnTo.includes('?') ? '&' : '?'}microsoft_error=${encodeURIComponent(errorMessage)}`;

        if (window.opener && !window.opener.closed) {
          window.opener.location.assign(target);
          window.close();
          return;
        }

        if (!cancelled) {
          router.replace(target);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <p className="text-gray-300 animate-pulse">{message}</p>
    </div>
  );
}
