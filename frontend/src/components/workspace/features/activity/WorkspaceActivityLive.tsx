'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { workspaceApi } from '@/lib/workspace-api';
import { useWorkspaceData } from '@/hooks/use-workspace-data';
import { MetricCard, WsEmpty, WsError, WsSnippet } from '@/components/workspace/ui/primitives';
import { parseLocale } from '@/i18n/config';
import { getWorkspaceCopy } from '@/i18n/workspace';

export default function WorkspaceActivityLive() {
  const locale = parseLocale(usePathname());
  const t = getWorkspaceCopy(locale).activity;
  const RANGES = { '7d': t.range7, '30d': t.range30, '90d': t.range90 } as const;
  const [range, setRange] = useState<keyof typeof RANGES>('30d');
  const activity = useWorkspaceData(() => workspaceApi.activityOverview({ range }), [range]);
  const data = activity.data;

  return (
    <div className="twk-admin-page">
      <header className="twk-admin-heading"><div><p className="twk-eyebrow">{t.eyebrow}</p><h1>{t.title}</h1><p>{t.subtitle}</p></div><div className="twk-segmented">{Object.entries(RANGES).map(([value, label]) => <button type="button" className={range === value ? 'is-active' : ''} key={value} onClick={() => setRange(value as keyof typeof RANGES)}>{label}</button>)}</div></header>
      {activity.loading ? <WsSnippet kind="metrics" rows={4} /> : null}
      {activity.error ? <WsError message={activity.error} onRetry={activity.reload} /> : null}
      {data ? <><div className="twk-kpi-grid"><MetricCard label={t.spend} value={`$${data.metrics.spend}`} detail={t.paidToProviders} /><MetricCard label={t.requests} value={data.metrics.requests} /><MetricCard label={t.inputTokens} value={data.metrics.input_tokens} /><MetricCard label={t.outputTokens} value={data.metrics.output_tokens} /></div><div className="twk-overview-grid"><section className="twk-admin-panel"><header className="twk-admin-panel-head"><div><h2>{t.topModels}</h2></div></header>{data.top_models.length ? <div className="twk-admin-table">{data.top_models.map((item) => <div className="twk-admin-tr" key={item.model}><span>{item.model || t.unknown}</span><span>${item.cost}</span></div>)}</div> : <WsEmpty title={t.noModelActivity} copy={t.noModelActivityCopy} />}</section><section className="twk-admin-panel"><header className="twk-admin-panel-head"><div><h2>{t.topProviders}</h2></div></header>{data.top_providers.length ? <div className="twk-admin-table">{data.top_providers.map((item) => <div className="twk-admin-tr" key={item.provider}><span>{item.provider || t.unknown}</span><span>${item.cost}</span></div>)}</div> : <WsEmpty title={t.noProviderActivity} copy={t.noProviderActivityCopy} />}</section></div></> : null}
    </div>
  );
}
