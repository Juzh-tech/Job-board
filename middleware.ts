/**
 * @fileoverview Middleware Next — durcissement HTTP en production.
 *
 * But
 *   Forcer le HTTPS (HSTS) quand FORCE_HTTPS est actif. En local on touche pas.
 *
 * Idée derrière
 *   La sécu transport reste hors des pages : un seul endroit pour la règle.
 */
import { NextRequest, NextResponse } from "next/server";

/**
 * En production, redirige HTTP → HTTPS (derrière un reverse proxy qui pose
 * x-forwarded-proto). Désactivé en développement local.
 */
export function middleware(req: NextRequest) {
  if (process.env.NODE_ENV !== "production") {
    return NextResponse.next();
  }
  if (process.env.FORCE_HTTPS === "false") {
    return NextResponse.next();
  }

  const proto = req.headers.get("x-forwarded-proto");
  if (proto === "http") {
    const url = req.nextUrl.clone();
    url.protocol = "https:";
    return NextResponse.redirect(url, 308);
  }

  const reponse = NextResponse.next();
  reponse.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  return reponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};