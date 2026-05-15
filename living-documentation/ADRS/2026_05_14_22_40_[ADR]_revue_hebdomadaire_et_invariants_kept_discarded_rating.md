---
**date:** 2026-05-15
**status:** To be validated
**description:** La revue hebdomadaire navigue librement entre semaines, encode trois états transitoires par entrée pendant la revue, supprime définitivement les entrées jetées à la validation, et écrit atomiquement les champs kept/rating plus une WeeklyReview indexée par semaine.
**tags:** adr, weekly-review, revue-hebdomadaire, kept, discarded, rating, dexie, transaction, navigation-libre, week-range, hard-delete

---

# Revue hebdomadaire et invariants kept discarded rating

## Contexte

Le Ticket 08 implémente la revue hebdomadaire : moment de curation où l'utilisateur garde ou jette ses apprentissages de la semaine et leur donne une note 1-5. Cette revue alimente plus tard les insights, la courbe d'apprentissage et le calendrier.

Le modèle de données existait déjà depuis le Ticket 03 :

- `LearningEntry.kept: boolean`
- `LearningEntry.discarded: boolean`
- `LearningEntry.rating?: 1|2|3|4|5`
- `WeeklyReview { id, weekStart, weekEnd, selectedEntryIds[], discardedEntryIds[], summary?, createdAt, updatedAt }`

Mais aucun écran n'écrivait ces champs et la sémantique exacte des trois valeurs combinées (`kept`, `discarded`, `rating`) n'avait pas été tranchée. Une première version de cet ADR encodait les entrées jetées comme `discarded: true` persistant en base. Le retour utilisateur a montré que ces entrées devaient réellement disparaître pour que la curation soit lisible : aucune entrée jetée ne doit pouvoir réapparaître dans la revue, dans la timeline Today, dans les insights, ni nulle part ailleurs.

## Décision

### États transitoires pendant la revue

Pendant la revue, chaque `LearningEntry` non-`empty` est dans un de ces trois états en mémoire (drafts) :

| Décision | `kept` (en base) | Action à la validation |
|---|---|---|
| À décider | `false` | aucune écriture |
| Gardée | `true` | `bulkPut` avec `kept = true, discarded = false, rating` |
| Jetée | n/a | **supprimée définitivement** (`bulkDelete`) |

À la création d'une entrée, `kept` et `discarded` valent tous deux `false` : l'entrée est « à décider » par défaut. Le champ `rating` est `undefined` tant que l'utilisateur n'a pas noté.

Les entrées `source === "empty"` ("Rien pour le moment", "Pause") sont exclues de la revue : elles ne sont jamais listées et ne reçoivent ni décision ni note.

### Suppression définitive des entrées jetées

À la validation (création ou mise à jour de la revue), la transaction Dexie :

1. Met à jour les entrées gardées avec `kept = true, discarded = false, rating, updatedAt`.
2. **Supprime de la base** les entrées jetées via `bulkDelete(discardedEntryIds)`.
3. Upsert la `WeeklyReview` indexée par `id = weeklyReview_<weekStart>` avec :
   - `selectedEntryIds` : IDs des entrées gardées (références valides) ;
   - `discardedEntryIds` : union des IDs jetés au cours de cette validation **et** des IDs jetés lors des validations précédentes pour la même semaine. Ces IDs ne référencent plus aucune entrée existante : ils servent de marqueur historique uniquement.

L'identifiant déterministe par `weekStart` garantit qu'il existe au plus une `WeeklyReview` par semaine et par démarrage de semaine (`weekStartsOn`). En cas de revalidation, l'enregistrement existant est mis à jour, pas dupliqué.

Conséquence directe : aucune entrée persistée ne porte `discarded = true`. Le champ `discarded` reste dans le schéma pour ne pas casser la compatibilité d'export, mais il vaut toujours `false` en base après cette décision. Les écrans de consommation (timeline Today, insights, calendrier) n'ont donc plus à filtrer les entrées jetées : elles n'existent plus.

### Feedback utilisateur

Après une validation réussie, la page affiche un toast fixe coloré (vert pour succès, rouge pour erreur) en haut du viewport, avec une icône `CheckCircle2` ou `AlertCircle`, et un message explicite indiquant le nombre d'entrées gardées et le nombre d'entrées supprimées (par exemple « Revue mise à jour : 3 gardés, 2 jetés et supprimés. »). Le toast reste visible 2,8 s puis s'estompe.

La disparition immédiate des cards jetées via `liveQuery` Dexie sert aussi de signal visuel.

### Navigation libre entre semaines

La page `WeekPage` permet de naviguer librement entre semaines passées et la semaine courante via deux chevrons et un bouton « Revenir à cette semaine ». La semaine courante est calculée à partir de `UserSettings.weekStartsOn` (`monday` par défaut). Tant que l'utilisateur n'a pas navigué, la page reste synchronisée avec la semaine courante quand `weekStartsOn` est chargé depuis Dexie.

Les semaines futures sont accessibles techniquement (le composant ne les bloque pas), mais elles sont structurellement vides puisque les `LearningEntry` ne peuvent pas avoir une `date` future.

### Rouvrable

Une revue déjà validée n'est pas figée. La page se rouvre en lecture-écriture : la pastille « Revue déjà validée » s'affiche, l'utilisateur peut ajuster la décision et la note des entrées **encore présentes** (les jetées ont disparu pour de bon), puis valider à nouveau. La `WeeklyReview` correspondante est mise à jour, son `createdAt` est préservé.

Si une entrée a été ajoutée à la semaine après une première validation, elle apparaît dans la liste à l'état « à décider » et bloque la prochaine validation tant qu'elle n'a pas reçu une décision.

### État local de la page

`WeekPage` maintient un état `overrides: Record<entryId, { decision, rating }>` qui capture les modifications utilisateur en cours. Le rendu fusionne `overrides` avec l'état Dexie des entrées via `buildDraftsFromEntries` :

- Si l'entrée a un override → on prend l'override.
- Sinon si l'entrée est marquée `kept = true` en base → on prend l'état « gardée ».
- Sinon → l'entrée est « à décider ».

Les overrides sont réinitialisés quand l'utilisateur change de semaine (pattern React `useState` + comparaison en rendu, conforme à la règle `react-hooks/set-state-in-effect`). Ils sont aussi réinitialisés après chaque validation réussie pour ne pas garder de fantômes pointant vers des entrées supprimées.

### Helpers de date

Les helpers `getCurrentWeekRange`, `getWeekRange`, `shiftWeekRange`, `isCurrentWeek` et `formatWeekRangeLabel` vivent dans `src/lib/dates/week.ts`. Ils n'utilisent que les API standard `Date` et `Intl.DateTimeFormat`, sans dépendance externe type `date-fns`. Le format des clés `weekStart` / `weekEnd` reste `YYYY-MM-DD` pour rester compatible avec le filtre Dexie `between(weekStart, weekEnd)` sur la colonne indexée `date`.

## Conséquences

### PROS

- Les entrées jetées disparaissent réellement et définitivement : la curation est nette, l'utilisateur a un signal visuel clair.
- Sémantique simple en base : seules existent les entrées « à décider » et « gardées ». Les écrans en aval n'ont pas à filtrer les jetées.
- La validation est atomique : une coupure pendant l'écriture laisse les entrées dans leur état précédent, jamais à moitié.
- L'identifiant déterministe par `weekStart` évite la création de revues parallèles si l'utilisateur clique « Valider » plusieurs fois.
- Navigation libre permet de reviewer une semaine passée oubliée sans contournement.
- Le toast coloré donne un feedback explicite et durable sur l'action effectuée, avec compteurs.
- L'historique des IDs jetés est conservé dans `WeeklyReview.discardedEntryIds` pour des analyses ou audits futurs.

### CONS

- La suppression est destructive et définitive : pas de mécanisme d'undo ni de corbeille au MVP.
- Le champ `LearningEntry.discarded` devient inutile en base après cette décision : il subsiste pour la compatibilité d'export du schéma version 1 mais peut induire en erreur un futur lecteur. Une migration de schéma pour le retirer pourra être envisagée plus tard.
- `WeeklyReview.discardedEntryIds` contient des IDs qui ne référencent plus d'entrées : à utiliser comme marqueur historique uniquement, pas comme source pour récupérer le contenu jeté.
- Une `WeeklyReview` peut rester partiellement désynchronisée si l'utilisateur supprime manuellement une entrée gardée sans revalider : `selectedEntryIds` peut alors référencer un ID disparu. Les écrans aval doivent traiter les `bulkGet` retournant `undefined` comme du bruit, pas comme une erreur.
- Les semaines futures sont navigables (toujours vides) sans message dédié.
- Le calcul de la semaine dépend de `UserSettings.weekStartsOn` ; un changement de ce réglage déplace les frontières de toutes les semaines existantes.

## Documents liés

- ADR `Schema Dexie v1 et snapshot JSON local`
- ADR `Création des entrées du jour local-first`
- ROADMAP `Tickets MVP` — Ticket 08 (revue) et Ticket 09 (courbe d'apprentissage, consommateur de `kept`/`rating`)
