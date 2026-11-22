/**
 * @fileoverview GET /api/cv/[fichier] — téléchargement CV autorisé.
 *
 * SECURITY
 *   Pas de listing public : candidat proprio, entreprise concernée, ou admin.
 */
import { readFile } from "fs/promises";
import { NextRequest } from "next/server";
import {
  jsonErreur,
  utilisateurDepuisRequete,
} from "@/lib/auth-serveur";
import { cheminCv } from "@/lib/cv-stockage";
import { getDb, type RowDataPacket } from "@/lib/db";

/**
 * GET /api/cv/[fichier]
 * Candidat propriétaire, ou recruteur/admin sur une candidature liée.
 * Token : Authorization Bearer ou ?token=
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ fichier: string }> },
) {
  const { fichier: brut } = await params;
  const fichier = decodeURIComponent(brut || "").replace(/[/\\]/g, "");
  if (!fichier || !fichier.endsWith(".pdf") || fichier.includes("..")) {
    return jsonErreur("Fichier invalide", 400);
  }

  let user = utilisateurDepuisRequete(req);
  if (!user) {
    const token = req.nextUrl.searchParams.get("token");
    if (token) {
      try {
        const { lireJeton } = await import("@/lib/auth-serveur");
        user = lireJeton(token);
      } catch {
        user = null;
      }
    }
  }
  if (!user) {
    return jsonErreur("Connexion requise", 401);
  }

  try {
    const db = getDb();

    if (user.role === "candidat") {
      const [rows] = await db.query<RowDataPacket[]>(
        "SELECT id FROM people WHERE id = :id AND cv_filename = :f LIMIT 1",
        { id: user.id, f: fichier },
      );
      if (rows.length === 0) {
        return jsonErreur("Accès refusé", 403);
      }
    } else if (user.role === "entreprise") {
      const [rows] = await db.query<RowDataPacket[]>(
        `SELECT a.id
         FROM applications a
         JOIN advertisement ad ON ad.id = a.advertisement_id
         WHERE a.cv_filename = :f AND ad.company_id = :c
         LIMIT 1`,
        { f: fichier, c: user.companyId },
      );
      if (rows.length === 0) {
        return jsonErreur("Accès refusé", 403);
      }
    } else if (user.role !== "admin") {
      return jsonErreur("Accès refusé", 403);
    }

    const data = await readFile(cheminCv(fichier));
    return new Response(data, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${fichier}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return jsonErreur("CV introuvable", 404);
  }
}
