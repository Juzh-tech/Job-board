/**
 * @fileoverview GET /api/admin/offres — toutes les offres.
 */
import { NextRequest } from "next/server";
import { exigerAdmin } from "@/lib/admin-auth";
import { jsonErreur } from "@/lib/auth-serveur";
import { getDb, type RowDataPacket } from "@/lib/db";
import { offreDepuisLigne } from "@/lib/mappers";

/** GET /api/admin/offres — toutes les annonces (tous statuts). */
export async function GET(req: NextRequest) {
  const gate = exigerAdmin(req);
  if ("error" in gate) {
    return gate.error;
  }

  try {
    const db = getDb();
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT
         a.id, a.title, a.short_description, a.full_description,
         a.salary, a.location, a.working_time, a.contract_type, a.published_at,
         c.id AS company_id, c.name AS company_name, c.secteur AS company_secteur,
         c.city AS company_city, c.presentation AS company_presentation
       FROM advertisement a
       JOIN companies c ON c.id = a.company_id
       ORDER BY a.published_at DESC`,
    );
    return Response.json({
      offres: rows.map((ligne) => offreDepuisLigne(ligne as never)),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return jsonErreur(message, 500);
  }
}
