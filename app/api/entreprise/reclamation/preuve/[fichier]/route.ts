/**
 * @fileoverview GET preuve de réclamation (admin ou entreprise propriétaire).
 */
import { readFile } from "fs/promises";
import { NextRequest } from "next/server";
import {
  jsonErreur,
  lireJeton,
  utilisateurDepuisRequete,
} from "@/lib/auth-serveur";
import {
  cheminPreuve,
  typeMimePreuve,
} from "@/lib/preuve-reclamation-stockage";

/**
 * GET /api/entreprise/reclamation/preuve/[fichier]
 * Token : Authorization Bearer ou ?token=
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ fichier: string }> },
) {
  const { fichier: brut } = await params;
  const fichier = decodeURIComponent(brut || "").replace(/[/\\]/g, "");
  if (!fichier || fichier.includes("..") || !/\.(pdf|png|jpe?g|webp)$/i.test(fichier)) {
    return jsonErreur("Fichier invalide", 400);
  }

  let user = utilisateurDepuisRequete(req);
  if (!user) {
    const token = req.nextUrl.searchParams.get("token");
    if (token) {
      try {
        user = lireJeton(token);
      } catch {
        user = null;
      }
    }
  }
  if (!user) {
    return jsonErreur("Connexion requise", 401);
  }

  if (user.role === "entreprise") {
    if (!user.companyId || !fichier.startsWith(`${user.companyId}-`)) {
      return jsonErreur("Accès refusé", 403);
    }
  } else if (user.role !== "admin") {
    return jsonErreur("Accès refusé", 403);
  }

  try {
    const data = await readFile(cheminPreuve(fichier));
    const mime = typeMimePreuve(fichier);
    return new Response(data, {
      headers: {
        "Content-Type": mime,
        "Content-Disposition": `inline; filename="${fichier}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return jsonErreur("Preuve introuvable", 404);
  }
}
