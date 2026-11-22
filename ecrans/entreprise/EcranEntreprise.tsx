/**
 * @fileoverview Espace recruteur (/entreprise).
 *
 * But
 *   Offres, pipeline candidatures, logo, réclamation si refus, brouillon publication.
 *   Gros fichier : c'est normal, c'est le cockpit entreprise.
 */
"use client";

/**
 * Espace recruteur branché sur :
 * GET /api/entreprise/me, /offres, /candidatures
 * POST /api/entreprise/offres
 * PATCH /api/candidatures/:id + POST .../commentaires
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { ParcoursCandidature } from "@/composants/entreprise/ParcoursCandidature";
import {
  BadgeStatut,
  Bouton,
  ChampFichier,
  ChampSelect,
  ChampTexte,
  ChampZoneTexte,
} from "@/composants/ui";
import {
  apiCandidaturesEntreprise,
  apiCommentaireCandidature,
  apiMajCandidature,
  apiMajEntreprise,
  apiMajOffre,
  apiMonEntreprise,
  apiOffresEntreprise,
  apiPublierOffre,
  apiReclamationEntreprise,
  apiUploadLogoEntreprise,
} from "@/lib/api";
import { CLE_BROUILLON_OFFRE } from "@/lib/brouillon-offre";
import { formaterDate, formaterDateRelative } from "@/lib/format";
import { useLocale } from "@/lib/i18n/contexte";
import { estReclamation } from "@/lib/reclamation";
import {
  composerLibelleSalaire,
  estimerToutesPeriodes,
  HEURES_SEMAINE_DEFAUT,
  parserMontant,
  PERIODES_REMUNERATION,
  type PeriodeRemuneration,
} from "@/lib/remuneration";
import { lireSession } from "@/lib/session";
import type {
  Candidature,
  EntretienCandidature,
  StatutCandidature,
} from "@/types/candidature";
import { LIBELLES_STATUT } from "@/types/candidature";
import type { Entreprise } from "@/types/entreprise";
import { TYPES_CONTRAT, type Offre } from "@/types/offre";

type Onglet = "tableau" | "offres" | "candidatures" | "publier" | "compte";

const ONGLETS: { id: Onglet; libelle: string }[] = [
  { id: "tableau", libelle: "Tableau de bord" },
  { id: "offres", libelle: "Offres" },
  { id: "candidatures", libelle: "Candidatures" },
  { id: "publier", libelle: "Publier" },
  { id: "compte", libelle: "Mon entreprise" },
];

const LIBELLES_MODALITE: Record<EntretienCandidature["modalite"], string> = {
  visio: "Visio",
  telephone: "Téléphone",
  presentiel: "Sur site",
};

type ProprietesEcranEntreprise = {
  /** Pour la démo : forcer l'écran d'attente ou de refus (`?acces=attente|refus`). */
  forcerStatut?: "en_attente" | "refusee" | null;
};

/** Espace recruteur : poste de travail pour publier et traiter les candidatures. */
export function EcranEntreprise({ forcerStatut = null }: ProprietesEcranEntreprise) {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [entreprise, setEntreprise] = useState<Entreprise | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    const session = lireSession();
    if (!session || (session.user.role !== "entreprise" && session.user.role !== "admin")) {
      router.replace("/connexion");
      return;
    }
    if (session.user.role === "entreprise" && !session.user.entrepriseId) {
      setErreur("Aucune entreprise liée à ce compte.");
      setChargement(false);
      return;
    }

    let annule = false;
    async function charger() {
      setChargement(true);
      setErreur(null);
      try {
        const { entreprise: profil } = await apiMonEntreprise(session!.token);
        if (annule) {
          return;
        }
        setToken(session!.token);
        setEntreprise(profil);
      } catch (err) {
        if (!annule) {
          setErreur(err instanceof Error ? err.message : "Chargement impossible.");
        }
      } finally {
        if (!annule) {
          setChargement(false);
        }
      }
    }
    void charger();
    return () => {
      annule = true;
    };
  }, [router]);

  if (chargement || (!entreprise && !erreur)) {
    return (
      <main className="flex flex-1 items-center justify-center bg-fond text-muet">
        Chargement de l&apos;espace recruteur…
      </main>
    );
  }

  if (erreur || !entreprise || !token) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-3 bg-fond px-4">
        <p className="text-[15px] text-refus">{erreur ?? "Session invalide."}</p>
        <Link href="/connexion" className="text-[14px] font-semibold text-marque hover:underline">
          Se connecter
        </Link>
      </main>
    );
  }

  const statutAffiche = forcerStatut ?? entreprise.statutVerification;
  if (statutAffiche !== "validee") {
    return (
      <EcranAccesEntrepriseBloque
        entreprise={{ ...entreprise, statutVerification: statutAffiche }}
        onMajEntreprise={setEntreprise}
      />
    );
  }

  return (
    <EspaceRecruteur
      entreprise={entreprise}
      token={token}
      onMajEntreprise={setEntreprise}
    />
  );
}

function EcranAccesEntrepriseBloque({
  entreprise,
  onMajEntreprise,
}: {
  entreprise: Entreprise;
  onMajEntreprise: (entreprise: Entreprise) => void;
}) {
  const refusee = entreprise.statutVerification === "refusee";
  const [texte, setTexte] = useState("");
  const [telephone, setTelephone] = useState("");
  const [preuve, setPreuve] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  async function envoyerReclamation(e: FormEvent) {
    e.preventDefault();
    if (!texte.trim() || !telephone.trim()) {
      setMessage("Indiquez un message et un numéro de contact.");
      return;
    }
    setEnvoi(true);
    setMessage(null);
    try {
      // Réclamation : remet en file d’attente côté admin (refus ≠ fin)
      const session = lireSession();
      if (!session?.token) {
        setMessage("Reconnectez-vous pour envoyer la réclamation.");
        return;
      }
      const { entreprise: maj } = await apiReclamationEntreprise(session.token, {
        message: texte.trim(),
        telephone: telephone.trim(),
        preuve,
      });
      onMajEntreprise(maj);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Envoi impossible.");
    } finally {
      setEnvoi(false);
    }
  }

  if (!refusee) {
    return (
      <main className="flex min-h-0 flex-1 flex-col items-center justify-center bg-fond px-4">
        <p className="text-5xl font-extrabold tracking-tight text-marque sm:text-6xl">Attente</p>
        <p className="mt-4 max-w-md text-center text-[16px] text-muet">
          {estReclamation(entreprise.motifRefus)
            ? "Votre réclamation a bien été envoyée. Un administrateur va réexaminer votre dossier."
            : "Votre inscription est en cours de vérification."}
        </p>
        <p className="mt-2 text-[14px] text-muet">{entreprise.nom}</p>
        <Link href="/" className="mt-8 text-[14px] font-semibold text-marque hover:underline">
          ← Retour aux offres
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain bg-fond">
      <div className="mx-auto grid w-full max-w-5xl gap-10 px-4 py-16 sm:px-8 lg:grid-cols-2 lg:items-start">
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <p className="text-6xl font-extrabold tracking-tight text-refus sm:text-7xl">Refus</p>
          {entreprise.motifRefus ? (
            <p className="mt-6 max-w-md text-[17px] leading-7 text-encre">{entreprise.motifRefus}</p>
          ) : (
            <p className="mt-6 text-[15px] text-muet">Aucun motif détaillé.</p>
          )}
          <p className="mt-4 text-[14px] text-muet">{entreprise.nom}</p>
          <Link href="/" className="mt-8 text-[14px] font-semibold text-marque hover:underline">
            ← Retour aux offres
          </Link>
        </div>

        <form
          className="rounded-2xl border border-ligne bg-surface p-5 sm:p-6"
          onSubmit={(e) => {
            void envoyerReclamation(e);
          }}
        >
          <h2 className="text-lg font-bold text-marque">Réclamation</h2>
          <p className="mt-1 text-[14px] text-muet">
            Un refus n&apos;est pas définitif. Expliquez votre situation et joignez une preuve si
            besoin.
          </p>
          <div className="mt-4 flex flex-col gap-4">
            <ChampZoneTexte
              libelle="Votre message"
              nom="reclamation"
              lignes={5}
              requis
              valeur={texte}
              onChange={setTexte}
              placeholder="Pourquoi ce refus est une erreur, documents déjà fournis…"
            />
            <ChampTexte
              libelle="Numéro de contact"
              nom="telReclamation"
              type="tel"
              requis
              valeur={telephone}
              onChange={setTelephone}
            />
            <ChampFichier
              libelle="Preuve (PDF ou image)"
              nom="preuve"
              accept="application/pdf,image/png,image/jpeg,image/webp"
              fichier={preuve}
              onChange={setPreuve}
              aide="Optionnel — KBIS, pièce d’identité société, etc. (5 Mo max.)"
            />
            {message ? (
              <p className="rounded-xl bg-fond px-4 py-3 text-[14px] text-marque">{message}</p>
            ) : null}
            <Bouton type="submit" disabled={envoi}>
              {envoi ? "Envoi…" : "Envoyer la réclamation"}
            </Bouton>
          </div>
        </form>
      </div>
    </main>
  );
}

function EspaceRecruteur({
  entreprise,
  token,
  onMajEntreprise,
}: {
  entreprise: Entreprise;
  token: string;
  onMajEntreprise: (e: Entreprise) => void;
}) {
  const [onglet, setOnglet] = useState<Onglet>("tableau");
  const [offres, setOffres] = useState<Offre[]>([]);
  const [candidatures, setCandidatures] = useState<Candidature[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreurAction, setErreurAction] = useState<string | null>(null);
  const [filtreOffre, setFiltreOffre] = useState<number | "toutes">("toutes");
  const [filtreStatut, setFiltreStatut] = useState<StatutCandidature | "tous">("tous");
  const [candidatureActiveId, setCandidatureActiveId] = useState<number | null>(null);
  const [offreEnEdition, setOffreEnEdition] = useState<Offre | null>(null);

  const recharger = useCallback(async () => {
    setChargement(true);
    setErreurAction(null);
    try {
      const [resOffres, resCands] = await Promise.all([
        apiOffresEntreprise(token),
        apiCandidaturesEntreprise(token),
      ]);
      setOffres(resOffres.offres);
      setCandidatures(resCands.candidatures);
      setCandidatureActiveId((actuel) => actuel ?? resCands.candidatures[0]?.id ?? null);
    } catch (err) {
      setErreurAction(err instanceof Error ? err.message : "Chargement impossible.");
    } finally {
      setChargement(false);
    }
  }, [token]);

  useEffect(() => {
    void recharger();
  }, [recharger]);

  const stats = useMemo(() => {
    const aTraiter = candidatures.filter(
      (c) => c.statut === "envoyee" || c.statut === "en_etude" || c.statut === "entretien",
    ).length;
    const entretiens = candidatures.filter((c) => c.statut === "entretien").length;
    const acceptees = candidatures.filter((c) => c.statut === "acceptee").length;
    return {
      offres: offres.length,
      candidatures: candidatures.length,
      aTraiter,
      entretiens,
      acceptees,
    };
  }, [candidatures, offres.length]);

  const candidaturesFiltrees = useMemo(() => {
    return candidatures
      .filter((c) => (filtreOffre === "toutes" ? true : c.offreId === filtreOffre))
      .filter((c) => (filtreStatut === "tous" ? true : c.statut === filtreStatut))
      .sort((a, b) => b.dateEnvoi.localeCompare(a.dateEnvoi));
  }, [candidatures, filtreOffre, filtreStatut]);

  const candidatureActive =
    candidaturesFiltrees.find((c) => c.id === candidatureActiveId) ??
    candidaturesFiltrees[0] ??
    null;

  function mettreAJourLocal(id: number, patch: Partial<Candidature>) {
    setCandidatures((liste) => liste.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  async function changerStatut(id: number, statut: StatutCandidature) {
    const precedent = candidatures.find((c) => c.id === id)?.statut;
    mettreAJourLocal(id, { statut });
    try {
      await apiMajCandidature(token, id, { statut });
    } catch (err) {
      if (precedent) {
        mettreAJourLocal(id, { statut: precedent });
      }
      setErreurAction(err instanceof Error ? err.message : "Mise à jour impossible.");
    }
  }

  async function ajouterCommentaire(id: number, texte: string) {
    const trim = texte.trim();
    if (!trim) {
      return;
    }
    try {
      const { commentaire } = await apiCommentaireCandidature(token, id, trim);
      setCandidatures((liste) =>
        liste.map((c) =>
          c.id === id ? { ...c, commentaires: [...c.commentaires, commentaire] } : c,
        ),
      );
    } catch (err) {
      setErreurAction(err instanceof Error ? err.message : "Commentaire impossible.");
    }
  }

  async function planifierEntretien(id: number, entretien: EntretienCandidature) {
    const avant = candidatures.find((c) => c.id === id);
    mettreAJourLocal(id, { statut: "entretien", entretien });
    try {
      await apiMajCandidature(token, id, { statut: "entretien", entretien });
    } catch (err) {
      if (avant) {
        mettreAJourLocal(id, { statut: avant.statut, entretien: avant.entretien });
      }
      setErreurAction(err instanceof Error ? err.message : "Planification impossible.");
    }
  }

  async function refuser(id: number, motif: string) {
    const avant = candidatures.find((c) => c.id === id);
    mettreAJourLocal(id, { statut: "refusee", motifRefus: motif.trim() });
    try {
      await apiMajCandidature(token, id, {
        statut: "refusee",
        motifRefus: motif.trim(),
      });
    } catch (err) {
      if (avant) {
        mettreAJourLocal(id, { statut: avant.statut, motifRefus: avant.motifRefus });
      }
      setErreurAction(err instanceof Error ? err.message : "Refus impossible.");
    }
  }

  function ouvrirCandidatures(offreId?: number) {
    if (offreId != null) {
      setFiltreOffre(offreId);
    }
    setOnglet("candidatures");
  }

  return (
    <main className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain bg-fond">
      <div className="mx-auto w-full max-w-[90rem] px-4 py-6 sm:px-8 lg:px-10">
        <header className="flex flex-col gap-4 border-b border-ligne pb-5">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-wider text-muet">
              Espace recruteur
            </p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-marque sm:text-3xl">
              {entreprise.nom}
            </h1>
            <p className="mt-1 text-[15px] text-muet">
              {entreprise.secteur} — {entreprise.ville}
            </p>
          </div>
        </header>

        <nav
          aria-label="Outils recruteur"
          className="mt-5 flex gap-1 overflow-x-auto border-b border-ligne pb-px"
        >
          {ONGLETS.map((item) => {
            const actif = onglet === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setOnglet(item.id)}
                className={`shrink-0 border-b-2 px-4 py-2.5 text-[14px] font-semibold transition ${
                  actif
                    ? "border-marque text-marque"
                    : "border-transparent text-muet hover:text-encre"
                }`}
              >
                {item.libelle}
                {item.id === "candidatures" && stats.aTraiter > 0 ? (
                  <span className="ml-2 rounded-full bg-marque px-1.5 py-0.5 text-[11px] text-white">
                    {stats.aTraiter}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        <div className="py-6">
          {chargement ? <p className="mb-4 text-[14px] text-muet">Chargement…</p> : null}
          {erreurAction ? (
            <p className="mb-4 rounded-xl bg-refus/10 px-4 py-3 text-[14px] text-refus">
              {erreurAction}
            </p>
          ) : null}
          {onglet === "tableau" ? (
            <VueTableau
              stats={stats}
              recentes={candidatures.slice(0, 4)}
              onVoirCandidatures={() => ouvrirCandidatures()}
              onVoirOffres={() => setOnglet("offres")}
              onTraiter={(id) => {
                setCandidatureActiveId(id);
                setOnglet("candidatures");
              }}
            />
          ) : null}
          {onglet === "offres" ? (
            <VueOffres
              offres={offres}
              candidatures={candidatures}
              onVoirCandidatures={ouvrirCandidatures}
              onModifier={(offre) => {
                setOffreEnEdition(offre);
                setOnglet("publier");
              }}
              onBasculerMarche={(offre) => {
                void (async () => {
                  try {
                    const { offre: maj } = await apiMajOffre(token, offre.id, {
                      active: !offre.active,
                    });
                    setOffres((liste) => liste.map((o) => (o.id === maj.id ? maj : o)));
                  } catch (err) {
                    setErreurAction(
                      err instanceof Error ? err.message : "Mise à jour impossible.",
                    );
                  }
                })();
              }}
            />
          ) : null}
          {onglet === "candidatures" ? (
            <VueCandidatures
              offres={offres}
              liste={candidaturesFiltrees}
              active={candidatureActive}
              filtreOffre={filtreOffre}
              filtreStatut={filtreStatut}
              onFiltreOffre={setFiltreOffre}
              onFiltreStatut={setFiltreStatut}
              onChoisir={(id) => {
                setCandidatureActiveId(id);
              }}
              onStatut={(id, statut) => {
                void changerStatut(id, statut);
              }}
              onCommentaire={(id, texte) => {
                void ajouterCommentaire(id, texte);
              }}
              onEntretien={(id, entretien) => {
                void planifierEntretien(id, entretien);
              }}
              onRefuser={(id, motif) => {
                void refuser(id, motif);
              }}
            />
          ) : null}
          {onglet === "publier" ? (
            <VuePublier
              key={offreEnEdition?.id ?? "nouvelle"}
              token={token}
              offreInitiale={offreEnEdition}
              onAnnuler={() => {
                setOffreEnEdition(null);
                setOnglet("offres");
              }}
              onPubliee={(offre) => {
                setOffres((liste) => {
                  const sans = liste.filter((o) => o.id !== offre.id);
                  return [offre, ...sans];
                });
                setOffreEnEdition(null);
                setOnglet("offres");
              }}
            />
          ) : null}
          {onglet === "compte" ? (
            <VueCompteEntreprise
              token={token}
              entreprise={entreprise}
              onMaj={onMajEntreprise}
            />
          ) : null}
        </div>
      </div>
    </main>
  );
}

function VueCompteEntreprise({
  token,
  entreprise,
  onMaj,
}: {
  token: string;
  entreprise: Entreprise;
  onMaj: (e: Entreprise) => void;
}) {
  const [nom, setNom] = useState(entreprise.nom);
  const [secteur, setSecteur] = useState(entreprise.secteur);
  const [ville, setVille] = useState(entreprise.ville);
  const [siteWeb, setSiteWeb] = useState(entreprise.siteWeb);
  const [presentation, setPresentation] = useState(entreprise.presentation);
  const [contactNom, setContactNom] = useState(entreprise.contactNom);
  const [contactEmail, setContactEmail] = useState(entreprise.contactEmail);
  const [logo, setLogo] = useState<File | null>(null);
  const [logoUrl, setLogoUrl] = useState(entreprise.logoUrl);
  const [envoi, setEnvoi] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  async function soumettre(e: FormEvent) {
    e.preventDefault();
    setEnvoi(true);
    setErreur(null);
    setMessage(null);
    try {
      if (logo) {
        const up = await apiUploadLogoEntreprise(token, logo);
        setLogoUrl(up.url);
        setLogo(null);
      }
      const { entreprise: maj } = await apiMajEntreprise(token, {
        nom,
        secteur,
        ville,
        siteWeb,
        presentation,
        contactNom,
        contactEmail,
      });
      onMaj({ ...maj, logoUrl: logoUrl && !logo ? logoUrl : maj.logoUrl });
      // Recharge pour logo à jour
      const { entreprise: frais } = await apiMonEntreprise(token);
      onMaj(frais);
      setLogoUrl(frais.logoUrl);
      setMessage("Informations enregistrées.");
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Enregistrement impossible.");
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="mb-5 text-lg font-bold text-marque">Mon entreprise</h2>
      <form
        className="rounded-2xl border border-ligne bg-surface p-5 sm:p-6"
        onSubmit={(e) => {
          void soumettre(e);
        }}
      >
        <div className="mb-5 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-ligne bg-fond">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="" className="h-full w-full object-contain" />
            ) : (
              <span className="text-[12px] text-muet">Logo</span>
            )}
          </div>
          <ChampFichier
            libelle="Logo (PNG / JPG)"
            nom="logo"
            accept="image/png,image/jpeg,image/webp"
            fichier={logo}
            onChange={setLogo}
            aide="Affiché sur vos offres et votre espace."
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <ChampTexte libelle="Nom" nom="nom" valeur={nom} onChange={setNom} requis />
          </div>
          <ChampTexte libelle="Secteur" nom="secteur" valeur={secteur} onChange={setSecteur} />
          <ChampTexte libelle="Ville" nom="ville" valeur={ville} onChange={setVille} />
          <div className="sm:col-span-2">
            <ChampTexte libelle="Site web" nom="site" valeur={siteWeb} onChange={setSiteWeb} />
          </div>
          <div className="sm:col-span-2">
            <ChampZoneTexte
              libelle="Présentation"
              nom="presentation"
              lignes={4}
              valeur={presentation}
              onChange={setPresentation}
            />
          </div>
          <ChampTexte
            libelle="Contact"
            nom="contactNom"
            valeur={contactNom}
            onChange={setContactNom}
          />
          <ChampTexte
            libelle="E-mail contact"
            nom="contactEmail"
            type="email"
            valeur={contactEmail}
            onChange={setContactEmail}
          />
        </div>
        {erreur ? (
          <p className="mt-4 rounded-xl bg-refus/10 px-4 py-3 text-[14px] text-refus">{erreur}</p>
        ) : null}
        {message ? (
          <p className="mt-4 rounded-xl bg-fond px-4 py-3 text-[14px] text-marque">{message}</p>
        ) : null}
        <div className="mt-5">
          <Bouton type="submit" disabled={envoi}>
            {envoi ? "Enregistrement…" : "Enregistrer"}
          </Bouton>
        </div>
      </form>
    </div>
  );
}

function VueTableau({
  stats,
  recentes,
  onVoirCandidatures,
  onVoirOffres,
  onTraiter,
}: {
  stats: {
    offres: number;
    candidatures: number;
    aTraiter: number;
    entretiens: number;
    acceptees: number;
  };
  recentes: Candidature[];
  onVoirCandidatures: () => void;
  onVoirOffres: () => void;
  onTraiter: (id: number) => void;
}) {
  return (
    <div className="flex flex-col gap-8">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <CarteStat valeur={String(stats.offres)} libelle="Offres en ligne" />
        <CarteStat valeur={String(stats.aTraiter)} libelle="Dossiers à suivre" accent />
        <CarteStat valeur={String(stats.entretiens)} libelle="Entretiens prévus" />
        <CarteStat valeur={String(stats.acceptees)} libelle="Validées" />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-ligne bg-surface p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-marque">Dernières candidatures</h2>
            <button
              type="button"
              onClick={onVoirCandidatures}
              className="text-[13px] font-semibold text-marque hover:underline"
            >
              Tout voir
            </button>
          </div>
          <ul className="divide-y divide-ligne">
            {recentes.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => onTraiter(c.id)}
                  className="flex w-full items-start justify-between gap-3 py-3 text-left hover:bg-fond/80"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-semibold text-encre">{c.nomCandidat}</p>
                    <p className="truncate text-[13px] text-muet">{c.titreOffre}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <BadgeStatut statut={c.statut} />
                    <span className="text-[12px] text-muet">{formaterDateRelative(c.dateEnvoi)}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={onVoirCandidatures}
            className="rounded-2xl border border-ligne bg-surface p-5 text-left transition hover:border-marque/40"
          >
            <p className="text-[13px] font-semibold uppercase tracking-wide text-muet">Priorité</p>
            <p className="mt-2 text-2xl font-extrabold text-marque">{stats.aTraiter}</p>
            <p className="mt-1 text-[14px] text-muet">à lire, décider ou recevoir en entretien</p>
          </button>
          <button
            type="button"
            onClick={onVoirOffres}
            className="rounded-2xl border border-ligne bg-surface p-5 text-left transition hover:border-marque/40"
          >
            <p className="text-[13px] font-semibold uppercase tracking-wide text-muet">Vos offres</p>
            <p className="mt-2 text-2xl font-extrabold text-marque">{stats.offres}</p>
            <p className="mt-1 text-[14px] text-muet">annonces publiées</p>
          </button>
        </div>
      </section>
    </div>
  );
}

function CarteStat({
  valeur,
  libelle,
  accent = false,
}: {
  valeur: string;
  libelle: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border px-5 py-4 ${
        accent ? "border-marque bg-marque text-white" : "border-ligne bg-surface"
      }`}
    >
      <p className={`text-3xl font-extrabold tracking-tight ${accent ? "text-white" : "text-marque"}`}>
        {valeur}
      </p>
      <p className={`mt-1 text-[14px] ${accent ? "text-white/80" : "text-muet"}`}>{libelle}</p>
    </div>
  );
}

function VueOffres({
  offres,
  candidatures,
  onVoirCandidatures,
  onModifier,
  onBasculerMarche,
}: {
  offres: Offre[];
  candidatures: Candidature[];
  onVoirCandidatures: (offreId: number) => void;
  onModifier: (offre: Offre) => void;
  onBasculerMarche: (offre: Offre) => void;
}) {
  const { t } = useLocale();
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-bold text-marque">{t("entreprise.offres.titre")}</h2>
      <ul className="grid gap-3 md:grid-cols-2">
        {offres.map((offre) => {
          const n = candidatures.filter((c) => c.offreId === offre.id).length;
          const aTraiter = candidatures.filter(
            (c) =>
              c.offreId === offre.id &&
              (c.statut === "envoyee" || c.statut === "en_etude" || c.statut === "entretien"),
          ).length;
          return (
            <li
              key={offre.id}
              className={`rounded-2xl border border-ligne bg-surface p-5 ${
                offre.active ? "" : "opacity-70"
              }`}
            >
              <p className="text-[12px] font-semibold uppercase tracking-wide text-muet">
                {offre.typeContrat} · {offre.lieu.split(",")[0]}
                {!offre.active ? " · Retirée du marché" : ""}
              </p>
              <h3 className="mt-1 text-[17px] font-bold text-marque">{offre.titre}</h3>
              <p className="mt-2 line-clamp-2 text-[14px] leading-snug text-muet">
                {offre.descriptionCourte}
              </p>
              <p className="mt-3 text-[13px] text-muet">
                Publiée le {formaterDate(offre.datePublication)}
                <span className="mx-2">·</span>
                {n} candidature{n > 1 ? "s" : ""}
                {aTraiter > 0 ? ` · ${aTraiter} en cours` : ""}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onVoirCandidatures(offre.id)}
                  className="h-9 rounded-lg bg-marque px-3 text-[13px] font-semibold text-white hover:bg-marque-hover"
                >
                  {t("entreprise.offres.candidatures")}
                </button>
                <button
                  type="button"
                  onClick={() => onModifier(offre)}
                  className="h-9 rounded-lg border border-ligne px-3 text-[13px] font-semibold text-marque hover:bg-fond"
                >
                  {t("entreprise.offres.modifier")}
                </button>
                <button
                  type="button"
                  onClick={() => onBasculerMarche(offre)}
                  className="h-9 rounded-lg border border-ligne px-3 text-[13px] font-semibold text-muet hover:bg-fond hover:text-marque"
                >
                  {offre.active ? "Retirer du marché" : "Remettre en ligne"}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function VueCandidatures({
  offres,
  liste,
  active,
  filtreOffre,
  filtreStatut,
  onFiltreOffre,
  onFiltreStatut,
  onChoisir,
  onStatut,
  onCommentaire,
  onEntretien,
  onRefuser,
}: {
  offres: Offre[];
  liste: Candidature[];
  active: Candidature | null;
  filtreOffre: number | "toutes";
  filtreStatut: StatutCandidature | "tous";
  onFiltreOffre: (v: number | "toutes") => void;
  onFiltreStatut: (v: StatutCandidature | "tous") => void;
  onChoisir: (id: number) => void;
  onStatut: (id: number, statut: StatutCandidature) => void;
  onCommentaire: (id: number, texte: string) => void;
  onEntretien: (id: number, entretien: EntretienCandidature) => void;
  onRefuser: (id: number, motif: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-[13px]">
          <span className="font-semibold text-muet">Offre</span>
          <select
            value={filtreOffre === "toutes" ? "toutes" : String(filtreOffre)}
            onChange={(e) =>
              onFiltreOffre(e.target.value === "toutes" ? "toutes" : Number(e.target.value))
            }
            className="h-10 rounded-lg border border-ligne bg-surface px-3 text-[14px] outline-none focus:border-marque"
          >
            <option value="toutes">Toutes les offres</option>
            {offres.map((o) => (
              <option key={o.id} value={o.id}>
                {o.titre}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-[13px]">
          <span className="font-semibold text-muet">Étape</span>
          <select
            value={filtreStatut}
            onChange={(e) => onFiltreStatut(e.target.value as StatutCandidature | "tous")}
            className="h-10 rounded-lg border border-ligne bg-surface px-3 text-[14px] outline-none focus:border-marque"
          >
            <option value="tous">Toutes</option>
            {(Object.keys(LIBELLES_STATUT) as StatutCandidature[]).map((s) => (
              <option key={s} value={s}>
                {LIBELLES_STATUT[s]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:items-start">
        <ul className="flex flex-col gap-2">
          {liste.length === 0 ? (
            <li className="rounded-xl border border-ligne bg-surface px-4 py-8 text-center text-[14px] text-muet">
              Aucune candidature pour ces filtres.
            </li>
          ) : (
            liste.map((c) => {
              const selectionnee = active?.id === c.id;
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => onChoisir(c.id)}
                    className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                      selectionnee
                        ? "border-marque bg-surface shadow-sm"
                        : "border-ligne bg-surface hover:border-marque/30"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-[15px] font-semibold text-encre">{c.nomCandidat}</p>
                      <BadgeStatut statut={c.statut} />
                    </div>
                    <p className="mt-0.5 truncate text-[13px] text-muet">{c.titreOffre}</p>
                    <p className="mt-1 text-[12px] text-muet">{formaterDateRelative(c.dateEnvoi)}</p>
                  </button>
                </li>
              );
            })
          )}
        </ul>

        <DetailCandidature
          key={active?.id ?? "vide"}
          active={active}
          onStatut={onStatut}
          onCommentaire={onCommentaire}
          onEntretien={onEntretien}
          onRefuser={onRefuser}
        />
      </div>
    </div>
  );
}

/** Premier jour possible pour un entretien : demain (pas le jour même). */
function dateDemainIso(): string {
  const demain = new Date();
  demain.setHours(0, 0, 0, 0);
  demain.setDate(demain.getDate() + 1);
  const annee = demain.getFullYear();
  const mois = String(demain.getMonth() + 1).padStart(2, "0");
  const jour = String(demain.getDate()).padStart(2, "0");
  return `${annee}-${mois}-${jour}`;
}

function DetailCandidature({
  active,
  onStatut,
  onCommentaire,
  onEntretien,
  onRefuser,
}: {
  active: Candidature | null;
  onStatut: (id: number, statut: StatutCandidature) => void;
  onCommentaire: (id: number, texte: string) => void;
  onEntretien: (id: number, entretien: EntretienCandidature) => void;
  onRefuser: (id: number, motif: string) => void;
}) {
  const [brouillonCommentaire, setBrouillonCommentaire] = useState("");
  const [motifRefus, setMotifRefus] = useState("");
  const [montreRefus, setMontreRefus] = useState(false);
  const [montreEntretien, setMontreEntretien] = useState(false);
  const [dateEntretien, setDateEntretien] = useState("");
  const [heureEntretien, setHeureEntretien] = useState("");
  const [modalite, setModalite] = useState<EntretienCandidature["modalite"]>("visio");
  const [noteEntretien, setNoteEntretien] = useState("");
  const dateMinEntretien = dateDemainIso();

  if (!active) {
    return (
      <section className="rounded-2xl border border-ligne bg-surface">
        <p className="px-6 py-14 text-center text-[15px] text-muet">
          Sélectionnez une candidature pour la lire.
        </p>
      </section>
    );
  }

  const tokenCv = lireSession()?.token ?? "";
  // PDF direct dans l’onglet navigateur (visionneuse native) — pas de page dédiée.
  const hrefCv = active.nomFichierCv
    ? `/api/cv/${encodeURIComponent(active.nomFichierCv)}?token=${encodeURIComponent(tokenCv)}`
    : "#";
  const terminale = active.statut === "acceptee" || active.statut === "refusee";

  return (
    <section className="rounded-2xl border border-ligne bg-surface lg:sticky lg:top-4 lg:max-h-[calc(100dvh-var(--h-entete)-var(--h-pied)-1rem)] lg:overflow-y-auto">
      <div className="flex flex-col gap-5 p-5 sm:p-6">
        <header className="flex flex-col gap-3 border-b border-ligne pb-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-marque">{active.nomCandidat}</h2>
              <p className="mt-1 text-[14px] text-muet">{active.titreOffre}</p>
              <p className="mt-2 text-[13px] text-muet">
                {active.emailCandidat}
                <span className="mx-2">·</span>
                {active.telephoneCandidat}
              </p>
            </div>
            <BadgeStatut statut={active.statut} />
          </div>
          <ParcoursCandidature statut={active.statut} />
        </header>

        <div>
          <h3 className="text-[13px] font-semibold uppercase tracking-wide text-muet">Message</h3>
          <p className="mt-2 text-[15px] leading-7 text-encre">{active.message}</p>
        </div>

        <div className="rounded-xl bg-fond px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[13px] text-muet">CV</p>
              <p className="mt-0.5 text-[15px] font-semibold text-encre">{active.nomFichierCv}</p>
            </div>
            <a
              href={hrefCv}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 items-center rounded-lg border border-ligne bg-surface px-3 text-[13px] font-semibold text-marque hover:border-marque"
            >
              Ouvrir le CV
            </a>
          </div>
          <p className="mt-2 text-[12px] text-muet">
            S&apos;ouvre dans le lecteur PDF du navigateur (nouvel onglet).
          </p>
        </div>

        {active.entretien ? (
          <div className="rounded-xl border border-marque/20 bg-marque/5 px-4 py-3">
            <p className="text-[13px] font-semibold uppercase tracking-wide text-marque">
              Entretien prévu
            </p>
            <p className="mt-2 text-[15px] font-semibold text-encre">
              {formaterDate(active.entretien.date)} à {active.entretien.heure} ·{" "}
              {LIBELLES_MODALITE[active.entretien.modalite]}
            </p>
            {active.entretien.note ? (
              <p className="mt-1 text-[14px] text-muet">{active.entretien.note}</p>
            ) : null}
            <p className="mt-2 text-[12px] text-muet">
              L&apos;app ne fait pas passer l&apos;entretien : elle rappelle la date et centralise la
              suite (validation ou refus).
            </p>
          </div>
        ) : null}

        {active.statut === "refusee" && active.motifRefus ? (
          <div className="rounded-xl border border-refus/20 bg-refus/5 px-4 py-3">
            <p className="text-[13px] font-semibold uppercase tracking-wide text-refus">Motif du refus</p>
            <p className="mt-2 text-[15px] text-encre">{active.motifRefus}</p>
          </div>
        ) : null}

        <section className="flex flex-col gap-3 border-t border-ligne pt-4">
          <h3 className="text-[13px] font-semibold uppercase tracking-wide text-muet">
            Commentaires internes
          </h3>
          {active.commentaires.length === 0 ? (
            <p className="text-[14px] text-muet">Aucun commentaire pour l&apos;instant.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {active.commentaires.map((com) => (
                <li key={com.id} className="rounded-lg bg-fond px-3 py-2">
                  <p className="text-[12px] text-muet">
                    {com.auteur} · {formaterDate(com.date)}
                  </p>
                  <p className="mt-1 text-[14px] text-encre">{com.texte}</p>
                </li>
              ))}
            </ul>
          )}
          {!terminale || active.statut === "refusee" ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <div className="min-w-0 flex-1">
                <ChampZoneTexte
                  libelle="Ajouter un commentaire"
                  nom={`com-${active.id}`}
                  lignes={2}
                  valeur={brouillonCommentaire}
                  onChange={setBrouillonCommentaire}
                  placeholder="Note visible seulement par l'équipe recruteur."
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  onCommentaire(active.id, brouillonCommentaire);
                  setBrouillonCommentaire("");
                }}
                className="h-10 shrink-0 rounded-lg border border-ligne px-4 text-[13px] font-semibold hover:border-marque"
              >
                Ajouter
              </button>
            </div>
          ) : null}
        </section>

        {!terminale ? (
          <div className="flex flex-col gap-3 border-t border-ligne pt-4">
            <h3 className="text-[13px] font-semibold uppercase tracking-wide text-muet">Actions</h3>
            {active.statut === "envoyee" ? (
              <p className="text-[13px] text-muet">
                Commencez par ouvrir le dossier (CV, message). Ensuite vous pourrez proposer un
                entretien ou refuser.
              </p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              {active.statut === "envoyee" ? (
                <button
                  type="button"
                  onClick={() => onStatut(active.id, "en_etude")}
                  className="h-10 rounded-lg bg-marque px-4 text-[14px] font-semibold text-white hover:bg-marque-hover"
                >
                  Passer en étude
                </button>
              ) : null}
              {active.statut === "en_etude" && !montreEntretien ? (
                <button
                  type="button"
                  onClick={() => {
                    setDateEntretien("");
                    setHeureEntretien("");
                    setNoteEntretien("");
                    setMontreEntretien(true);
                    setMontreRefus(false);
                  }}
                  className="h-10 rounded-lg bg-marque px-4 text-[14px] font-semibold text-white hover:bg-marque-hover"
                >
                  Proposer un entretien
                </button>
              ) : null}
              {active.statut === "entretien" ? (
                <button
                  type="button"
                  onClick={() => onStatut(active.id, "acceptee")}
                  className="h-10 rounded-lg bg-marque px-4 text-[14px] font-semibold text-white hover:bg-marque-hover"
                >
                  Valider la candidature
                </button>
              ) : null}
              {(active.statut === "en_etude" || active.statut === "entretien") &&
              !montreRefus ? (
                <button
                  type="button"
                  onClick={() => {
                    setMontreRefus(true);
                    setMontreEntretien(false);
                  }}
                  className="h-10 rounded-lg border border-refus px-4 text-[14px] font-semibold text-refus hover:bg-refus/5"
                >
                  Refuser
                </button>
              ) : null}
            </div>

            {montreEntretien ? (
              <div className="rounded-xl border border-ligne bg-fond p-4">
                <p className="text-[14px] font-semibold text-encre">Planifier l&apos;entretien</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <ChampTexte
                    libelle="Date"
                    nom="date-entretien"
                    type="date"
                    valeur={dateEntretien}
                    onChange={setDateEntretien}
                    min={dateMinEntretien}
                    requis
                  />
                  <ChampTexte
                    libelle="Heure"
                    nom="heure-entretien"
                    type="time"
                    valeur={heureEntretien}
                    onChange={setHeureEntretien}
                    requis
                  />
                  <ChampSelect
                    libelle="Modalité"
                    nom="modalite"
                    valeur={modalite}
                    onChange={(v) => setModalite(v as EntretienCandidature["modalite"])}
                    options={[
                      { valeur: "visio", libelle: "Visio" },
                      { valeur: "telephone", libelle: "Téléphone" },
                      { valeur: "presentiel", libelle: "Sur site" },
                    ]}
                  />
                  <ChampTexte
                    libelle="Note (optionnel)"
                    nom="note-entretien"
                    valeur={noteEntretien}
                    onChange={setNoteEntretien}
                    placeholder="Lieu, lien visio…"
                  />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!dateEntretien || !heureEntretien) {
                        return;
                      }
                      if (dateEntretien < dateMinEntretien) {
                        return;
                      }
                      onEntretien(active.id, {
                        date: dateEntretien,
                        heure: heureEntretien,
                        modalite,
                        note: noteEntretien,
                      });
                      setMontreEntretien(false);
                    }}
                    className="h-9 rounded-lg bg-marque px-3 text-[13px] font-semibold text-white"
                  >
                    Enregistrer l&apos;entretien
                  </button>
                  <button
                    type="button"
                    onClick={() => setMontreEntretien(false)}
                    className="h-9 rounded-lg border border-ligne px-3 text-[13px] font-medium"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : null}

            {montreRefus ? (
              <div className="rounded-xl border border-refus/20 bg-refus/5 p-4">
                <ChampZoneTexte
                  libelle="Motif du refus"
                  nom="motif-refus"
                  lignes={3}
                  valeur={motifRefus}
                  onChange={setMotifRefus}
                  placeholder="Court motif pour l'équipe (et plus tard pour le candidat si besoin)."
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onRefuser(active.id, motifRefus);
                      setMontreRefus(false);
                      setMotifRefus("");
                    }}
                    className="h-9 rounded-lg bg-refus px-3 text-[13px] font-semibold text-white"
                  >
                    Confirmer le refus
                  </button>
                  <button
                    type="button"
                    onClick={() => setMontreRefus(false)}
                    className="h-9 rounded-lg border border-ligne bg-surface px-3 text-[13px] font-medium"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <p className="border-t border-ligne pt-4 text-[14px] text-muet">
            {active.statut === "acceptee"
              ? "Candidature validée — plus d'étape suivante dans ce parcours."
              : "Candidature refusée — le parcours s'arrête ici."}
          </p>
        )}
      </div>
    </section>
  );
}

function VuePublier({
  token,
  offreInitiale = null,
  onAnnuler,
  onPubliee,
}: {
  token: string;
  offreInitiale?: Offre | null;
  onAnnuler: () => void;
  onPubliee: (offre: Offre) => void;
}) {
  const { t, pays, libelleDevise } = useLocale();
  const symbole = pays.devise.symbole;
  const edition = Boolean(offreInitiale);
  const [titre, setTitre] = useState(offreInitiale?.titre ?? "");
  const [courte, setCourte] = useState(offreInitiale?.descriptionCourte ?? "");
  const [complete, setComplete] = useState(offreInitiale?.descriptionComplete ?? "");
  const [lieu, setLieu] = useState(offreInitiale?.lieu ?? "");
  const [contrat, setContrat] = useState<string>(offreInitiale?.typeContrat ?? "CDI");
  const [periode, setPeriode] = useState<PeriodeRemuneration>("annee");
  const [montant, setMontant] = useState("");
  const [heuresSemaine, setHeuresSemaine] = useState("35");
  const [tempsTravail, setTempsTravail] = useState(
    offreInitiale?.tempsTravail || "Temps plein",
  );
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  // Restaure le brouillon (nouvelle offre uniquement)
  useEffect(() => {
    if (edition) {
      return;
    }
    try {
      const brut = localStorage.getItem(CLE_BROUILLON_OFFRE);
      if (!brut) {
        return;
      }
      const d = JSON.parse(brut) as {
        titre?: string;
        courte?: string;
        complete?: string;
        lieu?: string;
        contrat?: string;
        periode?: PeriodeRemuneration;
        montant?: string;
        heuresSemaine?: string;
        tempsTravail?: string;
      };
      if (d.titre) setTitre(d.titre);
      if (d.courte) setCourte(d.courte);
      if (d.complete) setComplete(d.complete);
      if (d.lieu) setLieu(d.lieu);
      if (d.contrat) setContrat(d.contrat);
      if (d.periode) setPeriode(d.periode);
      if (d.montant) setMontant(d.montant);
      if (d.heuresSemaine) setHeuresSemaine(d.heuresSemaine);
      if (d.tempsTravail) setTempsTravail(d.tempsTravail);
    } catch {
      // ignore
    }
  }, [edition]);

  // Persiste le brouillon à chaque modification
  useEffect(() => {
    if (edition) {
      return;
    }
    try {
      localStorage.setItem(
        CLE_BROUILLON_OFFRE,
        JSON.stringify({
          titre,
          courte,
          complete,
          lieu,
          contrat,
          periode,
          montant,
          heuresSemaine,
          tempsTravail,
        }),
      );
    } catch {
      // ignore
    }
  }, [edition, titre, courte, complete, lieu, contrat, periode, montant, heuresSemaine, tempsTravail]);

  const montantNum = parserMontant(montant);
  const heuresNum = parserMontant(heuresSemaine);
  // Heures saisies → estimation réelle ; sinon 35 h (sauf horaire où les heures sont obligatoires)
  const heuresPourEstim =
    heuresNum ?? (periode === "heure" ? null : HEURES_SEMAINE_DEFAUT);
  const estimation =
    montantNum && heuresPourEstim
      ? estimerToutesPeriodes(montantNum, periode, heuresPourEstim)
      : null;

  async function soumettre(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErreur(null);

    let salaire = offreInitiale?.salaire ?? "";
    let temps = tempsTravail;

    if (montant.trim()) {
      if (!montantNum) {
        setErreur("Indiquez un montant de rémunération valide.");
        return;
      }
      salaire = composerLibelleSalaire(montantNum, periode, symbole, pays.locale);
      if (periode === "heure") {
        if (!heuresNum) {
          setErreur("Indiquez le temps de travail (heures / semaine).");
          return;
        }
        temps = `${heuresNum} h / semaine`;
        if (estimation) {
          salaire = `${salaire} · ≈ ${composerLibelleSalaire(estimation.mensuel, "mois", symbole, pays.locale)}`;
        }
      } else if (heuresNum) {
        // Mois / an : si le recruteur indique les heures, on les stocke pour le candidat
        temps = `${heuresNum} h / semaine`;
      }
    } else if (periode === "heure" && /^(\d+(?:[.,]\d+)?)\s*h\s*\/\s*semaine/i.test(tempsTravail)) {
      temps = tempsTravail;
    }

    const donnees = {
      titre: titre.trim(),
      descriptionCourte: courte.trim(),
      descriptionComplete: complete.trim(),
      salaire,
      lieu: lieu.trim(),
      tempsTravail: temps,
      typeContrat: contrat,
    };

    setEnvoi(true);
    try {
      const { offre } = edition
        ? await apiMajOffre(token, offreInitiale!.id, donnees)
        : await apiPublierOffre(token, donnees);
      try {
        localStorage.removeItem(CLE_BROUILLON_OFFRE);
      } catch {
        // ignore
      }
      onPubliee(offre);
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Publication impossible.");
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-marque">
          {edition ? t("entreprise.publier.editer") : t("entreprise.publier.titre")}
        </h2>
        <button
          type="button"
          onClick={onAnnuler}
          className="text-[13px] font-semibold text-muet hover:text-marque"
        >
          {t("common.annuler")}
        </button>
      </div>
      <form
        className="rounded-2xl border border-ligne bg-surface p-5 sm:p-6"
        onSubmit={(e) => {
          void soumettre(e);
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <ChampTexte libelle="Titre" nom="titre" requis valeur={titre} onChange={setTitre} />
          </div>
          <div className="sm:col-span-2">
            <ChampZoneTexte
              libelle={t("offre.profil")}
              nom="courte"
              lignes={3}
              requis
              valeur={courte}
              onChange={setCourte}
              placeholder="Compétences, expérience, formation…"
            />
          </div>
          <div className="sm:col-span-2">
            <ChampZoneTexte
              libelle={t("offre.description")}
              nom="complete"
              lignes={5}
              requis
              valeur={complete}
              onChange={setComplete}
              placeholder="Missions, contexte, équipe…"
            />
          </div>

          <div className="sm:col-span-2">
            <p className="mb-1.5 text-[13px] tracking-wide text-muet">
              {t("offre.remuneration")} ({libelleDevise})
            </p>
            {edition && offreInitiale?.salaire && !montant ? (
              <p className="mb-2 text-[13px] text-muet">
                Actuel : <strong className="text-encre">{offreInitiale.salaire}</strong> — laissez
                vide pour conserver, ou saisissez un nouveau montant.
              </p>
            ) : null}
            <div className="grid gap-3 sm:grid-cols-[1fr_10rem]">
              <ChampTexte
                libelle={t("entreprise.publier.montant")}
                nom="montant"
                type="text"
                placeholder={periode === "heure" ? "Ex. 15" : "Ex. 35000"}
                valeur={montant}
                onChange={setMontant}
              />
              <ChampSelect
                libelle={t("entreprise.publier.periode")}
                nom="periode"
                valeur={periode}
                onChange={(v) => setPeriode(v as PeriodeRemuneration)}
                options={PERIODES_REMUNERATION.map((p) => ({
                  valeur: p.valeur,
                  libelle: p.libelle,
                }))}
              />
            </div>
          </div>

          <div className="sm:col-span-2 grid gap-3 sm:grid-cols-2">
            <ChampTexte
              libelle={t("entreprise.publier.heures")}
              nom="heuresSemaine"
              type="text"
              valeur={heuresSemaine}
              onChange={setHeuresSemaine}
              placeholder={`Ex. ${HEURES_SEMAINE_DEFAUT}`}
              requis={periode === "heure"}
            />
            {periode !== "heure" ? (
              <ChampSelect
                libelle={t("entreprise.publier.temps")}
                nom="temps"
                valeur={tempsTravail}
                onChange={setTempsTravail}
                options={[
                  { valeur: "Temps plein", libelle: "Temps plein" },
                  { valeur: "Temps partiel", libelle: "Temps partiel" },
                  { valeur: "À définir", libelle: "À définir" },
                  ...(offreInitiale?.tempsTravail &&
                  !["Temps plein", "Temps partiel", "À définir"].includes(offreInitiale.tempsTravail)
                    ? [{ valeur: offreInitiale.tempsTravail, libelle: offreInitiale.tempsTravail }]
                    : []),
                ]}
              />
            ) : (
              <p className="self-end pb-2 text-[12px] leading-5 text-muet">
                Obligatoire en rémunération horaire. Sert aussi aux estimations candidat.
              </p>
            )}
          </div>
          {periode !== "heure" ? (
            <p className="-mt-1 text-[12px] leading-5 text-muet sm:col-span-2">
              Si tu indiques les heures / semaine, le candidat verra une estimation précise.
              Sinon on part sur {HEURES_SEMAINE_DEFAUT} h (temps plein).
            </p>
          ) : null}

          <div className="sm:col-span-2 rounded-xl bg-fond px-4 py-3 text-[13px] leading-6 text-muet">
            {estimation ? (
              <>
                <p className="font-semibold text-encre">{t("entreprise.publier.estimation")}</p>
                <p>
                  ≈{" "}
                  {composerLibelleSalaire(estimation.horaire, "heure", symbole, pays.locale)}
                </p>
                <p>
                  ≈{" "}
                  {composerLibelleSalaire(estimation.mensuel, "mois", symbole, pays.locale)}
                </p>
                <p>
                  ≈{" "}
                  {composerLibelleSalaire(estimation.annuel, "annee", symbole, pays.locale)}
                </p>
                <p className="mt-1 text-[12px]">
                  Base : {heuresPourEstim} h/semaine × 52 semaines
                  {!heuresNum
                    ? ` (hypothèse ${HEURES_SEMAINE_DEFAUT} h — précise les heures pour un calcul exact)`
                    : ""}
                </p>
              </>
            ) : periode === "heure" ? (
              <p>Saisissez le taux horaire et les heures / semaine pour estimer le salaire.</p>
            ) : (
              <p>Saisissez un montant pour voir l&apos;équivalent heure / mois / an.</p>
            )}
          </div>

          <ChampTexte
            libelle={t("entreprise.publier.lieu")}
            nom="lieu"
            requis
            valeur={lieu}
            onChange={setLieu}
          />
          <ChampSelect
            libelle={t("entreprise.publier.contrat")}
            nom="contrat"
            valeur={contrat}
            onChange={setContrat}
            options={TYPES_CONTRAT.map((c) => ({ valeur: c, libelle: c }))}
          />
        </div>
        {erreur ? (
          <p className="mt-4 rounded-xl bg-refus/10 px-4 py-3 text-[14px] text-refus">{erreur}</p>
        ) : null}
        <div className="mt-5 flex flex-wrap gap-2">
          <Bouton type="submit" disabled={envoi}>
            {envoi
              ? t("common.chargement")
              : edition
                ? t("common.enregistrer")
                : t("common.publier")}
          </Bouton>
          <Bouton variante="secondaire" type="button" onClick={onAnnuler}>
            {t("common.retour")}
          </Bouton>
        </div>
      </form>
    </div>
  );
}
