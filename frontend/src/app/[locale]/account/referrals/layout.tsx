/**
 * Partner cabinet route — avoid serving a stale RSC/HTML shell from CDNs that
 * cache by URL. Client bundle still updates via new chunk hashes after deploy.
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function AccountReferralsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
