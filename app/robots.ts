import type { MetadataRoute } from "next";
import { siteOrigin } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Private or transactional areas — nothing useful (or appropriate) to index.
        disallow: ["/dashboard", "/admin", "/auth/", "/login", "/signup", "/forgot-password", "/reset-password", "/certificates/"],
      },
    ],
    sitemap: `${siteOrigin()}/sitemap.xml`,
  };
}
