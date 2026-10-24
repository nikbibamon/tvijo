#!/usr/bin/env node
/**
 * Marketing-claims guard for the funnel copy.
 *
 * Spec: bibamoney-backend/specs/2026-08-marketing-funnel-addendum.md §3.
 * The claims audit found the funnel describing capabilities the backend does
 * not have. This script keeps the forbidden formulations out of the data files
 * that feed /solutions, /proof and /security, so a future edit cannot quietly
 * reintroduce them.
 *
 * It is a lint, not a truth oracle: it catches banned wording and bare
 * percentages. Whether a `status: 'live'` is honest still requires reading code.
 *
 * Usage: npm run check:claims
 */

import { readFileSync } from 'node:fs';

const FILES = ['src/data/solutions.ts', 'src/data/proof.ts', 'src/data/security.ts'];

/**
 * The homepage drifted out of sync with the funnel because only the three files
 * above were guarded: en.ts kept claiming an event hash, a policy engine and a
 * 99.9% coverage target that the backend never had. en.ts is the source of
 * truth every other locale is typed against, so guarding it here catches the
 * regression at its origin.
 *
 * It gets its own narrower list: the bare-percentage rule cannot apply, because
 * `problem.stats` legitimately cites third-party market research (88% of
 * companies use AI, and so on). Those are attributed external figures, not
 * claims about what Tvijo does.
 */
const I18N_FILES = ['src/i18n/locales/en.ts'];

const I18N_BANNED = [
  { re: /audit trail coverage|coverage target/i, why: 'unverifiable coverage metric' },
  { re: /event hash stored|hash stored/i, why: 'event hash claimed as shipped' },
  { re: /\bPII Guard\b/, why: 'PII guard claimed as a pipeline stage (guard.py only checks output)' },
  { re: /Typical savings/i, why: 'unverifiable savings claim' },
  { re: /exportable (as|for) (evidence|audits)/i, why: 'evidence export claimed as shipped' },
];

const BANNED = [
  // Legal formulations we must never use about ourselves.
  { re: /\bfully compliant\b|\bmakes you compliant\b|\bguaranteed compliance\b/i, why: 'compliance guarantee' },
  { re: /\bwe are certified\b|\bTvijo is certified\b|\bSOC ?2 certified\b|\bSOC ?2 compliant\b/i, why: 'certification claim' },
  { re: /сертифицирован(ы|а)? по|гарантируем соответствие|соответствие гарантирован/i, why: 'compliance guarantee (ru)' },
  // Profit / return claims are permanently out (commercial audit, CULLED).
  { re: /\bROI\b|\bguaranteed savings\b|\bincrease revenue\b|\bprofit\b/i, why: 'profit/return claim' },
  { re: /гарантированн(ая|ую) экономи|увеличит(ь)? выручк|доходность/i, why: 'profit/return claim (ru)' },
  // Unverifiable numbers: any bare percentage in marketing copy.
  { re: /\b\d{1,3}(\.\d+)?\s?%/, why: 'unverifiable percentage' },
  // Capabilities the backend does not have, stated as fact.
  { re: /\bwe (store|keep) tamper-evident\b|\btamper-evident storage today\b/i, why: 'tamper-evidence claimed as shipped' },
];

/** Lines that legitimately mention a banned word while denying it. */
const NEGATION_HINTS = [
  /not attested/i, /no such certificate/i, /do not (claim|publish|have|train)/i,
  /make no claims/i, /no claims about/i,
  /is design/i, /design intent/i, /not built/i, /no evidence-pack/i, /roadmap/i,
  /не обещ/i, /не существует/i, /не аттестован/i, /проект/i, /не построен/i,
  /никаких утверждений/i, /не публикуем/i, /не будем/i, /нет /i,
];

let failures = 0;

function scan(file, rules) {
  const lines = readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    if (line.trim().startsWith('*') || line.trim().startsWith('//')) return; // comments
    for (const { re, why } of rules) {
      if (!re.test(line)) continue;
      if (NEGATION_HINTS.some((n) => n.test(line))) continue; // "we do not claim X"
      failures += 1;
      console.error(`✗ ${file}:${i + 1} — ${why}\n    ${line.trim().slice(0, 160)}`);
    }
  });
}

for (const file of FILES) scan(file, BANNED);
for (const file of I18N_FILES) scan(file, I18N_BANNED);

if (failures > 0) {
  console.error(`\n${failures} banned claim(s) found. See specs/2026-08-marketing-funnel-addendum.md §3.`);
  process.exit(1);
}

console.log('✓ claims guard OK — no banned formulations in funnel copy');
