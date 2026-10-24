'use client';

import { Database, Workflow, Code, Zap, GitBranch, Cloud } from 'lucide-react';

export function IntegrationsGrid() {
  const integrations = [
    {
      category: 'Data Warehouses',
      description: 'Built-in connections to the most popular data warehouses and databases',
      icon: Database,
      items: ['PostgreSQL', 'MongoDB', 'Redis', 'ClickHouse', 'TimescaleDB']
    },
    {
      category: 'Market Data APIs',
      description: 'Real-time and historical data from leading financial data providers',
      icon: Cloud,
      items: ['CoinGecko', 'CoinMarketCap', 'Alpha Vantage', 'Yahoo Finance', 'Binance API']
    },
    {
      category: 'Orchestration',
      description: 'Include FinAI projects in DAGs with Airflow, Dagster, or Prefect',
      icon: Workflow,
      items: ['Celery', 'Redis Queue', 'Apache Airflow', 'Dagster', 'Prefect']
    },
    {
      category: 'Version Control',
      description: 'Export your projects to GitHub or GitLab to create an audit trail',
      icon: GitBranch,
      items: ['GitHub', 'GitLab', 'Git Integration', 'CI/CD Pipelines']
    },
    {
      category: 'API & Webhooks',
      description: 'Connect to anything with our powerful public API and webhooks',
      icon: Code,
      items: ['REST API', 'GraphQL', 'WebSockets', 'Webhooks', 'Custom Integrations']
    },
    {
      category: 'AI Models',
      description: 'Leverage cutting-edge AI models for analysis and predictions',
      icon: Zap,
      items: ['GPT-4o', 'Claude 3.5', 'Custom Models', 'Fine-tuned LLMs', 'Embeddings']
    }
  ];

  return (
    <section className="relative px-4 py-24">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-16 text-center">
          <h2 className="text-4xl font-bold text-white lg:text-5xl">
            Connect to{' '}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Everything
            </span>
          </h2>
          <p className="mt-4 text-xl text-slate-400 max-w-3xl mx-auto">
            FinAI integrates seamlessly with your existing data infrastructure and tools
          </p>
        </div>

        {/* Integrations Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {integrations.map((integration, idx) => {
            const Icon = integration.icon;
            return (
              <div
                key={idx}
                className="group rounded-2xl border border-slate-700 bg-slate-900/50 p-6 backdrop-blur-sm transition-all hover:border-slate-600 hover:bg-slate-800/50"
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-xl bg-blue-500/10 p-3">
                    <Icon className="h-6 w-6 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white">{integration.category}</h3>
                </div>

                <p className="mb-4 text-sm text-slate-400">
                  {integration.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {integration.items.map((item, iidx) => (
                    <span
                      key={iidx}
                      className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:bg-slate-700"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* OAuth Section */}
        <div className="mt-12 rounded-2xl border border-slate-700 bg-slate-900/50 p-8 backdrop-blur-sm">
          <div className="grid gap-8 lg:grid-cols-2 items-center">
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Secure Authentication with oAuth
              </h3>
              <p className="text-slate-400 mb-6">
                Leverage the permissions set up in your data warehouse by authenticating with oAuth. 
                Your credentials stay secure while FinAI accesses only the data you authorize.
              </p>
              <div className="flex gap-4">
                <div className="rounded-lg bg-green-500/10 border border-green-500/20 px-4 py-2 text-sm text-green-400">
                  ✓ Enterprise-grade security
                </div>
                <div className="rounded-lg bg-green-500/10 border border-green-500/20 px-4 py-2 text-sm text-green-400">
                  SOC 2 Type II — on roadmap
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-slate-950 p-6">
              <div className="space-y-3">
                {['PostgreSQL', 'MongoDB', 'Redis'].map((db, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-lg bg-slate-900 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <Database className="h-5 w-5 text-blue-400" />
                      <span className="font-semibold text-white">{db}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span className="text-xs text-green-400">Connected</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
