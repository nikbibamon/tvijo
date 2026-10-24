/**
 * Goga Trading Bot API Client
 * Connects to goga bot via /bot/ nginx proxy (→ localhost:8080)
 * Generation: GEN-BOT-001
 */

const BOT_API = '/bot/api';

// Bot uses sha256(password) as bearer token
const BOT_PASSWORD = 'goga2024';

async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

let cachedToken: string | null = null;

async function getToken(): Promise<string> {
  if (cachedToken) return cachedToken;
  cachedToken = await sha256(BOT_PASSWORD);
  return cachedToken;
}

async function botFetch<T>(path: string): Promise<T | null> {
  try {
    const token = await getToken();
    const res = await fetch(`${BOT_API}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// ============================================================
// Types
// ============================================================

export interface ScannerResult {
  symbol: string;
  price: number;
  change_24h: number;
  rsi: number;
  bb_pos: number;
  ema_fast: number;
  ema_slow: number;
  trend: 'bullish' | 'bearish' | 'flat';
  patterns: { Pattern: number; Confidence: number; Detail: string }[];
  score: number;
  signal: 'BUY' | 'SELL' | 'HOLD' | 'WATCH' | 'CLOSE_LONG' | 'CLOSE_SHORT';
  funding_rate: number;
  volume_24h: number;
  atr_pct: number;
  volatility: 'low' | 'medium' | 'high';
  opt_leverage: number;
  opt_tp_pct: number;
  opt_sl_pct: number;
}

export interface ScannerResponse {
  results: ScannerResult[];
  scanned: number;
  timeframe: string;
  timestamp: number;
}

export interface StrategySignal {
  signal: string;
  confidence: number;
  price: number;
  reason: string;
}

export interface BotPair {
  symbol: string;
  market: string;
  pro: boolean;
  leverage: number;
  stop_loss_pct: number;
  take_profit_pct: number;
}

export interface ActiveBot {
  id: string;
  symbol: string;
  market: string;
  status: string;
  amount: number;
  current_profit: number;
  total_deals: number;
  win_deals: number;
  loss_deals: number;
  daily_pct: number;
  entry_price: number;
  last_price: number;
  leverage: number;
  is_demo: boolean;
  side: string;
  unrealized_pnl: number;
  preset_id: string;
}

export interface WalletInfo {
  spot: Record<string, string>;
  futures: Record<string, string>;
  total_usd: number;
}

// ============================================================
// API Functions
// ============================================================

export async function fetchScanner(): Promise<ScannerResponse | null> {
  if (process.env.NEXT_PUBLIC_ENABLE_BOT_SCANNER !== 'true') {
    return null;
  }
  return botFetch<ScannerResponse>('/scanner');
}

export async function fetchStrategy(symbol: string, market: string = 'spot'): Promise<StrategySignal | null> {
  return botFetch<StrategySignal>(`/strategy?symbol=${symbol}&market=${market}`);
}

export async function fetchPairs(): Promise<BotPair[]> {
  const data = await botFetch<BotPair[]>('/pairs');
  return data || [];
}

export async function fetchBots(): Promise<ActiveBot[]> {
  const data = await botFetch<ActiveBot[]>('/bots');
  return data || [];
}

export async function fetchWallet(): Promise<WalletInfo | null> {
  return botFetch<WalletInfo>('/wallet');
}

export async function fetchBalances(): Promise<{ spot: Record<string, string>; futures: Record<string, string>; total_usd: number } | null> {
  return botFetch('/balances');
}
