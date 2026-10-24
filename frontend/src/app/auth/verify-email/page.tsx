'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

async function readVerificationError(res: Response) {
  try {
    const data = await res.json();
    if (typeof data?.error === 'string') return data.error;
    if (typeof data?.detail === 'string') return data.detail;
  } catch {
    // Fall through to the generic message below.
  }
  return 'Email verification failed';
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams?.get('token') || '';
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    let cancelled = false;

    async function verifyEmail() {
      if (!token) {
        setStatus('error');
        setMessage('Verification token is missing.');
        return;
      }

      try {
        const res = await fetch(`${API}/auth/verify-email/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        if (!res.ok) {
          throw new Error(await readVerificationError(res));
        }

        if (!cancelled) {
          setStatus('success');
          setMessage('Your email is verified. You can now sign in.');
        }
      } catch (err) {
        if (!cancelled) {
          setStatus('error');
          setMessage(err instanceof Error ? err.message : 'Email verification failed');
        }
      }
    }

    verifyEmail();

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center shadow-2xl shadow-black/30">
        <div
          className={`mx-auto flex h-12 w-12 items-center justify-center rounded-2xl text-xl ${
            status === 'success'
              ? 'bg-emerald-500/15 text-emerald-300'
              : status === 'error'
                ? 'bg-red-500/15 text-red-300'
                : 'bg-orange-500/15 text-orange-300'
          }`}
        >
          {status === 'success' ? 'OK' : status === 'error' ? '!' : '...'}
        </div>
        <h1 className="mt-5 text-2xl font-bold">Email verification</h1>
        <p className="mt-3 text-sm leading-6 text-gray-300">{message}</p>
        <Link
          href="/en/login"
          className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-[#001b18] transition hover:bg-emerald-300"
        >
          Go to sign in
        </Link>
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
          <p className="text-sm text-gray-300">Loading verification...</p>
        </main>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
