# Usage de l’IA pendant le développement

Document pour la défense / le suivi du projet.  
On parle ici de comment **on** a utilisé l’IA (surtout **Cursor**) pendant le Job Board, à deux.

---

## En gros, comment on s’en est servi

On a pas laissé l’IA “faire le projet toute seule”.  
On savait ce qu’on voulait côté produit (candidat, entreprise, admin, pays, rémunération, etc.), et l’IA nous a surtout aidés à :

- aller plus vite sur le code répétitif ;
- comprendre un bout de code quand c’était flou ;
- proposer une structure propre (dossiers, routes API, etc.) ;
- corriger des bugs ou des trucs UI gênants (ex. le menu du bas qui mangeait les offres).

Quand on bloquait, on lui montrait le problème (parfois avec une capture), on disait ce qu’on voulait, et après on **vérifiait** ce qu’elle montrait avant de garder.

---

## Comment on a travaillé avec l’IA

En pratique, le flow c’était souvent comme ça :

1. **On pose le besoin clairement**  
   Exemple : “sur le détail de l’offre côté candidat, on veut la même idée de simulation que le recruteur” (horaire → mois / année).  
   Pas juste “améliore la page”. Plus c’est précis, mieux c’est.

2. **Elle propose / elle code**  
   Soit elle modifie directement les bons fichiers, soit elle explique d’abord (selon ce qu’on demande).

3. **On regarde le résultat dans le navigateur**  
   `npm run dev`, on clique, on teste avec les comptes seed. Si c’est pas bon, on redis (“non, là le select est trop long”, “le footer gêne”, etc.).

4. **On demande des explications quand on a besoin de comprendre**  
   Pas pour tout. Mais sur l’auth, la BDD, ou une fonction un peu technique, on lui demandait d’expliquer **simplement** ce que ça fait, pour pouvoir le redire à l’oral en défense.

C’est important : l’IA explique, mais **c’est à nous de pouvoir justifier** après.

---

## Exemples concrets de ce qu’elle nous a aidés à faire / comprendre

### Auth (JWT + bcrypt)

Là on avait besoin de comprendre pourquoi on hash le mot de passe, pourquoi le JWT, et pourquoi `auth-serveur.ts` ne doit pas partir côté client.  
Elle nous a découpé ça clairement : bcrypt en base, token signé avec `JWT_SECRET`, contrôle du rôle dans chaque route.  
Après on pouvait expliquer : “le mot de passe est jamais stocké en clair”, “chaque requête protégée vérifie le Bearer token”, etc.

### Les offres et la rémunération

Sur le recruteur, on avait déjà l’idée : tu mets un tarif à l’heure, tu vois une estimation mois / année.  
Ensuite on a demandé la même logique côté candidat, dans le panneau de droite du détail.  
L’IA a branché ça sur le parse de la rémunération (`lib/remuneration.ts`) pour retrouver le taux horaire + le volume semaine, et afficher les estimations sans inventer un nouveau modèle de données.

### Le pays / la langue

L’idée c’était : le marché = le pays. Tu changes le pays en haut, ça change la langue et les offres.  
L’IA nous a aidés à câbler le sélecteur, les dictionnaires i18n, et le filtre côté offres via le `country_code` de l’entreprise.  
Quand le select était trop large ou que le mot “Pays” prenait de la place pour rien, on lui a dit de le raccourcir — et on a ajusté.

### Espace entreprise + admin

Pour l’entreprise : publication, brouillon, retrait d’offre, logo, réclamation si refus, etc.  
Pour l’admin : validation / refus, listes, suppressions, un peu d’UI plus réactive.  
L’IA a beaucoup servi à garder le front branché sur les bonnes routes `/api/...` sans qu’on réécrive tous les `fetch` à la main.

### Petits trucs UI qui saoulent

Exemple : le pied de page qui passait devant les cartes d’offres.  
On a dit que c’était une gêne, elle a proposé une idée (footer qui scroll avec la page), on lui a dit que ça marchait pas si y’a genre 2000 offres, et on a pris l’autre approche : footer toujours là, mais la zone des offres s’arrête au-dessus.  
Ça montre bien le mode de collab : **on valide ou on refuse**, on itère.

---

## Ce qu’on lui demandait souvent

- “Explique-nous cette fonction / ce fichier, simplement.”
- “Fais la modif ici, sans casser le reste.”
- “Vérifie que le front appelle bien l’API.”
- “Propose une solution, dis-nous les options.” (ex. footer)
- “Refais le README pour des novices” / “écris la doc dans notre style.”

Par contre on lui demandait **pas** de “tout inventer” sans cadre.  
Le cadre c’était le cahier des charges + ce qu’on voulait comme produit (3 rôles, validation entreprise, pays, etc.).

---

## Limites / ce qu’on faisait pas

- On validait pas du code sans tester.
- On laissait pas l’IA commit toute seule (les commits, c’est nous / quand on le décide).
- Sur la sécu et la BDD, on se forçait à comprendre le “pourquoi”, pas juste le “ça marche”.
- Les docs (README, choix techniques, cette page) on les a demandées pour la reprise + la défense, pas pour remplacer l’oral.

---

## Outils

- **Cursor** (agent / chat dans l’IDE) : principal outil IA du projet.
- Parfois des explications fichier par fichier, parfois des modifs multi-fichiers quand la feature touchait API + UI + SQL.

---

## En une phrase (défense)

On a utilisé l’IA comme un **binôme de code** : on définit le besoin et on valide, elle accélère l’implémentation et nous aide à comprendre les parties techniques pour qu’on puisse les expliquer.
