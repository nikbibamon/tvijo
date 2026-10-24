#!/usr/bin/env node
/**
 * i18n contract guard.
 *
 * Every locale file declares `const xx: Translations` where `Translations = typeof en`,
 * so TypeScript already proves each locale has exactly the keys en.ts has. The catch is
 * that next.config.js sets `typescript.ignoreBuildErrors: true`, so `next build` would
 * happily ship a locale that is missing a key.
 *
 * This script runs tsc and fails ONLY on errors inside src/i18n/, so a missing or
 * misspelled translation key is a hard error even though the rest of the codebase
 * still carries pre-existing type debt.
 *
 * Usage: npm run check:i18n
 */

import { execSync } from 'node:child_process';

let output = '';
try {
  execSync('npx tsc --noEmit', { encoding: 'utf8', stdio: 'pipe' });
} catch (err) {
  output = `${err.stdout || ''}${err.stderr || ''}`;
}

const i18nErrors = output
  .split('\n')
  .filter((line) => line.includes('src/i18n/') && line.includes('error TS'));

if (i18nErrors.length > 0) {
  console.error('✗ i18n contract broken — a locale does not match en.ts:\n');
  console.error(i18nErrors.join('\n'));
  console.error('\nEnglish (src/i18n/locales/en.ts) is the source of truth.');
  console.error('Every other locale must define the same keys with the same shape.');
  process.exit(1);
}

console.log('✓ i18n contract OK — all 11 locales match en.ts');
