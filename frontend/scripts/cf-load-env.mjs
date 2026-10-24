import { readFileSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

export function frontendRoot() {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
}

/** Load key=value from file into process.env when not already set. */
export function loadDotenvFile(file) {
  if (!existsSync(file)) return;
  const text = readFileSync(file, "utf8");
  for (const line of text.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq < 1) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env) || process.env[key] === "") {
      process.env[key] = val;
    }
  }
}

export function loadFrontendEnv() {
  // Frontend .env wins (loadDotenvFile only fills keys that aren't already set);
  // on the prod host the Cloudflare creds live in the sibling backend .env, so
  // load that as a fallback for CLOUDFLARE_* (and anything else missing).
  loadDotenvFile(path.join(frontendRoot(), ".env"));
  loadDotenvFile(path.join(frontendRoot(), "..", "bibamoney-backend", ".env"));
  if (process.env.CF_ENV_FILE) loadDotenvFile(process.env.CF_ENV_FILE);
}
