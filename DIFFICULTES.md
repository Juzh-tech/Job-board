# Liste des difficultés rencontrées

Petit retour sur les galères qu’on a eues pendant le Job Board.  
On parle surtout de trucs concrets : accents qui deviennent `???`, monnaies, couleurs, UI, Git, etc.

---

## 1. Les accents et le `???` (le plus chiant)

### Le problème

En base / à l’affichage, on voyait des trucs du genre :

- `D??veloppeur` au lieu de `Développeur`
- `32 000 ??? 36 000 ???` au lieu de `32 000 - 36 000 €`

Les **é, è, à**, le tiret, le **€**, le **£**… partaient en `?` ou `???`.

### Pourquoi ça arrivait

La base et MySQL doivent parler **utf8mb4**.  
Si on importe le `seed.sql` sans le bon charset, MySQL « casse » les caractères spéciaux **directement en base**. Après, le front affiche ce qu’il y a : des points d’interrogation.

Sous Windows / PowerShell, un simple :

```bash
mysql … < seed.sql
```

peut aussi mal passer l’encodage. On a dû passer par `cmd` avec :

```bat
mysql --default-character-set=utf8mb4 -u root jobboard < seed.sql
```

### Ce qu’on a retenu

- Toujours `utf8mb4` (schéma + import + connexion Node).
- Vérifier en SQL qu’un titre contient bien `Développeur`, pas `D??veloppeur`.
- Documenter ça dans `sql/README.md` pour ne pas retomber dessus.

---

## 2. Les symboles d’argent (€, £, $)

Lié au point d’avant : le **€** n’est pas un caractère « simple ».  
Sans utf8mb4, il devient `???` dans le salaire affiché sur les cartes.

Ensuite, chaque pays a sa logique (€, £, CHF, $) dans les seeds et dans le catalogue pays (`lib/pays.ts`).  
Fallait que le texte stocké et l’UI restent cohérents avec le marché choisi.

---

## 3. Trouver les bonnes couleurs

On a galéré un moment sur la **palette** : trop fade, trop « générique », ou pas assez lisible (contraste header / boutons / badges).

On a testé, gardé une direction (marque sombre + accents), et ajusté dans `globals.css` (variables CSS).  
Objectif : un site un peu plus « pro » sans perdre la lisibilité des offres et des boutons Postuler / En savoir plus.

Difficulté typique de front : **ça a l’air simple**, mais dès qu’on change une couleur, le header, les cartes et le footer bougent tous.

---

## 4. Le footer qui mangeait les offres

Sur le board, le pied de page passait **devant** la liste des cartes.  
On ne voyait plus bien les dernières offres / les boutons.

On a d’abord eu une mauvaise piste (footer qui scroll « avec » la page), puis on a pris une solution plus simple : footer fixe en bas, et la zone des offres **s’arrête au-dessus** (layout flex + hauteur réservée).

---

## 5. Filtres d’accueil ≠ formulaire « Publier »

Sur l’accueil, les filtres de contrat ne montraient que les types **présents dans les offres chargées**.  
Du coup, selon le pays, **Alternance** (ou Freelance) pouvait manquer, alors que le formulaire recruteur les proposait.

On a aligné tout le monde sur une liste fixe `TYPES_CONTRAT` (CDI, CDD, Stage, Alternance, Freelance) : mêmes options partout.

---

## 6. Mobile / responsive

Sur téléphone, le header débordait (Inscription / Déconnexion), et certaines pages n’étaient pas confortables.  
Fallait compresser la nav, garder le sélecteur de pays utilisable, et vérifier que le détail d’offre + Postuler restent utilisables.

---

## 7. Multi-pays et langues

On voulait un vrai **marché par pays** (langue + offres).  
Difficultés :

- brancher le sélecteur pays → i18n + filtre SQL `country_code` ;
- avoir assez d’offres de démo par pays (seeds) ;
- ne pas mélanger UI française et contenus espagnols / anglais sans faire exprès ;
- ajouter de / pt / it pour coller aux marchés DE / PT / IT.

---

## 8. CV réutilisable

Objectif : uploader une fois, postuler plusieurs fois sans renvoyer le fichier.  
Fallait gérer :

- stockage PDF + nom en BDD (`people.cv_filename`) ;
- copie du nom dans la candidature ;
- affichage côté recruteur avec auth (token), sans ouvrir n’importe quel fichier.

---

## 9. Git : push refusé

On a eu le classique : modification d’un README **sur GitHub**, pendant qu’on committait en local → `git push` rejeté (« fetch first »).  
Le petit changement distant n’était pas important : on a priorisé le travail local avec un push forcé (`--force-with-lease`).

À retenir : éviter d’éditer le même fichier sur le site GitHub **et** en local sans `pull`.

---

## 10. Comprendre auth / JWT / fetch (côté nous)

Pas une « bug UI », mais une difficulté de **compréhension** pour la défense :

- bcrypt : on ne compare pas deux hash à l’œil, on utilise `compare` ;
- JWT : badge signé après login, renvoyé en `Bearer` ;
- fetch : juste l’outil HTTP du navigateur vers `/api/...`.

On a dû se le reformuler plusieurs fois pour être capables de l’expliquer simplement.

---

## En résumé

Les plus grosses galères techniques du projet :

1. **Encodage utf8mb4** (accents + € → `???`)  
2. **Couleurs / UX** (palette, footer, mobile)  
3. **Cohérence métier** (filtres = formulaire, pays / langues, CV)  
4. **Git** quand local et GitHub divergent  

Le reste, c’est surtout de l’itération : on teste, on voit le problème, on corrige, on reteste.
