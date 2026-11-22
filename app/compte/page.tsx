/**
 * @fileoverview Route /compte (espace candidat).
 *
 * But
 *   Wrapper page → EcranCompte.
 */
/**
 * Adresse : /compte
 * L'interface est dans ecrans/compte/EcranCompte.tsx.
 */
import { EcranCompte } from "@/ecrans/compte/EcranCompte";

export default function PageCompte() {
  return <EcranCompte />;
}
