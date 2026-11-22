/**
 * @fileoverview Rate-limit mémoire (login / register).
 *
 * But
 *   Freiner un peu le brute-force. Pas un WAF pro — juste du raisonnable démo.
 */
/**
 * Limitation simple en mémoire (anti-abus auth).
 * Suffisant pour un déploiement mono-instance ; en cluster, préférer Redis.
 */

type Entree = { compteur: number; resetAt: number };

const seau = new Map<string, Entree>();

export function verifierRateLimit(
  cle: string,
  { max = 20, fenetreMs = 15 * 60 * 1000 }: { max?: number; fenetreMs?: number } = {},
): { ok: true } | { ok: false; retryAfterSec: number } {
  const maintenant = Date.now();
  const actuelle = seau.get(cle);
  if (!actuelle || actuelle.resetAt <= maintenant) {
    seau.set(cle, { compteur: 1, resetAt: maintenant + fenetreMs });
    return { ok: true };
  }
  if (actuelle.compteur >= max) {
    return {
      ok: false,
      retryAfterSec: Math.ceil((actuelle.resetAt - maintenant) / 1000),
    };
  }
  actuelle.compteur += 1;
  return { ok: true };
}
