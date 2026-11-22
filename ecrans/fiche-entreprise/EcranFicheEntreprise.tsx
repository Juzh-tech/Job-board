/**
 * @fileoverview Fiche publique d'une entreprise + ses offres.
 *
 * But
 *   Page /entreprises/[id] — profil visible par les candidats.
 */
import Link from "next/link";
import { CarteOffreCourte } from "@/composants/offres/CarteOffreCourte";
import { LogoEntreprise } from "@/composants/ui/LogoEntreprise";
import type { Offre } from "@/types/offre";

export type EntreprisePublique = {
  id: number;
  nom: string;
  secteur: string;
  ville: string;
  presentation: string;
  siteWeb: string;
  logoUrl: string | null;
};

type ProprietesEcranFicheEntreprise = {
  entreprise: EntreprisePublique;
  offres: Offre[];
};

function normaliserSite(url: string): string {
  const trim = url.trim();
  if (!trim) {
    return "";
  }
  if (/^https?:\/\//i.test(trim)) {
    return trim;
  }
  return `https://${trim}`;
}

function libelleSite(url: string): string {
  try {
    return new URL(normaliserSite(url)).hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^https?:\/\//i, "").replace(/^www\./, "");
  }
}

/** Fiche publique d'une entreprise : profil + offres en cours. */
export function EcranFicheEntreprise({ entreprise, offres }: ProprietesEcranFicheEntreprise) {
  const site = normaliserSite(entreprise.siteWeb);
  const pluriel = offres.length > 1;

  return (
    <main className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain bg-fond">
      <section className="relative overflow-hidden bg-marque text-ivoire">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 15% 20%, rgba(201,162,39,0.35), transparent 55%), radial-gradient(ellipse 70% 50% at 90% 80%, rgba(123,45,62,0.45), transparent 50%)",
          }}
        />
        <div className="relative mx-auto w-full max-w-5xl px-4 pb-10 pt-8 sm:px-8 sm:pb-12 sm:pt-10">
          <Link
            href="/"
            className="fiche-entreprise-entree inline-flex text-[13px] font-semibold text-ivoire/75 transition hover:text-ivoire"
          >
            ← Retour aux offres
          </Link>

          <div className="fiche-entreprise-entree mt-8 flex flex-col gap-6 sm:mt-10 sm:flex-row sm:items-end sm:gap-8">
            <div className="shrink-0 rounded-2xl bg-ivoire/10 p-1 ring-1 ring-ivoire/25">
              <LogoEntreprise
                nom={entreprise.nom}
                id={entreprise.id}
                url={entreprise.logoUrl}
                taille="xl"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-dore">
                {entreprise.secteur || "Entreprise"}
              </p>
              <h1 className="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
                {entreprise.nom}
              </h1>
              <p className="mt-3 text-[16px] text-ivoire/80">
                {[entreprise.ville, pluriel ? `${offres.length} offres` : offres.length === 1 ? "1 offre" : "Aucune offre"]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              {site ? (
                <a
                  href={site}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex h-11 items-center rounded-md bg-dore px-5 text-[14px] font-semibold text-marque transition hover:bg-dore-hover"
                >
                  Visiter le site
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-8 sm:py-12">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-start lg:gap-14">
          <section className="fiche-entreprise-bloc">
            <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-muet">À propos</h2>
            <p className="mt-4 text-[17px] leading-8 text-encre">
              {entreprise.presentation?.trim() ||
                "Cette entreprise n’a pas encore renseigné sa présentation."}
            </p>

            <dl className="mt-8 grid gap-5 sm:grid-cols-2">
              <div>
                <dt className="text-[12px] font-semibold uppercase tracking-wide text-muet">
                  Secteur
                </dt>
                <dd className="mt-1.5 text-[15px] font-semibold text-encre">
                  {entreprise.secteur || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-[12px] font-semibold uppercase tracking-wide text-muet">
                  Ville
                </dt>
                <dd className="mt-1.5 text-[15px] font-semibold text-encre">
                  {entreprise.ville || "—"}
                </dd>
              </div>
              {site ? (
                <div className="sm:col-span-2">
                  <dt className="text-[12px] font-semibold uppercase tracking-wide text-muet">
                    Site web
                  </dt>
                  <dd className="mt-1.5">
                    <a
                      href={site}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[15px] font-semibold text-action underline-offset-4 hover:underline"
                    >
                      {libelleSite(entreprise.siteWeb)}
                    </a>
                  </dd>
                </div>
              ) : null}
            </dl>
          </section>

          <section className="fiche-entreprise-bloc" aria-labelledby="titre-offres-entreprise">
            <div className="mb-4 flex items-end justify-between gap-3">
              <h2
                id="titre-offres-entreprise"
                className="text-sm font-bold uppercase tracking-[0.16em] text-muet"
              >
                Offres en cours
              </h2>
              <p className="text-[13px] font-semibold text-marque">
                {offres.length} poste{pluriel ? "s" : ""}
              </p>
            </div>

            {offres.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-ligne bg-surface px-5 py-10 text-[15px] text-muet">
                Aucune offre publiée pour le moment.
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {offres.map((offre) => (
                  <li key={offre.id}>
                    <CarteOffreCourte offre={offre} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
