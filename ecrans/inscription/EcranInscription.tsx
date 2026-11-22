/**
 * @fileoverview Écran d'inscription (candidat ou entreprise, multi-étapes).
 *
 * But
 *   Collecte les infos, valide téléphone / ID entreprise selon pays, appelle register.
 */
"use client";

/**
 * Inscription multi-étapes avec validations strictes.
 * Entreprise : nom, pays, ville, secteur (+ identifiant local) obligatoires.
 */
import { useMemo, useState } from "react";
import Link from "next/link";
import { CadreAuth } from "@/composants/mise-en-page/CadreAuth";
import {
  Bouton,
  ChampFichier,
  ChampSelectRecherche,
  ChampTelephone,
  ChampTexte,
  ChampZoneTexte,
} from "@/composants/ui";
import { apiRegisterCandidat, apiRegisterEntreprise, apiUploadCv } from "@/lib/api";
import { useLocale } from "@/lib/i18n/contexte";
import { LISTE_PAYS, paysParCode, validerIdentifiantEntreprise, type CodePays } from "@/lib/pays";
import { filtrerSecteurs, SECTEURS, secteurParId } from "@/lib/secteurs";
import { ecrireSession } from "@/lib/session";
import type { RoleCompte } from "@/types/compte";
import {
  validerChampObligatoire,
  validerEmail,
  validerMotDePasse,
  validerTelephone,
} from "@/lib/validation";

type TypeInscription = Extract<RoleCompte, "candidat" | "entreprise">;

type DonneesCandidat = {
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  pays: CodePays;
  ville: string;
  motDePasse: string;
};

type DonneesEntreprise = {
  nomEntreprise: string;
  secteurId: string;
  pays: CodePays;
  ville: string;
  identifiantLocal: string;
  siteWeb: string;
  presentation: string;
  contactPrenom: string;
  contactNom: string;
  telephone: string;
  email: string;
  motDePasse: string;
};

export function EcranInscription() {
  const { codePays, setCodePays, t } = useLocale();
  const [type, setType] = useState<TypeInscription | null>(null);
  const [etape, setEtape] = useState(1);
  const [cv, setCv] = useState<File | null>(null);
  const [candidat, setCandidat] = useState<DonneesCandidat>(() => ({
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    pays: codePays,
    ville: "",
    motDePasse: "",
  }));
  const [entreprise, setEntreprise] = useState<DonneesEntreprise>(() => ({
    nomEntreprise: "",
    secteurId: "",
    pays: codePays,
    ville: "",
    identifiantLocal: "",
    siteWeb: "",
    presentation: "",
    contactPrenom: "",
    contactNom: "",
    telephone: "",
    email: "",
    motDePasse: "",
  }));
  const [demandeEnvoyee, setDemandeEnvoyee] = useState(false);
  const [compteCree, setCompteCree] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  const totalEtapes = type === "candidat" || type === "entreprise" ? 4 : 1;

  function choisirType(prochain: TypeInscription) {
    setType(prochain);
    setEtape(2);
    setDemandeEnvoyee(false);
    setCompteCree(false);
    setErreur(null);
    setCandidat((d) => ({ ...d, pays: codePays }));
    setEntreprise((d) => ({ ...d, pays: codePays }));
  }

  function revenirType() {
    setType(null);
    setEtape(1);
    setDemandeEnvoyee(false);
    setCompteCree(false);
    setErreur(null);
  }

  function validerEtapeCandidat(): string | null {
    if (etape === 2) {
      return (
        validerChampObligatoire(candidat.prenom, "Le prénom") ||
        validerChampObligatoire(candidat.nom, "Le nom")
      );
    }
    if (etape === 3) {
      return (
        validerEmail(candidat.email) ||
        validerTelephone(candidat.telephone, true, candidat.pays) ||
        validerChampObligatoire(candidat.ville, "La ville") ||
        validerMotDePasse(candidat.motDePasse, 8)
      );
    }
    return null;
  }

  function validerEtapeEntreprise(): string | null {
    if (etape === 2) {
      return (
        validerChampObligatoire(entreprise.nomEntreprise, "Le nom de l'entreprise") ||
        validerChampObligatoire(entreprise.pays, "Le pays") ||
        validerChampObligatoire(entreprise.ville, "La ville") ||
        validerChampObligatoire(entreprise.secteurId, "Le secteur") ||
        validerIdentifiantEntreprise(entreprise.pays, entreprise.identifiantLocal) ||
        null
      );
    }
    if (etape === 4) {
      return (
        validerChampObligatoire(entreprise.contactPrenom, "Le prénom") ||
        validerChampObligatoire(entreprise.contactNom, "Le nom") ||
        validerEmail(entreprise.email) ||
        validerTelephone(entreprise.telephone, true, entreprise.pays) ||
        validerMotDePasse(entreprise.motDePasse, 8)
      );
    }
    return null;
  }

  async function terminerCandidat() {
    const err = validerEtapeCandidat();
    if (err) {
      setErreur(err);
      return;
    }
    setErreur(null);
    setEnCours(true);
    try {
      setCodePays(candidat.pays);
      const reponse = await apiRegisterCandidat({
        prenom: candidat.prenom,
        nom: candidat.nom,
        email: candidat.email,
        telephone: candidat.telephone,
        pays: candidat.pays,
        ville: candidat.ville,
        motDePasse: candidat.motDePasse,
      });
      let user = reponse.user;
      if (cv) {
        try {
          const up = await apiUploadCv(reponse.token, cv);
          user = { ...user, cvNom: up.filename };
        } catch {
          // Compte créé ; le CV pourra être ajouté dans Mon compte
        }
      }
      ecrireSession({ token: reponse.token, user });
      setCompteCree(true);
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Inscription impossible.");
    } finally {
      setEnCours(false);
    }
  }

  async function terminerEntreprise() {
    const err = validerEtapeEntreprise();
    if (err) {
      setErreur(err);
      return;
    }
    setErreur(null);
    setEnCours(true);
    try {
      setCodePays(entreprise.pays);
      const secteur = secteurParId(entreprise.secteurId)?.libelle || entreprise.secteurId;
      const reponse = await apiRegisterEntreprise({
        prenom: entreprise.contactPrenom,
        nom: entreprise.contactNom,
        email: entreprise.email,
        telephone: entreprise.telephone,
        motDePasse: entreprise.motDePasse,
        entreprise: {
          nom: entreprise.nomEntreprise,
          secteur,
          ville: entreprise.ville,
          pays: entreprise.pays,
          identifiantLocal: entreprise.identifiantLocal,
          siteWeb: entreprise.siteWeb,
          presentation: entreprise.presentation,
        },
      });
      ecrireSession({ token: reponse.token, user: reponse.user });
      setDemandeEnvoyee(true);
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Demande impossible.");
    } finally {
      setEnCours(false);
    }
  }

  function continuerCandidat() {
    const err = validerEtapeCandidat();
    if (err) {
      setErreur(err);
      return;
    }
    setErreur(null);
    setEtape((e) => e + 1);
  }

  function continuerEntreprise() {
    const err = validerEtapeEntreprise();
    if (err) {
      setErreur(err);
      return;
    }
    setErreur(null);
    setEtape((e) => e + 1);
  }

  if (compteCree) {
    return (
      <CadreAuth titre="Compte créé" description="Vous pouvez dès à présent postuler aux offres.">
        <div className="flex flex-col gap-4">
          <p className="rounded-xl bg-fond px-4 py-3 text-[15px] leading-7 text-encre">
            Votre profil candidat est prêt
            {cv ? ` (CV sélectionné : ${cv.name}).` : "."} Vous êtes connecté.
          </p>
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-md bg-marque px-4 text-sm font-semibold text-white hover:bg-marque-hover"
          >
            Voir les offres
          </Link>
        </div>
      </CadreAuth>
    );
  }

  if (demandeEnvoyee) {
    return (
      <CadreAuth
        titre="Demande envoyée"
        description="Un administrateur doit vérifier l'identité de l'entreprise."
      >
        <div className="flex flex-col gap-4">
          <p className="rounded-xl bg-fond px-4 py-3 text-[15px] leading-7 text-encre">
            Compte créé. Vous êtes connecté, mais publier des offres ne sera possible qu&apos;après
            validation.
          </p>
          <Link
            href="/entreprise"
            className="inline-flex h-10 items-center justify-center rounded-md bg-marque px-4 text-sm font-semibold text-white hover:bg-marque-hover"
          >
            Aller à l&apos;espace recruteur
          </Link>
        </div>
      </CadreAuth>
    );
  }

  return (
    <CadreAuth titre={t("auth.inscription.titre")} description={t("auth.inscription.description")}>
      <IndicateurEtapes etape={etape} total={totalEtapes} />

      {etape === 1 ? (
        <div className="flex flex-col gap-4">
          <p className="text-[14px] font-semibold text-encre">{t("inscription.choix.titre")}</p>
          <div className="grid grid-cols-2 gap-3">
            <ChoixType
              libelle={t("inscription.choix.candidat")}
              description="Consulter et postuler."
              onClick={() => choisirType("candidat")}
            />
            <ChoixType
              libelle={t("inscription.choix.entreprise")}
              description="Publier après validation."
              onClick={() => choisirType("entreprise")}
            />
          </div>
          <p className="text-[15px] text-muet">
            Déjà inscrit ?{" "}
            <Link href="/connexion" className="font-semibold text-marque hover:underline">
              {t("nav.connexion")}
            </Link>
          </p>
        </div>
      ) : null}

      {erreur ? (
        <p className="rounded-xl bg-refus/10 px-3 py-2 text-[14px] text-refus" role="alert">
          {erreur}
        </p>
      ) : null}

      {type === "candidat" && etape > 1 ? (
        <FormulaireCandidat
          etape={etape}
          donnees={candidat}
          onChange={setCandidat}
          cv={cv}
          onCv={setCv}
          enCours={enCours}
          onRetour={() => (etape === 2 ? revenirType() : setEtape(etape - 1))}
          onSuivant={continuerCandidat}
          onTerminer={() => void terminerCandidat()}
        />
      ) : null}

      {type === "entreprise" && etape > 1 ? (
        <FormulaireEntreprise
          etape={etape}
          donnees={entreprise}
          onChange={setEntreprise}
          enCours={enCours}
          onRetour={() => (etape === 2 ? revenirType() : setEtape(etape - 1))}
          onSuivant={continuerEntreprise}
          onTerminer={() => void terminerEntreprise()}
        />
      ) : null}
    </CadreAuth>
  );
}

function IndicateurEtapes({ etape, total }: { etape: number; total: number }) {
  const { t } = useLocale();
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[12px] font-semibold uppercase tracking-wide text-muet">
        {t("inscription.etape")} {etape} / {total}
      </p>
      <div className="flex gap-1.5">
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded-full ${i + 1 <= etape ? "bg-marque" : "bg-ligne"}`}
          />
        ))}
      </div>
    </div>
  );
}

function FormulaireCandidat({
  etape,
  donnees,
  onChange,
  cv,
  onCv,
  enCours,
  onRetour,
  onSuivant,
  onTerminer,
}: {
  etape: number;
  donnees: DonneesCandidat;
  onChange: (d: DonneesCandidat) => void;
  cv: File | null;
  onCv: (f: File | null) => void;
  enCours: boolean;
  onRetour: () => void;
  onSuivant: () => void;
  onTerminer: () => void;
}) {
  const defPays = paysParCode(donnees.pays);
  const optionsVilles = useMemo(
    () => defPays.villes.map((v) => ({ valeur: v, libelle: v })),
    [defPays],
  );
  const optionsPays = useMemo(
    () => LISTE_PAYS.map((p) => ({ valeur: p.code, libelle: p.nom })),
    [],
  );

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (etape < 4) {
          onSuivant();
          return;
        }
        onTerminer();
      }}
    >
      {etape === 2 ? (
        <>
          <p className="text-[14px] font-semibold text-encre">Qui êtes-vous ?</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <ChampTexte
              libelle="Prénom"
              nom="prenom"
              requis
              valeur={donnees.prenom}
              onChange={(prenom) => onChange({ ...donnees, prenom })}
            />
            <ChampTexte
              libelle="Nom"
              nom="nom"
              requis
              valeur={donnees.nom}
              onChange={(nom) => onChange({ ...donnees, nom })}
            />
          </div>
        </>
      ) : null}

      {etape === 3 ? (
        <>
          <p className="text-[14px] font-semibold text-encre">Vos identifiants & localisation</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <ChampTexte
              libelle="E-mail"
              nom="email"
              type="email"
              requis
              valeur={donnees.email}
              onChange={(email) => onChange({ ...donnees, email })}
            />
            <ChampSelectRecherche
              libelle="Pays"
              nom="pays"
              requis
              valeur={donnees.pays}
              options={optionsPays}
              onChange={(pays) =>
                onChange({
                  ...donnees,
                  pays: pays as CodePays,
                  ville: "",
                  telephone: "",
                })
              }
            />
            <ChampSelectRecherche
              libelle="Ville"
              nom="ville"
              requis
              valeur={donnees.ville}
              options={optionsVilles}
              onChange={(ville) => onChange({ ...donnees, ville })}
              placeholder="Rechercher une ville…"
            />
            <ChampTelephone
              libelle="Téléphone"
              nom="telephone"
              requis
              codePays={donnees.pays}
              valeur={donnees.telephone}
              onChange={(telephone) => onChange({ ...donnees, telephone })}
            />
            <div className="sm:col-span-2">
              <ChampTexte
                libelle="Mot de passe"
                nom="motDePasse"
                type="password"
                requis
                valeur={donnees.motDePasse}
                onChange={(motDePasse) => onChange({ ...donnees, motDePasse })}
              />
            </div>
          </div>
        </>
      ) : null}

      {etape === 4 ? (
        <>
          <p className="text-[14px] font-semibold text-encre">Votre CV</p>
          <ChampFichier
            libelle="CV (PDF) — facultatif"
            nom="cv"
            fichier={cv}
            onChange={onCv}
            aide="Stockage fichier plus tard. Pour l'instant la création de compte ne nécessite pas le PDF."
          />
        </>
      ) : null}

      <ActionsEtape
        onRetour={onRetour}
        libelleSuivant={etape === 4 ? "Créer le compte" : "Continuer"}
        enCours={enCours}
      />
    </form>
  );
}

function FormulaireEntreprise({
  etape,
  donnees,
  onChange,
  enCours,
  onRetour,
  onSuivant,
  onTerminer,
}: {
  etape: number;
  donnees: DonneesEntreprise;
  onChange: (d: DonneesEntreprise) => void;
  enCours: boolean;
  onRetour: () => void;
  onSuivant: () => void;
  onTerminer: () => void;
}) {
  const defPays = paysParCode(donnees.pays);
  const optionsPays = useMemo(
    () => LISTE_PAYS.map((p) => ({ valeur: p.code, libelle: p.nom })),
    [],
  );
  const optionsVilles = useMemo(
    () => defPays.villes.map((v) => ({ valeur: v, libelle: v })),
    [defPays],
  );
  const optionsSecteurs = useMemo(
    () => SECTEURS.map((s) => ({ valeur: s.id, libelle: s.libelle })),
    [],
  );

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (etape < 4) {
          onSuivant();
          return;
        }
        onTerminer();
      }}
    >
      {etape === 2 ? (
        <>
          <p className="text-[14px] font-semibold text-encre">Votre entreprise</p>
          <p className="rounded-xl bg-fond px-3 py-2 text-[13px] leading-6 text-muet">
            L&apos;accès recruteur reste fermé jusqu&apos;à validation. Devise locale :{" "}
            <strong className="text-encre">
              {defPays.devise.symbole} ({defPays.devise.code})
            </strong>
            .
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <ChampTexte
                libelle="Nom de l'entreprise"
                nom="entreprise"
                requis
                valeur={donnees.nomEntreprise}
                onChange={(nomEntreprise) => onChange({ ...donnees, nomEntreprise })}
              />
            </div>
            <ChampSelectRecherche
              libelle="Pays"
              nom="pays"
              requis
              valeur={donnees.pays}
              options={optionsPays}
              onChange={(pays) =>
                onChange({
                  ...donnees,
                  pays: pays as CodePays,
                  ville: "",
                  identifiantLocal: "",
                  telephone: "",
                })
              }
            />
            <ChampSelectRecherche
              libelle="Ville"
              nom="ville"
              requis
              valeur={donnees.ville}
              options={optionsVilles}
              onChange={(ville) => onChange({ ...donnees, ville })}
              placeholder="Rechercher une ville…"
            />
            <div className="sm:col-span-2">
              <ChampSelectRecherche
                libelle="Secteur d'activité"
                nom="secteur"
                requis
                valeur={donnees.secteurId}
                options={optionsSecteurs}
                filtrer={(_opts, saisie) =>
                  filtrerSecteurs(saisie, 14).map((s) => ({
                    valeur: s.id,
                    libelle: s.libelle,
                  }))
                }
                onChange={(secteurId) => onChange({ ...donnees, secteurId })}
                placeholder="Rechercher un secteur…"
              />
            </div>
            <div className="sm:col-span-2">
              <ChampTexte
                libelle={defPays.identifiantEntreprise.libelle}
                nom="identifiantLocal"
                requis={defPays.identifiantEntreprise.obligatoire}
                valeur={donnees.identifiantLocal}
                onChange={(identifiantLocal) => onChange({ ...donnees, identifiantLocal })}
                placeholder={defPays.identifiantEntreprise.aide}
              />
              <p className="mt-1 text-[12px] text-muet">{defPays.identifiantEntreprise.aide}</p>
            </div>
            <div className="sm:col-span-2">
              <ChampTexte
                libelle="Site web (facultatif)"
                nom="site"
                type="url"
                valeur={donnees.siteWeb}
                onChange={(siteWeb) => onChange({ ...donnees, siteWeb })}
              />
            </div>
          </div>
        </>
      ) : null}

      {etape === 3 ? (
        <>
          <p className="text-[14px] font-semibold text-encre">Présentation</p>
          <ChampZoneTexte
            libelle="Présentez brièvement l'activité"
            nom="presentation"
            lignes={5}
            placeholder="Ce que fait l'entreprise, pour qui, où…"
            valeur={donnees.presentation}
            onChange={(presentation) => onChange({ ...donnees, presentation })}
          />
        </>
      ) : null}

      {etape === 4 ? (
        <>
          <p className="text-[14px] font-semibold text-encre">Personne de contact</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <ChampTexte
              libelle="Prénom"
              nom="contactPrenom"
              requis
              valeur={donnees.contactPrenom}
              onChange={(contactPrenom) => onChange({ ...donnees, contactPrenom })}
            />
            <ChampTexte
              libelle="Nom"
              nom="contactNom"
              requis
              valeur={donnees.contactNom}
              onChange={(contactNom) => onChange({ ...donnees, contactNom })}
            />
            <ChampTexte
              libelle="E-mail"
              nom="contactEmail"
              type="email"
              requis
              valeur={donnees.email}
              onChange={(email) => onChange({ ...donnees, email })}
            />
            <ChampTelephone
              libelle="Téléphone"
              nom="telephone"
              requis
              codePays={donnees.pays}
              valeur={donnees.telephone}
              onChange={(telephone) => onChange({ ...donnees, telephone })}
            />
            <div className="sm:col-span-2">
              <ChampTexte
                libelle="Mot de passe"
                nom="motDePasse"
                type="password"
                requis
                valeur={donnees.motDePasse}
                onChange={(motDePasse) => onChange({ ...donnees, motDePasse })}
              />
            </div>
          </div>
        </>
      ) : null}

      <ActionsEtape
        onRetour={onRetour}
        libelleSuivant={etape === 4 ? "Envoyer la demande" : "Continuer"}
        enCours={enCours}
      />
    </form>
  );
}

function ActionsEtape({
  onRetour,
  libelleSuivant,
  enCours,
}: {
  onRetour: () => void;
  libelleSuivant: string;
  enCours?: boolean;
}) {
  const { t } = useLocale();
  return (
    <div className="flex flex-col gap-2 pt-1">
      <Bouton type="submit" className="w-full" disabled={enCours}>
        {enCours ? t("common.chargement") : libelleSuivant}
      </Bouton>
      <button
        type="button"
        onClick={onRetour}
        disabled={enCours}
        className="h-10 text-[14px] font-semibold text-muet hover:text-marque disabled:opacity-50"
      >
        {t("common.retour")}
      </button>
    </div>
  );
}

function ChoixType({
  libelle,
  description,
  onClick,
}: {
  libelle: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl border border-ligne bg-surface px-4 py-3.5 text-left transition hover:border-marque/40"
    >
      <span className="block text-[15px] font-semibold text-encre">{libelle}</span>
      <span className="mt-0.5 block text-[12px] text-muet">{description}</span>
    </button>
  );
}
