'use client';

/**
 * Agent Control Panel — Dashboard
 * Generation: GEN-AGENTS-SEC-001
 *
 * Overview: pipeline stats, security status, kill switch, recent events & runs.
 */

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  fetchOverview,
  toggleKillSwitch,
  triggerPipeline,
  triggerObserver,
  resolveEvents,
  type AdminOverview,
} from '@/services/agent-admin-api';

// ============================================================================
// How It Works Component
// ============================================================================

function HowItWorks({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: 'What is Agent Control Panel?',
      icon: '🎯',
      content: 'This is the central command center for the Tvijo trading agent system. It monitors AI-powered trading agents that analyze market data, make decisions, and execute trades.',
      action: 'Start Tutorial',
    },
    {
      title: 'Pipeline - The Trading Brain',
      icon: '⚙️',
      content: 'The pipeline runs every 5 minutes and processes: Scanner data → Analytics → Risk filtering → Trade decisions. Each run creates signals, decisions, and potentially trades.',
      action: 'Next: Security',
    },
    {
      title: 'Security - 3-Layer Protection',
      icon: '🛡️',
      content: '🔴 KILL SWITCH: Emergency stop for all trading. Activated automatically when Observer detects 3+ EMERGENCY events in 1 hour OR 19+ errors. Manual activation also available.\n\n🟡 CIRCUIT BREAKER: Auto-stop after 3 consecutive losses. Resets after 60 min cooldown.\n\n🔵 OBSERVER: Monitors system health every 2 minutes. Checks: pipeline health, error rate, daily exposure, stale data.\n\nAll security actions are logged as Security Events.',
      action: 'Next: What to Do',
    },
    {
      title: 'Your Daily Workflow',
      icon: '📋',
      content: '1. Check Dashboard for pipeline health\n2. Review Security Events if any\n3. Use AI Assistant for analysis\n4. Check Intelligence Platform for detailed analytics',
      action: 'Got it!',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-lg bg-[#0d1220] border border-cyan-500/30 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{steps[step].icon}</span>
            <h2 className="text-xl font-bold text-white">{steps[step].title}</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-gray-300 leading-relaxed mb-6 whitespace-pre-line">
          {steps[step].content}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${i === step ? 'bg-cyan-500' : 'bg-gray-600'}`}
              />
            ))}
          </div>
          <button
            onClick={() => step < steps.length - 1 ? setStep(step + 1) : onClose()}
            className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition-colors"
          >
            {steps[step].action}
          </button>
        </div>
      </div>
    </div>
  );
}

function HelpTooltip({ title, children }: { title: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative inline-flex items-center gap-1">
      {children}
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="text-gray-500 hover:text-cyan-400 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
        </svg>
      </button>
      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-[#1a1f2e] border border-white/10 rounded-lg shadow-xl z-50">
          <p className="text-xs text-gray-300">{title}</p>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-[#1a1f2e] border-r border-b border-white/10 rotate-45" />
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Helper components
// ============================================================================

function StatCard({ label, value, sub, color = 'white' }: { label: string; value: string | number; sub?: string; color?: string }) {
  const colorMap: Record<string, string> = {
    white: 'text-white',
    cyan: 'text-cyan-400',
    green: 'text-green-400',
    red: 'text-red-400',
    yellow: 'text-yellow-400',
    orange: 'text-orange-400',
  };
  return (
    <div className="bg-[#111827] rounded-xl border border-white/5 p-4">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className={`text-2xl font-bold ${colorMap[color] || 'text-white'}`}>{value}</div>
      {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
    </div>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, string> = {
    info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    critical: 'bg-red-500/10 text-red-400 border-red-500/20',
    emergency: 'bg-red-600/20 text-red-300 border-red-500/30',
  };
  return (
    <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${map[severity] || map.info}`}>
      {severity}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    success: 'bg-green-500/10 text-green-400',
    error: 'bg-red-500/10 text-red-400',
    running: 'bg-blue-500/10 text-blue-400',
    ok: 'bg-green-500/10 text-green-400',
    critical: 'bg-red-500/10 text-red-400',
    unknown: 'bg-gray-500/10 text-gray-400',
  };
  return (
    <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${map[status] || map.unknown}`}>
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

// ============================================================================
// Main Dashboard
// ============================================================================

export default function AgentDashboardPage() {
  const [data, setData] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  const load = useCallback(async () => {
    try {
      const overview = await fetchOverview();
      setData(overview);
      setError(null);
    } catch (e: any) {
      setError(e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000); // auto-refresh every 30s
    return () => clearInterval(interval);
  }, [load]);

  const handleAction = async (action: string, fn: () => Promise<any>) => {
    setActionLoading(action);
    try {
      await fn();
      setTimeout(load, 2000); // refresh after action
    } catch (e: any) {
      alert(`Action failed: ${e.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-400 mb-2">{error}</p>
          <button onClick={load} className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm hover:bg-cyan-700">Retry</button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { pipeline, security, recent_events, recent_runs } = data;

  return (
    <div className="space-y-6">
      {showHowItWorks && <HowItWorks onClose={() => setShowHowItWorks(false)} />}

      {/* Header with actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-white">Dashboard</h1>
            <button
              onClick={() => setShowHowItWorks(true)}
              className="text-xs px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-full hover:bg-cyan-500/20 transition-colors flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
              </svg>
              How It Works
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">Agent pipeline &amp; security overview</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleAction('pipeline', triggerPipeline)}
            disabled={actionLoading === 'pipeline'}
            className="px-3 py-1.5 bg-cyan-600/20 border border-cyan-500/30 text-cyan-400 text-sm rounded-lg hover:bg-cyan-600/30 transition-colors disabled:opacity-50"
          >
            {actionLoading === 'pipeline' ? 'Running...' : 'Run Pipeline'}
          </button>
          <button
            onClick={() => handleAction('observer', triggerObserver)}
            disabled={actionLoading === 'observer'}
            className="px-3 py-1.5 bg-blue-600/20 border border-blue-500/30 text-blue-400 text-sm rounded-lg hover:bg-blue-600/30 transition-colors disabled:opacity-50"
          >
            {actionLoading === 'observer' ? 'Running...' : 'Run Observer'}
          </button>
        </div>
      </div>

      {/* Kill Switch Banner */}
      {security.kill_switch_active && (
        <div className="bg-red-600/10 border border-red-500/30 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            <div>
              <div className="text-red-400 font-bold text-sm">KILL SWITCH ACTIVE</div>
              <div className="text-red-400/70 text-xs">All agent executions are halted</div>
            </div>
          </div>
          <button
            onClick={() => handleAction('kill', () => toggleKillSwitch('deactivate'))}
            disabled={actionLoading === 'kill'}
            className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {actionLoading === 'kill' ? '...' : 'Deactivate'}
          </button>
        </div>
      )}

      {/* Circuit Breaker Banner */}
      {security.circuit_breaker_tripped && (
        <div className="bg-yellow-600/10 border border-yellow-500/30 rounded-xl p-4 flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse" />
          <div>
            <div className="text-yellow-400 font-bold text-sm">CIRCUIT BREAKER TRIPPED</div>
            <div className="text-yellow-400/70 text-xs">Automatic cooldown after consecutive losses</div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <StatCard label="Runs (24h)" value={pipeline.total_runs_24h} sub={`${pipeline.success_rate}% success`} color="cyan" />
        <StatCard label="Signals" value={pipeline.total_signals_24h} color="white" />
        <StatCard label="Decisions" value={pipeline.total_decisions_24h} color="white" />
        <StatCard label="Approved" value={pipeline.total_approved_24h} color="green" />
        <StatCard label="Avg Duration" value={`${Math.round(pipeline.avg_duration_ms)}ms`} color="white" />
        <StatCard label="Unresolved" value={security.unresolved_count} color={security.unresolved_count > 0 ? 'red' : 'green'} />
      </div>

      {/* Security Status + Observer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Security Status */}
        <div className="bg-[#111827] rounded-xl border border-white/5 p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            Security Status
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Kill Switch</span>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${security.kill_switch_active ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                <span className={`text-sm ${security.kill_switch_active ? 'text-red-400' : 'text-green-400'}`}>
                  {security.kill_switch_active ? 'ACTIVE' : 'Off'}
                </span>
                {!security.kill_switch_active && (
                  <button
                    onClick={() => handleAction('kill', () => toggleKillSwitch('activate', 'Manual activation from dashboard'))}
                    disabled={actionLoading === 'kill'}
                    className="ml-2 px-2 py-0.5 bg-red-600/20 border border-red-500/30 text-red-400 text-[11px] rounded hover:bg-red-600/30 transition-colors"
                  >
                    Activate
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Circuit Breaker</span>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${security.circuit_breaker_tripped ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
                <span className={`text-sm ${security.circuit_breaker_tripped ? 'text-yellow-400' : 'text-green-400'}`}>
                  {security.circuit_breaker_tripped ? 'TRIPPED' : 'Normal'}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Observer</span>
              <StatusBadge status={security.observer?.status || 'unknown'} />
            </div>
            <div className="mt-3 pt-3 border-t border-white/5">
              <div className="text-xs text-gray-500 mb-2">Events (24h)</div>
              <div className="flex gap-3">
                {Object.entries(security.events_24h).map(([sev, count]) => (
                  <div key={sev} className="text-center">
                    <div className="text-sm font-bold text-white">{count}</div>
                    <div className="text-[10px] text-gray-500">{sev}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Last Pipeline Run */}
        <div className="bg-[#111827] rounded-xl border border-white/5 p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
            </svg>
            Last Pipeline Run
          </h2>
          {pipeline.last_run ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Status</span>
                <StatusBadge status={pipeline.last_run.status} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Started</span>
                <span className="text-sm text-white">{timeAgo(pipeline.last_run.started_at)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Duration</span>
                <span className="text-sm text-white">{pipeline.last_run.duration_ms}ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Signals</span>
                <span className="text-sm text-white">{pipeline.last_run.total_signals}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Decisions</span>
                <span className="text-sm text-white">{pipeline.last_run.total_decisions}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Approved</span>
                <span className="text-sm text-green-400 font-bold">{pipeline.last_run.approved_decisions}</span>
              </div>
              {pipeline.last_run.error_message && (
                <div className="mt-2 p-2 bg-red-500/5 border border-red-500/10 rounded text-xs text-red-400 break-all">
                  {pipeline.last_run.error_message}
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No pipeline runs yet</p>
          )}
        </div>
      </div>

      {/* Recent Events + Recent Runs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Security Events */}
        <div className="bg-[#111827] rounded-xl border border-white/5 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Recent Security Events</h2>
            {recent_events.some(e => !e.resolved) && (
              <button
                onClick={() => handleAction('resolve', () => resolveEvents())}
                disabled={actionLoading === 'resolve'}
                className="px-2 py-1 bg-green-600/20 border border-green-500/30 text-green-400 text-[11px] rounded hover:bg-green-600/30 transition-colors"
              >
                Resolve All
              </button>
            )}
          </div>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {recent_events.length === 0 ? (
              <p className="text-sm text-gray-500">No security events</p>
            ) : (
              recent_events.map((evt) => (
                <div key={evt.id} className={`flex items-start gap-3 p-2 rounded-lg ${evt.resolved ? 'opacity-50' : ''} hover:bg-white/[0.02]`}>
                  <SeverityBadge severity={evt.severity} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-white truncate">{evt.action_attempted}</div>
                    <div className="text-[10px] text-gray-500 flex items-center gap-2">
                      <span>{evt.agent}</span>
                      <span>&middot;</span>
                      <span>{evt.event_type}</span>
                      <span>&middot;</span>
                      <span>{timeAgo(evt.created_at)}</span>
                    </div>
                  </div>
                  {evt.resolved && <span className="text-[10px] text-green-500">resolved</span>}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Pipeline Runs */}
        <div className="bg-[#111827] rounded-xl border border-white/5 p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Recent Pipeline Runs</h2>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {recent_runs.length === 0 ? (
              <p className="text-sm text-gray-500">No pipeline runs</p>
            ) : (
              recent_runs.map((run) => (
                <div key={run.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.02]">
                  <StatusBadge status={run.status} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-white">
                      {run.total_signals} signals &rarr; {run.total_decisions} decisions &rarr; {run.approved_decisions} approved
                    </div>
                    <div className="text-[10px] text-gray-500">
                      {run.duration_ms}ms &middot; {timeAgo(run.started_at)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
