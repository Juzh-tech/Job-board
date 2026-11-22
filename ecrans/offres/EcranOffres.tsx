/**
 * @fileoverview Écran /offres — variante liste + détail en colonnes.
 *
 * But
 *   Même métier que l'accueil, autre layout. Réutilise les composants offres.
 */
"use client";

/**
 * Liste / détail / postuler — mêmes données que l'accueil (GET /api/offres).
 * Conservé pour la route /offres si elle pointe encore ici.
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

type ProprietesEcranOffres = {
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

export function EcranOffres({
  offreInitialeId,
  motInitial = "",
  lieuInitial = "",
  contratInitial = "tous",
}: ProprietesEcranOffres) {
  const { codePays, t } = useLocale();
  const [toutes, setToutes] = useState<Offre[]>([]);
  const [filtrees, setFiltrees] = useState<Offre[]>([]);
  const [offreActive, setOffreActive] = useState<Offre | null>(null);
  const [panneau, setPanneau] = useState<Panneau>("vide");
  const [ficheMobile, setFicheMobile] = useState(false);
  const [postulerDepuisListe, setPostulerDepuisListe] = useState(false);
  const [dejaPostulees, setDejaPostulees] = useState<Set<number>>(new Set());
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const panneauRef = useRef<HTMLElement>(null);

  /** Après ouverture d'une offre : scroll en haut du panneau détail. */
  useEffect(() => {
    if (panneau !== "detail" && panneau !== "postuler") {
      return;
    }
    const id = window.requestAnimationFrame(() => {
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
        const { offres } = await apiListerOffres({ pays: codePays });
        if (annule) {
          return;
        }
        const liste = filtrerOffres(offres, motInitial, lieuInitial, contratInitial);
        const initiale = trouverOffre(offreInitialeId, liste);
        setToutes(offres);
        setFiltrees(liste);
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
            // Consultation des offres reste possible
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
  }

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-fond">
      <div
        className={`shrink-0 border-b border-ligne bg-surface px-4 py-3 ${ficheMobile ? "hidden lg:block" : ""}`}
      >
        <div className="mx-auto flex w-full max-w-[90rem] flex-col gap-3">
          <BarreFiltres
            offres={toutes}
            onFiltrer={filtrer}
            motInitial={motInitial}
            lieuInitial={lieuInitial}
            contratInitial={contratInitial}
          />
          {!erreur ? (
            <p className="text-[14px] text-muet">
              {chargement ? (
                "Chargement…"
              ) : (
                <>
                  <span className="font-semibold text-encre">{filtrees.length}</span> offre
                  {filtrees.length > 1 ? "s" : ""} d&apos;emploi
                </>
              )}
            </p>
          ) : null}
          {erreur ? <p className="text-[14px] text-refus">{erreur}</p> : null}
        </div>
      </div>

      {!erreur ? (
      <div className="mx-auto grid min-h-0 w-full max-w-[90rem] flex-1 overflow-hidden lg:grid-cols-[minmax(20rem,26rem)_1fr]">
        <section
          aria-label="Liste des offres"
          className={`${ficheMobile ? "hidden lg:block" : "block"} min-h-0 overflow-y-auto overscroll-y-contain lg:border-r lg:border-ligne`}
        >
          {!chargement && filtrees.length === 0 ? (
            <p className="px-4 py-10 text-muet">{t("accueil.aucuneFiltre")}</p>
          ) : !chargement ? (
            filtrees.map((offre) => (
              <CarteOffre
                key={offre.id}
                offre={offre}
                selectionnee={offreActive?.id === offre.id}
                onEnSavoirPlus={() => ouvrirDetail(offre)}
                onPostuler={() => ouvrirPostuler(offre)}
                dejaPostule={dejaPostule(offre.id)}
              />
            ))
          ) : null}
        </section>

        <aside
          ref={panneauRef}
          id="panneau-offre"
          className={`${ficheMobile ? "block" : "hidden lg:block"} min-h-0 overflow-y-auto overscroll-y-contain bg-fond`}
        >
          {panneau === "vide" || !offreActive ? (
            <p className="px-6 py-10 text-[15px] text-muet">
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
              onEnvoye={() => {
                setDejaPostulees((s) => new Set(s).add(offreActive.id));
                setPanneau("envoye");
              }}
            />
          ) : null}
          {panneau === "envoye" && offreActive ? (
            <div className="flex flex-col gap-3 bg-surface px-5 py-8">
              {postulerDepuisListe ? (
                <button
                  type="button"
                  onClick={retourListe}
                  className="self-start text-[13px] font-semibold text-lien lg:hidden"
                >
                  ← Offres
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setPanneau("detail")}
                  className="self-start text-[14px] font-semibold text-lien hover:underline"
                >
                  ← Retour à l&apos;offre
                </button>
              )}
              <h2 className="text-xl font-bold">Candidature envoyée</h2>
              <p className="text-[15px] leading-relaxed text-muet">
                Votre dossier pour « {offreActive.titre} » a bien été transmis à{" "}
                {offreActive.entreprise.nom}. Vous pourrez suivre son statut dans Mon compte.
              </p>
            </div>
          ) : null}
        </aside>
      </div>
      ) : null}
    </main>
  );
}
