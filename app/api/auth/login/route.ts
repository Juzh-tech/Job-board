/**
 * @fileoverview POST /api/auth/login — connexion.
 *
 * But
 *   Vérifier email/mdp (bcrypt) → renvoyer un JWT + infos user.
 *   Rate-limit léger pour freiner le brute-force.
 */
import { NextRequest } from "next/server";
import {
  creerJeton,
  jsonErreur,
  verifierMotDePasse,
} from "@/lib/auth-serveur";
import { getDb, type RowDataPacket } from "@/lib/db";
import { personnePublique } from "@/lib/mappers";
import { verifierRateLimit } from "@/lib/rate-limit";
import type { RoleCompte } from "@/types/personne";

type CorpsLogin = {
  email?: string;
  motDePasse?: string;
  /** Honeypot anti-bot : doit rester vide. */
  siteWebEntreprise?: string;
};

type LignePersonne = RowDataPacket & {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone: string | null;
  role: RoleCompte;
  company_id: number | null;
  cv_filename: string | null;
};

/**
 * POST /api/auth/login
 * Corps : { email, motDePasse }
 * Réponse : { token, user } — le front stocke ça via lib/session.ts
 */
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const limite = verifierRateLimit(`login:${ip}`, { max: 30, fenetreMs: 15 * 60 * 1000 });
  if (!limite.ok) {
    return jsonErreur(
      `Trop de tentatives. Réessayez dans ${limite.retryAfterSec} s.`,
      429,
    );
  }

  let corps: CorpsLogin;
  try {
    corps = await req.json();
  } catch {
    return jsonErreur("JSON invalide", 400);
  }

  // Bot qui remplit le champ piège : réponse neutre sans indiquer le piège
  if (corps.siteWebEntreprise?.trim()) {
    return jsonErreur("Identifiants incorrects", 401);
  }

  const email = corps.email?.trim().toLowerCase() || "";
  const motDePasse = corps.motDePasse || "";

  if (!email || !motDePasse) {
    return jsonErreur("E-mail et mot de passe obligatoires", 400);
  }

  try {
    const db = getDb();
    // Pays / ville : compte personne, sinon ceux de l'entreprise liée
    const [rows] = await db.query<LignePersonne[]>(
      `SELECT
         p.*,
         COALESCE(NULLIF(p.country_code, ''), c.country_code, 'FR') AS country_code,
         COALESCE(NULLIF(p.city, ''), c.city, '') AS city
       FROM people p
       LEFT JOIN companies c ON c.id = p.company_id
       WHERE p.email = :email
       LIMIT 1`,
      { email },
    );

    if (rows.length === 0) {
      return jsonErreur("E-mail ou mot de passe incorrect", 401);
    }

    const ligne = rows[0];
    const ok = await verifierMotDePasse(motDePasse, ligne.password);
    if (!ok) {
      return jsonErreur("E-mail ou mot de passe incorrect", 401);
    }

    const user = personnePublique(ligne);
    const token = creerJeton({
      id: user.id,
      email: user.email,
      role: user.role,
      companyId: user.entrepriseId,
    });

    return Response.json({
      message: "Connexion réussie",
      token,
      user,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return jsonErreur(message, 500);
  }
}
