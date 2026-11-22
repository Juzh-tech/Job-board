/**
 * @fileoverview PATCH /api/profil — maj profil du compte connecté.
 *
 * But
 *   Infos perso / mdp / CV lié. JWT obligatoire.
 */
import { NextRequest } from "next/server";
import {
  hasherMotDePasse,
  jsonErreur,
  utilisateurDepuisRequete,
} from "@/lib/auth-serveur";
import { getDb, type ResultSetHeader, type RowDataPacket } from "@/lib/db";
import { personnePublique } from "@/lib/mappers";
import { paysParCode } from "@/lib/pays";
import { telephoneValidePourPays } from "@/lib/telephone";

/**
 * PATCH /api/profil
 * Dont pays / ville : change le « marché » (langue + offres) du candidat.
 */
export async function PATCH(req: NextRequest) {
  const user = utilisateurDepuisRequete(req);
  if (!user) {
    return jsonErreur("Connexion requise", 401);
  }

  let corps: {
    prenom?: string;
    nom?: string;
    telephone?: string;
    motDePasse?: string;
    cvNom?: string | null;
    pays?: string;
    ville?: string;
  };
  try {
    corps = await req.json();
  } catch {
    return jsonErreur("JSON invalide", 400);
  }

  const prenom = corps.prenom?.trim();
  const nom = corps.nom?.trim();
  const telephone = corps.telephone?.trim();
  const motDePasse = corps.motDePasse?.trim();
  const cvNom = corps.cvNom === undefined ? undefined : corps.cvNom?.trim() || null;
  const pays = corps.pays?.trim().toUpperCase();
  const ville = corps.ville?.trim();

  if (prenom !== undefined && !prenom) {
    return jsonErreur("Prénom invalide", 400);
  }
  if (nom !== undefined && !nom) {
    return jsonErreur("Nom invalide", 400);
  }
  if (pays !== undefined) {
    try {
      paysParCode(pays);
    } catch {
      return jsonErreur("Pays invalide", 400);
    }
  }

  try {
    const db = getDb();

    if (telephone !== undefined) {
      let codePaysTel = pays;
      if (!codePaysTel) {
        const [actuel] = await db.query<RowDataPacket[]>(
          "SELECT country_code FROM people WHERE id = :id LIMIT 1",
          { id: user.id },
        );
        codePaysTel = (actuel[0]?.country_code as string) || "FR";
      }
      if (!telephone || !telephoneValidePourPays(telephone, codePaysTel)) {
        return jsonErreur(
          `Numéro de téléphone invalide pour ${paysParCode(codePaysTel).nom}`,
          400,
        );
      }
    }

    const champs: string[] = [];
    const params: Record<string, string | number | null> = { id: user.id };

    if (prenom !== undefined) {
      champs.push("first_name = :prenom");
      params.prenom = prenom;
    }
    if (nom !== undefined) {
      champs.push("last_name = :nom");
      params.nom = nom;
    }
    if (telephone !== undefined) {
      champs.push("phone = :telephone");
      params.telephone = telephone;
    }
    if (cvNom !== undefined) {
      champs.push("cv_filename = :cvNom");
      params.cvNom = cvNom;
    }
    if (pays !== undefined) {
      champs.push("country_code = :pays");
      params.pays = pays;
    }
    if (ville !== undefined) {
      champs.push("city = :ville");
      params.ville = ville;
    }
    if (motDePasse) {
      if (motDePasse.length < 8) {
        return jsonErreur("Mot de passe trop court (8 caractères min.)", 400);
      }
      champs.push("password = :password");
      params.password = await hasherMotDePasse(motDePasse);
    }

    if (champs.length === 0) {
      return jsonErreur("Aucun champ à mettre à jour", 400);
    }

    await db.query<ResultSetHeader>(
      `UPDATE people SET ${champs.join(", ")} WHERE id = :id`,
      params,
    );

    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT id, first_name, last_name, email, phone, role, company_id, cv_filename,
              country_code, city
       FROM people WHERE id = :id LIMIT 1`,
      { id: user.id },
    );

    return Response.json({
      message: "Profil mis à jour",
      user: personnePublique(rows[0] as never),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return jsonErreur(message, 500);
  }
}
