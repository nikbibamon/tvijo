'use client';

/**
 * Agent Control Panel — Security Events
 * Generation: GEN-AGENTS-SEC-001
 */

import { useEffect, useState, useCallback } from 'react';
import { fetchSecurityEvents, resolveEvents, type SecurityEvent } from '@/services/agent-admin-api';

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

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function SecurityPage() {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [hours, setHours] = useState<number>(24);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const load = useCallback(async () => {
    try {
      const params: any = { hours };
      if (filter !== 'all') params.severity = filter;
      const data = await fetchSecurityEvents(params);
      setEvents(Array.isArray(data) ? data : data?.results || []);
    } catch (e) {
      console.error('Failed to load events', e);
    } finally {
      setLoading(false);
    }
  }, [filter, hours]);

  useEffect(() => { load(); }, [load]);

  const handleResolve = async (ids?: number[]) => {
    try {
      await resolveEvents(ids);
      load();
    } catch (e: any) {
      alert(`Failed: ${e.message}`);
    }
  };

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const unresolvedCount = events.filter(e => !e.resolved).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Security Events</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {events.length} events &middot; {unresolvedCount} unresolved
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {unresolvedCount > 0 && (
            <button
              onClick={() => handleResolve()}
              className="px-3 py-1.5 bg-green-600/20 border border-green-500/30 text-green-400 text-sm rounded-lg hover:bg-green-600/30 transition-colors"
            >
              Resolve All ({unresolvedCount})
            </button>
          )}
          {selected.size > 0 && (
            <button
              onClick={() => { handleResolve(Array.from(selected)); setSelected(new Set()); }}
              className="px-3 py-1.5 bg-blue-600/20 border border-blue-500/30 text-blue-400 text-sm rounded-lg hover:bg-blue-600/30 transition-colors"
            >
              Resolve Selected ({selected.size})
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {['all', 'info', 'warning', 'critical', 'emergency'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              filter === f
                ? 'bg-cyan-600/20 border-cyan-500/30 text-cyan-400'
                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
            }`}
          >
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <div className="border-l border-white/10 mx-1" />
        {[1, 6, 24, 72, 168].map((h) => (
          <button
            key={h}
            onClick={() => setHours(h)}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              hours === h
                ? 'bg-cyan-600/20 border-cyan-500/30 text-cyan-400'
                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
            }`}
          >
            {h < 24 ? `${h}h` : `${h / 24}d`}
          </button>
        ))}
      </div>

      {/* Events Table */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <div className="bg-[#111827] rounded-xl border border-white/5 p-8 text-center">
          <p className="text-gray-500">No security events found</p>
        </div>
      ) : (
        <div className="bg-[#111827] rounded-xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left">
                  <th className="px-4 py-3 text-xs text-gray-500 font-medium w-8"></th>
                  <th className="px-4 py-3 text-xs text-gray-500 font-medium">Severity</th>
                  <th className="px-4 py-3 text-xs text-gray-500 font-medium">Type</th>
                  <th className="px-4 py-3 text-xs text-gray-500 font-medium">Agent</th>
                  <th className="px-4 py-3 text-xs text-gray-500 font-medium">Action</th>
                  <th className="px-4 py-3 text-xs text-gray-500 font-medium">Allowed</th>
                  <th className="px-4 py-3 text-xs text-gray-500 font-medium">Time</th>
                  <th className="px-4 py-3 text-xs text-gray-500 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {events.map((evt) => (
                  <tr
                    key={evt.id}
                    className={`border-b border-white/[0.03] hover:bg-white/[0.02] ${evt.resolved ? 'opacity-50' : ''}`}
                  >
                    <td className="px-4 py-2.5">
                      {!evt.resolved && (
                        <input
                          type="checkbox"
                          checked={selected.has(evt.id)}
                          onChange={() => toggleSelect(evt.id)}
                          className="w-3.5 h-3.5 rounded border-gray-600 bg-transparent accent-cyan-500"
                        />
                      )}
                    </td>
                    <td className="px-4 py-2.5"><SeverityBadge severity={evt.severity} /></td>
                    <td className="px-4 py-2.5 text-gray-300">{evt.event_type}</td>
                    <td className="px-4 py-2.5 text-gray-400">{evt.agent}</td>
                    <td className="px-4 py-2.5 text-gray-300 max-w-[250px] truncate">{evt.action_attempted}</td>
                    <td className="px-4 py-2.5">
                      {evt.action_allowed ? (
                        <span className="text-green-400 text-xs">yes</span>
                      ) : (
                        <span className="text-red-400 text-xs">blocked</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-gray-500 text-xs whitespace-nowrap">{timeAgo(evt.created_at)}</td>
                    <td className="px-4 py-2.5">
                      {evt.resolved ? (
                        <span className="text-green-500 text-[11px]">resolved</span>
                      ) : (
                        <button
                          onClick={() => handleResolve([evt.id])}
                          className="text-[11px] text-cyan-400 hover:text-cyan-300"
                        >
                          resolve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
