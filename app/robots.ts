/**
 * @fileoverview robots.txt dynamique.
 *
 * But
 *   Dire aux crawlers quoi indexer (espaces privés exclus).
 */
import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/administration", "/compte", "/entreprise", "/api/"],
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
