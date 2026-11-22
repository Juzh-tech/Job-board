/**
 * @fileoverview sitemap.xml dynamique.
 *
 * But
 *   Liste les URLs publiques pour le SEO.
 */
import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE.url;
  const maintenant = new Date();
  const pages = [
    "",
    "/offres",
    "/connexion",
    "/inscription",
    "/mentions-legales",
    "/cgu",
    "/confidentialite",
    "/cookies",
  ];

  return pages.map((chemin) => ({
    url: `${base}${chemin || "/"}`,
    lastModified: maintenant,
    changeFrequency: chemin === "" || chemin === "/offres" ? "daily" : "monthly",
    priority: chemin === "" ? 1 : chemin === "/offres" ? 0.9 : 0.5,
  }));
}
