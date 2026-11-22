/**
 * @fileoverview Back-office admin.
 *
 * But
 *   Tableau de bord, vérification entreprises, CRUD listes (offres, comptes…).
 *   Tout passe par /api/admin/* avec JWT admin.
 */
"use client";

/**
 * Admin branché sur /api/admin/* (JWT role=admin).
 * La file de vérification met à jour companies.verification_status.
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  BadgeStatut,
  BadgeVerification,
  Bouton,
  ChampZoneTexte,
} from "@/composants/ui";
import {
  apiAdminCandidatures,
  apiAdminComptes,
  apiAdminEntreprises,
  apiAdminMajEntreprise,
  apiAdminOffres,
  apiAdminSupprimerCompte,
  apiAdminSupprimerEntreprise,
  apiAdminSupprimerOffre,
} from "@/lib/api";
import { formaterDate } from "@/lib/format";
import {
  estReclamation,
  lireReclamation,
  preuveEstStockee,
  urlPreuveReclamation,
} from "@/lib/reclamation";
import { lireSession } from "@/lib/session";
import type { Candidature } from "@/types/candidature";
import { LIBELLES_STATUT } from "@/types/candidature";
import type { Entreprise, StatutVerificationEntreprise } from "@/types/entreprise";
import { LIBELLES_VERIFICATION } from "@/types/entreprise";
import type { Offre } from "@/types/offre";
import type { RoleCompte } from "@/types/personne";

type Onglet = "tableau" | "verification" | "offres" | "entreprises" | "comptes" | "candidatures";

type CompteAdmin = {
  id: number;
  prenom: string;
  nom: string;
  email: string;
  role: RoleCompte;
  entrepriseId: number | null;
};

const ONGLETS: { id: Onglet; libelle: string }[] = [
  { id: "tableau", libelle: "Tableau de bord" },
  { id: "verification", libelle: "Vérifications" },
  { id: "offres", libelle: "Offres" },
  { id: "entreprises", libelle: "Entreprises" },
  { id: "comptes", libelle: "Comptes" },
  { id: "candidatures", libelle: "Candidatures" },
];

const PAR_PAGE = 6;

export function EcranAdministration() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [onglet, setOnglet] = useState<Onglet>("tableau");
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [offres, setOffres] = useState<Offre[]>([]);
  const [comptes, setComptes] = useState<CompteAdmin[]>([]);
  const [candidatures, setCandidatures] = useState<Candidature[]>([]);
  const [motifRefus, setMotifRefus] = useState("");
  const [entrepriseActiveId, setEntrepriseActiveId] = useState<number | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    const session = lireSession();
    if (!session || session.user.role !== "admin") {
      router.replace("/connexion");
      return;
    }
    setToken(session.token);

    let annule = false;
    async function charger() {
      setChargement(true);
      setErreur(null);
      try {
        const [resEnt, resOff, resComptes, resCands] = await Promise.all([
          apiAdminEntreprises(session!.token),
          apiAdminOffres(session!.token),
          apiAdminComptes(session!.token),
          apiAdminCandidatures(session!.token),
        ]);
        if (annule) {
          return;
        }
        setEntreprises(resEnt.entreprises);
        setOffres(resOff.offres);
        setComptes(resComptes.comptes);
        setCandidatures(resCands.candidatures);
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

  const enAttente = useMemo(
    () =>
      entreprises
        .filter((e) => e.statutVerification === "en_attente")
        .sort((a, b) => {
          const ra = estReclamation(a.motifRefus) ? 1 : 0;
          const rb = estReclamation(b.motifRefus) ? 1 : 0;
          if (ra !== rb) {
            return rb - ra;
          }
          return b.dateInscription.localeCompare(a.dateInscription);
        }),
    [entreprises],
  );

  const active =
    entreprises.find((e) => e.id === entrepriseActiveId) ?? enAttente[0] ?? null;

  async function validerEntreprise(id: number) {
    if (!token) {
      return;
    }
    // Optimistic UI : mise à jour immédiate, API en arrière-plan
    const precedent = entreprises.find((e) => e.id === id);
    setEntreprises((liste) =>
      liste.map((e) =>
        e.id === id ? { ...e, statutVerification: "validee", motifRefus: "" } : e,
      ),
    );
    try {
      const { entreprise } = await apiAdminMajEntreprise(token, id, {
        statutVerification: "validee",
      });
      setEntreprises((liste) => liste.map((e) => (e.id === id ? entreprise : e)));
    } catch (err) {
      if (precedent) {
        setEntreprises((liste) => liste.map((e) => (e.id === id ? precedent : e)));
      }
      setErreur(err instanceof Error ? err.message : "Validation impossible.");
    }
  }

  async function refuserEntreprise(id: number, motif: string) {
    const trim = motif.trim();
    if (!token) {
      return;
    }
    if (!trim) {
      setErreur("Le motif du refus est obligatoire.");
      return;
    }
    setErreur(null);
    const precedent = entreprises.find((e) => e.id === id);
    setEntreprises((liste) =>
      liste.map((e) =>
        e.id === id ? { ...e, statutVerification: "refusee", motifRefus: trim } : e,
      ),
    );
    setMotifRefus("");
    try {
      const { entreprise } = await apiAdminMajEntreprise(token, id, {
        statutVerification: "refusee",
        motifRefus: trim,
      });
      setEntreprises((liste) => liste.map((e) => (e.id === id ? entreprise : e)));
    } catch (err) {
      if (precedent) {
        setEntreprises((liste) => liste.map((e) => (e.id === id ? precedent : e)));
      }
      setErreur(err instanceof Error ? err.message : "Refus impossible.");
    }
  }

  if (!token && chargement) {
    return (
      <main className="flex flex-1 items-center justify-center bg-fond text-muet">
        Vérification de la session…
      </main>
    );
  }

  return (
    <main className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain bg-fond">
      <div className="mx-auto w-full max-w-[90rem] px-4 py-6 sm:px-8 lg:px-10">
        <header className="flex flex-col gap-2 border-b border-ligne pb-5">
          <p className="text-[13px] font-semibold uppercase tracking-wider text-muet">
            Administration
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight text-marque sm:text-3xl">
            Supervision de la plateforme
          </h1>
          <p className="max-w-2xl text-[15px] text-muet">
            CRUD sur les données, et validation des comptes entreprise avant qu&apos;ils
            puissent publier des offres.
          </p>
        </header>

        <nav
          aria-label="Outils admin"
          className="mt-5 flex gap-1 overflow-x-auto border-b border-ligne pb-px"
        >
          {ONGLETS.map((item) => {
            const actif = onglet === item.id;
            const badge =
              item.id === "verification" && enAttente.length > 0 ? enAttente.length : null;
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
                {badge != null ? (
                  <span className="ml-2 rounded-full bg-marque px-1.5 py-0.5 text-[11px] text-white">
                    {badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        <div className="py-6">
          {chargement ? <p className="mb-4 text-[14px] text-muet">Chargement…</p> : null}
          {erreur ? (
            <p className="mb-4 rounded-xl bg-refus/10 px-4 py-3 text-[14px] text-refus">
              {erreur}{" "}
              <Link href="/connexion" className="font-semibold underline">
                Se reconnecter
              </Link>
            </p>
          ) : null}
          {onglet === "tableau" ? (
            <VueTableau
              stats={{
                offres: offres.length,
                entreprises: entreprises.length,
                comptes: comptes.length,
                candidatures: candidatures.length,
                aVerifier: enAttente.length,
              }}
              recentes={enAttente.slice(0, 3)}
              onVoirVerifications={() => setOnglet("verification")}
            />
          ) : null}

          {onglet === "verification" ? (
            <VueVerification
              liste={enAttente}
              active={active?.statutVerification === "en_attente" ? active : enAttente[0] ?? null}
              motifRefus={motifRefus}
              token={token ?? ""}
              onMotif={setMotifRefus}
              onChoisir={setEntrepriseActiveId}
              onValider={(id) => {
                void validerEntreprise(id);
              }}
              onRefuser={(id, motif) => {
                void refuserEntreprise(id, motif);
              }}
            />
          ) : null}

          {onglet === "offres" && token ? (
            <TableOffres
              offres={offres}
              onSupprimer={async (id) => {
                await apiAdminSupprimerOffre(token, id);
                setOffres((liste) => liste.filter((o) => o.id !== id));
              }}
            />
          ) : null}
          {onglet === "entreprises" && token ? (
            <TableEntreprises
              entreprises={entreprises}
              onOuvrirVerification={(id) => {
                setEntrepriseActiveId(id);
                setOnglet("verification");
              }}
              onSupprimer={async (id) => {
                await apiAdminSupprimerEntreprise(token, id);
                setEntreprises((liste) => liste.filter((e) => e.id !== id));
              }}
            />
          ) : null}
          {onglet === "comptes" && token ? (
            <TableComptes
              comptes={comptes}
              onSupprimer={async (id) => {
                await apiAdminSupprimerCompte(token, id);
                setComptes((liste) => liste.filter((c) => c.id !== id));
              }}
            />
          ) : null}
          {onglet === "candidatures" ? (
            <TableCandidatures candidatures={candidatures} />
          ) : null}
        </div>
      </div>
    </main>
  );
}

function VueTableau({
  stats,
  recentes,
  onVoirVerifications,
}: {
  stats: {
    offres: number;
    entreprises: number;
    comptes: number;
    candidatures: number;
    aVerifier: number;
  };
  recentes: Entreprise[];
  onVoirVerifications: () => void;
}) {
  return (
    <div className="flex flex-col gap-8">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <CarteStat valeur={String(stats.offres)} libelle="Offres" />
        <CarteStat valeur={String(stats.entreprises)} libelle="Entreprises" />
        <CarteStat valeur={String(stats.comptes)} libelle="Comptes" />
        <CarteStat valeur={String(stats.candidatures)} libelle="Candidatures" />
        <CarteStat
          valeur={String(stats.aVerifier)}
          libelle="À vérifier"
          accent={stats.aVerifier > 0}
        />
      </section>

      <section className="rounded-2xl border border-ligne bg-surface p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-marque">Identités entreprise à vérifier</h2>
            <p className="mt-1 text-[14px] text-muet">
              Tant qu&apos;elles ne sont pas validées, ces boîtes ne peuvent pas publier.
            </p>
          </div>
          <Bouton onClick={onVoirVerifications}>Ouvrir la file</Bouton>
        </div>
        {recentes.length === 0 ? (
          <p className="text-[15px] text-muet">Aucune demande en attente.</p>
        ) : (
          <ul className="divide-y divide-ligne">
            {recentes.map((e) => (
              <li key={e.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-semibold text-encre">{e.nom}</p>
                  <p className="text-[13px] text-muet">
                    {e.ville} · {e.contactEmail} · inscrite le {formaterDate(e.dateInscription)}
                  </p>
                </div>
                <BadgeVerification statut={e.statutVerification} />
              </li>
            ))}
          </ul>
        )}
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

function VueVerification({
  liste,
  active,
  motifRefus,
  token,
  onMotif,
  onChoisir,
  onValider,
  onRefuser,
}: {
  liste: Entreprise[];
  active: Entreprise | null;
  motifRefus: string;
  token: string;
  onMotif: (v: string) => void;
  onChoisir: (id: number) => void;
  onValider: (id: number) => void;
  onRefuser: (id: number, motif: string) => void;
}) {
  const [montreRefus, setMontreRefus] = useState(false);
  const [erreurMotif, setErreurMotif] = useState<string | null>(null);
  const reclamation = active ? lireReclamation(active.motifRefus) : null;
  const nbReclamations = liste.filter((e) => estReclamation(e.motifRefus)).length;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-bold text-marque">Vérification d&apos;identité</h2>
        <p className="mt-1 max-w-2xl text-[14px] text-muet">
          Contrôler qu&apos;une entreprise est réelle avant de lui ouvrir l&apos;espace recruteur —
          pour éviter les fausses offres et les usurpations de marque. Les réclamations après
          refus remontent en tête de file.
        </p>
        {nbReclamations > 0 ? (
          <p className="mt-2 text-[13px] font-semibold text-action">
            {nbReclamations} réclamation{nbReclamations > 1 ? "s" : ""} à traiter
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:items-start">
        <ul className="flex flex-col gap-2">
          {liste.length === 0 ? (
            <li className="rounded-xl border border-ligne bg-surface px-4 py-8 text-center text-[14px] text-muet">
              Aucune entreprise en attente.
            </li>
          ) : (
            liste.map((e) => {
              const selectionnee = active?.id === e.id;
              const dossierReclamation = estReclamation(e.motifRefus);
              return (
                <li key={e.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onChoisir(e.id);
                      setMontreRefus(false);
                      setErreurMotif(null);
                    }}
                    className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                      selectionnee
                        ? "border-marque bg-surface shadow-sm"
                        : "border-ligne bg-surface hover:border-marque/30"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-[15px] font-semibold text-encre">{e.nom}</p>
                      {dossierReclamation ? (
                        <span className="shrink-0 rounded-full bg-action/10 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-action">
                          Réclamation
                        </span>
                      ) : (
                        <BadgeVerification statut={e.statutVerification} />
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-[13px] text-muet">
                      {e.ville} · {e.secteur}
                    </p>
                    <p className="mt-1 text-[12px] text-muet">
                      Inscrite le {formaterDate(e.dateInscription)}
                    </p>
                  </button>
                </li>
              );
            })
          )}
        </ul>

        {!active ? (
          <section className="rounded-2xl border border-ligne bg-surface">
            <p className="px-6 py-14 text-center text-[15px] text-muet">
              Sélectionnez un dossier à examiner.
            </p>
          </section>
        ) : (
          <section
            key={active.id}
            className="rounded-2xl border border-ligne bg-surface lg:sticky lg:top-4 lg:max-h-[calc(100dvh-var(--h-entete)-var(--h-pied)-1rem)] lg:overflow-y-auto"
          >
            <div className="flex flex-col gap-5 p-5 sm:p-6">
              <header className="border-b border-ligne pb-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-bold text-marque">{active.nom}</h3>
                    <p className="mt-1 text-[14px] text-muet">
                      {active.secteur} — {active.ville}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {reclamation ? (
                      <span className="rounded-full bg-action/10 px-2.5 py-0.5 text-[12px] font-semibold tracking-wide text-action">
                        Réclamation
                      </span>
                    ) : null}
                    <BadgeVerification statut={active.statutVerification} />
                  </div>
                </div>
              </header>

              {reclamation ? (
                <div className="rounded-xl border border-action/25 bg-action/5 p-4">
                  <p className="text-[12px] font-bold uppercase tracking-wide text-action">
                    Réclamation à traiter
                  </p>
                  <p className="mt-1 text-[13px] text-muet">
                    Ce dossier a déjà été refusé. L&apos;entreprise demande un nouvel examen.
                  </p>
                  {reclamation.motifPrecedent ? (
                    <div className="mt-3 rounded-lg bg-surface px-3 py-2">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-muet">
                        Motif du refus précédent
                      </p>
                      <p className="mt-1 text-[14px] leading-6 text-encre">
                        {reclamation.motifPrecedent}
                      </p>
                    </div>
                  ) : null}
                  <dl className="mt-3 grid gap-3 sm:grid-cols-2 text-[14px]">
                    <div>
                      <dt className="text-[11px] font-semibold uppercase tracking-wide text-muet">
                        Téléphone
                      </dt>
                      <dd className="mt-1 font-semibold text-encre">
                        {reclamation.telephone || "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[11px] font-semibold uppercase tracking-wide text-muet">
                        Preuve jointe
                      </dt>
                      <dd className="mt-1 text-encre">
                        {reclamation.preuve && preuveEstStockee(reclamation.preuve) ? (
                          <a
                            href={urlPreuveReclamation(reclamation.preuve, token)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-action underline underline-offset-4 hover:text-marque"
                          >
                            Ouvrir / télécharger
                          </a>
                        ) : reclamation.preuve ? (
                          <span className="text-refus">
                            Fichier non enregistré ({reclamation.preuve}). Refusez puis
                            demandez une nouvelle réclamation avec la preuve jointe.
                          </span>
                        ) : (
                          "Aucune"
                        )}
                      </dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-[11px] font-semibold uppercase tracking-wide text-muet">
                        Message de l&apos;entreprise
                      </dt>
                      <dd className="mt-1 whitespace-pre-wrap text-[15px] leading-7 text-encre">
                        {reclamation.message || "—"}
                      </dd>
                    </div>
                  </dl>
                </div>
              ) : null}

              <dl className="grid gap-3 sm:grid-cols-2 text-[14px]">
                <div>
                  <dt className="text-[12px] font-semibold uppercase tracking-wide text-muet">
                    Contact
                  </dt>
                  <dd className="mt-1 font-semibold text-encre">{active.contactNom}</dd>
                </div>
                <div>
                  <dt className="text-[12px] font-semibold uppercase tracking-wide text-muet">
                    E-mail
                  </dt>
                  <dd className="mt-1 text-encre">{active.contactEmail}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-[12px] font-semibold uppercase tracking-wide text-muet">
                    Site web
                  </dt>
                  <dd className="mt-1 break-all text-encre">{active.siteWeb || "—"}</dd>
                </div>
              </dl>

              <div>
                <p className="text-[12px] font-semibold uppercase tracking-wide text-muet">
                  Présentation
                </p>
                <p className="mt-2 text-[15px] leading-7 text-encre">{active.presentation}</p>
              </div>

              <div className="rounded-xl bg-fond px-4 py-3 text-[13px] leading-6 text-muet">
                {reclamation
                  ? "Relisez le motif précédent et le message de réclamation avant de valider ou de refuser à nouveau."
                  : "Points à vérifier : cohérence du nom avec une marque connue, domaine e-mail / site, sérieux de la présentation. En cas de doute, refuser."}
              </div>

              <div className="flex flex-col gap-3 border-t border-ligne pt-4">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onValider(active.id)}
                    className="h-10 rounded-lg bg-marque px-4 text-[14px] font-semibold text-white hover:bg-marque-hover"
                  >
                    Valider l&apos;accès
                  </button>
                  {!montreRefus ? (
                    <button
                      type="button"
                      onClick={() => setMontreRefus(true)}
                      className="h-10 rounded-lg border border-refus px-4 text-[14px] font-semibold text-refus hover:bg-refus/5"
                    >
                      Refuser
                    </button>
                  ) : null}
                </div>

                {montreRefus ? (
                  <div className="rounded-xl border border-refus/20 bg-refus/5 p-4">
                    <ChampZoneTexte
                      libelle="Motif du refus"
                      nom="motif-verif"
                      lignes={3}
                      valeur={motifRefus}
                      onChange={(valeur) => {
                        setErreurMotif(null);
                        onMotif(valeur);
                      }}
                      placeholder="Ex. identité non vérifiable, suspicion d'usurpation…"
                      requis
                    />
                    {erreurMotif ? (
                      <p className="mt-2 text-[13px] font-medium text-refus" role="alert">
                        {erreurMotif}
                      </p>
                    ) : null}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (!motifRefus.trim()) {
                            setErreurMotif("Le motif du refus est obligatoire.");
                            return;
                          }
                          setErreurMotif(null);
                          onRefuser(active.id, motifRefus);
                        }}
                        className="h-9 rounded-lg bg-refus px-3 text-[13px] font-semibold text-white"
                      >
                        Confirmer le refus
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMontreRefus(false);
                          setErreurMotif(null);
                        }}
                        className="h-9 rounded-lg border border-ligne bg-surface px-3 text-[13px] font-medium"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function TableOffres({
  offres,
  onSupprimer,
}: {
  offres: Offre[];
  onSupprimer: (id: number) => Promise<void>;
}) {
  return (
    <TableCrud
      titre="Offres"
      description="Lister et supprimer une offre. La création et la modification se font dans l’espace entreprise."
      entetes={["Titre", "Entreprise", "Lieu", "Contrat"]}
      onSupprimer={onSupprimer}
      autoriserModification={false}
      lignes={offres.map((o) => ({
        id: o.id,
        cellules: [o.titre, o.entreprise.nom, o.lieu, o.typeContrat],
      }))}
    />
  );
}

function TableEntreprises({
  entreprises,
  onOuvrirVerification,
  onSupprimer,
}: {
  entreprises: Entreprise[];
  onOuvrirVerification: (id: number) => void;
  onSupprimer: (id: number) => Promise<void>;
}) {
  const [filtre, setFiltre] = useState<StatutVerificationEntreprise | "tous">("tous");
  const liste =
    filtre === "tous"
      ? entreprises
      : entreprises.filter((e) => e.statutVerification === filtre);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-marque">Entreprises</h2>
          <p className="mt-1 text-[14px] text-muet">Toutes les boîtes, quel que soit le statut.</p>
        </div>
        <label className="flex flex-col gap-1 text-[13px]">
          <span className="font-semibold text-muet">Statut</span>
          <select
            value={filtre}
            onChange={(e) => setFiltre(e.target.value as StatutVerificationEntreprise | "tous")}
            className="h-10 rounded-lg border border-ligne bg-surface px-3 text-[14px] outline-none focus:border-marque"
          >
            <option value="tous">Tous</option>
            {(Object.keys(LIBELLES_VERIFICATION) as StatutVerificationEntreprise[]).map((s) => (
              <option key={s} value={s}>
                {LIBELLES_VERIFICATION[s]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <TableCrud
        titre=""
        description=""
        sansEnTete
        onSupprimer={onSupprimer}
        entetes={["Nom", "Ville", "Contact", "Statut"]}
        lignes={liste.map((e) => ({
          id: e.id,
          cellules: [e.nom, e.ville, e.contactEmail, LIBELLES_VERIFICATION[e.statutVerification]],
          statut: e.statutVerification,
        }))}
        renderStatut={(ligne) =>
          ligne.statut ? <BadgeVerification statut={ligne.statut} /> : null
        }
        actionExtra={(id) => {
          const cible = entreprises.find((e) => e.id === id);
          if (cible?.statutVerification !== "en_attente") {
            return null;
          }
          return (
            <button
              type="button"
              className="text-marque underline underline-offset-4"
              onClick={() => onOuvrirVerification(id)}
            >
              Vérifier
            </button>
          );
        }}
      />
    </div>
  );
}

function TableComptes({
  comptes,
  onSupprimer,
}: {
  comptes: CompteAdmin[];
  onSupprimer: (id: number) => Promise<void>;
}) {
  return (
    <TableCrud
      titre="Comptes"
      description="Candidats, contacts entreprise et admin. Création via les pages d’inscription."
      entetes={["Nom", "E-mail", "Rôle"]}
      onSupprimer={onSupprimer}
      lignes={comptes.map((p) => ({
        id: p.id,
        cellules: [`${p.prenom} ${p.nom}`, p.email, p.role],
      }))}
    />
  );
}

function TableCandidatures({ candidatures }: { candidatures: Candidature[] }) {
  return (
    <TableCrud
      titre="Candidatures"
      description="Consultation des candidatures de la plateforme."
      entetes={["Candidat", "Offre", "Statut"]}
      autoriserModification={false}
      autoriserSuppression={false}
      lignes={candidatures.map((c) => ({
        id: c.id,
        cellules: [c.nomCandidat, c.titreOffre, LIBELLES_STATUT[c.statut]],
        statutCandidature: c.statut,
      }))}
      renderStatutCandidature={(ligne) =>
        ligne.statutCandidature ? <BadgeStatut statut={ligne.statutCandidature} /> : null
      }
    />
  );
}

type LigneTable = {
  id: number;
  cellules: string[];
  statut?: StatutVerificationEntreprise;
  statutCandidature?: import("@/types/candidature").StatutCandidature;
};

function TableCrud({
  titre,
  description,
  entetes,
  lignes,
  champsCreation,
  sansEnTete = false,
  actionExtra,
  renderStatut,
  renderStatutCandidature,
  onSupprimer,
  autoriserModification = true,
  autoriserSuppression = true,
}: {
  titre: string;
  description: string;
  entetes: string[];
  lignes: LigneTable[];
  champsCreation?: ReactNode;
  sansEnTete?: boolean;
  actionExtra?: (id: number) => ReactNode;
  renderStatut?: (ligne: LigneTable) => ReactNode;
  renderStatutCandidature?: (ligne: LigneTable) => ReactNode;
  onSupprimer?: (id: number) => Promise<void>;
  autoriserModification?: boolean;
  autoriserSuppression?: boolean;
}) {
  const [page, setPage] = useState(1);
  const [mode, setMode] = useState<"idle" | "creer" | "modifier">("idle");
  const [ligne, setLigne] = useState<number | null>(null);
  const [aSupprimer, setASupprimer] = useState<number | null>(null);
  const [erreurSuppr, setErreurSuppr] = useState<string | null>(null);
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);
  const peutCreer = Boolean(champsCreation);
  const peutSupprimer = autoriserSuppression && Boolean(onSupprimer);
  const aDesActions = autoriserModification || peutSupprimer || Boolean(actionExtra);

  const totalPages = Math.max(1, Math.ceil(lignes.length / PAR_PAGE));
  const pageActuelle = Math.min(page, totalPages);
  const tranche = lignes.slice((pageActuelle - 1) * PAR_PAGE, pageActuelle * PAR_PAGE);

  return (
    <div className="flex flex-col gap-4">
      {!sansEnTete ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-marque">{titre}</h2>
            {description ? <p className="mt-1 text-[14px] text-muet">{description}</p> : null}
          </div>
          {peutCreer ? (
            <Bouton
              onClick={() => {
                setMode("creer");
                setLigne(null);
                setASupprimer(null);
              }}
            >
              Créer
            </Bouton>
          ) : null}
        </div>
      ) : null}

      <div
        className={`grid gap-4 lg:items-start ${
          aDesActions || peutCreer
            ? "lg:grid-cols-[minmax(0,1fr)_minmax(16rem,22rem)]"
            : ""
        }`}
      >
        <div className="overflow-x-auto rounded-2xl border border-ligne bg-surface">
          <table className="w-full text-left text-[14px]">
            <thead>
              <tr className="border-b border-ligne text-[12px] uppercase tracking-wide text-muet">
                {entetes.map((entete) => (
                  <th key={entete} className="px-4 py-3 font-normal">
                    {entete}
                  </th>
                ))}
                {aDesActions ? (
                  <th className="px-4 py-3 font-normal">Actions</th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {tranche.map((item) => (
                <tr key={item.id} className="border-b border-ligne last:border-0">
                  {item.cellules.map((cellule, index) => {
                    const estDerniere = index === item.cellules.length - 1;
                    const badgeVerif = estDerniere && renderStatut ? renderStatut(item) : null;
                    const badgeCand =
                      estDerniere && renderStatutCandidature
                        ? renderStatutCandidature(item)
                        : null;
                    return (
                      <td key={`${item.id}-${index}`} className="px-4 py-3 align-top">
                        {badgeVerif ?? badgeCand ?? cellule}
                      </td>
                    );
                  })}
                  {aDesActions ? (
                    <td className="px-4 py-3 align-top whitespace-nowrap">
                      {autoriserModification ? (
                        <button
                          type="button"
                          className="text-encre underline underline-offset-4"
                          onClick={() => {
                            setLigne(item.id);
                            setMode("modifier");
                            setASupprimer(null);
                          }}
                        >
                          Modifier
                        </button>
                      ) : null}
                      {autoriserModification && peutSupprimer ? (
                        <span className="mx-2 text-ligne">·</span>
                      ) : null}
                      {peutSupprimer ? (
                        <button
                          type="button"
                          className="text-refus underline underline-offset-4"
                          onClick={() => {
                            setASupprimer(item.id);
                            setMode("idle");
                          }}
                        >
                          Supprimer
                        </button>
                      ) : null}
                      {actionExtra ? (
                        <>
                          {autoriserModification || peutSupprimer ? (
                            <span className="mx-2 text-ligne">·</span>
                          ) : null}
                          {actionExtra(item.id)}
                        </>
                      ) : null}
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex items-center justify-between border-t border-ligne px-4 py-3 text-[13px] text-muet">
            <p>
              Page {pageActuelle} / {totalPages}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                disabled={pageActuelle === 1}
                onClick={() => setPage((p) => p - 1)}
                className="disabled:opacity-40"
              >
                Précédent
              </button>
              <button
                type="button"
                disabled={pageActuelle === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="disabled:opacity-40"
              >
                Suivant
              </button>
            </div>
          </div>
        </div>

        {aDesActions || peutCreer ? (
          <aside className="rounded-2xl border border-ligne bg-surface p-5 lg:sticky lg:top-4">
            {aSupprimer !== null ? (
              <div className="flex flex-col gap-4">
                <h3 className="text-lg font-bold text-marque">Supprimer ?</h3>
                <p className="text-[14px] text-muet">
                  Cette action est définitive (cascade SQL selon les clés étrangères).
                </p>
                {erreurSuppr ? (
                  <p className="rounded-xl bg-refus/10 px-3 py-2 text-[13px] text-refus">
                    {erreurSuppr}
                  </p>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  <Bouton
                    disabled={suppressionEnCours || !onSupprimer}
                    onClick={() => {
                      if (!onSupprimer) {
                        return;
                      }
                      setSuppressionEnCours(true);
                      setErreurSuppr(null);
                      void onSupprimer(aSupprimer)
                        .then(() => {
                          setASupprimer(null);
                        })
                        .catch((err: unknown) => {
                          setErreurSuppr(
                            err instanceof Error ? err.message : "Suppression impossible.",
                          );
                        })
                        .finally(() => {
                          setSuppressionEnCours(false);
                        });
                    }}
                  >
                    {suppressionEnCours ? "Suppression…" : "Confirmer"}
                  </Bouton>
                  <Bouton
                    variante="secondaire"
                    onClick={() => {
                      setASupprimer(null);
                      setErreurSuppr(null);
                    }}
                  >
                    Annuler
                  </Bouton>
                </div>
              </div>
            ) : mode === "idle" ? (
              <p className="text-[15px] leading-7 text-muet">
                {peutSupprimer
                  ? "Choisissez une ligne pour la supprimer."
                  : "Consultation uniquement. Les actions métier se font ailleurs (vérification, espace entreprise)."}
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                <h3 className="text-lg font-bold text-marque">
                  {mode === "creer" ? "Créer" : `Modifier #${ligne}`}
                </h3>
                <p className="text-[14px] text-muet">
                  {mode === "creer"
                    ? "Création manuelle non exposée ici : préfère les écrans métier (inscription, espace entreprise)."
                    : "Édition manuelle non exposée ici. Pour une entreprise en attente, passez par la file de vérification."}
                </p>
                {champsCreation ? (
                  <div className="pointer-events-none grid gap-3 opacity-50 sm:grid-cols-2">
                    {champsCreation}
                  </div>
                ) : null}
                <Bouton
                  variante="silencieux"
                  onClick={() => {
                    setMode("idle");
                    setLigne(null);
                  }}
                >
                  Fermer
                </Bouton>
              </div>
            )}
          </aside>
        ) : null}
      </div>
    </div>
  );
}
