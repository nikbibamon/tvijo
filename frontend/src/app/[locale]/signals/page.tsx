'use client';

/**
 * Signals Page — Public trading signals, breaking events, keyword spikes
 * Generation: GEN-PORTAL-001
 */

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/portal/Navbar';
import Footer from '@/components/portal/Footer';
import { fetchScanner, type ScannerResult, type ScannerResponse } from '@/services/bot-api';
import { parseLocale } from '@/i18n/config';

// ============================================================================
// Types
// ============================================================================

interface NewsEvent {
  id: number;
  title: string;
  summary: string;
  topic: string;
  status: string;
  importance_score: number;
  trend_score: number;
  viral_probability: number;
  source_count: number;
  first_detected_at: string;
  region: string;
}

interface KeywordSpike {
  id: number;
  keyword: string;
  spike_ratio: number;
  current_rate: number;
  baseline_rate: number;
  detected_at: string;
  source_count: number;
  score: number;
}

interface TrendingTopic {
  id: number;
  keyword: string;
  mention_count: number;
  sentiment_score: string;
}

interface StrategyPreset {
  id: string;
  name: string;
  slug: string;
  description: string;
  how_it_works: string;
  recommended_market: string;
  recommended_pairs: string[];
  backtest_return_pct: number | null;
  backtest_max_drawdown: number | null;
  backtest_win_rate: number | null;
  backtest_sharpe: number | null;
  backtest_period_days: number | null;
  backtest_total_trades: number | null;
  rating: number;
  rating_count: number;
}

interface AgentDecision {
  id: number;
  symbol: string;
  ticker: string;
  action: string;
  strategy: string;
  confidence: number;
  risk_level: string;
  approved: boolean;
  entry_price: number | null;
  leverage: number | null;
  tp_pct: number | null;
  sl_pct: number | null;
  position_size_pct: number | null;
  risk_warnings: string[];
  reasoning: string;
  executed: boolean;
  realized_pnl: number | null;
  realized_pnl_pct: number | null;
  signal_symbol: string;
  signal_score: number;
  created_at: string;
}

interface PipelineStats {
  total_runs: number;
  total_signals: number;
  total_decisions: number;
  total_approved: number;
  total_executed: number;
  avg_duration_ms: number;
  last_run_at: string;
  win_rate: number;
  total_pnl: number;
}

// ============================================================================
// API
// ============================================================================

const API = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

/** DRF list, plain array, or null — always a real array (never null). */
function asArray<T>(data: unknown): T[] {
  if (data == null) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === 'object' && data !== null && 'results' in data) {
    const r = (data as { results?: unknown }).results;
    return Array.isArray(r) ? r : [];
  }
  return [];
}

function num(v: unknown, fallback = 0): number {
  if (v === null || v === undefined) return fallback;
  if (typeof v === 'number') return Number.isFinite(v) ? v : fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeScannerResponse(s: ScannerResponse | null): ScannerResponse | null {
  if (!s) return null;
  const results = (s.results ?? []).map((row: ScannerResult) => ({
    ...row,
    patterns: row.patterns ?? [],
  }));
  return { ...s, results };
}

function normalizeAgentDecision(d: AgentDecision): AgentDecision {
  const rw = d.risk_warnings;
  const risk_warnings = Array.isArray(rw) ? rw : rw == null ? [] : [String(rw)];
  const reasoningRaw = d.reasoning as unknown;
  const reasoning =
    typeof reasoningRaw === 'string'
      ? reasoningRaw
      : Array.isArray(reasoningRaw)
        ? reasoningRaw.map(String).join('\n')
        : '';
  let confidence = num(d.confidence);
  if (confidence > 0 && confidence <= 1) confidence *= 100;
  return {
    ...d,
    confidence,
    risk_warnings,
    reasoning,
    tp_pct: d.tp_pct != null ? num(d.tp_pct) : null,
    sl_pct: d.sl_pct != null ? num(d.sl_pct) : null,
    leverage: d.leverage != null ? num(d.leverage) : null,
    position_size_pct: d.position_size_pct != null ? num(d.position_size_pct) : null,
    entry_price: d.entry_price != null ? num(d.entry_price) : null,
    realized_pnl: d.realized_pnl != null ? num(d.realized_pnl) : null,
    realized_pnl_pct: d.realized_pnl_pct != null ? num(d.realized_pnl_pct) : null,
    signal_score: num(d.signal_score),
  };
}

function normalizePipelineStats(s: PipelineStats | null): PipelineStats | null {
  if (!s) return null;
  return {
    ...s,
    win_rate: num(s.win_rate),
    total_pnl: num(s.total_pnl),
    total_decisions: num(s.total_decisions),
    total_approved: num(s.total_approved),
    total_executed: num(s.total_executed),
    avg_duration_ms: num(s.avg_duration_ms),
  };
}

// ============================================================================
// Helpers
// ============================================================================

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function importanceColor(score: number): string {
  if (score >= 80) return '#EF4444';
  if (score >= 60) return '#F59E0B';
  if (score >= 40) return '#3B82F6';
  return '#6B7280';
}

function importanceLabel(score: number): string {
  if (score >= 80) return 'CRITICAL';
  if (score >= 60) return 'HIGH';
  if (score >= 40) return 'MEDIUM';
  return 'LOW';
}

const TOPIC_ICONS: Record<string, string> = {
  crypto: '₿',
  markets: '📈',
  politics: '🏛️',
  military: '⚔️',
  tech: '💻',
  energy: '⚡',
  finance: '💰',
  world: '🌍',
  general: '📰',
};

// ============================================================================
// Components
// ============================================================================

function SignalHeader({ locale }: { locale: string }) {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Trading Signals</h1>
          <p className="text-sm text-gray-500">AI-detected market events, breaking news & keyword spikes</p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[11px] text-green-400 font-medium">Live — updates every 2 min</span>
        </div>
        <Link
          href={`/${locale}/login`}
          className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full px-3 py-1 hover:bg-orange-500/20 transition-colors"
        >
          <svg className="w-3.5 h-3.5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
          <span className="text-[11px] text-orange-400 font-medium">Get alerts — Register</span>
        </Link>
      </div>
    </div>
  );
}

function BreakingCard({ event }: { event: NewsEvent }) {
  const color = importanceColor(event.importance_score);
  const icon = TOPIC_ICONS[event.topic] || TOPIC_ICONS.general;

  return (
    <div className="bg-[#12121A] border border-white/5 rounded-xl p-5 hover:border-red-500/20 transition-all">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
            style={{ color, backgroundColor: `${color}15`, border: `1px solid ${color}30` }}
          >
            {importanceLabel(event.importance_score)}
          </span>
          <span className="text-[11px] text-gray-500">{event.topic}</span>
        </div>
        <span className="text-[11px] text-gray-600 whitespace-nowrap">{timeAgo(event.first_detected_at)}</span>
      </div>

      <h3 className="text-base font-semibold text-white mb-2 leading-snug">{event.title}</h3>

      {event.summary && (
        <p className="text-sm text-gray-400 line-clamp-2 mb-3">{event.summary}</p>
      )}

      <div className="flex items-center gap-4 text-[11px] text-gray-500">
        <span className="flex items-center gap-1">
          <span style={{ color }}>●</span> Importance: {event.importance_score}
        </span>
        <span>Trend: {event.trend_score?.toFixed(0) || 0}</span>
        <span>{event.source_count} sources</span>
        {event.viral_probability > 0 && (
          <span className="text-orange-400">🔥 {event.viral_probability}% viral</span>
        )}
      </div>
    </div>
  );
}

function SpikeRow({ spike }: { spike: KeywordSpike }) {
  const ratio = spike.spike_ratio;
  const barWidth = Math.min(100, (ratio / 20) * 100);
  const color = ratio >= 10 ? '#EF4444' : ratio >= 5 ? '#F59E0B' : '#3B82F6';

  return (
    <div className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-white">{spike.keyword}</span>
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded"
            style={{ color, backgroundColor: `${color}15` }}
          >
            {ratio.toFixed(1)}x
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-gray-500">
          <span>{timeAgo(spike.detected_at)}</span>
          <span>{spike.source_count} sources</span>
          <span>Score: {spike.score}</span>
        </div>
      </div>
      <div className="w-24 h-2 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${barWidth}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function StrategyCard({ strategy }: { strategy: StrategyPreset }) {
  const pairs = strategy.recommended_pairs ?? [];
  const returnPct = strategy.backtest_return_pct;
  const isPositive = returnPct !== null && returnPct > 0;
  const marketBadge = strategy.recommended_market === 'futures'
    ? { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' }
    : { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' };

  const stars = Math.round(strategy.rating * 2) / 2;

  return (
    <div className="bg-[#12121A] border border-white/5 rounded-xl p-5 hover:border-orange-500/20 transition-all group cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <h4 className="text-sm font-semibold text-white group-hover:text-orange-400 transition-colors">
          {strategy.name}
        </h4>
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${marketBadge.bg} ${marketBadge.text} border ${marketBadge.border}`}>
          {strategy.recommended_market}
        </span>
      </div>

      <p className="text-xs text-gray-400 line-clamp-2 mb-4">{strategy.description}</p>

      {returnPct !== null && (
        <div className="grid grid-cols-4 gap-2 mb-3">
          <div className="text-center">
            <div className={`text-sm font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {isPositive ? '+' : ''}{returnPct}%
            </div>
            <div className="text-[9px] text-gray-600">Return</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-bold text-white">{strategy.backtest_win_rate}%</div>
            <div className="text-[9px] text-gray-600">Win Rate</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-bold text-white">{strategy.backtest_sharpe}</div>
            <div className="text-[9px] text-gray-600">Sharpe</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-bold text-orange-400">{strategy.backtest_max_drawdown}%</div>
            <div className="text-[9px] text-gray-600">Drawdown</div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map(i => (
            <svg key={i} className={`w-3 h-3 ${i <= stars ? 'text-orange-400' : 'text-gray-700'}`} fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
          <span className="text-[10px] text-gray-600 ml-1">{strategy.rating}/5</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {pairs.slice(0, 3).map(p => (
            <span key={p} className="text-[9px] px-1.5 py-0.5 bg-white/5 rounded text-gray-500">{p.replace('_USDT', '')}</span>
          ))}
          {pairs.length > 3 && (
            <span className="text-[9px] text-gray-600">+{pairs.length - 3}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function TrendingCloud({ topics }: { topics: TrendingTopic[] }) {
  if (!topics?.length) return null;

  return (
    <div className="bg-[#12121A] border border-white/5 rounded-xl p-5">
      <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
        <span className="text-orange-400">🔥</span> Trending Keywords
      </h3>
      <div className="flex flex-wrap gap-2">
        {topics.map((t) => {
          const score = parseFloat(t.sentiment_score);
          const borderColor = score > 0.2 ? 'border-green-500/30' : score < -0.2 ? 'border-red-500/30' : 'border-white/10';
          return (
            <span
              key={t.id}
              className={`text-xs px-3 py-1.5 bg-white/5 border ${borderColor} rounded-lg text-gray-300`}
            >
              {t.keyword}
              <span className="ml-1.5 text-gray-600">{t.mention_count}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

function actionStyle(action: string): { bg: string; text: string; border: string; icon: string } {
  switch (action) {
    case 'buy': return { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20', icon: '▲' };
    case 'sell': return { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', icon: '▼' };
    case 'hold': return { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', icon: '◆' };
    case 'close': return { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20', icon: '✕' };
    default: return { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/20', icon: '•' };
  }
}

function riskBadge(level: string): { bg: string; text: string } {
  switch (level) {
    case 'low': return { bg: 'bg-green-500/10', text: 'text-green-400' };
    case 'medium': return { bg: 'bg-yellow-500/10', text: 'text-yellow-400' };
    case 'high': return { bg: 'bg-red-500/10', text: 'text-red-400' };
    default: return { bg: 'bg-gray-500/10', text: 'text-gray-400' };
  }
}

function AgentDecisionCard({ decision }: { decision: AgentDecision }) {
  const act = actionStyle(decision.action);
  const risk = riskBadge(decision.risk_level);
  const confWidth = Math.min(100, decision.confidence);
  const confColor = decision.confidence >= 70 ? '#22c55e' : decision.confidence >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <div className={`bg-[#12121A] border ${decision.approved ? act.border : 'border-white/5'} rounded-xl p-4 hover:border-white/10 transition-all`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-white">{decision.ticker}</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${act.bg} ${act.text} border ${act.border}`}>
            {act.icon} {decision.action}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {decision.approved ? (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20">✓ Approved</span>
          ) : (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">✗ Rejected</span>
          )}
        </div>
      </div>

      {/* Confidence bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-[10px] mb-1">
          <span className="text-gray-500">Confidence</span>
          <span style={{ color: confColor }} className="font-bold">{decision.confidence}%</span>
        </div>
        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${confWidth}%`, backgroundColor: confColor }} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3 text-center">
        <div>
          <div className={`text-xs font-semibold ${risk.text}`}>{decision.risk_level}</div>
          <div className="text-[9px] text-gray-600">Risk</div>
        </div>
        <div>
          <div className="text-xs font-semibold text-white">{decision.strategy}</div>
          <div className="text-[9px] text-gray-600">Strategy</div>
        </div>
        <div>
          <div className="text-xs font-semibold text-cyan-400">{decision.signal_score}</div>
          <div className="text-[9px] text-gray-600">Signal</div>
        </div>
      </div>

      {/* Trade params */}
      {decision.approved && (decision.leverage || decision.tp_pct || decision.sl_pct) && (
        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[9px] text-gray-500">
          {decision.leverage && <span>Lev: <span className="text-gray-300">{decision.leverage}x</span></span>}
          {decision.tp_pct && <span>TP: <span className="text-green-400">{decision.tp_pct.toFixed(1)}%</span></span>}
          {decision.sl_pct && <span>SL: <span className="text-red-400">{decision.sl_pct.toFixed(1)}%</span></span>}
          {decision.position_size_pct && <span>Size: <span className="text-gray-300">{decision.position_size_pct.toFixed(1)}%</span></span>}
        </div>
      )}

      {/* PnL if executed */}
      {decision.executed && decision.realized_pnl !== null && (
        <div className="mt-2 pt-2 border-t border-white/5 flex items-center gap-2">
          <span className="text-[9px] text-gray-500">P&L:</span>
          <span className={`text-xs font-bold ${decision.realized_pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {decision.realized_pnl >= 0 ? '+' : ''}{decision.realized_pnl_pct?.toFixed(2)}%
          </span>
        </div>
      )}

      {/* Risk warnings */}
      {Array.isArray(decision.risk_warnings) && decision.risk_warnings.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {decision.risk_warnings.slice(0, 3).map((w, i) => (
            <span key={i} className="text-[8px] px-1.5 py-0.5 bg-yellow-500/10 border border-yellow-500/20 rounded text-yellow-400">
              ⚠ {w}
            </span>
          ))}
        </div>
      )}

      <div className="mt-2 text-[10px] text-gray-600">{timeAgo(decision.created_at)}</div>
    </div>
  );
}

function PipelineStatsBar({ stats }: { stats: PipelineStats }) {
  const wr = num(stats.win_rate);
  const pnl = num(stats.total_pnl);
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      <div className="bg-[#12121A] border border-white/5 rounded-xl p-4 text-center">
        <div className="text-lg font-bold text-cyan-400">{num(stats.total_decisions)}</div>
        <div className="text-[10px] text-gray-500">Decisions</div>
      </div>
      <div className="bg-[#12121A] border border-white/5 rounded-xl p-4 text-center">
        <div className="text-lg font-bold text-green-400">{num(stats.total_approved)}</div>
        <div className="text-[10px] text-gray-500">Approved</div>
      </div>
      <div className="bg-[#12121A] border border-white/5 rounded-xl p-4 text-center">
        <div className="text-lg font-bold text-white">{wr.toFixed(0)}%</div>
        <div className="text-[10px] text-gray-500">Win Rate</div>
      </div>
      <div className="bg-[#12121A] border border-white/5 rounded-xl p-4 text-center">
        <div className={`text-lg font-bold ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)}%
        </div>
        <div className="text-[10px] text-gray-500">Total P&L</div>
      </div>
    </div>
  );
}

// Pattern name mapping
const PATTERN_NAMES: Record<number, string> = {
  1: 'Double Bottom',
  2: 'Double Top',
  3: 'Head & Shoulders',
  4: 'Inv H&S',
  5: 'Bull Divergence',
  6: 'Bear Divergence',
  7: 'Triangle',
  8: 'Wedge',
};

function signalStyle(signal: string): { bg: string; text: string; border: string } {
  switch (signal) {
    case 'BUY': return { bg: 'bg-green-500/15', text: 'text-green-400', border: 'border-green-500/30' };
    case 'SELL': return { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30' };
    case 'WATCH': return { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' };
    case 'CLOSE_LONG': return { bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/30' };
    case 'CLOSE_SHORT': return { bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/30' };
    default: return { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/20' };
  }
}

function trendColor(trend: string): string {
  if (trend === 'bullish') return 'text-green-400';
  if (trend === 'bearish') return 'text-red-400';
  return 'text-gray-500';
}

function rsiColor(rsi: number): string {
  if (rsi >= 70) return 'text-red-400';
  if (rsi <= 30) return 'text-green-400';
  return 'text-gray-300';
}

function ScannerCard({ coin }: { coin: ScannerResult }) {
  const sig = signalStyle(coin.signal ?? 'HOLD');
  const ticker = String(coin.symbol ?? '').replace('_USDT', '');
  const score = num(coin.score);
  const rsi = num(coin.rsi);
  const change24 = num(coin.change_24h);
  const bbPos = num(coin.bb_pos);
  const fund = num(coin.funding_rate);
  const optTp = num(coin.opt_tp_pct);
  const optSl = num(coin.opt_sl_pct);
  const lev = num(coin.opt_leverage);
  const price = num(coin.price);
  const scoreBarWidth = Math.min(100, Math.abs(score));
  const scoreColor = score >= 60 ? '#22c55e' : score >= 30 ? '#f59e0b' : score <= -30 ? '#ef4444' : '#6b7280';

  return (
    <div className={`bg-[#12121A] border ${coin.signal === 'BUY' ? 'border-green-500/20' : coin.signal === 'SELL' ? 'border-red-500/20' : 'border-white/5'} rounded-xl p-4 hover:border-white/10 transition-all`}>
      {/* Header: Symbol + Signal */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-white">{ticker}</span>
          <span className="text-[10px] text-gray-500">${price.toLocaleString(undefined, { maximumFractionDigits: 4 })}</span>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sig.bg} ${sig.text} border ${sig.border}`}>
          {coin.signal ?? '—'}
        </span>
      </div>

      {/* Score bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-[10px] mb-1">
          <span className="text-gray-500">Score</span>
          <span style={{ color: scoreColor }} className="font-bold">{score}</span>
        </div>
        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${scoreBarWidth}%`, backgroundColor: scoreColor }}
          />
        </div>
      </div>

      {/* Indicators row */}
      <div className="grid grid-cols-3 gap-2 mb-3 text-center">
        <div>
          <div className={`text-xs font-semibold ${rsiColor(rsi)}`}>{rsi.toFixed(1)}</div>
          <div className="text-[9px] text-gray-600">RSI</div>
        </div>
        <div>
          <div className={`text-xs font-semibold ${trendColor(coin.trend ?? 'flat')}`}>
            {coin.trend === 'bullish' ? '▲' : coin.trend === 'bearish' ? '▼' : '—'} {coin.trend ?? '—'}
          </div>
          <div className="text-[9px] text-gray-600">Trend</div>
        </div>
        <div>
          <div className={`text-xs font-semibold ${change24 >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {change24 >= 0 ? '+' : ''}{change24.toFixed(2)}%
          </div>
          <div className="text-[9px] text-gray-600">24h</div>
        </div>
      </div>

      {/* Volatility + BB + Funding */}
      <div className="flex items-center gap-2 flex-wrap mb-2">
        <span className={`text-[9px] px-1.5 py-0.5 rounded ${coin.volatility === 'high' ? 'bg-red-500/10 text-red-400' : coin.volatility === 'medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'}`}>
          {coin.volatility ?? '—'} vol
        </span>
        <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-gray-400">
          BB: {(bbPos * 100).toFixed(0)}%
        </span>
        {fund !== 0 && (
          <span className={`text-[9px] px-1.5 py-0.5 rounded ${fund > 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
            F: {(fund * 100).toFixed(4)}%
          </span>
        )}
      </div>

      {/* Patterns */}
      {(coin.patterns ?? []).length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {(coin.patterns ?? []).slice(0, 2).map((p, i) => (
            <span key={i} className="text-[9px] px-1.5 py-0.5 bg-purple-500/10 border border-purple-500/20 rounded text-purple-300">
              {PATTERN_NAMES[p.Pattern] || `P${p.Pattern}`}
            </span>
          ))}
        </div>
      )}

      {/* Optimal params */}
      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[9px] text-gray-500">
        <span>Lev: <span className="text-gray-300">{lev}x</span></span>
        <span>TP: <span className="text-green-400">{optTp.toFixed(1)}%</span></span>
        <span>SL: <span className="text-red-400">{optSl.toFixed(1)}%</span></span>
      </div>
    </div>
  );
}

function SkeletonCards() {
  return (
    <div className="space-y-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-[#12121A] border border-white/5 rounded-xl h-32 animate-pulse" />
      ))}
    </div>
  );
}

// ============================================================================
// Main Page
// ============================================================================

export default function SignalsPage() {
  const pathname = usePathname();
  const locale = parseLocale(pathname);

  const [events, setEvents] = useState<NewsEvent[]>([]);
  const [breaking, setBreaking] = useState<NewsEvent[]>([]);
  const [spikes, setSpikes] = useState<KeywordSpike[]>([]);
  const [trending, setTrending] = useState<TrendingTopic[]>([]);
  const [strategies, setStrategies] = useState<StrategyPreset[]>([]);
  const [scannerData, setScannerData] = useState<ScannerResponse | null>(null);
  const [agentDecisions, setAgentDecisions] = useState<AgentDecision[]>([]);
  const [pipelineStats, setPipelineStats] = useState<PipelineStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      // Fetch bot scanner data (always works - direct to goga)
      const scannerPromise = fetchScanner();

      // Fetch news data (may 404 if newsanalyzer not seeded)
      const [eventsData, breakingData, spikesData, trendingData, strategiesData, scanner, decisionsData, statsData] = await Promise.all([
        apiFetch<{ results: NewsEvent[] }>('/newsanalyzer/public/events/?hours=48').catch(() => ({ results: [] })),
        apiFetch<NewsEvent[]>('/newsanalyzer/public/events/breaking/').catch(() => []),
        apiFetch<{ results: KeywordSpike[] }>('/newsanalyzer/public/spikes/?hours=24').catch(() => ({ results: [] })),
        apiFetch<TrendingTopic[]>('/news/trending/?period=daily&limit=20').catch(() => []),
        apiFetch<{ results: StrategyPreset[] }>('/trading/strategies/').catch(() => ({ results: [] })),
        scannerPromise,
        apiFetch<AgentDecision[]>('/agents/decisions/').catch(() => []),
        apiFetch<PipelineStats>('/agents/decisions/stats/').catch(() => null),
      ]);
      setEvents(asArray<NewsEvent>(eventsData));
      setBreaking(asArray<NewsEvent>(breakingData));
      setSpikes(asArray<KeywordSpike>(spikesData).slice(0, 20));
      setTrending(asArray<TrendingTopic>(trendingData));
      setStrategies(
        asArray<StrategyPreset>(strategiesData).map((s) => ({
          ...s,
          recommended_pairs: s.recommended_pairs ?? [],
        })),
      );
      if (scanner) setScannerData(normalizeScannerResponse(scanner));
      const decisionsRaw = asArray<AgentDecision>(decisionsData);
      setAgentDecisions(decisionsRaw.slice(0, 20).map(normalizeAgentDecision));
      if (statsData) setPipelineStats(normalizePipelineStats(statsData));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load signals');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 120000); // Refresh every 2min
    return () => clearInterval(interval);
  }, [loadData]);

  // Combine breaking + events, deduplicate
  const breakingIds = new Set(breaking.map((e) => e.id));
  const allEvents = [...breaking, ...events.filter((e) => !breakingIds.has(e.id))];

  return (
    <div className="bm-page">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        <SignalHeader locale={locale} />

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center text-red-400 text-sm mb-8">
            {error}
            <button onClick={loadData} className="ml-3 underline hover:no-underline">Retry</button>
          </div>
        )}

        {/* Agent AI Decisions */}
        {agentDecisions.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="text-cyan-400">🧠</span> Agent AI Decisions
                <span className="text-[10px] px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 font-medium">
                  Pipeline · every 5 min
                </span>
              </h2>
              {pipelineStats?.last_run_at && (
                <span className="text-[11px] text-gray-600">Last run: {timeAgo(pipelineStats.last_run_at)}</span>
              )}
            </div>
            {pipelineStats && <PipelineStatsBar stats={pipelineStats} />}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {agentDecisions.map((d) => (
                <AgentDecisionCard key={d.id} decision={d} />
              ))}
            </div>
          </div>
        )}

        {/* Live Bot Scanner — Full Width */}
        {scannerData && (scannerData.results ?? []).length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="text-green-400">🤖</span> Live Market Scanner
                <span className="text-[10px] px-2 py-0.5 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 font-medium">
                  {scannerData.scanned} pairs · {scannerData.timeframe}
                </span>
              </h2>
              <span className="text-[11px] text-gray-600">
                {new Date(scannerData.timestamp * 1000).toLocaleTimeString()}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {[...(scannerData.results ?? [])]
                .sort((a, b) => num(b.score) - num(a.score))
                .map((coin) => (
                  <ScannerCard key={coin.symbol} coin={coin} />
                ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main column — Events */}
          <div className="lg:col-span-2 space-y-6">
            {/* Breaking / High importance */}
            {breaking.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-red-400 flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                  Breaking
                </h2>
                <div className="space-y-3">
                  {breaking.map((event) => (
                    <BreakingCard key={event.id} event={event} />
                  ))}
                </div>
              </div>
            )}

            {/* All events */}
            <div>
              <h2 className="text-lg font-bold text-white mb-4">Active Events</h2>
              {loading ? (
                <SkeletonCards />
              ) : allEvents.length > 0 ? (
                <div className="space-y-3">
                  {allEvents.filter((e) => !breakingIds.has(e.id)).map((event) => (
                    <BreakingCard key={event.id} event={event} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 text-sm">
                  No active events in the last 48 hours
                </div>
              )}
            </div>
          </div>

          {/* Sidebar — Spikes + Trending */}
          <div className="space-y-6">
            {/* Strategy Showcase */}
            {strategies.length > 0 && (
              <div className="bg-[#12121A] border border-white/5 rounded-xl p-5">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-blue-400">🤖</span> Trading Strategies
                </h3>
                <div className="space-y-3">
                  {strategies.slice(0, 4).map((s) => (
                    <Link key={s.id} href={`/${locale}/strategies/${s.slug}`}>
                      <StrategyCard strategy={s} />
                    </Link>
                  ))}
                </div>
                {strategies.length > 4 && (
                  <Link
                    href={`/${locale}/signals`}
                    className="block text-center text-xs text-orange-400 mt-4 hover:underline"
                  >
                    View all {strategies.length} strategies →
                  </Link>
                )}
              </div>
            )}

            {/* Keyword spikes - moved here for better visibility */}
            {spikes.length > 0 && (
              <div className="bg-[#12121A] border border-white/5 rounded-xl p-5">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-amber-400">⚡</span> Keyword Spikes (24h)
                </h3>
                <div>
                  {spikes.slice(0, 15).map((spike) => (
                    <SpikeRow key={spike.id} spike={spike} />
                  ))}
                </div>
              </div>
            )}

            {/* Trending keywords */}
            <TrendingCloud topics={trending} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
