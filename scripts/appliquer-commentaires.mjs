/**
 * Script one-shot : pose un en-tête @fileoverview sur les sources TS/TSX.
 * Forme "grande boîte" (fileoverview + But / Idée) + ton du projet.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** @type {Record<string, string>} */
const headers = {
  "middleware.ts": `/**
 * @fileoverview Middleware Next — durcissement HTTP en production.
 *
 * But
 *   Forcer le HTTPS (HSTS) quand FORCE_HTTPS est actif. En local on touche pas.
 *
 * Idée derrière
 *   La sécu transport reste hors des pages : un seul endroit pour la règle.
 */`,

  "next.config.ts": `/**
 * @fileoverview Config Next.js du Job Board.
 *
 * But
 *   Réglages build / runtime du framework. Option globale → ici, pas dans chaque page.
 */`,

  "types/candidature.ts": `/**
 * @fileoverview Types métier d'une candidature.
 *
 * But
 *   Shape partagé API / mappers / écrans (pipeline, entretien, commentaires).
 *   Si front et back divergent sur une candidature, commence ici.
 */`,

  "types/compte.ts": `/**
 * @fileoverview Types compte / session côté front.
 *
 * But
 *   Ce que le navigateur garde après login (token + infos affichables).
 *   Pas de mot de passe ici — jamais.
 */`,

  "types/entreprise.ts": `/**
 * @fileoverview Types entreprise (fiche publique + espace recruteur).
 *
 * But
 *   Statut de vérif, logo, infos. Aligné sur la table companies.
 */`,

  "types/offre.ts": `/**
 * @fileoverview Types d'une offre d'emploi / stage.
 *
 * But
 *   Contrat TypeScript de advertisement + champs entreprise joints pour l'UI.
 */`,

  "types/personne.ts": `/**
 * @fileoverview Types people (candidat / entreprise / admin).
 *
 * But
 *   Rôles et profils. companyId seulement si role = entreprise.
 */`,

  "lib/admin-auth.ts": `/**
 * @fileoverview Helpers garde d'accès admin.
 *
 * But
 *   Vérifier qu'un JWT a bien le rôle admin avant /api/admin/*.
 */`,

  "lib/api.ts": `/**
 * @fileoverview Client HTTP du front vers /api/*.
 *
 * But
 *   Tous les fetch du site passent (idéalement) par ici.
 *   Si un écran appelle mal une route, regarde d'abord ce fichier.
 *
 * Idée derrière
 *   Un seul endroit pour coller le Bearer token et parser les erreurs JSON.
 */`,

  "lib/auth-serveur.ts": `/**
 * @fileoverview Auth côté serveur uniquement (bcrypt + JWT).
 *
 * SECURITY
 *   Ne JAMAIS importer ce module dans un composant client : il lit JWT_SECRET.
 *
 * But
 *   Hasher les mdp, signer / vérifier les tokens, extraire l'user d'une requête.
 */`,

  "lib/brouillon-offre.ts": `/**
 * @fileoverview Brouillon d'offre en localStorage côté recruteur.
 *
 * But
 *   Si le recruteur quitte le formulaire, on peut récupérer ce qu'il écrivait.
 *   C'est du confort UI, pas de la BDD.
 */`,

  "lib/candidatures-requetes.ts": `/**
 * @fileoverview Requêtes SQL partagées sur les candidatures.
 *
 * But
 *   Éviter de dupliquer les gros SELECT entre routes candidat / entreprise / admin.
 */`,

  "lib/consentement.ts": `/**
 * @fileoverview Consentement cookies / mesure d'audience.
 *
 * But
 *   Lire / écrire le choix CNIL et activer la mesure seulement si OK.
 */`,

  "lib/coordonnees-villes.ts": `/**
 * @fileoverview Coordonnées lat/lng de villes pour le filtre rayon (km).
 *
 * But
 *   Points GPS de référence pour \"autour de X km\" sur le board.
 */`,

  "lib/cv-stockage.ts": `/**
 * @fileoverview Stockage disque des CV (uploads/cv).
 *
 * But
 *   Écrire / résoudre le chemin d'un PDF. MySQL ne garde que le nom de fichier.
 */`,

  "lib/db.ts": `/**
 * @fileoverview Pool MySQL partagé par toutes les routes API.
 *
 * But
 *   Une config (.env.local) + charset utf8mb4 forcé. BDD down → commence ici.
 */`,

  "lib/format.ts": `/**
 * @fileoverview Petits formatages d'affichage (dates, libellés…).
 *
 * But
 *   Garder l'UI homogène sans recopier toLocaleDateString partout.
 */`,

  "lib/geo.ts": `/**
 * @fileoverview Calculs géo (Haversine) pour le rayon km.
 *
 * But
 *   Distance à vol d'oiseau entre deux points. Sert au filtre offres.
 */`,

  "lib/libelles.ts": `/**
 * @fileoverview Libellés de statuts / contrats affichés dans l'UI.
 *
 * But
 *   Traduire les enums BDD en texte humain hors i18n complet.
 */`,

  "lib/mappers.ts": `/**
 * @fileoverview Mapping lignes SQL → objets TypeScript du front.
 *
 * But
 *   La BDD parle snake_case ; l'UI parle camelCase. Le passage se fait ici.
 */`,

  "lib/offres.ts": `/**
 * @fileoverview Helpers métier autour des offres (filtres, requêtes).
 *
 * But
 *   Logique réutilisée par /api/offres sans gonfler les route.ts.
 */`,

  "lib/pays.ts": `/**
 * @fileoverview Catalogue pays (langue, devise, validation ID entreprise…).
 *
 * But
 *   Le marché = le pays. Sélecteur en haut → locale + filtre offres.
 */`,

  "lib/rate-limit.ts": `/**
 * @fileoverview Rate-limit mémoire (login / register).
 *
 * But
 *   Freiner un peu le brute-force. Pas un WAF pro — juste du raisonnable démo.
 */`,

  "lib/remuneration.ts": `/**
 * @fileoverview Estimation rémunération (horaire → mois / année).
 *
 * But
 *   Même idée recruteur (saisie) et candidat (détail offre).
 */`,

  "lib/roles.ts": `/**
 * @fileoverview Constantes / helpers de rôles.
 *
 * But
 *   Un seul endroit pour les strings de rôle (éviter les typos).
 */`,

  "lib/secteurs.ts": `/**
 * @fileoverview Liste des secteurs d'activité (domaines sans sous-domaines).
 *
 * But
 *   Alimente les selects inscription / fiche entreprise.
 */`,

  "lib/session.ts": `/**
 * @fileoverview Session navigateur (JWT en localStorage).
 *
 * But
 *   Lire / écrire / supprimer le token après login / logout.
 *
 * Note
 *   localStorage ≠ cookie HttpOnly — limite XSS connue.
 */`,

  "lib/site.ts": `/**
 * @fileoverview Métadonnées du site (nom, éditeur, URL).
 *
 * But
 *   SEO, mentions légales, Open Graph. À aligner juridiquement avant prod réelle.
 */`,

  "lib/telephone.ts": `/**
 * @fileoverview Validation / format téléphone selon le pays.
 *
 * But
 *   Ex. FR = 9 chiffres hors indicatif. Pas un vague string libre.
 */`,

  "lib/useEstGrandEcran.ts": `/**
 * @fileoverview Hook : layout desktop ou mobile ?
 *
 * But
 *   Split liste / détail offres : sur mobile une vue à la fois.
 */`,

  "lib/validation.ts": `/**
 * @fileoverview Validations partagées des formulaires.
 *
 * But
 *   Règles + messages cohérents inscription / profil / offres.
 */`,

  "lib/verifierCv.ts": `/**
 * @fileoverview Contrôles fichier CV (type, taille…).
 *
 * But
 *   Refuser tôt un fichier foireux avant écriture disque.
 */`,

  "lib/i18n/contexte.tsx": `/**
 * @fileoverview Provider de locale (pays → langue UI).
 *
 * But
 *   Expose t() + pays courant. Branché dans app/layout.tsx.
 */`,

  "lib/i18n/dictionnaires.ts": `/**
 * @fileoverview Dictionnaires de traduction (FR / ES / EN…).
 *
 * But
 *   Toutes les clés i18n. Nouvelle chaîne UI → ajoute la clé dans chaque langue.
 */`,

  "app/layout.tsx": `/**
 * @fileoverview Layout racine : header, zone pages, footer, cookies, locale.
 *
 * But
 *   Coquille commune à presque tout le site. Les pages enfants se rendent dans {children}.
 */`,

  "app/page.tsx": `/**
 * @fileoverview Route / — accueil board d'offres.
 *
 * But
 *   Point d'entrée URL. L'UI réelle vit dans ecrans/accueil.
 */`,

  "app/not-found.tsx": `/**
 * @fileoverview Page 404 Next.
 *
 * But
 *   URL inconnue → message clair + retour possible vers le board.
 */`,

  "app/icon.tsx": `/**
 * @fileoverview Icône / favicon générée par Next.
 *
 * But
 *   Petit asset marque pour l'onglet navigateur.
 */`,

  "app/robots.ts": `/**
 * @fileoverview robots.txt dynamique.
 *
 * But
 *   Dire aux crawlers quoi indexer (espaces privés exclus).
 */`,

  "app/sitemap.ts": `/**
 * @fileoverview sitemap.xml dynamique.
 *
 * But
 *   Liste les URLs publiques pour le SEO.
 */`,

  "app/connexion/page.tsx": `/**
 * @fileoverview Route /connexion.
 *
 * But
 *   Wrapper page → EcranConnexion. Une URL = un page.tsx mince.
 */`,

  "app/inscription/page.tsx": `/**
 * @fileoverview Route /inscription.
 *
 * But
 *   Wrapper page → parcours candidat ou entreprise.
 */`,

  "app/compte/page.tsx": `/**
 * @fileoverview Route /compte (espace candidat).
 *
 * But
 *   Wrapper page → EcranCompte.
 */`,

  "app/entreprise/page.tsx": `/**
 * @fileoverview Route /entreprise (espace recruteur).
 *
 * But
 *   Wrapper page → EcranEntreprise.
 */`,

  "app/entreprise/cv/page.tsx": `/**
 * @fileoverview Route lecture CV côté entreprise.
 *
 * But
 *   Afficher / télécharger un CV autorisé pour le recruteur connecté.
 */`,

  "app/entreprises/[id]/page.tsx": `/**
 * @fileoverview Route /entreprises/[id] — fiche publique.
 *
 * But
 *   Wrapper page → EcranFicheEntreprise.
 */`,

  "app/administration/page.tsx": `/**
 * @fileoverview Route /administration — back-office.
 *
 * But
 *   Wrapper page → EcranAdministration (JWT role=admin).
 */`,

  "app/offres/page.tsx": `/**
 * @fileoverview Route /offres — liste / détail alternative.
 *
 * But
 *   Même métier que l'accueil, layout un peu différent (colonnes).
 */`,

  "app/cgu/page.tsx": `/**
 * @fileoverview Route /cgu.
 */`,

  "app/confidentialite/page.tsx": `/**
 * @fileoverview Route /confidentialite.
 */`,

  "app/cookies/page.tsx": `/**
 * @fileoverview Route /cookies.
 */`,

  "app/mentions-legales/page.tsx": `/**
 * @fileoverview Route /mentions-legales.
 */`,

  // API routes
  "app/api/auth/login/route.ts": `/**
 * @fileoverview POST /api/auth/login — connexion.
 *
 * But
 *   Vérifier email/mdp (bcrypt) → renvoyer un JWT + infos user.
 *   Rate-limit léger pour freiner le brute-force.
 */`,

  "app/api/auth/register/route.ts": `/**
 * @fileoverview POST /api/auth/register — inscription candidat ou entreprise.
 *
 * But
 *   Créer people (+ companies si entreprise en_attente). Mdp hashé avant INSERT.
 */`,

  "app/api/profil/route.ts": `/**
 * @fileoverview PATCH /api/profil — maj profil du compte connecté.
 *
 * But
 *   Infos perso / mdp / CV lié. JWT obligatoire.
 */`,

  "app/api/offres/route.ts": `/**
 * @fileoverview GET /api/offres — liste publique filtrable.
 *
 * But
 *   Board : pays, contrat, recherche, rayon… Seulement offres visibles.
 */`,

  "app/api/offres/[id]/route.ts": `/**
 * @fileoverview GET /api/offres/[id] — détail d'une offre.
 *
 * But
 *   Fiche complète pour le panneau détail / \"en savoir plus\".
 */`,

  "app/api/entreprises/[id]/route.ts": `/**
 * @fileoverview GET /api/entreprises/[id] — fiche publique entreprise.
 */`,

  "app/api/candidatures/route.ts": `/**
 * @fileoverview GET/POST /api/candidatures — côté candidat.
 *
 * But
 *   Lister mes candidatures / postuler. JWT role candidat (ou admin).
 */`,

  "app/api/candidatures/[id]/route.ts": `/**
 * @fileoverview PATCH /api/candidatures/[id] — maj statut (recruteur).
 *
 * But
 *   Pipeline : en_etude, entretien, acceptée, refus… JWT entreprise.
 */`,

  "app/api/candidatures/[id]/commentaires/route.ts": `/**
 * @fileoverview POST commentaire interne sur une candidature.
 *
 * But
 *   Notes recruteur invisibles du candidat.
 */`,

  "app/api/cv/upload/route.ts": `/**
 * @fileoverview POST /api/cv/upload — upload CV candidat.
 *
 * SECURITY
 *   JWT + vérif type/taille fichier avant écriture disque.
 */`,

  "app/api/cv/[fichier]/route.ts": `/**
 * @fileoverview GET /api/cv/[fichier] — téléchargement CV autorisé.
 *
 * SECURITY
 *   Pas de listing public : candidat proprio, entreprise concernée, ou admin.
 */`,

  "app/api/entreprise/me/route.ts": `/**
 * @fileoverview GET/PATCH /api/entreprise/me — profil boîte du JWT.
 *
 * But
 *   Gate en_attente / refusee / validee + édition infos / logo metadata.
 */`,

  "app/api/entreprise/offres/route.ts": `/**
 * @fileoverview GET/POST /api/entreprise/offres — offres de ma boîte.
 *
 * But
 *   Lister / publier (entreprise validée). Draft possible.
 */`,

  "app/api/entreprise/offres/[id]/route.ts": `/**
 * @fileoverview PATCH /api/entreprise/offres/[id] — maj / retrait offre.
 *
 * But
 *   Éditer ou retirer du marché (is_active / status) pour SA boîte uniquement.
 */`,

  "app/api/entreprise/candidatures/route.ts": `/**
 * @fileoverview GET candidatures reçues par mon entreprise.
 */`,

  "app/api/entreprise/reclamation/route.ts": `/**
 * @fileoverview POST réclamation si entreprise refusée.
 *
 * But
 *   Laisser un message / trace quand l'admin a refusé la boîte.
 */`,

  "app/api/entreprise/logo/upload/route.ts": `/**
 * @fileoverview POST upload logo entreprise.
 *
 * But
 *   Fichier sur disque + nom en base (logo_filename).
 */`,

  "app/api/entreprise/logo/[fichier]/route.ts": `/**
 * @fileoverview GET logo entreprise (fichier image).
 */`,

  "app/api/admin/entreprises/route.ts": `/**
 * @fileoverview GET /api/admin/entreprises — liste admin.
 *
 * SECURITY
 *   JWT role=admin obligatoire.
 */`,

  "app/api/admin/entreprises/[id]/route.ts": `/**
 * @fileoverview PATCH entreprise (valider / refuser + motif).
 *
 * But
 *   Cœur de la file de vérification admin.
 */`,

  "app/api/admin/entreprises/[id]/delete/route.ts": `/**
 * @fileoverview DELETE entreprise (admin).
 */`,

  "app/api/admin/offres/route.ts": `/**
 * @fileoverview GET /api/admin/offres — toutes les offres.
 */`,

  "app/api/admin/offres/[id]/route.ts": `/**
 * @fileoverview DELETE /api/admin/offres/[id].
 */`,

  "app/api/admin/comptes/route.ts": `/**
 * @fileoverview GET /api/admin/comptes — tous les people.
 */`,

  "app/api/admin/comptes/[id]/route.ts": `/**
 * @fileoverview DELETE /api/admin/comptes/[id].
 */`,

  "app/api/admin/candidatures/route.ts": `/**
 * @fileoverview GET /api/admin/candidatures — vue globale.
 */`,

  "app/api/admin/candidatures/[id]/route.ts": `/**
 * @fileoverview DELETE /api/admin/candidatures/[id].
 */`,

  // Écrans
  "ecrans/accueil/EcranAccueil.tsx": `/**
 * @fileoverview Écran d'accueil — board offres + panneau détail / postuler.
 *
 * But
 *   Cœur candidat : liste à gauche, fiche à droite (desktop), une vue sur mobile.
 *   Branché sur /api/offres et la session.
 */`,

  "ecrans/offres/EcranOffres.tsx": `/**
 * @fileoverview Écran /offres — variante liste + détail en colonnes.
 *
 * But
 *   Même métier que l'accueil, autre layout. Réutilise les composants offres.
 */`,

  "ecrans/connexion/EcranConnexion.tsx": `/**
 * @fileoverview Écran de connexion.
 *
 * But
 *   Formulaire → apiLogin → stocke le JWT → redirect selon le rôle.
 */`,

  "ecrans/inscription/EcranInscription.tsx": `/**
 * @fileoverview Écran d'inscription (candidat ou entreprise, multi-étapes).
 *
 * But
 *   Collecte les infos, valide téléphone / ID entreprise selon pays, appelle register.
 */`,

  "ecrans/compte/EcranCompte.tsx": `/**
 * @fileoverview Espace candidat (/compte).
 *
 * But
 *   Profil, CV, suivi des candidatures. JWT role=candidat.
 */`,

  "ecrans/entreprise/EcranEntreprise.tsx": `/**
 * @fileoverview Espace recruteur (/entreprise).
 *
 * But
 *   Offres, pipeline candidatures, logo, réclamation si refus, brouillon publication.
 *   Gros fichier : c'est normal, c'est le cockpit entreprise.
 */`,

  "ecrans/fiche-entreprise/EcranFicheEntreprise.tsx": `/**
 * @fileoverview Fiche publique d'une entreprise + ses offres.
 *
 * But
 *   Page /entreprises/[id] pour un candidat qui veut voir la boîte.
 */`,

  "ecrans/administration/EcranAdministration.tsx": `/**
 * @fileoverview Back-office admin.
 *
 * But
 *   Tableau de bord, vérification entreprises, CRUD listes (offres, comptes…).
 *   Tout passe par /api/admin/* avec JWT admin.
 */`,

  "ecrans/legal/EcranCgu.tsx": `/**
 * @fileoverview Contenu page CGU.
 */`,

  "ecrans/legal/EcranConfidentialite.tsx": `/**
 * @fileoverview Contenu politique de confidentialité (RGPD).
 */`,

  "ecrans/legal/EcranCookies.tsx": `/**
 * @fileoverview Contenu politique cookies.
 */`,

  "ecrans/legal/EcranMentionsLegales.tsx": `/**
 * @fileoverview Contenu mentions légales.
 */`,

  // Composants
  "composants/mise-en-page/EnTete.tsx": `/**
 * @fileoverview Header du site (nav + sélecteur pays + session).
 *
 * But
 *   Liens selon le rôle. Job Boarding n'est pas un lien : c'est la marque.
 */`,

  "composants/mise-en-page/PiedDePage.tsx": `/**
 * @fileoverview Pied de page — marque + liens légaux.
 *
 * But
 *   Toujours visible sous la zone scrollable (layout flex). Liens À propos ici,
 *   plus dans le header.
 */`,

  "composants/mise-en-page/SelecteurPays.tsx": `/**
 * @fileoverview Select compact de pays / langue.
 *
 * But
 *   Change la locale + le marché d'offres. Label accessible, UI courte.
 */`,

  "composants/mise-en-page/BanniereCookies.tsx": `/**
 * @fileoverview Bannière consentement cookies (premier passage).
 *
 * But
 *   fixed bottom tant que pas de choix enregistré.
 */`,

  "composants/mise-en-page/CadreAuth.tsx": `/**
 * @fileoverview Coquille visuelle pages connexion / inscription.
 */`,

  "composants/mise-en-page/CadrePage.tsx": `/**
 * @fileoverview Coquille de page contenu (largeur max, scroll).
 */`,

  "composants/offres/CarteOffre.tsx": `/**
 * @fileoverview Carte d'une offre dans la liste.
 *
 * But
 *   Titre, tags, boutons En savoir plus / Postuler. Pas de popup.
 */`,

  "composants/offres/CarteOffreCourte.tsx": `/**
 * @fileoverview Mini carte offre (similaires / listes compactes).
 */`,

  "composants/offres/DetailOffre.tsx": `/**
 * @fileoverview Panneau détail d'une offre.
 *
 * But
 *   Description complète + estimation rémunération si horaire + offres similaires.
 */`,

  "composants/offres/FormulaireCandidature.tsx": `/**
 * @fileoverview Formulaire \"Postuler\" (sans popup).
 *
 * But
 *   Préremplit via session / CV profil, envoie POST /api/candidatures.
 */`,

  "composants/offres/BarreFiltres.tsx": `/**
 * @fileoverview Barre de filtres du board (recherche, contrat, rayon…).
 *
 * But
 *   Pilote la liste d'offres côté écran parent.
 */`,

  "composants/entreprise/ParcoursCandidature.tsx": `/**
 * @fileoverview UI pipeline d'une candidature côté recruteur.
 *
 * But
 *   Changer statut, planifier entretien, laisser un commentaire interne.
 */`,

  "composants/legal/PageLegale.tsx": `/**
 * @fileoverview Mise en page commune des pages légales.
 */`,

  "composants/ui/BadgeStatut.tsx": `/**
 * @fileoverview Badge visuel d'un statut candidature / offre.
 */`,

  "composants/ui/BadgeVerification.tsx": `/**
 * @fileoverview Badge statut vérif entreprise (attente / validée / refusée).
 */`,

  "composants/ui/Bouton.tsx": `/**
 * @fileoverview Bouton UI réutilisable (variants marque).
 */`,

  "composants/ui/ChampFichier.tsx": `/**
 * @fileoverview Champ upload fichier (CV / logo).
 */`,

  "composants/ui/ChampSelect.tsx": `/**
 * @fileoverview Select de formulaire standard.
 */`,

  "composants/ui/ChampSelectRecherche.tsx": `/**
 * @fileoverview Select avec recherche (longues listes : secteurs, villes…).
 */`,

  "composants/ui/ChampTelephone.tsx": `/**
 * @fileoverview Champ téléphone lié aux règles du pays.
 */`,

  "composants/ui/ChampTexte.tsx": `/**
 * @fileoverview Input texte de formulaire.
 */`,

  "composants/ui/ChampZoneTexte.tsx": `/**
 * @fileoverview Textarea de formulaire.
 */`,

  "composants/ui/LogoEntreprise.tsx": `/**
 * @fileoverview Affiche le logo boîte (ou initiale fallback).
 */`,

  "composants/ui/classes.ts": `/**
 * @fileoverview Classes Tailwind partagées des champs UI.
 *
 * But
 *   Un look cohérent sans copier-coller la même string partout.
 */`,

  "composants/ui/index.ts": `/**
 * @fileoverview Barrel exports des composants UI.
 *
 * But
 *   import { Bouton, ChampTexte } from \"@/composants/ui\".
 */`,
};

function stripLeadingHeader(src) {
  const trimmedStart = src.replace(/^\uFEFF/, "");
  const re = /^(\s*\/\*\*[\s\S]*?\*\/\s*)/;
  const m = trimmedStart.match(re);
  if (!m) return trimmedStart;
  const block = m[1];
  // On remplace seulement les en-têtes \"fichier\" (fileoverview / But / ancien style)
  if (
    /@fileoverview|Idée derrière|\* But\b|SECURITY|Écran |Espace |Route |Page |Composant |Fichier |Pied de page|Header |Client HTTP|Auth côté|Mapping |Types /i.test(
      block,
    )
  ) {
    return trimmedStart.slice(m[0].length);
  }
  return trimmedStart;
}

let ok = 0;
let skip = 0;
for (const [rel, header] of Object.entries(headers)) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) {
    console.warn("SKIP missing", rel);
    skip++;
    continue;
  }
  const raw = fs.readFileSync(full, "utf8");
  const body = stripLeadingHeader(raw);
  const next = `${header}\n${body.replace(/^\s*\n/, "")}`;
  if (next !== raw) {
    fs.writeFileSync(full, next, "utf8");
    ok++;
    console.log("OK", rel);
  } else {
    skip++;
  }
}
console.log(`Done. updated=${ok} skipped=${skip}`);
