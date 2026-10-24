'use client';

/**
 * Strategy Detail Page — Full strategy info, backtest metrics, equity curve
 * Generation: GEN-TRADING-002
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import Navbar from '@/components/portal/Navbar';
import Footer from '@/components/portal/Footer';
import { parseLocale } from '@/i18n/config';

// ============================================================================
// Types
// ============================================================================

interface StrategyPreset {
  id: string;
  name: string;
  slug: string;
  description: string;
  how_it_works: string;
  config: Record<string, any>;
  recommended_market: string;
  recommended_pairs: string[];
  backtest_return_pct: number | null;
  backtest_max_drawdown: number | null;
  backtest_win_rate: number | null;
  backtest_sharpe: number | null;
  backtest_period_days: number | null;
  backtest_total_trades: number | null;
  backtest_updated_at: string | null;
  rating: number;
  rating_count: number;
  is_public: boolean;
  created_at: string;
}

// ============================================================================
// API
// ============================================================================

const API = process.env.NEXT_PUBLIC_API_URL || '';

async function apiFetch<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API}/api/v1${path}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// ============================================================================
// Helpers
// ============================================================================

function StarRating({ rating }: { rating: number }) {
  const stars = Math.round(rating);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} className={`w-5 h-5 ${i <= stars ? 'text-orange-400' : 'text-gray-700'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="ml-2 text-sm text-gray-400">{rating}/5</span>
    </div>
  );
}

function MetricCard({ label, value, suffix, color }: { label: string; value: string | number; suffix?: string; color?: string }) {
  return (
    <div className="bg-[#12121A] border border-gray-800/50 rounded-xl p-4 text-center">
      <div className={`text-2xl font-bold ${color || 'text-white'}`}>
        {value}{suffix}
      </div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  );
}

function MiniEquityCurve({ data }: { data: number[] }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 600;
  const h = 200;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 20) - 10;
    return `${x},${y}`;
  }).join(' ');

  const isPositive = data[data.length - 1] >= data[0];
  const color = isPositive ? '#22c55e' : '#ef4444';

  const areaPoints = `0,${h} ${points} ${w},${h}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-48" preserveAspectRatio="none">
      <defs>
        <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill="url(#equityGrad)" />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
    </svg>
  );
}

function ConfigItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-800/30 last:border-0">
      <span className="text-sm text-gray-400">{label}</span>
      <span className="text-sm font-medium text-white">{value}</span>
    </div>
  );
}

// ============================================================================
// Page
// ============================================================================

export default function StrategyDetailPage() {
  const params = useParams();
  const pathname = usePathname();
  const slug = params?.slug as string;
  const locale = parseLocale(pathname);

  const [strategy, setStrategy] = useState<StrategyPreset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug) return;
    apiFetch<StrategyPreset>(`/trading/strategies/${slug}/`).then(data => {
      if (data && data.id) {
        setStrategy(data);
      } else {
        setError(true);
      }
      setLoading(false);
    });
  }, [slug]);

  // Generate a synthetic equity curve from backtest data
  const equityCurve = strategy ? generateEquityCurve(strategy) : [];

  if (loading) {
    return (
      <div className="bm-page">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-20 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-800 rounded w-64 mx-auto mb-4" />
            <div className="h-4 bg-gray-800 rounded w-96 mx-auto" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !strategy) {
    return (
      <div className="bm-page">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-20 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold mb-2">Strategy Not Found</h1>
          <p className="text-gray-400 mb-6">The strategy you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <Link href={`/${locale}/demo`} className="text-orange-400 hover:text-orange-300 transition-colors">
            ← Back to AI OS Demo
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const returnPct = strategy.backtest_return_pct ?? 0;
  const isPositive = returnPct >= 0;
  const marketBadge = strategy.recommended_market === 'futures'
    ? { label: 'Futures', bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' }
    : { label: 'Spot', bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' };

  const config = strategy.config || {};

  return (
    <div className="bm-page">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href={`/${locale}/demo`} className="hover:text-gray-300 transition-colors">AI OS Demo</Link>
          <span>/</span>
          <span className="text-gray-300">{strategy.name}</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-3xl font-bold">{strategy.name}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${marketBadge.bg} ${marketBadge.text} ${marketBadge.border}`}>
                {marketBadge.label}
              </span>
            </div>
            <p className="text-gray-400 text-lg max-w-2xl mb-4">{strategy.description}</p>
            <StarRating rating={strategy.rating} />
          </div>

          <div className="flex gap-3">
            <Link
              href={`/${locale}/demo`}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-black font-bold rounded-xl hover:from-orange-400 hover:to-amber-400 transition-all shadow-lg shadow-orange-500/20"
            >
              🚀 Try in Demo
            </Link>
            <Link
              href={`/${locale}/strategies`}
              className="px-6 py-3 bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700 transition-colors"
            >
              All Strategies
            </Link>
          </div>
        </div>

        {/* Backtest Metrics Grid */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="text-orange-400">📊</span> Backtest Performance
            {strategy.backtest_period_days && (
              <span className="text-xs text-gray-500 font-normal">({strategy.backtest_period_days} days)</span>
            )}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <MetricCard
              label="Return"
              value={`${isPositive ? '+' : ''}${returnPct}`}
              suffix="%"
              color={isPositive ? 'text-green-400' : 'text-red-400'}
            />
            <MetricCard
              label="Win Rate"
              value={strategy.backtest_win_rate ?? '—'}
              suffix="%"
              color="text-blue-400"
            />
            <MetricCard
              label="Sharpe Ratio"
              value={strategy.backtest_sharpe ?? '—'}
              color={(strategy.backtest_sharpe ?? 0) >= 1.5 ? 'text-green-400' : 'text-yellow-400'}
            />
            <MetricCard
              label="Max Drawdown"
              value={strategy.backtest_max_drawdown ?? '—'}
              suffix="%"
              color="text-red-400"
            />
            <MetricCard
              label="Total Trades"
              value={strategy.backtest_total_trades ?? '—'}
              color="text-gray-300"
            />
            <MetricCard
              label="Rating"
              value={strategy.rating}
              suffix="/5"
              color="text-orange-400"
            />
          </div>
        </section>

        {/* Equity Curve */}
        {equityCurve.length > 0 && (
          <section className="mb-8">
            <div className="bg-[#12121A] border border-gray-800/50 rounded-2xl p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="text-green-400">📈</span> Simulated Equity Curve
              </h2>
              <MiniEquityCurve data={equityCurve} />
              <div className="flex justify-between text-xs text-gray-600 mt-2">
                <span>Start</span>
                <span>{strategy.backtest_period_days} days</span>
              </div>
            </div>
          </section>
        )}

        {/* Two column layout */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* How it works */}
          <div className="lg:col-span-2">
            <div className="bg-[#12121A] border border-gray-800/50 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-blue-400">⚙️</span> How It Works
              </h2>
              <div className="text-gray-300 leading-relaxed whitespace-pre-line">
                {strategy.how_it_works || 'Strategy details coming soon.'}
              </div>
            </div>
          </div>

          {/* Sidebar: Config & Pairs */}
          <div className="space-y-6">
            {/* Strategy Configuration */}
            <div className="bg-[#12121A] border border-gray-800/50 rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="text-purple-400">🔧</span> Configuration
              </h3>
              {config.ema_fast && <ConfigItem label="EMA Fast" value={config.ema_fast} />}
              {config.ema_slow && <ConfigItem label="EMA Slow" value={config.ema_slow} />}
              {config.rsi_period && <ConfigItem label="RSI Period" value={config.rsi_period} />}
              {config.rsi_buy && <ConfigItem label="RSI Buy" value={`< ${config.rsi_buy}`} />}
              {config.rsi_sell && <ConfigItem label="RSI Sell" value={`> ${config.rsi_sell}`} />}
              {config.volume_spike && <ConfigItem label="Volume Spike" value={`${config.volume_spike}x`} />}
              {config.bb_period && <ConfigItem label="BB Period" value={config.bb_period} />}
              {config.bb_std && <ConfigItem label="BB Std Dev" value={config.bb_std} />}
              {config.macd_fast && <ConfigItem label="MACD Fast" value={config.macd_fast} />}
              {config.macd_slow && <ConfigItem label="MACD Slow" value={config.macd_slow} />}
              {config.macd_signal && <ConfigItem label="MACD Signal" value={config.macd_signal} />}
              {config.take_profit && <ConfigItem label="Take Profit" value={`${config.take_profit}%`} />}
              {config.stop_loss && <ConfigItem label="Stop Loss" value={`${config.stop_loss}%`} />}
              {config.leverage && <ConfigItem label="Leverage" value={`${config.leverage}x`} />}
              {config.grid_levels && <ConfigItem label="Grid Levels" value={config.grid_levels} />}
              {config.grid_spacing && <ConfigItem label="Grid Spacing" value={`${config.grid_spacing}%`} />}
              {config.dca_interval && <ConfigItem label="DCA Interval" value={config.dca_interval} />}
              {config.dca_amount && <ConfigItem label="DCA Amount" value={`$${config.dca_amount}`} />}
              <ConfigItem label="Market" value={strategy.recommended_market === 'futures' ? 'Futures' : 'Spot'} />
            </div>

            {/* Recommended Pairs */}
            {strategy.recommended_pairs && strategy.recommended_pairs.length > 0 && (
              <div className="bg-[#12121A] border border-gray-800/50 rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span className="text-cyan-400">💱</span> Recommended Pairs
                </h3>
                <div className="flex flex-wrap gap-2">
                  {strategy.recommended_pairs.map((pair: string) => (
                    <span key={pair} className="px-3 py-1.5 bg-gray-800 rounded-lg text-sm text-gray-300 font-mono">
                      {pair}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-500/20 rounded-2xl p-6 text-center">
              <div className="text-3xl mb-3">🤖</div>
              <h3 className="font-bold mb-2">Ready to test?</h3>
              <p className="text-sm text-gray-400 mb-4">Try this strategy with $1,000 virtual balance. No risk involved.</p>
              <Link
                href={`/${locale}/demo`}
                className="block w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-black font-bold rounded-xl hover:from-orange-400 hover:to-amber-400 transition-all"
              >
                Start Demo Trading
              </Link>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-xl p-4 text-xs text-gray-500 mb-8">
          <strong className="text-yellow-500/80">⚠️ Disclaimer:</strong> Past backtest performance does not guarantee future results. 
          Trading cryptocurrencies involves significant risk of loss. The metrics shown are based on historical simulations and may not 
          reflect real-world trading conditions including slippage, fees, and market impact. Always do your own research and never invest 
          more than you can afford to lose.
        </div>
      </main>

      <Footer />
    </div>
  );
}

// ============================================================================
// Equity Curve Generator
// ============================================================================

function generateEquityCurve(strategy: StrategyPreset): number[] {
  const totalReturn = (strategy.backtest_return_pct ?? 0) / 100;
  const maxDD = (strategy.backtest_max_drawdown ?? 5) / 100;
  const days = strategy.backtest_period_days ?? 90;
  const points = Math.min(days, 120);
  
  if (points < 2) return [];

  const curve: number[] = [10000];
  const dailyReturn = Math.pow(1 + totalReturn, 1 / points) - 1;
  
  // Seed for reproducible curve based on strategy name
  let seed = 0;
  for (let i = 0; i < (strategy.slug || '').length; i++) {
    seed += strategy.slug.charCodeAt(i);
  }
  
  const seededRandom = (s: number) => {
    const x = Math.sin(s) * 10000;
    return x - Math.floor(x);
  };

  for (let i = 1; i < points; i++) {
    const noise = (seededRandom(seed + i * 7) - 0.5) * maxDD * 0.3;
    // Add a drawdown period in the middle
    const drawdownFactor = i > points * 0.35 && i < points * 0.5 ? -maxDD * 0.05 : 0;
    const prevVal = curve[i - 1];
    const change = dailyReturn + noise + drawdownFactor;
    curve.push(Math.max(prevVal * (1 + change), prevVal * (1 - maxDD)));
  }

  // Ensure final value matches expected return
  const actualFinal = curve[curve.length - 1];
  const expectedFinal = 10000 * (1 + totalReturn);
  const adjustment = expectedFinal / actualFinal;
  
  return curve.map((v, i) => {
    const weight = i / (curve.length - 1);
    return v * (1 + (adjustment - 1) * weight);
  });
}
