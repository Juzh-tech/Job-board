/**
 * @fileoverview Écran d'accueil — board offres + panneau détail / postuler.
 *
 * But
 *   Cœur candidat : liste à gauche, fiche à droite (desktop), une vue sur mobile.
 *   Branché sur /api/offres et la session.
 */
"use client";

/**
 * Tableau d'offres branché sur GET /api/offres.
 * Les filtres restent côté client (BarreFiltres) une fois la liste chargée.
 * « Déjà postulé » vient de GET /api/candidatures?idsOnly=1 si session active.
 */
import { useEffect, useRef, useState } from "react";
import { BarreFiltres } from "@/composants/offres/BarreFiltres";
import { CarteOffre } from "@/composants/offres/CarteOffre";
import { DetailOffre } from "@/composants/offres/DetailOffre";
import { FormulaireCandidature } from "@/composants/offres/FormulaireCandidature";
import { apiListerOffres, apiOffresDejaPostulees } from "@/lib/api";
import { useLocale } from "@/lib/i18n/contexte";
import { filtrerOffres } from "@/lib/offres";
import { lireSession } from "@/lib/session";
import type { Offre } from "@/types/offre";

type Panneau = "vide" | "detail" | "postuler" | "envoye";

type ProprietesEcranAccueil = {
  offreInitialeId?: number;
  motInitial?: string;
  lieuInitial?: string;
  contratInitial?: string;
};

function trouverOffre(id: number | undefined, parmi: Offre[]): Offre | null {
  if (id != null && !Number.isNaN(id)) {
    const demandee = parmi.find((offre) => offre.id === id);
    if (demandee) {
      return demandee;
    }
  }
  return parmi[0] ?? null;
}

export function EcranAccueil({
  offreInitialeId,
  motInitial = "",
  lieuInitial = "",
  contratInitial = "tous",
}: ProprietesEcranAccueil) {
  const { codePays, pays, t } = useLocale();
  const [toutes, setToutes] = useState<Offre[]>([]);
  const [filtrees, setFiltrees] = useState<Offre[]>([]);
  const [offreActive, setOffreActive] = useState<Offre | null>(null);
  const [panneau, setPanneau] = useState<Panneau>("vide");
  const [ficheMobile, setFicheMobile] = useState(false);
  const [postulerDepuisListe, setPostulerDepuisListe] = useState(false);
  const [dejaPostulees, setDejaPostulees] = useState<Set<number>>(new Set());
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const mainRef = useRef<HTMLElement>(null);
  const panneauRef = useRef<HTMLElement>(null);
  const tableauRef = useRef<HTMLDivElement>(null);

  /** Après « En savoir plus » : revenir en haut du détail (pas en bas des similaires). */
  useEffect(() => {
    if (panneau !== "detail" && panneau !== "postuler") {
      return;
    }
    const id = window.requestAnimationFrame(() => {
      mainRef.current?.scrollTo({ top: 0, behavior: "auto" });
      panneauRef.current?.scrollTo({ top: 0, behavior: "auto" });
    });
    return () => window.cancelAnimationFrame(id);
  }, [offreActive?.id, panneau, ficheMobile]);

  useEffect(() => {
    let annule = false;

    async function charger() {
      setChargement(true);
      setErreur(null);
      try {
        // Marché local : uniquement les offres du pays sélectionné
        const { offres } = await apiListerOffres({ pays: codePays });
        if (annule) {
          return;
        }
        const filtrees = filtrerOffres(offres, motInitial, lieuInitial, contratInitial);
        const initiale = trouverOffre(offreInitialeId, filtrees);
        setToutes(offres);
        setFiltrees(filtrees);
        setOffreActive(initiale);
        setPanneau(initiale ? "detail" : "vide");
        setFicheMobile(Boolean(offreInitialeId && initiale));

        const session = lireSession();
        if (session?.token && session.user.role === "candidat") {
          try {
            const { offreIds } = await apiOffresDejaPostulees(session.token);
            if (!annule) {
              setDejaPostulees(new Set(offreIds));
            }
          } catch {
            // Pas bloquant pour consulter les offres
          }
        }
      } catch {
        if (!annule) {
          setToutes([]);
          setFiltrees([]);
          setOffreActive(null);
          setPanneau("vide");
          setErreur(t("accueil.erreurChargement"));
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
  }, [offreInitialeId, motInitial, lieuInitial, contratInitial, codePays, t]);

  function dejaPostule(offreId: number) {
    return dejaPostulees.has(offreId);
  }

  function ouvrirDetail(offre: Offre) {
    setOffreActive(offre);
    setPanneau("detail");
    setFicheMobile(true);
    setPostulerDepuisListe(false);
  }

  function ouvrirPostuler(offre: Offre) {
    if (dejaPostule(offre.id)) {
      ouvrirDetail(offre);
      return;
    }
    const session = lireSession();
    if (!session || session.user.role !== "candidat") {
      window.location.href = "/connexion";
      return;
    }
    setOffreActive(offre);
    setPanneau("postuler");
    setFicheMobile(true);
    setPostulerDepuisListe(true);
  }

  function retourListe() {
    setFicheMobile(false);
  }

  function filtrer(liste: Offre[]) {
    setFiltrees(liste);
    setFicheMobile(false);
    if (liste.length === 0) {
      setOffreActive(null);
      setPanneau("vide");
      return;
    }
    const encoreLa = offreActive && liste.some((o) => o.id === offreActive.id);
    if (!encoreLa) {
      setOffreActive(liste[0]);
      setPanneau("detail");
    }
    tableauRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function apresEnvoi() {
    if (offreActive) {
      setDejaPostulees((prev) => new Set(prev).add(offreActive.id));
    }
    setPanneau("envoye");
  }

  return (
    <main
      ref={mainRef}
      className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain bg-fond"
    >
      <section
        className={`border-b border-ligne bg-fond ${ficheMobile ? "hidden lg:block" : ""}`}
      >
        <div className="mx-auto flex w-full max-w-[90rem] flex-col items-center gap-5 px-4 pb-5 pt-5 text-center sm:px-8 sm:pb-6 sm:pt-6 lg:px-10">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-extrabold tracking-tight text-marque sm:text-4xl lg:text-[2.5rem] lg:leading-tight">
              {t("accueil.titre")}
            </h1>
            <p className="mx-auto mt-2 max-w-2xl text-[16px] leading-7 text-muet">
              {t("accueil.sousTitre")}
            </p>
            <p className="mx-auto mt-3 text-[13px] font-semibold text-marque">
              {t("accueil.marche")} : {pays.nom}
            </p>
          </div>

          <div className="w-full max-w-4xl text-left">
            <BarreFiltres
              offres={toutes}
              onFiltrer={filtrer}
              motInitial={motInitial}
              lieuInitial={lieuInitial}
              contratInitial={contratInitial}
              variante="hero"
            />
          </div>
        </div>
      </section>

      <div
        ref={tableauRef}
        className={`mx-auto w-full max-w-[90rem] px-4 sm:px-8 lg:px-10 ${
          ficheMobile ? "py-0 lg:pt-4 lg:pb-8" : "pt-4 pb-8"
        }`}
      >
        {chargement ? (
          <p className="mb-4 text-[15px] text-muet">{t("accueil.chargement")}</p>
        ) : null}
        {erreur ? (
          <p className="mb-4 rounded-xl bg-refus/10 px-4 py-3 text-[14px] text-refus">{erreur}</p>
        ) : null}

        {!erreur ? (
          <p
            className={`mb-4 text-[15px] leading-7 text-muet ${ficheMobile ? "hidden lg:block" : ""}`}
          >
            <span className="font-semibold text-encre">{filtrees.length}</span>{" "}
            {t("accueil.offresTrouvees")}
          </p>
        ) : null}

        {!erreur ? (
        <div className="grid lg:grid-cols-2 lg:items-start lg:gap-8">
          <section
            aria-label="Liste des offres"
            className={`${ficheMobile ? "hidden lg:block" : "block"}`}
          >
            {!chargement && filtrees.length === 0 ? (
              <p className="rounded-2xl border border-ligne bg-surface px-6 py-14 text-muet">
                {toutes.length === 0
                  ? `${t("accueil.aucuneMarche")} (${pays.nom})`
                  : t("accueil.aucuneFiltre")}
              </p>
            ) : !chargement ? (
              <ul className="flex flex-col gap-3 pb-10">
                {filtrees.map((offre) => (
                  <li key={offre.id}>
                    <CarteOffre
                      offre={offre}
                      selectionnee={offreActive?.id === offre.id}
                      onEnSavoirPlus={() => ouvrirDetail(offre)}
                      onPostuler={() => ouvrirPostuler(offre)}
                      dejaPostule={dejaPostule(offre.id)}
                    />
                  </li>
                ))}
              </ul>
            ) : null}
          </section>

          <aside
            ref={panneauRef}
            id="panneau-offre"
            className={`${
              ficheMobile
                ? "block min-h-[calc(100dvh-var(--h-entete)-var(--h-pied))]"
                : "hidden lg:block"
            } rounded-2xl border border-ligne bg-surface lg:sticky lg:top-4 lg:max-h-[calc(100dvh-var(--h-entete)-var(--h-pied)-1rem)] lg:overflow-y-auto lg:overscroll-y-contain`}
          >
            {panneau === "vide" || !offreActive ? (
              <p className="px-6 py-16 text-center text-[15px] leading-7 text-muet">
                Sélectionnez une offre pour afficher le détail ici.
              </p>
            ) : null}
            {panneau === "detail" && offreActive ? (
              <DetailOffre
                offre={offreActive}
                dejaPostule={dejaPostule(offreActive.id)}
                onPostuler={() => {
                  if (dejaPostule(offreActive.id)) {
                    return;
                  }
                  const session = lireSession();
                  if (!session || session.user.role !== "candidat") {
                    window.location.href = "/connexion";
                    return;
                  }
                  setPostulerDepuisListe(false);
                  setPanneau("postuler");
                }}
                onRetourListe={retourListe}
              />
            ) : null}
            {panneau === "postuler" && offreActive && !dejaPostule(offreActive.id) ? (
              <FormulaireCandidature
                offre={offreActive}
                onRetour={() => setPanneau("detail")}
                onRetourListe={retourListe}
                depuisListe={postulerDepuisListe}
                onEnvoye={apresEnvoi}
              />
            ) : null}
            {panneau === "envoye" && offreActive ? (
              <div className="flex flex-col gap-4 px-6 py-12">
                {postulerDepuisListe ? (
                  <button
                    type="button"
                    onClick={retourListe}
                    className="self-start text-[13px] font-semibold text-marque lg:hidden"
                  >
                    ← Offres
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setPanneau("detail")}
                    className="self-start text-[14px] font-semibold text-marque hover:underline"
                  >
                    ← Retour à l&apos;offre
                  </button>
                )}
                <h2 className="text-xl font-bold text-marque">Candidature envoyée</h2>
                <p className="text-[15px] leading-7 text-muet">
                  Votre dossier pour « {offreActive.titre} » a bien été transmis à{" "}
                  {offreActive.entreprise.nom}. Vous pourrez suivre son statut dans Mon compte.
                </p>
              </div>
            ) : null}
          </aside>
        </div>
        ) : null}
      </div>
    </main>
  );
}
