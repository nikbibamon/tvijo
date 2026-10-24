'use client';

import { useState } from 'react';
import { TrendingUp, Zap, Target, Users } from 'lucide-react';

const VOLUME_RANGES = {
  '7d': {
    label: 'Last 7 days',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    heights: [60, 75, 85, 70, 90, 65, 80],
  },
  '30d': {
    label: 'Last 30 days',
    days: ['W1', 'W2', 'W3', 'W4'],
    heights: [68, 74, 81, 90],
  },
  '90d': {
    label: 'Last 90 days',
    days: ['M1', 'M2', 'M3'],
    heights: [55, 72, 88],
  },
} as const;

export function PerformanceMetrics() {
  const [range, setRange] = useState<keyof typeof VOLUME_RANGES>('7d');
  const metrics = [
    {
      icon: Target,
      label: 'Agent Conversations',
      value: '2,847',
      change: '+23%',
      trend: 'up',
      subtext: 'Last 7 days',
      color: 'blue'
    },
    {
      icon: Users,
      label: 'Unique Users',
      value: '1,243',
      change: '+18%',
      trend: 'up',
      subtext: 'Active analysts',
      color: 'purple'
    },
    {
      icon: Zap,
      label: 'Avg Response Time',
      value: '1.8s',
      change: '-12%',
      trend: 'down',
      subtext: 'Faster than competitors',
      color: 'green'
    }
  ];

  const topTopics = [
    { name: 'Bitcoin Analysis', value: 34, color: 'bg-blue-500' },
    { name: 'Portfolio Optimization', value: 28, color: 'bg-purple-500' },
    { name: 'Market Sentiment', value: 22, color: 'bg-pink-500' },
    { name: 'Risk Assessment', value: 16, color: 'bg-orange-500' }
  ];

  return (
    <section className="relative px-4 py-24">
      <div className="container mx-auto max-w-7xl">
        {/* Metrics Grid */}
        <div className="grid gap-6 md:grid-cols-3 mb-16">
          {metrics.map((metric, idx) => {
            const Icon = metric.icon;
            return (
              <div
                key={idx}
                className="group relative overflow-hidden rounded-2xl border border-slate-700 bg-slate-900/50 p-8 backdrop-blur-sm transition-all hover:border-slate-600 hover:bg-slate-800/50"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-0 transition-opacity group-hover:opacity-100" />
                
                <div className="relative space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`rounded-xl bg-${metric.color}-500/10 p-3`}>
                      <Icon className={`h-6 w-6 text-${metric.color}-400`} />
                    </div>
                    <div className={`flex items-center gap-1 text-sm font-semibold ${
                      metric.trend === 'up' ? 'text-green-400' : 'text-green-400'
                    }`}>
                      <TrendingUp className="h-4 w-4" />
                      {metric.change}
                    </div>
                  </div>

                  <div>
                    <div className="text-4xl font-bold text-white">{metric.value}</div>
                    <div className="mt-1 text-sm text-slate-400">{metric.label}</div>
                  </div>

                  <div className="text-xs text-slate-500">{metric.subtext}</div>
                </div>

                {/* Sparkline effect */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            );
          })}
        </div>

        {/* Conversation Volume Chart */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Volume Chart */}
          <div className="rounded-2xl border border-slate-700 bg-slate-900/50 p-8 backdrop-blur-sm">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Conversation Volume</h3>
              <select
                value={range}
                onChange={(e) => setRange(e.target.value as keyof typeof VOLUME_RANGES)}
                className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-300"
              >
                {Object.entries(VOLUME_RANGES).map(([key, r]) => (
                  <option key={key} value={key}>{r.label}</option>
                ))}
              </select>
            </div>

            {/* Bar Chart */}
            <div className="space-y-3">
              {VOLUME_RANGES[range].days.map((day, idx) => {
                const heights = VOLUME_RANGES[range].heights;
                return (
                  <div key={day} className="flex items-center gap-4">
                    <div className="w-12 text-sm text-slate-500">{day}</div>
                    <div className="flex-1">
                      <div className="relative h-8 overflow-hidden rounded-lg bg-slate-800">
                        <div
                          className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-500"
                          style={{ width: `${heights[idx]}%` }}
                        />
                        <div className="absolute inset-0 flex items-center justify-end pr-3">
                          <span className="text-xs font-semibold text-white">
                            {Math.round(heights[idx] * 5)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Topics */}
          <div className="rounded-2xl border border-slate-700 bg-slate-900/50 p-8 backdrop-blur-sm">
            <h3 className="mb-6 text-xl font-bold text-white">Top Conversation Topics</h3>
            
            <div className="space-y-6">
              {topTopics.map((topic, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">{topic.name}</span>
                    <span className="font-semibold text-white">{topic.value}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className={`h-full ${topic.color} transition-all duration-500`}
                      style={{ width: `${topic.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Insight */}
            <div className="mt-8 rounded-xl bg-blue-500/10 border border-blue-500/20 p-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="rounded-lg bg-blue-500/20 p-2">
                    <TrendingUp className="h-5 w-5 text-blue-400" />
                  </div>
                </div>
                <div className="text-sm">
                  <div className="font-semibold text-blue-300">Quick Insight</div>
                  <div className="mt-1 text-slate-400">
                    Bitcoin analysis queries increased 45% this week, correlating with recent price action above $75k.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
