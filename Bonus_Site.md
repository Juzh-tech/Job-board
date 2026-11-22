# Bonus_Site — fonctionnalités hors sujet

Ici on liste **uniquement** ce qu’on a ajouté et que le cahier des charges **n’a jamais demandé**.  
Pas la sécu « de base », pas le design / UX (le sujet demande déjà un site soigné) : seulement des **fonctionnalités produit** en plus.

Le CDC impose surtout : board d’offres, learn more / postuler, auth, admin CRUD, API, BDD, README.

---

## Ce qu’on a ajouté (hors CDC)

| Fonctionnalité | En quoi le sujet ne le demandait pas |
| --- | --- |
| **Espace recruteur `/entreprise`** | Le sujet parle candidat + admin. On a un vrai parcours entreprise : publier, modifier, retirer des offres, gérer les candidatures reçues. |
| **Validation / refus d’entreprise** | Une boîte s’inscrit → l’admin doit **valider** avant qu’elle apparaisse sur le marché. Pas prévu dans le CDC. |
| **Réclamation après refus** | Si l’admin refuse la boîte, l’entreprise peut envoyer une réclamation. |
| **Pipeline de candidatures** | Statuts (envoyée, en cours, refusée…) + commentaires recruteur. Le sujet dit juste d’enregistrer la candidature. |
| **CV PDF + réutilisation** | Upload d’un CV une fois, réutilisé à chaque postulation. Le sujet demande nom / email / téléphone / message, pas un fichier CV. |
| **Logo d’entreprise** | L’entreprise peut uploader un logo affiché sur ses offres / sa fiche. |
| **Brouillon d’offre** | Sauvegarde d’une offre en cours avant publication. |
| **Multi-pays / multi-langues** | Sélecteur de pays = marché (offres filtrées) + interface en fr / es / en / de / pt / it. Le sujet est mono-contexte. |
| **Identifiants locaux (SIRET, NIF…)** | À l’inscription entreprise, contrôle selon le pays. Jamais demandé. |
| **Estimation rémunération** | Convertir / afficher l’équivalent **heure / mois / an** (candidat + formulaire recruteur). Le sujet demande juste d’afficher le salaire. |
| **Fiche entreprise publique** | Page `/entreprises/[id]` pour voir une boîte et ses offres. |
| **Pages légales + cookies** | Mentions, CGU, confidentialité, cookies + bandeau. Hors sujet. |
| **Doc Swagger** | Page `/swagger` + `/api/swagger` pour explorer l’API. Le sujet demande un README, pas une UI Swagger. |

---

## En une phrase (défense)

*« En plus du board / auth / admin du CDC, on a ajouté un vrai espace recruteur, la validation des entreprises, le multi-pays, le CV réutilisable, l’estimation de salaire, et quelques parcours annexes (logo, réclamation, Swagger…). »*
