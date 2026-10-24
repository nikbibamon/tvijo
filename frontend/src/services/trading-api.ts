/**
 * Trading Platform API Client
 * Generation: GEN-TRADING-001
 */

import type {
  TraderProfile,
  DemoAccount,
  StrategyPreset,
  TradingBot,
  Trade,
  LeaderboardEntry,
  PaginatedResponse,
} from '@/types/trading';

const API_BASE = process.env.NEXT_PUBLIC_DJANGO_API_URL || '/api/v1';
const BASE = `${API_BASE}/trading`;

// ============================================================================
// Helpers
// ============================================================================

function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
}

async function tryRefreshToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  const refresh = localStorage.getItem('refresh_token');
  if (!refresh) return null;
  try {
    const res = await fetch(`${API_BASE}/auth/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    localStorage.setItem('access_token', data.access);
    if (data.refresh) localStorage.setItem('refresh_token', data.refresh);
    return data.access;
  } catch {
    return null;
  }
}

async function fetchAuth(url: string, options: RequestInit = {}): Promise<Response> {
  let token = getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let res = await fetch(url, { ...options, headers });

  if (res.status === 401 && token) {
    const newToken = await tryRefreshToken();
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`;
      res = await fetch(url, { ...options, headers });
    }
  }

  return res;
}

// ============================================================================
// Public (no auth)
// ============================================================================

export async function getStrategies(): Promise<StrategyPreset[]> {
  const res = await fetch(`${BASE}/strategies/`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.results || data;
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const res = await fetch(`${BASE}/leaderboard/`);
  if (!res.ok) return [];
  return res.json();
}

// ============================================================================
// Auth required
// ============================================================================

export async function getProfile(): Promise<TraderProfile | null> {
  const res = await fetchAuth(`${BASE}/profile/`);
  if (!res.ok) return null;
  return res.json();
}

export async function updateProfile(data: Partial<TraderProfile>): Promise<TraderProfile | null> {
  const res = await fetchAuth(`${BASE}/profile/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  if (!res.ok) return null;
  return res.json();
}

// ============================================================================
// Exchange Accounts
// ============================================================================

export interface ExchangeAccountData {
  id: string;
  exchange: string;
  exchange_display: string;
  label: string;
  api_key_masked: string;
  has_spot: boolean;
  has_futures: boolean;
  has_margin: boolean;
  is_demo: boolean;
  is_active: boolean;
  is_verified: boolean;
  last_verified_at: string | null;
  verification_error: string;
  created_at: string;
}

export async function getExchangeAccounts(): Promise<ExchangeAccountData[]> {
  const res = await fetchAuth(`${BASE}/accounts/`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.results || data;
}

export async function createExchangeAccount(params: {
  exchange: string;
  label: string;
  api_key: string;
  api_secret: string;
  passphrase?: string;
  has_spot?: boolean;
  has_futures?: boolean;
}): Promise<ExchangeAccountData | null> {
  const res = await fetchAuth(`${BASE}/accounts/`, {
    method: 'POST',
    body: JSON.stringify(params),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function deleteExchangeAccount(id: string): Promise<boolean> {
  const res = await fetchAuth(`${BASE}/accounts/${id}/`, { method: 'DELETE' });
  return res.ok;
}

export async function getDemoAccount(): Promise<DemoAccount | null> {
  const res = await fetchAuth(`${BASE}/demo/`);
  if (!res.ok) return null;
  return res.json();
}

export async function resetDemoAccount(): Promise<DemoAccount | null> {
  const res = await fetchAuth(`${BASE}/demo/reset/`, { method: 'POST' });
  if (!res.ok) return null;
  return res.json();
}

export async function getBots(demo?: boolean): Promise<TradingBot[]> {
  const params = demo !== undefined ? `?demo=${demo}` : '';
  const res = await fetchAuth(`${BASE}/bots/${params}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.results || data;
}

export async function createBot(config: {
  pair: string;
  market?: string;
  strategy_id?: string;
  order_size_usdt?: number;
  take_profit_pct?: number;
  stop_loss_pct?: number;
  leverage?: number;
}): Promise<TradingBot | { error: string }> {
  const res = await fetchAuth(`${BASE}/bots/`, {
    method: 'POST',
    body: JSON.stringify(config),
  });
  return res.json();
}

export async function startBot(botId: string): Promise<TradingBot | null> {
  const res = await fetchAuth(`${BASE}/bots/${botId}/start/`, { method: 'POST' });
  if (!res.ok) return null;
  return res.json();
}

export async function stopBot(botId: string): Promise<TradingBot | null> {
  const res = await fetchAuth(`${BASE}/bots/${botId}/stop/`, { method: 'POST' });
  if (!res.ok) return null;
  return res.json();
}

export interface AIAgent {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  suggestions: string[];
}

export async function getAIAgents(): Promise<AIAgent[]> {
  const res = await fetch(`${BASE}/ai-chat/agents/`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.agents || [];
}

export async function sendAIChat(
  messages: { role: string; content: string }[],
  provider: string = 'claude',
  agent?: string,
  conversation_id?: string,
): Promise<{ reply: string; provider: string; agent: string; conversation_id: string } | { error: string }> {
  const res = await fetchAuth(`${BASE}/ai-chat/`, {
    method: 'POST',
    body: JSON.stringify({ messages, provider, agent, conversation_id, stream: false }),
  });
  return res.json();
}

export interface ScanResult {
  pair: string;
  price: number;
  change_24h: number;
  volume_24h: number;
  signal: 'strong_buy' | 'buy' | 'neutral' | 'sell' | 'strong_sell';
  signal_strength: number;
  reasons: string[];
  rsi: number | null;
  ema_fast: number | null;
  ema_slow: number | null;
  volume_spike: number | null;
  market: string;
}

export interface ScanResponse {
  results: ScanResult[];
  total: number;
  buy_signals: number;
  sell_signals: number;
  neutral: number;
  scanned_at: string;
}

export async function scanMarket(pairs?: string[]): Promise<ScanResponse | null> {
  const params = pairs ? `?pairs=${pairs.join(',')}` : '';
  const res = await fetch(`${BASE}/scanner/${params}`);
  if (!res.ok) return null;
  return res.json();
}

// ============================================================================
// Backtesting
// ============================================================================

export interface BacktestTrade {
  id: number;
  side: string;
  entry_time: string;
  exit_time: string | null;
  entry_price: string;
  exit_price: string | null;
  amount: string;
  pnl: string | null;
  pnl_pct: string | null;
  fee: string;
  reason_open: string;
  reason_close: string;
}

export interface BacktestRun {
  id: string;
  strategy: string | null;
  strategy_name: string | null;
  pair: string;
  market: string;
  interval: string;
  period_days: number;
  initial_balance: string;
  order_size_pct: string;
  take_profit_pct: string;
  stop_loss_pct: string;
  strategy_config: Record<string, unknown>;
  status: 'pending' | 'running' | 'completed' | 'failed';
  error_message: string;
  started_at: string | null;
  completed_at: string | null;
  final_balance: string | null;
  total_pnl: string | null;
  return_pct: string | null;
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  win_rate: string | null;
  max_drawdown_pct: string | null;
  sharpe_ratio: string | null;
  profit_factor: string | null;
  avg_trade_pnl: string | null;
  best_trade_pnl: string | null;
  worst_trade_pnl: string | null;
  avg_hold_minutes: number | null;
  equity_curve: { ts: number; balance: number }[];
  trades_list: BacktestTrade[];
  created_at: string;
}

export interface BacktestRunListItem {
  id: string;
  strategy: string | null;
  strategy_name: string | null;
  pair: string;
  interval: string;
  period_days: number;
  status: string;
  return_pct: string | null;
  win_rate: string | null;
  total_trades: number;
  max_drawdown_pct: string | null;
  sharpe_ratio: string | null;
  total_pnl: string | null;
  created_at: string;
  completed_at: string | null;
}

export async function createBacktest(params: {
  pair: string;
  interval: string;
  period_days: number;
  strategy?: string;
  initial_balance?: number;
  order_size_pct?: number;
  take_profit_pct?: number;
  stop_loss_pct?: number;
}): Promise<BacktestRunListItem | null> {
  const res = await fetchAuth(`${BASE}/backtests/`, {
    method: 'POST',
    body: JSON.stringify(params),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function getBacktests(): Promise<BacktestRunListItem[]> {
  const res = await fetchAuth(`${BASE}/backtests/`);
  if (!res.ok) return [];
  return res.json();
}

export async function getBacktest(id: string): Promise<BacktestRun | null> {
  const res = await fetchAuth(`${BASE}/backtests/${id}/`);
  if (!res.ok) return null;
  return res.json();
}

export async function getTrades(botId?: string): Promise<Trade[]> {
  const params = botId ? `?bot=${botId}` : '';
  const res = await fetchAuth(`${BASE}/trades/${params}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.results || data;
}

// ============================================================================
// Pricing
// ============================================================================

export interface SubscriptionPlanData {
  id: string;
  name: string;
  tier: string;
  billing: string;
  price_usd: string;
  price_usdt: string;
  max_bots: number;
  max_exchanges: number;
  max_backtests_per_day: number;
  has_ai_chat: boolean;
  has_scanner: boolean;
  has_notifications: boolean;
  has_api_access: boolean;
  has_priority_support: boolean;
  description: string;
  features: string[];
  badge: string;
  sort_order: number;
}

export interface PricingResponse {
  plans: SubscriptionPlanData[];
  referral_reward_pct: number;
  contact: string;
  contact_url?: string;
}

export async function getPricing(): Promise<PricingResponse | null> {
  const res = await fetch(`${BASE}/pricing/`);
  if (!res.ok) return null;
  return res.json();
}

export async function requestSubscription(planId: string): Promise<{
  payment_id: string;
  plan: string;
  amount_usd: string;
  status: string;
  message: string;
  contact_url?: string;
} | null> {
  const res = await fetchAuth(`${BASE}/pricing/subscribe/`, {
    method: 'POST',
    body: JSON.stringify({ plan_id: planId }),
  });
  if (!res.ok) return null;
  return res.json();
}

// ============================================================================
// Referral
// ============================================================================

export interface ReferralStats {
  referral_code: string;
  referral_link: string;
  total_referrals: number;
  total_earnings: string;
  pending_rewards: string;
  paid_rewards: string;
  reward_pct: number;
  rewards: {
    id: string;
    referred_email: string;
    amount_usd: string;
    description: string;
    is_paid: boolean;
    paid_at: string | null;
    created_at: string;
  }[];
  referred_users: {
    email: string;
    tier: string;
    joined: string;
  }[];
}

export async function getReferralStats(): Promise<ReferralStats | null> {
  const res = await fetchAuth(`${BASE}/referral/`);
  if (!res.ok) return null;
  return res.json();
}

export async function applyReferralCode(code: string): Promise<{ message: string } | null> {
  const res = await fetchAuth(`${BASE}/referral/apply/`, {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
  if (!res.ok) return null;
  return res.json();
}

// ============================================================================
// Page Visit Tracking & Lead Capture
// ============================================================================

export async function trackPageVisit(data: {
  path: string;
  session_id: string;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  duration_sec?: number;
  locale?: string;
}): Promise<void> {
  try {
    await fetch(`${BASE}/track/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch {
    // Silent fail — tracking should never break the UX
  }
}

export async function captureLead(data: {
  email?: string;
  telegram_username?: string;
  name?: string;
  source: string;
  message?: string;
  page_url?: string;
  utm_source?: string;
  utm_campaign?: string;
  referrer?: string;
  /** Honeypot — must stay empty; bots that fill it are silently dropped. */
  website?: string;
}): Promise<{ ok: boolean; id?: number } | null> {
  try {
    const res = await fetch(`${BASE}/leads/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
