/**
 * Knowledge Base Types
 * Generation: GEN-KB-001
 */

export type KBContentType =
  | 'article'
  | 'guide'
  | 'research'
  | 'observation'
  | 'analysis'
  | 'tutorial'
  | 'glossary'
  | 'roadmap';

export type KBDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type KBAccessLevel = 'free' | 'basic' | 'premium' | 'pro';

export const DIFFICULTY_CONFIG: Record<KBDifficulty, { label: string; labelRu: string; color: string; bg: string }> = {
  beginner: { label: 'Beginner', labelRu: 'Начальный', color: '#22C55E', bg: 'bg-green-500/10' },
  intermediate: { label: 'Intermediate', labelRu: 'Средний', color: '#3B82F6', bg: 'bg-blue-500/10' },
  advanced: { label: 'Advanced', labelRu: 'Продвинутый', color: '#F59E0B', bg: 'bg-amber-500/10' },
  expert: { label: 'Expert', labelRu: 'Экспертный', color: '#EF4444', bg: 'bg-red-500/10' },
};

export const CONTENT_TYPE_CONFIG: Record<KBContentType, { label: string; labelRu: string; icon: string }> = {
  article: { label: 'Article', labelRu: 'Статья', icon: '📄' },
  guide: { label: 'Guide', labelRu: 'Руководство', icon: '📖' },
  research: { label: 'Research', labelRu: 'Исследование', icon: '🔬' },
  observation: { label: 'Author Observation', labelRu: 'Наблюдение автора', icon: '🔭' },
  analysis: { label: 'Analysis', labelRu: 'Анализ', icon: '📊' },
  tutorial: { label: 'Tutorial', labelRu: 'Туториал', icon: '🎓' },
  glossary: { label: 'Glossary', labelRu: 'Глоссарий', icon: '📘' },
  roadmap: { label: 'Roadmap', labelRu: 'Дорожная карта', icon: '🗺️' },
};

export interface KBTag {
  name: string;
  slug: string;
}

export interface KBCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  order: number;
  is_published: boolean;
  article_count: number;
  children: KBCategory[];
}

/** Optional interactive layer for KB articles (bubbles, static infographics, bundles). */
export interface KBVisualEmbeds {
  /** BubbleMap UUID — opens /bubbles?map=… */
  bubble_map_id?: string;
  bubble_cta_label?: string;
  /** Paths under site root, e.g. /infographics/foo.png */
  infographics?: string[];
  /** UX hint: rating | network | timeline | compare */
  variant?: string;
  /** DecMapBundle UUID — opens /bundles?bundle=… */
  bundle_id?: string;
  bundle_cta_label?: string;
}

export interface KBArticleListItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover_image_url: string;
  content_type: KBContentType;
  difficulty: KBDifficulty;
  access_level: KBAccessLevel;
  reading_time: number;
  category_name: string;
  category_slug: string;
  category_icon: string;
  tags: KBTag[];
  author_name: string;
  is_featured: boolean;
  is_pinned: boolean;
  view_count: number;
  like_count: number;
  target_roles: string[];
  target_trader_levels: string[];
  target_income_levels: string[];
  published_at: string;
  created_at: string;
  updated_at?: string;
  viz_type?: 'auto' | 'bubbles' | 'mindmap' | 'timeline' | 'comparison' | 'graph';
  visual_embeds?: KBVisualEmbeds | Record<string, unknown>;
  viz_entity_count?: number;
  viz_structure_type?: string | null;
}

export interface LinkedBundle {
  id: string;
  name: string;
  slug: string;
  description: string;
  node_count: number;
  is_public: boolean;
}

export interface KBArticleDetail extends KBArticleListItem {
  content_html: string;
  content_md: string;
  category: KBCategory;
  meta_title: string;
  meta_description: string;
  canonical_url: string;
  related_articles: KBArticleListItem[];
  linked_bundles: LinkedBundle[];
  updated_at: string;
  visual_embeds?: KBVisualEmbeds | Record<string, unknown>;
  viz_type?: 'auto' | 'bubbles' | 'mindmap' | 'timeline' | 'comparison' | 'graph';
  viz_override?: {
    bubble_map_id?: string;
    mindmap_node_id?: string;
  } | null;
  visualization_data?: {
    structure_type: string;
    confidence: number;
    title: string;
    summary: string;
    entities: Array<{
      id: string;
      name: string;
      type: 'concept' | 'metric' | 'tool' | 'strategy' | 'person';
      importance: number;
      connections: number;
    }>;
    config: {
      type: string;
      bubble_map_id?: string;
      mindmap_node_id?: string;
      bubble_depth?: number;
    };
    metadata: {
      node_count: number;
      edge_count: number;
      analysis_source: string;
      bubble_depth?: number;
    };
    /** AI 12-dimension profile (staff "Content profile" / Celery analysis). */
    content_profile?: Record<string, unknown>;
    /** Editor-facing checklist derived from content_profile (no extra LLM). */
    publication_hints?: {
      profile_confidence?: number;
      primary_visualization_type?: string;
      mental_model?: string;
      suggested_viz_types_to_try?: string[];
      suggested_ai_mode?: string;
      context_domain?: string;
      editorial_checklist?: string[];
      embed_ideas?: Array<{ title: string; detail: string }>;
      entity_notes?: string[];
      output_formats?: string[];
    };
  } | null;
}

export interface KBArticleFilters {
  category?: string;
  type?: KBContentType;
  difficulty?: KBDifficulty;
  tag?: string;
  featured?: string;
  role?: string;
  trader_level?: string;
  q?: string;
  page?: number;
  sort?: 'newest' | 'oldest' | 'popular' | 'updated' | 'featured' | 'title';
  author_me?: 'true' | 'false';
}
