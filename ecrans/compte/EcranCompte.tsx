/**
 * @fileoverview Espace candidat (/compte).
 *
 * But
 *   Profil, CV, suivi des candidatures. JWT role=candidat.
 */
"use client";

/**
 * Espace candidat branché sur GET /api/candidatures (JWT).
 * Sans session candidat → redirection vers /connexion.
 */
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ParcoursCandidature } from "@/composants/entreprise/ParcoursCandidature";
import {
  BadgeStatut,
  Bouton,
  ChampFichier,
  ChampSelectRecherche,
  ChampTelephone,
  ChampTexte,
} from "@/composants/ui";
import { apiMajProfil, apiMesCandidatures, apiUploadCv, type UtilisateurApi } from "@/lib/api";
import { formaterDate, formaterDateRelative } from "@/lib/format";
import { useLocale } from "@/lib/i18n/contexte";
import { hrefVersOffre } from "@/lib/offres";
import { LISTE_PAYS, paysParCode, type CodePays } from "@/lib/pays";
import { formaterTelephoneNational } from "@/lib/telephone";
import { ecrireSession, lireSession } from "@/lib/session";
import { validerTelephone } from "@/lib/validation";
import type { Candidature, EntretienCandidature, StatutCandidature } from "@/types/candidature";
import { LIBELLES_STATUT } from "@/types/candidature";

const LIBELLES_MODALITE: Record<EntretienCandidature["modalite"], string> = {
  visio: "Visio",
  telephone: "Téléphone",
  presentiel: "Sur site",
};

type Onglet = "tableau" | "candidatures" | "profil";

const ONGLETS: { id: Onglet; libelle: string }[] = [
  { id: "tableau", libelle: "Tableau de bord" },
  { id: "candidatures", libelle: "Mes candidatures" },
  { id: "profil", libelle: "Mon profil" },
];

export function EcranCompte() {
  const router = useRouter();
  const [user, setUser] = useState<UtilisateurApi | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [onglet, setOnglet] = useState<Onglet>("candidatures");
  const [cv, setCv] = useState<File | null>(null);
  const [filtreStatut, setFiltreStatut] = useState<StatutCandidature | "tous" | "en_cours">(
    "en_cours",
  );
  const [candidatures, setCandidatures] = useState<Candidature[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    const session = lireSession();
    if (!session || session.user.role !== "candidat") {
      router.replace("/connexion");
      return;
    }
    setUser(session.user);
    setToken(session.token);

    let annule = false;
    async function charger() {
      setChargement(true);
      setErreur(null);
      try {
        const { candidatures: liste } = await apiMesCandidatures(session!.token);
        if (annule) {
          return;
        }
        setCandidatures(liste);
        setActiveId(liste[0]?.id ?? null);
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

  const stats = useMemo(() => {
    const enCours = candidatures.filter(
      (c) => c.statut === "envoyee" || c.statut === "en_etude" || c.statut === "entretien",
    ).length;
    const entretiens = candidatures.filter((c) => c.statut === "entretien").length;
    const acceptees = candidatures.filter((c) => c.statut === "acceptee").length;
    const refusees = candidatures.filter((c) => c.statut === "refusee").length;
    return {
      total: candidatures.length,
      enCours,
      entretiens,
      acceptees,
      refusees,
    };
  }, [candidatures]);

  const filtrees = useMemo(() => {
    return candidatures.filter((c) => {
      if (filtreStatut === "tous") {
        return true;
      }
      if (filtreStatut === "en_cours") {
        return c.statut === "envoyee" || c.statut === "en_etude" || c.statut === "entretien";
      }
      return c.statut === filtreStatut;
    });
  }, [candidatures, filtreStatut]);

  const active = filtrees.find((c) => c.id === activeId) ?? filtrees[0] ?? null;

  function ouvrirCandidature(id: number) {
    setActiveId(id);
    setFiltreStatut("tous");
    setOnglet("candidatures");
  }

  if (!user) {
    return (
      <main className="flex flex-1 items-center justify-center bg-fond text-muet">
        Vérification de la session…
      </main>
    );
  }

  return (
    <main className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain bg-fond">
      <div className="mx-auto w-full max-w-[90rem] px-4 py-6 sm:px-8 lg:px-10">
        <header className="flex flex-col gap-4 border-b border-ligne pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-wider text-muet">
              Espace candidat
            </p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-marque sm:text-3xl">
              {user.prenom} {user.nom}
            </h1>
            <p className="mt-1 text-[15px] text-muet">
              Suivez vos candidatures et gardez votre profil à jour.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex h-10 items-center rounded-lg bg-marque px-4 text-sm font-semibold text-white hover:bg-marque-hover"
          >
            Voir les offres
          </Link>
        </header>

        <nav
          aria-label="Espace candidat"
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
                {item.id === "candidatures" && stats.enCours > 0 ? (
                  <span className="ml-2 rounded-full bg-marque px-1.5 py-0.5 text-[11px] text-white">
                    {stats.enCours}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        <div className="py-6">
          {chargement ? <p className="mb-4 text-[14px] text-muet">Chargement…</p> : null}
          {erreur ? (
            <p className="mb-4 rounded-xl bg-refus/10 px-4 py-3 text-[14px] text-refus">{erreur}</p>
          ) : null}
          {onglet === "tableau" ? (
            <VueTableau
              stats={stats}
              recentes={candidatures.slice(0, 5)}
              onVoirToutes={() => {
                setFiltreStatut("tous");
                setOnglet("candidatures");
              }}
              onOuvrir={ouvrirCandidature}
            />
          ) : null}
          {onglet === "candidatures" ? (
            <VueCandidatures
              liste={filtrees}
              active={active}
              filtreStatut={filtreStatut}
              onFiltre={setFiltreStatut}
              onChoisir={setActiveId}
            />
          ) : null}
          {onglet === "profil" && token ? (
            <VueProfil
              user={user}
              token={token}
              cv={cv}
              onCv={setCv}
              onUser={setUser}
            />
          ) : null}
        </div>
      </div>
    </main>
  );
}

function VueTableau({
  stats,
  recentes,
  onVoirToutes,
  onOuvrir,
}: {
  stats: {
    total: number;
    enCours: number;
    entretiens: number;
    acceptees: number;
    refusees: number;
  };
  recentes: Candidature[];
  onVoirToutes: () => void;
  onOuvrir: (id: number) => void;
}) {
  return (
    <div className="flex flex-col gap-8">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <CarteStat valeur={String(stats.enCours)} libelle="En cours" accent />
        <CarteStat valeur={String(stats.entretiens)} libelle="Entretiens" />
        <CarteStat valeur={String(stats.acceptees)} libelle="Acceptées" />
        <CarteStat valeur={String(stats.total)} libelle="Au total" />
      </section>

      <section className="rounded-2xl border border-ligne bg-surface p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-marque">Dernières candidatures</h2>
            <p className="mt-1 text-[14px] text-muet">
              Où en est chaque dossier — d&apos;un coup d&apos;œil.
            </p>
          </div>
          <button
            type="button"
            onClick={onVoirToutes}
            className="text-[13px] font-semibold text-marque hover:underline"
          >
            Tout suivre
          </button>
        </div>
        <ul className="divide-y divide-ligne">
          {recentes.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => onOuvrir(c.id)}
                className="flex w-full items-start justify-between gap-3 py-3 text-left hover:bg-fond/80"
              >
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-semibold text-encre">{c.titreOffre}</p>
                  <p className="truncate text-[13px] text-muet">
                    {c.nomEntreprise}
                    <span className="mx-2">·</span>
                    {formaterDateRelative(c.dateEnvoi)}
                  </p>
                </div>
                <BadgeStatut statut={c.statut} />
              </button>
            </li>
          ))}
        </ul>
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

function VueCandidatures({
  liste,
  active,
  filtreStatut,
  onFiltre,
  onChoisir,
}: {
  liste: Candidature[];
  active: Candidature | null;
  filtreStatut: StatutCandidature | "tous" | "en_cours";
  onFiltre: (v: StatutCandidature | "tous" | "en_cours") => void;
  onChoisir: (id: number) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-marque">Suivi des candidatures</h2>
          <p className="mt-1 text-[14px] text-muet">
            Filtrez, ouvrez un dossier, voyez à quelle étape il en est.
          </p>
        </div>
        <label className="flex flex-col gap-1 text-[13px] sm:w-56">
          <span className="font-semibold text-muet">Afficher</span>
          <select
            value={filtreStatut}
            onChange={(e) =>
              onFiltre(e.target.value as StatutCandidature | "tous" | "en_cours")
            }
            className="h-10 rounded-lg border border-ligne bg-surface px-3 text-[14px] outline-none focus:border-marque"
          >
            <option value="en_cours">En cours</option>
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
              Aucune candidature pour ce filtre.
              <br />
              <Link href="/" className="mt-2 inline-block font-semibold text-marque hover:underline">
                Parcourir les offres
              </Link>
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
                      <p className="truncate text-[15px] font-semibold text-encre">{c.titreOffre}</p>
                      <BadgeStatut statut={c.statut} />
                    </div>
                    <p className="mt-0.5 truncate text-[13px] text-muet">{c.nomEntreprise}</p>
                    <p className="mt-1 text-[12px] text-muet">{formaterDateRelative(c.dateEnvoi)}</p>
                  </button>
                </li>
              );
            })
          )}
        </ul>

        <DetailCandidatureCandidat key={active?.id ?? "vide"} active={active} />
      </div>
    </div>
  );
}

function DetailCandidatureCandidat({ active }: { active: Candidature | null }) {
  if (!active) {
    return (
      <section className="rounded-2xl border border-ligne bg-surface">
        <p className="px-6 py-14 text-center text-[15px] text-muet">
          Sélectionnez une candidature pour voir son avancement.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-ligne bg-surface lg:sticky lg:top-4 lg:max-h-[calc(100dvh-var(--h-entete)-var(--h-pied)-1rem)] lg:overflow-y-auto">
      <div className="flex flex-col gap-5 p-5 sm:p-6">
        <header className="flex flex-col gap-3 border-b border-ligne pb-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-marque">{active.titreOffre}</h2>
              <p className="mt-1 text-[14px] text-muet">{active.nomEntreprise}</p>
              <p className="mt-2 text-[13px] text-muet">
                Postulé le {formaterDate(active.dateEnvoi)}
              </p>
            </div>
            <BadgeStatut statut={active.statut} />
          </div>
          <div>
            <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-muet">
              Avancement
            </p>
            <ParcoursCandidature statut={active.statut} />
          </div>
        </header>

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
          </div>
        ) : null}

        {active.statut === "refusee" && active.motifRefus ? (
          <div className="rounded-xl border border-refus/20 bg-refus/5 px-4 py-3">
            <p className="text-[13px] font-semibold uppercase tracking-wide text-refus">
              Retour de l&apos;entreprise
            </p>
            <p className="mt-2 text-[15px] text-encre">{active.motifRefus}</p>
          </div>
        ) : null}

        {active.statut === "acceptee" ? (
          <div className="rounded-xl border border-marque/20 bg-marque/5 px-4 py-3">
            <p className="text-[13px] font-semibold uppercase tracking-wide text-marque">
              Candidature acceptée
            </p>
            <p className="mt-2 text-[15px] text-encre">
              L&apos;entreprise a validé votre dossier. La suite se passe avec eux (contrat,
              onboarding…).
            </p>
          </div>
        ) : null}

        <div>
          <h3 className="text-[13px] font-semibold uppercase tracking-wide text-muet">
            Votre message
          </h3>
          <p className="mt-2 text-[15px] leading-7 text-encre">{active.message}</p>
        </div>

        <div className="rounded-xl bg-fond px-4 py-3">
          <p className="text-[13px] text-muet">CV envoyé</p>
          <p className="mt-0.5 text-[15px] font-semibold text-encre">{active.nomFichierCv}</p>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-ligne pt-4">
          <Link
            href={hrefVersOffre(active.offreId)}
            className="inline-flex h-10 items-center rounded-lg bg-marque px-4 text-[14px] font-semibold text-white hover:bg-marque-hover"
          >
            Revoir l&apos;offre
          </Link>
        </div>
      </div>
    </section>
  );
}

function VueProfil({
  user,
  token,
  cv,
  onCv,
  onUser,
}: {
  user: UtilisateurApi;
  token: string;
  cv: File | null;
  onCv: (f: File | null) => void;
  onUser: (u: UtilisateurApi) => void;
}) {
  const { setCodePays, t } = useLocale();
  const [prenom, setPrenom] = useState(user.prenom);
  const [nom, setNom] = useState(user.nom);
  const paysInitial = ((user.pays as CodePays) || "FR") as CodePays;
  const [pays, setPays] = useState<CodePays>(paysInitial);
  const [telephone, setTelephone] = useState(() =>
    formaterTelephoneNational(user.telephone || "", paysInitial),
  );
  const [ville, setVille] = useState(user.ville || "");
  const [motDePasse, setMotDePasse] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  const optionsPays = useMemo(
    () => LISTE_PAYS.map((p) => ({ valeur: p.code, libelle: p.nom })),
    [],
  );
  const optionsVilles = useMemo(() => {
    const def = paysParCode(pays);
    return def.villes.map((v) => ({ valeur: v, libelle: v }));
  }, [pays]);

  async function soumettre(e: FormEvent) {
    e.preventDefault();
    setEnvoi(true);
    setErreur(null);
    setMessage(null);
    const errTel = validerTelephone(telephone, true, pays);
    if (errTel) {
      setErreur(errTel);
      setEnvoi(false);
      return;
    }
    try {
      let cvNom: string | undefined;
      if (cv) {
        const up = await apiUploadCv(token, cv);
        cvNom = up.filename;
      }
      const { user: maj } = await apiMajProfil(token, {
        prenom,
        nom,
        telephone,
        pays,
        ville,
        motDePasse: motDePasse || undefined,
        cvNom,
      });
      onUser(maj);
      ecrireSession({ token, user: maj });
      setCodePays(pays);
      setMotDePasse("");
      onCv(null);
      setMessage("Profil enregistré. Votre pays de compte et le marché affiché sont à jour.");
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Enregistrement impossible.");
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-marque">{t("compte.profil.titre")}</h2>
        <p className="mt-1 text-[14px] text-muet">{t("compte.profil.aide")}</p>
      </div>
      <form
        className="rounded-2xl border border-ligne bg-surface p-5 sm:p-6"
        onSubmit={(e) => {
          void soumettre(e);
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <ChampTexte libelle="Prénom" nom="prenom" valeur={prenom} onChange={setPrenom} requis />
          <ChampTexte libelle="Nom" nom="nom" valeur={nom} onChange={setNom} requis />
          <ChampTexte libelle="E-mail" nom="email" type="email" valeur={user.email} />
          <div className="sm:col-span-2 rounded-xl bg-fond px-4 py-3 text-[13px] text-muet">
            Le pays du compte est enregistré ici. Après enregistrement, le site suit ce pays
            (langue + offres).
          </div>
          <ChampSelectRecherche
            libelle={t("compte.profil.pays")}
            nom="pays"
            valeur={pays}
            onChange={(v) => {
              const code = v as CodePays;
              setPays(code);
              setVille("");
              setTelephone("");
            }}
            options={optionsPays}
            requis
          />
          <ChampSelectRecherche
            libelle="Ville"
            nom="ville"
            valeur={ville}
            onChange={setVille}
            options={optionsVilles}
            placeholder="Ville ou région"
          />
          <div className="sm:col-span-2">
            <ChampTelephone
              libelle="Téléphone"
              nom="telephone"
              codePays={pays}
              valeur={telephone}
              onChange={setTelephone}
              requis
            />
          </div>
          <div className="sm:col-span-2">
            <ChampTexte
              libelle="Nouveau mot de passe"
              nom="motDePasse"
              type="password"
              valeur={motDePasse}
              onChange={setMotDePasse}
            />
          </div>
          <div className="sm:col-span-2 rounded-xl bg-fond px-4 py-3">
            <p className="text-[13px] text-muet">CV actuel</p>
            <p className="mt-0.5 text-[15px] font-semibold text-encre">
              {cv?.name ?? user.cvNom ?? "Aucun CV enregistré"}
            </p>
          </div>
          <div className="sm:col-span-2">
            <ChampFichier
              libelle="Remplacer le CV"
              nom="cv"
              fichier={cv}
              onChange={onCv}
              aide="PDF uniquement, 5 Mo max. Le fichier est stocké sur le serveur."
            />
          </div>
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
