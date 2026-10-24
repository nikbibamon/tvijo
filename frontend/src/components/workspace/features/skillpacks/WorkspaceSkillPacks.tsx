'use client';

/**
 * Skill packs — the honest SKILL.md storefront
 * (specs/2026-08-hermes-skills-plugins-agents-roadmap.md, slice P0).
 *
 * Catalogue plus authenticated Markdown-only ZIP downloads. Downloading a
 * pack never executes or installs it.
 */

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { WorkspaceIcon } from '@/components/workspace/WorkspaceIcon';
import { useSkillPacks } from '@/components/workspace/features/catalog/useWorkspaceData';
import { parseLocale } from '@/i18n/config';
import { formatTemplate, getWorkspaceCopy } from '@/i18n/workspace';
import type { SkillPack } from '@/types/workspace';
import { workspaceApi } from '@/lib/workspace-api';

/** Tiers come straight from the ai-os security kernel — render them as-is. */
function tierClass(tier: string): string {
  return tier === 'experimental' ? 'is-warning' : 'is-neutral';
}

export default function WorkspaceSkillPacks() {
  const locale = parseLocale(usePathname());
  const copy = getWorkspaceCopy(locale);
  const t = copy.skillPacks;
  const { data, loading, error, reload } = useSkillPacks(locale);
  const packs: SkillPack[] = data?.packs ?? [];
  const [downloading, setDownloading] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState('');

  const downloadPack = async (pack: SkillPack) => {
    setDownloading(pack.key);
    setDownloadError('');
    try {
      const download = await workspaceApi.downloadSkillPack(
        pack.download_url, pack.key);
      const href = URL.createObjectURL(download.blob);
      const anchor = document.createElement('a');
      anchor.href = href;
      anchor.download = download.filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(href);
    } catch (err) {
      setDownloadError(err instanceof Error ? err.message : t.downloadFailed);
    } finally {
      setDownloading(null);
    }
  };

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

      <p className="twk-muted-note">{t.markdownOnly}</p>

      {data ? (
        <section className="twk-admin-panel">
          <header className="twk-admin-panel-head">
            <div>
              <h2>{t.gatewayLabel}</h2>
            </div>
          </header>
          <p>
            <span className={`twk-status-pill ${data.gateway_configured ? 'is-neutral' : 'is-warning'}`}>
              {data.gateway_configured ? t.gatewayConfigured : t.gatewayNotConfigured}
            </span>{' '}
            {data.gateway_configured ? t.gatewayConfiguredNote : t.gatewayNotConfiguredNote}
          </p>
          {data.gateway_configured ? (
            <Link href={`/${locale}/workspace/connections`}>{t.openConnections}</Link>
          ) : null}
        </section>
      ) : null}

      {downloadError ? <div className="twk-data-error" role="alert"><p>{downloadError}</p></div> : null}

      {loading ? (
        <p className="twk-muted-note" role="status">{copy.global.loadingDataAria}</p>
      ) : error ? (
        <section className="twk-admin-panel">
          <p>{t.loadFailed}</p>
          <button
            type="button"
            className="twk-secondary-button"
            onClick={() => void reload()}
          >
            {copy.global.retry}
          </button>
        </section>
      ) : packs.length === 0 ? (
        <section className="twk-admin-panel">
          <h2>{t.emptyTitle}</h2>
          <p>{t.emptyCopy}</p>
        </section>
      ) : (
        <div>
          {packs.map((pack) => (
            <article className="twk-admin-panel" key={pack.key}>
              <header className="twk-admin-panel-head">
                <div>
                  <h2>{pack.title}</h2>
                  <span className={`twk-status-pill ${tierClass(pack.tier)}`}>
                    {pack.tier}
                  </span>
                </div>
              </header>
              <p>{pack.description}</p>
              <p className="twk-muted-note">
                {formatTemplate(t.filesLabel, { count: pack.files })} · {t.versionLabel} {pack.version}
              </p>
              <div className="twk-skillpack-actions">
                <button
                  type="button"
                  className="twk-primary-button"
                  disabled={downloading === pack.key}
                  onClick={() => void downloadPack(pack)}
                >
                  {downloading === pack.key ? t.downloading : t.downloadPack}
                </button>
                <a href="#install">{t.howToLink}</a>
              </div>
            </article>
          ))}
        </div>
      )}

      <section id="install" className="twk-admin-panel">
        <header className="twk-admin-panel-head">
          <div>
            <p className="twk-eyebrow">{t.howToEyebrow}</p>
            <h2>{t.howToTitle}</h2>
            <p>{t.howToSubtitle}</p>
          </div>
        </header>
        <ol className="twk-skillpacks-steps">
          <li><strong>{t.step1Title}.</strong> {t.step1Copy}</li>
          <li><strong>{t.step2Title}.</strong> {t.step2Copy}</li>
          <li><strong>{t.step3Title}.</strong> {t.step3Copy}</li>
          <li><strong>{t.step4Title}.</strong> {t.step4Copy}</li>
        </ol>
      </section>

      <section className="twk-admin-panel">
        <header className="twk-admin-panel-head">
          <div>
            <h2>{t.byokTitle}</h2>
          </div>
        </header>
        <p>{t.byokCopy}</p>
      </section>
    </div>
  );
}
