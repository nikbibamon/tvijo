'use client';

/**
 * Apps & Plugins page — the full solution catalog.
 *
 * The catalog is what the client can buy or switch on; the skill-pack
 * teaser below it links to the honest SKILL.md storefront.
 * specs/2026-08-workspace-solution-catalog-and-assistant.md
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { WorkspaceIcon } from '@/components/workspace/WorkspaceIcon';
import SolutionCatalog, { RequestState, requestStatusLabel } from '@/components/workspace/features/catalog/SolutionCatalog';
import { useCatalog } from '@/components/workspace/features/catalog/useWorkspaceData';
import { parseLocale } from '@/i18n/config';
import { getWorkspaceCopy } from '@/i18n/workspace';

export default function WorkspaceSolutionsLive() {
  const locale = parseLocale(usePathname());
  const copy = getWorkspaceCopy(locale);
  const t = copy.catalog;
  const catalog = useCatalog(locale);
  const requests = catalog.data?.requests || [];

  const solutionName = (solutionId: string) =>
    catalog.data?.solutions.find((solution) => solution.id === solutionId)?.name
    || (solutionId === 'support-escalation' ? t.escalationLabel : solutionId);

  return (
    <div className="twk-admin-page">
      <header className="twk-admin-heading">
        <div>
          <p className="twk-eyebrow">{t.eyebrow}</p>
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
          {locale !== 'en' && locale !== 'uk' && locale !== 'ru' ? (
            <p className="twk-locale-fallback" role="note">
              <WorkspaceIcon name="info" />{copy.global.localeFallback}
            </p>
          ) : null}
        </div>
      </header>

      <SolutionCatalog locale={locale} variant="full" source="catalog" catalog={catalog} />

      <div className="twk-catalog-lower">
        <section className="twk-admin-panel">
          <header className="twk-admin-panel-head"><div><h2>{t.yourRequests}</h2></div></header>
          {requests.length ? (
            <div className="twk-request-list">
              {requests.map((request) => (
                <div className="twk-request-row is-detailed" key={request.id}>
                  <div className="twk-request-headline">
                    <span className="twk-request-name">{solutionName(request.solution_id)}</span>
                    <span className="twk-request-meta">
                      {new Date(request.created_at).toLocaleDateString(
                        locale === 'uk' ? 'uk-UA' : locale === 'ru' ? 'ru-RU' : 'en-GB',
                        { day: 'numeric', month: 'short' },
                      )}
                    </span>
                    <span className={`twk-status-pill is-${request.status === 'done' ? 'ready' : 'neutral'}`}>
                      {requestStatusLabel(t, request.status)}
                    </span>
                  </div>
                  <RequestState copy={t} request={request} />
                </div>
              ))}
            </div>
          ) : (
            <p className="twk-muted-note">{t.noRequests}</p>
          )}
        </section>

        <section className="twk-admin-panel twk-plugins-teaser">
          <header className="twk-admin-panel-head"><div><h2>{copy.skillPacks.title}</h2></div></header>
          <p>{copy.skillPacks.subtitle}</p>
          <Link className="twk-secondary-button" href={`/${locale}/workspace/plugins`}>
            {copy.skillPacks.cta}<WorkspaceIcon name="arrow" />
          </Link>
        </section>
      </div>
    </div>
  );
}
