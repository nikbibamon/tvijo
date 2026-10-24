#!/usr/bin/env node
/**
 * Contract test for the workspace setup locale wiring.
 *
 * Run: node scripts/workspace-i18n.test.mjs
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const setup = readFileSync(
  resolve(root, 'src/components/workspace/features/setup/WorkspaceSetupProgress.tsx'),
  'utf8',
);

test('WorkspaceSetupProgress uses the already parsed locale without English fallback', () => {
  if (!setup.includes('getWorkspaceCopy(locale)') || setup.includes('parseLocale(locale)')) {
    throw new Error(
      'WorkspaceSetupProgress must pass its Locale value directly to getWorkspaceCopy; ' +
      'parsing a bare locale code as a pathname falls back to English.',
    );
  }
});
