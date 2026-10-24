import type { ReactNode, SVGProps } from 'react';

export type WorkspaceIconName =
  | 'apps'
  | 'activity'
  | 'arrow'
  | 'bell'
  | 'billing'
  | 'bot'
  | 'book'
  | 'box'
  | 'building'
  | 'calendar'
  | 'check'
  | 'chevron'
  | 'command'
  | 'connections'
  | 'database'
  | 'engineering'
  | 'eye'
  | 'file'
  | 'guardrails'
  | 'home'
  | 'info'
  | 'install'
  | 'key'
  | 'layers'
  | 'lock'
  | 'market'
  | 'menu'
  | 'network'
  | 'play'
  | 'plugins'
  | 'search'
  | 'server'
  | 'shield'
  | 'sparkles'
  | 'target'
  | 'user'
  | 'wallet'
  | 'warning'
  | 'x';

const paths: Record<WorkspaceIconName, ReactNode> = {
  activity: <><path d="M4 19V9m5 10V5m5 14v-7m5 7V3"/><path d="m3 8 5-4 5 6 7-8"/></>,
  apps: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
  arrow: <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
  billing: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h3"/></>,
  bot: <><rect x="4" y="8" width="16" height="12" rx="3"/><path d="M12 4v4M2 13h2m16 0h2"/><path d="M9 14h.01M15 14h.01"/><path d="M9.5 17.5h5"/><circle cx="12" cy="3" r="1"/></>,
  book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/></>,
  box: <><path d="m21 8-9-5-9 5 9 5 9-5Z"/><path d="m3 8 9 5 9-5M3 8v8l9 5 9-5V8M12 13v8"/></>,
  building: <><path d="M4 21V5l8-3 8 3v16"/><path d="M9 9h1m4 0h1M9 13h1m4 0h1M9 17h1m4 0h1M2 21h20"/></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
  check: <path d="m5 12 4 4L19 6"/>,
  chevron: <path d="m9 18 6-6-6-6"/>,
  command: <><path d="M18 9a3 3 0 1 0-3-3v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3Z"/></>,
  connections: <><path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.1 1.1"/><path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.1-1.1"/></>,
  database: <><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/></>,
  engineering: <><path d="m8 9-4 3 4 3M16 9l4 3-4 3M14 5l-4 14"/></>,
  eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></>,
  file: <><path d="M6 2h8l4 4v16H6z"/><path d="M14 2v5h5M9 13h6M9 17h6"/></>,
  guardrails: <path d="M12 22s8-3.5 8-10V5l-8-3-8 3v7c0 6.5 8 10 8 10Z"/>,
  home: <><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10M9 20v-6h6v6"/></>,
  info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/></>,
  install: <><path d="M12 3v12m0 0 4-4m-4 4-4-4"/><path d="M4 17v3h16v-3"/></>,
  key: <><circle cx="8" cy="15" r="4"/><path d="m11 12 8-8m-3 3 2 2m-5 1 2 2"/></>,
  layers: <><path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 17l9 5 9-5"/></>,
  lock: <><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
  market: <><path d="M4 19V9m5 10V5m5 14v-7m5 7V3"/><path d="m3 8 5-4 5 6 7-8"/></>,
  menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>,
  network: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/></>,
  play: <><circle cx="12" cy="12" r="9"/><path d="m10 8 6 4-6 4Z"/></>,
  plugins: <path d="M19.4 15a1.7 1.7 0 0 0 1.3-2.8l-1-1a2 2 0 0 1-.5-1.8l.3-1.4a1.7 1.7 0 0 0-2.3-1.9l-1.4.6a2 2 0 0 1-1.9-.2L12.8 5A1.7 1.7 0 0 0 10 6.1l-.1 1.5a2 2 0 0 1-1.1 1.5l-1.4.7a1.7 1.7 0 0 0 0 3.1l1.4.7a2 2 0 0 1 1.1 1.5l.1 1.5a1.7 1.7 0 0 0 2.8 1.1l1.1-1a2 2 0 0 1 1.9-.2l1.4.6a1.7 1.7 0 0 0 2.3-1.9l-.1-.2Z"/>,
  search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
  server: <><rect x="3" y="4" width="18" height="6" rx="2"/><rect x="3" y="14" width="18" height="6" rx="2"/><path d="M7 7h.01M7 17h.01M11 7h6M11 17h6"/></>,
  shield: <><path d="M12 22s8-3.5 8-10V5l-8-3-8 3v7c0 6.5 8 10 8 10Z"/><path d="m9 12 2 2 4-5"/></>,
  sparkles: <><path d="m12 3 1.2 3.5L17 8l-3.8 1.5L12 13l-1.2-3.5L7 8l3.8-1.5L12 3Z"/><path d="m18 14 .8 2.2L21 17l-2.2.8L18 20l-.8-2.2L15 17l2.2-.8L18 14Z"/></>,
  target: <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/><path d="m15 9 6-6"/></>,
  user: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
  wallet: <><path d="M3 6h15a2 2 0 0 1 2 2v11H5a2 2 0 0 1-2-2V6Z"/><path d="M3 6V5a2 2 0 0 1 2-2h11v3M15 12h5"/></>,
  warning: <><path d="M10.3 3.7 2.4 18a2 2 0 0 0 1.8 3h15.6a2 2 0 0 0 1.8-3L13.7 3.7a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4m0 4h.01"/></>,
  x: <path d="M6 6l12 12M18 6 6 18"/>,
};

export function WorkspaceIcon({ name, ...props }: { name: WorkspaceIconName } & SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      {paths[name]}
    </svg>
  );
}
