import { PublicClientApplication, type Configuration } from '@azure/msal-browser';

export const MICROSOFT_CLIENT_ID =
  process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID || '';
export const MICROSOFT_TENANT_ID =
  process.env.NEXT_PUBLIC_MICROSOFT_TENANT_ID || 'common';

const API = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

export const MSAL_RETURN_TO_KEY = 'msal_return_to';
export const MSAL_ERROR_KEY = 'msal_error';

export function getMicrosoftRedirectUri(): string {
  if (typeof window !== 'undefined') {
    return (
      process.env.NEXT_PUBLIC_MICROSOFT_REDIRECT_URI ||
      `${window.location.origin}/auth/microsoft/callback`
    );
  }
  return (
    process.env.NEXT_PUBLIC_MICROSOFT_REDIRECT_URI ||
    'https://tvijo.com/auth/microsoft/callback'
  );
}

export function getMsalConfig(): Configuration {
  return {
    auth: {
      clientId: MICROSOFT_CLIENT_ID,
      authority: `https://login.microsoftonline.com/${MICROSOFT_TENANT_ID}`,
      redirectUri: getMicrosoftRedirectUri(),
    },
    cache: {
      cacheLocation: 'localStorage',
      storeAuthStateInCookie: false,
    },
  };
}

export async function createMsalInstance(): Promise<PublicClientApplication> {
  const app = new PublicClientApplication(getMsalConfig());
  await app.initialize();
  return app;
}

export async function exchangeMicrosoftIdToken(idToken: string) {
  const res = await fetch(`${API}/auth/microsoft/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_token: idToken }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || 'Microsoft authentication failed');
  }

  return res.json();
}

export function persistAuthTokens(data: {
  access: string;
  refresh: string;
  email?: string;
  first_name?: string;
}) {
  localStorage.setItem('access_token', data.access);
  localStorage.setItem('refresh_token', data.refresh);
  if (data.email) localStorage.setItem('user_email', data.email);
  if (data.first_name) localStorage.setItem('user_name', data.first_name);
  window.dispatchEvent(new Event('tvijo-auth-changed'));
}

export const MSAL_SCOPES = ['openid', 'profile', 'email', 'User.Read'] as const;
