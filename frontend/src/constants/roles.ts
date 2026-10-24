/**
 * Role badges constants for KB role-based targeting
 * 12 platform roles with icons and labels
 */

export interface RoleBadge {
  id: string;
  slug: string;
  label: string;
  emoji: string;
  description: string;
  color: string;
}

export const ROLE_BADGES: RoleBadge[] = [
  {
    id: '1',
    slug: 'trader',
    label: 'Trader',
    emoji: '📈',
    description: 'Active trader in financial markets',
    color: '#22c55e', // green-500
  },
  {
    id: '2',
    slug: 'investor',
    label: 'Investor',
    emoji: '💼',
    description: 'Long-term investor',
    color: '#3b82f6', // blue-500
  },
  {
    id: '3',
    slug: 'analyst',
    label: 'Analyst',
    emoji: '📊',
    description: 'Market analyst and researcher',
    color: '#8b5cf6', // violet-500
  },
  {
    id: '4',
    slug: 'developer',
    label: 'Developer',
    emoji: '⚙️',
    description: 'Software developer',
    color: '#06b6d4', // cyan-500
  },
  {
    id: '5',
    slug: 'devops',
    label: 'DevOps',
    emoji: '🚀',
    description: 'Infrastructure and DevOps engineer',
    color: '#f97316', // orange-500
  },
  {
    id: '6',
    slug: 'quant',
    label: 'Quant',
    emoji: '🧮',
    description: 'Quantitative analyst',
    color: '#ec4899', // pink-500
  },
  {
    id: '7',
    slug: 'fund_manager',
    label: 'Fund Manager',
    emoji: '🏦',
    description: 'Investment fund manager',
    color: '#eab308', // yellow-500
  },
  {
    id: '8',
    slug: 'educator',
    label: 'Educator',
    emoji: '🎓',
    description: 'Trading educator or mentor',
    color: '#14b8a6', // teal-500
  },
  {
    id: '9',
    slug: 'content_creator',
    label: 'Content Creator',
    emoji: '🎬',
    description: 'Content creator and influencer',
    color: '#f43f5e', // rose-500
  },
  {
    id: '10',
    slug: 'beginner',
    label: 'Beginner',
    emoji: '🌱',
    description: 'New to trading',
    color: '#84cc16', // lime-500
  },
  {
    id: '11',
    slug: 'professional',
    label: 'Professional',
    emoji: '💎',
    description: 'Professional trader',
    color: '#6366f1', // indigo-500
  },
  {
    id: '12',
    slug: 'hobbyist',
    label: 'Hobbyist',
    emoji: '🔮',
    description: 'Trading as a hobby',
    color: '#a855f7', // purple-500
  },
];

export const ROLE_SLUGS = ROLE_BADGES.map(r => r.slug);

export const ROLE_BY_SLUG: Record<string, RoleBadge> = ROLE_BADGES.reduce(
  (acc, role) => ({ ...acc, [role.slug]: role }),
  {}
);

export const ROLE_BY_ID: Record<string, RoleBadge> = ROLE_BADGES.reduce(
  (acc, role) => ({ ...acc, [role.id]: role }),
  {}
);
