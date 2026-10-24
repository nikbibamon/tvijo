'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';

import type { PlotParams } from 'react-plotly.js';
import { kbAnalyticsApi, type AnalyticsOutput } from '@/services/kb-analytics-api';

const Plot = dynamic<PlotParams>(() => import('react-plotly.js'), { ssr: false });

type AnalyticsEmbedProps = {
  scriptSlug?: string;
  title?: string;
  params?: Record<string, unknown>;
};

function MetricCard({ metric }: { metric: AnalyticsOutput['key_metrics'][number] }) {
  const trendClass =
    metric.trend === 'up'
      ? 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10'
      : metric.trend === 'down'
        ? 'text-rose-300 border-rose-500/30 bg-rose-500/10'
        : 'text-slate-200 border-white/10 bg-white/5';

  return (
    <div className={`rounded-lg border p-3 ${trendClass}`}>
      <div className="text-[11px] uppercase tracking-wide opacity-80">{metric.label}</div>
      <div className="mt-1 text-base font-semibold">
        {metric.value}
        {metric.unit || ''}
      </div>
      {typeof metric.benchmark === 'number' && (
        <div className="mt-0.5 text-[11px] opacity-80">Benchmark: {metric.benchmark}</div>
      )}
    </div>
  );
}

function DataTable({ output }: { output: AnalyticsOutput }) {
  const headers = output.data_table?.headers || [];
  const rows = output.data_table?.rows || [];

  if (headers.length === 0 || rows.length === 0) return null;

  return (
    <details className="mt-4 rounded-lg border border-white/10 bg-[#0e121b] p-3">
      <summary className="cursor-pointer text-xs uppercase tracking-wide text-slate-400">
        Raw data table ({rows.length} rows)
      </summary>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-xs" itemScope itemType="https://schema.org/Table">
          <thead>
            <tr className="border-b border-white/10">
              {headers.map((header) => (
                <th key={header} className="px-2 py-2 text-left text-slate-300" itemProp="name">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx} className="border-b border-white/5">
                {row.map((cell, cellIdx) => (
                  <td key={`${idx}-${cellIdx}`} className="px-2 py-2 text-slate-400">
                    {cell as any}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

export function AnalyticsEmbed({ scriptSlug, title, params = {} }: AnalyticsEmbedProps) {
  const [data, setData] = useState<AnalyticsOutput | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const normalizedParams = useMemo(() => {
    const cloned = { ...params };
    delete (cloned as Record<string, unknown>).script;
    return cloned;
  }, [params]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!scriptSlug) {
        setError('Analytics script is not specified');
        return;
      }

      setLoading(true);
      setError('');

      try {
        const result = await kbAnalyticsApi.runScript(scriptSlug, normalizedParams);
        if (!cancelled) {
          setData(result);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || 'Failed to load analytics');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [scriptSlug, normalizedParams]);

  if (!scriptSlug) {
    return null;
  }

  return (
    <section className="my-8 rounded-2xl border border-white/10 bg-[#0b1119] p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h4 className="text-sm font-semibold text-white">{title || 'Analytics'}</h4>
        <span className="text-[11px] uppercase tracking-wide text-cyan-300">{scriptSlug}</span>
      </div>

      {loading && <p className="text-sm text-slate-400">Loading analytics…</p>}
      {error && <p className="text-sm text-rose-300">{error}</p>}

      {data && (
        <>
          {Object.keys(data.json_ld || {}).length > 0 && (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(data.json_ld) }}
            />
          )}

          {data.key_metrics?.length > 0 && (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {data.key_metrics.map((metric, idx) => (
                <MetricCard key={idx} metric={metric} />
              ))}
            </div>
          )}

          <div className="mt-4 rounded-lg border border-white/10 bg-black/20 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Interactive chart</p>
            <div className="mt-2 overflow-hidden rounded-md border border-white/10">
              <Plot
                data={(data.plotly_spec?.data as PlotParams['data']) || []}
                layout={{
                  autosize: true,
                  ...(data.plotly_spec?.layout as PlotParams['layout']),
                }}
                config={{ responsive: true, displaylogo: false }}
                style={{ width: '100%', height: '430px' }}
                useResizeHandler
              />
            </div>
          </div>

          {data.insights?.length > 0 && (
            <div className="mt-4 space-y-1.5">
              {data.insights.map((insight, idx) => (
                <p key={idx} className="text-sm text-slate-300">
                  • {insight}
                </p>
              ))}
            </div>
          )}

          <DataTable output={data} />

          <p className="mt-3 text-[11px] text-slate-500">
            Data freshness: {data.data_freshness || 'n/a'} · Generated: {data.generated_at || 'n/a'}
          </p>
        </>
      )}
    </section>
  );
}
