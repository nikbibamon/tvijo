'use client';

/**
 * Agent Control Panel — Pipeline Runs
 * Generation: GEN-AGENTS-SEC-001
 */

import { useEffect, useState, useCallback } from 'react';
import { fetchOverview, triggerPipeline, type PipelineRun } from '@/services/agent-admin-api';

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    success: 'bg-green-500/10 text-green-400',
    error: 'bg-red-500/10 text-red-400',
    running: 'bg-blue-500/10 text-blue-400',
  };
  return (
    <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${map[status] || 'bg-gray-500/10 text-gray-400'}`}>
      {status}
    </span>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

export default function PipelinePage() {
  const [runs, setRuns] = useState<PipelineRun[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [expandedRun, setExpandedRun] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await fetchOverview();
      setRuns(data.recent_runs);
      setStats(data.pipeline);
    } catch (e) {
      console.error('Failed to load pipeline data', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  const handleTrigger = async () => {
    setTriggering(true);
    try {
      await triggerPipeline();
      setTimeout(load, 3000);
    } catch (e: any) {
      alert(`Failed: ${e.message}`);
    } finally {
      setTriggering(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Pipeline Runs</h1>
          <p className="text-sm text-gray-500 mt-0.5">Agent pipeline execution history</p>
        </div>
        <button
          onClick={handleTrigger}
          disabled={triggering}
          className="px-4 py-2 bg-cyan-600 text-white text-sm rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50"
        >
          {triggering ? 'Triggering...' : 'Run Pipeline Now'}
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-[#111827] rounded-xl border border-white/5 p-4">
            <div className="text-xs text-gray-500 mb-1">Runs (24h)</div>
            <div className="text-2xl font-bold text-cyan-400">{stats.total_runs_24h}</div>
            <div className="text-xs text-gray-500 mt-1">{stats.success_rate}% success rate</div>
          </div>
          <div className="bg-[#111827] rounded-xl border border-white/5 p-4">
            <div className="text-xs text-gray-500 mb-1">Total Signals</div>
            <div className="text-2xl font-bold text-white">{stats.total_signals_24h}</div>
          </div>
          <div className="bg-[#111827] rounded-xl border border-white/5 p-4">
            <div className="text-xs text-gray-500 mb-1">Total Decisions</div>
            <div className="text-2xl font-bold text-white">{stats.total_decisions_24h}</div>
          </div>
          <div className="bg-[#111827] rounded-xl border border-white/5 p-4">
            <div className="text-xs text-gray-500 mb-1">Avg Duration</div>
            <div className="text-2xl font-bold text-white">{Math.round(stats.avg_duration_ms)}ms</div>
          </div>
        </div>
      )}

      {/* Runs Table */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : runs.length === 0 ? (
        <div className="bg-[#111827] rounded-xl border border-white/5 p-8 text-center">
          <p className="text-gray-500">No pipeline runs yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {runs.map((run) => (
            <div key={run.id} className="bg-[#111827] rounded-xl border border-white/5 overflow-hidden">
              <button
                onClick={() => setExpandedRun(expandedRun === run.id ? null : run.id)}
                className="w-full flex items-center gap-4 p-4 text-left hover:bg-white/[0.02] transition-colors"
              >
                <StatusBadge status={run.status} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white">
                    Run #{run.id}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDate(run.started_at)}
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-6 text-xs text-gray-400">
                  <div className="text-center">
                    <div className="text-white font-medium">{run.total_signals}</div>
                    <div>signals</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white font-medium">{run.total_decisions}</div>
                    <div>decisions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-green-400 font-medium">{run.approved_decisions}</div>
                    <div>approved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white font-medium">{run.duration_ms}ms</div>
                    <div>duration</div>
                  </div>
                </div>
                <svg className={`w-4 h-4 text-gray-500 transition-transform ${expandedRun === run.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              {expandedRun === run.id && (
                <div className="px-4 pb-4 border-t border-white/5 pt-3">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">Status:</span>{' '}
                      <span className="text-white">{run.status}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Started:</span>{' '}
                      <span className="text-white">{formatDate(run.started_at)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Completed:</span>{' '}
                      <span className="text-white">{run.completed_at ? formatDate(run.completed_at) : '—'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Duration:</span>{' '}
                      <span className="text-white">{run.duration_ms}ms</span>
                    </div>
                  </div>
                  {/* Mobile stats */}
                  <div className="sm:hidden grid grid-cols-3 gap-3 mt-3 text-center">
                    <div className="bg-white/5 rounded-lg p-2">
                      <div className="text-white font-medium">{run.total_signals}</div>
                      <div className="text-[10px] text-gray-500">signals</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2">
                      <div className="text-white font-medium">{run.total_decisions}</div>
                      <div className="text-[10px] text-gray-500">decisions</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2">
                      <div className="text-green-400 font-medium">{run.approved_decisions}</div>
                      <div className="text-[10px] text-gray-500">approved</div>
                    </div>
                  </div>
                  {run.error_message && (
                    <div className="mt-3 p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
                      <div className="text-xs text-red-400 font-medium mb-1">Error</div>
                      <div className="text-xs text-red-300 break-all">{run.error_message}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
