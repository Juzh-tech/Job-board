/**
 * @fileoverview Page 404 Next.
 *
 * But
 *   URL inconnue → message clair + retour possible vers le board.
 */
import Link from "next/link";
import { SITE } from "@/lib/site";

/** Page 404 personnalisée. */
export default function Introuvable() {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center gap-5 px-4 py-16">
      <p className="text-[13px] font-semibold uppercase tracking-wider text-muet">Erreur 404</p>
      <h1 className="text-3xl font-extrabold tracking-tight text-marque">Page introuvable</h1>
      <p className="text-[16px] leading-7 text-encre">
        La ressource demandée n’existe pas ou a été déplacée. Retrouvez les offres d’emploi et de
        stage sur {SITE.nom}, ou reconnectez-vous à votre espace.
      </p>
      <div className="flex flex-wrap gap-3 pt-2">
        <Link
          href="/"
          className="inline-flex h-10 items-center rounded-lg bg-marque px-4 text-sm font-semibold text-white hover:bg-marque-hover"
        >
          Voir les offres
        </Link>
        <Link
          href="/connexion"
          className="inline-flex h-10 items-center rounded-lg border border-ligne bg-surface px-4 text-sm font-semibold text-encre hover:border-marque/40"
        >
          Se connecter
        </Link>
      </div>
    </main>
  );
}
