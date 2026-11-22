/**
 * @fileoverview Pied de page — marque + liens légaux.
 *
 * But
 *   Toujours visible sous la zone scrollable (layout flex). Liens À propos ici,
 *   plus dans le header. Sur mobile : pile verticale pour éviter le chevauchement.
 */
"use client";

/**
 * Pied de page : marque + liens À propos libres (plus de devise).
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/lib/i18n/contexte";
import { SITE } from "@/lib/site";

const LIENS_APROPOS = [
  { href: "/mentions-legales", cle: "apropos.mentions" as const },
  { href: "/cgu", cle: "apropos.cgu" as const },
  { href: "/confidentialite", cle: "apropos.confidentialite" as const },
  { href: "/cookies", cle: "apropos.cookies" as const },
];

export function PiedDePage() {
  const pathname = usePathname();
  const { t } = useLocale();

  if (pathname === "/connexion" || pathname === "/inscription") {
    return null;
  }

  return (
    <footer className="z-10 shrink-0 border-t border-ligne bg-surface">
      <div className="mx-auto flex min-h-[var(--h-pied)] w-full max-w-6xl flex-col items-center justify-center gap-1.5 px-3 py-2 text-[11px] text-muet sm:h-[var(--h-pied)] sm:flex-row sm:justify-between sm:gap-3 sm:px-6 sm:py-0 sm:text-[12px]">
        <p className="max-w-full truncate text-center sm:text-left">
          <span className="font-semibold text-encre">Job Boarding</span>
          <span className="hidden sm:inline">
            {" — "}
            {SITE.editeur.raisonSociale}
          </span>
        </p>
        <nav
          className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 sm:justify-end"
          aria-label="À propos"
        >
          {LIENS_APROPOS.map((lien) => (
            <Link key={lien.href} href={lien.href} className="hover:text-encre">
              {t(lien.cle)}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
