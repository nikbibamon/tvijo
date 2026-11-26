import { portalNavigationCopy as en, portalTeamLinks as enTeams } from '@/i18n/locales/en';
import { portalNavigationCopy as ru, portalTeamLinks as ruTeams } from '@/i18n/locales/ru';

export type PortalLink = { label: string; href: string };
export type PortalGroup = { id: string; label: string; links: PortalLink[] };

export function portalNavigation(locale: string) {
  const copy = locale === 'ru' ? ru : en;
  const local = (path: string) => `/${locale}${path}`;
  // Model Atlas and the trials pages are published in English only (/ru/compare/research etc. return 404):
  // Russian menus link the English page and say so in the label.
  const enOnly = (path: string, label: string) => ({ label: locale === 'ru' ? `${label} (EN)` : label, href: `/en${path}` });
  const wiki = (slug = '') => `/wiki/${locale === 'ru' ? 'ru/' : ''}${slug ? `${slug}/` : ''}`;
  const links = {
    overview: { label: copy.overview, href: local('/product') },
    chat: { label: copy.chat, href: `https://dsh.tvijo.com/centavra?lang=${locale}` },
    workspace: { label: copy.workspace, href: 'https://dsh.tvijo.com/' },
    extension: { label: copy.extension, href: 'https://dsh.tvijo.com/download' },
    remdesk: { label: 'RemDesk', href: local('#remdesk-home') },
    pricing: { label: copy.pricing, href: local('/pricing') },
    demo: { label: copy.demo, href: local('/demo') },
    compare: { label: copy.compare, href: local('/compare') },
    atlas: enOnly('/compare/research', copy.atlas),
    trials: enOnly('/compare/experiments', copy.trials),
    radar: { label: copy.radar, href: local('/ai-radar') },
    method: { label: copy.method, href: wiki('tvijo-agent-evaluation-method') },
    data: { label: copy.data, href: local('/data') },
    agentSkills: { label: copy.agentSkills, href: local('/agent-skills') },
    axes: { label: copy.axes, href: local('/agent-skills/axes') },
    wiki: { label: copy.wiki, href: wiki() },
    search: { label: copy.search, href: `/knowledge-map/?lang=${locale}` },
    technology: { label: copy.technology, href: wiki('tvijo-technology-map') },
    centavraLearn: { label: copy.centavraLearn, href: local('/centavra/') },
    library: { label: copy.library, href: local('/learn') },
    guides: { label: copy.guides, href: local('/kb') },
    exercises: { label: copy.exercises, href: wiki('tvijo-learn-evidence-workflow') },
    docs: { label: copy.docs, href: 'https://dsh.tvijo.com/docs' },
    tools: { label: copy.tools, href: local('/tools') },
    solutions: { label: copy.solutions, href: local('/solutions') },
    discuss: { label: copy.discuss, href: local('#order') },
    faq: { label: copy.faq, href: local('/faq') },
    login: { label: copy.login, href: local('/login') },
    archive: { label: copy.archive, href: locale === 'ru' ? '/sandbox/designs/2026-10-18/ru' : '/sandbox/designs/2026-10-18/' },
    changelog: { label: copy.changelog, href: local('/changelog') },
    security: { label: copy.security, href: local('/security') },
  };
  const groups: PortalGroup[] = [
    { id: 'products', label: copy.products, links: [links.overview, links.chat, links.workspace, links.extension, links.remdesk, links.pricing, links.demo] },
    { id: 'research', label: copy.research, links: [links.compare, links.atlas, links.trials, links.radar, links.method, links.data] },
    { id: 'skills', label: copy.skills, links: [links.agentSkills, links.axes] },
    { id: 'knowledge', label: copy.knowledge, links: [links.wiki, links.search, links.technology] },
    { id: 'learn', label: copy.learn, links: [links.centavraLearn, links.library, links.guides, links.exercises, links.docs] },
  ];
  const footerGroups: PortalGroup[] = [
    { ...groups[0], links: [links.overview, links.chat, links.workspace, links.extension, links.remdesk, links.pricing] },
    { ...groups[1], links: [links.compare, links.atlas, links.radar, links.method, links.data] },
    { id: 'knowledge-learning', label: copy.knowledgeLearning, links: [links.wiki, links.search, links.technology, links.agentSkills, links.centavraLearn] },
    { id: 'company-help', label: copy.companyHelp, links: [links.solutions, links.discuss, links.faq, links.login, links.archive, links.security] },
  ];
  const teamLinks = (locale === 'ru' ? ruTeams : enTeams).map(item => ({ ...item, href: `${item.href}?lang=${locale}` }));
  // Tools and Changelog were staff-only before this navigation; they stay in the staff menu only.
  const staffLinks: PortalLink[] = [links.tools, links.changelog];
  return { groups, footerGroups, teamLinks, staffLinks, openWorkspace: copy.openWorkspace };
}

// Choose the most specific local link so a child page does not mark its parent too.
export function activePortalHref(groups: PortalGroup[], pathname: string, hash: string) {
  const current = pathname.replace(/\/$/, '');
  return groups.flatMap(group => group.links).filter(({ href }) => {
    if (!href.startsWith('/')) return false;
    const [path, fragment] = href.split('#');
    const target = path.split('?')[0].replace(/\/$/, '');
    return fragment ? current === target && hash === `#${fragment}` : current === target || current.startsWith(`${target}/`);
  }).sort((a, b) => b.href.length - a.href.length)[0]?.href;
}
