/**
 * Image URLs must come from an origin the app is configured to render (next.config.js images +
 * the CSP img-src): this project's Supabase Storage, or Unsplash. Anything else would either throw
 * inside next/image or be blocked by the CSP, so we reject it when it's saved.
 */
export function isAllowedImageUrl(value: string | null | undefined): boolean {
  if (!value) return false;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return false;
    if (url.hostname === "images.unsplash.com") return true;

    const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!base) return false;
    return url.hostname === new URL(base).hostname && url.pathname.startsWith("/storage/v1/object/public/");
  } catch {
    return false;
  }
}

export const IMAGE_URL_MESSAGE = "Use the Upload button, or an image link from this project's storage or images.unsplash.com.";
