# Choix techniques

Ici on explique **pourquoi** on a pris cette stack pour le Job Board.  
Pas juste “on a mis Next et MySQL”, mais en quoi c’est mieux pour ce projet, et pourquoi un dev aurait intérêt à partir là-dessus.

Le code actuel c’est : **Next.js (App Router) + React + TypeScript + MySQL + Tailwind**, avec l’API dans `app/api/`.

---

## Next.js (plutôt qu’un front séparé + un Express à côté)

### Pourquoi Next.js

Le projet demande un **front** (board, comptes, admin) et un **back** (API CRUD, auth, candidatures).  
Avec Next.js, les deux vivent dans **le même repo / le même serveur de dev**.

Concrètement :

- les pages sont dans `app/...` ;
- l’API est dans `app/api/.../route.ts` ;
- tu lances `npm run dev` et tu as le site + l’API sur le même port.

Pour un projet école où faut avancer vite, c’est clairement plus simple que de gérer deux serveurs (genre React sur 3000 et Express sur 4000), deux `package.json`, les CORS, etc.

### En quoi c’est mieux / pourquoi un dev devrait s’y intéresser

1. **Un seul projet à comprendre**  
   Tu ouvres le dossier, tu vois les pages et les routes API au même endroit. Pour reprendre le code, c’est plus lisible.

2. **App Router**  
   Une URL = un dossier. Tu veux `/compte` → `app/compte/page.tsx`. C’est carré, surtout pour des débutant.

3. **React dedans**  
   On reste sur des composants, de l’état, des formulaires modernes, sans réapprendre un autre framework UI.

4. **TypeScript**  
   Les types (`types/`, retours d’API) aident à pas se tromper entre “offre”, “candidature”, “entreprise”. Moins de bugs bêtes.

5. **Prêt pour la prod**  
   `build` / `start`, middleware (HTTPS), pages légales, sitemap… Next est pensé pour un vrai site, pas juste un proto.

### Pourquoi pas “juste Express” pour tout

Express c’est très bien pour une API. Mais le cahier des charges veut aussi un vrai front soigné.  
Si tu fais Express + un front à part, tu doubles l’infra locale.  
Là, Next nous donne l’API **et** le rendu React. Pour ce Job Board, ça colle mieux.

*(Y’a eu une époque où un back Express existait dans l’historique du projet, mais **aujourd’hui ce n’est plus le cas** : tout passe par Next.)*

---

## MySQL

### Pourquoi MySQL

Le sujet impose une **base SQL** avec entreprises, gens, annonces, candidatures.  
MySQL (souvent via WAMP en local) c’est :

- classique en école / en entreprise ;
- simple à installer ;
- bien adapté à des données relationnelles (une candidature **liéé** à une offre et à une personne).

### En quoi ça colle au projet

- Tables claires : `companies`, `people`, `advertisement`, `applications`, etc.
- Clés étrangères → tu peux pas (facilement) avoir une candidature orpheline n’importe comment.
- Statuts en `ENUM` (entreprise en attente / validée / refusée, pipeline de candidature…) → le métier est lisible en SQL.
- Seed (`seed.sql`) pour tester tout de suite avec des comptes.

### Pourquoi pas du NoSQL genre Mongo

On aurait pu. Mais ici les liens sont partout (offre ↔ entreprise ↔ candidatures ↔ commentaires).  
Le relationnel est plus naturel. Et le CDC parle clairement SQL.

---

## Auth : bcrypt + JWT

### Mot de passe

On stocke un **hash bcrypt**, jamais le mot de passe en clair.  
Même si quelqu’un lit la table `people`, il a pas directement le mdp.

### JWT

Après login, le serveur signe un token (`JWT_SECRET`) avec l’id, l’email, le rôle, éventuellement l’entreprise.  
Le front l’envoie en `Authorization: Bearer ...` sur les routes protégées.

Pourquoi c’est pratique :

- pas besoin de session serveur lourde pour un projet de cette taille ;
- chaque route peut vérifier le rôle (candidat / entreprise / admin) ;
- expiration configurable (`JWT_EXPIRES_IN`).

Limite qu’on assume : le token est en `localStorage` (simple pour le front). En durcissement, on pourrait passer sur un cookie HttpOnly.

---

## Organisation du code (choix de structure)

On a séparé exprès :

| Zone | Pourquoi |
| --- | --- |
| `app/` | Le routing Next (pages + API) |
| `ecrans/` | Les grosses pages UI, pour pas tout coller dans `page.tsx` |
| `composants/` | Les petits blocs réutilisables |
| `lib/` | La logique (DB, auth, pays, api client…) |
| `sql/` | La vérité de la base, versionnable |

Comme ça un nouveau dev sait où chercher :  
UI → `ecrans` / `composants`, HTTP → `app/api`, règles métier → `lib`, schéma → `sql`.

---

## Tailwind CSS

Pour le style, Tailwind évite de maintenir des gros fichiers CSS “à la main” pour chaque page.  
On compose les classes dans les composants, ça va vite pour itérer sur l’UI (header, cartes d’offres, admin…).  
Le design reste cohérent avec des variables (`globals.css` : couleurs marque, fond, etc.).

---

## i18n + pays

Plutôt que de hardcoder tout en français, on a un système de locale lié au **pays** choisi.  
Ça sert le produit (marché local) et ça montre qu’on a pensé multi-contexte (langue, format téléphone, identifiant entreprise type SIRET, etc.).

---

## Résumé “défense en 30 secondes”

- **Next.js** : front + API au même endroit, plus simple à développer et à reprendre, React + routing clair.
- **MySQL** : modèle relationnel collé au sujet (offres, entreprises, gens, candidatures).
- **bcrypt + JWT** : mots de passe hashés, API sécurisée par rôle.
- **Structure dossiers** : pages / écrans / composants / lib / sql séparés pour que ce soit maintenable.

Si un autre dev reprend le projet demain, il a une stack connue, un seul serveur de dev, et une base SQL classique : il peut démarrer sans se battre avec l’architecture.
