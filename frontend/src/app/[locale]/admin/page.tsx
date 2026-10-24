import { permanentRedirect } from 'next/navigation';

/**
 * Django admin lives at /admin/ (no locale prefix). /en/admin was 404.
 */
export default function LocaleAdminRedirect() {
  permanentRedirect('/admin/');
}
