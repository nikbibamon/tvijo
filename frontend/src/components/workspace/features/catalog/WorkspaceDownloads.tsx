'use client';

/**
 * Apps & downloads: client channels with their own, independently published versions.
 * Only the extension version is read live (the same public release record the changelog
 * uses); native editors and CLI link to the download page, which carries their exact
 * versions, checksums and verification limits. Nothing here is inferred or hard-coded.
 */
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { parseLocale } from '@/i18n/config';

type Release = { version?: string; publishedAt?: string; status?: string; downloadPage?: string; changelog?: string };

const COPY = {
  en: {
    eyebrow: 'CLIENTS · DOWNLOADS', title: 'Apps & downloads', loading: 'Checking the published release…', unavailable: 'Release record unavailable; use the download page.',
    ext: 'VS Code / VSCodium extension (VSIX)', extNote: 'Published', changes: 'Changes', page: 'Download page',
    native: 'Tvijo Code editor (Windows, macOS, Linux)', nativeNote: 'See the download page for each platform’s version and verification status.',
    cli: 'Linux CLI and MCP server', cliNote: 'Separate versions; see the download page and the MCP registry entry.',
    note: 'Channels are published independently. A newer extension does not mean the editors bundle it.',
  },
  ru: {
    eyebrow: 'КЛИЕНТЫ · ЗАГРУЗКИ', title: 'Приложения и загрузки', loading: 'Проверяем опубликованный выпуск…', unavailable: 'Запись о выпуске недоступна; откройте страницу загрузок.',
    ext: 'Расширение VS Code / VSCodium (VSIX)', extNote: 'Опубликовано', changes: 'Изменения', page: 'Страница загрузок',
    native: 'Редактор Tvijo Code (Windows, macOS, Linux)', nativeNote: 'Версия и статус проверки каждой платформы указаны на странице загрузок.',
    cli: 'Linux CLI и MCP-сервер', cliNote: 'Отдельные версии; смотрите страницу загрузок и запись в реестре MCP.',
    note: 'Каналы публикуются независимо. Более новое расширение не означает, что оно уже встроено в редакторы.',
  },
  uk: {
    eyebrow: 'КЛІЄНТИ · ЗАВАНТАЖЕННЯ', title: 'Застосунки й завантаження', loading: 'Перевіряємо опублікований випуск…', unavailable: 'Запис про випуск недоступний; відкрийте сторінку завантажень.',
    ext: 'Розширення VS Code / VSCodium (VSIX)', extNote: 'Опубліковано', changes: 'Зміни', page: 'Сторінка завантажень',
    native: 'Редактор Tvijo Code (Windows, macOS, Linux)', nativeNote: 'Версію та стан перевірки кожної платформи вказано на сторінці завантажень.',
    cli: 'Linux CLI і MCP-сервер', cliNote: 'Окремі версії; дивіться сторінку завантажень і запис у реєстрі MCP.',
    note: 'Канали публікуються незалежно. Новіше розширення не означає, що воно вже вбудоване в редактори.',
  },
} as const;

export default function WorkspaceDownloads() {
  const route = parseLocale(usePathname());
  const t = COPY[route === 'ru' || route === 'uk' ? route : 'en'];
  const [state, setState] = useState<{ status: 'loading' | 'ready' | 'unavailable'; release?: Release }>({ status: 'loading' });
  useEffect(() => {
    let live = true;
    fetch('/api/connected-extension-release', { cache: 'no-store', credentials: 'omit' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((release: Release) => {
        if (!live) return;
        const valid = release?.status === 'published' && typeof release.version === 'string' && /^\d+\.\d+\.\d+$/.test(release.version);
        setState(valid ? { status: 'ready', release } : { status: 'unavailable' });
      })
      .catch(() => { if (live) setState({ status: 'unavailable' }); });
    return () => { live = false; };
  }, []);
  const download = 'https://dsh.tvijo.com/download';
  const r = state.release;
  return (
    <section className="twk-admin-panel" aria-label={t.title} data-testid="workspace-downloads">
      <header className="twk-admin-panel-head"><div><p className="twk-eyebrow">{t.eyebrow}</p><h2>{t.title}</h2></div></header>
      <div className="twk-link-list">
        <a className="twk-link-item" href={`${download}#vscode`} target="_blank" rel="noreferrer">
          <span className="twk-link-item-title">{t.ext} ↗</span>
          <span className="twk-link-item-text">
            {state.status === 'loading' ? t.loading : state.status === 'ready' && r
              ? `${r.version} · ${t.extNote} ${r.publishedAt || ''}`.trim()
              : t.unavailable}
          </span>
        </a>
        <a className="twk-link-item" href={`${download}#windows`} target="_blank" rel="noreferrer">
          <span className="twk-link-item-title">{t.native} ↗</span>
          <span className="twk-link-item-text">{t.nativeNote}</span>
        </a>
        <a className="twk-link-item" href={`${download}#linux`} target="_blank" rel="noreferrer">
          <span className="twk-link-item-title">{t.cli} ↗</span>
          <span className="twk-link-item-text">{t.cliNote}</span>
        </a>
      </div>
      <p className="twk-panel-footnote">{t.note}</p>
    </section>
  );
}
