/**
 * @fileoverview Formulaire "Postuler" (sans popup).
 *
 * But
 *   Préremplit via session / CV profil, envoie POST /api/candidatures.
 */
"use client";

/**
 * Formulaire « Postuler ».
 * - Préremplit prénom / nom / e-mail / tél / CV depuis la session
 * - Envoie POST /api/candidatures avec le JWT
 * - Redirige vers /connexion si pas de session candidat
 */
import { FormEvent, useMemo, useState } from "react";
import { Bouton } from "@/composants/ui/Bouton";
import { ChampFichier } from "@/composants/ui/ChampFichier";
import { ChampTelephone } from "@/composants/ui/ChampTelephone";
import { ChampTexte } from "@/composants/ui/ChampTexte";
import { ChampZoneTexte } from "@/composants/ui/ChampZoneTexte";
import { apiPostuler, apiUploadCv } from "@/lib/api";
import type { CodePays } from "@/lib/pays";
import { formaterTelephoneNational } from "@/lib/telephone";
import { ecrireSession, lireSession } from "@/lib/session";
import { validerTelephone } from "@/lib/validation";
import type { Offre } from "@/types/offre";

type ProprietesFormulaireCandidature = {
  offre: Offre;
  onRetour: () => void;
  onRetourListe?: () => void;
  depuisListe?: boolean;
  onEnvoye: () => void;
};

export function FormulaireCandidature({
  offre,
  onRetour,
  onRetourListe,
  depuisListe = false,
  onEnvoye,
}: ProprietesFormulaireCandidature) {
  const session = useMemo(() => lireSession(), []);
  const user = session?.user ?? null;
  const codePays = ((user?.pays as CodePays) || "FR") as CodePays;

  const [prenom, setPrenom] = useState(user?.prenom ?? "");
  const [nom, setNom] = useState(user?.nom ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [telephone, setTelephone] = useState(() =>
    formaterTelephoneNational(user?.telephone ?? "", codePays),
  );
  const [message, setMessage] = useState("");
  const [fichier, setFichier] = useState<File | null>(null);
  const [erreur, setErreur] = useState("");
  const [enCours, setEnCours] = useState(false);

  const cvDejaEnregistre = Boolean(user?.cvNom) && !fichier;
  const cvPresent = cvDejaEnregistre || fichier !== null;

  async function envoyer(e: FormEvent) {
    e.preventDefault();
    const courante = lireSession();
    if (!courante || courante.user.role !== "candidat") {
      window.location.href = "/connexion";
      return;
    }
    if (!cvPresent) {
      setErreur("Un CV au format PDF est obligatoire.");
      return;
    }
    const errTel = validerTelephone(telephone, true, codePays);
    if (errTel) {
      setErreur(errTel);
      return;
    }
    setErreur("");
    setEnCours(true);
    try {
      let cvFilename = courante.user.cvNom || "";
      if (fichier) {
        const up = await apiUploadCv(courante.token, fichier);
        cvFilename = up.filename;
        ecrireSession({
          token: courante.token,
          user: { ...courante.user, cvNom: up.filename },
        });
      }
      if (!cvFilename) {
        setErreur("Un CV au format PDF est obligatoire.");
        setEnCours(false);
        return;
      }
      await apiPostuler(courante.token, {
        offreId: offre.id,
        message,
        cvFilename,
      });
      onEnvoye();
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Envoi impossible.");
    } finally {
      setEnCours(false);
    }
  }

  return (
    <form className="flex flex-col gap-4 bg-surface px-5 py-4" onSubmit={envoyer}>
      <header>
        {depuisListe && onRetourListe ? (
          <button
            type="button"
            onClick={onRetourListe}
            className="block text-[13px] font-semibold text-lien lg:hidden"
          >
            ← Offres
          </button>
        ) : null}
        <button
          type="button"
          onClick={onRetour}
          className={`text-[13px] font-semibold text-lien hover:underline ${
            depuisListe ? "hidden lg:inline" : "inline"
          }`}
        >
          ← Retour à l&apos;offre
        </button>
        <h2 className="mt-2 text-xl font-bold">Postuler</h2>
        <p className="text-[14px] text-muet">{offre.titre}</p>
      </header>

      <div className="rounded-md border border-ligne bg-fond px-3 py-3">
        {cvDejaEnregistre ? (
          <p className="mb-2 text-[14px]">
            CV repris de votre profil : <strong>{user?.cvNom}</strong>
          </p>
        ) : (
          <p className="mb-2 text-[13px] text-muet">
            Candidature avec CV — le fichier est obligatoire.
          </p>
        )}
        <ChampFichier
          libelle={cvDejaEnregistre ? "Remplacer le CV" : "Votre CV (PDF)"}
          nom="cv"
          fichier={fichier}
          onChange={setFichier}
          aide={
            cvDejaEnregistre
              ? "Le CV du compte sera enregistré sous ce nom si vous n'en choisissez pas un autre."
              : undefined
          }
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <ChampTexte libelle="Prénom" nom="prenom" valeur={prenom} onChange={setPrenom} requis />
        <ChampTexte libelle="Nom" nom="nom" valeur={nom} onChange={setNom} requis />
        <ChampTexte
          libelle="E-mail"
          nom="email"
          type="email"
          valeur={email}
          onChange={setEmail}
          requis
        />
        <ChampTelephone
          libelle="Téléphone"
          nom="telephone"
          codePays={codePays}
          valeur={telephone}
          onChange={setTelephone}
          requis
        />
      </div>
      <ChampZoneTexte
        libelle="Message au recruteur"
        nom="message"
        valeur={message}
        onChange={setMessage}
        placeholder="Quelques lignes pour le responsable de l'offre."
        lignes={4}
      />

      {erreur ? <p className="text-[14px] text-refus">{erreur}</p> : null}

      <Bouton type="submit" variante="action" disabled={enCours}>
        {enCours ? "Envoi…" : "Envoyer ma candidature"}
      </Bouton>
    </form>
  );
}
