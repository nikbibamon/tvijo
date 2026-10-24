/** Shared portal JWT helper (localStorage) */
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
}

/** Clear all portal auth state and notify listeners (Navbar, hooks). */
export function logout(): void {
  if (typeof window === 'undefined') return;
  ['access_token', 'refresh_token', 'user_email', 'user_name'].forEach((k) =>
    localStorage.removeItem(k),
  );
  window.dispatchEvent(new Event('tvijo-auth-changed'));
}
