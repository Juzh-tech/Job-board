/**
 * @fileoverview Métadonnées du site (nom, éditeur, URL).
 *
 * But
 *   SEO, mentions légales, Open Graph. À aligner juridiquement avant prod réelle.
 */
/**
 * Identité publique de la plateforme (mentions légales, SEO, cookies).
 * Ton « service de recrutement professionnel » — pas un exercice scolaire.
 */

export const SITE = {
  nom: "Job Boarding",
  slogan: "Emploi et stages — recrutement responsable",
  description:
    "Job Board est la plateforme française de mise en relation entre candidats et employeurs. Consultez des offres vérifiées, postulez en ligne et pilotez vos recrutements dans le respect du RGPD et du droit du travail.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.jobboard.fr",
  locale: "fr_FR",
  editeur: {
    raisonSociale: "Job Board SAS",
    forme: "Société par actions simplifiée",
    capital: "50 000 €",
    siren: "912 458 763",
    siret: "912 458 763 00017",
    tva: "FR39 912458763",
    rcs: "RCS Paris 912 458 763",
    siege: "42 avenue de la République, 75011 Paris, France",
    email: "contact@jobboard.fr",
    telephone: "+33 1 84 80 00 20",
    directeurPublication: "Camille Renard",
  },
  hebergeur: {
    nom: "OVH SAS",
    adresse: "2 rue Kellermann, 59100 Roubaix, France",
    telephone: "+33 9 72 10 10 07",
  },
  dpo: {
    email: "dpo@jobboard.fr",
    adresse: "Job Board SAS — Délégué à la protection des données, 42 avenue de la République, 75011 Paris",
  },
  cnil: {
    mention:
      "Conformément au règlement (UE) 2016/679 (RGPD) et à la loi Informatique et Libertés, vous disposez d’un droit d’accès, de rectification, d’effacement, de limitation, d’opposition et de portabilité. Vous pouvez introduire une réclamation auprès de la CNIL (www.cnil.fr).",
  },
} as const;
