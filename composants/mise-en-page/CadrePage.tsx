/**
 * @fileoverview Coquille de page contenu (largeur max, scroll).
 */
import type { ReactNode } from "react";

type ProprietesCadrePage = {
  titre: string;
  description?: string;
  largeur?: "etroit" | "large";
  action?: ReactNode;
  children?: ReactNode;
};

/** Cadre commun d'un écran : titre, phrase d'explication, puis le contenu. */
export function CadrePage({
  titre,
  description,
  largeur = "etroit",
  action,
  children,
}: ProprietesCadrePage) {
  const largeurClasse = largeur === "large" ? "max-w-6xl" : "max-w-lg";

  return (
    <main className={`mx-auto flex w-full min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-4 py-8 ${largeurClasse}`}>
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex max-w-2xl flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">{titre}</h1>
          {description ? <p className="text-[15px] leading-relaxed text-muet">{description}</p> : null}
        </div>
        {action}
      </header>
      {children}
    </main>
  );
}
