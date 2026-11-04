'use client';

/**
 * Server-access permissions as checkboxes, rendered from the one catalog
 * remdesk serves at GET /permissions (same file the consent page, dsh, the
 * VSIX and tvijocode read). Nothing here grants access: the choice is handed
 * to the remdesk consent page, which checks the same rules server-side.
 */

import { useEffect, useMemo, useState } from 'react';

type Text = { en: string; ru: string };
type Capability = {
  id: string;
  scope: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  min_plan: string;
  default_checked: boolean;
  explicit_click: boolean;
  label: Text;
  risk: Text;
  guard: Text;
};
type AgreementDoc = {
  id: string;
  status: string;
  version: string;
  url: string;
  required_for: string[];
  label: Text;
};
type Catalog = {
  capabilities: Capability[];
  documents: AgreementDoc[];
  host_ceiling?: string[];
  plans: Record<string, Plan>;
};
type Plan = { rank: number; billing: string; self_hosted?: boolean; price: Text; includes: Text };

const PLAN_NAMES: Record<string, string> = { pro: 'Pro', pro_full: 'Pro Full', lifetime: 'Lifetime' };

/** A higher-ranked monthly plan includes every box a lower one sells. */
export function planCovers(plans: Record<string, Plan>, have: string, want: string) {
  if (!want || want === 'free') return true;
  const h = plans[have];
  const w = plans[want];
  return Boolean(h && w && !h.self_hosted && h.rank >= w.rank);
}

export const REMDESK_URL = process.env.NEXT_PUBLIC_REMDESK_URL || 'https://mcp.tvijo.com';
const PLATFORM_CONNECTIONS = 'https://platform.tvijo.com/connections';

const UI = {
  en: {
    title: 'Server access for assistants',
    lead: 'Tick what ChatGPT or Claude may do on your server. Each box shows what can go wrong and what limits it. You confirm the final choice on the consent page.',
    agreements: 'Agreements',
    plans: 'Plans',
    risk: 'Risk',
    guard: 'Limited by',
    owner: 'not allowed on this host',
    unpublished: 'not published yet',
    requiredFor: 'required for',
    upgrade: 'Deploy is part of Pro ($20), full access of Pro Full ($35). Lifetime ($255 once) installs remdesk on your own server.',
    missingDocs: 'Tick the agreements for the boxes you chose.',
    continue: 'Continue to connections',
    unavailable: 'The permission catalog is unavailable right now.',
  },
  ru: {
    title: 'Доступ ассистентов к серверу',
    lead: 'Отметьте, что ChatGPT или Claude может делать на вашем сервере. У каждой галочки указано, что может пойти не так и чем это ограничено. Окончательный выбор подтверждается на странице согласия.',
    agreements: 'Соглашения',
    plans: 'Тарифы',
    risk: 'Риск',
    guard: 'Ограничено',
    owner: 'на этом хосте не разрешено',
    unpublished: 'ещё не опубликовано',
    requiredFor: 'нужно для',
    upgrade: 'Выкладка входит в Pro ($20), полный доступ в Pro Full ($35). Lifetime ($255 разово) ставит remdesk на ваш сервер.',
    missingDocs: 'Отметьте соглашения для выбранных галочек.',
    continue: 'Перейти к подключениям',
    unavailable: 'Каталог прав сейчас недоступен.',
  },
} as const;

export function choiceState(catalog: Catalog, chosen: string[], agreed: string[], plan: string) {
  const needsPro = catalog.capabilities.some(
    (c) => chosen.includes(c.id) && !planCovers(catalog.plans, plan, c.min_plan),
  );
  const missing = catalog.documents.filter(
    (d) => d.required_for.some((id) => chosen.includes(id)) && !agreed.includes(`${d.id}@${d.version}`),
  );
  const scope = chosen.map((id) => `mcp:${id}`).sort().join(' ');
  return { needsPro, missing, scope, ready: chosen.length > 0 && missing.length === 0 };
}

export default function RemdeskPermissions({ locale, plan = 'free' }: { locale: string; plan?: string }) {
  const lang: 'en' | 'ru' = locale === 'ru' || locale === 'uk' ? 'ru' : 'en';
  const t = UI[lang];
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [failed, setFailed] = useState(false);
  const [chosen, setChosen] = useState<string[]>([]);
  const [agreed, setAgreed] = useState<string[]>([]);

  useEffect(() => {
    let alive = true;
    fetch(`${REMDESK_URL}/permissions`, { credentials: 'omit' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data: Catalog) => {
        if (!alive) return;
        setCatalog(data);
        const ceiling = data.host_ceiling;
        setChosen(data.capabilities
          .filter((c) => c.default_checked && (!ceiling || ceiling.includes(c.id)))
          .map((c) => c.id));
      })
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, []);

  const state = useMemo(
    () => (catalog ? choiceState(catalog, chosen, agreed, plan) : null),
    [catalog, chosen, agreed, plan],
  );

  if (failed) return <section className="twk-admin-panel"><p className="is-muted">{t.unavailable}</p></section>;
  if (!catalog || !state) return null;

  const toggle = (list: string[], set: (v: string[]) => void, value: string) =>
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  const continueUrl = `${PLATFORM_CONNECTIONS}?scope=${encodeURIComponent(state.scope)}`;

  return (
    <section className="twk-admin-panel twk-permissions" aria-labelledby="twk-permissions-title">
      <h2 id="twk-permissions-title">{t.title}</h2>
      <p>{t.lead}</p>
      <fieldset>
        {catalog.capabilities.map((c) => {
          const allowed = !catalog.host_ceiling || catalog.host_ceiling.includes(c.id);
          return (
            <div key={c.id} className={`twk-permission is-${c.risk_level}`}>
              <label>
                <input
                  type="checkbox"
                  name="cap"
                  value={c.id}
                  disabled={!allowed}
                  checked={chosen.includes(c.id)}
                  onChange={() => toggle(chosen, setChosen, c.id)}
                />{' '}
                {c.label[lang]}
                {c.min_plan !== 'free' ? <span className="twk-chip">{PLAN_NAMES[c.min_plan] || c.min_plan}</span> : null}
                {!allowed ? <small> ({t.owner})</small> : null}
              </label>
              <p className="twk-permission-risk">{t.risk}: {c.risk[lang]}</p>
              <p className="twk-permission-guard">{t.guard}: {c.guard[lang]}</p>
            </div>
          );
        })}
      </fieldset>
      <fieldset>
        <legend>{t.plans}</legend>
        {Object.entries(catalog.plans)
          .sort(([, a], [, b]) => a.rank - b.rank)
          .map(([id, p]) => (
            <p key={id} className={id === plan ? 'twk-permission-plan is-current' : 'twk-permission-plan'}>
              <strong>{p.price[lang]}</strong> · {p.includes[lang]}
            </p>
          ))}
      </fieldset>
      <fieldset>
        <legend>{t.agreements}</legend>
        {catalog.documents.map((d) => {
          const published = d.status === 'published' && d.url;
          if (!published) {
            return <p key={d.id} className="is-muted"><small>{d.label[lang]}: {t.unpublished}</small></p>;
          }
          const link = <a href={d.url} target="_blank" rel="noopener noreferrer">{d.label[lang]}</a>;
          if (d.required_for.length === 0) return <p key={d.id}>{link}</p>;
          const key = `${d.id}@${d.version}`;
          return (
            <label key={d.id} className="twk-permission-doc">
              <input
                type="checkbox"
                name="agree"
                value={key}
                checked={agreed.includes(key)}
                onChange={() => toggle(agreed, setAgreed, key)}
              />{' '}
              {link} <small>({t.requiredFor}: {d.required_for.join(', ')})</small>
            </label>
          );
        })}
      </fieldset>
      {state.needsPro ? <p role="status">{t.upgrade}</p> : null}
      {!state.ready && state.missing.length > 0 ? <p role="status">{t.missingDocs}</p> : null}
      <p>
        <a
          className={`twk-primary-button${state.ready ? '' : ' is-disabled'}`}
          aria-disabled={!state.ready}
          href={state.ready ? continueUrl : undefined}
        >
          {t.continue}
        </a>
      </p>
    </section>
  );
}
