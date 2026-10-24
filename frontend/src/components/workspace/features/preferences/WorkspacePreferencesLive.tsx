'use client';

/**
 * Preferences — only settings the backend actually persists (ТЗ §10).
 *
 * Profile fields stay on /auth/me/. There are no analytics-cookie or
 * browser-notification toggles here, because no such integration exists to
 * back them; drawing them would be a fake control.
 */

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { workspaceApi } from '@/lib/workspace-api';
import { useWorkspaceData } from '@/hooks/use-workspace-data';
import { WsError, WsSnippet } from '@/components/workspace/ui/primitives';
import { parseLocale } from '@/i18n/config';
import { getWorkspaceCopy, formatTemplate } from '@/i18n/workspace';
import type {
  WorkspaceActivityRange,
  WorkspaceDateFormat,
} from '@/types/workspace';

const DATE_FORMATS: Array<{ value: WorkspaceDateFormat; label: string }> = [
  { value: 'iso', label: 'YYYY-MM-DD' },
  { value: 'eu', label: 'DD.MM.YYYY' },
  { value: 'us', label: 'MM/DD/YYYY' },
];

/** IANA zones from the platform; falls back to a small list if unavailable. */
function timezoneOptions(): string[] {
  const intl = Intl as typeof Intl & { supportedValuesOf?: (k: string) => string[] };
  try {
    const values = intl.supportedValuesOf?.('timeZone');
    if (values && values.length) return values;
  } catch {
    /* older engines: fall through */
  }
  return ['UTC', 'Europe/Kiev', 'Europe/Berlin', 'Europe/London',
    'America/New_York', 'America/Los_Angeles', 'Asia/Singapore'];
}

export default function WorkspacePreferencesLive() {
  const locale = parseLocale(usePathname());
  const t = getWorkspaceCopy(locale).preferences;
  const { data, loading, error, reload } = useWorkspaceData(
    () => workspaceApi.preferences(), []);

  const [timezone, setTimezone] = useState('UTC');
  const [dateFormat, setDateFormat] = useState<WorkspaceDateFormat>('iso');
  const [range, setRange] = useState<WorkspaceActivityRange>('30d');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!data) return;
    setTimezone(data.timezone);
    setDateFormat(data.date_format);
    setRange(data.default_activity_range);
  }, [data]);

  const dirty = Boolean(data) && (
    timezone !== data?.timezone
    || dateFormat !== data?.date_format
    || range !== data?.default_activity_range);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setSaved(false);
    setSaveError(null);
    try {
      const updated = await workspaceApi.updatePreferences({
        timezone,
        date_format: dateFormat,
        default_activity_range: range,
      });
      setSavedAt(updated.updated_at);
      setSaved(true);
      void reload();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : t.couldNotSave);
    } finally {
      setSaving(false);
    }
  }

  const zones = timezoneOptions();

  return (
    <div className="twk-admin-page">
      <header className="twk-admin-heading">
        <div>
          <p className="twk-eyebrow">{t.eyebrow}</p>
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </div>
      </header>

      {loading ? <WsSnippet kind="table" rows={3} /> : null}
      {error ? <WsError message={error} onRetry={reload} /> : null}

      {data ? (
        <form className="twk-admin-panel twk-form" onSubmit={save}>
          <header className="twk-admin-panel-head">
            <div><h2>{t.display}</h2></div>
          </header>

          <label className="twk-field">
            <span>{t.timezone}</span>
            <input
              list="twk-tz-list"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              autoComplete="off"
              spellCheck={false}
            />
            <datalist id="twk-tz-list">
              {zones.map((z) => <option key={z} value={z} />)}
            </datalist>
            <small>{t.tzHelp}</small>
          </label>

          <label className="twk-field">
            <span>{t.dateFormat}</span>
            <select
              value={dateFormat}
              onChange={(e) => setDateFormat(e.target.value as WorkspaceDateFormat)}
            >
              {DATE_FORMATS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </label>

          <label className="twk-field">
            <span>{t.defaultRange}</span>
            <select
              value={range}
              onChange={(e) => setRange(e.target.value as WorkspaceActivityRange)}
            >
              {[['7d', t.range7], ['30d', t.range30], ['90d', t.range90]].map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>

          {saveError ? <p className="twk-form-error" role="alert">{saveError}</p> : null}

          <div className="twk-form-actions">
            <button type="submit" className="twk-btn is-primary" disabled={!dirty || saving}>
              {saving ? t.saving : t.savePrefs}
            </button>
            {saved && !dirty && savedAt ? (
              <span className="twk-form-note" role="status">
                {formatTemplate(t.saved, {
                  date: new Date(savedAt).toLocaleString(
                    locale === 'uk' ? 'uk-UA' : locale === 'ru' ? 'ru-RU' : 'en-GB',
                  ),
                })}
              </span>
            ) : null}
          </div>
        </form>
      ) : null}
    </div>
  );
}
