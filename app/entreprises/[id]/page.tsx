/**
 * @fileoverview Route /entreprises/[id] — fiche publique.
 *
 * But
 *   Wrapper page → EcranFicheEntreprise.
 */
/**
 * Adresse : /entreprises/[id]
 * Fiche publique d'une entreprise (données MySQL, boîte validée uniquement).
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EcranFicheEntreprise } from "@/ecrans/fiche-entreprise/EcranFicheEntreprise";
import { getDb, type RowDataPacket } from "@/lib/db";
import { offreDepuisLigne } from "@/lib/mappers";
import { SITE } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id: idBrut } = await params;
  const id = Number(idBrut);
  if (!Number.isFinite(id)) {
    return { title: "Entreprise" };
  }
  try {
    const db = getDb();
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT name, secteur, city FROM companies
       WHERE id = :id AND verification_status = 'validee' LIMIT 1`,
      { id },
    );
    if (rows.length === 0) {
      return { title: "Entreprise" };
    }
    const nom = String(rows[0].name);
    return {
      title: nom,
      description: `${nom} — ${rows[0].secteur || "Entreprise"} à ${rows[0].city || "—"}. Consultez les offres sur ${SITE.nom}.`,
    };
  } catch {
    return { title: "Entreprise" };
  }
}

export default async function PageFicheEntreprise({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idBrut } = await params;
  const id = Number(idBrut);
  if (!Number.isFinite(id)) {
    notFound();
  }

  try {
    const db = getDb();
    const [companies] = await db.query<RowDataPacket[]>(
      `SELECT id, name, secteur, city, website, presentation, logo_filename
       FROM companies
       WHERE id = :id AND verification_status = 'validee'
       LIMIT 1`,
      { id },
    );
    if (companies.length === 0) {
      notFound();
    }
    const c = companies[0];
    const logo = c.logo_filename ? String(c.logo_filename) : "";

    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT
         a.id, a.title, a.short_description, a.full_description,
         a.salary, a.location, a.working_time, a.contract_type, a.published_at,
         a.is_active,
         c.id AS company_id, c.name AS company_name, c.secteur AS company_secteur,
         c.city AS company_city, c.presentation AS company_presentation,
         c.logo_filename AS company_logo
       FROM advertisement a
       JOIN companies c ON c.id = a.company_id
       WHERE a.company_id = :id
         AND a.status = 'published'
         AND a.is_active = TRUE
       ORDER BY a.published_at DESC`,
      { id },
    );

    return (
      <EcranFicheEntreprise
        entreprise={{
          id: Number(c.id),
          nom: String(c.name),
          secteur: String(c.secteur || ""),
          ville: String(c.city || ""),
          presentation: String(c.presentation || ""),
          siteWeb: String(c.website || ""),
          logoUrl: logo ? `/api/entreprise/logo/${encodeURIComponent(logo)}` : null,
        }}
        offres={rows.map((ligne) => offreDepuisLigne(ligne as never))}
      />
    );
  } catch {
    notFound();
  }
}
