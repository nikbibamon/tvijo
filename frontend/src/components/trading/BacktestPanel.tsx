'use client';

/**
 * Backtest Panel — Run & view historical strategy backtests
 * Generation: GEN-TRADING-005
 */

import { useState, useEffect, useCallback } from 'react';
import {
  createBacktest,
  getBacktests,
  getBacktest,
  getStrategies,
} from '@/services/trading-api';
import type {
  BacktestRun,
  BacktestRunListItem,
} from '@/services/trading-api';
import type { StrategyPreset } from '@/types/trading';

const PAIRS = [
  'BTC_USDT', 'ETH_USDT', 'SOL_USDT', 'BNB_USDT', 'XRP_USDT',
  'LTC_USDT', 'DOGE_USDT', 'PEPE_USDT', 'LINK_USDT', 'AVAX_USDT',
  'SUI_USDT', 'TON_USDT', 'ATOM_USDT', 'BSV_USDT', 'TWT_USDT',
];
const INTERVALS = ['5m', '15m', '30m', '1h', '4h', '1d'];

function fmtNum(val: string | null | undefined, decimals = 2): string {
  if (!val) return '—';
  const n = parseFloat(val);
  if (isNaN(n)) return '—';
  return n.toFixed(decimals);
}

function statusBadge(s: string) {
  const map: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    running: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    completed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    failed: 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  return (
    <span className={`px-2 py-0.5 text-xs font-bold border rounded-full ${map[s] || map.pending}`}>
      {s.toUpperCase()}
    </span>
  );
}

// ============================================================================
// Equity Chart (pure SVG)
// ============================================================================

function EquityChart({ curve }: { curve: { ts: number; balance: number }[] }) {
  if (!curve || curve.length < 2) return <div className="text-gray-600 text-xs py-4 text-center">No equity data</div>;

  const w = 600;
  const h = 180;
  const pad = { top: 10, right: 10, bottom: 20, left: 50 };
  const cw = w - pad.left - pad.right;
  const ch = h - pad.top - pad.bottom;

  const balances = curve.map(p => p.balance);
  const minB = Math.min(...balances) * 0.995;
  const maxB = Math.max(...balances) * 1.005;
  const rangeB = maxB - minB || 1;

  const points = curve.map((p, i) => {
    const x = pad.left + (i / (curve.length - 1)) * cw;
    const y = pad.top + ch - ((p.balance - minB) / rangeB) * ch;
    return `${x},${y}`;
  }).join(' ');

  const initial = curve[0].balance;
  const final = curve[curve.length - 1].balance;
  const color = final >= initial ? '#10b981' : '#ef4444';

  // Area fill
  const areaPath = `M${pad.left},${pad.top + ch} L${points.split(' ').map(p => p).join(' L')} L${pad.left + cw},${pad.top + ch} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ maxHeight: '180px' }}>
      <defs>
        <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map(pct => {
        const y = pad.top + ch * (1 - pct);
        const val = minB + rangeB * pct;
        return (
          <g key={pct}>
            <line x1={pad.left} y1={y} x2={pad.left + cw} y2={y} stroke="#334155" strokeWidth="0.5" />
            <text x={pad.left - 4} y={y + 3} textAnchor="end" fill="#64748b" fontSize="8">${val.toFixed(0)}</text>
          </g>
        );
      })}
      {/* Area */}
      <path d={areaPath} fill="url(#eqGrad)" />
      {/* Line */}
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" />
      {/* Start/End labels */}
      <text x={pad.left + 2} y={pad.top + ch + 14} fill="#64748b" fontSize="7">
        {new Date(curve[0].ts * 1000).toLocaleDateString()}
      </text>
      <text x={pad.left + cw - 2} y={pad.top + ch + 14} textAnchor="end" fill="#64748b" fontSize="7">
        {new Date(curve[curve.length - 1].ts * 1000).toLocaleDateString()}
      </text>
    </svg>
  );
}

// ============================================================================
// Backtest Detail
// ============================================================================

function BacktestDetail({ run, onBack }: { run: BacktestRun; onBack: () => void }) {
  const pnl = parseFloat(run.total_pnl || '0');
  const pnlColor = pnl >= 0 ? 'text-emerald-400' : 'text-red-400';
  const retPct = parseFloat(run.return_pct || '0');

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-gray-400 hover:text-white text-sm">&larr; Back</button>
        <h3 className="text-lg font-semibold text-white">{run.pair.replace('_', '/')} — {run.interval} / {run.period_days}d</h3>
        {statusBadge(run.status)}
      </div>

      {run.status === 'completed' && (
        <>
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total PnL', value: `${pnl >= 0 ? '+' : ''}$${fmtNum(run.total_pnl)}`, color: pnlColor },
              { label: 'Return', value: `${retPct >= 0 ? '+' : ''}${fmtNum(run.return_pct)}%`, color: pnlColor },
              { label: 'Win Rate', value: `${fmtNum(run.win_rate)}%`, color: 'text-white' },
              { label: 'Trades', value: `${run.total_trades} (${run.winning_trades}W/${run.losing_trades}L)`, color: 'text-white' },
              { label: 'Max Drawdown', value: `${fmtNum(run.max_drawdown_pct)}%`, color: 'text-orange-400' },
              { label: 'Sharpe Ratio', value: fmtNum(run.sharpe_ratio), color: 'text-white' },
              { label: 'Profit Factor', value: fmtNum(run.profit_factor), color: 'text-white' },
              { label: 'Avg Hold', value: run.avg_hold_minutes ? `${Math.round(run.avg_hold_minutes / 60)}h` : '—', color: 'text-white' },
            ].map(m => (
              <div key={m.label} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3">
                <div className="text-[10px] text-gray-500 uppercase">{m.label}</div>
                <div className={`text-base font-bold mt-0.5 ${m.color}`}>{m.value}</div>
              </div>
            ))}
          </div>

          {/* Balance Summary */}
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>Start: <strong className="text-white">${fmtNum(run.initial_balance)}</strong></span>
            <span>&rarr;</span>
            <span>End: <strong className={pnlColor}>${fmtNum(run.final_balance)}</strong></span>
            {run.best_trade_pnl && <span className="ml-auto">Best: <strong className="text-emerald-400">+${fmtNum(run.best_trade_pnl)}</strong></span>}
            {run.worst_trade_pnl && <span>Worst: <strong className="text-red-400">${fmtNum(run.worst_trade_pnl)}</strong></span>}
          </div>

          {/* Equity Curve */}
          <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-3">
            <div className="text-xs text-gray-500 mb-1 font-medium">Equity Curve</div>
            <EquityChart curve={run.equity_curve} />
          </div>

          {/* Trades Table */}
          {run.trades_list && run.trades_list.length > 0 && (
            <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl overflow-hidden">
              <div className="p-3 border-b border-slate-700/30">
                <span className="text-xs font-medium text-gray-400">Trades ({run.trades_list.length})</span>
              </div>
              <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-800/40 sticky top-0">
                    <tr className="text-gray-500">
                      <th className="text-left p-2">#</th>
                      <th className="text-left p-2">Entry</th>
                      <th className="text-left p-2">Exit</th>
                      <th className="text-right p-2">Entry $</th>
                      <th className="text-right p-2">Exit $</th>
                      <th className="text-right p-2">PnL</th>
                      <th className="text-left p-2">Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {run.trades_list.map((t, i) => {
                      const tpnl = parseFloat(t.pnl || '0');
                      return (
                        <tr key={t.id} className="border-t border-slate-800/30 hover:bg-slate-800/20">
                          <td className="p-2 text-gray-500">{i + 1}</td>
                          <td className="p-2 text-gray-300">{new Date(t.entry_time).toLocaleDateString()}</td>
                          <td className="p-2 text-gray-300">{t.exit_time ? new Date(t.exit_time).toLocaleDateString() : '—'}</td>
                          <td className="p-2 text-right text-white">${parseFloat(t.entry_price).toFixed(2)}</td>
                          <td className="p-2 text-right text-white">{t.exit_price ? `$${parseFloat(t.exit_price).toFixed(2)}` : '—'}</td>
                          <td className={`p-2 text-right font-medium ${tpnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {tpnl >= 0 ? '+' : ''}{tpnl.toFixed(2)}
                          </td>
                          <td className="p-2 text-gray-500 max-w-[150px] truncate">{t.reason_close || t.reason_open}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {run.status === 'failed' && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
          {run.error_message || 'Backtest failed'}
        </div>
      )}

      {(run.status === 'pending' || run.status === 'running') && (
        <div className="text-center py-8 text-gray-400 animate-pulse">
          Running backtest... This may take up to a minute.
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Main Panel
// ============================================================================

export default function BacktestPanel() {
  const [strategies, setStrategies] = useState<StrategyPreset[]>([]);
  const [runs, setRuns] = useState<BacktestRunListItem[]>([]);
  const [selectedRun, setSelectedRun] = useState<BacktestRun | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [pair, setPair] = useState('BTC_USDT');
  const [interval, setInterval] = useState('1h');
  const [periodDays, setPeriodDays] = useState(30);
  const [strategyId, setStrategyId] = useState('');
  const [tp, setTp] = useState(3);
  const [sl, setSl] = useState(2);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = useCallback(async () => {
    const [s, r] = await Promise.all([getStrategies(), getBacktests()]);
    setStrategies(s);
    setRuns(r);
  }, []);

  const handleSubmit = async () => {
    setSubmitting(true);
    const result = await createBacktest({
      pair,
      interval,
      period_days: periodDays,
      strategy: strategyId || undefined,
      take_profit_pct: tp,
      stop_loss_pct: sl,
    });
    if (result) {
      setRuns(prev => [result, ...prev]);
      // Poll for completion
      pollRun(result.id);
    }
    setSubmitting(false);
  };

  const pollRun = useCallback(async (id: string) => {
    let attempts = 0;
    const poll = setInterval(async () => {
      attempts++;
      const detail = await getBacktest(id);
      if (!detail) { clearInterval(poll); return; }
      if (detail.status === 'completed' || detail.status === 'failed' || attempts > 60) {
        clearInterval(poll);
        setSelectedRun(detail);
        // Refresh list
        const updated = await getBacktests();
        setRuns(updated);
      }
    }, 3000);
  }, []);

  const openDetail = useCallback(async (id: string) => {
    setLoading(true);
    const detail = await getBacktest(id);
    if (detail) {
      if (detail.status === 'pending' || detail.status === 'running') {
        pollRun(id);
      }
      setSelectedRun(detail);
    }
    setLoading(false);
  }, [pollRun]);

  if (selectedRun) {
    return (
      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
        <BacktestDetail run={selectedRun} onBack={() => setSelectedRun(null)} />
      </div>
    );
  }

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white">Strategy Backtester</h2>
        <p className="text-xs text-gray-500 mt-0.5">Test strategies against historical Gate.io data</p>
      </div>

      {/* New Backtest Form */}
      <div className="bg-slate-900/40 border border-slate-700/30 rounded-xl p-4 space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[10px] text-gray-500 uppercase block mb-1">Pair</label>
            <select value={pair} onChange={e => setPair(e.target.value)} className="w-full bg-slate-800 border border-slate-600 text-white text-sm rounded-lg p-2">
              {PAIRS.map(p => <option key={p} value={p}>{p.replace('_', '/')}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-gray-500 uppercase block mb-1">Interval</label>
            <select value={interval} onChange={e => setInterval(e.target.value)} className="w-full bg-slate-800 border border-slate-600 text-white text-sm rounded-lg p-2">
              {INTERVALS.map(iv => <option key={iv} value={iv}>{iv}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-gray-500 uppercase block mb-1">Period (days)</label>
            <input type="number" value={periodDays} onChange={e => setPeriodDays(Number(e.target.value))} min={1} max={365} className="w-full bg-slate-800 border border-slate-600 text-white text-sm rounded-lg p-2" />
          </div>
          <div>
            <label className="text-[10px] text-gray-500 uppercase block mb-1">Strategy</label>
            <select value={strategyId} onChange={e => setStrategyId(e.target.value)} className="w-full bg-slate-800 border border-slate-600 text-white text-sm rounded-lg p-2">
              <option value="">Default (EMA 9/21)</option>
              {strategies.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-gray-500 uppercase block mb-1">Take Profit %</label>
            <input type="number" value={tp} onChange={e => setTp(Number(e.target.value))} min={0.5} max={50} step={0.5} className="w-full bg-slate-800 border border-slate-600 text-white text-sm rounded-lg p-2" />
          </div>
          <div>
            <label className="text-[10px] text-gray-500 uppercase block mb-1">Stop Loss %</label>
            <input type="number" value={sl} onChange={e => setSl(Number(e.target.value))} min={0.5} max={50} step={0.5} className="w-full bg-slate-800 border border-slate-600 text-white text-sm rounded-lg p-2" />
          </div>
        </div>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="px-5 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-400 hover:to-indigo-500 transition-all disabled:opacity-50 text-sm"
        >
          {submitting ? 'Launching...' : 'Run Backtest'}
        </button>
      </div>

      {/* History */}
      {runs.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-400 mb-2">Recent Backtests</h3>
          <div className="space-y-2">
            {runs.map(r => {
              const rpnl = parseFloat(r.total_pnl || '0');
              return (
                <button
                  key={r.id}
                  onClick={() => openDetail(r.id)}
                  className="w-full text-left p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:border-slate-600 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-white text-sm">{r.pair.replace('_', '/')}</span>
                      <span className="text-xs text-gray-500">{r.interval} / {r.period_days}d</span>
                      {r.strategy_name && <span className="text-xs text-gray-600">{r.strategy_name}</span>}
                    </div>
                    <div className="flex items-center gap-3">
                      {r.status === 'completed' && (
                        <>
                          <span className={`text-xs font-medium ${rpnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {rpnl >= 0 ? '+' : ''}${rpnl.toFixed(2)}
                          </span>
                          <span className="text-xs text-gray-500">WR: {fmtNum(r.win_rate)}%</span>
                          <span className="text-xs text-gray-500">{r.total_trades} trades</span>
                        </>
                      )}
                      {statusBadge(r.status)}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {loading && <div className="text-center text-gray-400 animate-pulse py-4">Loading...</div>}
    </div>
  );
}
