/**
 * @fileoverview Liste des secteurs d'activité (domaines sans sous-domaines).
 *
 * But
 *   Alimente les selects inscription / fiche entreprise.
 */
/**
 * Domaines d’activité (niveau 1 uniquement, sans sous-secteurs).
 */

export type SecteurOption = {
  id: string;
  libelle: string;
  mots: string;
};

function s(id: string, libelle: string): SecteurOption {
  return { id, libelle, mots: `${id} ${libelle}`.toLowerCase() };
}

export const SECTEURS: SecteurOption[] = [
  s("agri", "Agriculture, sylviculture et pêche"),
  s("mines", "Industries extractives"),
  s("industrie", "Industrie manufacturière"),
  s("energie", "Énergie et utilities"),
  s("btp", "BTP et construction"),
  s("commerce", "Commerce"),
  s("transport", "Transport et logistique"),
  s("hotellerie", "Hôtellerie, restauration, tourisme"),
  s("info", "Information et communication"),
  s("tech", "Technologies de l’information"),
  s("finance", "Finance et assurance"),
  s("immo", "Activités immobilières"),
  s("services", "Services aux entreprises"),
  s("rh", "Ressources humaines et recrutement"),
  s("marketing", "Marketing et communication"),
  s("design", "Design, UX et création"),
  s("sante", "Santé et action sociale"),
  s("education", "Éducation et formation"),
  s("recherche", "Recherche et développement"),
  s("admin", "Administration publique"),
  s("defense", "Défense et sécurité"),
  s("juridique", "Juridique et fiscal"),
  s("compta", "Comptabilité et audit"),
  s("conseil", "Conseil et stratégie"),
  s("culture", "Arts, culture et divertissement"),
  s("sport", "Sport et loisirs"),
  s("associatif", "Associatif et économie sociale"),
  s("environnement", "Environnement et développement durable"),
  s("agroalimentaire", "Agroalimentaire"),
  s("automobile", "Automobile et mobilité"),
  s("aeronautique", "Aéronautique et spatial"),
  s("pharmaceutique", "Pharmaceutique et biotech"),
  s("telecom", "Télécommunications"),
  s("media", "Médias et audiovisuel"),
  s("ecommerce", "E-commerce et marketplace"),
  s("logistique", "Entreposage et supply chain"),
  s("interim", "Intérim et travail temporaire"),
  s("artisanat", "Artisanat"),
  s("luxe", "Luxe et mode"),
  s("beaute", "Beauté et bien-être"),
  s("proprete", "Propreté et services à la personne"),
  s("banque", "Banque et assurance mutualiste"),
  s("autre", "Autre / non classé"),
];

export function filtrerSecteurs(saisie: string, limite = 25): SecteurOption[] {
  const q = saisie.trim().toLowerCase();
  if (!q) {
    return SECTEURS.slice(0, limite);
  }
  return SECTEURS.filter((s) => s.mots.includes(q) || s.libelle.toLowerCase().includes(q)).slice(
    0,
    limite,
  );
}

export function secteurParId(id: string): SecteurOption | undefined {
  return SECTEURS.find((s) => s.id === id);
}
