'use client';

/**
 * AI Assistant Chat Page
 * Generation: GEN-AGENTS-AI-001
 *
 * AI-powered chat assistant for Agent Control Panel.
 * Provides context-aware answers about pipeline, security events, and trading data.
 */

import { useState, useRef, useEffect } from 'react';
import { useNewsAdminAuth } from '@/contexts/newsadmin-auth';
import Link from 'next/link';
import {
  toggleKillSwitch,
  triggerPipeline,
  triggerObserver,
  resolveEvents,
} from '@/services/agent-admin-api';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  actions?: ActionSuggestion[];  // Explicit action buttons for user confirmation
}

interface ActionSuggestion {
  id: string;
  label: string;
  description: string;
  action: 'deactivate_kill_switch' | 'activate_kill_switch' | 'resolve_events' | 'run_pipeline' | 'run_observer';
  params?: Record<string, any>;
  confirmText: string;
  danger?: boolean;
}

interface ChatContext {
  pipelineStats?: {
    totalRuns24h: number;
    successRate: number;
    totalSignals: number;
    totalDecisions: number;
  };
  securityStatus?: {
    killSwitchActive: boolean;
    circuitBreakerTripped: boolean;
    unresolvedEvents: number;
  };
  architectureAudit?: {
    safe_to_trade: boolean;
    critical_gaps: number;
    high_gaps: number;
    metrics: Record<string, any>;
    gaps: Array<{
      severity: string;
      component: string;
      issue: string;
      impact: string;
    }>;
  };
  cloudflareAnalytics?: {
    security_score: number;
    threats: {
      total_24h: number;
      critical_ips: string[];
      recommendation: string;
    };
    traffic: Record<string, any>;
    bots: Record<string, any>;
    blocked_ips: {
      count: number;
      list?: any[];
    };
    actions: {
      can_auto_protect: boolean;
      should_review_logs: boolean;
    };
  };
  searchAnalytics?: {
    source: string;
    period: string;
    summary: {
      total_keywords: number;
      total_clicks: number;
      total_impressions: number;
      avg_ctr: string;
      avg_position: string;
    };
    top_keywords: Array<{
      keyword: string;
      clicks: number;
      impressions: number;
      ctr: string;
      position: string;
    }>;
    ai_summary: string;
    seo_opportunities: Array<{
      type: string;
      keyword: string;
      suggestion: string;
    }>;
  };
  recentEvents?: Array<{
    severity: string;
    eventType: string;
    agent: string;
  }>;
}

// ============================================================================
// Contextual Preset Questions
// ============================================================================

interface PresetCategory {
  title: string;
  icon: string;
  questions: string[];
  priority: number;
}

function getContextualPresets(context: ChatContext): PresetCategory[] {
  const presets: PresetCategory[] = [];

  // Critical situations first (high priority)
  if (context.securityStatus?.killSwitchActive) {
    presets.push({
      title: '🚨 Kill Switch Active',
      icon: '🔴',
      priority: 100,
      questions: [
        'Why is the kill switch active?',
        'How to safely deactivate kill switch?',
        'Check what triggered the emergency stop',
      ],
    });
  }

  if (context.securityStatus?.unresolvedEvents && context.securityStatus.unresolvedEvents > 5) {
    presets.push({
      title: '⚠️ Security Events',
      icon: '⚠️',
      priority: 90,
      questions: [
        'Analyze all unresolved security events',
        'What are the critical issues?',
        'How to resolve these events?',
      ],
    });
  }

  if (context.pipelineStats?.successRate !== undefined && context.pipelineStats.successRate < 50) {
    presets.push({
      title: '🔧 Pipeline Issues',
      icon: '🔧',
      priority: 80,
      questions: [
        'Why is the pipeline failing?',
        'Check recent pipeline errors',
        'How to fix the success rate?',
      ],
    });
  }

  // Architecture & Risk Optimization (the real questions)
  presets.push({
    title: '🏗️ CRITICAL: Architecture Gaps',
    icon: '⚡',
    priority: 70,
    questions: [
      'Are all stop-losses actually set on Gate.io exchange, not just in our database?',
      'What happens to open positions if our Primary server dies right now?',
      'Do we have verified exchange-side stops for x20 leveraged positions?',
      'How many active positions lack verified on-exchange stop-loss orders?',
    ],
  });

  presets.push({
    title: '🛡️ Security & Risk',
    icon: '🔒',
    priority: 60,
    questions: [
      'Which API keys are stored outside HashiCorp Vault right now?',
      'When did we last rotate Gate.io API keys automatically?',
      'What happens if Cloudflare blocks legitimate trading traffic?',
      'Show me all failed authentication attempts in last 24h',
    ],
  });

  // Cloudflare Auto-Protection (GEN-CF-AI-001)
  presets.push({
    title: '🌐 Cloudflare Security',
    icon: '🌐',
    priority: 55,
    questions: [
      'Analyze threats from last 24h - should I block any IPs?',
      'What is our current threat level and is auto-protection working?',
      'Show top attacking IPs and recommend action',
      'Check if any legitimate IPs were blocked by mistake',
      'Optimize our logging - what can I disable to save disk?',
    ],
  });

  // Google Search Console SEO (GEN-SEARCH-AI-001)
  presets.push({
    title: '🔍 SEO Analytics',
    icon: '🔍',
    priority: 52,
    questions: [
      'What keywords bring traffic from Google?',
      'Which keywords have high impressions but low CTR?',
      'What are our top performing pages in search?',
      'Find SEO opportunities - quick wins',
      'How is our search position trending?',
    ],
  });

  presets.push({
    title: '📊 Quick Analysis',
    icon: '📊',
    priority: 50,
    questions: [
      'Summarize today\'s trading activity',
      'How healthy is the pipeline?',
      'Any anomalies in the last hour?',
    ],
  });

  presets.push({
    title: '🎓 Learning',
    icon: '🎓',
    priority: 40,
    questions: [
      'Explain how the pipeline works',
      'What do the security events mean?',
      'How to interpret the metrics?',
    ],
  });

  presets.push({
    title: '🔍 Deep Dive',
    icon: '🔍',
    priority: 30,
      questions: [
      'Compare today vs yesterday performance',
      'Analyze decision patterns',
      'Review signal quality trends',
    ],
  });

  return presets.sort((a, b) => b.priority - a.priority);
}

/** A run the backend deliberately refused, carrying the reason it gave. */
class ChatRefusedError extends Error {
  readonly code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = 'ChatRefusedError';
    this.code = code;
  }
}

export default function AIChatPage() {
  const { user } = useNewsAdminAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState<ChatContext>({});
  const [isLoadingContext, setIsLoadingContext] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load platform context on mount
  useEffect(() => {
    loadContext();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadContext = async () => {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_DJANGO_API_URL || '/api/v1';
      const token = localStorage.getItem('access_token');

      // Load overview, architecture audit, cloudflare analytics, AND search console
      const [overviewRes, auditRes, cfRes, searchRes] = await Promise.all([
        fetch(`${API_BASE}/agents/admin/overview/`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/trading/architecture-audit/`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }).catch(() => null), // Don't fail if audit endpoint not ready
        fetch(`${API_BASE}/cloudflare/dashboard/`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }).catch(() => null), // Don't fail if Cloudflare not configured
        fetch(`${API_BASE}/cloudflare/search-keywords/`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }).catch(() => null), // Don't fail if Search Console not configured
      ]);

      let architectureAudit = null;
      if (auditRes && auditRes.ok) {
        const auditData = await auditRes.json();
        architectureAudit = {
          safe_to_trade: auditData.summary?.safe_to_trade || false,
          critical_gaps: auditData.summary?.critical_gaps || 0,
          high_gaps: auditData.summary?.high_gaps || 0,
          metrics: auditData.metrics || {},
          gaps: auditData.gaps || [],
        };
      }

      let cloudflareAnalytics = null;
      if (cfRes && cfRes.ok) {
        const cfData = await cfRes.json();
        cloudflareAnalytics = {
          security_score: cfData.security_score || 0,
          threats: cfData.threats || {},
          traffic: cfData.traffic || {},
          bots: cfData.bots || {},
          blocked_ips: cfData.blocked_ips || {},
          actions: cfData.actions || {},
        };
      }

      let searchAnalytics = null;
      if (searchRes && searchRes.ok) {
        const searchData = await searchRes.json();
        searchAnalytics = {
          source: searchData.source || 'Google Search Console',
          period: searchData.period || '',
          summary: searchData.summary || {},
          top_keywords: searchData.top_keywords || [],
          ai_summary: searchData.ai_summary || '',
          seo_opportunities: searchData.seo_opportunities || [],
        };
      }

      if (overviewRes.ok) {
        const data = await overviewRes.json();
        setContext({
          pipelineStats: {
            totalRuns24h: data.pipeline?.total_runs_24h || 0,
            successRate: data.pipeline?.success_rate || 0,
            totalSignals: data.pipeline?.total_signals_24h || 0,
            totalDecisions: data.pipeline?.total_decisions_24h || 0,
          },
          securityStatus: {
            killSwitchActive: data.security?.kill_switch_active || false,
            circuitBreakerTripped: data.security?.circuit_breaker_tripped || false,
            unresolvedEvents: data.security?.unresolved_count || 0,
          },
          architectureAudit, // Critical for answering survival questions
          cloudflareAnalytics, // For automatic threat analysis
          searchAnalytics, // Google Search Console data for SEO
          recentEvents: data.recent_events?.slice(0, 5).map((e: { severity: string; event_type: string; agent: string }) => ({
            severity: e.severity,
            eventType: e.event_type,
            agent: e.agent,
          })) || [],
        });
      }
    } catch (error) {
      console.error('Failed to load context:', error);
    } finally {
      setIsLoadingContext(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const API_BASE = process.env.NEXT_PUBLIC_DJANGO_API_URL || '/api/v1';
      const token = localStorage.getItem('access_token');

      const res = await fetch(`${API_BASE}/agents/ai-chat/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: userMessage.content,
          context,
          history: messages.slice(-10), // Keep last 10 messages for context
          source: 'agentadmin', // Track usage per panel for separate billing
        }),
      });

      if (!res.ok) {
        // A refused budget is a decision, not a glitch: "please try again" is
        // wrong advice for it — retrying can never succeed until the cap moves.
        // The backend labels it (402 + code) precisely so we can say which.
        const body = await res.json().catch(() => ({}));
        const code = typeof body?.code === 'string' ? body.code : null;
        if (res.status === 402 || code === 'budget_exceeded') {
          throw new ChatRefusedError(
            typeof body?.error === 'string'
              ? body.error
              : 'Budget limit reached.',
            'budget_exceeded',
          );
        }
        throw new Error(`Chat failed: ${res.status}`);
      }

      const data = await res.json();

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const refused =
        error instanceof ChatRefusedError && error.code === 'budget_exceeded';
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: refused
          ? `${error.message} This run was refused before anything was spent. Raise or clear the cap in Billing → Set budget, then send it again.`
          : 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  // Execute explicit action with user confirmation
  const executeAction = async (action: ActionSuggestion) => {
    // Double confirmation for dangerous actions
    if (action.danger) {
      const confirmed = window.confirm(
        `⚠️ ${action.confirmText}\n\n${action.description}\n\nAre you sure you want to proceed?`
      );
      if (!confirmed) return;
    }

    // Add system message about action execution
    const systemMessage: ChatMessage = {
      role: 'assistant',
      content: `⏳ Executing: ${action.label}...`,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, systemMessage]);

    try {
      let result: any;

      switch (action.action) {
        case 'deactivate_kill_switch':
          result = await toggleKillSwitch('deactivate', 'Deactivated via AI chat');
          break;
        case 'activate_kill_switch':
          result = await toggleKillSwitch('activate', 'Activated via AI chat');
          break;
        case 'run_pipeline':
          result = await triggerPipeline();
          break;
        case 'run_observer':
          result = await triggerObserver();
          break;
        case 'resolve_events':
          result = await resolveEvents(action.params?.eventIds);
          break;
        default:
          throw new Error('Unknown action');
      }

      // Success message
      const successMessage: ChatMessage = {
        role: 'assistant',
        content: `✅ ${action.label} completed successfully!\n\nResult: ${JSON.stringify(result, null, 2).slice(0, 200)}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev.slice(0, -1), successMessage]); // Replace loading message
    } catch (error: any) {
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: `❌ ${action.label} failed: ${error.message || 'Unknown error'}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev.slice(0, -1), errorMessage]); // Replace loading message
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <svg className="w-7 h-7 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
            AI Assistant
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Ask questions about pipeline status, security events, and trading data
          </p>
        </div>
        <button
          onClick={clearChat}
          disabled={messages.length === 0}
          className="px-4 py-2 text-sm text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Clear Chat
        </button>
      </div>

      {/* Context Status */}
      {isLoadingContext ? (
        <div className="mb-4 p-3 bg-white/5 rounded-lg flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-400">Loading platform context...</span>
        </div>
      ) : (
        <div className="mb-4 p-3 bg-white/5 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs font-medium text-green-400 uppercase tracking-wide">Platform Context Active</span>
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-gray-400">
            {context.pipelineStats && (
              <span className="bg-white/5 px-2 py-1 rounded">
                Pipeline: {context.pipelineStats.totalRuns24h} runs ({context.pipelineStats.successRate.toFixed(1)}% success)
              </span>
            )}
            {context.securityStatus && (
              <span className={`px-2 py-1 rounded ${context.securityStatus.killSwitchActive ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                Kill Switch: {context.securityStatus.killSwitchActive ? 'ACTIVE' : 'Inactive'}
              </span>
            )}
            {context.securityStatus && context.securityStatus.unresolvedEvents > 0 && (
              <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">
                {context.securityStatus.unresolvedEvents} unresolved events
              </span>
            )}
            {context.architectureAudit && (
              <>
                {!context.architectureAudit.safe_to_trade ? (
                  <span className="bg-red-500/30 text-red-300 px-2 py-1 rounded animate-pulse font-medium">
                    🚨 {context.architectureAudit.critical_gaps} CRITICAL ARCH GAPS
                  </span>
                ) : context.architectureAudit.high_gaps > 0 ? (
                  <span className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded">
                    ⚠️ {context.architectureAudit.high_gaps} high-severity gaps
                  </span>
                ) : (
                  <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded">
                    ✅ Architecture audit passed
                  </span>
                )}
                {context.architectureAudit.metrics?.positions_without_exchange_stops > 0 && (
                  <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded">
                    🔥 {context.architectureAudit.metrics.positions_without_exchange_stops} positions without exchange stops
                  </span>
                )}
                {context.architectureAudit.metrics?.keys_in_database > 0 && (
                  <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded">
                    🔑 {context.architectureAudit.metrics.keys_in_database} keys in DB (not Vault)
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-[#0d1220] rounded-xl border border-white/5 p-4 mb-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-cyan-500/10 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.015-7.053.048-1.564.133-2.698 1.52-2.698 3.228v6.741z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">How can I help you?</h3>
            <p className="text-sm text-gray-400 max-w-md mb-4">
              Ask me about pipeline performance, security events, or choose from situation-aware suggestions below.
            </p>

            {/* Contextual Preset Categories */}
            {!isLoadingContext && (
              <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-3">
                {getContextualPresets(context).map((category) => (
                  <div
                    key={category.title}
                    className={`p-3 rounded-xl border transition-all ${
                      category.priority >= 80
                        ? 'bg-red-500/5 border-red-500/20'
                        : category.priority >= 60
                        ? 'bg-yellow-500/5 border-yellow-500/20'
                        : 'bg-white/5 border-white/10 hover:border-cyan-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span>{category.icon}</span>
                      <span className={`text-sm font-medium ${
                        category.priority >= 80 ? 'text-red-400' : 'text-cyan-400'
                      }`}>
                        {category.title}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {category.questions.map((q) => (
                        <button
                          key={q}
                          onClick={() => {
                            setInput(q);
                            // Auto-send on mobile, or just fill on desktop
                            if (window.innerWidth < 768) {
                              setTimeout(() => {
                                const event = new KeyboardEvent('keydown', { key: 'Enter' });
                                document.querySelector('textarea')?.dispatchEvent(event);
                              }, 100);
                            }
                          }}
                          className={`px-2 py-1 text-[11px] rounded-md transition-colors text-left ${
                            category.priority >= 80
                              ? 'bg-red-500/10 text-red-300 hover:bg-red-500/20'
                              : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Links to other systems */}
            <div className="flex flex-wrap justify-center gap-3 mt-6 pt-6 border-t border-white/10">
              <Link
                href="/en/agentadmin"
                className="text-xs text-gray-500 hover:text-cyan-400 transition-colors flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
                </svg>
                Dashboard
              </Link>
              <a
                href="https://intelligence.tvijo.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-500 hover:text-cyan-400 transition-colors flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Intelligence Platform
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-xl p-4 ${
                    message.role === 'user'
                      ? 'bg-cyan-600 text-white'
                      : 'bg-white/10 text-gray-200'
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap">{message.content}</div>

                  {/* Explicit Action Buttons */}
                  {message.actions && message.actions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <div className="text-[11px] text-gray-400 mb-2">Suggested Actions:</div>
                      <div className="flex flex-wrap gap-2">
                        {message.actions.map((action) => (
                          <button
                            key={action.id}
                            onClick={() => executeAction(action)}
                            className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                              action.danger
                                ? 'bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30'
                                : 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/30'
                            }`}
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className={`text-xs mt-2 ${message.role === 'user' ? 'text-cyan-200' : 'text-gray-500'}`}>
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/10 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about pipeline, security, or trading data..."
          disabled={isLoading || isLoadingContext}
          className="flex-1 bg-[#0d1220] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 resize-none h-12"
          rows={1}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || isLoading || isLoadingContext}
          className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
              Send
            </>
          )}
        </button>
      </div>
    </div>
  );
}
