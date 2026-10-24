'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, TrendingUp, Brain, Zap } from 'lucide-react';
import { parseLocale } from '@/i18n/config';

export function HeroSection() {
  const locale = parseLocale(usePathname());
  const [activeAgent, setActiveAgent] = useState(0);
  
  const agentConversations = [
    {
      prompt: "How did Bitcoin perform in Q1 2026?",
      response: "Bitcoin showed strong momentum in Q1 2026, gaining 34.5% to reach $78,400. Key drivers: institutional adoption (+$12B inflows), halving anticipation, and macro easing.",
      time: "Thought for 2.3 seconds"
    },
    {
      prompt: "Which altcoins have the highest correlation with BTC?",
      response: "Top 3 correlations: ETH (0.89), SOL (0.82), BNB (0.78). However, during the March correction, SOL showed divergence with only 0.61 correlation - suggesting independent momentum.",
      time: "Thought for 1.8 seconds"
    },
    {
      prompt: "Analyze sentiment for tech stocks this week",
      response: "Tech sector sentiment: 68/100 (bullish). NVDA leads with 89% positive mentions. AI infrastructure stocks up 12% avg. Caution: overbought RSI on 73% of holdings.",
      time: "Thought for 3.1 seconds"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveAgent((prev) => (prev + 1) % agentConversations.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden px-4 py-24 lg:py-32">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
      
      <div className="container relative mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left: Text Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-4 py-2 text-sm text-blue-400 border border-blue-500/20">
              <Sparkles className="h-4 w-4" />
              <span>AI market intelligence · public beta</span>
            </div>

            <h1 className="text-5xl font-bold leading-tight text-white lg:text-7xl">
              AI market intelligence for{' '}
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                financial intelligence
              </span>
            </h1>

            <p className="text-xl text-slate-300 leading-relaxed">
              FinAI brings together real-time market data, deep analysis, and powerful AI agents 
              that partner with you to make smarter investment decisions—faster.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href={`/${locale}/pricing`}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-lg font-semibold text-white transition-all hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/50"
              >
                <span className="relative z-10">Free 14 day trial</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>

              <Link
                href={`/${locale}/demo`}
                className="rounded-xl border border-slate-600 bg-slate-800/50 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm transition-all hover:border-slate-500 hover:bg-slate-700/50"
              >
                Get a demo
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-700">
              <div>
                <div className="text-3xl font-bold text-white">Real-time</div>
                <div className="text-sm text-slate-400">Market data</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">&lt;2s</div>
                <div className="text-sm text-slate-400">Avg Response</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">24/7</div>
                <div className="text-sm text-slate-400">Market Coverage</div>
              </div>
            </div>
          </div>

          {/* Right: AI Agent Demo */}
          <div className="relative">
            <div className="rounded-2xl border border-slate-700 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-xl">
              {/* Agent Header */}
              <div className="mb-6 flex items-center gap-3 border-b border-slate-700 pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-white">FinAI Agent</div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <span>Online • Powered by GPT-4o</span>
                  </div>
                </div>
              </div>

              {/* Conversation */}
              <div className="space-y-4">
                {/* User Message */}
                <div className="flex justify-end">
                  <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-blue-600 px-4 py-3 text-sm text-white">
                    {agentConversations[activeAgent].prompt}
                  </div>
                </div>

                {/* Agent Thinking */}
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Zap className="h-3 w-3 animate-pulse" />
                  <span>{agentConversations[activeAgent].time}</span>
                </div>

                {/* Agent Response */}
                <div className="flex">
                  <div className="max-w-[85%] space-y-2 rounded-2xl rounded-tl-sm bg-slate-800 px-4 py-3">
                    <p className="text-sm leading-relaxed text-slate-200">
                      {agentConversations[activeAgent].response}
                    </p>
                    <div className="flex gap-2 pt-2">
                      <button className="rounded-lg bg-slate-700 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:bg-slate-600">
                        📊 Show chart
                      </button>
                      <button className="rounded-lg bg-slate-700 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:bg-slate-600">
                        📈 Deep dive
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Input */}
              <div className="mt-6 flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3">
                <input
                  type="text"
                  placeholder="Ask about markets, trends, or portfolio..."
                  className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none"
                />
                <button className="rounded-lg bg-blue-600 p-2 transition-colors hover:bg-blue-700">
                  <TrendingUp className="h-4 w-4 text-white" />
                </button>
              </div>

              {/* Indicators */}
              <div className="mt-4 flex justify-center gap-2">
                {agentConversations.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveAgent(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      i === activeAgent ? 'w-8 bg-blue-500' : 'w-1.5 bg-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Floating badges */}
            <div className="absolute -right-4 -top-4 rounded-xl bg-green-500/10 border border-green-500/20 px-4 py-2 backdrop-blur-sm">
              <div className="text-xs text-green-400">✓ Real-time data</div>
            </div>
            <div className="absolute -bottom-4 -left-4 rounded-xl bg-purple-500/10 border border-purple-500/20 px-4 py-2 backdrop-blur-sm">
              <div className="text-xs text-purple-400">⚡ Sub-second latency</div>
            </div>
          </div>
        </div>

        {/* Trusted by logos */}
        <div className="mt-24 text-center">
          <p className="mb-8 text-sm uppercase tracking-wider text-slate-500">
            Aggregates market signals across dozens of sources
          </p>
          <div className="flex flex-wrap items-center justify-center gap-12 opacity-50">
            {['News & media', 'Social sentiment', 'On-chain data', 'Filings', 'Macro indicators'].map((source) => (
              <div key={source} className="text-2xl font-bold text-slate-600">
                {source}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
