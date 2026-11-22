/**
 * @fileoverview Route lecture CV côté entreprise.
 *
 * But
 *   Afficher / télécharger un CV autorisé pour le recruteur connecté.
 */
"use client";

/**
 * Aperçu du CV PDF (fichier réel via GET /api/cv/…).
 */
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";
import { useLocale } from "@/lib/i18n/contexte";
import { lireSession } from "@/lib/session";

function ContenuApercuCv() {
  const { t } = useLocale();
  const params = useSearchParams();
  const nomFichier = params.get("fichier")?.trim() || "cv.pdf";
  const nomCandidat = params.get("candidat")?.trim() || "Candidat";
  const titreOffre = params.get("offre")?.trim() || "Offre";
  const tokenParam = params.get("token")?.trim();

  const urlPdf = useMemo(() => {
    const session = lireSession();
    const token = tokenParam || session?.token;
    if (!token || !nomFichier) {
      return null;
    }
    return `/api/cv/${encodeURIComponent(nomFichier)}?token=${encodeURIComponent(token)}`;
  }, [nomFichier, tokenParam]);

  return (
    <main className="min-h-screen bg-fond px-4 py-8">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-wide text-muet">
              {t("cv.apercu")}
            </p>
            <h1 className="text-2xl font-bold text-marque">{nomCandidat}</h1>
            <p className="text-[14px] text-muet">{titreOffre}</p>
          </div>
          <Link
            href="/entreprise"
            className="text-[14px] font-semibold text-marque hover:underline"
          >
            {t("cv.retourEntreprise")}
          </Link>
        </div>

        <section className="overflow-hidden rounded-2xl border border-ligne bg-surface shadow-sm">
          <div className="border-b border-ligne px-5 py-3">
            <p className="text-[14px] text-muet">Fichier</p>
            <p className="text-[16px] font-semibold text-encre">{nomFichier}</p>
          </div>
          {urlPdf ? (
            <iframe title={nomFichier} src={urlPdf} className="h-[75vh] w-full bg-fond" />
          ) : (
            <p className="px-5 py-16 text-center text-[14px] text-muet">
              Connexion requise pour afficher le CV.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}

export default function PageApercuCv() {
  return (
    <Suspense fallback={<main className="p-8 text-muet">…</main>}>
      <ContenuApercuCv />
    </Suspense>
  );
}
