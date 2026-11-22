/**
 * @fileoverview Contenu mentions légales.
 */
import Link from "next/link";
import { PageLegale } from "@/composants/legal/PageLegale";
import { SITE } from "@/lib/site";

export function EcranMentionsLegales() {
  const { editeur, hebergeur, dpo } = SITE;

  return (
    <PageLegale
      titre="Mentions légales"
      description="Informations obligatoires relatives à l’éditeur et à l’hébergeur du service Job Board."
    >
      <p className="text-[13px] text-muet">Dernière mise à jour : 9 octobre 2026</p>

      <h2>1. Éditeur du service</h2>
      <p>
        Le site et la plateforme <strong>{SITE.nom}</strong> sont édités par{" "}
        <strong>{editeur.raisonSociale}</strong>, {editeur.forme} au capital de {editeur.capital},
        immatriculée au {editeur.rcs}, SIREN {editeur.siren}, SIRET {editeur.siret}, n° TVA
        intracommunautaire {editeur.tva}.
      </p>
      <ul>
        <li>Siège social : {editeur.siege}</li>
        <li>E-mail : {editeur.email}</li>
        <li>Téléphone : {editeur.telephone}</li>
        <li>Directeur de la publication : {editeur.directeurPublication}</li>
      </ul>

      <h2>2. Hébergement</h2>
      <p>
        Hébergeur : {hebergeur.nom} — {hebergeur.adresse} — {hebergeur.telephone}.
      </p>

      <h2>3. Objet du service</h2>
      <p>
        Job Board est un service numérique de mise en relation entre personnes en recherche
        d’emploi ou de stage et organisations recrutant sur le territoire français. Les offres
        publiées par les entreprises font l’objet d’une procédure de vérification d’identité avant
        diffusion publique, afin de limiter les risques d’usurpation et d’offres frauduleuses.
      </p>

      <h2>4. Propriété intellectuelle</h2>
      <p>
        L’ensemble des éléments composant la plateforme (marques, textes, interfaces, bases de
        données, logos) est protégé. Toute reproduction non autorisée est interdite, sous réserve
        des exceptions prévues par le Code de la propriété intellectuelle.
      </p>

      <h2>5. Données personnelles</h2>
      <p>
        Le traitement des données est décrit dans la{" "}
        <Link href="/confidentialite">politique de confidentialité</Link>. Contact DPO :{" "}
        {dpo.email}.
      </p>

      <h2>6. Droit applicable</h2>
      <p>
        Les présentes mentions sont régies par le droit français. En cas de litige, et faute
        d’accord amiable, les tribunaux français compétents seront saisis.
      </p>
    </PageLegale>
  );
}
