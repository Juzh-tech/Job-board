/**
 * @fileoverview Panneau détail d'une offre.
 *
 * But
 *   Description complète + estimation rémunération. Tout le contenu scrolle
 *   avec la page. Bouton Postuler flottant : apparaît en scrollant vers le bas,
 *   disparaît en remontant.
 */
"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { formaterDateRelative } from "@/lib/format";
import { useLocale } from "@/lib/i18n/contexte";
import {
  composerLibelleSalaire,
  extraireEstimationRemuneration,
} from "@/lib/remuneration";
import { LogoEntreprise } from "@/composants/ui/LogoEntreprise";
import type { Offre } from "@/types/offre";

type ProprietesDetailOffre = {
  offre: Offre;
  onPostuler: () => void;
  onRetourListe?: () => void;
  /** Le candidat connecté a déjà postulé à cette offre. */
  dejaPostule?: boolean;
};

function trouverConteneurScroll(el: HTMLElement | null): HTMLElement | Window {
  let node = el?.parentElement ?? null;
  while (node) {
    const { overflowY } = getComputedStyle(node);
    if (
      (overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay") &&
      node.scrollHeight > node.clientHeight + 1
    ) {
      return node;
    }
    node = node.parentElement;
  }
  return window;
}

function lireScrollY(scroller: HTMLElement | Window): number {
  return scroller instanceof Window ? window.scrollY : scroller.scrollTop;
}

function lireScrollMax(scroller: HTMLElement | Window): number {
  if (scroller instanceof Window) {
    return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  }
  return Math.max(0, scroller.scrollHeight - scroller.clientHeight);
}

export function DetailOffre({
  offre,
  onPostuler,
  onRetourListe,
  dejaPostule = false,
}: ProprietesDetailOffre) {
  const { pays, t } = useLocale();
  const rootRef = useRef<HTMLDivElement>(null);
  const [barreVisible, setBarreVisible] = useState(false);
  const hrefEntreprise = `/entreprises/${offre.entreprise.id}`;
  const estimation = extraireEstimationRemuneration(
    offre.salaire,
    offre.tempsTravail,
    pays.devise.symbole,
  );
  const symbole = estimation?.symbole || pays.devise.symbole;

  useEffect(() => {
    const root = rootRef.current;
    if (!root || dejaPostule) {
      setBarreVisible(false);
      return;
    }

    const scroller = trouverConteneurScroll(root);
    let dernierY = lireScrollY(scroller);

    function onScroll() {
      const y = lireScrollY(scroller);
      const max = lireScrollMax(scroller);
      const delta = y - dernierY;
      const enBas = y >= max - 32;

      if (y < 64) {
        setBarreVisible(false);
      } else if (enBas || delta > 6) {
        setBarreVisible(true);
      } else if (delta < -6) {
        setBarreVisible(false);
      }

      dernierY = y;
    }

    scroller.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => scroller.removeEventListener("scroll", onScroll);
  }, [offre.id, dejaPostule]);

  return (
    <div ref={rootRef} className="relative flex min-h-full flex-col pb-20 lg:pb-8">
      <header className="border-b border-ligne bg-surface px-6 py-5 sm:px-8">
        {onRetourListe ? (
          <button
            type="button"
            onClick={onRetourListe}
            className="mb-3 text-[13px] font-semibold text-marque lg:hidden"
          >
            {t("offre.retourListe")}
          </button>
        ) : null}
        <div className="flex min-w-0 gap-3 sm:gap-4">
          <Link href={hrefEntreprise} aria-label={`Voir ${offre.entreprise.nom}`}>
            <LogoEntreprise nom={offre.entreprise.nom} id={offre.entreprise.id} />
          </Link>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold leading-snug text-marque sm:text-2xl">{offre.titre}</h2>
            <Link
              href={hrefEntreprise}
              className="text-[14px] font-medium text-action hover:underline"
            >
              {offre.entreprise.nom}
            </Link>
            <p className="mt-1 text-[13px] text-muet">
              {offre.lieu} · {formaterDateRelative(offre.datePublication)}
            </p>
            {dejaPostule ? (
              <div className="mt-3 flex flex-col items-start gap-1">
                <span className="inline-flex h-10 items-center justify-center rounded-lg border border-ligne bg-fond px-4 text-sm font-semibold text-marque">
                  {t("offre.dejaPostule")}
                </span>
                <Link
                  href="/compte"
                  className="text-[12px] font-semibold text-muet hover:text-marque hover:underline"
                >
                  Suivre dans Mon compte
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-10 px-6 py-8 sm:px-8">
        <ul className="grid gap-4 text-[15px] sm:grid-cols-2">
          <li className="rounded-xl bg-fond px-5 py-4">
            <span className="block text-[12px] text-muet">{t("offre.contrat")}</span>
            <span className="font-semibold">{offre.typeContrat}</span>
          </li>
          <li className="rounded-xl bg-fond px-5 py-4">
            <span className="block text-[12px] text-muet">{t("offre.tempsTravail")}</span>
            <span className="font-semibold">{offre.tempsTravail}</span>
          </li>
          <li className="rounded-xl bg-fond px-5 py-4 sm:col-span-2">
            <span className="block text-[12px] text-muet">{t("offre.remuneration")}</span>
            <span className="font-semibold text-dore-hover">{offre.salaire}</span>
            {estimation ? (
              <div className="mt-3 rounded-lg border border-ligne bg-surface px-4 py-3 text-[13px] leading-6 text-muet">
                <p className="font-semibold text-encre">{t("offre.estimation")}</p>
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
                  Base : {estimation.heures} h/semaine × 52 semaines
                  {estimation.hypotheseHeures
                    ? " (volume non précisé — hypothèse temps plein)"
                    : ""}
                </p>
              </div>
            ) : null}
          </li>
        </ul>

        {offre.descriptionCourte ? (
          <section className="flex flex-col gap-3">
            <h3 className="text-[16px] font-bold text-marque">{t("offre.profil")}</h3>
            <p className="text-[16px] leading-relaxed text-encre">{offre.descriptionCourte}</p>
          </section>
        ) : null}

        <section className="flex flex-col gap-4">
          <h3 className="text-[16px] font-bold text-marque">{t("offre.description")}</h3>
          {offre.descriptionComplete.split("\n\n").map((paragraphe) => (
            <p key={paragraphe.slice(0, 24)} className="text-[16px] leading-relaxed text-encre">
              {paragraphe}
            </p>
          ))}
        </section>

        <section className="rounded-2xl border border-ligne bg-fond px-6 py-6">
          <h3 className="text-[15px] font-bold text-marque">{offre.entreprise.nom}</h3>
          <p className="mt-1 text-[13px] text-muet">
            {offre.entreprise.secteur} — {offre.entreprise.ville}
          </p>
          <p className="mt-3 text-[14px] leading-relaxed">{offre.entreprise.presentation}</p>
          <Link
            href={hrefEntreprise}
            className="mt-4 inline-block text-[14px] font-semibold text-marque hover:underline"
          >
            Voir toutes les offres de {offre.entreprise.nom}
          </Link>
        </section>
      </div>

      {/* Barre Postuler : apparaît en descendant, disparaît en remontant */}
      {!dejaPostule ? (
        <div
          className={`pointer-events-none fixed inset-x-0 bottom-[var(--h-pied)] z-30 px-4 pb-3 pt-2 transition-all duration-300 ease-out sm:px-8 ${
            barreVisible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-5 opacity-0"
          }`}
          aria-hidden={!barreVisible}
        >
          <button
            type="button"
            onClick={onPostuler}
            tabIndex={barreVisible ? 0 : -1}
            className={`pointer-events-auto mx-auto flex h-12 w-full max-w-lg items-center justify-center rounded-xl bg-action text-[15px] font-semibold text-ivoire shadow-[0_-4px_24px_rgba(11,31,58,0.18)] hover:bg-action-hover lg:ml-auto lg:mr-4 ${
              barreVisible ? "" : "pointer-events-none"
            }`}
          >
            {t("offre.postuler")}
          </button>
        </div>
      ) : null}
    </div>
  );
}
