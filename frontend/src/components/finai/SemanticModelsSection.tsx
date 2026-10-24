'use client';

import { Database, Code, FileText, Settings } from 'lucide-react';

export function SemanticModelsSection() {
  const models = [
    {
      name: 'crypto_markets.yml',
      type: 'Semantic Model',
      description: 'Real-time cryptocurrency market data with price, volume, and sentiment metrics',
      icon: Database,
      color: 'blue',
      metrics: ['price_usd', 'volume_24h', 'market_cap', 'sentiment_score']
    },
    {
      name: 'portfolio_analysis.yml',
      type: 'Semantic Model',
      description: 'Portfolio composition, risk metrics, and performance attribution',
      icon: FileText,
      color: 'purple',
      metrics: ['total_value', 'sharpe_ratio', 'max_drawdown', 'beta']
    },
    {
      name: 'market_indicators.yml',
      type: 'Semantic Model',
      description: 'Technical indicators and market signals across multiple timeframes',
      icon: Settings,
      color: 'pink',
      metrics: ['rsi', 'macd', 'bollinger_bands', 'volume_profile']
    }
  ];

  return (
    <section className="relative px-4 py-24">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-16 text-center">
          <h2 className="text-4xl font-bold text-white lg:text-5xl">
            Semantic Models /{' '}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Financial Data Warehouse
            </span>
          </h2>
          <p className="mt-4 text-xl text-slate-400 max-w-3xl mx-auto">
            Pre-built semantic models that standardize financial data and expose the metrics that matter most
          </p>
        </div>

        {/* Models Grid */}
        <div className="grid gap-6 lg:grid-cols-3 mb-12">
          {models.map((model, idx) => {
            const Icon = model.icon;
            return (
              <div
                key={idx}
                className="group rounded-2xl border border-slate-700 bg-slate-900/50 p-6 backdrop-blur-sm transition-all hover:border-slate-600 hover:bg-slate-800/50"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className={`rounded-xl bg-${model.color}-500/10 p-3`}>
                    <Icon className={`h-6 w-6 text-${model.color}-400`} />
                  </div>
                  <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-400">
                    {model.type}
                  </span>
                </div>

                <h3 className="mb-2 font-mono text-lg font-bold text-white">
                  {model.name}
                </h3>
                <p className="mb-4 text-sm text-slate-400">
                  {model.description}
                </p>

                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-500">DIMENSIONS:</div>
                  <div className="flex flex-wrap gap-2">
                    {model.metrics.map((metric, midx) => (
                      <span
                        key={midx}
                        className="rounded-md bg-slate-800 px-2 py-1 font-mono text-xs text-slate-300"
                      >
                        {metric}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Code Example */}
        <div className="rounded-2xl border border-slate-700 bg-slate-900/90 p-8 backdrop-blur-sm">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Code className="h-5 w-5 text-blue-400" />
              <h3 className="font-bold text-white">crypto_markets.yml</h3>
            </div>
            <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs text-green-400 border border-green-500/20">
              ✓ Active Model
            </span>
          </div>

          <div className="rounded-xl bg-slate-950 p-6 font-mono text-sm">
            <div className="space-y-1">
              <div className="text-slate-500"># Semantic model for cryptocurrency market data</div>
              <div className="text-slate-300">
                <span className="text-purple-400">model</span>: crypto_markets
              </div>
              <div className="text-slate-300 ml-4">
                <span className="text-purple-400">source</span>:
              </div>
              <div className="text-slate-400 ml-8">
                # Real-time data from multiple exchanges
              </div>
              <div className="text-slate-300 ml-8">
                <span className="text-blue-400">table</span>: market_data.crypto_prices
              </div>
              <div className="text-slate-300 ml-8">
                <span className="text-blue-400">primary_key</span>: asset_id
              </div>
              <div className="text-slate-300 ml-4 mt-2">
                <span className="text-purple-400">dimensions</span>:
              </div>
              <div className="text-slate-300 ml-8">
                - <span className="text-green-400">asset_name</span>
                <span className="text-slate-500 ml-4"># e.g., Bitcoin, Ethereum</span>
              </div>
              <div className="text-slate-300 ml-8">
                - <span className="text-green-400">exchange</span>
                <span className="text-slate-500 ml-4"># Binance, Coinbase, etc.</span>
              </div>
              <div className="text-slate-300 ml-8">
                - <span className="text-green-400">timestamp</span>
              </div>
              <div className="text-slate-300 ml-4 mt-2">
                <span className="text-purple-400">metrics</span>:
              </div>
              <div className="text-slate-300 ml-8">
                - <span className="text-yellow-400">price_usd</span>
              </div>
              <div className="text-slate-300 ml-8">
                - <span className="text-yellow-400">volume_24h</span>
              </div>
              <div className="text-slate-300 ml-8">
                - <span className="text-yellow-400">market_cap</span>
              </div>
              <div className="text-slate-300 ml-8">
                - <span className="text-yellow-400">sentiment_score</span>
                <span className="text-slate-500 ml-4"># AI-generated 0-100</span>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-blue-500/10 border border-blue-500/20 p-4">
            <div className="text-sm text-blue-300">
              <strong>💡 Pro Tip:</strong> Semantic models automatically sync with your data warehouse 
              and expose clean, queryable metrics to the AI agent—no SQL required.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
