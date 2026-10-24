'use client';

/**
 * SEO Editor Dashboard - Accessibility Enhanced (a11y)
 * Generation: GEN-EDITOR-SEO-001
 * 
 * AI-powered content generation with full accessibility support:
 * - ARIA labels and roles for screen readers
 * - Keyboard navigation
 * - High contrast mode
 * - Reduced motion support
 * - Focus management
 * - Color blind friendly
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { editorApi, EditorPreset, AIGenerationRequest, AIGenerationResult, ContentBlock } from '@/services/editor-api';
import { kbCategoriesApi } from '@/services/kb-api';
import type { KBCategory } from '@/types/knowledge';
import Navbar from '@/components/portal/Navbar';
import Footer from '@/components/portal/Footer';

// Block type icons
const BLOCK_ICONS: Record<string, string> = {
  matrix: '📊',
  chart: '📈',
  checklist: '✅',
  funnel: '🔄',
  scoring: '🎯',
  comparison: '⚖️',
  timeline: '📅',
  process: '🔄',
  quote: '💬',
  stat: '📉',
};

const BLOCK_LABELS: Record<string, string> = {
  matrix: 'Decision Matrix',
  chart: 'Data Chart',
  checklist: 'Checklist',
  funnel: 'Sales Funnel',
  scoring: 'Scoring System',
  comparison: 'Comparison',
  timeline: 'Timeline',
  process: 'Process',
  quote: 'Quote',
  stat: 'Statistic',
};

// High contrast color schemes for accessibility
const HIGH_CONTRAST_COLORS = {
  cyan: '#00ffff',
  green: '#00ff00',
  purple: '#ff00ff',
  yellow: '#ffff00',
  white: '#ffffff',
  black: '#000000',
};

export default function EditorDashboard() {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';

  // Accessibility states
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [announceMessage, setAnnounceMessage] = useState('');
  const [colorBlindMode, setColorBlindMode] = useState<'none' | 'protanopia' | 'deuteranopia' | 'tritanopia'>('none');

  // Refs for focus management
  const generateButtonRef = useRef<HTMLButtonElement>(null);
  const publishButtonRef = useRef<HTMLButtonElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const liveRegionRef = useRef<HTMLDivElement>(null);

  // Tabs
  const [activeTab, setActiveTab] = useState<'generate' | 'blocks' | 'history' | 'stats'>('generate');

  // Presets
  const [presets, setPresets] = useState<EditorPreset[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string>('');

  // Generation form
  const [titlePrompt, setTitlePrompt] = useState('');
  const [contentPrompt, setContentPrompt] = useState('');
  const [targetKeywords, setTargetKeywords] = useState('');
  const [generationType, setGenerationType] = useState<AIGenerationRequest['generation_type']>('full_article');
  const [targetSection, setTargetSection] = useState<'kb' | 'learn'>('kb');
  const [categorySlug, setCategorySlug] = useState('trading');
  const [categories, setCategories] = useState<KBCategory[]>([]);
  
  // Block selection
  const [selectedBlocks, setSelectedBlocks] = useState<string[]>(['checklist']);
  const [generateMindmap, setGenerateMindmap] = useState(true);
  const [generateBubbles, setGenerateBubbles] = useState(false);
  const [generateInfographic, setGenerateInfographic] = useState(false);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [currentJob, setCurrentJob] = useState<AIGenerationResult | null>(null);
  const [publishedUrl, setPublishedUrl] = useState<string>('');
  const [generationError, setGenerationError] = useState<string>('');

  // History & Stats
  const [history, setHistory] = useState<AIGenerationResult[]>([]);
  const [stats, setStats] = useState<{total_jobs: number; completed: number; failed: number; total_tokens: number; total_cost: number} | null>(null);

  // Preview
  const [previewMode, setPreviewMode] = useState(false);

  // Announce to screen readers
  const announce = useCallback((message: string) => {
    setAnnounceMessage(message);
    setTimeout(() => setAnnounceMessage(''), 1000);
  }, []);

  // Load accessibility preferences from localStorage
  useEffect(() => {
    const savedHighContrast = localStorage.getItem('editor_high_contrast') === 'true';
    const savedLargeText = localStorage.getItem('editor_large_text') === 'true';
    const savedReducedMotion = localStorage.getItem('editor_reduced_motion') === 'true' || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const savedColorBlind = localStorage.getItem('editor_color_blind') as any || 'none';
    
    setHighContrast(savedHighContrast);
    setLargeText(savedLargeText);
    setReducedMotion(savedReducedMotion);
    setColorBlindMode(savedColorBlind);

    if (savedHighContrast) {
      document.documentElement.classList.add('high-contrast');
    }
    if (savedLargeText) {
      document.documentElement.classList.add('large-text');
    }
    if (savedReducedMotion) {
      document.documentElement.classList.add('reduce-motion');
    }
    if (savedColorBlind !== 'none') {
      document.documentElement.classList.add(`color-blind-${savedColorBlind}`);
    }
  }, []);

  // Load presets on mount
  useEffect(() => {
    loadPresets();
    loadHistory();
    loadStats();
    loadCategories();
  }, []);

  const loadPresets = async () => {
    try {
      const data = await editorApi.getPresets();
      setPresets(data);
      if (data.length > 0) {
        setSelectedPreset(data[0].id);
        announce(`Loaded ${data.length} presets`);
      }
    } catch (e) {
      console.error('Failed to load presets:', e);
      announce('Error loading presets');
    }
  };

  const loadHistory = async () => {
    try {
      const stats = await editorApi.getStats();
      setHistory(stats.recent);
    } catch (e) {
      console.error('Failed to load history:', e);
    }
  };

  const loadStats = async () => {
    try {
      const data = await editorApi.getStats();
      setStats(data);
    } catch (e) {
      console.error('Failed to load stats:', e);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await kbCategoriesApi.list('name');
      setCategories(data.filter((c) => c.is_published));
      if (!categorySlug && data.length > 0) {
        setCategorySlug(data[0].slug);
      }
    } catch (e) {
      console.error('Failed to load categories:', e);
    }
  };

  const toggleHighContrast = () => {
    const newValue = !highContrast;
    setHighContrast(newValue);
    localStorage.setItem('editor_high_contrast', String(newValue));
    if (newValue) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    announce(newValue ? 'High contrast mode enabled' : 'High contrast mode disabled');
  };

  const toggleLargeText = () => {
    const newValue = !largeText;
    setLargeText(newValue);
    localStorage.setItem('editor_large_text', String(newValue));
    if (newValue) {
      document.documentElement.classList.add('large-text');
    } else {
      document.documentElement.classList.remove('large-text');
    }
    announce(newValue ? 'Large text enabled' : 'Large text disabled');
  };

  const toggleReducedMotion = () => {
    const newValue = !reducedMotion;
    setReducedMotion(newValue);
    localStorage.setItem('editor_reduced_motion', String(newValue));
    if (newValue) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
    announce(newValue ? 'Reduced motion enabled' : 'Reduced motion disabled');
  };

  const handleColorBlindChange = (mode: typeof colorBlindMode) => {
    document.documentElement.classList.remove(`color-blind-${colorBlindMode}`);
    setColorBlindMode(mode);
    localStorage.setItem('editor_color_blind', mode);
    if (mode !== 'none') {
      document.documentElement.classList.add(`color-blind-${mode}`);
    }
    announce(mode === 'none' ? 'Color blind mode disabled' : `Color blind mode: ${mode}`);
  };

  const handleGenerate = async () => {
    if (!titlePrompt.trim() || !contentPrompt.trim()) {
      setGenerationError('Please fill in title and content prompts');
      announce('Error: Please fill in title and content prompts');
      errorRef.current?.focus();
      return;
    }

    setIsGenerating(true);
    setGenerationError('');
    setCurrentJob(null);
    setPublishedUrl('');
    announce('Starting AI content generation. Please wait...');

    try {
      const request: AIGenerationRequest = {
        generation_type: generationType,
        title_prompt: titlePrompt,
        content_prompt: contentPrompt,
        preset_id: selectedPreset || null,
        target_keywords: targetKeywords.split(',').map(k => k.trim()).filter(Boolean),
        include_blocks: selectedBlocks as any,
        generate_mindmap: generateMindmap,
        generate_bubbles: generateBubbles,
        generate_infographic: generateInfographic,
        target_section: targetSection,
        category_slug: categorySlug,
      };

      const result = await editorApi.generateContent(request);
      setCurrentJob(result);
      announce(`Generation complete. Created article: ${result.title || 'Untitled'}`);
      successRef.current?.focus();
      
      await loadHistory();
      await loadStats();
    } catch (e: any) {
      setGenerationError(e.message || 'Generation failed');
      announce(`Error: ${e.message || 'Generation failed'}`);
      errorRef.current?.focus();
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublish = async () => {
    if (!currentJob?.job_id) return;

    announce('Publishing article...');
    setIsPublishing(true);
    try {
      const result = await editorApi.publish({
        job_id: currentJob.job_id,
        target_section: targetSection,
        category_slug: categorySlug,
        publish_options: {
          publish_now: true,
          featured: false,
          difficulty: 'beginner',
          access_level: 'public',
        },
      });

      if (result.published && result.url) {
        setPublishedUrl(result.url);
        announce(`Article published successfully. URL: ${result.url}`);
        alert(`Published successfully! View at: ${result.url}`);
      }
    } catch (e: any) {
      announce(`Publish failed: ${e.message}`);
      alert('Publish failed: ' + e.message);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCopyPublishedLink = async () => {
    if (!publishedUrl) return;
    const absolute = typeof window !== 'undefined' ? `${window.location.origin}${publishedUrl}` : publishedUrl;
    try {
      await navigator.clipboard.writeText(absolute);
      announce('Published URL copied to clipboard');
    } catch {
      announce('Failed to copy link');
    }
  };

  const toggleBlock = (blockType: string) => {
    setSelectedBlocks(prev => {
      const newBlocks = prev.includes(blockType)
        ? prev.filter(b => b !== blockType)
        : [...prev, blockType];
      announce(`${blockType} ${newBlocks.includes(blockType) ? 'selected' : 'deselected'}`);
      return newBlocks;
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  // Dynamic styles based on accessibility modes
  const getAccentColor = () => highContrast ? HIGH_CONTRAST_COLORS.cyan : '#06b6d4';
  const getSuccessColor = () => highContrast ? HIGH_CONTRAST_COLORS.green : '#22c55e';

  return (
    <div 
      className={`min-h-screen bg-[#080a0f] text-white ${largeText ? 'text-lg' : ''}`}
      role="main"
      aria-label="SEO Editor Dashboard"
    >
      <Navbar />

      {/* Screen reader live region */}
      <div 
        ref={liveRegionRef}
        role="status" 
        aria-live="polite" 
        aria-atomic="true"
        className="sr-only"
      >
        {announceMessage}
      </div>

      {/* Accessibility Toolbar */}
      <div 
        className={`fixed bottom-4 right-4 z-50 flex flex-col gap-2 p-3 rounded-xl border ${
          highContrast ? 'bg-black border-white' : 'bg-slate-900/90 border-white/20 backdrop-blur'
        }`}
        role="region"
        aria-label="Accessibility controls"
      >
        <div className="text-xs font-semibold text-slate-400 mb-1">Accessibility</div>
        
        <button
          onClick={toggleHighContrast}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors ${
            highContrast 
              ? 'bg-white text-black font-bold' 
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
          aria-pressed={highContrast}
          aria-label="Toggle high contrast mode"
          title="High Contrast (H)"
        >
          <span aria-hidden="true">👁️</span>
          <span>Contrast</span>
        </button>

        <button
          onClick={toggleLargeText}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors ${
            largeText 
              ? 'bg-white text-black font-bold' 
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
          aria-pressed={largeText}
          aria-label="Toggle large text"
          title="Large Text (L)"
        >
          <span aria-hidden="true">🔤</span>
          <span>Large Text</span>
        </button>

        <button
          onClick={toggleReducedMotion}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors ${
            reducedMotion 
              ? 'bg-white text-black font-bold' 
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
          aria-pressed={reducedMotion}
          aria-label="Toggle reduced motion"
          title="Reduced Motion (M)"
        >
          <span aria-hidden="true">🎬</span>
          <span>Reduce Motion</span>
        </button>

        <select
          value={colorBlindMode}
          onChange={(e) => handleColorBlindChange(e.target.value as any)}
          className="bg-slate-800 text-slate-300 text-xs rounded-lg px-2 py-1.5 border border-white/10"
          aria-label="Color blind mode"
          title="Color Blind Support"
        >
          <option value="none">🎨 Normal Vision</option>
          <option value="protanopia">🔴 Protanopia</option>
          <option value="deuteranopia">🟢 Deuteranopia</option>
          <option value="tritanopia">🔵 Tritanopia</option>
        </select>

        <div className="text-[10px] text-slate-500 mt-1">
          Hotkeys: H=Contrast, L=Text, M=Motion
        </div>
      </div>

      <main className="pt-20 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <header className="mb-8">
            <h1 className={`font-bold text-white mb-2 ${largeText ? 'text-4xl' : 'text-3xl'}`}>
              <span aria-hidden="true">🤖</span> SEO Editor Engine
            </h1>
            <p className={`text-slate-400 ${largeText ? 'text-lg' : ''}`}>
              AI-powered content generation for Knowledge Base and Learn sections.
              <span className="sr-only">Use Tab to navigate, Enter to activate buttons.</span>
            </p>
          </header>

          <section className="mb-6 border border-white/10 bg-slate-900/40 rounded-xl p-4">
            <div className="text-sm text-slate-300">
              Workflow: <span className="text-white">Topic + Prompt</span> → <span className="text-white">Generate</span> → <span className="text-white">Review Preview</span> → <span className="text-white">Publish</span>
            </div>
            <div className="mt-2 text-xs text-slate-400">
              Published article is saved with the current logged-in admin as author. Quick entry points:
              {' '}
              <Link href={`/${locale}/profile`} className="text-cyan-400 hover:underline">Profile</Link>
              {' · '}
              <a href="/admin/knowledge/kbarticle/" className="text-cyan-400 hover:underline">KB Admin</a>
            </div>
          </section>

          {/* Stats Bar */}
          {stats && (
            <section 
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
              aria-label="Generation statistics"
            >
              <div 
                className={`border rounded-xl p-4 ${highContrast ? 'bg-black border-white' : 'bg-slate-900/50 border-white/10'}`}
                role="region"
                aria-label="Total jobs"
              >
                <div className={`font-bold text-white ${largeText ? 'text-3xl' : 'text-2xl'}`}>{stats.total_jobs}</div>
                <div className={`text-slate-500 ${largeText ? 'text-sm' : 'text-xs'}`}>Total Jobs</div>
              </div>
              <div 
                className={`border rounded-xl p-4 ${highContrast ? 'bg-black border-white' : 'bg-slate-900/50 border-white/10'}`}
                role="region"
                aria-label="Completed jobs"
              >
                <div className={`font-bold ${largeText ? 'text-3xl' : 'text-2xl'}`} style={{ color: getSuccessColor() }}>{stats.completed}</div>
                <div className={`text-slate-500 ${largeText ? 'text-sm' : 'text-xs'}`}>Completed</div>
              </div>
              <div 
                className={`border rounded-xl p-4 ${highContrast ? 'bg-black border-white' : 'bg-slate-900/50 border-white/10'}`}
                role="region"
                aria-label="Tokens used"
              >
                <div className={`font-bold text-blue-400 ${largeText ? 'text-3xl' : 'text-2xl'}`}>{(stats.total_tokens / 1000).toFixed(1)}K</div>
                <div className={`text-slate-500 ${largeText ? 'text-sm' : 'text-xs'}`}>Tokens Used</div>
              </div>
              <div 
                className={`border rounded-xl p-4 ${highContrast ? 'bg-black border-white' : 'bg-slate-900/50 border-white/10'}`}
                role="region"
                aria-label="Estimated cost"
              >
                <div className={`font-bold text-purple-400 ${largeText ? 'text-3xl' : 'text-2xl'}`}>${stats.total_cost.toFixed(2)}</div>
                <div className={`text-slate-500 ${largeText ? 'text-sm' : 'text-xs'}`}>Est. Cost</div>
              </div>
            </section>
          )}

          {/* Tabs */}
          <nav 
            className="flex gap-2 mb-6 border-b border-white/10"
            role="tablist"
            aria-label="Editor sections"
          >
            {(['generate', 'blocks', 'history', 'stats'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  announce(`Switched to ${tab} tab`);
                }}
                onKeyDown={(e) => handleKeyDown(e, () => {
                  setActiveTab(tab);
                  announce(`Switched to ${tab} tab`);
                })}
                role="tab"
                aria-selected={activeTab === tab}
                aria-controls={`tabpanel-${tab}`}
                tabIndex={activeTab === tab ? 0 : -1}
                className={`px-4 py-3 text-sm font-medium capitalize transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                  activeTab === tab
                    ? `border-b-2 ${highContrast ? 'text-white border-white' : 'text-cyan-400 border-cyan-400'}`
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab === 'generate' && <><span aria-hidden="true">✨</span> Generate</>}
                {tab === 'blocks' && <><span aria-hidden="true">🧱</span> Blocks</>}
                {tab === 'history' && <><span aria-hidden="true">📜</span> History</>}
                {tab === 'stats' && <><span aria-hidden="true">📊</span> Stats</>}
              </button>
            ))}
          </nav>

          {/* Generate Tab */}
          {activeTab === 'generate' && (
            <div 
              id="tabpanel-generate"
              role="tabpanel"
              className="grid lg:grid-cols-2 gap-6"
            >
              {/* Left: Input Form */}
              <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleGenerate(); }}>
                {/* Generation Type */}
                <fieldset 
                  className={`border rounded-xl p-5 ${highContrast ? 'bg-black border-white' : 'bg-slate-900/50 border-white/10'}`}
                >
                  <legend className={`font-medium text-slate-300 px-2 ${largeText ? 'text-base' : 'text-sm'}`}>
                    Generation Type
                  </legend>
                  <select
                    value={generationType}
                    onChange={(e) => {
                      setGenerationType(e.target.value as any);
                      announce(`Generation type changed to ${e.target.value}`);
                    }}
                    className={`w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 ${largeText ? 'text-base' : 'text-sm'}`}
                    aria-label="Select generation type"
                  >
                    <option value="full_article">📝 Full Article + Visuals</option>
                    <option value="article_only">📄 Article Only</option>
                    <option value="mindmap_only">🗺️ Mind Map Only</option>
                    <option value="bubble_only">🫧 Bubble Map Only</option>
                    <option value="infographic_only">📊 Infographic Only</option>
                  </select>
                </fieldset>

                {/* Preset */}
                <fieldset 
                  className={`border rounded-xl p-5 ${highContrast ? 'bg-black border-white' : 'bg-slate-900/50 border-white/10'}`}
                >
                  <legend className={`font-medium text-slate-300 px-2 ${largeText ? 'text-base' : 'text-sm'}`}>
                    Preset Configuration
                  </legend>
                  <select
                    value={selectedPreset}
                    onChange={(e) => {
                      setSelectedPreset(e.target.value);
                      const preset = presets.find(p => p.id === e.target.value);
                      announce(preset ? `Selected preset: ${preset.name}` : 'Custom configuration selected');
                    }}
                    className={`w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 ${largeText ? 'text-base' : 'text-sm'}`}
                    aria-label="Select preset configuration"
                  >
                    <option value="">— Custom —</option>
                    {presets.map((preset) => (
                      <option key={preset.id} value={preset.id}>
                        {preset.name} ({preset.tone}, {preset.ai_model})
                      </option>
                    ))}
                  </select>
                  {selectedPreset && (
                    <div className={`mt-3 text-slate-500 ${largeText ? 'text-sm' : 'text-xs'}`}>
                      {(() => {
                        const p = presets.find(pr => pr.id === selectedPreset);
                        return p ? (
                          <div className="space-y-1">
                            <div>Words: {p.min_word_count}-{p.max_word_count}</div>
                            <div>Auto: Mindmap={p.auto_generate_mindmap ? 'Yes' : 'No'}, Bubbles={p.auto_generate_bubbles ? 'Yes' : 'No'}</div>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  )}
                </fieldset>

                {/* Title Prompt */}
                <fieldset 
                  className={`border rounded-xl p-5 ${highContrast ? 'bg-black border-white' : 'bg-slate-900/50 border-white/10'}`}
                >
                  <legend className={`font-medium text-slate-300 px-2 ${largeText ? 'text-base' : 'text-sm'}`}>
                    Title / Topic <span className="text-red-400" aria-label="required">*</span>
                  </legend>
                  <input
                    type="text"
                    value={titlePrompt}
                    onChange={(e) => setTitlePrompt(e.target.value)}
                    placeholder="e.g., Risk Management Strategies for Beginner Traders"
                    required
                    className={`w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder:text-slate-600 ${largeText ? 'text-base' : 'text-sm'}`}
                    aria-label="Article title or topic"
                    aria-required="true"
                  />
                </fieldset>

                {/* Content Prompt */}
                <fieldset 
                  className={`border rounded-xl p-5 ${highContrast ? 'bg-black border-white' : 'bg-slate-900/50 border-white/10'}`}
                >
                  <legend className={`font-medium text-slate-300 px-2 ${largeText ? 'text-base' : 'text-sm'}`}>
                    Content Prompt / Outline <span className="text-red-400" aria-label="required">*</span>
                  </legend>
                  <textarea
                    value={contentPrompt}
                    onChange={(e) => setContentPrompt(e.target.value)}
                    placeholder="Describe what the article should cover..."
                    rows={6}
                    required
                    className={`w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder:text-slate-600 resize-none ${largeText ? 'text-base' : 'text-sm'}`}
                    aria-label="Content outline and requirements"
                    aria-required="true"
                  />
                </fieldset>

                {/* Keywords */}
                <fieldset 
                  className={`border rounded-xl p-5 ${highContrast ? 'bg-black border-white' : 'bg-slate-900/50 border-white/10'}`}
                >
                  <legend className={`font-medium text-slate-300 px-2 ${largeText ? 'text-base' : 'text-sm'}`}>
                    Target Keywords (comma-separated)
                  </legend>
                  <input
                    type="text"
                    value={targetKeywords}
                    onChange={(e) => setTargetKeywords(e.target.value)}
                    placeholder="risk management, crypto trading, position sizing"
                    className={`w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder:text-slate-600 ${largeText ? 'text-base' : 'text-sm'}`}
                    aria-label="Target SEO keywords separated by commas"
                  />
                </fieldset>

                {/* Target Section */}
                <fieldset 
                  className={`border rounded-xl p-5 ${highContrast ? 'bg-black border-white' : 'bg-slate-900/50 border-white/10'}`}
                >
                  <legend className={`font-medium text-slate-300 px-2 ${largeText ? 'text-base' : 'text-sm'}`}>
                    Target Section
                  </legend>
                  <div className="flex gap-3" role="radiogroup" aria-label="Choose target section">
                    <button
                      type="button"
                      onClick={() => {
                        setTargetSection('kb');
                        announce('Knowledge Base section selected');
                      }}
                      onKeyDown={(e) => handleKeyDown(e, () => {
                        setTargetSection('kb');
                        announce('Knowledge Base section selected');
                      })}
                      role="radio"
                      aria-checked={targetSection === 'kb'}
                      tabIndex={targetSection === 'kb' ? 0 : -1}
                      className={`flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                        targetSection === 'kb'
                          ? highContrast ? 'bg-white text-black border-white' : 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                          : 'bg-slate-800 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span aria-hidden="true">📚</span> Knowledge Base
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTargetSection('learn');
                        announce('Learn section selected');
                      }}
                      onKeyDown={(e) => handleKeyDown(e, () => {
                        setTargetSection('learn');
                        announce('Learn section selected');
                      })}
                      role="radio"
                      aria-checked={targetSection === 'learn'}
                      tabIndex={targetSection === 'learn' ? 0 : -1}
                      className={`flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        targetSection === 'learn'
                          ? highContrast ? 'bg-white text-black border-white' : 'bg-purple-500/20 border-purple-500/50 text-purple-400'
                          : 'bg-slate-800 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span aria-hidden="true">🎓</span> Learn
                    </button>
                  </div>
                  {targetSection === 'kb' && (
                    <div className="mt-3 space-y-2">
                      <label className="text-xs text-slate-500" htmlFor="category-select">Category</label>
                      <select
                        id="category-select"
                        value={categorySlug}
                        onChange={(e) => setCategorySlug(e.target.value)}
                        className={`w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 ${largeText ? 'text-base' : 'text-sm'}`}
                      >
                        {categories.map((category) => (
                          <option key={category.id} value={category.slug}>
                            {category.name} ({category.slug})
                          </option>
                        ))}
                      </select>
                      <label className="sr-only" htmlFor="category-slug">Category slug</label>
                      <input
                        id="category-slug"
                        type="text"
                        value={categorySlug}
                        onChange={(e) => setCategorySlug(e.target.value)}
                        placeholder="Category slug override (optional)"
                        className={`w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder:text-slate-600 ${largeText ? 'text-base' : 'text-sm'}`}
                      />
                    </div>
                  )}
                </fieldset>

                {/* Visualizations */}
                <fieldset 
                  className={`border rounded-xl p-5 ${highContrast ? 'bg-black border-white' : 'bg-slate-900/50 border-white/10'}`}
                >
                  <legend className={`font-medium text-slate-300 px-2 ${largeText ? 'text-base' : 'text-sm'}`}>
                    Auto-Generate Visualizations
                  </legend>
                  <div className="space-y-2">
                    {[
                      { key: 'mindmap', label: 'Mind Map (knowledge graph)', checked: generateMindmap, set: setGenerateMindmap },
                      { key: 'bubbles', label: 'Bubble Map (concept relationships)', checked: generateBubbles, set: setGenerateBubbles },
                      { key: 'infographic', label: 'Infographic (visual summary)', checked: generateInfographic, set: setGenerateInfographic },
                    ].map(({ key, label, checked, set }) => (
                      <label key={key} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            set(e.target.checked);
                            announce(`${label} ${e.target.checked ? 'enabled' : 'disabled'}`);
                          }}
                          className={`w-4 h-4 rounded border-white/20 bg-slate-800 text-cyan-500 focus:ring-2 focus:ring-cyan-500 ${largeText ? 'w-5 h-5' : ''}`}
                          aria-label={label}
                        />
                        <span className={`text-slate-300 ${largeText ? 'text-base' : 'text-sm'}`}>{label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                {/* Content Blocks */}
                <fieldset 
                  className={`border rounded-xl p-5 ${highContrast ? 'bg-black border-white' : 'bg-slate-900/50 border-white/10'}`}
                >
                  <legend className={`font-medium text-slate-300 px-2 ${largeText ? 'text-base' : 'text-sm'}`}>
                    Include Content Blocks
                  </legend>
                  <div className="grid grid-cols-2 gap-2" role="group" aria-label="Content blocks">
                    {Object.entries(BLOCK_LABELS).slice(0, 6).map(([type, label]) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => toggleBlock(type)}
                        onKeyDown={(e) => handleKeyDown(e, () => toggleBlock(type))}
                        aria-pressed={selectedBlocks.includes(type)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                          selectedBlocks.includes(type)
                            ? highContrast ? 'bg-white text-black border-white' : 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                            : 'bg-slate-800 border-white/10 text-slate-400 hover:text-white'
                        } ${largeText ? 'text-sm' : ''}`}
                      >
                        <span aria-hidden="true">{BLOCK_ICONS[type]}</span>
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>
                </fieldset>

                {/* Error */}
                {generationError && (
                  <div 
                    ref={errorRef}
                    tabIndex={-1}
                    role="alert"
                    className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <p className={`text-red-400 ${largeText ? 'text-base' : 'text-sm'}`}>
                      <span aria-hidden="true">⚠️</span> {generationError}
                    </p>
                  </div>
                )}

                {/* Generate Button */}
                <button
                  ref={generateButtonRef}
                  type="submit"
                  disabled={isGenerating}
                  className={`w-full font-semibold py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#080a0f] focus:ring-cyan-500 ${
                    highContrast 
                      ? 'bg-white text-black hover:bg-gray-200' 
                      : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white'
                  }`}
                  aria-busy={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <span className="sr-only">Generating content, please wait</span>
                      <div 
                        className={`border-2 border-white/30 border-t-white rounded-full ${reducedMotion ? '' : 'animate-spin'} ${largeText ? 'w-6 h-6' : 'w-5 h-5'}`}
                        role="progressbar"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuetext="Generating..."
                      />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <span aria-hidden="true">✨</span>
                      <span>Generate with AI</span>
                    </>
                  )}
                </button>
              </form>

              {/* Right: Preview / Results */}
              <section 
                className="space-y-6"
                aria-label="Generation results"
                aria-live="polite"
              >
                {!currentJob && !isGenerating && (
                  <div 
                    className={`border rounded-xl p-8 text-center ${highContrast ? 'bg-black border-white' : 'bg-slate-900/50 border-white/10'}`}
                    role="region"
                    aria-label="Getting started"
                  >
                    <div className={`${largeText ? 'text-5xl' : 'text-4xl'} mb-4`} aria-hidden="true">🤖</div>
                    <h2 className={`font-semibold text-white mb-2 ${largeText ? 'text-xl' : 'text-lg'}`}>Ready to Generate</h2>
                    <p className={`text-slate-500 ${largeText ? 'text-base' : 'text-sm'}`}>
                      Fill in the form and click Generate to create SEO-optimized content with AI.
                    </p>
                  </div>
                )}

                {isGenerating && (
                  <div 
                    className={`border rounded-xl p-8 text-center ${highContrast ? 'bg-black border-white' : 'bg-slate-900/50 border-white/10'}`}
                    role="status"
                    aria-live="polite"
                  >
                    <div 
                      className={`border-4 border-cyan-500/30 border-t-cyan-500 rounded-full mx-auto mb-4 ${reducedMotion ? '' : 'animate-spin'} ${largeText ? 'w-16 h-16' : 'w-12 h-12'}`}
                      role="progressbar"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label="AI is generating content"
                    />
                    <h2 className={`font-semibold text-white mb-2 ${largeText ? 'text-xl' : 'text-lg'}`}>AI is Working...</h2>
                    <p className={`text-slate-500 ${largeText ? 'text-base' : 'text-sm'}`}>
                      Generating content, extracting entities, creating visualizations...
                    </p>
                  </div>
                )}

                {currentJob && currentJob.status === 'completed' && (
                  <div className="space-y-4">
                    {/* Success Header */}
                    <div 
                      ref={successRef}
                      tabIndex={-1}
                      className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-green-500"
                      role="status"
                      aria-label="Generation completed successfully"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span style={{ color: getSuccessColor() }} aria-hidden="true">✅</span>
                        <span className={`font-semibold ${largeText ? 'text-base' : ''}`} style={{ color: getSuccessColor() }}>Generation Complete!</span>
                      </div>
                      <div className={`text-slate-500 space-y-1 ${largeText ? 'text-sm' : 'text-xs'}`}>
                        <div>Tokens used: {currentJob.tokens_used?.toLocaleString()}</div>
                        <div>Est. cost: ${currentJob.cost_estimate?.toFixed(4)}</div>
                      </div>
                    </div>

                    {/* Title */}
                    <div className={`border rounded-xl p-5 ${highContrast ? 'bg-black border-white' : 'bg-slate-900/50 border-white/10'}`}>
                      <h3 className={`text-slate-500 uppercase tracking-wide ${largeText ? 'text-sm' : 'text-xs'}`}>Generated Title</h3>
                      <h2 className={`font-bold text-white mt-1 ${largeText ? 'text-2xl' : 'text-xl'}`}>{currentJob.title}</h2>
                    </div>

                    {/* Meta */}
                    <div className={`border rounded-xl p-5 ${highContrast ? 'bg-black border-white' : 'bg-slate-900/50 border-white/10'}`}>
                      <h3 className={`text-slate-500 uppercase tracking-wide ${largeText ? 'text-sm' : 'text-xs'}`}>SEO Metadata</h3>
                      <div className="mt-2 space-y-2">
                        <div className={`font-medium ${largeText ? 'text-base' : 'text-sm'}`} style={{ color: getAccentColor() }}>{currentJob.meta_title}</div>
                        <div className={`text-slate-400 ${largeText ? 'text-base' : 'text-sm'}`}>{currentJob.meta_description}</div>
                      </div>
                    </div>

                    {/* Keywords */}
                    {currentJob.keywords && (
                      <div className={`border rounded-xl p-5 ${highContrast ? 'bg-black border-white' : 'bg-slate-900/50 border-white/10'}`}>
                        <h3 className={`text-slate-500 uppercase tracking-wide ${largeText ? 'text-sm' : 'text-xs'}`}>Keywords</h3>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {currentJob.keywords.map((kw, i) => (
                            <span 
                              key={i} 
                              className={`px-2 py-1 bg-cyan-500/10 rounded ${largeText ? 'text-sm' : 'text-xs'}`}
                              style={{ color: getAccentColor() }}
                            >
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Excerpt */}
                    <div className={`border rounded-xl p-5 ${highContrast ? 'bg-black border-white' : 'bg-slate-900/50 border-white/10'}`}>
                      <h3 className={`text-slate-500 uppercase tracking-wide ${largeText ? 'text-sm' : 'text-xs'}`}>Excerpt</h3>
                      <p className={`text-slate-300 mt-2 ${largeText ? 'text-base' : 'text-sm'}`}>{currentJob.excerpt}</p>
                    </div>

                    {/* Content Preview */}
                    {currentJob.content && (
                      <div className={`border rounded-xl p-5 ${highContrast ? 'bg-black border-white' : 'bg-slate-900/50 border-white/10'}`}>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className={`text-slate-500 uppercase tracking-wide ${largeText ? 'text-sm' : 'text-xs'}`}>Content Preview</h3>
                          <button
                            onClick={() => {
                              setPreviewMode(!previewMode);
                              announce(previewMode ? 'Showing less content' : 'Showing more content');
                            }}
                            className={`${largeText ? 'text-sm' : 'text-xs'} hover:underline focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                            style={{ color: getAccentColor() }}
                            aria-expanded={previewMode}
                          >
                            {previewMode ? 'Show Less' : 'Show More'}
                          </button>
                        </div>
                        <div className={`text-slate-300 whitespace-pre-wrap ${previewMode ? '' : 'line-clamp-6'} ${largeText ? 'text-base' : 'text-sm'}`}>
                          {currentJob.content}
                        </div>
                      </div>
                    )}

                    {/* Visualizations */}
                    {(currentJob.mindmap_data || currentJob.bubble_data || currentJob.infographic_data) && (
                      <div className={`border rounded-xl p-5 ${highContrast ? 'bg-black border-white' : 'bg-slate-900/50 border-white/10'}`}>
                        <h3 className={`text-slate-500 uppercase tracking-wide ${largeText ? 'text-sm' : 'text-xs'}`}>Generated Visualizations</h3>
                        <ul className="mt-2 space-y-2">
                          {currentJob.mindmap_data && (
                            <li className={`flex items-center gap-2 ${largeText ? 'text-base' : 'text-sm'}`} style={{ color: getSuccessColor() }}>
                              <span aria-hidden="true">✅</span> <span>Mind Map generated</span>
                            </li>
                          )}
                          {currentJob.bubble_data && (
                            <li className={`flex items-center gap-2 ${largeText ? 'text-base' : 'text-sm'}`} style={{ color: getSuccessColor() }}>
                              <span aria-hidden="true">✅</span> <span>Bubble Map generated</span>
                            </li>
                          )}
                          {currentJob.infographic_data && (
                            <li className={`flex items-center gap-2 ${largeText ? 'text-base' : 'text-sm'}`} style={{ color: getSuccessColor() }}>
                              <span aria-hidden="true">✅</span> <span>Infographic generated</span>
                            </li>
                          )}
                        </ul>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                      <button
                        ref={publishButtonRef}
                        onClick={handlePublish}
                        disabled={isPublishing}
                        className={`flex-1 font-semibold py-3 px-6 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#080a0f] focus:ring-green-500 ${
                          highContrast ? 'bg-green-600 text-white hover:bg-green-500' : 'bg-green-600 hover:bg-green-500 text-white'
                        } ${isPublishing ? 'opacity-60 cursor-not-allowed' : ''}`}
                        aria-label="Publish article now"
                      >
                        <span aria-hidden="true">🚀</span> {isPublishing ? 'Publishing...' : 'Publish Now'}
                      </button>
                      <Link
                        href={`/${locale}/kb/${categorySlug}/${currentJob.article_slug}`}
                        className={`flex-1 font-semibold py-3 px-6 rounded-xl transition-all text-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#080a0f] focus:ring-slate-500 ${
                          highContrast ? 'bg-gray-600 text-white hover:bg-gray-500' : 'bg-slate-700 hover:bg-slate-600 text-white'
                        }`}
                        aria-label="Preview article before publishing"
                      >
                        <span aria-hidden="true">👁️</span> Preview
                      </Link>
                    </div>
                    {publishedUrl && (
                      <div className="flex gap-3">
                        <a
                          href={publishedUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 font-medium py-2.5 px-4 rounded-lg bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-600/30 text-center"
                        >
                          Open Published Article
                        </a>
                        <button
                          onClick={handleCopyPublishedLink}
                          className="flex-1 font-medium py-2.5 px-4 rounded-lg bg-cyan-600/20 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-600/30"
                        >
                          Copy Published Link
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {currentJob?.status === 'failed' && (
                  <div 
                    className="bg-red-500/10 border border-red-500/30 rounded-xl p-6"
                    role="alert"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-red-400 text-xl" aria-hidden="true">❌</span>
                      <span className={`font-semibold text-red-400 ${largeText ? 'text-base' : ''}`}>Generation Failed</span>
                    </div>
                    <p className={`text-slate-400 ${largeText ? 'text-base' : 'text-sm'}`}>{currentJob.error}</p>
                  </div>
                )}
              </section>
            </div>
          )}

          {/* Other tabs */}
          {activeTab === 'blocks' && (
            <section id="tabpanel-blocks" role="tabpanel" className="text-center py-20 text-slate-500">
              <p className={largeText ? 'text-lg' : ''}>Content blocks management coming soon...</p>
            </section>
          )}
          {activeTab === 'history' && (
            <section id="tabpanel-history" role="tabpanel" className="text-center py-20 text-slate-500">
              <p className={largeText ? 'text-lg' : ''}>Full generation history coming soon...</p>
            </section>
          )}
          {activeTab === 'stats' && (
            <section id="tabpanel-stats" role="tabpanel" className="text-center py-20 text-slate-500">
              <p className={largeText ? 'text-lg' : ''}>Detailed analytics coming soon...</p>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
