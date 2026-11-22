/**
 * @fileoverview Écran de connexion.
 *
 * But
 *   Formulaire → apiLogin → stocke le JWT → redirect selon le rôle.
 */
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CadreAuth } from "@/composants/mise-en-page/CadreAuth";
import { Bouton, ChampTexte } from "@/composants/ui";
import { apiLogin } from "@/lib/api";
import { useLocale } from "@/lib/i18n/contexte";
import type { CodePays } from "@/lib/pays";
import { PAGE_APRES_CONNEXION } from "@/lib/roles";
import { ecrireSession } from "@/lib/session";
import { validerEmail, validerMotDePasse } from "@/lib/validation";

/**
 * Connexion réelle via POST /api/auth/login.
 * Après succès : stocke le JWT localement et redirige selon le rôle
 * (admin → /administration, entreprise → /entreprise, candidat → /).
 */
export function EcranConnexion() {
  const router = useRouter();
  const { setCodePays, t } = useLocale();
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [piege, setPiege] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  async function soumettre(e: FormEvent) {
    e.preventDefault();
    setErreur(null);

    const errEmail = validerEmail(email);
    if (errEmail) {
      setErreur(errEmail);
      return;
    }
    const errMdp = validerMotDePasse(motDePasse, 6);
    if (errMdp) {
      setErreur(errMdp);
      return;
    }

    setEnCours(true);
    try {
      const reponse = await apiLogin(email.trim(), motDePasse, piege);
      ecrireSession({ token: reponse.token, user: reponse.user });
      // Applique le marché du compte (langue + offres du pays)
      if (reponse.user.pays) {
        setCodePays(reponse.user.pays as CodePays);
      }
      router.push(PAGE_APRES_CONNEXION[reponse.user.role]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Connexion impossible pour le moment.";
      setErreur(message);
    } finally {
      setEnCours(false);
    }
  }

  return (
    <CadreAuth titre={t("auth.connexion.titre")} description={t("auth.connexion.description")}>
      <form className="relative flex flex-col gap-4" onSubmit={(e) => void soumettre(e)}>
        {/* Honeypot anti-spam : invisible pour les humains */}
        <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
          <label htmlFor="siteWebEntreprise">Site web</label>
          <input
            id="siteWebEntreprise"
            name="siteWebEntreprise"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={piege}
            onChange={(e) => setPiege(e.target.value)}
          />
        </div>
        <ChampTexte
          libelle={t("auth.connexion.email")}
          nom="email"
          type="email"
          autoComplete="email"
          requis
          valeur={email}
          onChange={setEmail}
        />
        <ChampTexte
          libelle={t("auth.connexion.mdp")}
          nom="motDePasse"
          type="password"
          autoComplete="current-password"
          requis
          valeur={motDePasse}
          onChange={setMotDePasse}
        />
        {erreur ? (
          <p className="rounded-xl bg-refus/10 px-3 py-2 text-[14px] text-refus" role="alert">
            {erreur}
          </p>
        ) : null}
        <div className="pt-1">
          <Bouton type="submit" className="w-full" disabled={enCours}>
            {enCours ? t("common.chargement") : t("auth.connexion.submit")}
          </Bouton>
        </div>
      </form>
      <p className="text-[15px] text-muet">
        {t("auth.connexion.pasCompte")}{" "}
        <Link href="/inscription" className="font-semibold text-marque hover:underline">
          {t("nav.inscription")}
        </Link>
      </p>
      <p className="text-[12px] text-muet">
        <Link href="/cgu" className="underline hover:text-marque">
          {t("apropos.cgu")}
        </Link>
        {" · "}
        <Link href="/confidentialite" className="underline hover:text-marque">
          {t("apropos.confidentialite")}
        </Link>
      </p>
    </CadreAuth>
  );
}
