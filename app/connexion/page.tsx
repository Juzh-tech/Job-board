/**
 * @fileoverview Route /connexion.
 *
 * But
 *   Wrapper page → EcranConnexion. Une URL = un page.tsx mince.
 */
/**
 * Adresse : /connexion
 * L'interface est dans ecrans/connexion/EcranConnexion.tsx.
 */
import { EcranConnexion } from "@/ecrans/connexion/EcranConnexion";

export default function PageConnexion() {
  return <EcranConnexion />;
}
