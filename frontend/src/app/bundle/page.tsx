import { permanentRedirect } from 'next/navigation';

export default function LegacyBundleRootRedirect() {
  permanentRedirect('/en/bundles');
}

