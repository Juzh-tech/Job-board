/**
 * @fileoverview Contenu politique de confidentialité (RGPD).
 */
import Link from "next/link";
import { PageLegale } from "@/composants/legal/PageLegale";
import { SITE } from "@/lib/site";

export function EcranConfidentialite() {
  const { editeur, dpo, cnil } = SITE;

  return (
    <PageLegale
      titre="Politique de confidentialité"
      description="Comment Job Board collecte, utilise et protège vos données personnelles (RGPD)."
    >
      <p className="text-[13px] text-muet">Dernière mise à jour : 9 octobre 2026</p>

      <h2>1. Responsable de traitement</h2>
      <p>
        {editeur.raisonSociale} — {editeur.siege} — {editeur.email}. Délégué à la protection des
        données : {dpo.email}.
      </p>

      <h2>2. Données traitées</h2>
      <ul>
        <li>Identité et contact : prénom, nom, e-mail, téléphone</li>
        <li>Données de compte : rôle, mot de passe hashé, préférences</li>
        <li>Profil professionnel : CV (nom de fichier / document), messages de candidature</li>
        <li>Données entreprise : raison sociale, secteur, ville, site, présentation, statut de vérification</li>
        <li>Données techniques : logs de connexion, adresse IP (sécurité), journaux d’audit</li>
      </ul>

      <h2>3. Finalités et bases légales</h2>
      <ul>
        <li>
          <strong>Exécution du contrat</strong> : création de compte, publication d’offres,
          candidatures, suivi des dossiers
        </li>
        <li>
          <strong>Intérêt légitime</strong> : sécurité, prévention de la fraude, amélioration du
          service, statistiques agrégées
        </li>
        <li>
          <strong>Obligation légale</strong> : conservation de certaines traces, réponses aux
          autorités compétentes
        </li>
        <li>
          <strong>Consentement</strong> : cookies de mesure d’audience (voir{" "}
          <Link href="/cookies">politique cookies</Link>)
        </li>
      </ul>

      <h2>4. Destinataires</h2>
      <p>
        Vos données sont accessibles aux services habilités de Job Board et, le cas échéant, à
        l’entreprise destinataire d’une candidature. Nos sous-traitants (hébergement, e-mail
        transactionnel) sont liés par contrat et n’agissent que sur instruction.
      </p>

      <h2>5. Transferts hors UE</h2>
      <p>
        Les traitements sont prioritairement réalisés dans l’Union européenne. Tout transfert hors
        UE s’appuie sur des garanties appropriées (clauses contractuelles types, décisions
        d’adéquation).
      </p>

      <h2>6. Durées de conservation</h2>
      <ul>
        <li>Compte actif : durée de la relation + 3 ans d’inactivité</li>
        <li>Candidatures : 2 ans après le dernier contact utile, sauf obligation plus longue</li>
        <li>Logs de sécurité : 12 mois</li>
        <li>Preuves de consentement cookies : 13 mois</li>
      </ul>

      <h2>7. Vos droits</h2>
      <p>
        Accès, rectification, effacement, limitation, opposition, portabilité, directives
        post-mortem. Exercice : {dpo.email} ou courrier à {dpo.adresse}. {cnil.mention}
      </p>

      <h2>8. Sécurité</h2>
      <p>
        Mot de passe hashé (bcrypt), accès API par jeton, cloisonnement des rôles
        (candidat / entreprise / admin), validation des entreprises avant publication d’offres.
      </p>

      <h2>9. Mineurs</h2>
      <p>
        Le service s’adresse aux personnes majeures ou, pour les stages, aux personnes disposant
        de la capacité juridique requise. Les représentants légaux peuvent exercer les droits pour
        le compte d’un mineur.
      </p>

      <h2>10. Contact</h2>
      <p>
        Questions privacy : {dpo.email}. Mentions légales :{" "}
        <Link href="/mentions-legales">page dédiée</Link>.
      </p>
    </PageLegale>
  );
}
