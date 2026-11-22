/**
 * @fileoverview Dictionnaires de traduction (FR / ES / EN…).
 *
 * But
 *   Toutes les clés i18n. Nouvelle chaîne UI → ajoute la clé dans chaque langue.
 */
import type { CodeLangue } from "@/lib/pays";

export type CleI18n =
  | "nav.offres"
  | "nav.apropos"
  | "nav.compte"
  | "nav.entreprise"
  | "nav.admin"
  | "nav.connexion"
  | "nav.inscription"
  | "nav.deconnexion"
  | "nav.pays"
  | "apropos.mentions"
  | "apropos.cgu"
  | "apropos.confidentialite"
  | "apropos.cookies"
  | "offre.profil"
  | "offre.description"
  | "offre.remuneration"
  | "offre.contrat"
  | "offre.tempsTravail"
  | "offre.enSavoirPlus"
  | "offre.postuler"
  | "offre.dejaPostule"
  | "offre.estimation"
  | "offre.retourListe"
  | "common.rechercher"
  | "common.obligatoire"
  | "common.facultatif"
  | "common.continuer"
  | "common.retour"
  | "common.enregistrer"
  | "common.annuler"
  | "common.chargement"
  | "common.publier"
  | "filtres.quoi"
  | "filtres.ou"
  | "filtres.placeholderMot"
  | "filtres.placeholderLieu"
  | "filtres.rechercher"
  | "filtres.tous"
  | "filtres.rayon"
  | "filtres.rayonExact"
  | "filtres.km"
  | "accueil.eyebrow"
  | "accueil.titre"
  | "accueil.sousTitre"
  | "accueil.marche"
  | "accueil.chargement"
  | "accueil.offresTrouvees"
  | "accueil.aucuneFiltre"
  | "accueil.aucuneMarche"
  | "accueil.erreurChargement"
  | "auth.tagline"
  | "auth.connexion.titre"
  | "auth.connexion.description"
  | "auth.connexion.email"
  | "auth.connexion.mdp"
  | "auth.connexion.submit"
  | "auth.connexion.pasCompte"
  | "auth.inscription.titre"
  | "auth.inscription.description"
  | "inscription.choix.titre"
  | "inscription.choix.candidat"
  | "inscription.choix.entreprise"
  | "inscription.etape"
  | "inscription.candidat.ok"
  | "inscription.entreprise.ok"
  | "compte.titre"
  | "compte.onglet.tableau"
  | "compte.onglet.candidatures"
  | "compte.onglet.profil"
  | "compte.profil.titre"
  | "compte.profil.aide"
  | "compte.profil.pays"
  | "entreprise.offres.titre"
  | "entreprise.offres.publier"
  | "entreprise.offres.modifier"
  | "entreprise.offres.candidatures"
  | "entreprise.publier.titre"
  | "entreprise.publier.editer"
  | "entreprise.publier.montant"
  | "entreprise.publier.periode"
  | "entreprise.publier.heures"
  | "entreprise.publier.estimation"
  | "entreprise.publier.lieu"
  | "entreprise.publier.contrat"
  | "entreprise.publier.temps"
  | "cv.apercu"
  | "cv.retourEntreprise";

const FR: Record<CleI18n, string> = {
  "nav.offres": "Offres",
  "nav.apropos": "À propos",
  "nav.compte": "Mon compte",
  "nav.entreprise": "Espace recruteur",
  "nav.admin": "Administration",
  "nav.connexion": "Se connecter",
  "nav.inscription": "S'inscrire",
  "nav.deconnexion": "Déconnexion",
  "nav.pays": "Pays",
  "apropos.mentions": "Mentions légales",
  "apropos.cgu": "CGU",
  "apropos.confidentialite": "Confidentialité",
  "apropos.cookies": "Cookies",
  "offre.profil": "Profil recherché",
  "offre.description": "Description du poste",
  "offre.remuneration": "Rémunération",
  "offre.contrat": "Contrat",
  "offre.tempsTravail": "Temps de travail",
  "offre.enSavoirPlus": "En savoir plus",
  "offre.postuler": "Postuler",
  "offre.dejaPostule": "Déjà postulé",
  "offre.estimation": "Estimation (heure / mois / an)",
  "offre.retourListe": "← Offres",
  "common.rechercher": "Rechercher…",
  "common.obligatoire": "obligatoire",
  "common.facultatif": "facultatif",
  "common.continuer": "Continuer",
  "common.retour": "Retour",
  "common.enregistrer": "Enregistrer",
  "common.annuler": "Annuler",
  "common.chargement": "Chargement…",
  "common.publier": "Publier",
  "filtres.quoi": "Quoi",
  "filtres.ou": "Où",
  "filtres.placeholderMot": "Métier, entreprise, mot-clé",
  "filtres.placeholderLieu": "Ville, télétravail…",
  "filtres.rechercher": "Rechercher",
  "filtres.tous": "Tous",
  "filtres.rayon": "Rayon",
  "filtres.rayonExact": "Ville exacte",
  "filtres.km": "km",
  "accueil.eyebrow": "Offres d'emploi et de stage",
  "accueil.titre": "Trouvez le poste qui vous correspond",
  "accueil.sousTitre":
    "CDI, stages, alternances, CDD — un seul endroit pour chercher, lire le détail et postuler.",
  "accueil.marche": "Marché",
  "accueil.chargement": "Chargement des offres…",
  "accueil.offresTrouvees": "offre(s) trouvée(s)",
  "accueil.aucuneFiltre": "Aucune offre ne correspond à votre recherche.",
  "accueil.aucuneMarche":
    "Aucune offre sur ce marché. Changez de pays dans l’en-tête ou Mon compte.",
  "accueil.erreurChargement":
    "Impossible de charger les offres. Réessayez dans un instant.",
  "auth.tagline": "Le job board simple pour candidats et recruteurs.",
  "auth.connexion.titre": "Connexion",
  "auth.connexion.description": "Accédez à votre espace candidat ou recruteur.",
  "auth.connexion.email": "E-mail",
  "auth.connexion.mdp": "Mot de passe",
  "auth.connexion.submit": "Se connecter",
  "auth.connexion.pasCompte": "Pas encore de compte ?",
  "auth.inscription.titre": "Inscription",
  "auth.inscription.description": "Créez un compte candidat ou demandez un accès recruteur.",
  "inscription.choix.titre": "Vous êtes…",
  "inscription.choix.candidat": "Candidat",
  "inscription.choix.entreprise": "Entreprise",
  "inscription.etape": "Étape",
  "inscription.candidat.ok": "Compte créé. Vous pouvez consulter les offres et postuler.",
  "inscription.entreprise.ok":
    "Demande envoyée. L’accès recruteur s’ouvrira après validation.",
  "compte.titre": "Mon compte",
  "compte.onglet.tableau": "Tableau de bord",
  "compte.onglet.candidatures": "Mes candidatures",
  "compte.onglet.profil": "Mon profil",
  "compte.profil.titre": "Mon profil",
  "compte.profil.aide":
    "Ici : vos infos personnelles. Le pays en haut du site sert seulement à explorer un autre marché.",
  "compte.profil.pays": "Pays (compte)",
  "entreprise.offres.titre": "Offres en ligne",
  "entreprise.offres.publier": "Publier une offre",
  "entreprise.offres.modifier": "Modifier",
  "entreprise.offres.candidatures": "Voir les candidatures",
  "entreprise.publier.titre": "Publier une offre",
  "entreprise.publier.editer": "Modifier l’offre",
  "entreprise.publier.montant": "Montant",
  "entreprise.publier.periode": "Période",
  "entreprise.publier.heures": "Temps de travail (h / semaine)",
  "entreprise.publier.estimation": "Estimation automatique",
  "entreprise.publier.lieu": "Lieu",
  "entreprise.publier.contrat": "Contrat",
  "entreprise.publier.temps": "Temps de travail",
  "cv.apercu": "Aperçu CV",
  "cv.retourEntreprise": "← Espace recruteur",
};

const ES: Record<CleI18n, string> = {
  "nav.offres": "Ofertas",
  "nav.apropos": "Acerca de",
  "nav.compte": "Mi cuenta",
  "nav.entreprise": "Espacio reclutador",
  "nav.admin": "Administración",
  "nav.connexion": "Iniciar sesión",
  "nav.inscription": "Registrarse",
  "nav.deconnexion": "Cerrar sesión",
  "nav.pays": "País",
  "apropos.mentions": "Aviso legal",
  "apropos.cgu": "Condiciones de uso",
  "apropos.confidentialite": "Privacidad",
  "apropos.cookies": "Cookies",
  "offre.profil": "Perfil buscado",
  "offre.description": "Descripción del puesto",
  "offre.remuneration": "Remuneración",
  "offre.contrat": "Contrato",
  "offre.tempsTravail": "Jornada",
  "offre.enSavoirPlus": "Saber más",
  "offre.postuler": "Postular",
  "offre.dejaPostule": "Ya has postulado",
  "offre.estimation": "Estimación (hora / mes / año)",
  "offre.retourListe": "← Ofertas",
  "common.rechercher": "Buscar…",
  "common.obligatoire": "obligatorio",
  "common.facultatif": "opcional",
  "common.continuer": "Continuar",
  "common.retour": "Volver",
  "common.enregistrer": "Guardar",
  "common.annuler": "Cancelar",
  "common.chargement": "Carga…",
  "common.publier": "Publicar",
  "filtres.quoi": "Qué",
  "filtres.ou": "Dónde",
  "filtres.placeholderMot": "Puesto, empresa, palabra clave",
  "filtres.placeholderLieu": "Ciudad, teletrabajo…",
  "filtres.rechercher": "Buscar",
  "filtres.tous": "Todos",
  "filtres.rayon": "Radio",
  "filtres.rayonExact": "Ciudad exacta",
  "filtres.km": "km",
  "accueil.eyebrow": "Ofertas de empleo y prácticas",
  "accueil.titre": "Encuentra el puesto que te corresponde",
  "accueil.sousTitre":
    "Indefinido, prácticas, formación dual, temporal — un solo lugar para buscar y postular.",
  "accueil.marche": "Mercado",
  "accueil.chargement": "Cargando ofertas…",
  "accueil.offresTrouvees": "oferta(s) encontrada(s)",
  "accueil.aucuneFiltre": "Ninguna oferta coincide con tu búsqueda.",
  "accueil.aucuneMarche":
    "No hay ofertas en este mercado. Cambia de país en el menú o en Mi cuenta.",
  "accueil.erreurChargement":
    "No se pueden cargar las ofertas. Inténtalo de nuevo en un momento.",
  "auth.tagline": "El job board sencillo para candidatos y reclutadores.",
  "auth.connexion.titre": "Inicio de sesión",
  "auth.connexion.description": "Accede a tu espacio de candidato o reclutador.",
  "auth.connexion.email": "Correo",
  "auth.connexion.mdp": "Contraseña",
  "auth.connexion.submit": "Iniciar sesión",
  "auth.connexion.pasCompte": "¿Aún no tienes cuenta?",
  "auth.inscription.titre": "Registro",
  "auth.inscription.description": "Crea una cuenta de candidato o solicita acceso de empresa.",
  "inscription.choix.titre": "Eres…",
  "inscription.choix.candidat": "Candidato",
  "inscription.choix.entreprise": "Empresa",
  "inscription.etape": "Paso",
  "inscription.candidat.ok": "Cuenta creada. Ya puedes ver ofertas y postular.",
  "inscription.entreprise.ok":
    "Solicitud enviada. El acceso de reclutador se abrirá tras la validación.",
  "compte.titre": "Mi cuenta",
  "compte.onglet.tableau": "Panel",
  "compte.onglet.candidatures": "Mis candidaturas",
  "compte.onglet.profil": "Mi perfil",
  "compte.profil.titre": "Mi perfil",
  "compte.profil.aide":
    "Aquí: tus datos personales. El país del menú solo sirve para explorar otro mercado.",
  "compte.profil.pays": "País (cuenta)",
  "entreprise.offres.titre": "Ofertas publicadas",
  "entreprise.offres.publier": "Publicar una oferta",
  "entreprise.offres.modifier": "Editar",
  "entreprise.offres.candidatures": "Ver candidaturas",
  "entreprise.publier.titre": "Publicar una oferta",
  "entreprise.publier.editer": "Editar la oferta",
  "entreprise.publier.montant": "Importe",
  "entreprise.publier.periode": "Periodo",
  "entreprise.publier.heures": "Tiempo de trabajo (h / semana)",
  "entreprise.publier.estimation": "Estimación automática",
  "entreprise.publier.lieu": "Lugar",
  "entreprise.publier.contrat": "Contrato",
  "entreprise.publier.temps": "Tiempo de trabajo",
  "cv.apercu": "Vista previa del CV",
  "cv.retourEntreprise": "← Espacio reclutador",
};

const EN: Record<CleI18n, string> = {
  "nav.offres": "Jobs",
  "nav.apropos": "About",
  "nav.compte": "My account",
  "nav.entreprise": "Employer space",
  "nav.admin": "Admin",
  "nav.connexion": "Log in",
  "nav.inscription": "Sign up",
  "nav.deconnexion": "Log out",
  "nav.pays": "Country",
  "apropos.mentions": "Legal notice",
  "apropos.cgu": "Terms of use",
  "apropos.confidentialite": "Privacy",
  "apropos.cookies": "Cookies",
  "offre.profil": "Profile sought",
  "offre.description": "Job description",
  "offre.remuneration": "Compensation",
  "offre.contrat": "Contract",
  "offre.tempsTravail": "Working time",
  "offre.enSavoirPlus": "Learn more",
  "offre.postuler": "Apply",
  "offre.dejaPostule": "Already applied",
  "offre.estimation": "Estimate (hour / month / year)",
  "offre.retourListe": "← Jobs",
  "common.rechercher": "Search…",
  "common.obligatoire": "required",
  "common.facultatif": "optional",
  "common.continuer": "Continue",
  "common.retour": "Back",
  "common.enregistrer": "Save",
  "common.annuler": "Cancel",
  "common.chargement": "Loading…",
  "common.publier": "Publish",
  "filtres.quoi": "What",
  "filtres.ou": "Where",
  "filtres.placeholderMot": "Role, company, keyword",
  "filtres.placeholderLieu": "City, remote…",
  "filtres.rechercher": "Search",
  "filtres.tous": "All",
  "filtres.rayon": "Radius",
  "filtres.rayonExact": "Exact city",
  "filtres.km": "km",
  "accueil.eyebrow": "Jobs and internships",
  "accueil.titre": "Find the role that fits you",
  "accueil.sousTitre":
    "Permanent, internships, apprenticeships, fixed-term — one place to search and apply.",
  "accueil.marche": "Market",
  "accueil.chargement": "Loading jobs…",
  "accueil.offresTrouvees": "job(s) found",
  "accueil.aucuneFiltre": "No jobs match your search.",
  "accueil.aucuneMarche":
    "No jobs on this market. Change country in the header or My account.",
  "accueil.erreurChargement": "Unable to load jobs. Please try again in a moment.",
  "auth.tagline": "The simple job board for candidates and employers.",
  "auth.connexion.titre": "Log in",
  "auth.connexion.description": "Access your candidate or employer space.",
  "auth.connexion.email": "Email",
  "auth.connexion.mdp": "Password",
  "auth.connexion.submit": "Log in",
  "auth.connexion.pasCompte": "No account yet?",
  "auth.inscription.titre": "Sign up",
  "auth.inscription.description": "Create a candidate account or request employer access.",
  "inscription.choix.titre": "You are…",
  "inscription.choix.candidat": "Candidate",
  "inscription.choix.entreprise": "Company",
  "inscription.etape": "Step",
  "inscription.candidat.ok": "Account created. You can browse jobs and apply.",
  "inscription.entreprise.ok":
    "Request sent. Employer access opens after validation.",
  "compte.titre": "My account",
  "compte.onglet.tableau": "Dashboard",
  "compte.onglet.candidatures": "My applications",
  "compte.onglet.profil": "My profile",
  "compte.profil.titre": "My profile",
  "compte.profil.aide":
    "Here: your personal details. The country in the header only explores another market.",
  "compte.profil.pays": "Country (account)",
  "entreprise.offres.titre": "Live jobs",
  "entreprise.offres.publier": "Post a job",
  "entreprise.offres.modifier": "Edit",
  "entreprise.offres.candidatures": "View applications",
  "entreprise.publier.titre": "Post a job",
  "entreprise.publier.editer": "Edit job",
  "entreprise.publier.montant": "Amount",
  "entreprise.publier.periode": "Period",
  "entreprise.publier.heures": "Working time (h / week)",
  "entreprise.publier.estimation": "Automatic estimate",
  "entreprise.publier.lieu": "Location",
  "entreprise.publier.contrat": "Contract",
  "entreprise.publier.temps": "Working time",
  "cv.apercu": "CV preview",
  "cv.retourEntreprise": "← Employer space",
};

const DE: Record<CleI18n, string> = {
  "nav.offres": "Stellen",
  "nav.apropos": "Über uns",
  "nav.compte": "Mein Konto",
  "nav.entreprise": "Arbeitgeberbereich",
  "nav.admin": "Administration",
  "nav.connexion": "Anmelden",
  "nav.inscription": "Registrieren",
  "nav.deconnexion": "Abmelden",
  "nav.pays": "Land",
  "apropos.mentions": "Impressum",
  "apropos.cgu": "Nutzungsbedingungen",
  "apropos.confidentialite": "Datenschutz",
  "apropos.cookies": "Cookies",
  "offre.profil": "Gesuchtes Profil",
  "offre.description": "Stellenbeschreibung",
  "offre.remuneration": "Vergütung",
  "offre.contrat": "Vertrag",
  "offre.tempsTravail": "Arbeitszeit",
  "offre.enSavoirPlus": "Mehr erfahren",
  "offre.postuler": "Bewerben",
  "offre.dejaPostule": "Bereits beworben",
  "offre.estimation": "Schätzung (Stunde / Monat / Jahr)",
  "offre.retourListe": "← Stellen",
  "common.rechercher": "Suchen…",
  "common.obligatoire": "pflicht",
  "common.facultatif": "optional",
  "common.continuer": "Weiter",
  "common.retour": "Zurück",
  "common.enregistrer": "Speichern",
  "common.annuler": "Abbrechen",
  "common.chargement": "Laden…",
  "common.publier": "Veröffentlichen",
  "filtres.quoi": "Was",
  "filtres.ou": "Wo",
  "filtres.placeholderMot": "Beruf, Unternehmen, Stichwort",
  "filtres.placeholderLieu": "Stadt, Remote…",
  "filtres.rechercher": "Suchen",
  "filtres.tous": "Alle",
  "filtres.rayon": "Umkreis",
  "filtres.rayonExact": "Genaue Stadt",
  "filtres.km": "km",
  "accueil.eyebrow": "Stellen und Praktika",
  "accueil.titre": "Finden Sie die passende Stelle",
  "accueil.sousTitre":
    "Unbefristet, Praktika, Ausbildung, befristet — alles an einem Ort suchen und bewerben.",
  "accueil.marche": "Markt",
  "accueil.chargement": "Stellen werden geladen…",
  "accueil.offresTrouvees": "Stelle(n) gefunden",
  "accueil.aucuneFiltre": "Keine Stelle entspricht Ihrer Suche.",
  "accueil.aucuneMarche":
    "Keine Stellen auf diesem Markt. Wechseln Sie das Land in der Kopfzeile oder unter Mein Konto.",
  "accueil.erreurChargement":
    "Stellen können nicht geladen werden. Bitte versuchen Sie es gleich erneut.",
  "auth.tagline": "Das einfache Jobboard für Kandidaten und Arbeitgeber.",
  "auth.connexion.titre": "Anmeldung",
  "auth.connexion.description": "Zugang zu Ihrem Kandidaten- oder Arbeitgeberbereich.",
  "auth.connexion.email": "E-Mail",
  "auth.connexion.mdp": "Passwort",
  "auth.connexion.submit": "Anmelden",
  "auth.connexion.pasCompte": "Noch kein Konto?",
  "auth.inscription.titre": "Registrierung",
  "auth.inscription.description":
    "Kandidatenkonto erstellen oder Arbeitgeberzugang beantragen.",
  "inscription.choix.titre": "Sie sind…",
  "inscription.choix.candidat": "Kandidat",
  "inscription.choix.entreprise": "Unternehmen",
  "inscription.etape": "Schritt",
  "inscription.candidat.ok":
    "Konto erstellt. Sie können Stellen einsehen und sich bewerben.",
  "inscription.entreprise.ok":
    "Antrag gesendet. Der Arbeitgeberzugang öffnet sich nach Freigabe.",
  "compte.titre": "Mein Konto",
  "compte.onglet.tableau": "Übersicht",
  "compte.onglet.candidatures": "Meine Bewerbungen",
  "compte.onglet.profil": "Mein Profil",
  "compte.profil.titre": "Mein Profil",
  "compte.profil.aide":
    "Hier: Ihre persönlichen Daten. Das Land oben dient nur dem Wechsel des Marktes.",
  "compte.profil.pays": "Land (Konto)",
  "entreprise.offres.titre": "Veröffentlichte Stellen",
  "entreprise.offres.publier": "Stelle veröffentlichen",
  "entreprise.offres.modifier": "Bearbeiten",
  "entreprise.offres.candidatures": "Bewerbungen ansehen",
  "entreprise.publier.titre": "Stelle veröffentlichen",
  "entreprise.publier.editer": "Stelle bearbeiten",
  "entreprise.publier.montant": "Betrag",
  "entreprise.publier.periode": "Zeitraum",
  "entreprise.publier.heures": "Arbeitszeit (Std. / Woche)",
  "entreprise.publier.estimation": "Automatische Schätzung",
  "entreprise.publier.lieu": "Ort",
  "entreprise.publier.contrat": "Vertrag",
  "entreprise.publier.temps": "Arbeitszeit",
  "cv.apercu": "CV-Vorschau",
  "cv.retourEntreprise": "← Arbeitgeberbereich",
};

const PT: Record<CleI18n, string> = {
  "nav.offres": "Ofertas",
  "nav.apropos": "Sobre",
  "nav.compte": "A minha conta",
  "nav.entreprise": "Espaço recrutador",
  "nav.admin": "Administração",
  "nav.connexion": "Iniciar sessão",
  "nav.inscription": "Registar-se",
  "nav.deconnexion": "Terminar sessão",
  "nav.pays": "País",
  "apropos.mentions": "Aviso legal",
  "apropos.cgu": "Termos de utilização",
  "apropos.confidentialite": "Privacidade",
  "apropos.cookies": "Cookies",
  "offre.profil": "Perfil pretendido",
  "offre.description": "Descrição da função",
  "offre.remuneration": "Remuneração",
  "offre.contrat": "Contrato",
  "offre.tempsTravail": "Horário",
  "offre.enSavoirPlus": "Saber mais",
  "offre.postuler": "Candidatar-se",
  "offre.dejaPostule": "Já se candidatou",
  "offre.estimation": "Estimativa (hora / mês / ano)",
  "offre.retourListe": "← Ofertas",
  "common.rechercher": "Pesquisar…",
  "common.obligatoire": "obrigatório",
  "common.facultatif": "opcional",
  "common.continuer": "Continuar",
  "common.retour": "Voltar",
  "common.enregistrer": "Guardar",
  "common.annuler": "Cancelar",
  "common.chargement": "A carregar…",
  "common.publier": "Publicar",
  "filtres.quoi": "O quê",
  "filtres.ou": "Onde",
  "filtres.placeholderMot": "Função, empresa, palavra-chave",
  "filtres.placeholderLieu": "Cidade, teletrabalho…",
  "filtres.rechercher": "Pesquisar",
  "filtres.tous": "Todos",
  "filtres.rayon": "Raio",
  "filtres.rayonExact": "Cidade exacta",
  "filtres.km": "km",
  "accueil.eyebrow": "Ofertas de emprego e estágio",
  "accueil.titre": "Encontre o emprego certo para si",
  "accueil.sousTitre":
    "Contrato sem termo, estágios, aprendizagem, prazo certo — um só sítio para procurar e candidatar-se.",
  "accueil.marche": "Mercado",
  "accueil.chargement": "A carregar ofertas…",
  "accueil.offresTrouvees": "oferta(s) encontrada(s)",
  "accueil.aucuneFiltre": "Nenhuma oferta corresponde à sua pesquisa.",
  "accueil.aucuneMarche":
    "Não há ofertas neste mercado. Mude de país no menu ou em A minha conta.",
  "accueil.erreurChargement":
    "Não foi possível carregar as ofertas. Tente novamente dentro de momentos.",
  "auth.tagline": "O job board simples para candidatos e recrutadores.",
  "auth.connexion.titre": "Início de sessão",
  "auth.connexion.description": "Aceda ao seu espaço de candidato ou recrutador.",
  "auth.connexion.email": "E-mail",
  "auth.connexion.mdp": "Palavra-passe",
  "auth.connexion.submit": "Iniciar sessão",
  "auth.connexion.pasCompte": "Ainda não tem conta?",
  "auth.inscription.titre": "Registo",
  "auth.inscription.description":
    "Crie uma conta de candidato ou peça acesso de empresa.",
  "inscription.choix.titre": "É…",
  "inscription.choix.candidat": "Candidato",
  "inscription.choix.entreprise": "Empresa",
  "inscription.etape": "Passo",
  "inscription.candidat.ok":
    "Conta criada. Já pode ver ofertas e candidatar-se.",
  "inscription.entreprise.ok":
    "Pedido enviado. O acesso de recrutador abre após validação.",
  "compte.titre": "A minha conta",
  "compte.onglet.tableau": "Painel",
  "compte.onglet.candidatures": "As minhas candidaturas",
  "compte.onglet.profil": "O meu perfil",
  "compte.profil.titre": "O meu perfil",
  "compte.profil.aide":
    "Aqui: os seus dados pessoais. O país do menu serve só para explorar outro mercado.",
  "compte.profil.pays": "País (conta)",
  "entreprise.offres.titre": "Ofertas publicadas",
  "entreprise.offres.publier": "Publicar uma oferta",
  "entreprise.offres.modifier": "Editar",
  "entreprise.offres.candidatures": "Ver candidaturas",
  "entreprise.publier.titre": "Publicar uma oferta",
  "entreprise.publier.editer": "Editar a oferta",
  "entreprise.publier.montant": "Montante",
  "entreprise.publier.periode": "Período",
  "entreprise.publier.heures": "Tempo de trabalho (h / semana)",
  "entreprise.publier.estimation": "Estimativa automática",
  "entreprise.publier.lieu": "Local",
  "entreprise.publier.contrat": "Contrato",
  "entreprise.publier.temps": "Tempo de trabalho",
  "cv.apercu": "Pré-visualização do CV",
  "cv.retourEntreprise": "← Espaço recrutador",
};

const IT: Record<CleI18n, string> = {
  "nav.offres": "Offerte",
  "nav.apropos": "Chi siamo",
  "nav.compte": "Il mio account",
  "nav.entreprise": "Area recruiter",
  "nav.admin": "Amministrazione",
  "nav.connexion": "Accedi",
  "nav.inscription": "Registrati",
  "nav.deconnexion": "Esci",
  "nav.pays": "Paese",
  "apropos.mentions": "Note legali",
  "apropos.cgu": "Termini di utilizzo",
  "apropos.confidentialite": "Privacy",
  "apropos.cookies": "Cookie",
  "offre.profil": "Profilo ricercato",
  "offre.description": "Descrizione della posizione",
  "offre.remuneration": "Retribuzione",
  "offre.contrat": "Contratto",
  "offre.tempsTravail": "Orario di lavoro",
  "offre.enSavoirPlus": "Scopri di più",
  "offre.postuler": "Candidati",
  "offre.dejaPostule": "Già candidati",
  "offre.estimation": "Stima (ora / mese / anno)",
  "offre.retourListe": "← Offerte",
  "common.rechercher": "Cerca…",
  "common.obligatoire": "obbligatorio",
  "common.facultatif": "facoltativo",
  "common.continuer": "Continua",
  "common.retour": "Indietro",
  "common.enregistrer": "Salva",
  "common.annuler": "Annulla",
  "common.chargement": "Caricamento…",
  "common.publier": "Pubblica",
  "filtres.quoi": "Cosa",
  "filtres.ou": "Dove",
  "filtres.placeholderMot": "Ruolo, azienda, parola chiave",
  "filtres.placeholderLieu": "Città, remote…",
  "filtres.rechercher": "Cerca",
  "filtres.tous": "Tutti",
  "filtres.rayon": "Raggio",
  "filtres.rayonExact": "Città esatta",
  "filtres.km": "km",
  "accueil.eyebrow": "Offerte di lavoro e stage",
  "accueil.titre": "Trova il ruolo giusto per te",
  "accueil.sousTitre":
    "Tempo indeterminato, stage, apprendistato, determinato — un solo posto per cercare e candidarti.",
  "accueil.marche": "Mercato",
  "accueil.chargement": "Caricamento offerte…",
  "accueil.offresTrouvees": "offerta/e trovata/e",
  "accueil.aucuneFiltre": "Nessuna offerta corrisponde alla tua ricerca.",
  "accueil.aucuneMarche":
    "Nessuna offerta su questo mercato. Cambia paese nel menu o in Il mio account.",
  "accueil.erreurChargement":
    "Impossibile caricare le offerte. Riprova tra un istante.",
  "auth.tagline": "Il job board semplice per candidati e recruiter.",
  "auth.connexion.titre": "Accesso",
  "auth.connexion.description": "Accedi al tuo spazio candidato o recruiter.",
  "auth.connexion.email": "E-mail",
  "auth.connexion.mdp": "Password",
  "auth.connexion.submit": "Accedi",
  "auth.connexion.pasCompte": "Non hai ancora un account?",
  "auth.inscription.titre": "Registrazione",
  "auth.inscription.description":
    "Crea un account candidato o richiedi l’accesso azienda.",
  "inscription.choix.titre": "Sei…",
  "inscription.choix.candidat": "Candidato",
  "inscription.choix.entreprise": "Azienda",
  "inscription.etape": "Passo",
  "inscription.candidat.ok":
    "Account creato. Puoi consultare le offerte e candidarti.",
  "inscription.entreprise.ok":
    "Richiesta inviata. L’accesso recruiter si apre dopo la validazione.",
  "compte.titre": "Il mio account",
  "compte.onglet.tableau": "Dashboard",
  "compte.onglet.candidatures": "Le mie candidature",
  "compte.onglet.profil": "Il mio profilo",
  "compte.profil.titre": "Il mio profilo",
  "compte.profil.aide":
    "Qui: i tuoi dati personali. Il paese in alto serve solo a esplorare un altro mercato.",
  "compte.profil.pays": "Paese (account)",
  "entreprise.offres.titre": "Offerte pubblicate",
  "entreprise.offres.publier": "Pubblica un’offerta",
  "entreprise.offres.modifier": "Modifica",
  "entreprise.offres.candidatures": "Vedi candidature",
  "entreprise.publier.titre": "Pubblica un’offerta",
  "entreprise.publier.editer": "Modifica l’offerta",
  "entreprise.publier.montant": "Importo",
  "entreprise.publier.periode": "Periodo",
  "entreprise.publier.heures": "Orario di lavoro (ore / settimana)",
  "entreprise.publier.estimation": "Stima automatica",
  "entreprise.publier.lieu": "Luogo",
  "entreprise.publier.contrat": "Contratto",
  "entreprise.publier.temps": "Orario di lavoro",
  "cv.apercu": "Anteprima CV",
  "cv.retourEntreprise": "← Area recruiter",
};

export const DICTIONNAIRES: Record<CodeLangue, Record<CleI18n, string>> = {
  fr: FR,
  es: ES,
  en: EN,
  de: DE,
  pt: PT,
  it: IT,
};
