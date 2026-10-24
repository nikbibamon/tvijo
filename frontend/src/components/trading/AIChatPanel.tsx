'use client';

/**
 * AI Trading Consultant Chat Panel — Multi-Agent System
 * Generation: GEN-TRADING-006
 *
 * Features:
 * - 7 specialized AI agents (Analyst, Trader, Risk, DeFi, News, Educator, CEO)
 * - Visual agent selector with cards
 * - Auto intent routing or manual agent selection
 * - Per-agent suggestion presets
 * - Claude / GPT-4o toggle
 * - Streaming support
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { sendAIChat, getAIAgents } from '@/services/trading-api';
import type { AIAgent } from '@/services/trading-api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  agent?: string;
}

export default function AIChatPanel() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState<'claude' | 'openai'>('claude');
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [activeAgent, setActiveAgent] = useState<string | null>(null); // null = auto-route
  const [showAgents, setShowAgents] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load agents on mount
  useEffect(() => {
    getAIAgents().then(setAgents);
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);
  useEffect(() => { if (open && inputRef.current) inputRef.current.focus(); }, [open]);

  const getAgent = (id: string) => agents.find(a => a.id === id);
  const currentAgent = activeAgent ? getAgent(activeAgent) : null;

  const sendMessage = async (text?: string) => {
    const content = text || input.trim();
    if (!content || loading) return;

    const newMsg: Message = { role: 'user', content };
    const updated = [...messages, newMsg];
    setMessages(updated);
    setInput('');
    setLoading(true);
    setShowAgents(false);

    try {
      const result = await sendAIChat(
        updated.map(m => ({ role: m.role, content: m.content })),
        provider,
        activeAgent || undefined,
        conversationId || undefined,
      );

      if ('error' in result) {
        setMessages([...updated, { role: 'assistant', content: `Error: ${result.error}` }]);
      } else {
        setMessages([...updated, {
          role: 'assistant',
          content: result.reply,
          agent: result.agent,
        }]);
        // Persist conversation_id for multi-turn chats
        if ('conversation_id' in result && result.conversation_id) {
          setConversationId(result.conversation_id);
        }
      }
    } catch {
      setMessages([...updated, {
        role: 'assistant',
        content: 'Sorry, AI service is temporarily unavailable. Please try again.',
      }]);
    }

    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const selectAgent = (agentId: string | null) => {
    setActiveAgent(agentId);
    setShowAgents(false);
    if (messages.length === 0 && inputRef.current) {
      inputRef.current.focus();
    }
  };

  const suggestions = currentAgent?.suggestions || [
    'Give me a market overview for today',
    'Analyze BTC/USDT chart',
    'What are the biggest risks right now?',
    'Best yield farming opportunities?',
  ];

  // Floating button when closed
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full shadow-2xl shadow-purple-500/30 flex items-center justify-center hover:scale-110 transition-transform group"
        title="AI Trading Consultant"
      >
        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
        </svg>
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900 animate-pulse" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[420px] max-w-[calc(100vw-2rem)] h-[640px] max-h-[calc(100vh-4rem)] flex flex-col bg-[#0D0D14] border border-slate-700/80 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAgents(!showAgents)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-lg hover:bg-slate-700/50 transition-colors"
            style={currentAgent ? { backgroundColor: currentAgent.color + '20' } : {}}
            title="Select AI Agent"
          >
            {currentAgent?.icon || '🧠'}
          </button>
          <div>
            <h3 className="text-sm font-semibold text-white">
              {currentAgent?.name || 'AI Consultant'}
              {!activeAgent && <span className="text-[9px] text-gray-500 ml-1">auto</span>}
            </h3>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setProvider('claude')}
                className={`text-[9px] px-1.5 py-0.5 rounded transition-all ${
                  provider === 'claude'
                    ? 'bg-purple-500/30 text-purple-300 border border-purple-500/30'
                    : 'text-gray-600 hover:text-gray-400'
                }`}
              >
                Claude
              </button>
              <button
                onClick={() => setProvider('openai')}
                className={`text-[9px] px-1.5 py-0.5 rounded transition-all ${
                  provider === 'openai'
                    ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/30'
                    : 'text-gray-600 hover:text-gray-400'
                }`}
              >
                GPT-4o
              </button>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          {messages.length > 0 && (
            <button
              onClick={() => { setMessages([]); setActiveAgent(null); setConversationId(null); }}
              className="p-1.5 text-gray-500 hover:text-gray-300 transition-colors"
              title="New conversation"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
            </button>
          )}
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 text-gray-500 hover:text-gray-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
        </div>
      </div>

      {/* Agent Selector Dropdown */}
      {showAgents && (
        <div className="px-3 py-2 border-b border-slate-700/50 bg-slate-900/80 max-h-[260px] overflow-y-auto">
          <div className="text-[10px] text-gray-500 uppercase mb-1.5 font-medium">Select AI Agent</div>
          <button
            onClick={() => selectAgent(null)}
            className={`w-full text-left p-2 rounded-lg mb-1 transition-all text-xs ${
              !activeAgent
                ? 'bg-purple-500/15 border border-purple-500/30 text-purple-300'
                : 'hover:bg-slate-800 text-gray-400 border border-transparent'
            }`}
          >
            <span className="mr-1.5">🧠</span>
            <strong>Auto-Route</strong>
            <span className="text-gray-600 ml-1">— AI picks the best agent</span>
          </button>
          {agents.map(agent => (
            <button
              key={agent.id}
              onClick={() => selectAgent(agent.id)}
              className={`w-full text-left p-2 rounded-lg mb-1 transition-all text-xs ${
                activeAgent === agent.id
                  ? 'border text-white'
                  : 'hover:bg-slate-800 text-gray-400 border border-transparent'
              }`}
              style={activeAgent === agent.id ? {
                backgroundColor: agent.color + '15',
                borderColor: agent.color + '40',
              } : {}}
            >
              <span className="mr-1.5">{agent.icon}</span>
              <strong>{agent.name}</strong>
              <span className="text-gray-600 ml-1">— {agent.description}</span>
            </button>
          ))}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col h-full">
            {/* Agent Cards Grid */}
            <div className="text-center mb-3 pt-2">
              <div className="text-2xl mb-1">{currentAgent?.icon || '🧠'}</div>
              <h4 className="text-white font-medium text-sm">
                {currentAgent ? currentAgent.name : 'CentaBot AI Team'}
              </h4>
              <p className="text-gray-500 text-[11px] mt-0.5 max-w-[280px] mx-auto">
                {currentAgent
                  ? currentAgent.description
                  : '7 specialized agents. Ask anything — the right expert answers.'}
              </p>
            </div>

            {/* Quick Agent Chips (when no agent selected) */}
            {!activeAgent && agents.length > 0 && (
              <div className="flex flex-wrap gap-1.5 justify-center mb-3">
                {agents.map(a => (
                  <button
                    key={a.id}
                    onClick={() => selectAgent(a.id)}
                    className="px-2 py-1 text-[10px] rounded-lg border border-slate-700/40 text-gray-500 hover:text-white hover:border-slate-600 transition-all"
                    style={{ ['--hover-bg' as string]: a.color + '20' }}
                  >
                    {a.icon} {a.name}
                  </button>
                ))}
              </div>
            )}

            {/* Suggestions */}
            <div className="space-y-1.5 mt-auto">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="w-full text-left text-xs px-3 py-2 bg-slate-800/40 border border-slate-700/40 rounded-lg text-gray-400 hover:text-white hover:border-slate-600 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => {
            const msgAgent = msg.agent ? getAgent(msg.agent) : null;
            return (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] ${msg.role === 'assistant' ? 'flex gap-2' : ''}`}>
                  {msg.role === 'assistant' && msgAgent && (
                    <div
                      className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 text-xs"
                      style={{ backgroundColor: msgAgent.color + '20' }}
                      title={msgAgent.name}
                    >
                      {msgAgent.icon}
                    </div>
                  )}
                  <div
                    className={`px-3 py-2 rounded-xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-blue-600/30 text-white border border-blue-500/20'
                        : 'bg-slate-800/60 text-gray-200 border border-slate-700/50'
                    }`}
                  >
                    {msg.role === 'assistant' && msgAgent && (
                      <div className="text-[9px] font-medium mb-1" style={{ color: msgAgent.color }}>
                        {msgAgent.name}
                      </div>
                    )}
                    {msg.role === 'assistant' ? (
                      <div
                        className="prose prose-sm prose-invert max-w-none [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:mb-2 [&_li]:mb-0.5 [&_code]:bg-slate-700 [&_code]:px-1 [&_code]:rounded [&_strong]:text-white"
                        dangerouslySetInnerHTML={{ __html: simpleMarkdown(msg.content) }}
                      />
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {loading && (
          <div className="flex justify-start">
            <div className="flex gap-2 items-start">
              {currentAgent && (
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 text-xs"
                  style={{ backgroundColor: currentAgent.color + '20' }}
                >
                  {currentAgent.icon}
                </div>
              )}
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-3">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-3 pb-3 pt-2 border-t border-slate-700/50">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={currentAgent ? `Ask ${currentAgent.name}...` : 'Ask anything about trading...'}
            rows={1}
            className="flex-1 bg-slate-800/60 border border-slate-700 text-white placeholder-gray-500 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:border-purple-500/50 transition-colors"
            style={{ maxHeight: '80px' }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="p-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-500 hover:to-blue-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
            </svg>
          </button>
        </div>
        <div className="text-[9px] text-gray-600 mt-1 text-center">
          {provider === 'claude' ? 'Claude (Anthropic)' : 'GPT-4o (OpenAI)'}
          {activeAgent ? ` · ${currentAgent?.name}` : ' · Auto-routing'}
        </div>
      </div>
    </div>
  );
}

/**
 * Lightweight markdown to HTML for AI responses.
 */
function simpleMarkdown(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    .replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br/>')
    .replace(/^/, '<p>')
    .replace(/$/, '</p>');
}
