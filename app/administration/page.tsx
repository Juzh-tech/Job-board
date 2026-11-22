/**
 * @fileoverview Route /administration — back-office.
 *
 * But
 *   Wrapper page → EcranAdministration (JWT role=admin).
 */
/**
 * Adresse : /administration
 * L'interface est dans ecrans/administration/EcranAdministration.tsx.
 */
import { EcranAdministration } from "@/ecrans/administration/EcranAdministration";

export default function PageAdministration() {
  return <EcranAdministration />;
}
