/**
 * SEO Editor Engine API Client
 * Generation: GEN-EDITOR-SEO-001
 */

import { getAccessToken } from './auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

// Types
export interface EditorPreset {
  id: string;
  name: string;
  content_type: 'kb_article' | 'learn_course' | 'learn_lesson' | 'infographic' | 'mindmap' | 'bubble';
  tone: string;
  ai_model: string;
  temperature: number;
  target_keywords: string[];
  min_word_count: number;
  max_word_count: number;
  auto_generate_mindmap: boolean;
  auto_generate_bubbles: boolean;
  auto_generate_infographic: boolean;
  default_blocks: string[];
  is_active: boolean;
}

export interface AIGenerationRequest {
  generation_type: 'full_article' | 'article_only' | 'mindmap_only' | 'bubble_only' | 'infographic_only' | 'seo_metadata';
  title_prompt: string;
  content_prompt: string;
  preset_id?: string | null;
  target_keywords?: string[];
  min_word_count?: number;
  max_word_count?: number;
  include_blocks?: ('matrix' | 'chart' | 'checklist' | 'funnel' | 'scoring' | 'comparison')[];
  generate_mindmap?: boolean;
  generate_bubbles?: boolean;
  generate_infographic?: boolean;
  target_section?: 'kb' | 'learn';
  category_slug?: string;
}

export interface AIGenerationResult {
  job_id: string;
  status: 'completed' | 'failed' | 'pending' | 'processing';
  title?: string;
  content?: string;
  excerpt?: string;
  meta_title?: string;
  meta_description?: string;
  keywords?: string[];
  entities?: Array<{name: string; type: string; importance: number}>;
  article_id?: number;
  article_slug?: string;
  mindmap_data?: any;
  bubble_data?: any;
  infographic_data?: any;
  tokens_used?: number;
  cost_estimate?: number;
  error?: string;
}

export interface ContentBlock {
  id: string;
  name: string;
  block_type: 'matrix' | 'chart' | 'checklist' | 'funnel' | 'scoring' | 'comparison' | 'timeline' | 'process' | 'quote' | 'stat';
  title: string;
  description?: string;
  block_data: any;
  color_scheme: string;
  is_template: boolean;
  created_at: string;
}

export interface BlockGenerationRequest {
  block_type: ContentBlock['block_type'];
  content: string;
  title?: string;
  custom_prompt?: string;
  color_scheme?: string;
}

export interface QuickPublishRequest {
  job_id: string;
  publish_options?: {
    publish_now?: boolean;
    schedule_at?: string;
    featured?: boolean;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    access_level?: 'public' | 'registered' | 'premium';
  };
  target_section?: 'kb' | 'learn';
  category_slug?: string;
  course_id?: number;
}

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });
}

export const editorApi = {
  // Presets
  async getPresets(): Promise<EditorPreset[]> {
    const res = await fetchWithAuth('/v1/editor/presets/');
    if (!res.ok) throw new Error('Failed to load presets');
    return res.json();
  },

  // AI Generation
  async generateContent(request: AIGenerationRequest): Promise<AIGenerationResult> {
    const res = await fetchWithAuth('/v1/editor/ai-jobs/generate/', {
      method: 'POST',
      body: JSON.stringify(request),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Generation failed');
    }
    return res.json();
  },

  async getGenerationStatus(jobId: string): Promise<AIGenerationResult> {
    const res = await fetchWithAuth(`/v1/editor/ai-jobs/${jobId}/`);
    if (!res.ok) throw new Error('Failed to get job status');
    return res.json();
  },

  // Blocks
  async generateBlock(request: BlockGenerationRequest): Promise<ContentBlock> {
    const res = await fetchWithAuth('/v1/editor/ai-jobs/generate_block/', {
      method: 'POST',
      body: JSON.stringify(request),
    });
    if (!res.ok) throw new Error('Block generation failed');
    return res.json();
  },

  async getBlocks(): Promise<ContentBlock[]> {
    const res = await fetchWithAuth('/v1/editor/blocks/');
    if (!res.ok) throw new Error('Failed to load blocks');
    return res.json();
  },

  async getBlockTemplates(): Promise<ContentBlock[]> {
    const res = await fetchWithAuth('/v1/editor/blocks/templates/');
    if (!res.ok) throw new Error('Failed to load templates');
    return res.json();
  },

  // Publishing
  async publish(request: QuickPublishRequest): Promise<{published: boolean; article_id?: number; article_slug?: string; url?: string}> {
    const res = await fetchWithAuth(`/v1/editor/ai-jobs/${request.job_id}/publish/`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Publish failed');
    }
    return res.json();
  },

  // Stats
  async getStats(): Promise<{
    total_jobs: number;
    completed: number;
    failed: number;
    total_tokens: number;
    total_cost: number;
    recent: AIGenerationResult[];
  }> {
    const res = await fetchWithAuth('/v1/editor/ai-jobs/stats/');
    if (!res.ok) throw new Error('Failed to load stats');
    return res.json();
  },
};

export default editorApi;
