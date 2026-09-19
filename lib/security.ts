/**
 * Returns `next` only if it is a same-origin relative path. Blocks open-redirect payloads such as
 * `//evil.com`, `/\evil.com`, `https://evil.com`, and `javascript:` URLs.
 */
export function safeRedirectPath(next: unknown, fallback = "/dashboard"): string {
  if (typeof next !== "string") return fallback;
  if (!next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return fallback;
  // Reject control characters (header injection / parser differentials).
  if ([...next].some((ch) => ch.charCodeAt(0) < 32 || ch.charCodeAt(0) === 127)) return fallback;
  return next;
}

/**
 * Reduce free-text search input to characters that are safe to interpolate into a PostgREST
 * `or()` filter. Commas, parentheses, quotes, and LIKE wildcards (`%`, `_`) would otherwise let a
 * visitor inject extra filter clauses or wildcard scans.
 */
export function sanitizeSearch(value: string | undefined): string {
  if (!value) return "";
  return value
    .replace(/[^\p{L}\p{N}\s'.-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}
