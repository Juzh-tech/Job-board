/**
 * @fileoverview Coquille visuelle pages connexion / inscription.
 */
"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { useLocale } from "@/lib/i18n/contexte";

type ProprietesCadreAuth = {
  titre: string;
  description: string;
  children: ReactNode;
};

/**
 * Portail connexion / inscription : l'image couvre toute la hauteur
 * du contenu (même quand le formulaire est long), sans bande blanche.
 */
export function CadreAuth({ titre, description, children }: ProprietesCadreAuth) {
  const { t } = useLocale();
  return (
    <main className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain bg-marque">
      <div className="relative isolate min-h-full">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <Image
            src="/images/auth-bureau.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-marque/50" />
          <div className="absolute inset-0 bg-gradient-to-b from-marque/55 via-marque/35 to-marque/60" />
        </div>

        <div className="mx-auto flex w-full max-w-lg flex-col px-4 py-8 sm:px-6 sm:py-10">
          <div className="mb-5 text-center text-white">
            <p className="text-[13px] font-semibold uppercase tracking-wider text-white/75">
              Job Board
            </p>
            <p className="mt-2 text-[18px] font-bold leading-snug sm:text-[20px]">
              {t("auth.tagline")}
            </p>
          </div>

          <section className="w-full rounded-2xl border border-white/20 bg-surface/95 p-6 shadow-[0_24px_60px_rgba(11,31,58,0.35)] backdrop-blur-sm sm:p-8">
            <h1 className="text-2xl font-extrabold tracking-tight text-marque sm:text-3xl">
              {titre}
            </h1>
            <p className="mt-2 text-[15px] leading-7 text-muet">{description}</p>
            <div className="mt-6 flex flex-col gap-5">{children}</div>
          </section>
        </div>
      </div>
    </main>
  );
}
