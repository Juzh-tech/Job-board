/**
 * @fileoverview Contenu politique cookies.
 */
import Link from "next/link";
import { PageLegale } from "@/composants/legal/PageLegale";
import { SITE } from "@/lib/site";

export function EcranCookies() {
  return (
    <PageLegale
      titre="Politique cookies"
      description="Quels traceurs Job Board utilise, pourquoi, et comment gérer votre consentement."
    >
      <p className="text-[13px] text-muet">Dernière mise à jour : 9 octobre 2026</p>

      <h2>1. Qu’est-ce qu’un cookie ?</h2>
      <p>
        Un cookie ou traceur est un fichier ou une information stockée sur votre terminal lors de
        la visite d’un site. Sur Job Board, certaines informations de session peuvent aussi être
        conservées en stockage local du navigateur pour des raisons techniques.
      </p>

      <h2>2. Cookies et traceurs strictement nécessaires</h2>
      <p>
        Ils permettent le fonctionnement du service (sécurité, maintien de session, mémorisation
        de votre choix de consentement). Ils ne requièrent pas de consentement préalable.
      </p>

      <h2>3. Mesure d’audience</h2>
      <p>
        Avec votre accord, Job Board peut activer une mesure d’audience afin de comprendre
        l’usage des pages (parcours, performances) dans une finalité d’amélioration du service.
        Aucun script de mesure n’est chargé tant que vous n’avez pas accepté.
      </p>

      <h2>4. Gestion du consentement</h2>
      <p>
        Lors de votre première visite, une bannière vous permet d’accepter ou de refuser la mesure
        d’audience. Vous pouvez modifier votre choix à tout moment en effaçant les données du site
        dans votre navigateur, ou en nous contactant : {SITE.dpo.email}.
      </p>

      <h2>5. Durée</h2>
      <p>Le consentement est conservé au maximum 13 mois, conformément aux recommandations CNIL.</p>

      <h2>6. Plus d’informations</h2>
      <p>
        Voir la <Link href="/confidentialite">politique de confidentialité</Link> et les{" "}
        <Link href="/cgu">CGU</Link>.
      </p>
    </PageLegale>
  );
}