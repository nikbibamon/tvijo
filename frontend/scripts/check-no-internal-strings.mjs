#!/usr/bin/env node
/**
 * Internal-infrastructure guard.
 *
 * Spec: bibamoney-backend/specs/2026-09-workspace-data-and-design-pass.md §4.A.
 *
 * Why this exists: `/workspace/spaces` shipped a hardcoded list of the
 * operator's own hosts, repository paths, deploy commands and SSH policy. It
 * lived in a client component, so Next.js inlined it into a static chunk, and
 * `curl https://tvijo.com/_next/static/chunks/<hash>.js` returned
 * "passwordless sudo via niko2 chain" to anyone, no login required.
 *
 * Being behind an auth-gated *route* protects nothing: the JS that renders the
 * route is public. So the check runs over the source that becomes client
 * bundles, catching the leak at its origin the way check-claims does.
 *
 * Usage: npm run check:no-internal-strings
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { isAbsolute, join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;

/**
 * Two modes.
 *
 * Default: scan `src/`, catching a leak at the source before it is built.
 *
 * `--dist <dir>`: scan a built `.next/static` tree. This exists because
 * tvijo-deploy deliberately copies the previous release's `.next/static` into
 * every new release (deploy_newsagr.sh: `cp -a --update=none`) so a browser
 * holding stale HTML does not hit ChunkLoadError. That carry-forward means a
 * chunk containing a leak survives every later deploy even after the source is
 * fixed — on 2026-09-07 a chunk built at 13:37 with the operator's host names
 * reappeared, unreferenced, inside a release built at 15:25. Fixing the source
 * is not enough; the built tree has to be checked too.
 */
const distFlag = process.argv.indexOf('--dist');
const DIST_DIR = distFlag === -1 ? null : process.argv[distFlag + 1];
const SCAN_DIRS = DIST_DIR ? [DIST_DIR] : ['src'];
const EXTENSIONS = DIST_DIR
  ? ['.js', '.mjs', '.json', '.css', '.map']
  : ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.json'];

/**
 * Each rule is a string or pattern that must never reach a browser bundle.
 * Keep them specific: `/root/` as a bare substring would match innocent words,
 * so paths are anchored to a quote or whitespace boundary.
 */
const BANNED = [
  { re: /passwordless sudo/i, why: 'describes host privilege configuration' },
  { re: /\bniko2\b/, why: 'internal SSH jump host' },
  { re: /\bnewsagr\b/, why: 'internal host name' },
  { re: /\bbiba2\b/, why: 'internal host name' },
  { re: /id_ed25519/, why: 'SSH key file name' },
  { re: /(^|['"`\s(])\/root\//m, why: 'absolute server path' },
  { re: /\/var\/lib\/tvijo/, why: 'release directory layout' },
  { re: /\/var\/aios\//, why: 'release directory layout' },
  { re: /ai-os-workspaces/, why: 'internal repository root' },
  { re: /\b188\.245\.\d{1,3}\.\d{1,3}\b/, why: 'server IP address' },
];

/**
 * Server-only files never reach the browser, so an absolute path in a deploy
 * script or a Node-side helper is not a leak. Only client-reachable source is
 * scanned; anything under these paths is skipped.
 */
const SKIP = [
  'src/app/api/',
  'node_modules/',
  '.next/',
];

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const rel = relative(ROOT, full).replace(/\\/g, '/');
    if (!DIST_DIR && SKIP.some((prefix) => rel.startsWith(prefix))) continue;
    if (statSync(full).isDirectory()) {
      walk(full, out);
    } else if (EXTENSIONS.some((ext) => entry.endsWith(ext))) {
      out.push(full);
    }
  }
  return out;
}

const failures = [];

for (const dir of SCAN_DIRS) {
  const base = isAbsolute(dir) ? dir : join(ROOT, dir);
  if (!existsSync(base)) {
    console.error(`check:no-internal-strings — directory not found: ${base}`);
    process.exit(2);
  }
  for (const file of walk(base)) {
    const rel = relative(ROOT, file).replace(/\\/g, '/');
    const lines = readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, index) => {
      // The guard's own rule table would otherwise match itself.
      if (rel === 'scripts/check-no-internal-strings.mjs') return;
      // Minified bundles have no comment lines worth skipping, and a banned
      // string there is a real finding regardless of how it got in.
      if (DIST_DIR) {
        for (const rule of BANNED) {
          if (rule.re.test(line)) {
            failures.push({ file: rel, line: index + 1, why: rule.why, text: '(built output)' });
          }
        }
        return;
      }
      // Comments are stripped by the minifier and never reach a chunk —
      // verified against the built release: src/app/bibamoney/page.tsx names
      // a host and an IP in a JSDoc block, and neither appears in
      // `.next/static`. Provenance notes like that are worth keeping, so a
      // comment line is not a finding. The trade-off: a banned string inside
      // a template literal whose line happens to begin with `*` is missed.
      const trimmed = line.trimStart();
      if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) return;
      for (const rule of BANNED) {
        if (rule.re.test(line)) {
          failures.push({ file: rel, line: index + 1, why: rule.why, text: line.trim().slice(0, 120) });
        }
      }
    });
  }
}

if (failures.length > 0) {
  console.error('\ncheck:no-internal-strings FAILED — internal infrastructure would ship to the browser:\n');
  for (const f of failures) {
    console.error(`  ${f.file}:${f.line}  (${f.why})`);
    console.error(`    ${f.text}`);
  }
  console.error(DIST_DIR
    ? '\nA built chunk carries an internal string. Delete the chunk from the release,\n'
      + 'then purge it at the CDN — an immutable chunk stays cached at the edge for months.\n'
    : '\nClient components are public. Remove the value or move it server-side.\n');
  process.exit(1);
}

console.log(`check:no-internal-strings OK — ${SCAN_DIRS.join(', ')} clean (${BANNED.length} rules)`);
