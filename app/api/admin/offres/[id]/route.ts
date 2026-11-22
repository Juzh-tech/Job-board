/**
 * @fileoverview DELETE /api/admin/offres/[id].
 */
import { NextRequest } from "next/server";
import { exigerAdmin } from "@/lib/admin-auth";
import { jsonErreur } from "@/lib/auth-serveur";
import { getDb, type ResultSetHeader, type RowDataPacket } from "@/lib/db";

/** DELETE /api/admin/offres/:id */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const gate = exigerAdmin(req);
  if ("error" in gate) {
    return gate.error;
  }

  const { id: idBrut } = await context.params;
  const id = Number(idBrut);
  if (!Number.isFinite(id)) {
    return jsonErreur("Identifiant invalide", 400);
  }

  try {
    const db = getDb();
    const [exist] = await db.query<RowDataPacket[]>(
      "SELECT id FROM advertisement WHERE id = :id LIMIT 1",
      { id },
    );
    if (exist.length === 0) {
      return jsonErreur("Offre introuvable", 404);
    }
    await db.query<ResultSetHeader>("DELETE FROM advertisement WHERE id = :id", { id });
    return Response.json({ message: "Offre supprimée" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return jsonErreur(message, 500);
  }
}
