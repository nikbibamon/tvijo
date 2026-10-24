#!/usr/bin/env node
/**
 * Contract test for the public agent-skills showcase wiring.
 *
 * Spec: bibamoney-backend/specs/2026-08-hermes-skills-plugins-agents-roadmap.md,
 * «Решение по публичной витрине (одобрено 2026-08-31)»: the page /{locale}/agent-skills
 * must be publicly reachable and discoverable (main navigation + sitemap) while the
 * client operations stay behind JWT.
 *
 * Run: node scripts/agent-skills.test.mjs
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(resolve(root, p), 'utf8');

/** Extract the balanced {...} or [...] block that starts at `startIdx`. */
function extractBlock(src, startIdx) {
  const open = src[startIdx];
  const close = open === '{' ? '}' : ']';
  let depth = 0;
  for (let i = startIdx; i < src.length; i++) {
    if (src[i] === open) depth++;
    if (src[i] === close) {
      depth--;
      if (depth === 0) return src.slice(startIdx, i + 1);
    }
  }
  throw new Error('Unbalanced block in source');
}

function navBlock(source, marker) {
  // Sections like `pricing: {` nest their own `nav: {` labels object; the target
  // navigation block is identified by a marker key it must contain.
  let idx = source.indexOf('nav: {');
  while (idx !== -1) {
    const block = extractBlock(source, idx + 'nav: '.length);
    if (block.includes(`${marker}:`)) return block;
    idx = source.indexOf('nav: {', idx + 1);
  }
  throw new Error(`nav block containing '${marker}:' not found`);
}

// ---------------------------------------------------------------- witnesses

const navbar = read('src/components/portal/Navbar.tsx');
const sitemap = read('src/app/sitemap.ts');
const data = read('src/data/agent-skills.ts');
const LOCALES = ['en', 'ru', 'uk', 'de', 'es', 'pt', 'nl', 'hi', 'ja', 'ko', 'zh'];

test('main navigation links to the public /agent-skills showcase', () => {
  const primaryIdx = navbar.indexOf('const NAV_PRIMARY = [');
  if (primaryIdx === -1) throw new Error('NAV_PRIMARY list not found in Navbar');
  const primary = extractBlock(navbar, primaryIdx + 'const NAV_PRIMARY = '.length);
  if (!primary.includes("href: '/agent-skills'")) {
    throw new Error(
      'NAV_PRIMARY must contain an entry with href /agent-skills so the public ' +
      'showcase is reachable from the main navigation (operator decision 2026-08-31).',
    );
  }
});

test('homepage header links to the public /agent-skills showcase', () => {
  const home = read('src/app/[locale]/page.tsx');
  const navIdx = home.indexOf('const allNavItems = [');
  if (navIdx === -1) throw new Error('home allNavItems list not found');
  const items = extractBlock(home, navIdx + 'const allNavItems = '.length);
  if (!items.includes('agentSkills')) {
    throw new Error(
      'homepage allNavItems must include the t.home.nav.agentSkills entry so visitors ' +
      'reach the public showcase from the landing header.',
    );
  }
});

test('every locale file translates home.nav.agentSkills', () => {
  for (const loc of LOCALES) {
    const src = read(`src/i18n/locales/${loc}.ts`);
    const homeIdx = src.indexOf('home: {');
    if (homeIdx === -1) throw new Error(`${loc}.ts has no home block`);
    const homeBlock = extractBlock(src, homeIdx + 'home: '.length);
    const nav = navBlock(homeBlock, 'requestDemo');
    const match = nav.match(/\bagentSkills:\s*'([^']+)'/);
    if (!match || !match[1].trim()) {
      throw new Error(`src/i18n/locales/${loc}.ts is missing home.nav.agentSkills.`);
    }
  }
});

test('every locale file translates nav.agentSkills (typed Translations: missing key is a compile error)', () => {
  for (const loc of LOCALES) {
    const src = read(`src/i18n/locales/${loc}.ts`);
    const nav = navBlock(src, 'pricing');
    const match = nav.match(/\bagentSkills:\s*'([^']+)'/);
    if (!match || !match[1].trim()) {
      throw new Error(
        `src/i18n/locales/${loc}.ts is missing nav.agentSkills; Navbar renders t.nav.agentSkills.`,
      );
    }
  }
  const ru = navBlock(read('src/i18n/locales/ru.ts'), 'pricing').match(/\bagentSkills:\s*'([^']+)'/)[1];
  if (ru !== 'Навыки агентов') {
    throw new Error(`ru nav.agentSkills must be 'Навыки агентов', got '${ru}'`);
  }
});

test('sitemap.xml registers /agent-skills for the honest-index locales only', () => {
  if (!sitemap.includes('/${locale}/agent-skills') && !sitemap.includes("'/agent-skills'")) {
    throw new Error('sitemap.ts must list /agent-skills so search engines can discover the showcase');
  }
  if (!sitemap.includes('AGENT_SKILL_INDEX_LOCALES')) {
    throw new Error(
      'sitemap.ts must derive the /agent-skills locales from AGENT_SKILL_INDEX_LOCALES ' +
      '(en+ru+uk have unique copy; the other locales are noindex and must stay out of the sitemap)',
    );
  }
});

test('showcase copy is only indexable where unique copy exists (en, ru, uk)', () => {
  const m = data.match(/AGENT_SKILL_INDEX_LOCALES = \[([^\]]*)\]/);
  if (!m) throw new Error('AGENT_SKILL_INDEX_LOCALES not found in src/data/agent-skills.ts');
  const locales = m[1].split(',').map((s) => s.trim().replaceAll("'", '')).filter(Boolean);
  if (locales.join(',') !== 'en,ru,uk') {
    throw new Error(`AGENT_SKILL_INDEX_LOCALES must be exactly ['en','ru','uk'], got [${locales}]`);
  }
});

test('public pack facts match the backend catalogue exactly (honest-numbers rule)', () => {
  const backendPath = resolve(root, '../bibamoney-backend/apps/workspace/data/skill_packs.json');
  if (!existsSync(backendPath)) {
    throw new Error(`backend catalogue not found at ${backendPath}`);
  }
  const backend = JSON.parse(readFileSync(backendPath, 'utf8'));
  const dataModule = readFileSync(resolve(root, 'src/data/agent-skills.ts'), 'utf8');

  const fields = (key, src) => {
    const block = src.match(new RegExp(`key: '${key}'[\\s\\S]*?\\},`));
    if (!block) throw new Error(`pack ${key} not found in frontend data`);
    const val = (field) => {
      const m = block[0].match(new RegExp(`${field}: ('([^']*)'|([0-9]+))`));
      if (!m) throw new Error(`pack ${key} is missing ${field}`);
      return m[2] !== undefined ? m[2] : Number(m[3]);
    };
    return { version: val('version'), tier: val('tier'), files: val('files') };
  };

  for (const pack of backend) {
    const front = fields(pack.key, dataModule);
    for (const field of ['version', 'tier', 'files']) {
      if (String(front[field]) !== String(pack[field])) {
        throw new Error(
          `pack ${pack.key}.${field}: frontend says ${front[field]}, backend catalogue says ${pack[field]}. ` +
          'Public marketing numbers must match the served catalogue.',
        );
      }
    }
  }
  if (backend.length !== 5) {
    throw new Error(`expected 5 curated packs in the backend catalogue, found ${backend.length}`);
  }
});
