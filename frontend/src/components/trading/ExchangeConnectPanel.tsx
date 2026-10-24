'use client';

/**
 * Exchange Connect Panel — CentaBot Multi-Exchange Connector
 * Generation: GEN-TRADING-005
 *
 * Professional UI for 80+ exchanges. Collects API keys (encrypted),
 * sends TG alert on submit = hot lead funnel.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getExchangeAccounts,
  createExchangeAccount,
  deleteExchangeAccount,
} from '@/services/trading-api';
import type { ExchangeAccountData } from '@/services/trading-api';

interface ExchangeInfo {
  id: string;
  name: string;
  needs_passphrase: boolean;
}

interface ExchangeListResponse {
  exchanges: ExchangeInfo[];
  categories: Record<string, string[]>;
  total: number;
}

const API_BASE = process.env.NEXT_PUBLIC_DJANGO_API_URL || '/api/v1';

const CATEGORY_ICONS: Record<string, string> = {
  'Major CEX': '🏦',
  'Additional CEX': '🔗',
  'DEX / Perpetual': '🌐',
  'Stocks & Brokers': '📊',
  'European Brokers': '🇪🇺',
  'DMA / ECN': '⚡',
  'Forex': '💱',
  'RU/CIS': '🇷🇺',
};

// ============================================================================
// Connected Account Card
// ============================================================================

function ConnectedCard({
  account,
  onDelete,
}: {
  account: ExchangeAccountData;
  onDelete: (id: string) => void;
}) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="flex items-center justify-between p-3 bg-slate-800/40 border border-slate-700/50 rounded-xl">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
          <span className="text-emerald-400 text-xs font-bold">✓</span>
        </div>
        <div>
          <div className="text-sm font-semibold text-white">{account.exchange_display}</div>
          <div className="text-[10px] text-gray-500">
            {account.label || account.api_key_masked}
            {account.has_spot && ' · Spot'}
            {account.has_futures && ' · Futures'}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
          CONNECTED
        </span>
        {confirming ? (
          <div className="flex items-center gap-1">
            <button
              onClick={() => { onDelete(account.id); setConfirming(false); }}
              className="text-[10px] text-red-400 hover:text-red-300 px-2 py-1 bg-red-500/10 rounded"
            >
              Confirm
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="text-[10px] text-gray-500 hover:text-gray-300 px-2 py-1"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            className="text-gray-600 hover:text-red-400 transition-colors text-xs"
            title="Remove"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Connect Form Modal
// ============================================================================

function ConnectForm({
  exchange,
  onClose,
  onSuccess,
}: {
  exchange: ExchangeInfo;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [label, setLabel] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [hasSpot, setHasSpot] = useState(true);
  const [hasFutures, setHasFutures] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!apiKey.trim() || !apiSecret.trim()) {
      setError('API Key and Secret are required');
      return;
    }
    if (exchange.needs_passphrase && !passphrase.trim()) {
      setError('Passphrase is required for ' + exchange.name);
      return;
    }
    setError('');
    setSubmitting(true);

    const result = await createExchangeAccount({
      exchange: exchange.id,
      label: label || `My ${exchange.name}`,
      api_key: apiKey,
      api_secret: apiSecret,
      passphrase: exchange.needs_passphrase ? passphrase : undefined,
      has_spot: hasSpot,
      has_futures: hasFutures,
    });

    setSubmitting(false);
    if (result) {
      onSuccess();
    } else {
      setError('Failed to connect. Please check your credentials.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-white">Connect {exchange.name}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-lg">✕</button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-[10px] text-gray-500 uppercase block mb-1">Label (optional)</label>
            <input
              type="text"
              value={label}
              onChange={e => setLabel(e.target.value)}
              placeholder={`My ${exchange.name} Account`}
              className="w-full bg-slate-800 border border-slate-600 text-white text-sm rounded-lg p-2.5 focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] text-gray-500 uppercase block mb-1">API Key *</label>
            <input
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="Enter your API key"
              className="w-full bg-slate-800 border border-slate-600 text-white text-sm rounded-lg p-2.5 focus:border-blue-500 outline-none font-mono"
            />
          </div>

          <div>
            <label className="text-[10px] text-gray-500 uppercase block mb-1">API Secret *</label>
            <input
              type="password"
              value={apiSecret}
              onChange={e => setApiSecret(e.target.value)}
              placeholder="Enter your API secret"
              className="w-full bg-slate-800 border border-slate-600 text-white text-sm rounded-lg p-2.5 focus:border-blue-500 outline-none font-mono"
            />
          </div>

          {exchange.needs_passphrase && (
            <div>
              <label className="text-[10px] text-gray-500 uppercase block mb-1">Passphrase *</label>
              <input
                type="password"
                value={passphrase}
                onChange={e => setPassphrase(e.target.value)}
                placeholder="Required for this exchange"
                className="w-full bg-slate-800 border border-slate-600 text-white text-sm rounded-lg p-2.5 focus:border-blue-500 outline-none font-mono"
              />
            </div>
          )}

          <div className="flex items-center gap-4 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={hasSpot} onChange={e => setHasSpot(e.target.checked)} className="rounded bg-slate-700 border-slate-600" />
              <span className="text-sm text-gray-300">Spot Trading</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={hasFutures} onChange={e => setHasFutures(e.target.checked)} className="rounded bg-slate-700 border-slate-600" />
              <span className="text-sm text-gray-300">Futures</span>
            </label>
          </div>

          {error && (
            <div className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg p-2">{error}</div>
          )}

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-xs text-amber-300/80">
            <strong>Security:</strong> Your keys are encrypted with AES-256 at rest. We recommend creating read-only + trade-only keys without withdrawal permissions.
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-400 hover:to-indigo-500 transition-all disabled:opacity-50"
          >
            {submitting ? 'Connecting...' : `Connect ${exchange.name}`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Main Panel
// ============================================================================

export default function ExchangeConnectPanel() {
  const [exchangeList, setExchangeList] = useState<ExchangeListResponse | null>(null);
  const [accounts, setAccounts] = useState<ExchangeAccountData[]>([]);
  const [connectingExchange, setConnectingExchange] = useState<ExchangeInfo | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = useCallback(async () => {
    const [exRes, accs] = await Promise.all([
      fetch(`${API_BASE}/trading/exchanges/`).then(r => r.ok ? r.json() : null),
      getExchangeAccounts(),
    ]);
    if (exRes) setExchangeList(exRes);
    setAccounts(accs);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    const ok = await deleteExchangeAccount(id);
    if (ok) setAccounts(prev => prev.filter(a => a.id !== id));
  }, []);

  const connectedIds = new Set(accounts.map(a => a.exchange));

  // Filter exchanges
  const filteredExchanges = exchangeList?.exchanges.filter(ex => {
    if (searchQuery) {
      return ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             ex.id.toLowerCase().includes(searchQuery.toLowerCase());
    }
    if (activeCategory && exchangeList?.categories[activeCategory]) {
      return exchangeList.categories[activeCategory].includes(ex.id);
    }
    return true;
  }) || [];

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-white">Exchange Connectors</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          {exchangeList?.total || 80}+ supported exchanges &bull; API keys encrypted with AES-256
        </p>
      </div>

      {/* Connected Accounts */}
      {accounts.length > 0 && (
        <div>
          <h3 className="text-xs font-medium text-gray-400 uppercase mb-2">
            Connected ({accounts.length})
          </h3>
          <div className="space-y-2">
            {accounts.map(acc => (
              <ConnectedCard key={acc.id} account={acc} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div>
        <input
          type="text"
          value={searchQuery}
          onChange={e => { setSearchQuery(e.target.value); setActiveCategory(null); }}
          placeholder="Search exchanges..."
          className="w-full bg-slate-900/60 border border-slate-700/50 text-white text-sm rounded-xl p-3 focus:border-blue-500/50 outline-none"
        />
      </div>

      {/* Category Tabs */}
      {exchangeList && !searchQuery && (
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
              !activeCategory ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-gray-500 hover:text-gray-300 border border-slate-700/30'
            }`}
          >
            All ({exchangeList.total})
          </button>
          {Object.entries(exchangeList.categories).map(([cat, ids]) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                activeCategory === cat ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-gray-500 hover:text-gray-300 border border-slate-700/30'
              }`}
            >
              {CATEGORY_ICONS[cat] || '📌'} {cat} ({ids.length})
            </button>
          ))}
        </div>
      )}

      {/* Exchange Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {filteredExchanges.map(ex => {
          const connected = connectedIds.has(ex.id);
          return (
            <button
              key={ex.id}
              onClick={() => !connected && setConnectingExchange(ex)}
              disabled={connected}
              className={`relative p-3 rounded-xl border text-left transition-all ${
                connected
                  ? 'bg-emerald-500/5 border-emerald-500/20 cursor-default'
                  : 'bg-slate-800/30 border-slate-700/30 hover:border-blue-500/40 hover:bg-slate-800/60'
              }`}
            >
              <div className="text-sm font-medium text-white truncate">{ex.name}</div>
              <div className="text-[10px] text-gray-600 mt-0.5">
                {connected ? (
                  <span className="text-emerald-400 font-medium">Connected ✓</span>
                ) : (
                  <span>Click to connect</span>
                )}
              </div>
              {ex.needs_passphrase && !connected && (
                <span className="absolute top-1.5 right-1.5 text-[8px] text-amber-500/60">🔑</span>
              )}
            </button>
          );
        })}
      </div>

      {filteredExchanges.length === 0 && searchQuery && (
        <div className="text-center py-6 text-gray-500 text-sm">
          No exchanges found for &ldquo;{searchQuery}&rdquo;
        </div>
      )}

      {/* Connect Modal */}
      {connectingExchange && (
        <ConnectForm
          exchange={connectingExchange}
          onClose={() => setConnectingExchange(null)}
          onSuccess={() => {
            setConnectingExchange(null);
            loadData();
          }}
        />
      )}
    </div>
  );
}
