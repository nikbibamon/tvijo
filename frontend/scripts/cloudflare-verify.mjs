#!/usr/bin/env node
/**
 * Load .env from repo root and GET Cloudflare token verify (account or user URL).
 * Usage: npm run cf:verify
 */
import { loadFrontendEnv } from "./cf-load-env.mjs";

loadFrontendEnv();

const token = process.env.CLOUDFLARE_API_TOKEN;
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
if (!token) {
  console.error("CLOUDFLARE_API_TOKEN missing. Set it in .env (see .env.example).");
  process.exit(1);
}

const verifyUrl = accountId?.trim()
  ? `https://api.cloudflare.com/client/v4/accounts/${accountId.trim()}/tokens/verify`
  : "https://api.cloudflare.com/client/v4/user/tokens/verify";

const res = await fetch(verifyUrl, {
  headers: { Authorization: `Bearer ${token}` },
});

const body = await res.json().catch(() => ({}));
if (res.ok && body.success) {
  console.log("Cloudflare token OK:", JSON.stringify(body.result ?? {}, null, 2));
  const msgs = body.messages;
  if (Array.isArray(msgs) && msgs.length) {
    console.warn("Notices:", JSON.stringify(msgs, null, 2));
  }
  process.exit(0);
}
console.error("Verify failed:", res.status, JSON.stringify(body, null, 2));
process.exit(1);
