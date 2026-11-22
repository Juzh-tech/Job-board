/**
 * @fileoverview GET /api/admin/candidatures — vue globale.
 */
import { NextRequest } from "next/server";
import { exigerAdmin } from "@/lib/admin-auth";
import { jsonErreur } from "@/lib/auth-serveur";
import {
  candidatureDepuisLigne,
  SELECT_CANDIDATURE_DETAIL,
  type LigneCandidature,
} from "@/lib/candidatures-requetes";
import { getDb } from "@/lib/db";

/** GET /api/admin/candidatures — toutes les candidatures. */
export async function GET(req: NextRequest) {
  const gate = exigerAdmin(req);
  if ("error" in gate) {
    return gate.error;
  }

  try {
    const db = getDb();
    const [rows] = await db.query<LigneCandidature[]>(
      `${SELECT_CANDIDATURE_DETAIL}
       ORDER BY ap.applied_at DESC`,
    );
    return Response.json({
      candidatures: rows.map((ligne) => candidatureDepuisLigne(ligne)),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return jsonErreur(message, 500);
  }
}
