'use client';

/**
 * Money Button — Auto-Scanner Panel
 * Generation: GEN-TRADING-004
 *
 * Scans all GOGA pairs for EMA/RSI/Volume signals.
 * Public endpoint — no auth required.
 */

import { useState, useCallback } from 'react';
import { scanMarket } from '@/services/trading-api';
import type { ScanResult, ScanResponse } from '@/services/trading-api';

function signalBadge(signal: string) {
  switch (signal) {
    case 'strong_buy':
      return <span className="px-2 py-0.5 text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">STRONG BUY</span>;
    case 'buy':
      return <span className="px-2 py-0.5 text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/30 rounded-full">BUY</span>;
    case 'neutral':
      return <span className="px-2 py-0.5 text-xs font-bold bg-gray-500/20 text-gray-400 border border-gray-500/30 rounded-full">NEUTRAL</span>;
    case 'sell':
      return <span className="px-2 py-0.5 text-xs font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-full">SELL</span>;
    case 'strong_sell':
      return <span className="px-2 py-0.5 text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30 rounded-full">STRONG SELL</span>;
    default:
      return null;
  }
}

function strengthBar(val: number) {
  const color =
    val >= 75 ? 'bg-emerald-500' :
    val >= 60 ? 'bg-green-500' :
    val >= 40 ? 'bg-gray-500' :
    val >= 25 ? 'bg-orange-500' :
    'bg-red-500';
  return (
    <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${val}%` }} />
    </div>
  );
}

function fmtPrice(val: number) {
  if (val >= 1000) return `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (val >= 1) return `$${val.toFixed(4)}`;
  return `$${val.toFixed(6)}`;
}

function fmtVol(val: number) {
  if (val >= 1e9) return `$${(val / 1e9).toFixed(1)}B`;
  if (val >= 1e6) return `$${(val / 1e6).toFixed(1)}M`;
  if (val >= 1e3) return `$${(val / 1e3).toFixed(0)}K`;
  return `$${val.toFixed(0)}`;
}

export default function ScannerPanel() {
  const [data, setData] = useState<ScanResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const handleScan = useCallback(async () => {
    setLoading(true);
    const res = await scanMarket();
    setData(res);
    setLoading(false);
  }, []);

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            Market Scanner
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">EMA 9/21 + RSI 14 + Volume analysis on 15 pairs</p>
        </div>
        <button
          onClick={handleScan}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-xl hover:from-amber-400 hover:to-orange-500 transition-all disabled:opacity-50 shadow-lg shadow-orange-500/20"
        >
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              Scanning...
            </>
          ) : (
            <>
              <span className="text-lg">💰</span>
              Money Button
            </>
          )}
        </button>
      </div>

      {/* Summary */}
      {data && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 text-center">
            <div className="text-2xl font-bold text-emerald-400">{data.buy_signals}</div>
            <div className="text-xs text-emerald-400/70">Buy Signals</div>
          </div>
          <div className="bg-gray-500/10 border border-gray-500/20 rounded-xl px-4 py-3 text-center">
            <div className="text-2xl font-bold text-gray-400">{data.neutral}</div>
            <div className="text-xs text-gray-400/70">Neutral</div>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-center">
            <div className="text-2xl font-bold text-red-400">{data.sell_signals}</div>
            <div className="text-xs text-red-400/70">Sell Signals</div>
          </div>
        </div>
      )}

      {/* Results */}
      {data && data.results.length > 0 && (
        <div className="space-y-2">
          {data.results.map((r) => (
            <div key={r.pair}>
              <button
                onClick={() => setExpanded(expanded === r.pair ? null : r.pair)}
                className="w-full text-left p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:border-slate-600 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 text-center">
                      <span className="text-xs font-bold text-gray-500">{Math.round(r.signal_strength)}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-white">{r.pair.replace('_', '/')}</span>
                      <span className="text-xs text-gray-500 ml-2">{fmtPrice(r.price)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium ${r.change_24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {r.change_24h >= 0 ? '+' : ''}{r.change_24h.toFixed(2)}%
                    </span>
                    {signalBadge(r.signal)}
                  </div>
                </div>
                <div className="mt-2">
                  {strengthBar(r.signal_strength)}
                </div>
              </button>

              {/* Expanded detail */}
              {expanded === r.pair && (
                <div className="mx-3 mt-1 mb-2 p-3 bg-slate-900/60 border border-slate-700/30 rounded-xl text-xs space-y-2">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {r.rsi !== null && (
                      <div>
                        <span className="text-gray-500">RSI (14)</span>
                        <div className={`font-semibold ${r.rsi < 30 ? 'text-emerald-400' : r.rsi > 70 ? 'text-red-400' : 'text-white'}`}>
                          {r.rsi}
                        </div>
                      </div>
                    )}
                    {r.ema_fast !== null && r.ema_slow !== null && (
                      <div>
                        <span className="text-gray-500">EMA 9 / 21</span>
                        <div className={`font-semibold ${r.ema_fast > r.ema_slow ? 'text-emerald-400' : 'text-red-400'}`}>
                          {r.ema_fast > r.ema_slow ? 'Bullish' : 'Bearish'}
                        </div>
                      </div>
                    )}
                    {r.volume_spike !== null && (
                      <div>
                        <span className="text-gray-500">Vol Spike</span>
                        <div className={`font-semibold ${r.volume_spike > 1.5 ? 'text-amber-400' : 'text-white'}`}>
                          {r.volume_spike}x
                        </div>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-500">Volume 24h</span>
                      <div className="font-semibold text-white">{fmtVol(r.volume_24h)}</div>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-700/30">
                    <span className="text-gray-500">Analysis:</span>
                    <ul className="mt-1 space-y-0.5">
                      {r.reasons.map((reason, i) => (
                        <li key={i} className="text-gray-300">- {reason}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          ))}

          <div className="text-center text-[10px] text-gray-600 pt-2">
            Scanned at {new Date(data.scanned_at).toLocaleTimeString()} &bull; Data from Gate.io
          </div>
        </div>
      )}

      {!data && !loading && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-3">💰</div>
          <p className="text-sm">Press the <strong>Money Button</strong> to scan 15 pairs for trading opportunities</p>
          <p className="text-xs text-gray-600 mt-1">Uses GOGA EMA 9/21 + RSI 14 + Volume spike strategy</p>
        </div>
      )}
    </div>
  );
}
