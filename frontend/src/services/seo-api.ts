/**
 * SEO API Client
 * Generation: GEN-SEARCH-API-001
 * 
 * API for Google Search Console data
 */

const API_BASE = process.env.NEXT_PUBLIC_DJANGO_API_URL || '/api/v1';

function getToken(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('access_token') || '';
}

export const seoAPI = {
  /**
   * Get Search Console keywords
   */
  async getKeywords(days: number = 28, limit: number = 50) {
    const token = getToken();
    const response = await fetch(
      `${API_BASE}/cloudflare/search-keywords/?days=${days}&limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch keywords');
    }

    return response.json();
  },

  /**
   * Get Search Console pages
   */
  async getPages(days: number = 28) {
    const token = getToken();
    const response = await fetch(
      `${API_BASE}/cloudflare/search-pages/?days=${days}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch pages');
    }

    return response.json();
  },

  /**
   * Get SEO history (daily snapshots)
   */
  async getHistory(days: number = 30) {
    const token = getToken();
    const response = await fetch(
      `${API_BASE}/cloudflare/seo-history/?days=${days}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      // Fallback to empty array if endpoint not ready
      return [];
    }

    return response.json();
  },

  /**
   * Get SEO issues/errors
   */
  async getIssues() {
    const token = getToken();
    const response = await fetch(
      `${API_BASE}/cloudflare/seo-issues/`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return [];
    }

    return response.json();
  },

  /**
   * Get Search Console connection status
   */
  async getStatus() {
    const token = getToken();
    const response = await fetch(
      `${API_BASE}/cloudflare/search-status/`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return { connected: false };
    }

    return response.json();
  },
};
