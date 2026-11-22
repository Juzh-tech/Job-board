# Job Boarding

Plateforme web d’offres d’emploi et de stages (projet Epitech).  
Un candidat peut chercher une offre et postuler. Une entreprise peut publier des annonces et gérer les candidatures. Un admin supervise la base (validation d’entreprises, suppressions, etc.).

**Stack actuelle :** Next.js (App Router) + React + TypeScript + MySQL + Tailwind CSS.  
Le front et l’API sont dans **le même projet** Next.js (`app/api/...`). Il n’y a pas de serveur Express séparé.

Autres docs utiles :

| Fichier | Contenu |
| --- | --- |
| [`CHOIX_TECHNIQUES.md`](./CHOIX_TECHNIQUES.md) | Pourquoi Next.js, MySQL, JWT, etc. |
| [`USAGE_IA_DEVELOPPEMENT.md`](./USAGE_IA_DEVELOPPEMENT.md) | Comment l’IA a été utilisée pendant le développement |
| [`Bonus_Site.md`](./Bonus_Site.md) | Fonctionnalités ajoutées **hors** cahier des charges |
| [`DIFFICULTES.md`](./DIFFICULTES.md) | Galères rencontrées (accents `???`, couleurs, UI, Git…) |
| [`sql/README.md`](./sql/README.md) | Explique la base (tables, règles, migrations) |

---

## Ce que fait l’appli (en bref)

| Qui | Ce qu’il peut faire |
| --- | --- |
| **Visiteur / candidat** | Voir les offres du pays choisi, filtrer, ouvrir le détail, postuler (compte requis), suivre ses candidatures dans `/compte` |
| **Entreprise** | S’inscrire (attente de validation admin), publier / modifier / retirer des offres, gérer le pipeline des candidatures, logo + infos entreprise |
| **Admin** | Dashboard `/administration` : valider / refuser des entreprises, lister et supprimer offres, comptes, candidatures |

Le sélecteur de **pays** en haut change la langue de l’interface et filtre les offres selon le pays de l’entreprise qui publie.

---

## Prérequis

Avant de lancer quoi que ce soit, il te faut :

1. **Node.js 20+** (pour `npm`)
2. **MySQL 8** (par ex. via WAMP / XAMPP / MySQL local)
3. Un terminal dans le dossier `jobboard`

---

## Installation pas à pas

### 1. Cloner le dépôt (étape obligatoire)

Récupère le projet sur ta machine :

```bash
git clone https://github.com/Phefra/jobboard.git
cd jobboard
```

Sans cette étape, tu n’as pas le code localement.

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer l’environnement

Copie le fichier d’exemple :

```bash
cp .env.example .env.local
```

Sous Windows (PowerShell) :

```powershell
Copy-Item .env.example .env.local
```

Contenu typique de `.env.local` :

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=jobboard

JWT_SECRET=change-moi-en-production
JWT_EXPIRES_IN=24h

NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Sous WAMP, `DB_PASSWORD` est souvent **vide**.  
`JWT_SECRET` doit être une chaîne longue et secrète en vrai déploiement (ne jamais la committer).

### 4. Créer la base MySQL

Depuis le dossier `sql/`, avec le client MySQL (adapter le chemin si besoin) :

```bat
mysql --default-character-set=utf8mb4 -u root < schema.sql
mysql --default-character-set=utf8mb4 -u root jobboard < seed.sql
```

**Important :** utilise toujours `utf8mb4`, sinon les accents et le symbole € deviennent `???` en base.

- Base déjà existante sans colonnes pays → jouer aussi `migration_pays.sql`
- Base déjà existante sans logo → jouer aussi `migration_logo.sql`

Détails : [`sql/README.md`](./sql/README.md).

### 5. Lancer en développement

```bash
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000).

### Documentation API (Swagger)

Une fois le serveur lancé :

| URL | Rôle |
| --- | --- |
| [http://localhost:3000/swagger](http://localhost:3000/swagger) | Interface Swagger UI (doc interactive) |
| [http://localhost:3000/api/swagger](http://localhost:3000/api/swagger) | Spécification OpenAPI en JSON |

Tu peux y voir les routes, les méthodes HTTP, et tester certains appels (Authorize = JWT Bearer après login).

Autres commandes :

| Commande | Rôle |
| --- | --- |
| `npm run build` | Build de production |
| `npm run start` | Lance le build (après `build`) |
| `npm run lint` | Vérifie le code avec ESLint |

---

## Comptes de test (après le seed)

| E-mail | Mot de passe | Rôle |
| --- | --- | --- |
| `admin@jobboard.com` | `admin123` | admin |
| `ada.morel@mail.fr` | `user123` | candidat |
| `claire@ateliernord.fr` | `user123` | entreprise (déjà validée) |
| `contact@novasoft-recrute.example` | `user123` | entreprise (en attente) |

---

## Pages du site

| URL | À quoi ça sert |
| --- | --- |
| `/` | Accueil : liste d’offres + panneau détail / candidature |
| `/offres` | Variante liste / détail (même logique métier) |
| `/connexion` | Connexion |
| `/inscription` | Inscription candidat ou entreprise |
| `/compte` | Espace candidat (profil, candidatures, CV) |
| `/entreprise` | Espace recruteur |
| `/entreprises/[id]` | Fiche publique d’une entreprise |
| `/administration` | Back-office admin |
| `/swagger` | Documentation interactive de l’API (Swagger UI) |
| `/mentions-legales`, `/cgu`, `/confidentialite`, `/cookies` | Pages légales |

---

## API (backend dans Next)

Toutes les routes sont des fichiers `route.ts` sous `app/api/`.  
Le front les appelle surtout via `lib/api.ts`.

Auth protégée : header  
`Authorization: Bearer <token>`  
(le token JWT est stocké côté navigateur après login).

### Docs API

| Méthode | Route | Qui |
| --- | --- | --- |
| `GET` | `/api/swagger` | public (OpenAPI JSON) |

### Auth & profil

| Méthode | Route | Qui |
| --- | --- | --- |
| `POST` | `/api/auth/login` | public |
| `POST` | `/api/auth/register` | public |
| `PATCH` | `/api/profil` | connecté |

### Offres & entreprises (public)

| Méthode | Route | Qui |
| --- | --- | --- |
| `GET` | `/api/offres` | public (filtres possibles) |
| `GET` | `/api/offres/[id]` | public |
| `GET` | `/api/entreprises/[id]` | public |

### Candidat

| Méthode | Route | Qui |
| --- | --- | --- |
| `GET` / `POST` | `/api/candidatures` | candidat |
| `POST` | `/api/cv/upload` | candidat |
| `GET` | `/api/cv/[fichier]` | candidat / entreprise concernée / admin |

### Entreprise

| Méthode | Route | Qui |
| --- | --- | --- |
| `GET` / `PATCH` | `/api/entreprise/me` | entreprise |
| `GET` / `POST` | `/api/entreprise/offres` | entreprise |
| `PATCH` | `/api/entreprise/offres/[id]` | entreprise |
| `GET` | `/api/entreprise/candidatures` | entreprise |
| `PATCH` | `/api/candidatures/[id]` | entreprise |
| `POST` | `/api/candidatures/[id]/commentaires` | entreprise |
| `POST` | `/api/entreprise/reclamation` | entreprise |
| `POST` | `/api/entreprise/logo/upload` | entreprise |
| `GET` | `/api/entreprise/logo/[fichier]` | public / lié au logo |

### Admin

| Méthode | Route | Qui |
| --- | --- | --- |
| `GET` | `/api/admin/entreprises`, `/offres`, `/comptes`, `/candidatures` | admin |
| `PATCH` / `DELETE` | `/api/admin/entreprises/[id]` | admin |
| `DELETE` | `/api/admin/offres/[id]`, `/comptes/[id]`, `/candidatures/[id]` | admin |

---

## Structure du projet (le plus important)

Si tu repris ce repo en étant novice, retiens **deux règles** :

1. **Une URL = un fichier** dans `app/.../page.tsx` (souvent juste un rendu d’écran).
2. **Ce que l’utilisateur voit** est dans `ecrans/`. Les **briques réutilisables** sont dans `composants/`. L’**API HTTP** est dans `app/api/`.

```
jobboard/
├── app/                  # Routes Next.js (pages + API)
│   ├── layout.tsx        # Coquille globale (header, footer, cookies…)
│   ├── page.tsx          # Page d’accueil → /
│   ├── globals.css       # Styles globaux + variables CSS
│   ├── api/              # Backend HTTP (chaque dossier = une route)
│   ├── compte/           # /compte
│   ├── entreprise/       # /entreprise
│   ├── administration/   # /administration
│   └── …                 # connexion, inscription, pages légales…
├── ecrans/               # Écrans complets (grosse UI d’une page)
│   ├── accueil/
│   ├── compte/
│   ├── entreprise/
│   ├── administration/
│   └── …
├── composants/           # Petits blocs UI réutilisables
│   ├── mise-en-page/     # EnTete, PiedDePage, SelecteurPays…
│   ├── offres/           # CarteOffre, DetailOffre, filtres…
│   └── ui/               # Champs, boutons génériques…
├── lib/                  # Logique partagée (pas de JSX en général)
│   ├── api.ts            # Appels fetch du front vers /api/...
│   ├── auth-serveur.ts   # bcrypt + JWT (SERVEUR UNIQUEMENT)
│   ├── db.ts             # Connexion MySQL
│   ├── session.ts        # Lecture / écriture du token côté navigateur
│   ├── pays.ts           # Pays, devise, validation ID entreprise…
│   ├── i18n/             # Traductions FR / ES / EN…
│   └── …
├── types/                # Types TypeScript (Offre, Entreprise…)
├── sql/                  # Schéma + seed + migrations MySQL
├── public/               # Fichiers statiques publics
├── middleware.ts         # Ex. HTTPS en prod
├── .env.example          # Modèle des variables d’environnement
└── package.json          # Dépendances + scripts npm
```

### À quoi sert chaque grand dossier ?

| Dossier / fichier | Rôle pour un nouveau dev |
| --- | --- |
| `app/` | Le routeur. Tu ajoutes une page en créant un dossier + `page.tsx`. Tu ajoutes une API en créant `app/api/.../route.ts`. |
| `app/api/` | Le backend. Chaque `route.ts` gère `GET` / `POST` / `PATCH` / `DELETE`. |
| `ecrans/` | La vraie UI d’une page (souvent longue). Si tu changes le parcours candidat, commence ici. |
| `composants/` | Morceaux réutilisés (carte d’offre, header…). Évite de dupliquer le même bouton partout. |
| `lib/` | Code métier / technique partagé : BDD, auth, formatage, pays, rémunération, etc. |
| `lib/api.ts` | **Point d’entrée front → API.** Si le front appelle mal une route, regarde ici. |
| `lib/auth-serveur.ts` | Hash des mots de passe + création / lecture JWT. **Ne jamais l’importer dans un composant client.** |
| `lib/db.ts` | Pool MySQL. Les routes API passent par là pour lire/écrire. |
| `types/` | Contrats TypeScript partagés entre front et mappers. |
| `sql/` | Source de vérité de la base. Toujours partir de `schema.sql` sur une install neuve. |
| `public/` | Images / assets servis tels quels. |
| `uploads/` (local) | CV / logos uploadés (souvent ignoré par git). Créé au runtime si besoin. |

### Imports

Dans le code, `@/` pointe vers la racine `jobboard/` :

```ts
import { apiListerOffres } from "@/lib/api";
```

---

## Base de données (résumé)

Tables principales :

| Table | Contenu |
| --- | --- |
| `companies` | Entreprises + statut de vérification (`en_attente` / `validee` / `refusee`) + pays + logo |
| `people` | Comptes (candidat / entreprise / admin), mot de passe **hashé bcrypt** |
| `advertisement` | Offres (statut draft / published / closed / archived) |
| `applications` | Candidatures + statut pipeline |
| `application_comments` | Notes internes recruteur |
| `audit_log` | Journal d’actions sensibles |

Seules les offres **published** d’entreprises **validee** apparaissent sur le board public (voir aussi la vue `v_annonces_publiees` dans `schema.sql`).

---

## Auth : comment ça marche (pour la reprise)

1. Login / register → l’API vérifie le mot de passe (bcrypt) et renvoie un **JWT**.
2. Le front stocke le token (`lib/session.ts`, `localStorage`).
3. Les appels protégés envoient `Authorization: Bearer …`.
4. Chaque route API lit le token (`utilisateurDepuisRequete`) et vérifie le **rôle**.

À retenir pour la défense / la sécu :

- Le mot de passe n’est **jamais** stocké en clair.
- `JWT_SECRET` reste côté serveur (`.env.local`).
- Limite connue : token en `localStorage` (sensible au XSS). Un cookie HttpOnly serait un durcissement possible plus tard.

---

## Où modifier quoi ? (aide rapide)

| Tu veux… | Regarde plutôt… |
| --- | --- |
| Changer l’UI de la liste d’offres | `ecrans/accueil/` + `composants/offres/` |
| Ajouter un champ à une offre | `sql/schema.sql` + route `app/api/entreprise/offres` + types + formulaire dans `ecrans/entreprise/` |
| Changer une traduction | `lib/i18n/dictionnaires.ts` |
| Ajouter un pays / règle SIRET | `lib/pays.ts` |
| Corriger un appel API front | `lib/api.ts` |
| Comprendre le login | `app/api/auth/login/route.ts` + `lib/auth-serveur.ts` |
| Toucher l’admin | `ecrans/administration/` + `app/api/admin/` |

---

## Limites / points d’attention

- Les uploads (CV, logos) vivent sur le disque local du serveur de dev ; en prod il faudrait un stockage dédié.
- Le README et le code évoluent : si une route manque dans le tableau ci-dessus, le dossier `app/api/` fait foi.
- Ne committe jamais `.env.local` ni de vrais secrets.

---

## Pour aller plus loin

- Choix techniques (pourquoi cette stack) → [`CHOIX_TECHNIQUES.md`](./CHOIX_TECHNIQUES.md)
- Usage de l’IA pendant le projet → [`USAGE_IA_DEVELOPPEMENT.md`](./USAGE_IA_DEVELOPPEMENT.md)
- SQL détaillé → [`sql/README.md`](./sql/README.md)
