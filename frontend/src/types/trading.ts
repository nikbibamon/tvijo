/**
 * Trading Platform Types
 * Generation: GEN-TRADING-001
 */

export interface TraderProfile {
  email: string;
  full_name: string;
  subscription_tier: 'free' | 'starter' | 'pro' | 'enterprise';
  subscription_expires_at: string | null;
  referral_code: string;
  referral_earnings: string;
  is_premium: boolean;
  max_bots: number;
  onboarding_completed: boolean;
  onboarding_step: number;
  telegram_channel_id: string;
  created_at: string;
}

export interface DemoAccount {
  id: string;
  balance: string;
  initial_balance: string;
  total_pnl: string;
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  win_rate: string;
  total_return_pct: string;
  max_drawdown_pct: string;
  peak_balance: string;
  reset_count: number;
  last_reset_at: string | null;
  created_at: string;
}

export interface StrategyPreset {
  id: string;
  name: string;
  slug: string;
  description: string;
  how_it_works: string;
  config: Record<string, any>;
  recommended_pairs: string[];
  recommended_market: 'spot' | 'futures';
  backtest_return_pct: string | null;
  backtest_max_drawdown: string | null;
  backtest_win_rate: string | null;
  backtest_sharpe: string | null;
  backtest_period_days: number | null;
  backtest_total_trades: number | null;
  backtest_updated_at: string | null;
  rating: string;
  rating_count: number;
  is_public: boolean;
  created_at: string;
}

export interface TradingBot {
  id: string;
  pair: string;
  market: 'spot' | 'futures';
  strategy: string | null;
  strategy_name: string | null;
  exchange_account: string | null;
  exchange_name: string | null;
  order_size_usdt: string;
  max_position_usdt: string;
  take_profit_pct: string;
  stop_loss_pct: string;
  leverage: number;
  is_demo: boolean;
  status: 'idle' | 'running' | 'paused' | 'stopped' | 'error';
  started_at: string | null;
  stopped_at: string | null;
  error_message: string;
  total_pnl: string;
  total_trades: number;
  winning_trades: number;
  total_fees: string;
  win_rate: string;
  created_at: string;
}

export interface Trade {
  id: string;
  bot: string;
  bot_pair: string;
  side: 'buy' | 'sell' | 'close_long' | 'close_short';
  amount: string;
  quantity: string;
  entry_price: string;
  exit_price: string | null;
  pnl: string | null;
  fee: string;
  fee_rebate: string;
  status: 'open' | 'closed' | 'cancelled';
  signal_reason: string;
  opened_at: string;
  closed_at: string | null;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  balance: string;
  pnl: string;
  return_pct: string;
  win_rate: string;
  total_trades: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
