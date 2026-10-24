'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, PieChart, Activity } from 'lucide-react';

export function InteractiveDashboard() {
  const [selectedModel, setSelectedModel] = useState('crypto');

  const models = {
    crypto: {
      name: 'CryptoMarket: Global Trading Model',
      description: 'Standardized cryptocurrency definitions and pre-calculated metrics for real-time analysis',
      revenue: '$2.4M',
      growth: '+34.5%',
      trend: 'up'
    },
    stocks: {
      name: 'EquityMarket: Tech Sector Model',
      description: 'Comprehensive tech stock analysis with sector correlations and momentum indicators',
      revenue: '$1.8M',
      growth: '+12.3%',
      trend: 'up'
    },
    forex: {
      name: 'ForexMarket: Currency Pairs Model',
      description: 'Major currency pairs with macro indicators and central bank policy tracking',
      revenue: '$1.2M',
      growth: '-3.2%',
      trend: 'down'
    }
  };

  const currentModel = models[selectedModel as keyof typeof models];

  const cryptoData = [
    { asset: 'Bitcoin', price: '$78,400', change: '+2.4%', volume: '$45.2B', trend: 'up' },
    { asset: 'Ethereum', price: '$4,230', change: '+1.8%', volume: '$23.1B', trend: 'up' },
    { asset: 'Solana', price: '$142', change: '+5.2%', volume: '$8.4B', trend: 'up' },
    { asset: 'BNB', price: '$612', change: '-0.8%', volume: '$2.1B', trend: 'down' },
    { asset: 'Cardano', price: '$0.68', change: '+3.1%', volume: '$1.2B', trend: 'up' }
  ];

  const sectorBreakdown = [
    { name: 'DeFi', value: 35, color: 'bg-blue-500' },
    { name: 'Layer 1', value: 28, color: 'bg-purple-500' },
    { name: 'NFT/Gaming', value: 18, color: 'bg-pink-500' },
    { name: 'Infrastructure', value: 12, color: 'bg-orange-500' },
    { name: 'Other', value: 7, color: 'bg-green-500' }
  ];

  return (
    <section className="relative px-4 py-24">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold text-white lg:text-5xl">
            Agentic Data{' '}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Notebooks
            </span>
          </h2>
          <p className="mt-4 text-xl text-slate-400 max-w-3xl mx-auto">
            For in-depth analysis, powerful collaborative notebooks give you superpowers—with AI agents that help you go deeper, faster.
          </p>
        </div>

        {/* Dashboard Container */}
        <div className="rounded-3xl border border-slate-700 bg-slate-900/90 p-8 backdrop-blur-xl shadow-2xl">
          {/* Semantic Model Selector */}
          <div className="mb-8 flex items-center justify-between border-b border-slate-700 pb-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-500">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Semantic Models</h3>
                <p className="text-sm text-slate-400">Select your data model</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              {Object.keys(models).map((key) => (
                <button
                  key={key}
                  onClick={() => setSelectedModel(key)}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                    selectedModel === key
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Model Info */}
          <div className="mb-8 rounded-xl bg-slate-800/50 p-6">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-xl font-bold text-white">{currentModel.name}</h4>
              <div className={`flex items-center gap-2 text-sm font-semibold ${
                currentModel.trend === 'up' ? 'text-green-400' : 'text-red-400'
              }`}>
                {currentModel.trend === 'up' ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                {currentModel.growth}
              </div>
            </div>
            <p className="text-sm text-slate-400">{currentModel.description}</p>
            <div className="mt-4 flex items-center gap-6">
              <div>
                <div className="text-2xl font-bold text-white">{currentModel.revenue}</div>
                <div className="text-xs text-slate-500">Total Q1 Volume</div>
              </div>
              <div className="h-8 w-px bg-slate-700" />
              <div>
                <div className="text-2xl font-bold text-white">Live</div>
                <div className="text-xs text-slate-500">Real-time data</div>
              </div>
            </div>
          </div>

          {/* Dashboard Grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Market Data Table */}
            <div className="rounded-xl border border-slate-700 bg-slate-800/30 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h5 className="font-bold text-white">Top Assets by Volume</h5>
                <button className="text-xs text-blue-400 hover:text-blue-300">
                  View all →
                </button>
              </div>
              
              <div className="space-y-3">
                {cryptoData.map((asset, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-lg bg-slate-900/50 p-3 transition-colors hover:bg-slate-900"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-xs font-bold text-white">
                        {asset.asset.slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{asset.asset}</div>
                        <div className="text-xs text-slate-500">{asset.volume}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-white">{asset.price}</div>
                      <div className={`text-xs ${
                        asset.trend === 'up' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {asset.change}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sector Breakdown */}
            <div className="rounded-xl border border-slate-700 bg-slate-800/30 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h5 className="font-bold text-white">Market Composition</h5>
                <PieChart className="h-5 w-5 text-slate-500" />
              </div>

              <div className="space-y-4">
                {sectorBreakdown.map((sector, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">{sector.name}</span>
                      <span className="font-semibold text-white">{sector.value}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-900">
                      <div
                        className={`h-full ${sector.color} transition-all duration-500`}
                        style={{ width: `${sector.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* AI Insight */}
              <div className="mt-6 rounded-lg bg-blue-500/10 border border-blue-500/20 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-300">
                  <Activity className="h-4 w-4" />
                  AI Insight
                </div>
                <p className="text-xs text-slate-400">
                  DeFi sector dominance increased 8% this quarter. Layer 1 protocols showing strong correlation (0.89) with overall market sentiment.
                </p>
              </div>
            </div>
          </div>

          {/* Query Interface */}
          <div className="mt-6 rounded-xl border border-slate-700 bg-slate-800/50 p-4">
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Ask about trends, correlations, or portfolio optimization..."
                className="flex-1 rounded-lg bg-slate-900 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:scale-105">
                Analyze
              </button>
            </div>
            <div className="mt-3 flex gap-2">
              <button className="rounded-lg bg-slate-700 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:bg-slate-600">
                💡 Show correlation matrix
              </button>
              <button className="rounded-lg bg-slate-700 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:bg-slate-600">
                📊 Generate forecast
              </button>
              <button className="rounded-lg bg-slate-700 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:bg-slate-600">
                🎯 Risk analysis
              </button>
            </div>
          </div>
        </div>

        {/* Testimonial */}
        <div className="mt-12 text-center">
          <div className="mx-auto max-w-3xl rounded-2xl border border-slate-700 bg-slate-900/50 p-8 backdrop-blur-sm">
            <div className="mb-4 text-2xl text-slate-300">
              Explore the FinAI cockpit — routing, forecasting and risk analysis exactly as they run in a live deployment.
            </div>
            <div className="text-sm text-slate-500">
              Public pilot access · no credit card required
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
