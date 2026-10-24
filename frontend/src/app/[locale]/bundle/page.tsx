import { permanentRedirect } from 'next/navigation';

export default function LegacyBundleRedirect({
  params,
}: {
  params: { locale: string };
}) {
  const locale = params?.locale || 'en';
  permanentRedirect(`/${locale}/bundles`);
}

