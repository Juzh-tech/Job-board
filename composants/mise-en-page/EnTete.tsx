/**
 * @fileoverview Header du site (nav + sélecteur pays + session).
 *
 * But
 *   Liens selon le rôle. « Job Boarding » = retour au board (remplace le lien Offres).
 *   Sur mobile : barre compacte (pas de débordement Inscription / Déconnexion).
 */
"use client";

/**
 * Bandeau global.
 * Marque cliquable → / ; liens rôle / session à droite.
 */
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SelecteurPays } from "@/composants/mise-en-page/SelecteurPays";
import type { UtilisateurApi } from "@/lib/api";
import { useLocale } from "@/lib/i18n/contexte";
import type { CodePays } from "@/lib/pays";
import { CLE_BROUILLON_OFFRE } from "@/lib/brouillon-offre";
import { lireSession, viderSession } from "@/lib/session";

function lienActif(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname.startsWith(href);
}

export function EnTete() {
  const pathname = usePathname();
  const router = useRouter();
  const { t, setCodePays } = useLocale();
  const [user, setUser] = useState<UtilisateurApi | null>(null);

  useEffect(() => {
    function rafraichir() {
      const u = lireSession()?.user ?? null;
      setUser(u);
      if (u?.role === "entreprise" && u.pays) {
        setCodePays(u.pays as CodePays);
      }
    }
    rafraichir();
    window.addEventListener("jobboard-session", rafraichir);
    window.addEventListener("storage", rafraichir);
    return () => {
      window.removeEventListener("jobboard-session", rafraichir);
      window.removeEventListener("storage", rafraichir);
    };
  }, [setCodePays]);

  function deconnecter() {
    try {
      const brouillon = localStorage.getItem(CLE_BROUILLON_OFFRE);
      if (brouillon && user?.role === "entreprise") {
        const ok = window.confirm(
          "Vous avez un brouillon d’offre non publié. En vous déconnectant, il sera perdu. Continuer ?",
        );
        if (!ok) {
          return;
        }
        localStorage.removeItem(CLE_BROUILLON_OFFRE);
      }
    } catch {
      // ignore
    }
    viderSession();
    setUser(null);
    router.push("/");
  }

  const liensRole: { href: string; libelle: string }[] = [];
  if (user?.role === "entreprise") {
    liensRole.push({ href: "/entreprise", libelle: t("nav.entreprise") });
  }
  if (user?.role === "admin") {
    liensRole.push({ href: "/administration", libelle: t("nav.admin") });
  }
  if (user?.role === "candidat") {
    liensRole.push({ href: "/compte", libelle: t("nav.compte") });
  }

  return (
    <header className="sticky top-0 z-20 shrink-0 border-b border-marque/40 bg-marque text-ivoire shadow-[0_1px_0_rgba(201,162,39,0.45)]">
      <div className="mx-auto flex h-[var(--h-entete)] w-full max-w-[90rem] items-center gap-2 px-3 sm:gap-4 sm:px-8 lg:px-10">
        <Link
          href="/"
          className={`shrink-0 text-[15px] font-bold tracking-tight sm:text-[18px] ${
            pathname === "/" ? "text-dore" : "text-ivoire hover:text-dore"
          }`}
          aria-label={t("nav.offres")}
        >
          Job Boarding
        </Link>
        <nav className="hidden min-w-0 flex-1 items-center gap-4 text-[14px] md:flex lg:gap-5 lg:text-[15px]">
          {liensRole.map((lien) => (
            <Link
              key={lien.href}
              href={lien.href}
              className={
                lienActif(pathname, lien.href)
                  ? "font-semibold text-dore"
                  : "text-ivoire/70 hover:text-ivoire"
              }
            >
              {lien.libelle}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex shrink-0 items-center gap-1.5 text-[13px] sm:gap-3 sm:text-[15px]">
          {user?.role !== "entreprise" ? <SelecteurPays /> : null}
          {user ? (
            <>
              <span className="hidden text-ivoire/65 lg:inline">
                {user.prenom} {user.nom}
              </span>
              {liensRole.map((lien) => (
                <Link
                  key={`m-${lien.href}`}
                  href={lien.href}
                  className={`md:hidden ${
                    lienActif(pathname, lien.href)
                      ? "font-semibold text-dore"
                      : "text-ivoire/80"
                  }`}
                >
                  {lien.libelle}
                </Link>
              ))}
              <button
                type="button"
                onClick={deconnecter}
                className="font-semibold text-ivoire hover:text-dore hover:underline"
              >
                {t("nav.deconnexion")}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/connexion"
                className={
                  pathname === "/connexion"
                    ? "font-semibold text-dore"
                    : "whitespace-nowrap text-ivoire/80 hover:text-ivoire"
                }
              >
                {t("nav.connexion")}
              </Link>
              <Link
                href="/inscription"
                className="inline-flex h-8 shrink-0 items-center rounded-lg bg-dore px-2.5 text-[12px] font-semibold text-marque hover:bg-dore-hover sm:h-10 sm:px-4 sm:text-sm"
              >
                {t("nav.inscription")}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
