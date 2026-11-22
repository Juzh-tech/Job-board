/**
 * @fileoverview GET /api/admin/comptes — tous les people.
 */
import { NextRequest } from "next/server";
import { exigerAdmin } from "@/lib/admin-auth";
import { jsonErreur } from "@/lib/auth-serveur";
import { getDb, type RowDataPacket } from "@/lib/db";
import type { RoleCompte } from "@/types/personne";

export type CompteAdmin = {
  id: number;
  prenom: string;
  nom: string;
  email: string;
  role: RoleCompte;
  entrepriseId: number | null;
};

/** GET /api/admin/comptes — tous les comptes people. */
export async function GET(req: NextRequest) {
  const gate = exigerAdmin(req);
  if ("error" in gate) {
    return gate.error;
  }

  try {
    const db = getDb();
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT id, first_name, last_name, email, role, company_id
       FROM people
       ORDER BY created_at DESC`,
    );
    const comptes: CompteAdmin[] = rows.map((r) => ({
      id: Number(r.id),
      prenom: String(r.first_name),
      nom: String(r.last_name),
      email: String(r.email),
      role: r.role as RoleCompte,
      entrepriseId: r.company_id == null ? null : Number(r.company_id),
    }));
    return Response.json({ comptes });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return jsonErreur(message, 500);
  }
}
