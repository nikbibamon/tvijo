#!/usr/bin/env node
/**
 * Resolve zone id via Cloudflare API and write CLOUDFLARE_ZONE_ID to .env files.
 * Domain: CLOUDFLARE_ZONE_NAME (default tvijo.com).
 * Usage: npm run cf:sync-zone
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";
import { frontendRoot, loadFrontendEnv } from "./cf-load-env.mjs";

loadFrontendEnv();

const token = process.env.CLOUDFLARE_API_TOKEN;
const zoneName = (process.env.CLOUDFLARE_ZONE_NAME || "tvijo.com").trim().toLowerCase();

if (!token) {
  console.error("CLOUDFLARE_API_TOKEN missing in .env.");
  process.exit(1);
}

const q = new URLSearchParams({ name: zoneName, status: "active" });
const res = await fetch(`https://api.cloudflare.com/client/v4/zones?${q}`, {
  headers: { Authorization: `Bearer ${token}` },
});
const body = await res.json().catch(() => ({}));

if (!res.ok || !body.success) {
  console.error("List zones failed:", res.status, JSON.stringify(body, null, 2));
  const err0 = body.errors?.[0];
  if (err0?.code === 9109 || res.status === 403) {
    console.error(
      "Hint: token verify may still succeed while Zone API returns 403 until not_before on the token, or Zone:Read is missing."
    );
  }
  process.exit(1);
}

const zones = body.result || [];
const exact = zones.find((z) => (z.name || "").toLowerCase() === zoneName);
const zone = exact || zones[0];
if (!zone?.id) {
  console.error(`No zone found for "${zoneName}". Check token Zone:Read and domain.`);
  process.exit(1);
}

if (!exact && zones.length > 1) {
  console.warn(
    `Multiple zones matched name filter; using first: ${zone.name} (${zone.id}). Set CLOUDFLARE_ZONE_NAME if wrong.`
  );
}

const zoneId = zone.id;
console.log(`Zone: ${zone.name} → CLOUDFLARE_ZONE_ID=${zoneId}`);

function upsertEnvKey(content, key, value) {
  const line = `${key}=${value}`;
  const re = new RegExp(`^#?\\s*${key}=.*$`, "m");
  if (re.test(content)) {
    return content.replace(re, line);
  }
  const trimmed = content.replace(/\s+$/, "");
  return (trimmed ? `${trimmed}\n` : "") + `${line}\n`;
}

function patchEnvFile(filePath) {
  if (!existsSync(filePath)) {
    console.warn("Skip (missing):", filePath);
    return;
  }
  let text = readFileSync(filePath, "utf8");
  text = upsertEnvKey(text, "CLOUDFLARE_ZONE_ID", zoneId);
  writeFileSync(filePath, text, "utf8");
  console.log("Updated:", filePath);
}

const fe = path.join(frontendRoot(), ".env");
const be = path.resolve(frontendRoot(), "../bibamoney-backend/.env");

patchEnvFile(fe);
patchEnvFile(be);
