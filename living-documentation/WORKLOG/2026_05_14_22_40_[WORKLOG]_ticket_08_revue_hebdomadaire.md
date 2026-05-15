---
**date:** 2026-05-14
**status:** To Be Validated
**description:** Ticket 08 livré : page Semaine avec navigation libre entre semaines, liste des entrées de la semaine, notation 1-5, garder/jeter et validation atomique.
**tags:** worklog, ticket, ticket-08, weekly-review, review, revue-hebdomadaire, week-navigation, dexie, kept, discarded, rating
---

# Ticket 08 — Revue hebdomadaire

## Contexte

Ticket 08 de la roadmap MVP : créer le moment fort du produit, la revue hebdomadaire. L'utilisateur affiche les entrées de la semaine, note chacune sur 5 étoiles, décide de garder ou jeter, et valide la revue pour figer la curation.

Numérotation : la liste « Ordre recommandé » de la roadmap plaçait Ticket 08 = Revue hebdomadaire, mais le corps détaillé décrivait Ticket 08 = Calendrier d'apprentissage. Le décalage a été résolu en alignant le corps sur l'ordre recommandé : Revue → Courbe → Réglages → Calendrier.

## Réalisation

### Code

- Nouveaux helpers `src/lib/dates/week.ts` : `getCurrentWeekRange`, `getWeekRange`, `shiftWeekRange`, `isCurrentWeek`, `formatWeekRangeLabel`. Exportés depuis `src/lib/dates/index.ts`.
- Nouveau module `src/features/reviews/reviewStorage.ts` : `saveWeeklyReview(range, drafts)` écrit atomiquement `kept`/`discarded`/`rating` sur chaque entrée et upsert la `WeeklyReview` indexée par `id = weeklyReview_<weekStart>`. Helper `getEntryDecision(entry)` qui retourne `"kept" | "discarded" | undefined` selon les champs booléens.
- Nouveau hook `src/features/reviews/useWeekReviewData.ts` : `useWeekReviewData(range)` lit en `liveQuery` les entrées de la semaine (filtrées sur `date` indexée via `between`) et la `WeeklyReview` existante ; `useWeekStartSetting()` lit `UserSettings.weekStartsOn`.
- Remplacement complet de `src/features/reviews/WeekPage.tsx` (avant : placeholder) :
  - Header de navigation : chevrons ± 1 semaine, label format `Du 12 mai au 18 mai 2026`, pastille « Semaine en cours » ou bouton « Revenir à cette semaine ».
  - Cards par entrée avec miniature optionnelle, idée, description et URL cliquable.
  - Notation : 5 étoiles `lucide-react` cliquables, click sur l'étoile sélectionnée réinitialise la note.
  - Garder / Jeter : deux boutons mutuellement exclusifs, état « à décider » par défaut, pas de défaut implicite.
  - Compteurs visuels : nombre d'apprentissages, gardés, jetés, à décider.
  - Bouton de validation : désactivé tant qu'au moins une entrée est « à décider », libellé adapté selon que la revue existe déjà ou non.

### Choix retenus

Voir l'ADR `Revue hebdomadaire et invariants kept discarded rating` pour les décisions durables (encodage des trois états, transaction de validation, navigation libre, rouvrabilité, exclusion des entrées `empty`).

Choix d'implémentation locaux à la page, non durables :

- L'état utilisateur en cours est stocké dans un `overrides: Record<entryId, { decision, rating }>`. Le rendu fusionne avec l'état Dexie des entrées via `buildDraftsFromEntries`. Les overrides sont réinitialisés quand l'utilisateur change de semaine. Cela respecte la règle ESLint `react-hooks/set-state-in-effect` (pattern « setState during render avec garde »).
- Le toast de statut s'efface après 2,2 s. Plus simple que le mécanisme à fade-out de `TodayPage` car la `WeekPage` n'a pas la même densité visuelle.
- Pas de bouton « Effacer ma décision » dans cette itération : l'utilisateur peut basculer entre garder et jeter, mais pas revenir à « à décider » via l'UI une fois qu'il a choisi. Acceptable au MVP.

### Documentation

- ADR créé via MCP : `Revue hebdomadaire et invariants kept discarded rating` (2026-05-14, To be validated). Métadonnées attachées : `WeekPage.tsx`, `reviewStorage.ts`, `useWeekReviewData.ts`, `week.ts`.
- ROADMAP : renumérotation du corps des tickets 8-11 pour aligner sur l'ordre recommandé ; case du Ticket 08 cochée.
- `PROJECT-STACK.md` : section « Concepts centraux » mise à jour (WeeklyReview, conventions de revue).
- `current-task.md` : statut « Idle » après livraison du Ticket 08.

## Vérifications

- `npm run lint` : OK.
- `npm run build` : OK.
- MCP Living Documentation : disponible, ADR créé et métadonnées attachées (accuracy = 1).
- Vérifications manuelles dans le navigateur laissées à l'utilisateur : navigation entre semaines (passé, futur), création d'une entrée et revue, validation, modification d'une revue existante, ajout d'une entrée après validation puis revalidation.

## Suites éventuelles

- Le Ticket 09 (Courbe d'apprentissage) consomme `kept` et `rating` : penser à exclure les entrées `discarded` et `kept === false && discarded === false` des stats principales.
- Le Ticket 10 (Réglages) doit exposer `weekStartsOn` ; un changement de ce réglage modifie les frontières de toutes les semaines passées affichées dans la page Semaine.
- Améliorations UX possibles : bouton « Tout garder » pour les semaines confiantes, raccourci clavier sur les étoiles, transition visuelle quand une décision est prise.

## Documents liés

- ROADMAP `Tickets MVP` — Ticket 08
- ADR `Revue hebdomadaire et invariants kept discarded rating`
- ADR `Création des entrées du jour local-first`
- ADR `Schema Dexie v1 et snapshot JSON local`
