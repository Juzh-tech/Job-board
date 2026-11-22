/**
 * @fileoverview GET /api/admin/entreprises — liste admin.
 *
 * SECURITY
 *   JWT role=admin obligatoire.
 */
import { NextRequest } from "next/server";
import { exigerAdmin } from "@/lib/admin-auth";
import { jsonErreur } from "@/lib/auth-serveur";
import { getDb, type RowDataPacket } from "@/lib/db";
import { entrepriseDepuisLigne } from "@/lib/mappers";

/** GET /api/admin/entreprises — toutes les boîtes (tous statuts). */
export async function GET(req: NextRequest) {
  const gate = exigerAdmin(req);
  if ("error" in gate) {
    return gate.error;
  }

  try {
    const db = getDb();
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT id, name, secteur, city, website, presentation,
              verification_status, motif_refus, contact_nom, contact_email, created_at
       FROM companies
       ORDER BY created_at DESC`,
    );
    return Response.json({
      entreprises: rows.map((ligne) => entrepriseDepuisLigne(ligne as never)),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return jsonErreur(message, 500);
  }
}
