'use client';

/**
 * Agent Control Panel — Guardrails Configuration
 * Generation: GEN-AGENTS-SEC-001
 *
 * Live editor for all GuardrailConfig values.
 */

import { useEffect, useState, useCallback } from 'react';
import { fetchOverview, updateGuardrail, type GuardrailConfig } from '@/services/agent-admin-api';

function ValueEditor({ config, onSave }: { config: GuardrailConfig; onSave: (key: string, value: unknown) => Promise<void> }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(config.value));
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Parse value: try number, then boolean, then string
      let parsed: unknown = value;
      if (value === 'true') parsed = true;
      else if (value === 'false') parsed = false;
      else if (!isNaN(Number(value)) && value.trim() !== '') parsed = Number(value);

      await onSave(config.key, parsed);
      setEditing(false);
    } catch (e: any) {
      alert(`Failed: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="text-sm text-white font-mono bg-white/5 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors text-left min-w-[100px]"
      >
        {String(config.value)}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-32 bg-[#0a0e17] border border-cyan-500/50 rounded-lg px-3 py-1.5 text-sm text-white font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
        autoFocus
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSave();
          if (e.key === 'Escape') setEditing(false);
        }}
      />
      <button
        onClick={handleSave}
        disabled={saving}
        className="px-2 py-1.5 bg-cyan-600 text-white text-xs rounded-lg hover:bg-cyan-700 disabled:opacity-50"
      >
        {saving ? '...' : 'Save'}
      </button>
      <button
        onClick={() => { setEditing(false); setValue(String(config.value)); }}
        className="px-2 py-1.5 bg-white/5 text-gray-400 text-xs rounded-lg hover:bg-white/10"
      >
        Cancel
      </button>
    </div>
  );
}

export default function GuardrailsPage() {
  const [configs, setConfigs] = useState<GuardrailConfig[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await fetchOverview();
      setConfigs(data.guardrails);
    } catch (e) {
      console.error('Failed to load guardrails', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (key: string, value: unknown) => {
    await updateGuardrail(key, value);
    load();
  };

  const handleToggle = async (config: GuardrailConfig) => {
    await updateGuardrail(config.key, config.value, !config.is_active);
    load();
  };

  // Group configs by category
  const groups: Record<string, GuardrailConfig[]> = {};
  for (const c of configs) {
    let group = 'Other';
    if (c.key.startsWith('max_position') || c.key.startsWith('max_leverage') || c.key.startsWith('max_open'))
      group = 'Position Limits';
    else if (c.key.startsWith('max_daily') || c.key.startsWith('max_sl') || c.key.startsWith('min_sl'))
      group = 'Daily & Risk Limits';
    else if (c.key.startsWith('circuit_breaker') || c.key.startsWith('cooldown'))
      group = 'Circuit Breaker';
    else if (c.key.startsWith('max_decisions') || c.key.startsWith('max_executions'))
      group = 'Rate Limits';
    else if (c.key.includes('kill_switch'))
      group = 'Emergency';
    else if (c.key.includes('confidence'))
      group = 'Quality Gates';
    if (!groups[group]) groups[group] = [];
    groups[group].push(c);
  }

  const groupOrder = ['Emergency', 'Position Limits', 'Daily & Risk Limits', 'Circuit Breaker', 'Rate Limits', 'Quality Gates', 'Other'];
  const groupColors: Record<string, string> = {
    Emergency: 'border-red-500/20',
    'Position Limits': 'border-cyan-500/20',
    'Daily & Risk Limits': 'border-yellow-500/20',
    'Circuit Breaker': 'border-orange-500/20',
    'Rate Limits': 'border-blue-500/20',
    'Quality Gates': 'border-green-500/20',
    Other: 'border-white/10',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Guardrails Configuration</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Runtime-configurable limits. Changes take effect immediately.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {groupOrder.filter(g => groups[g]).map((group) => (
            <div key={group} className={`bg-[#111827] rounded-xl border ${groupColors[group] || 'border-white/5'} overflow-hidden`}>
              <div className="px-5 py-3 border-b border-white/5">
                <h2 className="text-sm font-semibold text-white">{group}</h2>
              </div>
              <div className="divide-y divide-white/[0.03]">
                {groups[group].map((config) => (
                  <div key={config.key} className="flex flex-wrap items-center gap-4 px-5 py-3 hover:bg-white/[0.02]">
                    <div className="flex-1 min-w-[200px]">
                      <div className="text-sm text-white font-mono">{config.key}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{config.description}</div>
                    </div>
                    <ValueEditor config={config} onSave={handleSave} />
                    <button
                      onClick={() => handleToggle(config)}
                      className={`w-10 h-5 rounded-full transition-colors relative ${
                        config.is_active ? 'bg-cyan-600' : 'bg-gray-700'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${
                        config.is_active ? 'left-5' : 'left-0.5'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
