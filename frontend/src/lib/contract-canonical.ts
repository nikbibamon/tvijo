/**
 * Canonical JSON and contract hash — the browser half of a two-language rule.
 *
 * `apps/contracts/hash.py` and `ai_os/contracts/hash.py` compute
 * `sha256(canonical(payload))`, and the golden vector
 * `13b4f34c280ec2a804122f24b92d190b4682fb4878211bcb42fc501f383b9901`
 * pins it. The builder shows the hash before freezing, so this must agree
 * byte-for-byte with Python or the preview lies about what will be stored.
 *
 * Where JS and Python could drift, and what is done about it:
 *
 * - **Numbers.** `json.dumps(3.0)` is `"3.0"` in Python but `JSON.stringify(3)`
 *   is `"3"` — the same value, two different bytes, two different hashes. The
 *   frozen schema avoids this by requiring whole money as an int and
 *   fractional money as a string (10_START_ARTIFACTS.md), so a float should
 *   never appear. `canonicalize` enforces that rather than trusting it: a
 *   non-integer number throws instead of silently producing a hash the
 *   backend will not reproduce.
 * - **Key order.** Python sorts by Unicode code point. JavaScript's default
 *   sort compares UTF-16 code units, which differs only for characters above
 *   U+FFFF. Contract keys are ASCII identifiers from a fixed schema, so the
 *   two orders coincide; a key outside that range would need a code-point
 *   comparator.
 * - **String escaping.** `json.dumps(..., ensure_ascii=False)` and
 *   `JSON.stringify` both emit literal non-ASCII and escape the same control
 *   characters, so a Cyrillic goal hashes identically on both sides.
 */

export class CanonicalizationError extends Error {}

/** Serialize exactly as `apps/contracts/hash.py: canonical()` does. */
export function canonicalize(value: unknown): string {
  if (value === null) return 'null';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw new CanonicalizationError(`non-finite number: ${value}`);
    }
    if (!Number.isInteger(value)) {
      throw new CanonicalizationError(
        `non-integer number ${value}: fractional values must be strings so the `
        + 'hash matches Python',
      );
    }
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(canonicalize).join(',')}]`;
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    entries.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
    const body = entries
      .map(([key, item]) => `${JSON.stringify(key)}:${canonicalize(item)}`)
      .join(',');
    return `{${body}}`;
  }
  throw new CanonicalizationError(`non-canonical type ${typeof value}`);
}

/** `sha256(canonical(payload))` as lowercase hex, matching both backends. */
export async function contractHash(payload: unknown): Promise<string> {
  const bytes = new TextEncoder().encode(canonicalize(payload));
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Money for the frozen schema: an int when whole, a decimal string otherwise.
 *
 * This is the rule that keeps `3` and `3.0` from hashing differently. It is
 * here rather than inline in the form because getting it wrong is invisible
 * until a hash mismatch, which is the worst place to discover it.
 */
export function normalizeMoney(raw: string): number | string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (!/^\d+(\.\d+)?$/.test(trimmed)) return null;
  const asNumber = Number(trimmed);
  if (!Number.isFinite(asNumber) || asNumber <= 0) return null;
  if (Number.isInteger(asNumber)) return asNumber;
  // Keep the digits the user typed; re-formatting could change the hash.
  return trimmed;
}

/** Positive integers for token/minute/step budgets; null when unusable. */
export function normalizeCount(raw: string): number | null {
  const trimmed = raw.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const value = Number(trimmed);
  return Number.isSafeInteger(value) && value > 0 ? value : null;
}
