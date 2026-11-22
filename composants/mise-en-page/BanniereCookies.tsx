/**
 * @fileoverview Bannière consentement cookies (premier passage).
 *
 * But
 *   fixed bottom tant que pas de choix enregistré.
 */
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ecrireConsentement,
  initialiserMesureAudienceSiAutorisee,
  lireConsentement,
} from "@/lib/consentement";

/** Bannière CNIL : choix mesure d’audience. */
export function BanniereCookies() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const existant = lireConsentement();
    if (existant) {
      initialiserMesureAudienceSiAutorisee();
      setVisible(false);
      return;
    }
    setVisible(true);
  }, []);

  function choisir(mesureAudience: boolean) {
    ecrireConsentement(mesureAudience);
    initialiserMesureAudienceSiAutorisee();
    setVisible(false);
  }

  if (!visible) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-label="Consentement aux cookies"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-ligne bg-surface p-4 shadow-[0_-8px_30px_rgba(11,31,58,0.12)] sm:p-5"
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-[15px] font-bold text-marque">Respect de votre vie privée</p>
          <p className="mt-1 text-[14px] leading-6 text-muet">
            Job Board utilise des traceurs strictement nécessaires au fonctionnement du service.
            Avec votre accord, nous activons aussi une mesure d’audience pour améliorer la
            plateforme.{" "}
            <Link href="/cookies" className="font-semibold text-marque underline">
              En savoir plus
            </Link>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => choisir(false)}
            className="inline-flex h-10 items-center rounded-lg border border-ligne px-4 text-sm font-semibold text-encre hover:border-marque/40"
          >
            Refuser
          </button>
          <button
            type="button"
            onClick={() => choisir(true)}
            className="inline-flex h-10 items-center rounded-lg bg-marque px-4 text-sm font-semibold text-white hover:bg-marque-hover"
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}
