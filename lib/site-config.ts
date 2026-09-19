/**
 * Canonical site origin for places that have no request context (sitemap, robots, metadataBase).
 * Set NEXT_PUBLIC_SITE_URL in production (e.g. https://yourapp.com).
 */
export function siteOrigin(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return "http://localhost:3000";
}
