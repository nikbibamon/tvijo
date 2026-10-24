#!/usr/bin/env node
/**
 * Add a Cloudflare WAF "skip" rule for /_next/static/* paths.
 *
 * Root cause fix for ChunkLoadError / 400 on Next.js static assets:
 * Cloudflare's managed WAF rules (or Bot Fight Mode) inspect minified JS/CSS
 * chunk content and occasionally return 400 for patterns that look like SQLi/XSS.
 * Static build assets are content-hashed and immutable — there is zero risk in
 * skipping WAF inspection for them.
 *
 * This script prepends a skip rule to the zone's managed WAF ruleset entrypoint.
 * It is idempotent: running it twice will not duplicate the rule.
 *
 * Required token permissions: Zone:WAF (Edit) + Zone:Read
 * Usage: npm run cf:waf-skip
 */
import { loadFrontendEnv } from "./cf-load-env.mjs";

loadFrontendEnv();

const token = process.env.CLOUDFLARE_API_TOKEN;
const zoneId = process.env.CLOUDFLARE_ZONE_ID;

if (!token) {
  console.error("CLOUDFLARE_API_TOKEN missing. Set it in .env (see .env.example).");
  process.exit(1);
}
if (!zoneId) {
  console.error("CLOUDFLARE_ZONE_ID missing. Run `npm run cf:sync-zone` first.");
  process.exit(1);
}

const SKIP_EXPRESSION = '(http.request.uri.path starts with "/_next/static/")';
const SKIP_DESCRIPTION = "Skip WAF for Next.js static assets (/_next/static/*)";
const apiBase = "https://api.cloudflare.com/client/v4";
const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};

async function cfFetch(path, options = {}) {
  const res = await fetch(`${apiBase}${path}`, { ...options, headers: { ...headers, ...options.headers } });
  const body = await res.json().catch(() => ({}));
  return { res, body };
}

// 1. Get the managed WAF ruleset entrypoint
console.log("==> Fetching managed WAF ruleset entrypoint...");
const { res, body } = await cfFetch(
  `/zones/${zoneId}/rulesets/phases/http_request_firewall_managed/entrypoint`
);

if (!res.ok) {
  if (res.status === 404) {
    console.error(
      "No managed WAF ruleset entrypoint found for this zone.\n" +
        "Enable WAF (managed rules) in the Cloudflare dashboard first, then re-run."
    );
  } else {
    console.error("Failed to get WAF entrypoint:", res.status, JSON.stringify(body, null, 2));
    if (res.status === 403) {
      console.error("Hint: token needs Zone:WAF (Edit) permission for Rulesets API.");
    }
  }
  process.exit(1);
}

const ruleset = body.result;
if (!ruleset) {
  console.error("Unexpected response: no ruleset in result.", JSON.stringify(body, null, 2));
  process.exit(1);
}

console.log(`   Ruleset: ${ruleset.name} (${ruleset.id}), ${ruleset.rules?.length || 0} rules`);

// 2. Check if skip rule already exists
const existingSkip = (ruleset.rules || []).find(
  (r) => r.expression === SKIP_EXPRESSION && r.action === "skip"
);

if (existingSkip) {
  console.log("✅ WAF skip rule for /_next/static/* already exists (id:", existingSkip.id + ").");
  console.log("   No changes needed.");
  process.exit(0);
}

// 3. Prepend the skip rule to existing rules
const newRules = [
  {
    expression: SKIP_EXPRESSION,
    action: "skip",
    action_parameters: { ruleset: "current" },
    description: SKIP_DESCRIPTION,
  },
  ...(ruleset.rules || []).map((r) => ({
    id: r.id,
    expression: r.expression,
    action: r.action,
    action_parameters: r.action_parameters,
    description: r.description,
    enabled: r.enabled,
    last_updated: r.last_updated,
    version: r.version,
  })),
];

// 4. PUT the updated ruleset
console.log("==> Adding skip rule for /_next/static/*...");
const { res: putRes, body: putBody } = await cfFetch(
  `/zones/${zoneId}/rulesets/${ruleset.id}`,
  {
    method: "PUT",
    body: JSON.stringify({
      name: ruleset.name,
      kind: ruleset.kind,
      phase: ruleset.phase,
      rules: newRules,
    }),
  }
);

if (!putRes.ok || !putBody.success) {
  console.error("Failed to update WAF ruleset:", putRes.status, JSON.stringify(putBody, null, 2));
  process.exit(1);
}

const addedRule = putBody.result?.rules?.find(
  (r) => r.expression === SKIP_EXPRESSION && r.action === "skip"
);

console.log("✅ WAF skip rule added successfully!");
if (addedRule) {
  console.log(`   Rule ID: ${addedRule.id}`);
}
console.log(`   Expression: ${SKIP_EXPRESSION}`);
console.log(`   Action: skip (all managed WAF rules)`);
console.log("");
console.log("   Next.js static assets (/_next/static/*) will no longer be inspected by WAF.");
console.log("   This prevents 400 errors on content-hashed JS/CSS chunks.");
