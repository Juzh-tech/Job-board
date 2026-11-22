/**
 * @fileoverview GET logo entreprise (fichier image).
 */
import { readFile } from "fs/promises";
import path from "path";
import { NextRequest } from "next/server";
import { jsonErreur } from "@/lib/auth-serveur";

const DOSSIER = path.join(process.cwd(), "uploads", "logos");

/** GET /api/entreprise/logo/[fichier] — logo public (affiché sur les offres). */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ fichier: string }> },
) {
  const brut = decodeURIComponent((await params).fichier || "").replace(/[/\\]/g, "");
  if (!brut || brut.includes("..")) {
    return jsonErreur("Fichier invalide", 400);
  }

  try {
    const data = await readFile(path.join(DOSSIER, brut));
    const ext = brut.split(".").pop()?.toLowerCase();
    const type =
      ext === "png"
        ? "image/png"
        : ext === "webp"
          ? "image/webp"
          : ext === "gif"
            ? "image/gif"
            : "image/jpeg";
    return new Response(data, {
      headers: {
        "Content-Type": type,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return jsonErreur("Logo introuvable", 404);
  }
}
