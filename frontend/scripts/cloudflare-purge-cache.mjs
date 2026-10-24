#!/usr/bin/env node
/**
 * Purge entire zone cache. Requires CLOUDFLARE_ZONE_ID + CLOUDFLARE_API_TOKEN in .env.
 * Usage: npm run cf:purge  —  or npm run cf:sync-zone first
 */
import { loadFrontendEnv } from "./cf-load-env.mjs";

loadFrontendEnv();

const token = process.env.CLOUDFLARE_API_TOKEN;
const zoneId = process.env.CLOUDFLARE_ZONE_ID;
if (!token || !zoneId) {
  console.error("Need CLOUDFLARE_API_TOKEN and CLOUDFLARE_ZONE_ID in .env.");
  process.exit(1);
}

const res = await fetch(
  `https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ purge_everything: true }),
  }
);

const body = await res.json().catch(() => ({}));
if (res.ok && body.success) {
  console.log("Purge OK:", JSON.stringify(body.result ?? {}, null, 2));
  process.exit(0);
}
console.error("Purge failed:", res.status, JSON.stringify(body, null, 2));
process.exit(1);
