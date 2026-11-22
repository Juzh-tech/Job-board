/**
 * @fileoverview POST /api/auth/register — inscription candidat ou entreprise.
 *
 * But
 *   Créer people (+ companies si entreprise en_attente). Mdp hashé avant INSERT.
 */
import { NextRequest } from "next/server";
import {
  creerJeton,
  hasherMotDePasse,
  jsonErreur,
} from "@/lib/auth-serveur";
import { getDb, type ResultSetHeader, type RowDataPacket } from "@/lib/db";
import { personnePublique } from "@/lib/mappers";
import { paysParCode, validerIdentifiantEntreprise, type CodePays } from "@/lib/pays";
import { verifierRateLimit } from "@/lib/rate-limit";
import { telephoneValidePourPays } from "@/lib/telephone";
import { validerEmailServeur } from "@/lib/validation";
import type { RoleCompte } from "@/types/personne";

type CorpsRegister = {
  prenom?: string;
  nom?: string;
  email?: string;
  motDePasse?: string;
  telephone?: string;
  pays?: string;
  ville?: string;
  role?: RoleCompte;
  entreprise?: {
    nom?: string;
    secteur?: string;
    ville?: string;
    pays?: string;
    identifiantLocal?: string;
    siteWeb?: string;
    presentation?: string;
  };
};

/**
 * POST /api/auth/register
 * - candidat : people (+ pays/ville/téléphone obligatoires)
 * - entreprise : companies en_attente + people (secteur/pays/ville/tél. obligatoires)
 */
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const limite = verifierRateLimit(`register:${ip}`, { max: 15, fenetreMs: 15 * 60 * 1000 });
  if (!limite.ok) {
    return jsonErreur(
      `Trop d’inscriptions depuis cette adresse. Réessayez dans ${limite.retryAfterSec} s.`,
      429,
    );
  }

  let corps: CorpsRegister;
  try {
    corps = await req.json();
  } catch {
    return jsonErreur("JSON invalide", 400);
  }

  const prenom = corps.prenom?.trim() || "";
  const nom = corps.nom?.trim() || "";
  const email = corps.email?.trim().toLowerCase() || "";
  const motDePasse = corps.motDePasse || "";
  const telephone = corps.telephone?.trim() || "";
  const role = corps.role === "entreprise" ? "entreprise" : "candidat";

  if (!prenom || !nom || !email || !motDePasse) {
    return jsonErreur("Champs obligatoires manquants", 400);
  }
  if (!validerEmailServeur(email)) {
    return jsonErreur("Adresse e-mail invalide (ex. prenom@domaine.fr)", 400);
  }
  if (motDePasse.length < 8) {
    return jsonErreur("Mot de passe trop court (8 caractères minimum)", 400);
  }

  const db = getDb();

  try {
    const [existants] = await db.query<RowDataPacket[]>(
      "SELECT id FROM people WHERE email = :email",
      { email },
    );
    if (existants.length > 0) {
      return jsonErreur("Cet e-mail est déjà utilisé", 409);
    }

    let companyId: number | null = null;
    let countryCode: string | null = null;
    let city = "";

    if (role === "entreprise") {
      const nomEntreprise = corps.entreprise?.nom?.trim() || "";
      const secteur = corps.entreprise?.secteur?.trim() || "";
      const ville = corps.entreprise?.ville?.trim() || "";
      const pays = (corps.entreprise?.pays?.trim() || "FR") as CodePays;
      const identifiantLocal = corps.entreprise?.identifiantLocal?.trim() || "";

      if (!nomEntreprise || !secteur || !ville || !pays) {
        return jsonErreur(
          "Nom, secteur, pays et ville de l'entreprise sont obligatoires",
          400,
        );
      }
      const errId = validerIdentifiantEntreprise(pays, identifiantLocal);
      if (errId) {
        return jsonErreur(errId, 400);
      }

      const [resultEntreprise] = await db.query<ResultSetHeader>(
        `INSERT INTO companies
          (name, secteur, city, country_code, website, company_reg_id, presentation,
           verification_status, contact_nom, contact_email)
         VALUES
          (:name, :secteur, :city, :country, :website, :regId, :presentation,
           'en_attente', :contactNom, :contactEmail)`,
        {
          name: nomEntreprise,
          secteur,
          city: ville,
          country: pays,
          website: corps.entreprise?.siteWeb?.trim() || "",
          regId: identifiantLocal,
          presentation: corps.entreprise?.presentation?.trim() || "",
          contactNom: `${prenom} ${nom}`.trim(),
          contactEmail: email,
        },
      );
      companyId = resultEntreprise.insertId;
      countryCode = pays;
      city = ville;
    } else {
      countryCode = (corps.pays?.trim() || "FR") as CodePays;
      city = corps.ville?.trim() || "";
      if (!city) {
        return jsonErreur("La ville est obligatoire", 400);
      }
    }

    if (!telephone || !telephoneValidePourPays(telephone, countryCode)) {
      return jsonErreur(
        `Numéro de téléphone obligatoire et valide pour ${paysParCode(countryCode).nom}`,
        400,
      );
    }

    const hash = await hasherMotDePasse(motDePasse);
    const [result] = await db.query<ResultSetHeader>(
      `INSERT INTO people
        (first_name, last_name, email, password, phone, country_code, city, role, company_id)
       VALUES
        (:prenom, :nom, :email, :password, :telephone, :country, :city, :role, :companyId)`,
      {
        prenom,
        nom,
        email,
        password: hash,
        telephone,
        country: countryCode,
        city,
        role,
        companyId,
      },
    );

    const user = personnePublique({
      id: result.insertId,
      first_name: prenom,
      last_name: nom,
      email,
      phone: telephone,
      role,
      company_id: companyId,
      cv_filename: null,
      country_code: countryCode,
      city,
    });

    const token = creerJeton({
      id: user.id,
      email: user.email,
      role: user.role,
      companyId: user.entrepriseId,
    });

    return Response.json(
      {
        message:
          role === "entreprise"
            ? "Demande envoyée — validation admin requise avant l'espace recruteur."
            : "Compte créé",
        token,
        user,
      },
      { status: 201 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return jsonErreur(message, 500);
  }
}
