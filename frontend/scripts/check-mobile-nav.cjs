#!/usr/bin/env node
/**
 * Contract check: mobile bottom navigation for the workspace shell.
 *
 * Red/green gate for the mobile dashboard/workspaces redesign. Fails while
 * the shell has no bottom-nav on small screens; passes once implemented.
 *
 * Checks (each maps to a spec acceptance criterion):
 *  1. WorkspaceCopy.shell.mobileTabs exists with 5 tab labels (Home, Overview,
 *     Activity, Apps, Menu) in EN, UK and RU dictionaries.
 *  2. WorkspaceShell.tsx renders a <nav className="twk-bottomnav"> and no
 *     longer shows the hamburger button on mobile (the button is hidden on
 *     small screens via CSS, asserted separately).
 *  3. workspace.css contains a `max-width: 900px` block that styles
 *     .twk-bottomnav and pads .twk-main so content clears the bar.
 *  4. getWorkspaceCopy returns Russian copy for locale 'ru'.
 */

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
let failures = 0;

function fail(msg) {
  failures += 1;
  console.error(`  ✗ ${msg}`);
}
function ok(msg) {
  console.log(`  ✓ ${msg}`);
}
function check(name, fn) {
  console.log(`\n${name}`);
  try {
    fn();
  } catch (err) {
    fail(`${name} threw: ${err.message}`);
  }
}

const i18nSrc = fs.readFileSync(path.join(ROOT, 'src/i18n/workspace.ts'), 'utf8');
const shellSrc = fs.readFileSync(path.join(ROOT, 'src/components/workspace/WorkspaceShell.tsx'), 'utf8');
const cssSrc = fs.readFileSync(path.join(ROOT, 'src/app/[locale]/workspace/workspace.css'), 'utf8');

check('1. i18n: mobileTabs present in type + dictionaries', () => {
  if (!/mobileTabs:\s*ReadonlyArray/.test(i18nSrc)) {
    fail('ShellCopy type has no mobileTabs field');
  } else ok('ShellCopy type declares mobileTabs');

  const dicts = ['const EN', 'const UK', 'const RU'];
  for (const d of dicts) {
    const idx = i18nSrc.indexOf(d);
    if (idx === -1) { fail(`${d} dictionary missing`); continue; }
    const nextDict = i18nSrc.indexOf('const ', idx + 6);
    const slice = i18nSrc.slice(idx, nextDict === -1 ? i18nSrc.length : nextDict);
    if (/mobileTabs:\s*\[/.test(slice)) ok(`${d} defines mobileTabs`);
    else fail(`${d} does not define mobileTabs`);
  }
});

check('2. Shell: bottom-nav markup rendered', () => {
  if (/twk-bottomnav/.test(shellSrc)) ok('WorkspaceShell renders twk-bottomnav');
  else fail('WorkspaceShell has no twk-bottomnav markup');

  if (/bottomNavAria|bottomNavLabel|navAria/.test(shellSrc)) ok('bottom-nav has an aria label');
  else fail('bottom-nav has no aria label');
});

check('3. CSS: mobile bottom-nav styled and content clears it', () => {
  const m = cssSrc.match(/@media\s*\(max-width:\s*900px\)\s*\{([\s\S]*?)\n\}/);
  if (!m) { fail('no @media (max-width: 900px) block found'); return; }
  const block = m[1];
  if (/\.twk-bottomnav/.test(block)) ok('.twk-bottomnav styled inside 900px block');
  else fail('.twk-bottomnav not styled inside 900px block');

  if (/\.twk-main[\s\S]*?padding[^;]*(?:calc|safe-area|96|88|80)/.test(block)) {
    ok('.twk-main padded to clear the bottom nav');
  } else {
    fail('.twk-main bottom padding for the bottom nav not found in 900px block');
  }

  if (/\.twk-menu-button\s*\{[^}]*display:\s*none/.test(block)) {
    ok('hamburger hidden on mobile');
  } else {
    fail('hamburger (.twk-menu-button) is not hidden in the 900px block');
  }
});

check('4. i18n: Russian dictionary wired into selector', () => {
  const sel = i18nSrc.match(/export function getWorkspaceCopy[\s\S]*?\n\}/);
  if (!sel) { fail('getWorkspaceCopy not found'); return; }
  if (/locale === ['"]ru['"]/.test(sel[0])) ok("getWorkspaceCopy returns Russian copy for 'ru'");
  else fail("getWorkspaceCopy has no 'ru' branch");
});

if (failures) {
  console.error(`\n${failures} check(s) FAILED`);
  process.exit(1);
}
console.log('\nAll mobile bottom-nav checks passed');
