const YOUTUBE_HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "youtube-nocookie.com", "www.youtube-nocookie.com"]);
const VIMEO_HOSTS = new Set(["vimeo.com", "www.vimeo.com", "player.vimeo.com"]);

/**
 * Converts a YouTube/Vimeo link into a privacy-friendly embed URL. Anything else returns null, so
 * an admin can never make the lesson viewer frame an arbitrary site.
 */
export function toEmbedUrl(input: string | null | undefined): string | null {
  if (!input) return null;
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;

  if (url.hostname === "youtu.be") {
    const id = url.pathname.slice(1);
    return /^[\w-]{6,20}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  }

  if (YOUTUBE_HOSTS.has(url.hostname)) {
    const embed = url.pathname.match(/^\/embed\/([\w-]{6,20})$/);
    const id = embed?.[1] ?? (url.pathname === "/watch" ? url.searchParams.get("v") : null);
    return id && /^[\w-]{6,20}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  }

  if (VIMEO_HOSTS.has(url.hostname)) {
    const id = url.pathname.match(/(\d{5,12})$/)?.[1];
    return id ? `https://player.vimeo.com/video/${id}` : null;
  }

  return null;
}

export function isSupportedVideoUrl(input: string): boolean {
  return toEmbedUrl(input) !== null;
}
