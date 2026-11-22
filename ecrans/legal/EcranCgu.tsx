/**
 * @fileoverview Contenu page CGU.
 */
import Link from "next/link";
import { PageLegale } from "@/composants/legal/PageLegale";
import { SITE } from "@/lib/site";

export function EcranCgu() {
  return (
    <PageLegale
      titre="Conditions générales d’utilisation"
      description="Règles d’accès et d’usage de la plateforme Job Board pour candidats, entreprises et administrateurs."
    >
      <p className="text-[13px] text-muet">Dernière mise à jour : 9 octobre 2026</p>

      <h2>1. Acceptation</h2>
      <p>
        L’accès et l’utilisation de {SITE.nom} emportent acceptation sans réserve des présentes
        CGU. Si vous n’acceptez pas ces conditions, vous ne devez pas utiliser le service.
      </p>

      <h2>2. Définitions</h2>
      <ul>
        <li>
          <strong>Candidat</strong> : personne physique créant un compte pour consulter des offres
          et postuler.
        </li>
        <li>
          <strong>Entreprise</strong> : organisation disposant d’un compte recruteur, soumise à
          vérification avant publication d’offres.
        </li>
        <li>
          <strong>Administrateur</strong> : personnel habilité de Job Board SAS pour la supervision
          de la plateforme.
        </li>
      </ul>

      <h2>3. Inscription et comptes</h2>
      <p>
        Vous vous engagez à fournir des informations exactes et à jour. Un seul compte par personne
        physique ou organisation est autorisé, sauf accord écrit de Job Board. Les identifiants
        sont personnels et confidentiels.
      </p>
      <p>
        Les comptes entreprise restent en statut « en attente » jusqu’à validation par nos équipes.
        Job Board peut refuser ou suspendre un compte en cas de doute sur l’identité, d’usage
        abusif ou de non-conformité au droit applicable.
      </p>

      <h2>4. Offres et candidatures</h2>
      <p>
        Les entreprises sont seules responsables du contenu des offres qu’elles publient
        (rémunération, lieu, description, critères). Les offres doivent respecter le Code du
        travail, le principe de non-discrimination et les bonnes pratiques de recrutement.
      </p>
      <p>
        Les candidats s’engagent à transmettre des informations et documents (CV) sincères. Job
        Board n’est pas partie au contrat de travail éventuellement conclu.
      </p>

      <h2>5. Comportements interdits</h2>
      <ul>
        <li>Usurpation d’identité ou fausses offres</li>
        <li>Collecte automatisée non autorisée (scraping abusif)</li>
        <li>Diffusion de contenus illicites, diffamatoires ou discriminatoires</li>
        <li>Tentative d’accès non autorisé aux systèmes ou aux données d’autrui</li>
        <li>Détournement de la plateforme à des fins de spam ou de phishing</li>
      </ul>

      <h2>6. Disponibilité et sécurité</h2>
      <p>
        Job Board met en œuvre des moyens raisonnables pour assurer la disponibilité et la
        sécurité du service (authentification, contrôle d’accès, journalisation). Aucune
        disponibilité absolue n’est garantie. Des maintenances peuvent interrompre temporairement
        l’accès.
      </p>

      <h2>7. Propriété et licence d’usage</h2>
      <p>
        Job Board vous concède une licence personnelle, non exclusive et révocable d’utilisation
        du service conformément aux présentes. Vous conservez vos droits sur les contenus que vous
        déposez ; vous nous accordez le droit de les héberger et de les afficher aux destinataires
        concernés (ex. CV transmis à l’employeur pour une candidature).
      </p>

      <h2>8. Responsabilité</h2>
      <p>
        Job Board agit en qualité d’intermédiaire technique. Sa responsabilité ne saurait être
        engagée du fait des relations entre candidats et entreprises, sous réserve des obligations
        légales impératives. En tout état de cause, la responsabilité de Job Board est limitée aux
        dommages directs et prévisibles.
      </p>

      <h2>9. Données personnelles</h2>
      <p>
        Voir la <Link href="/confidentialite">politique de confidentialité</Link> et la{" "}
        <Link href="/cookies">politique cookies</Link>.
      </p>

      <h2>10. Suspension et résiliation</h2>
      <p>
        Vous pouvez demander la clôture de votre compte via {SITE.editeur.email}. Job Board peut
        suspendre ou résilier un compte en cas de manquement aux CGU, sans préjudice des actions
        légales.
      </p>

      <h2>11. Modifications</h2>
      <p>
        Les CGU peuvent être mises à jour. La date indiquée en tête de page fait foi. L’usage
        continu du service après mise à jour vaut acceptation des nouvelles conditions.
      </p>

      <h2>12. Droit applicable</h2>
      <p>Droit français. Médiation et tribunaux compétents selon les règles en vigueur.</p>
    </PageLegale>
  );
}
