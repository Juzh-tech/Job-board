/**
 * @fileoverview Auth côté serveur uniquement (bcrypt + JWT).
 *
 * SECURITY
 *   Ne JAMAIS importer ce module dans un composant client : il lit JWT_SECRET.
 *
 * But
 *   Hasher les mdp, signer / vérifier les tokens, extraire l'user d'une requête.
 */
import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import { NextRequest } from "next/server";
import type { RoleCompte } from "@/types/personne";

/** Contenu du JWT : assez pour savoir qui agit, sans recharger la BDD à chaque fois. */
export type JetonPayload = {
  id: number;
  email: string;
  role: RoleCompte;
  companyId: number | null;
};

function secretJwt(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET manquant dans .env.local");
  }
  return secret;
}

/** Hash bcrypt avant INSERT dans people.password. */
export async function hasherMotDePasse(motDePasse: string): Promise<string> {
  return bcrypt.hash(motDePasse, 10);
}

/** Compare un mot de passe saisi au hash stocké. */
export async function verifierMotDePasse(
  motDePasse: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(motDePasse, hash);
}

/** Crée un JWT signé (durée via JWT_EXPIRES_IN, défaut 24h). */
export function creerJeton(payload: JetonPayload): string {
  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN || "24h") as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, secretJwt(), options);
}

export function lireJeton(token: string): JetonPayload {
  return jwt.verify(token, secretJwt()) as JetonPayload;
}

/**
 * Extrait l'utilisateur depuis Authorization: Bearer <token>.
 * Retourne null si absent ou invalide (la route décide ensuite du 401).
 */
export function utilisateurDepuisRequete(req: NextRequest): JetonPayload | null {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) {
    return null;
  }
  try {
    return lireJeton(header.slice(7));
  } catch {
    return null;
  }
}

/** Réponse JSON d'erreur homogène pour toutes les routes API. */
export function jsonErreur(message: string, status: number) {
  return Response.json({ error: message }, { status });
}
