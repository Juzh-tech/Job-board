# La base de données Job Board

Ce dossier explique **comment la BDD est pensée**, pas juste comment l’installer.  
L’idée : si tu ouvres uniquement `sql/`, tu dois comprendre le modèle métier.

---

## Fichiers

| Fichier | Rôle |
| --- | --- |
| `schema.sql` | **Toute** la structure (tables, index, vue). À lancer pour créer une base à l’identique. |
| `seed.sql` | Données de démo : entreprises multi-secteurs, ≥20 offres / marché (FR·ES·GB), comptes, candidatures. |
| `seed_autres_pays.sql` | Complément : ≥20 offres pour BE·CH·DE·PT·IT·US·CA (à jouer **après** `seed.sql`). |
| `migration_pays.sql` | **Exemple** de migration : ajouter le pays sans DROP de base. |
| `migration_logo.sql` | **Exemple** de migration : ajouter le logo entreprise. |
| `README.md` | Ce document : comprendre la base. |

### Install neuve (quelqu’un sans ta base)

```bat
mysql --default-character-set=utf8mb4 -u root < schema.sql
mysql --default-character-set=utf8mb4 -u root jobboard < seed.sql
mysql --default-character-set=utf8mb4 -u root jobboard < seed_autres_pays.sql
```

`utf8mb4` sinon accents / € → `???` **en base**. Sous PowerShell, préférer `cmd /c "mysql … < fichier.sql"` pour ne pas casser l’encodage.

### Base déjà là, juste une évolution

Tu ne relances **pas** `schema.sql` (il DROP tout).  
Tu joues la migration qui correspond (`migration_pays.sql`, `migration_logo.sql`, ou tu en écris une nouvelle sur le même modèle).

---

## Vue d’ensemble du modèle

```
companies 1───* people          (si role = entreprise)
companies 1───* advertisement
advertisement 1───* applications
people 1───* applications
applications 1───* application_comments
people 1───* audit_log          (optionnel, qui a changé quoi)
```

En une phrase : **une entreprise publie des offres, des gens postulent, le recruteur suit les candidatures, l’admin valide les boîtes.**

---

## Table par table

### `companies`

L’organisation qui recrute.

| Colonne importante | Idée derrière |
| --- | --- |
| `verification_status` | Gate admin : `en_attente` / `validee` / `refusee`. Sans `validee`, ses offres sortent pas du board public. |
| `motif_refus` | Texte montré à l’entreprise si refus. |
| `country_code` | Marché (filtre offres + langue). |
| `company_reg_id` | SIRET / NIF / company number selon le pays. |
| `logo_filename` | Nom du fichier logo sur disque, pas le binaire. |

### `people`

Les comptes (candidat, contact entreprise, admin).

| Colonne importante | Idée derrière |
| --- | --- |
| `password` | Hash bcrypt. Jamais le clair. |
| `role` | Qui a le droit de faire quoi dans l’API. |
| `company_id` | Rempli seulement pour `role = entreprise`. |
| `cv_filename` | CV du profil candidat (préremplit les candidatures). |

### `advertisement`

Une offre.

| Colonne importante | Idée derrière |
| --- | --- |
| `salary` | Texte libre (fourchette, horaire…). Le front peut estimer mois/année si c’est de l’horaire. |
| `working_time` | Ex. heures / semaine — utile pour les estimations. |
| `status` + `is_active` | Publication / brouillon / retrait du marché. |
| `created_by` | Qui a créé l’annonce (`people.id`). |

### `applications`

Une candidature (lien people ↔ advertisement).  
Contrainte UNIQUE : **un candidat = une seule candidature par offre**.

Statuts pipeline : `envoyee` → `en_etude` → `entretien` → `acceptee` (ou `refusee`).

Les champs `entretien_*` se remplissent quand on passe en entretien.

### `application_comments`

Notes internes recruteur. **Pas visibles** du candidat.

### `audit_log`

Trace simple d’actions sensibles (bonus admin / CDC). Pas obligatoire pour faire tourner le board.

---

## Règle de visibilité board public

Une offre apparaît publiquement si **tout** est vrai :

1. `advertisement.status = 'published'`
2. `advertisement.is_active = TRUE`
3. `companies.verification_status = 'validee'`

C’est aussi ce que résume la vue `v_annonces_publiees`.  
Si tu changes la règle métier, change la vue **et** les requêtes API (`app/api/offres`).

---

## Comptes seed (après `seed.sql`)

| E-mail | Mot de passe | Rôle |
| --- | --- | --- |
| `admin@jobboard.com` | `admin123` | admin |
| `ada.morel@mail.fr` | `user123` | candidat |
| `claire@ateliernord.fr` | `user123` | entreprise validée |
| `contact@novasoft-recrute.example` | `user123` | entreprise en attente |

---

## Comment écrire une nouvelle migration (même style)

1. Copie un fichier `migration_*.sql` existant.
2. En-tête : **quand l’utiliser / quand ne pas**.
3. `USE jobboard;` puis `ALTER TABLE` / index.
4. Documente-la dans ce README.
5. Si la feature est “à jour” pour tout le monde, mets aussi la colonne dans `schema.sql` pour les installs neuves.
