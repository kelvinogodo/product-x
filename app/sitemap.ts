import type { MetadataRoute } from "next";
import { siteOrigin } from "@/lib/site-config";
import { createPublicClient } from "@/lib/supabase/public";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = siteOrigin();
  const supabase = createPublicClient();

  const [{ data: courses }, { data: tracks }] = await Promise.all([
    supabase.from("courses").select("slug, updated_at").eq("published", true),
    supabase.from("tracks").select("slug, created_at"),
  ]);

  return [
    { url: origin, changeFrequency: "weekly", priority: 1 },
    { url: `${origin}/courses`, changeFrequency: "daily", priority: 0.9 },
    { url: `${origin}/tracks`, changeFrequency: "weekly", priority: 0.8 },
    ...(courses ?? []).map((c) => ({
      url: `${origin}/courses/${c.slug}`,
      lastModified: new Date(c.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...(tracks ?? []).map((t) => ({
      url: `${origin}/tracks/${t.slug}`,
      lastModified: new Date(t.created_at),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
